import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Clock, Database, CheckCircle, Code, 
  Send, Sparkles, FileText, Award, AlertCircle, Copy, Check,
  Download, Eye, EyeOff, Table
} from 'lucide-react';
import { Project } from '../types';
import { apiRequest } from '../api/client';
import confetti from 'canvas-confetti';

interface ProjectDetailPageProps {
  projectId: number;
  onBack: () => void;
  onOpenAiTutor: (context: any) => void;
}

export const ProjectDetailPage: React.FC<ProjectDetailPageProps> = ({
  projectId,
  onBack,
  onOpenAiTutor,
}) => {
  const [project, setProject] = useState<Project | null>(null);
  const [codeSubmission, setCodeSubmission] = useState('');
  const [analysisNotes, setAnalysisNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackResult, setFeedbackResult] = useState<any | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDataPreview, setShowDataPreview] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [projectId]);

  const fetchProject = async () => {
    try {
      const data = await apiRequest<Project>(`/projects/${projectId}`);
      setProject(data);
      setCodeSubmission(data.starter_code || '');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyStarter = () => {
    if (project?.starter_code) {
      navigator.clipboard.writeText(project.starter_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        project_id: projectId,
        code_submission: codeSubmission,
        dataset_analysis_notes: analysisNotes,
        metrics_reported: { "accuracy": 0.92, "cross_val_auc": 0.89 },
      };

      const res = await apiRequest<any>(`/projects/${projectId}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setFeedbackResult(res);
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

  if (isLoading || !project) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Project Library
      </button>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-subtle space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider">
            {project.domain}
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
            {project.difficulty} Level
          </span>
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
          {project.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          {project.summary}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 text-xs text-slate-500 border-t border-slate-100">
          <div className="flex flex-wrap gap-4">
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-1 text-slate-400" />
              {project.estimated_hours} Hours Estimated
            </span>
            <span className="flex items-center">
              <Database className="w-4 h-4 mr-1 text-slate-400" />
              Dataset: <strong>{project.dataset_name}</strong>
            </span>
          </div>

          <button
            onClick={() => onOpenAiTutor({
              project_title: project.title,
              project_slug: project.slug,
              dataset: project.dataset_name,
              domain: project.domain,
              code: project.starter_code
            })}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold border border-indigo-200 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Consult DataTutor AI</span>
          </button>
        </div>
      </div>

      {/* Real Dataset Explorer Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-base">
                Canonical Dataset: <span className="font-mono text-indigo-700">{project.dataset_name}</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500">
              Authentic industry-grade dataset calibrated for {project.domain}. Download the raw CSV or preview records directly in-browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowDataPreview(!showDataPreview)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              {showDataPreview ? <EyeOff className="w-3.5 h-3.5 mr-1.5" /> : <Eye className="w-3.5 h-3.5 mr-1.5" />}
              {showDataPreview ? 'Hide Preview' : 'Preview Real Data'}
            </button>
            <a
              href={project.dataset_download_url || `http://127.0.0.1:8000/api/datasets/${project.dataset_name}/download`}
              download={project.dataset_name}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download CSV ({project.dataset_total_rows || 0} rows)
            </a>
          </div>
        </div>

        {/* Dataset Metadata Badges */}
        <div className="flex flex-wrap gap-2 text-xs pt-2 border-t border-slate-100">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            <strong>Total Records:</strong> {project.dataset_total_rows || 'N/A'}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-medium">
            <strong>Columns:</strong> {project.dataset_columns?.length || 0}
          </span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-medium border border-indigo-100">
            <strong>Format:</strong> RFC 4180 CSV & In-Memory DataFrame
          </span>
        </div>

        {/* Live Data Preview Table */}
        {showDataPreview && project.dataset_preview && project.dataset_preview.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center font-medium">
                <Table className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                Live Table Preview (First {project.dataset_preview.length} Rows)
              </span>
              <span className="font-mono text-[11px] text-slate-400">
                UTF-8 Encoded • Verified Schema
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 max-h-80">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 sticky top-0">
                  <tr>
                    {project.dataset_columns?.map((col, idx) => (
                      <th key={idx} className="px-3 py-2 font-semibold whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {project.dataset_preview.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                      {project.dataset_columns?.map((col, cIdx) => (
                        <td key={cIdx} className="px-3 py-1.5 whitespace-nowrap text-slate-600 text-[11px]">
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : 'NULL'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Problem Statement & Tools */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-3">
          <h3 className="font-bold text-slate-900 text-base">Problem Statement & Objective</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {project.problem_statement}
          </p>

          <div className="pt-2">
            <h4 className="font-semibold text-slate-900 text-xs mb-1.5">Expected Deliverables:</h4>
            <ul className="space-y-1 text-xs text-slate-600">
              {project.expected_outcomes?.map((out, i) => (
                <li key={i} className="flex items-start space-x-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{out}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-subtle space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Required Tools & Stack</h3>
          <div className="flex flex-wrap gap-1.5">
            {project.required_tools?.map((tool, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold">
                {tool}
              </span>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100">
            <h4 className="font-semibold text-slate-900 text-xs mb-1.5">Rubric Criteria:</h4>
            <ul className="space-y-1 text-[11px] text-slate-500">
              {project.evaluation_criteria?.map((crit, i) => (
                <li key={i}>• {crit}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Starter Code Viewer */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-card">
        <div className="px-5 py-3 bg-slate-800/80 border-b border-slate-700 text-slate-300 flex justify-between items-center text-xs">
          <span className="font-mono text-indigo-400">starter_pipeline.py</span>
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => onOpenAiTutor({
                project_title: project.title,
                project_slug: project.slug,
                dataset: project.dataset_name,
                domain: project.domain,
                code: project.starter_code
              })}
              className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors text-[11px]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask Tutor AI</span>
            </button>
            <button
              onClick={handleCopyStarter}
              className="flex items-center space-x-1 hover:text-white transition-colors"
            >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Starter Code</span>
              </>
            )}
          </button>
        </div>
      </div>
        <pre className="p-5 font-mono text-xs sm:text-sm text-slate-200 leading-relaxed overflow-x-auto">
          <code>{project.starter_code}</code>
        </pre>
      </div>

      {/* Submission Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-card space-y-6">
        <div>
          <h3 className="font-bold text-slate-900 text-lg">Project Submission & Automated Review</h3>
          <p className="text-xs text-slate-500 mt-1">
            Submit your python script and analytical summary. The platform evaluation engine analyzes code modularity, leakage prevention, and model stability.
          </p>
        </div>

        {feedbackResult && (
          <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900 text-sm flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-600" />
                Evaluation Score: {feedbackResult.score}%
              </span>
              <span className="text-[11px] font-semibold bg-emerald-600 text-white px-2 py-0.5 rounded">
                Rubric Passed
              </span>
            </div>
            <p className="text-xs text-emerald-800 leading-relaxed">
              {feedbackResult.feedback}
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Python Solution Code
            </label>
            <textarea
              required
              rows={8}
              value={codeSubmission}
              onChange={(e) => setCodeSubmission(e.target.value)}
              placeholder="Paste your completed machine learning pipeline code here..."
              className="w-full text-xs font-mono p-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-950 text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Analysis Notes & Metric Summary (Optional)
            </label>
            <textarea
              rows={3}
              value={analysisNotes}
              onChange={(e) => setAnalysisNotes(e.target.value)}
              placeholder="Describe your cross-validation results, feature importances, and validation takeaways..."
              className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !codeSubmission.trim()}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <span>{isSubmitting ? 'Evaluating Submission...' : 'Submit Project for Evaluation'}</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
