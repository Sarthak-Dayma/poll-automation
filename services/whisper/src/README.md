Perfect — then here's the updated concise README.md section reflecting that Whisper also starts with pnpm dev:

---

## 🔧 .env Configuration

Create the following .env files:

### apps/backend/.env

env
PORT=3000
WHISPER_WS_URL=ws://localhost:8000


### apps/frontend/.env

env
VITE_BACKEND_WS_URL=ws://localhost:3000


---

## 🛠 Setup & Run Instructions

### 1. Install dependencies

bash
pnpm install


### 2. Start all servers together

bash
pnpm dev


This starts:

* ✅ *Frontend* → http://localhost:5173
* ✅ *Backend (WebSocket server)* → ws://localhost:3000
* ✅ *Whisper Transcription Service* → ws://localhost:8000 (Python FastAPI)

> Make sure the Python environment is set up correctly (faster-whisper, uvicorn, etc.)

---

## 🗣 Phase 1 – Transcription Pipeline

1. Frontend sends metadata and a .wav audio file via WebSocket.
2. Backend receives it and forwards audio to the Whisper service.
3. Whisper transcribes it using Faster-Whisper and sends back text.
4. Backend forwards transcription to the frontend.

Let me know if you also want short test instructions or troubleshooting tips added.