"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Trophy, Clock, ArrowRight, Layout, Zap, Star, Target, ChevronRight, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      if (user.role === 'admin' || user.role === 'teacher') {
        router.push('/admin');
        return;
      }
      fetchMyCourses();
    }
  }, [user, authLoading, router]);

  const fetchMyCourses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/my-courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setMyCourses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch my courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (isLoading && user?.role === 'student')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-7xl mx-auto space-y-12">
      <header className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-indigo-100">
            Student Dashboard
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Hello, {user?.name}! 👋
        </h1>
        <p className="text-slate-500 text-lg font-medium max-w-2xl">
          Pick up where you left off in your learning path.
        </p>
      </header>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Enrolled Packages", value: myCourses.length, color: "indigo", icon: Layout },
          { label: "Overall Progress", value: `${user?.overall_progress || 0}%`, color: "emerald", icon: Target },
          { label: "Experience Points", value: (user?.experience_points || 0).toLocaleString(), color: "amber", icon: Zap },
          { label: "Current Streak", value: user?.learning_streak || 0, color: "rose", icon: Trophy }
        ].map((stat, i) => (
          <div 
            key={stat.label}
            className={`
              relative overflow-hidden bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm group
              hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4
            `}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`absolute top-0 left-0 w-full h-1 bg-${stat.color}-500`} />
            <div className="relative z-10 space-y-2">
              <div className={`text-4xl font-black text-${stat.color}-600 tracking-tight group-hover:scale-110 transition-transform origin-left`}>
                {stat.value}
              </div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
            <div className={`absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 text-${stat.color}-500`}>
              <stat.icon size={120} />
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-indigo-500 rounded-full" />
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Your Learning Packages</h2>
          </div>
          <Link href="/modules" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
            All Modules <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {myCourses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-[40px] p-16 md:p-24 text-center shadow-sm relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-slate-50 rounded-full -translate-y-1/2 blur-3xl opacity-50" />
            
            <div className="relative z-10 max-w-lg mx-auto space-y-8">
              <div className="w-24 h-24 bg-indigo-50 rounded-[32px] flex items-center justify-center mx-auto text-indigo-500 shadow-inner">
                <Layout size={44} />
              </div>
              <div className="space-y-3">
                <h3 className="text-2xl font-black text-slate-900">No Enrolled Courses</h3>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                  Please contact your administrator to enroll in a course package or browse available modules.
                </p>
              </div>
              <Link href="/modules" className="inline-flex items-center justify-center px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 hover:-translate-y-1 transition-all">
                Explore All Modules
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {myCourses.map((course, i) => (
              <div 
                key={course.id} 
                className="group bg-white border border-slate-200 rounded-[40px] p-10 shadow-sm hover:shadow-2xl hover:border-indigo-500/20 transition-all duration-500 animate-in fade-in slide-in-from-bottom-6 overflow-hidden relative"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="absolute top-0 right-0 px-8 py-3 bg-indigo-600 text-white text-[10px] font-black rounded-bl-[24px] uppercase tracking-[0.2em] shadow-lg">
                  ACTIVE
                </div>
                
                <div className="space-y-6 relative z-10">
                  <div className="space-y-3">
                    <h3 className="text-3xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-lg leading-relaxed font-medium line-clamp-2">
                      {course.description || 'Comprehensive learning path including multiple modules and hands-on projects.'}
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap gap-6 pt-2">
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                      <BookOpen size={18} className="text-indigo-400" /> {course.modules_count} Modules
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                      <Clock size={18} className="text-indigo-400" /> ~24h Content
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                      <Star size={18} className="text-amber-400" /> High Rating
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-slate-900 uppercase tracking-wider">Course Progress</span>
                      <span className="text-lg font-black text-indigo-600">45%</span>
                    </div>
                    <div className="w-full h-4 bg-slate-50 rounded-full p-1 border border-slate-100">
                      <div className="w-[45%] h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full shadow-sm" />
                    </div>
                  </div>

                  <Link href={`/courses/${course.slug}`} className="inline-flex items-center justify-center w-full gap-3 px-8 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-600/20 hover:-translate-y-1 active:scale-95 transition-all">
                    Continue Learning <ArrowRight size={22} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
