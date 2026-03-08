from typing import TypedDict, List, Dict, Any
import logging

class MarketAgentState(TypedDict):
    messages: List[Dict[str, str]]
    user_query: str
    ticker: str | None
    sector: str | None
    news_articles: List[Dict[str, str]]
    stock_data: Dict[str, Any]
    sentiments: List[Dict[str, str]]
    signal: str | None
    confidence: int | None
    risk_level: str | None
    final_response: Dict[str, Any] | None

def test_reproduction():
    state: MarketAgentState = {
        "user_query": "What about AAPL?",
        "ticker": "AAPL",
        "sector": "Technology",
        "news_articles": [],
        "sentiments": [],
        "signal": "BUY",
        "confidence": 80,
        "risk_level": "LOW",
    }
    
    # Simulate missing stock_data
    # state["stock_data"] = ... what could it be?
    
    ticker = state.get("ticker", "Market")
    sentiments = state.get("sentiments", [])
    signal = state.get("signal", "HOLD")
    confidence = state.get("confidence", 50)
    risk = state.get("risk_level", "MEDIUM")
    reasoning = "Some reasoning"
    
    # The line that fails:
    try:
        stock_data = state.get("stock_data", {})
        print(f"stock_data type: {type(stock_data)}")
        chart_data = stock_data.get("history", [])
        print("Success!")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_reproduction()
