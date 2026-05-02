"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, PlaySquare, Layout, Home, LogOut, User, X, FileJson } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isLoading, token } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on navigation (mobile only)
  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]);

  if (!mounted) {
    return (
      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background: 'white', padding: '2px', overflow: 'hidden' }}>
            <img src="/logo.png" alt="Ari-ICU Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>
          <div className="sidebar-logo-text">
            <h2 style={{ fontSize: '18px', letterSpacing: '-0.5px' }}>ARI-ICU</h2>
            <span>ACADEMY SYSTEM</span>
          </div>
        </div>
      </aside>
    );
  }

  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home size={18} /> },
    { name: "All Modules", path: "/modules", icon: <BookOpen size={18} /> },
    { name: "Browse Courses", path: "/courses", icon: <Layout size={18} /> },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="sidebar-logo-icon" style={{ background: 'white', padding: '2px', overflow: 'hidden' }}>
              <img src="/logo.png" alt="Ari-ICU Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>
            <div className="sidebar-logo-text">
              <h2 style={{ fontSize: '18px', letterSpacing: '-0.5px' }}>ARI-ICU</h2>
              <span style={{ fontSize: '10px', opacity: 0.8 }}>ACADEMY SYSTEM</span>
            </div>
          </div>

          {/* Mobile close button inside sidebar */}
          <button
            onClick={onClose}
            className="mobile-close-btn"
            style={{ display: 'none', background: 'none', border: 'none', color: '#86b99a', cursor: 'pointer' }}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-label">Main Menu</div>
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== "/");
            return (
              <Link key={item.path} href={item.path} className={`sidebar-item ${isActive ? "active" : ""}`}>
                <span className="sidebar-item-icon">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <>
              <div className="sidebar-section-label" style={{ marginTop: "20px" }}>Admin</div>
              <Link href="/admin" className={`sidebar-item ${pathname === "/admin" ? "active" : ""}`}>
                <span className="sidebar-item-icon"><Layout size={18} /></span>
                Content Manager
              </Link>
              <Link href="/admin/import" className={`sidebar-item ${pathname === "/admin/import" ? "active" : ""}`}>
                <span className="sidebar-item-icon"><FileJson size={18} /></span>
                Import Content
              </Link>
              <Link href="/admin/data" className={`sidebar-item ${pathname === "/admin/data" ? "active" : ""}`}>
                <span className="sidebar-item-icon"><Layout size={18} /></span>
                JSON Data Explorer
              </Link>
            </>
          )}
        </nav>

        <div style={{ marginTop: 'auto', padding: '20px', borderTop: '1px solid #1a5c2a' }}>
          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(201,162,39,0.2)', border: '1px solid rgba(201,162,39,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={16} color="#e8c547" />
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#e8f5e9' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: '#86b99a', textTransform: 'capitalize' }}>{user.role}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="sidebar-item"
                style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', marginTop: '4px' }}
              >
                <span className="sidebar-item-icon"><LogOut size={18} /></span>
                Sign Out
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
              Sign In
            </Link>
          )}
        </div>
      </aside>

      <style jsx>{`
        .sidebar-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 1100;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        :global(.sidebar.mobile-open) {
          transform: translateX(0) !important;
          z-index: 1200 !important;
          width: 280px !important;
        }

        @media (max-width: 768px) {
          :global(.main-content) {
            padding-top: 60px !important;
          }
          .mobile-close-btn {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
