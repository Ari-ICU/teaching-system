"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, FileJson, AlertCircle, CheckCircle2, Loader2, Copy } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Toast from "@/components/ui/Toast";

export default function ImportCurriculumPage() {
  const [jsonData, setJsonData] = useState("");
  const [status, setStatus] = useState<"idle" | "importing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const { token, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !token) {
      router.push("/login");
    } else if (token) {
      fetchCourses();
    }
  }, [token, authLoading]);

  const fetchCourses = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setCourses(data.data || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const sampleJson = {
    title: "Example Module Name",
    description: "Detailed description of the module content.",
    icon: "book",
    color: "#6366f1",
    course_ids: courses.length > 0 ? [courses[0].id] : [1],
    lessons: [
      {
        title: "Lesson 1: Getting Started",
        description: "Introduction to the topic.",
        slides: [
          {
            title: "Welcome Slide",
            type: "concept",
            content: "<h2>Welcome!</h2><p>This is imported content.</p>"
          },
          {
            title: "Interactive Practice",
            type: "practice",
            content: "<h3>Try this code</h3>",
            code_snippet: "console.log('Hello World');",
            code_theme: "terminal"
          }
        ]
      }
    ]
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jsonData.trim()) return;

    setStatus("importing");
    setErrorMessage("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/modules/import`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        },
        body: JSON.stringify({ json_data: jsonData })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to import curriculum.");
      }

      setStatus("success");
      setShowToast(true);
      setTimeout(() => {
        router.push("/admin/modules");
      }, 2000);
    } catch (error: any) {
      console.error(error);
      setStatus("error");
      setErrorMessage(error.message);
    }
  };

  const copySample = () => {
    setJsonData(JSON.stringify(sampleJson, null, 2));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        // Validate JSON
        JSON.parse(text);
        setJsonData(text);
      } catch (err) {
        setStatus("error");
        setErrorMessage("Invalid JSON file format.");
      }
    };
    reader.readAsText(file);
  };

  if (authLoading) return null;

  return (
    <div className="page" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <Toast show={showToast} message="Curriculum imported successfully!" onClose={() => setShowToast(false)} />
      
      <Link href="/admin" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Manager
      </Link>

      <header className="page-header" style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
           <FileJson size={24} color="var(--indigo)" />
           <span className="badge badge-indigo">ADVANCED TOOLS</span>
        </div>
        <h1 className="page-title">Import Curriculum</h1>
        <p className="page-subtitle">Bulk upload modules, lessons, and slides using a JSON structure.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Import Form */}
        <div className="glass-card" style={{ padding: '32px', background: 'white' }}>
          <form onSubmit={handleImport}>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                PASTE JSON DATA
              </label>
              <textarea
                required
                className="url-input"
                placeholder='{ "title": "New Module", ... }'
                style={{ 
                  width: '100%', 
                  minHeight: '400px', 
                  fontFamily: 'monospace', 
                  fontSize: '13px', 
                  padding: '20px',
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  lineHeight: '1.6'
                }}
                value={jsonData}
                onChange={(e) => setJsonData(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleFileUpload} 
                  style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%', cursor: 'pointer' }} 
                />
                <button type="button" className="btn btn-ghost" style={{ gap: '8px' }}>
                  <Upload size={16} /> Upload .json File
                </button>
              </div>
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={status === "importing" || !jsonData.trim()}
                style={{ padding: '12px 32px' }}
              >
                {status === "importing" ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                <span>{status === "importing" ? "Importing..." : "Start Import"}</span>
              </button>
            </div>
          </form>

          {status === "error" && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--rose-light)', color: 'var(--rose)', borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(220, 38, 38, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={20} />
              <span>{errorMessage}</span>
            </div>
          )}

          {status === "success" && (
            <div style={{ marginTop: '24px', padding: '16px', background: 'var(--emerald-light)', color: 'var(--emerald)', borderRadius: '12px', fontSize: '14px', border: '1px solid rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <CheckCircle2 size={20} />
              <span>Import successful! Redirecting...</span>
            </div>
          )}
        </div>

        {/* Instructions / Sample */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card" style={{ padding: '24px', background: 'var(--bg-secondary)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '16px', color: 'var(--text-primary)' }}>How it works</h3>
            <ul style={{ paddingLeft: '20px', fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li>The system accepts a nested JSON structure.</li>
              <li>You can define a **Module** with multiple **Lessons**.</li>
              <li>Each lesson can contain multiple **Slides**.</li>
              <li>Required fields: `title` for modules, `title` for lessons, and `title` for slides.</li>
              <li>`course_ids` should be an array of valid Course IDs.</li>
            </ul>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>Sample Structure</h3>
              <button onClick={copySample} className="btn btn-ghost" style={{ padding: '4px 12px', fontSize: '12px', height: 'auto' }}>
                <Copy size={12} /> Use Sample
              </button>
            </div>
            <pre style={{ 
              fontSize: '11px', 
              background: '#1e293b', 
              color: '#e2e8f0', 
              padding: '16px', 
              borderRadius: '12px', 
              overflowX: 'auto',
              maxHeight: '400px'
            }}>
              {JSON.stringify(sampleJson, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
