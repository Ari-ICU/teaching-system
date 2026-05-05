"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, ChevronUp, ChevronDown } from "lucide-react";
import { Slide } from "@/lib/api";
import DeleteSlideButton from "./DeleteSlideButton";
import { useRouter } from "next/navigation";

interface Props {
  initialSlides: Slide[];
  lessonId: number | string;
}

export default function SlideTable({ initialSlides, lessonId }: Props) {
  const [slides, setSlides] = useState(initialSlides);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (isUpdating) return;
    
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newSlides.length) return;
    
    // Swap
    [newSlides[index], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[index]];
    
    setSlides(newSlides);
    setIsUpdating(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/slides/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordered_ids: newSlides.map(s => s.id)
        }),
      });
      
      if (!res.ok) throw new Error("Failed to reorder slides");
      
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update order");
      setSlides(initialSlides); // Revert
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
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slides.map((slide, index) => (
              <tr key={slide.id} className={`transition-opacity duration-200 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
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
                      disabled={index === slides.length - 1 || isUpdating}
                      className={`p-1 rounded-md transition-colors ${index === slides.length - 1 ? 'text-slate-300 cursor-default' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer'} bg-transparent border-none`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-900 font-bold">{slide.title}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-indigo-100 text-indigo-700">
                    {slide.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/slides/${lessonId}/edit/${slide.id}`} 
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit size={16} />
                    </Link>
                    <DeleteSlideButton id={slide.id} />
                  </div>
                </td>
              </tr>
            ))}
            {slides.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 italic font-medium">No slides found for this lesson.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
