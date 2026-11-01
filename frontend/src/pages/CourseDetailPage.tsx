import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, Star, Users, CheckCircle, FileText, 
  Download, PlayCircle, BookOpen, Award, ShieldCheck, ArrowRight,
  Video, Sparkles
} from 'lucide-react';
import { Course, Certificate } from '../types';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { CertificateGeneratorModal } from '../components/certificate/CertificateGeneratorModal';

interface CourseDetailPageProps {
  courseId: number;
  onBack: () => void;
  onStartLesson: (lessonId: number) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({
  courseId,
  onBack,
  onStartLesson,
}) => {
  const { user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [existingCert, setExistingCert] = useState<Certificate | null>(null);

  useEffect(() => {
    fetchCourse();
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      const data = await apiRequest<Course>(`/courses/${courseId}`);
      setCourse(data);

      try {
        const certs = await apiRequest<Certificate[]>('/certificates');
        const match = certs.find((c) => c.course_id === courseId);
        if (match) setExistingCert(match);
      } catch {
        // Guest user
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      await apiRequest(`/courses/${courseId}/enroll`, { method: 'POST' });
      setIsEnrolled(true);
      if (course?.modules?.[0]?.lessons?.[0]) {
        onStartLesson(course.modules[0].lessons[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !course) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const firstLessonId = course.modules?.[0]?.lessons?.[0]?.id;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Course Catalog
      </button>

      {/* Main Course Header Hero */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-subtle space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {course.category_name}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
            {course.difficulty} Level
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {course.title}
        </h1>

        <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
          {course.summary}
        </p>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
            <span>{course.estimated_hours} Hours Self-Paced</span>
          </div>
          <div className="flex items-center">
            <Star className="w-4 h-4 mr-1.5 text-amber-500 fill-amber-500" />
            <span>{course.rating} / 5.0 (480 reviews)</span>
          </div>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1.5 text-slate-400" />
            <span>{course.students_enrolled} Active Learners</span>
          </div>
          <div className="flex items-center text-indigo-600 font-semibold">
            <Award className="w-4 h-4 mr-1.5" />
            <span>Verifiable Certificate Included</span>
          </div>
        </div>

        {/* CTAs */}
        <div className="pt-2 flex flex-wrap items-center gap-4">
          <button
            onClick={handleEnroll}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all flex items-center space-x-2 text-sm"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{isEnrolled ? 'Resume Course' : 'Enroll & Start Learning'}</span>
          </button>

          <button
            onClick={() => setShowCertificateModal(true)}
            className="px-5 py-3 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded-xl border border-amber-200 transition-all flex items-center space-x-2 text-sm"
          >
            <Award className="w-4 h-4 text-amber-600" />
            <span>{existingCert ? 'View Official Certificate' : 'Issue Certificate of Excellence'}</span>
          </button>
        </div>
      </div>

      {/* Course Video Preview Section */}
      {course.video_url && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-lg">Course Video Lecture & Curriculum Preview</h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              Interactive 16:9 Player
            </span>
          </div>

          <VideoPlayer
            videoUrl={course.video_url}
            title={course.title}
            courseTitle={course.title}
            durationMins={Math.round(course.estimated_hours * 6)}
            onComplete={() => {}}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols wide): Objectives & Syllabus */}
        <div className="lg:col-span-2 space-y-8">
          {/* Learning Objectives */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-4">
            <h3 className="font-bold text-slate-900 text-lg">What You Will Master</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {course.learning_objectives?.map((obj, i) => (
                <div key={i} className="flex items-start space-x-2 text-xs sm:text-sm text-slate-700">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Course Syllabus */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Curriculum & Interactive Modules</h3>
              <span className="text-xs text-slate-500">{course.modules?.length || 0} Modules</span>
            </div>

            <div className="space-y-4 pt-2">
              {course.modules?.map((mod, modIdx) => (
                <div key={mod.id} className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 font-semibold text-slate-800 text-sm flex items-center justify-between">
                    <span>Module {modIdx + 1}: {mod.title}</span>
                    <span className="text-xs text-slate-500">{mod.lessons.length} lessons</span>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {mod.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        onClick={() => onStartLesson(lesson.id)}
                        className="px-4 py-3 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <div className="flex items-center space-x-3">
                          <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                          <span className="text-xs sm:text-sm text-slate-700 font-medium group-hover:text-slate-900">
                            {modIdx + 1}.{lIdx + 1} {lesson.title}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-slate-400">
                          <span>{lesson.duration_mins} mins</span>
                          <span className="capitalize px-1.5 py-0.5 bg-slate-100 rounded text-[10px]">
                            {lesson.lesson_type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide): Instructor & Downloadables */}
        <div className="space-y-8">
          {/* Instructor Card */}
          {course.instructor && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Lead Instructor</span>
              <div className="flex items-center space-x-3">
                <img
                  src={course.instructor.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80'}
                  alt={course.instructor.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{course.instructor.name}</h4>
                  <p className="text-[11px] text-slate-500">{course.instructor.title}</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {course.instructor.bio}
              </p>
            </div>
          )}

          {/* Downloadable Resources */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Course Materials</span>
            <div className="space-y-2">
              {course.downloadable_resources?.map((res, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-indigo-300 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <div>
                      <p className="font-semibold text-slate-800">{res.name}</p>
                      <span className="text-[10px] text-slate-400">{res.size}</span>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-indigo-600 p-1">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <CertificateGeneratorModal
          courseId={course.id}
          courseTitle={course.title}
          isOpen={showCertificateModal}
          onClose={() => setShowCertificateModal(false)}
          existingCertificate={existingCert}
          onSuccess={(cert) => setExistingCert(cert)}
        />
      )}
    </div>
  );
};
