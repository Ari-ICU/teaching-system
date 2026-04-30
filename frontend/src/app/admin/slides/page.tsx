import Link from "next/link";
import { ArrowLeft, Layers } from "lucide-react";
import { Lesson } from "@/lib/api";

async function getLessons() {
  try {
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
    const res = await fetch(`${apiUrl}/lessons`, { cache: 'no-store' });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    return data.data as Lesson[];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function AdminSlidesPage() {
  const lessons = await getLessons();

  return (
    <div className="page">
      <Link href="/admin" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Admin
      </Link>

      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Manage Slides</h1>
          <p className="page-subtitle">Select a lesson to view and edit its slides.</p>
        </div>
      </header>

      <div className="glass-card" style={{ marginTop: '32px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
              <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Lesson ID</th>
              <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Lesson Title</th>
              <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Module</th>
              <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {lessons.map((lesson) => (
              <tr key={lesson.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>#{lesson.id}</td>
                <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{lesson.title}</td>
                <td style={{ padding: '16px', fontSize: '14px' }}>{lesson.module?.title || `Module ${lesson.module_id}`}</td>
                <td style={{ padding: '16px' }}>
                  <Link href={`/admin/slides/${lesson.id}`} className="btn btn-ghost" style={{ padding: '6px 12px' }}>
                    <Layers size={14} /> View Slides
                  </Link>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No lessons found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
