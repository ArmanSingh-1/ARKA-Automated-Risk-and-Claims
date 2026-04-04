"""
ARKA Backend — FastAPI Entry Point
Starts the FastAPI server with:
- CORS middleware (frontend on :5173)
- APScheduler trigger monitor (every 10 min)
- ML artifact loading validation
- Health check + API test endpoints
- Auto-ping to keep server alive on Render (every 3 min)
"""

import logging
import sys
import os
import threading
import time
import requests
from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()  # Load .env before anything else

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ─── Logging setup ────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# ─── Scheduler reference (kept alive for app lifetime) ───────────────────────
scheduler = None
ping_thread = None


def start_ping_scheduler(server_url: str) -> threading.Thread:
    """
    Starts a background thread that pings the server every 3 minutes.
    This keeps the Render instance from spinning down due to inactivity.
    """
    def ping_server():
        while True:
            try:
                time.sleep(180)  # Wait 3 minutes
                response = requests.get(f"{server_url}/health", timeout=5)
                if response.status_code == 200:
                    logger.debug("✅ Ping successful — server kept alive.")
            except Exception as e:
                logger.debug(f"Ping attempt failed (non-critical): {e}")
    
    thread = threading.Thread(target=ping_server, daemon=True)
    thread.start()
    logger.info("✅ Ping scheduler started — server will ping itself every 3 minutes.")
    return thread


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown logic."""
    global scheduler, ping_thread

    # 1. Validate ML artifacts are loaded
    from app.services.risk_assessment import global_model, global_scaler
    if global_model and global_scaler:
        logger.info("✅ ML artifacts (SGD model + scaler) loaded successfully.")
    else:
        logger.warning("⚠️  ML artifacts missing — please run training in build phase.")

    # 2. Validate Supabase connection
    try:
        from app.db.supabase_client import get_supabase
        sb = get_supabase()
        test = sb.table("trigger_data").select("id").limit(1).execute()
        logger.info(f"✅ Supabase connected — trigger_data has rows: {bool(test.data)}")
    except Exception as e:
        logger.error(f"❌ Supabase connection failed: {e}")

    # 3. Start the trigger monitor scheduler
    from app.services.trigger_monitor import start_trigger_monitor_scheduler
    scheduler = start_trigger_monitor_scheduler()
    logger.info("✅ APScheduler started — trigger_monitoring_job every 10 minutes.")

    # 4. Start the auto-ping thread to keep Render instance alive
    server_url = os.getenv("RENDER_EXTERNAL_URL", "http://localhost:8000")
    ping_thread = start_ping_scheduler(server_url)

    yield  # App is running

    # Shutdown
    if scheduler and scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler stopped.")
    # Note: ping_thread is a daemon thread, so it will stop automatically


# ─── App init ─────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ARKA — Automated Risk and Claims API",
    description="Parametric insurance backend for Q-Commerce delivery partners.",
    version="0.1.0",
    lifespan=lifespan,
)

# ─── CORS ─────────────────────────────────────────────────────────────────────
# Get frontend URL from env or use defaults
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
render_frontend_url = os.getenv("RENDER_EXTERNAL_FRONTEND_URL", "")

cors_origins = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",   # fallback
    "http://127.0.0.1:5173",
    frontend_url,              # Production frontend URL
]
if render_frontend_url:
    cors_origins.append(render_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Health check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "ARKA backend is running."}


@app.get("/health", tags=["Health"])
def health():
    from app.services.risk_assessment import global_model, global_scaler
    return {
        "status": "ok",
        "ml_model_loaded": global_model is not None,
        "ml_scaler_loaded": global_scaler is not None,
        "scheduler_running": scheduler.running if scheduler else False,
    }


# ─── API Test: Trigger one monitoring cycle on demand ─────────────────────────
@app.post("/api/trigger/run-now", tags=["Trigger Monitor"])
def run_trigger_now():
    """Manually fire the trigger monitoring job — fetches all 3 APIs and saves to Supabase."""
    from app.services.trigger_monitor import trigger_monitoring_job
    try:
        trigger_monitoring_job()
        return {"status": "success", "message": "Trigger monitoring job completed. Check Supabase trigger_data table."}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


# ─── API Test: Fetch latest trigger data from Supabase ─────────────────────────
@app.get("/api/trigger/latest", tags=["Trigger Monitor"])
def get_latest_trigger_data():
    """Returns ONE latest trigger_data record per zone from Supabase (deduplicated)."""
    from app.db.supabase_client import get_supabase
    try:
        sb = get_supabase()
        # Fetch the latest 50 records then deduplicate by zone in Python
        result = sb.table("trigger_data") \
            .select("*") \
            .order("timestamp", desc=True) \
            .limit(50) \
            .execute()

        # Keep only the first (most recent) row per zone_id
        seen = set()
        deduped = []
        for row in (result.data or []):
            zid = row.get("zone_id")
            if zid and zid not in seen:
                seen.add(zid)
                deduped.append(row)

        return {"status": "success", "count": len(deduped), "data": deduped}
    except Exception as e:
        return {"status": "error", "detail": str(e)}


# ─── API Test: Risk assessment prediction ─────────────────────────────────────
@app.get("/api/risk/predict-demo", tags=["Risk Assessment"])
def predict_demo():
    """Demo endpoint — predicts weekly income for a sample delivery worker."""
    from app.services.risk_assessment import calculate_personalized_baseline
    try:
        sample_features = {
            "deliveries": 110,
            "hours": 42,
            "distance": 280,
            "zone_risk": 0.65,
            "rating": 4.6,
        }
        predicted = calculate_personalized_baseline(
            user_history=[],
            current_week_features=sample_features,
        )
        return {
            "status": "success",
            "input_features": sample_features,
            "predicted_weekly_income_inr": round(predicted, 2),
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}


@app.post("/api/risk/predict-user", tags=["Risk Assessment"])
def predict_user(data: dict):
    """
    Real user risk assessment endpoint.
    Accepts: { deliveries, hours, weekly_income, platform, zone }
    Returns: risk_score (0-100), predicted_weekly_income_inr, premium_tier (1/2/3)
    """
    from app.services.risk_assessment import calculate_personalized_baseline
    try:
        # Map platform to a zone risk proxy
        platform_risk = {
            "zepto": 0.70, "blinkit": 0.65, "swiggy": 0.55,
            "zomato": 0.50, "dunzo": 0.60, "other": 0.60,
        }
        platform = (data.get("platform") or "other").lower()
        zone_risk = platform_risk.get(platform, 0.60)

        features = {
            "deliveries": int(data.get("deliveries") or 80),
            "hours":      float(data.get("hours")      or 40),
            "distance":   float(data.get("hours", 40)) * 7.0,   # rough km estimate
            "zone_risk":  zone_risk,
            "rating":     4.5,
        }
        predicted = calculate_personalized_baseline(
            user_history=[],
            current_week_features=features,
        )
        # Risk score: higher predicted income = lower risk
        weekly_income = float(data.get("weekly_income") or predicted)
        # Better formula: income threshold for low risk is ₹15,000
        # Below ₹5,000 = 100 (very high risk)
        # ₹15,000+ = 20 (low risk)
        # Scale linearly in between
        if weekly_income < 5000:
            risk_score = 100
        elif weekly_income >= 15000:
            risk_score = 20
        else:
            # Linear scale from 100 (at ₹5k) to 20 (at ₹15k)
            risk_score = round(100 - ((weekly_income - 5000) / 10000) * 80)
        
        risk_score = min(100, max(0, risk_score))
        # Premium tier: low risk = 1%, medium = 2%, high = 3%
        premium_tier = 1 if risk_score < 35 else (2 if risk_score < 65 else 3)
        return {
            "status": "success",
            "risk_score": risk_score,
            "predicted_weekly_income_inr": round(predicted, 2),
            "premium_tier": premium_tier,
        }
    except Exception as e:
        return {"status": "error", "detail": str(e)}
