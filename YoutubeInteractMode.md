# Youtube Interact Mode

## Overview
An AI chat assistant with the YouTube video's transcript in its context. As a Chrome extension.

## Transcription Process
The YouTube video will need to be downloaded then transcribed using Whisper. The process involves:

1. **Video Download**
   - Download Video

2. **Audio Processing**
   - If audio file is larger than 25MB, split into 25MB chunks
   - No special chunking strategy needed (e.g., silence detection)

3. **Transcription**
   - Use Whisper API to transcribe each chunk
   - Merge all chunk transcripts into a single complete transcript
   - Store entire transcript in system prompt without summarization

4. **Storage & Caching**
   - Cache transcripts in downloads folder as a json file.
    - video_id -> transcript
   - Reuse cached transcripts to avoid re-transcription
   - Store until storage limits are reached
   - No special indexing or retrieval system needed
   - Allow user to change location of the cache.

5. **Source**
   - Rely solely on Whisper for transcription

### Process:
This should be done with a script of some sort. Python is probably the best choice. 

Usage:
  1) Take the youtube url, provided api key, and destination folder.
  2) The script downloads the audio (webm), checks size, splits/chunks if necessary
  3) The script transcribes each chunk, merges, and writes the final transcript out.
  4) Place transcript wherever you wish (maybe a .json file that includes
     the video_id -> transcript). Downloads folder is probably the best choice. but allow user to change location.

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
1. User enables "Interact Mode" toggle in the extension icon context menu
3. Chat UI opens to the right of the video, as a live chat would be.
4. User can type messages and receive AI responses while referencing video content
5. Entire conversation remains in context for follow-up questions

## Options in Chrome's extension icon context menu
- Enable/disable toggle
- text input for api key (in the context menu not a seperate page)

## User Interface
The UI features a React component that replicates YouTube's native live chat interface. Key components and implementation details:

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
