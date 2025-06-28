"""
Configuration module for Whisper service.
Handles environment variables, model configuration, and audio processing constants.
"""

import os
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up logging with configurable level and format
log_level = os.getenv("LOG_LEVEL", "INFO").upper()
log_format = os.getenv("LOG_FORMAT", "%(asctime)s - %(levelname)s - %(message)s")
logging.basicConfig(level=getattr(logging, log_level), format=log_format)
logger = logging.getLogger(__name__)

# --- Model Configuration ---
def get_device_and_compute_type():
    """
    Determine the best device and compute type for Whisper model.
    Returns tuple of (device, compute_type)
    """
    # Check for manual override
    manual_device = os.getenv("WHISPER_DEVICE", "").lower()
    manual_compute_type = os.getenv("WHISPER_COMPUTE_TYPE", "").lower()

    if manual_device and manual_compute_type:
        logger.info(f"[Whisper Service] Using manual configuration: device='{manual_device}', compute_type='{manual_compute_type}'")
        return manual_device, manual_compute_type

    try:
        import torch
        # Prioritize CUDA if available, otherwise use CPU
        device = "cuda" if torch.cuda.is_available() else "cpu"
        if device == "cuda":
            # For GPUs, float16 offers the best performance with minimal accuracy loss
            compute_type = "float16"
            logger.info(f"[Whisper Service] PyTorch CUDA is available. Using device='cuda' with compute_type='float16'.")
        else:
            # For CPUs, int8 quantization is crucial for performance
            compute_type = "int8"
            logger.info(f"[Whisper Service] PyTorch CUDA not available. Using device='cpu' with compute_type='int8'.")
    except ImportError:
        # Fallback if torch is not installed at all
        device = "cpu"
        compute_type = "int8"
        logger.warning("[WARNING] PyTorch not installed. Defaulting to device='cpu' with compute_type='int8'. "
                        "Install PyTorch for potential CUDA acceleration.")
    except Exception as e:
        # Catch any other import/initialization errors for torch
        device = "cpu"
        compute_type = "int8"
        logger.error(f"[ERROR] Failed to initialize PyTorch/CUDA: {e}. Defaulting to device='cpu' with compute_type='int8'.")

    return device, compute_type

# Model configuration
WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL_SIZE", "medium")  # Default to medium
DEVICE, COMPUTE_TYPE = get_device_and_compute_type()

# --- Audio Processing Constants ---
SAMPLE_RATE = int(os.getenv("SAMPLE_RATE", 16000))  # Standard for Whisper models
BYTES_PER_SAMPLE = int(os.getenv("BYTES_PER_SAMPLE", 2))  # 16-bit audio (e.g., from browser's Int16Array)

# BUFFER_DURATION_SECONDS: Crucial for real-time responsiveness vs. context
# For live teaching, 1.5-2.5 seconds is ideal for low latency. Let's start with 2.0.
# Made configurable via environment variable for easy tuning in different deployments.
BUFFER_DURATION_SECONDS = float(os.getenv("BUFFER_DURATION_SECONDS", 2.0))
BUFFER_SIZE_BYTES = int(BUFFER_DURATION_SECONDS * SAMPLE_RATE * BYTES_PER_SAMPLE)

# --- Transcription Configuration ---
TRANSCRIPTION_CONFIG = {
    "beam_size": int(os.getenv("WHISPER_BEAM_SIZE", 5)),  # Good balance for accuracy
    "word_timestamps": os.getenv("WHISPER_WORD_TIMESTAMPS", "true").lower() == "true",  # Useful for more detailed future features
    "language": os.getenv("WHISPER_LANGUAGE", "en"),  # Language for transcription
    "condition_on_previous_text": os.getenv("WHISPER_CONDITION_ON_PREVIOUS_TEXT", "false").lower() == "true",  # Important for real-time chunking to avoid repetition
}

# --- Server Configuration ---
SERVER_HOST = os.getenv("WHISPER_HOST", "127.0.0.1")
SERVER_PORT = int(os.getenv("WHISPER_PORT", 8000))

# --- Performance Settings ---
MAX_CONCURRENT_SESSIONS = int(os.getenv("MAX_CONCURRENT_SESSIONS", 10))
SESSION_TIMEOUT = int(os.getenv("SESSION_TIMEOUT", 300))
ENABLE_PERFORMANCE_METRICS = os.getenv("ENABLE_PERFORMANCE_METRICS", "false").lower() == "true"
ENABLE_MEMORY_MONITORING = os.getenv("ENABLE_MEMORY_MONITORING", "false").lower() == "true"

# --- Development/Testing Settings ---
TEST_MODE = os.getenv("TEST_MODE", "false").lower() == "true"
MOCK_TRANSCRIPTION = os.getenv("MOCK_TRANSCRIPTION", "false").lower() == "true"
DEBUG_MODE = os.getenv("DEBUG_MODE", "false").lower() == "true"
ENABLE_REQUEST_LOGGING = os.getenv("ENABLE_REQUEST_LOGGING", "false").lower() == "true"

# --- WebSocket Settings ---
WS_PING_INTERVAL = int(os.getenv("WS_PING_INTERVAL", 30))
WS_CONNECTION_TIMEOUT = int(os.getenv("WS_CONNECTION_TIMEOUT", 60))
MAX_MESSAGE_SIZE = int(os.getenv("MAX_MESSAGE_SIZE", 1048576))
AUDIO_PROCESSING_INTERVAL = float(os.getenv("AUDIO_PROCESSING_INTERVAL", 0.05))

# --- Logging Configuration ---
def get_logger(name: str) -> logging.Logger:
    """Get a logger with the specified name."""
    return logging.getLogger(name)

# --- Scalability Settings ---
# Maximum queue size before dropping new audio chunks
MAX_QUEUE_SIZE = int(os.getenv("MAX_QUEUE_SIZE", 20))

# Maximum processing time before considering a transcription "stuck"
MAX_PROCESSING_TIME = int(os.getenv("MAX_PROCESSING_TIME", 30))

# Number of worker processes (if using multiprocessing)
NUM_WORKERS = int(os.getenv("NUM_WORKERS", 1))

# Enable/disable multiprocessing
ENABLE_MULTIPROCESSING = os.getenv("ENABLE_MULTIPROCESSING", "false").lower() == "true"

# Queue backend (memory, redis)
QUEUE_BACKEND = os.getenv("QUEUE_BACKEND", "memory")

# Redis connection string (if using Redis)
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

