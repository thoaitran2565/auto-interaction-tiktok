/**
 * Background Service Worker
 * Handles extension lifecycle and Side Panel behavior configuration.
 */

// Configure Side Panel to automatically open when clicking the extension icon
chrome.runtime.onInstalled.addListener(() => {
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    chrome.sidePanel
      .setPanelBehavior({ openPanelOnActionClick: true })
      .catch((error) => console.error("Error setting panel behavior:", error));
  }
});

// Fallback listener in case openPanelOnActionClick is not supported or not activated
chrome.action.onClicked.addListener(async (tab) => {
  if (chrome.sidePanel && chrome.sidePanel.open) {
    try {
      if (tab.windowId) {
        await chrome.sidePanel.open({ windowId: tab.windowId });
      }
    } catch (err) {
      console.warn("Fallback sidePanel.open failed:", err);
    }
  }
});

