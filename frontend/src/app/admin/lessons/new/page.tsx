"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, PlayCircle, Clock, ChevronRight, CheckCircle2, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import Toast from "@/components/ui/Toast";

export default function NewLessonPage() {
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

  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
        fetchModules();
    }
  }, [token, authLoading]);

  const fetchModules = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/modules`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });

      if (res.ok) {
        const data = await res.json();
        const mods = data.data || [];
        setModules(mods);
        
        // Check for module_id in query params
        const urlParams = new URLSearchParams(window.location.search);
        const queryModuleId = urlParams.get('module_id');

        if (queryModuleId) {
          setFormData(prev => ({ ...prev, module_id: queryModuleId }));
        } else if (mods.length > 0) {
          setFormData(prev => ({ ...prev, module_id: mods[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch modules", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.module_id) {
        setStatus("error");
        return;
    }
    setStatus("saving");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/lessons`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create lesson");

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

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1000px] mx-auto space-y-10">
      <Toast show={showToast} message="Lesson created successfully!" onClose={() => setShowToast(false)} />
      
      <Link href="/admin/lessons" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium mb-4">
        <ArrowLeft size={16} /> Back to Lessons
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
             <PlayCircle size={22} />
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
            NEW TOPIC
          </span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Create New Lesson</h1>
        <p className="text-slate-500 text-lg font-medium">Add a specific teaching topic to your curriculum module.</p>
      </header>

      <form className="bg-white border border-slate-200 rounded-[48px] p-10 md:p-14 shadow-sm animate-in fade-in slide-in-from-bottom-8 duration-700" onSubmit={handleSubmit}>
        <div className="space-y-10">
          
          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">SELECT PARENT MODULE</label>
              <DropdownSelect 
                options={modules.map(mod => ({ value: mod.id.toString(), label: mod.title }))}
                value={formData.module_id}
                onChange={(value) => setFormData({...formData, module_id: value})}
                placeholder="Select a module..."
              />
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Lessons are organized within chapters to create a structured learning flow.</p>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">LESSON TITLE</label>
              <input 
                type="text" required 
                className="w-full h-16 px-6 bg-slate-50 border-none rounded-2xl text-slate-900 text-xl font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                placeholder="e.g. Deep Dive into React Hooks"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">TOPIC SUMMARY</label>
              <textarea required 
                className="w-full min-h-[140px] p-6 bg-slate-50 border-none rounded-[28px] text-slate-900 font-medium leading-relaxed focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300 resize-none"
                placeholder="Provide a clear overview of what students will achieve in this lesson..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">DIFFICULTY LEVEL</label>
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
              
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ESTIMATED TIME</label>
                <div className="relative group">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    className="w-full h-16 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300" 
                    placeholder="e.g. 30 min"
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div 
              className={`
                p-6 rounded-[28px] border-2 transition-all duration-300 flex items-center justify-between cursor-pointer group
                ${formData.is_active ? 'bg-indigo-50/50 border-indigo-100 shadow-sm' : 'bg-slate-50 border-transparent hover:bg-slate-100'}
              `}
              onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
            >
              <div className="flex items-center gap-4">
                <div className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                  ${formData.is_active ? 'bg-indigo-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'}
                `}>
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 uppercase tracking-widest">Publish Status</div>
                  <div className="text-[11px] font-bold text-slate-500 mt-0.5">Currently {formData.is_active ? 'PUBLISHED' : 'DRAFT'}</div>
                </div>
              </div>
              <div className={`
                w-12 h-6 rounded-full relative transition-all duration-300 border-2
                ${formData.is_active ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-200 border-slate-200'}
              `}>
                <div className={`
                  absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300
                  ${formData.is_active ? 'left-7' : 'left-1'}
                `} />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-end gap-4 mt-10">
          <Link href="/admin/lessons" className="h-16 px-10 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">
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
              <><Save size={22} /> <span>Create Lesson Path</span> <ChevronRight className="group-hover:translate-x-1 transition-transform" size={22} /></>
            )}
          </button>
        </div>
        
        {status === "error" && (
          <div className="mt-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-4 animate-in shake duration-500">
            <AlertCircle size={22} className="shrink-0" />
            <span>Failed to create lesson. Please verify your data and try again.</span>
          </div>
        )}
      </form>
    </div>
  );
}
