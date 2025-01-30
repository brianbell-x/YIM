# Youtube Interact Mode

## Overview
An AI chat assistant with the YouTube video's transcript in its context. As a Chrome extension.

## Transcription Process
The YouTube video will need to be downloaded then transcribed using Whisper. The process involves:

1. **Video Download**
   - Download Video as Mp3 - `docs/youtube-to-mp3.js`

2. **Audio Processing**
   - If mp3 file is larger than 25MB, split into 25MB chunks
   - No special chunking strategy needed (e.g., silence detection)

3. **Transcription**
   - Use Whisper API to transcribe each chunk
   - Merge all chunk transcripts into a single complete transcript
   - Store entire transcript in system prompt without summarization

4. **Storage & Caching**
   - Cache transcripts in Chrome's local storage
    - video_id -> transcript
   - Reuse cached transcripts to avoid re-transcription
   - Store until storage limits are reached
   - No special indexing or retrieval system needed

5. **Source**
   - Rely solely on Whisper for transcription
   - No need to check for official YouTube captions

## Text Mode

### System Prompt
- The entire transcript is appended to the system prompt
- System prompt template:
  ```
  The user would like to further discuss the content of the video. Here is the transcript: <transcript>... </transcript>
  ```

### Conversation Management
- Conversation history stored in-memory only
- No rolling window/context limits needed due to model's large context window
- Copy button provided to let users save conversations to clipboard

### User Interface
- Location: Expander panel above the video description expander
- Components:
  - Chat message history display
  - Text input box for user messages
  - Send button
  - Copy conversation button
  - Model selector dropdown (gpt-4o-mini, gpt-4o-2024-11-20)
  - Clear conversation button

### Interaction Flow
1. User clicks "Interact Mode" button (located between like/dislike and share buttons)
2. Video automatically pauses
3. Chat UI expands above description
4. User can type messages and receive AI responses while referencing video content
5. Entire conversation remains in context for follow-up questions

## Voice Mode

### System Prompt
- Shares the same system prompt as Text Mode with full transcript
- Maintains continuous conversation history with Text Mode
- System prompt template matches Text Mode:
  ```
  The user would like to further discuss the content of the video. Here is the transcript: <transcript>... </transcript>
  ```

### Audio Handling
- Uses browser's `MediaDevices.getUserMedia` for microphone capture
- Implements WebSocket connection to Realtime API (wss://api.openai.com/v1/realtime)
- Audio encoding: PCM16 format at 24kHz sample rate (Realtime API recommended)
- Utilizes server-side turn detection (`turn_detection` enabled)
- Implements Realtime API's recommended voice activity indicators:
  - Visual feedback for "listening", "processing", and "speaking" states
  - Animated voice activity indicator next to input

### Conversation Management
- Shares in-memory conversation history with Text Mode
- Maintains single continuous context across text/voice interactions
- Uses same model instructions and context window management as Text Mode

### User Interface
- Voice toggle button (microphone icon) beside text input
- Real-time voice waveform visualization
- Status indicators for connection/recognition states
- Text transcript of voice interaction displayed alongside responses
- Audio output controls with play/pause/volume
- Model selector dropdown (gpt-4o-realtime-preview-2024-12-17, gpt-4o-mini-realtime-preview-2024-12-17)

### Interaction Flow
1. User clicks voice icon to start voice mode
2. System establishes WebSocket connection to Realtime API
3. Browser microphone activates with user permission
4. Real-time audio streaming begins using PCM16 encoding
5. Server-side VAD detects speech segments and triggers responses
6. AI responses delivered via:
   - Text: Displayed in chat history
   - Audio: Played through Web Audio API
7. Conversation history updated bidirectionally with Text Mode

## Options in Chrome's extension icon context menu
- Enable/disable the extension
- Restart the extension

## User Interface
The UI features a React component that replicates YouTube's native chat interface, implemented as a Chrome extension panel above the video description. Key components and implementation details:

### React Component Implementation
Key features:
- Mirrors YouTube's DOM structure with `yt-live-chat-renderer` hierarchy
- Uses React state management for messages and UI state
- Implements YouTube's dark theme colors (#0f0f0f background, #3ea6ff buttons)
- Responsive message list with user/bot differentiation
- Model selector dropdown with GPT-4o options

```jsx
// Example component structure
const YoutubeInteractMode = ({ videoId, initialMessages = [] }) => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4o-mini');

  // Message handling and API integration
  const handleSend = () => {
    if (inputText.trim()) {
      setMessages([...messages, { text: inputText, isUser: true }]);
      setInputText('');
    }
  };
});
```

### Integration Notes
1. Chrome extension mounting:
```javascript
// Content script injection
const root = document.createElement('div');
document.querySelector('#description-inner').prepend(root);
ReactDOM.createRoot(root).render(<YoutubeInteractMode />);
```

2. Styling Approach:
- Matches YouTube's design system with inline styles
- Uses characteristic rounded corners (12px containers, 20px inputs)
- Implements Material Design elevation through box shadows
- Color scheme mirrors YouTube dark theme (#272727 input backgrounds)

### Core Components
1. **Header Section**
   - YouTube-branded header with "Interact Mode" title
   - Model selector dropdown (gpt-4o-mini, gpt-4o-2024-11-20)
   - Close/collapse buttons using Material Design icons

2. **Message Display Area**
   - Scrollable message container with dynamic height
   - Message bubbles showing:
     - User messages (right-aligned, #2b2b2b background)
     - AI responses (left-aligned, #1a1a1a background)
   - Timestamp visibility on hover

3. **Input Panel**
   - ContentEditable input field with:
     - Real-time formatting preview
     - Character counter (200 max)
   - Voice mode toggle (microphone icon)
   - Send button with loading states

### Visual Design
- Matches YouTube's dark theme through React inline styles
- Uses YouTube's system icons through imported SVG assets
- Animated message entry/exit transitions
- Real-time typing indicators

### Implementation Notes
1. Component Structure:
   - Uses React state management for messages/input
   - Prop-based configuration (videoId, initialMessages)
   - Event handlers for message submission

2. Next Steps:
   - Add Web Audio API integration for voice mode
   - Implement Chrome storage persistence
   - Add typing indicators/loading states
   - Integrate OpenAI API endpoints
