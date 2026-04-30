"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, Code, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";

export default function NewCodeExamplePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.id;
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    lesson_id: lessonId,
    title: "",
    code: "",
    language: "javascript",
    runnable: true,
    order: 0
  });

  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/code-examples`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create code example");

      alert("Code demo created successfully!");
      router.push(`/admin/lessons/${lessonId}/slides`); // Go back to content manager
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <div className="page" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <Link href={`/admin/lessons/${lessonId}/slides`} className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Content Manager
      </Link>

      <header className="page-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
           <Code size={24} color="var(--emerald)" />
           <span className="badge badge-emerald">NEW DEMO</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '32px' }}>Create Code Demo</h1>
        <p className="page-subtitle">Add a runnable code snippet or technical example to this lesson.</p>
      </header>

      <form className="glass-card" style={{ padding: '40px', background: 'white' }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Demo Title</label>
            <input 
              type="text" 
              required
              className="url-input" 
              placeholder="e.g. Basic Array Operations"
              style={{ width: '100%', padding: '14px' }}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Programming Language</label>
              <DropdownSelect 
                options={[
                  { value: "javascript", label: "JavaScript" },
                  { value: "php", label: "PHP" },
                  { value: "html", label: "HTML" },
                  { value: "css", label: "CSS" },
                  { value: "sql", label: "SQL" }
                ]}
                value={formData.language}
                onChange={(value) => setFormData({...formData, language: value})}
              />
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '12px', marginTop: '26px' }}>
                <input 
                   type="checkbox" 
                   id="runnable"
                   checked={formData.runnable}
                   onChange={(e) => setFormData({...formData, runnable: e.target.checked})}
                   style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
                <label htmlFor="runnable" style={{ fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>Runnable code snippet</label>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Source Code</label>
            <textarea 
              required
              className="url-input" 
              placeholder="// Write or paste your code here..."
              style={{ width: '100%', minHeight: '300px', resize: 'vertical', padding: '20px', lineHeight: '1.6', fontFamily: 'monospace', background: '#1e293b', color: '#f8fafc' }}
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
            />
          </div>

        </div>

        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Link href={`/admin/lessons/${lessonId}/slides`} className="btn btn-ghost" style={{ padding: '14px 24px' }}>Cancel</Link>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px' }} disabled={status === "saving"}>
            {status === "saving" ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{status === "saving" ? "Creating..." : "Save Demo"}</span>
          </button>
        </div>
        
        {status === "error" && (
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--rose-light)', color: 'var(--rose)', borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} />
            <span><strong>Error:</strong> Failed to save the code demo. Please try again.</span>
          </div>
        )}
      </form>
    </div>
  );
}
