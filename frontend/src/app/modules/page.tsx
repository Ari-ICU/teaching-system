"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Search, Layout, ChevronRight, GraduationCap } from "lucide-react";
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
        // Teachers & admins: fetch /api/courses (already filtered by teacher_id on backend)
        // This gives proper course-grouped modules view
        fetchTeacherCourses();
      } else {
        router.push('/login');
      }
    }
  }, [token, mounted, authLoading, user]);

  const fetchMyCurriculum = async () => {
    // Guard: never send a request if there's no token
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

      // Token is expired or invalid — log out and redirect
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
    // For teachers & admins: fetch courses from /api/courses (teacher-filtered on backend)
    // The backend already returns only the teacher's courses when teacher token is sent
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

  const fetchPublicModules = async () => {
    // Fallback for unauthenticated users
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/modules`, {
        headers: { 'Accept': 'application/json' }
      });

      const data = await res.json();
      setCourses([{ title: "All Available Modules", modules: data.data || [] }]);
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

  if (isLoading) return null;

  return (
    <div className="page">
      <Link href="/" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="page-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
           <GraduationCap size={24} color="var(--indigo)" />
           <span className="badge badge-indigo">MY LEARNING PATHS</span>
        </div>
        <h1 className="page-title responsive-title">Curriculum Modules</h1>
        <p className="page-subtitle">
          {user?.role === 'student'
            ? "Organized modules from all your enrolled courses."
            : user?.role === 'teacher'
              ? "Modules from the courses assigned to you."
              : "Browse all modules across the platform."}
        </p>
      </header>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '4px', marginBottom: '48px', display: 'flex', alignItems: 'center', background: 'white' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input
            type="text"
            placeholder="Search for a module..."
            className="url-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '56px', height: '56px', fontSize: '16px', background: 'transparent', border: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(40px, 8vw, 60px)' }}>
          {courses.map((course, cIndex) => {
            const filteredModules = course.modules?.filter((m: any) =>
              m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              m.description?.toLowerCase().includes(searchTerm.toLowerCase())
            ) || [];

            if (searchTerm && filteredModules.length === 0) return null;

            return (
              <section key={course.id || cIndex} className="animate-fadeInUp" style={{ animationDelay: `${cIndex * 0.1}s` }}>
                <div className="course-path-header">
                  <div>
                    <h2 style={{ fontSize: 'clamp(20px, 4vw, 24px)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{course.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>{filteredModules.length} Modules in this path</p>
                  </div>
                  {course.slug || course.id ? (
                    <Link href={`/courses/${course.slug || course.id}`} className="view-roadmap-link">
                      View Roadmap <ChevronRight size={16} />
                    </Link>
                  ) : (
                    <Link href="/courses" className="view-roadmap-link">
                      Browse Courses <ChevronRight size={16} />
                    </Link>
                  )}
                </div>

                {filteredModules.length === 0 ? (
                  <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
                    <p style={{ color: 'var(--text-muted)' }}>No modules found in this course.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    <div className="grid-3">
                      {(expandedCourses[course.id] || searchTerm ? filteredModules : filteredModules.slice(0, 6)).map((module: any, mIndex: number) => (
                        <Link
                          href={`/modules/${module.id}`}
                          key={module.id}
                          className="module-card"
                          style={{ '--module-color': module.color } as React.CSSProperties}
                        >
                          <div className="module-icon" style={{ 
                            background: module.image ? 'transparent' : (module.color || 'var(--indigo)'),
                            padding: module.image ? '0' : '12px'
                          }}>
                            <ModuleIcon icon={module.icon} imageUrl={module.image} />
                          </div>
                          <h3 className="module-title">{module.title}</h3>
                          <p className="module-desc">{module.description}</p>
                          <div className="module-meta">
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <BookOpen size={14} /> {module.lessons_count || 0} Lessons
                            </span>
                            <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 700, opacity: 0.6 }}>CHAPTER {mIndex + 1}</span>
                          </div>
                        </Link>
                      ))}
                    </div>

                    {!searchTerm && filteredModules.length > 6 && (
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                        <button 
                          onClick={() => toggleExpandCourse(course.id)} 
                          className="btn btn-ghost"
                          style={{ 
                            padding: '10px 24px', 
                            fontSize: '14px', 
                            fontWeight: 700, 
                            color: 'var(--indigo)',
                            border: '1px solid var(--indigo-light)40',
                            borderRadius: '12px',
                            background: 'white'
                          }}
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
            <div className="glass-card" style={{ padding: 'clamp(40px, 10vw, 80px)', textAlign: 'center' }}>
              <Layout size={48} color="var(--text-muted)" style={{ margin: '0 auto 20px', opacity: 0.3 }} />
              <h3>No Curriculum Found</h3>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>You aren't enrolled in any courses yet.</p>
              <Link href="/courses" className="btn btn-primary" style={{ marginTop: '24px' }}>Browse Marketplace</Link>
            </div>
          )}
        </div>

      <style jsx>{`
        .responsive-title {
          font-size: clamp(28px, 6vw, 36px);
        }
        .course-path-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
          gap: 16px;
        }
        .view-roadmap-link {
          font-size: 13px;
          font-weight: 700;
          color: var(--indigo);
          display: flex;
          align-items: center;
          gap: 4px;
          text-decoration: none;
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .course-path-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .view-roadmap-link {
            padding-top: 8px;
          }
        }
      `}</style>
    </div>
  );
}
