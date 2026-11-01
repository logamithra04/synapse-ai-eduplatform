# Synapse AI Learning Platform | AI-Powered Adaptive Data Science Education

[![Python](https://img.shields.io/badge/Python-3.14-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.162.0-009688.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC.svg)](https://tailwindcss.com)

**Synapse Data** is an educational SaaS platform dedicated to Data Science, Machine Learning, and AI education. Engineered with a human-designed, Figma-quality interface, it replaces static video playlists with **Bayesian Knowledge Tracing**, **in-browser Python & SQL sandboxes**, **context-aware AI tutoring**, and **7 real-world industry capstones**.

---

## 🚀 Live Services & Port Configuration

| Service | Technology | Port / URL | Status |
| :--- | :--- | :--- | :--- |
| **Frontend** | React 18 + Vite + TypeScript + Tailwind | `http://localhost:5173` | **Active (Daemon)** |
| **Backend API** | Python 3.14 + FastAPI + SQLite/PostgreSQL | `http://127.0.0.1:8000` | **Active (Daemon)** |
| **Interactive Docs** | OpenAPI / Swagger UI | `http://127.0.0.1:8000/docs` | **Active** |

---

## 🎨 UI/UX Design System

* **Color Palette**: Warm off-white canvas (`#F8FAFC`), deep navy/charcoal typography (`#0F172A`), muted indigo accents (`#4F46E5`), and subtle borders (`#E2E8F0`).
* **Typography**: Professional typography stack utilizing **Inter** for clean readability and **JetBrains Mono** for code and data tables.
* **Micro-Interactions**: Restrained, purposeful hover interactions, shadow elevations (`shadow-subtle`, `shadow-card`, `shadow-elevated`), and zero non-functional or placeholder buttons.

---

## 📚 13 Dedicated Curriculum Categories

1. **Python Programming**: Core syntax, list comprehensions, OOP, and data pipelines.
2. **Mathematics for Data Science**: Linear algebra, matrix decompositions, eigenvalues, and multivariable calculus.
3. **Statistics and Probability**: Inferential hypothesis testing, distributions, Bayes' Theorem, and A/B testing.
4. **SQL and Database Management**: Relational queries, complex multi-table joins, window functions, and CTEs.
5. **Data Analysis**: Structured data aggregation, cohort analysis, and quantitative problem solving.
6. **NumPy and Pandas**: High-performance vectorized arrays, DataFrame wrangling, and timeseries.
7. **Data Visualization**: Matplotlib, Seaborn, interactive Plotly visualizations, and data storytelling.
8. **Exploratory Data Analysis (EDA)**: Outlier detection, missing value imputation, and feature distributions.
9. **Machine Learning**: Supervised and unsupervised learning, Scikit-Learn pipelines, regularized regression, and random forests.
10. **Deep Learning**: Neural network foundations, backpropagation, and PyTorch dynamic graphs.
11. **Natural Language Processing (NLP)**: Tokenization, TF-IDF vectorization, embeddings, and sequence classification.
12. **Generative AI Fundamentals**: Transformer self-attention, prompt engineering, RAG pipelines, and vector indexes.
13. **Data Science Projects**: 7 portfolio-grade capstones solving real-world business challenges.

---

## 🧠 AI-Powered Adaptive Learning Engine

Unlike generic learning portals, Synapse incorporates **Bayesian Knowledge Tracing (BKT)** and **Item Response Theory (IRT)**:
* **Diagnostic Assessment**: Evaluates starting baseline across 6 technical domains.
* **Mastery Probability Tracking**: Every quiz response and coding challenge continuously updates the student's latent skill vector $\theta$.
* **Dynamic Difficulty Calibration**: If rolling accuracy exceeds 80%, questions shift to `Hard`; if below 45%, they adjust to `Easy` for foundational reinforcement.
* **Targeted Revision Suggestions**: Identified weak skills (<60% mastery) trigger automatic revision modules, while mastered topics (>80%) unlock capstone projects.

---

## 💻 Interactive Coding Lab

* **Execution Sandbox**: Zero local installation required.
* **Preloaded Datasets**: In-memory access to canonical Data Science datasets (Iris Flowers, California Housing, E-Commerce Orders).
* **Automated Unit Test Fixtures**: Validates student solutions against expected output vectors with runtime and memory footprint reporting.
* **Strict Security**: Zero arbitrary unsafe system commands executed on the application server.

---

## 🔬 7 Real-World Industry Projects

1. **Student Performance Prediction** (Multivariate Ridge Regression)
2. **House Price Valuation** (California Housing Gradient Boosting)
3. **Retail Sales Demand Forecasting** (Time Series with Rolling Lags)
4. **Customer Segmentation** (RFM Analysis & K-Means Clustering)
5. **Product Review Sentiment Analysis** (TF-IDF & Logistic Regression)
6. **Quantitative Stock Trend Momentum** (Moving Averages & RSI Indicators)
7. **Credit Card Fraud Detection** (Imbalanced Learning with SMOTE & Random Forest)

---

## 🏆 Verifiable Digital Certificates

Upon 100% course completion and assessment passage, Synapse generates an official cryptographically verifiable certificate with:
* Unique serial credential ID (`SYN-XXXXXXXX`)
* Cryptographic SHA verification hash
* Distinction honors grade
* Integrated printable certificate modal view

---

## ⚙️ Quick Start & Workspace Configuration

### 1. Active Workspace Directory
The complete full-stack project is located at:
```
C:\Users\KGCAS\.gemini\antigravity-ide\scratch\datascience-platform
```
*(Recommendation: Set this directory as your active workspace in Antigravity IDE).*

### 2. Running the Servers Manually (if restarted)

**Backend:**
```bash
cd backend
python run.py
# Runs FastAPI on http://127.0.0.1:8000
```

**Frontend:**
```bash
cd frontend
npm run dev
# Runs Vite dev server on http://localhost:5173
```

### 3. Demo Login Credentials

* **Student Account**: `alex.miller@student.edu` / `StudentPass123!`
* **Administrator Account**: `admin@synapse.edu` / `AdminPass123!`
*(Quick 1-click login buttons are also built directly into the Sign-In interface).*
>>>>>>> 2dc39ab (Initial commit: Synapse AI Learning Platform with Supabase, Prisma ORM, Video Player, AI Tutor & Certs)
