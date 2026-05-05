"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, Code, PlayCircle, Terminal, Sparkles, ChevronRight, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";

export default function NewCodeExamplePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.id;
  const router = useRouter();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    lesson_id: lessonId,
    title: "",
    code: "",
    language: "javascript",
    runnable: true,
    order: 0
  });

  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/code-examples`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create code example");

      router.push(`/admin/lessons/${lessonId}/slides`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header Navigation */}
      <nav className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href={`/admin/lessons/${lessonId}/slides`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> <span>Back to Curriculum</span>
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2">
            <PlayCircle className="text-emerald-500" size={18} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Sandbox Creator</span>
          </div>
        </div>

        <button 
          onClick={handleSubmit} 
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50 group" 
          disabled={status === "saving"}
        >
          {status === "saving" ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Publish Demo</span>
        </button>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto w-full p-8 md:p-12 lg:p-16 space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Title Section */}
        <header className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 shadow-sm">
                <Code size={24} />
             </div>
             <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">New Code Demo</h1>
                <p className="text-slate-500 font-medium">Add an interactive, runnable code snippet to your teaching flow.</p>
             </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Configuration Card */}
          <section className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200/60 space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full blur-3xl -mr-16 -mt-16 transition-colors" />
            
            <div className="space-y-2 relative z-10">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Demo Identity</label>
              <input 
                type="text" 
                required
                className="w-full bg-transparent border-none p-0 text-3xl font-extrabold text-slate-900 placeholder:text-slate-200 focus:ring-0 outline-none tracking-tight" 
                placeholder="Name your code demo..."
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Language</label>
                <DropdownSelect 
                  options={[
                    { value: "javascript", label: "JavaScript" },
                    { value: "php", label: "PHP" },
                    { value: "html", label: "HTML Structure" },
                    { value: "css", label: "CSS Styling" },
                    { value: "sql", label: "SQL Query" }
                  ]}
                  value={formData.language}
                  onChange={(value) => setFormData({...formData, language: value})}
                />
              </div>

              <div className="flex flex-col justify-end">
                <div 
                  className={`
                    p-4 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between cursor-pointer group/toggle
                    ${formData.runnable ? 'bg-emerald-50/50 border-emerald-100' : 'bg-slate-50 border-transparent hover:bg-slate-100'}
                  `}
                  onClick={() => setFormData({ ...formData, runnable: !formData.runnable })}
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                      ${formData.runnable ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-200 text-slate-400'}
                    `}>
                      <Zap size={16} fill={formData.runnable ? "currentColor" : "none"} />
                    </div>
                    <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Runnable Code</span>
                  </div>
                  <div className={`
                    w-10 h-5 rounded-full relative transition-all duration-300 border-2
                    ${formData.runnable ? 'bg-emerald-500 border-emerald-500' : 'bg-slate-200 border-slate-200'}
                  `}>
                    <div className={`
                      absolute top-0.5 w-2.5 h-2.5 rounded-full bg-white transition-all duration-300
                      ${formData.runnable ? 'left-6' : 'left-0.5'}
                    `} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Code Editor Card */}
          <section className="bg-slate-900 rounded-[40px] p-10 shadow-2xl space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500" />
            
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal size={16} /> SOURCE CODE
              </label>
              <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                Monospace Active
              </div>
            </div>

            <textarea 
              required
              className="w-full min-h-[400px] bg-slate-800/50 rounded-3xl p-8 text-indigo-100 font-mono text-sm leading-relaxed focus:ring-0 outline-none placeholder:text-slate-700 resize-none border border-white/5"
              placeholder="// Write or paste your demo code here..."
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
            />
          </section>

          {status === "error" && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 animate-in shake duration-500">
              <AlertCircle size={20} />
              <p className="text-sm font-bold uppercase tracking-widest">Failed to publish the demo. Please check your data.</p>
            </div>
          )}

          <div className="flex items-center justify-center pt-8">
            <div className="flex items-center gap-3 text-slate-300">
              <Sparkles size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Ready for live demonstration</span>
              <Sparkles size={16} />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
