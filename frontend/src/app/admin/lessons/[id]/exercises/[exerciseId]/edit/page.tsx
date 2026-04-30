"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";

export default function EditExercisePage({ params }: { params: Promise<{ id: string, exerciseId: string }> }) {
  const { id: lessonId, exerciseId } = use(params);
  const router = useRouter();
  const { token, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    question: "",
    starter_code: "",
    solution: "",
    hint: "",
    difficulty: "beginner",
    language: "javascript",
    order: 0
  });

  const [status, setStatus] = useState<"loading" | "idle" | "saving" | "error" | "not_found">("loading");

  useEffect(() => {
    if (!authLoading && token) {
      fetchExercise();
    }
  }, [exerciseId, token, authLoading]);

  const fetchExercise = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/exercise/${exerciseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 404) setStatus("not_found");
        else throw new Error("Failed to fetch exercise");
        return;
      }

      // Since solutions are hidden for students, we need a special endpoint or just use the admin one if implemented.
      // For now, we assume the teacher can see the solution via the API if authorized.
      const data = await res.json();
      
      // Note: We might need to fetch the solution specifically if it's hidden by model.
      // Let's try to fetch solution from the /solution endpoint too if needed.
      const solRes = await fetch(`${apiUrl}/exercise/${exerciseId}/solution`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const solData = await solRes.json();

      setFormData({
        title: data.data.title || "",
        question: data.data.question || "",
        starter_code: data.data.starter_code || "",
        solution: solData.solution || "",
        hint: solData.hint || "",
        difficulty: data.data.difficulty || "beginner",
        language: data.data.language || "javascript",
        order: data.data.order || 0
      });
      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/exercises/${exerciseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update exercise");

      alert("Exercise updated successfully!");
      router.push(`/admin/lessons/${lessonId}/slides`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  if (authLoading) return null;

  return (
    <div className="page" style={{ maxWidth: '850px', margin: '0 auto' }}>
      <Link href={`/admin/lessons/${lessonId}/slides`} className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Content Manager
      </Link>

      <header className="page-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
           <BookOpen size={24} color="var(--indigo)" />
           <span className="badge badge-indigo">EDIT CHALLENGE</span>
        </div>
        <h1 className="page-title" style={{ fontSize: '32px' }}>Edit Exercise</h1>
        <p className="page-subtitle">Update the challenge details, solutions, and hints for this exercise.</p>
      </header>

      <form className="glass-card" style={{ padding: '40px', background: 'white' }} onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          
          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Exercise Title</label>
            <input 
              type="text" 
              required
              className="url-input" 
              placeholder="e.g. Reverse a String"
              style={{ width: '100%', padding: '14px' }}
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid-2">
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Difficulty Level</label>
              <DropdownSelect 
                options={[
                  { value: "beginner", label: "Beginner" },
                  { value: "intermediate", label: "Intermediate" },
                  { value: "advanced", label: "Advanced" }
                ]}
                value={formData.difficulty}
                onChange={(value) => setFormData({...formData, difficulty: value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Programming Language</label>
              <DropdownSelect 
                options={[
                  { value: "javascript", label: "JavaScript" },
                  { value: "php", label: "PHP" },
                  { value: "sql", label: "SQL" }
                ]}
                value={formData.language}
                onChange={(value) => setFormData({...formData, language: value})}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Instructions (Question)</label>
            <textarea 
              required
              className="url-input" 
              placeholder="Describe the problem students need to solve..."
              style={{ width: '100%', minHeight: '120px', resize: 'vertical', padding: '16px', lineHeight: '1.6' }}
              value={formData.question}
              onChange={(e) => setFormData({...formData, question: e.target.value})}
            />
          </div>

          <div className="grid-2" style={{ gap: '24px', alignItems: 'start' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Starter Code</label>
              <textarea 
                className="url-input" 
                placeholder="// Initial code for student..."
                style={{ width: '100%', minHeight: '200px', resize: 'vertical', padding: '16px', fontFamily: 'monospace', background: '#1e293b', color: '#f8fafc' }}
                value={formData.starter_code}
                onChange={(e) => setFormData({...formData, starter_code: e.target.value})}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Reference Solution</label>
              <textarea 
                required
                className="url-input" 
                placeholder="// The correct answer..."
                style={{ width: '100%', minHeight: '200px', resize: 'vertical', padding: '16px', fontFamily: 'monospace', background: '#1e293b', color: '#f8fafc' }}
                value={formData.solution}
                onChange={(e) => setFormData({...formData, solution: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: 700 }}>Hint (Optional)</label>
            <input 
              type="text" 
              className="url-input" 
              placeholder="e.g. Try using the .reverse() method"
              style={{ width: '100%', padding: '14px' }}
              value={formData.hint}
              onChange={(e) => setFormData({...formData, hint: e.target.value})}
            />
          </div>

        </div>

        <div style={{ marginTop: '40px', paddingTop: '32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
          <Link href={`/admin/lessons/${lessonId}/slides`} className="btn btn-ghost" style={{ padding: '14px 24px' }}>Cancel</Link>
          <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px' }} disabled={status === "saving"}>
            {status === "saving" ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            <span>{status === "saving" ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
        
        {status === "error" && (
          <div style={{ marginTop: '24px', padding: '16px', background: 'var(--rose-light)', color: 'var(--rose)', borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(220, 38, 38, 0.2)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertCircle size={20} />
            <span><strong>Error:</strong> Failed to save changes. Please try again.</span>
          </div>
        )}
      </form>
    </div>
  );
}
