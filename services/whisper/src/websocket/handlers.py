"""
WebSocket handling module for Whisper service.
Manages WebSocket connections, message processing, and session lifecycle.
"""

import asyncio
import json
import uuid
import io
from typing import Dict, Any, Union
from fastapi import WebSocket, WebSocketDisconnect
from ..config.settings import BUFFER_DURATION_SECONDS, get_logger
from ..transcription.engine import transcription_engine

logger = get_logger(__name__)

class WebSocketSessionManager:
    """Manages WebSocket sessions and their lifecycle."""
    
    def __init__(self):
        self.connected_sessions: Dict[str, Dict[str, Any]] = {}
    
    def create_session(self, websocket: WebSocket) -> Dict[str, Any]:
        """
        Create a new WebSocket session.
        
        Args:
            websocket: FastAPI WebSocket instance
            
        Returns:
            Session data dictionary
        """
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "websocket": websocket,
            "meeting_id": "N/A",  # Default, will be updated by 'start' message
            "speaker": "N/A",     # Default, will be updated by 'start' message
            "audio_buffer": io.BytesIO(),
            "transcript_queue": asyncio.Queue(),
            "processing_task": None,
            "shutdown_event": asyncio.Event(),
            "transcription_finished_event": asyncio.Event(),
            "websocket_closed_by_endpoint": asyncio.Event(),
        }
        self.connected_sessions[session_id] = session_data
        logger.info(f"[{session_id}] NEW SESSION: Client connected and WebSocket accepted.")
        return session_data
    
    def remove_session(self, session_id: str):
        """Remove a session from the connected sessions."""
        if session_id in self.connected_sessions:
            session_data = self.connected_sessions[session_id]
            session_data["audio_buffer"].close()
            del self.connected_sessions[session_id]
            logger.info(f"[{session_id}] Session cleaned up and removed from store. Active sessions: {len(self.connected_sessions)}")
        else:
            logger.warning(f"[{session_id}] Session not found in connected_sessions during final cleanup. Already removed?")

class WebSocketMessageHandler:
    """Handles WebSocket message processing."""
    
    @staticmethod
    async def handle_start_message(session_data: Dict[str, Any], data: Dict[str, Any]):
        """Handle 'start' message from client."""
        session_id = session_data["session_id"]
        websocket = session_data["websocket"]
        
        session_data["meeting_id"] = data.get("meetingId", "N/A")
        session_data["speaker"] = data.get("speaker", "N/A")
        
        logger.info(f"[{session_id}] Received 'start' signal for meeting: {session_data['meeting_id']}, speaker: {session_data['speaker']}")
        await websocket.send_json({"type": "status", "message": "Whisper session started"})
    
    @staticmethod
    async def handle_end_message(session_data: Dict[str, Any]):
        """Handle 'end' message from client."""
        session_id = session_data["session_id"]
        
        logger.info(f"[{session_id}] Received 'end' signal. Signaling shutdown.")
        session_data["shutdown_event"].set()
    
    @staticmethod
    def handle_audio_chunk(session_data: Dict[str, Any], audio_chunk: bytes):
        """Handle binary audio data from client."""
        session_id = session_data["session_id"]
        
        session_data["audio_buffer"].write(audio_chunk)
        logger.debug(f"[{session_id}] Received audio chunk of {len(audio_chunk)} bytes. Buffer size: {session_data['audio_buffer'].tell()} bytes.")

class WebSocketTranscriptionSender:
    """Handles sending transcription results to WebSocket clients."""
    
    @staticmethod
    async def send_transcriptions(session_data: Dict[str, Any]):
        """
        Send transcriptions from queue to WebSocket client.
        
        Args:
            session_data: Session metadata and state
        """
        session_id = session_data["session_id"]
        websocket: WebSocket = session_data["websocket"]
        transcript_queue: asyncio.Queue = session_data["transcript_queue"]
        websocket_closed_by_endpoint: asyncio.Event = session_data["websocket_closed_by_endpoint"]
        transcription_finished_event: asyncio.Event = session_data["transcription_finished_event"]
        
        logger.info(f"[{session_id}] Transcription sender task started.")
        
        try:
            while True:
                # Priority check: Has the main websocket_endpoint signaled its shutdown?
                if websocket_closed_by_endpoint.is_set():
                    logger.info(f"[{session_id}] Sender task: Main endpoint signaled closure. Exiting send loop.")
                    break
                
                try:
                    # Wait for results from the queue with a timeout
                    result = await asyncio.wait_for(transcript_queue.get(), timeout=0.5)
                    
                    # Attempt to send the result
                    await websocket.send_json(result)
                    logger.debug(f"[{session_id}] Sent transcription: {result.get('text', 'N/A')[:50]}...")
                    
                    # If it was a final message and processing is also confirmed finished, then exit
                    if result.get("is_final") and transcription_finished_event.is_set() and transcript_queue.empty():
                        logger.info(f"[{session_id}] Sender task: Final message sent and all processing complete. Exiting.")
                        break
                
                except asyncio.TimeoutError:
                    # Queue empty for now. Check if processing is finished and no more expected
                    if transcription_finished_event.is_set() and transcript_queue.empty():
                        logger.info(f"[{session_id}] Sender task: Queue empty and processing finished. Exiting.")
                        break
                    else:
                        logger.debug(f"[{session_id}] Sender task: Timeout, waiting for more data or shutdown.")
                    continue
                
                except RuntimeError as e:
                    # This is the most common error when the client's WebSocket closes first
                    logger.error(f"[{session_id}] Sender task: WebSocket connection likely closed. Error: {e}")
                    break
                except Exception as e:
                    logger.error(f"[{session_id}] Sender task: Unexpected error during send: {e}", exc_info=True)
                    break
        
        except asyncio.CancelledError:
            logger.info(f"[{session_id}] Sender task cancelled.")
        except Exception as e:
            logger.error(f"[{session_id}] Sender task: Unhandled error: {e}", exc_info=True)
        finally:
            logger.info(f"[{session_id}] Transcription sender task finished.")

# Global instances
session_manager = WebSocketSessionManager()
message_handler = WebSocketMessageHandler()
transcription_sender = WebSocketTranscriptionSender()
