"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Upload, FileJson, AlertCircle, CheckCircle2, 
  Loader2, Copy, Terminal, Info, ChevronRight, 
  Database, Book, Presentation, Search, RefreshCw
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Toast from "@/components/ui/Toast";
import DropdownSelect from "@/components/ui/DropdownSelect";

type ImportType = "module" | "lesson" | "slide";

export default function ImportCurriculumPage() {
  const [importType, setImportType] = useState<ImportType>("module");
  const [jsonData, setJsonData] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "importing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  
  const [courses, setCourses] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);

  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedSlideId, setSelectedSlideId] = useState("");

  const { token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    } else if (token) {
      fetchCourses();
      fetchModules();
    }
  }, [token, authLoading]);

  // When module changes, fetch its lessons
  useEffect(() => {
    if (selectedModuleId && token) {
      fetchLessons(selectedModuleId);
    } else {
      setLessons([]);
      setSelectedLessonId("");
    }
  }, [selectedModuleId, token]);

  // When lesson changes, fetch its slides
  useEffect(() => {
    if (selectedLessonId && token) {
      fetchSlides(selectedLessonId);
    } else {
      setSlides([]);
      setSelectedSlideId("");
    }
  }, [selectedLessonId, token]);

  // When an item is selected for update, fetch its JSON
  useEffect(() => {
    if (importType === "lesson" && selectedLessonId) {
      fetchItemData("lessons", selectedLessonId);
    } else if (importType === "slide" && selectedSlideId) {
      fetchItemData("slides", selectedSlideId);
    }
  }, [selectedLessonId, selectedSlideId, importType]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const fetchModules = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/modules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setModules(data.data || []);
    } catch (error) {
      console.error("Failed to fetch modules", error);
    }
  };

  const fetchLessons = async (moduleId: string) => {
    try {
      const res = await fetch(`${apiUrl}/admin/lessons?module_id=${moduleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLessons(data.data || []);
    } catch (error) {
      console.error("Failed to fetch lessons", error);
    }
  };

  const fetchSlides = async (lessonId: string) => {
    try {
      const res = await fetch(`${apiUrl}/slides/lesson/${lessonId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSlides(data.data || []);
    } catch (error) {
      console.error("Failed to fetch slides", error);
    }
  };

  const fetchItemData = async (type: string, id: string) => {
    setStatus("loading");
    try {
      const endpoint = type === "lessons" ? `${apiUrl}/lessons/${id}` : `${apiUrl}/slides/${id}`;
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      if (result.success) {
        // Strip out timestamps and some internal fields for cleaner JSON
        const cleanData = { ...result.data };
        delete cleanData.created_at;
        delete cleanData.updated_at;
        delete cleanData.module;
        delete cleanData.teacher;
        delete cleanData.teacher_id;
        
        setJsonData(JSON.stringify(cleanData, null, 2));
      }
      setStatus("idle");
    } catch (error) {
      console.error(`Failed to fetch ${type} data`, error);
      setStatus("error");
      setErrorMessage(`Failed to fetch existing ${type} data.`);
    }
  };

  const sampleModule = {
    title: "Example Module Name",
    description: "Detailed description of the module content.",
    icon: "book",
    color: "#6366f1",
    course_ids: courses.length > 0 ? [courses[0].id] : [1],
    lessons: [
      {
        title: "Lesson 1: Getting Started",
        description: "Introduction to the topic.",
        slides: [
          {
            title: "Welcome Slide",
            type: "concept",
            content: "<h2>Welcome!</h2><p>This is imported content.</p>"
          }
        ]
      }
    ]
  };

  const sampleLesson = {
    title: "Updated Lesson Title",
    description: "New description for the lesson.",
    difficulty: "beginner",
    duration: "60 min",
    slides: [
      {
        title: "New/Updated Slide 1",
        type: "concept",
        content: "<p>Updated content.</p>"
      }
    ]
  };

  const sampleSlide = {
    title: "Updated Slide Title",
    type: "concept",
    content: "<h2>New Content</h2>",
    code_snippet: "const x = 10;",
    code_theme: "terminal"
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonData.trim()) return;

    setStatus("importing");
    setErrorMessage("");

    try {
      let endpoint = `${apiUrl}/modules/import`;
      let method = "POST";

      if (importType === "lesson") {
        if (!selectedLessonId) throw new Error("Please select a lesson to update.");
        endpoint = `${apiUrl}/lessons/${selectedLessonId}/import`;
      } else if (importType === "slide") {
        if (!selectedSlideId) throw new Error("Please select a slide to update.");
        endpoint = `${apiUrl}/slides/${selectedSlideId}/import`;
      }

      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ json_data: jsonData })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || `Failed to ${importType === 'module' ? 'import' : 'update'} content.`);
      }

      setStatus("success");
      setToastMessage(`${importType.charAt(0).toUpperCase() + importType.slice(1)} ${importType === 'module' ? 'imported' : 'updated'} successfully!`);
      setShowToast(true);
      
      setTimeout(() => {
        if (importType === "module") {
          router.push("/admin/modules");
        } else {
          setStatus("idle");
        }
      }, 2000);
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setErrorMessage(error.message);
    }
  };

  const copySample = () => {
    const sample = importType === "module" ? sampleModule : (importType === "lesson" ? sampleLesson : sampleSlide);
    setJsonData(JSON.stringify(sample, null, 2));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        JSON.parse(text);
        setJsonData(text);
      } catch (err) {
        setStatus("error");
        setErrorMessage("Invalid JSON file format.");
      }
    };
    reader.readAsText(file);
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1400px] mx-auto space-y-10">
      <Toast show={showToast} message={toastMessage} onClose={() => setShowToast(false)} />
      
      <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium mb-4">
        <ArrowLeft size={16} /> Back to Manager
      </Link>

      <header className="space-y-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
             <FileJson size={20} />
           </div>
           <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
             ADVANCED TOOLS
           </span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Curriculum JSON Editor</h1>
            <p className="text-slate-500 text-lg font-medium mt-2">Bulk upload or update modules, lessons, and slides using JSON.</p>
          </div>
          
          <div className="flex bg-slate-100 p-1.5 rounded-[20px] border border-slate-200">
            <button 
              onClick={() => {
                setImportType("module");
                setJsonData("");
                setSelectedModuleId("");
                setSelectedLessonId("");
                setSelectedSlideId("");
              }}
              className={`px-5 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${importType === "module" ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Database size={14} /> Module
            </button>
            <button 
              onClick={() => {
                setImportType("lesson");
                setJsonData("");
                setSelectedModuleId("");
                setSelectedLessonId("");
                setSelectedSlideId("");
              }}
              className={`px-5 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${importType === "lesson" ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Book size={14} /> Lesson
            </button>
            <button 
              onClick={() => {
                setImportType("slide");
                setJsonData("");
              }}
              className={`px-5 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${importType === "slide" ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Presentation size={14} /> Slide
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Import Form */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-[40px] p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-left-8 duration-700">
          
          {/* Target Selection for Updates */}
          {(importType === "lesson" || importType === "slide") && (
            <div className="mb-10 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Module</label>
                  <DropdownSelect 
                    options={modules.map(m => ({ value: m.id.toString(), label: m.title }))}
                    value={selectedModuleId}
                    onChange={setSelectedModuleId}
                    placeholder="Choose a module..."
                  />
                </div>
                
                {importType === "lesson" && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Lesson to Update</label>
                    <DropdownSelect 
                      options={lessons.map(l => ({ value: l.id.toString(), label: l.title }))}
                      value={selectedLessonId}
                      onChange={setSelectedLessonId}
                      placeholder="Choose a lesson..."
                    />
                  </div>
                )}

                {importType === "slide" && (
                   <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Lesson</label>
                      <DropdownSelect 
                        options={lessons.map(l => ({ value: l.id.toString(), label: l.title }))}
                        value={selectedLessonId}
                        onChange={setSelectedLessonId}
                        placeholder="Choose a lesson..."
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Slide to Update</label>
                      <DropdownSelect 
                        options={slides.map(s => ({ value: s.id.toString(), label: s.title }))}
                        value={selectedSlideId}
                        onChange={setSelectedSlideId}
                        placeholder="Choose a slide..."
                      />
                    </div>
                   </>
                )}
              </div>
              <div className="h-px bg-slate-100" />
            </div>
          )}

          <form onSubmit={handleImport} className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between px-1">
                <label className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Terminal size={16} className="text-indigo-500" /> {importType === 'module' ? 'PASTE IMPORT JSON' : 'EDIT ITEM JSON'}
                </label>
                <div className="flex items-center gap-4">
                   {status === 'loading' && <Loader2 className="animate-spin text-indigo-500" size={14} />}
                   <div className="relative overflow-hidden group">
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleFileUpload} 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <button type="button" className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest flex items-center gap-2 transition-colors">
                      <Upload size={14} /> Upload file
                    </button>
                  </div>
                </div>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-500/5 rounded-3xl blur-xl group-focus-within:bg-indigo-500/10 transition-all" />
                <textarea
                  required
                  className="relative w-full h-[500px] p-6 bg-slate-900 text-indigo-100 font-mono text-sm rounded-[24px] border-none focus:ring-4 focus:ring-indigo-500/10 transition-all scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent leading-relaxed"
                  placeholder={importType === 'module' ? '{ "title": "New Module", ... }' : '{ "title": "Existing Item", ... }'}
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button 
                type="submit" 
                className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group" 
                disabled={status === "importing" || status === "loading" || !jsonData.trim()}
              >
                {status === "importing" ? (
                  <><Loader2 className="animate-spin" size={20} /> Processing...</>
                ) : (
                  <>
                    <RefreshCw size={20} /> 
                    <span>{importType === 'module' ? 'Start Import Process' : `Update Selected ${importType.charAt(0).toUpperCase() + importType.slice(1)}`}</span> 
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" size={20} />
                  </>
                )}
              </button>
            </div>
          </form>

          {status === "error" && (
            <div className="mt-8 p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-4 animate-in shake duration-500">
              <AlertCircle size={20} className="shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === "success" && (
            <div className="mt-8 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-sm font-bold flex items-center gap-4 animate-in fade-in duration-500">
              <CheckCircle2 size={20} className="shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}
        </div>

        {/* Instructions / Sample */}
        <div className="lg:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <Info size={18} className="text-indigo-500" /> How it works
            </h3>
            <ul className="space-y-4 text-slate-500 font-medium text-sm leading-relaxed">
              {importType === 'module' ? (
                <>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <span>The system accepts a deeply nested JSON structure for batch processing.</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <span>Define a <strong className="text-slate-900">Module</strong> with multiple <strong className="text-slate-900">Lessons</strong> and <strong className="text-slate-900">Slides</strong>.</span>
                  </li>
                </>
              ) : (
                <>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <span>Select an existing {importType} to load its current data as JSON.</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <span>{importType === 'lesson' ? 'Updating a lesson also allows you to sync its slides.' : 'Update slide properties directly via JSON.'}</span>
                  </li>
                </>
              )}
              <li className="flex gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <span>Supports both <code className="bg-slate-50 px-1.5 py-0.5 rounded text-indigo-600">concept</code> and <code className="bg-slate-50 px-1.5 py-0.5 rounded text-indigo-600">practice</code> slide types.</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-900 rounded-[32px] p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl" />
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Sample Payload</h3>
              <button onClick={copySample} className="px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-widest transition-all border border-indigo-500/20 flex items-center gap-2">
                <Copy size={12} /> Use Sample
              </button>
            </div>
            
            <pre className="text-[11px] text-indigo-200/70 font-mono leading-relaxed overflow-x-auto max-h-[350px] scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
              {JSON.stringify(importType === "module" ? sampleModule : (importType === "lesson" ? sampleLesson : sampleSlide), null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
