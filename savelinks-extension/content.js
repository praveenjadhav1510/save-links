/**
 * Save Links Extension — Content Script
 *
 * Injected into the Save Links website.
 * Receives link data from the background service worker and writes it
 * directly into localStorage using the same key and format the React
 * app expects: "saved_links_data" → JSON array of link objects.
 *
 * After writing, dispatches a custom event so the React app can
 * show a notification and refresh data without a full reload.
 * Falls back to a page reload if the event isn't picked up.
 */

const STORAGE_KEY = "saved_links_data";

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === "add-link") {
    try {
      const newLink = message.data;

      // Read existing data
      const raw = localStorage.getItem(STORAGE_KEY);
      const links = raw ? JSON.parse(raw) : [];

      // Avoid duplicates — check by URL
      const exists = links.some(
        (link) => link.url === newLink.url
      );

      if (exists) {
        // Dispatch duplicate notification event
        window.dispatchEvent(
          new CustomEvent("savelinks-extension-saved", {
            detail: {
              success: false,
              duplicate: true,
              name: newLink.name,
              color: "#ffaa00",
            },
          })
        );
        sendResponse({ success: false, reason: "duplicate" });
        return;
      }

      // Append and save
      links.push(newLink);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));

      // Dispatch success event so React can show notification + refresh
      window.dispatchEvent(
        new CustomEvent("savelinks-extension-saved", {
          detail: {
            success: true,
            name: newLink.name,
            color: newLink.color || "#1dff77",
          },
        })
      );

      sendResponse({ success: true });
    } catch (err) {
      console.error("[Save Links Extension]", err);
      sendResponse({ success: false, error: err.message });
    }
  }
});
