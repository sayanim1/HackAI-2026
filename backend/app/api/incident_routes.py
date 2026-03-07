from fastapi import APIRouter, UploadFile, File
from ..agents.incident.tools import parse_pdf
from ..agents.incident.graph import incident_app

router = APIRouter()

@router.post("/analyze")
async def analyze_incident_report(file: UploadFile = File(...)):
    # Read PDF text
    file_bytes = await file.read()
    raw_text = parse_pdf(file_bytes)
    
    initial_state = {
        "raw_text": raw_text
    }
    
    # Run LangGraph workflow
    result = incident_app.invoke(initial_state)
    
    return result.get("final_response", {
        "severity": "Unknown",
        "incident_type": "Unknown",
        "timeline": "Unknown",
        "affected_systems": [],
        "root_causes": [],
        "next_actions": [],
        "engineering_summary": "Error processing PDF."
    })
