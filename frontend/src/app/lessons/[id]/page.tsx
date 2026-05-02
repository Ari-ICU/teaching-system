"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Presentation, Code2, LayoutList, AlertCircle } from "lucide-react";
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

      // Fetch all needed data for the lesson in parallel
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
      <div className="page" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto', padding: '40px' }}>
          <AlertCircle size={48} color="var(--rose)" style={{ marginBottom: '20px' }} />
          <h2 style={{ marginBottom: '12px' }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>{error}</p>
          <Link href="/" className="btn btn-primary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!data) return <div className="page">Lesson not found.</div>;

  const { lesson, slides, codeExamples, exercises } = data;
  const currentTab = tab || 'slides';

  return (
    <div className="page" style={{ maxWidth: '1600px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <Link href={`/modules/${lesson.module_id}`} className="btn btn-ghost">
          <ArrowLeft size={16} /> Back to Module
        </Link>
        <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          {lesson.module?.title} / <strong style={{ color: 'var(--text-primary)' }}>{lesson.title}</strong>
        </div>
      </div>

      <header className="lesson-studio-header">
        <div className="header-info">
          <span className="lesson-badge">LESSON MODULE</span>
          <h1 className="lesson-main-title">{lesson.title}</h1>
          <p className="lesson-desc">{lesson.description}</p>
        </div>
        
        <nav className="lesson-tabs">
          <Link href={`/lessons/${lesson.id}?tab=slides`} className={`tab-item ${currentTab === 'slides' ? 'active' : ''}`}>
            <Presentation size={18} /> <span>Presentation</span> <small>{slides.length}</small>
          </Link>
          
          {codeExamples.length > 0 && (
            <Link href={`/lessons/${lesson.id}?tab=code`} className={`tab-item ${currentTab === 'code' ? 'active' : ''}`}>
              <Code2 size={18} /> <span>Code Demos</span> <small>{codeExamples.length}</small>
            </Link>
          )}

          {exercises.length > 0 && (
            <Link href={`/lessons/${lesson.id}?tab=exercises`} className={`tab-item ${currentTab === 'exercises' ? 'active' : ''}`}>
              <LayoutList size={18} /> <span>Challenges</span> <small>{exercises.length}</small>
            </Link>
          )}
        </nav>
      </header>

      <style jsx>{`
        .lesson-studio-header {
          margin-bottom: 40px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .lesson-badge {
          display: inline-block;
          font-size: 10px;
          font-weight: 800;
          color: var(--indigo);
          letter-spacing: 0.15em;
          margin-bottom: 12px;
        }

        .lesson-main-title {
          font-size: 42px;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.03em;
          margin-bottom: 12px;
          line-height: 1.1;
        }

        .lesson-desc {
          font-size: 16px;
          color: #64748b;
          max-width: 800px;
          line-height: 1.6;
        }

        .lesson-tabs {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 16px;
          width: fit-content;
        }

        .tab-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 12px;
          color: #64748b;
          font-weight: 700;
          font-size: 14px;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .tab-item:hover {
          color: #0f172a;
          background: rgba(255,255,255,0.5);
        }

        .tab-item.active {
          background: white;
          color: var(--indigo);
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }

        .tab-item small {
          font-size: 10px;
          background: #e2e8f0;
          color: #94a3b8;
          padding: 2px 6px;
          border-radius: 6px;
          font-weight: 800;
        }

        .tab-item.active small {
          background: rgba(99,102,241,0.1);
          color: var(--indigo);
        }
      `}</style>

      <div style={{ marginTop: '24px' }}>
        {/* Slides Tab */}
        {currentTab === 'slides' && (
          <SlideViewer slides={slides} />
        )}

        {/* Code Demos Tab */}
        {currentTab === 'code' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {codeExamples.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>No code examples for this lesson.</div>
            ) : (
              codeExamples.map((example: any) => (
                <div key={example.id}>
                  <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>{example.title}</h3>
                  <CodeEditor 
                    initialCode={example.code} 
                    language={example.language} 
                    runnable={example.runnable} 
                  />
                </div>
              ))
            )}
          </div>
        )}



        {/* Exercises Tab */}
        {currentTab === 'exercises' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {exercises.length === 0 ? (
              <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>No exercises for this lesson.</div>
            ) : (
              exercises.map((exercise: any) => (
                <div key={exercise.id} className="exercise-card">
                  <div className="exercise-question">
                    <span className={`difficulty-badge difficulty-${exercise.difficulty}`}>
                      {exercise.difficulty.toUpperCase()}
                    </span>
                    <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>{exercise.title}</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>{exercise.question}</p>
                  </div>
                  <div style={{ padding: '24px' }}>
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
