document.addEventListener("DOMContentLoaded", async () => {
  const apiKeyInput = document.getElementById("apiKeyInput");
  const saveKeyBtn = document.getElementById("saveKeyBtn");
  const enableCheck = document.getElementById("enableCheck");
  const statusDiv = document.getElementById("status");
  
  // Load stored values
  const { openaiApiKey, interactModeEnabled } = await chrome.storage.sync.get([
    "openaiApiKey",
    "interactModeEnabled"
  ]);
  
  if (openaiApiKey) {
    apiKeyInput.value = openaiApiKey;
  }
  enableCheck.checked = !!interactModeEnabled;
  
  // Save the API key
  saveKeyBtn.addEventListener("click", async () => {
    const keyValue = apiKeyInput.value.trim();
    if (keyValue) {
      await chrome.storage.sync.set({ openaiApiKey: keyValue });
      statusDiv.textContent = "API key saved!";
      setTimeout(() => {
        statusDiv.textContent = "";
      }, 2000);
    }
  });
  
  // Toggle Interact Mode
  enableCheck.addEventListener("change", async () => {
    const isEnabled = enableCheck.checked;
    await chrome.storage.sync.set({ interactModeEnabled: isEnabled });
    
    // Update context menu text
    chrome.contextMenus.update("toggle-interact-mode", {
      title: isEnabled ? "Disable Interact Mode" : "Enable Interact Mode"
    });
    
    // Notify content scripts
    chrome.tabs.query({}, function(tabs) {
      for (let i=0; i<tabs.length; i++){
        chrome.tabs.sendMessage(tabs[i].id, {
          type: "INTERACT_MODE_TOGGLED",
          enabled: isEnabled
        });
      }
    });
  });
}); 