# NexusFlow — Real-Time Intelligence & Decision Signal Platform

> *"Don't just read the noise. Understand the signal."*

[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green)](https://fastapi.tiangolo.com)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-orange)](https://langchain-ai.github.io/langgraph)
[![Gemini](https://img.shields.io/badge/Gemini-1.5%20Flash-purple)](https://ai.google.dev)

---

## The Problem

Modern organizations are drowning in unstructured text — financial news, system
logs, incident reports, procurement data, market feeds. The challenge is not
collecting this data. The challenge is converting it into a **reliable,
actionable signal** fast enough to matter.

- A portfolio manager needs to know if a Fed announcement moves their position
  before the market opens.
- An SRE needs to know if five login errors in three minutes mean a system-wide
  outage before customers start calling.
- A procurement officer needs to know if port congestion in Shanghai affects
  their supply chain today, not next week.
- An investor needs a sector-wide morning briefing without reading 200 articles.

**NexusFlow solves this.** It is a one-stop, real-time intelligence platform
that ingests raw text from live data sources — news feeds, incident logs,
procurement reports — and produces structured, quantified decision signals
using a multi-agent AI pipeline. It also proactively pushes **twice-daily
sector intelligence alerts** so decisions never wait for a human to go looking.

---

## Track Relevance

> *"Can we convert text into a reliable signal that helps make better decisions?"*

| Track Requirement | How NexusFlow Addresses It |
|---|---|
| Raw text as input | Live news headlines, incident `.txt` files, procurement reports |
| Meaningful signal output | BUY/SELL/HOLD, Severity Index, Index Score, Sector Score |
| Real-world decision support | Trade recommendations, incident triage, supply chain alerts, sector digests |
| Full pipeline | Ingest → Classify → Extract → Decide → Visualize → Alert |
| Scale | Multi-source, multi-domain, multi-sector simultaneously |
| Proactive intelligence | Twice-daily automated alerts without user prompting |

---

## What NexusFlow Does

NexusFlow has **four intelligent pipelines**, each targeting a high-stakes
real-world domain:

---

### 📈 1. Market Intelligence Agent
**Problem:** Traders and analysts read hundreds of news articles daily to
form a market view. Most signals are buried in noise.

**Solution:** A conversational AI agent that accepts natural language questions
about any stock or sector. It fetches live news, analyzes sentiment like a
Wall Street analyst, pulls real-time price data, and returns a structured
BUY/SELL/HOLD signal with confidence score, risk level, and plain-English
reasoning — all in one chat interaction.

**Example:**
> *"What is the outlook for NVDA this week?"*
> → **SIGNAL: BUY | Confidence: 82% | Risk: MEDIUM**
> → Live 30-day price chart, sentiment breakdown, top 5 relevant headlines

---

### 🚨 2. Incident Analyst Agent
**Problem:** Large engineering teams deal with hundreds of incident reports
simultaneously. Reading all of them wastes critical response time during
outages.

**Solution:**  The agent reads the raw text, identifies affected systems, identifies patterns, computes a **Severity Index** based on keyword density, and
historical frequency — backed by a RAG knowledge base of real system incidents — and auto-drafts an engineering brief with ranked root causes and next actions.

**Example:**

> → **SEVERITY INDEX: HIGH**
> → Root Cause: SSO Gateway Timeout (91% confidence)
> → Historical match: Dec 2024 Auth Outage
> → Auto-drafted engineering summary with ordered action items

---

### 🚢 3. Procurement & Port Risk Agent
**Problem:** Supply chain managers cannot monitor global port disruptions,
trade news, and geopolitical events fast enough to act before they impact
procurement.

**Solution:** The agent monitors live news for port disruptions, trade policy
changes, and logistics events. It maps events to affected supply routes and
generates a **Risk Score (0–100)** with recommended procurement actions.

**Example:**
> *"What is the current risk for procurement from Shanghai?"*
> → **RISK SCORE: 74/100 | Action: Consider alternative sourcing**
> → Disruption events with confidence interval >= 70, affected trade routes, recommended timeline

---

### 📊 4. Market Analysis & Automated Alert System
**Problem:** Investors and analysts need a daily sector-wide performance
briefing but cannot manually scan every stock and headline across multiple
sectors every morning and evening.

**Solution:** NexusFlow automatically runs a **twice-daily sector sweep** at
market open (9 AM) and market close (5 PM). For each major sector it fetches
the top headlines, classifies stocks as top-performing or low-performing, and
generates a structured sector summary with BUY/WATCH/AVOID recommendations.
These digests are pushed as **automated email alerts** to subscribed users.

**Sectors covered:**
Technology · Healthcare · Energy 

**Each sector digest includes:**
- Top 3 performing stocks with signal and reasoning
- Bottom 3 underperforming stocks with risk flags
- Sector-wide sentiment score
- Key macro catalyst driving the sector
- Recommended watchlist for the next session

**Example Alert (9 AM digest):**
```
NexusFlow Morning Sector Digest — March 8, 2026

📈 TECHNOLOGY — BULLISH (Score: 0.74)
  Top Performers:    NVDA ↑ BUY | MSFT ↑ BUY | META ↑ HOLD
  Underperformers:   AAPL ↓ SELL | INTC ↓ AVOID
  Key Catalyst:      Fed signals rate pause, AI infrastructure spending up
  Watchlist:         NVDA, MSFT

🏥 HEALTHCARE — NEUTRAL (Score: 0.12)
  Top Performers:    LLY ↑ BUY | JNJ ↑ HOLD
  Underperformers:   PFE ↓ SELL
  Key Catalyst:      FDA approval pipeline mixed signals
  Watchlist:         LLY

⚡ ENERGY — BEARISH (Score: -0.41)
  Top Performers:    None
  Underperformers:   XOM ↓ SELL | CVX ↓ AVOID
  Key Catalyst:      Oil inventory build, demand concerns
  Watchlist:         Monitor for reversal
```

---

## System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                          React Frontend                              │
│   Market Intel | Incident Analyst | Port Risk | Sector Dashboard     │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │ REST API (HTTP/JSON)
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         FastAPI Backend                              │
│  /market/chat  /incident/analyze  /port/risk  /market-analysis/digest         │
└──────┬──────────────┬──────────────────┬──────────────┬─────────────┘
       │              │                  │              │
       ▼              ▼                  ▼              ▼
┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐
│ Market   │  │  Incident    │  │  Port Risk  │  │ Market Analysis│
│ Pipeline │  │  Pipeline    │  │  Pipeline   │  │ Pipeline       │
└────┬─────┘  └──────┬───────┘  └──────┬──────┘  └───────┬────────┘
     │                │                 │                  │
     ▼                ▼                 ▼                  ▼
┌─────────┐   ┌──────────────┐   ┌──────────┐   ┌────────────────┐
│ Intent  │   │ Text         │   │ Input    │   │ Market Sweep   │
│         │   | Parser Tool  │   │ location |   │                │
└─────────┘   └──────────────┘   └──────────┘   └────────────────┘
     │                │                 │                  │
     ▼                ▼                 ▼                  ▼
┌─────────┐   ┌──────────────┐   ┌──────────┐   ┌────────────────┐
│News +   │   │ Extraction   │   │  News    │   │ Per-Sector     │
│Price    │   │              │   │ Fetcher  │   │ News Fetcher   │
│Fetcher  │   └──────────────┘   └──────────┘   └────────────────┘
└─────────┘          │                 │                  │
     │          ┌────┴──────┐          ▼                  ▼
     ▼          │ RAG Tool  │   ┌──────────┐   ┌────────────────┐
┌─────────┐     │ (Chroma)  │   │  Risk    │   │ Performance    │
│Stock Risk     └────┬──────┘   │  Score   │   │ Classifier     │
│AnalysisAgent       │          │          │   |    Agent       │
└─────────┘          ▼          └──────────┘   └────────────────┘
     │        ┌──────────────┐        │                  │
     ▼        │ Root Cause   │        ▼                  ▼
┌─────────┐   │   Analysis   │  ┌──────────┐   ┌────────────────┐
│ Recomm. │   └──────────────┘  │  Action  │   │Recommendation  │
│ Agent   │          │          │  Agent   │   │                │
└─────────┘          ▼          └──────────┘   └────────────────┘
                ┌──────────────┐                          │
                │ Action       │                          ▼
                │ Planner      │               ┌────────────────┐
                └──────────────┘               │ Alert Composer │
                      │                        │                │
                      ▼                        └───────┬────────┘
                ┌──────────────┐                       │
                │ Summarizer   |                       ▼
                │              │              ┌────────────────┐
                └──────────────┘              │ Email Dispatch │
                                              └────────────────┘
                      │
                      ▼
          ┌───────────────────────┐
          │  Gemini 2.5 Flash LLM │
          │  (all agents)         │
          └───────────────────────┘
```

---

## Pipeline Flows

### 📈 Market Intelligence
```
User Question (natural language)
        │
        ▼
[Intent extractor] — ticker, sector, time window
        │
   ┌────┴────┐
   ▼         ▼
[News      [Price
 Fetcher]   Fetcher]
 NewsAPI    yfinance
   └────┬────┘
        ▼
[Stock Risk Analysis Agent]
WHO/WHAT/WHY/HOW analysis per headline
        │
        ▼
[Recommendation]
BUY / SELL / HOLD
Confidence + Risk level + Reasoning
        │
        ▼
React UI — chat reply + price chart + signal card
```

### 🚨 Incident Analyst
```
Live Log Data (I/P from User)
        │
        ▼
reads raw text
        │
        ▼
[Extraction]
Affected systems, symptoms, timeline, severity
        │
        │
        ▼                   
    [RAG Tool]        
    Chroma vector       
search top 3 similar incidents with confidence score >= 70%
        │
        ▼
Ranked causes + confidence %
Grounded by RAG historical context
        │
        ▼
Ordered next steps
        │
        ▼
 Engineering brief
        │
        ▼
React UI — severity meter + root causes + summary
```

### 🚢 Port Risk
```
User Query (port / region / commodity)
        │
        ▼
[Input] — port, region, trade route
        │
        ▼
[News Fetcher] — live port/trade/geopolitical news
        │
        ▼
[Risk Scoring Agent] — Signal = (LLM_Severity * Hub_Importance) + (Historical_Context)
        │
        ▼
[Action] — switch supplier / delay / hedge
        │
        ▼
React UI — risk score + affected routes + recommendations
```

### 📊 Sector Alert (Automated, Twice Daily)
```
Scheduler — 9 AM + 5 PM trigger
        │
        ▼
[Sector Sweep]
Loops through 3 sectors
        │ 
        ▼
[News Fetcher Tool]
Top headlines per sector — NewsAPI
        │
        ▼
[Performance Classifier Agent]
TOP PERFORMING / LOW PERFORMING / NEUTRAL
per stock based on headline analysis
        │
        ▼
[Recommendation Agent]
BUY / WATCH / AVOID per stock
Sector sentiment score + key macro catalyst
        │
        ▼
[Alert Composer]
Formats structured sector digest
        │
        ▼
[Email Dispatch]
Sent to all subscribed users
```

---

## RAG Architecture

```
INGESTION — one-time setup
────────────────────────────────────────────────────
Sources:
  -  Historical Incidents     (incidents.txt)
  -  IOSCO Market Outage Reports (txt)
  -  AI Incident Database     (CSV — Kaggle)
  -  Past Port Disruption Events (txt)
        │
        ▼
[TextLoader] — LangChain reads all .txt sources
        │
        ▼
[RecursiveCharacterTextSplitter]
  chunk_size = 800
  chunk_overlap = 100
  separator = "---"
        │
        ▼
[Gemini text-embedding-004]
  768-dimensional dense vectors
        │
        ▼
[ChromaDB PersistentClient]
  Collection: "financial_incidents"
  Stored at: ./chroma_db


RETRIEVAL — at query time
────────────────────────────────────────────
Raw incident text (user input)
        │
        ▼
[Gemini text-embedding-004] — embeds query into 768-dim vector
        │
        ▼
[ChromaDB cosine similarity search]
Returns top 3 most similar historical incidents
        │
  ┌─────┴──────┐
  ▼            ▼
>= 0.70       < 0.70
MATCH         NEW INCIDENT
(pattern      (novel issue,
 confirmed)    estimated)
  └─────┬──────┘
        ▼
Context passed to Gemini analyzer node
→ Root causes grounded in historical precedent
→ Confidence scores reflect match quality
```

---



| Property | Detail |
|---|---|
| **Role** | Autonomous sector analyst & email alert publisher |
| **Trigger** | Background `threading.Timer` — every 12 hours |
| **Perceives** | Live sector news via NewsAPI (Technology, Finance, Energy) |
| **Reasons** | Gemini 2.5 Flash batch-analyzes all sector headlines |
| **Acts** | Dispatches HTML email report — no user prompt needed |
| **Signal** | `BUY / WATCH / SELL` per sector + plain-English reasoning |
| **Fallback** | Logs the full report to console if SMTP is not configured |
| **Manual override** | `POST /api/market/alerts/send-email` from the frontend |


---

## Agent Summary

| # | Agent | Trigger | Signal | Decision Gate |
|---|---|---|---|---|
| 1 | **Market Intelligence** | User chat message | `BUY / SELL / HOLD` | Pydantic-validated Gemini enum |
| 2 | **Incident Analyst** | User submits log text | Severity + root causes (confidence %) | RAG cosine similarity ≥ 0.70 |
| 3 | **Supply Chain Domino** | User queries a country | Disruption Index 0.0–1.0 | `index > 0.75` → email modal fires |
| 4 | **Sector Intelligence** | Autonomous every 12 hours | `BUY / WATCH / SELL` per sector | Runs on timer — no human required |

> All agents powered by **Gemini 2.5 Flash** · Agents 1–3 orchestrated by **LangGraph** · Agent 4 runs on autonomous background scheduler
>
> <img width="1914" height="826" alt="image" src="https://github.com/user-attachments/assets/60f2e51f-f8fd-464a-92e7-5b282507fda9" />
<img width="1629" height="841" alt="image (1)" src="https://github.com/user-attachments/assets/30f16733-5ffb-407c-ac3d-62cb1b3e116b" />
<img width="1910" height="804" alt="image (2)" src="https://github.com/user-attachments/assets/96377ed5-a8a6-4a9d-9ec5-7474d0dc6aee" />
<img width="1919" height="830" alt="image (3)" src="https://github.com/user-attachments/assets/30f8aa26-d276-4f0c-a8df-5ec3169fcca4" />
<img width="1440" height="814" alt="Screenshot 2026-03-08 at 07 12 06" src="https://github.com/user-attachments/assets/b13eb439-4fcf-4886-ad13-8a20b675a339" />

