import { useState } from 'react';

const YoutubeInteractMode = ({ videoId, initialMessages = [] }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  const handleSend = () => {
    if (inputText.trim()) {
      setMessages([...messages, { text: inputText, isUser: true }]);
      setInputText('');
      // Add API call here
    }
  };

  return (
    <div className="yt-live-chat-renderer" style={{ 
      background: '#0f0f0f',
      borderRadius: '12px',
      marginTop: '16px'
    }}>
      {/* Header */}
      <div className="yt-live-chat-header-renderer" style={{
        padding: '16px',
        borderBottom: '1px solid #3c3c3c',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 className="yt-formatted-string" style={{ 
          color: '#fff',
          fontSize: '1.6rem',
          margin: 0
        }}>
          Interact Mode
        </h2>
        <div className="header-controls" style={{ display: 'flex', gap: '8px' }}>
          <select 
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="yt-dropdown-menu"
            style={{
              background: '#272727',
              color: '#fff',
              border: '1px solid #3c3c3c',
              borderRadius: '4px',
              padding: '6px 12px'
            }}
          >
            <option value="gpt-4o-mini">GPT-4o Mini</option>
            <option value="gpt-4o-2024-11-20">GPT-4o 2024.11</option>
          </select>
        </div>
      </div>

      {/* Message List */}
      <div className="yt-live-chat-item-list-renderer" style={{
        height: '400px',
        overflowY: 'auto',
        padding: '16px'
      }}>
        {messages.map((msg, index) => (
          <div key={index} className="message-bubble" style={{
            background: msg.isUser ? '#2b2b2b' : '#1a1a1a',
            color: '#fff',
            borderRadius: '12px',
            padding: '12px',
            marginBottom: '8px',
            maxWidth: '80%',
            alignSelf: msg.isUser ? 'flex-end' : 'flex-start'
          }}>
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input Panel */}
      <div className="yt-live-chat-message-input-renderer" style={{
        padding: '16px',
        borderTop: '1px solid #3c3c3c',
        display: 'flex',
        gap: '8px'
      }}>
        <div style={{ flexGrow: 1 }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="yt-live-chat-text-input-field"
            style={{
              width: '100%',
              background: '#272727',
              border: '1px solid #3c3c3c',
              borderRadius: '20px',
              padding: '10px 16px',
              color: '#fff'
            }}
          />
        </div>
        <button
          onClick={handleSend}
          className="yt-spec-button-shape-next"
          style={{
            background: '#3ea6ff',
            color: '#fff',
            border: 'none',
            borderRadius: '18px',
            padding: '10px 20px',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default YoutubeInteractMode; 