"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Search, Check } from "lucide-react";

interface Teacher {
  id: number;
  name: string;
  email: string;
}

interface TeacherDropdownProps {
  teachers: Teacher[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function TeacherDropdown({ teachers, selectedId, onSelect }: TeacherDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTeacher = teachers.find(t => t.id.toString() === selectedId);
  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    t.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-16 px-5 text-left flex items-center justify-between bg-slate-50 border border-transparent rounded-2xl cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm border border-slate-100 group-hover:scale-105 transition-transform">
            <User size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black text-slate-900 tracking-tight truncate">
              {selectedTeacher ? selectedTeacher.name : "Select Instructor"}
            </div>
            {selectedTeacher ? (
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate">{selectedTeacher.email}</div>
            ) : (
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Administrator / Self</div>
            )}
          </div>
        </div>
        <ChevronDown 
          size={20} 
          className={`text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute top-[calc(100%+12px)] left-0 right-0 z-[1000] p-3 bg-white border border-slate-200 rounded-[28px] shadow-2xl flex flex-col max-h-[350px] overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
          <div className="relative p-2 mb-2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search instructors by name..." 
              autoFocus
              className="w-full pl-11 pr-5 h-12 bg-slate-50 border-none rounded-xl text-sm font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="overflow-y-auto flex-1 p-1 space-y-1 custom-scrollbar">
            <div 
              onClick={() => { onSelect(""); setIsOpen(false); }}
              className={`
                px-4 py-3.5 rounded-xl cursor-pointer flex items-center justify-between transition-all
                ${selectedId === "" ? 'bg-indigo-50/50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}
              `}
            >
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-slate-300" />
                 <div className="text-[13px] font-black uppercase tracking-wider">Default Administrator</div>
              </div>
              {selectedId === "" && <Check size={16} className="text-indigo-600" strokeWidth={3} />}
            </div>

            <div className="h-px bg-slate-100 mx-4 my-2" />

            {filteredTeachers.map(teacher => (
              <div 
                key={teacher.id}
                onClick={() => { onSelect(teacher.id.toString()); setIsOpen(false); }}
                className={`
                  px-4 py-3 rounded-xl cursor-pointer flex items-center justify-between transition-all group/item
                  ${selectedId === teacher.id.toString() ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50 text-slate-700'}
                `}
              >
                <div className="min-w-0">
                  <div className="text-sm font-bold truncate group-item-hover:text-indigo-600 transition-colors">{teacher.name}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{teacher.email}</div>
                </div>
                {selectedId === teacher.id.toString() && <Check size={16} className="text-indigo-600" strokeWidth={3} />}
              </div>
            ))}

            {filteredTeachers.length === 0 && searchTerm && (
              <div className="py-10 text-center space-y-2 animate-in fade-in duration-500">
                <Search size={32} className="mx-auto text-slate-100" />
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">No matching instructors</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
