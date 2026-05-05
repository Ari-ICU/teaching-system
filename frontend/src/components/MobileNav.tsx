"use client";

import { Menu, X, PlaySquare } from "lucide-react";

interface MobileNavProps {
  onToggle: () => void;
  isOpen: boolean;
}

export default function MobileNav({ onToggle, isOpen }: MobileNavProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white/90 backdrop-blur-md border-b border-slate-200 px-5 flex items-center justify-between z-[1000]">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-[#0f4a26] flex items-center justify-center shadow-sm">
          <PlaySquare size={16} className="text-white" />
        </div>
        <h2 className="text-[15px] font-extrabold text-slate-900 tracking-tight">Studio</h2>
      </div>
      
      <button 
        onClick={onToggle}
        className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
    </div>
  );
}
