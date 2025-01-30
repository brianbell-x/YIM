// extension/options.js

document.addEventListener("DOMContentLoaded", async () => {
  const apiKeyInput = document.getElementById("apiKey");
  const saveBtn = document.getElementById("saveKey");

  // Populate existing key
  const { openaiKey } = await chrome.storage.local.get("openaiKey");
  if (openaiKey) {
    apiKeyInput.value = openaiKey;
  }

  saveBtn.addEventListener("click", async () => {
    const newKey = apiKeyInput.value.trim();
    await chrome.storage.local.set({ openaiKey: newKey });
    alert("API Key saved successfully!");
  });
}); 