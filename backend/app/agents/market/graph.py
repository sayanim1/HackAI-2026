from typing import TypedDict, List, Dict, Any, Literal
from langgraph.graph import StateGraph, START, END # type: ignore # pyre-ignore
from pydantic import BaseModel, Field
from google import genai # type: ignore # pyre-ignore
from google.genai import types # type: ignore # pyre-ignore
import os
import json
import logging

from .tools import get_stock_data, get_market_news # type: ignore # pyre-ignore

logger = logging.getLogger(__name__)

# State Definition
class MarketAgentState(TypedDict):
    messages: List[Dict[str, str]]
    user_query: str
    ticker: str | None
    all_tickers: List[str]
    sector: str | None
    news_articles: List[Dict[str, str]]
    stock_data: Dict[str, Any]
    sentiments: List[Dict[str, str]]
    signal: str | None
    confidence: int | None
    risk_level: str | None
    reasoning: str | None
    final_response: Dict[str, Any] | None

# Pydantic schemas for Gemini Structured Output Output
class IntentOutput(BaseModel):
    tickers: List[str] = Field(description="List of up to 3 stock ticker symbols found or inferred from the user query.")
    sector: str = Field(description="The market sector if one is found or implied in the user query.")

class HeadlineSentiment(BaseModel):
    headline: str
    sentiment: str

class SentimentOutput(BaseModel):
    headline_sentiments: List[HeadlineSentiment] = Field(
        description="A list of dictionaries containing 'headline' and 'sentiment' (BULLISH, BEARISH, NEUTRAL).")

class SignalOutput(BaseModel):
    signal: Literal["BUY", "SELL", "HOLD"] = Field(description="The final recommendation signal.")
    confidence: int = Field(description="Confidence percentage (0-100).", ge=0, le=100)
    risk_level: Literal["LOW", "MEDIUM", "HIGH"] = Field(description="The risk level associated with the signal.")
    reasoning: str = Field(description="A plain English reasoning for the signal.")

def _get_gemini_client() -> genai.Client:
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        api_key = "MOCK_KEY"
    return genai.Client(api_key=api_key)

# Node Functions
def intent_node(state: MarketAgentState) -> Dict:
    query = state["user_query"]
    
    # Check if we should use mocked data
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        return {"ticker": "Mock Ticker", "sector": "Mock Sector"}

    client = _get_gemini_client()
    prompt = f"""
Extract the stock tickers and market sector from the following user message:

Message: "{query}"

Instructions:
1. If the user mentions a specific company, return its stock ticker symbol and its market sector.
2. If the user mentions a broad sector or market (e.g., "oil market", "tech sector", "overall market") without a specific company, infer and return the top three most representative stock tickers or ETFs for that sector (e.g., ['XOM', 'CVX', 'USO'] for oil, ['SPY', 'QQQ', 'DIA'] for general market, ['AAPL', 'MSFT', 'NVDA'] for tech) along with the sector name.
3. If no tickers can be inferred at all, leave the list empty, but try your best to provide relevant tickers/ETFs.
"""
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=IntentOutput,
            ),
        )
        data = json.loads(response.text)
        
        # Handle backward compatibility logic
        tickers = data.get("tickers", [])
        
        # Return the first ticker as standard 'ticker' for downstream graph state compatibility + chart,
        # but also pass the full list as 'sector_tickers' or just replace ticker with the first element.
        primary_ticker = tickers[0] if tickers else ""
        
        return {
            "ticker": primary_ticker,
            "sector": data.get("sector", ""),
            "all_tickers": tickers # Adding this to easily format later
        }
    except Exception as e:
        logger.error(f"Intent Error: {e}")
        return {"ticker": None, "sector": None, "all_tickers": []}

def fetch_data_node(state: MarketAgentState) -> Dict:
    ticker = state.get("ticker")
    all_tickers_raw = state.get("all_tickers", [])
    if not isinstance(all_tickers_raw, list):
        all_tickers_raw = []
    all_tickers: List[str] = [str(t) for t in all_tickers_raw]
    sector = state.get("sector")
    
    # Build search query using all tickers if available, else fallback to primary ticker/sector
    if all_tickers:
        top_tickers = [all_tickers[i] for i in range(min(3, len(all_tickers)))]
        query = " OR ".join(top_tickers) # News API handles OR
    elif ticker:
        query = ticker
    else:
        query = sector
        
    news = get_market_news(query=query if query else "finance")
    
    # Print news headlines for visibility in terminal
    print(f"\n--- Fetched News for {query} ---")
    for article in news:
        print(f"Headline: {article.get('title')}")
    print("--------------------------------\n")

    # Only fetch chart data for the top/primary stock
    stock_data = get_stock_data(ticker=ticker) if ticker else {}
    
    if ticker and "current_price" in stock_data:
        print(f"--- Stock Data for {ticker} ---")
        print(f"Current Price: {stock_data.get('current_price')}")
        print("--------------------------------\n")
    
    return {"news_articles": news, "stock_data": stock_data}

def sentiment_node(state: MarketAgentState) -> Dict:
    news = state.get("news_articles", [])
    if not isinstance(news, list) or not news:
        return {"sentiments": []}
        
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        # Mock sentiment
        sentiments = [{"headline": item["title"], "sentiment": "NEUTRAL"} for item in news]
        return {"sentiments": sentiments}
        
    headlines = [item["title"] for item in news]
    prompt = f"Given these news headlines: {headlines}\n\n Classify the news headlines as high impact on stock prices, low impact on stock prices or neutral."
    
    client = _get_gemini_client()
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SentimentOutput,
            ),
        )
        data = json.loads(response.text)
        return {"sentiments": data.get("headline_sentiments", [])}
    except Exception as e:
        logger.error(f"Sentiment Error: {e}")
        return {"sentiments": []}

def signal_node(state: MarketAgentState) -> Dict:
    sentiments = state.get("sentiments", [])
    stock_data = state.get("stock_data", {})
    if not isinstance(stock_data, dict):
        stock_data = {}
    ticker = state.get("ticker", "Market")
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        return {
            "signal": "HOLD",
            "confidence": 50,
            "risk_level": "MEDIUM",
            "reasoning": "Mock reasoning because API keys are not provided."
        }
    
    prompt = f"Ticker/Sector: {ticker}\nSentiments: {sentiments}\nRecent Price Context: {stock_data.get('current_price', 'N/A')}\n\nDetermine BUY/SELL/HOLD signal, confidence percentage, risk level, and reasoning."
    
    client = _get_gemini_client()
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=SignalOutput,
            ),
        )
        data = json.loads(response.text)
        return {
            "signal": data.get("signal", "HOLD"),
            "confidence": data.get("confidence", 50),
            "risk_level": data.get("risk_level", "MEDIUM"),
            "reasoning": data.get("reasoning", "No clear reasoning.")
        }
    except Exception as e:
        logger.error(f"Signal Error: {e}")
        return {
            "signal": "HOLD",
            "confidence": 0,
            "risk_level": "HIGH",
            "reasoning": "Error generating signal."
        }

def response_node(state: MarketAgentState) -> Dict:
    ticker = state.get("ticker", "Market")
    all_tickers_raw = state.get("all_tickers", [])
    if not isinstance(all_tickers_raw, list):
        all_tickers_raw = []
    all_tickers: List[str] = [str(t) for t in all_tickers_raw]
    sentiments = state.get("sentiments", [])
    if not isinstance(sentiments, list):
        sentiments = []
    
    # Format news bullets with sentiment formatting
    news_bullets = []
    for s in sentiments:
        if isinstance(s, dict):
            emoji = "🟢" if s.get("sentiment") == "BULLISH" else "🔴" if s.get("sentiment") == "BEARISH" else "🟡"
            news_bullets.append(f"• {s.get('headline', 'News')} -> {emoji}")
    
    signal = state.get("signal", "HOLD")
    confidence = state.get("confidence", 50)
    risk = state.get("risk_level", "MEDIUM")
    reasoning = state.get("reasoning", "")
    stock_data = state.get("stock_data", {})
    if not isinstance(stock_data, dict):
        stock_data = {}
        
    ticker_display = ", ".join(all_tickers[:3]) if len(all_tickers) > 1 else ticker # type: ignore # pyre-ignore
    
    # Format the chat response clearly including the reasoning
    chat_reply = f"Based on recent news and trends, {ticker_display} shows roughly {signal} signals.\n\nReasoning: {reasoning}"
    
    chart_data = stock_data.get("history", [])

    final_response = {
        "chat_response": chat_reply,
        "signal": signal,
        "confidence": confidence,
        "risk": risk,
        "recommendation": reasoning,
        "news": news_bullets,
        "chart_data": chart_data
    }
    
    return {"final_response": final_response}

# Graph Construction
workflow = StateGraph(MarketAgentState)

workflow.add_node("intent", intent_node)
workflow.add_node("fetch_data", fetch_data_node)
workflow.add_node("sentiment", sentiment_node)
workflow.add_node("signal", signal_node)
workflow.add_node("response", response_node)

workflow.add_edge(START, "intent")
workflow.add_edge("intent", "fetch_data")
workflow.add_edge("fetch_data", "sentiment")
workflow.add_edge("sentiment", "signal")
workflow.add_edge("signal", "response")
workflow.add_edge("response", END)

market_app = workflow.compile()
