class YouTubeInteractPanel {
  constructor() {
    this.panel = null;
    this.isVoiceModeActive = false;
    this.transcript = '';
    this.conversation = []; // Store conversation history
    this.ws = null; // WebSocket for voice mode
  }

  create() {
    if (this.panel) return;

    this.panel = document.createElement('div');
    this.panel.className = 'yt-interact-panel';
    this.panel.innerHTML = `
      <div class="yt-interact-panel-header">
        <h3 class="yt-interact-panel-title">YouTube Interact Mode</h3>
        <button class="yt-interact-copy">Copy</button>
        <button class="yt-interact-panel-close">✕</button>
      </div>
      <div class="yt-interact-messages"></div>
      <div class="yt-interact-input-container">
        <input type="text" class="yt-interact-input" placeholder="Ask about the video...">
        <button class="yt-interact-send-btn">Send</button>
        <button class="yt-interact-voice-btn">🎤</button>
      </div>
    `;

    document.body.appendChild(this.panel);
    this.setupEventListeners();
  }

  setupEventListeners() {
    const closeBtn = this.panel.querySelector('.yt-interact-panel-close');
    const input = this.panel.querySelector('.yt-interact-input');
    const sendBtn = this.panel.querySelector('.yt-interact-send-btn');
    const voiceBtn = this.panel.querySelector('.yt-interact-voice-btn');
    const copyBtn = this.panel.querySelector('.yt-interact-copy');

    closeBtn.addEventListener('click', () => this.close());
    
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.handleUserMessage(input.value);
        input.value = '';
      }
    });

    sendBtn.addEventListener('click', () => {
      this.handleUserMessage(input.value);
      input.value = '';
    });

    voiceBtn.addEventListener('click', () => this.toggleVoiceMode());

    copyBtn.addEventListener('click', () => {
      const text = this.conversation.map(msg => 
        `${msg.role.toUpperCase()}: ${msg.content}`
      ).join('\n\n');
      navigator.clipboard.writeText(text)
        .then(() => this.addMessage('assistant', 'Conversation copied to clipboard.'))
        .catch(err => console.error('Failed to copy:', err));
    });
  }

  async handleUserMessage(message) {
    if (!message.trim()) return;

    this.addMessage('user', message);
    this.conversation.push({ role: 'user', content: message });
    
    try {
      const settings = await this.getSettings();
      
      if (!settings.openaiApiKey) {
        this.addMessage('assistant', 'Please set your OpenAI API key in the extension options.');
        return;
      }

      // Use the appropriate model based on mode
      const model = this.isVoiceModeActive ? settings.voiceModel : settings.textModel;

      // Build conversation history for context
      const messages = [
        {
          role: 'system',
          content: `The user would like to further discuss the content of the video.
Here is the transcript:
${this.transcript}
--- End Transcript ---`
        },
        ...this.conversation // Include full conversation history
      ];

      // Call OpenAI API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.openaiApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: 0.7
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message);
      }

      const reply = data.choices[0].message.content;
      this.addMessage('assistant', reply);
      this.conversation.push({ role: 'assistant', content: reply });

    } catch (error) {
      console.error('Error:', error);
      this.addMessage('assistant', 'Sorry, there was an error processing your request.');
    }
  }

  addMessage(role, content) {
    const messagesContainer = this.panel.querySelector('.yt-interact-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `yt-interact-message ${role}`;
    messageDiv.textContent = content;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  async toggleVoiceMode() {
    if (this.isVoiceModeActive) {
      this.stopVoiceMode();
    } else {
      await this.startVoiceMode();
    }
  }

  async startVoiceMode() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.isVoiceModeActive = true;
      
      const voiceBtn = this.panel.querySelector('.yt-interact-voice-btn');
      voiceBtn.classList.add('yt-interact-voice-active');

      // Get settings for WebSocket connection
      const settings = await this.getSettings();
      const model = settings.voiceModel;

      // Connect to OpenAI Realtime API
      const wsUrl = `wss://api.openai.com/v1/realtime?model=${model}`;
      this.ws = new WebSocket(wsUrl, [
        'realtime',
        `openai-insecure-api-key.${settings.openaiApiKey}`,
        'openai-beta.realtime-v1',
      ]);

      this.ws.onopen = () => {
        this.addMessage('assistant', 'Voice mode connected. Speak to interact.');
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Handle real-time responses
        if (data.type === 'response' && data.text) {
          this.addMessage('assistant', data.text);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.addMessage('assistant', 'Voice mode error. Please try again.');
        this.stopVoiceMode();
      };

      // TODO: Set up AudioWorklet for real-time audio processing
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      this.addMessage('assistant', 'Could not access microphone. Please check permissions.');
    }
  }

  stopVoiceMode() {
    this.isVoiceModeActive = false;
    const voiceBtn = this.panel.querySelector('.yt-interact-voice-btn');
    voiceBtn.classList.remove('yt-interact-voice-active');

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get({
        openaiApiKey: '',
        defaultMode: 'text',
        extensionEnabled: true,
        textModel: 'gpt-4o-mini',
        voiceModel: 'gpt-4o-realtime-preview-2024-12-17'
      }, (result) => {
        resolve(result);
      });
    });
  }

  setTranscript(transcript) {
    this.transcript = transcript;
  }

  close() {
    if (this.panel && this.panel.parentElement) {
      this.panel.parentElement.removeChild(this.panel);
      this.panel = null;
    }
    if (this.isVoiceModeActive) {
      this.stopVoiceMode();
    }
  }
}

// Export for use in contentScript.js
window.YouTubeInteractPanel = YouTubeInteractPanel; 