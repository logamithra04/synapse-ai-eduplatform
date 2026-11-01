-- ==============================================================================
-- SYNAPSE ADAPTIVE DATA SCIENCE PLATFORM
-- Supabase PostgreSQL Database Schema & Migration Script
-- Version: 1.0.0
-- Compatible with: Supabase PostgreSQL 15+ / Cloud SQL / Self-Hosted
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Instructors Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS instructors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    expertise VARCHAR(255),
    rating DOUBLE PRECISION DEFAULT 4.9,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 2. Users Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student', -- 'student', 'admin', 'mentor'
    avatar_url VARCHAR(500),
    bio TEXT,
    streak_days INTEGER DEFAULT 1,
    last_active_date TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ------------------------------------------------------------------------------
-- 3. Student Profiles
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    current_level VARCHAR(50) DEFAULT 'Beginner',
    target_role VARCHAR(100) DEFAULT 'Data Scientist',
    daily_goal_mins INTEGER DEFAULT 30,
    preferred_difficulty VARCHAR(50) DEFAULT 'adaptive',
    diagnostic_completed BOOLEAN DEFAULT FALSE,
    diagnostic_score DOUBLE PRECISION DEFAULT 0.0,
    diagnostic_strengths JSONB DEFAULT '[]'::jsonb,
    diagnostic_weaknesses JSONB DEFAULT '[]'::jsonb,
    github_username VARCHAR(100),
    linkedin_url VARCHAR(255),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. Course Categories (13 Core Taxonomy)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(100) DEFAULT 'BookOpen',
    display_order INTEGER DEFAULT 1
);

-- ------------------------------------------------------------------------------
-- 5. Courses Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    category_id INTEGER NOT NULL REFERENCES course_categories(id) ON DELETE CASCADE,
    instructor_id INTEGER REFERENCES instructors(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    description TEXT,
    difficulty VARCHAR(50) DEFAULT 'Beginner', -- Beginner, Intermediate, Advanced
    estimated_hours DOUBLE PRECISION DEFAULT 10.0,
    rating DOUBLE PRECISION DEFAULT 4.8,
    students_enrolled INTEGER DEFAULT 1240,
    thumbnail VARCHAR(500),
    video_url VARCHAR(500),
    learning_objectives JSONB DEFAULT '[]'::jsonb,
    prerequisites JSONB DEFAULT '[]'::jsonb,
    downloadable_resources JSONB DEFAULT '[]'::jsonb,
    featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category_id);

-- ------------------------------------------------------------------------------
-- 6. Modules Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id);

-- ------------------------------------------------------------------------------
-- 7. Lessons Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lessons (
    id SERIAL PRIMARY KEY,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration_mins INTEGER DEFAULT 15,
    lesson_type VARCHAR(50) DEFAULT 'reading', -- 'video', 'reading', 'interactive', 'exercise'
    content_markdown TEXT NOT NULL,
    video_url VARCHAR(500),
    code_snippet TEXT,
    order_index INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id);

-- ------------------------------------------------------------------------------
-- 8. Lesson Progress Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    time_spent_secs INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);

-- ------------------------------------------------------------------------------
-- 9. Enrollments Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMPTZ DEFAULT NOW(),
    progress_percentage DOUBLE PRECISION DEFAULT 0.0,
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed'
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id);

-- ------------------------------------------------------------------------------
-- 10. Quizzes Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    time_limit_mins INTEGER DEFAULT 15,
    passing_score DOUBLE PRECISION DEFAULT 70.0,
    is_diagnostic BOOLEAN DEFAULT FALSE,
    difficulty VARCHAR(50) DEFAULT 'adaptive'
);

-- ------------------------------------------------------------------------------
-- 11. Questions Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) DEFAULT 'mcq', -- mcq, true_false, fill_blank, code_snippet
    options JSONB DEFAULT '[]'::jsonb,
    correct_answer VARCHAR(500) NOT NULL,
    explanation TEXT,
    topic VARCHAR(100) DEFAULT 'General Data Science',
    difficulty VARCHAR(50) DEFAULT 'medium',
    code_context TEXT
);

CREATE INDEX IF NOT EXISTS idx_questions_quiz ON questions(quiz_id);

-- ------------------------------------------------------------------------------
-- 12. Quiz Attempts & Answers
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    score DOUBLE PRECISION DEFAULT 0.0,
    total_questions INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    passed BOOLEAN DEFAULT FALSE,
    difficulty_level VARCHAR(50) DEFAULT 'adaptive',
    completed_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quiz_answers (
    id SERIAL PRIMARY KEY,
    attempt_id INTEGER NOT NULL REFERENCES quiz_attempts(id) ON DELETE CASCADE,
    question_id INTEGER NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_answer VARCHAR(500) NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE
);

-- ------------------------------------------------------------------------------
-- 13. Coding Exercises & Submissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coding_exercises (
    id SERIAL PRIMARY KEY,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    instructions TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'python',
    starter_code TEXT NOT NULL,
    solution_code TEXT NOT NULL,
    test_cases JSONB DEFAULT '[]'::jsonb,
    hints JSONB DEFAULT '[]'::jsonb,
    difficulty VARCHAR(50) DEFAULT 'medium',
    dataset_context VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS coding_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    exercise_id INTEGER NOT NULL REFERENCES coding_exercises(id) ON DELETE CASCADE,
    submitted_code TEXT NOT NULL,
    language VARCHAR(50) DEFAULT 'python',
    passed_tests INTEGER DEFAULT 0,
    total_tests INTEGER DEFAULT 0,
    stdout_output TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'passed', 'failed', 'error'
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 14. Projects & Capstone Submissions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    domain VARCHAR(100) DEFAULT 'Machine Learning',
    difficulty VARCHAR(50) DEFAULT 'Intermediate',
    estimated_hours DOUBLE PRECISION DEFAULT 12.0,
    summary TEXT NOT NULL,
    problem_statement TEXT NOT NULL,
    dataset_name VARCHAR(255) NOT NULL,
    dataset_url VARCHAR(500),
    dataset_preview JSONB DEFAULT '[]'::jsonb,
    required_tools JSONB DEFAULT '[]'::jsonb,
    implementation_guide TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    expected_outcomes JSONB DEFAULT '[]'::jsonb,
    evaluation_criteria JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS project_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    code_submission TEXT NOT NULL,
    dataset_analysis_notes TEXT,
    metrics_reported JSONB DEFAULT '{}'::jsonb,
    score DOUBLE PRECISION DEFAULT 0.0,
    feedback TEXT,
    status VARCHAR(50) DEFAULT 'submitted', -- 'submitted', 'reviewed'
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 15. Certificates Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    certificate_code VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    recipient_name VARCHAR(255),
    appreciation_letter TEXT,
    instructor_signature VARCHAR(255),
    issue_date TIMESTAMPTZ DEFAULT NOW(),
    grade VARCHAR(20) DEFAULT 'Distinction',
    verification_hash VARCHAR(255) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(certificate_code);

-- ------------------------------------------------------------------------------
-- 16. Mentor Feedback
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS mentor_feedback (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    mentor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id INTEGER REFERENCES courses(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'guidance', -- 'guidance', 'intervention', 'commendation'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 17. Student Skills, Learning Analytics & Chat History
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_name VARCHAR(100) NOT NULL,
    mastery_level DOUBLE PRECISION DEFAULT 0.0,
    strength_status VARCHAR(50) DEFAULT 'moderate',
    questions_attempted INTEGER DEFAULT 0,
    questions_correct INTEGER DEFAULT 0,
    last_evaluated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    badge_key VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(100) DEFAULT 'Award',
    unlocked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date VARCHAR(20) NOT NULL,
    minutes_spent INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    exercises_completed INTEGER DEFAULT 0,
    quiz_accuracy DOUBLE PRECISION DEFAULT 0.0
);

CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    sender VARCHAR(50) DEFAULT 'user',
    context_tags JSONB DEFAULT '[]'::jsonb,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'recommendation',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE course_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Allow public read access on catalog tables
CREATE POLICY "Public read course categories" ON course_categories FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read modules" ON modules FOR SELECT USING (true);
CREATE POLICY "Public read lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Public read projects" ON projects FOR SELECT USING (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- 1. Instructors
INSERT INTO instructors (id, name, title, bio, avatar_url, expertise, rating)
VALUES
(1, 'Dr. Elena Vance', 'Former Deep Learning Researcher at MIT & Senior Data Scientist', 'Passionate educator specializing in Machine Learning, Statistical Inference, and Adaptive Learning systems.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80', 'Machine Learning, Deep Learning, Python', 4.95),
(2, 'Marcus Sterling', 'Lead Analytics Architect & SQL Specialist', '12+ years optimizing enterprise data pipelines, relational modeling, and business intelligence architectures.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80', 'SQL, Databases, Pandas, Data Engineering', 4.90)
ON CONFLICT (id) DO NOTHING;

-- 2. Users (Admin, Mentor, Student)
-- admin@synapse.edu -> AdminPass123!
-- mentor@synapse.edu -> MentorPass123!
-- student@synapse.edu -> StudentPass123!
-- alex.miller@student.edu -> StudentPass123!
INSERT INTO users (id, email, hashed_password, full_name, role, avatar_url, bio, streak_days)
VALUES
(1, 'admin@synapse.edu', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Dr. Sarah Chen (Admin)', 'admin', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&q=80', 'Head of Academic Curriculum and Learning Technologies.', 15),
(2, 'mentor@synapse.edu', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Dr. Elena Vance (Faculty Mentor)', 'mentor', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80', 'Senior Data Science Researcher & Student Mentorship Director.', 18),
(3, 'student@synapse.edu', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Alex Miller (Student)', 'student', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80', 'Aspiring Data Scientist with background in engineering, learning predictive modeling and statistics.', 7),
(4, 'alex.miller@student.edu', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'Alex Miller', 'student', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80', 'Aspiring Data Scientist with background in engineering, learning predictive modeling and statistics.', 7)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name;

INSERT INTO student_profiles (user_id, current_level, target_role, daily_goal_mins, diagnostic_completed, diagnostic_score)
VALUES
(1, 'Advanced', 'Lead Data Scientist & Platform Admin', 60, true, 98.5),
(2, 'Advanced', 'Senior Academic Mentor', 45, true, 95.0),
(3, 'Intermediate', 'Full-Stack Data Scientist', 45, true, 82.0),
(4, 'Intermediate', 'Full-Stack Data Scientist', 45, true, 82.0)
ON CONFLICT (user_id) DO NOTHING;

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
