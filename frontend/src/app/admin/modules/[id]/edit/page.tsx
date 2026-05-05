"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, CheckCircle2, Layout, ImageIcon, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import Toast from "@/components/ui/Toast";

export default function EditModulePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
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
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [status, setStatus] = useState<"loading_initial" | "idle" | "saving" | "error" | "not_found">("loading_initial");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
      fetchInitialData();
    }
  }, [id, token, authLoading]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const fetchInitialData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      
      const coursesRes = await fetch(`${apiUrl}/admin/courses`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const coursesData = await coursesRes.json();
      setCourses(coursesData.data || []);

      const res = await fetch(`${apiUrl}/modules/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 404) {
          setStatus("not_found");
          return;
        }
        throw new Error("Failed to fetch module");
      }

      const data = await res.json();
      const m = data.data;
      setFormData({
        title: m.title || "",
        description: m.description || "",
        icon: m.icon || "globe",
        color: m.color || "#6366f1",
        course_ids: m.courses?.map((c: any) => c.id.toString()) || []
      });
      if (m.image) {
        const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage';
        setCurrentImage(`${storageUrl}/${m.image}`);
      }
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const toggleCourse = (courseId: string) => {
    setFormData(prev => {
      const ids = [...prev.course_ids];
      if (ids.includes(courseId)) {
        return { ...prev, course_ids: ids.filter(id => id !== courseId) };
      } else {
        return { ...prev, course_ids: [...ids, courseId] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.course_ids.length === 0) {
        setStatus("error");
        return;
    }
    setStatus("saving");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      
      const data = new FormData();
      data.append('_method', 'PUT');
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('icon', formData.icon);
      data.append('color', formData.color);
      formData.course_ids.forEach(id => data.append('course_ids[]', id));
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch(`${apiUrl}/modules/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: data,
      });

      if (!res.ok) throw new Error("Failed to update module");

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

  if (authLoading || status === "loading_initial") return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  if (status === "not_found") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-10 text-center space-y-6">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
          <AlertCircle size={40} />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-black text-slate-900">Module Not Found</h2>
          <p className="text-slate-500 font-medium">The chapter you're looking for doesn't exist or has been removed.</p>
        </div>
        <Link href="/admin/modules" className="inline-flex items-center justify-center px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
          Back to Modules
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1000px] mx-auto space-y-10">
      <Toast show={showToast} message="Module updated successfully!" onClose={() => setShowToast(false)} />
      
      <Link href="/admin/modules" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium mb-4">
        <ArrowLeft size={16} /> Back to Modules
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
             <Save size={22} />
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
            EDIT CHAPTER
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Edit Module Settings</h1>
        <p className="text-slate-500 text-lg font-medium">Update chapter details and manage which courses it belongs to.</p>
      </header>

      <form className="bg-white border border-slate-200 rounded-[48px] p-10 md:p-14 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700" onSubmit={handleSubmit}>
        <div className="space-y-10">
          
          {/* Module Logo Upload */}
          <div className="flex flex-col md:flex-row gap-8 items-start bg-slate-50/50 p-8 rounded-[32px] border border-slate-100">
            <div className="relative group shrink-0">
              <div className="absolute inset-0 bg-white rounded-2xl blur-lg transition-all group-hover:blur-xl" />
              <div className="relative w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-colors group-hover:border-indigo-300">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain p-4" />
                ) : currentImage ? (
                  <img src={currentImage} alt="Current" className="w-full h-full object-contain p-4" />
                ) : (
                  <Layout size={32} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                )}
                <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" id="module-logo" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">VISUAL IDENTITY</label>
                <h3 className="text-lg font-bold text-slate-900">Module Icon</h3>
                <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-sm">
                  Recommended: PNG with transparent background. This represents the module in the student view.
                </p>
              </div>
              <label htmlFor="module-logo" className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-sm">
                <ImageIcon size={14} /> Change Custom Icon
              </label>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">MODULE TITLE</label>
              <input 
                type="text" required 
                className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-slate-900 text-xl font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                placeholder="e.g. Authentication Basics"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">PARENT COURSES (SELECT ALL THAT APPLY)</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {courses.map(course => {
                   const isSelected = formData.course_ids.includes(course.id.toString());
                   return (
                     <div 
                        key={course.id} 
                        onClick={() => toggleCourse(course.id.toString())} 
                        className={`
                          group p-5 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-300 border-2
                          ${isSelected ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'}
                        `}
                     >
                        <div className={`
                          w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-300 border-2
                          ${isSelected ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-200 group-hover:border-slate-300'}
                        `}>
                           {isSelected && <CheckCircle2 size={16} className="text-white" />}
                        </div>
                        <span className={`text-sm font-bold transition-colors ${isSelected ? 'text-indigo-900' : 'text-slate-600'}`}>{course.title}</span>
                     </div>
                   );
                 })}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CHAPTER OVERVIEW</label>
              <textarea required 
                className="w-full min-h-[140px] p-6 bg-slate-50 border-none rounded-[28px] text-slate-900 font-medium leading-relaxed focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 resize-none"
                placeholder="Provide a brief overview of what students will learn in this module..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">VISUAL ICON (FALLBACK)</label>
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
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Used if no custom icon image is provided.</p>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">THEME ACCENT COLOR</label>
                <div className="flex gap-4">
                  <div className="relative w-16 h-16 shrink-0 group">
                    <input 
                      type="color" 
                      value={formData.color} 
                      onChange={(e) => setFormData({...formData, color: e.target.value})}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                    />
                    <div 
                      className="w-full h-full rounded-2xl border-2 border-white shadow-lg transition-transform group-hover:scale-110" 
                      style={{ backgroundColor: formData.color }}
                    />
                  </div>
                  <input 
                    type="text" 
                    className="flex-1 h-16 px-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-mono font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all" 
                    value={formData.color} 
                    onChange={(e) => setFormData({...formData, color: e.target.value})} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-end gap-4 mt-10">
          <Link href="/admin/modules" className="h-16 px-10 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">
            Discard Changes
          </Link>
          <button 
            type="submit" 
            className="h-16 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group" 
            disabled={status === "saving"}
          >
            {status === "saving" ? (
              <><Loader2 className="animate-spin" size={22} /> Updating...</>
            ) : (
              <><Save size={22} /> <span>Save Chapter Flow</span> <ChevronRight className="group-hover:translate-x-1 transition-transform" size={22} /></>
            )}
          </button>
        </div>
        
        {status === "error" && (
          <div className="mt-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-4 animate-in shake duration-500">
            <AlertCircle size={22} className="shrink-0" />
            <span>Failed to save changes. Please verify your data and try again.</span>
          </div>
        )}
      </form>
    </div>
  );
}
