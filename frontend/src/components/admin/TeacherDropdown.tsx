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
    <div className="teacher-dropdown-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="url-input"
        style={{ 
          width: '100%', 
          padding: '12px 16px', 
          textAlign: 'left', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'white',
          cursor: 'pointer',
          minHeight: '52px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={14} color="var(--text-muted)" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>
              {selectedTeacher ? selectedTeacher.name : "Unassigned (or Self)"}
            </div>
            {selectedTeacher && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{selectedTeacher.email}</div>
            )}
          </div>
        </div>
        <ChevronDown size={18} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {isOpen && (
        <div className="glass-card animate-fadeInUp" style={{ 
          position: 'absolute', 
          top: 'calc(100% + 8px)', 
          left: 0, 
          right: 0, 
          zIndex: 1000, 
          padding: '8px', 
          background: 'white', 
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border)',
          maxHeight: '300px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ position: 'relative', padding: '8px' }}>
            <Search style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={14} />
            <input 
              type="text" 
              placeholder="Search instructors..." 
              autoFocus
              className="url-input"
              style={{ width: '100%', paddingLeft: '36px', height: '36px', fontSize: '13px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div style={{ overflowY: 'auto', flex: 1 }} className="custom-scrollbar">
            <div 
              onClick={() => { onSelect(""); setIsOpen(false); }}
              style={{ 
                padding: '10px 12px', 
                borderRadius: '8px', 
                cursor: 'pointer', 
                background: selectedId === "" ? 'var(--indigo-light)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
              className="dropdown-item"
            >
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Unassigned (or Self)</div>
              {selectedId === "" && <Check size={14} color="var(--indigo)" />}
            </div>

            {filteredTeachers.map(teacher => (
              <div 
                key={teacher.id}
                onClick={() => { onSelect(teacher.id.toString()); setIsOpen(false); }}
                style={{ 
                  padding: '10px 12px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  background: selectedId === teacher.id.toString() ? 'var(--indigo-light)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '2px'
                }}
                className="dropdown-item"
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600 }}>{teacher.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{teacher.email}</div>
                </div>
                {selectedId === teacher.id.toString() && <Check size={14} color="var(--indigo)" />}
              </div>
            ))}

            {filteredTeachers.length === 0 && searchTerm && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px' }}>
                No instructors found matching "{searchTerm}"
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .dropdown-item:hover {
          background: var(--bg-secondary) !important;
        }
      `}</style>
    </div>
  );
}
