"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Trophy, Clock, ArrowRight, Layout } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  const [myCourses, setMyCourses] = useState<any[]>([]);
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
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <h1 className="page-title">Hello, {user?.name}! 👋</h1>
        <p className="page-subtitle">Pick up where you left off in your learning path.</p>
      </header>

      {/* Stats Row */}
      <div className="grid-4" style={{ marginBottom: '40px' }}>
        <div className="stat-card" style={{ borderBottom: '3px solid var(--indigo)' }}>
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, var(--indigo), #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {myCourses.length}
          </div>
          <div className="stat-label">Enrolled Packages</div>
          <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05 }}>
             <Layout size={80} color="var(--indigo)" />
          </div>
        </div>

        <div className="stat-card" style={{ borderBottom: '3px solid var(--emerald)' }}>
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, var(--emerald), #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user?.overall_progress || 0}%
          </div>
          <div className="stat-label">Overall Progress</div>
          <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05 }}>
             <Clock size={80} color="var(--emerald)" />
          </div>
        </div>

        <div className="stat-card" style={{ borderBottom: '3px solid var(--amber)' }}>
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, var(--amber), #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {(user?.experience_points || 0).toLocaleString()}
          </div>
          <div className="stat-label">Experience Points</div>
          <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05 }}>
             <Trophy size={80} color="var(--amber)" />
          </div>
        </div>

        <div className="stat-card" style={{ borderBottom: '3px solid var(--rose)' }}>
          <div className="stat-value" style={{ background: 'linear-gradient(135deg, var(--rose), #f43f5e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user?.learning_streak || 0}
          </div>
          <div className="stat-label">Current Streak</div>
          <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', opacity: 0.05 }}>
             <Trophy size={80} color="var(--rose)" />
          </div>
        </div>
      </div>

      <h2 style={{ fontSize: '20px', marginBottom: '24px', fontWeight: 700 }}>Your Learning Packages</h2>
      
      {myCourses.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', background: 'var(--bg-secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Layout size={40} color="var(--indigo)" />
          </div>
          <h3>No Enrolled Courses</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Please contact your administrator to enroll in a course package.</p>
          <Link href="/modules" className="btn btn-primary" style={{ marginTop: '24px' }}>Explore All Modules</Link>
        </div>
      ) : (
        <div className="grid-2">
          {myCourses.map((course) => (
            <div key={course.id} className="glass-card animate-fadeInUp" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, padding: '12px 20px', background: 'var(--indigo)', color: 'white', fontSize: '12px', fontWeight: 700, borderRadius: '0 0 0 16px' }}>
                ACTIVE
              </div>
              <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '12px' }}>{course.title}</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.6' }}>{course.description || 'Comprehensive learning path including multiple modules and hands-on projects.'}</p>
              
              <div style={{ display: 'flex', gap: '20px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <BookOpen size={16} /> {course.modules_count} Modules
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>
                  <Clock size={16} /> ~24h Content
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ fontWeight: 600 }}>Course Progress</span>
                  <span style={{ color: 'var(--indigo)' }}>45%</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px' }}>
                  <div style={{ width: '45%', height: '100%', background: 'var(--gradient-brand)', borderRadius: '4px' }} />
                </div>
              </div>

              <Link href={`/courses/${course.slug}`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: '50px' }}>
                Continue Learning <ArrowRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
