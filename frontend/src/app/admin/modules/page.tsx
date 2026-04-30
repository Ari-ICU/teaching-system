"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit2, Trash2, Layers, BookOpen, Clock, ChevronUp, ChevronDown, Save, Search, Filter, Loader2, Copy } from "lucide-react";
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
      (m.image && m.image.toLowerCase().includes(term)) ||
      (m.courses && m.courses.some((c: any) => c.title.toLowerCase().includes(term)));
      
    const matchesCourse = selectedCourseId === "all" || 
                         (m.courses && m.courses.some((c: any) => c.id.toString() === selectedCourseId));
    return matchesSearch && matchesCourse;
  });

  if (authLoading) return null;

  return (
    <div className="page">
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

      <Link href="/admin" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="page-title">Manage Modules</h1>
          <p className="page-subtitle">Organize chapters and lessons for your curriculum.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {isReordering && <Loader2 size={16} className="animate-spin" color="var(--indigo)" />}
          <Link href="/admin/modules/new" className="btn btn-primary">
            <Plus size={16} /> New Module
          </Link>
        </div>
      </header>

      {/* Search & Filter */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '16px', alignItems: 'center', overflow: 'visible', position: 'relative', zIndex: 10 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input 
            type="text" 
            placeholder="Search modules..." 
            className="url-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '48px', background: 'transparent', border: 'none' }}
          />
        </div>
        <div style={{ width: '280px' }}>
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

      <div className="grid-1" style={{ gap: '16px' }}>
        {filteredModules.map((module, index) => (
          <div key={module.id} className="glass-card animate-fadeInUp" style={{ padding: '20px', display: 'flex', gap: '20px', alignItems: 'center', animationDelay: `${index * 0.05}s`, opacity: isReordering ? 0.7 : 1 }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button 
                onClick={() => moveModule(index, 'up')}
                disabled={index === 0 || isReordering}
                className="btn btn-ghost"
                style={{ padding: '4px', height: '28px', minWidth: '28px', opacity: index === 0 ? 0.2 : 1 }}
              >
                <ChevronUp size={18} />
              </button>
              <button 
                onClick={() => moveModule(index, 'down')}
                disabled={index === modules.length - 1 || isReordering}
                className="btn btn-ghost"
                style={{ padding: '4px', height: '28px', minWidth: '28px', opacity: index === modules.length - 1 ? 0.2 : 1 }}
              >
                <ChevronDown size={18} />
              </button>
            </div>

            <div style={{ 
              width: '52px', 
              height: '52px', 
              borderRadius: '12px', 
              background: module.image ? 'transparent' : `${module.color}15`, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              flexShrink: 0,
              overflow: 'hidden'
            }}>
               <ModuleIcon icon={module.icon} imageUrl={module.image} color={module.color} />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 700 }}>{module.title}</h3>
                {module.course && (
                   <span className="badge" style={{ background: `${module.color}15`, color: module.color, border: 'none' }}>
                     {module.course.title}
                   </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BookOpen size={14} /> {module.lessons_count || 0} Lessons</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Position {index + 1}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
               <button onClick={() => handleDuplicate(module.id)} className="btn btn-ghost" style={{ padding: '8px' }} title="Duplicate Module">
                  <Copy size={18} color="var(--emerald)" />
               </button>
               <Link href={`/admin/modules/${module.id}/edit`} className="btn btn-ghost" style={{ padding: '8px' }}>
                  <Edit2 size={18} color="var(--indigo)" />
               </Link>
               <button onClick={() => setDeleteModal({ isOpen: true, id: module.id })} className="btn btn-ghost" style={{ padding: '8px' }}>
                  <Trash2 size={18} color="var(--rose)" />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
