"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, FileText, Code, ChevronUp, ChevronDown, Loader2, BookOpen, AlertCircle, PlayCircle, Copy, ChevronRight, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminSlidesPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.id;
  const { token, isLoading: authLoading } = useAuth();

  const [lesson, setLesson] = useState<any>(null);
  const [slides, setSlides] = useState<any[]>([]);
  const [codeExamples, setCodeExamples] = useState<any[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [currentTab, setCurrentTab] = useState<'slides' | 'code' | 'exercises'>('slides');
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
      fetchData();
    }
  }, [lessonId, token, authLoading]);

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const headers = { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' };
      
      // 1. Fetch Lesson Info
      const lessonRes = await fetch(`${apiUrl}/lessons/${lessonId}`, { headers });
      const lessonData = await lessonRes.json();
      setLesson(lessonData.data);

      // 2. Fetch All Content Types in Parallel
      const [slidesRes, codeRes, exercisesRes] = await Promise.all([
        fetch(`${apiUrl}/slides/lesson/${lessonId}`, { headers }),
        fetch(`${apiUrl}/code-examples/${lessonId}`, { headers }),
        fetch(`${apiUrl}/exercises/${lessonId}`, { headers })
      ]);

      const slidesData = await slidesRes.json();
      const codeData = await codeRes.json();
      const exercisesData = await exercisesRes.json();

      setSlides(slidesData.data || []);
      setCodeExamples(codeData.data || []);
      setExercises(exercisesData.data || []);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (newSlides: any[]) => {
    setIsReordering(true);
    setSlides(newSlides);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/slides/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ordered_ids: newSlides.map(s => s.id)
        })
      });
      if (!res.ok) throw new Error("Reorder failed");
    } catch (error) {
      console.error(error);
      fetchData(); // Rollback
    } finally {
      setIsReordering(false);
    }
  };

  const moveSlide = (index: number, direction: 'up' | 'down') => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;
    
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    handleReorder(newSlides);
  };

  const handleDeleteSlide = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/slides/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setSlides(slides.filter(s => s.id !== id));
    } catch (error) { console.error(error); }
  };

  const handleDeleteCode = async (id: number) => {
    if (!confirm("Are you sure you want to delete this code demo?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/code-examples/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCodeExamples(codeExamples.filter(c => c.id !== id));
    } catch (error) { console.error(error); }
  };

  const handleDeleteExercise = async (id: number) => {
    if (!confirm("Are you sure you want to delete this exercise?")) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/exercises/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setExercises(exercises.filter(e => e.id !== id));
    } catch (error) { console.error(error); }
  };

  const handleDuplicateSlide = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/slides/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  const handleDuplicateCode = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/code-examples/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  const handleDuplicateExercise = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/exercises/${id}/duplicate`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (res.ok) fetchData();
    } catch (error) { console.error(error); }
  };

  if (authLoading || isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 lg:p-12 w-full space-y-8">
      <Link href="/admin/lessons" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium mb-4">
        <ArrowLeft size={16} /> Back to Lessons
      </Link>

      <header className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">LESSON CONTENT</span>
            <span className="text-slate-400 font-bold text-sm truncate">/ {lesson?.module?.title}</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 tracking-tight">{lesson?.title}</h1>
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-2xl">Design the interactive screens and teaching flow for this specific topic.</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tab bar — scrollable on mobile */}
          <div className="overflow-x-auto pb-1">
            <div className="flex bg-slate-100 p-1.5 rounded-[20px] border border-slate-200 w-max">
              <button onClick={() => setCurrentTab('slides')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${currentTab === 'slides' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <FileText size={14} /> <span className="hidden sm:inline">Slides</span><span className="sm:hidden">Slides</span> <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[10px]">{slides.length}</span>
              </button>
              <button onClick={() => setCurrentTab('code')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${currentTab === 'code' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <Code size={14} /> Code <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[10px]">{codeExamples.length}</span>
              </button>
              <button onClick={() => setCurrentTab('exercises')} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5 whitespace-nowrap ${currentTab === 'exercises' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                <BookOpen size={14} /> Exercises <span className="bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-[10px]">{exercises.length}</span>
              </button>
            </div>
          </div>

          {/* New button — full width on mobile */}
          <Link
            href={`/admin/lessons/${lessonId}/${currentTab === 'slides' ? 'slides' : currentTab === 'code' ? 'code-examples' : 'exercises'}/new`}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all group shrink-0 w-full sm:w-auto"
          >
            <Plus size={16} /> <span>New {currentTab === 'slides' ? 'Slide' : currentTab === 'code' ? 'Code Demo' : 'Exercise'}</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </header>

      <div className="space-y-4">
        {/* Slides Tab Content */}
        {currentTab === 'slides' && (
          slides.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-[32px] md:rounded-[48px] p-10 md:p-20 text-center space-y-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner">
                <FileText size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl md:text-2xl font-black text-slate-900">No slides found</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">Start building your teaching flow by creating your first content slide.</p>
              </div>
              <Link href={`/admin/lessons/${lessonId}/slides/new`} className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                 Create First Slide
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {slides.map((slide, index) => (
                <div key={slide.id} className={`group bg-white border border-slate-200 rounded-[24px] p-3 md:p-4 flex items-center gap-3 md:gap-5 shadow-sm hover:shadow-lg hover:border-indigo-500/20 transition-all duration-300 ${isReordering ? 'opacity-50 pointer-events-none' : ''}`} style={{ animationDelay: `${index * 50}ms` }}>
                  {/* Reorder arrows — hidden on mobile */}
                  <div className="hidden sm:flex flex-col gap-1">
                    <button onClick={() => moveSlide(index, 'up')} disabled={index === 0 || isReordering} className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-10 transition-all"><ChevronUp size={16} strokeWidth={3} /></button>
                    <button onClick={() => moveSlide(index, 'down')} disabled={index === slides.length - 1 || isReordering} className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-10 transition-all"><ChevronDown size={16} strokeWidth={3} /></button>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                    <FileText size={20} className="text-indigo-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">{slide.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 hidden sm:block">{slide.content.replace(/<[^>]*>/g, '').substring(0, 100)}...</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleDuplicateSlide(slide.id)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-emerald-500 hover:bg-emerald-50 transition-all" title="Duplicate"><Copy size={15} /></button>
                    <Link href={`/admin/lessons/${lessonId}/slides/${slide.id}/edit`} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all" title="Edit"><Edit2 size={15} /></Link>
                    <button onClick={() => handleDeleteSlide(slide.id)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition-all" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Code Demos Tab Content */}
        {currentTab === 'code' && (
          codeExamples.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-[48px] p-24 text-center space-y-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner">
                <Code size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">No code demos</h3>
                <p className="text-slate-500 text-lg font-medium max-w-xs mx-auto">Add interactive code playgrounds to help students practice what they learn.</p>
              </div>
              <Link href={`/admin/lessons/${lessonId}/code-examples/new`} className="inline-flex items-center justify-center px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                 Create First Demo
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {codeExamples.map((example, index) => (
                <div key={example.id} className="group bg-white border border-slate-200 rounded-[24px] p-3 md:p-4 flex items-center gap-3 md:gap-5 shadow-sm hover:shadow-lg hover:border-emerald-500/20 transition-all duration-300">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                    <Code size={20} className="text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">{example.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-wider border border-slate-200">{example.language}</span>
                      <p className="text-xs text-slate-400 line-clamp-1 hidden sm:block">{example.code.substring(0, 80)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleDuplicateCode(example.id)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-emerald-500 hover:bg-emerald-50 transition-all" title="Duplicate"><Copy size={15} /></button>
                    <Link href={`/admin/lessons/${lessonId}/code-examples/${example.id}/edit`} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all" title="Edit"><Edit2 size={15} /></Link>
                    <button onClick={() => handleDeleteCode(example.id)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition-all" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Exercises Tab Content */}
        {currentTab === 'exercises' && (
          exercises.length === 0 ? (
            <div className="bg-white border border-slate-200 border-dashed rounded-[48px] p-24 text-center space-y-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner">
                <BookOpen size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-slate-900">No exercises</h3>
                <p className="text-slate-500 text-lg font-medium max-w-xs mx-auto">Challenge your students with quizzes and coding tasks to test their knowledge.</p>
              </div>
              <Link href={`/admin/lessons/${lessonId}/exercises/new`} className="inline-flex items-center justify-center px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                 Create First Exercise
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {exercises.map((exercise, index) => (
                <div key={exercise.id} className="group bg-white border border-slate-200 rounded-[24px] p-3 md:p-4 flex items-center gap-3 md:gap-5 shadow-sm hover:shadow-lg hover:border-amber-500/20 transition-all duration-300">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                    <BookOpen size={20} className="text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm md:text-base font-bold text-slate-900 truncate">{exercise.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border shrink-0 ${exercise.difficulty === 'beginner' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : exercise.difficulty === 'intermediate' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>{exercise.difficulty}</span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1 hidden sm:block mt-0.5">{exercise.question.replace(/<[^>]*>/g, '')}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => handleDuplicateExercise(exercise.id)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-emerald-500 hover:bg-emerald-50 transition-all" title="Duplicate"><Copy size={15} /></button>
                    <Link href={`/admin/lessons/${lessonId}/exercises/${exercise.id}/edit`} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all" title="Edit"><Edit2 size={15} /></Link>
                    <button onClick={() => handleDeleteExercise(exercise.id)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition-all" title="Delete"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      <div className="pt-10 border-t border-slate-100 flex justify-center">
        <Link href={`/admin/lessons`} className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-[10px] uppercase tracking-[0.2em] transition-all group">
           <PlayCircle size={16} className="group-hover:rotate-12 transition-transform" /> <span>Preview Curriculum Experience</span>
        </Link>
      </div>
    </div>
  );
}
