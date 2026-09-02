/**
 * Save Links Extension — Background Service Worker
 *
 * Listens for keyboard shortcut commands (Ctrl+Shift+S / Ctrl+Shift+U)
 * and the popup "save" message. Collects page info from the active tab,
 * extracts the dominant color from the favicon using an offscreen document,
 * finds or opens the Save Links page, waits for it to load, and sends
 * the link data to the content script for localStorage injection.
 */

const SAVE_LINKS_URL = "https://praveenjadhav1510.github.io/save-links/";

// ── Command listener (keyboard shortcuts) ──────────────────────────
chrome.commands.onCommand.addListener((command) => {
  if (command === "save-link-s" || command === "save-link-u") {
    saveCurrentTab();
  }
});

// ── Message listener (popup button + favicon lookup) ───────────────
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "save-current-tab") {
    saveCurrentTab().then(sendResponse).catch((err) =>
      sendResponse({ success: false, error: err.message })
    );
    return true; // keep channel open for async response
  }

  if (message.action === "get-favicon") {
    getFaviconForUrl(message.url).then(sendResponse);
    return true;
  }
});

// ── Favicon lookup for the web app ─────────────────────────────────
/**
 * Searches all open tabs for a tab whose URL matches the given URL
 * and returns its native browser favicon (chrome favIconUrl is always
 * the most accurate icon the browser itself displays).
 */
async function getFaviconForUrl(targetUrl) {
  try {
    const target = normalizeTabUrl(targetUrl);
    if (!target) return { faviconUrl: null };

    const tabs = await chrome.tabs.query({});

    for (const tab of tabs) {
      if (!tab.url) continue;
      const candidate = normalizeTabUrl(tab.url);
      if (candidate && candidate === target && tab.favIconUrl) {
        return { faviconUrl: tab.favIconUrl };
      }
    }

    return { faviconUrl: null };
  } catch (err) {
    console.warn("[Save Links] Favicon lookup failed:", err.message);
    return { faviconUrl: null };
  }
}

/**
 * Normalizes a URL to origin + pathname (ignores query strings,
 * hash, and trailing slashes) for fuzzy tab matching.
 */
function normalizeTabUrl(rawUrl) {
  try {
    const u = new URL(rawUrl);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    let path = u.pathname.replace(/\/+$/, "");
    return u.origin + path;
  } catch {
    return null;
  }
}

// ── Core logic ─────────────────────────────────────────────────────
async function saveCurrentTab() {
  // 1. Get the active tab
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });

  if (!activeTab || !activeTab.url) {
    return { success: false, error: "No active tab found." };
  }

  // Don't save chrome:// or extension pages
  if (
    activeTab.url.startsWith("chrome://") ||
    activeTab.url.startsWith("chrome-extension://") ||
    activeTab.url.startsWith("edge://") ||
    activeTab.url.startsWith("brave://") ||
    activeTab.url.startsWith("about:")
  ) {
    return { success: false, error: "Cannot save browser internal pages." };
  }

  // 2. Extract dominant color from favicon
  const faviconUrl = activeTab.favIconUrl || "";
  let cardColor = "#1e1e1e"; // fallback

  if (faviconUrl) {
    try {
      cardColor = await extractColorFromFavicon(faviconUrl);
    } catch (err) {
      console.warn("[Save Links] Color extraction failed:", err.message);
    }
  }

  // 3. Collect page data
  const pageData = {
    name: activeTab.title || "Untitled",
    url: activeTab.url,
    iconUrl: faviconUrl || "default.svg",
    color: cardColor,
    category: "WebPage",
  };

  // 4. Find or open the Save Links tab
  const saveLinksTab = await findOrOpenSaveLinksTab();

  // 5. Send data to the content script
  try {
    await sendDataToTab(saveLinksTab.id, pageData);
  } catch (err) {
    // Content script might not be injected yet — inject it and retry
    await chrome.scripting.executeScript({
      target: { tabId: saveLinksTab.id },
      files: ["content.js"],
    });
    await sendDataToTab(saveLinksTab.id, pageData);
  }

  return { success: true, name: pageData.name };
}

// ── Color extraction via offscreen document ────────────────────────

let creatingOffscreen = null;

/**
 * Ensures the offscreen document exists, then asks it to extract
 * the dominant color from the given image URL.
 */
async function extractColorFromFavicon(imageUrl) {
  await ensureOffscreenDocument();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error("Color extraction timed out"));
    }, 8000);

    chrome.runtime.sendMessage(
      { action: "extract-color", imageUrl },
      (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (response && response.success) {
          resolve(response.color);
        } else {
          resolve("#1e1e1e");
        }
      }
    );
  });
}

/**
 * Creates the offscreen document if it doesn't already exist.
 */
async function ensureOffscreenDocument() {
  // Check if one already exists
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [chrome.runtime.getURL("offscreen.html")],
  });

  if (existingContexts.length > 0) {
    return; // already exists
  }

  // Avoid race conditions with concurrent creation attempts
  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }

  creatingOffscreen = chrome.offscreen.createDocument({
    url: "offscreen.html",
    reasons: ["DOM_PARSER"],
    justification: "Extract dominant color from favicon using canvas",
  });

  await creatingOffscreen;
  creatingOffscreen = null;
}

// ── Tab management ─────────────────────────────────────────────────

/**
 * Finds an existing Save Links tab or opens a new one.
 * If a new tab is opened, waits for it to fully load before returning.
 */
async function findOrOpenSaveLinksTab() {
  const tabs = await chrome.tabs.query({ url: SAVE_LINKS_URL + "*" });

  if (tabs.length > 0) {
    // Focus the existing tab
    const tab = tabs[0];
    await chrome.tabs.update(tab.id, { active: true });
    await chrome.windows.update(tab.windowId, { focused: true });
    return tab;
  }

  // Open a new tab and wait for it to finish loading
  const newTab = await chrome.tabs.create({ url: SAVE_LINKS_URL });
  return waitForTabLoad(newTab.id);
}

/**
 * Returns a promise that resolves when a tab finishes loading.
 */
function waitForTabLoad(tabId) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      chrome.tabs.onUpdated.removeListener(listener);
      reject(new Error("Tab load timed out."));
    }, 30000);

    function listener(updatedTabId, changeInfo, tab) {
      if (updatedTabId === tabId && changeInfo.status === "complete") {
        clearTimeout(timeout);
        chrome.tabs.onUpdated.removeListener(listener);
        // Small delay to let React hydrate
        setTimeout(() => resolve(tab), 500);
      }
    }

    chrome.tabs.onUpdated.addListener(listener);
  });
}

/**
 * Sends link data to the content script running in the Save Links tab.
 */
function sendDataToTab(tabId, data) {
  return chrome.tabs.sendMessage(tabId, {
    action: "add-link",
    data: data,
  });
}
