from fastapi import APIRouter # type: ignore # pyre-ignore
from pydantic import BaseModel   # type: ignore # pyre-ignore
from app.agents.market.graph import market_app # type: ignore # pyre-ignore

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

def format_market_data(state: dict) -> dict:
    stock_data = state.get("stock_data", {})
    if not isinstance(stock_data, dict):
        stock_data = {}
        
    ticker = state.get("ticker", "Market")
    current_price = stock_data.get("current_price", 0.0)
    history = stock_data.get("history", [])
    if not isinstance(history, list): history = []
    
    # Calculate price change
    if len(history) >= 2:
        prev_close = history[-2]["close"]
        change_amt = current_price - prev_close
        change_pct = (change_amt / prev_close) * 100 if prev_close else 0
        sign = "+" if change_amt >= 0 else ""
        change_str = f"{sign}{change_pct:.2f}%"
        change_amt_str = f"{sign}${abs(change_amt):.2f}"
    else:
        change_str = "0.00%"
        change_amt_str = "$0.00"

    # Map chart data to match UI layout
    chart = []
    for h in history[-30:]:
        # UI area chart expects { time, price }
        chart.append({
            "time": h.get("date", "")[5:], # Strip year for cleaner axis
            "price": round(h.get("close", 0), 2)
        })

    # Financial Info
    financials = {
        "marketCap": stock_data.get("market_cap", "N/A"),
        "peRatio": stock_data.get("pe_ratio", "N/A"),
        "dividendYield": stock_data.get("dividend_yield", "N/A"),
        "wkHigh52": stock_data.get("wk_high_52", "N/A"),
        "wkLow52": stock_data.get("wk_low_52", "N/A"),
        "signal": state.get("signal", "HOLD"),
        "confidence": f"{state.get('confidence', 50)}%"
    }

    # News Formatting
    raw_news = state.get("news_articles", [])
    if not isinstance(raw_news, list): raw_news = []
    
    sentiments = state.get("sentiments", [])
    if not isinstance(sentiments, list): sentiments = []
    
    news = []
    for i, article in enumerate(raw_news[:3]):
        sentiment_str = "NEUTRAL"
        if i < len(sentiments) and isinstance(sentiments[i], dict):
            sentiment_str = sentiments[i].get("sentiment", "NEUTRAL")
        
        impact = "MED IMPACT"
        impact_class = "bg-orange-50 text-orange-600"
        price_effect = "+0.0%"
        
        if sentiment_str == "BULLISH":
            impact = "HIGH IMPACT"
            impact_class = "bg-emerald-50 text-emerald-600"
            price_effect = "+2.5%"
        elif sentiment_str == "BEARISH":
            impact = "HIGH IMPACT"
            impact_class = "bg-red-50 text-red-600"
            price_effect = "-2.5%"
            
        news.append({
            "title": article.get("title", ""),
            "time": "Today",
            "impact": impact,
            "impactClass": impact_class,
            "priceEffect": price_effect
        })

    return {
        "ticker": stock_data.get("ticker", ticker),
        "companyName": stock_data.get("company_name", ticker),
        "price": current_price,
        "change": change_str,
        "changeAmount": change_amt_str,
        "financials": financials,
        "news": news,
        "chart": chart
    }

@router.get("/")
def get_market(q: str = ""):
    query = q.lower() if q else "NVDA"
    initial_state = {
        "messages": [{"role": "user", "content": f"Analyze the market for {query}"}],
        "user_query": f"Analyze the market for {query}"
    }
    
    print(f"Triggering initial market scan for {query}...")
    result = market_app.invoke(initial_state)
    market_data = format_market_data(result)
    
    return {"success": True, "data": market_data, "message": f"Here is the latest data for {query}."}

@router.post("/chat")
async def chat_with_market_agent(request: ChatRequest):
    initial_state = {
        "messages": [{"role": "user", "content": request.message}],
        "user_query": request.message
    }
    
    # Run LangGraph workflow
    result = market_app.invoke(initial_state)
    agent_output = result.get("final_response", {})
    chat_reply = agent_output.get("chat_response", "I could not process that request.")
    
    market_data = format_market_data(result)
    
    return {
        "reply": chat_reply,
        "data": market_data,
        "structured_data": agent_output
    }
