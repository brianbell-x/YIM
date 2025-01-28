# Youtube Interact Mode

## Overview
An AI chat assistant with the YouTube video's transcript in its context. As a Chrome extension.

## Transcription Process
The YouTube video will need to be transcribed using Whisper. The process involves chunking the video, transcribing each chunk, and then merging the transcripts. The storage location for the videos is yet to be determined. One suggestion is to download the video once and store a cache of the transcript to avoid re-transcription delays for the user.

## Text Mode
- Users interact with the assistant similar to ChatGPT
- Incorporates the YouTube video's transcript in its system prompt
- Enables users to:
  - Ask questions about the video content
  - Delve deeper into topics
  - Pose follow-up questions
  - Explore topics in depth through text-based conversation
- Simple ChatGPT-like UI with an input box, a button to send messages, and a display area for the conversation history. (inside the expander)
- Support model selection:
  - gpt-4o-mini
  - gpt-4o-2024-11-20
- Docs for text generation/ chat completion can be found in `docs\OpenAITextGeneration.md`

## Voice Mode
- sound/voice icon to the right of the input box to initiate voice mode
- Users engage with the assistant in real-time using OpenAI's Realtime API
- Functions as a voice assistant with:
  - Real-time voice interaction capabilities
  - Integration of video transcript in system prompt
  - Ability to answer questions and explore topics through voice conversation
- Utilizes OpenAI's Realtime API for chat capabilities. Docs found in `docs\OpenAiRealtimeAPI.md`
- Supports model selection:
  - gpt-4o-realtime-preview-2024-12-17
  - gpt-4o-mini-realtime-preview-2024-12-17
- if there are messages in the conversation history, the assistant will resume from the last message.

## Extension Features
- Enable/disable the extension
- Set an OpenAI API key
- Select between text and voice modes

## User Interface
The UI will feature a Youtube native button labeled "Interact" Upon clicking:
- The video will pause
- A new expander element will be created to display:
  - Loading indicators while the model loads
  - For voice mode: A simple voice animation that moves a line when the user is speaking
  - A button to pause/resume the assistant
- it is importtant to mimic the Youtube UI as closely as possible. A Sample Description Expander can be found in the `docs\SampleYoutubeDescriptionExpander.html` file.
