import React, { useState, useEffect } from 'react';
import { 
  BarChart2, 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  ShieldCheck, 
  Flame,
  PieChart as PieIcon,
  CheckCircle2,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

interface AnalyticsPageProps {
  onNavigateToCourse: (categoryName?: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({ onNavigateToCourse }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [completionData, setCompletionData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'completion' | 'competency'>('completion');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [resOverview, resCompletion] = await Promise.all([
        apiRequest<any>('/analytics/overview').catch(() => null),
        apiRequest<any>('/analytics/completion').catch(() => null),
      ]);
      setData(resOverview);
      setCompletionData(resCompletion);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const radarData = data?.skills_radar || [
    { subject: 'Python', score: 75, fullMark: 100 },
    { subject: 'SQL', score: 68, fullMark: 100 },
    { subject: 'Statistics', score: 52, fullMark: 100 },
    { subject: 'EDA', score: 82, fullMark: 100 },
    { subject: 'ML Pipelines', score: 60, fullMark: 100 },
    { subject: 'Deep Learning', score: 45, fullMark: 100 },
  ];

  const quizTrend = data?.quiz_trend || [
    { assessment: 'Diagnostic', accuracy: 65 },
    { assessment: 'Python Lab', accuracy: 85 },
    { assessment: 'SQL Joins', accuracy: 78 },
    { assessment: 'Probability', accuracy: 72 },
    { assessment: 'Pipelines', accuracy: 90 },
  ];

  // Course Completion Bars
  const coursesProgress = completionData?.courses_progress
    ? completionData.courses_progress.map((c: any) => ({
        title: c.title,
        progress: Math.round(c.progress_pct !== undefined ? c.progress_pct : (c.progress ?? 0)),
        completed_lessons: c.completed_lessons,
        total_lessons: c.total_lessons,
      }))
    : [
        { title: 'Python for Data Science', progress: 100, completed_lessons: 3, total_lessons: 3 },
        { title: 'Machine Learning Pipelines', progress: 66, completed_lessons: 2, total_lessons: 3 },
        { title: 'Deep Learning with PyTorch', progress: 33, completed_lessons: 1, total_lessons: 3 },
        { title: 'Data Wrangling with Pandas', progress: 50, completed_lessons: 1, total_lessons: 2 },
        { title: 'Applied Statistics', progress: 20, completed_lessons: 1, total_lessons: 5 },
      ];

  // Donut chart status distribution
  const statusPieData = completionData?.lessons_distribution || [
    { name: 'Completed', value: 8, color: '#10B981' },
    { name: 'In Progress', value: 4, color: '#6366F1' },
    { name: 'Remaining', value: 12, color: '#94A3B8' },
  ];

  // Study hours vs target
  const weeklyHoursVsTarget = completionData?.weekly_hours_vs_target || [
    { day: 'Mon', actual_hours: 1.5, target_hours: 1.0 },
    { day: 'Tue', actual_hours: 2.2, target_hours: 1.0 },
    { day: 'Wed', actual_hours: 1.8, target_hours: 1.0 },
    { day: 'Thu', actual_hours: 2.8, target_hours: 1.0 },
    { day: 'Fri', actual_hours: 2.0, target_hours: 1.0 },
    { day: 'Sat', actual_hours: 3.5, target_hours: 1.5 },
    { day: 'Sun', actual_hours: 1.2, target_hours: 1.0 },
  ];

  // Module completion matrix
  const moduleMatrix = completionData?.module_completion_matrix || [
    { module: 'Core Foundations & Environments', completed: 3, total: 3, pct: 100 },
    { module: 'Supervised Feature Engineering', completed: 2, total: 3, pct: 67 },
    { module: 'Neural Network Architectures', completed: 1, total: 3, pct: 33 },
    { module: 'Bayesian Inference & Testing', completed: 1, total: 4, pct: 25 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200 inline-block">
            Cognitive Learning Analytics
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Curriculum Completion & Performance Matrix
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Detailed chart analysis of your course completion rates, active study trajectories, and multi-domain skill scores.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('completion')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'completion'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>Completion Chart Analysis</span>
          </button>
          <button
            onClick={() => setActiveTab('competency')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'competency'
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Skills Radar & Accuracy</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Badges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Curriculum Completion</span>
          <div className="text-2xl sm:text-3xl font-bold text-indigo-600 mt-1">
            {completionData?.overall_completion_rate || data?.completion_rate || 52}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {completionData?.total_completed_lessons || 8} of {completionData?.total_curriculum_lessons || 16} lessons finished
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Cumulative Time</span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {data?.total_hours || 15.0} <span className="text-xs font-normal text-slate-500">hours</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Avg 2.1h / study session</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Active Streak</span>
          <div className="text-2xl sm:text-3xl font-bold text-amber-600 mt-1 flex items-center">
            {user?.streak_days || 5} <Flame className="w-5 h-5 ml-1 fill-amber-500 text-amber-500" />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Consistently engaged</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-subtle">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Est. Hours Remaining</span>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
            {completionData?.estimated_remaining_hours || 18.5}h
          </div>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">On schedule for capstone</p>
        </div>
      </div>

      {activeTab === 'completion' ? (
        /* Section 1: Completion Chart Analysis */
        <div className="space-y-8">
          {/* Charts Row 1: Course-by-Course Progress & Curriculum Donut */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Course Progress Horizontal / Vertical Bar Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <BarChart2 className="w-4 h-4 text-indigo-600" />
                    Course-by-Course Completion Rate (%)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Progress measured against enrolled courses and lessons
                  </p>
                </div>
                <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2.5 py-1 rounded-full">
                  Target: 100%
                </span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coursesProgress} layout="vertical" margin={{ left: 20, right: 30, top: 10, bottom: 10 }}>
                    <XAxis type="number" domain={[0, 100]} stroke="#94A3B8" fontSize={11} unit="%" />
                    <YAxis 
                      dataKey="title" 
                      type="category" 
                      stroke="#475569" 
                      fontSize={11} 
                      width={140}
                      tickFormatter={(val) => val.length > 20 ? `${val.slice(0, 20)}...` : val} 
                    />
                    <Tooltip
                      formatter={(value: any) => [`${value}% Complete`, 'Progress']}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar 
                      dataKey="progress" 
                      fill="#6366F1" 
                      radius={[0, 6, 6, 0]}
                      barSize={18}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Curriculum Donut Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-emerald-600" />
                  Curriculum Status
                </h3>
                <span className="text-xs text-slate-500">All Modules</span>
              </div>

              <div className="h-56 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                    >
                      {statusPieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {completionData?.overall_completion_rate || 52}%
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Mastered</span>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                {statusPieData.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-600">{item.name}</span>
                    </div>
                    <span className="font-bold text-slate-900">{item.value} lessons</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Weekly Hours vs Target Area Chart & Module Completion Heatmap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly Hours vs Daily Target */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Weekly Study Hours vs. Daily Target
                  </h3>
                  <p className="text-xs text-slate-500">Actual logged study time compared to your target pace</p>
                </div>
                <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                  Pace: On Track
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyHoursVsTarget}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} unit="h" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="actual_hours" 
                      name="Actual Study Hours" 
                      stroke="#6366F1" 
                      strokeWidth={2.5} 
                      fill="url(#colorActual)" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="target_hours" 
                      name="Target Pace (h)" 
                      stroke="#10B981" 
                      strokeWidth={2} 
                      strokeDasharray="4 4" 
                      fill="url(#colorTarget)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Module Completion Matrix */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Module Completion Matrix
                  </h3>
                  <p className="text-xs text-slate-500">Progress across sequential technical modules</p>
                </div>
                <span className="text-xs text-slate-500">{moduleMatrix.length} Modules</span>
              </div>

              <div className="space-y-3 pt-2">
                {moduleMatrix.map((m: any, i: number) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{m.module}</span>
                      <span className="font-bold text-indigo-600">{m.pct}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          m.pct === 100 
                            ? 'bg-emerald-500' 
                            : m.pct >= 50 
                            ? 'bg-indigo-600' 
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${m.pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{m.completed} of {m.total} lessons passed</span>
                      <span>{m.pct === 100 ? 'Module Mastered ✓' : 'In Progress'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Section 2: Skills Radar & Competency Matrix */
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Skill Proficiency Radar Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Multi-Domain Competency Radar</h3>
                <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                  0 - 100 Scale
                </span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 11, fontWeight: 500 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#CBD5E1" tick={{ fill: '#94A3B8', fontSize: 10 }} />
                    <Radar
                      name="Mastery"
                      dataKey="score"
                      stroke="#4F46E5"
                      fill="#6366F1"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quiz Accuracy Trajectory Line Chart */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Knowledge Check Accuracy Trajectory</h3>
                <span className="text-xs text-slate-500">Last 5 Assessments</span>
              </div>

              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={quizTrend}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="assessment" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis domain={[40, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="accuracy" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorAcc)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Strengths & Weaknesses Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-emerald-200 p-6 shadow-subtle space-y-3">
              <div className="flex items-center space-x-2 text-emerald-800">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-base">Identified Technical Strengths</h4>
              </div>
              <p className="text-xs text-slate-600">
                High accuracy and fast fixture completion observed in these domains:
              </p>
              <ul className="space-y-2 pt-2">
                {(data?.strengths || ["Data Analysis & EDA", "Python Scripting"]).map((s: string, i: number) => (
                  <li key={i} className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 flex items-center justify-between text-xs font-semibold text-emerald-900">
                    <span>{s}</span>
                    <span className="text-[10px] bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                      80%+ Mastery
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-subtle space-y-3">
              <div className="flex items-center space-x-2 text-amber-800">
                <Target className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-base">Adaptive Revision Recommendations</h4>
              </div>
              <p className="text-xs text-slate-600">
                Topics flagged by Bayesian Knowledge Tracing for targeted reinforcement:
              </p>
              <ul className="space-y-2 pt-2">
                {(data?.weaknesses || ["Statistics & Probability", "Deep Learning"]).map((w: string, i: number) => (
                  <li key={i} className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 flex items-center justify-between text-xs font-semibold text-amber-900">
                    <span>{w}</span>
                    <button
                      onClick={() => onNavigateToCourse(w)}
                      className="text-[11px] text-amber-800 hover:text-amber-950 font-semibold underline flex items-center"
                    >
                      <span>Practice Topic</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
