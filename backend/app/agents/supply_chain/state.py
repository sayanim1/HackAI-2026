from typing import TypedDict, Callable, Any

class SupplyChainState(TypedDict):
    port: str
    news_articles: list[dict[str, str]]
    disruption_index: float
    analysis_reasoning: str
    alternative_hub: str
    recommended_action: str
    emit_message: Callable[[str], Any]
    error: str
