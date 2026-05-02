"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, FileText, Code, ChevronUp, ChevronDown, Loader2, BookOpen, AlertCircle, PlayCircle, Copy } from "lucide-react";
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

  if (authLoading) return null;

  return (
    <div className="page">
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <Link href="/admin/lessons" className="btn btn-ghost">
          <ArrowLeft size={16} /> Back to Lessons
        </Link>
      </div>

      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-indigo">LESSON CONTENT</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>/ {lesson?.module?.title}</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '32px' }}>{lesson?.title}</h1>
          <p className="page-subtitle">Design the interactive screens and teaching flow for this lesson.</p>

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button onClick={() => setCurrentTab('slides')} className={`btn ${currentTab === 'slides' ? 'btn-primary' : 'btn-ghost'}`}>
               <FileText size={16} /> Slides ({slides.length})
            </button>
            <button onClick={() => setCurrentTab('code')} className={`btn ${currentTab === 'code' ? 'btn-primary' : 'btn-ghost'}`}>
               <Code size={16} /> Code Demos ({codeExamples.length})
            </button>
            <button onClick={() => setCurrentTab('exercises')} className={`btn ${currentTab === 'exercises' ? 'btn-primary' : 'btn-ghost'}`}>
               <BookOpen size={16} /> Exercises ({exercises.length})
            </button>
          </div>
        </div>
        
        <Link 
          href={`/admin/lessons/${lessonId}/${currentTab === 'slides' ? 'slides' : currentTab === 'code' ? 'code-examples' : 'exercises'}/new`} 
          className="btn btn-primary" 
          style={{ padding: '12px 24px' }}
        >
          <Plus size={18} /> New {currentTab === 'slides' ? 'Slide' : currentTab === 'code' ? 'Code Demo' : 'Exercise'}
        </Link>
      </header>

      <div className="grid-1" style={{ gap: '16px' }}>
        {/* Slides Tab Content */}
        {currentTab === 'slides' && (
          slides.length === 0 ? (
            <div className="glass-card" style={{ padding: '80px', textAlign: 'center', background: 'white' }}>
              <FileText size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No Slides Yet</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>This lesson has no slides yet.</p>
              <Link href={`/admin/lessons/${lessonId}/slides/new`} className="btn btn-primary">
                 <Plus size={18} /> Create First Slide
              </Link>
            </div>
          ) : (
            slides.map((slide, index) => (
              <div key={slide.id} className="glass-card animate-fadeInUp" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', animationDelay: `${index * 0.05}s`, opacity: isReordering ? 0.6 : 1, background: 'white' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <button onClick={() => moveSlide(index, 'up')} disabled={index === 0 || isReordering} className="btn btn-ghost" style={{ padding: '4px', height: '28px', minWidth: '28px', opacity: index === 0 ? 0.1 : 1 }}><ChevronUp size={20} /></button>
                  <button onClick={() => moveSlide(index, 'down')} disabled={index === slides.length - 1 || isReordering} className="btn btn-ghost" style={{ padding: '4px', height: '28px', minWidth: '28px', opacity: index === slides.length - 1 ? 0.1 : 1 }}><ChevronDown size={20} /></button>
                </div>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--indigo-light)20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <FileText size={28} color="var(--indigo)" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '4px' }}>{slide.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{slide.content.replace(/<[^>]*>/g, '').substring(0, 100)}...</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <button onClick={() => handleDuplicateSlide(slide.id)} className="btn btn-ghost" style={{ padding: '10px', border: '1px solid var(--border)' }} title="Duplicate Slide"><Copy size={18} color="var(--emerald)" /></button>
                   <Link href={`/admin/lessons/${lessonId}/slides/${slide.id}/edit`} className="btn btn-ghost" style={{ padding: '10px', border: '1px solid var(--border)' }}><Edit2 size={18} color="var(--indigo)" /></Link>
                   <button onClick={() => handleDeleteSlide(slide.id)} className="btn btn-ghost" style={{ padding: '10px', border: '1px solid var(--border)' }}><Trash2 size={18} color="var(--rose)" /></button>
                </div>
              </div>
            ))
          )
        )}

        {/* Code Demos Tab Content */}
        {currentTab === 'code' && (
          codeExamples.length === 0 ? (
            <div className="glass-card" style={{ padding: '80px', textAlign: 'center', background: 'white' }}>
              <Code size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No Code Demos</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add interactive code examples to this lesson.</p>
              <Link href={`/admin/lessons/${lessonId}/code-examples/new`} className="btn btn-primary">
                 <Plus size={18} /> Create First Demo
              </Link>
            </div>
          ) : (
            codeExamples.map((example, index) => (
              <div key={example.id} className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', background: 'white' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--emerald-light)20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <Code size={28} color="var(--emerald)" />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '19px', fontWeight: 700, marginBottom: '4px' }}>{example.title}</h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{example.language.toUpperCase()} • {example.code.substring(0, 80)}...</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <button onClick={() => handleDuplicateCode(example.id)} className="btn btn-ghost" style={{ padding: '10px', border: '1px solid var(--border)' }} title="Duplicate Demo"><Copy size={18} color="var(--emerald)" /></button>
                   <Link href={`/admin/lessons/${lessonId}/code-examples/${example.id}/edit`} className="btn btn-ghost" style={{ padding: '10px', border: '1px solid var(--border)' }}><Edit2 size={18} color="var(--emerald)" /></Link>
                   <button onClick={() => handleDeleteCode(example.id)} className="btn btn-ghost" style={{ padding: '10px', border: '1px solid var(--border)' }}><Trash2 size={18} color="var(--rose)" /></button>
                </div>
              </div>
            ))
          )
        )}

        {/* Exercises Tab Content */}
        {currentTab === 'exercises' && (
          exercises.length === 0 ? (
            <div className="glass-card" style={{ padding: '80px', textAlign: 'center', background: 'white' }}>
              <BookOpen size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.3 }} />
              <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>No Exercises</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Add challenges to test student knowledge.</p>
              <Link href={`/admin/lessons/${lessonId}/exercises/new`} className="btn btn-primary">
                 <Plus size={18} /> Create First Exercise
              </Link>
            </div>
          ) : (
            exercises.map((exercise, index) => (
              <div key={exercise.id} className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center', background: 'white' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--amber-light)20', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                   <BookOpen size={28} color="var(--amber)" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '19px', fontWeight: 700 }}>{exercise.title}</h3>
                    <span className={`badge badge-${exercise.difficulty === 'beginner' ? 'emerald' : exercise.difficulty === 'intermediate' ? 'amber' : 'rose'}`} style={{ fontSize: '10px' }}>
                      {exercise.difficulty.toUpperCase()}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>{exercise.question.substring(0, 100)}...</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                   <button onClick={() => handleDuplicateExercise(exercise.id)} className="btn btn-ghost" style={{ padding: '10px', border: '1px solid var(--border)' }} title="Duplicate Exercise"><Copy size={18} color="var(--emerald)" /></button>
                   <Link href={`/admin/lessons/${lessonId}/exercises/${exercise.id}/edit`} className="btn btn-ghost" style={{ padding: '10px', border: '1px solid var(--border)' }}><Edit2 size={18} color="var(--amber)" /></Link>
                   <button onClick={() => handleDeleteExercise(exercise.id)} className="btn btn-ghost" style={{ padding: '10px', border: '1px solid var(--border)' }}><Trash2 size={18} color="var(--rose)" /></button>
                </div>
              </div>
            ))
          )
        )}
      </div>

      {slides.length > 0 && (
         <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <Link href={`/courses`} className="btn btn-ghost" style={{ color: 'var(--text-muted)' }}>
               <PlayCircle size={16} /> Preview Student View
            </Link>
         </div>
      )}
    </div>
  );
}
