# Text generation

Learn how to generate text from a prompt.

OpenAI provides simple APIs to use a [large language model](/docs/models) to generate text from a prompt, as you might using [ChatGPT](https://chatgpt.com). These models have been trained on vast quantities of data to understand multimedia inputs and natural language instructions. From these [prompts](/docs/guides/prompt-engineering), models can generate almost any kind of text response, like code, mathematical equations, structured JSON data, or human-like prose.

---

## Quickstart

To generate text, you can use the [chat completions endpoint](/docs/api-reference/chat/) in the REST API, as seen in the examples below. You can either use the [REST API](/docs/api-reference) from the HTTP client of your choice, or use one of OpenAI's [official SDKs](/docs/libraries) for your preferred programming language.

### Generate prose

Create a human-like response to a prompt

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        { role: "developer", content: "You are a helpful assistant." },
        {
            role: "user",
            content: "Write a haiku about recursion in programming.",
        },
    ],
    store: true,
});

console.log(completion.choices[0].message);
```

```python
from openai import OpenAI
client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {"role": "developer", "content": "You are a helpful assistant."},
        {
            "role": "user",
            "content": "Write a haiku about recursion in programming."
        }
    ]
)

print(completion.choices[0].message)
```

```bash
curl "https://api.openai.com/v1/chat/completions" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d '{
        "model": "gpt-4o",
        "messages": [
            {
                "role": "developer",
                "content": "You are a helpful assistant."
            },
            {
                "role": "user",
                "content": "Write a haiku about recursion in programming."
            }
        ]
    }'
```

### Analyze an image

Describe the contents of an image

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
        {
            role: "user",
            content: [
                { type: "text", text: "What's in this image?" },
                {
                    type: "image_url",
                    image_url: {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
                    },
                }
            ],
        },
    ],
    store: true,
});

console.log(completion.choices[0].message);
```

```python
from openai import OpenAI

client = OpenAI()

completion = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What's in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg",
                    }
                },
            ],
        }
    ],
)

print(completion.choices[0].message)
```

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "type": "text",
            "text": "What is in this image?"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
            }
          }
        ]
      }
    ]
  }'
```

### Generate JSON data

Generate JSON data based on a JSON Schema

```javascript
import OpenAI from "openai";
const openai = new OpenAI();

const completion = await openai.chat.completions.create({
    model: "gpt-4o-2024-08-06",
    messages: [
        { role: "developer", content: "You extract email addresses into JSON data." },
        {
            role: "user",
            content: "Feeling stuck? Send a message to help@mycompany.com.",
        },
    ],
    response_format: {
        // See /docs/guides/structured-outputs
        type: "json_schema",
        json_schema: {
            name: "email_schema",
            schema: {
                type: "object",
                properties: {
                    email: {
                        description: "The email address that appears in the input",
                        type: "string"
                    }
                },
                additionalProperties: false
            }
        }
    },
    store: true,
});

console.log(completion.choices[0].message.content);
```

```python
from openai import OpenAI
client = OpenAI()

response = client.chat.completions.create(
    model="gpt-4o-2024-08-06",
    messages=[
        {
            "role": "developer", 
            "content": "You extract email addresses into JSON data."
        },
        {
            "role": "user", 
            "content": "Feeling stuck? Send a message to help@mycompany.com."
        }
    ],
    response_format={
        "type": "json_schema",
        "json_schema": {
            "name": "email_schema",
            "schema": {
                "type": "object",
                "properties": {
                    "email": {
                        "description": "The email address that appears in the input",
                        "type": "string"
                    },
                    "additionalProperties": False
                }
            }
        }
    }
)

print(response.choices[0].message.content);
```

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o-2024-08-06",
    "messages": [
      {
        "role": "developer",
        "content": "You extract email addresses into JSON data."
      },
      {
        "role": "user",
        "content": "Feeling stuck? Send a message to help@mycompany.com."
      }
    ],
    "response_format": {
      "type": "json_schema",
      "json_schema": {
        "name": "email_schema",
        "schema": {
            "type": "object",
            "properties": {
                "email": {
                    "description": "The email address that appears in the input",
                    "type": "string"
                }
            },
            "additionalProperties": false
        }
      }
    }
  }'
```

---

## Choosing a model

When making a text generation request, your first decision is which [model](/docs/models) you want to generate the response. The model you choose influences output and impacts [cost](https://openai.com/api/pricing/).

- A **large model** like [`gpt-4o`](/docs/models#gpt-4o) offers a very high level of intelligence and strong performance, with higher cost per token.
- A **small model** like [`gpt-4o-mini`](/docs/models#gpt-4o-mini) offers intelligence not quite on the level of the larger model, but it's faster and less expensive per token.
- A **reasoning model** like [the `o1` family of models](/docs/models#o1) is slower to return a result, and uses more tokens to "think," but is capable of advanced reasoning, coding, and multi-step planning.

Experiment with different models [in the Playground](/playground) to see which works best for your prompts! You might also benefit from our [model selection best practices](/docs/guides/model-selection).

---

## Building prompts

The process of crafting prompts to get the right output from a model is called **prompt engineering**. You can improve output by giving the model precise instructions, examples, and necessary context information—like private or specialized information not included in the model's training data.

Below is high-level guidance on building prompts. For more in-depth strategies and tactics, see the [prompt engineering guide](/docs/guides/prompt-engineering).

### Messages and roles

In the [chat completions API](/docs/api-reference/chat/), you create prompts by providing an array of `messages` that contain instructions for the model. Each message can have a different `role`, which influences how the model might interpret the input.

| **Role**    | **Description**                                                                                                                                                  | **Example**                                                                                                                                                                                                                                                         |
|-------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **user**    | Instructions that request some output from the model. Similar to messages you'd type in ChatGPT as an end user.                                                  | Pass your end-user's message to the model.<br>Write a haiku about programming.                                                                                                                                                                                       |
| **developer** | Instructions to the model that are prioritized ahead of user messages, following chain of command. Previously called the system prompt.                         | Describe how the model should generally behave and respond.<br>You are a helpful assistant<br>that answers programming<br>questions in the style of a<br>southern belle from the<br>southeast United States.<br>Now, any response to a user message should have a southern belle tone. |
| **assistant** | A message generated by the model, perhaps in a previous generation request (see the "Conversations" section below).                                            | Provide examples to the model for how it should respond to the current request. For example, to get a model to respond correctly to knock-knock jokes, you might provide a full back-and-forth dialogue of a knock-knock joke.                                        |

Message roles may help you get better responses, especially if you want a model to follow hierarchical instructions. They're not deterministic, so the best way to use them is just trying things and seeing what gives you good results.

Here's an example of a developer message that modifies the behavior of the model when generating a response to a `user` message:

```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      "role": "developer",
      "content": [
        {
          "type": "text",
          "text": `
            You are a helpful assistant that answers programming 
            questions in the style of a southern belle from the 
            southeast United States.
          `
        }
      ]
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Are semicolons optional in JavaScript?"
        }
      ]
    }
  ],
  store: true,
});
```

This prompt returns a text output in the rhetorical style requested:

```
Well, sugar, that's a fine question you've got there! Now, in the 
world of JavaScript, semicolons are indeed a bit like the pearls 
on a necklace – you might slip by without 'em, but you sure do look 
more polished with 'em in place. 

Technically, JavaScript has this little thing called "automatic 
semicolon insertion" where it kindly adds semicolons for you 
where it thinks they oughta go. However, it's not always perfect, 
bless its heart. Sometimes, it might get a tad confused and cause 
all sorts of unexpected behavior.
```

### Giving the model additional data to use for generation

You can also use the message types above to provide additional information to the model, outside of its training data. You might want to include the results of a database query, a text document, or other resources to help the model generate a relevant response. This technique is often referred to as **retrieval augmented generation**, or RAG. [Learn more about RAG techniques](https://help.openai.com/en/articles/8868588-retrieval-augmented-generation-rag-and-semantic-search-for-gpts).

---

## Conversations and context

While each text generation request is independent and stateless (unless you're using [assistants](/docs/assistants/overview)), you can still implement **multi-turn conversations** by providing additional messages as parameters to your text generation request. Consider a "knock knock" joke:

```javascript
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  messages: [
    {
      "role": "user",
      "content": [{ "type": "text", "text": "knock knock." }]
    },
    {
      "role": "assistant",
      "content": [{ "type": "text", "text": "Who's there?" }]
    },
    {
      "role": "user",
      "content": [{ "type": "text", "text": "Orange." }]
    }
  ],
  store: true,
});
```

By using alternating `user` and `assistant` messages, you capture the previous state of a conversation in one request to the model.

### Managing context for text generation

As your inputs become more complex, or you include more turns in a conversation, you'll need to consider both **output token** and **context window** limits. Model inputs and outputs are metered in [**tokens**](https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them), which are parsed from inputs to analyze their content and intent and assembled to render logical outputs. Models have limits on token usage during the lifecycle of a text generation request.

- **Output tokens** are the tokens generated by a model in response to a prompt. Each model has different [limits for output tokens](/docs/models). For example, `gpt-4o-2024-08-06` can generate a maximum of 16,384 output tokens.
- A **context window** describes the total tokens that can be used for both input and output tokens (and for some models, [reasoning tokens](/docs/guides/reasoning)). Compare the [context window limits](/docs/models) of our models. For example, `gpt-4o-2024-08-06` has a total context window of 128k tokens.

If you create a very large prompt (usually by including a lot of conversation context or additional data/examples for the model), you run the risk of exceeding the allocated context window for a model, which might result in truncated outputs.

Use the [tokenizer tool](/tokenizer), built with the [tiktoken library](https://github.com/openai/tiktoken), to see how many tokens are in a particular string of text.

---

## Optimizing model outputs

As you iterate on your prompts, you'll continually aim to improve **accuracy**, **cost**, and **latency**. Below, find techniques that optimize for each goal.

| **Goal**   | **Definition**                                                                                     | **How to Optimize**                                                                                                                                                                                                                                                                                                          |
|------------|---------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| **Accuracy** | Ensure the model produces accurate and useful responses to your prompts.                         | Accurate responses require that the model has all the information it needs to generate a response, and knows how to go about creating a response (from interpreting input to formatting and styling). Often, this will require a mix of prompt engineering, RAG, and model fine-tuning.<br>Learn more about optimizing for accuracy. |
| **Cost**     | Drive down total cost of using models by reducing token usage and using cheaper models when possible. | To control costs, you can try to use fewer tokens or smaller, cheaper models.<br>Learn more about optimizing for cost.                                                                                                                                                                                                         |
| **Latency**  | Decrease the time it takes to generate responses to your prompts.                                | Optimizing for low latency is a multifaceted process including prompt engineering and parallelism in your own code.<br>Learn more about optimizing for latency.                                                                                                                                                               |

---

## Next steps

There’s much more to explore in text generation. Here are a few resources to go even deeper.

- [**Prompt examples**](/docs/examples)  
  Get inspired by example prompts for a variety of use cases.

- [**Build a prompt in the Playground**](/playground)  
  Use the Playground to develop and iterate on prompts.

- [**Browse the Cookbook**](https://cookbook.openai.com)  
  The Cookbook has complex examples covering a variety of use cases.

- [**Generate JSON data with Structured Outputs**](/docs/guides/structured-outputs)  
  Ensure JSON data emitted from a model conforms to a JSON schema.

- [**Full API reference**](/docs/api-reference/chat)  
  Check out all the options for text generation in the API reference.

---

Was this page useful?

---

# Chat

Given a list of messages comprising a conversation, the model will return a response.  
Related guide: [Chat Completions](/docs/api-reference/chat)

---

## Create chat completion

**POST**  
`https://api.openai.com/v1/chat/completions`

Creates a model response for the given chat conversation. Learn more in the text generation, vision, and audio guides.

Parameter support can differ depending on the model used to generate the response, particularly for newer reasoning models. Parameters that are only supported for reasoning models are noted below. For the current state of unsupported parameters in reasoning models, refer to the reasoning guide.

### Request body

- **messages** (array) **Required**  
  A list of messages comprising the conversation so far. Depending on the model you use, different message types (modalities) are supported, like text, images, and audio.

  #### Possible types:

  1. **Developer message** (object)  
     Developer-provided instructions that the model should follow, regardless of messages sent by the user. With o1 models and newer, developer messages replace the previous system messages.

     **Properties**  
     - **content** (string or array) **Required**  
       The contents of the developer message.
     - **role** (string) **Required**  
       The role of the message’s author, in this case `developer`.
     - **name** (string) *Optional*  
       An optional name for the participant. Provides the model information to differentiate between participants of the same role.

  2. **System message** (object)  
     Developer-provided instructions that the model should follow, regardless of messages sent by the user. With o1 models and newer, use developer messages for this purpose instead.

     **Properties**  
     - **content** (string or array) **Required**  
       The contents of the system message.
     - **role** (string) **Required**  
       The role of the message’s author, in this case `system`.
     - **name** (string) *Optional*  
       An optional name for the participant. Provides the model information to differentiate between participants of the same role.

  3. **User message** (object)  
     Messages sent by an end user, containing prompts or additional context information.

     **Properties**  
     - **content** (string or array) **Required**  
       The contents of the user message.

       Possible types:  
       - **Text content** (string)  
         The text contents of the message.  
       - **Array of content parts** (array)  
         An array of content parts with a defined type. Supported options differ based on the model being used to generate the response. Can contain text, image, or audio inputs.

         **Possible content part types**:
         - **Text content part** (object)  
           *Properties*:  
           - **type** (string) **Required**  
           - **text** (string) **Required**

         - **Image content part** (object)  
           *Properties*:  
           - **type** (string) **Required**  
           - **image_url** (object) **Required**  
             *Properties*:  
             - **url** (string) **Required**  
             - **detail** (string) *Optional* (defaults to `auto`)

         - **Audio content part** (object)  
           *Properties*:  
           - **type** (string) **Required**  
           - **input_audio** (object) **Required**  
             *Properties*:  
             - **data** (string) **Required** (base64 encoded audio data)  
             - **format** (string) **Required** (currently supports `"wav"` or `"mp3"`)

     - **role** (string) **Required**  
       The role of the message’s author, in this case `user`.
     - **name** (string) *Optional*  
       An optional name for the participant. Provides the model information to differentiate between participants of the same role.

  4. **Assistant message** (object)  
     Messages sent by the model in response to user messages.

     **Properties**  
     - **content** (string or array) *Optional*  
       The contents of the assistant message. Required unless `tool_calls` or `function_call` is specified.

       Possible content types:
       - **Text content** (string)  
         The contents of the assistant message.
       - **Array of content parts** (array)  
         An array of content parts with a defined type. Can be one or more of type `text`, or exactly one of type `refusal`.

         *Possible types*:
         - **Text content part** (object)  
           - **type** (string) **Required**  
           - **text** (string) **Required**
         - **Refusal content part** (object)  
           - **type** (string) **Required**  
           - **refusal** (string) **Required**

     - **refusal** (string or null) *Optional*  
       The refusal message by the assistant.
     - **role** (string) **Required**  
       The role of the message’s author, in this case `assistant`.
     - **name** (string) *Optional*  
       An optional name for the participant. Provides the model information to differentiate between participants of the same role.
     - **audio** (object or null) *Optional*  
       Data about a previous audio response from the model.
       - **id** (string) **Required**  
         Unique identifier for a previous audio response from the model.
     - **tool_calls** (array) *Optional*  
       The tool calls generated by the model, such as function calls.

       *Properties*:
       - **id** (string) **Required**  
         The ID of the tool call.
       - **type** (string) **Required**  
         The type of the tool. Currently, only `function` is supported.
       - **function** (object) **Required**  
         *Properties*:  
         - **name** (string) **Required**  
         - **arguments** (string) **Required** (in JSON format)

     - **function_call** (*Deprecated*, object or null) *Optional*  
       Deprecated and replaced by `tool_calls`. The name and arguments of a function that should be called, as generated by the model.

       *Properties*:
       - **arguments** (string) **Required**  
       - **name** (string) **Required**

  5. **Tool message** (object)  

     **Properties**  
     - **role** (string) **Required** (`tool`)
     - **content** (string or array) **Required**  
       The contents of the tool message.
     - **tool_call_id** (string) **Required**  
       Tool call that this message is responding to.

  6. **Function message** (object) *Deprecated*  

     **Properties**  
     - **role** (string) **Required** (`function`)
     - **content** (string or null) **Required**
     - **name** (string) **Required**

- **model** (string) **Required**  
  ID of the model to use. See the model endpoint compatibility table for details on which models work with the Chat API.

- **store** (boolean or null) *Optional* (defaults to `false`)  
  Whether or not to store the output of this chat completion request for use in our model distillation or evals products.

- **reasoning_effort** (string) *Optional* (defaults to `medium`)  
  **o1 models only**. Constrains effort on reasoning for reasoning models. Currently supported values are `low`, `medium`, and `high`. Reducing reasoning effort can result in faster responses and fewer tokens used on reasoning in a response.

- **metadata** (object or null) *Optional*  
  Developer-defined tags and values used for filtering completions in the dashboard.

- **frequency_penalty** (number or null) *Optional* (defaults to `0`)  
  Number between `-2.0` and `2.0`. Positive values penalize new tokens based on their existing frequency in the text so far, decreasing the model's likelihood to repeat the same line verbatim.

- **logit_bias** (map) *Optional* (defaults to `null`)  
  Modify the likelihood of specified tokens appearing in the completion. Accepts a JSON object that maps tokens (specified by their token ID in the tokenizer) to an associated bias value from `-100` to `100`.

- **logprobs** (boolean or null) *Optional* (defaults to `false`)  
  Whether to return log probabilities of the output tokens or not. If `true`, returns the log probabilities of each output token returned in the content of the message.

- **top_logprobs** (integer or null) *Optional*  
  An integer between `0` and `20` specifying the number of most likely tokens to return at each token position, each with an associated log probability. `logprobs` must be set to `true` if this parameter is used.

- **max_tokens** (*Deprecated*, integer or null) *Optional*  
  The maximum number of tokens that can be generated in the chat completion. This value can be used to control costs for text generated via API.  
  This value is now deprecated in favor of `max_completion_tokens`, and is not compatible with o1 series models.

- **max_completion_tokens** (integer or null) *Optional*  
  An upper bound for the number of tokens that can be generated for a completion, including visible output tokens and reasoning tokens.

- **n** (integer or null) *Optional* (defaults to `1`)  
  How many chat completion choices to generate for each input message. Note that you will be charged based on the number of generated tokens across all of the choices.

- **modalities** (array or null) *Optional*  
  Output types that you would like the model to generate for this request. Most models are capable of generating text, which is the default:  
  `["text"]`

  The `gpt-4o-audio-preview` model can also be used to generate audio. To request that this model generate both text and audio responses, you can use:  
  `["text", "audio"]`

- **prediction** (object) *Optional*  
  Configuration for a Predicted Output, which can greatly improve response times when large parts of the model response are known ahead of time.

  **Possible types**:
  - **Static Content** (object)  
    *Properties*:
    - **type** (string) **Required** (always `content`)
    - **content** (string or array) **Required**  
      The content that should be matched when generating a model response.

- **audio** (object or null) *Optional*  
  Parameters for audio output. Required when audio output is requested with `modalities: ["audio"]`.  

  **Properties**:
  - **voice** (string) **Required**  
    The voice the model uses to respond. Supported voices are `ash`, `ballad`, `coral`, `sage`, and `verse`. (Also supported but not recommended are `alloy`, `echo`, and `shimmer`; these voices are less expressive.)
  - **format** (string) **Required**  
    Specifies the output audio format. Must be one of `wav`, `mp3`, `flac`, `opus`, or `pcm16`.

- **presence_penalty** (number or null) *Optional* (defaults to `0`)  
  Number between `-2.0` and `2.0`. Positive values penalize new tokens based on whether they appear in the text so far, increasing the model's likelihood to talk about new topics.

- **response_format** (object) *Optional*  
  An object specifying the format that the model must output.

  - Setting to `{ "type": "json_schema", "json_schema": {...} }` enables Structured Outputs which ensures the model will match your supplied JSON schema.  
  - Setting to `{ "type": "json_object" }` enables JSON mode, which ensures the message the model generates is valid JSON.

  **Important**: when using JSON mode, you must also instruct the model to produce JSON yourself via a system or user message. Without this, the model may generate an unending stream of whitespace until the generation reaches the token limit.

- **seed** (integer or null) *Optional*  
  This feature is in Beta. If specified, our system will make a best effort to sample deterministically. Determinism is not guaranteed, and you should refer to the `system_fingerprint` response parameter for changes in the backend.

- **service_tier** (string or null) *Optional* (defaults to `auto`)  
  Specifies the latency tier to use for processing the request. Relevant for customers subscribed to the scale tier service.

- **stop** (string / array / null) *Optional* (defaults to `null`)  
  Up to 4 sequences where the API will stop generating further tokens.

- **stream** (boolean or null) *Optional* (defaults to `false`)  
  If set, partial message deltas will be sent, like in ChatGPT. Tokens will be sent as data-only server-sent events as they become available.

- **stream_options** (object or null) *Optional* (defaults to `null`)  
  Options for streaming response. Only set this when you set `stream: true`.  
  - **include_usage** (boolean) *Optional*  
    If set, an additional chunk will be streamed before the `data: [DONE]` message. The `usage` field on this chunk shows the token usage statistics for the entire request.

- **temperature** (number or null) *Optional* (defaults to `1`)  
  What sampling temperature to use, between `0` and `2`. Higher values like `0.8` will make the output more random, while lower values like `0.2` will make it more focused and deterministic.

- **top_p** (number or null) *Optional* (defaults to `1`)  
  An alternative to sampling with temperature, called nucleus sampling, where the model considers the results of the tokens with top_p probability mass.

- **tools** (array) *Optional*  
  A list of tools the model may call. Currently, only functions are supported as a tool. A max of 128 functions are supported.

- **tool_choice** (string or object) *Optional*  
  Controls which (if any) tool is called by the model.  
  - `none` means the model will not call any tool.  
  - `auto` means the model can pick between generating a message or calling one or more tools.  
  - `required` means the model must call one or more tools.  
  - Or specify a particular tool via an object to force the model to call that tool.

  For example:
  ```json
  {
    "type": "function",
    "function": {
      "name": "my_function"
    }
  }
  ```

- **parallel_tool_calls** (boolean) *Optional* (defaults to `true`)  
  Whether to enable parallel function calling during tool use.

- **user** (string) *Optional*  
  A unique identifier representing your end-user, which can help OpenAI to monitor and detect abuse.

- **function_call** (*Deprecated*, string or object) *Optional*  
  Deprecated in favor of `tool_choice`. Controls which (if any) function is called by the model.

- **functions** (*Deprecated*, array) *Optional*  
  Deprecated in favor of `tools`. A list of functions the model may generate JSON inputs for.

---

### Returns

Returns a chat completion object, or a streamed sequence of chat completion chunk objects if the request is streamed.

---

#### Example request

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o",
    "messages": [
      {
        "role": "developer",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello!"
      }
    ]
  }'
```

#### Response

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4o-mini",
  "system_fingerprint": "fp_44709d6fcb",
  "choices": [{
    "index": 0,
    "message": {
      "role": "assistant",
      "content": "\n\nHello there, how may I assist you today?"
    },
    "logprobs": null,
    "finish_reason": "stop"
  }],
  "service_tier": "default",
  "usage": {
    "prompt_tokens": 9,
    "completion_tokens": 12,
    "total_tokens": 21,
    "completion_tokens_details": {
      "reasoning_tokens": 0,
      "accepted_prediction_tokens": 0,
      "rejected_prediction_tokens": 0
    }
  }
}