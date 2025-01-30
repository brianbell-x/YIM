// extension/src/App.jsx
import React, { useEffect, useState } from "react";
import { getCurrentVideoId } from "./youtubeHelpers";
import ChatPanel from "./components/ChatPanel";

export default function App() {
  const [videoId, setVideoId] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const vId = getCurrentVideoId();
    setVideoId(vId);

    // Check if we have a transcript cached in localStorage
    // For bigger transcripts, prefer indexedDB
    const local = window.localStorage.getItem(`transcript_${vId}`);
    if (local) {
      setTranscript(local);
      setLoading(false);
    } else {
      // no transcript found, show "not found" message
      setTranscript("");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div style={{ color: "#ccc", padding: "8px" }}>Loading transcript...</div>;
  }

  if (!transcript) {
    return (
      <div style={{ color: "#ccc", padding: "8px" }}>
        <strong>No transcript found for this video.</strong>
        <p>Use the Python script to download &amp; transcribe, then copy the output here:</p>
        <textarea
          rows={5}
          cols={40}
          placeholder="Paste transcript here..."
          onBlur={(e) => {
            // Save it
            const text = e.target.value;
            if (text.trim()) {
              window.localStorage.setItem(`transcript_${videoId}`, text.trim());
              setTranscript(text.trim());
            }
          }}
        />
      </div>
    );
  }

  // Show the chat panel
  return <ChatPanel videoId={videoId} transcript={transcript} />;
} 