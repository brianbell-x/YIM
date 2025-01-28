// Listen for installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open options page on install
    chrome.runtime.openOptionsPage();
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SETTINGS') {
    // Return settings to content script
    chrome.storage.sync.get(
      {
        openaiApiKey: '',
        defaultMode: 'text'
      },
      (items) => {
        sendResponse(items);
      }
    );
    return true; // Will respond asynchronously
  }
}); 