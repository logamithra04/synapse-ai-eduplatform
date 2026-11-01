import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DataTutorDrawer } from './components/ai-tutor/DataTutorDrawer';
import { FloatingChatbot } from './components/ai-tutor/FloatingChatbot';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { CourseDetailPage } from './pages/CourseDetailPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { CodingLabPage } from './pages/CodingLabPage';
import { QuizPage } from './pages/QuizPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { DiagnosticPage } from './pages/DiagnosticPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MentorDashboardPage } from './pages/MentorDashboardPage';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [activeCourseId, setActiveCourseId] = useState<number>(1);
  const [activeLessonId, setActiveLessonId] = useState<number>(1);
  const [activeProjectId, setActiveProjectId] = useState<number>(1);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // AI Tutor context state
  const [isAiTutorOpen, setIsAiTutorOpen] = useState<boolean>(false);
  const [aiTutorContext, setAiTutorContext] = useState<any>(null);

  // If user signs in and is on landing or auth, route them appropriately by role
  React.useEffect(() => {
    if (user && (currentTab === 'landing' || currentTab === 'auth')) {
      if (user.role === 'mentor') {
        setCurrentTab('mentor');
      } else if (user.role === 'admin') {
        setCurrentTab('admin');
      } else {
        setCurrentTab('dashboard');
      }
    }
  }, [user]);

  const handleOpenAiTutor = (contextData?: any) => {
    setAiTutorContext(contextData || null);
    setIsAiTutorOpen(true);
  };

  // Dynamically compute active context so chatbot always knows current page
  const effectiveAiContext = React.useMemo(() => {
    if (aiTutorContext) return aiTutorContext;

    if (currentTab === 'mentor') {
      return {
        topic: 'Student Cohort Mentorship',
        domain: 'Institutional Academic Oversight',
        user_role: 'mentor',
      };
    }
    if (currentTab === 'coding-lab') {
      return {
        topic: 'Interactive Coding Lab',
        language: 'python',
        active_dataset: 'student_academic_records.csv',
      };
    }
    if (currentTab === 'projects') {
      return {
        topic: 'Applied Industry Capstones',
        active_dataset: 'Synapse 7 Canonical Datasets',
      };
    }
    if (currentTab === 'analytics') {
      return {
        topic: 'Curriculum Completion Analytics',
        domain: 'Learning Analytics',
      };
    }
    if (currentTab === 'admin') {
      return {
        topic: 'Course Studio & Curriculum Authoring',
        domain: 'Course Administration',
      };
    }
    if (currentTab === 'courses' || currentTab === 'course-detail') {
      return {
        topic: 'Data Science Curriculum',
        course_id: activeCourseId,
      };
    }
    return null;
  }, [aiTutorContext, currentTab, activeCourseId]);

  const handleNavigate = (tab: string, meta?: any) => {
    if (meta?.courseId) {
      setActiveCourseId(meta.courseId);
      setCurrentTab('course-detail');
      return;
    }
    if (meta?.lessonId) {
      setActiveLessonId(meta.lessonId);
      setCurrentTab('lesson');
      return;
    }
    if (meta?.projectId) {
      setActiveProjectId(meta.projectId);
      setCurrentTab('project-detail');
      return;
    }
    if (meta?.category) {
      setFilterCategory(meta.category);
      setCurrentTab('courses');
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Connecting to Synapse Data Science Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => handleNavigate(tab)}
        openAiTutor={() => handleOpenAiTutor()}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'auth' && (
          <AuthPage onSuccess={() => {
            if (user?.role === 'mentor') handleNavigate('mentor');
            else if (user?.role === 'admin') handleNavigate('admin');
            else handleNavigate('dashboard');
          }} />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage onNavigate={handleNavigate} />
        )}

        {currentTab === 'courses' && (
          <CoursesPage
            initialCategory={filterCategory}
            onSelectCourse={(id) => {
              setActiveCourseId(id);
              handleNavigate('course-detail');
            }}
          />
        )}

        {currentTab === 'course-detail' && (
          <CourseDetailPage
            courseId={activeCourseId}
            onBack={() => handleNavigate('courses')}
            onStartLesson={(lessonId) => {
              setActiveLessonId(lessonId);
              handleNavigate('lesson');
            }}
          />
        )}

        {currentTab === 'lesson' && (
          <LessonPlayerPage
            lessonId={activeLessonId}
            onBackToCourse={(courseId) => {
              if (courseId) setActiveCourseId(courseId);
              handleNavigate('course-detail');
            }}
            onOpenAiTutor={handleOpenAiTutor}
            onNextLesson={(nextId) => {
              setActiveLessonId(nextId);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentTab === 'coding-lab' && (
          <CodingLabPage onOpenAiTutor={handleOpenAiTutor} />
        )}

        {currentTab === 'quiz' && (
          <QuizPage
            quizId={1}
            onBack={() => handleNavigate('courses')}
            onOpenAiTutor={handleOpenAiTutor}
          />
        )}

        {currentTab === 'projects' && (
          <ProjectsPage
            onSelectProject={(pId) => {
              setActiveProjectId(pId);
              handleNavigate('project-detail');
            }}
          />
        )}

        {currentTab === 'project-detail' && (
          <ProjectDetailPage
            projectId={activeProjectId}
            onBack={() => handleNavigate('projects')}
            onOpenAiTutor={handleOpenAiTutor}
          />
        )}

        {currentTab === 'diagnostic' && (
          <DiagnosticPage onComplete={() => handleNavigate('dashboard')} />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsPage
            onNavigateToCourse={(cat) => handleNavigate('courses', { category: cat })}
          />
        )}

        {currentTab === 'profile' && (
          <ProfilePage />
        )}

        {currentTab === 'admin' && (
          <AdminDashboardPage />
        )}

        {currentTab === 'mentor' && (
          <MentorDashboardPage />
        )}
      </main>

      {/* Persistent Floating Chatbot anchored at bottom-right */}
      <FloatingChatbot
        contextData={effectiveAiContext}
        onOpenFullDrawer={() => setIsAiTutorOpen(true)}
      />

      {/* Expandable Full Drawer AI Tutor */}
      <DataTutorDrawer
        isOpen={isAiTutorOpen}
        onClose={() => setIsAiTutorOpen(false)}
        contextData={effectiveAiContext}
      />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
