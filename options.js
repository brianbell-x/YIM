// Saves options to chrome.storage
function saveOptions() {
  const openaiKey = document.getElementById('openai-key').value;
  const defaultMode = document.getElementById('default-mode').value;
  
  chrome.storage.sync.set(
    {
      openaiApiKey: openaiKey,
      defaultMode: defaultMode
    },
    () => {
      // Update status to let user know options were saved
      const status = document.getElementById('status');
      status.textContent = 'Options saved.';
      status.className = 'success';
      
      // Hide status after 2 seconds
      setTimeout(() => {
        status.style.display = 'none';
      }, 2000);
    }
  );
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restoreOptions() {
  chrome.storage.sync.get(
    {
      openaiApiKey: '', // default value
      defaultMode: 'text' // default value
    },
    (items) => {
      document.getElementById('openai-key').value = items.openaiApiKey;
      document.getElementById('default-mode').value = items.defaultMode;
    }
  );
}

// Validate OpenAI API key format
function validateApiKey(key) {
  // Basic format check for OpenAI API keys
  return /^sk-[A-Za-z0-9]{32,}$/.test(key);
}

// Add event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', () => {
  const openaiKey = document.getElementById('openai-key').value;
  const status = document.getElementById('status');
  
  if (!openaiKey) {
    status.textContent = 'Please enter an OpenAI API key.';
    status.className = 'error';
    status.style.display = 'block';
    return;
  }
  
  if (!validateApiKey(openaiKey)) {
    status.textContent = 'Invalid OpenAI API key format. It should start with "sk-" followed by at least 32 characters.';
    status.className = 'error';
    status.style.display = 'block';
    return;
  }
  
  saveOptions();
}); 