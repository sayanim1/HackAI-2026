import asyncio
from fastapi import APIRouter, UploadFile, File, Form, WebSocket, WebSocketDisconnect # type: ignore # pyre-ignore
from pydantic import BaseModel
from ..agents.incident.tools import parse_pdf, init_historical_incidents # type: ignore # pyre-ignore
from ..agents.incident.graph import incident_app # type: ignore # pyre-ignore

router = APIRouter()

class RawTextRequest(BaseModel):
    text: str
    client_id: str

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active_connections[client_id] = websocket

    def disconnect(self, client_id: str):
        self.active_connections.pop(client_id, None)

    async def send_personal_message(self, message: str, client_id: str):
        ws = self.active_connections.get(client_id)
        if ws:
            await ws.send_text(message)
            
    async def send_json(self, data: dict, client_id: str):
        ws = self.active_connections.get(client_id)
        if ws:
            await ws.send_json(data)

manager = ConnectionManager()

def map_node_to_message(node_name: str) -> str:
    mapping = {
        "extractor": "Extracting structured data from PDF report...",
        "rag": "Searching ChromaDB for similar historical incidents...",
        "analyzer": "Performing comprehensive incident analysis..."
    }
    return mapping.get(node_name, f"Finished {node_name} step...")

def run_incident_graph(initial_state: dict, client_id: str, loop: asyncio.AbstractEventLoop) -> dict:
    last_state = {}
    for step in incident_app.stream(initial_state):
        node_name = list(step.keys())[0]
        msg = map_node_to_message(node_name)
        
        asyncio.run_coroutine_threadsafe(
            manager.send_json({"type": "status", "message": msg}, client_id), loop
        )
        last_state = step[node_name]
        
    return last_state

@router.websocket("/ws/{client_id}")
async def websocket_endpoint(websocket: WebSocket, client_id: str):
    await manager.connect(websocket, client_id)
    try:
        while True:
            data = await websocket.receive_text() 
    except WebSocketDisconnect:
        manager.disconnect(client_id)

@router.post("/analyze")
async def analyze_incident_report(
    file: UploadFile = File(...),
    client_id: str = Form("default_client") # Use Form for multipart/form-data
):
    await manager.send_json({"type": "status", "message": "Receiving PDF report..."}, client_id)
    file_bytes = await file.read()
    
    loop = asyncio.get_running_loop()
    raw_text = await asyncio.to_thread(parse_pdf, file_bytes)
    
    await manager.send_json({"type": "status", "message": "Initializing vector database..."}, client_id)
    await asyncio.to_thread(init_historical_incidents)
    
    initial_state = {
        "raw_text": raw_text
    }
    
    # Run LangGraph workflow in background thread
    result = await asyncio.to_thread(run_incident_graph, initial_state, client_id, loop)
    
    final_resp = result.get("final_response", {
        "severity": "Unknown",
        "incident_type": "Unknown",
        "timeline": "Unknown",
        "affected_systems": [],
        "root_causes": [],
        "next_actions": [],
        "engineering_summary": "Error processing PDF.",
        "llm_thought_process": "Error processing PDF.",
        "is_new_incident": False
    })
    
    await manager.send_json({"type": "complete", "data": final_resp}, client_id)
    return {"success": True, "data": final_resp}

@router.post("/analyze_text")
async def analyze_incident_text(request: RawTextRequest):
    print(f"DEBUG: RECEIVED DIRECT TEXT LENGTH = {len(request.text)}")
    await manager.send_json({"type": "status", "message": "Initializing vector database..."}, request.client_id)
    await asyncio.to_thread(init_historical_incidents)
    
    initial_state = {
        "raw_text": request.text
    }
    
    loop = asyncio.get_running_loop()
    
    # Run LangGraph workflow in background thread
    result = await asyncio.to_thread(run_incident_graph, initial_state, request.client_id, loop)
    
    final_resp = result.get("final_response", {
        "severity": "Unknown",
        "incident_type": "Unknown",
        "timeline": "Unknown",
        "affected_systems": [],
        "root_causes": [],
        "next_actions": [],
        "llm_thought_process": "Error processing text.",
        "is_new_incident": False
    })
    
    await manager.send_json({"type": "complete", "data": final_resp}, request.client_id)
    return {"success": True, "data": final_resp}
