 "use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, FileText, AlertCircle, Eye, Edit3, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import { marked } from "marked";
import Toast from "@/components/ui/Toast";

export default function EditSlidePage({ params }: { params: Promise<{ id: string, slideId: string }> }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.id;
  const slideId = resolvedParams.slideId;
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    type: "concept",
    content: "",
    code_snippet: "",
    image_position: "top",
    image_width: "100",
    code_position: "right",
    code_theme: "terminal",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const [status, setStatus] = useState<"loading_initial" | "idle" | "saving" | "error">("loading_initial");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [showToast, setShowToast] = useState(false);

  const parsedContent = useMemo(() => {
    if (!formData.content) return "<p style='opacity:0.25;font-style:italic'>Switch to Editor and start writing to preview your slide...</p>";
    return marked.parse(formData.content) as string;
  }, [formData.content]);

  useEffect(() => {
    if (!authLoading && token) {
        fetchSlide();
    }
  }, [slideId, token, authLoading]);

  const fetchSlide = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/slides/${slideId}`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      if (!res.ok) throw new Error("Failed to fetch slide");
      const data = await res.json();
      const s = data.data;
      setFormData({
        title: s.title || "",
        type: s.type || "concept",
        content: s.content || "",
        code_snippet: s.code_snippet || "",
        image_position: s.image_position || "top",
        image_width: s.image_width || "100",
        code_position: s.code_position || "right",
        code_theme: s.code_theme || "terminal",
      });
      if (s.image) {
        const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage';
        setCurrentImage(`${storageUrl}/${s.image}`);
      }
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const data = new FormData();
      data.append('_method', 'PUT');
      data.append('title', formData.title);
      data.append('type', formData.type);
      data.append('content', formData.content);
      data.append('image_position', formData.image_position);
      data.append('image_width', formData.image_width);
      data.append('code_position', formData.code_position);
      data.append('code_theme', formData.code_theme);
      data.append('code_snippet', formData.code_snippet);
      if (imageFile) data.append('image', imageFile);

      const res = await fetch(`${apiUrl}/slides/${slideId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: data,
      });

      if (!res.ok) throw new Error("Failed to update slide");

      setShowToast(true);
      setTimeout(() => {
        router.push(`/admin/lessons/${lessonId}/slides`);
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (authLoading) return null;

  return (
    <div className="page" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Toast show={showToast} message="Slide updated successfully!" onClose={() => setShowToast(false)} />
      
      <Link href={`/admin/lessons/${lessonId}/slides`} className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Slides
      </Link>

      <header className="page-header" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
             <FileText size={24} color="var(--amber, #f59e0b)" />
             <span className="badge" style={{ background: 'var(--amber-light, #fef3c7)', color: 'var(--amber, #d97706)', fontSize: '11px', fontWeight: 700 }}>EDITING SLIDE</span>
          </div>
          <h1 className="page-title" style={{ fontSize: '28px' }}>"{formData.title || 'Slide Editor'}"</h1>
        </div>

        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border)' }}>
          <button type="button" onClick={() => setActiveTab("edit")} className={`btn ${activeTab === "edit" ? "btn-primary" : "btn-ghost"}`} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>
            <Edit3 size={14} /> Editor
          </button>
          <button type="button" onClick={() => setActiveTab("preview")} className={`btn ${activeTab === "preview" ? "btn-primary" : "btn-ghost"}`} style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px' }}>
            <Eye size={14} /> Live Preview
          </button>
        </div>
      </header>

      {activeTab === "edit" && (
        <form className="glass-card animate-fadeIn" style={{ padding: '40px', background: 'white' }} onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            <div className="grid-2">
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>SLIDE TITLE</label>
                <input type="text" required className="url-input" placeholder="Enter slide title..." style={{ width: '100%', padding: '14px', fontSize: '18px', fontWeight: 600 }}
                  value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>CONTENT TYPE</label>
                <DropdownSelect 
                  options={[{ value: "concept", label: "Concept (Theory)" }, { value: "practice", label: "Practice (Code)" }, { value: "summary", label: "Summary (Review)" }]}
                  value={formData.type} onChange={(value) => setFormData({...formData, type: value})}
                />
              </div>
            </div>

            <div className="grid-2">
              <div>
                <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>SLIDE IMAGE / DIAGRAM (OPTIONAL)</label>
                <div style={{ 
                  border: '2px dashed var(--border)', 
                  borderRadius: '16px', 
                  padding: '20px', 
                  textAlign: 'center',
                  background: 'var(--bg-secondary)',
                  position: 'relative',
                  overflow: 'hidden',
                  minHeight: (imagePreview || currentImage) ? 'auto' : '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {(imagePreview || currentImage) ? (
                    <div style={{ width: '100%', position: 'relative' }}>
                      <img src={imagePreview || currentImage || ''} alt="Preview" style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', borderRadius: '12px' }} />
                      <button 
                        type="button" 
                        onClick={() => { setImageFile(null); setImagePreview(null); if (!imagePreview) setCurrentImage(null); }}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div style={{ color: 'var(--text-muted)' }}>
                      <p style={{ fontSize: '14px', marginBottom: '8px' }}>Drag & drop or click to change image</p>
                      <p style={{ fontSize: '12px' }}>Leave empty to keep current or remove</p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>IMAGE POSITION</label>
                  <DropdownSelect 
                    options={[
                      { value: "top", label: "Top (Full Width)" },
                      { value: "bottom", label: "Bottom (Full Width)" },
                      { value: "left", label: "Left (Split View)" },
                      { value: "right", label: "Right (Split View)" }
                    ]}
                    value={formData.image_position}
                    onChange={(value) => setFormData({...formData, image_position: value})}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>IMAGE WIDTH: {formData.image_width}%</label>
                  <input 
                    type="range" 
                    min="20" 
                    max="100" 
                    step="5"
                    value={formData.image_width}
                    onChange={(e) => setFormData({...formData, image_width: e.target.value})}
                    style={{ width: '100%', accentColor: 'var(--indigo)' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Small</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Original</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>TEACHING MATERIAL (HTML/MARKDOWN)</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  {[
                    { label: 'H2', tag: '<h2>Title</h2>' },
                    { label: 'P', tag: '<p>Paragraph</p>' },
                    { label: 'Bold', tag: '<strong>Text</strong>' },
                    { label: 'Code', tag: '<code>code</code>' },
                    { label: 'Red', tag: '<span style="color:#ef4444">Text</span>' },
                    { label: 'Blue', tag: '<span style="color:#3b82f6">Text</span>' },
                    { label: 'Green', tag: '<span style="color:#10b981">Text</span>' },
                    { label: 'Highlight', tag: '<mark style="background:#fef08a;padding:0 4px;border-radius:4px">Text</mark>' },
                    { label: 'List', tag: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>' }
                  ].map(item => (
                    <button key={item.label} type="button" onClick={() => setFormData({ ...formData, content: formData.content + item.tag })}
                      style={{ padding: '4px 10px', fontSize: '11px', fontWeight: 600, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '6px', cursor: 'pointer', color: 'var(--indigo)' }}>{item.label}</button>
                  ))}
                </div>
              </div>
              <textarea required className="url-input" placeholder="Use HTML tags..." style={{ width: '100%', minHeight: '300px', resize: 'vertical', padding: '20px', lineHeight: '1.7', fontSize: '15px', fontFamily: 'monospace', border: '1px solid var(--border)' }}
                value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} />
            </div>

            {(formData.type === 'practice' || formData.code_snippet) && (
               <div className="animate-fadeIn">
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <Terminal size={16} color="var(--emerald)" />
                         <span>INTERACTIVE CODE SNIPPET</span>
                       </div>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>THEME:</span>
                         <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <button type="button" onClick={() => setFormData({...formData, code_theme: 'terminal'})}
                               style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: formData.code_theme === 'terminal' ? 'white' : 'transparent', fontWeight: 600, color: formData.code_theme === 'terminal' ? 'var(--indigo)' : 'var(--text-muted)', boxShadow: formData.code_theme === 'terminal' ? 'var(--shadow-sm)' : 'none' }}>Terminal</button>
                            <button type="button" onClick={() => setFormData({...formData, code_theme: 'browser'})}
                               style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: formData.code_theme === 'browser' ? 'white' : 'transparent', fontWeight: 600, color: formData.code_theme === 'browser' ? 'var(--indigo)' : 'var(--text-muted)', boxShadow: formData.code_theme === 'browser' ? 'var(--shadow-sm)' : 'none' }}>Browser</button>
                            <button type="button" onClick={() => setFormData({...formData, code_theme: 'editor'})}
                               style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: formData.code_theme === 'editor' ? 'white' : 'transparent', fontWeight: 600, color: formData.code_theme === 'editor' ? 'var(--indigo)' : 'var(--text-muted)', boxShadow: formData.code_theme === 'editor' ? 'var(--shadow-sm)' : 'none' }}>Editor</button>
                         </div>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>POSITION:</span>
                         <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <button type="button" onClick={() => setFormData({...formData, code_position: 'bottom'})}
                               style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: formData.code_position === 'bottom' ? 'white' : 'transparent', fontWeight: 600, color: formData.code_position === 'bottom' ? 'var(--indigo)' : 'var(--text-muted)', boxShadow: formData.code_position === 'bottom' ? 'var(--shadow-sm)' : 'none' }}>Bottom</button>
                            <button type="button" onClick={() => setFormData({...formData, code_position: 'right'})}
                               style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px', cursor: 'pointer', border: 'none', background: formData.code_position === 'right' ? 'white' : 'transparent', fontWeight: 600, color: formData.code_position === 'right' ? 'var(--indigo)' : 'var(--text-muted)', boxShadow: formData.code_position === 'right' ? 'var(--shadow-sm)' : 'none' }}>Right Side</button>
                         </div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Editor Header based on theme */}
                 <div style={{ 
                   borderRadius: '12px 12px 0 0', 
                   background: formData.code_theme === 'browser' ? '#e2e8f0' : formData.code_theme === 'editor' ? '#1e1e1e' : '#1e293b', 
                   padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', 
                   borderBottom: formData.code_theme === 'browser' ? '1px solid #cbd5e1' : '1px solid #334155' 
                 }}>
                    {formData.code_theme !== 'editor' && (
                      <div style={{ display: 'flex', gap: '6px' }}>
                         <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
                         <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
                         <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                      </div>
                    )}
                    {formData.code_theme === 'browser' && (
                      <div style={{ flex: 1, margin: '0 16px', background: 'white', borderRadius: '6px', height: '24px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                        <span style={{ fontSize: '10px', color: '#94a3b8' }}>localhost:3000</span>
                      </div>
                    )}
                 </div>
                 <textarea className="url-input" placeholder="// Enter code..." style={{ 
                   width: '100%', minHeight: '220px', resize: 'vertical', padding: '20px', lineHeight: '1.6', fontSize: '14px', fontFamily: 'monospace', 
                   background: formData.code_theme === 'browser' ? '#ffffff' : formData.code_theme === 'editor' ? '#1e1e1e' : '#0f172a', 
                   color: formData.code_theme === 'browser' ? '#334155' : '#e2e8f0', 
                   borderRadius: '0 0 12px 12px', 
                   border: formData.code_theme === 'browser' ? '1px solid #e2e8f0' : '1px solid #1e293b' 
                 }}
                   value={formData.code_snippet} onChange={(e) => setFormData({...formData, code_snippet: e.target.value})} />
               </div>
            )}
          </div>

          <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
            <Link href={`/admin/lessons/${lessonId}/slides`} className="btn btn-ghost" style={{ padding: '14px 24px' }}>Discard</Link>
            <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px' }} disabled={status === "saving"}>
              {status === "saving" ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              <span>{status === "saving" ? "Updating..." : "Update Slide"}</span>
            </button>
          </div>
          
          {status === "error" && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--rose-light)', color: 'var(--rose)', borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} />
              <span><strong>Error:</strong> Failed to update slide. Please try again.</span>
            </div>
          )}
        </form>
      )}

      {activeTab === "preview" && (
         <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            {/* Real Student Viewer Simulation */}
            <div className="slide-viewer" style={{ minHeight: '650px', boxShadow: 'var(--shadow-lg)' }}>
               <div className="slide-header">
                 <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                   <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                     <span className={`badge badge-${formData.type === 'practice' ? 'indigo' : 'emerald'}`} style={{ padding: '4px 12px', fontSize: '10px' }}>
                       {formData.type.toUpperCase()}
                     </span>
                     <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
                       Preview Mode
                     </span>
                   </div>
                   <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
                   <h3 style={{ fontSize: "14px", fontWeight: 700, color: 'var(--text-primary)' }}>{formData.title || 'Untitled Slide'}</h3>
                 </div>
               </div>

               <div 
                 className="slide-content" 
                 style={{ 
                   display: 'flex',
                   flexDirection: 
                     formData.code_position === 'right' ? 'row' : 'column',
                   gap: '48px',
                   alignItems: formData.code_position === 'right' ? 'stretch' : 'center',
                   background: 'white'
                 }}
               >
                 {/* Main Content Area (Text + Optional Image) */}
                 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div 
                      style={{ 
                        display: 'flex',
                        flexDirection: 
                          formData.image_position === 'top' ? 'column' :
                          formData.image_position === 'bottom' ? 'column-reverse' :
                          formData.image_position === 'left' ? 'row' : 'row-reverse',
                        gap: '32px',
                        alignItems: (formData.image_position === 'left' || formData.image_position === 'right') ? 'center' : 'stretch'
                      }}
                    >
                      {(imagePreview || currentImage) && (
                        <div style={{ 
                          flex: (formData.image_position === 'left' || formData.image_position === 'right') ? `0 0 ${formData.image_width}%` : 'none',
                          width: (formData.image_position === 'top' || formData.image_position === 'bottom') ? `${formData.image_width}%` : 'auto',
                          margin: (formData.image_position === 'top' || formData.image_position === 'bottom') ? '0 auto 16px' : '0',
                          borderRadius: '16px', 
                          overflow: 'hidden', 
                          boxShadow: '0 15px 35px rgba(0,0,0,0.08), 0 0 0 1px var(--border)',
                          maxHeight: (formData.image_position === 'top' || formData.image_position === 'bottom') ? '350px' : 'none'
                        }}>
                          <img src={imagePreview || currentImage || ''} alt="Slide content" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                        </div>
                      )}
                      <div style={{ flex: 1 }}>
                        <div dangerouslySetInnerHTML={{ __html: parsedContent }} />
                      </div>
                    </div>

                    {/* Code Snippet at Bottom */}
                    {formData.code_snippet && formData.code_position === 'bottom' && (
                       <div style={{ 
                         marginTop: '32px', borderRadius: '16px', overflow: 'hidden', 
                         background: formData.code_theme === 'browser' ? '#ffffff' : formData.code_theme === 'editor' ? '#1e1e1e' : '#0f172a',
                         border: formData.code_theme === 'browser' ? '1px solid #e2e8f0' : '1px solid #1e293b', 
                         boxShadow: '0 10px 30px rgba(0,0,0,0.15)' 
                       }}>
                          <div style={{ 
                            padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', 
                            background: formData.code_theme === 'browser' ? '#f1f5f9' : formData.code_theme === 'editor' ? '#2d2d2d' : '#1e293b',
                            borderBottom: formData.code_theme === 'browser' ? '1px solid #e2e8f0' : '1px solid #334155' 
                          }}>
                             {formData.code_theme !== 'editor' && (
                               <div style={{ display: 'flex', gap: '6px' }}>
                                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} /><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} /><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                               </div>
                             )}
                             {formData.code_theme === 'browser' ? (
                               <div style={{ flex: 1, margin: '0 16px', background: 'white', borderRadius: '6px', height: '24px', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid #e2e8f0' }}>
                                 <span style={{ fontSize: '10px', color: '#94a3b8' }}>localhost:3000</span>
                               </div>
                             ) : (
                               <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: formData.code_theme === 'editor' ? '0' : '12px', fontWeight: 600, letterSpacing: '0.05em' }}>
                                 {formData.code_theme === 'editor' ? 'editor.ts' : 'PREVIEW CONSOLE'}
                               </span>
                             )}
                          </div>
                          <pre style={{ 
                            padding: '24px', margin: 0, fontSize: '13.5px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: '1.7',
                            color: formData.code_theme === 'browser' ? '#334155' : '#e2e8f0'
                          }}><code>{formData.code_snippet}</code></pre>
                       </div>
                    )}
                 </div>

                 {/* Code Snippet on Right Side */}
                 {formData.code_snippet && formData.code_position === 'right' && (
                    <div style={{ 
                      flex: '0 0 45%', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
                      background: formData.code_theme === 'browser' ? '#ffffff' : formData.code_theme === 'editor' ? '#1e1e1e' : '#0f172a',
                      border: formData.code_theme === 'browser' ? '1px solid #e2e8f0' : '1px solid #1e293b', 
                      boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
                    }}>
                       <div style={{ 
                         padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px', 
                         background: formData.code_theme === 'browser' ? '#f1f5f9' : formData.code_theme === 'editor' ? '#2d2d2d' : '#1e293b',
                         borderBottom: formData.code_theme === 'browser' ? '1px solid #e2e8f0' : '1px solid #334155' 
                       }}>
                          {formData.code_theme !== 'editor' && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                               <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} /><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} /><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                            </div>
                          )}
                          {formData.code_theme === 'browser' ? (
                            <div style={{ flex: 1, margin: '0 16px', background: 'white', borderRadius: '6px', height: '24px', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid #e2e8f0' }}>
                              <span style={{ fontSize: '10px', color: '#94a3b8' }}>localhost:3000</span>
                            </div>
                          ) : (
                            <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: formData.code_theme === 'editor' ? '0' : '12px', fontWeight: 600, letterSpacing: '0.05em' }}>
                              {formData.code_theme === 'editor' ? 'editor.ts' : 'PREVIEW CONSOLE'}
                            </span>
                          )}
                       </div>
                       <pre style={{ 
                         flex: 1, padding: '24px', margin: 0, fontSize: '13.5px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: '1.7',
                         color: formData.code_theme === 'browser' ? '#334155' : '#e2e8f0'
                       }}><code>{formData.code_snippet}</code></pre>
                    </div>
                 )}
               </div>

               <div className="slide-footer">
                 <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>PREVIEW MODE</div>
                 <div className="slide-progress">
                    <div className="slide-dot active" />
                    <div className="slide-dot" />
                    <div className="slide-dot" />
                 </div>
                 <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9' }} />
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9' }} />
                 </div>
               </div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '16px', border: '1px dashed var(--indigo)' }}>
               <p style={{ fontSize: '13px', color: 'var(--indigo)', fontWeight: 600 }}>📺 High-fidelity student view simulation — switch back to Editor to make changes.</p>
            </div>
         </div>
      )}
    </div>
  );
}
