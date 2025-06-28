"""
WebSocket endpoint module for Whisper service.
Defines the main WebSocket endpoint and connection handling.
"""

import asyncio
import json
from typing import Union, Dict, Any
from fastapi import WebSocket, WebSocketDisconnect
from .handlers import session_manager, message_handler, transcription_sender
from ..audio.processor import AudioProcessor
from ..transcription.engine import TranscriptionEngine
from ..config.settings import get_logger

logger = get_logger(__name__)

# Global instances for lazy loading
_transcription_engine: TranscriptionEngine = None
_loading_lock = asyncio.Lock()

async def get_transcription_engine() -> TranscriptionEngine:
    """Get or create the transcription engine instance (lazy loading)."""
    global _transcription_engine
    
    async with _loading_lock:
        if _transcription_engine is None:
            logger.info("Loading TranscriptionEngine...")
            _transcription_engine = TranscriptionEngine()
            logger.info("TranscriptionEngine loaded successfully")
    
    return _transcription_engine

async def websocket_endpoint(websocket: WebSocket):
    """
    Main WebSocket endpoint for handling transcription sessions.

    Args:
        websocket: FastAPI WebSocket instance
    """
    logger.info(f"WebSocket connection attempt received from {websocket.client}")

    try:
        # Accept the WebSocket connection first
        await websocket.accept()
        logger.info(f"WebSocket connection accepted from {websocket.client}")

        # Create new session after accepting
        session_data = session_manager.create_session(websocket)
        session_id = session_data["session_id"]
        
        # Send confirmation message
        await websocket.send_text(json.dumps({
            "type": "status",
            "message": "Connected to Whisper service"
        }))
        
        # Initialize components
        try:
            transcription_engine = await get_transcription_engine()
            processor = AudioProcessor(session_data)
        except Exception as e:
            logger.error(f"[{session_id}] Failed to initialize components: {e}")
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": "Failed to initialize transcription components"
            }))
            return
        
        # Start background tasks
        sender_task = asyncio.create_task(transcription_sender.send_transcriptions(session_data))
        session_data["sender_task"] = sender_task
        
        logger.info(f"[{session_id}] Session started. Entering receive loop.")

        # Main message loop
        while True:
            try:
                message_received = await websocket.receive()
                logger.debug(f"[{session_id}] Received message type: {message_received.get('type')}")
                
                if message_received["type"] == "websocket.receive":
                    if "text" in message_received:
                        # Handle text messages (start/end commands)
                        data = json.loads(message_received["text"])
                        logger.info(f"[{session_id}] Received JSON: {data}")
                        
                        if data.get("type") == "start":
                            await message_handler.handle_start_message(session_data, data)
                        elif data.get("type") == "end":
                            await message_handler.handle_end_message(session_data)
                            break
                        elif data.get("type") == "ping":
                            await message_handler.handle_ping_message(session_data, data)
                        else:
                            logger.warning(f"[{session_id}] Unknown text message type received: {data.get('type')}")
                    
                    elif "bytes" in message_received:
                        # Handle binary audio data
                        audio_data = message_received["bytes"]
                        logger.debug(f"[{session_id}] Received audio chunk: {len(audio_data)} bytes")
                        
                        # Write audio data to buffer
                        message_handler.handle_audio_chunk(session_data, audio_data)
                        
                        # Process audio if buffer has enough data
                        if processor.should_process_buffer():
                            try:
                                # Read audio from buffer
                                audio_bytes = processor.read_and_clear_buffer()
                                if audio_bytes:
                                    # Convert to numpy array for Whisper
                                    audio_np = processor.convert_audio_bytes_to_numpy(audio_bytes)
                                    
                                    # Transcribe audio
                                    transcribed_text, info = transcription_engine.transcribe_audio(audio_np)
                                    logger.debug(f"[{session_id}] Transcription result: '{transcribed_text}' (length: {len(transcribed_text) if transcribed_text else 0})")
                                    
                                    if transcribed_text and transcribed_text.strip():
                                        # Create transcription result with proper format
                                        result = {
                                            "type": "transcription",
                                            "meetingId": session_data["meeting_id"],
                                            "speaker": session_data["speaker"],
                                            "text": transcribed_text,
                                            "language": info.language if info and hasattr(info, 'language') else "en",
                                            "is_final": True  # Mark as final for real-time chunks
                                        }
                                        
                                        # Send transcription result
                                        await websocket.send_text(json.dumps(result))
                                        logger.info(f"[{session_id}] Sent transcription: {transcribed_text}")
                                        
                            except Exception as e:
                                logger.error(f"[{session_id}] Error processing audio: {e}")
                    
                    else:
                        logger.warning(f"[{session_id}] Received websocket.receive with no text or bytes payload.")
                
                elif message_received["type"] == "websocket.disconnect":
                    logger.info(f"[{session_id}] Client disconnected")
                    break
                else:
                    logger.warning(f"[{session_id}] Unknown message type: {message_received['type']}")
                    
            except WebSocketDisconnect:
                logger.info(f"[{session_id}] WebSocket disconnected")
                break
            except Exception as e:
                logger.error(f"[{session_id}] Error in message loop: {e}")
                break

    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected during connection setup")
    except Exception as e:
        logger.error(f"Error in WebSocket endpoint: {e}")
    finally:
        # Cleanup
        try:
            if 'session_data' in locals():
                session_data["websocket_closed_by_endpoint"].set()
                
                # Cancel background tasks
                if "sender_task" in session_data:
                    session_data["sender_task"].cancel()
                    try:
                        await session_data["sender_task"]
                    except asyncio.CancelledError:
                        pass
                
                # Clean up session
                await session_manager.cleanup_session(session_data)
                
        except Exception as cleanup_error:
            logger.error(f"Error during WebSocket cleanup: {cleanup_error}")
        finally:
            logger.info("WebSocket connection closed")
