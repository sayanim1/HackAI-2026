from typing import TypedDict, List, Dict, Any, Literal
from langgraph.graph import StateGraph, START, END # type: ignore # pyre-ignore
from pydantic import BaseModel, Field
from google import genai # type: ignore # pyre-ignore
from google.genai import types
import os
import json
import logging

from .tools import retrieve_similar_incidents # type: ignore # pyre-ignore

logger = logging.getLogger(__name__)

# State Definition
class IncidentState(TypedDict):
    raw_text: str
    historical_context: List[str]
    is_new_incident: bool
    final_response: Dict[str, Any] | None

# Pydantic schema for the optimized Single-Call LLM architecture
class RootCauseItem(BaseModel):
    cause: str = Field(description="The predicted root cause.")
    confidence: int = Field(description="Confidence percentage (0-100).", ge=0, le=100)

class ComprehensiveOutput(BaseModel):
    severity: str = Field(description="The severity of the incident.")
    incident_type: str = Field(description="The category/type of the incident.")
    timeline: str = Field(description="A brief timeline or temporal span of the incident.")
    affected_systems: List[str] = Field(description="List of affected system components.")
    root_causes: List[RootCauseItem] = Field(description="List of predicted root causes and their confidences.")
    next_actions: List[str] = Field(description="Ordered list of recommended next steps to triage and resolve the issue.")
    engineering_summary: str = Field(description="A formal engineering brief detailing the incident.")
    llm_thought_process: str = Field(description="The LLM's thought process explaining why it assigned the given severity, how it searched from the given knowledge base context, and how it calculated the confidence.")

def _get_gemini_client() -> genai.Client:
    try:
        from api_secrets import GEMINI_API_KEY
        api_key = GEMINI_API_KEY
    except ImportError:
        api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        api_key = "MOCK_KEY"
    return genai.Client(api_key=api_key)

# Nodes
def rag_node(state: IncidentState) -> Dict:
    text = state.get("raw_text", "")
    historical_results = retrieve_similar_incidents(text)
    
    context_docs = []
    is_new_incident = True
    
    if historical_results:
        best_distance = historical_results[0]["distance"]
        similarity = 1.0 - best_distance
        if similarity >= 0.70:
            is_new_incident = False
        context_docs = [res["doc"] for res in historical_results]

    return {"historical_context": context_docs, "is_new_incident": is_new_incident}

def analyzer_node(state: IncidentState) -> Dict:
    text = state.get("raw_text", "")
    historical = state.get("historical_context", [])
    is_new = state.get("is_new_incident", False)
    
    try:
        from api_secrets import GEMINI_API_KEY
        api_key = GEMINI_API_KEY
    except ImportError:
        api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return {"final_response": {
            "severity": "Unknown",
            "incident_type": "Unknown",
            "timeline": "Unknown",
            "affected_systems": [],
            "root_causes": [],
            "next_actions": [],
            "engineering_summary": "Mock summary due to missing API key.",
            "llm_thought_process": "Mock reasoning.",
            "is_new_incident": is_new
        }}

    prompt = f"Analyze the following incident report:\n{text}\n\n"
    if is_new:
        prompt += "NOTE: This appears to be a NEW incident with no strong historical matches. Determine the most likely root causes based purely on the reported text.\n\n"
        if historical:
             prompt += f"For loose reference, here are some past incidents:\n{historical}\n\n"
    else:
        prompt += f"Similar past incidents from our knowledge base:\n{historical}\n\n"
        
    prompt += "Extract all necessary fields including a formal engineering summary and your step-by-step reasoning for calculating severity and confidence."
    
    client = _get_gemini_client()
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=ComprehensiveOutput,
            ),
        )
        data = json.loads(response.text)
        
        final_response = {
            "severity": data.get("severity", "Unknown"),
            "incident_type": data.get("incident_type", "Unknown"),
            "timeline": data.get("timeline", "Unknown"),
            "affected_systems": data.get("affected_systems", []),
            "root_causes": data.get("root_causes", []),
            "next_actions": data.get("next_actions", []),
            "engineering_summary": data.get("engineering_summary", "Summary unavailable."),
            "llm_thought_process": data.get("llm_thought_process", "Reasoning unavailable."),
            "is_new_incident": is_new
        }
        
        summary_str = str(final_response["engineering_summary"])
        if is_new and not summary_str.startswith("🚨"):
             final_response["engineering_summary"] = "🚨 The following are estimated predictions.\n\n" + summary_str
             
        return {"final_response": final_response}
    except Exception as e:
        logger.error(f"Analyzer Error: {e}")
        return {"final_response": {
            "severity": "Error",
            "incident_type": "Error",
            "timeline": "Error",
            "affected_systems": [],
            "root_causes": [],
            "next_actions": [],
            "engineering_summary": "Error generating analysis.",
            "llm_thought_process": str(e),
            "is_new_incident": is_new
        }}

# Graph Construction
workflow = StateGraph(IncidentState)

workflow.add_node("rag", rag_node)
workflow.add_node("analyzer", analyzer_node)

workflow.add_edge(START, "rag")
workflow.add_edge("rag", "analyzer")
workflow.add_edge("analyzer", END)

incident_app = workflow.compile()
