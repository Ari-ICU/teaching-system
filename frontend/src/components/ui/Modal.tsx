"use client";

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = 'warning'
}: ModalProps) {
  if (!isOpen) return null;

  const themes = {
    danger: {
      bg: 'bg-rose-50',
      iconColor: 'text-rose-500',
      btnBg: 'bg-rose-500 hover:bg-rose-600',
    },
    warning: {
      bg: 'bg-amber-50',
      iconColor: 'text-amber-500',
      btnBg: 'bg-amber-500 hover:bg-amber-600',
    },
    info: {
      bg: 'bg-indigo-50',
      iconColor: 'text-indigo-500',
      btnBg: 'bg-indigo-500 hover:bg-indigo-600',
    }
  };

  const theme = themes[type];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-5">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
      /> 

      {/* Modal Card */}
      <div className="relative w-full max-w-[440px] bg-white p-8 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300 ease-out">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer rounded-full hover:bg-slate-50"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`w-16 h-16 rounded-[20px] ${theme.bg} flex items-center justify-center mb-5 ${theme.iconColor}`}>
            <AlertTriangle size={32} />
          </div>

          <h3 className="text-xl font-extrabold text-slate-900 mb-3">{title}</h3>
          <p className="text-[15px] text-slate-600 leading-relaxed mb-8">{message}</p>

          <div className="flex gap-3 w-full">
            <button 
              onClick={onClose}
              className="flex-1 py-3.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-all border border-slate-200 cursor-pointer"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-3.5 px-4 ${theme.btnBg} text-white font-bold rounded-xl transition-all border-none cursor-pointer shadow-lg shadow-black/10`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
