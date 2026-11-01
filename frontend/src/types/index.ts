export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'admin' | 'mentor';
  streak_days: number;
  avatar_url?: string;
  bio?: string;
  target_role?: string;
  current_level?: string;
  diagnostic_completed?: boolean;
}

export interface StudentProfile {
  current_level: string;
  target_role: string;
  daily_goal_mins: number;
  diagnostic_completed: boolean;
  diagnostic_score: number;
  diagnostic_strengths: string[];
  diagnostic_weaknesses: string[];
  github_username?: string;
  linkedin_url?: string;
}

export interface CourseCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  courses_count: number;
}

export interface Instructor {
  name: string;
  title: string;
  bio?: string;
  avatar_url?: string;
  rating?: number;
}

export interface Lesson {
  id: number;
  title: string;
  duration_mins: number;
  lesson_type: 'video' | 'reading' | 'interactive' | 'exercise';
  order_index: number;
  completed?: boolean;
  content_markdown?: string;
  video_url?: string;
}

export interface Module {
  id: number;
  title: string;
  order_index: number;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  category_id: number;
  category_name?: string;
  title: string;
  slug: string;
  summary: string;
  description?: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimated_hours: number;
  rating: number;
  students_enrolled: number;
  featured: boolean;
  video_url?: string;
  modules_count?: number;
  modules?: Module[];
  instructor?: Instructor;
  learning_objectives?: string[];
  downloadable_resources?: { name: string; size: string }[];
  progress_percentage?: number;
}

export interface Question {
  id: number;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'fill_blank' | 'code_snippet';
  options?: string[];
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  time_limit_mins: number;
  passing_score?: number;
  questions: Question[];
}

export interface Recommendation {
  id: number;
  course_id?: number;
  title: string;
  reason: string;
  priority_score: number;
  recommendation_type: 'next_step' | 'revision' | 'enrichment';
  created_at?: string;
}

export interface CodingExercise {
  id: number;
  title: string;
  description: string;
  instructions: string;
  language: 'python' | 'sql';
  difficulty: string;
  starter_code: string;
  solution_code?: string;
  test_cases: { input: string; expected_output: string }[];
  hints: string[];
}

export interface DatasetInfo {
  filename: string;
  title: string;
  domain: string;
  description: string;
  target_variable?: string;
  total_rows: number;
  total_columns: number;
  columns: string[];
  size_bytes: number;
  download_url: string;
  preview: Record<string, any>[];
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  domain: string;
  difficulty: string;
  estimated_hours: number;
  summary: string;
  problem_statement?: string;
  dataset_name: string;
  dataset_download_url?: string;
  dataset_total_rows?: number;
  dataset_columns?: string[];
  dataset_preview?: Record<string, any>[];
  required_tools: string[];
  starter_code?: string;
  implementation_guide?: string;
  expected_outcomes?: string[];
  evaluation_criteria?: string[];
}

export interface Certificate {
  certificate_code: string;
  course_id?: number;
  course_title: string;
  student_name: string;
  recipient_name?: string;
  appreciation_letter?: string;
  instructor_signature?: string;
  issue_date: string;
  grade: string;
  verification_hash: string;
}

export interface MentorStudent {
  id: number;
  full_name: string;
  email: string;
  avatar_url?: string;
  streak_days: number;
  target_role: string;
  current_level: string;
  courses_enrolled: number;
  completed_lessons: number;
  completion_pct: number;
  avg_quiz_score: number;
  risk_status: 'At Risk' | 'On Track' | 'Top Performer';
  capstone_submissions_count: number;
  pending_reviews: number;
  feedback_count: number;
  latest_feedback?: string;
  created_at: string;
}

export interface Achievement {
  badge_key: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at: string;
}
