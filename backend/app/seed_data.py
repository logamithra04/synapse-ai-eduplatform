import json
from datetime import datetime
from sqlalchemy.orm import Session
from .models import (
    User, StudentProfile, Instructor, CourseCategory, Course, Module, Lesson,
    Quiz, Question, LearningPath, CodingExercise, Project, Achievement, StudentSkill
)
from .auth import hash_password

def seed_database(db: Session):
    # Check if database already has categories
    if db.query(CourseCategory).count() > 0:
        return

    print("Seeding Synapse Data Science Platform Database...")

    # 1. Instructors
    instructor_1 = Instructor(
        name="Dr. Elena Vance",
        title="Former Deep Learning Researcher at MIT & Senior Data Scientist",
        bio="Passionate educator specializing in Machine Learning, Statistical Inference, and Adaptive Learning systems.",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
        expertise="Machine Learning, Deep Learning, Python",
        rating=4.95
    )
    instructor_2 = Instructor(
        name="Marcus Sterling",
        title="Lead Analytics Architect & SQL Specialist",
        bio="12+ years optimizing enterprise data pipelines, relational modeling, and business intelligence architectures.",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
        expertise="SQL, Databases, Pandas, Data Engineering",
        rating=4.9
    )
    db.add_all([instructor_1, instructor_2])
    db.flush()

    # 2. Users (Admin, Mentor, Student)
    admin_user = User(
        email="admin@synapse.edu",
        hashed_password=hash_password("AdminPass123!"),
        full_name="Dr. Sarah Chen (Admin)",
        role="admin",
        avatar_url="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80",
        bio="Head of Academic Curriculum and Learning Technologies.",
        streak_days=15
    )
    mentor_user = User(
        email="mentor@synapse.edu",
        hashed_password=hash_password("MentorPass123!"),
        full_name="Dr. Elena Vance (Faculty Mentor)",
        role="mentor",
        avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
        bio="Senior Data Science Researcher & Student Mentorship Director.",
        streak_days=18
    )
    student_user = User(
        email="student@synapse.edu",
        hashed_password=hash_password("StudentPass123!"),
        full_name="Alex Miller (Student)",
        role="student",
        avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
        bio="Aspiring Data Scientist with background in engineering, learning predictive modeling and statistics.",
        streak_days=7
    )
    alex_user = User(
        email="alex.miller@student.edu",
        hashed_password=hash_password("StudentPass123!"),
        full_name="Alex Miller",
        role="student",
        avatar_url="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
        bio="Aspiring Data Scientist with background in engineering, learning predictive modeling and statistics.",
        streak_days=7
    )
    db.add_all([admin_user, mentor_user, student_user, alex_user])
    db.flush()

    # Profiles for all roles
    for u, level, target, score in [
        (admin_user, "Advanced", "Lead Data Scientist & Platform Admin", 98.5),
        (mentor_user, "Advanced", "Senior Academic Mentor", 95.0),
        (student_user, "Intermediate", "Full-Stack Data Scientist", 82.0),
        (alex_user, "Intermediate", "Full-Stack Data Scientist", 82.0),
    ]:
        p = StudentProfile(
            user_id=u.id,
            current_level=level,
            target_role=target,
            daily_goal_mins=45,
            diagnostic_completed=True,
            diagnostic_score=score,
            diagnostic_strengths=["Python Programming", "Machine Learning", "SQL and Databases"],
            diagnostic_weaknesses=[]
        )
        db.add(p)

    # 3. All 13 Categories Required
    categories_data = [
        {"name": "Python Programming", "slug": "python-programming", "desc": "Foundational and advanced Python for data manipulation, clean scripting, and OOP.", "icon": "Terminal"},
        {"name": "Mathematics for Data Science", "slug": "mathematics-for-data-science", "desc": "Linear algebra, multivariable calculus, and optimization fundamentals.", "icon": "Binary"},
        {"name": "Statistics and Probability", "slug": "statistics-and-probability", "desc": "Descriptive statistics, inferential hypothesis testing, Bayes theorem, and distributions.", "icon": "BarChart2"},
        {"name": "SQL and Database Management", "slug": "sql-database-management", "desc": "Relational querying, complex joins, window functions, and indexing strategies.", "icon": "Database"},
        {"name": "Data Analysis", "slug": "data-analysis", "desc": "Structured data aggregation, business metrics, and analytical problem solving.", "icon": "PieChart"},
        {"name": "NumPy and Pandas", "slug": "numpy-and-pandas", "desc": "Vectorized arrays, DataFrames, time series, and ultra-fast tabular transformations.", "icon": "Layers"},
        {"name": "Data Visualization", "slug": "data-visualization", "desc": "Matplotlib, Seaborn, interactive Plotly visualizations, and data storytelling.", "icon": "LineChart"},
        {"name": "Exploratory Data Analysis", "slug": "exploratory-data-analysis", "desc": "Outlier detection, missing data imputation, feature correlation, and distributions.", "icon": "Search"},
        {"name": "Machine Learning", "slug": "machine-learning", "desc": "Supervised & unsupervised algorithms: regression, trees, ensembles, and evaluation.", "icon": "Cpu"},
        {"name": "Deep Learning", "slug": "deep-learning", "desc": "Neural network architectures, backprop, PyTorch, CNNs, and optimization.", "icon": "Network"},
        {"name": "Natural Language Processing", "slug": "natural-language-processing", "desc": "Tokenization, embeddings, TF-IDF, transformers, and sequence classification.", "icon": "FileText"},
        {"name": "Generative AI Fundamentals", "slug": "generative-ai-fundamentals", "desc": "LLM foundations, prompt engineering, RAG pipelines, and embeddings.", "icon": "Sparkles"},
        {"name": "Data Science Projects", "slug": "data-science-projects", "desc": "End-to-end industry projects from raw datasets to production deployment.", "icon": "Briefcase"},
    ]

    categories_map = {}
    for i, cat_d in enumerate(categories_data):
        cat = CourseCategory(
            name=cat_d["name"],
            slug=cat_d["slug"],
            description=cat_d["desc"],
            icon=cat_d["icon"],
            display_order=i + 1
        )
        db.add(cat)
        db.flush()
        categories_map[cat_d["name"]] = cat

    # 4. Comprehensive Courses
    courses_seed = [
        {
            "category": "Python Programming",
            "title": "Python for Data Science Masterclass",
            "slug": "python-for-data-science-masterclass",
            "summary": "Master core Python syntax, functional programming, data structures, and algorithmic thinking tailored for data analysis.",
            "difficulty": "Beginner",
            "estimated_hours": 12.0,
            "instructor_id": instructor_1.id,
            "featured": True,
            "learning_objectives": [
                "Write idiomatic, PEP8-compliant Python code",
                "Manipulate complex nested dictionaries and lists with list comprehensions",
                "Implement modular functions with type hints and error handling",
                "Work with file I/O, JSON, and external REST APIs"
            ],
            "modules": [
                {
                    "title": "Python Data Structures & Iteration",
                    "lessons": [
                        {
                            "title": "Lists, Dicts, and Comprehensions in Data Workflows",
                            "duration": 20,
                            "type": "reading",
                            "content": """# Lists, Dictionaries, and Comprehensions

In modern data workflows, standard Python collections form the building blocks for data pipelines.

### List Comprehensions
List comprehensions provide a concise way to create lists based on existing iterables:

```python
# Transform raw Celsius measurements into Fahrenheit
celsius = [0, 10, 20, 34.5, 40]
fahrenheit = [round((temp * 9/5) + 32, 2) for temp in celsius if temp > 0]
print(fahrenheit) # [50.0, 68.0, 94.1, 104.0]
```

### Dictionary Comprehensions
When restructuring key-value configurations or mapping categorical labels:

```python
categories = ['Low', 'Medium', 'High']
category_map = {cat: idx for idx, cat in enumerate(categories)}
print(category_map) # {'Low': 0, 'Medium': 1, 'High': 2}
```
"""
                        },
                        {
                            "title": "Functional Tools: Lambda, Map, Filter, and Zip",
                            "duration": 25,
                            "type": "interactive",
                            "content": """# Functional Programming in Python

Functional programming paradigms allow clean data transformations without side effects.

### Using `zip` for Pairing Features
```python
features = ['age', 'income', 'credit_score']
values = [29, 85000, 740]
record = dict(zip(features, values))
print(record)
```
"""
                        }
                    ]
                }
            ]
        },
        {
            "category": "NumPy and Pandas",
            "title": "High-Performance Data Wrangling with Pandas & NumPy",
            "slug": "high-performance-pandas-numpy",
            "summary": "Accelerate tabular data manipulation, multidimensional array computing, grouping, merging, and time series analysis.",
            "difficulty": "Intermediate",
            "estimated_hours": 16.0,
            "instructor_id": instructor_2.id,
            "featured": True,
            "learning_objectives": [
                "Understand vectorized NumPy operations vs Python loops",
                "Master indexing, filtering, and assignment via .loc and .iloc",
                "Perform split-apply-combine aggregations with groupby",
                "Merge and reshape datasets with concat, merge, and pivot_table"
            ],
            "modules": [
                {
                    "title": "DataFrame Operations & Aggregations",
                    "lessons": [
                        {
                            "title": "Vectorized Indexing and Filtering in Pandas",
                            "duration": 30,
                            "type": "reading",
                            "content": """# Vectorized Operations in Pandas

Pandas operations leverage NumPy under the hood, writing low-level execution in C.

```python
import pandas as pd

# Creating a sample Data Science dataset
data = {
    'Student': ['Maya', 'Dev', 'Sam', 'Aria'],
    'Quiz_Score': [92, 78, 85, 96],
    'Completed_Projects': [4, 2, 3, 5]
}
df = pd.DataFrame(data)

# Filtering with boolean masking
high_performers = df[(df['Quiz_Score'] >= 85) & (df['Completed_Projects'] >= 3)]
print(high_performers)
```
"""
                        }
                    ]
                }
            ]
        },
        {
            "category": "SQL and Database Management",
            "title": "SQL for Modern Data Science & Analytics",
            "slug": "sql-for-modern-data-science",
            "summary": "From multi-table joins and subqueries to advanced window functions and analytical partitions.",
            "difficulty": "Beginner",
            "estimated_hours": 14.0,
            "instructor_id": instructor_2.id,
            "featured": True,
            "learning_objectives": [
                "Query structured databases using SELECT, WHERE, GROUP BY, and HAVING",
                "Execute INNER, LEFT, RIGHT, and FULL OUTER joins",
                "Calculate rolling averages and percentiles with Window Functions",
                "Write optimized Common Table Expressions (CTEs)"
            ],
            "modules": [
                {
                    "title": "Advanced Window Functions",
                    "lessons": [
                        {
                            "title": "ROW_NUMBER, RANK, DENSE_RANK, and Running Sums",
                            "duration": 25,
                            "type": "interactive",
                            "content": """# Window Functions in SQL

Window functions execute calculation across a set of table rows related to the current row.

```sql
SELECT 
    employee_id,
    department,
    salary,
    RANK() OVER (PARTITION BY department ORDER BY salary DESC) as rank_in_dept,
    AVG(salary) OVER (PARTITION BY department) as avg_dept_salary
FROM employees;
```
"""
                        }
                    ]
                }
            ]
        },
        {
            "category": "Statistics and Probability",
            "title": "Statistical Foundations & Hypothesis Testing",
            "slug": "statistical-foundations-hypothesis-testing",
            "summary": "Master distributions, confidence intervals, p-values, A/B testing methodology, and Bayesian fundamentals.",
            "difficulty": "Intermediate",
            "estimated_hours": 15.0,
            "instructor_id": instructor_1.id,
            "featured": True,
            "learning_objectives": [
                "Distinguish between continuous and discrete probability distributions",
                "Formulate null ($H_0$) and alternative ($H_1$) hypotheses",
                "Conduct two-sample t-tests, Mann-Whitney U, and Chi-Square tests",
                "Calculate statistical power and minimum sample size for experiments"
            ],
            "modules": [
                {
                    "title": "Inferential Statistics & A/B Testing",
                    "lessons": [
                        {
                            "title": "Interpreting P-Values, Effect Size, and Confidence Intervals",
                            "duration": 30,
                            "type": "reading",
                            "content": """# Inferential Statistics & Experimentation

In modern product data science, A/B testing verifies whether experimental treatments drive statistically significant uplifts.

### Key Concepts:
1. **Type I Error ($\\alpha$)**: Rejecting $H_0$ when it is actually true (False Positive).
2. **Type II Error ($\\beta$)**: Failing to reject $H_0$ when an effect exists (False Negative).
3. **Statistical Power ($1 - \\beta$)**: Typically targeted at 80% or higher.
"""
                        }
                    ]
                }
            ]
        },
        {
            "category": "Machine Learning",
            "title": "Applied Machine Learning with Scikit-Learn",
            "slug": "applied-machine-learning-scikit-learn",
            "summary": "Build, evaluate, and tune production-ready supervised and unsupervised machine learning algorithms.",
            "difficulty": "Intermediate",
            "estimated_hours": 20.0,
            "instructor_id": instructor_1.id,
            "featured": True,
            "learning_objectives": [
                "Construct end-to-end predictive pipelines with Scikit-Learn",
                "Implement Linear/Logistic Regression, Decision Trees, and Random Forests",
                "Evaluate models with Precision-Recall curves, ROC-AUC, and F1-score",
                "Prevent data leakage using Cross-Validation and Pipeline objects"
            ],
            "modules": [
                {
                    "title": "Supervised Learning & Model Validation",
                    "lessons": [
                        {
                            "title": "Building Leakage-Free Scikit-Learn Pipelines",
                            "duration": 35,
                            "type": "reading",
                            "content": """# Leakage-Free Scikit-Learn Pipelines

Data leakage occurs when information from outside the training dataset is used to create the model.

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

# Define composite processing pipeline
pipeline = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
    ('model', RandomForestClassifier(n_estimators=100, random_state=42))
])

# Fit only on training split
pipeline.fit(X_train, y_train)
```
"""
                        }
                    ]
                }
            ]
        },
        {
            "category": "Deep Learning",
            "title": "Deep Learning & Neural Networks with PyTorch",
            "slug": "deep-learning-neural-networks-pytorch",
            "summary": "From perceptrons and multi-layer networks to backpropagation, CNNs, and GPU training.",
            "difficulty": "Advanced",
            "estimated_hours": 22.0,
            "instructor_id": instructor_1.id,
            "featured": False,
            "learning_objectives": [
                "Grasp mathematical mechanics of backpropagation and loss functions",
                "Design PyTorch nn.Module architectures",
                "Utilize convolution, pooling, and normalization layers for computer vision",
                "Apply Adam, weight decay, learning rate schedulers, and early stopping"
            ],
            "modules": [
                {
                    "title": "Deep Neural Network Architecture",
                    "lessons": [
                        {
                            "title": "Custom PyTorch Modules and the Training Loop",
                            "duration": 40,
                            "type": "reading",
                            "content": """# PyTorch Architecture and Training Loops

PyTorch leverages dynamic computational graphs (Autograd) for gradient propagation.

```python
import torch
import torch.nn as nn
import torch.optim as optim

class DeepClassifier(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super().__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        return self.fc2(self.relu(self.fc1(x)))
```
"""
                        }
                    ]
                }
            ]
        },
        {
            "category": "Generative AI Fundamentals",
            "title": "Generative AI, LLMs, and RAG Architectures",
            "slug": "generative-ai-llms-rag",
            "summary": "Understand transformer attention, prompt engineering, vector embeddings, and Retrieval-Augmented Generation.",
            "difficulty": "Advanced",
            "estimated_hours": 18.0,
            "instructor_id": instructor_1.id,
            "featured": True,
            "learning_objectives": [
                "Understand Self-Attention and Transformer encoder-decoder mechanics",
                "Generate semantic embeddings using dense vector models",
                "Construct a complete RAG system with vector databases and chunking",
                "Evaluate generation quality using hallucination checks and groundedness"
            ],
            "modules": [
                {
                    "title": "Retrieval-Augmented Generation (RAG)",
                    "lessons": [
                        {
                            "title": "Vector Embeddings and Semantic Search Pipelines",
                            "duration": 30,
                            "type": "interactive",
                            "content": """# Retrieval-Augmented Generation Architecture

RAG grounds LLM generation in verified domain knowledge:

1. **Document Ingestion**: Parsing markdown, PDFs, or database rows.
2. **Chunking**: Overlapping sliding windows (e.g. 500 tokens with 50 token overlap).
3. **Embedding**: Converting text chunks into high-dimensional vectors.
4. **Vector Similarity**: Cosine distance search in vector index.
5. **Prompt Augmentation**: Feeding top-K matches to LLM context window.
"""
                        }
                    ]
                }
            ]
        },
        {
            "category": "Mathematics for Data Science",
            "title": "Linear Algebra & Matrix Decompositions for Machine Learning",
            "slug": "linear-algebra-optimization-ml",
            "summary": "Vectors, dot products, matrix decompositions, eigenvalues, and multivariable gradient descent optimization.",
            "difficulty": "Intermediate",
            "estimated_hours": 15.0,
            "instructor_id": instructor_1.id,
            "featured": True,
            "learning_objectives": [
                "Understand vector spaces, dot products, and orthogonal projections",
                "Compute matrix inversions, determinants, and condition numbers",
                "Perform Singular Value Decomposition (SVD) and Principal Component Analysis (PCA)",
                "Apply gradient descent and Hessian matrix optimization"
            ],
            "modules": [
                {
                    "title": "Matrix Decompositions and Dimensionality",
                    "lessons": [
                        {
                            "title": "Eigenvalues, Eigenvectors, and PCA Geometric Projections",
                            "duration": 30,
                            "type": "reading",
                            "content": """# Eigenvalues and PCA Projections

Principal Component Analysis (PCA) identifies orthogonal axes of maximal variance in high-dimensional feature spaces:

$$\\Sigma v = \\lambda v$$

Where $\\Sigma$ is the sample covariance matrix, $v$ represents principal eigenvectors, and $\\lambda$ denotes the variance explained along that axis.
"""
                        }
                    ]
                }
            ]
        },
        {
            "category": "Data Analysis",
            "title": "Business Intelligence & Cohort Analytics",
            "slug": "business-intelligence-cohort-analytics",
            "summary": "Analyze recurring revenue, retention curves, customer acquisition cost (CAC), and cohort heatmaps.",
            "difficulty": "Beginner",
            "estimated_hours": 12.0,
            "instructor_id": instructor_2.id,
            "featured": False,
            "learning_objectives": [
                "Build retention matrices and cohort curves",
                "Calculate customer lifetime value (LTV) and churn probabilities",
                "Segment transactional time horizons"
            ],
            "modules": [
                {
                    "title": "Cohort Retention Modeling",
                    "lessons": [
                        {
                            "title": "Building Longitudinal Retention Heatmaps",
                            "duration": 25,
                            "type": "reading",
                            "content": "# Cohort Retention Metrics\n\nCohort analysis groups customers by acquisition date and tracks subsequent engagement."
                        }
                    ]
                }
            ]
        },
        {
            "category": "Data Visualization",
            "title": "Visual Analytics & Dashboarding with Plotly and Seaborn",
            "slug": "visual-analytics-plotly-seaborn",
            "summary": "Master multi-dimensional scatter matrices, distribution plots, heatmaps, and interactive web charts.",
            "difficulty": "Beginner",
            "estimated_hours": 10.0,
            "instructor_id": instructor_2.id,
            "featured": False,
            "learning_objectives": [
                "Create publication-grade statistical charts with Seaborn",
                "Build interactive hover tooltips with Plotly",
                "Communicate data insights to non-technical stakeholders"
            ],
            "modules": [
                {
                    "title": "Interactive Storytelling",
                    "lessons": [
                        {
                            "title": "Grammar of Graphics & Multi-Facet Plots",
                            "duration": 20,
                            "type": "interactive",
                            "content": "# Grammar of Graphics\n\nVisual encoding maps data attributes to geometric aesthetics: position, color, size, and shape."
                        }
                    ]
                }
            ]
        },
        {
            "category": "Exploratory Data Analysis",
            "title": "Applied EDA: Outliers, Distributions, & Data Cleaning",
            "slug": "applied-eda-outliers-cleaning",
            "summary": "Identify multimodal skewness, detect anomalies via IQR and Isolation Forests, and impute missing data.",
            "difficulty": "Beginner",
            "estimated_hours": 11.0,
            "instructor_id": instructor_2.id,
            "featured": False,
            "learning_objectives": [
                "Quantify skewness and kurtosis in empirical distributions",
                "Perform robust outlier detection using Tukey's fences and Z-scores",
                "Apply multivariate iterative imputers"
            ],
            "modules": [
                {
                    "title": "Outlier Diagnostics",
                    "lessons": [
                        {
                            "title": "Interquartile Range (IQR) vs Isolation Forests",
                            "duration": 25,
                            "type": "reading",
                            "content": "# Robust Anomaly Detection\n\nOutliers can distort Ordinary Least Squares regression coefficients. Use IQR filters for univariate checks and Isolation Forests for high-dimensional manifolds."
                        }
                    ]
                }
            ]
        },
        {
            "category": "Natural Language Processing",
            "title": "NLP Foundations: Text Processing, Tokenization, & TF-IDF",
            "slug": "nlp-foundations-text-processing",
            "summary": "Extract insights from unstructured corpora using regular expressions, stemming, n-grams, and sentiment classification.",
            "difficulty": "Intermediate",
            "estimated_hours": 14.0,
            "instructor_id": instructor_1.id,
            "featured": False,
            "learning_objectives": [
                "Clean raw text with regex, lemmatization, and stop-word removal",
                "Compute Term Frequency-Inverse Document Frequency (TF-IDF)",
                "Train text classification models with Logistic Regression and Naive Bayes"
            ],
            "modules": [
                {
                    "title": "Corpus Vectorization",
                    "lessons": [
                        {
                            "title": "Subword Tokenization & Semantic Vectors",
                            "duration": 30,
                            "type": "reading",
                            "content": "# Text Vectorization\n\nTF-IDF downweights ubiquitous words while magnifying rare informative terms across documents."
                        }
                    ]
                }
            ]
        },
        {
            "category": "Data Science Projects",
            "title": "End-to-End ML Architecture: From Raw CSV to Production API",
            "slug": "end-to-end-ml-architecture",
            "summary": "Package trained Scikit-Learn pipelines into containerized FastAPI microservices with schema validation and model monitoring.",
            "difficulty": "Advanced",
            "estimated_hours": 16.0,
            "instructor_id": instructor_1.id,
            "featured": True,
            "learning_objectives": [
                "Serialize model artifacts with Joblib and ONNX",
                "Build low-latency REST inference endpoints with FastAPI",
                "Monitor for model concept drift and data schema violations"
            ],
            "modules": [
                {
                    "title": "Model Serving & Serialization",
                    "lessons": [
                        {
                            "title": "Deploying Scikit-Learn Pipelines with FastAPI",
                            "duration": 35,
                            "type": "reading",
                            "content": "# Production Model Serving\n\nInference microservices deserialize fitted model pipelines and validate incoming JSON payloads with Pydantic schemas."
                        }
                    ]
                }
            ]
        }
    ]

    created_courses = []
    for c_data in courses_seed:
        cat = categories_map.get(c_data["category"])
        course = Course(
            category_id=cat.id if cat else 1,
            instructor_id=c_data["instructor_id"],
            title=c_data["title"],
            slug=c_data["slug"],
            summary=c_data["summary"],
            difficulty=c_data["difficulty"],
            estimated_hours=c_data["estimated_hours"],
            rating=4.9,
            students_enrolled=1420,
            learning_objectives=c_data["learning_objectives"],
            featured=c_data.get("featured", False)
        )
        db.add(course)
        db.flush()
        created_courses.append(course)

        # Add modules and lessons
        for m_idx, m_data in enumerate(c_data.get("modules", [])):
            mod = Module(
                course_id=course.id,
                title=m_data["title"],
                order_index=m_idx + 1
            )
            db.add(mod)
            db.flush()

            for l_idx, l_data in enumerate(m_data.get("lessons", [])):
                les = Lesson(
                    module_id=mod.id,
                    title=l_data["title"],
                    duration_mins=l_data["duration"],
                    lesson_type=l_data["type"],
                    content_markdown=l_data["content"],
                    order_index=l_idx + 1
                )
                db.add(les)
                db.flush()

    # 5. Diagnostic Quiz (For the Adaptive Knowledge Engine)
    diagnostic_quiz = Quiz(
        title="Data Science Diagnostic & Skill Assessment",
        description="Comprehensive adaptive evaluation spanning Mathematics, Statistics, Python, SQL, and Machine Learning.",
        time_limit_mins=20,
        passing_score=60.0,
        is_diagnostic=True,
        difficulty="adaptive"
    )
    db.add(diagnostic_quiz)
    db.flush()

    diagnostic_questions = [
        {
            "text": "In Python, which built-in data structure preserves insertion order and does not permit duplicate elements?",
            "type": "mcq",
            "options": ["List", "Dictionary Keys", "Set", "Tuple"],
            "correct": "Dictionary Keys",
            "explanation": "Since Python 3.7+, dictionary keys preserve insertion order while guaranteeing unique keys. Standard Sets eliminate duplicates but do not guarantee sequence indexing.",
            "topic": "Python Programming",
            "difficulty": "easy"
        },
        {
            "text": "What is the primary effect of increasing L2 regularization (Ridge) parameter lambda (or alpha) in linear models?",
            "type": "mcq",
            "options": [
                "Shrinks coefficients closer to zero, reducing model variance",
                "Forces coefficients to exactly zero, performing feature selection",
                "Increases training set accuracy by fitting non-linear curves",
                "Eliminates multicollinearity by dropping duplicate columns"
            ],
            "correct": "Shrinks coefficients closer to zero, reducing model variance",
            "explanation": "L2 regularization penalizes the sum of squared weights, shrinking them toward zero to mitigate overfitting without forcing them to absolute zero (which L1 Lasso does).",
            "topic": "Machine Learning",
            "difficulty": "medium"
        },
        {
            "text": "In SQL, what is the key difference between the WHERE clause and the HAVING clause?",
            "type": "mcq",
            "options": [
                "WHERE filters rows before aggregation; HAVING filters aggregated groups",
                "HAVING works only on strings, while WHERE works on numbers",
                "WHERE cannot be used with indexed columns",
                "HAVING executes before JOIN statements"
            ],
            "correct": "WHERE filters rows before aggregation; HAVING filters aggregated groups",
            "explanation": "WHERE evaluates individual rows prior to GROUP BY. HAVING evaluates aggregated summary statistics (e.g. COUNT(), AVG()) after grouping has occurred.",
            "topic": "SQL and Databases",
            "difficulty": "easy"
        },
        {
            "text": "A clinical diagnostic test has 99% sensitivity and 99% specificity. If a disease prevalence in the population is 0.1% (1 in 1000), what is the approximate probability a patient actually has the disease given a positive test result?",
            "type": "mcq",
            "options": ["99%", "90%", "Approximately 9%", "50%"],
            "correct": "Approximately 9%",
            "explanation": "By Bayes' Theorem: P(D|+) = (0.99 * 0.001) / ((0.99 * 0.001) + (0.01 * 0.999)) ≈ 0.00099 / (0.00099 + 0.00999) ≈ 9.0%. Base rate neglect is a critical concept in data science.",
            "topic": "Statistics and Probability",
            "difficulty": "hard"
        },
        {
            "text": "In deep learning, which activation function mitigates the vanishing gradient problem in deep feedforward networks while remaining computationally cheap?",
            "type": "mcq",
            "options": ["Sigmoid", "ReLU (Rectified Linear Unit)", "Hyperbolic Tangent (tanh)", "Softmax"],
            "correct": "ReLU (Rectified Linear Unit)",
            "explanation": "ReLU has a constant derivative of 1 for all positive inputs, preventing gradients from saturating and diminishing across multiple backpropagation layers.",
            "topic": "Deep Learning",
            "difficulty": "medium"
        },
        {
            "text": "True or False: In exploratory data analysis, mean imputation on skewed distributions is preferred over median imputation.",
            "type": "true_false",
            "options": ["True", "False"],
            "correct": "False",
            "explanation": "The mean is heavily influenced by extreme outliers and skewed tails. Median imputation is robust and preferred for non-symmetric distributions.",
            "topic": "Data Analysis & EDA",
            "difficulty": "easy"
        }
    ]

    for q_data in diagnostic_questions:
        q = Question(
            quiz_id=diagnostic_quiz.id,
            question_text=q_data["text"],
            question_type=q_data["type"],
            options=q_data["options"],
            correct_answer=q_data["correct"],
            explanation=q_data["explanation"],
            topic=q_data["topic"],
            difficulty=q_data["difficulty"]
        )
        db.add(q)

    # 6. Coding Practice Exercises (for Coding Lab)
    coding_exercises_data = [
        {
            "title": "Python: Calculate Moving Average of Time Series",
            "description": "Implement a function `calculate_moving_average(data, window_size)` that computes simple moving averages over a numeric sequence.",
            "instructions": "Return a new list containing moving average values rounded to 2 decimal places. If window_size > len(data), return an empty list.",
            "language": "python",
            "difficulty": "medium",
            "starter_code": """def calculate_moving_average(data: list, window_size: int) -> list:
    # Write your solution here
    if window_size > len(data) or window_size <= 0:
        return []
    
    averages = []
    for i in range(len(data) - window_size + 1):
        window = data[i : i + window_size]
        avg = round(sum(window) / window_size, 2)
        averages.append(avg)
    return averages

# Test your code
sample_series = [10, 15, 20, 25, 30, 35]
print("Result:", calculate_moving_average(sample_series, 3))
""",
            "solution_code": """def calculate_moving_average(data: list, window_size: int) -> list:
    if window_size > len(data) or window_size <= 0:
        return []
    return [round(sum(data[i:i+window_size])/window_size, 2) for i in range(len(data)-window_size+1)]
""",
            "test_cases": [
                {"input": "[10, 20, 30, 40], 2", "expected_output": "[15.0, 25.0, 35.0]"},
                {"input": "[5, 10, 15], 3", "expected_output": "[10.0]"}
            ]
        },
        {
            "title": "SQL: High-Value Customer Spending Analysis",
            "description": "Write a query to retrieve customers who have placed at least 3 orders and spent an aggregate total exceeding $500.",
            "instructions": "Select `customer_id`, total orders count as `total_orders`, and sum of amounts as `total_spent`. Order descending by `total_spent`.",
            "language": "sql",
            "difficulty": "medium",
            "starter_code": """-- Write your SQL query below
SELECT 
    customer_id,
    COUNT(order_id) AS total_orders,
    SUM(total_amount) AS total_spent
FROM orders
GROUP BY customer_id
HAVING COUNT(order_id) >= 3 AND SUM(total_amount) > 500
ORDER BY total_spent DESC;
""",
            "solution_code": """SELECT customer_id, COUNT(order_id) AS total_orders, SUM(total_amount) AS total_spent FROM orders GROUP BY customer_id HAVING COUNT(order_id) >= 3 AND SUM(total_amount) > 500 ORDER BY total_spent DESC;""",
            "test_cases": [
                {"input": "orders table with mock records", "expected_output": "Aggregated customer spending"}
            ]
        },
        {
            "title": "Python: Normalizing Feature Matrix (Min-Max Scaling)",
            "description": "Implement feature scaling without using external libraries like scikit-learn.",
            "instructions": "Given a 1D list of floats, scale each value to the interval [0.0, 1.0] using formula (x - min) / (max - min). If all values are identical, return all 0.0s.",
            "language": "python",
            "difficulty": "easy",
            "starter_code": """def min_max_scale(values: list) -> list:
    if not values:
        return []
    min_val = min(values)
    max_val = max(values)
    if min_val == max_val:
        return [0.0 for _ in values]
    return [round((x - min_val) / (max_val - min_val), 4) for x in values]

# Test
print(min_max_scale([10, 20, 30, 40, 50]))
""",
            "solution_code": """def min_max_scale(values): return [0.0]*len(values) if min(values)==max(values) else [round((x-min(values))/(max(values)-min(values)), 4) for x in values]""",
            "test_cases": [
                {"input": "[10, 20, 30, 40, 50]", "expected_output": "[0.0, 0.25, 0.5, 0.75, 1.0]"}
            ]
        }
    ]

    for ex in coding_exercises_data:
        ce = CodingExercise(
            title=ex["title"],
            description=ex["description"],
            instructions=ex["instructions"],
            language=ex["language"],
            difficulty=ex["difficulty"],
            starter_code=ex["starter_code"],
            solution_code=ex["solution_code"],
            test_cases=ex["test_cases"],
            hints=["Think about edge cases where lists are empty or equal", "Remember to round according to specifications"]
        )
        db.add(ce)

    # 7. Practical Project Library (All 7 required real-world projects)
    projects_data = [
        {
            "title": "Student Performance Prediction",
            "slug": "student-performance-prediction",
            "domain": "Predictive Modeling & Regression",
            "difficulty": "Beginner",
            "estimated_hours": 8.0,
            "summary": "Predict student final exam scores based on socioeconomic factors, study hours, attendance, and past test performance.",
            "problem_statement": "Educational institutions need proactive warning systems to identify students who are at risk of falling behind before final examinations. Your goal is to build an interpretable multivariate regression model.",
            "dataset_name": "student_academic_records.csv",
            "required_tools": ["Python", "Pandas", "Scikit-Learn", "Matplotlib"],
            "starter_code": """import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_squared_error, r2_score

# 1. Load Student Dataset
# df = pd.read_csv('student_academic_records.csv')
print("Initializing Student Performance Pipeline...")
""",
            "implementation_guide": """### Step-by-Step Implementation:
1. **EDA & Correlation**: Calculate Pearson correlation between `study_hours`, `attendance_rate`, and `final_grade`.
2. **Preprocessing**: One-hot encode categorical variables (e.g. `parent_education`).
3. **Model Training**: Fit a baseline OLS Linear Regression and a regularized Ridge regression.
4. **Evaluation**: Report RMSE, MAE, and $R^2$ on a held-out 20% test split.
""",
            "expected_outcomes": ["Trained Regression Model with R² > 0.82", "Feature importance chart showing study hours impact"],
            "evaluation_criteria": ["Code clarity and documentation", "Proper train/test split without leakage", "RMSE and R² metrics discussion"]
        },
        {
            "title": "House Price Prediction & Valuation",
            "slug": "house-price-prediction",
            "domain": "Feature Engineering & Regression",
            "difficulty": "Intermediate",
            "estimated_hours": 12.0,
            "summary": "Build a robust gradient boosting model predicting residential home valuations from structural and geographical features.",
            "problem_statement": "Real estate appraisal involves non-linear interactions between square footage, neighborhood crime metrics, school ratings, and age of structure.",
            "dataset_name": "california_housing_extended.csv",
            "required_tools": ["Pandas", "Scikit-Learn", "XGBoost/LightGBM", "Seaborn"],
            "starter_code": """import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
# Starter template for Housing Valuation
""",
            "implementation_guide": "Clean missing coordinates, engineer `rooms_per_household`, and train GradientBoostingRegressor.",
            "expected_outcomes": ["Mean Absolute Error within 10% of median home values", "Residual analysis plots"],
            "evaluation_criteria": ["Handling of skewed price distributions using log transformations", "Cross-validation stability"]
        },
        {
            "title": "Retail Sales Forecasting",
            "slug": "sales-forecasting",
            "domain": "Time Series Analysis",
            "difficulty": "Intermediate",
            "estimated_hours": 14.0,
            "summary": "Forecast store inventory demand using lag features, rolling seasonality, and ARIMA/Prophet models.",
            "problem_statement": "Stockouts cost retailers billions annually while excess inventory incurs heavy warehousing fees. Build multi-horizon sales forecasts.",
            "dataset_name": "store_daily_sales.csv",
            "required_tools": ["Pandas", "Statsmodels", "Prophet", "Matplotlib"],
            "starter_code": """import pandas as pd
# Starter template for Demand Forecasting
""",
            "implementation_guide": "Decompose time series into Trend, Seasonality, and Residuals. Create 7-day and 30-day rolling lag indicators.",
            "expected_outcomes": ["MAPE under 8.5% on next 30 days forecast"],
            "evaluation_criteria": ["Time-based split validation (no future leakage)", "Holiday and promotion effect modeling"]
        },
        {
            "title": "Customer Segmentation with RFM & K-Means",
            "slug": "customer-segmentation",
            "domain": "Unsupervised Learning",
            "difficulty": "Intermediate",
            "estimated_hours": 10.0,
            "summary": "Segment retail customers based on Recency, Frequency, and Monetary (RFM) values using K-Means and PCA.",
            "problem_statement": "Marketing teams require data-driven persona segmentation to tailor promotional campaigns and maximize customer lifetime value (LTV).",
            "dataset_name": "ecommerce_transactions.csv",
            "required_tools": ["Scikit-Learn", "Pandas", "Seaborn", "PCA"],
            "starter_code": """import pandas as pd
from sklearn.cluster import KMeans
# RFM Segmentation starter
""",
            "implementation_guide": "Aggregate transaction logs into RFM scores, apply log transformation and StandardScaler, identify optimal K with Silhouette score.",
            "expected_outcomes": ["4 clearly distinguishable customer clusters with actionable marketing profiles"],
            "evaluation_criteria": ["Proper scaling prior to Euclidean distance clustering", "Elbow method and Silhouette analysis"]
        },
        {
            "title": "Sentiment Analysis on Product Reviews",
            "slug": "sentiment-analysis",
            "domain": "Natural Language Processing",
            "difficulty": "Intermediate",
            "estimated_hours": 12.0,
            "summary": "Classify customer feedback into positive, neutral, or negative sentiments using text vectorization and Logistic Regression.",
            "problem_statement": "E-commerce platforms receive thousands of reviews daily. Automate sentiment detection to triage dissatisfied customers.",
            "dataset_name": "customer_reviews_corpus.csv",
            "required_tools": ["NLTK / SpaCy", "Scikit-Learn", "TF-IDF Vectorizer"],
            "starter_code": """from sklearn.feature_extraction.text import TfidfVectorizer
# NLP pipeline starter
""",
            "implementation_guide": "Text tokenization, stop-word removal, n-gram TF-IDF vectorization, and training LogisticRegression with class balancing.",
            "expected_outcomes": ["Macro F1-score >= 0.88 on test dataset"],
            "evaluation_criteria": ["Text cleaning pipeline", "Confusion matrix analysis across sentiment classes"]
        },
        {
            "title": "Stock Trend Analysis & Momentum Indicators",
            "slug": "stock-trend-analysis",
            "domain": "Financial Data Science",
            "difficulty": "Intermediate",
            "estimated_hours": 12.0,
            "summary": "Calculate moving averages, RSI, Bollinger Bands, and backtest algorithmic momentum trading signals.",
            "problem_statement": "Financial analysts evaluate quantitative indicators to determine market trend continuations and risk-adjusted Sharpe ratios.",
            "dataset_name": "historical_stock_prices.csv",
            "required_tools": ["Pandas", "NumPy", "Matplotlib", "YFinance/Mock"],
            "starter_code": """import numpy as np
import pandas as pd
# Quantitative analysis starter
""",
            "implementation_guide": "Calculate 20-day and 50-day SMA, calculate 14-day Relative Strength Index (RSI), compute annualized volatility.",
            "expected_outcomes": ["Complete trading signal visualization with backtested cumulative return curve"],
            "evaluation_criteria": ["Sharpe ratio calculation", "Accounting for transaction slippage"]
        },
        {
            "title": "Credit Card Fraud Detection",
            "slug": "credit-card-fraud-detection",
            "domain": "Imbalanced Classification",
            "difficulty": "Advanced",
            "estimated_hours": 16.0,
            "summary": "Detect fraudulent financial transactions in highly imbalanced datasets (fraud rate < 0.2%) using SMOTE and Random Forest.",
            "problem_statement": "Fraudulent transactions are extremely rare, rendering standard accuracy metrics useless. Optimize Precision-Recall AUC to minimize financial loss and false alarms.",
            "dataset_name": "creditcard_transactions_imbalanced.csv",
            "required_tools": ["Scikit-Learn", "Imbalanced-Learn (SMOTE)", "PR-AUC", "RandomForest"],
            "starter_code": """from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, average_precision_score
# Imbalanced classification starter
""",
            "implementation_guide": "Inspect class imbalance, apply Synthetic Minority Over-sampling (SMOTE) strictly on training fold, evaluate PR-AUC curves.",
            "expected_outcomes": ["PR-AUC >= 0.85 with high recall at 95% precision threshold"],
            "evaluation_criteria": ["Avoiding data leakage during resampling", "Cost-sensitive threshold tuning"]
        }
    ]

    for p in projects_data:
        proj = Project(
            title=p["title"],
            slug=p["slug"],
            domain=p["domain"],
            difficulty=p["difficulty"],
            estimated_hours=p["estimated_hours"],
            summary=p["summary"],
            problem_statement=p["problem_statement"],
            dataset_name=p["dataset_name"],
            required_tools=p["required_tools"],
            starter_code=p["starter_code"],
            implementation_guide=p["implementation_guide"],
            expected_outcomes=p["expected_outcomes"],
            evaluation_criteria=p["evaluation_criteria"]
        )
        db.add(proj)

    # 8. Learning Paths
    learning_paths_data = [
        {
            "title": "Full-Stack Data Scientist Track",
            "slug": "full-stack-data-scientist",
            "description": "Comprehensive journey from Python and SQL mastery to advanced statistical modeling, machine learning, and production deployments.",
            "target_role": "Data Scientist",
            "estimated_weeks": 24,
            "difficulty": "Beginner to Advanced",
            "milestones": ["Python & SQL Fundamentals", "Exploratory Data Analysis", "Applied Machine Learning", "End-to-End Capstone Project"],
            "icon": "Compass"
        },
        {
            "title": "Machine Learning Engineer Track",
            "slug": "machine-learning-engineer",
            "description": "Deep dive into model architectures, PyTorch, gradient boosting, hyperparameters optimization, and vector systems.",
            "target_role": "ML Engineer",
            "estimated_weeks": 20,
            "difficulty": "Intermediate to Advanced",
            "milestones": ["Mathematical Foundations", "Scikit-Learn Pipelines", "Deep Learning with PyTorch", "Generative AI & LLMs"],
            "icon": "Cpu"
        },
        {
            "title": "Data Analyst Career Path",
            "slug": "data-analyst-career-path",
            "description": "Master structured querying, data visualization, business analytics, and executive presentation with Pandas and SQL.",
            "target_role": "Data Analyst",
            "estimated_weeks": 14,
            "difficulty": "Beginner to Intermediate",
            "milestones": ["SQL Querying Mastery", "Pandas Data Wrangling", "Dashboard Storytelling", "A/B Testing & Statistics"],
            "icon": "BarChart2"
        }
    ]

    for lp in learning_paths_data:
        path_obj = LearningPath(
            title=lp["title"],
            slug=lp["slug"],
            description=lp["description"],
            target_role=lp["target_role"],
            estimated_weeks=lp["estimated_weeks"],
            difficulty=lp["difficulty"],
            milestones=lp["milestones"],
            icon=lp["icon"]
        )
        db.add(path_obj)

    # 9. Badges / Achievements
    badges = [
        {"key": "first_step", "title": "First Step", "desc": "Started your learning journey on Synapse Data Science.", "icon": "Compass"},
        {"key": "diagnostic_master", "title": "Diagnostic Explorer", "desc": "Completed the adaptive skill assessment.", "icon": "Brain"},
        {"key": "code_artisan", "title": "Code Artisan", "desc": "Solved practical coding challenges with zero errors.", "icon": "Code"},
        {"key": "quiz_whiz", "title": "Assessment Prodigy", "desc": "Scored over 90% on a technical knowledge check.", "icon": "Award"},
        {"key": "streak_warrior", "title": "Consistent Learner", "desc": "Maintained an active 5-day learning streak.", "icon": "Flame"},
    ]
    for b in badges:
        ach = Achievement(
            user_id=admin_user.id,
            badge_key=b["key"],
            title=b["title"],
            description=b["desc"],
            icon=b["icon"],
            unlocked_at=datetime.utcnow()
        )
        db.add(ach)

    # 10. Admin Initial Skills
    initial_skills = [
        {"name": "Python Programming", "mastery": 95.0, "status": "strong"},
        {"name": "SQL and Databases", "mastery": 92.0, "status": "strong"},
        {"name": "Statistics and Probability", "mastery": 88.0, "status": "strong"},
        {"name": "Machine Learning", "mastery": 94.0, "status": "strong"},
        {"name": "Data Analysis & EDA", "mastery": 96.0, "status": "strong"},
    ]
    for s in initial_skills:
        sk = StudentSkill(
            user_id=admin_user.id,
            skill_name=s["name"],
            mastery_level=s["mastery"],
            strength_status=s["status"],
            questions_attempted=20,
            questions_correct=int(20 * (s["mastery"] / 100))
        )
        db.add(sk)

    db.commit()
    print("Synapse Data Science platform seeded successfully!")
