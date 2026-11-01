"""
DataTutor AI - Intelligent Project-Aware Chatbot Engine
Supports Google Gemini API via official google-genai SDK, multi-turn conversation memory,
active context injection (projects, real datasets, code sandbox), and deep domain RAG fallback.
"""

import os
import json
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime

from dotenv import load_dotenv
load_dotenv()
load_dotenv(os.path.expanduser("~/.env"))

# Load environment variable if present
GEMINI_API_KEY_ENV = os.getenv("GEMINI_API_KEY", "")

# ----------------- SYNAPSE PLATFORM PROJECT KNOWLEDGE -----------------

PROJECTS_KNOWLEDGE = {
    "student-performance-prediction": {
        "title": "Student Performance Prediction",
        "dataset": "student_academic_records.csv",
        "target": "final_exam_score",
        "features": ["study_hours_per_week", "attendance_rate", "previous_exam_score", "parent_education", "internet_access", "tutoring"],
        "recommended_models": ["Ridge Regression", "OLS Linear Regression", "Lasso"],
        "metrics": ["R-squared (> 0.82)", "RMSE", "MAE"],
        "key_steps": [
            "1. Inspect correlations: `df[['study_hours_per_week', 'attendance_rate', 'previous_exam_score', 'final_exam_score']].corr()`",
            "2. One-hot encode categorical variables like `parent_education` with `pd.get_dummies(df, drop_first=True)`",
            "3. Split into train/test (80/20) using `train_test_split(X, y, test_size=0.2, random_state=42)`",
            "4. Fit `Ridge(alpha=1.0)` and evaluate feature importances from `model.coef_`"
        ]
    },
    "house-price-prediction": {
        "title": "House Price Prediction & Valuation",
        "dataset": "california_housing_extended.csv",
        "target": "median_house_value",
        "features": ["median_income", "house_age", "ave_rooms", "ave_bedrooms", "population", "ave_occupancy", "latitude", "longitude"],
        "recommended_models": ["GradientBoostingRegressor", "RandomForestRegressor", "XGBoost"],
        "metrics": ["Mean Absolute Error (< 10% median)", "R-squared", "Residual distribution"],
        "key_steps": [
            "1. Check distribution of `median_house_value` and apply log transformation: `y_log = np.log1p(df['median_house_value'])`",
            "2. Feature engineering: `df['rooms_per_household'] = df['ave_rooms'] / df['ave_occupancy']`",
            "3. Train `GradientBoostingRegressor(n_estimators=150, learning_rate=0.08, max_depth=5)`",
            "4. Plot residuals (`y_test - y_pred`) to ensure errors are homoscedastic and zero-centered"
        ]
    },
    "sales-forecasting": {
        "title": "Retail Sales Forecasting",
        "dataset": "store_daily_sales.csv",
        "target": "daily_sales",
        "features": ["store_id", "department_id", "is_holiday", "temperature", "fuel_price", "markdown_promo", "cpi", "unemployment"],
        "recommended_models": ["SARIMA", "Prophet", "LightGBM with lag features"],
        "metrics": ["MAPE (< 8.5%)", "RMSE", "Rolling window cross-validation"],
        "key_steps": [
            "1. Convert `date` to datetime: `df['date'] = pd.to_datetime(df['date'])` and sort chronologically",
            "2. Generate 7-day and 30-day rolling sales lags: `df['lag_7'] = df.groupby(['store_id', 'department_id'])['daily_sales'].shift(7)`",
            "3. Incorporate calendar features: day of week, month, and holiday interactions",
            "4. Split by time (e.g. first 10 months for training, last 2 months for testing) to prevent future data leakage"
        ]
    },
    "customer-segmentation": {
        "title": "Customer Segmentation with RFM & K-Means",
        "dataset": "ecommerce_transactions.csv",
        "target": "Unsupervised Clusters",
        "features": ["recency_days", "frequency_orders", "monetary_spend"],
        "recommended_models": ["K-Means", "DBSCAN", "PCA for 2D visualization"],
        "metrics": ["Silhouette Score (> 0.55)", "Elbow Method Inertia curve"],
        "key_steps": [
            "1. Calculate RFM metrics per `customer_id`: Recency (days since last invoice), Frequency (count of unique invoices), Monetary (sum of quantity * unit_price)",
            "2. Apply log1p transformation to mitigate heavy right-skew in financial monetary values",
            "3. Scale features using `StandardScaler` so Euclidean distance is unbiased",
            "4. Run K-Means across k=2..8, compute silhouette scores, and label marketing personas (Champions, Loyal, At-Risk)"
        ]
    },
    "sentiment-analysis": {
        "title": "Sentiment Analysis on Product Reviews",
        "dataset": "customer_reviews_corpus.csv",
        "target": "sentiment (positive, neutral, negative)",
        "features": ["review_text", "headline", "star_rating", "verified_purchase"],
        "recommended_models": ["LogisticRegression with TF-IDF", "MultinomialNB", "DistilBERT"],
        "metrics": ["Macro F1-score (>= 0.88)", "Balanced Accuracy", "Confusion Matrix"],
        "key_steps": [
            "1. Clean text: lowercase, remove special characters, and strip stop-words",
            "2. Vectorize text with `TfidfVectorizer(ngram_range=(1,2), max_features=3000)`",
            "3. Train `LogisticRegression(class_weight='balanced', max_iter=500)`",
            "4. Inspect top positive and negative n-gram coefficients via `vectorizer.get_feature_names_out()`"
        ]
    },
    "stock-trend-analysis": {
        "title": "Stock Trend Analysis & Momentum Indicators",
        "dataset": "historical_stock_prices.csv",
        "target": "Trading Signals & Cumulative Return",
        "features": ["open", "high", "low", "close", "volume", "sma_20", "rsi_14"],
        "recommended_models": ["Rule-based Momentum Engine", "RandomForest Signal Classifier"],
        "metrics": ["Annualized Sharpe Ratio (> 1.2)", "Maximum Drawdown", "Cumulative Return Alpha"],
        "key_steps": [
            "1. Compute 20-day and 50-day Simple Moving Average crossovers",
            "2. Compute 14-period RSI: RSI < 30 indicates oversold (buy signal), RSI > 70 indicates overbought (sell signal)",
            "3. Construct long/cash position vectors shifted by 1 day to simulate real trade execution without lookahead bias",
            "4. Calculate daily strategy returns: `df['strat_ret'] = df['position'].shift(1) * df['close'].pct_change()`"
        ]
    },
    "credit-card-fraud-detection": {
        "title": "Credit Card Fraud Detection",
        "dataset": "creditcard_transactions_imbalanced.csv",
        "target": "class_label (0 = Normal, 1 = Fraud)",
        "features": ["time_seconds", "v1" , "v2", "...", "v10", "amount"],
        "recommended_models": ["RandomForestClassifier", "XGBoost", "Isolation Forest"],
        "metrics": ["PR-AUC (Precision-Recall AUC >= 0.85)", "Recall at 95% Precision", "Cost-sensitive Matrix"],
        "key_steps": [
            "1. Note extreme class imbalance (~0.25% fraud rate): standard accuracy is deceptive",
            "2. Perform stratified train/test split to preserve fraud distribution in both splits",
            "3. Apply SMOTE (Synthetic Minority Over-sampling) ONLY to training data, never to the validation set",
            "4. Tune classification probability threshold (e.g. p > 0.35 instead of default 0.5) to catch high-cost fraudulent transactions"
        ]
    }
}

DATABASE_SCHEMA_KNOWLEDGE = """
Relational Learning Database: `learning_database.db`
Tables available for SQL queries:
1. customers (customer_id PK, first_name, last_name, email, country, signup_date)
2. products (product_id PK, product_name, category, unit_price, inventory_count)
3. orders (order_id PK, customer_id FK, order_date, total_amount, status)
4. order_items (item_id PK, order_id FK, product_id FK, quantity, subtotal)
"""

def build_system_prompt(context: Optional[Dict[str, Any]] = None) -> str:
    """Builds a concise, highly relevant system prompt grounded in the platform's assets and active context."""
    base_prompt = (
        "You are 'DataTutor AI', the expert, responsive technical mentor embedded within the Synapse Data Science Platform.\n\n"
        "Core Guidelines:\n"
        "1. Direct & Fast: Give immediate, accurate answers to the user's specific request. If the user sends a simple greeting (e.g., 'hi', 'hello'), reply warmly in 1-2 friendly sentences and suggest 2-3 specific topics or exercises they can work on.\n"
        "2. Context-Aware & Related: Always tailor your response directly to the user's active page, course, lesson, dataset, or capstone project whenever context is present.\n"
        "3. Production Quality: When providing code, write clean, executable Python (pandas, scikit-learn, numpy) or SQLite SQL with concise inline commentary.\n"
        "4. Concise Formatting: Use clean markdown, bold terms, and bullet points. Avoid excessive fluff or boilerplate disclaimers.\n\n"
        "Platform Reference:\n"
        "- 13 curriculum categories (Python, Math, Stats, SQL, EDA, Machine Learning, Deep Learning, GenAI).\n"
        "- 7 canonical projects: Student Performance, California Housing, Store Sales Forecasting, Customer Segmentation (RFM), Product Sentiment NLP, Stock Momentum (SMA/RSI), Credit Card Fraud Detection (imbalanced).\n"
        f"- {DATABASE_SCHEMA_KNOWLEDGE}"
    )

    if not context:
        return base_prompt

    context_additions = ["\n\n--- Active User Context ---"]
    if context.get("project_slug") or context.get("project_title"):
        slug = context.get("project_slug", "")
        p_info = PROJECTS_KNOWLEDGE.get(slug)
        if p_info:
            context_additions.append(f"Active Project: '{p_info['title']}' (Dataset: '{p_info['dataset']}', Target: '{p_info['target']}')")
            context_additions.append(f"Recommended Models: {', '.join(p_info['recommended_models'])}")
        else:
            context_additions.append(f"Active Project: {context.get('project_title')}")

    if context.get("topic"):
        context_additions.append(f"Active Topic: {context.get('topic')}")
    if context.get("course_title"):
        context_additions.append(f"Current Course: {context.get('course_title')}")
    if context.get("lesson_title"):
        context_additions.append(f"Current Lesson: {context.get('lesson_title')}")
    if context.get("active_dataset"):
        context_additions.append(f"Preloaded Dataset: {context.get('active_dataset')}")
    if context.get("code"):
        context_additions.append(f"Active Code in Editor:\n```\n{context.get('code')}\n```")

    return base_prompt + "\n".join(context_additions)

# ----------------- GEMINI API INTEGRATION -----------------

def call_gemini_api(
    user_message: str,
    api_key: str,
    context: Optional[Dict[str, Any]] = None,
    history: Optional[List[Dict[str, str]]] = None
) -> Tuple[bool, str, str]:
    """
    Calls the Google Gemini API using the official google-genai SDK.
    Prioritizes ultra-fast models: gemini-3.5-flash-lite and gemini-flash-lite-latest (~1s latency).
    """
    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)
        system_instruction = build_system_prompt(context)

        # Build contents from history + current message
        contents = []
        if history:
            for turn in history[-6:]:  # Keep last 6 turns for conversational context
                role = "user" if turn.get("sender") == "user" else "model"
                contents.append(types.Content(
                    role=role,
                    parts=[types.Part.from_text(text=turn.get("text", ""))]
                ))

        # Add current user prompt
        contents.append(types.Content(
            role="user",
            parts=[types.Part.from_text(text=user_message)]
        ))

        # Ultra-fast models: gemini-3.5-flash-lite delivers sub-second responses without 503 spike delays
        candidate_models = ["gemini-3.5-flash-lite", "gemini-flash-lite-latest", "gemini-3.5-flash"]
        last_error = ""

        for model_id in candidate_models:
            try:
                response = client.models.generate_content(
                    model=model_id,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=system_instruction,
                        temperature=0.3,
                        max_output_tokens=700
                    )
                )
                if response and response.text:
                    return True, response.text, model_id
            except Exception as e:
                last_error = str(e)
                continue

        return False, f"Gemini API request failed across models: {last_error}", ""
    except ImportError:
        return False, "google-genai SDK not available in environment.", ""
    except Exception as e:
        return False, f"API Exception: {str(e)}", ""

def verify_gemini_key(api_key: str) -> Tuple[bool, str]:
    """Verifies if a Gemini API key is valid by running a lightweight test call."""
    if not api_key or len(api_key.strip()) < 15:
        return False, "API key format appears invalid (too short)."
    try:
        from google import genai
        client = genai.Client(api_key=api_key.strip())
        candidate_models = ["gemini-3.8-flash", "gemini-3.5-flash-lite"]
        for model_id in candidate_models:
            try:
                res = client.models.generate_content(
                    model=model_id,
                    contents="Respond with only the word 'OK'."
                )
                if res and res.text:
                    return True, f"API Key successfully validated with {model_id}."
            except Exception as e:
                err_str = str(e)
                if "API_KEY_INVALID" in err_str or "INVALID_ARGUMENT" in err_str:
                    return False, f"Key Validation Failed: {err_str}"
                continue
        return False, "Key Validation Failed: Models currently unavailable. Please try again shortly."
    except Exception as e:
        return False, f"Key Validation Failed: {str(e)}"

# ----------------- DOMAIN-SPECIFIC PROJECT RAG ENGINE -----------------

def generate_project_rag_response(user_message: str, context: Optional[Dict[str, Any]] = None) -> str:
    """
    Intelligent Project-Grounded RAG generator.
    Delivers deep technical, actionable explanations tailored to the 7 Synapse projects,
    canonical datasets, and SQL learning database.
    """
    query = user_message.lower().strip()

    # 0. Conversational Greetings & General Inquiries
    clean_query = query.strip(" !.,?").lower()
    greeting_triggers = {"hi", "hello", "hey", "hey there", "greetings", "good morning", "good afternoon", "good evening", "how are you", "who are you", "help"}
    if clean_query in greeting_triggers or any(clean_query.startswith(g) for g in ["hi ", "hello ", "hey "]):
        context_mention = ""
        if context and context.get("project_title"):
            context_mention = f" I see you're currently working on **{context.get('project_title')}**."
        elif context and context.get("course_title"):
            context_mention = f" I see you're enrolled in **{context.get('course_title')}**."
        elif context and context.get("topic"):
            context_mention = f" I see you're exploring **{context.get('topic')}**."

        return (
            f"👋 Hello! I'm **DataTutor AI**, your technical mentor at Synapse Data Science Platform.{context_mention}\n\n"
            "How can I help you right now? Here are a few things you can ask me:\n"
            "- *\"What models should I use for this project?\"*\n"
            "- *\"How do I prevent data leakage during train/test split?\"*\n"
            "- *\"Show me an example SQL query on learning_database.db\"*\n"
            "- *\"Explain the Bias-Variance tradeoff with a Python code snippet\"*"
        )

    # 1. Check Project Slug from Context or Query
    matched_slug = None
    if context and context.get("project_slug") in PROJECTS_KNOWLEDGE:
        matched_slug = context.get("project_slug")

    PROJECT_KEYWORD_MAP = {
        "student-performance-prediction": ["student", "academic", "gpa", "grade", "exam", "study"],
        "house-price-prediction": ["housing", "california", "house value", "real estate", "house price", "median_house_value"],
        "sales-forecasting": ["retail", "sales", "store", "forecasting", "weekly sales", "store sales", "inventory"],
        "customer-segmentation": ["rfm", "segmentation", "recency", "frequency", "monetary", "k-means", "cluster", "clustering"],
        "sentiment-analysis": ["sentiment", "review", "reviews", "nlp", "tfidf", "text classification", "text"],
        "stock-trend-analysis": ["stock", "momentum", "rsi", "sma", "sharpe", "trading", "stocks", "trend"],
        "credit-card-fraud-detection": ["fraud", "credit card", "imbalance", "smote", "pr-auc", "minority class"]
    }

    if not matched_slug:
        for slug, p in PROJECTS_KNOWLEDGE.items():
            if slug in query or p["title"].lower() in query or p["dataset"].lower() in query:
                matched_slug = slug
                break
            # Check synonyms
            keywords = PROJECT_KEYWORD_MAP.get(slug, [])
            if any(kw in query for kw in keywords):
                matched_slug = slug
                break

    if matched_slug and matched_slug in PROJECTS_KNOWLEDGE:
        p = PROJECTS_KNOWLEDGE[matched_slug]
        steps_md = "\n".join(p["key_steps"])
        return (
            f"### Project Guidance: {p['title']}\n\n"
            f"**Canonical Dataset:** `{p['dataset']}`  \n"
            f"**Target Variable:** `{p['target']}`  \n"
            f"**Primary Objective:** Build and evaluate a production-grade predictive model using `{', '.join(p['recommended_models'])}`.\n\n"
            "#### Implementation Blueprint:\n"
            f"{steps_md}\n\n"
            "#### Recommended Evaluation Metrics:\n"
            f"- {', '.join(p['metrics'])}\n\n"
            "```python\n"
            f"# Starter pipeline for {p['title']}\n"
            "import pandas as pd\n"
            "import numpy as np\n"
            "from sklearn.model_selection import train_test_split\n\n"
            f"# Load verified dataset from Synapse data catalog\n"
            f"df = pd.read_csv('backend/data/{p['dataset']}')\n"
            "print('Dataset Shape:', df.shape)\n"
            "print(df.head())\n"
            "```\n\n"
            "Would you like me to walk through the feature engineering steps or help you write the evaluation pipeline?"
        )

    # 2. Datasets & Catalog Inquiry
    if "dataset" in query or "csv" in query or "catalog" in query or "data files" in query:
        return (
            "### Synapse Platform Canonical Datasets\n\n"
            "All datasets are generated, schema-validated, and preloaded into `backend/data/`:\n\n"
            "1. `student_academic_records.csv` (1,200 rows) — Student GPA, attendance, and demographics\n"
            "2. `california_housing_extended.csv` (2,000 rows) — Regional housing values with geographic coordinates\n"
            "3. `store_daily_sales.csv` (3,500 rows) — Multi-store time-series sales with promotional flags\n"
            "4. `ecommerce_transactions.csv` (5,000 rows) — Customer transactions for RFM segmentation\n"
            "5. `customer_reviews_corpus.csv` (2,500 rows) — Customer text reviews with sentiment labels\n"
            "6. `historical_stock_prices.csv` (1,800 rows) — Daily OHLCV stock quotes with technical indicators\n"
            "7. `creditcard_transactions_imbalanced.csv` (10,000 rows) — Imbalanced fraud detection dataset (0.3% fraud rate)\n"
            "8. `iris.csv` (150 rows) & `titanic.csv` (891 rows) — Foundational benchmark datasets for interactive lessons\n"
            "9. `learning_database.db` — SQLite relational database with 4 connected tables (`customers`, `products`, `orders`, `order_items`).\n\n"
            "You can download any dataset directly from the Data Catalog tab or load it via `pd.read_csv('backend/data/<filename>')`."
        )

    # 3. SQL & Relational Queries
    if "sql" in query or "join" in query or "query" in query or "orders" in query or "customers" in query or "database" in query:
        return (
            "### Working with Synapse `learning_database.db`\n\n"
            "The platform includes a real SQLite database containing customer transactions across 4 related tables:\n\n"
            "```sql\n"
            "-- Multi-table join calculating customer lifetime value (LTV) and order stats\n"
            "SELECT \n"
            "    c.customer_id,\n"
            "    c.first_name || ' ' || c.last_name AS customer_name,\n"
            "    c.country,\n"
            "    COUNT(DISTINCT o.order_id) AS total_orders,\n"
            "    ROUND(SUM(o.total_amount), 2) AS total_spent,\n"
            "    ROUND(AVG(o.total_amount), 2) AS avg_order_value\n"
            "FROM customers c\n"
            "JOIN orders o ON c.customer_id = o.customer_id\n"
            "WHERE o.status = 'COMPLETED'\n"
            "GROUP BY c.customer_id\n"
            "HAVING COUNT(o.order_id) >= 1\n"
            "ORDER BY total_spent DESC;\n"
            "```\n\n"
            "**Key SQL Tips for the Lab:**\n"
            "- Use `JOIN order_items oi ON o.order_id = oi.order_id` to inspect item-level quantities and SKU pricing.\n"
            "- SQLite supports standard window functions like `ROW_NUMBER() OVER (PARTITION BY c.country ORDER BY total_amount DESC)`."
        )

    # 4. Pandas & EDA
    if "pandas" in query or "dataframe" in query or "groupby" in query or "null" in query or "missing" in query or "eda" in query:
        return (
            "### Exploratory Data Analysis & Pandas Best Practices\n\n"
            "Here is the standard workflow when inspecting any dataset in Synapse:\n\n"
            "```python\n"
            "import pandas as pd\n"
            "import numpy as np\n\n"
            "# 1. Structure & Types\n"
            "print('Shape:', df.shape)\n"
            "print(df.info())\n\n"
            "# 2. Missing Value Audit\n"
            "missing = df.isnull().sum()\n"
            "print('Missing Values:\\n', missing[missing > 0])\n\n"
            "# 3. Statistical Distribution\n"
            "print(df.describe(include='all'))\n\n"
            "# 4. Fast Grouped Aggregation\n"
            "summary = df.groupby('category').agg(\n"
            "    mean_val=('value', 'mean'),\n"
            "    count=('value', 'count'),\n"
            "    p95=('value', lambda x: np.percentile(x, 95))\n"
            ").reset_index()\n"
            "```"
        )

    # 5. Default Comprehensive Mentor Response
    active_ctx = ""
    if context and context.get("project_title"):
        active_ctx = f" (Context: {context.get('project_title')})"

    return (
        f"### DataTutor AI Guidance{active_ctx}\n\n"
        "Let's tackle this systematically:\n\n"
        "1. **Core Concept**: Data Science problems require separating exploratory data understanding from rigorous out-of-sample evaluation.\n"
        "2. **Standard Workflow**:\n"
        "   - **Data Audit**: Check distributions, outliers, and missing indicators.\n"
        "   - **Baseline Model**: Train a simple interpretable model (e.g. Ridge or Logistic Regression) before complex ensembles.\n"
        "   - **Metric Alignment**: Choose metrics aligned with business objectives (e.g., RMSE for pricing, F1/PR-AUC for classification).\n\n"
        "```python\n"
        "# Standard Scikit-Learn Pipeline with Preprocessing\n"
        "from sklearn.pipeline import Pipeline\n"
        "from sklearn.preprocessing import StandardScaler\n"
        "from sklearn.linear_model import Ridge\n\n"
        "pipeline = Pipeline([\n"
        "    ('scaler', StandardScaler()),\n"
        "    ('regressor', Ridge(alpha=1.0))\n"
        "])\n"
        "```\n\n"
        "💡 *Tip: To connect DataTutor directly to live Google Gemini intelligence, click the Key icon in the top header and add your Gemini API Key.*"
    )

# ----------------- MAIN DISPATCH FUNCTION -----------------

def generate_ai_response(
    user_message: str,
    context: Optional[Dict[str, Any]] = None,
    api_key: Optional[str] = None,
    history: Optional[List[Dict[str, str]]] = None
) -> Dict[str, Any]:
    """
    Main entry point for AI chat.
    Resolves API key from request, headers, or environment.
    Calls Gemini API if available, falling back seamlessly to project RAG.
    """
    env_key = os.getenv("GEMINI_API_KEY", "").strip() or GEMINI_API_KEY_ENV.strip()
    resolved_key = (api_key or "").strip() or env_key

    if resolved_key:
        success, response_text, model_name = call_gemini_api(user_message, resolved_key, context, history)
        if success:
            return {
                "response": response_text,
                "source": "gemini_api",
                "model": model_name or "gemini-3.5-flash-lite",
                "timestamp": datetime.utcnow().isoformat()
            }
        else:
            # Fallback with diagnostic note
            rag_response = generate_project_rag_response(user_message, context)
            return {
                "response": f"{rag_response}\n\n> [!NOTE]\n> *Switched to Project RAG Knowledge Engine. (API notice: {response_text[:120]}...)*",
                "source": "project_rag_fallback",
                "model": "synapse-project-rag",
                "timestamp": datetime.utcnow().isoformat()
            }

    # No API Key provided: Use direct Project RAG Engine
    rag_response = generate_project_rag_response(user_message, context)
    return {
        "response": rag_response,
        "source": "project_rag",
        "model": "synapse-project-rag",
        "timestamp": datetime.utcnow().isoformat()
    }
