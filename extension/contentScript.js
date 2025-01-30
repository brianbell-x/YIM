// extension/contentScript.js

(async function() {
  // Check if extension is enabled
  const { extensionEnabled = true } = await chrome.storage.local.get("extensionEnabled");
  if (!extensionEnabled) {
    console.log("Youtube Interact Mode extension is disabled.");
    return;
  }

  // Wait for the #description-inner or some stable container in YT
  const descriptionInner = await waitForElement("#below #description-inner");
  if (!descriptionInner) {
    console.warn("Cannot find #description-inner. Exiting.");
    return;
  }

  // Create container for our React app
  const root = document.createElement("div");
  root.id = "youtube-interact-mode-root";
  // Insert above the existing YouTube description
  descriptionInner.parentNode.insertBefore(root, descriptionInner);

  // Load the React bundle. This is produced by webpack.
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("dist/bundle.js");
  document.head.appendChild(script);

  // The React code will detect #youtube-interact-mode-root and render
})();

function waitForElement(selector) {
  return new Promise((resolve) => {
    const el = document.querySelector(selector);
    if (el) return resolve(el);

    const observer = new MutationObserver(() => {
      const found = document.querySelector(selector);
      if (found) {
        observer.disconnect();
        resolve(found);
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  });
} 