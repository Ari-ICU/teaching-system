"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Layout, Home, LogOut, User, X, FileJson } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close sidebar on navigation (mobile only)
  useEffect(() => {
    if (onClose) onClose();
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", path: "/", icon: <Home size={18} /> },
    { name: "All Modules", path: "/modules", icon: <BookOpen size={18} /> },
    { name: "Browse Courses", path: "/courses", icon: <Layout size={18} /> },
  ];

  if (!mounted) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1100] animate-in fade-in duration-300 md:hidden" 
          onClick={onClose} 
        />
      )}

      <aside 
        className={`
          fixed top-0 left-0 w-[280px] h-screen bg-[#0d2d18] border-r border-white/5 
          flex flex-col z-[100] overflow-y-auto shadow-[10px_0_30px_rgba(0,0,0,0.1)]
          transition-transform duration-300 ease-in-out md:translate-x-0
          ${isOpen ? 'translate-x-0 !z-[1200]' : '-translate-x-full'}
          scrollbar-thin scrollbar-track-[#0a3019] scrollbar-thumb-[#2d7a47] hover:scrollbar-thumb-[#c9a227]
        `}
      >
        <div className="p-5 flex items-center justify-between border-b-2 border-[#c9a227] bg-[#0f4a26]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-white p-[2px] overflow-hidden flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(201,162,39,0.4)]">
              <img src="/logo.png" alt="Ari-ICU Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold text-[#e8c547] leading-none tracking-[-0.5px]">ARI-ICU</h2>
              <span className="text-[10px] text-[#86b99a] opacity-80 uppercase tracking-wider font-semibold">Academy System</span>
            </div>
          </div>

          {/* Mobile close button inside sidebar */}
          <button
            onClick={onClose}
            className="md:hidden p-1 text-[#86b99a] hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 py-6 flex flex-col gap-[2px]">
          <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#86b99a] px-6 py-3">Main Menu</div>
          {navItems.map((item) => {
            const isActive = pathname === item.path || (pathname.startsWith(item.path) && item.path !== "/");
            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`
                  flex items-center gap-3.5 px-6 py-3 text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-[rgba(201,162,39,0.15)] to-transparent text-[#e8c547] font-bold border-l-4 border-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.5)]' 
                    : 'text-[#a5c6b1] hover:bg-white/5 hover:text-white hover:pl-7'}
                `}
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0">{item.icon}</span>
                {item.name}
              </Link>
            );
          })}

          {(user?.role === 'admin' || user?.role === 'teacher') && (
            <>
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#86b99a] px-6 py-3 mt-5">Admin</div>
              {[
                { name: "Content Manager", path: "/admin", icon: <Layout size={18} /> },
                { name: "Import Content", path: "/admin/import", icon: <FileJson size={18} /> },
                { name: "JSON Data Explorer", path: "/admin/data", icon: <Layout size={18} /> },
              ].map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link 
                    key={item.path} 
                    href={item.path} 
                    className={`
                      flex items-center gap-3.5 px-6 py-3 text-sm font-medium transition-all duration-200
                      ${isActive 
                        ? 'bg-gradient-to-r from-[rgba(201,162,39,0.15)] to-transparent text-[#e8c547] font-bold border-l-4 border-[#c9a227] shadow-[0_0_15px_rgba(201,162,39,0.5)]' 
                        : 'text-[#a5c6b1] hover:bg-white/5 hover:text-white hover:pl-7'}
                    `}
                  >
                    <span className="w-5 h-5 flex items-center justify-center shrink-0">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="mt-auto p-5 border-t border-[#1a5c2a]">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[rgba(201,162,39,0.2)] border border-[rgba(201,162,39,0.4)] flex items-center justify-center shrink-0">
                  <User size={16} className="text-[#e8c547]" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-[13px] font-semibold text-[#e8f5e9] truncate">{user.name}</div>
                  <div className="text-[11px] text-[#86b99a] capitalize">{user.role}</div>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-3.5 px-0 py-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors bg-transparent border-none cursor-pointer mt-1"
              >
                <span className="w-5 h-5 flex items-center justify-center shrink-0"><LogOut size={18} /></span>
                Sign Out
              </button>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#0d3d1f] to-[#1a5c2a] text-[#e8c547] rounded-md text-sm font-semibold shadow-[0_4px_15px_rgba(13,61,31,0.4)] border border-[#2d7a47] hover:from-[#1a5c2a] hover:to-[#0d3d1f] hover:-translate-y-px transition-all duration-200"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
