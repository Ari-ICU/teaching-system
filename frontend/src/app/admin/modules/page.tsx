"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, Layers, BookOpen, Clock, ChevronUp, ChevronDown, Save, Search, Filter, Loader2, Copy, MoreHorizontal, ChevronRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ModuleIcon from "@/components/ModuleIcon";
import Modal from "@/components/ui/Modal";
import DropdownSelect from "@/components/ui/DropdownSelect";

export default function AdminModulesPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("all");
  const { token, user, isLoading: authLoading } = useAuth();

  // Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    if (!authLoading && token) fetchInitialData();
  }, [token, authLoading]);

  const fetchInitialData = async () => {
    await Promise.all([
      fetchModules(),
      fetchCourses()
    ]);
    setIsLoading(false);
  };

  const fetchCourses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/courses`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchModules = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/modules`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error("Failed to fetch modules");
      const data = await res.json();
      setModules(data.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReorder = async (newModules: any[]) => {
    setIsReordering(true);
    setModules(newModules);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      await fetch(`${apiUrl}/modules/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ ordered_ids: newModules.map(m => m.id) })
      });
    } catch (error) {
      console.error(error);
      fetchModules();
    } finally {
      setIsReordering(false);
    }
  };

  const moveModule = (index: number, direction: 'up' | 'down') => {
    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newModules.length) return;
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    handleReorder(newModules);
  };

  const handleDelete = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/modules/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setModules(modules.filter(m => m.id !== id));
        setDeleteModal({ isOpen: false, id: null });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/modules/${id}/duplicate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (res.ok) {
        fetchModules(); // Refresh list
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to duplicate module");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while duplicating");
    }
  };

  const filteredModules = modules.filter(m => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      m.title.toLowerCase().includes(term) ||
      (m.description && m.description.toLowerCase().includes(term)) ||
      (m.courses && m.courses.some((c: any) => c.title.toLowerCase().includes(term)));
      
    const matchesCourse = selectedCourseId === "all" || 
                         (m.courses && m.courses.some((c: any) => c.id.toString() === selectedCourseId));
    return matchesSearch && matchesCourse;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-7xl mx-auto space-y-10">
      {/* Premium Confirm Modal */}
      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
        title="Delete Module?"
        message="This will permanently delete this module and all lessons contained within it. This action cannot be undone."
        confirmText="Delete Module"
        type="danger"
      />

      <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium mb-4">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Manage Modules</h1>
          <p className="text-slate-500 text-lg font-medium">Organize chapters and lessons for your curriculum.</p>
        </div>
        <div className="flex items-center gap-4">
          {isReordering && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
              <Loader2 size={14} className="animate-spin" /> Saving...
            </div>
          )}
          <Link href="/admin/modules/new" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
            <Plus size={18} /> New Module
          </Link>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-4 shadow-sm flex flex-col md:flex-row gap-4 relative z-20">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search modules by title or description..." 
            className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:w-72">
          <DropdownSelect
            options={[
              { value: "all", label: "All Courses" },
              ...courses.map(c => ({ value: c.id.toString(), label: c.title }))
            ]}
            value={selectedCourseId}
            onChange={(value) => setSelectedCourseId(value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
          <div className="flex items-center gap-20">
            <span className="ml-16">Order</span>
            <span>Module Details</span>
          </div>
          <span className="mr-24">Actions</span>
        </div>

        <div className="space-y-3">
          {filteredModules.map((module, index) => (
            <div 
              key={module.id} 
              className={`
                group bg-white border border-slate-200 rounded-[24px] p-4 flex items-center gap-6 shadow-sm 
                hover:shadow-xl hover:border-indigo-500/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4
                ${isReordering ? 'opacity-50 pointer-events-none' : ''}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Order Controls */}
              <div className="flex flex-col gap-1 ml-2">
                <button 
                  onClick={() => moveModule(index, 'up')}
                  disabled={index === 0 || isReordering}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-20 transition-all"
                  title="Move Up"
                >
                  <ChevronUp size={20} strokeWidth={3} />
                </button>
                <button 
                  onClick={() => moveModule(index, 'down')}
                  disabled={index === modules.length - 1 || isReordering}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-20 transition-all"
                  title="Move Down"
                >
                  <ChevronDown size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden relative shadow-inner group-hover:scale-105 transition-transform duration-500`}>
                 <div className="absolute top-0 left-0 w-full h-1" style={{ backgroundColor: module.color }} />
                 <ModuleIcon icon={module.icon} imageUrl={module.image} color={module.color} size={28} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                    {module.title}
                  </h3>
                  {module.courses && module.courses[0] && (
                     <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-wider border border-slate-200">
                       {module.courses[0].title}
                     </span>
                  )}
                </div>
                <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5 group-hover:text-indigo-400 transition-colors">
                    <BookOpen size={14} /> {module.lessons_count || 0} Lessons
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> Step {index + 1}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pr-2">
                 <button 
                    onClick={() => handleDuplicate(module.id)} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-emerald-500 hover:bg-emerald-50 transition-all" 
                    title="Duplicate Module"
                 >
                    <Copy size={18} />
                 </button>
                 <Link 
                    href={`/admin/modules/${module.id}/edit`} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all"
                    title="Edit Module"
                 >
                    <Edit2 size={18} />
                 </Link>
                 <button 
                    onClick={() => setDeleteModal({ isOpen: true, id: module.id })} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
                    title="Delete Module"
                 >
                    <Trash2 size={18} />
                 </button>
                 <div className="w-px h-6 bg-slate-100 mx-2 hidden md:block" />
                 <Link 
                    href={`/admin/modules/${module.id}/edit`}
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all hidden md:flex"
                 >
                    <ChevronRight size={20} />
                 </Link>
              </div>
            </div>
          ))}

          {filteredModules.length === 0 && (
            <div className="bg-white border border-slate-200 border-dashed rounded-[32px] p-20 text-center space-y-6">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                <Search size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900">No modules found</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto">Try adjusting your search terms or course filter to find what you&apos;re looking for.</p>
              </div>
              <button 
                onClick={() => { setSearchTerm(""); setSelectedCourseId("all"); }} 
                className="text-indigo-600 font-black text-sm uppercase tracking-widest hover:text-indigo-700"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
