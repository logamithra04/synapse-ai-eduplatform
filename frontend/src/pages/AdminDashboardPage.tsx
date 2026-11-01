import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Plus, 
  Edit3, 
  Trash2, 
  Video, 
  Layers, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  PlaySquare, 
  Film,
  ExternalLink,
  X,
} from 'lucide-react';
import { apiRequest } from '../api/client';
import { Course, CourseCategory, Module, Lesson } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Course Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newCategoryId, setNewCategoryId] = useState<number>(1);
  const [newDifficulty, setNewDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [newHours, setNewHours] = useState(12);
  const [newVideoUrl, setNewVideoUrl] = useState('https://www.youtube.com/embed/aircAruvnKk');
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Course Edit Modal State
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [editDifficulty, setEditDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [editHours, setEditHours] = useState(10);
  const [editVideoUrl, setEditVideoUrl] = useState('');
  const [isUpdatingCourse, setIsUpdatingCourse] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Curriculum Expansion & Lesson Editing State
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);
  const [activeCourseModules, setActiveCourseModules] = useState<Module[]>([]);
  const [loadingModules, setLoadingModules] = useState(false);

  // Add Module Modal State
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [newModuleTitle, setNewModuleTitle] = useState('');

  // Add / Edit Lesson Modal State
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<number | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDuration, setLessonDuration] = useState(25);
  const [lessonType, setLessonType] = useState<'video' | 'reading' | 'interactive' | 'exercise'>('video');
  const [lessonVideoUrl, setLessonVideoUrl] = useState('');
  const [isSavingLesson, setIsSavingLesson] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [overviewData, catData] = await Promise.all([
        apiRequest<{ courses: Course[] }>('/admin/overview'),
        apiRequest<CourseCategory[]>('/courses/categories'),
      ]);
      setCourses(overviewData.courses || []);
      setCategories(catData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load course studio data.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await apiRequest('/admin/courses', {
        method: 'POST',
        body: JSON.stringify({
          category_id: newCategoryId,
          title: newTitle.trim(),
          summary: newSummary.trim(),
          difficulty: newDifficulty,
          estimated_hours: newHours,
          video_url: newVideoUrl.trim() || undefined,
          learning_objectives: [
            `Master practical core concepts of ${newTitle}`,
            'Develop end-to-end data pipelines and models',
            'Pass production code review and benchmarks'
          ]
        })
      });

      setCreateSuccess(true);
      setTimeout(() => {
        setCreateSuccess(false);
        setShowCreateModal(false);
        setNewTitle('');
        setNewSummary('');
        setNewVideoUrl('https://www.youtube.com/embed/aircAruvnKk');
      }, 1200);

      await loadData();
    } catch (err: any) {
      alert(`Failed to create course: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setEditTitle(course.title);
    setEditSummary(course.summary);
    setEditDifficulty(course.difficulty);
    setEditHours(course.estimated_hours);
    setEditVideoUrl(course.video_url || '');
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setIsUpdatingCourse(true);
    try {
      await apiRequest(`/admin/courses/${editingCourse.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle.trim(),
          summary: editSummary.trim(),
          difficulty: editDifficulty,
          estimated_hours: editHours,
          video_url: editVideoUrl.trim() || undefined,
        })
      });

      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
        setEditingCourse(null);
      }, 1200);

      await loadData();
    } catch (err: any) {
      alert(`Failed to update course: ${err.message}`);
    } finally {
      setIsUpdatingCourse(false);
    }
  };

  const handleDeleteCourse = async (courseId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently remove "${title}"?`)) {
      return;
    }
    try {
      await apiRequest(`/admin/courses/${courseId}`, { method: 'DELETE' });
      await loadData();
      if (expandedCourseId === courseId) {
        setExpandedCourseId(null);
      }
    } catch (err: any) {
      alert(`Failed to delete course: ${err.message}`);
    }
  };

  const toggleExpandCourse = async (courseId: number) => {
    if (expandedCourseId === courseId) {
      setExpandedCourseId(null);
      return;
    }
    setExpandedCourseId(courseId);
    try {
      setLoadingModules(true);
      const courseDetail = await apiRequest<Course>(`/courses/${courseId}`);
      setActiveCourseModules(courseDetail.modules || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoadingModules(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expandedCourseId || !newModuleTitle.trim()) return;
    try {
      await apiRequest(`/admin/courses/${expandedCourseId}/modules`, {
        method: 'POST',
        body: JSON.stringify({
          title: newModuleTitle.trim(),
          order_index: activeCourseModules.length + 1,
        })
      });
      setShowAddModuleModal(false);
      setNewModuleTitle('');
      // Reload modules
      const courseDetail = await apiRequest<Course>(`/courses/${expandedCourseId}`);
      setActiveCourseModules(courseDetail.modules || []);
    } catch (err: any) {
      alert(`Failed to add module: ${err.message}`);
    }
  };

  const handleOpenAddLesson = (moduleId: number) => {
    setTargetModuleId(moduleId);
    setEditingLesson(null);
    setLessonTitle('');
    setLessonDuration(25);
    setLessonType('video');
    setLessonVideoUrl('https://www.youtube.com/embed/aircAruvnKk');
    setShowLessonModal(true);
  };

  const handleOpenEditLesson = (lesson: Lesson, moduleId: number) => {
    setTargetModuleId(moduleId);
    setEditingLesson(lesson);
    setLessonTitle(lesson.title);
    setLessonDuration(lesson.duration_mins);
    setLessonType(lesson.lesson_type);
    setLessonVideoUrl(lesson.video_url || '');
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleId || !lessonTitle.trim()) return;
    setIsSavingLesson(true);
    try {
      if (editingLesson) {
        // Update lesson
        await apiRequest(`/admin/lessons/${editingLesson.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            title: lessonTitle.trim(),
            duration_mins: lessonDuration,
            lesson_type: lessonType,
            video_url: lessonVideoUrl.trim() || undefined,
          })
        });
      } else {
        // Create lesson
        await apiRequest(`/admin/modules/${targetModuleId}/lessons`, {
          method: 'POST',
          body: JSON.stringify({
            title: lessonTitle.trim(),
            duration_mins: lessonDuration,
            lesson_type: lessonType,
            video_url: lessonVideoUrl.trim() || undefined,
          })
        });
      }

      setShowLessonModal(false);
      if (expandedCourseId) {
        const courseDetail = await apiRequest<Course>(`/courses/${expandedCourseId}`);
        setActiveCourseModules(courseDetail.modules || []);
      }
    } catch (err: any) {
      alert(`Failed to save lesson: ${err.message}`);
    } finally {
      setIsSavingLesson(false);
    }
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!window.confirm('Delete this lesson permanently?')) return;
    try {
      await apiRequest(`/admin/lessons/${lessonId}`, { method: 'DELETE' });
      if (expandedCourseId) {
        const courseDetail = await apiRequest<Course>(`/courses/${expandedCourseId}`);
        setActiveCourseModules(courseDetail.modules || []);
      }
    } catch (err: any) {
      alert(`Failed to delete lesson: ${err.message}`);
    }
  };

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Studio Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                Curriculum Authoring Console
              </span>
              <span className="text-xs text-slate-400">Exclusively for Edition & Adding Courses</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Course Studio & Video Curriculum Editor
            </h1>
            <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
              Create and refine master data science courses, configure interactive video lectures,
              and manage sequential learning modules. Student management is isolated to the Mentor Portal.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 shrink-0 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Author New Course</span>
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Published Courses</span>
              <BookOpen className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{courses.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Available in student catalog</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Video Enabled</span>
              <Film className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {courses.filter(c => !!c.video_url).length} / {courses.length}
            </div>
            <div className="text-[11px] text-sky-400 mt-1">Interactive 16:9 player linked</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Categories</span>
              <Layers className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">{categories.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">Curriculum specializations</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Curriculum Modules</span>
              <BookOpen className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0)}
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">Learning units across tracks</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses to edit..."
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Showing {filteredCourses.length} courses
          </span>
        </div>

        {/* Courses List with Expandable Module/Lesson Editor */}
        <div className="space-y-4">
          {loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
              <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              Loading Course Studio catalog...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-12 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
              No courses found matching your query.
            </div>
          ) : (
            filteredCourses.map((course) => {
              const isExpanded = expandedCourseId === course.id;
              return (
                <div
                  key={course.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
                >
                  {/* Course Item Row */}
                  <div className="p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {course.category_name || 'Data Science'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          course.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                          course.difficulty === 'Intermediate' ? 'bg-sky-500/10 text-sky-400' :
                          'bg-purple-500/10 text-purple-400'
                        }`}>
                          {course.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {course.estimated_hours}h estimated
                        </span>
                        {course.video_url && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 flex items-center gap-1">
                            <Video className="w-3 h-3 text-sky-400" /> Video Ready
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-white">{course.title}</h3>
                      <p className="text-xs text-slate-400 line-clamp-2 max-w-3xl leading-relaxed">
                        {course.summary}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 lg:pt-0">
                      <button
                        onClick={() => toggleExpandCourse(course.id)}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      >
                        <Layers className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Curriculum ({course.modules_count || 0})</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleOpenEditCourse(course)}
                        className="px-3.5 py-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 flex items-center gap-1.5 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Course</span>
                      </button>

                      <button
                        onClick={() => handleDeleteCourse(course.id, course.title)}
                        className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                        title="Delete Course"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Curriculum Manager */}
                  {isExpanded && (
                    <div className="border-t border-slate-800 bg-slate-950/60 p-6 space-y-6 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-2">
                            <Layers className="w-4 h-4 text-indigo-400" />
                            Curriculum Structure: Modules & Video Lessons
                          </h4>
                          <p className="text-xs text-slate-400">
                            Add modules, organize video lessons, and attach video URLs to lessons.
                          </p>
                        </div>

                        <button
                          onClick={() => setShowAddModuleModal(true)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Module</span>
                        </button>
                      </div>

                      {loadingModules ? (
                        <div className="py-6 text-center text-xs text-slate-400">
                          Loading curriculum modules...
                        </div>
                      ) : activeCourseModules.length === 0 ? (
                        <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
                          No modules created for this course yet. Click "Add Module" to begin.
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {activeCourseModules.map((module, mIdx) => (
                            <div
                              key={module.id}
                              className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3"
                            >
                              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <span className="text-xs font-bold text-indigo-300">
                                  Module {mIdx + 1}: {module.title}
                                </span>
                                <button
                                  onClick={() => handleOpenAddLesson(module.id)}
                                  className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Add Lesson
                                </button>
                              </div>

                              {/* Lessons List */}
                              <div className="space-y-2">
                                {module.lessons && module.lessons.length > 0 ? (
                                  module.lessons.map((lesson, lIdx) => (
                                    <div
                                      key={lesson.id}
                                      className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                                          {lIdx + 1}
                                        </span>
                                        <PlaySquare className="w-3.5 h-3.5 text-indigo-400" />
                                        <span className="font-medium text-white">{lesson.title}</span>
                                        <span className="text-slate-400 text-[11px]">{lesson.duration_mins}m</span>
                                        {lesson.video_url && (
                                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 text-[10px] flex items-center gap-1">
                                            <Video className="w-2.5 h-2.5" /> Video Linked
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <button
                                          onClick={() => handleOpenEditLesson(lesson, module.id)}
                                          className="text-slate-400 hover:text-white p-1"
                                          title="Edit Lesson"
                                        >
                                          <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                          onClick={() => handleDeleteLesson(lesson.id)}
                                          className="text-red-400 hover:text-red-300 p-1"
                                          title="Delete Lesson"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-xs text-slate-500 italic py-2">
                                    No lessons in this module yet.
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal 1: Author New Course */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-lg">Author New Data Science Course</h3>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {createSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Course published successfully into curriculum catalog!
                </div>
              )}

              <form onSubmit={handleCreateCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Curriculum Category</label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(parseInt(e.target.value))}
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Transformers & LLM Fine-Tuning with PyTorch"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course Summary</label>
                  <textarea
                    required
                    rows={3}
                    value={newSummary}
                    onChange={(e) => setNewSummary(e.target.value)}
                    placeholder="Concise overview of hands-on pipelines, architectures, and benchmarks covered..."
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value as any)}
                      className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      min={2}
                      max={120}
                      value={newHours}
                      onChange={(e) => setNewHours(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course Preview Video URL (YouTube / Embed)
                  </label>
                  <input
                    type="url"
                    value={newVideoUrl}
                    onChange={(e) => setNewVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/aircAruvnKk"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Embedded into the course trailer and player.
                  </p>
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {isCreating ? 'Publishing...' : 'Publish Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 2: Edit Course Details */}
        {editingCourse && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-bold text-white text-lg">Edit Course & Video Lecture</h3>
                </div>
                <button onClick={() => setEditingCourse(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {updateSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Course parameters updated successfully!
                </div>
              )}

              <form onSubmit={handleUpdateCourse} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Course Summary</label>
                  <textarea
                    required
                    rows={3}
                    value={editSummary}
                    onChange={(e) => setEditSummary(e.target.value)}
                    className="w-full text-xs p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Difficulty</label>
                    <select
                      value={editDifficulty}
                      onChange={(e) => setEditDifficulty(e.target.value as any)}
                      className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      min={1}
                      max={150}
                      value={editHours}
                      onChange={(e) => setEditHours(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Course Video URL (YouTube / Embed)
                  </label>
                  <input
                    type="url"
                    value={editVideoUrl}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/aircAruvnKk"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingCourse}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 disabled:opacity-50"
                  >
                    {isUpdatingCourse ? 'Updating...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 3: Add Module */}
        {showAddModuleModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">Add Curriculum Module</h3>
                <button onClick={() => setShowAddModuleModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddModule} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Module Title</label>
                  <input
                    type="text"
                    required
                    value={newModuleTitle}
                    onChange={(e) => setNewModuleTitle(e.target.value)}
                    placeholder="e.g. Module 3: Deep Feature Engineering"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModuleModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                  >
                    Create Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal 4: Add / Edit Lesson & Video URL */}
        {showLessonModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <h3 className="font-bold text-white text-base">
                  {editingLesson ? 'Edit Lesson & Video' : 'Add New Lesson'}
                </h3>
                <button onClick={() => setShowLessonModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lesson Title</label>
                  <input
                    type="text"
                    required
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder="e.g. Convolutional Filters & Receptive Fields"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Duration (mins)</label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={lessonDuration}
                      onChange={(e) => setLessonDuration(Number(e.target.value))}
                      className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Lesson Type</label>
                    <select
                      value={lessonType}
                      onChange={(e) => setLessonType(e.target.value as any)}
                      className="w-full text-xs px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="video">Video Lecture</option>
                      <option value="reading">Deep Reading</option>
                      <option value="interactive">Interactive Lab</option>
                      <option value="exercise">Coding Exercise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Lesson Video URL (YouTube / Embed)
                  </label>
                  <input
                    type="url"
                    value={lessonVideoUrl}
                    onChange={(e) => setLessonVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/aircAruvnKk"
                    className="w-full text-xs px-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Plays inside the interactive course player for students.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowLessonModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingLesson}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
                  >
                    {isSavingLesson ? 'Saving...' : editingLesson ? 'Update Lesson' : 'Add Lesson'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
