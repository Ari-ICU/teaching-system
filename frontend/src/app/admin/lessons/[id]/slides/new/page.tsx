"use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, FileText, AlertCircle, Eye, Edit3, Terminal, Layout, Columns2, Square, Type, ImageIcon, ChevronRight, Check, Plus, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import { marked } from "marked";
import SlideViewer from "@/components/SlideViewer";
import dynamic from "next/dynamic";

const ReactQuill = dynamic(() => import("react-quill-new"), { 
  ssr: false,
  loading: () => <div className="quill-loader">Loading Editor...</div>
});
import "react-quill-new/dist/quill.snow.css";

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
    { id: 'standard', name: 'Standard', icon: <Layout size={20} />, description: 'Default layout with text and media.' },
    { id: 'split', name: 'Split Screen', icon: <Columns2 size={20} />, description: 'Equal parts text and media.' },
    { id: 'centered', name: 'Centered', icon: <Square size={20} />, description: 'Minimalist, centered focus.' },
    { id: 'full-code', name: 'Full Code', icon: <Terminal size={20} />, description: 'Maximize the code editor view.' },
  ];

  if (status === "loading_initial") {
    return (
        <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <Loader2 className="animate-spin" size={48} color="var(--indigo)" />
          <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Opening Slide Studio...</p>
        </div>
      );
  }

  return (
    <div className="page studio-page">
      <div className="studio-top-nav">
        <Link href={`/admin/lessons/${lessonId}/slides`} className="back-link">
          <ArrowLeft size={16} /> <span>Back to Lesson</span>
        </Link>
        <div className="studio-tabs">
          <button onClick={() => setActiveTab("edit")} className={activeTab === "edit" ? "active" : ""}>
            <Edit3 size={14} /> Editor
          </button>
          <button onClick={() => setActiveTab("preview")} className={activeTab === "preview" ? "active" : ""}>
            <Eye size={14} /> Preview
          </button>
        </div>
        <div className="studio-actions">
           <button onClick={handleSubmit} className="btn btn-primary" disabled={status === "saving"}>
             {status === "saving" ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
             Publish Slide
           </button>
        </div>
      </div>

      <main className="studio-content">
        {activeTab === "edit" ? (
          <div className="editor-grid animate-fadeIn">
            {/* Left Column: Form Fields */}
            <div className="editor-main">
              <section className="form-section">
                <label className="section-label">Slide Fundamentals</label>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="title-input" 
                    placeholder="Enter a descriptive title..."
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                  <div className="type-badges">
                    {['concept', 'practice', 'summary'].map(t => (
                      <button 
                        key={t}
                        type="button"
                        className={`type-badge ${formData.type === t ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, type: t})}
                      >
                        {t.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <section className="form-section">
                <label className="section-label">Content Architecture</label>
                <div className="layout-selector">
                  {layoutOptions.map(opt => (
                    <button 
                      key={opt.id}
                      type="button"
                      className={`layout-card ${formData.layout_type === opt.id ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, layout_type: opt.id})}
                    >
                      <div className="layout-icon">{opt.icon}</div>
                      <div className="layout-info">
                        <span className="layout-name">{opt.name}</span>
                        <span className="layout-desc">{opt.description}</span>
                      </div>
                      {formData.layout_type === opt.id && <div className="active-check"><Check size={14} /></div>}
                    </button>
                  ))}
                </div>
              </section>

              <section className="form-section">
                <div className="section-header" style={{ marginBottom: '16px' }}>
                  <label className="section-label">Teaching Material</label>
                  <div className="editor-info-badge">
                    <Type size={12} />
                    <span>RICH TEXT ENABLED</span>
                  </div>
                </div>
                
                <div className="rich-editor-wrapper">
                  <ReactQuill 
                    theme="snow"
                    value={formData.content}
                    onChange={(content) => setFormData({...formData, content})}
                    placeholder="Describe your concepts, add lists, or format text..."
                    modules={{
                      toolbar: [
                        [{ 'header': [2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{'list': 'ordered'}, {'list': 'bullet'}],
                        [{ 'align': [] }],
                        ['blockquote', 'code-block'],
                        ['link', 'clean']
                      ],
                    }}
                  />
                </div>
              </section>

              <section className="form-section">
                <label className="section-label">Code Integration</label>
                <div className="code-options-bar">
                  <div className="option-group">
                    <span>Theme:</span>
                    <button type="button" className={formData.code_theme === 'terminal' ? 'active' : ''} onClick={() => setFormData({...formData, code_theme: 'terminal'})}>Terminal</button>
                    <button type="button" className={formData.code_theme === 'browser' ? 'active' : ''} onClick={() => setFormData({...formData, code_theme: 'browser'})}>Browser</button>
                    <button type="button" className={formData.code_theme === 'editor' ? 'active' : ''} onClick={() => setFormData({...formData, code_theme: 'editor'})}>Editor</button>
                  </div>
                  <div className="option-group">
                    <span>Position:</span>
                    <button type="button" className={formData.code_position === 'right' ? 'active' : ''} onClick={() => setFormData({...formData, code_position: 'right'})}>Side</button>
                    <button type="button" className={formData.code_position === 'bottom' ? 'active' : ''} onClick={() => setFormData({...formData, code_position: 'bottom'})}>Bottom</button>
                  </div>
                </div>
                <textarea 
                  className="code-textarea"
                  placeholder="Paste your interactive code here..."
                  value={formData.code_snippet}
                  onChange={(e) => setFormData({...formData, code_snippet: e.target.value})}
                />
              </section>
            </div>

            {/* Right Column: Visual Controls */}
            <div className="editor-sidebar">
              <section className="sidebar-section">
                <label className="section-label">Visual Media</label>
                <div className="media-uploads">
                  <div className="upload-box">
                    <label>Primary Image</label>
                    <div className="upload-preview" style={{ backgroundImage: `url(${imagePreview})` }}>
                      {!imagePreview && <ImageIcon size={24} />}
                      <input type="file" onChange={(e) => handleFileChange(e, false)} accept="image/*" />
                    </div>
                  </div>
                  <div className="upload-box">
                    <label>Secondary Image (Optional)</label>
                    <div className="upload-preview" style={{ backgroundImage: `url(${secondaryImagePreview})` }}>
                      {!secondaryImagePreview && <Plus size={24} />}
                      <input type="file" onChange={(e) => handleFileChange(e, true)} accept="image/*" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="sidebar-section">
                <label className="section-label">Media Positioning</label>
                <div className="pos-grid">
                  {['top', 'bottom', 'left', 'right'].map(pos => (
                    <button 
                      key={pos}
                      type="button"
                      className={`pos-btn ${formData.image_position === pos ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, image_position: pos as any})}
                    >
                      {pos.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="width-control">
                   <div className="width-header">
                     <span>Width: {formData.image_width}%</span>
                   </div>
                   <input 
                     type="range" min="10" max="100" step="5"
                     value={formData.image_width}
                     onChange={(e) => setFormData({...formData, image_width: e.target.value})}
                   />
                </div>
              </section>
            </div>
          </div>
        ) : (
          <div className="preview-container animate-slideIn">
            <SlideViewer slides={[{
              ...formData,
              id: 999,
              image: imagePreview || '',
              secondary_image: secondaryImagePreview || '',
              image_position: formData.image_position as any,
              code_position: formData.code_position as any,
              code_theme: formData.code_theme as any
            }]} />
          </div>
        )}
      </main>

      <style jsx>{`
        .studio-page {
          background: #f1f5f9;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 0;
        }

        .studio-top-nav {
          height: 64px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 24px;
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
        }

        .studio-tabs {
          display: flex;
          background: #f1f5f9;
          padding: 4px;
          border-radius: 10px;
        }

        .studio-tabs button {
          padding: 6px 16px;
          border-radius: 7px;
          border: none;
          background: transparent;
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .studio-tabs button.active {
          background: white;
          color: var(--indigo);
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .studio-content {
          flex: 1;
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
          width: 100%;
        }

        .editor-grid {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 32px;
        }

        .form-section {
          background: white;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e2e8f0;
        }

        .section-label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }

        .title-input {
          width: 100%;
          border: none;
          font-size: 24px;
          font-weight: 700;
          color: #0f172a;
          outline: none;
          margin-bottom: 16px;
        }

        .type-badges {
          display: flex;
          gap: 8px;
        }

        .type-badge {
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 700;
          background: #f1f5f9;
          color: #64748b;
          border: 1px solid transparent;
          cursor: pointer;
        }

        .type-badge.active {
          background: rgba(99, 102, 241, 0.1);
          color: var(--indigo);
          border-color: rgba(99, 102, 241, 0.2);
        }

        .layout-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .layout-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          border-radius: 16px;
          border: 2px solid #f1f5f9;
          background: white;
          cursor: pointer;
          text-align: left;
          position: relative;
          transition: all 0.2s;
        }

        .layout-card.active {
          border-color: var(--indigo);
          background: rgba(99, 102, 241, 0.02);
        }

        .layout-icon {
          width: 44px;
          height: 44px;
          background: #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
        }

        .layout-card.active .layout-icon {
          background: var(--indigo);
          color: white;
        }

        .layout-name {
          display: block;
          font-weight: 700;
          font-size: 14px;
          color: #1e293b;
        }

        .layout-desc {
          display: block;
          font-size: 11px;
          color: #94a3b8;
        }

        .active-check {
          position: absolute;
          top: 12px;
          right: 12px;
          color: var(--indigo);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .editor-toolbar {
          display: flex;
          gap: 4px;
        }

        .editor-toolbar button {
          padding: 4px 8px;
          border-radius: 4px;
          background: #f1f5f9;
          border: none;
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
        }

        .quill-loader {
          height: 300px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 12px;
          color: #94a3b8;
          font-weight: 600;
          font-size: 14px;
          border: 1px dashed #e2e8f0;
        }

        .editor-info-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: #f1f5f9;
          color: #64748b;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .rich-editor-wrapper :global(.quill) {
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .rich-editor-wrapper :global(.ql-toolbar) {
          border: none !important;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0 !important;
          padding: 12px;
        }

        .rich-editor-wrapper :global(.ql-container) {
          border: none !important;
          min-height: 300px;
          font-size: 16px;
          font-family: inherit;
        }

        .rich-editor-wrapper :global(.ql-editor) {
          min-height: 300px;
          padding: 24px;
          line-height: 1.8;
          text-align: left;
        }

        .rich-editor-wrapper :global(.ql-editor.ql-blank::before) {
          left: 24px;
          color: #94a3b8;
          font-style: normal;
        }

        .content-textarea, .code-textarea {
          width: 100%;
          min-height: 200px;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          font-size: 15px;
          line-height: 1.6;
          outline: none;
          resize: vertical;
          font-family: inherit;
        }

        .code-textarea {
          background: #0f172a;
          color: #e2e8f0;
          font-family: monospace;
          min-height: 300px;
        }

        .code-options-bar {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .option-group {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
        }

        .option-group button {
          padding: 4px 10px;
          border-radius: 6px;
          background: #f1f5f9;
          border: none;
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
        }

        .option-group button.active {
          background: var(--indigo);
          color: white;
        }

        .upload-box {
          margin-bottom: 20px;
        }

        .upload-box label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 8px;
        }

        .upload-preview {
          width: 100%;
          height: 120px;
          background-size: cover;
          background-position: center;
          background-color: white;
          border-radius: 12px;
          border: 2px dashed #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          position: relative;
          overflow: hidden;
        }

        .upload-preview input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .pos-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 16px;
        }

        .pos-btn {
          padding: 8px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          background: white;
          font-size: 10px;
          font-weight: 700;
          color: #64748b;
          cursor: pointer;
        }

        .pos-btn.active {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }

        .width-control {
          background: white;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .width-header {
          font-size: 11px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 8px;
        }

        .preview-container {
          max-width: 1100px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
