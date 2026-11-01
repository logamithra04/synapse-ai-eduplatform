"""
Synapse Data Science Platform - Dataset Generator
Generates realistic, production-grade CSV datasets for capstone projects and sandbox exercises,
plus an interactive SQLite relational database for SQL labs.
"""

import os
import csv
import random
import sqlite3
import math
from datetime import datetime, timedelta

DATA_DIR = os.path.dirname(os.path.abspath(__file__))

def ensure_dir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)

def generate_student_records(filepath, n=650):
    """Generates Student Academic Records with realistic statistical correlations."""
    random.seed(42)
    parents_edu = ["High School", "Some College", "Associate Degree", "Bachelor's", "Master's"]
    genders = ["Female", "Male"]
    rows = []
    
    for i in range(1, n + 1):
        gender = random.choice(genders)
        age = random.randint(15, 19)
        study_hours = round(random.normalvariate(18, 6), 1)
        study_hours = max(2.0, min(40.0, study_hours))
        
        attendance = round(random.normalvariate(86, 10), 1)
        attendance = max(45.0, min(100.0, attendance))
        
        previous_score = round(random.normalvariate(72, 12), 1)
        previous_score = max(35.0, min(99.0, previous_score))
        
        parent_edu = random.choice(parents_edu)
        internet = "Yes" if random.random() > 0.12 else "No"
        tutoring = "Yes" if random.random() > 0.65 else "No"
        sleep_hours = round(random.normalvariate(7.2, 1.1), 1)
        sleep_hours = max(4.0, min(10.5, sleep_hours))
        
        # Correlated final exam score (Ridge/OLS regression target)
        edu_bonus = parents_edu.index(parent_edu) * 1.5
        internet_bonus = 2.0 if internet == "Yes" else 0.0
        tutoring_bonus = 3.5 if tutoring == "Yes" else 0.0
        
        score_base = (
            0.45 * previous_score +
            0.85 * study_hours +
            0.32 * attendance +
            edu_bonus + internet_bonus + tutoring_bonus +
            random.normalvariate(0, 3.5)
        )
        final_score = round(max(20.0, min(100.0, score_base)), 1)
        
        rows.append({
            "student_id": f"STD_{1000 + i}",
            "gender": gender,
            "age": age,
            "study_hours_per_week": study_hours,
            "attendance_rate": attendance,
            "previous_exam_score": previous_score,
            "parent_education": parent_edu,
            "internet_access": internet,
            "tutoring": tutoring,
            "sleep_hours": sleep_hours,
            "final_exam_score": final_score
        })
        
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} records for {os.path.basename(filepath)}")

def generate_california_housing(filepath, n=1200):
    """Generates California Housing Extended records with geographical features."""
    random.seed(42)
    rows = []
    
    # Representative CA coordinate clusters (SF Bay, LA Basin, Central Valley, San Diego)
    regions = [
        {"name": "Bay Area", "lat": 37.77, "lon": -122.41, "med_inc": 8.5, "base_val": 4.5},
        {"name": "LA Basin", "lat": 34.05, "lon": -118.24, "med_inc": 5.8, "base_val": 3.8},
        {"name": "Central Valley", "lat": 36.74, "lon": -119.78, "med_inc": 3.2, "base_val": 1.6},
        {"name": "San Diego", "lat": 32.71, "lon": -117.16, "med_inc": 6.2, "base_val": 3.9},
    ]
    
    for i in range(1, n + 1):
        reg = random.choice(regions)
        lat = round(reg["lat"] + random.normalvariate(0, 0.45), 4)
        lon = round(reg["lon"] + random.normalvariate(0, 0.45), 4)
        
        med_inc = round(max(0.8, random.normalvariate(reg["med_inc"], 2.1)), 4)
        house_age = random.randint(3, 52)
        ave_rooms = round(max(2.5, random.normalvariate(5.4, 1.2)), 2)
        ave_bedrooms = round(max(0.8, min(ave_rooms - 0.5, random.normalvariate(1.1, 0.3))), 2)
        population = int(max(150, random.normalvariate(1400, 600)))
        ave_occup = round(max(1.5, random.normalvariate(3.0, 0.8)), 2)
        
        # House value ($100,000s)
        val = (
            reg["base_val"] * 0.4 +
            med_inc * 0.45 +
            (ave_rooms / 10.0) * 0.3 -
            (house_age / 100.0) * 0.15 +
            random.normalvariate(0, 0.3)
        )
        med_house_val = round(max(0.45, min(5.0, val)), 4)
        
        rows.append({
            "block_id": f"BLK_{2000 + i}",
            "median_income": med_inc,
            "house_age": house_age,
            "ave_rooms": ave_rooms,
            "ave_bedrooms": ave_bedrooms,
            "population": population,
            "ave_occupancy": ave_occup,
            "latitude": lat,
            "longitude": lon,
            "median_house_value": med_house_val
        })
        
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} records for {os.path.basename(filepath)}")

def generate_store_sales(filepath, n_days=365):
    """Generates Daily Store Sales Time Series."""
    random.seed(42)
    start_date = datetime(2025, 1, 1)
    stores = [1, 2, 3, 4]
    departments = [1, 2, 5, 8]
    rows = []
    
    for d in range(n_days):
        curr_date = start_date + timedelta(days=d)
        date_str = curr_date.strftime("%Y-%m-%d")
        day_of_week = curr_date.weekday()
        month = curr_date.month
        
        # Seasonality factors
        is_weekend = 1 if day_of_week >= 5 else 0
        is_holiday = 1 if (month == 11 and curr_date.day in [27, 28]) or (month == 12 and curr_date.day in [24, 25, 31]) else 0
        
        for store in stores:
            for dept in departments:
                temp = round(60 + 20 * math.sin((d / 365) * 2 * math.pi) + random.normalvariate(0, 4), 1)
                fuel_price = round(3.40 + 0.3 * math.sin((d / 180) * 2 * math.pi) + random.normalvariate(0, 0.05), 2)
                cpi = round(215.0 + (d * 0.02) + random.normalvariate(0, 0.1), 2)
                unemp = round(6.5 - (d * 0.002) + random.normalvariate(0, 0.05), 2)
                
                base_sales = 12000 + (store * 2500) + (dept * 1500)
                promo = round(max(0, random.normalvariate(500, 300)) if is_holiday or is_weekend else 0, 2)
                
                sales = (
                    base_sales * (1.35 if is_weekend else 1.0) *
                    (1.70 if is_holiday else 1.0) +
                    promo * 1.5 +
                    random.normalvariate(0, 800)
                )
                daily_sales = round(max(1500.0, sales), 2)
                
                rows.append({
                    "date": date_str,
                    "store_id": store,
                    "department_id": dept,
                    "daily_sales": daily_sales,
                    "is_holiday": is_holiday,
                    "temperature": temp,
                    "fuel_price": fuel_price,
                    "markdown_promo": promo,
                    "cpi": cpi,
                    "unemployment": unemp
                })
                
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} records for {os.path.basename(filepath)}")

def generate_ecommerce_rfm(filepath, n_trans=1500):
    """Generates E-Commerce Transactions for RFM Customer Segmentation."""
    random.seed(42)
    start_date = datetime(2025, 1, 1)
    customers = [f"CUST_{c:04d}" for c in range(1, 201)]
    countries = ["United Kingdom", "Germany", "France", "United States", "Spain", "Netherlands"]
    items = [
        ("SKU_1001", "Vintage Ceramic Mug", 12.50),
        ("SKU_1002", "Organic Cotton Tote Bag", 18.00),
        ("SKU_1003", "Wireless Ergonomic Mouse", 45.00),
        ("SKU_1004", "Stainless Water Bottle 750ml", 22.00),
        ("SKU_1005", "Noise Cancelling Earbuds", 89.00),
        ("SKU_1006", "Leather Bound Notebook", 16.50),
        ("SKU_1007", "Desk LED Glow Lamp", 34.00),
        ("SKU_1008", "Mechanical Keyboard", 115.00),
    ]
    
    rows = []
    inv_num = 540000
    
    for _ in range(n_trans):
        inv_num += random.choice([0, 1])
        cust = random.choice(customers)
        country = random.choice(countries)
        sku, desc, unit_price = random.choice(items)
        qty = random.choices([1, 2, 3, 4, 5, 10], weights=[50, 25, 12, 6, 4, 3])[0]
        day_offset = random.randint(0, 300)
        inv_date = (start_date + timedelta(days=day_offset, hours=random.randint(8, 20))).strftime("%Y-%m-%d %H:%M:%S")
        
        rows.append({
            "invoice_no": f"INV{inv_num}",
            "stock_code": sku,
            "description": desc,
            "quantity": qty,
            "invoice_date": inv_date,
            "unit_price": unit_price,
            "customer_id": cust,
            "country": country
        })
        
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} records for {os.path.basename(filepath)}")

def generate_reviews_corpus(filepath, n=750):
    """Generates NLP Product Review Corpus with Text and Sentiments."""
    random.seed(42)
    categories = ["Electronics", "Home & Kitchen", "Books", "Sports & Outdoors", "Personal Tech"]
    
    positive_reviews = [
        ("Outstanding performance!", "This exceeded my expectations in every way. Build quality is exceptional and setup took seconds.", 5),
        ("Highly recommended for professionals", "Fast, reliable, and ergonomic. Using it daily for work and could not be happier.", 5),
        ("Great value for money", "Solid construction, clear display, and excellent battery life. Worth every penny.", 4),
        ("Does exactly what it says", "Clean minimal design and functions without any hiccups. Would definitely buy again.", 5),
        ("Pleasantly surprised", "Much better than the cheaper alternatives I tried. Very satisfied with this purchase.", 4)
    ]
    neutral_reviews = [
        ("Decent but has minor flaws", "The overall product is okay. The manual is confusing and the finish could be more premium.", 3),
        ("Average product for the price", "Works fine for light tasks. Does the job but nothing extraordinary.", 3),
        ("Met basic expectations", "Standard build. A bit heavier than advertised but operates reliably.", 3)
    ]
    negative_reviews = [
        ("Terrible build quality", "Stopped working after just 2 weeks of minimal use. Customer support was unhelpful.", 1),
        ("Do not waste your money", "Flimsy materials, inconsistent connection, and overheating within 20 minutes.", 1),
        ("Extremely disappointed", "Missing crucial accessories in the package and performance is painfully sluggish.", 2),
        ("Regret this purchase", "Fails to deliver on advertised battery life. Battery drained in under 2 hours.", 1)
    ]
    
    rows = []
    for i in range(1, n + 1):
        rand = random.random()
        if rand < 0.55:
            headline, body, rating = random.choice(positive_reviews)
            sentiment = "positive"
        elif rand < 0.75:
            headline, body, rating = random.choice(neutral_reviews)
            sentiment = "neutral"
        else:
            headline, body, rating = random.choice(negative_reviews)
            sentiment = "negative"
            
        cat = random.choice(categories)
        verified = "Yes" if random.random() > 0.15 else "No"
        votes = random.choices([0, 1, 2, 5, 14, 42], weights=[40, 25, 15, 10, 6, 4])[0]
        
        rows.append({
            "review_id": f"REV_{10000 + i}",
            "product_category": cat,
            "headline": headline,
            "review_text": body,
            "star_rating": rating,
            "verified_purchase": verified,
            "helpful_votes": votes,
            "sentiment": sentiment
        })
        
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} records for {os.path.basename(filepath)}")

def generate_stock_prices(filepath, n_days=504):
    """Generates Daily Stock Market OHLCV with Technical Indicators."""
    random.seed(42)
    start_date = datetime(2024, 1, 2)
    current_price = 180.0
    rows = []
    prices_history = []
    
    curr = start_date
    count = 0
    while count < n_days:
        if curr.weekday() < 5:  # Weekdays only
            # Geometric Brownian Motion step
            drift = 0.0004
            vol = 0.016
            shock = random.normalvariate(0, 1)
            ret = drift + vol * shock
            
            open_p = round(current_price * (1 + random.normalvariate(0, 0.003)), 2)
            close_p = round(open_p * (1 + ret), 2)
            high_p = round(max(open_p, close_p) * (1 + abs(random.normalvariate(0, 0.008))), 2)
            low_p = round(min(open_p, close_p) * (1 - abs(random.normalvariate(0, 0.008))), 2)
            volume = int(random.normalvariate(45000000, 12000000))
            
            prices_history.append(close_p)
            current_price = close_p
            
            # Compute rolling 20 SMA
            sma_20 = round(sum(prices_history[-20:]) / len(prices_history[-20:]), 2) if len(prices_history) >= 20 else None
            
            # Compute 14-period RSI
            if len(prices_history) >= 15:
                diffs = [prices_history[j] - prices_history[j-1] for j in range(-14, 0)]
                gains = [d for d in diffs if d > 0]
                losses = [-d for d in diffs if d < 0]
                avg_gain = sum(gains) / 14 if gains else 0
                avg_loss = sum(losses) / 14 if losses else 0.0001
                rs = avg_gain / avg_loss
                rsi_14 = round(100 - (100 / (1 + rs)), 2)
            else:
                rsi_14 = None
                
            rows.append({
                "date": curr.strftime("%Y-%m-%d"),
                "ticker": "TECH_IDX",
                "open": open_p,
                "high": high_p,
                "low": low_p,
                "close": close_p,
                "volume": volume,
                "sma_20": sma_20 if sma_20 else close_p,
                "rsi_14": rsi_14 if rsi_14 else 50.0
            })
            count += 1
        curr += timedelta(days=1)
        
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} records for {os.path.basename(filepath)}")

def generate_fraud_dataset(filepath, n=2000):
    """Generates Imbalanced Credit Card Transactions with ~0.25% fraud rate."""
    random.seed(42)
    rows = []
    
    for i in range(1, n + 1):
        is_fraud = 1 if (random.random() < 0.003 or i in [142, 618, 1209, 1845, 1920]) else 0
        
        # Fraudulent transactions exhibit different latent distribution on V1..V10
        if is_fraud:
            v1 = round(random.normalvariate(-4.2, 1.8), 4)
            v2 = round(random.normalvariate(3.5, 1.5), 4)
            v3 = round(random.normalvariate(-5.1, 2.0), 4)
            v4 = round(random.normalvariate(4.8, 1.2), 4)
            amt = round(random.choice([250.0, 480.0, 999.0, 1420.0]) + random.normalvariate(0, 30), 2)
        else:
            v1 = round(random.normalvariate(0.05, 1.0), 4)
            v2 = round(random.normalvariate(-0.02, 0.95), 4)
            v3 = round(random.normalvariate(0.01, 1.02), 4)
            v4 = round(random.normalvariate(-0.04, 0.98), 4)
            amt = round(max(1.5, random.expovariate(1/45.0)), 2)
            
        rows.append({
            "transaction_id": f"TX_{30000 + i}",
            "time_seconds": i * 14,
            "v1": v1,
            "v2": v2,
            "v3": v3,
            "v4": v4,
            "v5": round(random.normalvariate(0, 1), 4),
            "v6": round(random.normalvariate(0, 1), 4),
            "v7": round(random.normalvariate(0, 1), 4),
            "v8": round(random.normalvariate(0, 1), 4),
            "v9": round(random.normalvariate(0, 1), 4),
            "v10": round(random.normalvariate(0, 1), 4),
            "amount": amt,
            "class_label": is_fraud
        })
        
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} records for {os.path.basename(filepath)}")

def generate_iris_dataset(filepath):
    """Generates the canonical 150 Iris Flower observations."""
    random.seed(42)
    species_config = [
        ("setosa", 5.0, 3.4, 1.5, 0.2),
        ("versicolor", 5.9, 2.7, 4.2, 1.3),
        ("virginica", 6.5, 2.9, 5.5, 2.0),
    ]
    rows = []
    for sp, sl, sw, pl, pw in species_config:
        for _ in range(50):
            rows.append({
                "sepal_length": round(random.normalvariate(sl, 0.35), 1),
                "sepal_width": round(random.normalvariate(sw, 0.30), 1),
                "petal_length": round(random.normalvariate(pl, 0.40), 1),
                "petal_width": round(random.normalvariate(pw, 0.20), 1),
                "species": sp
            })
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} records for {os.path.basename(filepath)}")

def generate_titanic_dataset(filepath, n=400):
    """Generates canonical Titanic Passenger survival dataset."""
    random.seed(42)
    rows = []
    classes = [1, 2, 3]
    embarked_ports = ["S", "C", "Q"]
    
    for i in range(1, n + 1):
        pclass = random.choices(classes, weights=[25, 25, 50])[0]
        sex = "female" if random.random() > 0.52 else "male"
        age = round(random.normalvariate(29, 13), 1)
        age = max(1.0, min(75.0, age))
        fare = round(random.normalvariate(75 if pclass == 1 else (30 if pclass == 2 else 14), 10), 2)
        fare = max(7.25, fare)
        
        # Survival correlation
        survival_prob = 0.72 if sex == "female" else 0.19
        if pclass == 1:
            survival_prob += 0.20
        elif pclass == 3:
            survival_prob -= 0.12
            
        survived = 1 if random.random() < survival_prob else 0
        
        rows.append({
            "passenger_id": i,
            "survived": survived,
            "pclass": pclass,
            "name": f"Passenger, {'Ms.' if sex == 'female' else 'Mr.'} #{i}",
            "sex": sex,
            "age": age,
            "sibsp": random.choices([0, 1, 2], weights=[70, 20, 10])[0],
            "parch": random.choices([0, 1, 2], weights=[80, 15, 5])[0],
            "fare": fare,
            "embarked": random.choice(embarked_ports)
        })
        
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Generated {len(rows)} records for {os.path.basename(filepath)}")

def generate_sqlite_database(db_path):
    """Populates SQLite database with relational tables for SQL Playground."""
    if os.path.exists(db_path):
        os.remove(db_path)
        
    conn = sqlite3.connect(db_path)
    cur = conn.cursor()
    
    # 1. Customers Table
    cur.execute("""
    CREATE TABLE customers (
        customer_id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT UNIQUE,
        country TEXT,
        signup_date TEXT
    );
    """)
    
    # 2. Products Table
    cur.execute("""
    CREATE TABLE products (
        product_id INTEGER PRIMARY KEY,
        product_name TEXT NOT NULL,
        category TEXT,
        unit_price REAL NOT NULL,
        inventory_count INTEGER
    );
    """)
    
    # 3. Orders Table
    cur.execute("""
    CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER,
        order_date TEXT,
        total_amount REAL,
        status TEXT,
        FOREIGN KEY (customer_id) REFERENCES customers (customer_id)
    );
    """)
    
    # 4. Order Items Table
    cur.execute("""
    CREATE TABLE order_items (
        item_id INTEGER PRIMARY KEY,
        order_id INTEGER,
        product_id INTEGER,
        quantity INTEGER,
        subtotal REAL,
        FOREIGN KEY (order_id) REFERENCES orders (order_id),
        FOREIGN KEY (product_id) REFERENCES products (product_id)
    );
    """)
    
    # Seed Customers
    customers_data = [
        (1, "Sophia", "Miller", "sophia.m@example.com", "USA", "2024-01-15"),
        (2, "Liam", "Chen", "liam.c@example.com", "Canada", "2024-02-01"),
        (3, "Emma", "Garcia", "emma.g@example.com", "Spain", "2024-02-18"),
        (4, "Noah", "Schmidt", "noah.s@example.com", "Germany", "2024-03-10"),
        (5, "Olivia", "Dubois", "olivia.d@example.com", "France", "2024-03-22"),
        (6, "Lucas", "Silva", "lucas.s@example.com", "Brazil", "2024-04-05"),
        (7, "Mia", "Tanaka", "mia.t@example.com", "Japan", "2024-04-12"),
        (8, "Ethan", "Wilson", "ethan.w@example.com", "UK", "2024-05-01"),
    ]
    cur.executemany("INSERT INTO customers VALUES (?, ?, ?, ?, ?, ?)", customers_data)
    
    # Seed Products
    products_data = [
        (101, "Data Science Workstation Pro", "Hardware", 1899.99, 15),
        (102, "Mechanical Typing Keyboard", "Accessories", 129.50, 85),
        (103, "UltraWide 34-Inch Curved Monitor", "Monitors", 549.00, 30),
        (104, "Ergonomic Mesh Chair", "Furniture", 320.00, 40),
        (105, "USB-C Dual 4K Docking Station", "Accessories", 185.00, 60),
        (106, "Python Algorithms Handbook", "Books", 44.95, 120),
        (107, "Machine Learning Design Patterns", "Books", 49.95, 95),
        (108, "High-Speed NVMe SSD 2TB", "Storage", 169.99, 50),
    ]
    cur.executemany("INSERT INTO products VALUES (?, ?, ?, ?, ?)", products_data)
    
    # Seed Orders
    orders_data = [
        (1001, 1, "2025-01-10", 2029.49, "COMPLETED"),
        (1002, 2, "2025-01-14", 549.00, "COMPLETED"),
        (1003, 3, "2025-01-20", 94.90, "COMPLETED"),
        (1004, 1, "2025-02-02", 320.00, "COMPLETED"),
        (1005, 4, "2025-02-15", 1899.99, "PENDING"),
        (1006, 5, "2025-02-28", 314.50, "COMPLETED"),
        (1007, 6, "2025-03-05", 169.99, "COMPLETED"),
        (1008, 2, "2025-03-12", 185.00, "PROCESSING"),
        (1009, 7, "2025-03-18", 549.00, "COMPLETED"),
        (1010, 8, "2025-03-25", 2448.99, "COMPLETED"),
    ]
    cur.executemany("INSERT INTO orders VALUES (?, ?, ?, ?, ?)", orders_data)
    
    # Seed Order Items
    order_items_data = [
        (1, 1001, 101, 1, 1899.99),
        (2, 1001, 102, 1, 129.50),
        (3, 1002, 103, 1, 549.00),
        (4, 1003, 106, 1, 44.95),
        (5, 1003, 107, 1, 49.95),
        (6, 1004, 104, 1, 320.00),
        (7, 1005, 101, 1, 1899.99),
        (8, 1006, 102, 1, 129.50),
        (9, 1006, 105, 1, 185.00),
        (10, 1007, 108, 1, 169.99),
        (11, 1008, 105, 1, 185.00),
        (12, 1009, 103, 1, 549.00),
        (13, 1010, 101, 1, 1899.99),
        (14, 1010, 103, 1, 549.00),
    ]
    cur.executemany("INSERT INTO order_items VALUES (?, ?, ?, ?, ?)", order_items_data)
    
    conn.commit()
    conn.close()
    print(f"Generated SQLite database at {os.path.basename(db_path)}")

def generate_all():
    ensure_dir(DATA_DIR)
    generate_student_records(os.path.join(DATA_DIR, "student_academic_records.csv"))
    generate_california_housing(os.path.join(DATA_DIR, "california_housing_extended.csv"))
    generate_store_sales(os.path.join(DATA_DIR, "store_daily_sales.csv"))
    generate_ecommerce_rfm(os.path.join(DATA_DIR, "ecommerce_transactions.csv"))
    generate_reviews_corpus(os.path.join(DATA_DIR, "customer_reviews_corpus.csv"))
    generate_stock_prices(os.path.join(DATA_DIR, "historical_stock_prices.csv"))
    generate_fraud_dataset(os.path.join(DATA_DIR, "creditcard_transactions_imbalanced.csv"))
    generate_iris_dataset(os.path.join(DATA_DIR, "iris_flowers.csv"))
    generate_titanic_dataset(os.path.join(DATA_DIR, "titanic_passengers.csv"))
    generate_sqlite_database(os.path.join(DATA_DIR, "learning_database.db"))
    print("\nAll datasets generated successfully in:", DATA_DIR)

if __name__ == "__main__":
    generate_all()
