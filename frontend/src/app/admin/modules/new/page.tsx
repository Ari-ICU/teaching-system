"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Loader2, AlertCircle, CheckCircle2, Layout } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import Toast from "@/components/ui/Toast";

export default function NewModulePage() {
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "globe",
    color: "#6366f1",
    course_ids: [] as string[]
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!authLoading && token) fetchCourses();
  }, [token, authLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const fetchCourses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/courses`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      setCourses(data.data || []);
    } catch (error) { console.error(error); }
  };

  const toggleCourse = (courseId: string) => {
    setFormData(prev => {
      const ids = [...prev.course_ids];
      if (ids.includes(courseId)) return { ...prev, course_ids: ids.filter(id => id !== courseId) };
      return { ...prev, course_ids: [...ids, courseId] };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.course_ids.length === 0) {
        alert("Please select at least one parent course.");
        return;
    }
    setStatus("saving");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('icon', formData.icon);
      data.append('color', formData.color);
      formData.course_ids.forEach(id => data.append('course_ids[]', id));
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch(`${apiUrl}/modules`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: data,
      });

      if (!res.ok) throw new Error("Failed to create module");

      setShowToast(true);
      setTimeout(() => {
        router.push("/admin/modules");
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
      <Toast show={showToast} message="Module created successfully!" onClose={() => setShowToast(false)} />
      <Link href="/admin/modules" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Modules
      </Link>

      <header className="page-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
           <Plus size={24} color="var(--indigo)" />
           <span className="badge badge-indigo">NEW CHAPTER</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '32px' }}>Create New Module</h1>
        <p className="page-subtitle">Add a new chapter to your courses and organize lessons within it.</p>
      </header>

      <form className="glass-card" style={{ padding: '40px', background: 'white' }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          {/* Module Logo Upload */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '16px' }}>
            <div style={{ 
              width: '80px', 
              height: '80px', 
              borderRadius: '16px', 
              background: 'white', 
              border: '2px dashed var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0
            }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '8px' }} />
              ) : (
                <Layout size={24} color="var(--text-muted)" style={{ opacity: 0.5 }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>MODULE LOGO (OPTIONAL)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} id="module-logo" />
              <label htmlFor="module-logo" className="btn btn-ghost" style={{ border: '1px solid var(--border)', background: 'white', padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}>
                Upload Icon Image
              </label>
              <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                Recommended: PNG with transparent background.
              </p>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Module Title</label>
            <input 
              type="text" required className="url-input" 
              placeholder="e.g. Introduction to React Hooks"
              style={{ width: '100%', padding: '14px' }}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 700 }}>Parent Courses (Select all that apply)</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
               {courses.map(course => (
                 <div key={course.id} onClick={() => toggleCourse(course.id.toString())} className="glass-card" 
                    style={{ padding: '12px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px',
                      border: formData.course_ids.includes(course.id.toString()) ? '2px solid var(--indigo)' : '1px solid var(--border)',
                      background: formData.course_ids.includes(course.id.toString()) ? 'var(--indigo-light)05' : 'transparent',
                      transition: 'all 0.2s' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: formData.course_ids.includes(course.id.toString()) ? 'var(--indigo)' : 'white',
                      borderColor: formData.course_ids.includes(course.id.toString()) ? 'var(--indigo)' : 'var(--border)' }}>
                       {formData.course_ids.includes(course.id.toString()) && <CheckCircle2 size={14} color="white" />}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{course.title}</span>
                 </div>
               ))}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Description</label>
            <textarea required className="url-input" 
              placeholder="Provide a brief overview of what students will learn in this module..."
              style={{ width: '100%', minHeight: '100px', resize: 'vertical', padding: '16px', lineHeight: '1.6' }}
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Visual Icon (Fallback)</label>
              <DropdownSelect 
                options={[
                  { value: "globe", label: "Globe (Web)" },
                  { value: "palette", label: "Palette (CSS)" },
                  { value: "zap", label: "Zap (JS)" },
                  { value: "server", label: "Server (Backend)" },
                  { value: "database", label: "Database" },
                  { value: "code", label: "Code" },
                  { value: "layers", label: "Layers" },
                  { value: "shield", label: "Shield (Auth)" }
                ]}
                value={formData.icon}
                onChange={(value) => setFormData({...formData, icon: value})}
              />
              <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>Used if no image logo is uploaded.</p>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Module Theme Color</label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <input type="color" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})}
                  style={{ width: '56px', height: '48px', padding: '4px', cursor: 'pointer', borderRadius: '12px', border: '1px solid var(--border)' }} />
                <input type="text" className="url-input" value={formData.color} onChange={(e) => setFormData({...formData, color: e.target.value})}
                  style={{ flex: 1, padding: '14px', fontFamily: 'monospace' }} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Link href="/admin/modules" className="btn btn-ghost" style={{ padding: '14px 24px' }}>Cancel</Link>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px' }} disabled={status === "saving"}>
            {status === "saving" ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{status === "saving" ? "Creating..." : "Create Module"}</span>
          </button>
        </div>
        
        {status === "error" && (
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--rose-light)', color: 'var(--rose)', borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} />
            <span><strong>Error:</strong> Failed to create module. Please check your connection and try again.</span>
          </div>
        )}
      </form>
    </div>
  );
}
