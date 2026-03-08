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
| Meaningful signal output | BUY/SELL/HOLD, Severity Index (0–100), Index Score, Sector Score |
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

**Solution:** Upload any incident report as a `.txt` file. The agent reads
the raw text, extracts affected systems, identifies patterns, computes a
**Severity Index (0–100)** based on keyword density, user frustration, and
historical frequency — backed by a RAG knowledge base of real financial
system incidents — and auto-drafts a P0/P1/P2 engineering brief with ranked
root causes and next actions.

**Example:**
> *Upload: incident_report_nov2024.txt*
> → **SEVERITY: 87/100 | PRIORITY: P0**
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
generates a **Index Score (0–100)** with recommended procurement actions.

**Example:**
> *"What is the current risk for procurement from Shanghai?"*
> → **RISK SCORE: 74/100 | Action: Consider alternative sourcing**
> → Top 3 disruption events, affected trade routes, recommended timeline

---

### 📊 4. Sector Intelligence & Automated Alert System
**Problem:** Investors and analysts need a daily sector-wide performance
briefing but cannot manually scan every stock and headline across multiple
sectors every morning and evening.

**Solution:** NexusFlow automatically runs a **twice-daily sector sweep** at
market open (9 AM) and market close (5 PM). For each major sector it fetches
the top headlines, classifies stocks as top-performing or low-performing, and
generates a structured sector summary with BUY/WATCH/AVOID recommendations.
These digests are pushed as **automated email alerts** to subscribed users.

**Sectors covered:**
Technology · Healthcare · Energy · Finance · Consumer · Industrials · Utilities

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
│  /market/chat  /incident/analyze  /port/risk  /sector/digest         │
└──────┬──────────────┬──────────────────┬──────────────┬─────────────┘
       │              │                  │              │
       ▼              ▼                  ▼              ▼
┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌────────────────┐
│ Market   │  │  Incident    │  │  Port Risk  │  │ Sector Alert   │
│ Pipeline │  │  Pipeline    │  │  Pipeline   │  │ Pipeline       │
└────┬─────┘  └──────┬───────┘  └──────┬──────┘  └───────┬────────┘
     │                │                 │                  │
     ▼                ▼                 ▼                  ▼
┌─────────┐   ┌──────────────┐   ┌──────────┐   ┌────────────────┐
│ Intent  │   │ Text File    │   │ Intent   │   │ Sector Sweep   │
│ Agent   │   │ Parser Tool  │   │ Agent    │   │ Agent          │
└─────────┘   └──────────────┘   └──────────┘   └────────────────┘
     │                │                 │                  │
     ▼                ▼                 ▼                  ▼
┌─────────┐   ┌──────────────┐   ┌──────────┐   ┌────────────────┐
│News +   │   │ Extraction   │   │  News    │   │ Per-Sector     │
│Price    │   │ Agent        │   │ Fetcher  │   │ News Fetcher   │
│Fetcher  │   └──────────────┘   └──────────┘   └────────────────┘
└─────────┘          │                 │                  │
     │          ┌────┴──────┐          ▼                  ▼
     ▼          │ RAG Tool  │   ┌──────────┐   ┌────────────────┐
┌─────────┐     │ (Chroma)  │   │  Risk    │   │ Performance    │
│Sentiment│     └────┬──────┘   │  Score   │   │ Classifier     │
│ Agent   │          │          │  Agent   │   │ Agent          │
└─────────┘          ▼          └──────────┘   └────────────────┘
     │        ┌──────────────┐        │                  │
     ▼        │ Root Cause   │        ▼                  ▼
┌─────────┐   │ Agent        │  ┌──────────┐   ┌────────────────┐
│ Signal  │   └──────────────┘  │  Action  │   │Recommendation  │
│ Agent   │          │          │  Agent   │   │ Agent          │
└─────────┘          ▼          └──────────┘   └────────────────┘
                ┌──────────────┐                          │
                │ Action       │                          ▼
                │ Planner      │               ┌────────────────┐
                └──────────────┘               │ Alert Composer │
                      │                        │ Agent          │
                      ▼                        └───────┬────────┘
                ┌──────────────┐                       │
                │ Summarizer   │                       ▼
                │ Agent        │              ┌────────────────┐
                └──────────────┘              │ Email Dispatch │
                                              │ 9 AM + 5 PM    │
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
[Intent Agent] — ticker, sector, time window
        │
   ┌────┴────┐
   ▼         ▼
[News      [Price
 Fetcher]   Fetcher]
 NewsAPI    yfinance
   └────┬────┘
        ▼
[Sentiment Agent]
WHO/WHAT/WHY/HOW analysis per headline
BULLISH / BEARISH / NEUTRAL
        │
        ▼
[Signal Agent]
BUY / SELL / HOLD
Confidence + Risk level + Reasoning
        │
        ▼
React UI — chat reply + price chart + signal card
```

### 🚨 Incident Analyst
```
.txt File Upload (incident report)
        │
        ▼
[Text File Parser] — reads raw text
        │
        ▼
[Extraction Agent]
Affected systems, symptoms, timeline, severity
        │
   ┌────┴────────────────┐
   ▼                     ▼
[RAG Tool]         [Frustration Agent]
Chroma vector        Per-ticket frustration
search — top 3       score (0-10)
similar incidents
   └────┬────────────────┘
        ▼
[Root Cause Agent]
Ranked causes + confidence %
Grounded by RAG historical context
        │
        ▼
[Action Planner Agent]
Ordered next steps + suggested owner
        │
        ▼
[Summarizer Agent]
P0/P1/P2 engineering brief
        │
        ▼
React UI — severity meter + root causes + summary
```

### 🚢 Port Risk
```
User Query (port / region / commodity)
        │
        ▼
[Intent Agent] — port, region, trade route
        │
        ▼
[News Fetcher] — live port/trade/geopolitical news
        │
        ▼
[Risk Scoring Agent] — 0-100 disruption score
        │
        ▼
[Action Agent] — switch supplier / delay / hedge
        │
        ▼
React UI — risk score + affected routes + recommendations
```

### 📊 Sector Alert (Automated, Twice Daily)
```
Scheduler — 9 AM + 5 PM trigger
        │
        ▼
[Sector Sweep Agent]
Loops through 7 sectors
        │ (per sector)
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
[Alert Composer Agent]
Formats structured sector digest
        │
        ▼
[Email Dispatch]
Sent to all subscribed users
9 AM (market open) + 5 PM (market close)
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



### Agent Framework

All agents are built with **LangGraph** as the orchestration layer and **Gemini 2.5 Flash** as the underlying LLM. Each agent is a node in a LangGraph `StateGraph`, receives a shared state dictionary, performs one focused task, and passes enriched state to the next agent.

---

## Market Intelligence Pipeline — 3 Agents

---

### Agent 1: Intent Agent

| Property | Detail |
|---|---|
| **Role** | Natural language understanding |
| **Input** | Raw user chat message |
| **Output** | Structured intent: ticker, company, sector, time window |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | None |

**What it does:**
Parses a free-form user question like *"How is Apple doing this week?"* and extracts structured fields needed by downstream agents. Acts as the entry point that converts ambiguous human language into precise machine-readable parameters.

**Prompt strategy:**
Instructs Gemini to extract exactly 5 fields — ticker, company name, sector, time window, and restated question — and return strict JSON with no explanation.

**Example:**
```json
Input:  "Should I buy Tesla given the recent news?"

Output: {
  "ticker": "TSLA",
  "company_name": "Tesla Inc.",
  "sector": "Consumer Discretionary",
  "time_window": "7d",
  "user_question": "Is Tesla a good buy based on recent news?"
}
```

---

### Agent 2: Sentiment Agent

| Property | Detail |
|---|---|
| **Role** | Financial news analyst |
| **Input** | List of news headlines + ticker + sector |
| **Output** | Per-headline classification + overall sentiment score |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | None (receives pre-fetched headlines from News Fetcher Tool) |

**What it does:**
Analyzes each news headline through the lens of a Wall Street analyst. For every headline it reasons through WHO is affected, WHAT the catalyst is, WHY it would move the stock, and HOW MUCH impact it would have. Classifies each as BULLISH, BEARISH, or NEUTRAL and produces an aggregate sentiment score from -1.0 to 1.0.

**Prompt strategy:**
Persona-based prompt — *"You are a seasoned Wall Street analyst with 20 years of experience."* Forces chain-of-thought reasoning before classification. Strict JSON output prevents hallucination of free-form text.

**Example:**
```json
Input: [
  "Fed raises rates by 25bps",
  "Tesla beats Q4 earnings",
  "EV tax credit cut proposed"
]

Output: {
  "overall_sentiment": "bearish",
  "sentiment_score": -0.31,
  "bullish_count": 1,
  "bearish_count": 2,
  "key_drivers": [
    "Rate hike increases cost of capital for growth stocks",
    "EV credit cut directly reduces Tesla demand",
    "Earnings beat partially offsets macro headwinds"
  ],
  "analyzed_headlines": [...]
}
```

---

### Agent 3: Signal Agent

| Property | Detail |
|---|---|
| **Role** | Portfolio signal generator |
| **Input** | Sentiment output + price data summary + user question |
| **Output** | BUY/SELL/HOLD signal + confidence + risk + chat response |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | None (receives pre-fetched price data from Price Fetcher Tool) |

**What it does:**
The final decision-making agent in the market pipeline. Combines sentiment analysis with price trend summary to generate a definitive trading signal. Also writes the conversational chat response the user sees — plain English, no jargon, accessible to a non-expert.

**Prompt strategy:**
Provides sentiment score, bullish/bearish counts, key drivers, and a summarized price trend (% change, period high/low, latest close). Asks Gemini to act as a senior analyst preparing a recommendation for a portfolio manager. Returns both structured signal JSON and natural language chat response in one call.

**Example:**
```json
Input: {
  "sentiment_score": -0.31,
  "price_change": "-4.2% over 7d",
  "key_drivers": ["rate hike", "EV credit cut"]
}

Output: {
  "signal": "SELL",
  "confidence": 0.74,
  "risk_level": "high",
  "reasoning": "Combined macro headwinds from rate hike and EV credit cut
                outweigh earnings beat. Price trend confirms bearish momentum.",
  "supporting_evidence": [
    "Rate hike increases financing costs for EV buyers",
    "EV tax credit cut reduces addressable market",
    "Stock down 4.2% over past 7 days",
    "Earnings beat already priced in"
  ],
  "price_target_direction": "down",
  "chat_response": "Based on recent news and price action, Tesla is showing
                    bearish signals this week..."
}
```

---

## 🚨 Incident Analyst Pipeline — 4 Agents

---

### Agent 4: Extraction Agent

| Property | Detail |
|---|---|
| **Role** | Incident data extractor |
| **Input** | Raw incident report text (from .txt file) |
| **Output** | Affected systems, symptoms, timeline, severity estimate |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | Text File Parser Tool |

**What it does:**
First agent to process the raw incident report. Reads unstructured text and extracts all structured fields needed for downstream analysis. Identifies every system mentioned, all observable symptoms, the incident timeline, and an initial severity estimate before RAG context is added.

**Prompt strategy:**
Instructs Gemini to read like a senior SRE triaging an incident. Extracts named systems as tags (e.g. `["SSO Gateway", "Auth Service", "Login API"]`), not free-form text. Forces timeline extraction as start/end/duration.

**Example:**
```json
Input: "At 11:42 AM users began reporting login failures.
        SSO gateway returning 504 errors. Auth service
        unresponsive. 47 tickets in 8 minutes."

Output: {
  "affected_systems": ["SSO Gateway", "Auth Service", "Login API"],
  "symptoms": ["504 errors", "login failure", "high latency"],
  "timeline": { "start": "11:42 AM", "duration": "ongoing" },
  "initial_severity": "critical",
  "ticket_volume": 47,
  "time_span_minutes": 8
}
```

---

### Agent 5: Root Cause Agent

| Property | Detail |
|---|---|
| **Role** | Root cause analyst |
| **Input** | Extraction output + RAG retrieved historical incidents |
| **Output** | Ranked list of root causes with confidence scores |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | Chroma RAG Tool (retrieves top 3 similar past incidents) |

**What it does:**
The most critical agent in the incident pipeline. Uses extracted symptoms and systems to query ChromaDB for historically similar incidents. Feeds those past incidents as context to Gemini, which reasons about the most likely root causes ranked by confidence. Every cause is grounded in real historical precedent from the knowledge base.

**Prompt strategy:**
Provides both current incident details AND retrieved historical incidents as context. Instructs Gemini to reason like a post-mortem lead — comparing patterns, not just matching keywords. Each cause must have a confidence score and a one-line evidence statement.

**Example:**
```json
RAG context: "Dec 2024 — SSO gateway timeout caused by
              connection pool exhaustion after deploy."

Output: {
  "root_causes": [
    {
      "cause": "SSO Gateway Connection Pool Exhausted",
      "confidence": 0.91,
      "evidence": "Matches Dec 2024 incident pattern exactly"
    },
    {
      "cause": "Auth Service Memory Leak Post-Deploy",
      "confidence": 0.74,
      "evidence": "504 errors consistent with OOM condition"
    },
    {
      "cause": "Upstream Identity Provider Outage",
      "confidence": 0.52,
      "evidence": "Cannot rule out third-party IdP failure"
    }
  ]
}
```

---

### Agent 6: Action Planner Agent

| Property | Detail |
|---|---|
| **Role** | Incident response coordinator |
| **Input** | Root cause output + extraction output |
| **Output** | Ordered action items + suggested owner + priority |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | None |

**What it does:**
Converts ranked root causes and extraction data into a concrete, ordered action plan. Assigns each action to a suggested team owner and sets the overall incident priority (P0/P1/P2). The output is directly usable by an on-call engineer without any additional thinking required.

**Prompt strategy:**
Instructs Gemini to act as an incident commander. Actions must be specific and executable — not vague like *"investigate the issue"* but precise like *"Check SSO gateway connection pool metrics in Datadog dashboard."* Orders actions by urgency, not by diagnosis confidence.

**Example:**
```json
Output: {
  "priority": "P0",
  "suggested_owner": "Auth/Infra On-Call Team",
  "actions": [
    "1. Check SSO gateway connection pool in Datadog immediately",
    "2. Review auth service logs for OOM errors (last 30 mins)",
    "3. Page on-call infra engineer via PagerDuty",
    "4. Prepare rollback plan for last auth service deploy",
    "5. Open war room bridge — notify engineering leads"
  ],
  "estimated_resolution": "45-90 minutes"
}
```

---

### Agent 7: Summarizer Agent

| Property | Detail |
|---|---|
| **Role** | Engineering communication writer |
| **Input** | All previous agent outputs combined |
| **Output** | Ready-to-send P0/P1/P2 engineering brief |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | None |

**What it does:**
Final agent in the incident pipeline. Takes all outputs from extraction, root cause, and action planning and composes a clean, professional engineering incident summary. The output is immediately ready to paste into Slack, email to leadership, or file as an incident ticket — no editing needed.

**Prompt strategy:**
Provides all upstream outputs as structured context. Instructs Gemini to write in the format used by major tech companies (Google/AWS/Stripe style post-mortems). Keeps it under 200 words. Factual, no speculation, actionable.

**Example:**
```
INCIDENT SUMMARY — P0
────────────────────────────────────────
Title:      System-Wide Authentication Outage
Time:       11:42 AM – ongoing
Priority:   P0 — All users affected
Systems:    SSO Gateway, Auth Service, Login API
Symptoms:   504 errors, login failure, 47 tickets in 8 mins
Root Cause: SSO connection pool exhaustion (91% confidence)
Owner:      Auth/Infra On-Call Team
Actions:    See action plan above
Status:     Investigation in progress
```

---

## 📊 Sector Alert Pipeline — 3 Agents

---

### Agent 8: Performance Classifier Agent

| Property | Detail |
|---|---|
| **Role** | Sector stock screener |
| **Input** | Top headlines per sector from News Fetcher Tool |
| **Output** | Per-stock classification: TOP / LOW / NEUTRAL + reasoning |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | News Fetcher Tool (once per sector) |

**What it does:**
Runs once per sector in the twice-daily sweep. Takes the top headlines for each sector and classifies every stock mentioned as top-performing, low-performing, or neutral based on news sentiment. Separates sector winners from losers automatically.

**Example:**
```json
Sector: Technology

Input headlines: [
  "NVDA surges on data center demand",
  "AAPL cuts iPhone forecast",
  "MSFT Azure revenue beats estimates"
]

Output: {
  "sector": "Technology",
  "top_performing": [
    { "ticker": "NVDA", "reason": "Data center demand surge" },
    { "ticker": "MSFT", "reason": "Azure revenue beat" }
  ],
  "low_performing": [
    { "ticker": "AAPL", "reason": "iPhone forecast cut signals weak demand" }
  ]
}
```

---

### Agent 9: Recommendation Agent

| Property | Detail |
|---|---|
| **Role** | Sector strategist |
| **Input** | Performance classification output per sector |
| **Output** | BUY/WATCH/AVOID per stock + sector score + key catalyst |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | None |

**What it does:**
Upgrades raw performance classification into actionable recommendations. Assigns BUY/WATCH/AVOID to each stock, computes a sector-wide sentiment score (-1.0 to 1.0), identifies the single biggest macro catalyst driving the sector, and builds the recommended watchlist for the next trading session.

**Example:**
```json
Output: {
  "sector": "Technology",
  "sentiment_score": 0.74,
  "overall": "BULLISH",
  "recommendations": [
    { "ticker": "NVDA", "signal": "BUY",   "reason": "AI infra tailwind" },
    { "ticker": "MSFT", "signal": "BUY",   "reason": "Cloud beat" },
    { "ticker": "AAPL", "signal": "AVOID", "reason": "Demand weakness" }
  ],
  "key_catalyst": "Fed rate pause boosting tech multiples",
  "watchlist": ["NVDA", "MSFT"]
}
```

---

### Agent 10: Alert Composer Agent

| Property | Detail |
|---|---|
| **Role** | Digest writer and email formatter |
| **Input** | All 7 sector recommendation outputs |
| **Output** | Formatted email digest ready to send |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | Email Dispatch Tool |

**What it does:**
Final agent in the sector pipeline. Aggregates all seven sector recommendation outputs into a clean, readable email digest. Formats it for both morning (9 AM market open) and evening (5 PM market close) sends. The email is professional, scannable, and actionable in under 60 seconds.

**Example:**
```
Subject: NexusFlow Morning Digest — March 8, 2026
────────────────────────────────────────────────
📈 TECHNOLOGY   BULLISH  +0.74   NVDA↑ MSFT↑  |  AAPL↓
🏥 HEALTHCARE   NEUTRAL  +0.12   LLY↑  JNJ↑   |  PFE↓
⚡ ENERGY       BEARISH  -0.41   None          |  XOM↓ CVX↓
💰 FINANCE      BULLISH  +0.55   JPM↑  GS↑    |  WFC↓
🏭 INDUSTRIALS  NEUTRAL  +0.08   CAT↑         |  GE↓
🛒 CONSUMER     BEARISH  -0.22   None          |  NKE↓ MCD↓
🔌 UTILITIES    NEUTRAL  +0.03   NEE↑         |  None

────────────────────────────────────────────────
Top Pick Today:   NVDA — BUY (AI infrastructure spending)
Biggest Risk:     AAPL — AVOID (iPhone demand weakness)
Macro Watch:
Fed minutes release at 2 PM today — watch for
                  rate guidance language affecting growth stocks
────────────────────────────────────────────────
Sent by NexusFlow · 9:00 AM CDT · Next digest at 5:00 PM
```

***

## 🚢 Port Risk Pipeline — 2 Agents

***

### Agent 11: Risk Scoring Agent

| Property | Detail |
|---|---|
| **Role** | Supply chain disruption analyst |
| **Input** | Live port/trade/geopolitical news + extracted route info |
| **Output** | Port Risk Score (0–100) + disruption events + affected routes |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | News Fetcher Tool |

**What it does:**
Analyzes live news for port disruptions, trade policy changes, labor strikes, weather events, and geopolitical tensions. Maps each event to affected supply routes and computes a composite risk score. A score above 70 triggers an immediate alert.

**Scoring factors:**
| Factor | Weight |
|---|---|
| Active port disruption | 40% |
| Trade policy change | 25% |
| Geopolitical tension | 20% |
| Historical disruption frequency | 15% |

**Example:**
```json
Input:  "What is the current risk for procurement from Shanghai?"

Output: {
  "port": "Shanghai",
  "risk_score": 74,
  "risk_level": "HIGH",
  "disruption_events": [
    "Port congestion up 40% due to Lunar New Year backlog",
    "US tariff increase on Chinese electronics announced",
    "Typhoon warning affecting South China Sea routes"
  ],
  "affected_routes": [
    "Shanghai → Los Angeles (Trans-Pacific)",
    "Shanghai → Rotterdam (Asia-Europe)"
  ],
  "estimated_delay_days": "7-14"
}
```

***

### Agent 12: Action Agent

| Property | Detail |
|---|---|
| **Role** | Procurement advisor |
| **Input** | Risk score output + affected routes |
| **Output** | Recommended procurement actions with timeline |
| **Model** | Gemini 2.5 Flash |
| **Tool Calls** | None |

**What it does:**
Converts the risk score and disruption events into concrete procurement recommendations. Tells the supply chain manager exactly what to do — switch supplier, delay order, hedge inventory, or monitor — with a specific timeline and reasoning.

**Example:**
```json
Output: {
  "primary_action": "Consider alternative sourcing",
  "recommendations": [
    "Source 30-40% of order volume from Vietnam or India as backup",
    "Expedite any critical shipments via air freight this week",
    "Add 14-day buffer to procurement timeline for Q2 orders",
    "Monitor situation daily — reassess in 72 hours"
  ],
  "urgency": "HIGH",
  "review_in": "72 hours"
}
```

***

## Agent Summary Table

| # | Agent | Pipeline | Input | Output | Tool Calls |
|---|---|---|---|---|---|
| 1 | **Intent Agent** | Market + Port | User chat message | Ticker, sector, time window | None |
| 2 | **Sentiment Agent** | Market | News headlines | Sentiment score + classifications | None |
| 3 | **Signal Agent** | Market | Sentiment + price data | BUY/SELL/HOLD + chat response | None |
| 4 | **Extraction Agent** | Incident | Raw .txt text | Systems, symptoms, timeline | Text Parser |
| 5 | **Root Cause Agent** | Incident | Extraction + RAG context | Ranked causes + confidence % | Chroma RAG |
| 6 | **Action Planner Agent** | Incident | Root causes + extraction | Ordered steps + owner + priority | None |
| 7 | **Summarizer Agent** | Incident | All incident outputs | P0/P1/P2 engineering brief | None |
| 8 | **Performance Classifier Agent** | Sector Alert | Headlines per sector | TOP/LOW/NEUTRAL per stock | News Fetcher |
| 9 | **Recommendation Agent** | Sector Alert | Classifications | BUY/WATCH/AVOID + sector score | None |
| 10 | **Alert Composer Agent** | Sector Alert | All 7 sector outputs | Formatted email digest | Email Dispatch |
| 11 | **Risk Scoring Agent** | Port Risk | Port/trade news | Risk score 0–100 + events | News Fetcher |
| 12 | **Action Agent** | Port Risk | Risk score + routes | Procurement recommendations | None |

***

> All 12 agents powered by **Gemini 2.5 Flash** · Orchestrated by **LangGraph**