import React, { useState } from 'react';
import { 
  Terminal, Brain, Sparkles, Code, CheckCircle, ArrowRight, 
  BarChart2, Award, Database, Cpu, Layers, Briefcase, 
  ChevronDown, Star, Compass, PlayCircle, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LandingPageProps {
  onNavigate: (tab: string, meta?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { quickLoginAsStudent, quickLoginAsAdmin } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories = [
    { title: "Python Programming", desc: "Data structures, OOP, list comprehensions, and clean functional programming.", icon: Terminal, tag: "Foundation" },
    { title: "Mathematics for Data Science", desc: "Linear algebra, matrix decompositions, eigenvalues, and multivariable calculus.", icon: Brain, tag: "Math" },
    { title: "Statistics and Probability", desc: "Inferential testing, distributions, Bayes theorem, and hypothesis testing.", icon: BarChart2, tag: "Stats" },
    { title: "SQL & Databases", desc: "Complex joins, window functions, CTEs, and relational database architecture.", icon: Database, tag: "Data" },
    { title: "Data Analysis", desc: "Structured aggregation, cohort analysis, and quantitative problem-solving.", icon: BarChart2, tag: "Analytics" },
    { title: "NumPy and Pandas", desc: "High-performance vectorized arrays, DataFrame wrangling, and timeseries.", icon: Layers, tag: "Core" },
    { title: "Data Visualization", desc: "Plotly, Seaborn, Matplotlib, and executive dashboard storytelling.", icon: BarChart2, tag: "Visual" },
    { title: "Exploratory Data Analysis", desc: "Outlier detection, missing value imputation, and feature distribution analysis.", icon: Compass, tag: "EDA" },
    { title: "Machine Learning", desc: "Supervised pipelines, random forests, gradient boosting, and validation.", icon: Cpu, tag: "ML" },
    { title: "Deep Learning", desc: "Neural networks, PyTorch, backpropagation, and CNN architectures.", icon: Brain, tag: "Neural" },
    { title: "Natural Language Processing", desc: "TF-IDF, tokenization, embeddings, and sequence classification.", icon: Terminal, tag: "NLP" },
    { title: "Generative AI Fundamentals", desc: "LLM architectures, prompt engineering, RAG pipelines, and vector indexes.", icon: Sparkles, tag: "GenAI" },
    { title: "Data Science Projects", desc: "Real-world portfolio projects solving end-to-end industry problems.", icon: Briefcase, tag: "Capstone" },
  ];

  const adaptiveSteps = [
    {
      step: "01",
      title: "Diagnostic Skill Evaluation",
      desc: "Begin with a multi-domain diagnostic assessment that evaluates your baseline in math, coding, and modeling.",
      badge: "Initial Calibration"
    },
    {
      step: "02",
      title: "Bayesian Knowledge Tracing",
      desc: "Our engine continuously traces your mastery probability across each topic based on test answers and code submissions.",
      badge: "Real-Time Tracking"
    },
    {
      step: "03",
      title: "Dynamic Difficulty Calibration",
      desc: "Assessments automatically adjust question difficulty between Easy, Medium, and Hard according to rolling performance.",
      badge: "IRT Optimization"
    },
    {
      step: "04",
      title: "Targeted Revision & Enrichment",
      desc: "Weak topics receive immediate prerequisite reinforcement while mastered topics unlock high-level challenges.",
      badge: "Personalized Roadmap"
    }
  ];

  const testimonials = [
    {
      name: "Marcus Vance",
      role: "Junior Data Scientist at FinTech Solutions",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
      content: "The adaptive engine pinpointed that I was guessing on Bayesian statistics during the diagnostic. The targeted revision made the math click in a way generic bootcamps never did."
    },
    {
      name: "Sophia Zhang",
      role: "Machine Learning Engineer at CloudScale",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
      content: "Having an integrated coding lab with real test cases right inside the platform without fiddling with local environment bugs kept my momentum unbroken for 60 straight days."
    },
    {
      name: "David Kim",
      role: "Analytics Lead at RetailMetrics",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
      content: "The 7 capstone projects alone are worth more than a full semester tuition. The automated rubric evaluations gave me instant actionable feedback on model leakage."
    }
  ];

  const faqs = [
    {
      q: "How does the AI-powered adaptive learning system actually work?",
      a: "Unlike platforms that display fixed static videos, Synapse utilizes a Bayesian Knowledge Tracing algorithm combined with Item Response Theory. Every quiz question and coding test you take updates your latent mastery score per domain. If your accuracy drops in a topic, the engine dynamically recommends prerequisite lessons; if you excel, it raises the challenge level."
    },
    {
      q: "Do I need to install Python, Anaconda, or SQL on my personal computer?",
      a: "No installation is required. Synapse features an in-browser Interactive Coding Lab with execution sandboxes for Python and SQL, preloaded with real-world datasets like Iris, Titanic, and California Housing."
    },
    {
      q: "How are the course completion certificates verified?",
      a: "Every certificate issued carries a unique cryptographic verification hash and serial code stored in our database. Potential employers can verify your credential authenticity instantly."
    },
    {
      q: "Is this platform suitable for complete beginners with no math background?",
      a: "Yes! Our diagnostic evaluation recognizes beginner baselines and structures an introductory learning path starting from fundamental Python syntax and intuitive visual statistics before advancing to complex equations."
    }
  ];

  return (
    <div className="bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 border-b border-slate-200 bg-gradient-to-b from-white to-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Generation Adaptive EdTech</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Master Data Science with <br className="hidden sm:inline" />
              <span className="text-indigo-600">Adaptive Intelligence</span>
            </h1>

            <p className="text-lg text-slate-600 leading-relaxed font-normal">
              Move beyond static video courses. Experience an intelligent self-learning curriculum powered by Bayesian skill tracing, in-browser coding labs, and 7 real-world industry capstones tailored to your exact proficiency.
            </p>

            {/* Main CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                onClick={() => onNavigate('diagnostic')}
                className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
              >
                <span>Take Diagnostic Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('courses')}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-semibold rounded-xl border border-slate-200 shadow-sm transition-all"
              >
                Explore 13 Tracks
              </button>
            </div>

            {/* Quick Demo Login Bar for User Convenience */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-medium text-slate-400">One-click live demo:</span>
              <button
                onClick={async () => {
                  await quickLoginAsStudent();
                  onNavigate('dashboard');
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-700 font-medium rounded-md border border-indigo-200 transition-colors"
              >
                Launch as Student (Alex Miller)
              </button>
              <button
                onClick={async () => {
                  await quickLoginAsAdmin();
                  onNavigate('admin');
                }}
                className="px-2.5 py-1 bg-white hover:bg-slate-50 text-purple-700 font-medium rounded-md border border-purple-200 transition-colors"
              >
                Launch as Admin (Dr. Sarah Chen)
              </button>
            </div>
          </div>

          {/* Platform Highlight Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle text-center">
              <div className="text-3xl font-bold text-slate-900">13</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Specialization Tracks</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle text-center">
              <div className="text-3xl font-bold text-slate-900">85+</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Hands-on Labs</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle text-center">
              <div className="text-3xl font-bold text-slate-900">7</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Real Industry Projects</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-subtle text-center">
              <div className="text-3xl font-bold text-slate-900">100%</div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">Verifiable Credentials</div>
            </div>
          </div>
        </div>
      </section>

      {/* Curriculum Categories Section (All 13 categories) */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Comprehensive Curriculum</h2>
          <h3 className="text-3xl font-bold text-slate-900">13 Specialized Data Science Categories</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            From foundational Python scripting and multivariable mathematics to high-performance feature engineering and generative artificial intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate('courses', { category: cat.title })}
                className="group bg-white p-6 rounded-xl border border-slate-200 shadow-subtle hover:shadow-card hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {cat.tag}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 text-base mb-1.5 group-hover:text-indigo-600 transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {cat.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                  <span>Explore Track</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* How the Adaptive Engine Works */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">The Science of Mastery</h2>
            <h3 className="text-3xl font-bold text-slate-900">How Our Adaptive Engine Works</h3>
            <p className="text-slate-600 text-sm">
              We employ Bayesian Knowledge Tracing and Item Response Theory to model your technical knowledge profile in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {adaptiveSteps.map((step, idx) => (
              <div key={idx} className="relative bg-slate-50 p-6 rounded-xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-black text-indigo-200 mb-3 block font-mono">
                    {step.step}
                  </span>
                  <span className="inline-block text-[10px] font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full mb-3 uppercase tracking-wider">
                    {step.badge}
                  </span>
                  <h4 className="font-bold text-slate-900 text-base mb-2">{step.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => onNavigate('diagnostic')}
              className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm transition-all"
            >
              <span>Take Your Diagnostic Assessment Now</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Coding Lab Preview */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Interactive Coding Lab</span>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">
              Execute Python & SQL Directly in the Browser
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              No environment setup or configuration hurdles. Write idiomatic Python with Pandas, NumPy, and Scikit-Learn or execute relational SQL queries on preloaded tabular datasets.
            </p>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Automated unit test fixtures with pass/fail evaluation</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Preloaded datasets: Iris, Titanic, California Housing, and E-Commerce</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Zero arbitrary code execution on application server for strict sandboxing</span>
              </li>
            </ul>
            <div>
              <button
                onClick={() => onNavigate('coding-lab')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm inline-flex items-center space-x-2"
              >
                <span>Launch Interactive Lab</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl p-4 shadow-elevated border border-slate-800 text-slate-200 font-mono text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-slate-400">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                <span className="ml-2 text-[11px] text-slate-400">pipeline_demo.py</span>
              </div>
              <span className="text-[10px] text-indigo-400">Python 3.14 Sandbox</span>
            </div>
            <pre className="py-4 overflow-x-auto text-slate-300 leading-relaxed">
              <code>{`import numpy as np
import pandas as pd
from sklearn.linear_model import Ridge

# 1. Load Preloaded California Housing
housing = pd.read_csv('california_housing.csv')

# 2. Vectorized Feature Engineering
housing['rooms_per_household'] = (
    housing['total_rooms'] / housing['households']
)

# 3. Fit Ridge Regression Baseline
model = Ridge(alpha=1.0)
print("Pipeline verified: 0 errors detected.")`}</code>
            </pre>
            <div className="pt-3 border-t border-slate-800 text-emerald-400 text-[11px] flex items-center justify-between">
              <span>✓ All 2 automated test fixtures passed (14ms)</span>
              <span className="text-slate-400">Memory: 24.2 MB</span>
            </div>
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Student Success</h2>
            <h3 className="text-3xl font-bold text-slate-900">Built for Serious Learners</h3>
            <p className="text-slate-600 text-sm">
              Discover how self-directed students transition into competitive data science roles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex text-amber-400 space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    "{t.content}"
                  </p>
                </div>
                <div className="flex items-center space-x-3 mt-6 pt-4 border-t border-slate-100">
                  <img src={t.image} alt={t.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  <div>
                    <h5 className="font-semibold text-slate-900 text-xs">{t.name}</h5>
                    <p className="text-[11px] text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Got Questions?</h2>
          <h3 className="text-3xl font-bold text-slate-900">Frequently Asked Questions</h3>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-subtle">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full text-left px-5 py-4 flex items-center justify-between font-semibold text-slate-900 text-sm hover:bg-slate-50 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${openFaq === idx ? 'rotate-180 text-indigo-600' : ''}`} />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="py-16 bg-indigo-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h3 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Begin Your Adaptive Learning Journey?
          </h3>
          <p className="text-indigo-100 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Take the 10-minute diagnostic assessment to benchmark your starting competencies and receive your personalized Data Science roadmap today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('diagnostic')}
              className="px-6 py-3.5 bg-white text-indigo-600 hover:bg-indigo-50 font-semibold rounded-xl shadow-md transition-all"
            >
              Start Free Diagnostic
            </button>
            <button
              onClick={() => onNavigate('auth')}
              className="px-6 py-3.5 bg-indigo-700 hover:bg-indigo-800 text-white font-semibold rounded-xl border border-indigo-500 transition-all"
            >
              Create Student Account
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
