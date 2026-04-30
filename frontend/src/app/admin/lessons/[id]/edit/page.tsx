"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import Toast from "@/components/ui/Toast";

export default function EditLessonPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
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

  const [status, setStatus] = useState<"loading_initial" | "idle" | "saving" | "error" | "not_found">("loading_initial");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
        fetchInitialData();
    }
  }, [id, token, authLoading]);

  const fetchInitialData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const modsRes = await fetch(`${apiUrl}/admin/modules`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (modsRes.ok) {
        const modsData = await modsRes.json();
        setModules(modsData.data || []);
      }

      const lessonRes = await fetch(`${apiUrl}/lessons/${id}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      if (!lessonRes.ok) {
        if (lessonRes.status === 404) { setStatus("not_found"); return; }
        throw new Error("Failed to fetch lesson");
      }
      const lessonData = await lessonRes.json();
      
      setFormData({
        module_id: lessonData.data.module_id?.toString() || "",
        title: lessonData.data.title || "",
        description: lessonData.data.description || "",
        difficulty: lessonData.data.difficulty || "beginner",
        duration: lessonData.data.duration || "45 min",
        is_active: !!lessonData.data.is_active
      });
      
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/lessons/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update lesson");

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

  if (status === "not_found") {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '100px' }}>
        <AlertCircle size={64} color="var(--rose)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Lesson Not Found</h2>
        <Link href="/admin/lessons" className="btn btn-primary" style={{ marginTop: '32px' }}>Back to Lessons</Link>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <Toast show={showToast} message="Lesson updated successfully!" onClose={() => setShowToast(false)} />
      <Link href="/admin/lessons" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Lessons
      </Link>

      <header className="page-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
           <PlayCircle size={24} color="var(--indigo)" />
           <span className="badge badge-indigo">EDIT TOPIC</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '32px' }}>Edit Lesson</h1>
        <p className="page-subtitle">Refine the title, description, and sequence of this lesson.</p>
      </header>

      <form className="glass-card" style={{ padding: '40px', background: 'white' }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Parent Module</label>
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
              style={{ width: '100%', padding: '14px' }}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Brief Description</label>
            <textarea required className="url-input" 
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
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Estimated Duration</label>
              <input 
                type="text" className="url-input" 
                style={{ width: '100%', padding: '14px' }}
                placeholder="e.g. 45 min"
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
            <label htmlFor="is_active" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Lesson is published and visible to students</label>
          </div>
        </div>

        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Link href="/admin/lessons" className="btn btn-ghost" style={{ padding: '14px 24px' }}>Cancel</Link>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px' }} disabled={status === "saving"}>
            {status === "saving" ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{status === "saving" ? "Updating..." : "Save Changes"}</span>
          </button>
        </div>
        
        {status === "error" && (
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--rose-light)', color: 'var(--rose)', borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} />
            <span><strong>Error:</strong> Failed to save changes. Please check your connection and try again.</span>
          </div>
        )}
      </form>
    </div>
  );
}
