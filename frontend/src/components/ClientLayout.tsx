"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { AuthProvider } from "@/context/AuthContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Pages where we want a full-screen experience without the global sidebar
  const isFullScreenPage = 
    pathname === '/login' || 
    pathname === '/register' || 
    pathname.startsWith('/lessons/') ||
    pathname.startsWith('/admin/lessons/') && pathname.includes('/edit');

  return (
    <AuthProvider>
      {/* Glow Orbs */}
      <div className="fixed rounded-full blur-[120px] opacity-20 pointer-events-none -z-10 w-[500px] h-[500px] bg-indigo-500 -top-48 -left-24" />
      <div className="fixed rounded-full blur-[120px] opacity-20 pointer-events-none -z-10 w-[400px] h-[400px] bg-purple-500 bottom-0 -right-24" />
      
      {!isFullScreenPage && (
        <MobileNav 
          isOpen={isSidebarOpen} 
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
        />
      )}

      <div className="flex min-h-screen relative overflow-x-hidden">
        {!isFullScreenPage && (
          <Sidebar 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
          />
        )}
        <main 
          className={`
            flex-1 flex flex-col min-w-0 transition-all duration-300
            ${isFullScreenPage ? 'items-center justify-center bg-white relative z-10' : 'lg:ml-[280px]'}
          `}
        >
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}
