# 🛡️ ChurnShield AI — Streaming Customer Retention Engine & Data Workspace

[![Python 3.10](https://img.shields.io/badge/Python-3.10-blue.svg)](https://www.python.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![SQLite 3](https://img.shields.io/badge/Database-SQLite%20In--Memory-003B57.svg)](https://www.sqlite.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%204.0-38b2ac.svg)](https://tailwindcss.com/)
[![Gemini 3.8 Flash](https://img.shields.io/badge/AI-Gemini%203.8%20Flash-8E24AA.svg)](https://ai.google.dev/)
[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> **High-performance customer churn mitigation workspace for subscription platforms (SVOD, audio streaming, and telco bundles). Features dynamic Kaggle dataset ingestion, sub-millisecond in-memory SQLite indexing, Jev AI's Signature Parallel Categorical Array model, a Pluggable Gateway Mock, and Gemini 3.8 Flash fallback reasoning.**

---

## 🌟 Key Highlights

- ⚡ **Sub-Millisecond Relational Engine**: In-memory SQLite 3 database with B-Tree indexes yielding query execution latencies between **0.07ms – 0.19ms**.
- 📊 **Dynamic Kaggle Dataset Ingestion**: Ingests and normalizes raw OTT and Telco CSV benchmarks (`kaggle_ott_streaming_churn.csv`, `kaggle_telco_bundle_churn.csv`) with custom CSV upload support.
- 📐 **Jev AI Signature Parallel Categorical Array Model**: Evaluates accounts across 5 orthogonal behavioral dimensions:
  - **SEI**: Stream Engagement Index
  - **FIA**: Friction & Incident Array
  - **EEA**: Economic Elasticity Array
  - **SCM**: Social & Multi-Seat Matrix
  - **CVV**: Content Velocity Vector
- 🎯 **Zero-Shot Customer Grouping Matrix**: Categorizes accounts into **High Loyalty (Safe)**, **Medium Risk (Watchlist)**, and **High Risk (Critical)** tiers dynamically without pre-labeled model training cycles.
- 🔌 **Pluggable Gateway Mock Service**: Decoupled REST API simulator (`POST /api/gateway/jev/v1/categorical/classify`) featuring configurable latency (0–400ms), chaos fault injection (0–100%), and live packet traffic telemetry.
- 🤖 **Gemini 3.8 Flash Fallback Classifier**: Escalates ambiguous, sarcastic, or multi-intent verbatim feedback to Google Gemini for deep latent churn extraction and clinical action plans.

---

## 🏗️ Architecture Overview

```
                      ┌──────────────────────────────────────┐
                      │    Kaggle CSV Dataset Ingestion      │
                      │  (OTT Video, Telco Bundles, Uploads) │
                      └──────────────────┬───────────────────┘
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    Python 3.10 Subprocess Engine     │
                      │    (backend/workspace_engine.py)     │
                      └──────────┬────────────────┬──────────┘
                                 │                │
            ┌────────────────────┘                └────────────────────┐
            ▼                                                          ▼
┌──────────────────────────────┐                         ┌──────────────────────────────┐
│   Pluggable Strategy Mode    │                         │  In-Memory SQLite Database   │
├──────────────────────────────┤                         ├──────────────────────────────┤
│ 1. Pluggable Gateway Mock    │                         │ • B-Tree Indexed Relational  │
│ 2. Local Coded Algorithm     │                         │ • Sub-millisecond Execution  │
│ 3. Remote Cloud REST API     │                         │ • EXPLAIN QUERY PLAN Inspect │
└──────────────────────────────┘                         └──────────────┬───────────────┘
                                                                        │
                                                                        ▼
                                                         ┌──────────────────────────────┐
                                                         │   React 19 + Tailwind UI     │
                                                         │ • Transaction Workspace      │
                                                         │ • SVG Trend Trajectories     │
                                                         │ • Python & SQL Query Studio  │
                                                         │ • Gemini 3.8 Flash Reasoning │
                                                         └──────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.10+

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/churnshield-ai.git
   cd churnshield-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment (Optional)**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY if testing deep LLM ambiguity reasoning
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

The application is now a static Vite frontend and has no Express API or Python runtime
dependency. For the simplest workflow, run `npm run build` and use VS Code's **Go Live**
button to serve the generated `dist` folder. If Live Server opens the repository root,
open `go-live.html`; it redirects to the compiled application automatically.

### Production-style local run

```bash
npm run build
```

Then serve the generated `dist` folder with any static web server, including VS Code
Live Server.

---

## 📁 Repository Structure

```
├── backend/
│   └── workspace_engine.py      # Python 3.10 processor, Jev AI engine, in-memory SQLite DB
├── data/
│   ├── kaggle_ott_streaming_churn.csv   # Kaggle SVOD streaming benchmark dataset
│   └── kaggle_telco_bundle_churn.csv   # Kaggle broadband & video bundle dataset
├── src/
│   ├── components/
│   │   ├── CustomerDetailModal.tsx     # Inspection drawer with Jev AI arrays & Gemini LLM
│   │   ├── KaggleDatasetBar.tsx        # Dataset selector, raw viewer & CSV uploader
│   │   ├── LoyaltyLevelChart.tsx       # Distribution bar & cohort breakdown cards
│   │   ├── PluggableGatewayModal.tsx   # Gateway Mock console, chaos sliders & packet log
│   │   ├── PythonQueryStudio.tsx       # SQL terminal, query planner, and code inspector
│   │   ├── SubscriberPatternsChart.tsx # Tenure vs stream volume trajectory chart
│   │   └── TransactionWorkspaceTable.tsx # Cleaned customer transaction data table
│   ├── types/
│   │   └── index.ts                    # TypeScript schemas
│   ├── App.tsx                         # Main layout, overview metrics & routing
│   └── main.tsx                        # Application bootstrap
├── server.ts                           # Express server, Gateway Mock routes, Python dispatcher
├── SYNOPSIS.md                         # Comprehensive architecture documentation
└── README.md                           # Repository overview & setup guide
```

---

## 📄 License

This project is licensed under the Apache 2.0 License.
