 "use client";

import { useState, useEffect, use, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, FileText, AlertCircle, Eye, Edit3, Terminal, Layout, Columns2, Square, Type, ImageIcon, ChevronRight, Check, Plus, Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";
import { marked } from "marked";
import Toast from "@/components/ui/Toast";
import SlideViewer from "@/components/SlideViewer";

export default function EditSlidePage({ params }: { params: Promise<{ id: string, slideId: string }> }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.id;
  const slideId = resolvedParams.slideId;
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
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
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const [secondaryImageFile, setSecondaryImageFile] = useState<File | null>(null);
  const [secondaryImagePreview, setSecondaryImagePreview] = useState<string | null>(null);
  const [currentSecondaryImage, setCurrentSecondaryImage] = useState<string | null>(null);
  const [removePrimary, setRemovePrimary] = useState(false);
  const [removeSecondary, setRemoveSecondary] = useState(false);

  const [status, setStatus] = useState<"loading_initial" | "idle" | "saving" | "error">("loading_initial");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [showToast, setShowToast] = useState(false);

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
        layout_type: s.layout_type || "standard",
        content: s.content || "",
        code_snippet: s.code_snippet || "",
        image_position: s.image_position || "top",
        image_width: s.image_width || "100",
        secondary_image_position: s.secondary_image_position || "top",
        secondary_image_width: s.secondary_image_width || "100",
        code_position: s.code_position || "right",
        code_theme: s.code_theme || "terminal",
      });
      
      const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage';
      if (s.image) setCurrentImage(`${storageUrl}/${s.image}`);
      if (s.secondary_image) setCurrentSecondaryImage(`${storageUrl}/${s.secondary_image}`);
      
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
      data.append('_method', 'PUT');
      data.append('title', formData.title);
      data.append('type', formData.type);
      data.append('layout_type', formData.layout_type);
      data.append('content', formData.content);
      data.append('image_position', formData.image_position);
      data.append('image_width', formData.image_width);
      data.append('secondary_image_position', formData.secondary_image_position || 'top');
      data.append('secondary_image_width', formData.secondary_image_width || '100');
      data.append('code_position', formData.code_position);
      data.append('code_theme', formData.code_theme);
      data.append('code_snippet', formData.code_snippet || '');
      
      if (imageFile) data.append('image', imageFile);
      if (secondaryImageFile) data.append('secondary_image', secondaryImageFile);
      
      if (removePrimary) data.append('remove_image', '1');
      if (removeSecondary) data.append('remove_secondary_image', '1');

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
      }, 1000);
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

  if (authLoading || status === "loading_initial") return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <Loader2 className="animate-spin" size={40} color="var(--indigo)" />
    </div>
  );

  return (
    <div className="page studio-page">
      <Toast show={showToast} message="Slide variations saved!" onClose={() => setShowToast(false)} />
      
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
             Save Changes
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
                    placeholder="E.g. Introduction to React Hooks"
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
                <div className="section-header">
                  <label className="section-label">Teaching Material</label>
                  <div className="editor-toolbar">
                     <button type="button" onClick={() => setFormData({...formData, content: formData.content + '<h2></h2>'})}>H2</button>
                     <button type="button" onClick={() => setFormData({...formData, content: formData.content + '<strong></strong>'})}>B</button>
                     <button type="button" onClick={() => setFormData({...formData, content: formData.content + '<code></code>'})}>CODE</button>
                     <button type="button" onClick={() => setFormData({...formData, content: formData.content + '<ul><li></li></ul>'})}>LIST</button>
                  </div>
                </div>
                <textarea 
                  className="content-textarea"
                  placeholder="Explain your concepts with HTML or plain text..."
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                />
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
                  {/* Primary Image */}
                  <div className="upload-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ margin: 0 }}>Primary Image</label>
                      {(imagePreview || currentImage) && (
                        <button type="button" onClick={() => { setImageFile(null); setImagePreview(null); setCurrentImage(null); setRemovePrimary(true); }} style={{ background: 'none', border: 'none', color: 'var(--rose)', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}>REMOVE</button>
                      )}
                    </div>
                    <div className="upload-preview" style={{ backgroundImage: `url(${imagePreview || currentImage})` }}>
                      {!imagePreview && !currentImage && <ImageIcon size={24} />}
                      <input type="file" onChange={(e) => { handleFileChange(e, false); setRemovePrimary(false); }} accept="image/*" />
                    </div>
                  </div>
                  {/* Secondary Image */}
                  <div className="upload-box">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <label style={{ margin: 0 }}>Secondary Image</label>
                      {(secondaryImagePreview || currentSecondaryImage) && (
                        <button type="button" onClick={() => { setSecondaryImageFile(null); setSecondaryImagePreview(null); setCurrentSecondaryImage(null); setRemoveSecondary(true); }} style={{ background: 'none', border: 'none', color: 'var(--rose)', fontSize: '11px', cursor: 'pointer', fontWeight: 700 }}>REMOVE</button>
                      )}
                    </div>
                    <div className="upload-preview" style={{ backgroundImage: `url(${secondaryImagePreview || currentSecondaryImage})` }}>
                      {!secondaryImagePreview && !currentSecondaryImage && <Plus size={24} />}
                      <input type="file" onChange={(e) => { handleFileChange(e, true); setRemoveSecondary(false); }} accept="image/*" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="sidebar-section">
                <label className="section-label">Media Positioning</label>
                
                {/* Primary Image Positioning */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>PRIMARY IMAGE</div>
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
                </div>

                {/* Secondary Image Positioning */}
                {(secondaryImagePreview || currentSecondaryImage) && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', color: '#1e293b' }}>SECONDARY IMAGE</div>
                    <div className="pos-grid">
                      {['top', 'bottom', 'left', 'right'].map(pos => (
                        <button 
                          key={pos}
                          type="button"
                          className={`pos-btn ${formData.secondary_image_position === pos ? 'active' : ''}`}
                          onClick={() => setFormData({...formData, secondary_image_position: pos as any})}
                        >
                          {pos.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <div className="width-control">
                       <div className="width-header">
                         <span>Width: {formData.secondary_image_width}%</span>
                       </div>
                       <input 
                         type="range" min="10" max="100" step="5"
                         value={formData.secondary_image_width}
                         onChange={(e) => setFormData({...formData, secondary_image_width: e.target.value})}
                       />
                    </div>
                  </div>
                )}
              </section>
              
              <div className="help-card">
                 <Info size={16} />
                 <p>Pro Tip: Use "Split Screen" layout when comparing code and theory side-by-side.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="preview-container animate-slideIn">
            <SlideViewer slides={[{
              ...formData,
              id: 999,
              image: imagePreview || currentImage || '',
              secondary_image: secondaryImagePreview || currentSecondaryImage || '',
              image_position: formData.image_position as any,
              code_position: formData.code_position as any,
              code_theme: formData.code_theme as any
            }]} />
            <div className="preview-note">
               <Eye size={14} />
               <span>You are viewing a live simulation of the student experience.</span>
            </div>
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
          box-shadow: 0 1px 3px rgba(0,0,0,0.02);
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

        .layout-card:hover {
          border-color: #e2e8f0;
          background: #f8fafc;
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

        .help-card {
          margin-top: 24px;
          padding: 16px;
          background: rgba(99, 102, 241, 0.05);
          border-radius: 16px;
          border: 1px dashed var(--indigo);
          color: var(--indigo);
          font-size: 12px;
          display: flex;
          gap: 12px;
        }

        .preview-container {
          max-width: 1100px;
          margin: 0 auto;
        }

        .preview-note {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 16px;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}
