# YouTube Interact Mode

A Chrome extension that adds an AI-powered chat interface to YouTube videos, allowing you to discuss video content with an AI assistant that has access to the video's transcript.

## Features

- Toggle Interact Mode via extension icon or context menu
- Chat interface integrated into YouTube's video page
- OpenAI API integration for intelligent responses
- Video transcript support via Whisper API
- Transcript caching for efficiency
- Modern, YouTube-themed UI
- Multiple AI model options

## Installation

### 1. Chrome Extension Setup

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd youtube-interact-mode
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `youtube-interact-mode` directory

### 2. Python Script Setup (for transcription)

1. Install Python dependencies:
   ```bash
   cd scripts
   pip install -r requirements.txt
   ```

2. Make sure you have ffmpeg installed:
   - Windows: Install via [chocolatey](https://chocolatey.org/): `choco install ffmpeg`
   - Mac: Install via homebrew: `brew install ffmpeg`
   - Linux: `sudo apt-get install ffmpeg`

### 3. Native Messaging Host Setup

1. Install the native messaging host:
   ```bash
   # On Windows
   REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.youtube.interact.transcript" /ve /t REG_SZ /d "%~dp0scripts\com.youtube.interact.transcript.json" /f

   # On Linux/macOS
   mkdir -p ~/.config/google-chrome/NativeMessagingHosts
   ln -s "$(pwd)/scripts/com.youtube.interact.transcript.json" ~/.config/google-chrome/NativeMessagingHosts/
   ```

2. Update the extension ID:
   - After loading the extension in Chrome, get its ID from chrome://extensions
   - Replace `<extension-id>` in `scripts/com.youtube.interact.transcript.json` with your extension's ID

## Usage

1. **Set up your OpenAI API key**:
   - Click the extension icon
   - Enter your OpenAI API key in the popup
   - Click "Save API Key"

2. **Enable Interact Mode**:
   - Right-click the extension icon and select "Enable Interact Mode"
   - OR use the toggle in the extension popup

3. **Get video transcripts**:
   ```bash
   cd scripts
   python transcribe.py "https://www.youtube.com/watch?v=VIDEO_ID" --api-key "your-openai-api-key"
   ```
   The transcript will be cached for future use.

4. **Chat with the AI**:
   - Go to any YouTube video
   - You'll see the chat interface above the video description
   - Type your questions or comments about the video
   - The AI will respond with context from the video's transcript

## Development

- For development with hot reloading:
  ```bash
  npm run dev
  ```

- The extension uses:
  - React for the UI
  - Webpack for bundling
  - OpenAI's API for chat
  - Whisper API for transcription
  - YouTube-DLP for video download

## Configuration

- Models can be selected in the chat interface
- Transcripts are cached in `scripts/cache/transcripts_cache.json`
- Extension settings are stored in Chrome's sync storage

## Troubleshooting

1. **Chat UI not appearing**:
   - Make sure Interact Mode is enabled
   - Refresh the YouTube page
   - Check the console for errors

2. **Transcription issues**:
   - Verify your OpenAI API key
   - Ensure ffmpeg is installed
   - Check the Python script's output for errors

3. **API errors**:
   - Verify your API key in the extension popup
   - Check your OpenAI account credits/limits
   - Look for error messages in the chat interface

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use and modify as needed.

## Credits

- OpenAI for the Chat and Whisper APIs
- YouTube-DLP for video download capabilities
- React for the UI framework 