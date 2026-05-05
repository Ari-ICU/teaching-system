"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, BarChart, PlayCircle, AlertCircle, Layout, ChevronRight } from "lucide-react";
import ModuleIcon from "@/components/ModuleIcon";
import CourseRoadmap from "@/components/CourseRoadmap";
import { useAuth } from "@/context/AuthContext";

export default function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [moduleData, setModuleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user, isLoading: authLoading } = useAuth();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading) {
      if (!token) {
        router.push('/login');
        return;
      }
      fetchModule();
    }
  }, [id, token, authLoading, mounted]);

  const fetchModule = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiUrl}/modules/${id}`, {
        headers,
        cache: 'no-store'
      });

      if (!res.ok) {
        if (res.status === 403) throw new Error("Access Denied. You are not enrolled in the course containing this module.");
        throw new Error("Failed to fetch module details.");
      }

      const data = await res.json();
      setModuleData(data.data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return null;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-[32px] p-12 text-center shadow-xl max-w-md w-full">
          <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-rose-500">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">Access Denied</h2>
          <p className="text-slate-500 mb-8 leading-relaxed font-medium">{error}</p>
          <Link href="/" className="inline-flex items-center justify-center px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!moduleData) return <div className="p-12 text-center text-slate-500 font-medium">Module not found.</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="flex-1 p-6 md:p-10 lg:p-12 min-w-0">
        <Link href="/modules" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mb-8 font-medium">
          <ArrowLeft size={16} /> Back to Modules
        </Link>

        <header 
          className="bg-white border border-slate-200 rounded-[32px] p-8 md:p-12 shadow-sm relative overflow-hidden group"
          style={{ borderTopWidth: '4px', borderTopColor: moduleData.color }}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-3xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-500`} style={{ backgroundColor: `${moduleData.color}15`, border: `1px solid ${moduleData.color}20` }}>
              <ModuleIcon icon={moduleData.icon} size={40} color={moduleData.color} />
            </div>
            <div className="text-center md:text-left space-y-2">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{moduleData.title}</h1>
              <p className="text-slate-500 text-lg leading-relaxed max-w-2xl font-medium">
                {moduleData.description}
              </p>
            </div>
          </div>
        </header>

        <div className="flex items-center justify-between mt-12 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-indigo-500 rounded-full" />
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Curriculum Lessons</h2>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[11px] font-black rounded-full uppercase tracking-wider">
            {moduleData.lessons?.length || 0} Lessons
          </span>
        </div>

        <div className={`grid grid-cols-1 ${moduleData.course ? '2xl:grid-cols-2' : 'lg:grid-cols-2'} gap-6`}>
          {moduleData.lessons?.map((lesson: any, index: number) => (
            <div 
              key={lesson.id} 
              className="group bg-white border border-slate-200 rounded-[28px] p-8 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col h-full">
                <div className="mb-4">
                  <span className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-widest mb-3 uppercase
                    ${lesson.difficulty === 'beginner' ? 'bg-emerald-50 text-emerald-600' : 
                      lesson.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}
                  `}>
                    {lesson.difficulty}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {index + 1}. {lesson.title}
                  </h3>
                </div>

                <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-1">
                  {lesson.description}
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <div className="flex gap-4 text-xs font-bold text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-indigo-400" /> {lesson.duration || '45 min'}
                    </span>
                    <span className="flex items-center gap-1.5 capitalize">
                      <BarChart size={14} className="text-indigo-400" /> {lesson.difficulty}
                    </span>
                  </div>

                  <Link 
                    href={`/lessons/${lesson.id}`} 
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:-translate-y-0.5 transition-all"
                  >
                    <PlayCircle size={18} /> Start
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specialized Roadmap Aside - Only render container if course exists */}
      {moduleData.course && (
        <div className="w-full lg:w-[350px] xl:w-[400px] shrink-0 border-l border-slate-200 bg-white/50">
          <CourseRoadmap course={moduleData.course} />
        </div>
      )}
    </div>
  );
}
