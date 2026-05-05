"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Search, Layout, ChevronRight, GraduationCap, Loader2 } from "lucide-react";
import ModuleIcon from "@/components/ModuleIcon";
import { useAuth } from "@/context/AuthContext";

export default function ModulesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCourses, setExpandedCourses] = useState<Record<number, boolean>>({});
  const router = useRouter();
  const { token, user, isLoading: authLoading, logout } = useAuth();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading) {
      if (token && user?.role === 'student') {
        fetchMyCurriculum();
      } else if (token && (user?.role === 'teacher' || user?.role === 'admin')) {
        fetchTeacherCourses();
      } else {
        router.push('/login');
      }
    }
  }, [token, mounted, authLoading, user]);

  const fetchMyCurriculum = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/my-courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (res.status === 401) {
        logout();
        return;
      }

      if (!res.ok) throw new Error("Failed to fetch curriculum");
      const data = await res.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeacherCourses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/courses`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        cache: 'no-store'
      });

      if (res.status === 401) {
        logout();
        return;
      }

      const data = await res.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpandCourse = (courseId: number) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  if (authLoading || (isLoading && mounted)) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mb-6 font-medium">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="mb-10">
        <div className="flex items-center gap-2.5 mb-3">
           <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
             <GraduationCap size={18} className="text-indigo-600" />
           </div>
           <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-wider">
             MY LEARNING PATHS
           </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Curriculum Modules</h1>
        <p className="text-slate-500 text-base max-w-2xl leading-relaxed">
          {user?.role === 'student'
            ? "Organized modules from all your enrolled courses."
            : user?.role === 'teacher'
              ? "Modules from the courses assigned to you."
              : "Browse all modules across the platform."}
        </p>
      </header>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-1 mb-12 flex items-center group focus-within:border-indigo-500/50">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search for a module..."
            className="w-full pl-14 pr-6 h-14 text-lg bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-16">
          {courses.map((course, cIndex) => {
            const filteredModules = course.modules?.filter((m: any) =>
              m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              m.description?.toLowerCase().includes(searchTerm.toLowerCase())
            ) || [];

            if (searchTerm && filteredModules.length === 0) return null;

            return (
              <section key={course.id || cIndex} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out" style={{ animationDelay: `${cIndex * 100}ms` }}>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-100">
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">{course.title}</h2>
                    <p className="text-sm text-slate-500 font-medium">{filteredModules.length} Modules in this path</p>
                  </div>
                  {course.slug || course.id ? (
                    <Link href={`/courses/${course.slug || course.id}`} className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:gap-2 transition-all">
                      View Roadmap <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <Link href="/courses" className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:gap-2 transition-all">
                      Browse Courses <ChevronRight size={16} />
                    </Link>
                  )}
                </div>

                {filteredModules.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 text-center">
                    <p className="text-slate-400 font-medium italic">No modules found in this course.</p>
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {(expandedCourses[course.id] || searchTerm ? filteredModules : filteredModules.slice(0, 6)).map((module: any, mIndex: number) => (
                        <Link
                          href={`/modules/${module.id}`}
                          key={module.id}
                          className="group bg-white border border-slate-200 rounded-[20px] p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500/30 transition-all relative overflow-hidden"
                        >
                          <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: module.color }}></div>
                          
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm group-hover:scale-110 transition-transform ${module.image ? 'p-0' : 'p-3'}`} style={{ backgroundColor: module.image ? 'transparent' : (module.color || '#6366f1') }}>
                            <ModuleIcon icon={module.icon} imageUrl={module.image} />
                          </div>
                          
                          <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{module.title}</h3>
                          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-6 h-10">{module.description}</p>
                          
                          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <BookOpen size={14} className="text-indigo-500" />
                              <span>{module.lessons_count || 0} Lessons</span>
                            </div>
                            <span className="opacity-60">CHAPTER {mIndex + 1}</span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {!searchTerm && filteredModules.length > 6 && (
                      <div className="flex justify-center mt-2">
                        <button 
                          onClick={() => toggleExpandCourse(course.id)} 
                          className="px-8 py-3 bg-white border border-indigo-100 rounded-xl text-sm font-bold text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm"
                        >
                          {expandedCourses[course.id] ? "Show Less" : `See More (${filteredModules.length - 6} more)`}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })}

          {courses.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-[32px] p-16 md:p-24 text-center shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <Layout size={40} />
              </div>
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">No Curriculum Found</h3>
              <p className="text-slate-500 max-w-sm mx-auto mb-10 leading-relaxed font-medium">You aren't enrolled in any courses yet. Start your learning journey today!</p>
              <Link href="/courses" className="inline-flex items-center justify-center px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all">
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
    </div>
  );
}
