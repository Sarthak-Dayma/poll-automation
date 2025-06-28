"""
Minimal FastAPI WebSocket test to isolate the 403 issue
"""

from fastapi import FastAPI, WebSocket
import uvicorn

app = FastAPI()

@app.get("/")
async def root():
    return {"message": "Minimal WebSocket test server"}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    print(f"[MINIMAL] WebSocket connection attempt from {websocket.client}")
    try:
        await websocket.accept()
        print(f"[MINIMAL] WebSocket connection accepted")
        await websocket.send_text("Hello from minimal server!")
        print(f"[MINIMAL] Message sent")
        
        # Keep connection open for a bit
        import asyncio
        await asyncio.sleep(2)
        
        await websocket.close()
        print(f"[MINIMAL] Connection closed")
    except Exception as e:
        print(f"[MINIMAL] Error: {e}")

if __name__ == "__main__":
    print("Starting minimal WebSocket test server on port 8001...")
    uvicorn.run(app, host="127.0.0.1", port=8001, log_level="debug")
