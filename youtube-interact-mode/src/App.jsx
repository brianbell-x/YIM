import React, { useState, useEffect } from 'react';
import './styles.css';

const CHUNK_SIZE = 2000; // Characters per chunk
const MAX_CHUNKS = 3; // Maximum number of relevant chunks to include

const YoutubeInteractMode = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [transcriptSummary, setTranscriptSummary] = useState('');

  useEffect(() => {
    // Load transcript from storage if available
    chrome.storage.local.get('transcript', async (data) => {
      if (data.transcript) {
        setTranscript(data.transcript);
        // Generate summary for long transcripts
        if (data.transcript.length > CHUNK_SIZE * MAX_CHUNKS) {
          await generateTranscriptSummary(data.transcript);
        }
      }
    });
  }, []);

  // Generate a summary of the transcript using the OpenAI API
  async function generateTranscriptSummary(fullTranscript) {
    try {
      const { openaiApiKey } = await chrome.storage.sync.get('openaiApiKey');
      if (!openaiApiKey) return;

      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'system',
              content: 'Create a concise summary of the following transcript that captures the main points and key details:'
            },
            {
              role: 'user',
              content: fullTranscript
            }
          ]
        })
      });

      const data = await res.json();
      if (data?.choices?.[0]?.message?.content) {
        setTranscriptSummary(data.choices[0].message.content);
      }
    } catch (err) {
      console.error('Error generating transcript summary:', err);
    }
  }

  // Find most relevant chunks of the transcript for a given query
  function findRelevantChunks(query, fullTranscript) {
    const chunks = [];
    let currentChunk = '';
    const words = fullTranscript.split(' ');
    
    // Create chunks
    for (const word of words) {
      if ((currentChunk + ' ' + word).length <= CHUNK_SIZE) {
        currentChunk += (currentChunk ? ' ' : '') + word;
      } else {
        chunks.push(currentChunk);
        currentChunk = word;
      }
    }
    if (currentChunk) {
      chunks.push(currentChunk);
    }

    // Simple relevance scoring based on word overlap
    const queryWords = new Set(query.toLowerCase().split(' '));
    const scoredChunks = chunks.map(chunk => {
      const chunkWords = chunk.toLowerCase().split(' ');
      const score = chunkWords.filter(word => queryWords.has(word)).length;
      return { chunk, score };
    });

    // Sort by score and take top chunks
    return scoredChunks
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_CHUNKS)
      .map(({ chunk }) => chunk)
      .join('\n\n');
  }

  // Send message to API
  async function handleSend() {
    if (!inputText.trim()) return;
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

      // Prepare context from transcript
      let context = '';
      if (transcript) {
        if (transcript.length > CHUNK_SIZE * MAX_CHUNKS) {
          // For long transcripts, use summary and relevant chunks
          const relevantChunks = findRelevantChunks(userMessage, transcript);
          context = `Summary: ${transcriptSummary}\n\nRelevant parts of the transcript:\n${relevantChunks}`;
        } else {
          // For shorter transcripts, use the full text
          context = transcript;
        }
      }

      const messages = [
        {
          role: 'system',
          content: `You are a helpful assistant discussing a YouTube video. ${
            context ? 'Here is the relevant context from the video:\n\n' + context : 'No transcript available yet.'
          }`
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
          placeholder="Ask about the video..."
        />
        <button 
          onClick={handleSend} 
          className="yim-send-btn"
          disabled={loading}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default YoutubeInteractMode; 