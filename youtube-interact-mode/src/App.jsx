import React, { useState, useEffect } from 'react';
import './styles.css';

const YoutubeInteractMode = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptLoading, setTranscriptLoading] = useState(true);

  useEffect(() => {
    // Get video ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('v');
    
    if (videoId) {
      setTranscriptLoading(true);
      
      // First check local storage
      chrome.storage.local.get('transcript', (data) => {
        if (data.transcript) {
          setTranscript(data.transcript);
          setTranscriptLoading(false);
        } else {
          // Request transcript from native host
          chrome.runtime.sendMessage({ 
            type: 'GET_TRANSCRIPT',
            videoId 
          });
          
          // Listen for transcript updates
          const listener = (changes) => {
            if (changes.transcript) {
              setTranscript(changes.transcript.newValue);
              setTranscriptLoading(false);
              chrome.storage.local.onChanged.removeListener(listener);
            }
          };
          chrome.storage.local.onChanged.addListener(listener);
        }
      });
    } else {
      setTranscriptLoading(false);
    }
  }, []);

  // Send message to API
  async function handleSend() {
    if (!inputText.trim()) return;
    if (transcriptLoading) {
      alert('Please wait for the transcript to finish loading before sending messages.');
      return;
    }
    if (!transcript) {
      alert('No transcript available. Please ensure the video has been transcribed first.');
      return;
    }

    const userMessage = inputText.trim();

    // Add user message to state
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setInputText('');

    // Call OpenAI
    setLoading(true);
    try {
      const { openaiApiKey } = await chrome.storage.sync.get('openaiApiKey');
      if (!openaiApiKey) {
        alert('No OpenAI API key found. Please set it in extension popup.');
        setLoading(false);
        return;
      }

      const messages = [
        {
          role: 'system',
          content: `The user would like to further discuss the content of the video. Here is the transcript: <transcript>${transcript || 'No transcript available yet.'}</transcript>`
        },
        {
          role: 'user',
          content: userMessage
        }
      ];

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages
        })
      });

      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        const aiReply = data.choices[0].message.content;
        setMessages(prev => [...prev, { text: aiReply, isUser: false }]);
      }
    } catch (err) {
      console.error('Error calling OpenAI:', err);
      setMessages(prev => [...prev, { 
        text: 'Error: Failed to get response from AI. Please check your API key and try again.',
        isUser: false 
      }]);
    }
    setLoading(false);
  }

  // Clear conversation
  function handleClear() {
    setMessages([]);
  }

  // Copy conversation
  function handleCopy() {
    const text = messages.map(m => `${m.isUser ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      alert('Conversation copied to clipboard!');
    });
  }

  return (
    <div className="yim-container">
      <div className="yim-header">
        <span className="yim-title">Interact Mode</span>
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="yim-model-select"
        >
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o-2024-11-20">gpt-4o-2024-11-20</option>
        </select>
        <button onClick={handleClear} className="yim-btn">Clear</button>
        <button onClick={handleCopy} className="yim-btn">Copy</button>
      </div>
      <div className="yim-chat-area">
        {transcriptLoading && (
          <div className="yim-status-msg">
            <div className="yim-spinner"></div>
            <span>Retrieving transcript...</span>
          </div>
        )}
        {!transcriptLoading && !transcript && (
          <div className="yim-status-msg">
            No transcript available. Please ensure the video has been transcribed.
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.isUser ? 'yim-user-msg' : 'yim-bot-msg'}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="yim-bot-msg">Loading response...</div>}
      </div>
      <div className="yim-input-area">
        <input
          className="yim-input"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder={transcriptLoading ? "Waiting for transcript..." : "Ask about the video..."}
          disabled={transcriptLoading || !transcript}
        />
        <button 
          onClick={handleSend} 
          className="yim-send-btn"
          disabled={loading || transcriptLoading || !transcript}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default YoutubeInteractMode; 