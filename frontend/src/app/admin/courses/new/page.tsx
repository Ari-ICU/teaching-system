"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, Layout, GraduationCap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Toast from "@/components/ui/Toast";
import TeacherDropdown from "@/components/admin/TeacherDropdown";

export default function NewCoursePage() {
  const router = useRouter();
  const { token, user } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "0",
    order: 0,
    is_active: true,
    teacher_id: "",
  });

  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [mounted, setMounted] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => { 
    setMounted(true); 
    if (token && user?.role === 'admin') {
      fetchTeachers();
    }
  }, [token, user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const fetchTeachers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (data.data) {
        setTeachers(data.data.filter((u: any) => u.role === 'teacher'));
      }
    } catch (err) {
      console.error("Failed to fetch teachers", err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('price', formData.price);
      data.append('order', formData.order.toString());
      data.append('is_active', formData.is_active ? '1' : '0');
      if (formData.teacher_id) {
        data.append('teacher_id', formData.teacher_id);
      }
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch(`${apiUrl}/admin/courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: data,
      });

      if (!res.ok) throw new Error("Failed to create course");

      setShowToast(true);
      setTimeout(() => {
        router.push("/admin/courses");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (!mounted) return null;

  return (
    <div className="page" style={{ maxWidth: '860px', margin: '0 auto' }}>
      <Toast 
        show={showToast} 
        message="Course created successfully!" 
        onClose={() => setShowToast(false)} 
      />

      <Link href="/admin/courses" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Courses
      </Link>

      <header className="page-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <GraduationCap size={24} color="#1a5c2a" />
          <span className="badge" style={{ background: 'rgba(13,61,31,0.1)', color: '#1a5c2a', fontSize: '11px', fontWeight: 700 }}>NEW COURSE</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '32px' }}>Create New Learning Path</h1>
        <p className="page-subtitle">Define a high-level curriculum track for your students to enroll in.</p>
      </header>

      <form className="glass-card" style={{ padding: '40px', background: 'white' }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Logo Upload */}
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            <div style={{ 
              width: '120px', 
              height: '120px', 
              borderRadius: '20px', 
              background: 'var(--bg-secondary)', 
              border: '2px dashed var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              position: 'relative'
            }}>
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Layout size={32} color="var(--text-muted)" style={{ opacity: 0.5 }} />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>COURSE LOGO (OPTIONAL)</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="course-logo"
              />
              <label 
                htmlFor="course-logo" 
                className="btn btn-ghost" 
                style={{ border: '1px solid var(--border)', background: 'white', padding: '10px 20px', fontSize: '13px', cursor: 'pointer' }}
              >
                Choose Image
              </label>
              <p style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                Upload a brand logo for this course (e.g. HTML5, CSS3, or Laravel logo). Best size is 256x256px.
              </p>
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>COURSE TITLE</label>
            <input
              type="text"
              required
              className="url-input"
              placeholder="e.g. Full-Stack Web Development with Laravel & Next.js"
              style={{ width: '100%', padding: '16px', fontSize: '18px', fontWeight: 600 }}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>DESCRIPTION</label>
            <textarea
              required
              className="url-input"
              placeholder="Describe what students will achieve by the end of this course. What skills will they gain?"
              style={{ width: '100%', minHeight: '140px', resize: 'vertical', padding: '16px', lineHeight: '1.7', fontSize: '15px', fontFamily: 'inherit' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Price + Order */}
          <div className="grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>PRICE (USD)</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontWeight: 700, color: 'var(--text-muted)', fontSize: '16px' }}>$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="url-input"
                  style={{ width: '100%', padding: '16px 16px 16px 32px' }}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>DISPLAY ORDER</label>
              <input
                type="number"
                min="0"
                className="url-input"
                style={{ width: '100%', padding: '16px' }}
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          {user?.role === 'admin' && (
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>ASSIGN INSTRUCTOR</label>
              <TeacherDropdown 
                teachers={teachers}
                selectedId={formData.teacher_id}
                onSelect={(id) => setFormData({ ...formData, teacher_id: id })}
              />
              <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>Assigning a teacher allows them to manage this course's curriculum.</p>
            </div>
          )}

          {/* Publish toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0d3d1f' }}
            />
            <label htmlFor="is_active" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
              Publish course immediately — visible on the marketplace
            </label>
          </div>

        </div>

        {/* Actions */}
        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Link href="/admin/courses" className="btn btn-ghost" style={{ padding: '14px 24px' }}>Cancel</Link>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 36px' }} disabled={status === "saving"}>
            {status === "saving" ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{status === "saving" ? "Creating..." : "Create Course"}</span>
          </button>
        </div>

        {status === "error" && (
          <div style={{ marginTop: '24px', padding: '16px', background: '#fee2e2', color: '#dc2626', borderRadius: '12px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} />
            <span><strong>Error:</strong> Failed to create course. Please try again.</span>
          </div>
        )}
      </form>
    </div>
  );
}
