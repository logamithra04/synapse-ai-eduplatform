import os
import time
import requests
from typing import Optional, Dict, Any
from dotenv import load_dotenv, set_key

# Load environment
ENV_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
load_dotenv(ENV_PATH)

# In-memory config overrides for dynamic updates
runtime_config: Dict[str, Optional[str]] = {
    "supabase_url": os.getenv("SUPABASE_URL"),
    "supabase_key": os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY"),
    "supabase_service_role_key": os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
    "database_url": os.getenv("DATABASE_URL")
}

_supabase_client = None

def get_config() -> Dict[str, Optional[str]]:
    """Return the active Supabase configuration."""
    return {
        "supabase_url": runtime_config.get("supabase_url") or os.getenv("SUPABASE_URL"),
        "supabase_key": runtime_config.get("supabase_key") or os.getenv("SUPABASE_KEY") or os.getenv("SUPABASE_ANON_KEY"),
        "supabase_service_role_key": runtime_config.get("supabase_service_role_key") or os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        "database_url": runtime_config.get("database_url") or os.getenv("DATABASE_URL")
    }

def get_supabase_client():
    """Returns an initialized Supabase Python client instance if configured."""
    global _supabase_client
    cfg = get_config()
    url = cfg.get("supabase_url")
    key = cfg.get("supabase_key")

    if not url or not key:
        return None

    if _supabase_client is None:
        try:
            from supabase import create_client
            _supabase_client = create_client(url, key)
        except Exception as e:
            print(f"[Supabase] Failed to initialize client: {e}")
            return None

    return _supabase_client

def test_supabase_connection(url: str, key: str) -> Dict[str, Any]:
    """
    Tests live connectivity to a Supabase project URL and API key.
    Measures latency and checks auth/rest endpoints.
    """
    if not url or not key:
        return {
            "success": False,
            "error": "Both Supabase Project URL and API Key are required."
        }

    # Normalize URL
    clean_url = url.strip().rstrip('/')
    if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
        clean_url = f"https://{clean_url}"

    headers = {
        "apikey": key.strip(),
        "Authorization": f"Bearer {key.strip()}"
    }

    start_time = time.time()
    try:
        # Check Supabase Auth/Health or REST API
        test_endpoint = f"{clean_url}/auth/v1/health"
        resp = requests.get(test_endpoint, headers=headers, timeout=5)
        latency = round((time.time() - start_time) * 1000, 1)

        if resp.status_code in [200, 204]:
            return {
                "success": True,
                "latency_ms": latency,
                "url": clean_url,
                "auth_status": "healthy",
                "message": f"Successfully connected to Supabase ({latency}ms latency)."
            }
        
        # Fallback check on REST root
        rest_resp = requests.get(f"{clean_url}/rest/v1/", headers=headers, timeout=5)
        latency = round((time.time() - start_time) * 1000, 1)
        if rest_resp.status_code in [200, 204]:
            return {
                "success": True,
                "latency_ms": latency,
                "url": clean_url,
                "auth_status": "healthy",
                "message": f"Successfully connected to Supabase REST API ({latency}ms latency)."
            }

        if rest_resp.status_code == 401:
            return {
                "success": False,
                "error": "Invalid API key provided. Check your Supabase anon/public key."
            }

        return {
            "success": False,
            "status_code": resp.status_code,
            "error": f"Supabase responded with status {resp.status_code}: {resp.text[:120]}"
        }
    except requests.exceptions.Timeout:
        return {
            "success": False,
            "error": "Connection timed out connecting to Supabase project URL."
        }
    except Exception as ex:
        return {
            "success": False,
            "error": f"Connection error: {str(ex)}"
        }

def get_supabase_status() -> Dict[str, Any]:
    """Returns comprehensive connection status for the backend."""
    cfg = get_config()
    url = cfg.get("supabase_url")
    key = cfg.get("supabase_key")
    db_url = cfg.get("database_url") or ""

    is_configured = bool(url and key)
    is_postgres = "postgres" in db_url.lower()

    if not is_configured:
        return {
            "configured": False,
            "connected": False,
            "mode": "sqlite_fallback",
            "database_engine": "SQLite (Local platform.db)",
            "supabase_url": None,
            "latency_ms": None,
            "message": "Supabase credentials not configured. Running in local SQLite mode."
        }

    # Test the configured connection
    test_result = test_supabase_connection(url, key)
    return {
        "configured": True,
        "connected": test_result.get("success", False),
        "mode": "supabase_cloud" if test_result.get("success") else "sqlite_fallback",
        "database_engine": "Supabase PostgreSQL" if is_postgres else "SQLite (Hybrid Sync)",
        "supabase_url": url,
        "latency_ms": test_result.get("latency_ms"),
        "error": test_result.get("error"),
        "message": test_result.get("message", "Connected to Supabase Cloud.")
    }

def test_database_connection(db_url: str) -> Dict[str, Any]:
    """
    Tests direct PostgreSQL connectivity using psycopg2 with a 5s connection timeout.
    """
    if not db_url or "[YOUR-PASSWORD]" in db_url or "YOUR-PASSWORD" in db_url:
        return {
            "success": False,
            "error": "Please replace [YOUR-PASSWORD] with your actual Supabase database password."
        }

    clean_url = db_url.strip()
    if clean_url.startswith("postgres://"):
        clean_url = "postgresql://" + clean_url[11:]

    start_time = time.time()
    try:
        import psycopg2
        conn = psycopg2.connect(clean_url, connect_timeout=5)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        pg_version = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        latency = round((time.time() - start_time) * 1000, 1)

        return {
            "success": True,
            "latency_ms": latency,
            "version": pg_version.split(',')[0],
            "message": f"Successfully connected to Supabase PostgreSQL ({latency}ms latency)."
        }
    except Exception as ex:
        err_msg = str(ex).strip()
        hint = ""
        if "password authentication failed" in err_msg.lower():
            hint = " (Tip: Check your database password. If it contains special characters, ensure they are percent-encoded.)"
        elif "could not translate host name" in err_msg.lower() or "name or service not known" in err_msg.lower():
            hint = " (Tip: Check database host: db.gawaupyzdclgbhqxcedi.supabase.co)"
        return {
            "success": False,
            "error": f"{err_msg}{hint}"
        }

def update_supabase_config(url: str, key: str, database_url: Optional[str] = None) -> Dict[str, Any]:
    """
    Updates the Supabase credentials in memory and persists them to backend/.env.
    """
    global _supabase_client
    clean_url = url.strip().rstrip('/')
    if not clean_url.startswith("http://") and not clean_url.startswith("https://"):
        clean_url = f"https://{clean_url}"

    clean_key = key.strip()

    # Update runtime config
    runtime_config["supabase_url"] = clean_url
    runtime_config["supabase_key"] = clean_key
    if database_url:
        runtime_config["database_url"] = database_url.strip()

    # Reset client instance to trigger recreation
    _supabase_client = None

    # Write to .env file safely
    try:
        if not os.path.exists(ENV_PATH):
            with open(ENV_PATH, "w") as f:
                f.write("# Synapse Platform Environment\n")
        
        set_key(ENV_PATH, "SUPABASE_URL", clean_url)
        set_key(ENV_PATH, "SUPABASE_KEY", clean_key)
        set_key(ENV_PATH, "SUPABASE_ANON_KEY", clean_key)
        if database_url:
            set_key(ENV_PATH, "DATABASE_URL", database_url.strip())
    except Exception as e:
        print(f"[Supabase] Note: could not write to .env ({e}), runtime config updated successfully.")

    # If valid database URL provided, dynamically switch SQLAlchemy engine
    db_test = None
    if database_url and "[YOUR-PASSWORD]" not in database_url:
        try:
            from .database import switch_database_engine
            switch_database_engine(database_url)
            db_test = test_database_connection(database_url)
        except Exception as e:
            print(f"[Supabase] switch_database_engine note: {e}")

    # Test new connection
    test_res = test_supabase_connection(clean_url, clean_key)
    return {
        "saved": True,
        "supabase_url": clean_url,
        "test_result": test_res,
        "db_test": db_test
    }
