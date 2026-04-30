"use client";

import { useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import DropdownSelect from "@/components/ui/DropdownSelect";

export default function NewSlidePage({ params }: { params: Promise<{ lessonId: string }> }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.lessonId;

  const [formData, setFormData] = useState({
    lesson_id: lessonId,
    title: "",
    content: "",
    type: "concept",
    code_snippet: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create slide");

      setStatus("success");
      alert("Slide created successfully!");
      window.location.href = `/admin/slides/${lessonId}`;
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="page" style={{ maxWidth: '800px' }}>
      <Link href={`/admin/slides/${lessonId}`} className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Slides
      </Link>

      <header className="page-header">
        <h1 className="page-title">Create New Slide</h1>
        <p className="page-subtitle">Add a new slide to the lesson.</p>
      </header>

      <form className="glass-card" style={{ padding: '32px' }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Slide Title</label>
            <input 
              type="text" 
              required
              className="url-input" 
              style={{ width: '100%', fontSize: '16px', padding: '12px', background: '#ffffff' }}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Slide Type</label>
              <DropdownSelect 
                options={[
                  { value: "concept", label: "Concept (Text/HTML)" },
                  { value: "practice", label: "Practice (Code/Interactive)" },
                  { value: "quiz", label: "Quiz (Multiple Choice)" }
                ]}
                value={formData.type}
                onChange={(value) => setFormData({...formData, type: value})}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Content (HTML/Markdown)</label>
            <textarea 
              required
              className="url-input" 
              style={{ width: '100%', minHeight: '200px', resize: 'vertical', fontSize: '14px', padding: '12px', fontFamily: 'monospace', background: '#ffffff' }}
              value={formData.content}
              onChange={(e) => setFormData({...formData, content: e.target.value})}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 600 }}>Code Snippet (Optional)</label>
            <textarea 
              className="url-input" 
              placeholder="e.g., const x = 10;"
              style={{ width: '100%', minHeight: '150px', resize: 'vertical', fontSize: '14px', padding: '12px', fontFamily: 'monospace', background: '#ffffff' }}
              value={formData.code_snippet}
              onChange={(e) => setFormData({...formData, code_snippet: e.target.value})}
            />
          </div>

        </div>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Link href={`/admin/slides/${lessonId}`} className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={status === "loading"}>
            <Save size={16} /> 
            {status === "loading" ? "Saving..." : "Save Slide"}
          </button>
        </div>
        
        {status === "error" && (
          <div style={{ marginTop: '20px', padding: '16px', background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-sm)', fontSize: '14px', border: '1px solid #f87171' }}>
            <strong>Error:</strong> Failed to save the slide. Please try again.
          </div>
        )}
      </form>
    </div>
  );
}
