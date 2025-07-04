<<<<<<< HEAD
// shared\types\src\index.ts
import { Buffer } from "buffer"; // Keep this if Buffer is used elsewhere
export type WhisperResult = { text: string; confidence: number };
export type AudioChunk = { data: Buffer; timestamp: number };
export type SomeType = any; // Replace with your actual type if needed, otherwise remove
export type { SessionMeta } from './websocket';
export * from './websocket';
export * from './HostSettings';

// Clean up: If `WhisperResult` and `AudioChunk` are not used outside, remove them.
// Ensure `TranscriptionResult` from websocket.ts is the canonical one.
// You might remove the `AudioChunk` type here, as the frontend will send raw ArrayBuffer directly.
=======
// shared/types/src/index.ts
export * from '../websocket';
export * from '../transcript';
>>>>>>> 9ee913167a2d6a89eff541e3f79d80bd6c0c6e3d
