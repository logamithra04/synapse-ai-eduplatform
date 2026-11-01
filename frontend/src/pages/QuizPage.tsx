import React, { useState, useEffect } from 'react';
import { 
  Clock, CheckCircle, XCircle, ArrowRight, ArrowLeft, 
  Award, AlertCircle, RotateCcw, BookOpen, Brain, Sparkles 
} from 'lucide-react';
import { apiRequest } from '../api/client';
import confetti from 'canvas-confetti';

interface QuizPageProps {
  quizId?: number;
  onBack: () => void;
  onOpenAiTutor: (context: any) => void;
}

export const QuizPage: React.FC<QuizPageProps> = ({ quizId = 1, onBack, onOpenAiTutor }) => {
  const [quiz, setQuiz] = useState<any | null>(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(900); // 15 mins
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (timeLeft > 0 && !results && !isLoading) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, results, isLoading]);

  const fetchQuiz = async () => {
    setIsLoading(true);
    try {
      const data = await apiRequest<any>(`/quizzes/${quizId}`);
      setQuiz(data);
      if (data.time_limit_mins) setTimeLeft(data.time_limit_mins * 60);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (qId: number, val: string) => {
    setAnswers({
      ...answers,
      [qId]: val,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qid, val]) => ({
        question_id: parseInt(qid),
        selected_answer: val,
      }));

      const res = await apiRequest<any>(`/quizzes/${quiz?.id || 1}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          quiz_id: quiz?.id || 1,
          answers: formattedAnswers,
        }),
      });

      setResults(res);
      if (res.passed) {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading || !quiz) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (results) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-card text-center space-y-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
            results.passed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          }`}>
            {results.passed ? <CheckCircle className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Assessment Report
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
              {results.passed ? 'Assessment Passed with Honors' : 'Assessment Incomplete'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {results.passed
                ? 'Your Bayesian mastery score in this topic has been updated upwards!'
                : 'Review the detailed explanations below to reinforce target concepts.'}
            </p>
          </div>

          {/* Scores summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-lg mx-auto text-left">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Final Score</span>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{results.score}%</div>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Correct Answers</span>
              <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
                {results.correct_count} / {results.total_questions}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Adaptive Level</span>
              <div className="text-xl sm:text-2xl font-bold text-indigo-600 mt-1">Recalibrated</div>
            </div>
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setResults(null);
                setAnswers({});
                setCurrentQIndex(0);
                setTimeLeft(quiz.time_limit_mins * 60);
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Retake Test</span>
            </button>
            <button
              onClick={onBack}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
            >
              Return to Curriculum
            </button>
          </div>
        </div>

        {/* Detailed Question Explanations */}
        <div className="space-y-4">
          <h3 className="font-bold text-slate-900 text-lg">In-Depth Concept Explanations</h3>
          {results.results?.map((res: any, idx: number) => (
            <div
              key={idx}
              className={`p-5 rounded-xl border bg-white shadow-subtle space-y-3 ${
                res.is_correct ? 'border-emerald-200' : 'border-rose-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Question {idx + 1} • {res.topic}
                </span>
                <span className={`text-xs font-bold flex items-center ${
                  res.is_correct ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {res.is_correct ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Correct
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Incorrect
                    </>
                  )}
                </span>
              </div>

              <h4 className="font-semibold text-slate-900 text-sm leading-snug">{res.question_text}</h4>

              <div className="space-y-1 text-xs">
                <p className="text-slate-600">
                  Your Answer: <strong className={res.is_correct ? 'text-emerald-700' : 'text-rose-700'}>{res.selected_answer || '(No answer provided)'}</strong>
                </p>
                {!res.is_correct && (
                  <p className="text-slate-600">
                    Correct Answer: <strong className="text-emerald-700">{res.correct_answer}</strong>
                  </p>
                )}
              </div>

              {res.explanation && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 leading-relaxed">
                  <strong>Concept Rationale:</strong> {res.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- ACTIVE QUIZ QUESTION ---
  const currentQ = quiz.questions[currentQIndex];
  const totalQ = quiz.questions.length;
  const isAnswered = answers[currentQ?.id] !== undefined;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* Top Bar with Timer and Breadcrumb */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={onBack}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Cancel Quiz
        </button>

        <div className="flex items-center space-x-2 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg font-mono text-xs font-semibold">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>{formatTimer(timeLeft)}</span>
        </div>
      </div>

      {/* Stepper bubbles */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        {quiz.questions.map((q: any, i: number) => {
          const hasAnswer = answers[q.id] !== undefined;
          const isCurr = i === currentQIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQIndex(i)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition-all ${
                isCurr
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : hasAnswer
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Active Question Card */}
      {currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded">
              {currentQ.topic}
            </span>
            <span className="text-[11px] font-semibold text-slate-500 uppercase">
              Difficulty: {currentQ.difficulty}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
            {currentQ.question_text}
          </h3>

          {/* Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options && currentQ.options.map((opt: string, idx: number) => {
              const isSelected = answers[currentQ.id] === opt;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelectAnswer(currentQ.id, opt)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start space-x-3 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                  }`}>
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Stepper Navigation Buttons */}
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
            <button
              onClick={() => setCurrentQIndex((i) => Math.max(0, i - 1))}
              disabled={currentQIndex === 0}
              className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentQIndex === totalQ - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <span>{isSubmitting ? 'Scoring Assessment...' : 'Finish & View Score'}</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setCurrentQIndex((i) => Math.min(totalQ - 1, i + 1))}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
