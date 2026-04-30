"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle, Shield, Plus } from "lucide-react";
import DropdownSelect from "@/components/ui/DropdownSelect";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "student",
    course_ids: [] as number[]
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/courses`);
      const data = await res.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const handleCourseToggle = (id: number) => {
    setFormData(prev => {
      const current = prev.course_ids;
      if (current.includes(id)) {
        return { ...prev, course_ids: current.filter(cid => cid !== id) };
      } else {
        return { ...prev, course_ids: [...current, id] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to register");
      }

      login(data.access_token, data.user);
      router.push(data.user.role === 'admin' || data.user.role === 'teacher' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '90vh', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div className="glass-card animate-fadeInUp" style={{ width: '100%', maxWidth: '450px', padding: '40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--gradient-brand)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'white', boxShadow: 'var(--shadow-lg)' }}>
            <UserPlus size={32} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '8px' }}>Join the teaching platform today</p>
        </div>

        {error && (
          <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #fecaca' }}>
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <UserIcon style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="text" 
                required 
                className="url-input" 
                style={{ width: '100%', paddingLeft: '44px', height: '48px', background: 'white' }}
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="email" 
                required 
                className="url-input" 
                style={{ width: '100%', paddingLeft: '44px', height: '48px', background: 'white' }}
                placeholder="teacher@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</label>
              <div style={{ position: 'relative' }}>
                <Shield style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 10 }} size={18} />
                <DropdownSelect 
                  options={[
                    { value: "student", label: "Student" },
                    { value: "teacher", label: "Teacher" }
                  ]}
                  value={formData.role}
                  onChange={(value) => setFormData({...formData, role: value})}
                  style={{ paddingLeft: '44px', height: '48px' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                <input 
                  type="password" 
                  required 
                  className="url-input" 
                  style={{ width: '100%', paddingLeft: '44px', height: '48px', background: 'white' }}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                <input 
                  type="password" 
                  required 
                  className="url-input" 
                  style={{ width: '100%', paddingLeft: '44px', height: '48px', background: 'white' }}
                  placeholder="••••••••"
                  value={formData.password_confirmation}
                  onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                />
              </div>
            </div>
          </div>

          {formData.role === 'student' && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>Select Your Courses (Packages)</label>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{formData.course_ids.length} selected</span>
              </div>
              
              <div style={{ 
                maxHeight: '240px', 
                overflowY: 'auto', 
                paddingRight: '8px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                padding: '4px'
              }} className="custom-scrollbar">
                {courses.map(course => (
                  <div 
                    key={course.id} 
                    onClick={() => handleCourseToggle(course.id)}
                    style={{ 
                      padding: '10px 14px', 
                      borderRadius: '12px', 
                      border: '1px solid',
                      borderColor: formData.course_ids.includes(course.id) ? 'var(--indigo)' : 'var(--border)',
                      background: formData.course_ids.includes(course.id) ? 'var(--indigo-light)05' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: formData.course_ids.includes(course.id) ? '0 4px 12px rgba(99, 102, 241, 0.08)' : 'none'
                    }}
                  >
                    <div style={{ 
                      width: '20px', 
                      height: '20px', 
                      borderRadius: '6px', 
                      border: '2px solid',
                      borderColor: formData.course_ids.includes(course.id) ? 'var(--indigo)' : '#d1d5db',
                      background: formData.course_ids.includes(course.id) ? 'var(--indigo)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {formData.course_ids.includes(course.id) && <Plus size={14} color="white" style={{ transform: 'rotate(45deg)' }} />}
                    </div>
                    <div style={{ textAlign: 'left', minWidth: 0 }}>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.title}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{course.description || 'Professional learning path'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ height: '48px', fontSize: '16px', fontWeight: 600, marginTop: '12px' }}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: 'var(--text-muted)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--indigo)', fontWeight: 600 }}>Sign In</Link>
        </div>
      </div>
    </div>
  );
}
