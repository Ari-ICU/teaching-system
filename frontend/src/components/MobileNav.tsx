"use client";

import { Menu, X, PlaySquare } from "lucide-react";
import { useState, useEffect } from "react";

interface MobileNavProps {
  onToggle: () => void;
  isOpen: boolean;
}

export default function MobileNav({ onToggle, isOpen }: MobileNavProps) {
  return (
    <div className="mobile-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="sidebar-logo-icon" style={{ width: '32px', height: '32px' }}>
          <PlaySquare size={16} color="white" />
        </div>
        <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>Studio</h2>
      </div>
      
      <button 
        onClick={onToggle}
        className="btn btn-ghost" 
        style={{ padding: '8px', border: 'none' }}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <style jsx>{`
        .mobile-header {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 60px;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border);
          padding: 0 20px;
          align-items: center;
          justify-content: space-between;
          z-index: 1000;
        }

        @media (max-width: 768px) {
          .mobile-header {
            display: flex;
          }
        }
      `}</style>
    </div>
  );
}
