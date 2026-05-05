"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, ChevronUp, ChevronDown } from "lucide-react";
import { Lesson } from "@/lib/api";
import DeleteLessonButton from "./DeleteLessonButton";
import { useRouter } from "next/navigation";

interface Props {
  initialLessons: Lesson[];
}

export default function LessonTable({ initialLessons }: Props) {
  const [lessons, setLessons] = useState(initialLessons);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (isUpdating) return;
    
    const newLessons = [...lessons];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newLessons.length) return;
    
    // Swap
    [newLessons[index], newLessons[targetIndex]] = [newLessons[targetIndex], newLessons[index]];
    
    setLessons(newLessons);
    setIsUpdating(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/lessons/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordered_ids: newLessons.map(l => l.id)
        }),
      });
      
      if (!res.ok) throw new Error("Failed to reorder lessons");
      
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update order");
      setLessons(initialLessons); // Revert
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="mt-8 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider w-20">Order</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Module</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Lesson Title</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Difficulty</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {lessons.map((lesson, index) => (
              <tr key={lesson.id} className={`transition-opacity duration-200 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleMove(index, 'up')} 
                      disabled={index === 0 || isUpdating}
                      className={`p-1 rounded-md transition-colors ${index === 0 ? 'text-slate-300 cursor-default' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer'} bg-transparent border-none`}
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button 
                      onClick={() => handleMove(index, 'down')} 
                      disabled={index === lessons.length - 1 || isUpdating}
                      className={`p-1 rounded-md transition-colors ${index === lessons.length - 1 ? 'text-slate-300 cursor-default' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer'} bg-transparent border-none`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{lesson.module?.title || `Module ${lesson.module_id}`}</td>
                <td className="px-6 py-4 text-sm text-slate-900 font-bold">{lesson.title}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide
                    ${lesson.difficulty === 'beginner' ? 'bg-emerald-100 text-emerald-700' : 
                      lesson.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}
                  `}>
                    {lesson.difficulty}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/lessons/${lesson.id}/edit`} 
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit size={16} />
                    </Link>
                    <DeleteLessonButton id={lesson.id} />
                  </div>
                </td>
              </tr>
            ))}
            {lessons.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400 italic font-medium">No lessons found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
