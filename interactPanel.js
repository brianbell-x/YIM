class YouTubeInteractPanel {
  constructor() {
    this.panel = null;
    this.isVoiceModeActive = false;
    this.transcript = '';
  }

  create() {
    if (this.panel) return;

    this.panel = document.createElement('div');
    this.panel.className = 'yt-interact-panel';
    this.panel.innerHTML = `
      <div class="yt-interact-panel-header">
        <h3 class="yt-interact-panel-title">YouTube Interact Mode</h3>
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
  }

  async handleUserMessage(message) {
    if (!message.trim()) return;

    this.addMessage('user', message);
    
    try {
      // Get settings from storage
      const settings = await this.getSettings();
      
      if (!settings.openaiApiKey) {
        this.addMessage('assistant', 'Please set your OpenAI API key in the extension options.');
        return;
      }

      // Prepare the messages array with system message containing transcript
      const messages = [
        {
          role: 'system',
          content: `You are a helpful assistant discussing a YouTube video. Here is the video transcript:\n\n${this.transcript}\n\nReference this content when answering questions.`
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
          model: 'gpt-4o-mini',
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
      
      // TODO: Implement real-time voice processing with OpenAI Whisper API
      // For now, just show a placeholder message
      this.addMessage('assistant', 'Voice mode activated (implementation pending)');
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      this.addMessage('assistant', 'Could not access microphone. Please check permissions.');
    }
  }

  stopVoiceMode() {
    this.isVoiceModeActive = false;
    const voiceBtn = this.panel.querySelector('.yt-interact-voice-btn');
    voiceBtn.classList.remove('yt-interact-voice-active');
    // TODO: Clean up voice mode resources
  }

  async getSettings() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['openaiApiKey', 'defaultMode'], (result) => {
        resolve({
          openaiApiKey: result.openaiApiKey || '',
          defaultMode: result.defaultMode || 'text'
        });
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