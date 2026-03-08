import json
import os
import requests
from pydantic import BaseModel, Field
from newsapi import NewsApiClient
from datetime import datetime, timedelta
import sys

# Ensure backend root is in search path for api_secrets
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if backend_root not in sys.path:
    sys.path.append(backend_root)

# Load the industry mapping
INDUSTRY_MAP_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "industry_map.json")

def get_alternative_hub(port_name: str) -> str:
    """Gets the alternative hub and industry info from the local JSON map."""
    try:
        with open(INDUSTRY_MAP_PATH, "r") as f:
            data = json.load(f)
            mapping = data.get("top_20_global_ports_mapping", {})
            port_info = mapping.get(port_name.replace(" ", "_"), {})
            return port_info.get("alternative_hub", "Unknown Alternative Hub")
    except Exception as e:
        print(f"Error reading industry_map.json: {e}")
        return "Unknown Alternative Hub"

def fetch_supply_chain_news(port: str) -> list[dict[str, str]]:
    """
    Fetches real news articles regarding global supply chains, strikes, weather, etc., from NewsAPI.
    """
    try:
        from api_secrets import NEWSAPI_KEY
        api_key = NEWSAPI_KEY
    except ImportError:
        api_key = os.getenv("NEWSAPI_KEY")
        
    if not api_key or api_key == "your_newsapi_key_here":
        return [{"title": "Mock Supply Chain News", "url": "", "date": "Today", "domain": "Mock Source"}]

    try:
        newsapi = NewsApiClient(api_key=api_key)
        
        # Free tier only allows up to 1 month ago
        from_date = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
        # NewsAPI query syntax
        query = f'({port} AND (strike OR typhoon OR hurricane OR congestion OR delay OR crash OR disruption OR protest))'
        
        all_articles = newsapi.get_everything(
            q=query,
            from_param=from_date,
            language='en',
            sort_by='relevancy',
            page_size=5
        )
        
        articles = all_articles.get('articles', [])
        
        parsed_articles = []
        for art in articles:
            parsed_articles.append({
                "title": art.get("title", ""),
                "url": art.get("url", ""),
                "date": art.get("publishedAt", ""),
                "domain": art.get("source", {}).get("name", "")
            })
            
        return parsed_articles
    except Exception as e:
        print(f"NewsAPI fetch error: {e}")
        return []

def run_keyword_baseline(articles: list[dict[str, str]]) -> tuple[bool, str, float]:
    """
    A heuristic keyword-based baseline. Triggers an alert if it sees disruption keywords,
    but attempts to adjust the score up or down based on basic contextual/sentiment keywords.
    """
    disruption_keywords = ["strike", "typhoon", "hurricane", "congestion", "delay", "crash", "disruption", "protest", "storm"]
    escalating_keywords = ["imminent", "starts", "worsens", "halts", "blocks", "shuts", "severe", "critical", "warning"]
    mitigating_keywords = ["averted", "resolved", "ended", "over", "missed", "cleared", "avoided", "reopens", "resumes"]
    
    score = 0.0
    matched_reasons = []

    for article in articles:
        title = article.get("title", "").lower()
        active_disruptions = [kw for kw in disruption_keywords if kw in title]
        
        if active_disruptions:
            for kw in active_disruptions:
                # Base point for disruption
                event_score = 0.2
                context_notes = []
                
                # Check context modifiers nearby in the title
                if any(esc in title for esc in escalating_keywords):
                    event_score = event_score + 0.2
                    context_notes.append("escalated")
                if any(mit in title for mit in mitigating_keywords):
                    event_score = event_score - 0.3 # Subtracting more aggressively if it's resolved/averted
                    context_notes.append("mitigated")

                # Track the final math
                score = score + event_score
                
                context_str = f"({','.join(context_notes)})" if context_notes else "(baseline)"
                reason = f"{kw} {context_str}: {event_score:+.1f}"
                if reason not in matched_reasons:
                    matched_reasons.append(reason)

    # Bound the score between 0.0 and 1.0
    score = max(0.0, min(score, 1.0))
    
    if score > 0.0:
        return True, f"Detection logic: {', '.join(matched_reasons)}. Final score limited to {score:.1f}", score
                
    if matched_reasons:
        return False, f"Disruptions detected but fully mitigated: {', '.join(matched_reasons)}. Score net 0.0", 0.0
        
    return False, "No disruption keywords detected in recent headlines. Heuristic score 0.0", 0.0

class DisruptionAnalysisOutput(BaseModel):
    disruption_index: float = Field(description="A score between 0.0 and 1.0 indicating signal noise vs actual supply chain disruption. 0.0 is perfect operation, 1.0 is total shutdown.")
    reasoning: str = Field(description="A brief summary of why this score was assigned based on the news.")
    baseline_comparison: str = Field(description="Explicitly compare and contrast your Disruption Index reasoning against the provided naive baseline score.")