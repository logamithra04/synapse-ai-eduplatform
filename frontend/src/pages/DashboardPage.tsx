import React, { useState, useEffect } from 'react';
import { 
  Flame, Clock, BookOpen, CheckCircle, ArrowRight, Play, 
  Sparkles, Award, BarChart2, Calendar, Target, AlertCircle, RefreshCw 
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { Recommendation } from '../types';

interface DashboardPageProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    courses_enrolled: 3,
    total_learning_hours: 14.5,
    completed_lessons: 12,
    overall_completion_rate: 42.0,
  });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [userData, recData, analData] = await Promise.all([
        apiRequest<any>('/auth/me'),
        apiRequest<Recommendation[]>('/adaptive/recommendations'),
        apiRequest<any>('/analytics/overview'),
      ]);

      if (userData?.stats) setStats(userData.stats);
      if (recData) setRecommendations(recData);
      if (analData) setAnalytics(analData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const weeklyData = analytics?.weekly_hours || [
    { day: 'Mon', hours: 1.5 },
    { day: 'Tue', hours: 2.2 },
    { day: 'Wed', hours: 1.8 },
    { day: 'Thu', hours: 2.8 },
    { day: 'Fri', hours: 2.0 },
    { day: 'Sat', hours: 3.5 },
    { day: 'Sun', hours: 1.2 },
  ];

  const badges = [
    { title: 'First Step', desc: 'Started Data Science journey', icon: 'Compass', unlocked: true },
    { title: 'Diagnostic Master', desc: 'Completed skill assessment', icon: 'Brain', unlocked: user?.diagnostic_completed },
    { title: 'Code Artisan', desc: 'Passed in-browser test fixtures', icon: 'Code', unlocked: true },
    { title: 'Quiz Whiz', desc: 'Scored 90%+ in ML assessment', icon: 'Award', unlocked: true },
    { title: 'Consistent Learner', desc: 'Maintained 5-day study streak', icon: 'Flame', unlocked: (user?.streak_days || 0) >= 5 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Welcome Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {user?.target_role || 'Data Scientist'} Track
            </span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
              Level: {user?.current_level || 'Intermediate'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.full_name || 'Student'}!
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-xl">
            You're on track to achieve your weekly 3.5h study goal. Today's adaptive focus centers on feature engineering and regularized regression.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!user?.diagnostic_completed && (
            <button
              onClick={() => onNavigate('diagnostic')}
              className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold rounded-xl border border-indigo-200 transition-colors flex items-center space-x-1.5"
            >
              <Target className="w-4 h-4 text-indigo-600" />
              <span>Take Diagnostic Test</span>
            </button>
          )}

          <button
            onClick={() => onNavigate('courses')}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all flex items-center space-x-1.5"
          >
            <span>Browse Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4 Core Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Study Streak</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-amber-500" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {user?.streak_days || 1} <span className="text-xs font-normal text-slate-500">days</span>
          </div>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Keep it up! Active today</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Hours</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {stats.total_learning_hours || 14.5} <span className="text-xs font-normal text-slate-500">hrs</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Logged across courses & labs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Enrolled Courses</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {stats.courses_enrolled || 3}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">In active progress</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Curriculum Progress</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
            {stats.overall_completion_rate || 42}%
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">{stats.completed_lessons || 12} lessons completed</p>
        </div>
      </div>

      {/* Main Grid: Continue Learning & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols wide): Continue Learning + Weekly Chart */}
        <div className="lg:col-span-2 space-y-8">
          {/* Continue Learning Active Course Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <Play className="w-4 h-4 mr-2 text-indigo-600 fill-indigo-600" />
                Continue Learning
              </h3>
              <span className="text-xs text-slate-500 font-medium">Last accessed: Today</span>
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Machine Learning Track
                </span>
                <h4 className="font-bold text-slate-900 text-lg">Applied Machine Learning with Scikit-Learn</h4>
                <p className="text-xs text-slate-600">Current Lesson: Building Leakage-Free Scikit-Learn Pipelines</p>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-2">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '45%' }} />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                  <span>Module 2 of 4</span>
                  <span>45% Completed</span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('lesson', { lessonId: 5 })}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all shrink-0 flex items-center space-x-1.5"
              >
                <span>Resume Lesson</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI-Powered Adaptive Recommendations */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">
                  AI Adaptive Recommendations
                </h3>
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                Bayesian Knowledge Model
              </span>
            </div>

            <div className="space-y-3">
              {recommendations.length > 0 ? (
                recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            rec.recommendation_type === 'revision'
                              ? 'bg-amber-100 text-amber-800'
                              : rec.recommendation_type === 'enrichment'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-indigo-100 text-indigo-800'
                          }`}
                        >
                          {rec.recommendation_type.replace('_', ' ')}
                        </span>
                        <h4 className="font-semibold text-slate-900 text-sm">{rec.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{rec.reason}</p>
                    </div>

                    <button
                      onClick={() => onNavigate('courses', { courseId: rec.course_id })}
                      className="px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-lg text-xs border border-slate-200 transition-colors shrink-0 flex items-center space-x-1"
                    >
                      <span>Start Now</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                  Complete the diagnostic assessment or a quiz to calibrate dynamic recommendations.
                </div>
              )}
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <BarChart2 className="w-4 h-4 mr-2 text-indigo-600" />
                Weekly Learning Consistency
              </h3>
              <span className="text-xs text-slate-500 font-medium">Goal: 3.5h / week</span>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} unit="h" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    cursor={{ fill: 'rgba(224, 231, 255, 0.4)' }}
                  />
                  <Bar dataKey="hours" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col wide): Upcoming Assessments & Badges */}
        <div className="space-y-8">
          {/* Upcoming Assessments */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
              Scheduled Knowledge Checks
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Module 2 Exam</span>
                    <h5 className="font-semibold text-slate-900 text-xs mt-0.5">Scikit-Learn Cross-Validation</h5>
                  </div>
                  <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-semibold">
                    15 mins
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>8 Questions</span>
                  <button
                    onClick={() => onNavigate('quiz', { quizId: 1 })}
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Start Test →
                  </button>
                </div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Coding Check</span>
                    <h5 className="font-semibold text-slate-900 text-xs mt-0.5">Pandas Vectorized Aggregation</h5>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
                    Interactive
                  </span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                  <span>2 Test Fixtures</span>
                  <button
                    onClick={() => onNavigate('coding-lab')}
                    className="font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Open Lab →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <Award className="w-4 h-4 mr-2 text-indigo-600" />
                Earned Achievements
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {badges.filter(b => b.unlocked).length} / {badges.length}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {badges.map((b, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center space-x-3 transition-all ${
                    b.unlocked
                      ? 'bg-slate-50 border-slate-200 text-slate-900'
                      : 'bg-slate-50/50 border-slate-100 opacity-40 text-slate-400'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    b.unlocked ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-200 text-slate-400'
                  }`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <h5 className="font-semibold text-xs truncate">{b.title}</h5>
                    <p className="text-[11px] text-slate-500 truncate">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 7 Practical Projects Quick Launcher */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-elevated space-y-3">
            <span className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Portfolio Capstones</span>
            <h4 className="font-bold text-lg leading-tight">7 Industry Data Science Projects</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Build end-to-end models for House Prices, Credit Fraud, and Customer Segmentation with automated rubric evaluations.
            </p>
            <button
              onClick={() => onNavigate('projects')}
              className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs transition-colors"
            >
              Open Projects Library
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
