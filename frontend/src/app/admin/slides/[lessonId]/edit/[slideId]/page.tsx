"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import DropdownSelect from "@/components/ui/DropdownSelect";

export default function EditSlidePage({ params }: { params: Promise<{ lessonId: string, slideId: string }> }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.lessonId;
  const slideId = resolvedParams.slideId;
  const router = useRouter();

  const [formData, setFormData] = useState({
    lesson_id: lessonId,
    title: "",
    content: "",
    type: "concept",
    code_snippet: "",
  });

  const [status, setStatus] = useState<"loading_initial" | "idle" | "saving" | "error" | "not_found">("loading_initial");

  useEffect(() => {
    const fetchSlide = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
        const res = await fetch(`${apiUrl}/slides/${slideId}`);
        
        if (!res.ok) {
          if (res.status === 404) {
            setStatus("not_found");
            return;
          }
          throw new Error("Failed to fetch slide");
        }
        
        const data = await res.json();
        setFormData({
          lesson_id: data.data.lesson_id?.toString() || lessonId,
          title: data.data.title || "",
          content: data.data.content || "",
          type: data.data.type || "concept",
          code_snippet: data.data.code_snippet || "",
        });
        
        setStatus("idle");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };
    
    fetchSlide();
  }, [slideId, lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/slides/${slideId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update slide");

      alert("Slide updated successfully!");
      router.push(`/admin/slides/${lessonId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (status === "loading_initial") {
    return <div className="page" style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
  }

  if (status === "not_found") {
    return (
      <div className="page" style={{ textAlign: 'center', padding: '100px' }}>
        <h2>Slide Not Found</h2>
        <Link href={`/admin/slides/${lessonId}`} className="btn btn-primary" style={{ marginTop: '16px' }}>Go Back</Link>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: '800px' }}>
      <Link href={`/admin/slides/${lessonId}`} className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Slides
      </Link>

      <header className="page-header">
        <h1 className="page-title">Edit Slide</h1>
        <p className="page-subtitle">Update the slide content.</p>
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
              style={{ width: '100%', minHeight: '150px', resize: 'vertical', fontSize: '14px', padding: '12px', fontFamily: 'monospace', background: '#ffffff' }}
              value={formData.code_snippet}
              onChange={(e) => setFormData({...formData, code_snippet: e.target.value})}
            />
          </div>

        </div>

        <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <Link href={`/admin/slides/${lessonId}`} className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn btn-primary" disabled={status === "saving"}>
            <Save size={16} /> 
            {status === "saving" ? "Saving..." : "Save Changes"}
          </button>
        </div>
        
        {status === "error" && (
          <div style={{ marginTop: '20px', padding: '16px', background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-sm)', fontSize: '14px', border: '1px solid #f87171' }}>
            <strong>Error:</strong> Failed to save changes. Please try again.
          </div>
        )}
      </form>
    </div>
  );
}
