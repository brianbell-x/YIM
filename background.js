// Listen for installation or update
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Initialize default settings
    chrome.storage.sync.set({
      openaiApiKey: '',
      extensionEnabled: true,
      textModel: 'gpt-4o-mini',
      voiceModel: 'gpt-4o-realtime-preview-2024-12-17',
      defaultMode: 'text'
    });
  }
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_SETTINGS') {
    // Return settings to content script
    chrome.storage.sync.get(
      {
        openaiApiKey: '',
        defaultMode: 'text',
        extensionEnabled: true,
        textModel: 'gpt-4o-mini',
        voiceModel: 'gpt-4o-realtime-preview-2024-12-17'
      },
      (items) => {
        sendResponse(items);
      }
    );
    return true; // Will respond asynchronously
  }
}); 