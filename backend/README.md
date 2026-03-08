# NexusFlow Backend

A unified intelligence platform backend serving two LLM-based intelligent agents powered by LangGraph, FastAPI, and Gemini.

## Systems

### 1. Market Intelligence Agent
A LangGraph-based sequential multi-agent system designed to receive natural language queries about financial markets.
- **Tools**: Extracts OHLCV data directly via `yfinance`, and retrieves fresh news via `newsapi-python`.
- **Agents**: Intent extractor, News & Chart fetcher, Sentiment analyzer, Signal generator, structured summarizer.

### 2. Incident Analyst Agent
A LangGraph-based workflow designed to triage PDF incident reports and augment them with historical resolutions.
- **Tools**: Extracts raw text from PDFs using `PyMuPDF` (`fitz`), and retrieves historical context using `ChromaDB` (via `google-genai` embeddings).
- **Agents**: Symptoms extraction, Vector database RAG retrieval, Root cause confidence ranker, Action planner, Formal engineering summarizer.

## Setup Instructions

This backend is built entirely with `uv` for lightning-fast deterministic dependency management.

### Prerequisites
- Python 3.12+ (installed via `uv`)
- `uv` package manager (`curl -LsSf https://astral.sh/uv/install.sh | sh` or equivalent)

### Installation
1. Navigate to the backend directory:
```bash
cd backend
```
2. Setup the environment and sync dependencies:
```bash
uv sync
```
3. Copy the environment template:
```bash
cp .env.example .env
```
4. Fill in `.env` with actual API keys:
   - `GEMINI_API_KEY`: Required for embeddings and LLM analysis.
   - `NEWSAPI_KEY`: Highly recommended for live Market Intel functionality.

### Running the Server

Start the FastAPI application by pointing to `app/main.py`:
```bash
uv run uvicorn app.main:app --host 0.0.0.1 --port 8000 --reload
```
You can access the automated Swagger documentation at `http://127.0.0.1:8000/docs`.

### Testing APIs directly
A lightweight smoke-test script is included to quickly test graphs:
```bash
uv run python test_script.py
```
