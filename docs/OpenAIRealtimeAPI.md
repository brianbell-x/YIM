# Realtime API with WebSockets

**Beta**

## Overview

[WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API) are a broadly supported API for realtime data transfer, and a great choice for connecting to the OpenAI Realtime API in server-to-server applications. For browser and mobile clients, we recommend connecting via [WebRTC](/docs/guides/realtime-webrtc). Follow this guide to connect to the Realtime API via WebSocket and start interacting with a Realtime model.

In a server-to-server integration with Realtime, your backend system will connect via WebSocket directly to the Realtime API. You can use a [standard API key](/settings/organization/api-keys) to authenticate this connection, since the token will only be available on your secure backend server.

![connect directly to realtime API](https://openaidevs.retool.com/api/file/464d4334-c467-4862-901b-d0c6847f003a)

WebSocket connections can also be authenticated with an ephemeral client token ([as shown here in the WebRTC connection guide](/docs/guides/realtime-webrtc)) if you choose to connect to the Realtime API via WebSocket on a client device.

> **Important:** Standard OpenAI API tokens **should only be used in secure server-side environments**.

---

## Connection details

Connecting via WebSocket requires the following connection information:

| **Item**       | **Value**                                                                    |
|----------------|------------------------------------------------------------------------------|
| **URL**        | `wss://api.openai.com/v1/realtime`                                           |
| **Query Parameters** | `model` - Realtime model ID to connect to, like `gpt-4o-realtime-preview-2024-12-17` |
| **Headers**    | **Authorization:** `Bearer YOUR_API_KEY`<br>_(Substitute `YOUR_API_KEY` with a standard API key on the server, or an ephemeral token on insecure clients (note that WebRTC is recommended for this use case).)_<br><br>**OpenAI-Beta:** `realtime=v1`<br>_(This header is required during the beta period.)_ |

Below are several examples of using these connection details to initialize a WebSocket connection to the Realtime API.

### ws module (Node.js)

**Connect using the ws module (Node.js)**

```js
import WebSocket from "ws";

const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";
const ws = new WebSocket(url, {
  headers: {
    "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
    "OpenAI-Beta": "realtime=v1",
  },
});

ws.on("open", function open() {
  console.log("Connected to server.");
});

ws.on("message", function incoming(message) {
  console.log(JSON.parse(message.toString()));
});
```

### websocket-client (Python)

**Connect with websocket-client (Python)**

```python
# example requires websocket-client library:
# pip install websocket-client

import os
import json
import websocket

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")

url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17"
headers = [
    "Authorization: Bearer " + OPENAI_API_KEY,
    "OpenAI-Beta: realtime=v1"
]

def on_open(ws):
    print("Connected to server.")

def on_message(ws, message):
    data = json.loads(message)
    print("Received event:", json.dumps(data, indent=2))

ws = websocket.WebSocketApp(
    url,
    header=headers,
    on_open=on_open,
    on_message=on_message,
)

ws.run_forever()
```

### WebSocket (browsers)

**Connect with standard WebSocket (browsers)**

```js
/*
Note that in client-side environments like web browsers, we recommend
using WebRTC instead. It is possible, however, to use the standard 
WebSocket interface in browser-like environments like Deno and 
Cloudflare Workers.
*/

const ws = new WebSocket(
  "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17",
  [
    "realtime",
    // Auth
    "openai-insecure-api-key." + OPENAI_API_KEY, 
    // Optional
    "openai-organization." + OPENAI_ORG_ID,
    "openai-project." + OPENAI_PROJECT_ID,
    // Beta protocol, required
    "openai-beta.realtime-v1"
  ]
);

ws.on("open", function open() {
  console.log("Connected to server.");
});

ws.on("message", function incoming(message) {
  console.log(message.data);
});
```

---

## Sending and receiving events

To interact with the Realtime models, you will send and receive messages over the WebSocket interface. The full list of messages that clients can send, and that will be sent from the server, are found in the [API reference](/docs/api-reference/realtime-client-events). Once connected, you'll send and receive events which represent text, audio, function calls, interruptions, configuration updates, and more.

Below, you'll find examples of how to send and receive events over the WebSocket interface in several programming environments.

### WebSocket (Node.js / browser)

**Send and receive events on a WebSocket (Node.js / browser)**

```js
// Server-sent events will come in as messages...
ws.on("message", function incoming(message) {
  // Message data payloads will need to be parsed from JSON:
  const serverEvent = JSON.parse(message.data)
  console.log(serverEvent);
});

// To send events, create a JSON-serializeable data structure that
// matches a client-side event (see API reference)
const event = {
  type: "response.create",
  response: {
    modalities: ["audio", "text"],
    instructions: "Give me a haiku about code.",
  }
};
ws.send(JSON.stringify(event));
```

### websocket-client (Python)

**Send and receive messages with websocket-client (Python)**

```python
# To send a client event, serialize a dictionary to JSON
# of the proper event type
def on_open(ws):
    print("Connected to server.")
    
    event = {
        "type": "response.create",
        "response": {
            "modalities": ["text"],
            "instructions": "Please assist the user."
        }
    }
    ws.send(json.dumps(event))

# Receiving messages will require parsing message payloads
# from JSON
def on_message(ws, message):
    data = json.loads(message)
    print("Received event:", json.dumps(data, indent=2))
```

---

## Next steps

Now that you have a functioning WebSocket connection to the Realtime API, it's time to learn more about building applications with Realtime models.

- [**Realtime model capabilities**](/docs/guides/realtime-model-capabilities)  
  Learn about sessions with a Realtime model, where you can send and receive audio, manage conversations, make one-off requests to the model, and execute function calls.

- [**Event API reference**](/docs/api-reference/realtime-client-events)  
  A complete listing of client and server events in the Realtime API

---

**Was this page useful?**

---

# Realtime

**Beta**  
Communicate with a GPT-4o class model in real time using WebRTC or WebSockets. Supports text and audio inputs and outputs, along with audio transcriptions. Learn more about the Realtime API.

---

## Session tokens

### REST API endpoint to generate ephemeral session tokens for use in client-side applications.

### Create session

```
POST https://api.openai.com/v1/realtime/sessions
```

Create an ephemeral API token for use in client-side applications with the Realtime API. Can be configured with the same session parameters as the `session.update` client event.

It responds with a session object, plus a `client_secret` key which contains a usable ephemeral API token that can be used to authenticate browser clients for the Realtime API.

**Request body**

| Name                       | Type                            | Description                                                                                                                                                                                                                                                                                                                                                                                                      |
|----------------------------|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **modalities**            | Optional                        | The set of modalities the model can respond with. To disable audio, set this to `["text"]`.                                                                                                                                                                                                                                                                                                                     |
| **model**                 | string (Optional)               | The Realtime model used for this session.                                                                                                                                                                                                                                                                                                                                                                       |
| **instructions**          | string (Optional)               | The default system instructions (i.e. system message) prepended to model calls. This field allows the client to guide the model on desired responses. The model can be instructed on response content and format, (e.g. "be extremely succinct", "act friendly", "here are examples of good responses") and on audio behavior (e.g. "talk quickly", "inject emotion into your voice", "laugh frequently"). The instructions are not guaranteed to be followed by the model, but they provide guidance. |
| **voice**                 | string (Optional)               | The voice the model uses to respond. Voice cannot be changed during the session once the model has responded with audio at least once. Current voice options are `alloy`, `ash`, `ballad`, `coral`, `echo sage`, `shimmer` and `verse`.                                                                                                                                                                        |
| **input_audio_format**    | string (Optional)               | The format of input audio. Options are `pcm16`, `g711_ulaw`, or `g711_alaw`. For `pcm16`, input audio must be 16-bit PCM at a 24kHz sample rate, single channel (mono), and little-endian byte order.                                                                                                                                                                                                            |
| **output_audio_format**   | string (Optional)               | The format of output audio. Options are `pcm16`, `g711_ulaw`, or `g711_alaw`. For `pcm16`, output audio is sampled at a rate of 24kHz.                                                                                                                                                                                                                                                                          |
| **input_audio_transcription** | object (Optional)           | Configuration for input audio transcription, defaults to off and can be set to null to turn off once on. Input audio transcription is not native to the model, since the model consumes audio directly. Transcription runs asynchronously through OpenAI Whisper transcription and should be treated as rough guidance rather than the representation understood by the model. The client can optionally set the language and prompt for transcription. |
| **turn_detection**        | object (Optional)               | Configuration for turn detection. Can be set to null to turn off. Server VAD means that the model will detect the start and end of speech based on audio volume and respond at the end of user speech.                                                                                                                                                                                                          |
| **tools**                 | array (Optional)                | Tools (functions) available to the model.                                                                                                                                                                                                                                                                                                                                                                      |
| **tool_choice**           | string (Optional)               | How the model chooses tools. Options are `auto`, `none`, `required`, or specify a function.                                                                                                                                                                                                                                                                                                                     |
| **temperature**           | number (Optional)               | Sampling temperature for the model, limited to [0.6, 1.2]. Defaults to 0.8.                                                                                                                                                                                                                                                                                                                                     |
| **max_response_output_tokens** | integer or `"inf"` (Optional) | Maximum number of output tokens for a single assistant response, inclusive of tool calls. Provide an integer between 1 and 4096 to limit output tokens, or `inf` for the maximum available tokens for a given model. Defaults to `inf`.                                                                                                                                                                        |
| **create_response**       | boolean (Optional)              | Defaults to `true`. Whether or not to automatically generate a response when VAD is enabled. `true` by default.                                                                                                                                                                                                                                                                                                |

---

**Example request**

```bash
curl -X POST https://api.openai.com/v1/realtime/sessions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o-realtime-preview-2024-12-17",
    "modalities": ["audio", "text"],
    "instructions": "You are a friendly assistant."
  }'
```

**Response**

```json
{
  "id": "sess_001",
  "object": "realtime.session",
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "modalities": ["audio", "text"],
  "instructions": "You are a friendly assistant.",
  "voice": "alloy",
  "input_audio_format": "pcm16",
  "output_audio_format": "pcm16",
  "input_audio_transcription": {
      "model": "whisper-1"
  },
  "turn_detection": null,
  "tools": [],
  "tool_choice": "none",
  "temperature": 0.7,
  "max_response_output_tokens": 200,
  "client_secret": {
    "value": "ek_abc123", 
    "expires_at": 1234567890
  }
}
```

---

## The session object

A new Realtime session configuration, with an ephemeral key. Default TTL for keys is one minute.

| **Name**  | **Type** | **Description**                                                                                                                                                                                                              |
|-----------|----------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `client_secret` | object | Ephemeral key returned by the API.                                                                                                                                                                                                   |
| `modalities`    | array  | The set of modalities the model can respond with. To disable audio, set this to `["text"]`.                                                                                                                                          |
| `instructions`  | string | The default system instructions (i.e. system message) prepended to model calls, providing guidance on how the model should respond in terms of style, format, etc.                                                                    |
| `voice`         | string | The voice the model uses to respond. Cannot be changed during the session once the model has responded with audio at least once. Current voice options are `alloy`, `ash`, `ballad`, `coral`, `echo sage`, `shimmer`, and `verse`. |
| `input_audio_format` | string | The format of input audio. Options: `pcm16`, `g711_ulaw`, or `g711_alaw`.                                                                                                                                                                                 |
| `output_audio_format` | string | The format of output audio. Options: `pcm16`, `g711_ulaw`, or `g711_alaw`.                                                                                                                                                                               |
| `input_audio_transcription` | object | Configuration for input audio transcription, defaulting to off and can be set to null to disable once enabled. Includes optional `model`, `language`, `prompt`, etc.                                                                                  |
| `turn_detection`         | object | Configuration for turn detection (voice activity detection). If `null`, turn detection is off.                                                                                                                                                          |
| `tools`                  | array  | Tools (functions) available to the model.                                                                                                                                                                                                              |
| `tool_choice`            | string | How the model chooses tools. Options: `auto`, `none`, `required`, or specify a function.                                                                                                                                                                |
| `temperature`            | number | Sampling temperature for the model, limited to [0.6, 1.2]. Defaults to 0.8.                                                                                                                                                                            |
| `max_response_output_tokens` | integer or `"inf"` | Maximum number of output tokens for a single assistant response, inclusive of tool calls. Default is `inf`.                                                                                                                                      |

### Example session object

```json
{
  "id": "sess_001",
  "object": "realtime.session",
  "model": "gpt-4o-realtime-preview-2024-12-17",
  "modalities": ["audio", "text"],
  "instructions": "You are a friendly assistant.",
  "voice": "alloy",
  "input_audio_format": "pcm16",
  "output_audio_format": "pcm16",
  "input_audio_transcription": {
      "model": "whisper-1"
  },
  "turn_detection": null,
  "tools": [],
  "tool_choice": "none",
  "temperature": 0.7,
  "max_response_output_tokens": 200,
  "client_secret": {
    "value": "ek_abc123", 
    "expires_at": 1234567890
  }
}
```

---

## Client events

---

# Speech to text

Learn how to turn audio into text.

---

## Overview

The Audio API provides two speech to text endpoints, `transcriptions` and `translations`, based on our state-of-the-art open source large-v2 [Whisper model](https://openai.com/blog/whisper/). They can be used to:

- Transcribe audio into whatever language the audio is in.
- Translate and transcribe the audio into English.

File uploads are currently limited to 25 MB and the following input file types are supported: `mp3`, `mp4`, `mpeg`, `mpga`, `m4a`, `wav`, and `webm`.

---

## Quickstart

### Transcriptions

The `transcriptions` API takes as input the audio file you want to transcribe and the desired output file format for the transcription of the audio. We currently support multiple input and output file formats.

#### Transcribe audio

```js
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/audio.mp3"),
  model: "whisper-1",
});

console.log(transcription.text);
```

```python
from openai import OpenAI
client = OpenAI()

audio_file= open("/path/to/file/audio.mp3", "rb")
transcription = client.audio.transcriptions.create(
    model="whisper-1", 
    file=audio_file
)

print(transcription.text)
```

```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/audio.mp3 \
  --form model=whisper-1
```

By default, the response type will be JSON with the raw text included:

```json
{
  "text": "Imagine the wildest idea that you've ever had, and you're curious about how it might scale to something that's a 100, a 1,000 times bigger. ..."
}
```

The Audio API also allows you to set additional parameters in a request. For example, if you want to set the `response_format` as `text`, your request would look like the following:

#### Additional options

```js
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/speech.mp3"),
  model: "whisper-1",
  response_format: "text",
});

console.log(transcription.text);
```

```python
from openai import OpenAI
client = OpenAI()

audio_file = open("/path/to/file/speech.mp3", "rb")
transcription = client.audio.transcriptions.create(
    model="whisper-1", 
    file=audio_file, 
    response_format="text"
)

print(transcription.text)
```

```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/transcriptions \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/speech.mp3 \
  --form model=whisper-1 \
  --form response_format=text
```

The [API Reference](/docs/api-reference/audio) includes the full list of available parameters.

### Translations

The `translations` API takes as input the audio file in any of the supported languages and transcribes, if necessary, the audio into English. This differs from our `/transcriptions` endpoint since the output is not in the original input language and is instead translated to English text.

#### Translate audio

```js
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.translations.create({
  file: fs.createReadStream("/path/to/file/german.mp3"),
  model: "whisper-1",
});

console.log(transcription.text);
```

```python
from openai import OpenAI
client = OpenAI()

audio_file = open("/path/to/file/german.mp3", "rb")
transcription = client.audio.translations.create(
    model="whisper-1", 
    file=audio_file,
)

print(transcription.text)
```

```bash
curl --request POST \
  --url https://api.openai.com/v1/audio/translations \
  --header "Authorization: Bearer $OPENAI_API_KEY" \
  --header 'Content-Type: multipart/form-data' \
  --form file=@/path/to/file/german.mp3 \
  --form model=whisper-1
```

In this case, the inputted audio was German and the outputted text might look like:

```
Hello, my name is Wolfgang and I come from Germany. Where are you heading today?
```

We only support translation into English at this time.

---

## Supported languages

We currently [support the following languages](https://github.com/openai/whisper#available-models-and-languages) through both the `transcriptions` and `translations` endpoint:

Afrikaans, Arabic, Armenian, Azerbaijani, Belarusian, Bosnian, Bulgarian, Catalan, Chinese, Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, Galician, German, Greek, Hebrew, Hindi, Hungarian, Icelandic, Indonesian, Italian, Japanese, Kannada, Kazakh, Korean, Latvian, Lithuanian, Macedonian, Malay, Marathi, Maori, Nepali, Norwegian, Persian, Polish, Portuguese, Romanian, Russian, Serbian, Slovak, Slovenian, Spanish, Swahili, Swedish, Tagalog, Tamil, Thai, Turkish, Ukrainian, Urdu, Vietnamese, and Welsh.

While the underlying model was trained on 98 languages, we only list the languages that exceeded <50% [word error rate](https://en.wikipedia.org/wiki/Word_error_rate) (WER) which is an industry standard benchmark for speech to text model accuracy. The model will return results for languages not listed above but the quality may be lower.

---

## Timestamps

By default, the Whisper API will output a transcript of the provided audio in text. The [`timestamp_granularities[]` parameter](/docs/api-reference/audio/createTranscription#audio-createtranscription-timestamp_granularities) enables a more structured and timestamped JSON output format, with timestamps at the segment, word level, or both. This enables word-level precision for transcripts and video edits, which allows for the removal of specific frames tied to individual words.

#### Timestamp options

```js
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("audio.mp3"),
  model: "whisper-1",
  response_format: "verbose_json",
  timestamp_granularities: ["word"]
});

console.log(transcription.words);
```

```python
from openai import OpenAI
client = OpenAI()

audio_file = open("/path/to/file/speech.mp3", "rb")
transcription = client.audio.transcriptions.create(
    file=audio_file,
    model="whisper-1",
    response_format="verbose_json",
    timestamp_granularities=["word"]
)

print(transcription.words)
```

```bash
curl https://api.openai.com/v1/audio/transcriptions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: multipart/form-data" \
  -F file="@/path/to/file/audio.mp3" \
  -F "timestamp_granularities[]=word" \
  -F model="whisper-1" \
  -F response_format="verbose_json"
```

---

## Longer inputs

By default, the Whisper API only supports files that are less than 25 MB. If you have an audio file that is longer than that, you will need to break it up into chunks of 25 MB or less, or use a compressed audio format. To get the best performance, we suggest that you avoid breaking the audio up mid-sentence as this may cause some context to be lost.

One way to handle this is to use the [PyDub open source Python package](https://github.com/jiaaro/pydub) to split the audio:

```python
from pydub import AudioSegment

song = AudioSegment.from_mp3("good_morning.mp3")

# PyDub handles time in milliseconds
ten_minutes = 10 * 60 * 1000

first_10_minutes = song[:ten_minutes]

first_10_minutes.export("good_morning_10.mp3", format="mp3")
```

*OpenAI makes no guarantees about the usability or security of 3rd party software like PyDub.*

---

## Prompting

You can use a [prompt](/docs/api-reference/audio/createTranscription#audio/createTranscription-prompt) to improve the quality of the transcripts generated by the Whisper API. The model tries to match the style of the prompt, so it's more likely to use capitalization and punctuation if the prompt does too. However, the current prompting system is more limited than our other language models and provides limited control over the generated audio.

Here are some examples of how prompting can help in different scenarios:

1. **Correcting specific words or acronyms**: For example, a prompt might improve the transcription of `DALL·E` or `GPT-3`.
2. **Preserving context across chunks**: If your audio is split into segments, pass the transcript of the preceding segment in the prompt to improve context. Whisper only considers the final 224 tokens of the prompt.
3. **Enforcing punctuation**: If the model tends to skip punctuation, use a prompt that includes punctuation.
4. **Retaining filler words**: If you want to keep filler words like "umm," "like," etc., include them in the prompt.
5. **Specifying a language style**: For languages that can be written in different ways (e.g., Simplified vs. Traditional Chinese), use a prompt in your preferred writing style.

---

## Improving reliability

One of the most common challenges when using Whisper is the model often does not recognize uncommon words or acronyms. Below are two techniques to improve the reliability of Whisper in these cases:

### 1. Using the prompt parameter

You can pass a list of words or acronyms to the `prompt` parameter. Because it wasn’t trained with instruction-following techniques, Whisper operates more like a base GPT model. Keep in mind that Whisper only considers the first 224 tokens of the prompt.

```js
import fs from "fs";
import OpenAI from "openai";

const openai = new OpenAI();

const transcription = await openai.audio.transcriptions.create({
  file: fs.createReadStream("/path/to/file/speech.mp3"),
  model: "whisper-1",
  response_format: "text",
  prompt: "ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T.",
});

console.log(transcription.text);
```

```python
from openai import OpenAI
client = OpenAI()

audio_file = open("/path/to/file/speech.mp3", "rb")
transcription = client.audio.transcriptions.create(
    model="whisper-1", 
    file=audio_file, 
    response_format="text",
    prompt="ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T."
)

print(transcription.text)
```

This technique is limited by the 224-token limit, so your list of SKUs or unusual words needs to be relatively small to be effective.

### 2. Post-processing with GPT-4

The second method involves a post-processing step using GPT-4 or GPT-3.5-Turbo. First, you transcribe the audio with Whisper. Then, you prompt GPT-4 to correct any misspellings based on your known terms.

```js
const systemPrompt = `
You are a helpful assistant for the company ZyntriQix. Your task is 
to correct any spelling discrepancies in the transcribed text. Make 
sure that the names of the following products are spelled correctly: 
ZyntriQix, Digique Plus, CynapseFive, VortiQore V8, EchoNix Array, 
OrbitalLink Seven, DigiFractal Matrix, PULSE, RAPT, B.R.I.C.K., 
Q.U.A.R.T.Z., F.L.I.N.T. Only add necessary punctuation such as 
periods, commas, and capitalization, and use only the context provided.
`;

const transcript = await transcribe(audioFile);
const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  temperature: 0,
  messages: [
    {
      role: "system",
      content: systemPrompt
    },
    {
      role: "user",
      content: transcript
    }
  ],
  store: true,
});

console.log(completion.choices[0].message.content);
```
Response format:
```json
{
  "text": "Imagine the wildest idea that you've ever had, and you're curious about how it might scale to something that's a 100, a 1,000 times bigger. This is a place where you can get to do that."
}
```

```python
system_prompt = """
You are a helpful assistant for the company ZyntriQix. Your task is to correct 
any spelling discrepancies in the transcribed text. Make sure that the names of 
the following products are spelled correctly: ZyntriQix, Digique Plus, 
CynapseFive, VortiQore V8, EchoNix Array, OrbitalLink Seven, DigiFractal 
Matrix, PULSE, RAPT, B.R.I.C.K., Q.U.A.R.T.Z., F.L.I.N.T. Only add necessary 
punctuation such as periods, commas, and capitalization, and use only the 
context provided.
"""

def generate_corrected_transcript(temperature, system_prompt, audio_file):
    response = client.chat.completions.create(
        model="gpt-4o",
        temperature=temperature,
        messages=[
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": transcribe(audio_file, "")
            }
        ]
    )
    return response.choices[0].message.content

corrected_text = generate_corrected_transcript(
    0, system_prompt, fake_company_filepath
)
```

Due to its larger context window, GPT-4 is more scalable than using Whisper’s prompt parameter alone. It's also more reliable, as GPT-4 can be instructed and guided in ways that aren't possible with Whisper.
