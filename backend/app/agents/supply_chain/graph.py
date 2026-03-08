import os
import json
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END
from app.agents.supply_chain.state import SupplyChainState
from app.agents.supply_chain.tools import fetch_supply_chain_news, get_alternative_hub, DisruptionAnalysisOutput, run_keyword_baseline
from dotenv import load_dotenv

load_dotenv(".env.local")

# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview",
    temperature=0.2,
    google_api_key=os.getenv("GEMINI_API_KEY")
)

# Bind the output schema
structured_llm = llm.with_structured_output(DisruptionAnalysisOutput)

def fetch_hub_news(state: SupplyChainState) -> SupplyChainState:
    port = state["port"]
    emit = state.get("emit_message", lambda x: None)
    
    emit(json.dumps({"type": "status", "message": f"Querying NewsAPI for recent news about {port}..."}))
    
    articles = fetch_supply_chain_news(port)
    
    if articles:
        msg = f"Found {len(articles)} recent reports regarding {port}. Validating signal vs. noise..."
    else:
        msg = f"No significant disruption reports found for {port}. System is operating normally."
        
    emit(json.dumps({"type": "status", "message": msg}))
    
    return {"news_articles": articles}

def analyze_disruption(state: SupplyChainState) -> SupplyChainState:
    port = state["port"]
    articles = state["news_articles"]
    emit = state.get("emit_message", lambda x: None)
    
    if not articles:
        emit(json.dumps({"type": "status", "message": f"Skipping LLM analysis, no news."}))
        return {"disruption_index": 0.0, "analysis_reasoning": "No relevant disruption news found."}

    baseline_alert, baseline_reasoning, baseline_score = run_keyword_baseline(articles)
    
    emit(json.dumps({"type": "status", "message": f"Analyzing news sentiment and semantic context with Gemini 2.5 Pro..."}))
    
    prompt = f"""
    You are a Supply Chain Risk Analyst.
    Your task is to review the following recent news headlines about the port/region '{port}' and determine a "Disruption Index" score from 0.0 to 1.0. 
    Evaluate "Signal vs. Noise" (e.g. A local strike or typhoon is a signal. A routine port expansion is noise).
    
    We also ran a simple keyword-matching baseline which gave this port a score of {baseline_score:.1f} because: {baseline_reasoning}.
    In your analysis, briefly compare your advanced contextual reasoning to this simple baseline score. Why is your score more accurate?

    News Articles:
    {json.dumps(articles, indent=2)}
    """
    
    result = structured_llm.invoke(prompt)
    
    emit(json.dumps({"type": "status", "message": f"Analysis complete. Disruption Index: {result.disruption_index}"}))
    
    return {
        "disruption_index": result.disruption_index,
        "analysis_reasoning": result.reasoning,
        "baseline_alert": baseline_alert,
        "baseline_score": baseline_score,
        "baseline_reasoning": baseline_reasoning,
        "baseline_comparison": getattr(result, "baseline_comparison", "No comparison provided.")
    }

def decide_action(state: SupplyChainState) -> SupplyChainState:
    port = state["port"]
    index = state["disruption_index"]
    emit = state.get("emit_message", lambda x: None)
    
    if index > 0.75:
        emit(json.dumps({"type": "status", "message": f"CRITICAL ALERT: Index strictly exceeds threshold > 0.75. Finding Alternative Sourcing..."}))
        alt_hub = get_alternative_hub(port)
        action = f"Immediate rerouting recommended to {alt_hub}."
        emit(json.dumps({"type": "status", "message": f"Alternative hub identified: {alt_hub}. Simulating procurement alert."}))
    else:
        alt_hub = "N/A"
        action = "Monitor situation. No rerouting needed."
        
    return {
        "alternative_hub": alt_hub,
        "recommended_action": action
    }

# Build Graph
builder = StateGraph(SupplyChainState)

builder.add_node("fetch_hub_news", fetch_hub_news)
builder.add_node("analyze_disruption", analyze_disruption)
builder.add_node("decide_action", decide_action)

builder.set_entry_point("fetch_hub_news")
builder.add_edge("fetch_hub_news", "analyze_disruption")
builder.add_edge("analyze_disruption", "decide_action")
builder.add_edge("decide_action", END)

supply_chain_graph = builder.compile()
