"use client";

import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  duration?: number;
}

export default function Toast({ show, message, type = 'success', onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const themes = {
    success: {
      colorClass: 'text-emerald-500',
      bgClass: 'bg-emerald-50',
      borderClass: 'border-emerald-500/20',
      shadowClass: 'shadow-[0_10px_25px_rgba(16,185,129,0.15)]',
      progressClass: 'bg-emerald-500',
      icon: <CheckCircle size={18} />
    },
    error: {
      colorClass: 'text-rose-500',
      bgClass: 'bg-rose-50',
      borderClass: 'border-rose-500/20',
      shadowClass: 'shadow-[0_10px_25px_rgba(244,63,94,0.15)]',
      progressClass: 'bg-rose-500',
      icon: <AlertCircle size={18} />
    },
    info: {
      colorClass: 'text-indigo-500',
      bgClass: 'bg-indigo-50',
      borderClass: 'border-indigo-500/20',
      shadowClass: 'shadow-[0_10px_25px_rgba(99,102,241,0.15)]',
      progressClass: 'bg-indigo-500',
      icon: <Info size={18} />
    }
  };

  const theme = themes[type];

  return (
    <div 
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[10000] animate-in fade-in slide-in-from-top-4 duration-300 ease-out"
    >
      <div className={`
        bg-white border p-3 px-6 rounded-full flex items-center gap-3 min-w-[320px] relative overflow-hidden shadow-xl
        ${theme.borderClass} ${theme.shadowClass}
      `}>
        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${theme.bgClass} ${theme.colorClass}`}>
          {theme.icon}
        </div>
        
        <span className="text-sm font-bold text-slate-900 flex-1">{message}</span>
        
        <button 
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-5 right-5 h-[2px] bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full ${theme.progressClass} origin-left`}
            style={{ 
              animation: `toastProgress ${duration}ms linear forwards` 
            }}
          />
        </div>
      </div>
    </div>
  );
}
