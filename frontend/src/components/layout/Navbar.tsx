import React, { useState } from 'react';
import { 
  Terminal, Flame, BookOpen, Code, Briefcase, BarChart2, 
  Sparkles, LogOut, User as UserIcon, Shield, Menu, X, CheckCircle,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openAiTutor: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openAiTutor }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Comprehensive role-based navigation
  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    if (user.role === 'admin') {
      // Admin account: Full platform oversight, Course Studio, and learning modules
      return [
        { id: 'admin', label: 'Course Studio', icon: Shield },
        { id: 'courses', label: 'Curriculum', icon: Terminal },
        { id: 'mentor', label: 'Mentor Portal', icon: GraduationCap },
        { id: 'dashboard', label: 'Student View', icon: BookOpen },
        { id: 'coding-lab', label: 'Coding Lab', icon: Code },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
      ];
    }

    if (user.role === 'mentor') {
      // Mentor account: Institutional Cohort Oversight, review tools, and learning materials
      return [
        { id: 'mentor', label: 'Mentor Portal', icon: GraduationCap },
        { id: 'courses', label: 'Curriculum', icon: Terminal },
        { id: 'dashboard', label: 'Cohort Learning', icon: BookOpen },
        { id: 'coding-lab', label: 'Coding Lab', icon: Code },
        { id: 'projects', label: 'Projects', icon: Briefcase },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
      ];
    }

    // Student account: Focused learning modules
    return [
      { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
      { id: 'courses', label: 'Curriculum', icon: Terminal },
      { id: 'coding-lab', label: 'Coding Lab', icon: Code },
      { id: 'projects', label: 'Projects', icon: Briefcase },
      { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    ];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 lg:gap-4">
          
          {/* Logo & Navigation Links */}
          <div className="flex items-center gap-4 lg:gap-6 min-w-0">
            <button
              onClick={() => {
                if (!user) {
                  setCurrentTab('landing');
                } else if (user.role === 'admin') {
                  setCurrentTab('admin');
                } else if (user.role === 'mentor') {
                  setCurrentTab('mentor');
                } else {
                  setCurrentTab('dashboard');
                }
              }}
              className="flex items-center gap-2.5 text-left group shrink-0"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 shrink-0">
                <Terminal className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight leading-tight">
                  SYNAPSE
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600 leading-tight">
                  {user?.role === 'admin' ? 'Course Studio' : user?.role === 'mentor' ? 'Mentor Portal' : 'Adaptive Data Science'}
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links (Aligned, balanced, no text wrapping) */}
            {user && (
              <div className="hidden md:flex items-center gap-1 lg:gap-1.5 shrink-0">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setCurrentTab(item.id)}
                      className={`inline-flex items-center px-3 py-1.5 lg:px-3.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-xl whitespace-nowrap transition-all shrink-0 ${
                        isActive
                          ? 'text-indigo-600 bg-indigo-50 border border-indigo-200/70 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-1.5 lg:mr-2 opacity-80 shrink-0" />
                      <span className="whitespace-nowrap">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Action Items */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* AI Learning Assistant trigger button */}
            <button
              onClick={openAiTutor}
              className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl text-indigo-700 bg-indigo-50 border border-indigo-200/80 hover:bg-indigo-100/80 transition-all shadow-xs whitespace-nowrap shrink-0"
              title="Open DataTutor AI Assistant"
            >
              <Sparkles className="w-4 h-4 mr-1.5 text-indigo-600 animate-pulse shrink-0" />
              <span className="whitespace-nowrap">Ask DataTutor AI</span>
            </button>

            {user ? (
              <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
                {/* Streak Counter - ONLY DISPLAYED FOR STUDENTS */}
                {user.role === 'student' && user.streak_days > 0 && (
                  <div 
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200/80 rounded-full text-xs font-semibold whitespace-nowrap shrink-0"
                    title="Consecutive daily study streak"
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    <span>{user.streak_days}d streak</span>
                  </div>
                )}

                {/* Role Badge on Admin/Mentor */}
                {user.role === 'admin' && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-bold whitespace-nowrap shrink-0">
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    Admin
                  </span>
                )}

                {user.role === 'mentor' && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs font-bold whitespace-nowrap shrink-0">
                    <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                    Mentor
                  </span>
                )}

                {/* User Dropdown */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center p-0.5 rounded-full hover:ring-2 hover:ring-indigo-100 transition-all shrink-0"
                  >
                    <img
                      src={user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80'}
                      alt={user.full_name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                  </button>

                  {profileDropdownOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-elevated border border-slate-200 py-2 z-50 animate-fade-in"
                      onMouseLeave={() => setProfileDropdownOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-semibold text-slate-900 truncate">{user.full_name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-[11px] font-semibold rounded ${
                          user.role === 'admin' 
                            ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                            : user.role === 'mentor'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {user.role === 'admin' ? 'Curriculum Admin' : user.role === 'mentor' ? 'Academic Mentor' : 'Student Learner'}
                        </span>
                      </div>

                      {/* Role-tailored dropdown items */}
                      {user.role === 'admin' ? (
                        <>
                          <button
                            onClick={() => {
                              setCurrentTab('admin');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-purple-700 hover:bg-purple-50 flex items-center font-medium"
                          >
                            <Shield className="w-4 h-4 mr-2 text-purple-500" />
                            Course Studio
                          </button>
                          <button
                            onClick={() => {
                              setCurrentTab('courses');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center font-medium"
                          >
                            <Terminal className="w-4 h-4 mr-2 text-slate-400" />
                            Curriculum Catalog Preview
                          </button>
                        </>
                      ) : user.role === 'mentor' ? (
                        <>
                          <button
                            onClick={() => {
                              setCurrentTab('mentor');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-sky-700 hover:bg-sky-50 flex items-center font-medium"
                          >
                            <GraduationCap className="w-4 h-4 mr-2 text-sky-500" />
                            Institutional Cohort
                          </button>
                          <button
                            onClick={() => {
                              setCurrentTab('courses');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center font-medium"
                          >
                            <Terminal className="w-4 h-4 mr-2 text-slate-400" />
                            Curriculum Catalog
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setCurrentTab('profile');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                          >
                            <UserIcon className="w-4 h-4 mr-2 text-slate-400" />
                            My Profile & Certificates
                          </button>

                          <button
                            onClick={() => {
                              setCurrentTab('analytics');
                              setProfileDropdownOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center"
                          >
                            <BarChart2 className="w-4 h-4 mr-2 text-slate-400" />
                            Completion Analytics
                          </button>
                        </>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setCurrentTab('landing');
                          setProfileDropdownOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center"
                      >
                        <LogOut className="w-4 h-4 mr-2 text-rose-500" />
                        Log Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentTab('auth')}
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentTab('auth')}
                  className="px-4 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all whitespace-nowrap"
                >
                  Get Started
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {user ? (
            <>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-base font-medium rounded-lg ${
                      isActive
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3 opacity-75" />
                    {item.label}
                  </button>
                );
              })}
              <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
                <button
                  onClick={() => {
                    logout();
                    setCurrentTab('landing');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-rose-600 font-medium"
                >
                  Log Out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2 pt-2">
              <button
                onClick={() => {
                  setCurrentTab('auth');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
