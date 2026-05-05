"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, BookOpen, Clock, ChevronUp, ChevronDown, Search, Loader2, PlayCircle, Layers, Copy, MoreHorizontal, ChevronRight, CheckCircle2, Layout, Zap, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import Modal from "@/components/ui/Modal";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
export default function AdminLessonsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    }>
      <LessonsContent />
    </Suspense>
  );
}

function LessonsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [lessons, setLessons] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  
  // Initialize from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [selectedModuleId, setSelectedModuleId] = useState<string>(searchParams.get("module") || "all");
  
  const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>({});
  const [showFullModules, setShowFullModules] = useState<Record<number, boolean>>({});
  const { token, user, isLoading: authLoading } = useAuth();

  // Modal State
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({
    isOpen: false,
    id: null
  });

  useEffect(() => {
    if (!authLoading && token) {
      fetchInitialData();
    }
  }, [token, authLoading]);

  // Update URL when filters change
  useEffect(() => {
    const currentSearch = searchParams.get("search") || "";
    const currentModule = searchParams.get("module") || "all";

    // Only update if state actually differs from URL to prevent infinite loops
    if (searchTerm === currentSearch && selectedModuleId === currentModule) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (searchTerm) params.set("search", searchTerm);
    else params.delete("search");
    
    if (selectedModuleId !== "all") params.set("module", selectedModuleId);
    else params.delete("module");

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    
    router.replace(url, { scroll: false });
  }, [searchTerm, selectedModuleId, pathname, router, searchParams]);

  const fetchInitialData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

      // Fetch Lessons
      const lessonsRes = await fetch(`${apiUrl}/admin/lessons`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const lessonsData = await lessonsRes.json();
      setLessons(lessonsData.data || []);

      // Fetch Modules for filtering
      const modulesRes = await fetch(`${apiUrl}/admin/modules`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const modulesData = await modulesRes.json();
      setModules(modulesData.data || []);

    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReorder = async (newLessons: any[]) => {
    setIsReordering(true);
    setLessons(newLessons);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/lessons/reorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ordered_ids: newLessons.map(l => l.id)
        })
      });
      if (!res.ok) throw new Error("Reorder failed");
    } catch (error) {
      console.error(error);
      fetchInitialData();
    } finally {
      setIsReordering(false);
    }
  };

  const moveLesson = (index: number, direction: 'up' | 'down') => {
    const visibleLessons = [...filteredLessons];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= visibleLessons.length) return;

    [visibleLessons[index], visibleLessons[targetIndex]] = [visibleLessons[targetIndex], visibleLessons[index]];

    const newFullLessons = [...lessons];
    const item1 = visibleLessons[index];
    const item2 = visibleLessons[targetIndex];

    const globalIdx1 = newFullLessons.findIndex(l => l.id === item1.id);
    const globalIdx2 = newFullLessons.findIndex(l => l.id === item2.id);

    [newFullLessons[globalIdx1], newFullLessons[globalIdx2]] = [newFullLessons[globalIdx2], newFullLessons[globalIdx1]];

    handleReorder(newFullLessons);
  };

  const handleDelete = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/lessons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setLessons(lessons.filter(l => l.id !== id));
        setDeleteModal({ isOpen: false, id: null });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDuplicate = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/lessons/${id}/duplicate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      if (res.ok) {
        fetchInitialData(); // Refresh list
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to duplicate lesson");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred while duplicating");
    }
  };

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const toggleFullModule = (moduleId: number) => {
    setShowFullModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const filteredLessons = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModuleId === "all" || l.module_id.toString() === selectedModuleId;
    return matchesSearch && matchesModule;
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 min-w-full mx-auto space-y-10">
      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
        title="Delete Topic?"
        message="This will delete this lesson and all associated slides, code examples, and exercises. This action is irreversible."
        confirmText="Delete Lesson"
        type="danger"
      />

      <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium mb-4">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Manage Lessons</h1>
          <p className="text-slate-500 text-lg font-medium">Build and organize individual topics within your modules.</p>
        </div>
        <div className="flex items-center gap-4">
          {isReordering && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
              <Loader2 size={14} className="animate-spin" /> Reordering...
            </div>
          )}
          <Link href="/admin/lessons/new" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
            <Plus size={18} /> New Lesson
          </Link>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-4 shadow-sm flex flex-col md:flex-row gap-4 relative z-20">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search lessons by title..." 
            className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="md:w-72">
          <DropdownSelect
            options={[
              { value: "all", label: "All Modules" },
              ...modules.map(m => ({ value: m.id.toString(), label: m.title }))
            ]}
            value={selectedModuleId}
            onChange={(value) => setSelectedModuleId(value)}
          />
        </div>
      </div>

      <div className="space-y-10">
        {modules.length === 0 && filteredLessons.length === 0 ? (
          <div className="bg-white border border-slate-200 border-dashed rounded-[40px] p-24 text-center space-y-6">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 shadow-inner">
              <PlayCircle size={48} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-900">No lessons found</h3>
              <p className="text-slate-500 text-lg font-medium max-w-sm mx-auto">Start building your curriculum by creating your first lesson or adjusting filters.</p>
            </div>
            <Link href="/admin/lessons/new" className="inline-flex items-center justify-center px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
              Create New Lesson
            </Link>
          </div>
        ) : (
          modules
            .filter(m => selectedModuleId === "all" || m.id.toString() === selectedModuleId)
            .map((module, mIdx) => {
              const moduleLessons = filteredLessons.filter(l => l.module_id === module.id);
              if (moduleLessons.length === 0 && searchTerm) return null;

              // Auto-expand if searching or if only one module is shown
              const isSearching = searchTerm.length > 0;
              const isSingleModule = selectedModuleId !== "all";
              const isExpanded = expandedModules[module.id] ?? (isSearching || isSingleModule);
              const isFull = showFullModules[module.id] || false;
              const displayLessons = isFull ? moduleLessons : moduleLessons.slice(0, 5);
              const hasMore = moduleLessons.length > 5;

              return (
                <div key={module.id} className="animate-in fade-in slide-in-from-bottom-6 duration-500" style={{ animationDelay: `${mIdx * 100}ms` }}>
                  {/* Module Header Strip */}
                  <div 
                    className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 px-4 group/header cursor-pointer"
                    onClick={() => toggleModule(module.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transition-all group-hover/header:scale-110 group-hover/header:rotate-3" 
                        style={{ backgroundColor: module.color || '#6366f1' }}
                      >
                        <Layers size={22} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5 flex items-center gap-2">
                          Module {mIdx + 1}
                          {!isExpanded && <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">Collapsed</span>}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-3 group-hover/header:text-indigo-600 transition-colors">
                          {module.title}
                          <motion.div
                            animate={{ rotate: isExpanded ? 0 : 180 }}
                            transition={{ duration: 0.3 }}
                          >
                            <ChevronUp size={20} className="text-slate-300" />
                          </motion.div>
                        </h2>
                      </div>
                    </div>
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                       <Link 
                         href={`/admin/lessons/new?module_id=${module.id}`}
                         className="px-4 py-2 bg-white border border-slate-200 text-indigo-600 font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 text-sm shadow-sm"
                       >
                         <Plus size={16} /> Add Lesson
                       </Link>
                       <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black rounded-full uppercase tracking-wider border border-slate-200">
                         {moduleLessons.length} {moduleLessons.length === 1 ? 'Topic' : 'Topics'}
                       </span>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm divide-y divide-slate-100">
                          {moduleLessons.length === 0 ? (
                            <div className="p-12 text-center">
                              <p className="text-slate-400 font-medium italic">No lessons in this module yet.</p>
                            </div>
                          ) : (
                            <>
                              {displayLessons.map((lesson, index) => (
                                <div 
                                  key={lesson.id} 
                                  className={`
                                    group flex items-center gap-6 p-6 hover:bg-slate-50/50 transition-all duration-300
                                    ${isReordering ? 'opacity-50 pointer-events-none' : ''}
                                  `}
                                >
                                  {/* Order Controls */}
                                  <div className="flex flex-col gap-1 shrink-0 ml-2">
                                    <button
                                      onClick={() => moveLesson(lessons.findIndex(l => l.id === lesson.id), 'up')}
                                      disabled={isReordering || index === 0}
                                      className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-10 transition-all"
                                    >
                                      <ChevronUp size={20} strokeWidth={3} />
                                    </button>
                                    <button
                                      onClick={() => moveLesson(lessons.findIndex(l => l.id === lesson.id), 'down')}
                                      disabled={isReordering || index === moduleLessons.length - 1}
                                      className="p-1.5 rounded-lg text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 disabled:opacity-10 transition-all"
                                    >
                                      <ChevronDown size={20} strokeWidth={3} />
                                    </button>
                                  </div>

                                  {/* Icon/Visual */}
                                  <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform">
                                    <PlayCircle size={28} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                      <h3 className="text-lg font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors truncate">
                                        {lesson.title}
                                      </h3>
                                      {lesson.is_active === false && (
                                        <span className="px-2 py-0.5 bg-rose-50 text-rose-500 text-[9px] font-black rounded-full uppercase tracking-wider border border-rose-100">
                                          Draft
                                        </span>
                                      )}
                                      {lesson.is_active !== false && (
                                        <CheckCircle2 className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" size={16} />
                                      )}
                                    </div>
                                    <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                                      <span className="flex items-center gap-1.5 group-hover:text-indigo-400 transition-colors">
                                        <Zap size={14} className="text-amber-400" /> {lesson.slides_count || 0} Content Slides
                                      </span>
                                      <span className="flex items-center gap-1.5">
                                        <Clock size={14} /> Step {index + 1}
                                      </span>
                                      {lesson.teacher && (
                                        <span className="hidden md:flex items-center gap-1.5 border-l border-slate-200 pl-6">
                                          By {lesson.teacher.name}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 pr-2">
                                     <Link 
                                        href={`/admin/lessons/${lesson.id}/slides`} 
                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all" 
                                        title="Edit Slides"
                                     >
                                        <Layout size={20} />
                                     </Link>
                                     <button 
                                        onClick={() => handleDuplicate(lesson.id)} 
                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-emerald-500 hover:bg-emerald-50 transition-all" 
                                        title="Duplicate Lesson"
                                     >
                                        <Copy size={18} />
                                     </button>
                                     <Link 
                                        href={`/admin/lessons/${lesson.id}/edit`} 
                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                                     >
                                        <Edit2 size={18} />
                                     </Link>
                                     <button 
                                        onClick={() => setDeleteModal({ isOpen: true, id: lesson.id })} 
                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition-all"
                                     >
                                        <Trash2 size={18} />
                                     </button>
                                     <div className="w-px h-6 bg-slate-100 mx-2 hidden lg:block" />
                                     <Link 
                                        href={`/admin/lessons/${lesson.id}/slides`}
                                        className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 transition-all hidden lg:flex"
                                     >
                                        <ChevronRight size={22} />
                                     </Link>
                                  </div>
                                </div>
                              ))}
                              {hasMore && (
                                <button 
                                  onClick={() => toggleFullModule(module.id)}
                                  className="w-full py-4 text-sm font-bold text-indigo-600 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                                >
                                  {isFull ? (
                                    <>Show Less <ChevronUp size={16} /></>
                                  ) : (
                                    <>See More ({moduleLessons.length - 5} more) <ChevronDown size={16} /></>
                                  )}
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
