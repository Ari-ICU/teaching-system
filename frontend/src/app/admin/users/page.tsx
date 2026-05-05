"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, Edit2, Trash2, Search, User, Shield, BookOpen, Save, X, Loader2, Mail, CheckCircle2, ChevronRight, MoreHorizontal } from "lucide-react";
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
      if (res.ok) {
        fetchUsers();
        setDeleteModal({ isOpen: false, id: null });
      }
    } catch (error) { console.error(error); }
  };

  const filteredUsers = users.filter(u => {
    if (currentUser?.role === 'teacher' && u.role === 'admin') return false;
    return (
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-7xl mx-auto space-y-10">
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, id: null })}
        onConfirm={() => deleteModal.id && handleDeleteUser(deleteModal.id)}
        title="Remove User?"
        message="This will permanently remove this user account and all their learning progress. This action cannot be reversed."
        confirmText="Remove Account"
        type="danger"
      />

      <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium mb-4">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 text-lg font-medium">Manage student accounts, roles, and course access.</p>
        </div>
        <Link href="/admin/users/new" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2">
          <UserPlus size={18} /> New User
        </Link>
      </header>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-[32px] p-4 shadow-sm relative z-20 group">
        <Search className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Search by name or email address..."
          className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">
           <div className="flex items-center gap-16">
              <span className="ml-14">User Info</span>
           </div>
           <span className="mr-24">Actions</span>
        </div>

        <div className="space-y-3">
          {filteredUsers.map((u, index) => (
            <div 
              key={u.id} 
              className="group bg-white border border-slate-200 rounded-[28px] p-4 flex items-center gap-6 shadow-sm hover:shadow-xl hover:border-indigo-500/20 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                <User size={24} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight truncate group-hover:text-indigo-600 transition-colors">
                    {u.name}
                  </h3>
                  <span className={`
                    px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border
                    ${u.role === 'admin' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      u.role === 'teacher' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-emerald-50 text-emerald-600 border-emerald-100'}
                  `}>
                    {u.role}
                  </span>
                </div>
                <div className="flex items-center gap-6 text-xs font-bold text-slate-400">
                  <span className="flex items-center gap-1.5 group-hover:text-indigo-400 transition-colors">
                    <Mail size={14} /> {u.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Shield size={14} /> Joined {new Date(u.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pr-2">
                {u.id !== currentUser?.id && (
                  <button 
                    onClick={() => handleOpenEnroll(u)} 
                    className="w-10 h-10 flex items-center justify-center rounded-xl text-emerald-500 hover:bg-emerald-50 transition-all" 
                    title="Manually Enroll"
                  >
                    <BookOpen size={18} />
                  </button>
                )}
                <button 
                  onClick={() => handleOpenEdit(u)} 
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-indigo-500 hover:bg-indigo-50 transition-all"
                  title="Edit User"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (u.id === currentUser?.id) return;
                    setDeleteModal({ isOpen: true, id: u.id });
                  }}
                  className={`w-10 h-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 transition-all ${u.id === currentUser?.id ? 'opacity-20 cursor-not-allowed' : ''}`}
                  disabled={u.id === currentUser?.id}
                  title="Delete User"
                >
                  <Trash2 size={18} />
                </button>
                <div className="w-px h-6 bg-slate-100 mx-2 hidden md:block" />
                <Link 
                  href="#" 
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-300 hover:text-slate-600 hover:bg-slate-50 transition-all hidden md:flex"
                >
                  <ChevronRight size={20} />
                </Link>
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="bg-white border border-slate-200 border-dashed rounded-[40px] p-24 text-center space-y-6">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
                 <Search size={40} />
               </div>
               <div className="space-y-2">
                 <h3 className="text-xl font-bold text-slate-900">No users found</h3>
                 <p className="text-slate-500 font-medium max-w-xs mx-auto">Try searching for a different name or email to find what you&apos;re looking for.</p>
               </div>
               <button 
                 onClick={() => setSearchTerm("")} 
                 className="text-indigo-600 font-black text-sm uppercase tracking-widest hover:text-indigo-700"
               >
                 Clear search query
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowEditModal(false)} />
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-[500px] p-10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Edit User</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 block ml-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 font-bold" 
                  required 
                  value={editFormData.name} 
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 block ml-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 font-bold" 
                  required 
                  value={editFormData.email} 
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} 
                />
              </div>
              {currentUser?.role === 'admin' && (
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900 block ml-1">System Role</label>
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
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 block ml-1">New Password</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current"
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-900 font-bold" 
                  value={editFormData.password} 
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })} 
                />
              </div>
              <button 
                type="submit" 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2" 
                disabled={isSaving}
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={18} /> Update User Details</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manual Enroll Modal */}
      {showEnrollModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowEnrollModal(false)} />
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-[450px] p-10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manual Enrollment</h2>
              <button onClick={() => setShowEnrollModal(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6 mb-8">
              <p className="text-slate-500 font-medium">
                Select a course to instantly enroll <strong className="text-indigo-600">{selectedUser?.name}</strong> with active status.
              </p>

              {selectedUser?.courses && selectedUser.courses.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Current Enrollments</div>
                  <div className="space-y-3">
                    {selectedUser.courses.map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between group/item">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${c.pivot?.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-amber-500'}`} />
                          <span className="text-sm font-bold text-slate-700">{c.title}</span>
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{c.pivot?.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleManualEnroll} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 block ml-1">Select Course Path</label>
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
                  <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-4 text-center text-sm font-bold text-slate-400">
                    No additional courses available.
                  </div>
                )}
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                disabled={isSaving || courses.filter(c => !selectedUser?.courses?.some((sc: any) => sc.id === c.id)).length === 0}
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Grant Instant Access</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
