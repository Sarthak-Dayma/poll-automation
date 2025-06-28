"""
Whisper Service Main Application
Modular FastAPI application for real-time audio transcription using Whisper.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import io
import uuid
from src.config.settings import get_logger, SERVER_HOST, SERVER_PORT, DEBUG_MODE

# Initialize logger
logger = get_logger(__name__)

# Lazy import and initialization of heavy components
transcription_engine = None
AudioProcessor = None
_loading_lock = asyncio.Lock()  # Prevent race conditions during loading

# --- FastAPI Application Setup ---
app = FastAPI(title="Whisper Transcription Service", version="1.0.0")

# Add CORS middleware to allow WebSocket connections from backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- HTTP Routes ---
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    global transcription_engine, AudioProcessor

    status = {
        "status": "healthy",
        "service": "whisper-transcription",
        "components": {
            "transcription_engine": "loaded" if transcription_engine is not None else "not_loaded",
            "audio_processor": "loaded" if AudioProcessor is not None else "not_loaded"
        }
    }
    return status


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    """Real-time transcription WebSocket endpoint."""
    global transcription_engine, AudioProcessor

    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "websocket": websocket,
        "meeting_id": "N/A",
        "speaker": "N/A",
        "audio_buffer": io.BytesIO(),
        "transcript_queue": asyncio.Queue(),
        "shutdown_event": asyncio.Event(),
        "transcription_finished_event": asyncio.Event()
    }  # End of session data initialization

    try:
        logger.info(f"[{session_id}] WebSocket connection attempt from {websocket.client}")
        await websocket.accept()
        logger.info(f"[{session_id}] WebSocket connection accepted")

        # Send confirmation message
        await websocket.send_text(json.dumps({
            "type": "status",
            "message": "Connected to Whisper service"
        }))

        # Lazy load components only when needed (with race condition protection)
        async with _loading_lock:
            if AudioProcessor is None:
                logger.info(f"[{session_id}] Loading AudioProcessor...")
                try:
                    from src.audio.processor import AudioProcessor as AP
                    AudioProcessor = AP
                    logger.info(f"[{session_id}] AudioProcessor loaded successfully")
                except Exception as e:
                    logger.error(f"[{session_id}] Failed to load AudioProcessor: {e}")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Failed to initialize audio processor"
                    }))
                    return

            if transcription_engine is None:
                logger.info(f"[{session_id}] Loading TranscriptionEngine...")
                try:
                    from src.transcription.engine import TranscriptionEngine
                    transcription_engine = TranscriptionEngine()
                    logger.info(f"[{session_id}] TranscriptionEngine loaded successfully")
                except Exception as e:
                    logger.error(f"[{session_id}] Failed to load TranscriptionEngine: {e}")
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Failed to initialize transcription engine"
                    }))
                    return

        # Initialize audio processor
        try:
            processor = AudioProcessor(session_data)
        except Exception as e:
            logger.error(f"[{session_id}] Failed to initialize processor: {e}")
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": "Failed to initialize audio processor"
            }))
            return

        # Main message loop
        while True:
            try:
                message = await websocket.receive()
                logger.debug(f"[{session_id}] Received message type: {message.get('type')}")

                if message["type"] == "websocket.receive":
                    if "text" in message:
                        # Handle JSON messages
                        data = json.loads(message["text"])
                        logger.info(f"[{session_id}] Received JSON: {data}")

                        if data.get("type") == "start":
                            session_data["meeting_id"] = data.get("meetingId", "unknown")
                            session_data["speaker"] = data.get("speaker", "unknown")

                            await websocket.send_text(json.dumps({
                                "type": "status",
                                "message": f"Session started for {session_data['speaker']}"
                            }))
                            logger.info(f"[{session_id}] Session started for meeting: {session_data['meeting_id']}, speaker: {session_data['speaker']}")

                        elif data.get("type") == "end":
                            logger.info(f"[{session_id}] Session end requested")
                            break

                        elif data.get("type") == "ping":
                            # Handle ping messages from backend
                            await websocket.send_text(json.dumps({
                                "type": "pong",
                                "timestamp": data.get("timestamp", None)
                            }))
                            logger.debug(f"[{session_id}] Responded to ping")

                        else:
                            logger.warning(f"[{session_id}] Unknown message type: {data.get('type')}")

                    elif "bytes" in message:
                        # Handle binary audio data
                        audio_data = message["bytes"]
                        logger.debug(f"[{session_id}] Received audio chunk: {len(audio_data)} bytes")

                        # Write audio data to buffer
                        session_data["audio_buffer"].write(audio_data)

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

                                    if transcribed_text and transcribed_text.strip():
                                        # Create transcription result
                                        result = transcription_engine.create_transcription_result(
                                            session_data, transcribed_text, info
                                        )

                                        # Send transcription result
                                        await websocket.send_text(json.dumps(result))
                                        logger.info(f"[{session_id}] Sent transcription: {transcribed_text}")

                            except Exception as e:
                                logger.error(f"[{session_id}] Transcription error: {e}")
                                await websocket.send_text(json.dumps({
                                    "type": "error",
                                    "message": f"Transcription failed: {str(e)}"
                                }))

                elif message["type"] == "websocket.disconnect":
                    logger.info(f"[{session_id}] Client disconnected")
                    break

            except WebSocketDisconnect:
                logger.info(f"[{session_id}] WebSocket disconnected")
                break
            except Exception as e:
                logger.error(f"[{session_id}] Error in message loop: {e}")
                break

    except Exception as e:
        logger.error(f"[{session_id}] WebSocket error: {e}")
    finally:
        # Cleanup
        try:
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
        finally:
            logger.info(f"[{session_id}] WebSocket connection closed")


# --- Application Startup ---
if __name__ == "__main__":
    import uvicorn
    print("Starting Whisper Transcription Service...")
    log_level = "debug" if DEBUG_MODE else "info"
    uvicorn.run(
        app,
        host=SERVER_HOST,
        port=SERVER_PORT,
        log_level=log_level
    )
