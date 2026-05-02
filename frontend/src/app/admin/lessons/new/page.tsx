"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import Toast from "@/components/ui/Toast";

export default function NewLessonPage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [modules, setModules] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    module_id: "",
    title: "",
    description: "",
    difficulty: "beginner",
    duration: "45 min",
    is_active: true
  });

  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
        fetchModules();
    }
  }, [token, authLoading]);

  const fetchModules = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/modules`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        const mods = data.data || [];
        setModules(mods);
        
        // Check for module_id in query params
        const urlParams = new URLSearchParams(window.location.search);
        const queryModuleId = urlParams.get('module_id');

        if (queryModuleId) {
          setFormData(prev => ({ ...prev, module_id: queryModuleId }));
        } else if (mods.length > 0) {
          setFormData(prev => ({ ...prev, module_id: mods[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch modules", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.module_id) {
        setStatus("error");
        return;
    }
    setStatus("saving");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create lesson");

      setShowToast(true);
      setTimeout(() => {
        router.push("/admin/lessons");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (authLoading) return null;

  return (
    <div className="page" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <Toast show={showToast} message="Lesson created successfully!" onClose={() => setShowToast(false)} />
      
      <Link href="/admin/lessons" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Lessons
      </Link>

      <header className="page-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
           <PlayCircle size={24} color="var(--indigo)" />
           <span className="badge badge-indigo">NEW TOPIC</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '32px' }}>Create New Lesson</h1>
        <p className="page-subtitle">Add a specific teaching topic to your curriculum module.</p>
      </header>

      <form className="glass-card" style={{ padding: '40px', background: 'white' }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Select Parent Module</label>
            <DropdownSelect 
              options={modules.map(mod => ({ value: mod.id.toString(), label: mod.title }))}
              value={formData.module_id}
              onChange={(value) => setFormData({...formData, module_id: value})}
              placeholder="Select a module..."
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Lesson Title</label>
            <input 
              type="text" required className="url-input" 
              placeholder="e.g. Deep Dive into React Hooks"
              style={{ width: '100%', padding: '14px' }}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Brief Summary</label>
            <textarea required className="url-input" 
              placeholder="Provide a clear overview of what students will achieve in this lesson..."
              style={{ width: '100%', minHeight: '100px', resize: 'vertical', padding: '16px', lineHeight: '1.6' }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Difficulty Level</label>
              <DropdownSelect 
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" }
                ]}
                value={formData.difficulty}
                onChange={(value) => setFormData({...formData, difficulty: value})}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Estimated Time</label>
              <input 
                type="text" className="url-input" 
                placeholder="e.g. 30 min"
                style={{ width: '100%', padding: '14px' }}
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <input 
               type="checkbox" id="is_active"
               checked={formData.is_active}
               onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
               style={{ width: '20px', height: '20px', cursor: 'pointer' }}
            />
            <label htmlFor="is_active" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Publish lesson immediately</label>
          </div>
        </div>

        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Link href="/admin/lessons" className="btn btn-ghost" style={{ padding: '14px 24px' }}>Cancel</Link>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px' }} disabled={status === "saving"}>
            {status === "saving" ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{status === "saving" ? "Creating..." : "Create Lesson"}</span>
          </button>
        </div>
        
        {status === "error" && (
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--rose-light)', color: 'var(--rose)', borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} />
            <span><strong>Error:</strong> Failed to save the lesson. Please check your connection and try again.</span>
          </div>
        )}
      </form>
    </div>
  );
}
