"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Presentation, Code2, LayoutList, AlertCircle, ChevronRight, FileCode2 } from "lucide-react";
import SlideViewer from "@/components/SlideViewer";
import CodeEditor from "@/components/CodeEditor";
import { useAuth } from "@/context/AuthContext";

export default function LessonPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ tab?: string }> }) {
  const { id } = use(params);
  const { tab } = use(searchParams);
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeCodeIndex, setActiveCodeIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading) {
      if (!token) {
        router.push('/login');
        return;
      }
      fetchLessonData();
    }
  }, [id, token, authLoading, mounted]);

  const fetchLessonData = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const [lessonRes, slidesRes, codeRes, exercisesRes] = await Promise.all([
        fetch(`${baseUrl}/lessons/${id}`, { headers, cache: 'no-store' }),
        fetch(`${baseUrl}/slides/lesson/${id}`, { headers, cache: 'no-store' }),
        fetch(`${baseUrl}/code-examples/${id}`, { headers, cache: 'no-store' }),
        fetch(`${baseUrl}/exercises/${id}`, { headers, cache: 'no-store' })
      ]);

      if (!lessonRes.ok) {
        if (lessonRes.status === 403) throw new Error("Access Denied. You are not enrolled in the course for this lesson.");
        if (lessonRes.status === 404) throw new Error("Lesson not found.");
        throw new Error("Failed to load lesson content.");
      }

      const lessonData = await lessonRes.json();
      const slidesData = await slidesRes.json();
      const codeData = await codeRes.json();
      const exercisesData = await exercisesRes.json();

      setData({
        lesson: lessonData.data,
        slides: slidesData.data || [],
        codeExamples: codeData.data || [],
        exercises: exercisesData.data || []
      });
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

  if (!data) return <div className="p-12 text-center text-slate-500 font-medium">Lesson not found.</div>;

  const { lesson, slides, codeExamples, exercises } = data;
  const currentTab = tab || 'slides';

  return (
    <div className="p-6 lg:p-12 min-w-full mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <Link href={`/modules/${lesson.module_id}`} className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium">
          <ArrowLeft size={16} /> Back to Module
        </Link>
        <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
          <span className="truncate">{lesson.module?.title}</span>
          <ChevronRight size={14} className="shrink-0" />
          <strong className="text-slate-900 truncate">{lesson.title}</strong>
        </div>
      </div>

      <header className="mb-12 space-y-8">
        <div className="max-w-3xl">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-extrabold uppercase tracking-widest mb-4">
            LESSON MODULE
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-4 leading-[1.1]">
            {lesson.title}
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed max-w-2xl font-medium italic">
            {lesson.description}
          </p>
        </div>
        
        <nav className="inline-flex p-1.5 bg-slate-100/80 backdrop-blur-md rounded-2xl border border-slate-200">
          <Link 
            href={`/lessons/${lesson.id}?tab=slides`} 
            className={`
              inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
              ${currentTab === 'slides' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}
            `}
          >
            <Presentation size={18} /> 
            <span>Presentation</span> 
            <small className={`px-1.5 py-0.5 rounded-md text-[10px] ${currentTab === 'slides' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
              {slides.length}
            </small>
          </Link>
          
          {codeExamples.length > 0 && (
            <Link 
              href={`/lessons/${lesson.id}?tab=code`} 
              className={`
                inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                ${currentTab === 'code' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}
              `}
            >
              <Code2 size={18} /> 
              <span>Code Demos</span> 
              <small className={`px-1.5 py-0.5 rounded-md text-[10px] ${currentTab === 'code' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                {codeExamples.length}
              </small>
            </Link>
          )}

          {exercises.length > 0 && (
            <Link 
              href={`/lessons/${lesson.id}?tab=exercises`} 
              className={`
                inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all
                ${currentTab === 'exercises' ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900 hover:bg-white/50'}
              `}
            >
              <LayoutList size={18} /> 
              <span>Challenges</span> 
              <small className={`px-1.5 py-0.5 rounded-md text-[10px] ${currentTab === 'exercises' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-200 text-slate-400'}`}>
                {exercises.length}
              </small>
            </Link>
          )}
        </nav>
      </header>

      <div className="mt-8 animate-in fade-in duration-500">
        {/* Slides Tab */}
        {currentTab === 'slides' && (
          <SlideViewer slides={slides} />
        )}

        {/* Code Demos Tab */}
        {currentTab === 'code' && (
          <>
            {codeExamples.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-20 text-center text-slate-400 font-medium italic">
                No code examples for this lesson.
              </div>
            ) : (
              <div
                className="flex w-full overflow-hidden rounded-[32px] border border-slate-200/60 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]"
                style={{ minHeight: '720px' }}
              >
                {/* ── Sidebar ── */}
                <aside className="w-64 shrink-0 bg-[#0f172a] flex flex-col border-r border-white/5 rounded-l-[32px] overflow-hidden">
                  {/* Sidebar header */}
                  <div className="h-[60px] px-5 flex items-center gap-3 border-b border-white/5 shrink-0">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500 text-white rounded-full text-[10px] font-extrabold tracking-widest">
                      <Code2 size={11} />
                      <span>CODE DEMOS</span>
                    </div>
                    <span className="ml-auto text-[11px] font-bold text-slate-500">
                      {codeExamples.length} files
                    </span>
                  </div>

                  {/* File list */}
                  <nav className="flex-1 overflow-y-auto py-3 space-y-0.5 px-2">
                    {codeExamples.map((example: any, idx: number) => {
                      const isActive = idx === activeCodeIndex;
                      return (
                        <button
                          key={example.id}
                          onClick={() => setActiveCodeIndex(idx)}
                          className={`
                            w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-medium
                            ${isActive
                              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/25'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'}
                          `}
                        >
                          <FileCode2 size={14} className={isActive ? 'text-indigo-400' : 'text-slate-600'} />
                          <span className="truncate flex-1">{example.title}</span>
                          <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md ${
                            isActive ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-600'
                          }`}>
                            {(example.language || 'js').substring(0, 3)}
                          </span>
                        </button>
                      );
                    })}
                  </nav>

                  {/* Sidebar footer */}
                  <div className="px-4 py-4 border-t border-white/5 shrink-0">
                    <div className="flex items-center gap-2 text-[11px] text-slate-600">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      Interactive Playground
                    </div>
                  </div>
                </aside>

                {/* ── Main panel ── */}
                <div className="flex-1 flex flex-col min-w-0 bg-[#0f172a] rounded-r-[32px] overflow-hidden">
                  {/* Panel header */}
                  <div className="h-[60px] px-6 flex items-center gap-4 border-b border-white/5 shrink-0 bg-[#1e293b]">
                    {/* breadcrumb tabs */}
                    <div className="flex items-center gap-1 flex-1 overflow-x-auto">
                      {codeExamples.map((example: any, idx: number) => {
                        const isActive = idx === activeCodeIndex;
                        return (
                          <button
                            key={example.id}
                            onClick={() => setActiveCodeIndex(idx)}
                            className={`flex items-center gap-2 px-4 py-1.5 rounded-t-lg text-[12px] font-semibold whitespace-nowrap transition-all border-b-2 ${
                              isActive
                                ? 'text-slate-200 bg-[#0f172a] border-indigo-500'
                                : 'text-slate-500 hover:text-slate-300 bg-transparent border-transparent hover:bg-white/5'
                            }`}
                          >
                            <FileCode2 size={12} />
                            {example.title}
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 shrink-0">
                      <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                        {codeExamples[activeCodeIndex]?.language || 'js'}
                      </span>
                    </div>
                  </div>

                  {/* Editor area — fills remaining height */}
                  <div className="flex-1 overflow-hidden">
                    <CodeEditor
                      key={activeCodeIndex}
                      initialCode={codeExamples[activeCodeIndex]?.code}
                      language={codeExamples[activeCodeIndex]?.language}
                      runnable={codeExamples[activeCodeIndex]?.runnable}
                      fillHeight
                    />
                  </div>
                </div>
              </div>
            )}
          </>
        )}


        {/* Exercises Tab */}
        {currentTab === 'exercises' && (
          <div className="space-y-12">
            {exercises.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-20 text-center text-slate-400 font-medium italic">
                No exercises for this lesson.
              </div>
            ) : (
              exercises.map((exercise: any) => (
                <div key={exercise.id} className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-8 border-b border-slate-100 space-y-4">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider
                      ${exercise.difficulty === 'beginner' ? 'bg-emerald-50 text-emerald-600' : 
                        exercise.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}
                    `}>
                      {exercise.difficulty.toUpperCase()}
                    </span>
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">{exercise.title}</h3>
                    <div 
                      className="text-slate-700 leading-relaxed max-w-3xl font-medium 
                        [&_p]:mb-4 [&_strong]:text-slate-900 [&_strong]:font-bold 
                        [&_h1]:text-slate-900 [&_h1]:text-2xl [&_h1]:font-black 
                        [&_h2]:text-slate-900 [&_h2]:text-xl [&_h2]:font-black 
                        [&_ul]:list-disc [&_ul]:ml-5 [&_ol]:list-decimal [&_ol]:ml-5 [&_li]:mb-1
                        [&_.ql-indent-1]:pl-8 [&_.ql-indent-2]:pl-16 [&_.ql-indent-3]:pl-24 
                        [&_.ql-indent-4]:pl-32 [&_.ql-indent-5]:pl-40 [&_.ql-indent-6]:pl-48 
                        [&_.ql-indent-7]:pl-56 [&_.ql-indent-8]:pl-64"
                      dangerouslySetInnerHTML={{ __html: exercise.question }}
                    />
                  </div>
                  <div className="p-8 bg-slate-50/30">
                    <CodeEditor 
                      initialCode={exercise.starter_code || "// Write your solution here..."} 
                      language={exercise.language} 
                      runnable={true} 
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
