import yfinance as yf
from newsapi import NewsApiClient
import os
import pandas as pd
from typing import Dict, List, Any
from datetime import datetime, timedelta

def get_stock_data(ticker: str, period: str = "1mo") -> Dict[str, Any]:
    """
    Fetches OHLCV data using yfinance for a given ticker.
    """
    try:
        stock = yf.Ticker(ticker)
        hist = stock.history(period=period)
        
        if hist.empty:
            return {"error": f"No data found for ticker {ticker}"}
            
        # Add moving averages for charts
        hist['MA5'] = hist['Close'].rolling(window=5).mean()
        hist['MA20'] = hist['Close'].rolling(window=20).mean()
        
        # Keep only the last 30 days of data and convert to dict for JSON serialization
        records = []
        for date, row in hist.tail(30).iterrows():
            records.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": row["Open"],
                "high": row["High"],
                "low": row["Low"],
                "close": row["Close"],
                "volume": row["Volume"],
                "ma5": row["MA5"] if not pd.isna(row["MA5"]) else None,
                "ma20": row["MA20"] if not pd.isna(row["MA20"]) else None
            })
            
        current_price = hist['Close'].iloc[-1]
        
        return {
            "ticker": ticker,
            "current_price": current_price,
            "history": records
        }
    except Exception as e:
        return {"error": str(e)}

def get_market_news(query: str, limit: int = 5) -> List[Dict[str, str]]:
    """
    Fetches recent news using NewsAPI for a given query (ticker or sector).
    """
    api_key = os.getenv("NEWSAPI_KEY")
    if not api_key or api_key == "your_newsapi_key_here":
        return [{"title": "Mock News Title", "source": "Mock Source", "snippet": "Mock Snippet due to missing API key."}]
        
    try:
        newsapi = NewsApiClient(api_key=api_key)
        
        # Free tier only allows up to 1 month ago
        from_date = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
        
        all_articles = newsapi.get_everything(
            q=query,
            from_param=from_date,
            language='en',
            sort_by='relevancy',
            page_size=limit
        )
        
        articles = all_articles.get('articles', [])
        
        result = []
        for article in articles:
            result.append({
                "title": article.get("title"),
                "source": article.get("source", {}).get("name"),
                "snippet": article.get("description", "")
            })
            
        return result
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []
