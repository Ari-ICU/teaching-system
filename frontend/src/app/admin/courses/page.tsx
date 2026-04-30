"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, Layout, BookOpen, Layers, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Modal from "@/components/ui/Modal";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { token, user, isLoading: authLoading } = useAuth();
  
  // Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    if (!authLoading && token) fetchCourses();
  }, [token, authLoading]);

  const fetchCourses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/courses`, { 
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/courses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchCourses();
    } catch (error) {
      console.error(error);
    }
  };

  if (authLoading) return null;

  return (
    <div className="page">
      {/* Premium Confirm Modal */}
      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
        title="Delete Course?"
        message="This action is permanent and will delete all modules, lessons, and content associated with this course."
        confirmText="Delete Path"
        type="danger"
      />

      <Link href="/admin" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="page-title">Manage Courses</h1>
          <p className="page-subtitle">Create and organize your high-level learning paths.</p>
        </div>
        <Link href="/admin/courses/new" className="btn btn-primary">
          <Plus size={16} /> New Course
        </Link>
      </header>

      {/* Course List */}
      <div className="grid-1" style={{ gap: '20px' }}>
        {courses.map((course) => (
          <div key={course.id} className="glass-card" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--indigo-light)15', color: 'var(--indigo)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
               {course.image ? (
                 <img 
                   src={course.image.startsWith('http') ? course.image : `${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage'}/${course.image}`} 
                   alt={course.title} 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                 />
               ) : (
                 <Layout size={32} />
               )}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{course.title}</h3>
                <span className="badge badge-indigo">${course.price || '0.00'}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{course.description || "No description provided."}</p>
              
              <div style={{ display: 'flex', gap: '20px', marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)' }}>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Layers size={14} /> {course.modules_count || 0} Modules</span>
                 <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={14} /> Path: /{course.slug}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <Link href={`/admin/courses/${course.id}/edit`} className="btn btn-ghost" style={{ padding: '10px' }}>
                <Edit2 size={18} color="#1a5c2a" />
              </Link>
              {user?.role === 'admin' && (
                <button onClick={() => setDeleteModal({ isOpen: true, id: course.id })} className="btn btn-ghost" style={{ padding: '10px' }}>
                  <Trash2 size={18} color="var(--rose)" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
