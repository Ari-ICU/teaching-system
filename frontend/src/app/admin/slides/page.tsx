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
    <div className="p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto">
      <Link 
        href="/admin" 
        className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mb-8 font-medium"
      >
        <ArrowLeft size={16} /> Back to Admin
      </Link>

      <header className="mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Manage Slides</h1>
        <p className="text-slate-500 text-lg font-medium">Select a lesson to view and edit its slides.</p>
      </header>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Lesson ID</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Lesson Title</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider">Module</th>
                <th className="px-8 py-5 text-sm font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {lessons.map((lesson) => (
                <tr key={lesson.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5 text-sm text-slate-400 font-mono">#{lesson.id}</td>
                  <td className="px-8 py-5 text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{lesson.title}</td>
                  <td className="px-8 py-5 text-sm text-slate-500 font-medium">{lesson.module?.title || `Module ${lesson.module_id}`}</td>
                  <td className="px-8 py-5 text-right">
                    <Link 
                      href={`/admin/slides/${lesson.id}`} 
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 font-bold rounded-xl hover:bg-indigo-600 hover:text-white transition-all text-sm"
                    >
                      <Layers size={14} /> View Slides
                    </Link>
                  </td>
                </tr>
              ))}
              {lessons.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                    No lessons found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
