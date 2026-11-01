import React, { useState, useEffect } from 'react';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Filter, 
  MessageSquare, 
  Award, 
  BookOpen, 
  TrendingUp, 
  GraduationCap, 
  Send, 
  CheckSquare, 
  X,
  FileCheck,
  Flame,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { MentorStudent } from '../types';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';

export const MentorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<MentorStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'At Risk' | 'On Track' | 'Top Performer'>('All');
  
  // Active Selected Student for Mentoring Drawer
  const [selectedStudent, setSelectedStudent] = useState<MentorStudent | null>(null);
  const [feedbackNotes, setFeedbackNotes] = useState('');
  const [actionItem, setActionItem] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Quick Capstone Review state
  const [reviewScore, setReviewScore] = useState(90);
  const [reviewNotes, setReviewNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest<{ students: MentorStudent[]; count: number }>('/mentor/students');
      setStudents(res.students || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load institutional student roster.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !feedbackNotes.trim()) return;

    try {
      setSubmittingFeedback(true);
      await apiRequest(`/mentor/students/${selectedStudent.id}/feedback`, {
        method: 'POST',
        body: JSON.stringify({
          notes: feedbackNotes.trim(),
          action_required: actionItem.trim() || undefined,
          recommendation: actionItem.trim() || undefined,
        }),
      });

      setFeedbackSuccess(true);
      setFeedbackNotes('');
      setActionItem('');
      setTimeout(() => setFeedbackSuccess(false), 3000);
      fetchStudents(); // Refresh data
    } catch (err: any) {
      alert(`Error submitting feedback: ${err.message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleReviewSubmission = async (status: 'approved' | 'changes_requested') => {
    if (!selectedStudent) return;
    try {
      setSubmittingReview(true);
      await apiRequest(`/mentor/submissions/${selectedStudent.id}/review`, {
        method: 'POST',
        body: JSON.stringify({
          score: reviewScore,
          review_notes: reviewNotes.trim() || 'Thorough assessment completed by academic mentor.',
          status,
        }),
      });
      setReviewSuccess(true);
      setReviewNotes('');
      setTimeout(() => setReviewSuccess(false), 3000);
      fetchStudents();
    } catch (err: any) {
      alert(`Error reviewing submission: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Filtered Students
  const filteredStudents = students.filter(student => {
    const matchesSearch = 
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.target_role.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || student.risk_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Aggregated Stats
  const totalStudents = students.length;
  const atRiskCount = students.filter(s => s.risk_status === 'At Risk').length;
  const onTrackCount = students.filter(s => s.risk_status === 'On Track').length;
  const topPerformerCount = students.filter(s => s.risk_status === 'Top Performer').length;
  const avgCompletion = totalStudents 
    ? Math.round(students.reduce((acc, s) => acc + s.completion_pct, 0) / totalStudents)
    : 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Mentor Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 flex-shrink-0">
                <GraduationCap className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-widest font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                    Institutional Mentoring Portal
                  </span>
                  <span className="text-xs text-slate-400">Synapse Data Academy</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Student Cohort Oversight & Mentorship
                </h1>
                <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                  Monitor individual student trajectory, curriculum completion, and assessment scores.
                  Intervene with personalized 1-on-1 guidance to keep learners on track for industry placement.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                {user?.full_name?.charAt(0) || 'M'}
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  {user?.full_name || 'Dr. Elena Vance'}
                  <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
                </div>
                <div className="text-[11px] text-slate-400">Lead Faculty & Research Mentor</div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Cohort Roster</span>
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{totalStudents}</div>
            <div className="text-[11px] text-slate-400 mt-1">Supervised active learners</div>
          </div>

          <div className="bg-slate-900 border border-amber-500/20 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-400 font-medium">Needs Attention</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{atRiskCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Requires mentor nudge</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-emerald-400 font-medium">On Track</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{onTrackCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">Steady module progress</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-sky-400 font-medium">Top Performers</span>
              <Sparkles className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-sky-400">{topPerformerCount}</div>
            <div className="text-[11px] text-slate-400 mt-1">&gt;85% completion & quizzes</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Avg Completion</span>
              <TrendingUp className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white">{avgCompletion}%</div>
            <div className="text-[11px] text-slate-400 mt-1">Across institutional tracks</div>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, email, or track..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {(['All', 'At Risk', 'On Track', 'Top Performer'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                {tab === 'At Risk' ? '⚠️ At Risk' : tab === 'Top Performer' ? '🌟 Top Performers' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Institutional Student Roster ({filteredStudents.length})
            </h3>
            <span className="text-xs text-slate-400">Click student to mentor or review</span>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Loading student roster and academic records...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No students match the selected filter criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Student</th>
                    <th className="py-3.5 px-6">Target Track</th>
                    <th className="py-3.5 px-6">Course Progress</th>
                    <th className="py-3.5 px-6">Quiz Avg</th>
                    <th className="py-3.5 px-6">Risk Status</th>
                    <th className="py-3.5 px-6">Streak</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map((student) => {
                    return (
                      <tr
                        key={student.id}
                        onClick={() => setSelectedStudent(student)}
                        className={`hover:bg-slate-800/40 cursor-pointer transition-colors ${
                          selectedStudent?.id === student.id ? 'bg-indigo-500/10' : ''
                        }`}
                      >
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-xs">
                              {student.full_name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-white">{student.full_name}</div>
                              <div className="text-xs text-slate-400">{student.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
                            {student.target_role || 'Data Scientist'}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="w-36 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-slate-400">{student.completed_lessons} lessons</span>
                              <span className="font-bold text-white">{student.completion_pct}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  student.completion_pct > 75 
                                    ? 'bg-emerald-400' 
                                    : student.completion_pct > 35 
                                    ? 'bg-indigo-400' 
                                    : 'bg-amber-400'
                                }`}
                                style={{ width: `${student.completion_pct}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <span className={`text-xs font-bold ${
                            student.avg_quiz_score >= 85 ? 'text-emerald-400' :
                            student.avg_quiz_score >= 70 ? 'text-sky-400' : 'text-amber-400'
                          }`}>
                            {student.avg_quiz_score}%
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                            student.risk_status === 'At Risk'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : student.risk_status === 'Top Performer'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-sky-500/10 text-sky-400 border border-sky-500/20'
                          }`}>
                            {student.risk_status === 'At Risk' && <AlertTriangle className="w-3 h-3" />}
                            {student.risk_status === 'Top Performer' && <Sparkles className="w-3 h-3" />}
                            {student.risk_status === 'On Track' && <CheckCircle2 className="w-3 h-3" />}
                            {student.risk_status}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-xs text-orange-400 font-semibold">
                            <Flame className="w-3.5 h-3.5 fill-orange-400" />
                            {student.streak_days}d
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStudent(student);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/20 transition-colors inline-flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Mentor
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Slide-over Mentoring & Feedback Drawer */}
        {selectedStudent && (
          <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
              
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-white font-bold text-lg">
                    {selectedStudent.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedStudent.full_name}</h3>
                    <p className="text-xs text-slate-400">{selectedStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Student Overview Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Track & Level</div>
                  <div className="text-xs font-bold text-white mt-1">{selectedStudent.target_role}</div>
                  <div className="text-[10px] text-indigo-400 uppercase font-semibold">{selectedStudent.current_level}</div>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                  <div className="text-[11px] text-slate-400">Curriculum Progress</div>
                  <div className="text-xs font-bold text-emerald-400 mt-1">{selectedStudent.completion_pct}% Complete</div>
                  <div className="text-[10px] text-slate-400">{selectedStudent.completed_lessons} lessons finished</div>
                </div>
              </div>

              {/* Latest Status Pill */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Assessment Health</span>
                  <span className="text-sm font-bold text-white">Quiz Mastery: {selectedStudent.avg_quiz_score}%</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  selectedStudent.risk_status === 'At Risk'
                    ? 'bg-amber-500/20 text-amber-300'
                    : selectedStudent.risk_status === 'Top Performer'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-sky-500/20 text-sky-300'
                }`}>
                  {selectedStudent.risk_status}
                </span>
              </div>

              {/* Section 1: Send 1-on-1 Guidance & Academic Interventions */}
              <form onSubmit={handleSendFeedback} className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-400" />
                  <h4 className="text-sm font-bold text-white">Provide 1-on-1 Mentoring Intervention</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Write direct guidance notes visible to the student in their personalized learning portal.
                </p>

                {feedbackSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Feedback transmitted directly to student dashboard.
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Guidance & Feedback Notes</label>
                  <textarea
                    rows={3}
                    required
                    value={feedbackNotes}
                    onChange={(e) => setFeedbackNotes(e.target.value)}
                    placeholder="e.g. Excellent progress on exploratory data analysis! Revisit Module 3 on Ridge Regularization before attempting the Capstone."
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Required Next Action / Recommendation</label>
                  <input
                    type="text"
                    value={actionItem}
                    onChange={(e) => setActionItem(e.target.value)}
                    placeholder="e.g. Complete Hypothesis Testing Quiz by Friday"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingFeedback ? 'Transmitting Notes...' : 'Send Mentorship Feedback'}
                </button>
              </form>

              {/* Section 2: Review Capstone Project Submission */}
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">Grade Capstone Submission</h4>
                </div>
                <p className="text-xs text-slate-400">
                  Evaluate applied Jupyter notebooks, model accuracy, and business metrics for this student.
                </p>

                {reviewSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckSquare className="w-4 h-4" /> Capstone review recorded and certificate unlocked.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">Score (0-100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={reviewScore}
                      onChange={(e) => setReviewScore(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 font-semibold block mb-1">Status Recommendation</label>
                    <div className="text-xs text-slate-400 pt-2">
                      {reviewScore >= 70 ? 'Eligible for Certificate' : 'Revision Required'}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-semibold">Assessment Evaluation Notes</label>
                  <textarea
                    rows={2}
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="e.g. Robust cross-validation setup and clear visualization of feature importances."
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleReviewSubmission('approved')}
                    disabled={submittingReview}
                    className="py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approve Capstone
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReviewSubmission('changes_requested')}
                    disabled={submittingReview}
                    className="py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Request Revisions
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
