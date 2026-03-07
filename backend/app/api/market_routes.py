from fastapi import APIRouter
from pydantic import BaseModel
from ..agents.market.graph import market_app

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
async def chat_with_market_agent(request: ChatRequest):
    initial_state = {
        "messages": [{"role": "user", "content": request.message}],
        "user_query": request.message
    }
    
    # Run LangGraph workflow
    result = market_app.invoke(initial_state)
    
    return result.get("final_response", {
        "chat_response": "Error processing request.",
        "signal": "HOLD",
        "confidence": 0,
        "risk": "HIGH",
        "recommendation": "",
        "news": [],
        "chart_data": []
    })
