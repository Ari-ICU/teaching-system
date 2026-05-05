"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, Layout, BookOpen, Layers, Loader2, ChevronRight, GraduationCap } from "lucide-react";
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
      if (res.ok) {
        fetchCourses();
        setDeleteModal({ isOpen: false, id: null });
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-7xl mx-auto space-y-10">
      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
        title="Delete Course?"
        message="This action is permanent and will delete all modules, lessons, and content associated with this course. This cannot be undone."
        confirmText="Delete Curriculum Path"
        type="danger"
      />

      <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium mb-4">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Manage Courses</h1>
          <p className="text-slate-500 text-lg font-medium">Create and organize your high-level learning paths.</p>
        </div>
        <Link href="/admin/courses/new" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
          <Plus size={18} /> New Course
        </Link>
      </header>

      {/* Course List */}
      <div className="space-y-4">
        {courses.map((course, index) => (
          <div 
            key={course.id} 
            className="group bg-white border border-slate-200 rounded-[32px] p-6 flex flex-col md:flex-row items-center gap-8 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="w-24 h-24 rounded-[24px] bg-indigo-50 flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500 border border-slate-100">
               {course.image ? (
                 <img 
                   src={course.image.startsWith('http') ? course.image : `${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage'}/${course.image}`} 
                   alt={course.title} 
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <GraduationCap size={40} className="text-indigo-400" />
               )}
            </div>
            
            <div className="flex-1 min-w-0 space-y-3 text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-3">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{course.title}</h3>
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full border border-indigo-100 uppercase tracking-wider">
                  ${course.price || '0.00'}
                </span>
              </div>
              <p className="text-slate-500 text-base font-medium line-clamp-1">{course.description || "Master this technology from scratch with our professional, hands-on curriculum."}</p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-xs font-black uppercase tracking-widest text-slate-400">
                 <span className="flex items-center gap-1.5 group-hover:text-indigo-400 transition-colors">
                   <Layers size={16} /> {course.modules_count || 0} Modules
                 </span>
                 <span className="flex items-center gap-1.5">
                   <BookOpen size={16} /> /{course.slug}
                 </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link 
                href={`/admin/courses/${course.id}/edit`} 
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-indigo-600 hover:bg-indigo-50 transition-all border border-slate-100"
                title="Edit Course"
              >
                <Edit2 size={20} />
              </Link>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setDeleteModal({ isOpen: true, id: course.id })} 
                  className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
                  title="Delete Course"
                >
                  <Trash2 size={20} />
                </button>
              )}
              <div className="w-px h-10 bg-slate-100 mx-2 hidden md:block" />
              <Link 
                href={`/admin/courses/${course.id}/edit`}
                className="w-12 h-12 flex items-center justify-center rounded-2xl text-slate-300 hover:text-indigo-600 transition-all hidden md:flex"
              >
                <ChevronRight size={24} />
              </Link>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="bg-white border border-slate-200 border-dashed rounded-[40px] p-24 text-center space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner">
              <GraduationCap size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">No courses created yet</h3>
              <p className="text-slate-500 text-lg font-medium max-w-xs mx-auto">Start by creating your first curriculum path to organize your modules and lessons.</p>
            </div>
            <Link href="/admin/courses/new" className="inline-flex items-center justify-center px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
              Create First Course
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
