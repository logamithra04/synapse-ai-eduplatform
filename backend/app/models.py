from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

# 1. users
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student")  # 'student' or 'admin'
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    streak_days = Column(Integer, default=1)
    last_active_date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    profile = relationship("StudentProfile", back_populates="user", uselist=False)
    enrollments = relationship("Enrollment", back_populates="user")
    lesson_progresses = relationship("LessonProgress", back_populates="user")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")
    coding_submissions = relationship("CodingSubmission", back_populates="user")
    project_submissions = relationship("ProjectSubmission", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")
    achievements = relationship("Achievement", back_populates="user")
    recommendations = relationship("Recommendation", back_populates="user")
    student_skills = relationship("StudentSkill", back_populates="user")
    learning_analytics = relationship("LearningAnalytics", back_populates="user")
    chat_histories = relationship("ChatHistory", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

# 2. student_profiles
class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    current_level = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    target_role = Column(String(100), default="Data Scientist")
    daily_goal_mins = Column(Integer, default=30)
    preferred_difficulty = Column(String(50), default="adaptive")
    diagnostic_completed = Column(Boolean, default=False)
    diagnostic_score = Column(Float, default=0.0)
    diagnostic_strengths = Column(JSON, default=list)  # list of topic names
    diagnostic_weaknesses = Column(JSON, default=list) # list of topic names
    github_username = Column(String(100), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="profile")

# 3. instructors
class Instructor(Base):
    __tablename__ = "instructors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(500), nullable=True)
    expertise = Column(String(255), nullable=True)
    rating = Column(Float, default=4.9)
    courses = relationship("Course", back_populates="instructor")

# 4. course_categories (All 13 categories)
class CourseCategory(Base):
    __tablename__ = "course_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    slug = Column(String(255), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(100), default="BookOpen")
    display_order = Column(Integer, default=1)

    courses = relationship("Course", back_populates="category")

# 5. courses
class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("course_categories.id"), nullable=False)
    instructor_id = Column(Integer, ForeignKey("instructors.id"), nullable=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    summary = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    difficulty = Column(String(50), default="Beginner")  # Beginner, Intermediate, Advanced
    estimated_hours = Column(Float, default=10.0)
    rating = Column(Float, default=4.8)
    students_enrolled = Column(Integer, default=1240)
    thumbnail = Column(String(500), nullable=True)
    video_url = Column(String(500), nullable=True)
    learning_objectives = Column(JSON, default=list)
    prerequisites = Column(JSON, default=list)
    downloadable_resources = Column(JSON, default=list)
    featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("CourseCategory", back_populates="courses")
    instructor = relationship("Instructor", back_populates="courses")
    modules = relationship("Module", back_populates="course", cascade="all, delete-orphan", order_by="Module.order_index")
    enrollments = relationship("Enrollment", back_populates="course")
    quizzes = relationship("Quiz", back_populates="course")
    certificates = relationship("Certificate", back_populates="course")

# 6. modules
class Module(Base):
    __tablename__ = "modules"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=1)

    course = relationship("Course", back_populates="modules")
    lessons = relationship("Lesson", back_populates="module", cascade="all, delete-orphan", order_by="Lesson.order_index")
    quizzes = relationship("Quiz", back_populates="module")

# 7. lessons
class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=False)
    title = Column(String(255), nullable=False)
    duration_mins = Column(Integer, default=15)
    lesson_type = Column(String(50), default="reading")  # 'video', 'reading', 'interactive', 'exercise'
    content_markdown = Column(Text, nullable=False)
    video_url = Column(String(500), nullable=True)
    code_snippet = Column(Text, nullable=True)
    order_index = Column(Integer, default=1)

    module = relationship("Module", back_populates="lessons")
    coding_exercises = relationship("CodingExercise", back_populates="lesson")
    progress = relationship("LessonProgress", back_populates="lesson")

# 8. lesson_progress
class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    completed = Column(Boolean, default=False)
    time_spent_secs = Column(Integer, default=0)
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="lesson_progresses")
    lesson = relationship("Lesson", back_populates="progress")

# 9. enrollments
class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    progress_percentage = Column(Float, default=0.0)
    status = Column(String(50), default="active")  # 'active', 'completed'
    last_accessed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

# 10. quizzes
class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    time_limit_mins = Column(Integer, default=15)
    passing_score = Column(Float, default=70.0)
    is_diagnostic = Column(Boolean, default=False)
    difficulty = Column(String(50), default="adaptive")

    course = relationship("Course", back_populates="quizzes")
    module = relationship("Module", back_populates="quizzes")
    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz")

# 11. questions
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    question_type = Column(String(50), default="mcq")  # mcq, true_false, fill_blank, code_snippet
    options = Column(JSON, default=list)  # list of strings for mcq
    correct_answer = Column(String(500), nullable=False)
    explanation = Column(Text, nullable=True)
    topic = Column(String(100), default="General Data Science")
    difficulty = Column(String(50), default="medium")  # easy, medium, hard
    code_context = Column(Text, nullable=True)

    quiz = relationship("Quiz", back_populates="questions")

# 12. quiz_attempts
class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id"), nullable=False)
    score = Column(Float, default=0.0)
    total_questions = Column(Integer, default=0)
    correct_count = Column(Integer, default=0)
    passed = Column(Boolean, default=False)
    difficulty_level = Column(String(50), default="adaptive")
    completed_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    answers = relationship("QuizAnswer", back_populates="attempt", cascade="all, delete-orphan")

# 13. quiz_answers
class QuizAnswer(Base):
    __tablename__ = "quiz_answers"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id"), nullable=False)
    question_id = Column(Integer, ForeignKey("questions.id"), nullable=False)
    selected_answer = Column(String(500), nullable=False)
    is_correct = Column(Boolean, default=False)

    attempt = relationship("QuizAttempt", back_populates="answers")

# 14. learning_paths
class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    target_role = Column(String(100), nullable=False)
    estimated_weeks = Column(Integer, default=12)
    difficulty = Column(String(50), default="Beginner to Advanced")
    courses_sequence = Column(JSON, default=list)  # list of course IDs in sequence
    milestones = Column(JSON, default=list)
    icon = Column(String(100), default="Compass")

# 15. recommendations
class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    module_id = Column(Integer, ForeignKey("modules.id"), nullable=True)
    title = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    priority_score = Column(Float, default=1.0)
    recommendation_type = Column(String(50), default="next_step")  # 'next_step', 'revision', 'enrichment'
    is_dismissed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="recommendations")

# 16. student_skills
class StudentSkill(Base):
    __tablename__ = "student_skills"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String(100), nullable=False)  # Python, SQL, Statistics, ML, EDA, Deep Learning, Math
    mastery_level = Column(Float, default=0.0)  # 0 to 100
    strength_status = Column(String(50), default="moderate")  # 'weak', 'moderate', 'strong'
    questions_attempted = Column(Integer, default=0)
    questions_correct = Column(Integer, default=0)
    last_evaluated = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="student_skills")

# 17. coding_exercises
class CodingExercise(Base):
    __tablename__ = "coding_exercises"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    instructions = Column(Text, nullable=False)
    language = Column(String(50), default="python")  # 'python' or 'sql'
    starter_code = Column(Text, nullable=False)
    solution_code = Column(Text, nullable=False)
    test_cases = Column(JSON, default=list)  # list of {input, expected_output, is_hidden}
    hints = Column(JSON, default=list)
    difficulty = Column(String(50), default="medium")
    dataset_context = Column(String(100), nullable=True)  # 'iris', 'titanic', 'housing', 'ecommerce'

    lesson = relationship("Lesson", back_populates="coding_exercises")
    submissions = relationship("CodingSubmission", back_populates="exercise")

# 18. coding_submissions
class CodingSubmission(Base):
    __tablename__ = "coding_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("coding_exercises.id"), nullable=False)
    submitted_code = Column(Text, nullable=False)
    language = Column(String(50), default="python")
    passed_tests = Column(Integer, default=0)
    total_tests = Column(Integer, default=0)
    stdout_output = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # 'passed', 'failed', 'error'
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="coding_submissions")
    exercise = relationship("CodingExercise", back_populates="submissions")

# 19. projects (Practical project library)
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, nullable=False)
    domain = Column(String(100), default="Machine Learning")
    difficulty = Column(String(50), default="Intermediate")
    estimated_hours = Column(Float, default=12.0)
    summary = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=False)
    dataset_name = Column(String(255), nullable=False)
    dataset_url = Column(String(500), nullable=True)
    dataset_preview = Column(JSON, default=list)  # sample rows/columns
    required_tools = Column(JSON, default=list)   # ['Pandas', 'Scikit-learn', 'Matplotlib']
    implementation_guide = Column(Text, nullable=False)
    starter_code = Column(Text, nullable=False)
    expected_outcomes = Column(JSON, default=list)
    evaluation_criteria = Column(JSON, default=list)

    submissions = relationship("ProjectSubmission", back_populates="project")

# 20. project_submissions
class ProjectSubmission(Base):
    __tablename__ = "project_submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    code_submission = Column(Text, nullable=False)
    dataset_analysis_notes = Column(Text, nullable=True)
    metrics_reported = Column(JSON, default=dict)  # e.g. {"accuracy": 0.92, "rmse": 45.2}
    score = Column(Float, default=0.0)
    feedback = Column(Text, nullable=True)
    status = Column(String(50), default="submitted")  # 'submitted', 'reviewed'
    submitted_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="project_submissions")
    project = relationship("Project", back_populates="submissions")

# 21. certificates
class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_code = Column(String(100), unique=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    recipient_name = Column(String(255), nullable=True)
    appreciation_letter = Column(Text, nullable=True)
    instructor_signature = Column(String(255), nullable=True)
    issue_date = Column(DateTime, default=datetime.utcnow)
    grade = Column(String(20), default="Distinction")
    verification_hash = Column(String(255), nullable=False)

    user = relationship("User", back_populates="certificates")
    course = relationship("Course", back_populates="certificates")

# 22. mentor_feedback
class MentorFeedback(Base):
    __tablename__ = "mentor_feedback"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    mentor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=True)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="guidance")  # 'guidance', 'intervention', 'commendation'
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id])
    mentor = relationship("User", foreign_keys=[mentor_id])

# 22. achievements
class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    badge_key = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    icon = Column(String(100), default="Award")
    unlocked_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="achievements")

# 23. learning_analytics
class LearningAnalytics(Base):
    __tablename__ = "learning_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(String(20), nullable=False)  # YYYY-MM-DD
    minutes_spent = Column(Integer, default=0)
    lessons_completed = Column(Integer, default=0)
    exercises_completed = Column(Integer, default=0)
    quiz_accuracy = Column(Float, default=0.0)

    user = relationship("User", back_populates="learning_analytics")

# 24. chat_history
class ChatHistory(Base):
    __tablename__ = "chat_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    sender = Column(String(50), default="user")  # 'user' or 'assistant'
    context_tags = Column(JSON, default=list)     # ['python', 'pandas', 'lesson_4']
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="chat_histories")

# 25. notifications
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="recommendation")  # 'achievement', 'recommendation', 'streak', 'reminder'
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
