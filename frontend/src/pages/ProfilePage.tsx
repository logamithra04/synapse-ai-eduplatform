import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Briefcase, Award, CheckCircle, Shield, 
  Download, Printer, Sparkles, Bell, ExternalLink, Flame, Edit3 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/client';
import { Certificate } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || 'Aspiring Data Scientist exploring predictive modeling and machine learning.');
  const [targetRole, setTargetRole] = useState(user?.target_role || 'Data Scientist');
  const [dailyGoalMins, setDailyGoalMins] = useState(45);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Notification toggles
  const [notifStudyReminders, setNotifStudyReminders] = useState(true);
  const [notifWeeklyDigest, setNotifWeeklyDigest] = useState(true);
  const [notifAdaptiveAlerts, setNotifAdaptiveAlerts] = useState(true);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const data = await apiRequest<Certificate[]>('/certificates');
      setCertificates(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await apiRequest('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          full_name: fullName,
          bio,
          target_role: targetRole,
          daily_goal_mins: dailyGoalMins,
        }),
      });
      await refreshUser();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Profile Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
        <img
          src={user?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'}
          alt={user?.full_name}
          className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-100 shadow-sm"
        />

        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-bold text-slate-900">{user?.full_name}</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {user?.target_role || 'Data Scientist'} Track
            </span>
          </div>
          <p className="text-xs text-slate-500">{user?.email}</p>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed pt-1">
            {user?.bio || 'Committed to mastering full-stack predictive modeling and statistical learning.'}
          </p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-2 text-xs text-slate-500">
            <span className="flex items-center text-amber-700 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              <Flame className="w-4 h-4 mr-1 text-amber-500 fill-amber-500" />
              {user?.streak_days} Day Learning Streak
            </span>
            <span className="flex items-center">
              <Award className="w-4 h-4 mr-1 text-indigo-600" />
              {certificates.length} Verified Certificates
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Profile Form & Notification Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Edit Profile Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-6">
            <h3 className="font-bold text-slate-900 text-lg flex items-center">
              <Edit3 className="w-4 h-4 mr-2 text-indigo-600" />
              Academic & Career Settings
            </h3>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                Profile preferences saved successfully.
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Used on official completion certificates.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Data Scientist">Full-Stack Data Scientist</option>
                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="Data Analyst">Data Analyst & BI Specialist</option>
                    <option value="AI Researcher">AI & Deep Learning Researcher</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Professional Bio</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Daily Learning Goal (Minutes)
                </label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  value={dailyGoalMins}
                  onChange={(e) => setDailyGoalMins(parseInt(e.target.value))}
                  className="w-32 text-xs sm:text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>

          {/* Notification Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-4">
            <h3 className="font-bold text-slate-900 text-lg flex items-center">
              <Bell className="w-4 h-4 mr-2 text-indigo-600" />
              Notification & Study Alerts
            </h3>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Daily Study Streak Reminders</span>
                  <span className="text-slate-500 text-xs">Receive gentle notifications to protect your streak.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifStudyReminders}
                  onChange={(e) => setNotifStudyReminders(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Adaptive Revision Targeting</span>
                  <span className="text-slate-500 text-xs">Alert me when the Bayesian engine flags weak topics for review.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifAdaptiveAlerts}
                  onChange={(e) => setNotifAdaptiveAlerts(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800 block">Weekly Progress Digest</span>
                  <span className="text-slate-500 text-xs">Summarize hours logged, exercises solved, and new badges unlocked.</span>
                </div>
                <input
                  type="checkbox"
                  checked={notifWeeklyDigest}
                  onChange={(e) => setNotifWeeklyDigest(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Verified Certificates */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base flex items-center">
                <Award className="w-4 h-4 mr-1.5 text-indigo-600" />
                Verified Certificates
              </h3>
              <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
                Cryptographic
              </span>
            </div>

            <div className="space-y-3">
              {certificates.map((cert, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedCert(cert)}
                  className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/60 hover:bg-slate-50 transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                      {cert.certificate_code}
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {cert.grade}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                    {cert.course_title}
                  </h4>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Issued {cert.issue_date}</span>
                    <span className="text-indigo-600 font-medium group-hover:underline">View Certificate →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Official Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 relative animate-fade-in">
            {/* Certificate Canvas / Frame */}
            <div className="border-8 border-double border-indigo-950 p-8 rounded-2xl bg-gradient-to-b from-white to-slate-50 text-center space-y-4 relative">
              <div className="w-12 h-12 rounded-full bg-indigo-900 text-white flex items-center justify-center mx-auto shadow-md">
                <Award className="w-6 h-6 text-amber-300" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-900 block font-mono">
                  SYNAPSE ACADEMIC CREDENTIAL
                </span>
                <h3 className="text-2xl font-serif font-black text-slate-900 mt-1">
                  Certificate of Competency
                </h3>
              </div>

              <p className="text-xs text-slate-500 italic">This is to officially certify that</p>
              <div className="text-2xl font-bold text-indigo-950 border-b border-slate-300 pb-1 max-w-sm mx-auto">
                {selectedCert.student_name}
              </div>

              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                has successfully mastered all curriculum modules, solved in-browser coding test fixtures, and passed the final technical assessment with honors in
              </p>

              <h4 className="text-lg font-bold text-indigo-600">
                {selectedCert.course_title}
              </h4>

              <div className="pt-4 flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-200 font-mono">
                <div>
                  <span className="block font-semibold text-slate-600">Issued: {selectedCert.issue_date}</span>
                  <span>Credential ID: {selectedCert.certificate_code}</span>
                </div>
                <div className="text-right">
                  <span className="block font-semibold text-slate-600">Honors: {selectedCert.grade}</span>
                  <span className="text-slate-400">Hash: {selectedCert.verification_hash.slice(0, 12)}...</span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center space-x-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Certificate</span>
              </button>

              <button
                onClick={() => setSelectedCert(null)}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition-all shadow-sm"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
