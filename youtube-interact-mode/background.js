// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  // Create a toggle menu item in the extension icon's context menu
  chrome.contextMenus.create({
    id: "toggle-interact-mode",
    title: "Enable Interact Mode",
    contexts: ["action"] // 'action' means the context menu on extension icon
  });

  // Initialize storage with default values
  chrome.storage.sync.set({
    interactModeEnabled: false,
    openaiApiKey: ""
  });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "toggle-interact-mode") {
    // Get current state
    const { interactModeEnabled } = await chrome.storage.sync.get("interactModeEnabled");
    const newValue = !interactModeEnabled;
    
    // Save toggled state
    await chrome.storage.sync.set({ interactModeEnabled: newValue });
    
    // Update menu text accordingly
    chrome.contextMenus.update("toggle-interact-mode", {
      title: newValue ? "Disable Interact Mode" : "Enable Interact Mode"
    });
    
    // Send message to content scripts to update UI
    chrome.tabs.query({}, function(tabs) {
      for (let i=0; i<tabs.length; i++){
        chrome.tabs.sendMessage(tabs[i].id, { 
          type: "INTERACT_MODE_TOGGLED", 
          enabled: newValue 
        });
      }
    });
  }
});

// Handle native messaging port
let nativePort = null;

function connectToNative() {
  nativePort = chrome.runtime.connectNative('com.youtube.interact.transcript');
  
  nativePort.onMessage.addListener((response) => {
    if (response.success && response.transcript) {
      // Store transcript in local storage
      chrome.storage.local.set({ transcript: response.transcript });
    }
  });
  
  nativePort.onDisconnect.addListener(() => {
    console.log('Disconnected from native host');
    nativePort = null;
  });
}

// Listen for transcript requests
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_TRANSCRIPT' && request.videoId) {
    if (!nativePort) {
      connectToNative();
    }
    
    // Request transcript from native host
    nativePort.postMessage({ video_id: request.videoId });
  }
}); 