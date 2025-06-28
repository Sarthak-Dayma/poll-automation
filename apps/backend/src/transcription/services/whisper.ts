import WebSocket from 'ws';
import { connectionStore } from '../websocket/connection';
import { handleWhisperMessage, handleWhisperClose, handleWhisperError } from '../websocket/handlers';

const WHISPER_SERVICE_URL = process.env.WHISPER_SERVICE_URL || 'ws://127.0.0.1:8000';


export const forwardToWhisper = (clientWs: WebSocket, meetingId: string, speaker: string): Promise<void> => {
   try {
  return new Promise((resolve, reject) => {
    console.log(`[WhisperService] Attempting to connect to Whisper service at ${WHISPER_SERVICE_URL} for ${speaker}`);
    const whisperWs = new WebSocket(WHISPER_SERVICE_URL);

    // Add timeout to prevent hanging
    const connectionTimeout = setTimeout(() => {
      console.error(`[WhisperService] Connection timeout for ${speaker}`);
      whisperWs.close();
      reject(new Error('Connection timeout to Whisper service'));
    }, 5000); // 5 second timeout

    whisperWs.onopen = () => {
      clearTimeout(connectionTimeout);
      console.log(`[WhisperService] Connected to Whisper service for ${speaker}.`);
      connectionStore.updateSessionWhisperWs(clientWs, whisperWs);

      const sessionMeta = connectionStore.getSessionMeta(clientWs);

      if (sessionMeta?.audioBuffer?.length) {
        sessionMeta.audioBuffer.forEach((chunk: Buffer) => {
          whisperWs.send(chunk);
        });

        console.log(`[WhisperService] Flushed ${sessionMeta.audioBuffer.length} buffered audio chunks.`);
        sessionMeta.audioBuffer = [];
      }

      const startMessage = JSON.stringify({
        type: 'start',
        meetingId,
        speaker
      });
      whisperWs.send(startMessage);
      resolve();
    };

    whisperWs.onmessage = (event) => {
      handleWhisperMessage(clientWs, event.data.toString());
    };

    whisperWs.onclose = (event) => {
      console.log(`[WhisperService] Whisper WebSocket closed for ${speaker}: ${event.code} - ${event.reason}`);
      handleWhisperClose(clientWs, whisperWs);
      reject(new Error(`Whisper WebSocket closed: ${event.reason}`));
    };

    whisperWs.onerror = (event: any) => {
      clearTimeout(connectionTimeout);
      console.error(`[WhisperService] Whisper WebSocket error for ${speaker}:`, event);
      handleWhisperError(clientWs, event?.error || new Error('Unknown Whisper WebSocket error'));
      reject(event?.error || new Error('Whisper WebSocket connection error'));
    };
  });
}   catch (err) {
    console.error(`[Whisper] Failed to forward to Whisper for "${speaker}" in meeting "${meetingId}":`, err);
  }
};

export const transcribeAudioChunk = async (audioChunk: Buffer): Promise<any> => {
  console.warn("transcribeAudioChunk is deprecated for real-time streaming. Use WebSocket instead.");
  return Promise.resolve({ transcript: "Deprecated", confidence: 0 });
};
