import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Clock, Layers, ArrowRight, CheckCircle, 
  Database, FileCode, Award, Shield, Sparkles 
} from 'lucide-react';
import { Project } from '../types';
import { apiRequest } from '../api/client';

interface ProjectsPageProps {
  onSelectProject: (projectId: number) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await apiRequest<Project[]>('/projects');
      setProjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
          Industry Capstones
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
          Applied Data Science Project Library
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Build 7 portfolio-grade machine learning and analytical models with realistic datasets, starter pipelines, and automated rubric scoring.
        </p>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading industry capstones...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <div
              key={p.id}
              onClick={() => onSelectProject(p.id)}
              className="bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {p.domain}
                  </span>
                  <span
                    className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                      p.difficulty === 'Advanced'
                        ? 'bg-purple-50 text-purple-700'
                        : p.difficulty === 'Intermediate'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {p.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {p.summary}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {p.estimated_hours} Hours
                    </span>
                    <span className="flex items-center">
                      <Database className="w-3.5 h-3.5 mr-1 text-slate-400" />
                      {p.dataset_name}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {p.required_tools?.slice(0, 3).map((tool, tIdx) => (
                      <span key={tIdx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:bg-indigo-50/50 transition-colors">
                <span>View Problem & Starter Code</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
