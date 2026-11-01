import React, { useState } from 'react';
import { Terminal, Shield, User, Lock, Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  onSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
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
        // Simulated password reset
        await new Promise((r) => setTimeout(r, 600));
        setForgotSent(true);
        setIsLoading(false);
        return;
      }

      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
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
            {isForgotPass ? 'Reset Your Password' : 'Welcome Back to Synapse'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isForgotPass
              ? 'Enter your administrator email to receive a password reset link'
              : 'Sign in with your Administrator account to access the platform'}
          </p>
        </div>

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
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@synapse.edu"
                className="w-full text-sm pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {!isForgotPass && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
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
              {isForgotPass ? 'Send Reset Link' : 'Sign In to Account'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
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
            <div className="pt-2 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 mr-1 text-slate-400" />
              <span>Admin Access Only</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
