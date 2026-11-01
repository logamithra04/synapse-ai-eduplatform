import React, { useState, useEffect } from 'react';
import { 
  Brain, CheckCircle, AlertCircle, ArrowRight, ArrowLeft, 
  Sparkles, Award, Shield, Target, BookOpen, Layers
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface DiagnosticPageProps {
  onComplete: () => void;
}

export const DiagnosticPage: React.FC<DiagnosticPageProps> = ({ onComplete }) => {
  const { user, refreshUser } = useAuth();
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDiagnostic();
  }, []);

  const fetchDiagnostic = async () => {
    try {
      const data = await apiRequest<any>('/adaptive/diagnostic');
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (questionId: number, answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answer,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = { answers: selectedAnswers };
      const res = await apiRequest<any>('/adaptive/diagnostic/submit', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setResult(res.result);
      await refreshUser();

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-slate-600">Loading Adaptive Diagnostic Matrix...</p>
        </div>
      </div>
    );
  }

  // Result Screen
  if (result) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <Award className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Diagnostic Complete
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              Your Personalized Skill Benchmark
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2">
              The Bayesian adaptive learning engine has evaluated your baseline competencies across mathematical and coding domains.
            </p>
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-md mx-auto text-left">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Score</span>
              <div className="text-3xl font-bold text-slate-900 mt-1">{result.score}%</div>
              <span className="text-[11px] text-slate-500">Benchmark Accuracy</span>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Track Level</span>
              <div className="text-2xl font-bold text-indigo-600 mt-1">{result.level}</div>
              <span className="text-[11px] text-slate-500">Adaptive Difficulty Profile</span>
            </div>
          </div>

          {/* Strengths and Weaknesses breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left pt-2">
            <div className="border border-emerald-200 bg-emerald-50/50 p-4 rounded-xl">
              <h4 className="font-semibold text-emerald-900 text-sm flex items-center mb-2">
                <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                Validated Strengths
              </h4>
              {result.strengths && result.strengths.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-emerald-800">
                  {result.strengths.map((s: string, i: number) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700">Foundational stage across domains.</p>
              )}
            </div>

            <div className="border border-amber-200 bg-amber-50/50 p-4 rounded-xl">
              <h4 className="font-semibold text-amber-900 text-sm flex items-center mb-2">
                <Target className="w-4 h-4 mr-2 text-amber-600" />
                Target Revision Areas
              </h4>
              {result.weaknesses && result.weaknesses.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-amber-800">
                  {result.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="flex items-center space-x-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-amber-700">Balanced fundamentals across topics.</p>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              onClick={onComplete}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all inline-flex items-center space-x-2"
            >
              <span>View Customized Learning Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Assessment Question Stepper
  const currentQ = questions[currentIdx];
  const totalQ = questions.length;
  const progressPct = ((currentIdx + 1) / totalQ) * 100;
  const isSelected = selectedAnswers[currentQ?.id] !== undefined;
  const isLast = currentIdx === totalQ - 1;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Top Stepper Header */}
      <div className="mb-8 space-y-3">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <span>Question {currentIdx + 1} of {totalQ}</span>
          <span className="text-indigo-600 font-bold">{Math.round(progressPct)}% Completed</span>
        </div>
        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      {currentQ && (
        <div className="bg-white rounded-2xl shadow-card border border-slate-200 p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {currentQ.topic}
            </span>
            <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
              currentQ.difficulty === 'hard' ? 'bg-rose-50 text-rose-700' :
              currentQ.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
            }`}>
              Difficulty: {currentQ.difficulty}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQ.question_text}
          </h3>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options && currentQ.options.map((opt: string, idx: number) => {
              const isCurrentSelected = selectedAnswers[currentQ.id] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(currentQ.id, opt)}
                  className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-start space-x-3 ${
                    isCurrentSelected
                      ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    isCurrentSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                  }`}>
                    {isCurrentSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Nav Buttons */}
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
              disabled={currentIdx === 0}
              className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center space-x-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {isLast ? (
              <button
                onClick={handleSubmit}
                disabled={!isSelected || isSubmitting}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all text-sm disabled:opacity-40 flex items-center space-x-2"
              >
                <span>{isSubmitting ? 'Evaluating Matrix...' : 'Submit Diagnostic'}</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentIdx((i) => Math.min(totalQ - 1, i + 1))}
                disabled={!isSelected}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all text-sm disabled:opacity-40 flex items-center space-x-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
