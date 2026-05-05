"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, Mail, Lock, AlertCircle, ChevronRight, GraduationCap, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to login");
      }

      login(data.access_token, data.user);
      router.push(data.user.role === 'admin' || data.user.role === 'teacher' ? '/admin' : '/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white overflow-hidden">
      {/* Left Side: Illustration / Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-indigo-600 items-center justify-center p-12 overflow-hidden">
        {/* Dynamic Background Patterns */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-700 rounded-full -translate-x-1/3 translate-y-1/3 blur-3xl opacity-50" />
        
        <div className="relative z-10 max-w-lg space-y-10 animate-in fade-in slide-in-from-left-8 duration-700">
          <div className="space-y-6">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center text-white shadow-2xl">
              <GraduationCap size={44} />
            </div>
            <h2 className="text-5xl font-black text-white leading-tight tracking-tight">
              Master Your <span className="text-indigo-200">Learning</span> Journey.
            </h2>
            <p className="text-indigo-100 text-xl font-medium leading-relaxed opacity-90">
              Access premium curriculum, track your progress, and join a community of world-class learners.
            </p>
          </div>

          <div className="grid gap-4">
            {[
              { icon: CheckCircle2, text: "Access to 50+ Premium Modules" },
              { icon: ShieldCheck, text: "Verified Certification Paths" },
              { icon: Zap, text: "Real-time Progress Tracking" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white/90 font-bold">
                <item.icon size={22} className="text-indigo-300" />
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-20 bg-slate-50 lg:bg-white relative">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="space-y-3">
             <div className="lg:hidden w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl">
               <GraduationCap size={32} />
             </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Welcome Back</h1>
            <p className="text-slate-500 font-medium text-lg">Login to access your learning dashboard</p>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-bold animate-in zoom-in-95 duration-200">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  required 
                  className="w-full h-16 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-black text-slate-700 uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-[11px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest">Forgot?</Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="password" 
                  required 
                  className="w-full h-16 pl-14 pr-6 bg-white border border-slate-200 rounded-2xl text-slate-900 font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-300 shadow-sm" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-600/20 hover:-translate-y-1 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-slate-500 font-bold">
              Don't have an account?{" "}
              <Link href="/register" className="text-indigo-600 hover:text-indigo-700 underline underline-offset-4 decoration-2 decoration-indigo-600/30">
                Create Account
              </Link>
            </p>
          </div>
        </div>
        
        {/* Footer info */}
        <div className="absolute bottom-8 left-0 w-full text-center text-slate-400 text-xs font-bold uppercase tracking-widest px-8">
          © 2026 ARI-ICU Academy System. All rights reserved.
        </div>
      </div>
    </div>
  );
}
