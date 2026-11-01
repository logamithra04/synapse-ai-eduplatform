import React, { useState, useEffect } from 'react';
import { 
  Play, RotateCcw, CheckCircle, XCircle, Code, Database, 
  Terminal, Sparkles, BookOpen, Layers, Lightbulb, History, Copy, Check 
} from 'lucide-react';
import { CodingExercise, DatasetInfo } from '../types';
import { apiRequest } from '../api/client';
import confetti from 'canvas-confetti';

interface CodingLabPageProps {
  onOpenAiTutor: (context: any) => void;
}

export const CodingLabPage: React.FC<CodingLabPageProps> = ({ onOpenAiTutor }) => {
  const [exercises, setExercises] = useState<CodingExercise[]>([]);
  const [selectedEx, setSelectedEx] = useState<CodingExercise | null>(null);
  const [language, setLanguage] = useState<'python' | 'sql'>('python');
  const [code, setCode] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [outputResult, setOutputResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'tests' | 'dataset' | 'hints'>('tests');
  const [showSolution, setShowSolution] = useState<boolean>(false);
  const [history, setHistory] = useState<any[]>([]);
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<string>('iris_flowers.csv');

  useEffect(() => {
    fetchExercises();
    fetchDatasets();
  }, []);

  const fetchDatasets = async () => {
    try {
      const data = await apiRequest<DatasetInfo[]>('/datasets');
      setDatasets(data);
      if (data.length > 0) {
        setSelectedDataset(data[0].filename);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchExercises = async () => {
    try {
      const data = await apiRequest<CodingExercise[]>('/coding/exercises');
      setExercises(data);
      if (data.length > 0) {
        setSelectedEx(data[0]);
        setLanguage(data[0].language);
        setCode(data[0].starter_code);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectExercise = (ex: CodingExercise) => {
    setSelectedEx(ex);
    setLanguage(ex.language);
    setCode(ex.starter_code);
    setOutputResult(null);
    setShowSolution(false);
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    try {
      const payload = {
        language,
        code,
        exercise_id: selectedEx?.id,
        dataset_name: selectedDataset,
      };

      const result = await apiRequest<any>('/coding/run', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setOutputResult(result);

      // Add to submission history
      setHistory((prev) => [
        {
          timestamp: new Date().toLocaleTimeString(),
          passed: result.passed_tests,
          total: result.total_tests,
          exercise: selectedEx?.title || 'Practice Code',
        },
        ...prev,
      ]);

      if (result.success && result.passed_tests === result.total_tests && result.total_tests > 0) {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setOutputResult({
        success: false,
        error: err.message || 'Execution error encountered.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Exercise Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Interactive Coding Sandbox
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Data Science Practice Lab
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Exercise Picker Dropdown */}
          <select
            value={selectedEx?.id || ''}
            onChange={(e) => {
              const ex = exercises.find((item) => item.id === parseInt(e.target.value));
              if (ex) handleSelectExercise(ex);
            }}
            className="text-xs sm:text-sm font-medium px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                [{ex.language.toUpperCase()}] {ex.title}
              </option>
            ))}
          </select>

          {/* Ask AI Context */}
          <button
            onClick={() => onOpenAiTutor({
              course_title: 'Interactive Coding Lab',
              lesson_title: selectedEx?.title,
              code,
            })}
            className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl border border-indigo-200 transition-colors flex items-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Debug with Tutor AI</span>
          </button>
        </div>
      </div>

      {/* Main Coding Grid (2 Columns: Left Editor, Right Problem & Tests) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Area (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-subtle overflow-hidden flex flex-col">
          {/* Editor Sub-header */}
          <div className="px-4 py-3 bg-slate-900 text-slate-200 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <span className="text-xs font-mono font-medium text-slate-300">
                {language === 'python' ? 'solution.py' : 'query.sql'}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {language === 'python' && datasets.length > 0 && (
                <div className="hidden sm:flex items-center space-x-1.5 mr-2">
                  <span className="text-[11px] text-slate-400 font-sans">Active Data:</span>
                  <select
                    value={selectedDataset}
                    onChange={(e) => setSelectedDataset(e.target.value)}
                    className="bg-slate-800 text-slate-200 text-[11px] rounded px-2 py-1 border border-slate-700 font-mono focus:outline-none focus:border-indigo-500"
                  >
                    {datasets.map((d) => (
                      <option key={d.filename} value={d.filename}>
                        df = {d.filename} ({d.total_rows} rows)
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {language === 'sql' && (
                <span className="hidden sm:inline-flex items-center text-[11px] text-slate-400 mr-2 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  DB: learning_database.db
                </span>
              )}

              <button
                onClick={() => {
                  if (selectedEx) setCode(selectedEx.starter_code);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-200 text-xs flex items-center space-x-1 transition-colors"
                title="Reset Starter Code"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>

              <button
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{isRunning ? 'Evaluating...' : 'Run Code'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Code Editor TextArea */}
          <div className="relative font-mono text-xs sm:text-sm">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={16}
              className="w-full p-4 bg-slate-950 text-slate-100 font-mono leading-relaxed resize-none focus:outline-none selection:bg-indigo-700 selection:text-white"
            />
          </div>

          {/* Output / Console Bar */}
          <div className="bg-slate-900 border-t border-slate-800 p-4 font-mono text-xs text-slate-300">
            <div className="flex justify-between items-center text-[11px] text-slate-500 mb-2 uppercase tracking-wider">
              <span>Sandbox Console Output</span>
              <span>Memory Guard: Secure</span>
            </div>

            {outputResult ? (
              outputResult.error ? (
                <div className="text-rose-400 flex items-start space-x-2">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <pre className="whitespace-pre-wrap">{outputResult.error}</pre>
                </div>
              ) : (
                <div className="space-y-2">
                  <pre className="text-emerald-400 whitespace-pre-wrap">{outputResult.stdout}</pre>
                </div>
              )
            ) : (
              <p className="text-slate-500 italic">Click "Run Code" to execute code against unit test fixtures.</p>
            )}
          </div>
        </div>

        {/* Right Info & Tests Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Exercise Instructions Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                selectedEx?.difficulty === 'hard' ? 'bg-rose-50 text-rose-700' :
                selectedEx?.difficulty === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
              }`}>
                {selectedEx?.difficulty} Difficulty
              </span>
              <span className="text-xs font-semibold text-indigo-600 uppercase">
                {selectedEx?.language}
              </span>
            </div>

            <h3 className="font-bold text-slate-900 text-lg">{selectedEx?.title}</h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {selectedEx?.description}
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-slate-700">Instructions:</p>
              <p className="text-slate-600 leading-relaxed">{selectedEx?.instructions}</p>
            </div>

            {/* Tab switchers: Tests / Preloaded Dataset / Hints */}
            <div className="flex border-b border-slate-200 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('tests')}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'tests'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Test Cases
              </button>
              <button
                onClick={() => setActiveTab('dataset')}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'dataset'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Sample Datasets
              </button>
              <button
                onClick={() => setActiveTab('hints')}
                className={`py-2 px-3 border-b-2 transition-colors ${
                  activeTab === 'hints'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                Hints
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'tests' && (
              <div className="space-y-2">
                {outputResult?.test_results && outputResult.test_results.length > 0 ? (
                  outputResult.test_results.map((tr: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 text-xs flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <span className="font-semibold text-emerald-900">Fixture #{tr.test_index}</span>
                        <p className="text-emerald-700 font-mono text-[11px]">Input: {tr.input}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-semibold text-[10px]">
                        PASSED ✓
                      </span>
                    </div>
                  ))
                ) : (
                  selectedEx?.test_cases?.map((tc, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex justify-between font-semibold text-slate-700">
                        <span>Test Case {idx + 1}</span>
                        <span className="text-slate-400 font-mono text-[11px]">Fixture</span>
                      </div>
                      <p className="font-mono text-slate-600 text-[11px]">Input: {tc.input}</p>
                      <p className="font-mono text-indigo-600 text-[11px]">Expected: {tc.expected_output}</p>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'dataset' && (
              <div className="space-y-3 text-xs">
                {language === 'sql' ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-slate-700 font-semibold">
                      <span>Database: <code className="text-indigo-600">learning_database.db</code></span>
                      <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                        Live SQLite Connection
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Query real tables with standard SQLite syntax (joins, window functions, aggregations, group by):
                    </p>
                    <div className="text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5 font-mono">
                      <div><strong className="text-indigo-700">customers:</strong> customer_id, first_name, last_name, email, country, signup_date</div>
                      <div><strong className="text-indigo-700">orders:</strong> order_id, customer_id, order_date, total_amount, status</div>
                      <div><strong className="text-indigo-700">products:</strong> product_id, product_name, category, unit_price, inventory_count</div>
                      <div><strong className="text-indigo-700">order_items:</strong> item_id, order_id, product_id, quantity, subtotal</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">
                        {datasets.find((d) => d.filename === selectedDataset)?.title || selectedDataset}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {datasets.find((d) => d.filename === selectedDataset)?.total_rows || 0} Records
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {datasets.find((d) => d.filename === selectedDataset)?.description}
                    </p>
                    {datasets.find((d) => d.filename === selectedDataset)?.preview && (
                      <div className="overflow-x-auto border border-slate-200 rounded-lg max-h-56">
                        <table className="w-full text-left font-mono text-[10px]">
                          <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 sticky top-0">
                            <tr>
                              {datasets.find((d) => d.filename === selectedDataset)?.columns.map((c, i) => (
                                <th key={i} className="p-1.5 whitespace-nowrap">{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                            {datasets.find((d) => d.filename === selectedDataset)?.preview.map((r, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                {datasets.find((d) => d.filename === selectedDataset)?.columns.map((c, cIdx) => (
                                  <td key={cIdx} className="p-1.5 whitespace-nowrap">{String(r[c])}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'hints' && (
              <div className="space-y-2">
                {selectedEx?.hints && selectedEx.hints.length > 0 ? (
                  selectedEx.hints.map((hint, idx) => (
                    <div key={idx} className="p-3 bg-amber-50/60 border border-amber-200 text-amber-900 text-xs rounded-lg flex items-start space-x-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <span>{hint}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">No hints needed for this exercise!</p>
                )}
              </div>
            )}
          </div>

          {/* Submission History */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-subtle space-y-3">
              <h4 className="font-semibold text-slate-900 text-xs flex items-center">
                <History className="w-4 h-4 mr-1.5 text-indigo-600" />
                Session Run History
              </h4>
              <div className="space-y-2 text-xs">
                {history.map((h, i) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <div>
                      <span className="font-medium text-slate-800">{h.exercise}</span>
                      <span className="text-[10px] text-slate-400 block">{h.timestamp}</span>
                    </div>
                    <span className="font-semibold text-emerald-600 text-[11px]">
                      {h.passed} / {h.total} Fixtures Passed
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
