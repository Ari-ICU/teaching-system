"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, FileText, AlertCircle, Eye, Edit3, Terminal, Layout, Columns2, Square, Type, ImageIcon, ChevronRight, Check, Plus, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import SlideViewer from "@/components/SlideViewer";
import DropdownSelect from "@/components/ui/DropdownSelect";
import RichTextEditor from "@/components/admin/RichTextEditor";
import Editor from "@monaco-editor/react";

export default function NewSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.id;
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [lesson, setLesson] = useState<any>(null);
  const [formData, setFormData] = useState({
    lesson_id: lessonId,
    title: "",
    type: "concept",
    layout_type: "standard",
    content: "",
    code_snippet: "",
    image_position: "top",
    image_width: "100",
    secondary_image_position: "top",
    secondary_image_width: "100",
    code_position: "right",
    code_theme: "terminal",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [secondaryImageFile, setSecondaryImageFile] = useState<File | null>(null);
  const [secondaryImagePreview, setSecondaryImagePreview] = useState<string | null>(null);

  const [status, setStatus] = useState<"loading_initial" | "idle" | "saving" | "error">("loading_initial");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    if (!authLoading && token) {
        fetchLesson();
    }
  }, [lessonId, token, authLoading]);

  const fetchLesson = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/lessons/${lessonId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      setLesson(data.data);
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isSecondary: boolean = false) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (isSecondary) {
      setSecondaryImageFile(file);
      if (file) setSecondaryImagePreview(URL.createObjectURL(file));
      else setSecondaryImagePreview(null);
    } else {
      setImageFile(file);
      if (file) setImagePreview(URL.createObjectURL(file));
      else setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const data = new FormData();
      data.append('lesson_id', formData.lesson_id);
      data.append('title', formData.title);
      data.append('type', formData.type);
      data.append('layout_type', formData.layout_type);
      data.append('content', formData.content);
      data.append('image_position', formData.image_position);
      data.append('image_width', formData.image_width);
      data.append('secondary_image_position', formData.secondary_image_position);
      data.append('secondary_image_width', formData.secondary_image_width);
      data.append('code_position', formData.code_position);
      data.append('code_theme', formData.code_theme);
      data.append('code_snippet', formData.code_snippet || '');
      
      if (imageFile) data.append('image', imageFile);
      if (secondaryImageFile) data.append('secondary_image', secondaryImageFile);

      const res = await fetch(`${apiUrl}/slides`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: data,
      });

      if (!res.ok) throw new Error("Failed to create slide");

      router.push(`/admin/lessons/${lessonId}/slides`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const layoutOptions = [
    { id: 'standard', name: 'Standard', icon: <Layout size={20} />, description: 'Top-down flow with inline media.' },
    { id: 'split', name: 'Split Screen', icon: <Columns2 size={20} />, description: 'Equal columns for text and code.' },
    { id: 'centered', name: 'Centered', icon: <Square size={20} />, description: 'Minimalist focus for key concepts.' },
    { id: 'full-code', name: 'Full Code', icon: <Terminal size={20} />, description: 'Maximizes the terminal playground.' },
  ];

  if (status === "loading_initial") {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 space-y-6">
          <div className="w-20 h-20 bg-white rounded-[32px] shadow-xl flex items-center justify-center border border-slate-100">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
          <div className="text-center space-y-1">
            <p className="text-slate-900 font-black text-lg">Opening Slide Studio</p>
            <p className="text-slate-400 font-medium">Synchronizing curriculum assets...</p>
          </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Bar Navigation */}
      <nav className="h-20 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-6">
          <Link href={`/admin/lessons/${lessonId}/slides`} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold text-sm transition-colors group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> <span>Slide Manager</span>
          </Link>
          <div className="h-6 w-px bg-slate-200" />
          <div className="hidden md:flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setActiveTab("edit")} 
              className={`px-5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "edit" ? "bg-white text-indigo-600 shadow-sm shadow-indigo-500/5" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Edit3 size={14} /> Editor
            </button>
            <button 
              onClick={() => setActiveTab("preview")} 
              className={`px-5 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === "preview" ? "bg-white text-indigo-600 shadow-sm shadow-indigo-500/5" : "text-slate-400 hover:text-slate-600"}`}
            >
              <Eye size={14} /> Live View
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="hidden lg:flex flex-col items-end mr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Lesson</span>
              <span className="text-sm font-bold text-slate-900 line-clamp-1 max-w-[200px]">{lesson?.title}</span>
           </div>
           <button 
             onClick={handleSubmit} 
             className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-2 disabled:opacity-50 group" 
             disabled={status === "saving"}
           >
             {status === "saving" ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
             <span>Publish Slide</span>
           </button>
        </div>
      </nav>

      <main className="flex-1 overflow-auto">
        {activeTab === "edit" ? (
          <div className="max-w-8xl mx-auto p-8 md:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-4 gap-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
            
            {/* Main Form Content */}
            <div className="lg:col-span-3 space-y-12">
              
              {/* Fundamentals Section */}
              <section className="bg-white rounded-[40px] p-10 shadow-sm border border-slate-200/60 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-indigo-50 transition-colors" />
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 block ml-1">SLIDE FUNDAMENTALS</label>
                
                <div className="space-y-8 relative z-10">
                  <input 
                    type="text" 
                    className="w-full bg-transparent border-none p-0 text-3xl md:text-4xl font-extrabold text-slate-900 placeholder:text-slate-200 focus:ring-0 outline-none tracking-tight" 
                    placeholder="Enter a descriptive title..."
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                  
                  <div className="flex flex-wrap gap-3">
                    {['concept', 'practice', 'summary'].map(t => (
                      <button 
                        key={t}
                        type="button"
                        className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${formData.type === t ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/30 -translate-y-1' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200 hover:bg-white'}`}
                        onClick={() => setFormData({...formData, type: t})}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Code Playground Section (Visible if type is practice) */}
              {formData.type === 'practice' && (
                <section className="bg-slate-900 rounded-[40px] p-10 shadow-2xl border border-slate-800 space-y-8 animate-in zoom-in-95 fade-in duration-500 overflow-hidden relative group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">CODE PLAYGROUND</label>
                      <p className="text-slate-400 text-xs font-medium">Define the interactive code example for this practice slide.</p>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-widest border border-indigo-500/20 backdrop-blur-sm">
                       <Terminal size={14} /> <span>Interactive Snippet</span>
                    </div>
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Terminal Theme</span>
                        <DropdownSelect 
                          variant="dark"
                          options={[
                            { value: "terminal", label: "Modern Dark (Terminal)" },
                            { value: "editor", label: "VS Code Classic (Editor)" },
                            { value: "browser", label: "Chrome Preview (Browser)" }
                          ]}
                          value={formData.code_theme}
                          onChange={(value) => setFormData({...formData, code_theme: value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Interface Position</span>
                        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                          {['left', 'right'].map(pos => (
                            <button 
                              key={pos}
                              type="button"
                              className={`px-6 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${formData.code_position === pos ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                              onClick={() => setFormData({...formData, code_position: pos as any})}
                            >
                              {pos}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="rounded-3xl overflow-hidden border border-slate-700 bg-[#0f172a] shadow-inner group/editor">
                      <div className="h-80 w-full relative">
                        <Editor
                          height="100%"
                          defaultLanguage="javascript"
                          theme="vs-dark"
                          value={formData.code_snippet}
                          onChange={(value) => setFormData({...formData, code_snippet: value || ""})}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                            padding: { top: 20, bottom: 20 },
                            scrollBeyondLastLine: false,
                            wordWrap: "on",
                            lineHeight: 1.6,
                            scrollbar: {
                               vertical: 'hidden',
                               horizontal: 'hidden'
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {/* Layout Section */}
              <section className="space-y-6">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">CONTENT ARCHITECTURE</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {layoutOptions.map(opt => (
                    <button 
                      key={opt.id}
                      type="button"
                      className={`flex items-center gap-6 p-6 rounded-3xl border-2 transition-all text-left group relative overflow-hidden ${formData.layout_type === opt.id ? 'bg-white border-indigo-600 shadow-xl shadow-indigo-500/5' : 'bg-white/50 border-slate-200 hover:border-slate-300'}`}
                      onClick={() => setFormData({...formData, layout_type: opt.id})}
                    >
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${formData.layout_type === opt.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                        {opt.icon}
                      </div>
                      <div className="space-y-1">
                        <span className="block font-bold text-slate-900 text-lg">{opt.name}</span>
                        <span className="block text-xs font-medium text-slate-500 leading-relaxed">{opt.description}</span>
                      </div>
                      {formData.layout_type === opt.id && <div className="absolute top-4 right-4 text-indigo-600 animate-in zoom-in duration-300"><Check size={20} strokeWidth={3} /></div>}
                    </button>
                  ))}
                </div>
              </section>

              {/* Rich Text Editor Section */}
              <section className="bg-white rounded-[40px] overflow-hidden shadow-sm border border-slate-200/60">
                <div className="flex items-center justify-between px-10 pt-8 pb-6">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">TEACHING MATERIAL</label>
                   <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-100">
                      <Type size={12} /> <span>Rich Text Editor</span>
                   </div>
                </div>
                <div className="border-t border-slate-100">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
                    placeholder="Describe your concepts, add lists, highlight code..."
                  />
                </div>
              </section>


            </div>

            {/* Sidebar Controls */}
            <aside className="space-y-8">
              
              {/* Media Section */}
              <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200/60 space-y-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">VISUAL MEDIA</label>
                
                <div className="space-y-8">
                  {/* Primary Upload */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Primary Image</span>
                      {imagePreview && (
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Clear</button>
                      )}
                    </div>
                    <div 
                      className={`relative aspect-[4/3] rounded-3xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center bg-slate-50 group/upload ${imagePreview ? 'border-indigo-600/20' : 'border-slate-200 hover:border-indigo-400'}`}
                    >
                      {imagePreview ? (
                        <img src={imagePreview} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Preview" />
                      ) : (
                        <div className="text-center space-y-2">
                          <ImageIcon size={32} className="text-slate-300 mx-auto group-hover/upload:scale-110 transition-transform" />
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Asset</span>
                        </div>
                      )}
                      <input type="file" onChange={(e) => handleFileChange(e, false)} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>

                  {/* Secondary Upload */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 uppercase tracking-widest">Secondary</span>
                      {secondaryImagePreview && (
                        <button type="button" onClick={() => { setSecondaryImageFile(null); setSecondaryImagePreview(null); }} className="text-[10px] font-black text-rose-500 uppercase tracking-widest hover:underline">Clear</button>
                      )}
                    </div>
                    <div 
                      className={`relative aspect-[4/3] rounded-3xl border-2 border-dashed transition-all overflow-hidden flex items-center justify-center bg-slate-50 group/upload ${secondaryImagePreview ? 'border-indigo-600/20' : 'border-slate-200 hover:border-indigo-400'}`}
                    >
                      {secondaryImagePreview ? (
                        <img src={secondaryImagePreview} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Secondary Preview" />
                      ) : (
                        <div className="text-center space-y-2">
                          <Plus size={32} className="text-slate-300 mx-auto group-hover/upload:scale-110 transition-transform" />
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Variation</span>
                        </div>
                      )}
                      <input type="file" onChange={(e) => handleFileChange(e, true)} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Positioning Controls */}
              <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-200/60 space-y-8">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">MEDIA BEHAVIOR</label>
                
                <div className="space-y-10">
                  {/* Primary Image position */}
                  <div className="space-y-6">
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">Primary Image Position</span>
                    <div className="grid grid-cols-2 gap-2">
                      {['top', 'bottom', 'left', 'right'].map(pos => (
                        <button 
                          key={pos}
                          type="button"
                          className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.image_position === pos ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-slate-200'}`}
                          onClick={() => setFormData({...formData, image_position: pos as any})}
                        >
                          {pos}
                        </button>
                      ))}
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Width</span>
                         <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{formData.image_width}%</span>
                      </div>
                      <input 
                        type="range" min="10" max="100" step="5"
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        value={formData.image_width}
                        onChange={(e) => setFormData({...formData, image_width: e.target.value})}
                      />
                    </div>
                  </div>

                  {/* Secondary Image position — only shown when a secondary image is selected */}
                  {secondaryImagePreview && (
                    <div className="space-y-6 pt-4 border-t border-slate-100">
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest block">Secondary Image Position</span>
                      <div className="grid grid-cols-2 gap-2">
                        {['top', 'bottom', 'left', 'right'].map(pos => (
                          <button 
                            key={pos}
                            type="button"
                            className={`py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.secondary_image_position === pos ? 'bg-slate-900 border-slate-900 text-white shadow-lg' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-white hover:border-slate-200'}`}
                            onClick={() => setFormData({...formData, secondary_image_position: pos as any})}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>

                      <div className="space-y-4 pt-2">
                        <div className="flex justify-between items-center">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Width</span>
                           <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">{formData.secondary_image_width}%</span>
                        </div>
                        <input 
                          type="range" min="10" max="100" step="5"
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          value={formData.secondary_image_width}
                          onChange={(e) => setFormData({...formData, secondary_image_width: e.target.value})}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </section>


              <div className="bg-indigo-600 rounded-[32px] p-8 text-white space-y-4 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                 <Info size={24} className="text-indigo-200" />
                 <p className="text-sm font-medium leading-relaxed opacity-90">
                    Pro Tip: Use <strong className="text-white">Full Code</strong> layout when you want students to focus entirely on the implementation details.
                 </p>
              </div>

            </aside>
          </div>
        ) : (
          <div className="max-w-8xl mx-auto p-8 md:p-12 lg:p-16 animate-in slide-in-from-right-10 duration-700 h-full">
            <div className="bg-white rounded-[48px] shadow-2xl overflow-hidden border border-slate-200 relative aspect-video">
              <SlideViewer slides={[{
                ...formData,
                id: 999,
                image: imagePreview || '',
                secondary_image: secondaryImagePreview || '',
                image_position: formData.image_position as any,
                secondary_image_position: formData.secondary_image_position as any,
                secondary_image_width: formData.secondary_image_width,
                code_position: formData.code_position as any,
                code_theme: formData.code_theme as any
              }]} />
              
              <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-slate-900/80 backdrop-blur-xl rounded-2xl text-white border border-white/10">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black uppercase tracking-[0.2em]">Simulation Active • WYSIWYG Mode</span>
              </div>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-12 text-slate-400">
               <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                     <Columns2 size={20} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">RESPONSIVE COLS</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                     <Terminal size={20} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">LIVE PLAYGROUND</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-300">
                     <ImageIcon size={20} />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest">MEDIA SCALING</span>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
