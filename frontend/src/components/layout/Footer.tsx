import React from 'react';
import { Terminal, Globe, Share2, Code2 } from 'lucide-react';

export const Footer: React.FC<{ onNavigate?: (tab: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white">
                <Terminal className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">SYNAPSE DATA</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              The premier AI-powered adaptive self-learning platform engineered to take aspiring professionals from beginner to job-ready Data Scientists.
            </p>
            <div className="flex space-x-4 pt-2">
              <span className="text-slate-400 hover:text-white transition-colors cursor-pointer"><Globe className="w-5 h-5" /></span>
              <span className="text-slate-400 hover:text-white transition-colors cursor-pointer"><Share2 className="w-5 h-5" /></span>
              <span className="text-slate-400 hover:text-white transition-colors cursor-pointer"><Code2 className="w-5 h-5" /></span>
            </div>
          </div>

          {/* Curriculum Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Core Curriculum</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate?.('courses')} className="hover:text-white transition-colors">Python Programming</button></li>
              <li><button onClick={() => onNavigate?.('courses')} className="hover:text-white transition-colors">Mathematics for ML</button></li>
              <li><button onClick={() => onNavigate?.('courses')} className="hover:text-white transition-colors">Statistics & Probability</button></li>
              <li><button onClick={() => onNavigate?.('courses')} className="hover:text-white transition-colors">SQL & Database Systems</button></li>
              <li><button onClick={() => onNavigate?.('courses')} className="hover:text-white transition-colors">NumPy & Pandas Wrangling</button></li>
            </ul>
          </div>

          {/* Advanced & Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Applied Practice</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => onNavigate?.('coding-lab')} className="hover:text-white transition-colors">Interactive Coding Sandbox</button></li>
              <li><button onClick={() => onNavigate?.('projects')} className="hover:text-white transition-colors">Industry Projects Portfolio</button></li>
              <li><button onClick={() => onNavigate?.('diagnostic')} className="hover:text-white transition-colors">Adaptive Skill Diagnostic</button></li>
              <li><button onClick={() => onNavigate?.('analytics')} className="hover:text-white transition-colors">Competency Analytics</button></li>
              <li><button onClick={() => onNavigate?.('courses')} className="hover:text-white transition-colors">Deep Learning & GenAI</button></li>
            </ul>
          </div>

          {/* Standards & Accreditation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 mb-3">Pedagogy & Rigor</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="text-slate-400">Bayesian Knowledge Tracing</span></li>
              <li><span className="text-slate-400">Item Response Theory (IRT)</span></li>
              <li><span className="text-slate-400">Verifiable Digital Certificates</span></li>
              <li><span className="text-slate-400">Zero Arbitrary Server Execution</span></li>
              <li><span className="text-slate-400">RAG Context-Aware Tutoring</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500">
          <p>© 2026 Synapse Educational Technologies. All rights reserved.</p>
          <p className="flex items-center mt-4 sm:mt-0">
            Crafted with thoughtful design & rigor for modern data learners
          </p>
        </div>
      </div>
    </footer>
  );
};
