-- ==============================================================================
-- SYNAPSE INITIAL SEED DATA
-- ==============================================================================

-- 1. Instructors
INSERT INTO instructors (id, name, title, bio, avatar_url, expertise, rating)
VALUES
(1, 'Dr. Elena Vance', 'Former Deep Learning Researcher at MIT & Senior Data Scientist', 'Passionate educator specializing in Machine Learning, Statistical Inference, and Adaptive Learning systems.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80', 'Machine Learning, Deep Learning, Python', 4.95),
(2, 'Marcus Sterling', 'Lead Analytics Architect & SQL Specialist', '12+ years optimizing enterprise data pipelines, relational modeling, and business intelligence architectures.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', 'SQL, Databases, Pandas, Data Engineering', 4.90)
ON CONFLICT (id) DO NOTHING;

-- 2. Single Admin User (Only authorized account)
INSERT INTO users (id, email, hashed_password, full_name, role, avatar_url, bio, streak_days)
VALUES
(1, 'admin@synapse.edu', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Dr. Sarah Chen (Admin)', 'admin', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80', 'Head of Academic Curriculum and Learning Technologies.', 14)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

-- Purge any student or mentor accounts to enforce single admin account policy
DELETE FROM student_profiles WHERE user_id != 1;
DELETE FROM users WHERE id != 1;

-- 3. 13 Course Categories
INSERT INTO course_categories (id, name, slug, description, icon, display_order)
VALUES
(1, 'Python Programming', 'python-programming', 'Foundational and advanced Python for data manipulation, clean scripting, and OOP.', 'Terminal', 1),
(2, 'Mathematics for Data Science', 'mathematics-for-data-science', 'Linear algebra, multivariable calculus, and optimization fundamentals.', 'Binary', 2),
(3, 'Statistics and Probability', 'statistics-and-probability', 'Descriptive statistics, inferential hypothesis testing, Bayes theorem, and distributions.', 'BarChart2', 3),
(4, 'SQL and Database Management', 'sql-database-management', 'Relational querying, complex joins, window functions, and indexing strategies.', 'Database', 4),
(5, 'Data Analysis', 'data-analysis', 'Structured data aggregation, business metrics, and analytical problem solving.', 'PieChart', 5),
(6, 'NumPy and Pandas', 'numpy-and-pandas', 'Vectorized arrays, DataFrames, time series, and ultra-fast tabular transformations.', 'Layers', 6),
(7, 'Data Visualization', 'data-visualization', 'Matplotlib, Seaborn, interactive Plotly visualizations, and data storytelling.', 'LineChart', 7),
(8, 'Exploratory Data Analysis', 'exploratory-data-analysis', 'Outlier detection, missing data imputation, feature correlation, and distributions.', 'Search', 8),
(9, 'Machine Learning', 'machine-learning', 'Supervised & unsupervised algorithms: regression, trees, ensembles, and evaluation.', 'Cpu', 9),
(10, 'Deep Learning', 'deep-learning', 'Neural network architectures, backprop, PyTorch, CNNs, and optimization.', 'Network', 10),
(11, 'Natural Language Processing', 'natural-language-processing', 'Tokenization, embeddings, TF-IDF, transformers, and sequence classification.', 'FileText', 11),
(12, 'Generative AI Fundamentals', 'generative-ai-fundamentals', 'LLM foundations, prompt engineering, RAG pipelines, and embeddings.', 'Sparkles', 12),
(13, 'Data Science Projects', 'data-science-projects', 'End-to-end industry projects from raw datasets to production deployment.', 'Briefcase', 13)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence counters for PostgreSQL auto-increment
SELECT setval('instructors_id_seq', (SELECT COALESCE(MAX(id), 1) FROM instructors));
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('course_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM course_categories));
