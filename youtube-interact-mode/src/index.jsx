import React from 'react';
import { createRoot } from 'react-dom/client';
import YoutubeInteractMode from './App';

// Function to inject our React app
function injectChatUI() {
  // If it's already injected, do nothing
  if (document.getElementById('youtube-interact-mode-root')) return;
  
  // Create container
  const container = document.createElement('div');
  container.id = 'youtube-interact-mode-root';
  
  // Insert right above the video description
  const descriptionInner = document.querySelector('#description-inner');
  if (descriptionInner) {
    descriptionInner.prepend(container);
    // Mount React app
    const root = createRoot(container);
    root.render(<YoutubeInteractMode />);
  }
}

function removeChatUI() {
  const root = document.getElementById('youtube-interact-mode-root');
  if (root) {
    root.remove();
  }
}

// Listen for messages from background script or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'INTERACT_MODE_TOGGLED') {
    if (request.enabled) {
      injectChatUI();
    } else {
      removeChatUI();
    }
  }
});

// Check if Interact Mode is enabled on load
chrome.storage.sync.get('interactModeEnabled', (data) => {
  if (data.interactModeEnabled) {
    injectChatUI();
  }
}); 