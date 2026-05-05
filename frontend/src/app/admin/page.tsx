"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Layout, BookOpen, Layers, Users, CreditCard, ArrowRight, ShieldCheck, Clock, CheckCircle2, XCircle, ChevronRight, Activity, TrendingUp, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    courses: 0,
    modules: 0,
    lessons: 0,
    pendingEnrollments: 0,
    users: 0
  });

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };

      // Fetch all counts in parallel
      const [coursesRes, modulesRes, lessonsRes, enrollmentsRes, usersRes] = await Promise.all([
        fetch(`${apiUrl}/admin/courses`, { headers }),
        fetch(`${apiUrl}/admin/modules`, { headers }),
        fetch(`${apiUrl}/admin/lessons`, { headers }),
        fetch(`${apiUrl}/admin/enrollments`, { headers }),
        fetch(`${apiUrl}/users`, { headers }),
      ]);

      const [coursesData, modulesData, lessonsData, enrollmentsData, usersData] = await Promise.all([
        coursesRes.json(),
        modulesRes.json(),
        lessonsRes.json(),
        enrollmentsRes.json(),
        usersRes.json(),
      ]);

      setStats({
        courses: coursesData.data?.length ?? 0,
        modules: modulesData.data?.length ?? 0,
        lessons: lessonsData.data?.length ?? 0,
        pendingEnrollments: enrollmentsData.data?.length ?? 0,
        users: usersData.data?.length ?? 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'admin' && user.role !== 'teacher'))) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!authLoading && user && token) {
      fetchStats();
    }
  }, [user, token, authLoading]);

  if (authLoading || !user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  const toolColors: Record<string, { bg: string, text: string, bar: string, bullet: string, border: string }> = {
    indigo: { bg: "bg-indigo-50", text: "text-indigo-600", bar: "bg-indigo-500", bullet: "bg-indigo-500", border: "border-indigo-100" },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", bar: "bg-emerald-500", bullet: "bg-emerald-500", border: "border-emerald-100" },
    amber: { bg: "bg-amber-50", text: "text-amber-600", bar: "bg-amber-500", bullet: "bg-amber-500", border: "border-amber-100" },
    rose: { bg: "bg-rose-50", text: "text-rose-600", bar: "bg-rose-500", bullet: "bg-rose-500", border: "border-rose-100" }
  };

  const adminTools = [
    { name: "Courses", desc: "Top-level curriculum paths", path: "/admin/courses", icon: Layout, color: "indigo", count: stats.courses },
    { name: "Modules", desc: "Chapters within courses", path: "/admin/modules", icon: Layers, color: "emerald", count: stats.modules },
    { name: "Lessons", desc: "Individual study topics", path: "/admin/lessons", icon: BookOpen, color: "amber", count: stats.lessons },
    { name: "Enrollments", desc: "Verify student payments", path: "/admin/enrollments", icon: CreditCard, color: "rose", count: stats.pendingEnrollments, highlight: stats.pendingEnrollments > 0, adminOnly: true },
    { name: "Students", desc: "Manage user accounts", path: "/admin/users", icon: Users, color: "indigo", count: stats.users },
  ].filter(tool => !tool.adminOnly || user?.role === 'admin');

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-7xl mx-auto space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
             <Activity className="text-indigo-500" size={20} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Overview</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Admin Command Center</h1>
          <p className="text-slate-500 text-lg font-medium">Welcome back, {user.name}. Here is what is happening with your curriculum.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/courses/new" className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm">
            <Plus size={18} /> Course
          </Link>
          <Link href="/admin/modules/new" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
            <Plus size={18} /> New Module
          </Link>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {adminTools.slice(0, 4).map((tool, i) => (
          <div 
            key={tool.name} 
            className="group relative bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            {/* Premium Accent Bar */}
            <div className={`absolute top-8 left-0 w-1 h-10 ${toolColors[tool.color].bar} rounded-r-full shadow-[2px_0_10px_rgba(0,0,0,0.1)] transition-all group-hover:h-16 group-hover:top-5`} />

            <div className="flex justify-between items-start mb-6">
              <div className={`w-14 h-14 rounded-2xl ${toolColors[tool.color].bg} flex items-center justify-center ${toolColors[tool.color].text} transition-transform group-hover:scale-110`}>
                <tool.icon size={28} />
              </div>
              <div className="text-4xl font-black text-slate-900 tracking-tight">{tool.count}</div>
            </div>
            
            <div className="space-y-1">
              <div className="text-lg font-extrabold text-slate-900 tracking-tight">{tool.name}</div>
              <div className="text-sm font-medium text-slate-400">{tool.desc}</div>
            </div>
            
            {tool.highlight && (
               <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse">
                 Action Required
               </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Management Area */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          <div className="flex items-center gap-3">
             <div className="w-1 h-6 bg-indigo-500 rounded-full" />
             <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Curriculum Management</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminTools.map((tool, i) => (
              <Link 
                href={tool.path} 
                key={tool.name} 
                className="group bg-white border border-slate-200 rounded-[28px] p-8 shadow-sm hover:shadow-2xl hover:border-indigo-500/20 transition-all duration-300 flex items-center gap-6 animate-in fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className={`w-16 h-16 rounded-2xl ${toolColors[tool.color].bg} ${toolColors[tool.color].text} flex items-center justify-center shrink-0 transition-transform group-hover:rotate-6`}>
                  <tool.icon size={32} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{tool.name}</h3>
                    {tool.highlight && (
                       <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                    )}
                  </div>
                  <p className="text-slate-500 text-sm font-medium leading-relaxed">{tool.desc}</p>
                </div>
                <ArrowRight size={22} className="text-slate-200 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="space-y-8 min-w-0">
           {user?.role === 'admin' && (
             <div className="relative bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-600/20 overflow-hidden group animate-in fade-in slide-in-from-right-4">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                
                <div className="relative z-10 space-y-6">
                   <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center">
                     <ShieldCheck size={28} />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-2xl font-black tracking-tight">Verification Queue</h3>
                     <p className="text-indigo-100 text-sm font-medium leading-relaxed opacity-80">
                       There are {stats.pendingEnrollments} students waiting for invoice approval.
                     </p>
                   </div>
                   <Link href="/admin/enrollments" className="flex items-center justify-center w-full py-4 bg-white text-indigo-600 font-black rounded-2xl shadow-lg hover:bg-indigo-50 hover:-translate-y-1 transition-all">
                     Review Invoices
                   </Link>
                </div>
             </div>
           )}

           <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                  <Clock className="text-indigo-500" size={18} /> Recent Activity
                </h3>
                <TrendingUp className="text-emerald-500" size={18} />
              </div>
              
              <div className="space-y-6">
                 {[
                   { type: "Module Created", meta: "\"Laravel API\" by You", time: "2h ago", color: "emerald" },
                   { type: "Lesson Updated", meta: "\"Auth Basics\" in Laravel", time: "5h ago", color: "amber" },
                   { type: "New Enrollment", meta: "Student #20412", time: "1d ago", color: "indigo" }
                 ].map((activity, i) => (
                   <div key={i} className="flex gap-4 group">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${toolColors[activity.color].bullet} border-4 ${toolColors[activity.color].bg.replace('bg-', 'border-')}`} />
                        {i < 2 && <div className="w-px h-full bg-slate-100 my-1" />}
                      </div>
                      <div className="space-y-1 flex-1">
                         <div className="flex justify-between items-start">
                           <div className="text-sm font-extrabold text-slate-900">{activity.type}</div>
                           <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{activity.time}</div>
                         </div>
                         <div className="text-xs font-medium text-slate-500 group-hover:text-indigo-500 transition-colors">{activity.meta}</div>
                      </div>
                   </div>
                 ))}
              </div>
              
              <button className="w-full py-3 text-sm font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 rounded-xl transition-all border border-indigo-100/50">
                View Full Log
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
