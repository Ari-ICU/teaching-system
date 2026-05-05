"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, BookOpen, Terminal, Sparkles, ChevronRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import Toast from "@/components/ui/Toast";
import Editor from "@monaco-editor/react";
import RichTextEditor from "@/components/admin/RichTextEditor";

export default function EditExercisePage({ params }: { params: Promise<{ id: string, exerciseId: string }> }) {
  const { id: lessonId, exerciseId } = use(params);
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    question: "",
    starter_code: "",
    solution: "",
    hint: "",
    difficulty: "beginner",
    language: "javascript",
    order: 0
  });

  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "error" | "not_found">("loading");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (!authLoading && token) {
      fetchExercise();
    }
  }, [exerciseId, token, authLoading]);

  const fetchExercise = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/exercise/${exerciseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 404) setStatus("not_found");
        else throw new Error("Failed to fetch exercise");
        return;
      }

      const data = await res.json();
      
      const solRes = await fetch(`${apiUrl}/exercise/${exerciseId}/solution`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const solData = await solRes.json();

      setFormData({
        title: data.data.title || "",
        question: data.data.question || "",
        starter_code: data.data.starter_code || "",
        solution: solData.solution || "",
        hint: solData.hint || "",
        difficulty: data.data.difficulty || "beginner",
        language: data.data.language || "javascript",
        order: data.data.order || 0
      });
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Manual validation for custom editors
    if (!formData.question || formData.question === "<p><br></p>") {
      alert("Please provide the problem description.");
      return;
    }

    setStatus("saving");
    
    // The backend requires a solution, so we provide a placeholder if it's empty
    const finalData = {
      ...formData,
      solution: formData.solution || "// Solution not provided"
    };
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(finalData),
      });

      if (!res.ok) throw new Error("Failed to update exercise");

      setShowToast(true);
      setTimeout(() => {
        router.push(`/admin/lessons/${lessonId}/slides`);
        router.refresh();
      }, 1000);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-6">
        <div className="w-20 h-20 bg-white rounded-[32px] shadow-xl flex items-center justify-center border border-slate-100">
          <Loader2 className="animate-spin text-indigo-500" size={32} />
        </div>
        <div className="text-center space-y-1">
          <p className="text-slate-900 font-black text-lg">Calibrating Challenge Studio</p>
          <p className="text-slate-400 font-medium">Synchronizing exercise data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Toast show={showToast} message="Challenge updated successfully!" onClose={() => setShowToast(false)} />
      
      {/* Header Navigation */}
      <nav className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href={`/admin/lessons/${lessonId}/slides`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> <span>Back to Curriculum</span>
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-500" size={18} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Edit Mode</span>
          </div>
        </div>

        <button 
          type="submit"
          form="exercise-form"
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50 group" 
          disabled={status === "saving"}
        >
          {status === "saving" ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Save Changes</span>
        </button>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full p-8 md:p-12 lg:p-16 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Title Section */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                <Terminal size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Modify Challenge</h1>
                <p className="text-slate-500 font-medium">Refine the problem statements and improve student experience.</p>
             </div>
          </div>
        </header>

        <form id="exercise-form" onSubmit={handleSubmit} className="space-y-8">
          
          {/* Fundamentals Card */}
          <section className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200/60 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 transition-colors" />
            
            <div className="space-y-2 relative z-10">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Challenge Identity</label>
              <input 
                type="text" 
                required
                className="w-full bg-transparent border-none p-0 text-3xl font-extrabold text-slate-900 placeholder:text-slate-200 focus:ring-0 outline-none tracking-tight" 
                placeholder="Name your challenge..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Complexity</label>
                <DropdownSelect 
                  options={[
                    { value: "beginner", label: "Beginner Friendly" },
                    { value: "intermediate", label: "Intermediate Level" },
                    { value: "advanced", label: "Advanced Mastery" }
                  ]}
                  value={formData.difficulty}
                  onChange={(value) => setFormData({...formData, difficulty: value})}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Runtime Environment</label>
                <DropdownSelect 
                  options={[
                    { value: "javascript", label: "JavaScript Engine" },
                    { value: "php", label: "PHP Runtime" },
                    { value: "sql", label: "SQL Database" },
                    { value: "html", label: "HTML/CSS Browser" }
                  ]}
                  value={formData.language}
                  onChange={(value) => setFormData({...formData, language: value})}
                />
              </div>
            </div>
          </section>

          {/* Instructions Card */}
          <section className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200/60 space-y-6">
            <div className="flex items-center justify-between mb-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">The Problem</label>
              <Sparkles className="text-indigo-400" size={18} />
            </div>
            <div className="border border-slate-200 rounded-3xl overflow-hidden">
              <RichTextEditor 
                value={formData.question}
                onChange={(value) => setFormData({...formData, question: value})}
                placeholder="Describe the problem students need to solve. Be specific about constraints and expected outcomes..."
                minHeight={200}
              />
            </div>
          </section>





          {status === "error" && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-500">
              <AlertCircle size={20} />
              <p className="text-sm font-bold uppercase tracking-widest">Failed to update the challenge. Please try again.</p>
            </div>
          )}

          <div className="flex items-center justify-center pt-8">
            <div className="flex items-center gap-3 text-slate-300">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Synchronized with curriculum</span>
              <Sparkles size={16} />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
