import React, { useState } from "react";
import { callOpenAIChat } from "../api";

export default function ChatPanel({ videoId, transcript }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [model, setModel] = useState("gpt-4o-mini");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const newUserMsg = { role: "user", content: inputText };
    const updated = [...messages, newUserMsg];
    setMessages(updated);
    setInputText("");
    setLoading(true);

    try {
      // System prompt includes the entire transcript
      const systemPrompt = `The user would like to discuss the content of the video. Here is the transcript:\n${transcript}`;
      const response = await callOpenAIChat(systemPrompt, updated, model);
      const assistantMsg = { role: "assistant", content: response };
      setMessages([...updated, assistantMsg]);
    } catch (err) {
      console.error(err);
      alert("Error calling OpenAI API: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleCopy = async () => {
    const conversation = messages.map((m) => {
      return `${m.role.toUpperCase()}: ${m.content}`;
    }).join("\n\n");
    try {
      await navigator.clipboard.writeText(conversation);
      alert("Conversation copied!");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div style={styles.panelContainer}>
      <div style={styles.header}>
        <span>Interact Mode</span>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          style={styles.dropdown}
        >
          <option value="gpt-4o-mini">gpt-4o-mini</option>
          <option value="gpt-4o-2024-11-20">gpt-4o-2024-11-20</option>
        </select>
      </div>

      <div style={styles.messages}>
        {messages.map((m, idx) => (
          <div key={idx}
               style={m.role === "user" ? styles.userBubble : styles.assistantBubble}>
            <strong>{m.role === "user" ? "You" : "Assistant"}: </strong>
            <span>{m.content}</span>
          </div>
        ))}
      </div>

      <div style={styles.inputRow}>
        <input
          type="text"
          placeholder="Type here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={styles.input}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
        />
        <button onClick={handleSend} disabled={loading} style={styles.sendBtn}>
          {loading ? "..." : "Send"}
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={handleClear} style={styles.utilBtn}>Clear</button>
        <button onClick={handleCopy} style={styles.utilBtn}>Copy Conversation</button>
      </div>
    </div>
  );
}

const styles = {
  panelContainer: {
    backgroundColor: "#0f0f0f", // match YT dark theme
    color: "#fff",
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    marginTop: "10px",
    fontFamily: "Arial, sans-serif",
    width: "100%"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    alignItems: "center"
  },
  dropdown: {
    backgroundColor: "#272727",
    color: "#fff",
    border: "1px solid #444",
    padding: "4px"
  },
  messages: {
    maxHeight: "250px",
    overflowY: "auto",
    marginBottom: "8px",
    padding: "4px",
    border: "1px solid #333"
  },
  userBubble: {
    backgroundColor: "#2b2b2b",
    margin: "4px",
    padding: "6px",
    borderRadius: "4px",
    textAlign: "right"
  },
  assistantBubble: {
    backgroundColor: "#1a1a1a",
    margin: "4px",
    padding: "6px",
    borderRadius: "4px"
  },
  inputRow: {
    display: "flex"
  },
  input: {
    flex: 1,
    padding: "6px",
    fontSize: "14px",
    marginRight: "4px",
    backgroundColor: "#272727",
    color: "#fff",
    border: "1px solid #444",
    borderRadius: "4px"
  },
  sendBtn: {
    backgroundColor: "#3ea6ff",
    border: "none",
    color: "#fff",
    borderRadius: "4px",
    padding: "6px 12px",
    cursor: "pointer"
  },
  utilBtn: {
    backgroundColor: "#3ea6ff",
    border: "none",
    color: "#fff",
    borderRadius: "4px",
    padding: "4px 8px",
    marginRight: "8px",
    cursor: "pointer"
  }
}; 