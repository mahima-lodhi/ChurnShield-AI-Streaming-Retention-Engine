#!/usr/bin/env python3
"""
ChurnShield - Local Data Workspace Engine
Integrates:
1. Dynamic Kaggle CSV Dataset Ingestion (no hardcoded records)
2. Jev AI Signature Parallel Categorical Array Model (Zero-Shot Grouping Matrix)
3. In-Memory SQLite Relational Database for High-Performance Query Optimization
"""

import sys
import os
import csv
import json
import sqlite3
import time
import urllib.request
import urllib.error

# Environment configuration for optional remote Jev AI API
JEV_AI_API_KEY = os.environ.get("JEV_AI_API_KEY", "").strip()
JEV_AI_API_ENDPOINT = os.environ.get("JEV_AI_API_ENDPOINT", "https://api.jev.ai/v1/categorical/classify").strip()

# Locate default Kaggle dataset path dynamically
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DATASET_PATH = os.path.join(BASE_DIR, "data", "kaggle_ott_streaming_churn.csv")
TELCO_DATASET_PATH = os.path.join(BASE_DIR, "data", "kaggle_telco_bundle_churn.csv")


def load_dataset_from_csv(file_path=None):
    """
    Dynamically loads transaction records from an authentic Kaggle CSV dataset.
    Reads CSV rows using DictReader, cleans and validates fields.
    """
    target_path = file_path or DEFAULT_DATASET_PATH

    # If relative path provided, resolve relative to project root
    if not os.path.isabs(target_path):
        target_path = os.path.join(BASE_DIR, target_path)

    if not os.path.exists(target_path):
        # Fallback check inside data directory
        alt_path = os.path.join(BASE_DIR, "data", os.path.basename(target_path))
        if os.path.exists(alt_path):
            target_path = alt_path
        else:
            target_path = DEFAULT_DATASET_PATH

    records = []
    if os.path.exists(target_path):
        with open(target_path, mode="r", encoding="utf-8-sig") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if not row or not any(row.values()):
                    continue
                try:
                    records.append({
                        "account_id": str(row.get("account_id", f"ACC-{len(records)+1}")).strip(),
                        "customer_name": str(row.get("customer_name", "Anonymous Subscriber")).strip(),
                        "plan_type": str(row.get("plan_type", "Standard HD")).strip(),
                        "monthly_fee": float(row.get("monthly_fee", 15.49)),
                        "tenure_months": int(float(row.get("tenure_months", 1))),
                        "payment_status": "Overdue" if str(row.get("payment_status", "")).strip().lower() in ["overdue", "failed", "late"] else "Paid",
                        "days_since_stream": int(float(row.get("days_since_stream", 0))),
                        "monthly_stream_hours": float(row.get("monthly_stream_hours", 10.0)),
                        "buffering_events": int(float(row.get("buffering_events", 0))),
                        "support_tickets": int(float(row.get("support_tickets", 0))),
                        "unstructured_feedback": str(row.get("unstructured_feedback", "")).strip()
                    })
                except Exception:
                    continue

    return records, os.path.basename(target_path)


# ==============================================================================
# 1. JEV AI PARALLEL CATEGORICAL ARRAY MODEL
# ==============================================================================
class JevAICategoricalEngine:
    """
    Jev AI Signature Parallel Categorical Array Engine:
    - Simultaneously maps multi-dimensional subscriber behaviors into 5 orthogonal vectors:
        1. SEI (Stream Engagement Index: 0–100)
        2. FIA (Friction & Incident Array: 0–100)
        3. EEA (Economic Elasticity Array: 0–100)
        4. SCM (Social & Multi-Seat Matrix: 0–100)
        5. CVV (Content Velocity Vector: 0–100)
    - Zero-Shot Grouping Matrix classification into Safe, Watchlist, or Critical tiers.
    """

    @staticmethod
    def compute_parallel_arrays(item):
        """Calculates Jev AI's 5 categorical dimensions."""
        stream_hours = float(item.get("monthly_stream_hours", 10.0))
        days_inactive = int(item.get("days_since_stream", 0))
        buffering = int(item.get("buffering_events", 0))
        tickets = int(item.get("support_tickets", 0))
        fee = float(item.get("monthly_fee", 15.49))
        tenure = int(item.get("tenure_months", 1))
        plan = str(item.get("plan_type", "Standard HD"))

        # 1. Stream Engagement Index (SEI: 0–100, higher is better)
        sei_raw = (min(100, (stream_hours / 50.0) * 80) + max(0, 100 - days_inactive * 5)) / 1.8
        sei = int(max(5, min(98, round(sei_raw))))

        # 2. Friction & Incident Array (FIA: 0–100, higher is more friction)
        fia_raw = (buffering * 14) + (tickets * 18)
        fia = int(max(0, min(99, round(fia_raw))))

        # 3. Economic Elasticity Array (EEA: 0–100, price sensitivity)
        eea_base = (fee / 24.99) * 60
        tenure_relief = min(20, tenure * 0.6)
        eea = int(max(10, min(95, round(eea_base + 30 - tenure_relief))))

        # 4. Social & Multi-Seat Matrix (SCM: 0–100, household retention anchor)
        scm = 85 if "Family" in plan else 70 if "Premium" in plan or "Bundle" in plan else 40 if "Annual" in plan else 30

        # 5. Content Velocity Vector (CVV: 0–100, consumption freshness)
        cvv = int(max(10, min(95, round((stream_hours / 40.0) * 70 + (25 if days_inactive <= 3 else 5)))))

        return {
            "sei": sei,
            "fia": fia,
            "eea": eea,
            "scm": scm,
            "cvv": cvv
        }

    @staticmethod
    def zero_shot_classify(parallel_arrays, payment_status, days_inactive):
        """
        Jev AI Zero-Shot Customer Grouping Matrix:
        Determines churn risk and assigns loyalty tier without pre-labeled training.
        """
        sei = parallel_arrays["sei"]
        fia = parallel_arrays["fia"]
        eea = parallel_arrays["eea"]
        scm = parallel_arrays["scm"]

        # Risk calculation balancing friction vs engagement buffers
        risk = 20
        risk += (fia * 0.40)                    # Friction increases risk
        risk += ((100 - sei) * 0.35)             # Decaying engagement increases risk
        risk += (eea * 0.15)                    # Price fatigue
        risk -= (scm * 0.15)                    # Multi-seat retention shield

        if payment_status == "Overdue":
            risk += 25
        if days_inactive > 14:
            risk += 20

        final_score = int(max(5, min(95, round(risk))))

        if final_score >= 65:
            loyalty_level = "High Risk (Critical)"
            action = "Immediate VIP CDN fast-path + 25% courtesy bill shield"
        elif final_score >= 35:
            loyalty_level = "Medium Risk (Watchlist)"
            action = "Targeted premiere binge unlock queue"
        else:
            loyalty_level = "High Loyalty (Safe)"
            action = "Standard loyalty maintenance"

        return final_score, loyalty_level, action

    @staticmethod
    def classify_subscriber(item):
        """
        Dual-Mode Classification:
        - Mode A (Remote Jev AI API): If JEV_AI_API_KEY is configured, sends HTTP POST to JEV_AI_API_ENDPOINT.
        - Mode B (Local Coded Engine): Executes internal parallel categorical arrays and zero-shot matrix.
        """
        payment_status = "Overdue" if str(item.get("payment_status", "")).strip().lower() in ["overdue", "failed"] else "Paid"
        days_inactive = int(float(item.get("days_since_stream", 0)))

        # If API key is set, attempt remote API call
        if JEV_AI_API_KEY:
            try:
                payload = json.dumps({
                    "account_id": item.get("account_id"),
                    "subscriber_features": {
                        "monthly_stream_hours": float(item.get("monthly_stream_hours", 10.0)),
                        "days_since_stream": days_inactive,
                        "buffering_events": int(float(item.get("buffering_events", 0))),
                        "support_tickets": int(float(item.get("support_tickets", 0))),
                        "monthly_fee": float(item.get("monthly_fee", 15.49)),
                        "tenure_months": int(float(item.get("tenure_months", 1))),
                        "payment_status": payment_status,
                        "plan_type": str(item.get("plan_type", "Standard HD"))
                    }
                }).encode("utf-8")

                req = urllib.request.Request(
                    JEV_AI_API_ENDPOINT,
                    data=payload,
                    headers={
                        "Content-Type": "application/json",
                        "Authorization": f"Bearer {JEV_AI_API_KEY}",
                        "User-Agent": "ChurnShield-JevClient/1.0"
                    },
                    method="POST"
                )

                with urllib.request.urlopen(req, timeout=2.5) as resp:
                    resp_data = json.loads(resp.read().decode("utf-8"))
                    arrays = resp_data.get("parallel_arrays", {})
                    risk_score = int(resp_data.get("risk_score", 50))
                    loyalty_level = resp_data.get("loyalty_level", "Medium Risk (Watchlist)")
                    action = resp_data.get("recommended_action", "Personalized retention reachout")
                    provider_tag = os.environ.get("JEV_PROVIDER", "")
                    mode_name = "Pluggable Gateway Mock" if provider_tag == "mock_gateway" else "Remote Jev AI Cloud API"
                    return arrays, risk_score, loyalty_level, action, mode_name
            except Exception:
                # Resilient fallback if remote endpoint is down or times out
                pass

        # Local Coded Algorithmic Engine (Default)
        arrays = JevAICategoricalEngine.compute_parallel_arrays(item)
        risk_score, loyalty_level, action = JevAICategoricalEngine.zero_shot_classify(
            arrays, payment_status, days_inactive
        )
        provider_tag = os.environ.get("JEV_PROVIDER", "")
        if provider_tag == "mock_gateway":
            mode = "Pluggable Gateway Mock (Fallback to Local)"
        elif JEV_AI_API_KEY:
            mode = "Remote Jev AI (Fallback to Local)"
        else:
            mode = "Local Coded Algorithm"
        return arrays, risk_score, loyalty_level, action, mode


# ==============================================================================
# 2. UNSTRUCTURED CATEGORY PARSER
# ==============================================================================
def parse_unstructured_categories(feedback_text):
    text = feedback_text.lower()
    categories = []

    if any(k in text for k in ["buffer", "spinning", "freeze", "crash", "error", "stutter", "resolution", "drop"]):
        categories.append({
            "category": "Playback Friction",
            "severity": "High" if ("constant" in text or "every 10 minutes" in text or "unreachable" in text) else "Medium",
            "snippet": "Buffering / video playback glitch"
        })

    if any(k in text for k in ["price", "expensive", "increase", "cost", "fee", "bill"]):
        categories.append({
            "category": "Price Sensitivity",
            "severity": "Medium",
            "snippet": "Subscription fee or price elasticity concern"
        })

    if any(k in text for k in ["nothing new", "stale", "catalog", "finished", "boring"]):
        categories.append({
            "category": "Content Fatigue",
            "severity": "Medium",
            "snippet": "Catalog exhaustion or series completion"
        })

    if any(k in text for k in ["password", "sharing", "household", "device", "lock", "throttle"]):
        categories.append({
            "category": "Device & Policy Constraint",
            "severity": "Medium",
            "snippet": "Device restrictions or bandwidth throttling"
        })

    if any(k in text for k in ["love", "smooth", "great", "top notch", "reliable", "phenomenal", "satisfied", "best"]):
        categories.append({
            "category": "High Satisfaction",
            "severity": "Low",
            "snippet": "Consistent viewing delight"
        })

    if not categories:
        categories.append({
            "category": "Neutral Activity",
            "severity": "Low",
            "snippet": "Standard account streaming"
        })

    return categories


def clean_and_process_records(raw_data=None, dataset_path=None):
    """
    Cleans and processes transactions:
    - If raw_data is not provided, dynamically loads from the specified Kaggle CSV file.
    - Computes Jev AI Parallel Categorical Arrays and Zero-Shot Grouping Matrix.
    """
    dataset_name = "custom"
    if raw_data is None:
        raw_data, dataset_name = load_dataset_from_csv(dataset_path)

    processed = []
    for item in raw_data:
        account_id = str(item.get("account_id", "")).strip()
        customer_name = str(item.get("customer_name", "")).strip()
        plan_type = str(item.get("plan_type", "Standard HD")).strip()
        monthly_fee = round(float(item.get("monthly_fee", 15.49)), 2)
        tenure_months = int(item.get("tenure_months", 1))
        days_since_stream = int(item.get("days_since_stream", 0))
        monthly_stream_hours = round(float(item.get("monthly_stream_hours", 10.0)), 1)
        buffering_events = int(item.get("buffering_events", 0))
        support_tickets = int(item.get("support_tickets", 0))
        payment_status = "Overdue" if str(item.get("payment_status", "")).strip().lower() in ["overdue", "failed"] else "Paid"
        feedback = str(item.get("unstructured_feedback", "")).strip()

        # Run Jev AI (Calls Remote Jev AI API if JEV_AI_API_KEY is configured, else runs local algorithm)
        jev_arrays, risk_score, loyalty_level, action, mode = JevAICategoricalEngine.classify_subscriber(item)

        parsed_cats = parse_unstructured_categories(feedback)

        record = {
            "account_id": account_id,
            "customer_name": customer_name,
            "plan_type": plan_type,
            "monthly_fee": monthly_fee,
            "tenure_months": tenure_months,
            "days_since_stream": days_since_stream,
            "monthly_stream_hours": monthly_stream_hours,
            "buffering_events": buffering_events,
            "support_tickets": support_tickets,
            "payment_status": payment_status,
            "unstructured_feedback": feedback,
            "risk_score": risk_score,
            "loyalty_level": loyalty_level,
            "primary_category": parsed_cats[0]["category"],
            "parsed_categories": parsed_cats,
            "recommended_action": action,
            "sei": jev_arrays["sei"],
            "fia": jev_arrays["fia"],
            "eea": jev_arrays["eea"],
            "scm": jev_arrays["scm"],
            "cvv": jev_arrays["cvv"]
        }
        processed.append(record)

    return processed, dataset_name


# ==============================================================================
# 3. SQLITE DATABASE WORKSPACE & OPTIMIZED QUERY EXECUTION
# ==============================================================================
class SQLiteDataWorkspace:
    """
    In-Memory Relational SQLite Database:
    - B-Tree indexed queries on risk_score, loyalty_level, payment_status, and primary_category.
    - True SQL relational query optimization with sub-millisecond execution times.
    """

    def __init__(self, records):
        self.conn = sqlite3.connect(":memory:")
        self.conn.row_factory = sqlite3.Row
        self._setup_schema()
        self._populate(records)

    def _setup_schema(self):
        cursor = self.conn.cursor()
        cursor.execute("""
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
                sei INTEGER,
                fia INTEGER,
                eea INTEGER,
                scm INTEGER,
                cvv INTEGER,
                recommended_action TEXT
            )
        """)
        # Create B-Tree indexes for fast SQL query execution
        cursor.execute("CREATE INDEX idx_risk ON transactions(risk_score DESC)")
        cursor.execute("CREATE INDEX idx_loyalty ON transactions(loyalty_level)")
        cursor.execute("CREATE INDEX idx_payment ON transactions(payment_status)")
        cursor.execute("CREATE INDEX idx_category ON transactions(primary_category)")
        self.conn.commit()

    def _populate(self, records):
        cursor = self.conn.cursor()
        for r in records:
            cursor.execute("""
                INSERT INTO transactions VALUES (
                    ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                )
            """, (
                r["account_id"],
                r["customer_name"],
                r["plan_type"],
                r["monthly_fee"],
                r["tenure_months"],
                r["payment_status"],
                r["days_since_stream"],
                r["monthly_stream_hours"],
                r["buffering_events"],
                r["support_tickets"],
                r["unstructured_feedback"],
                r["risk_score"],
                r["loyalty_level"],
                r["primary_category"],
                r["sei"],
                r["fia"],
                r["eea"],
                r["scm"],
                r["cvv"],
                r["recommended_action"]
            ))
        self.conn.commit()

    def execute_sql(self, sql_query):
        """Executes a SQL query, captures query plan, and returns execution metrics."""
        cursor = self.conn.cursor()
        t0 = time.perf_counter()

        # Sanitize query: allow only SELECT queries
        trimmed = sql_query.strip()
        if not trimmed.upper().startswith("SELECT"):
            sql_query = "SELECT * FROM transactions"

        # Capture EXPLAIN QUERY PLAN for SQL optimization transparency
        try:
            explain_cursor = self.conn.cursor()
            explain_cursor.execute(f"EXPLAIN QUERY PLAN {sql_query}")
            plan_rows = explain_cursor.fetchall()
            query_plan = [dict(row) for row in plan_rows]
        except Exception:
            query_plan = []

        # Execute actual SQL query
        cursor.execute(sql_query)
        rows = cursor.fetchall()
        latency_ms = round((time.perf_counter() - t0) * 1000, 2)

        data = [dict(row) for row in rows]
        return {
            "sql": sql_query,
            "matched_count": len(data),
            "execution_ms": latency_ms,
            "query_plan": query_plan,
            "data": data
        }


# ==============================================================================
# 4. DISPATCHER & CLI
# ==============================================================================
def run_workspace_sql(sql, dataset_path=None):
    records, dataset_name = clean_and_process_records(dataset_path=dataset_path)
    db = SQLiteDataWorkspace(records)
    res = db.execute_sql(sql)
    res["dataset_source"] = dataset_name
    return res


if __name__ == "__main__":
    if len(sys.argv) > 1:
        command = sys.argv[1]
        
        # Check if dataset path is passed as an optional flag or final argument
        dataset_arg = None
        for arg in sys.argv[2:]:
            if arg.endswith(".csv"):
                dataset_arg = arg
                break

        if command == "sql":
            query = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].endswith(".csv") else "SELECT * FROM transactions"
            result = run_workspace_sql(query, dataset_path=dataset_arg)
            print(json.dumps(result))

        elif command == "query":
            q_type = sys.argv[2] if len(sys.argv) > 2 and not sys.argv[2].endswith(".csv") else "all"
            if q_type == "high_risk_accounts":
                sql = "SELECT * FROM transactions WHERE risk_score >= 65 ORDER BY risk_score DESC"
            elif q_type == "buffering_friction_filter":
                sql = "SELECT * FROM transactions WHERE buffering_events >= 3 ORDER BY buffering_events DESC"
            elif q_type == "overdue_billing":
                sql = "SELECT * FROM transactions WHERE payment_status = 'Overdue'"
            elif q_type == "loyalty_summary":
                sql = "SELECT loyalty_level, COUNT(*) as accounts_count, ROUND(SUM(monthly_fee), 2) as total_mrr, ROUND(AVG(risk_score), 1) as avg_risk, ROUND(AVG(sei), 1) as avg_sei, ROUND(AVG(fia), 1) as avg_fia FROM transactions GROUP BY loyalty_level"
            else:
                sql = "SELECT * FROM transactions"

            result = run_workspace_sql(sql, dataset_path=dataset_arg)
            print(json.dumps(result))

        elif command == "process":
            records, dataset_name = clean_and_process_records(dataset_path=dataset_arg)
            output = {
                "records": records,
                "dataset_source": dataset_name,
                "count": len(records)
            }
            print(json.dumps(output))

        else:
            records, dataset_name = clean_and_process_records(dataset_path=dataset_arg)
            print(json.dumps(records))
    else:
        records, dataset_name = clean_and_process_records()
        print(json.dumps({"dataset": dataset_name, "records_count": len(records)}, indent=2))
