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
    <div className="glass-card" style={{ marginTop: '32px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
            <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)', width: '80px' }}>Order</th>
            <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Title</th>
            <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Type</th>
            <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {slides.map((slide, index) => (
            <tr key={slide.id} style={{ borderBottom: '1px solid var(--border)', opacity: isUpdating ? 0.7 : 1 }}>
              <td style={{ padding: '16px', fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button 
                    onClick={() => handleMove(index, 'up')} 
                    disabled={index === 0 || isUpdating}
                    style={{ background: 'none', border: 'none', cursor: index === 0 ? 'default' : 'pointer', color: index === 0 ? '#ccc' : 'var(--text-secondary)' }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button 
                    onClick={() => handleMove(index, 'down')} 
                    disabled={index === slides.length - 1 || isUpdating}
                    style={{ background: 'none', border: 'none', cursor: index === slides.length - 1 ? 'default' : 'pointer', color: index === slides.length - 1 ? '#ccc' : 'var(--text-secondary)' }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </td>
              <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500 }}>{slide.title}</td>
              <td style={{ padding: '16px', fontSize: '14px' }}>
                  <span className="badge badge-indigo">
                      {slide.type}
                  </span>
              </td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/admin/slides/${lessonId}/edit/${slide.id}`} className="btn btn-ghost" style={{ padding: '6px', minWidth: 'auto' }}>
                    <Edit size={14} />
                  </Link>
                  <DeleteSlideButton id={slide.id} />
                </div>
              </td>
            </tr>
          ))}
          {slides.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No slides found for this lesson.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
