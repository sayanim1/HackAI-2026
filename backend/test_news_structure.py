from app.agents.market.tools import get_market_news
from dotenv import load_dotenv
import os
import json

# Load environment variables
load_dotenv(".env.local")

# Set up test query
query = "finance"
print(f"Fetching news for: {query}")

# Fetch news
news = get_market_news(query=query, limit=3)

# Print results
if not news:
    print("No news found. Checking if API key is valid or limit reached.")
else:
    print(json.dumps(news, indent=2))
