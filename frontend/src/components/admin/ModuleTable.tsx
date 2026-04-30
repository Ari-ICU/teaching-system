"use client";

import { useState } from "react";
import Link from "next/link";
import { Edit, ChevronUp, ChevronDown } from "lucide-react";
import { Module } from "@/lib/api";
import DeleteModuleButton from "./DeleteModuleButton";
import { useRouter } from "next/navigation";

interface Props {
  initialModules: Module[];
}

export default function ModuleTable({ initialModules }: Props) {
  const [modules, setModules] = useState(initialModules);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (isUpdating) return;
    
    const newModules = [...modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newModules.length) return;
    
    // Swap
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    
    setModules(newModules);
    setIsUpdating(true);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/modules/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordered_ids: newModules.map(m => m.id)
        }),
      });
      
      if (!res.ok) throw new Error("Failed to reorder modules");
      
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to update order");
      setModules(initialModules); // Revert
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
            <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Lessons</th>
            <th style={{ padding: '16px', fontWeight: 600, fontSize: '14px', color: 'var(--text-secondary)' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {modules.map((module, index) => (
            <tr key={module.id} style={{ borderBottom: '1px solid var(--border)', opacity: isUpdating ? 0.7 : 1 }}>
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
                    disabled={index === modules.length - 1 || isUpdating}
                    style={{ background: 'none', border: 'none', cursor: index === modules.length - 1 ? 'default' : 'pointer', color: index === modules.length - 1 ? '#ccc' : 'var(--text-secondary)' }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              </td>
              <td style={{ padding: '16px', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: module.color }}></span>
                  {module.title}
              </td>
              <td style={{ padding: '16px', fontSize: '14px' }}>{module.lessons?.length || 0}</td>
              <td style={{ padding: '16px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link href={`/admin/modules/${module.id}/edit`} className="btn btn-ghost" style={{ padding: '6px', minWidth: 'auto' }}>
                    <Edit size={14} />
                  </Link>
                  <DeleteModuleButton id={module.id} />
                </div>
              </td>
            </tr>
          ))}
          {modules.length === 0 && (
            <tr>
              <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No modules found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
