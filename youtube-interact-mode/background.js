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