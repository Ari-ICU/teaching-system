"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Inter, Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Define routes where navigation should be hidden
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} ${jetbrains.variable}`}>
        <AuthProvider>
          <div className="glow-orb glow-orb-1" />
          <div className="glow-orb glow-orb-2" />
          
          {!isAuthPage && (
            <MobileNav 
              isOpen={isSidebarOpen} 
              onToggle={() => setIsSidebarOpen(!isSidebarOpen)} 
            />
          )}

          <div className="app-layout">
            {!isAuthPage && (
              <Sidebar 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
              />
            )}
            <main className={isAuthPage ? "auth-main" : "main-content"}>
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
