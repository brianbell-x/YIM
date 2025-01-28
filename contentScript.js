(function() {
  const DEBUG = true;
  let interactPanel = null;
  
  function log(...args) {
    if (DEBUG) console.log('[YouTube Interact]', ...args);
  }

  // Get video ID from URL
  function getVideoId() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('v');
  }

  // Check if transcript is cached
  async function getCachedTranscript(videoId) {
    return new Promise((resolve) => {
      const key = `transcript_${videoId}`;
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null);
      });
    });
  }

  // Cache a transcript
  async function cacheTranscript(videoId, transcript) {
    const key = `transcript_${videoId}`;
    return chrome.storage.local.set({ [key]: transcript });
  }

  // Get audio data from video
  async function getVideoAudio() {
    const video = document.querySelector('video');
    if (!video) throw new Error('No video element found');

    // Create a MediaRecorder to capture the audio stream
    const stream = video.captureStream();
    const audioTrack = stream.getAudioTracks()[0];
    if (!audioTrack) throw new Error('No audio track found');

    const mediaRecorder = new MediaRecorder(new MediaStream([audioTrack]));
    const chunks = [];

    return new Promise((resolve, reject) => {
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => resolve(new Blob(chunks, { type: 'audio/webm' }));
      mediaRecorder.onerror = reject;

      // Record current position to end
      const duration = video.duration - video.currentTime;
      mediaRecorder.start();
      setTimeout(() => mediaRecorder.stop(), duration * 1000);
    });
  }

  // Transcribe using Whisper API
  async function transcribeAudio(audioBlob, apiKey) {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Whisper API error: ' + await response.text());
    }

    const data = await response.json();
    return data.text;
  }

  // Get settings from storage
  async function getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({
        openaiApiKey: '',
        defaultMode: 'text',
        extensionEnabled: true,
        textModel: 'gpt-4o-mini',
        voiceModel: 'gpt-4o-realtime-preview-2024-12-17'
      }, (items) => resolve(items));
    });
  }

  async function handleInteractButtonClick() {
    const video = document.querySelector('video.html5-main-video');
    if (video) {
      log('Video found, pausing...');
      video.pause();
    }

    // Find or create expander
    let expander = document.querySelector('#my-interact-expander');
    if (!expander) {
      expander = document.createElement('div');
      expander.id = 'my-interact-expander';
      expander.className = 'yt-interact-expander';

      // Insert below video description
      const descContainer = document.querySelector('#description-inline-expander') 
                          || document.querySelector('#description');
      if (descContainer) {
        descContainer.parentElement.insertBefore(expander, descContainer.nextSibling);
      }
    }

    // Initialize expander content
    expander.innerHTML = `
      <div class="yt-interact-expander-header">
        <h3 class="yt-interact-expander-title">Interact Mode</h3>
        <div id="my-interact-status" class="yt-interact-status">
          Paused video. Preparing to transcribe...
        </div>
      </div>
      <div id="my-interact-chat" class="yt-interact-chat"></div>
    `;

    const statusEl = expander.querySelector('#my-interact-status');
    const chatEl = expander.querySelector('#my-interact-chat');

    // Get video ID and check cache
    const videoId = getVideoId();
    if (!videoId) {
      statusEl.textContent = 'Error: Could not determine video ID';
      return;
    }

    let transcript = await getCachedTranscript(videoId);
    
    if (!transcript) {
      try {
        const settings = await getSettings();
        if (!settings.openaiApiKey) {
          statusEl.textContent = 'Error: OpenAI API key not set. Please set it in extension options.';
          return;
        }

        statusEl.textContent = 'Retrieving audio from the video...';
        const audioBlob = await getVideoAudio();

        statusEl.textContent = 'Transcribing audio with Whisper...';
        transcript = await transcribeAudio(audioBlob, settings.openaiApiKey);
        
        await cacheTranscript(videoId, transcript);
        
      } catch (error) {
        console.error('Transcription error:', error);
        statusEl.textContent = `Error: ${error.message}`;
        return;
      }
    }

    // Initialize chat UI
    statusEl.textContent = 'Transcript ready. You can start chatting!';
    chatEl.innerHTML = `
      <div class="yt-interact-chat-messages"></div>
      <div class="yt-interact-chat-input">
        <input type="text" placeholder="Ask about the video...">
        <button>Send</button>
      </div>
    `;

    const messagesEl = chatEl.querySelector('.yt-interact-chat-messages');
    const inputEl = chatEl.querySelector('input');
    const sendBtn = chatEl.querySelector('button');

    // Handle sending messages
    async function handleSendMessage() {
      const message = inputEl.value.trim();
      if (!message) return;

      // Add user message
      const userDiv = document.createElement('div');
      userDiv.className = 'yt-interact-message user';
      userDiv.textContent = message;
      messagesEl.appendChild(userDiv);
      messagesEl.scrollTop = messagesEl.scrollHeight;
      inputEl.value = '';

      try {
        const settings = await getSettings();
        
        // Build messages array with system context
        const messages = [
          {
            role: 'system',
            content: `You are helping discuss a YouTube video. Here is the transcript:
${transcript}
--- End Transcript ---`
          },
          {
            role: 'user',
            content: message
          }
        ];

        // Call OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.openaiApiKey}`
          },
          body: JSON.stringify({
            model: settings.textModel,
            messages: messages,
            temperature: 0.7
          })
        });

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error.message);
        }

        // Add assistant response
        const assistantDiv = document.createElement('div');
        assistantDiv.className = 'yt-interact-message assistant';
        assistantDiv.textContent = data.choices[0].message.content;
        messagesEl.appendChild(assistantDiv);
        messagesEl.scrollTop = messagesEl.scrollHeight;

      } catch (error) {
        console.error('Chat error:', error);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'yt-interact-message assistant';
        errorDiv.textContent = `Error: ${error.message}`;
        messagesEl.appendChild(errorDiv);
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    }

    sendBtn.addEventListener('click', handleSendMessage);
    inputEl.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSendMessage();
    });
  }

  function injectInteractButton() {
    // Already inserted?
    if (document.querySelector('#my-youtube-interact-button')) {
      log('Button already exists, skipping injection');
      return;
    }

    // Find the container between Like/Dislike and Share
    const container = document.querySelector('#top-level-buttons-computed');
    if (!container) {
      log('No button container found, will try again on next mutation');
      return;
    }

    // Create button wrapper to match YouTube's structure
    const buttonWrapper = document.createElement('div');
    buttonWrapper.style.cssText = 'display: inline-flex; margin: 0 8px;';

    const interactButton = document.createElement('button');
    interactButton.id = 'my-youtube-interact-button';
    interactButton.className = 'yt-interact-button';
    interactButton.textContent = 'INTERACT';
    interactButton.setAttribute('title', 'Open Interact Mode');
    interactButton.setAttribute('aria-label', 'Open Interact Mode');

    // Add click handler
    interactButton.addEventListener('click', handleInteractButtonClick);

    // Insert after Like/Dislike but before Share
    buttonWrapper.appendChild(interactButton);
    const shareButton = Array.from(container.children).find(el => 
      el.textContent.toLowerCase().includes('share')
    );
    if (shareButton) {
      container.insertBefore(buttonWrapper, shareButton);
    } else {
      container.appendChild(buttonWrapper);
    }
    
    log('Interact button successfully injected!');
  }

  // A small MutationObserver to watch for #top-level-buttons-computed changes
  const observer = new MutationObserver(mutations => {
    log('DOM mutated; trying to inject button.');
    injectInteractButton();
  });

  // Wait for the page to be ready
  async function init() {
    log('Initializing YouTube Interact extension...');

    // Check if extension is enabled
    const settings = await getSettings();
    if (!settings.extensionEnabled) {
      log('Extension is disabled in settings');
      return;
    }
    
    // Try to find the watch page container
    const watchFlexy = document.querySelector('ytd-watch-flexy') || document.body;
    
    if (watchFlexy) {
      log('Found watch page container, starting observer');
      observer.observe(watchFlexy, { 
        childList: true, 
        subtree: true 
      });
      
      // Initial injection attempt
      injectInteractButton();
    } else {
      log('Watch page container not found, retrying in 1s...');
      setTimeout(init, 1000);
    }
  }

  // Start the initialization
  init();
})(); 