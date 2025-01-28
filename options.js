// Saves options to chrome.storage
function saveOptions() {
  const openaiKey = document.getElementById('openai-key').value;
  const defaultMode = document.getElementById('default-mode').value;
  const extensionEnabled = document.getElementById('extension-enabled').checked;
  const textModel = document.getElementById('text-model').value;
  const voiceModel = document.getElementById('voice-model').value;
  
  chrome.storage.sync.set(
    {
      openaiApiKey: openaiKey,
      defaultMode: defaultMode,
      extensionEnabled: extensionEnabled,
      textModel: textModel,
      voiceModel: voiceModel
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
      defaultMode: 'text', // default value
      extensionEnabled: true, // default value
      textModel: 'gpt-4o-mini', // default value
      voiceModel: 'gpt-4o-realtime-preview-2024-12-17' // default value
    },
    (items) => {
      document.getElementById('openai-key').value = items.openaiApiKey;
      document.getElementById('default-mode').value = items.defaultMode;
      document.getElementById('extension-enabled').checked = items.extensionEnabled;
      document.getElementById('text-model').value = items.textModel;
      document.getElementById('voice-model').value = items.voiceModel;
    }
  );
}

async function validateApiKey(key) {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify({
        messages: [{ role: "developer", content: "Hi" }],
        model: "gpt-4o-mini",
        max_tokens: 1
      })
    });
    return response.status === 200;
  } catch (error) {
    console.error('API validation error:', error);
    return false;
  }
}

// Add event listeners
document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', async () => {
  const openaiKey = document.getElementById('openai-key').value;
  const status = document.getElementById('status');
  
  if (!openaiKey) {
    status.textContent = 'Please enter an OpenAI API key.';
    status.className = 'error';
    status.style.display = 'block';
    return;
  }
  
  status.textContent = 'Validating API key...';
  status.className = '';
  status.style.display = 'block';

  const isValid = await validateApiKey(openaiKey);
  
  if (!isValid) {
    status.textContent = 'Invalid API key. Please check your key and try again.';
    status.className = 'error';
    status.style.display = 'block';
    return;
  }
  
  saveOptions();
}); 