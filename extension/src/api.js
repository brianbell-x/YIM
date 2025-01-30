// extension/src/api.js

export async function callOpenAIChat(systemPrompt, conversationMessages, model) {
  // 1) read key from storage
  const openaiKey = await getApiKey();
  if (!openaiKey) {
    throw new Error("OpenAI API key not found. Please set it in the extension options.");
  }

  // 2) build messages array
  //    developer message for system instructions
  const developerMessage = {
    role: "developer",
    content: systemPrompt
  };

  // user & assistant messages
  const userAssistantMessages = conversationMessages.map(m => {
    return {
      role: m.role,
      content: m.content
    };
  });

  // 3) call the /v1/chat/completions endpoint
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: model,
    messages: [developerMessage, ...userAssistantMessages],
    max_tokens: 512,
    temperature: 0.7
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openaiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errText}`);
  }

  const json = await response.json();
  const assistantMessage = json.choices?.[0]?.message?.content || "";
  return assistantMessage.trim();
}

async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get("openaiKey", (res) => {
      resolve(res.openaiKey || null);
    });
  });
} 