"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface DropdownSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  variant?: "light" | "dark";
}

interface DropdownPos {
  top: number;
  left: number;
  width: number;
}

export default function DropdownSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  variant = "light",
}: DropdownSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState<DropdownPos>({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  // Ensure portal target is available (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Recalculate dropdown position whenever it opens or the window scrolls/resizes
  const updatePos = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + window.scrollY + 4,
      left: rect.left + window.scrollX,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (isOpen) {
      updatePos();
      window.addEventListener("scroll", updatePos, true);
      window.addEventListener("resize", updatePos);
    }
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [isOpen, updatePos]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const onMouseDown = (e: MouseEvent) => {
      if (
        !triggerRef.current?.contains(e.target as Node) &&
        !listRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [isOpen]);

  const dropdown = (
    <div
      ref={listRef}
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        width: pos.width,
        zIndex: 99999,
      }}
      className={`
        backdrop-blur-xl border rounded-2xl shadow-2xl overflow-hidden p-1.5 animate-in fade-in zoom-in-95 duration-200
        ${variant === 'dark' ? 'bg-slate-900/95 border-slate-800' : 'bg-white/95 border-slate-200'}
      `}
    >
      <div className="max-h-[260px] overflow-y-auto">
        {options.length > 0 ? (
          options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`
                w-full px-4 py-3 flex justify-between items-center rounded-xl transition-all duration-150
                ${
                  option.value === value
                    ? variant === 'dark' ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-600"
                    : variant === 'dark' ? "bg-transparent text-slate-400 hover:bg-slate-800 hover:text-white" : "bg-transparent text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }
              `}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span
                className={`text-sm ${
                  option.value === value ? "font-black" : "font-semibold"
                }`}
              >
                {option.label}
              </span>
              {option.value === value && (
                <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${variant === 'dark' ? 'bg-white text-indigo-600' : 'bg-indigo-600 text-white'}`}>
                  <Check size={12} strokeWidth={4} />
                </div>
              )}
            </button>
          ))
        ) : (
          <div className="px-4 py-8 text-center space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No options found</p>
            <p className="text-[10px] text-slate-400">Please refine your selection</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={`relative w-full ${className ?? ""}`}>
      <button
        ref={triggerRef}
        type="button"
        className={`
          w-full px-4 py-3.5 rounded-xl flex justify-between items-center transition-all duration-200 border
          ${
            isOpen
              ? variant === 'dark' ? "bg-slate-800 border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg" : "bg-white border-indigo-500 ring-4 ring-indigo-500/5 shadow-sm"
              : variant === 'dark' ? "bg-slate-800 border-slate-700 hover:border-slate-600 shadow-sm" : "bg-white border-slate-200 hover:border-slate-300 shadow-sm"
          }
        `}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span
          className={`text-sm font-medium ${
            selectedOption ? (variant === 'dark' ? 'text-white' : 'text-slate-900') : 'text-slate-400'
          }`}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          size={18}
          className={`text-slate-400 transition-transform duration-300 shrink-0 ${
            isOpen ? "rotate-180 text-indigo-500" : ""
          }`}
        />
      </button>

      {/* Render the list via a portal so it escapes any overflow:hidden parent */}
      {isOpen && mounted && createPortal(dropdown, document.body)}
    </div>
  );
}
