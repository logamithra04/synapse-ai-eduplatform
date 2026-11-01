from pydantic import BaseModel, EmailStr
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- Auth & User ---
class UserRegister(BaseModel):
    email: str
    password: str
    full_name: str
    target_role: Optional[str] = "Data Scientist"

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    target_role: Optional[str] = None
    daily_goal_mins: Optional[int] = None
    github_username: Optional[str] = None
    linkedin_url: Optional[str] = None
    avatar_url: Optional[str] = None

# --- Diagnostic & Adaptive ---
class DiagnosticSubmission(BaseModel):
    answers: Dict[int, str]  # question_id -> selected_answer

class AdaptiveRecommendationItem(BaseModel):
    course_id: Optional[int] = None
    module_id: Optional[int] = None
    title: str
    reason: str
    priority_score: float
    recommendation_type: str  # 'next_step', 'revision', 'enrichment'

# --- Course & Lesson ---
class LessonProgressUpdate(BaseModel):
    lesson_id: int
    completed: bool
    time_spent_secs: int = 0

class CourseEnrollRequest(BaseModel):
    course_id: int

# --- Quiz ---
class QuizSubmitAnswer(BaseModel):
    question_id: int
    selected_answer: str

class QuizSubmission(BaseModel):
    quiz_id: int
    answers: List[QuizSubmitAnswer]

# --- Coding Lab ---
class CodeRunRequest(BaseModel):
    language: str  # 'python' or 'sql'
    code: str
    exercise_id: Optional[int] = None
    dataset_name: Optional[str] = None

class CodeRunResult(BaseModel):
    success: bool
    stdout: str
    error: Optional[str] = None
    passed_tests: int = 0
    total_tests: int = 0
    test_results: List[Dict[str, Any]] = []
    columns: Optional[List[str]] = None
    tabular_data: Optional[List[List[Any]]] = None

# --- Projects ---
class ProjectSubmitRequest(BaseModel):
    project_id: int
    code_submission: str
    dataset_analysis_notes: Optional[str] = ""
    metrics_reported: Optional[Dict[str, Any]] = {}

# --- AI Tutor Chat ---
class ChatMessageRequest(BaseModel):
    message: str
    context: Optional[Dict[str, Any]] = None  # course_title, lesson_title, active_code, etc.
    api_key: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []

class VerifyKeyRequest(BaseModel):
    api_key: str

# --- Admin Operations ---
class CourseCreateRequest(BaseModel):
    category_id: int
    title: str
    summary: str
    description: Optional[str] = None
    difficulty: str = "Beginner"
    estimated_hours: float = 10.0
    video_url: Optional[str] = None
    learning_objectives: List[str] = []

class CourseUpdateRequest(BaseModel):
    category_id: Optional[int] = None
    title: Optional[str] = None
    summary: Optional[str] = None
    description: Optional[str] = None
    difficulty: Optional[str] = None
    estimated_hours: Optional[float] = None
    video_url: Optional[str] = None
    learning_objectives: Optional[List[str]] = None

class ModuleCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    order_index: int = 1

class ModuleUpdateRequest(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    order_index: Optional[int] = None

class LessonCreateRequest(BaseModel):
    title: str
    duration_mins: int = 15
    lesson_type: str = "video"
    content_markdown: str
    video_url: Optional[str] = None
    order_index: int = 1

class LessonUpdateRequest(BaseModel):
    title: Optional[str] = None
    duration_mins: Optional[int] = None
    lesson_type: Optional[str] = None
    content_markdown: Optional[str] = None
    video_url: Optional[str] = None
    order_index: Optional[int] = None

class ClaimCertificateRequest(BaseModel):
    recipient_name: str
    grade: Optional[str] = "Distinction"

class MentorFeedbackRequest(BaseModel):
    message: str
    category: str = "guidance"  # 'guidance', 'intervention', 'commendation'
    course_id: Optional[int] = None

class SubmissionReviewRequest(BaseModel):
    score: float
    feedback: str
    status: str = "reviewed"

class QuizCreateRequest(BaseModel):
    course_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    time_limit_mins: int = 15
    passing_score: float = 70.0

# --- Supabase Dynamic Cloud Config ---
class SupabaseTestRequest(BaseModel):
    supabase_url: str
    supabase_key: str

class SupabaseConfigRequest(BaseModel):
    supabase_url: str
    supabase_key: str
    database_url: Optional[str] = None

class DatabaseTestRequest(BaseModel):
    database_url: str

