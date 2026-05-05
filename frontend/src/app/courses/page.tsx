"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Search, Star, Users, CheckCircle2, ArrowRight, Loader2, Upload, X, ShieldCheck, ChevronDown, ChevronUp, Layers } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ModuleIcon from "@/components/ModuleIcon";

export default function BrowseCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<number[]>([]);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { token, user } = useAuth();

  const [mounted, setMounted] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [phone, setPhone] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Syllabus Preview State
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchAllData();
    }
  }, [token, mounted]);

  const fetchAllData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const res = await fetch(`${apiUrl}/courses`, { 
        headers,
        cache: 'no-store' 
      });
      const data = await res.json();
      setCourses(data.data || []);

      if (token) {
        const myRes = await fetch(`${apiUrl}/my-courses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const myData = await myRes.json();
        setMyCourses(myData.data?.map((c: any) => c.id) || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenEnroll = (course: any) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setScreenshot(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse || !screenshot || !phone) {
      alert("Please complete all fields and upload your invoice.");
      return;
    }

    setEnrollingId(selectedCourse.id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      
      const formData = new FormData();
      formData.append('phone', phone);
      formData.append('payment_screenshot', screenshot);

      const res = await fetch(`${apiUrl}/courses/${selectedCourse.id}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: formData
      });

      if (res.ok) {
        alert("Success! Your verification request has been submitted. We will notify you once approved.");
        setShowModal(false);
        setPhone("");
        setScreenshot(null);
        setPreviewUrl(null);
      } else {
        const error = await res.json();
        alert(error.message || "Enrollment failed.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during enrollment.");
    } finally {
      setEnrollingId(null);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-7xl mx-auto">
      <header className="text-center max-w-2xl mx-auto mb-16 space-y-4">
        <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-wider mb-2">
          COURSE DISCOVERY
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">Expand Your Knowledge</h1>
        <p className="text-slate-500 text-lg md:text-xl leading-relaxed">
          Browse all specialized courses and enroll to unlock professional curriculum and hands-on exercises.
        </p>
      </header>

      {/* Enrollment Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-5">
          <div 
            onClick={() => setShowModal(false)}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
          />
          <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-[550px] p-8 md:p-10 overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer rounded-full hover:bg-slate-50"
            >
              <X size={24} />
            </button>

            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Course Verification</h2>
              <p className="text-slate-500 mt-2 font-medium">
                Enrolling in <strong className="text-indigo-600">{selectedCourse?.title}</strong>
              </p>
            </div>
            
            <form onSubmit={handleEnrollSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 block ml-1">Your Phone Number</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-400"
                  placeholder="e.g. 012 345 678" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900 block ml-1">Physical Invoice / Receipt Photo</label>
                {!previewUrl ? (
                  <div className="relative h-40 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <Upload size={24} className="text-slate-300" />
                    <span className="text-sm font-bold text-slate-400">Click to upload screenshot</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      required 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </div>
                ) : (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-black">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    <button 
                      type="button"
                      onClick={() => { setScreenshot(null); setPreviewUrl(null); }}
                      className="absolute right-3 top-3 bg-black/50 hover:bg-black/70 text-white border-none rounded-full w-8 h-8 flex items-center justify-center cursor-pointer backdrop-blur-sm transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
                <p className="text-[11px] text-slate-400 font-medium ml-1">Please ensure the invoice number and date are clearly visible.</p>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={enrollingId !== null}
              >
                {enrollingId !== null ? <><Loader2 className="animate-spin" size={20} /> Submitting...</> : "Submit for Verification"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-1 mb-12 flex items-center group focus-within:border-indigo-500/50">
        <div className="relative flex-1">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search for a course..." 
            className="w-full pl-14 pr-6 h-14 text-lg bg-transparent border-none outline-none text-slate-900 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-6">
        {filteredCourses.map((course, index) => {
          const isEnrolled = myCourses.includes(course.id);
          const isExpanded = expandedCourseId === course.id;

          return (
            <div 
              key={course.id} 
              className="group bg-white border border-slate-200 rounded-[32px] shadow-sm hover:shadow-xl transition-all overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-6 md:p-8 flex flex-col lg:flex-row items-center gap-8">
                <div className="w-24 h-24 md:w-28 md:h-28 bg-indigo-50 rounded-[32px] flex items-center justify-center shrink-0 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                   {course.image ? (
                     <img 
                       src={course.image.startsWith('http') ? course.image : `${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage'}/${course.image}`} 
                       alt={course.title} 
                       className="w-full h-full object-cover"
                     />
                   ) : (
                     <BookOpen size={48} className="text-indigo-500" />
                   )}
                </div>

                <div className="flex-1 text-center lg:text-left min-w-0 space-y-4">
                  <div className="flex flex-col md:flex-row items-center justify-center lg:justify-start gap-3">
                    <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">{course.title}</h3>
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-sm font-black border border-emerald-100 shadow-sm">${course.price || '0.00'}</span>
                  </div>
                  <p className="text-slate-500 text-base leading-relaxed line-clamp-2 max-w-2xl font-medium">
                    {course.description || "Master this technology from scratch with our professional, hands-on curriculum."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-8 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Layers size={16} className="text-indigo-500" />
                      <span>{course.modules_count || 0} Modules</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={16} />
                      <span>1,240 Students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star size={16} className="text-amber-400 fill-amber-400" />
                      <span>4.9 Rating</span>
                    </div>
                  </div>
                </div>

                <div className="w-full lg:w-72 flex flex-col gap-3 shrink-0">
                  <button 
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    className="w-full py-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-2xl transition-all border border-slate-200 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isExpanded ? <><ChevronUp size={18} /> Hide Syllabus</> : <><ChevronDown size={18} /> View Syllabus</>}
                  </button>

                  {(user?.role === 'admin' || user?.role === 'teacher') ? (
                    <Link href="/admin/courses" className="w-full py-3.5 bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                      <Layers size={18} /> Manage Course
                    </Link>
                  ) : isEnrolled ? (
                    <Link href="/modules" className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2">
                      <CheckCircle2 size={18} /> Go to Lessons
                    </Link>
                  ) : (
                    <button 
                      onClick={() => handleOpenEnroll(course)} 
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
                      disabled={enrollingId === course.id}
                    >
                      {enrollingId === course.id ? (
                        <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                      ) : (
                        <><ArrowRight size={18} /> Enroll Now</>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Expanded Syllabus Section */}
              {isExpanded && (
                <div className="bg-slate-50/80 border-t border-slate-100 p-8 md:p-10 animate-in slide-in-from-top-4 duration-300">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="w-1 h-6 bg-indigo-500 rounded-full"></div>
                      <h4 className="text-lg font-extrabold text-slate-900 tracking-tight">Course Curriculum Preview</h4>
                   </div>

                   {course.modules?.length === 0 ? (
                      <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 italic text-slate-400 font-medium">
                        No modules published for this course yet.
                      </div>
                   ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {course.modules?.map((module: any, mIndex: number) => (
                          <div key={module.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:border-indigo-500/30 transition-colors">
                             <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${module.color}15` }}>
                                <ModuleIcon icon={module.icon} imageUrl={module.image} size={20} color={module.color} />
                             </div>
                             <div className="min-w-0">
                                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-0.5">CHAPTER {mIndex + 1}</div>
                                <div className="text-sm font-bold text-slate-900 truncate">{module.title}</div>
                             </div>
                          </div>
                        ))}
                      </div>
                   )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
