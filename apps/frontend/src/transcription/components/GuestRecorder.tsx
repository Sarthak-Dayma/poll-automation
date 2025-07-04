<<<<<<< HEAD
// apps/frontend/src/components/GuestRecorder.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MicrophoneStreamer } from '../utils/microphoneStream';
import type { TranscriptionResult } from '@shared/types';
import '../../App.css'; // Assuming you have some basic CSS in App.css
interface GuestRecorderProps {
  setTranscriptions?: (results: TranscriptionResult[]) => void;
}

const GUEST_WEBSOCKET_URL = 'ws://localhost:3000'; // Or your deployed backend WebSocket URL

const GuestRecorder: React.FC<GuestRecorderProps> = ({ setTranscriptions }) => {
    const [searchParams] = useSearchParams();
    const meetingId = searchParams.get('meetingId') || 'default-meeting';
    const displayName = searchParams.get('displayName') || 'GuestSpeaker'; // Use displayName for user-friendly name
    
    const [isRecording, setIsRecording] = useState(false);
    const [status, setStatus] = useState('Idle');
    const [lastTranscription, setLastTranscription] = useState('');
    const streamerRef = useRef<MicrophoneStreamer | null>(null);

    useEffect(() => {
        // Cleanup on component unmount
        return () => {
            if (streamerRef.current) {
                streamerRef.current.stop();
            }
        };
    }, []);

const [transcripts, setTranscripts] = useState<TranscriptionResult[]>([]);

const handleTranscription = (result: TranscriptionResult) => {
  setLastTranscription(result.text);
  setTranscripts(prev => {
    const updated = [...prev, result];
    setTranscriptions?.(updated); // Send up to parent if provided
    return updated;
  });

  console.log(`[Guest] Transcription: ${result.speaker}: ${result.text}`);
};


    const handleStatus = (message: string) => {
        setStatus(message);
    };

    const handleError = (error: string) => {
        setStatus(`Error: ${error}`);
        console.error('[Guest] Streamer Error:', error);
        setIsRecording(false);
    };

    const handleStreamEnd = () => {
        setIsRecording(false);
        setStatus('Recording stopped.');
        console.log('[Guest] Stream ended.');
    };

    const startRecording = async () => {
        if (isRecording) return;

        setStatus('Starting...');
        setLastTranscription('');

        // Ensure cleanup if previous streamer instance exists
        if (streamerRef.current) {
            streamerRef.current.stop(); // This will also call cleanup
            streamerRef.current = null;
        }

        streamerRef.current = new MicrophoneStreamer({
            websocketUrl: GUEST_WEBSOCKET_URL,
            meetingId: meetingId,
            proposedSpeakerName: displayName, // Send display name to backend
            onTranscription: handleTranscription,
            onStatus: handleStatus,
            onError: handleError,
            onStreamEnd: handleStreamEnd,
        });

        try {
            await streamerRef.current.start();
            setIsRecording(true);
            setStatus('Recording...');
        } catch (err) {
            console.error('Failed to start recording:', err);
            setStatus(`Failed to start: ${err instanceof Error ? err.message : String(err)}`);
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (!isRecording) return;
        if (streamerRef.current) {
            streamerRef.current.stop();
            streamerRef.current = null;
        }
        setIsRecording(false);
        setStatus('Stopping...');
    };

    return (
        <div className="guest-recorder-container">
            <h1>Guest Voice Input</h1>
            <p>Meeting ID: <strong>{meetingId}</strong></p>
            <p>Your Display Name: <strong>{displayName}</strong></p>
            <p>Status: <span className={isRecording ? 'status-active' : 'status-idle'}>{status}</span></p>
            
            <div className="button-group">
                <button onClick={startRecording} disabled={isRecording}>
                    Start Recording
                </button>
                <button onClick={stopRecording} disabled={!isRecording}>
                    Stop Recording
                </button>
            </div>
            
            {lastTranscription && (
                <div className="transcription-display">
                    <h3>Last Spoken:</h3>
                    <p>{lastTranscription}</p>
                </div>
            )}
            
            <p className="note">
                Ensure microphone access is granted in your browser. Audio is streamed live for transcription.
            </p>
        </div>
    );
};

export default GuestRecorder;
=======
import React, { useEffect, useRef, useState } from 'react';
import type { StartMessage } from '@poll-automation/types';
import {
  getSelectedMicStream,
  getMicrophones,
  selectMicrophone
} from '../utils/micManager';
import { encodeWAV } from '../utils/wavEncoder';


interface GuestRecorderProps {
  guestId: string;
  meetingId: string;
  backendWsUrl: string;
  hostBroadcastSocket: WebSocket;
}

const GuestRecorder: React.FC<GuestRecorderProps> = ({
  guestId,
  meetingId,
  backendWsUrl,
  hostBroadcastSocket
}) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const scriptNodeRef = useRef<ScriptProcessorNode | null>(null);
  const audioBufferRef = useRef<Float32Array[]>([]);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
const CHUNK_INTERVAL = parseInt(import.meta.env.VITE_CHUNK_INTERVAL || '30000');


  useEffect(() => {
    getMicrophones().then((mics) => {
      setDevices(mics);
      console.log('[GuestRecorder] Found mics:', mics);
    });
  }, []);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'start') {
          console.log('[GuestRecorder] Received start broadcast from host');
          handleStartStreaming();
        }
      } catch (err) {
        console.error('[GuestRecorder] Invalid broadcast message:', err);
      }
    };

    hostBroadcastSocket.addEventListener('message', onMessage);
    return () => {
      hostBroadcastSocket.removeEventListener('message', onMessage);
    };
  }, [hostBroadcastSocket, selectedDeviceId]);

  const handleStartStreaming = async () => {
    if (!selectedDeviceId) {
      console.warn('[GuestRecorder] No microphone selected');
      return;
    }

    console.log('[GuestRecorder] Starting stream using:', selectedDeviceId);

    await selectMicrophone(selectedDeviceId);
    const stream = getSelectedMicStream();
    if (!stream) {
      console.error('[GuestRecorder] No stream from selected mic');
      return;
    }

    const ws = new WebSocket(backendWsUrl);
    ws.binaryType = 'arraybuffer';
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[GuestRecorder] WebSocket opened');
      const startMessage: StartMessage = {
        type: 'start',
        guestId,
        meetingId
      };
      ws.send(JSON.stringify(startMessage));
      console.log('[GuestRecorder] Sent start message:', startMessage);

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptNodeRef.current = processor;

      processor.onaudioprocess = (e) => {
        const input = e.inputBuffer.getChannelData(0);
        audioBufferRef.current.push(new Float32Array(input));
      };

      source.connect(processor);
      processor.connect(audioContext.destination);

      // flush every 3s
      chunkIntervalRef.current = setInterval(() => {
        const allSamples = Float32Array.from(audioBufferRef.current.flat());
        if (allSamples.length > 0) {
          const wavBuffer = encodeWAV(allSamples, 16000);
          ws.send(wavBuffer);
          console.log('[GuestRecorder] Sent chunk', wavBuffer.byteLength);
          audioBufferRef.current = [];
        }
      },CHUNK_INTERVAL);

      setIsStreaming(true);
    };

    ws.onerror = (err) => {
      console.error('[GuestRecorder] WebSocket error:', err);
    };

    ws.onclose = () => {
      console.log('[GuestRecorder] WebSocket closed');
      stopStreaming();
    };
  };

  const stopStreaming = () => {
  if (!wsRef.current) return;

  if (audioBufferRef.current.length > 0) {
    const allSamples = Float32Array.from(audioBufferRef.current.flat());
    const wavBuffer = encodeWAV(allSamples, 16000);
    wsRef.current.send(wavBuffer);
    console.log('[GuestRecorder] Final chunk sent on stop');
    audioBufferRef.current = [];
  }

  wsRef.current.send(JSON.stringify({ type: "stop" }));
  console.log('[GuestRecorder] Sent stop signal');

  wsRef.current.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "done") {
        console.log('[GuestRecorder] Done received, closing socket.');
        wsRef.current?.close();
        setIsStreaming(false);
      }
    } catch (_) {}
  });
};



  return (
    <div>
      <label>Select Microphone:</label>
      <select
        value={selectedDeviceId || ''}
        onChange={(e) => {
          const id = e.target.value;
          setSelectedDeviceId(id);
          console.log('[GuestRecorder] Selected mic:', id);
        }}
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Mic ${device.deviceId}`}
          </option>
        ))}
      </select>

      <button onClick={stopStreaming} disabled={!isStreaming}>
        Stop Streaming
      </button>

      {isStreaming && <p>Recording in progress...</p>}
    </div>
  );
};

export default GuestRecorder;
>>>>>>> 9ee913167a2d6a89eff541e3f79d80bd6c0c6e3d
