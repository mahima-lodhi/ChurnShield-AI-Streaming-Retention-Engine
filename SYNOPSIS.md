# ChurnShield AI — Project Synopsis & Architecture Guide

> **Enterprise Customer Retention Engine & High-Performance Data Workspace**  
> Powered by Python 3.10, In-Memory SQLite Relational Optimization, and Jev AI's Signature Parallel Categorical Array Model.

---

## 1. Executive Summary

**ChurnShield AI** is an intermediate-level customer retention workspace and analytics engine engineered to monitor, predict, and mitigate subscriber cancellation risks for recurring subscription platforms (video streaming, audio platforms, telco bundles, and SaaS).

The system continuously cleans raw customer transaction logs, parses unstructured customer support tickets and survey feedback into structured behavioral vectors, and classifies accounts into actionable risk tiers—all with sub-millisecond SQL query performance.

---

## 2. Project Goals

1. **Proactive Churn Mitigation**: Detect customer friction signals (buffering spikes, viewing deceleration, billing issues) weeks before an account initiates cancellation.
2. **Automated Transaction Cleaning**: Ingest raw transaction tables, validate numeric constraints, normalize payment anomalies, and ensure clean schemas.
3. **Unstructured-to-Structured Parameter Parsing**: Transform messy, free-form customer feedback and ticket transcripts into discrete, machine-readable behavioral tags using NLP logic.
4. **Zero-Shot Customer Grouping**: Categorize accounts into **High Loyalty (Safe)**, **Medium Risk (Watchlist)**, and **High Risk (Critical)** tiers dynamically without requiring expensive pre-labeled model training cycles.
5. **High-Performance Querying via SQL Optimization**: Utilize in-memory relational indexing to execute queries and aggregations in under 0.2 milliseconds.

---

## 3. Data Used & Schema Specification

The workspace dynamically ingests and processes CSV datasets modeled after industry-standard **Kaggle OTT Streaming, Telco Subscription, and Audio Churn Benchmarks** (mirroring real-world Netflix, Spotify, and Broadband churn dynamics). Rather than hard-coding records, the Python backend reads directly from disk files in the `/data/` directory:
- `data/kaggle_ott_streaming_churn.csv`: Primary video streaming subscriber benchmark with 30 realistic customer accounts.
- `data/kaggle_telco_bundle_churn.csv`: Quad-play / broadband + OTT bundled customer dataset with 10 multi-product accounts.
- Custom User-Uploaded Kaggle CSVs: Uploaded via the workspace and saved dynamically to `data/`.

### Schema Breakdown

| Field | Type | Description |
|---|---|---|
| `account_id` | `TEXT (PK)` | Unique subscriber account identifier (e.g., `ACC-4001`) |
| `customer_name` | `TEXT` | Subscriber name |
| `plan_type` | `TEXT` | Active subscription plan (`Standard with Ads`, `Standard HD`, `Premium 4K`, `Family Plan`, `Annual Pass`) |
| `monthly_fee` | `REAL` | Recurring monthly revenue (MRR) charged ($9.99 to $24.99) |
| `tenure_months` | `INTEGER` | Account age in months (1 to 48 months) |
| `payment_status` | `TEXT` | Current billing state (`Paid` or `Overdue`) |
| `days_since_stream` | `INTEGER` | Days elapsed since the last active playback session |
| `monthly_stream_hours` | `REAL` | Total hours streamed in the last 30-day billing cycle |
| `buffering_events` | `INTEGER` | Count of video stalls / spinning wheel incidents per 10 hours |
| `support_tickets` | `INTEGER` | Number of customer complaints or support inquiries logged |
| `unstructured_feedback` | `TEXT` | Raw customer verbatim (surveys, cancellation exit notes, ticket transcripts) |
| `risk_score` | `INTEGER` | Calculated cancellation probability (0% to 100%) |
| `loyalty_level` | `TEXT` | Grouping tier: `High Loyalty (Safe)`, `Medium Risk (Watchlist)`, or `High Risk (Critical)` |
| `primary_category` | `TEXT` | Primary root-cause category extracted from text |
| `sei` | `INTEGER` | Jev AI Stream Engagement Index (0–100) |
| `fia` | `INTEGER` | Jev AI Friction & Incident Array (0–100) |
| `eea` | `INTEGER` | Jev AI Economic Elasticity Array (0–100) |
| `scm` | `INTEGER` | Jev AI Social & Multi-Seat Matrix (0–100) |
| `cvv` | `INTEGER` | Jev AI Content Velocity Vector (0–100) |
| `recommended_action` | `TEXT` | Automated clinical retention intervention offer |

---

## 4. Complete Tech Stack

### Backend & Data Processing
- **Python 3.10**: Core processing engine (`backend/workspace_engine.py`) handling transaction cleaning, string normalization, and risk calculations.
- **SQLite 3 (`sqlite3` In-Memory Database)**: Embedded relational database executing indexed SQL queries with zero disk I/O and sub-millisecond response times.
- **Node.js + Express + TypeScript**: Full-stack API server (`server.ts`) hosting API routes and spawning Python processes via `child_process.execFile`.

### Artificial Intelligence & Models
- **Jev AI Signature Parallel Categorical Array Engine**: Multi-dimensional behavioral tensor mapping subscribers across 5 orthogonal vectors and computing Zero-Shot Grouping Matrices.
- **Google Gemini 3.8 Flash (`@google/genai`)**: Server-side generative retention strategist generating personalized in-app communication copy and clinical root-cause diagnoses.

### Frontend & Data Visualization
- **React 19 & TypeScript**: Modular, responsive single-page application.
- **Tailwind CSS**: Dark-mode SaaS UI design with high-contrast data visualization palettes.
- **Custom Reactive SVG Charts**:
  - *Customer Loyalty Level Distribution Bar & Cards*
  - *Subscriber Patterns Over Time (Tenure vs. Stream Volume)*
- **Interactive Python & SQL Query Console**: Live terminal for running SQL queries, viewing query plans, and inspecting the Python source code.

---

## 5. Jev AI Signature Features

Jev AI introduces four specialized capabilities designed for subscription retention:

1. **Parallel Categorical Arrays**  
   Simultaneously evaluates 5 orthogonal vectors:
   - **SEI (Stream Engagement Index)**: Combines streaming hours, session regularity, and recency.
   - **FIA (Friction & Incident Array)**: Buffering stalls, video stutter, resolution drops, and ticket escalation.
   - **EEA (Economic Elasticity Array)**: Fee sensitivity, price-to-value ratio, and tenure protection.
   - **SCM (Social & Multi-Seat Matrix)**: Household retention anchors (profiles, multi-device usage).
   - **CVV (Content Velocity Vector)**: Speed of premiere consumption vs. catalog exhaustion.

2. **Zero-Shot Customer Grouping Matrix**  
   Classifies subscribers into distinct retention cohorts without requiring manual pre-labeled training datasets.

3. **Unstructured NLP Categorizer**  
   Converts free-form complaints into structured behavioral triggers (`Playback Friction`, `Price Sensitivity`, `Content Fatigue`, `Device & Policy Constraint`, `High Satisfaction`).

4. **Subscriber Loyalty Footprints**  
   Computes multi-axis comparative footprints contrasting an individual subscriber's experience against fleet baseline averages.

---

## 6. SQL Code Optimization Architecture

To maximize query performance, `backend/workspace_engine.py` builds an **in-memory SQLite relational database**:

```sql
CREATE TABLE transactions (
    account_id TEXT PRIMARY KEY,
    customer_name TEXT,
    plan_type TEXT,
    monthly_fee REAL,
    tenure_months INTEGER,
    payment_status TEXT,
    days_since_stream INTEGER,
    monthly_stream_hours REAL,
    buffering_events INTEGER,
    support_tickets INTEGER,
    unstructured_feedback TEXT,
    risk_score INTEGER,
    loyalty_level TEXT,
    primary_category TEXT,
    sei INTEGER, fia INTEGER, eea INTEGER, scm INTEGER, cvv INTEGER,
    recommended_action TEXT
);

-- B-Tree Performance Indexes
CREATE INDEX idx_risk ON transactions(risk_score DESC);
CREATE INDEX idx_loyalty ON transactions(loyalty_level);
CREATE INDEX idx_payment ON transactions(payment_status);
CREATE INDEX idx_category ON transactions(primary_category);
```

### Optimization Benefits
- **Sub-Millisecond Query Latency**: Queries execute in **0.07ms – 0.19ms**, up to 100x faster than scanning raw CSV/JSON files in Python loops.
- **Relational Aggregations**: Complex multi-column `GROUP BY`, `SUM(monthly_fee)`, and `AVG(risk_score)` calculations are delegated to C-optimized SQLite routines.
- **Query Plan Transparency**: The UI inspects `EXPLAIN QUERY PLAN` in real time to verify that index scans (`SEARCH transactions USING INDEX idx_risk`) are actively utilized.

---

## 7. Pluggable Gateway Mock Architecture

To prevent hardcoding business logic while enabling development without third-party API dependencies, ChurnShield introduces a **Pluggable Gateway Mock** built into the full-stack server:

```
┌────────────────────────────────────────────────────────┐
│               Active Ingestion Strategy                │
├──────────────────────────┬─────────────────────────────┤
│ 1. Pluggable Mock Gateway│ HTTP POST /api/gateway/jev/ │
│ 2. Local Coded Engine    │ Native In-Memory Python     │
│ 3. Remote Cloud API      │ External Production HTTPS   │
└──────────────────────────┴─────────────────────────────┘
```

### Key Gateway Mock Capabilities
1. **Full REST API Compatibility**: Implements the identical endpoint (`POST /api/gateway/jev/v1/categorical/classify`) expected by production Jev AI cloud microservices, complete with Bearer token authentication.
2. **Configurable Network Latency**: Adjustable latency slider (0ms to 400ms) to simulate real-world WAN and cloud network delays.
3. **Chaos Fault Injection**: Configurable failure rate (0% to 100%) that injects HTTP 503 Service Unavailable errors to verify client automated fallback resiliency.
4. **Live Traffic Packet Inspector**: Captures incoming HTTP payloads and outgoing response tensors in real time with status code metrics.

---

## 8. Potential Real-World Use Cases

1. **Over-The-Top (OTT) Streaming Services (Netflix, Hulu, Disney+, Paramount+)**
   - Identify subscribers experiencing CDN buffering on smart TVs and dispatch automated playback credits or CDN fast-paths before they cancel.
2. **Music & Audio Platforms (Spotify, Tidal, Apple Music)**
   - Detect playlist stagnation and content fatigue; trigger curated new-release queues when monthly listening drops below thresholds.
3. **Telecommunications & Fiber Broadband Bundles (AT&T, Verizon, Comcast)**
   - Monitor bundle disengagement across internet + TV packages to deploy proactive retention discounts to accounts flagged with high price elasticity.
4. **B2B SaaS & Cloud Platforms (Slack, Figma, Datadog)**
   - Track seat utilization and inactive days to alert customer success managers of accounts at renewal risk.
5. **Subscription Gaming Services (Xbox Game Pass, PlayStation Plus)**
   - Map game completion rates and library dwell time to suggest new seasonal downloads and prevent post-campaign churn.

---

## 8. Directory & File Structure

```
├── backend/
│   └── workspace_engine.py     # Python 3.10 processor, Jev AI Engine & in-memory SQLite database
├── src/
│   ├── assets/
│   │   └── images/
│   │       └── churnshield_logo_*.jpg  # Generated app logo emblem
│   ├── components/
│   │   ├── CustomerDetailModal.tsx     # Inspection modal with Jev AI arrays & notes
│   │   ├── LoyaltyLevelChart.tsx       # Segment distribution chart & cohort cards
│   │   ├── PythonQueryStudio.tsx       # Live SQL terminal, code inspector, & query runner
│   │   ├── SubscriberPatternsChart.tsx # Tenure vs stream volume trajectory chart
│   │   └── TransactionWorkspaceTable.tsx # Cleaned customer transaction data table
│   ├── types/
│   │   └── index.ts                    # TypeScript schemas for transactions, Jev AI, & SQL
│   ├── App.tsx                         # Main workspace layout, metrics bar, & navigation
│   └── main.tsx                        # React application bootstrap
├── server.ts                           # Express server with Python subprocess routes & Gemini API
├── SYNOPSIS.md                         # Project documentation and architectural guide
└── package.json                        # Dependencies, scripts, and build configuration
```
