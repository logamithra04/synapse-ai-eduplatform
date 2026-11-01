import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Clock, Star, Users, ArrowRight, 
  Terminal, Brain, BarChart2, Database, Layers, Compass, 
  Cpu, Sparkles, Briefcase, Filter, CheckCircle 
} from 'lucide-react';
import { Course, CourseCategory } from '../types';
import { apiRequest } from '../api/client';

interface CoursesPageProps {
  onSelectCourse: (courseId: number) => void;
  initialCategory?: string;
}

export const CoursesPage: React.FC<CoursesPageProps> = ({ onSelectCourse, initialCategory }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadCoursesAndCategories();
  }, []);

  const loadCoursesAndCategories = async () => {
    try {
      const [coursesData, categoriesData] = await Promise.all([
        apiRequest<Course[]>('/courses'),
        apiRequest<CourseCategory[]>('/courses/categories'),
      ]);
      setCourses(coursesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCourses = courses.filter((c) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      c.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesDifficulty =
      selectedDifficulty === 'all' ||
      c.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.summary.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Self-Paced Curriculum
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Data Science Course Directory
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Explore 13 structured domains from Python & SQL foundations to Deep Learning architectures.
          </p>
        </div>

        {/* Search Bar */}
        <div className="w-full md:w-72 relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics, algorithms..."
            className="w-full text-sm pl-9 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
      </div>

      {/* Category Pills (All 13 categories) */}
      <div className="space-y-2">
        <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 mr-1" />
          <span>Category Filter (13 Domains)</span>
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Tracks
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCategory === cat.name
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty Filter Sub-bar */}
      <div className="flex items-center space-x-2 text-xs">
        <span className="text-slate-500 font-medium">Difficulty Level:</span>
        {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
          <button
            key={lvl}
            onClick={() => setSelectedDifficulty(lvl)}
            className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
              selectedDifficulty === lvl
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lvl}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-500">Loading courses...</p>
        </div>
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="bg-white rounded-2xl border border-slate-200 shadow-subtle hover:shadow-card hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                    {course.category_name}
                  </span>
                  <span
                    className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                      course.difficulty === 'Advanced'
                        ? 'bg-purple-50 text-purple-700'
                        : course.difficulty === 'Intermediate'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    {course.difficulty}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                    {course.summary}
                  </p>
                </div>

                <div className="flex items-center space-x-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {course.estimated_hours}h
                  </span>
                  <span className="flex items-center">
                    <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                    {course.rating}
                  </span>
                  <span className="flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {course.students_enrolled} enrolled
                  </span>
                </div>
              </div>

              {/* Bottom Card Footer */}
              <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-indigo-600 group-hover:bg-indigo-50/50 transition-colors">
                <span>View Full Syllabus & Labs</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="font-semibold text-slate-800 text-sm">No courses match your filter</h4>
          <p className="text-xs text-slate-500 mt-1">Try selecting another category or clearing your search query.</p>
        </div>
      )}
    </div>
  );
};
