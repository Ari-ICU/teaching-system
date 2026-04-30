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
      color: 'var(--emerald)',
      bg: 'rgba(16, 185, 129, 0.1)',
      icon: <CheckCircle size={18} />,
      border: 'var(--emerald)'
    },
    error: {
      color: 'var(--rose)',
      bg: 'rgba(244, 63, 94, 0.1)',
      icon: <AlertCircle size={18} />,
      border: 'var(--rose)'
    },
    info: {
      color: 'var(--indigo)',
      bg: 'rgba(99, 102, 241, 0.1)',
      icon: <Info size={18} />,
      border: 'var(--indigo)'
    }
  };

  const theme = themes[type];

  return (
    <div style={{
      position: 'fixed',
      top: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 10000,
      animation: 'toastSlideDown 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
    }}>
      <div className="glass-card" style={{
        background: 'white',
        border: `1px solid ${theme.border}40`,
        padding: '12px 24px',
        borderRadius: '100px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: `0 10px 25px ${theme.color}15`,
        minWidth: '320px'
      }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: theme.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.color
        }}>
          {theme.icon}
        </div>
        
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>{message}</span>
        
        <button 
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={16} />
        </button>

        <div style={{
          position: 'absolute',
          bottom: '0',
          left: '20px',
          right: '20px',
          height: '2px',
          background: `${theme.color}20`,
          borderRadius: '1px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            background: theme.color,
            animation: `toastProgress ${duration}ms linear forwards`
          }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes toastSlideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes toastProgress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
