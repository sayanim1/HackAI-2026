import yfinance as yf # type: ignore # pyre-ignore
from newsapi import NewsApiClient # type: ignore # pyre-ignore
import os # type: ignore # pyre-ignore
import pandas as pd # type: ignore # pyre-ignore
from typing import Dict, List, Any # type: ignore # pyre-ignore
from datetime import datetime, timedelta # type: ignore # pyre-ignore
from google import genai # type: ignore # pyre-ignore
from google.genai import types # type: ignore # pyre-ignore
import json

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
        info = stock.info
        
        def format_large_number(num):
            if num == "N/A" or num is None: return "N/A"
            try:
                n = float(num)
                if n >= 1e12: return f"{n/1e12:.2f}T"
                if n >= 1e9: return f"{n/1e9:.2f}B"
                if n >= 1e6: return f"{n/1e6:.2f}M"
                return str(n)
            except:
                return str(num)

        return {
            "ticker": ticker,
            "current_price": current_price,
            "company_name": info.get("shortName", ticker),
            "market_cap": format_large_number(info.get("marketCap")),
            "pe_ratio": round(info.get("trailingPE", 0), 2) if info.get("trailingPE") else "N/A",
            "dividend_yield": f"{round(info.get('dividendYield', 0) * 100, 2)}%" if info.get("dividendYield") else "N/A",
            "wk_high_52": round(info.get("fiftyTwoWeekHigh", 0), 2) if info.get("fiftyTwoWeekHigh") else "N/A",
            "wk_low_52": round(info.get("fiftyTwoWeekLow", 0), 2) if info.get("fiftyTwoWeekLow") else "N/A",
            "history": records
        }
    except Exception as e:
        return {"error": str(e)}

def get_market_news(query: str, limit: int = 10, filter_keywords: List[str] = None) -> List[Dict[str, str]]:
    """
    Fetches recent news using NewsAPI for a given query (ticker or sector).
    Filters results to ensure they contain at least one of the filter_keywords if provided.
    """
    try:
        from api_secrets import NEWSAPI_KEY
        api_key = NEWSAPI_KEY
    except ImportError:
        api_key = os.getenv("NEWSAPI_KEY")

    if not api_key or api_key == "your_newsapi_key_here":
        return [{"title": "Mock News Title", "source": "Mock Source", "snippet": "Mock Snippet due to missing API key."}]
        
    try:
        newsapi = NewsApiClient(api_key=api_key)
        
        # Free tier only allows up to 1 month ago
        from_date = (datetime.now() - timedelta(days=28)).strftime('%Y-%m-%d')
        
        # Fetch more than the limit to allow for filtering
        fetch_limit = limit * 2 if filter_keywords else limit
        
        all_articles = newsapi.get_everything(
            q=query,
            from_param=from_date,
            language='en',
            sort_by='relevancy',
            page_size=min(fetch_limit, 100)
        )
        
        articles = all_articles.get('articles', [])
        
        result = []
        for article in articles:
            title = article.get("title") or ""
            snippet = article.get("description") or ""
            
            # Filtering logic
            if filter_keywords:
                matched = False
                for kw in filter_keywords:
                    if kw.lower() in title.lower() or kw.lower() in snippet.lower():
                        matched = True
                        break
                if not matched:
                    continue
            
            result.append({
                "title": title,
                "source": article.get("source", {}).get("name"),
                "snippet": snippet
            })
            
            if len(result) >= limit:
                break
                
        return result
    except Exception as e:
        print(f"Error fetching news: {e}")
        return []

def classify_news_impact(headlines: List[str]) -> List[Dict[str, str]]:
    """
    Classifies a list of news headlines as HIGH-IMPACT, LOW-IMPACT, or NEUTRAL.
    """
    try:
        from api_secrets import GEMINI_API_KEY
        api_key = GEMINI_API_KEY
    except ImportError:
        api_key = os.getenv("GEMINI_API_KEY")

    if not api_key or api_key == "your_gemini_api_key_here":
        return [{"headline": h, "impact": "NEUTRAL"} for h in headlines]

    client = genai.Client(api_key=api_key)
    
    prompt = f"""
    You are a seasoned Wall Street financial analyst. 
    Classify the following news headlines based on their potential impact on the stock market.
    
    Categories:
    - HIGH-IMPACT: Major earnings, M&A, Fed decisions, CEO changes, guidance revisions.
    - LOW-IMPACT: Analyst reiterations, minor partnerships, routine filings.
    - NEUTRAL: General commentary, unrelated macro news, opinion pieces.
    
    Headlines:
    {headlines}
    
    Return the result as a JSON object with a list 'classifications' containing objects with 'headline' and 'impact'.
    """

    class ClassificationResult(Any): # Dummy for schema reference if needed, but we'll use raw schema
        pass

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        data = json.loads(response.text)
        return data.get("classifications", [])
    except Exception as e:
        print(f"Error classifying news: {e}")
        return [{"headline": h, "impact": "NEUTRAL"} for h in headlines]
