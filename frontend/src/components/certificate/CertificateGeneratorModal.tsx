import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  Copy, 
  Download, 
  ExternalLink, 
  Printer, 
  ShieldCheck, 
  Sparkles, 
  X, 
  FileText,
  UserCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Certificate } from '../../types';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface CertificateGeneratorModalProps {
  courseId: number;
  courseTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (cert: Certificate) => void;
  existingCertificate?: Certificate | null;
}

export const CertificateGeneratorModal: React.FC<CertificateGeneratorModalProps> = ({
  courseId,
  courseTitle,
  isOpen,
  onClose,
  onSuccess,
  existingCertificate,
}) => {
  const { user } = useAuth();
  const [recipientName, setRecipientName] = useState(
    existingCertificate?.recipient_name || existingCertificate?.student_name || user?.full_name || ''
  );
  const [certificate, setCertificate] = useState<Certificate | null>(existingCertificate || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientName.trim()) {
      setError('Please provide the full legal or academic name for the certificate recipient.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await apiRequest<{ status: string; certificate: Certificate }>(
        `/courses/${courseId}/claim-certificate`,
        {
          method: 'POST',
          body: JSON.stringify({ recipient_name: recipientName.trim() }),
        }
      );

      setCertificate(res.certificate);
      if (onSuccess) {
        onSuccess(res.certificate);
      }

      // Trigger celebratory confetti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#818cf8', '#f59e0b', '#10b981'],
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate certificate.');
    } finally {
      setLoading(false);
    }
  };

  const copyVerifyLink = () => {
    if (!certificate) return;
    const url = `${window.location.origin}/verify/${certificate.certificate_code}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Course Certificate of Excellence
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium">
                  Verified Credential
                </span>
              </h2>
              <p className="text-xs text-slate-400">{courseTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8 space-y-6">
          {!certificate ? (
            /* Certificate Customization & Generation Form */
            <form onSubmit={handleGenerate} className="space-y-6 max-w-xl mx-auto py-4">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-full bg-indigo-500/10 text-indigo-400 mb-2 border border-indigo-500/20">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-bold text-white">Congratulations on Completing the Course!</h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  You have successfully demonstrated mastery of data science methodologies. Enter your preferred
                  recipient name below to issue your official credentials accompanied by a faculty Letter of Appreciation.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Certificate Recipient Name <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserCheck className="w-5 h-5 text-indigo-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Dr. Alex Mercer, M.Sc."
                    className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <p className="text-xs text-slate-400">
                  This exact name will be engraved on the official credential and signed letter of commendation.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" /> What will be issued:
                </h4>
                <ul className="text-xs text-slate-400 space-y-1.5 pl-5 list-disc">
                  <li>Cryptographically verifiable SHA-256 digital certificate code.</li>
                  <li>Official Letter of Appreciation signed by Lead Faculty Dr. Elena Vance.</li>
                  <li>Public verification link viewable by employers and university partners.</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-sky-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-sky-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Issuing Credential & Letter...
                  </>
                ) : (
                  <>
                    <Award className="w-5 h-5" />
                    Issue My Verified Certificate & Appreciation
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Issued Certificate Display & Appreciation Letter */
            <div className="space-y-6">
              {/* Certificate Canvas / Card for Print & Preview */}
              <div 
                id="printable-certificate"
                className="relative bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-8 sm:p-12 rounded-2xl border-4 border-amber-500/40 shadow-2xl text-center overflow-hidden"
                style={{
                  backgroundImage: `radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)`
                }}
              >
                {/* Decorative border inset */}
                <div className="absolute inset-2 border border-amber-500/20 rounded-xl pointer-events-none" />
                <div className="absolute inset-3 border border-indigo-500/10 rounded-lg pointer-events-none" />

                {/* Top Badge & Institute */}
                <div className="flex flex-col items-center justify-center space-y-2 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 p-0.5 shadow-xl shadow-amber-500/20">
                    <div className="w-full h-full bg-slate-950 rounded-2xl flex items-center justify-center">
                      <Award className="w-8 h-8 text-amber-400" />
                    </div>
                  </div>
                  <h4 className="text-xs uppercase tracking-[0.3em] font-extrabold text-amber-400">
                    Synapse Academy of Data Science & Artificial Intelligence
                  </h4>
                  <div className="text-[10px] text-slate-400 tracking-wider uppercase">
                    Institutional Center for Advanced Analytics & Machine Intelligence
                  </div>
                </div>

                {/* Certificate Title */}
                <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-amber-200 tracking-tight mb-2">
                  CERTIFICATE OF EXCELLENCE & MASTERY
                </h1>
                <p className="text-xs uppercase tracking-widest text-slate-400 mb-6">
                  This official academic credential is proudly conferred upon
                </p>

                {/* Recipient Name */}
                <div className="py-2 mb-4 border-b-2 border-indigo-500/40 max-w-md mx-auto">
                  <span className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-wide">
                    {certificate.recipient_name || certificate.student_name}
                  </span>
                </div>

                {/* Details */}
                <p className="text-sm text-slate-300 max-w-xl mx-auto mb-6 leading-relaxed">
                  for demonstrating technical distinction and completing all advanced laboratory modules, coding benchmarks, and capstone examinations in:
                </p>
                <div className="inline-block px-5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold text-base sm:text-lg mb-8 shadow-inner">
                  {certificate.course_title}
                </div>

                {/* Official Letter of Appreciation Box */}
                {certificate.appreciation_letter && (
                  <div className="my-6 p-5 rounded-xl bg-slate-900/90 border border-amber-500/20 text-left max-w-2xl mx-auto shadow-lg relative">
                    <div className="flex items-center gap-2 mb-2 text-amber-400 font-semibold text-xs uppercase tracking-wider">
                      <Sparkles className="w-4 h-4" /> Official Letter of Faculty Appreciation
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed italic">
                      "{certificate.appreciation_letter}"
                    </p>
                  </div>
                )}

                {/* Signatures & Verification Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-800 text-left items-end mt-4">
                  <div>
                    <div className="text-[10px] uppercase text-slate-400 font-semibold mb-1">Issue Date & Grade</div>
                    <div className="text-xs font-medium text-white">{certificate.issue_date}</div>
                    <div className="text-xs text-emerald-400 font-bold">{certificate.grade}</div>
                  </div>

                  <div className="text-center sm:text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-1">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div className="text-[10px] uppercase tracking-wider text-emerald-400 font-bold">
                      Verified Credential
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">
                      {certificate.certificate_code}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] uppercase text-slate-400 font-semibold mb-1">Lead Faculty Mentor</div>
                    <div className="font-serif italic text-amber-300 text-sm font-bold">
                      {certificate.instructor_signature || 'Dr. Elena Vance'}
                    </div>
                    <div className="text-[10px] text-slate-400">Director of Academic Affairs</div>
                  </div>
                </div>

                {/* Hash */}
                <div className="mt-6 pt-3 border-t border-slate-900 text-center">
                  <span className="text-[9px] font-mono text-slate-400">
                    Verification Digest: {certificate.verification_hash}
                  </span>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyVerifyLink}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-emerald-400" />
                        Verification Link Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Verification Link
                      </>
                    )}
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    <Printer className="w-4 h-4" />
                    Print / Download PDF
                  </button>
                </div>

                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
