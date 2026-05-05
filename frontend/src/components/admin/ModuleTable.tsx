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
    <div className="mt-8 bg-white/60 backdrop-blur-xl border border-slate-200 rounded-[24px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider w-20">Order</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Lessons</th>
              <th className="px-6 py-4 text-[13px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {modules.map((module, index) => (
              <tr key={module.id} className={`transition-opacity duration-200 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
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
                      disabled={index === modules.length - 1 || isUpdating}
                      className={`p-1 rounded-md transition-colors ${index === modules.length - 1 ? 'text-slate-300 cursor-default' : 'text-slate-500 hover:bg-slate-100 hover:text-indigo-600 cursor-pointer'} bg-transparent border-none`}
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: module.color }}></span>
                    <span className="text-sm text-slate-900 font-bold">{module.title}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 font-medium">{module.lessons?.length || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/admin/modules/${module.id}/edit`} 
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                    >
                      <Edit size={16} />
                    </Link>
                    <DeleteModuleButton id={module.id} />
                  </div>
                </td>
              </tr>
            ))}
            {modules.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-slate-400 italic font-medium">No modules found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
