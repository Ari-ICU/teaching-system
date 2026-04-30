"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Edit2, Trash2, Search, User, Shield, BookOpen, Save, X, Loader2, Mail, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import Modal from "@/components/ui/Modal";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { token, user: currentUser, isLoading: authLoading } = useAuth();

  // Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean, id: number | null }>({
    isOpen: false,
    id: null
  });

  // Form State
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "student",
    password: ""
  });
  const [enrollCourseId, setEnrollCourseId] = useState("");

  useEffect(() => {
    if (!authLoading && token) {
      fetchUsers();
      fetchCourses();
    }
  }, [token, authLoading]);

  const fetchUsers = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data.data || []);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const fetchCourses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCourses(data.data || []);
    } catch (error) { console.error(error); }
  };

  const handleOpenEdit = (user: any) => {
    setSelectedUser(user);
    setEditFormData({ name: user.name, email: user.email, role: user.role, password: "" });
    setShowEditModal(true);
  };

  const handleOpenEnroll = async (user: any) => {
    setSelectedUser(user);
    setEnrollCourseId("");
    setShowEnrollModal(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/users/${user.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.data) setSelectedUser(data.data);
    } catch (error) { console.error("Failed to fetch user courses", error); }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const bodyData: any = { ...editFormData };
      if (!bodyData.password) delete bodyData.password;

      const res = await fetch(`${apiUrl}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(bodyData)
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchUsers();
      } else {
        const errorData = await res.json();
        console.error(errorData.message);
      }
    } catch (error) { console.error(error); } finally { setIsSaving(false); }
  };

  const handleManualEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollCourseId) return;
    setIsSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/users/${selectedUser.id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ course_id: enrollCourseId })
      });

      if (res.ok) {
        setShowEnrollModal(false);
        fetchUsers();
      }
    } catch (error) { console.error(error); } finally { setIsSaving(false); }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (error) { console.error(error); }
  };

  const filteredUsers = users.filter(u => {
    if (currentUser?.role === 'teacher' && u.role === 'admin') return false;
    return (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (authLoading) return null;

  return (
    <div className="page">
      {/* Premium Confirm Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => deleteModal.id && handleDeleteUser(deleteModal.id)}
        title="Remove User?"
        message="This will permanently remove this user account and all their learning progress. This action cannot be reversed."
        confirmText="Remove Account"
        type="danger"
      />

      <Link href="/admin" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage student accounts, roles, and course access.</p>
        </div>
        <Link href="/admin/users/new" className="btn btn-primary">
          <UserPlus size={16} /> New User
        </Link>
      </header>

      {/* Search Bar */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '32px', display: 'flex', gap: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="url-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '48px', background: 'transparent', border: 'none' }}
          />
        </div>
      </div>

      <div className="grid-1" style={{ gap: '16px' }}>
        {filteredUsers.map((u) => (
          <div key={u.id} className="glass-card animate-fadeInUp" style={{ padding: '24px', display: 'flex', gap: '24px', alignItems: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={28} color="var(--text-muted)" />
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800 }}>{u.name}</h3>
                <span className={`badge badge-${u.role === 'admin' ? 'rose' : u.role === 'teacher' ? 'amber' : 'emerald'}`} style={{ textTransform: 'uppercase', fontSize: '10px' }}>
                  {u.role}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Mail size={14} /> {u.email}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Shield size={14} /> Joined {new Date(u.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {/* Admins cannot enroll themselves into student courses */}
              {u.id !== currentUser?.id && (
                <button onClick={() => handleOpenEnroll(u)} className="btn btn-ghost" title="Manually Enroll">
                  <BookOpen size={18} color="var(--emerald)" />
                </button>
              )}
              <button onClick={() => handleOpenEdit(u)} className="btn btn-ghost">
                <Edit2 size={18} color="var(--indigo)" />
              </button>
              <button
                onClick={() => {
                  if (u.id === currentUser?.id) return;
                  setDeleteModal({ isOpen: true, id: u.id });
                }}
                className="btn btn-ghost"
                disabled={u.id === currentUser?.id}
                style={{ opacity: u.id === currentUser?.id ? 0.2 : 1 }}
              >
                <Trash2 size={18} color="var(--rose)" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card animate-fadeInUp" style={{ maxWidth: '500px', width: '100%', padding: '40px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="btn btn-ghost"><X size={24} /></button>
            </div>

            <form onSubmit={handleUpdateUser} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Full Name</label>
                <input type="text" className="url-input" required value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} style={{ width: '100%' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Email Address</label>
                <input type="email" className="url-input" required value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} style={{ width: '100%' }} />
              </div>
              {currentUser?.role === 'admin' && (
                <div>
                  <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>System Role</label>
                  <DropdownSelect
                    options={[
                      { value: "student", label: "Student" },
                      { value: "teacher", label: "Teacher" },
                      { value: "admin", label: "Administrator" }
                    ]}
                    value={editFormData.role}
                    onChange={(value) => setEditFormData({ ...editFormData, role: value })}
                  />
                </div>
              )}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>New Password (leave blank to keep current)</label>
                <input type="password" className="url-input" value={editFormData.password} onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} style={{ width: '100%' }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px' }} disabled={isSaving}>
                {isSaving ? <Loader2 className="animate-spin" /> : <><Save size={18} /> Update User Details</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Enroll Modal */}
      {showEnrollModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card animate-fadeInUp" style={{ maxWidth: '450px', width: '100%', padding: '40px', background: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Manual Enrollment</h2>
              <button onClick={() => setShowEnrollModal(false)} className="btn btn-ghost"><X size={24} /></button>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>
                Select a course to instantly enroll <strong>{selectedUser?.name}</strong> with Active status.
              </p>

              {selectedUser?.courses && selectedUser.courses.length > 0 && (
                <div style={{ padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Current Enrollments</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {selectedUser.courses.map((c: any) => (
                      <div key={c.id} style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.pivot?.status === 'active' ? 'var(--emerald)' : 'var(--amber)' }}></div>
                        <span style={{ fontWeight: 600 }}>{c.title}</span>
                        <span style={{ fontSize: '10px', opacity: 0.7 }}>({c.pivot?.status})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleManualEnroll} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Select Course Path</label>
                {courses.filter(c => !selectedUser?.courses?.some((sc: any) => sc.id === c.id)).length > 0 ? (
                  <DropdownSelect
                    options={courses
                      .filter(c => !selectedUser?.courses?.some((sc: any) => sc.id === c.id))
                      .map(c => ({ value: c.id.toString(), label: c.title }))
                    }
                    value={enrollCourseId}
                    onChange={(value) => setEnrollCourseId(value)}
                  />
                ) : (
                  <div style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '13px', color: 'var(--text-muted)', border: '1px dashed var(--border)' }}>
                    No additional courses available for this student.
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', height: '52px', background: 'var(--emerald)', borderColor: 'var(--emerald)' }}
                disabled={isSaving || courses.filter(c => !selectedUser?.courses?.some((sc: any) => sc.id === c.id)).length === 0}
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <><CheckCircle2 size={18} /> Grant Instant Access</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
