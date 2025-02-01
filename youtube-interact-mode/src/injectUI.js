import { createRoot } from 'react-dom/client';
import YoutubeInteractMode from './App';

// Track if we've already injected the UI
let isInjected = false;
let root = null;

// Clean up existing UI if present
function cleanupExistingUI() {
  const existingRoot = document.getElementById('youtube-interact-mode-root');
  if (existingRoot) {
    if (root) {
      root.unmount();
    }
    existingRoot.remove();
    isInjected = false;
  }
}

// Find the best container for our UI
function findTargetContainer() {
  // Try live chat containers first
  const liveChatContainers = [
    document.querySelector('ytd-live-chat-frame'),
    document.querySelector('#chat'),
    document.querySelector('#chat-container'),
    document.querySelector('#chatframe')
  ];

  for (const container of liveChatContainers) {
    if (container) {
      // Clear existing chat content
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      return container;
    }
  }

  // Fallback to description area
  return document.querySelector('#description-inner') || 
         document.querySelector('#secondary-inner');
}

// Main injection function
export function injectChatUI() {
  if (isInjected) return;

  const targetContainer = findTargetContainer();
  if (!targetContainer) return;

  // Create our container
  const container = document.createElement('div');
  container.id = 'youtube-interact-mode-root';
  
  // Insert at appropriate position
  if (targetContainer.id === 'description-inner') {
    targetContainer.prepend(container);
  } else {
    targetContainer.appendChild(container);
  }

  // Mount React app
  root = createRoot(container);
  root.render(<YoutubeInteractMode />);
  isInjected = true;
}

// Handle YouTube's SPA navigation
function setupNavigationObserver() {
  // Watch for URL changes
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      cleanupExistingUI();
      setTimeout(injectChatUI, 1000); // Give YouTube time to load new page
    }
  }).observe(document.body, { subtree: true, childList: true });

  // Watch for dynamic chat container insertion
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (
            node.matches('ytd-live-chat-frame') ||
            node.matches('#chat') ||
            node.querySelector('ytd-live-chat-frame') ||
            node.querySelector('#chat')
          ) {
            cleanupExistingUI();
            setTimeout(injectChatUI, 500);
            return;
          }
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

// Initialize
export function initializeUI() {
  cleanupExistingUI();
  injectChatUI();
  setupNavigationObserver();
} 