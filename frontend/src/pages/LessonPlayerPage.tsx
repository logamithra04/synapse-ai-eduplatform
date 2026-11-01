import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, ArrowRight, CheckCircle, Sparkles, BookOpen, 
  PlayCircle, Code, Award, Check, ChevronLeft, ChevronRight,
  Video, FileText, ExternalLink
} from 'lucide-react';
import { apiRequest } from '../api/client';
import confetti from 'canvas-confetti';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { CertificateGeneratorModal } from '../components/certificate/CertificateGeneratorModal';
import { Certificate } from '../types';

interface LessonPlayerPageProps {
  lessonId: number;
  onBackToCourse: (courseId?: number) => void;
  onOpenAiTutor: (context: any) => void;
  onNextLesson: (lessonId: number) => void;
}

export const LessonPlayerPage: React.FC<LessonPlayerPageProps> = ({
  lessonId,
  onBackToCourse,
  onOpenAiTutor,
  onNextLesson,
}) => {
  const [lesson, setLesson] = useState<any | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'video' | 'reading'>('video');
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [existingCert, setExistingCert] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchLesson();
  }, [lessonId]);

  const fetchLesson = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<any>(`/lessons/${lessonId}`);
      setLesson(data);
      setIsCompleted(data.completed || false);

      // Check if user has an existing certificate for this course
      try {
        const certs = await apiRequest<Certificate[]>('/certificates');
        const match = certs.find((c) => c.course_id === data.course_id);
        if (match) setExistingCert(match);
      } catch {
        // Guests or unauthenticated might not have certs
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleComplete = async () => {
    setIsMarking(true);
    try {
      const newStatus = !isCompleted;
      await apiRequest(`/lessons/${lessonId}/progress`, {
        method: 'POST',
        body: JSON.stringify({
          lesson_id: lessonId,
          completed: newStatus,
          time_spent_secs: 600,
        }),
      });
      setIsCompleted(newStatus);
      if (newStatus) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsMarking(false);
    }
  };

  if (isLoading || !lesson) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Determine active video URL (lesson's video_url, or fallback to course's video_url)
  const videoUrl = lesson.video_url || 'https://www.youtube.com/embed/aircAruvnKk';

  // Helper to render markdown content with syntax code block styling
  const renderLessonMarkdown = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).trim().split('\n');
        const lang = lines[0].trim();
        const code = lines.slice(1).join('\n');

        return (
          <div key={index} className="my-5 rounded-xl overflow-hidden border border-slate-800 bg-slate-900 text-slate-100 font-mono text-xs sm:text-sm shadow-card">
            <div className="px-4 py-2 bg-slate-800/80 border-b border-slate-700/80 text-slate-400 text-xs flex justify-between items-center">
              <span>{lang || 'python'}</span>
              <span className="text-[11px] text-slate-500">Interactive Example</span>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed">
              <code>{code}</code>
            </pre>
          </div>
        );
      }

      const paragraphs = part.split('\n\n');
      return (
        <div key={index} className="space-y-4">
          {paragraphs.map((p, pIdx) => {
            if (p.startsWith('# ')) {
              return <h1 key={pIdx} className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-6 mb-2">{p.slice(2)}</h1>;
            }
            if (p.startsWith('## ')) {
              return <h2 key={pIdx} className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-5 mb-2">{p.slice(3)}</h2>;
            }
            if (p.startsWith('### ')) {
              return <h3 key={pIdx} className="text-lg font-bold text-slate-900 mt-4 mb-2">{p.slice(4)}</h3>;
            }
            return (
              <p key={pIdx} className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                {p}
              </p>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <button
          onClick={() => onBackToCourse(lesson.course_id)}
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>{lesson.course_title}</span>
        </button>

        <div className="flex items-center space-x-2">
          {/* Certificate Claim Modal Trigger */}
          <button
            onClick={() => setShowCertificateModal(true)}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold rounded-lg border border-amber-200 transition-colors flex items-center space-x-1"
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>{existingCert ? 'View Credential' : 'Course Certificate'}</span>
          </button>

          {/* Ask AI Context Button */}
          <button
            onClick={() => onOpenAiTutor({
              course_title: lesson.course_title,
              lesson_title: lesson.title,
              topic: lesson.module_title,
            })}
            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Ask Tutor About This Lesson</span>
          </button>
        </div>
      </div>

      {/* Lesson Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-indigo-600 mb-1">
            <span>Module: {lesson.module_title}</span>
            <span>•</span>
            <span>{lesson.duration_mins} mins</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {lesson.title}
          </h1>
        </div>

        {/* View Mode Toggle Tabs */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('video')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'video'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Video Lecture</span>
          </button>
          <button
            onClick={() => setActiveTab('reading')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'reading'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Reading & Notes</span>
          </button>
        </div>
      </div>

      {/* Embedded 16:9 Interactive Video Player */}
      {activeTab === 'video' && (
        <div className="space-y-4">
          <VideoPlayer
            videoUrl={videoUrl}
            title={`${lesson.course_title} - ${lesson.title}`}
            courseTitle={lesson.course_title}
            durationMins={lesson.duration_mins}
            onComplete={() => {
              if (!isCompleted) handleToggleComplete();
            }}
          />
        </div>
      )}

      {/* Lesson Content Container */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-subtle space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Technical Syllabus & Code Walkthrough
          </h3>
          <span className="text-xs text-slate-500">Interactive Learning Module</span>
        </div>

        {/* Lesson Body */}
        <div className="pt-2">
          {renderLessonMarkdown(lesson.content_markdown || '')}
        </div>

        {/* Completion Action Card */}
        <div className="mt-10 p-5 rounded-xl border border-indigo-100 bg-indigo-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              isCompleted ? 'bg-emerald-600 text-white' : 'bg-white text-slate-400 border border-slate-200'
            }`}>
              <Check className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 text-sm">
                {isCompleted ? 'Lesson Completed!' : 'Ready to mark this lesson completed?'}
              </h4>
              <p className="text-xs text-slate-500">
                {isCompleted ? 'Progress recorded in your adaptive matrix.' : 'This will update your skill score and syllabus progress.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleComplete}
              disabled={isMarking}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                isCompleted
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              }`}
            >
              {isCompleted ? 'Completed ✓ (Click to reset)' : 'Mark Lesson Completed'}
            </button>

            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-amber-500 hover:bg-amber-600 text-white shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Award className="w-3.5 h-3.5" />
              <span>Claim Certificate</span>
            </button>
          </div>
        </div>

        {/* Bottom Lesson Navigation */}
        <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
          {lesson.prev_lesson_id ? (
            <button
              onClick={() => onNextLesson(lesson.prev_lesson_id)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 flex items-center space-x-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Lesson</span>
            </button>
          ) : (
            <div />
          )}

          {lesson.next_lesson_id && (
            <button
              onClick={() => onNextLesson(lesson.next_lesson_id)}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <span>Next Lesson</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CertificateGeneratorModal
          courseId={lesson.course_id}
          courseTitle={lesson.course_title}
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          existingCertificate={existingCert}
          onSuccess={(cert) => setExistingCert(cert)}
        />
      )}
    </div>
  );
};
