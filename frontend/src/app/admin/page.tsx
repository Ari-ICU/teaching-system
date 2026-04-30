"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Layout, BookOpen, Layers, Users, CreditCard, ArrowRight, ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { user, token, isLoading: authLoading } = useAuth();
  const router = useRouter();
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
    return null; // Don't show anything during auth redirect
  }

  const adminTools = [
    { name: "Courses", desc: "Top-level curriculum paths", path: "/admin/courses", icon: <Layout size={24} />, color: "var(--indigo)", count: stats.courses },
    { name: "Modules", desc: "Chapters within courses", path: "/admin/modules", icon: <Layers size={24} />, color: "var(--emerald)", count: stats.modules },
    { name: "Lessons", desc: "Individual study topics", path: "/admin/lessons", icon: <BookOpen size={24} />, color: "var(--amber)", count: stats.lessons },
    { name: "Enrollments", desc: "Verify student payments", path: "/admin/enrollments", icon: <CreditCard size={24} />, color: "var(--rose)", count: stats.pendingEnrollments, highlight: stats.pendingEnrollments > 0, adminOnly: true },
    { name: "Students", desc: "Manage user accounts", path: "/admin/users", icon: <Users size={24} />, color: "var(--indigo-light)", count: stats.users },
  ].filter(tool => !tool.adminOnly || user?.role === 'admin');

  return (
    <div className="page">
      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '32px' }}>Admin Command Center</h1>
          <p className="page-subtitle">Welcome back, {user.name}. Here is what is happening with your curriculum.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/admin/courses/new" className="btn btn-ghost">
            <Plus size={16} /> Course
          </Link>
          <Link href="/admin/modules/new" className="btn btn-primary">
            <Plus size={16} /> New Module
          </Link>
        </div>
      </header>

      {/* Stats Quick View */}
      <div className="grid-4" style={{ marginBottom: '40px' }}>
        {adminTools.slice(0, 4).map((tool) => (
          <div 
            key={tool.name} 
            className="glass-card hover-scale" 
            style={{ 
              padding: '28px 24px', 
              position: 'relative',
              background: 'white',
              border: '1px solid var(--border)',
              borderRadius: '24px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)'
            }}
          >
            {/* Premium Accent Bar */}
            <div style={{ 
              position: 'absolute', 
              top: '24px', 
              left: 0, 
              width: '4px', 
              height: '40px', 
              background: tool.color,
              borderRadius: '0 4px 4px 0',
              boxShadow: `4px 0 12px ${tool.color}40`
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '14px', 
                background: `${tool.color}10`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: tool.color
              }}>
                {tool.icon}
              </div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-1px' }}>{tool.count}</div>
            </div>
            <div style={{ marginTop: '20px' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>{tool.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px', fontWeight: 500 }}>{tool.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
        {/* Main Management Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '4px' }}>Curriculum Management</h2>
          <div className="grid-2">
            {adminTools.map((tool) => (
              <Link href={tool.path} key={tool.name} className="glass-card hover-scale" style={{ padding: '24px', textDecoration: 'none', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: `${tool.color}15`, color: tool.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {tool.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)' }}>{tool.name}</h3>
                    {tool.highlight && <span className="badge badge-rose" style={{ fontSize: '10px' }}>ACTION REQ.</span>}
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '4px', fontWeight: 500 }}>{tool.desc}</p>
                </div>
                <ArrowRight size={20} color="var(--border)" />
              </Link>
            ))}
          </div>
        </div>

        {/* Action Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           {user?.role === 'admin' && (
             <div className="glass-card" style={{ padding: '24px', background: 'var(--indigo)', color: 'white' }}>
                <ShieldCheck size={32} style={{ marginBottom: '16px', opacity: 0.8 }} />
                <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>Verification Queue</h3>
                <p style={{ fontSize: '13px', opacity: 0.8, marginBottom: '20px' }}>There are {stats.pendingEnrollments} students waiting for invoice approval.</p>
                <Link href="/admin/enrollments" className="btn" style={{ background: 'white', color: 'var(--indigo)', width: '100%', justifyContent: 'center' }}>Review Invoices</Link>
             </div>
           )}

           <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} /> Recent Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--emerald)', marginTop: '4px' }}></div>
                    <div>
                       <div style={{ fontWeight: 600 }}>Module Created</div>
                       <div style={{ color: 'var(--text-muted)' }}>&quot;Laravel API&quot; by You</div>
                    </div>
                 </div>
                 <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--amber)', marginTop: '4px' }}></div>
                    <div>
                       <div style={{ fontWeight: 600 }}>Lesson Updated</div>
                       <div style={{ color: 'var(--text-muted)' }}>&quot;Auth Basics&quot; in Laravel</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
