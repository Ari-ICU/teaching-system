"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, Layout, GraduationCap, Image as ImageIcon, ChevronRight, CheckCircle2 } from "lucide-react";
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
    <div className="p-6 md:p-10 lg:p-12 max-w-[1000px] mx-auto space-y-10">
      <Toast 
        show={showToast} 
        message="Course created successfully!" 
        onClose={() => setShowToast(false)} 
      />

      <Link href="/admin/courses" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium mb-4">
        <ArrowLeft size={16} /> Back to Courses
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
            <GraduationCap size={22} />
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
            NEW COURSE
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create New Learning Path</h1>
        <p className="text-slate-500 text-lg font-medium">Define a high-level curriculum track for your students to enroll in.</p>
      </header>

      <form className="bg-white border border-slate-200 rounded-[48px] p-10 md:p-14 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700" onSubmit={handleSubmit}>
        <div className="space-y-10">
          {/* Logo Upload */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-indigo-500/5 rounded-[32px] blur-xl group-hover:bg-indigo-500/10 transition-all" />
              <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-[32px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-colors group-hover:border-indigo-300">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={40} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                )}
                
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  id="course-logo"
                />
              </div>
            </div>
            
            <div className="flex-1 space-y-4 pt-2">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">COURSE IDENTITY</label>
                <h3 className="text-xl font-bold text-slate-900">Course Brand Logo</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm mt-1">
                  Upload a professional brand logo for this course. Best size is 512x512px. Supports PNG, JPG.
                </p>
              </div>
              <label 
                htmlFor="course-logo" 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm"
              >
                <ImageIcon size={16} /> Choose Image
              </label>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">COURSE TITLE</label>
              <input
                type="text"
                required
                className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-slate-900 text-xl font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                placeholder="e.g. Full-Stack Web Development with Laravel & Next.js"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CURRICULUM DESCRIPTION</label>
              <textarea
                required
                className="w-full min-h-[160px] p-6 bg-slate-50 border-none rounded-[28px] text-slate-900 font-medium leading-relaxed focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 resize-none"
                placeholder="Describe what students will achieve by the end of this course. What skills will they gain?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PRICE (USD)</label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-lg group-focus-within:text-indigo-500 transition-colors">$</div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full h-16 pl-12 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-black text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DISPLAY ORDER</label>
                <div className="relative group">
                  <Layout className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input
                    type="number"
                    min="0"
                    className="w-full h-16 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-black text-lg focus:ring-4 focus:ring-indigo-500/10 transition-all"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </div>

            {user?.role === 'admin' && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ASSIGN INSTRUCTOR</label>
                <TeacherDropdown 
                  teachers={teachers}
                  selectedId={formData.teacher_id}
                  onSelect={(id) => setFormData({ ...formData, teacher_id: id })}
                />
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Assigning a teacher allows them to manage this course's curriculum.</p>
              </div>
            )}

            <div 
              className={`
                p-6 rounded-[28px] border-2 transition-all duration-300 flex items-center justify-between cursor-pointer group
                ${formData.is_active ? 'bg-emerald-50/50 border-emerald-100 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100'}
              `}
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${formData.is_active ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'}
                `}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Publish Status</div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">Currently {formData.is_active ? 'VISIBLE' : 'HIDDEN'} on student marketplace</div>
                </div>
              </div>
              <div className={`
                w-12 h-6 rounded-full relative transition-all duration-300 border-2
                ${formData.is_active ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-200 border-slate-200'}
              `}>
                <div className={`
                  absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300
                  ${formData.is_active ? 'left-7' : 'left-1'}
                `} />
              </div>
            </div>
          </div>

          <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-end gap-4">
            <Link href="/admin/courses" className="h-16 px-10 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="h-16 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group" 
              disabled={status === "saving"}
            >
              {status === "saving" ? (
                <><Loader2 className="animate-spin" size={22} /> Creating...</>
              ) : (
                <><Save size={22} /> <span>Create Course Path</span> <ChevronRight className="group-hover:translate-x-1 transition-transform" size={22} /></>
              )}
            </button>
          </div>

          {status === "error" && (
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-4 animate-in shake duration-500">
              <AlertCircle size={22} className="shrink-0" />
              <span>Failed to create learning path. Please check your inputs and try again.</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
