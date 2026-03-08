from typing import TypedDict, List, Dict, Any, Literal
from langgraph.graph import StateGraph, START, END
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
import os
import json
import logging

from .tools import retrieve_similar_incidents

logger = logging.getLogger(__name__)

# State Definition
class IncidentState(TypedDict):
    raw_text: str
    affected_systems: List[str]
    timeline: str
    symptoms: List[str]
    severity: str
    incident_type: str
    historical_context: List[str]
    root_causes: List[Dict[str, Any]]
    next_actions: List[str]
    engineering_summary: str
    is_new_incident: bool
    final_response: Dict[str, Any] | None

# Pydantic schemas for Gemini Structured Output Output
class ExtractionOutput(BaseModel):
    affected_systems: List[str] = Field(description="List of affected system components.")
    timeline: str = Field(description="A brief timeline or temporal span of the incident.")
    symptoms: List[str] = Field(description="List of observed symptoms.")
    severity: Literal["P0 — Critical", "P1 — High", "P2 — Medium", "P3 — Low"] = Field(description="The severity of the incident.")
    incident_type: str = Field(description="The category/type of the incident (e.g., Auth Outage, Database Failure).")

class RootCauseOutput(BaseModel):
    root_causes: List[Dict[str, Any]] = Field(description="List of dictionaries with 'cause' (str) and 'confidence' (int 0-100).")

class ActionPlannerOutput(BaseModel):
    next_actions: List[str] = Field(description="Ordered list of recommended next steps.")

class SummaryOutput(BaseModel):
    engineering_summary: str = Field(description="A formal engineering brief detailing the incident.")

def _get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        api_key = "MOCK_KEY"
    return genai.Client(api_key=api_key)

# Nodes
def extraction_node(state: IncidentState) -> Dict:
    text = state.get("raw_text", "")
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {
            "affected_systems": ["Mock System A", "Mock System B"],
            "timeline": "Mock Timeline: 12:00-12:15",
            "symptoms": ["Mock 500 errors"],
            "severity": "P0 — Critical",
            "incident_type": "Mock Auth Outage"
        }

    prompt = f"Extract structured information from the following incident report:\n\n{text}"
    client = _get_gemini_client()
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ExtractionOutput,
            ),
        )
        data = json.loads(response.text)
        return {
            "affected_systems": data.get("affected_systems", []),
            "timeline": data.get("timeline", "Unknown"),
            "symptoms": data.get("symptoms", []),
            "severity": data.get("severity", "Unknown severity"),
            "incident_type": data.get("incident_type", "Unknown type")
        }
    except Exception as e:
        logger.error(f"Extraction Error: {e}")
        return {
            "affected_systems": [], "timeline": "Error", "symptoms": [],
            "severity": "Unknown", "incident_type": "Error"
        }

def rag_node(state: IncidentState) -> Dict:
    symptoms = " ".join(state.get("symptoms", []))
    incident_type = state.get("incident_type", "")
    query = f"{incident_type} {symptoms}"
    
    historical_results = retrieve_similar_incidents(query)
    
    # Check similarity to determine if this is a "new incident".
    # Distance in Chroma typically represents L2 or Cosine distance (0.0 means perfect match).
    # We convert it to a rough similarity score (1.0 = 100% similar)
    context_docs = []
    is_new_incident = True
    
    if historical_results:
        best_distance = historical_results[0]["distance"]
        similarity = 1.0 - best_distance
        
        # Threshold: Calculate if similarities >= 70%
        if similarity >= 0.70:
            is_new_incident = False
            
        context_docs = [res["doc"] for res in historical_results]

    return {"historical_context": context_docs, "is_new_incident": is_new_incident}

def root_cause_node(state: IncidentState) -> Dict:
    text = state.get("raw_text", "")
    historical = state.get("historical_context", [])
    is_new = state.get("is_new_incident", False)
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"root_causes": [{"cause": "Mock DB failure", "confidence": 85}]}

    prompt = f"Based on the following incident report:\n{text}\n\n"
    if is_new:
        prompt += "NOTE: This appears to be a NEW incident with no strong historical matches. However, you should still determine the most likely possible root causes based purely on the reported text.\n\n"
        if historical:
             prompt += f"For loose reference, here are some past incidents:\n{historical}\n\n"
    else:
        prompt += f"And these similar past incidents:\n{historical}\n\n"
        
    prompt += "Determine the most likely root causes and assign a confidence percentage to each."
    client = _get_gemini_client()
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RootCauseOutput,
            ),
        )
        data = json.loads(response.text)
        return {"root_causes": data.get("root_causes", [])}
    except Exception as e:
        logger.error(f"Root Cause Error: {e}")
        return {"root_causes": []}

def action_planner_node(state: IncidentState) -> Dict:
    causes = state.get("root_causes", [])
    systems = state.get("affected_systems", [])
    is_new = state.get("is_new_incident", False)
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return {"next_actions": ["1. Check mock logs", "2. Page on-call"]}

    prompt = f"Given these potential root causes: {causes}\nAnd affected systems: {systems}\n\n"
    if is_new:
         prompt += "NOTE: This is considered a NEW INCIDENT type, so please recommend standard initial triage steps and safely general actions since there is no established playbook for this exactly.\n\n"
    prompt += "Determine an ordered list of recommended next actions to triage and resolve the issue."
    client = _get_gemini_client()
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ActionPlannerOutput,
            ),
        )
        data = json.loads(response.text)
        return {"next_actions": data.get("next_actions", [])}
    except Exception as e:
        logger.error(f"Action Planner Error: {e}")
        return {"next_actions": []}

def summarizer_node(state: IncidentState) -> Dict:
    systems = state.get("affected_systems", [])
    timeline = state.get("timeline", "")
    symptoms = state.get("symptoms", [])
    severity = state.get("severity", "")
    incident_type = state.get("incident_type", "")
    is_new = state.get("is_new_incident", False)
    
    # Format the dictionary response for the frontend
    final_response = {
        "severity": severity,
        "incident_type": incident_type,
        "timeline": timeline,
        "affected_systems": systems,
        "root_causes": state.get("root_causes", []),
        "next_actions": state.get("next_actions", []),
        "is_new_incident": is_new
    }
    
    # Optional prefix if new
    prefix_msg = "🚨 This appears to be a new incident type. The following are estimated predictions.\n\n" if is_new else ""
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        final_response["engineering_summary"] = "Mock Engineering Summary:\nINCIDENT: ...\nTIME: ..."
        return {"engineering_summary": final_response["engineering_summary"], "final_response": final_response}

    prompt = f"Draft an auto-generated engineering summary brief for an incident.\n"
    if is_new:
        prompt += f"IMPORTANT: Include a strong disclaimer at the top stating this is a NEW INCIDENT and the causes/actions are predicted.\n"
    
    prompt += f"Details:\nType: {incident_type}\nSeverity: {severity}\nTimeline: {timeline}\nAffected systems: {systems}\nSymptoms: {symptoms}\n\nInclude sections for INCIDENT, TIME, PRIORITY, OWNER (guess based on type), SYMPTOMS, and IMPACT."
    client = _get_gemini_client()
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SummaryOutput,
            ),
        )
        data = json.loads(response.text)
        summary = data.get("engineering_summary", "Summary unavailable.")
        if is_new and not summary.startswith("🚨"):
             summary = prefix_msg + summary
        final_response["engineering_summary"] = summary
        return {"engineering_summary": summary, "final_response": final_response}
    except Exception as e:
        logger.error(f"Summarizer Error: {e}")
        final_response["engineering_summary"] = "Error generating summary."
        return {"engineering_summary": "Error generating summary.", "final_response": final_response}

# Graph Construction
workflow = StateGraph(IncidentState)

workflow.add_node("extractor", extraction_node)
workflow.add_node("rag", rag_node)
workflow.add_node("root_cause", root_cause_node)
workflow.add_node("action_planner", action_planner_node)
workflow.add_node("summarizer", summarizer_node)

workflow.add_edge(START, "extractor")
workflow.add_edge("extractor", "rag")
workflow.add_edge("rag", "root_cause")
workflow.add_edge("root_cause", "action_planner")
workflow.add_edge("action_planner", "summarizer")
workflow.add_edge("summarizer", END)

incident_app = workflow.compile()
