"""
Transcription engine module for Whisper service.
Handles model loading and transcription processing.
"""

import asyncio
import time
from typing import Dict, Any, Optional
from faster_whisper import WhisperModel
from ..config.settings import (
    WHISPER_MODEL_SIZE, DEVICE, COMPUTE_TYPE, TRANSCRIPTION_CONFIG, get_logger
)
from ..audio.processor import AudioProcessor

logger = get_logger(__name__)

class TranscriptionEngine:
    """Handles Whisper model loading and transcription processing."""
    
    def __init__(self):
        self.model: Optional[WhisperModel] = None
        self._load_model()
        self.last_successful_transcription = time.time()
        self.WATCHDOG_TIMEOUT = 10  # seconds
    
    def _load_model(self):
        """Load the Whisper model with configured settings."""
        try:
            self.model = WhisperModel(WHISPER_MODEL_SIZE, device=DEVICE, compute_type=COMPUTE_TYPE)
            logger.info(f"[Whisper Service] Model '{WHISPER_MODEL_SIZE}' loaded on {DEVICE} with {COMPUTE_TYPE}.")
        except Exception as e:
            logger.critical(f"[Whisper Service] Failed to load Whisper model '{WHISPER_MODEL_SIZE}': {e}. "
                             "Ensure the model name is correct and necessary files are downloaded. Exiting.")
            raise
    
    def transcribe_audio(self, audio_np) -> tuple:
        """Transcribe audio using the Whisper model."""
        start_time = time.time()
        
        if not self.model:
            raise RuntimeError("Whisper model not loaded")
        
        try:
            segments_generator, info = self.model.transcribe(
                audio_np,
                beam_size=TRANSCRIPTION_CONFIG["beam_size"],
                word_timestamps=TRANSCRIPTION_CONFIG["word_timestamps"],
                language=TRANSCRIPTION_CONFIG["language"],
                condition_on_previous_text=TRANSCRIPTION_CONFIG["condition_on_previous_text"],
            )
            
            transcribed_text_parts = []
            # Consume the generator fully
            for segment in segments_generator:
                transcribed_text_parts.append(segment.text)
            
            transcribed_text = " ".join(transcribed_text_parts).strip()
            
            # Update successful transcription time
            self.last_successful_transcription = time.time()
            logger.info(f"Transcription took {time.time() - start_time:.2f} seconds")
            
            return transcribed_text, info
            
        except Exception as e:
            logger.error(f"Error in transcription: {e}")
            # If transcription fails, return empty result
            return "", None
    
    def create_transcription_result(self, session_data: Dict[str, Any], 
                                   transcribed_text: str, info) -> Dict[str, Any]:
        """
        Create a transcription result dictionary.
        
        Args:
            session_data: Session metadata
            transcribed_text: The transcribed text
            info: Transcription info from Whisper
            
        Returns:
            Transcription result dictionary
        """
        return {
            "type": "transcription",
            "meetingId": session_data["meeting_id"],
            "speaker": session_data["speaker"],
            "text": transcribed_text,
            "language": info.language if info and info.language else "unknown",
            "is_final": False  # Not necessarily final for continuous chunks
        }
    
    async def process_audio_stream(self, session_id: str, session_data: Dict[str, Any], processor: AudioProcessor):
        """Process audio stream for a session."""
        transcript_queue = session_data["transcript_queue"]
        
        # Add a processing queue with max size to prevent memory issues
        processing_queue = asyncio.Queue(maxsize=settings.MAX_QUEUE_SIZE)
        
        # Start a background task for actual transcription
        transcription_task = asyncio.create_task(
            self._transcribe_from_queue(session_id, processing_queue, transcript_queue)
        )
        
        try:
            while True:
                # Sleep briefly to yield control
                await asyncio.sleep(0.05)
                
                # Check if processor should process buffer
                if processor.should_process_buffer():
                    # Read and clear the buffer
                    audio_bytes = processor.read_and_clear_buffer()
                    if not audio_bytes:
                        continue
                    
                    # Convert to numpy array
                    try:
                        audio_np = processor.bytes_to_numpy(audio_bytes)
                        
                        # Check if queue is full
                        if processing_queue.full():
                            logger.warning(f"[{session_id}] Processing queue full, dropping oldest chunk")
                            # Remove oldest item to make room (backpressure)
                            try:
                                # Get without waiting
                                processing_queue.get_nowait()
                                processing_queue.task_done()
                            except asyncio.QueueEmpty:
                                pass
                        
                        # Add to processing queue
                        try:
                            # Add with timeout to prevent blocking
                            await asyncio.wait_for(
                                processing_queue.put({
                                    "audio_np": audio_np,
                                    "timestamp": time.time()
                                }),
                                timeout=0.5
                            )
                            logger.info(f"[{session_id}] Added chunk to queue. Size: {processing_queue.qsize()}/{settings.MAX_QUEUE_SIZE}")
                        except asyncio.TimeoutError:
                            logger.error(f"[{session_id}] Failed to add chunk to queue - timeout")
                    
                    except Exception as e:
                        logger.error(f"[{session_id}] Error processing audio: {e}")
                    
                # Check if session is closed
                if processor.is_shutdown():
                    logger.info(f"[{session_id}] Processor shutdown detected")
                    break
                    
        except Exception as e:
            logger.error(f"[{session_id}] Error in process_audio_stream: {e}")
        finally:
            # Signal transcription task to finish
            try:
                await asyncio.wait_for(processing_queue.put(None), timeout=1.0)
            except asyncio.TimeoutError:
                logger.warning(f"[{session_id}] Could not add termination signal to queue")
            
            # Wait for transcription task to complete with timeout
            try:
                await asyncio.wait_for(transcription_task, timeout=5.0)
            except asyncio.TimeoutError:
                logger.warning(f"[{session_id}] Transcription task did not complete in time")
    
    async def check_watchdog(self, session_id: str):
        """Check if transcription is stuck and restart if needed."""
        while True:
            await asyncio.sleep(5)  # Check every 5 seconds
            
            time_since_last = time.time() - self.last_successful_transcription
            if time_since_last > self.WATCHDOG_TIMEOUT:
                logger.warning(f"[{session_id}] Transcription appears stuck for {time_since_last:.1f}s. Restarting model.")
                # Reload model as a last resort
                try:
                    self.model = None
                    self._load_model()
                    self.last_successful_transcription = time.time()
                except Exception as e:
                    logger.error(f"Failed to reload model: {e}")

# Global transcription engine instance
transcription_engine = TranscriptionEngine()



