"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, BookOpen, Clock, ChevronUp, ChevronDown, Search, Loader2, PlayCircle, Layers, Copy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import Modal from "@/components/ui/Modal";

export default function AdminLessonsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReordering, setIsReordering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModuleId, setSelectedModuleId] = useState<string>("all");
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

  const filteredLessons = lessons.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModuleId === "all" || l.module_id.toString() === selectedModuleId;
    return matchesSearch && matchesModule;
  });

  if (authLoading) return null;

  return (
    <div className="page">
      {/* Premium Confirm Modal */}
      <Modal 
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => deleteModal.id && handleDelete(deleteModal.id)}
        title="Delete Topic?"
        message="This will delete this lesson and all associated slides, code examples, and exercises. This action is irreversible."
        confirmText="Delete Lesson"
        type="danger"
      />

      <Link href="/admin" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="page-title">Manage Lessons</h1>
          <p className="page-subtitle">Build and organize individual topics within your modules.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isReordering && <Loader2 size={16} className="animate-spin" color="var(--indigo)" />}
          <Link href="/admin/lessons/new" className="btn btn-primary">
            <Plus size={16} /> New Lesson
          </Link>
        </div>
      </header>

      {/* Filters */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center', overflow: 'visible', position: 'relative', zIndex: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input
            type="text"
            placeholder="Search lessons..."
            className="url-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '48px', background: 'transparent', border: 'none' }}
          />
        </div>
        <div style={{ width: '280px' }}>
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

      <div className="grid-1" style={{ gap: '32px' }}>
        {modules.length === 0 && filteredLessons.length === 0 ? (
          <div className="glass-card" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <PlayCircle size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
            <p>No lessons found. Start by creating a new one!</p>
          </div>
        ) : (
          modules
            .filter(m => selectedModuleId === "all" || m.id.toString() === selectedModuleId)
            .map((module) => {
              const moduleLessons = filteredLessons.filter(l => l.module_id === module.id);
              if (moduleLessons.length === 0 && searchTerm) return null;

              return (
                <div key={module.id} className="glass-card" style={{ padding: '0', overflow: 'hidden', background: 'white', border: '1px solid var(--border)', boxShadow: '0 4px 20px -4px rgba(0,0,0,0.05)' }}>
                  {/* Module Header Strip */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    background: `${module.color}08`,
                    borderBottom: '1px solid var(--border)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${module.color}`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 12px ${module.color}40` }}>
                        <Layers size={18} />
                      </div>
                      <div>
                        <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>{module.title}</h2>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {moduleLessons.length} {moduleLessons.length === 1 ? 'Lesson' : 'Lessons'} available
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                       <Link 
                         href={`/admin/lessons/new?module_id=${module.id}`}
                         className="btn btn-ghost" 
                         style={{ 
                           padding: '6px 12px', 
                           fontSize: '12px', 
                           background: 'white', 
                           border: '1px solid var(--border)',
                           color: 'var(--indigo)',
                           fontWeight: 700
                         }}
                       >
                         <Plus size={14} /> Add Lesson
                       </Link>
                       <span className="badge" style={{ background: 'white', border: '1px solid var(--border)', fontSize: '10px' }}>ID: {module.id}</span>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <div style={{ padding: '8px 0' }}>
                    {moduleLessons.length === 0 ? (
                      <div style={{ padding: '40px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
                        No lessons in this module yet.
                      </div>
                    ) : (
                      moduleLessons.map((lesson, index) => (
                        <div key={lesson.id} style={{ 
                          padding: '14px 24px', 
                          display: 'flex', 
                          gap: '20px', 
                          alignItems: 'center', 
                          borderBottom: index === moduleLessons.length - 1 ? 'none' : '1px solid var(--bg-secondary)',
                          transition: 'all 0.2s ease',
                          opacity: isReordering ? 0.7 : 1
                        }} className="lesson-row-hover">
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <button
                              onClick={() => moveLesson(lessons.findIndex(l => l.id === lesson.id), 'up')}
                              disabled={isReordering || index === 0}
                              className="btn btn-ghost"
                              style={{ padding: '2px', height: '20px', minWidth: '20px', opacity: (isReordering || index === 0) ? 0.1 : 0.5 }}
                            >
                              <ChevronUp size={14} />
                            </button>
                            <button
                              onClick={() => moveLesson(lessons.findIndex(l => l.id === lesson.id), 'down')}
                              disabled={isReordering || index === moduleLessons.length - 1}
                              className="btn btn-ghost"
                              style={{ padding: '2px', height: '20px', minWidth: '20px', opacity: (isReordering || index === moduleLessons.length - 1) ? 0.1 : 0.5 }}
                            >
                              <ChevronDown size={14} />
                            </button>
                          </div>

                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <PlayCircle size={16} color="var(--text-muted)" />
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{lesson.title}</h3>
                              {lesson.is_active === false && <span className="badge badge-rose" style={{ fontSize: '9px', padding: '1px 5px' }}>DRAFT</span>}
                            </div>
                            <div style={{ display: 'flex', gap: '16px', marginTop: '2px', fontSize: '12px', color: 'var(--text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={12} /> {lesson.slides_count || 0} Slides</span>
                              {lesson.teacher && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>By {lesson.teacher.name}</span>}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '4px' }}>
                            <Link href={`/admin/lessons/${lesson.id}/slides`} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--indigo)' }} title="Manage Slides">
                              <PlayCircle size={18} />
                            </Link>
                           <button onClick={() => handleDuplicate(lesson.id)} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--emerald)' }} title="Duplicate">
                              <Copy size={18} />
                           </button>
                           <Link href={`/admin/lessons/${lesson.id}/edit`} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--indigo)' }}>
                              <Edit2 size={18} />
                           </Link>
                           <button onClick={() => setDeleteModal({ isOpen: true, id: lesson.id })} className="btn btn-ghost" style={{ padding: '6px', color: 'var(--rose)' }}>
                              <Trash2 size={18} />
                           </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })
        )}
      </div>
    </div>
  );
}
