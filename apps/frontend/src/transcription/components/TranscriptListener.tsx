import { useEffect, useState } from "react";

type TranscriptItem = {
  text: string;
  speaker: string;
}; 

const TranscriptListener = () => {
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3000");

    socket.onopen = () => {
      console.log("Connected to transcript WebSocket");
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "transcription") {
        console.log("📡 Transcript received from backend via WebSocket!");
        try {
          // Handle transcription result directly
          setTranscripts(prev => [...prev, { text: data.text, speaker: data.speaker }]);
          setLastUpdated(new Date().toLocaleTimeString());
        } catch (err) {
          console.error("Failed to process transcription:", err);
        }
      }
    };

    return () => {
      socket.close();
    };
  }, []);

    const getSpeakerTag = (role: string) => {
    if (!role) return "[Participant]";
    const lower = role.toLowerCase();
    return lower === "host" ? "[Host]" : "[Participant]";
  };


  return (
    <div style={{
      maxWidth: "600px",
      margin: "2rem auto",
      padding: "1.5rem",
      borderRadius: "12px",
      boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      backgroundColor: "#fff"
    }}>
      <h2 style={{ color: "#4f46e5" }}>🧾 Live Transcript Feed</h2>
      {transcripts.length === 0 ? (
        <p style={{ marginTop: "1rem", color: "#333" }}>Waiting for transcript...</p>
      ) : (
        transcripts.map((item, index) => (
          <p key={index} style={{ marginTop: "0.5rem", color: "#333" }}>
            <strong>{getSpeakerTag(item.speaker)}</strong> {item.text}
          </p>
        ))
      )}
      {lastUpdated && (
        <p style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#666" }}>
          Last Updated: {lastUpdated}
        </p>
      )}
    </div>
  );
};

export default TranscriptListener;
