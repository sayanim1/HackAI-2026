# secrets.py — loaded manually, never touched by pydantic-settings
try:
    from api_secrets import GEMINI_API_KEY, NEWSAPI_KEY
except ImportError:
    GEMINI_API_KEY = ""
    NEWSAPI_KEY = ""
