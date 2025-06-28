"""
WebSocket message handlers for Whisper service.
Handles session management, message processing, and transcription result streaming.
"""

import asyncio
import json
import uuid
import io
from typing import Dict, Any, Optional
from fastapi import WebSocket
from ..config.settings import get_logger

logger = get_logger(__name__)

class WebSocketSessionManager:
    """Manages WebSocket session lifecycle and metadata."""
    
    @staticmethod
    def create_session(websocket: WebSocket) -> Dict[str, Any]:
        """
        Create a new WebSocket session with default metadata.
        
        Args:
            websocket: FastAPI WebSocket instance
            
        Returns:
            Session data dictionary
        """
        session_id = str(uuid.uuid4())
        session_data = {
            "session_id": session_id,
            "websocket": websocket,
            "meeting_id": "N/A",
            "speaker": "N/A",
            "audio_buffer": io.BytesIO(),
            "transcript_queue": asyncio.Queue(),
            "shutdown_event": asyncio.Event(),
            "transcription_finished_event": asyncio.Event(),
            "websocket_closed_by_endpoint": asyncio.Event()
        }
        
        logger.info(f"[{session_id}] Session created for WebSocket from {websocket.client}")
        return session_data
    
    @staticmethod
    async def cleanup_session(session_data: Dict[str, Any]):
        """
        Clean up session resources.
        
        Args:
            session_data: Session metadata and state
        """
        session_id = session_data["session_id"]
        
        try:
            # Signal shutdown
            session_data["shutdown_event"].set()
            
            # Clean up audio buffer
            if "audio_buffer" in session_data and session_data["audio_buffer"]:
                session_data["audio_buffer"].close()
                
            # Clean up queues
            if "transcript_queue" in session_data:
                while not session_data["transcript_queue"].empty():
                    try:
                        session_data["transcript_queue"].get_nowait()
                    except:
                        break
                        
            logger.info(f"[{session_id}] Session cleanup completed")
        except Exception as cleanup_error:
            logger.error(f"[{session_id}] Error during cleanup: {cleanup_error}")

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
        await websocket.send_text(json.dumps({
            "type": "status", 
            "message": f"Session started for {session_data['speaker']}"
        }))
    
    @staticmethod
    async def handle_end_message(session_data: Dict[str, Any]):
        """Handle 'end' message from client."""
        session_id = session_data["session_id"]
        
        logger.info(f"[{session_id}] Received 'end' signal. Signaling shutdown.")
        session_data["shutdown_event"].set()
    
    @staticmethod
    async def handle_ping_message(session_data: Dict[str, Any], data: Dict[str, Any]):
        """Handle 'ping' message from client."""
        session_id = session_data["session_id"]
        websocket = session_data["websocket"]
        
        await websocket.send_text(json.dumps({
            "type": "pong",
            "timestamp": data.get("timestamp", None)
        }))
        logger.debug(f"[{session_id}] Responded to ping")
    
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
            while not websocket_closed_by_endpoint.is_set():
                try:
                    # Wait for results from the queue with a timeout
                    result = await asyncio.wait_for(transcript_queue.get(), timeout=0.5)
                    
                    # Attempt to send the result
                    await websocket.send_text(json.dumps(result))
                    logger.debug(f"[{session_id}] Sent transcription: {result.get('text', 'N/A')[:50]}...")
                    
                    # If it was a final message and processing is also confirmed finished, then exit
                    if result.get("is_final") and transcription_finished_event.is_set() and transcript_queue.empty():
                        logger.info(f"[{session_id}] Sender task: Final message sent and all processing complete. Exiting.")
                        break
                        
                except asyncio.TimeoutError:
                    # No new transcription results, continue waiting
                    continue
                except Exception as e:
                    logger.error(f"[{session_id}] Error sending transcription: {e}")
                    break
                    
        except Exception as e:
            logger.error(f"[{session_id}] Error in transcription sender: {e}")
        finally:
            logger.info(f"[{session_id}] Transcription sender task finished.")

# Create singleton instances
session_manager = WebSocketSessionManager()
message_handler = WebSocketMessageHandler()
transcription_sender = WebSocketTranscriptionSender()
