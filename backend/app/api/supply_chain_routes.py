from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
import asyncio
import json
from app.agents.supply_chain.graph import supply_chain_graph

router = APIRouter()

class SupplyChainRequest(BaseModel):
    hub: str
    client_id: str

# Store connected websockets by client ID
connected_clients = {}

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await websocket.accept()
    connected_clients[client_id] = websocket
    try:
        while True:
            # Keep connection open, wait for messages
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        if client_id in connected_clients:
            del connected_clients[client_id]

@router.post("/analyze")
async def analyze_supply_chain(request: SupplyChainRequest):
    hub = request.hub
    client_id = request.client_id
    
    # Check if a socket matches
    websocket = connected_clients.get(client_id)
    loop = asyncio.get_running_loop()

    # Function to emit WS from backend components asynchronously in LangGraph
    def emit_status(msg_str: str):
        if websocket:
            # using a background run task to avoid async block in sync node
            asyncio.run_coroutine_threadsafe(websocket.send_text(msg_str), loop)
    
    if websocket:
        await websocket.send_text(json.dumps({"type": "status", "message": f"Initializing Domino Predictor for {hub}..."}))

    try:
        # Run graph in an executor to avoid blocking the API loop
        initial_state = {
            "port": hub,
            "emit_message": emit_status,
        }
        
        result = await asyncio.to_thread(supply_chain_graph.invoke, initial_state)
        
        # Cleanup
        if "emit_message" in result:
            del result["emit_message"]
            
        final_data = {
            "type": "complete",
            "data": result
        }
        
        if websocket:
            await websocket.send_text(json.dumps(final_data))
            
        return {"status": "success", "data": result}
        
    except Exception as e:
        error_msg = {"type": "status", "message": f"Pipeline Error: {str(e)}"}
        if websocket:
            await websocket.send_text(json.dumps(error_msg))
        return {"status": "error", "message": str(e)}
