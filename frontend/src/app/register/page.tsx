"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle, Shield, Plus, GraduationCap, CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center p-6 md:p-10 bg-slate-50 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/3" />

      <div className="w-full max-w-[550px] relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white border border-slate-200 rounded-[48px] shadow-2xl p-10 md:p-14 overflow-hidden relative">
          <header className="text-center mb-12">
            <div className="w-16 h-16 bg-indigo-600 rounded-[20px] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-600/20 text-white transform hover:rotate-6 transition-transform duration-300">
              <UserPlus size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">Create Account</h1>
            <p className="text-slate-500 font-medium">Join the premium teaching platform today.</p>
          </header>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold mb-8 animate-in shake duration-500">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 ml-1 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    required 
                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400" 
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 ml-1 uppercase tracking-wider">Role</label>
                <div className="relative group">
                  <Shield className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 z-10" size={20} />
                  <DropdownSelect 
                    options={[
                      { value: "student", label: "Student" },
                      { value: "teacher", label: "Teacher" }
                    ]}
                    value={formData.role}
                    onChange={(value) => setFormData({...formData, role: value})}
                    // The component already has its own styles, we just need to ensure alignment
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black text-slate-900 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  required 
                  className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400" 
                  placeholder="teacher@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="password" 
                    required 
                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400" 
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-900 ml-1 uppercase tracking-wider">Confirm</label>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="password" 
                    required 
                    className="w-full h-14 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400" 
                    placeholder="••••••••"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({...formData, password_confirmation: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {formData.role === 'student' && (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-black text-slate-900 uppercase tracking-widest">Select Course Paths</label>
                  <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">{formData.course_ids.length} SELECTED</span>
                </div>
                
                <div className="max-h-48 overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-indigo-100 scrollbar-track-transparent">
                  {courses.map((course, cIdx) => {
                    const isSelected = formData.course_ids.includes(course.id);
                    return (
                      <div 
                        key={course.id} 
                        onClick={() => handleCourseToggle(course.id)}
                        className={`
                          group/course p-4 rounded-2xl border transition-all duration-300 cursor-pointer flex items-center gap-4
                          ${isSelected ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100'}
                        `}
                      >
                        <div className={`
                          w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 shrink-0
                          ${isSelected ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-600/20' : 'bg-white border-slate-200'}
                        `}>
                          {isSelected && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate group-hover/course:text-indigo-600 transition-colors">{course.title}</div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{course.slug || 'Specialized Path'}</div>
                        </div>
                        <ChevronRight className={`ml-auto text-slate-300 transition-all duration-300 ${isSelected ? 'translate-x-1 text-indigo-400' : 'opacity-0'}`} size={16} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-[20px] shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={24} /> Creating Account...</>
              ) : (
                <>Create Account <ChevronRight className="group-hover:translate-x-1 transition-transform" size={24} /></>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 font-medium">
              Already have an account? <Link href="/login" className="text-indigo-600 font-black hover:text-indigo-700 transition-colors">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
