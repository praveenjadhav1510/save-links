/**
 * Save Links Extension — Popup Script
 *
 * Populates the preview with current tab info and handles the
 * manual "Save This Page" button click.
 */

const previewFavicon = document.getElementById("preview-favicon");
const previewTitle = document.getElementById("preview-title");
const previewUrl = document.getElementById("preview-url");
const saveBtn = document.getElementById("save-btn");
const statusEl = document.getElementById("status");

const SAVE_ICON = `
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17 21 17 13 7 13 7 21"/>
    <polyline points="7 3 7 8 15 8"/>
  </svg>`;

const CHECK_ICON = `
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`;

const SPINNER_ICON = `
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="spin">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>`;

// ── Populate preview with current tab info ─────────────────────────
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (!tab) return;

  previewTitle.textContent = tab.title || "Untitled";
  previewUrl.textContent = tab.url || "";

  if (tab.favIconUrl) {
    previewFavicon.src = tab.favIconUrl;
  } else {
    previewFavicon.style.display = "none";
  }

  // Enable save button only for saveable pages
  const unsaveable =
    !tab.url ||
    tab.url.startsWith("chrome://") ||
    tab.url.startsWith("chrome-extension://") ||
    tab.url.startsWith("edge://") ||
    tab.url.startsWith("brave://") ||
    tab.url.startsWith("about:");

  if (unsaveable) {
    saveBtn.disabled = true;
    showStatus("Cannot save browser internal pages.", "error");
  } else {
    saveBtn.disabled = false;
  }
});

// ── Save button handler ────────────────────────────────────────────
saveBtn.addEventListener("click", () => {
  saveBtn.disabled = true;
  saveBtn.classList.add("saving");
  saveBtn.innerHTML = `${SPINNER_ICON} Saving…`;

  chrome.runtime.sendMessage({ action: "save-current-tab" }, (response) => {
    if (chrome.runtime.lastError) {
      showStatus("Something went wrong. Try again.", "error");
      resetButton("error");
      return;
    }

    if (response && response.success) {
      showStatus(`"${response.name}" saved!`, "success");
      resetButton("saved");
    } else if (response && response.error) {
      showStatus(response.error, "error");
      resetButton("error");
    } else {
      showStatus("Link already exists.", "duplicate");
      resetButton("error");
    }
  });
});

// ── Helpers ─────────────────────────────────────────────────────────
function showStatus(msg, type) {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function resetButton(state) {
  setTimeout(() => {
    saveBtn.disabled = false;
    saveBtn.classList.remove("saving", "saved", "error");
    saveBtn.className = "save-btn";

    if (state === "saved") {
      saveBtn.classList.add("saved");
      saveBtn.innerHTML = `${CHECK_ICON} Saved!`;

      setTimeout(() => {
        saveBtn.classList.remove("saved");
        saveBtn.innerHTML = `${SAVE_ICON} Save This Page`;
      }, 2000);
    } else {
      saveBtn.innerHTML = `${SAVE_ICON} Save This Page`;
    }
  }, 300);
}
