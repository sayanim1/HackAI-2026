import os
import sys
import json
from typing import List, Dict, Any
from datetime import datetime

# Ensure backend root is in search path for api_secrets
backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
if backend_root not in sys.path:
    sys.path.append(backend_root)

from google import genai
from google.genai import types
from .tools import get_market_news

SECTORS = ["Technology", "Finance", "Energy"]

def get_sector_recommendations() -> List[Dict[str, Any]]:
    """
    Fetches news for all predefined sectors and uses Gemini to provide 
    Buy/Watch recommendations for each.
    """
    try:
        from api_secrets import GEMINI_API_KEY
        api_key = GEMINI_API_KEY
    except ImportError:
        api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return [{"sector": s, "signal": "WATCH", "reasoning": "Missing API Key"} for s in SECTORS]

    client = genai.Client(api_key=api_key)
    
    sector_news_map = {}
    for sector in SECTORS:
        print(f"DEBUG: Fetching news for alert: {sector}")
        news = get_market_news(query=f"{sector} sector market news", limit=3)
        headlines = [n["title"] for n in news] if news else []
        if headlines:
            sector_news_map[sector] = headlines

    if not sector_news_map:
        return [{"sector": s, "signal": "WATCH", "reasoning": "No news found currently."} for s in SECTORS]

    prompt = f"""
    You are a Wall Street analyst. Analyze recent news for the following market sectors and provide a recommendation for each.
    
    Sector Data:
    {json.dumps(sector_news_map, indent=2)}
    
    For EACH sector provided above, return:
    1. 'sector': (name)
    2. 'signal': (BUY, SELL, or WATCH)
    3. 'reasoning': (one concise sentence)
    
    Return the result as a JSON object with a list called 'recommendations'.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash', # Using 2.0-flash as it's more stable for batching
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        print(f"DEBUG: Batch Alert Gemini Response: {response.text}")
        data = json.loads(response.text)
        recommendations = data.get("recommendations", [])
        
        # Ensure we return something for all sectors even if Gemini missed one
        final_results = []
        rec_map = {r.get("sector"): r for r in recommendations if r.get("sector")}
        
        for sector in SECTORS:
            if sector in rec_map:
                final_results.append(rec_map[sector])
            else:
                final_results.append({
                    "sector": sector,
                    "signal": "WATCH",
                    "reasoning": "Sector-specific analysis unavailable."
                })
        return final_results

    except Exception as e:
        print(f"Error in batch sector analysis: {e}")
        return [{"sector": s, "signal": "ERROR", "reasoning": str(e)} for s in SECTORS]
