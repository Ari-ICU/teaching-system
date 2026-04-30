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
    <div className="page">
      <header className="page-header" style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 60px' }}>
        <span className="badge badge-indigo" style={{ marginBottom: '16px' }}>COURSE DISCOVERY</span>
        <h1 className="page-title responsive-title" style={{ marginBottom: '16px' }}>Expand Your Knowledge</h1>
        <p className="page-subtitle responsive-subtitle">
          Browse all specialized courses and enroll to unlock professional curriculum and hands-on exercises.
        </p>
      </header>

      {/* Enrollment Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-card animate-fadeInUp" style={{ maxWidth: '550px', width: '100%', padding: 'clamp(20px, 5vw, 40px)', background: 'white', position: 'relative' }}>
            <button 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', right: '24px', top: '24px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={24} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ width: '64px', height: '64px', background: 'var(--indigo-light)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <ShieldCheck size={32} color="var(--indigo)" />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Course Verification</h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                Enrolling in <strong>{selectedCourse?.title}</strong>
              </p>
            </div>
            
            <form onSubmit={handleEnrollSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Your Phone Number</label>
                <input 
                  type="text" 
                  className="url-input" 
                  placeholder="e.g. 012 345 678" 
                  required 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>Physical Invoice / Receipt Photo</label>
                {!previewUrl ? (
                  <div style={{ position: 'relative', height: '140px', border: '2px dashed var(--border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', background: 'var(--bg-secondary)', cursor: 'pointer' }}>
                    <Upload size={24} color="var(--text-muted)" />
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Click to upload screenshot</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      required 
                      onChange={handleFileChange}
                      style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} 
                    />
                  </div>
                ) : (
                  <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                    <button 
                      type="button"
                      onClick={() => { setScreenshot(null); setPreviewUrl(null); }}
                      style={{ position: 'absolute', right: '8px', top: '8px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Please ensure the invoice number and date are clearly visible.</p>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', height: '52px', fontSize: '16px' }} disabled={enrollingId !== null}>
                {enrollingId !== null ? <><Loader2 className="animate-spin" size={20} /> Submitting...</> : "Submit for Verification"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="glass-card" style={{ padding: '20px', marginBottom: '48px', display: 'flex', gap: '16px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
          <input 
            type="text" 
            placeholder="Search for a course..." 
            className="url-input" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', paddingLeft: '52px', background: 'transparent', border: 'none' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredCourses.map((course, index) => {
          const isEnrolled = myCourses.includes(course.id);
          const isExpanded = expandedCourseId === course.id;

          return (
            <div 
              key={course.id} 
              className="glass-card animate-fadeInUp" 
              style={{ 
                padding: '0', 
                overflow: 'hidden', 
                animationDelay: `${index * 0.1}s`,
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div className="course-item-header">
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  background: 'var(--indigo-light)', 
                  borderRadius: '20px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexShrink: 0,
                  overflow: 'hidden'
                }}>
                   {course.image ? (
                     <img 
                       src={course.image.startsWith('http') ? course.image : `${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage'}/${course.image}`} 
                       alt={course.title} 
                       style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                     />
                   ) : (
                     <BookOpen size={36} color="var(--indigo)" />
                   )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: 800 }}>{course.title}</h3>
                    <span className="badge badge-indigo" style={{ fontWeight: 800 }}>${course.price || '0.00'}</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>
                    {course.description || "Master this technology from scratch with our professional, hands-on curriculum."}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 24px', marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Layers size={14} /> {course.modules_count || 0} Modules</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Users size={14} /> 1,240 Students</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Star size={14} color="var(--amber)" fill="var(--amber)" /> 4.9 Rating</span>
                  </div>
                </div>

                <div className="course-item-actions">
                  <button 
                    onClick={() => setExpandedCourseId(isExpanded ? null : course.id)}
                    className="btn btn-ghost" 
                    style={{ border: '1px solid var(--border)', flex: 1, justifyContent: 'center' }}
                  >
                    {isExpanded ? <><ChevronUp size={18} /> Hide Syllabus</> : <><ChevronDown size={18} /> View Syllabus</>}
                  </button>

                  {(user?.role === 'admin' || user?.role === 'teacher') ? (
                    <Link href="/admin/courses" className="btn btn-ghost" style={{ border: '1px solid var(--indigo)', color: 'var(--indigo)', flex: 1, justifyContent: 'center' }}>
                      <Layers size={18} /> Manage Course
                    </Link>
                  ) : isEnrolled ? (
                    <Link href="/modules" className="btn" style={{ background: 'var(--emerald)', color: 'white', border: 'none', flex: 1, justifyContent: 'center' }}>
                      <CheckCircle2 size={18} /> Go to Lessons
                    </Link>
                  ) : (
                    <button 
                      onClick={() => handleOpenEnroll(course)} 
                      className="btn btn-primary" 
                      disabled={enrollingId === course.id}
                      style={{ flex: 1, justifyContent: 'center' }}
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
                <div style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', padding: 'clamp(20px, 5vw, 32px)' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                      <div style={{ width: '4px', height: '24px', background: 'var(--indigo)', borderRadius: '2px' }}></div>
                      <h4 style={{ fontSize: '18px', fontWeight: 800 }}>Course Curriculum Preview</h4>
                   </div>

                   {course.modules?.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No modules published for this course yet.</p>
                   ) : (
                      <div className="grid-responsive-syllabus">
                        {course.modules?.map((module: any, mIndex: number) => (
                          <div key={module.id} className="glass-card" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center', background: 'white' }}>
                             <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${module.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <ModuleIcon icon={module.icon} imageUrl={module.image} size={20} color={module.color} />
                             </div>
                             <div>
                                <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '2px' }}>CHAPTER {mIndex + 1}</div>
                                <div style={{ fontSize: '16px', fontWeight: 700 }}>{module.title}</div>
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

      <style jsx>{`
        .responsive-title {
          font-size: clamp(32px, 8vw, 48px);
        }
        .responsive-subtitle {
          font-size: clamp(16px, 4vw, 20px);
        }
        .course-item-header {
          padding: 32px;
          display: flex;
          gap: 32px;
          align-items: center;
        }
        .course-item-actions {
          display: flex;
          gap: 12px;
        }
        .grid-responsive-syllabus {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        @media (max-width: 1024px) {
          .course-item-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 24px;
          }
          .course-item-actions {
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .course-item-header {
            padding: 24px;
          }
          .course-item-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
