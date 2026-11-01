import React, { useState } from 'react';
import { Terminal, Shield, User, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle, GraduationCap, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onSuccess: (user?: any) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'mentor' | 'admin'>('student');
  const [targetRole, setTargetRole] = useState('Data Scientist');
  
  // Extra flows: Forgot password
  const [isForgotPass, setIsForgotPass] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isForgotPass) {
        await new Promise((r) => setTimeout(r, 600));
        setForgotSent(true);
        setIsLoading(false);
        return;
      }

      if (isLogin) {
        const loggedUser = await login(email, password);
        onSuccess(loggedUser);
      } else {
        const newUser = await register(email, password, fullName, selectedRole, targetRole);
        onSuccess(newUser);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const autofillRole = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setError(null);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#F8FAFC]">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-card border border-slate-200 p-8">
        {/* Header Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex w-12 h-12 rounded-xl bg-indigo-600 items-center justify-center text-white mb-3 shadow-sm">
            <Terminal className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isForgotPass ? 'Reset Your Password' : isLogin ? 'Welcome Back to Synapse' : 'Create Your Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isForgotPass
              ? 'Enter your registered email to receive a password reset link'
              : isLogin
              ? 'Sign in to access your role-based curriculum, mentoring, or administration portal'
              : 'Join the Synapse adaptive learning and mentorship platform'}
          </p>
        </div>

        {/* Quick Role Autofill Pills for Login Mode */}
        {isLogin && !isForgotPass && (
          <div className="mb-5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-600 text-[11px] uppercase tracking-wider">
                Select Account Role:
              </span>
              <span className="text-[10px] text-slate-400">Autofills login</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => autofillRole('admin@synapse.edu', 'AdminPass123!')}
                className="px-2 py-1.5 bg-white hover:bg-purple-50 hover:border-purple-300 text-purple-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
              <button
                type="button"
                onClick={() => autofillRole('mentor@synapse.edu', 'MentorPass123!')}
                className="px-2 py-1.5 bg-white hover:bg-sky-50 hover:border-sky-300 text-sky-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Mentor</span>
              </button>
              <button
                type="button"
                onClick={() => autofillRole('student@synapse.edu', 'StudentPass123!')}
                className="px-2 py-1.5 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-indigo-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-all flex items-center justify-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Student</span>
              </button>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Forgot Password Success Message */}
        {forgotSent && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-lg flex items-center">
            <CheckCircle2 className="w-4 h-4 mr-2 shrink-0 text-emerald-600" />
            <span>A password reset instruction link has been dispatched to {email}.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isForgotPass && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Dr. Jordan Hayes"
                    className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Platform Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as any)}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="student">Student (Learner)</option>
                  <option value="mentor">Mentor (Faculty / Reviewer)</option>
                  <option value="admin">Admin (Course Studio & Management)</option>
                </select>
              </div>

              {selectedRole === 'student' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Career Role</label>
                  <select
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="AI Researcher">AI Researcher</option>
                  </select>
                </div>
              )}
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@synapse.edu"
                className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {!isForgotPass && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsForgotPass(true);
                      setError(null);
                    }}
                    className="text-[11px] text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
          >
            <span>
              {isForgotPass
                ? 'Send Reset Link'
                : isLogin
                ? 'Sign In to Account'
                : 'Create Account & Sign In'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer Toggle */}
        <div className="mt-6 text-center text-xs text-slate-500 space-y-2">
          {isForgotPass ? (
            <button
              onClick={() => {
                setIsForgotPass(false);
                setForgotSent(false);
                setError(null);
              }}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Back to Sign In
            </button>
          ) : (
            <div>
              {isLogin ? (
                <>
                  Need to register a new role account?{' '}
                  <button
                    onClick={() => {
                      setIsLogin(false);
                      setError(null);
                    }}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Register here
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => {
                      setIsLogin(true);
                      setError(null);
                    }}
                    className="text-indigo-600 font-semibold hover:underline"
                  >
                    Sign in here
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
