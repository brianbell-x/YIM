// extension/background.js

chrome.runtime.onInstalled.addListener(() => {
  // Create context menu
  chrome.contextMenus.create({
    id: "toggle-extension",
    title: "Enable/Disable extension",
    contexts: ["action"]
  });

  chrome.contextMenus.create({
    id: "restart-extension",
    title: "Restart extension",
    contexts: ["action"]
  });

  // Alternatively, a context menu item to open the options page
  chrome.contextMenus.create({
    id: "set-api-key",
    title: "Set OpenAI API key",
    contexts: ["action"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "toggle-extension") {
    // Toggle a boolean in storage
    const { extensionEnabled = true } = await chrome.storage.local.get("extensionEnabled");
    await chrome.storage.local.set({ extensionEnabled: !extensionEnabled });
    console.log("Extension enabled set to: ", !extensionEnabled);
  } else if (info.menuItemId === "restart-extension") {
    // Reload the extension
    chrome.runtime.reload();
  } else if (info.menuItemId === "set-api-key") {
    // Open the extension's options page / popup
    chrome.runtime.openOptionsPage();
  }
}); 