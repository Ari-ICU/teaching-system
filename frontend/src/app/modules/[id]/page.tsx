"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, BarChart, PlayCircle, AlertCircle } from "lucide-react";
import ModuleIcon from "@/components/ModuleIcon";
import CourseRoadmap from "@/components/CourseRoadmap";
import { useAuth } from "@/context/AuthContext";

export default function ModulePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [moduleData, setModuleData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, user, isLoading: authLoading } = useAuth();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchModule();
    }
  }, [id, token, mounted]);

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

  if (!moduleData) return <div className="page">Module not found.</div>;

  return (
    <div className="module-page-container">
      <div className="module-main-content">
        <Link href="/modules" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
          <ArrowLeft size={16} /> Back to Modules
        </Link>

        <header className="page-header glass-card" style={{ padding: '40px', borderTop: `4px solid ${moduleData.color}`, background: `linear-gradient(135deg, white, ${moduleData.color}05)` }}>
          <div className="module-header-info">
            <div className="module-header-icon-wrapper" style={{ background: `${moduleData.color}15`, border: `1px solid ${moduleData.color}20` }}>
              <ModuleIcon icon={moduleData.icon} size={36} color={moduleData.color} />
            </div>
            <div>
              <h1 className="page-title" style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.02em' }}>{moduleData.title}</h1>
              <p className="page-subtitle" style={{ fontSize: '16px', marginTop: '4px', opacity: 0.8 }}>{moduleData.description}</p>
            </div>
          </div>
        </header>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '48px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.01em' }}>Curriculum Lessons</h2>
          <div className="badge badge-indigo">{moduleData.lessons?.length || 0} Total Lessons</div>
        </div>

        <div className="grid-2">
          {moduleData.lessons?.map((lesson: any, index: number) => (
            <div key={lesson.id} className="glass-card animate-fadeInUp" style={{ padding: '28px', animationDelay: `${index * 0.1}s`, borderBottom: `2px solid transparent`, transition: 'all 0.3s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <span className={`badge badge-${lesson.difficulty === 'beginner' ? 'emerald' : lesson.difficulty === 'intermediate' ? 'amber' : 'rose'}`} style={{ marginBottom: '10px' }}>
                    {lesson.difficulty.toUpperCase()}
                  </span>
                  <h3 style={{ fontSize: '19px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    {index + 1}. {lesson.title}
                  </h3>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '14.5px', lineHeight: '1.6', marginBottom: '28px', minHeight: '44px' }}>
                {lesson.description}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={15} /> {lesson.duration || '45 min'}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <BarChart size={15} /> {lesson.difficulty}
                  </span>
                </div>

                <Link href={`/lessons/${lesson.id}`} className="btn btn-primary" style={{ boxShadow: 'var(--shadow-indigo)' }}>
                  <PlayCircle size={18} /> Start
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Specialized Roadmap Aside */}
      <CourseRoadmap course={moduleData.course} />

      <style jsx>{`
        .module-page-container {
          display: flex;
          gap: 0;
          align-items: flex-start;
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(135deg, #f8faff 0%, #ffffff 100%);
        }

        .module-main-content {
          flex: 1;
          padding: 40px;
          min-width: 0;
        }

        .module-header-info {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .module-header-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 20px;
          flex-shrink: 0;
          box-shadow: 0 8px 16px rgba(0,0,0,0.05);
        }

        @media (max-width: 1200px) {
          .module-page-container {
            flex-direction: column;
          }

          .module-main-content {
            width: 100%;
            padding: 30px 20px;
          }
        }

        @media (max-width: 640px) {
          .module-header-info {
            flex-direction: column;
            align-items: flex-start;
          }

          .module-header-icon-wrapper {
            width: 60px;
            height: 60px;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
}
