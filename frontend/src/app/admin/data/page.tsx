"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Copy, Download, Search, Layout, Database, 
  Code, Loader2, CheckCircle2, ChevronRight, FileJson, 
  Filter, Settings2, Sparkles, Box, List, Presentation
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import Toast from "@/components/ui/Toast";

type DataType = "module" | "lesson" | "slide";

export default function DataExplorerPage() {
  const { token, user, isLoading: authLoading } = useAuth();
  const [dataType, setDataType] = useState<DataType>("module");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [cleanForImport, setCleanForImport] = useState(true);

  // Selection state
  const [modules, setModules] = useState<any[]>([]);
  const [lessons, setLessons] = useState<any[]>([]);
  const [slides, setSlides] = useState<any[]>([]);
  
  const [selectedModuleId, setSelectedModuleId] = useState("");
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [selectedSlideId, setSelectedSlideId] = useState("");

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';

  useEffect(() => {
    if (token) {
      fetchModules();
    }
  }, [token]);

  useEffect(() => {
    if (selectedModuleId && token) {
      fetchLessons(selectedModuleId);
    } else {
      setLessons([]);
      setSelectedLessonId("");
    }
  }, [selectedModuleId, token]);

  useEffect(() => {
    if (selectedLessonId && token) {
      fetchSlides(selectedLessonId);
    } else {
      setSlides([]);
      setSelectedSlideId("");
    }
  }, [selectedLessonId, token]);

  // Fetch target data when selection changes
  useEffect(() => {
    if (dataType === "module" && selectedModuleId) {
      fetchItemData("modules", selectedModuleId);
    } else if (dataType === "lesson" && selectedLessonId) {
      fetchItemData("lessons", selectedLessonId);
    } else if (dataType === "slide" && selectedSlideId) {
      fetchItemData("slides", selectedSlideId);
    }
  }, [selectedModuleId, selectedLessonId, selectedSlideId, dataType]);

  const fetchModules = async () => {
    try {
      const res = await fetch(`${apiUrl}/admin/modules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setModules(result.data || []);
    } catch (error) {
      console.error("Error fetching modules:", error);
    }
  };

  const fetchLessons = async (moduleId: string) => {
    try {
      const res = await fetch(`${apiUrl}/admin/lessons?module_id=${moduleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setLessons(result.data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
    }
  };

  const fetchSlides = async (lessonId: string) => {
    try {
      const res = await fetch(`${apiUrl}/slides/lesson/${lessonId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setSlides(result.data || []);
    } catch (error) {
      console.error("Error fetching slides:", error);
    }
  };

  const fetchItemData = async (type: string, id: string) => {
    setLoading(true);
    try {
      const endpoint = type === "modules" ? `${apiUrl}/modules/${id}` : (type === "lessons" ? `${apiUrl}/lessons/${id}` : `${apiUrl}/slides/${id}`);
      const res = await fetch(endpoint, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await res.json();
      setData(result.data);
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  const getCleanedData = (rawData: any) => {
    if (!rawData) return null;
    if (!cleanForImport) return rawData;

    const clean = (obj: any): any => {
      if (Array.isArray(obj)) return obj.map(clean);
      if (obj !== null && typeof obj === 'object') {
        const newObj: any = {};
        for (const key in obj) {
          if ([
            'created_at', 'updated_at', 'teacher_id', 'module_id', 
            'lesson_id', 'course_id', 'pivot', 'teacher', 'module', 
            'courses', 'course', 'course_title'
          ].includes(key)) continue;
          
          // Keep ID only for nested slides in lesson update mode, 
          // or if we specifically want to update existing items.
          // For a fresh import, we usually strip IDs, but for "update json" we might want to keep them.
          // Let's keep ID but strip the rest.
          
          newObj[key] = clean(obj[key]);
        }
        return newObj;
      }
      return obj;
    };

    return clean(rawData);
  };

  const processedData = getCleanedData(data);

  const copyToClipboard = () => {
    if (!processedData) return;
    navigator.clipboard.writeText(JSON.stringify(processedData, null, 2));
    setCopied(true);
    setShowToast(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadJson = () => {
    if (!processedData) return;
    const blob = new Blob([JSON.stringify(processedData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = data?.title?.toLowerCase().replace(/\s+/g, '_') || dataType;
    a.download = `${name}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 className="animate-spin text-indigo-500" size={32} />
    </div>
  );

  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center text-rose-500">
          <Database size={40} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Unauthorized Access</h2>
        <p className="text-slate-500 font-medium">You do not have permission to view the raw data explorer.</p>
        <Link href="/" className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1600px] mx-auto space-y-10">
      <Toast show={showToast} message="JSON copied to clipboard! Ready for import." onClose={() => setShowToast(false)} />
      
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
               <Database size={20} />
             </div>
             <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full border border-indigo-100 uppercase tracking-widest">
               DATA EXPORT TOOLS
             </span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Curriculum Data Explorer</h1>
          <p className="text-slate-500 text-lg font-medium">Navigate, clean, and export curriculum objects for bulk importing or backup.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-[20px] border border-slate-200 self-start md:self-end">
          <button 
            onClick={() => setDataType("module")}
            className={`px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${dataType === "module" ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Box size={14} /> Module
          </button>
          <button 
            onClick={() => setDataType("lesson")}
            className={`px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${dataType === "lesson" ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <List size={14} /> Lesson
          </button>
          <button 
            onClick={() => setDataType("slide")}
            className={`px-6 py-2.5 rounded-[14px] text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all ${dataType === "slide" ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Presentation size={14} /> Slide
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Sidebar Selectors */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[32px] p-8 shadow-sm space-y-8">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
              <Filter size={18} className="text-indigo-500" /> Filter Hierarchy
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Module</label>
                <DropdownSelect 
                  options={modules.map(m => ({ value: m.id.toString(), label: m.title }))}
                  value={selectedModuleId}
                  onChange={(val) => {
                    setSelectedModuleId(val);
                    setSelectedLessonId("");
                    setSelectedSlideId("");
                  }}
                  placeholder="Choose a module..."
                />
              </div>

              {(dataType === "lesson" || dataType === "slide") && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Lesson</label>
                  <DropdownSelect 
                    options={lessons.map(l => ({ value: l.id.toString(), label: l.title }))}
                    value={selectedLessonId}
                    onChange={(val) => {
                      setSelectedLessonId(val);
                      setSelectedSlideId("");
                    }}
                    placeholder={selectedModuleId ? "Choose a lesson..." : "Select module first"}
                  />
                </div>
              )}

              {dataType === "slide" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-4 duration-300">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Slide</label>
                  <DropdownSelect 
                    options={slides.map(s => ({ value: s.id.toString(), label: s.title }))}
                    value={selectedSlideId}
                    onChange={setSelectedSlideId}
                    placeholder={selectedLessonId ? "Choose a slide..." : "Select lesson first"}
                  />
                </div>
              )}
            </div>

            <div className="pt-4 space-y-4">
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Settings2 size={14} className="text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">Clean for Import</span>
                </div>
                <button 
                  onClick={() => setCleanForImport(!cleanForImport)}
                  className={`w-12 h-6 rounded-full transition-all relative ${cleanForImport ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${cleanForImport ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Removes metadata like timestamps, teacher IDs, and relationship wrappers for clean JSON import.
              </p>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[32px] p-8 text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
             <Sparkles className="absolute -right-4 -top-4 text-white/10 w-32 h-32 rotate-12 group-hover:scale-110 transition-transform duration-700" />
             <h4 className="text-lg font-black mb-2 relative">Import Ready</h4>
             <p className="text-indigo-100 text-sm leading-relaxed relative">
               The "Clean for Import" mode ensures the JSON perfectly matches the format expected by the Import Tool.
             </p>
             <Link href="/admin/import" className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest bg-white/10 hover:bg-white/20 py-3 px-6 rounded-xl transition-all relative">
               Go to Import Tool <ChevronRight size={14} />
             </Link>
          </div>
        </div>

        {/* Data View */}
        <div className="xl:col-span-8 bg-white border border-slate-200 rounded-[40px] p-8 md:p-10 shadow-sm animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-indigo-400 shadow-lg">
                <Code size={20} />
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">
                  JSON BUFFER VIEW
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {data ? data.title : "No item selected"}
                </span>
              </div>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={copyToClipboard} 
                disabled={!processedData}
                className={`
                  flex-1 md:flex-none px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all border
                  ${copied ? "bg-emerald-50 border-emerald-100 text-emerald-600" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50"}
                `}
              >
                {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />} 
                {copied ? "Copied" : "Copy for Import"}
              </button>
              <button 
                onClick={downloadJson} 
                disabled={!processedData}
                className="flex-1 md:flex-none px-6 py-3.5 bg-slate-900 text-white font-bold rounded-2xl text-sm flex items-center justify-center gap-2 hover:bg-slate-800 transition-all border border-slate-800 disabled:opacity-50"
              >
                <Download size={18} /> Export .json
              </button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-500/5 rounded-[32px] blur-3xl group-hover:bg-indigo-500/10 transition-all" />
            <div className="relative bg-slate-900 rounded-[32px] border border-slate-800 p-8 md:p-10 min-h-[500px] max-h-[700px] overflow-auto shadow-2xl scrollbar-thin scrollbar-thumb-indigo-500/20 scrollbar-track-transparent">
              {loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="animate-spin text-indigo-500" size={48} />
                  <span className="text-indigo-400/60 font-mono text-xs uppercase tracking-widest animate-pulse">Synchronizing Data Stream...</span>
                </div>
              ) : (
                <pre className="text-indigo-100/70 text-sm font-mono leading-relaxed whitespace-pre-wrap md:whitespace-pre">
                  {processedData 
                    ? JSON.stringify(processedData, null, 2) 
                    : "// Select a module, lesson, or slide from the filter panel to inspect its data structure.\n// Enable 'Clean for Import' to prepare data for the curriculum tool."}
                </pre>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
               <FileJson size={14} className="text-slate-300" />
               <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                 Raw Curriculum Buffer • REST API v1.2
               </span>
            </div>
            {data && (
              <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                ID: {data.id} • Type: {dataType.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
