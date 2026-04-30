"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User as UserIcon, Shield, AlertCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>
          <Link href="/admin">Admin</Link>
          <span>/</span>
          <Link href="/admin/users">Users</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>New User</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => router.back()} className="btn btn-ghost" style={{ padding: '8px' }}>
            <ArrowLeft size={20} />
          </button>
          <h1 className="page-title">Assign Account</h1>
        </div>
        <p className="page-subtitle">Create a new student or staff account with specific permissions.</p>
      </header>

      <div style={{ marginTop: '32px', maxWidth: '600px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          {error && (
            <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-md)', marginBottom: '24px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid #fecaca' }}>
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="grid-2" style={{ gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <UserIcon style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                  <input 
                    type="text" 
                    required 
                    className="url-input" 
                    style={{ width: '100%', paddingLeft: '44px', height: '48px', background: 'white' }}
                    placeholder="Enter full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Account Role</label>
                <div style={{ position: 'relative' }}>
                  <Shield style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 10 }} size={18} />
                  <DropdownSelect 
                    options={[
                      { value: "student", label: "Student Account" },
                      { value: "teacher", label: "Teacher Account" },
                      { value: "admin", label: "System Admin" }
                    ]}
                    value={formData.role}
                    onChange={(value) => setFormData({...formData, role: value})}
                    style={{ paddingLeft: '44px', height: '48px' }}
                  />
                </div>
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
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>Initial Password</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                <input 
                  type="text" 
                  required 
                  className="url-input" 
                  style={{ width: '100%', paddingLeft: '44px', height: '48px', background: 'white' }}
                  placeholder="Set initial password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                Provide this password to the user. They should change it after their first login.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, height: '48px', fontSize: '16px', fontWeight: 600 }}
                disabled={isLoading}
              >
                {isLoading ? "Creating Account..." : "Create Account"}
              </button>
              <button 
                type="button" 
                onClick={() => router.back()}
                className="btn btn-ghost" 
                style={{ height: '48px', padding: '0 24px' }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
