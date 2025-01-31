import React from 'react';
import { createRoot } from 'react-dom/client';
import YoutubeInteractMode from './App';
import { initializeUI, injectChatUI } from './injectUI';

// Function to inject our React app
function injectChatUI() {
  // If it's already injected, do nothing
  if (document.getElementById('youtube-interact-mode-root')) return;
  
  // Create container
  const container = document.createElement('div');
  container.id = 'youtube-interact-mode-root';
  
  // Try to find the live chat container first
  let targetContainer = document.querySelector('ytd-live-chat-frame') || 
                       document.querySelector('#chat') ||
                       document.querySelector('#secondary-inner');
  
  // If no live chat container found, fallback to description
  if (!targetContainer) {
    targetContainer = document.querySelector('#description-inner');
  }
  
  if (targetContainer) {
    // If it's the live chat frame, we want to replace it
    if (targetContainer.tagName.toLowerCase() === 'ytd-live-chat-frame') {
      targetContainer.innerHTML = '';
      targetContainer.appendChild(container);
    } else {
      // For other containers, we'll prepend our container
      targetContainer.prepend(container);
    }
    
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

// Initialize UI when enabled
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'INTERACT_MODE_TOGGLED') {
    if (request.enabled) {
      initializeUI();
    } else {
      const root = document.getElementById('youtube-interact-mode-root');
      if (root) {
        root.remove();
      }
    }
  }
});

// Check if Interact Mode is enabled on load
chrome.storage.sync.get('interactModeEnabled', (data) => {
  if (data.interactModeEnabled) {
    initializeUI();
  }
}); 