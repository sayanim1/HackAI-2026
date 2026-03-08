# NexusFlow Backend

A multi-agent intelligence backend powering four AI pipelines:
**Market Intelligence · Incident Analyst · Supply Chain Domino · Sector Intelligence (Autonomous)**

Built with **FastAPI + LangGraph + Gemini 2.5 Flash + ChromaDB**.

---

## Agents

### 1. 📈 Market Intelligence Agent
Accepts natural language queries about stocks or sectors and returns a structured `BUY / SELL / HOLD` signal.

- **Pipeline**: Intent extractor → News fetcher (NewsAPI) + Price fetcher (yfinance) → Sentiment analyzer → Signal generator
- **Output**: Signal enum, confidence %, risk level, reasoning, price chart data
- **LLM**: Gemini 2.5 Flash (Pydantic-constrained structured output)
- **Route**: `POST /api/market/chat`

### 2. 🛡️ Incident Analyst Agent
Triages raw incident log text into a structured engineering brief with root causes and next actions.

- **Pipeline**: Raw text input → ChromaDB RAG retrieval → Gemini analyzer (single call, ComprehensiveOutput schema)
- **Output**: Severity, affected systems, root causes with confidence %, next actions, engineering summary
- **LLM**: Gemini 2.5 Flash
- **Vector DB**: ChromaDB (local persistent, collection: `financial_incidents`)
- **RAG threshold**: cosine similarity ≥ 0.70 → historical match; < 0.70 → new incident path
- **Route**: `POST /api/incident/analyze`

### 3. 🌍 Supply Chain Domino Agent
Forecasts cascading supply chain disruptions using live GDELT event data.

- **Pipeline**: Country input → GDELT live CSV fetch → Keyword baseline scan → Gemini disruption index computation
- **Output**: Disruption Index (0.0–1.0), affected hubs, cascade predictions
- **Decision gate**: `disruption_index > 0.75` → triggers email re-routing modal on the frontend
- **Route**: `POST /api/supply-chain/analyze`

### 4. 🔔 Sector Intelligence Agent (Autonomous)
Runs every 12 hours without any user input. Fetches live sector news, generates signals, and dispatches an HTML email report.

- **Sectors**: Technology, Finance, Energy
- **Trigger**: Background `threading.Timer` (12-hour interval)
- **Output**: `BUY / WATCH / SELL` per sector + reasoning
- **Manual trigger**: `POST /api/market/alerts/send-email`
- **Fallback**: Logs full report to console if SMTP is not configured

---

## API Routes

| Method | Route | Agent | Description |
|---|---|---|---|
| `POST` | `/api/market/chat` | Market Intelligence | Natural language stock/sector query |
| `GET` | `/api/market/news-classification` | Market Intelligence | Classify news for a ticker |
| `GET` | `/api/market/sectors` | Market Intelligence | Sector overview |
| `POST` | `/api/incident/analyze` | Incident Analyst | Triage raw incident text |
| `POST` | `/api/supply-chain/analyze` | Supply Chain Domino | Country disruption forecast |
| `POST` | `/api/market/alerts/send-email` | Sector Intelligence | Manually trigger email digest |
| `GET` | `/health` | — | Health check |

Swagger UI available at: `http://localhost:8000/docs`

---

## Setup

### Prerequisites
- Python 3.12+
- `uv` package manager — [install](https://astral.sh/uv)

### Install & Run

```bash
# 1. Navigate to backend
cd backend

# 2. Sync dependencies
uv sync
# or: pip install -r requirements.txt

# 3. Create api_secrets.py (not committed to git)
# Add the following:
#   GEMINI_API_KEY  = "your_key"
#   NEWSAPI_KEY     = "your_key"
#   EMAIL_SENDER    = "alerts@nexusflow.ai"
#   RECIPIENT_EMAIL = "you@example.com"
#   SMTP_SERVER     = "smtp.gmail.com"
#   SMTP_PORT       = 587
#   SMTP_PASSWORD   = "your_app_password"

# 4. Start the server
uv run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Testing

```bash
uv run python test_script.py
```

---

## Project Structure

```
backend/
├── app/
│   ├── main.py                  # FastAPI app entrypoint
│   ├── agents/
│   │   ├── market/
│   │   │   ├── graph.py         # Market Intelligence LangGraph pipeline
│   │   │   ├── tools.py         # News + price fetcher tools
│   │   │   └── alerts.py        # Sector Intelligence agent logic
│   │   ├── incident/
│   │   │   ├── graph.py         # Incident Analyst LangGraph pipeline
│   │   │   └── tools.py         # ChromaDB RAG retrieval tool
│   │   └── supply_chain/
│   │       └── graph.py         # Supply Chain Domino LangGraph pipeline
│   ├── api/
│   │   ├── market_routes.py     # Market + Alerts API routes
│   │   ├── incident_routes.py   # Incident API routes
│   │   ├── supply_chain_routes.py
│   │   ├── alerts_manager.py    # Background 12h scheduler
│   │   └── email_service.py     # HTML email templating + SMTP dispatch
│   └── dataset/                 # ChromaDB source documents
├── api_secrets.py               # API keys (gitignored)
└── chroma_db/                   # Persistent vector store (gitignored)
```
