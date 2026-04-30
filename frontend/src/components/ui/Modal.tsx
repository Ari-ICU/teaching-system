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

  const colors = {
    danger: 'var(--rose)',
    warning: 'var(--amber)',
    info: 'var(--indigo)'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          animation: 'fadeIn 0.2s ease-out'
        }} 
      />

      {/* Modal Card */}
      <div className="glass-card" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '440px',
        background: 'white',
        padding: '32px',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        animation: 'modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        overflow: 'hidden'
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: `${colors[type]}15`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            color: colors[type]
          }}>
            <AlertTriangle size={32} />
          </div>

          <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>{title}</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>{message}</p>

          <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
            <button 
              onClick={onClose}
              className="btn btn-ghost"
              style={{ flex: 1, justifyContent: 'center', padding: '14px' }}
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="btn"
              style={{ 
                flex: 1, 
                justifyContent: 'center', 
                padding: '14px',
                background: type === 'danger' ? 'var(--rose)' : (type === 'warning' ? 'var(--amber)' : 'var(--indigo)'),
                color: 'white',
                border: 'none'
              }}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
