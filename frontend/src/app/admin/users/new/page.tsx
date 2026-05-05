"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Mail, Lock, User as UserIcon, Shield, AlertCircle, ArrowLeft, ChevronRight, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import DropdownSelect from "@/components/ui/DropdownSelect";

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student"
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      router.push('/admin/users');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 lg:p-12 max-w-[1000px] mx-auto space-y-10">
      
      <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400">
        <Link href="/admin" className="hover:text-indigo-600 transition-colors">Admin</Link>
        <ChevronRight size={12} className="text-slate-300" />
        <Link href="/admin/users" className="hover:text-indigo-600 transition-colors">Users</Link>
        <ChevronRight size={12} className="text-slate-300" />
        <span className="text-slate-900">New User</span>
      </div>

      <div className="flex items-center gap-6">
        <button 
          onClick={() => router.back()} 
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        </button>
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Assign Account</h1>
          <p className="text-slate-500 text-lg font-medium">Create a new student or staff account with specific permissions.</p>
        </div>
      </div>

      <div className="max-w-[800px] animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-white border border-slate-200 rounded-[48px] p-10 md:p-14 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32" />
          
          {error && (
            <div className="p-5 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-bold flex items-center gap-4 mb-10 animate-in shake duration-500">
              <AlertCircle size={22} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">FULL NAME</label>
                <div className="relative group">
                  <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  <input 
                    type="text" 
                    required 
                    className="w-full h-16 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 text-lg font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ACCOUNT ROLE</label>
                <div className="relative group">
                  <Shield className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors z-10 pointer-events-none" size={20} />
                  <div className="pl-14 bg-slate-50 rounded-2xl">
                    <DropdownSelect 
                      options={[
                        { value: "student", label: "Student Account" },
                        { value: "teacher", label: "Teacher Account" },
                        { value: "admin", label: "System Admin" }
                      ]}
                      value={formData.role}
                      onChange={(value) => setFormData({...formData, role: value})}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">EMAIL ADDRESS</label>
              <div className="relative group">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="email" 
                  required 
                  className="w-full h-16 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 text-lg font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">INITIAL PASSWORD</label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                <input 
                  type="text" 
                  required 
                  className="w-full h-16 pl-14 pr-6 bg-slate-50 border-none rounded-2xl text-slate-900 text-lg font-bold focus:ring-4 focus:ring-indigo-500/10 transition-all placeholder:text-slate-300"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                Provide this password to the user. They will be prompted to update it on their dashboard.
              </p>
            </div>

            <div className="pt-10 border-t border-slate-100 flex flex-col md:flex-row gap-4">
              <button 
                type="submit" 
                className="h-16 px-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 group grow" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <><Loader2 className="animate-spin" size={22} /> Creating account...</>
                ) : (
                  <><UserPlus size={22} /> <span>Create New Account</span> <ChevronRight className="group-hover:translate-x-1 transition-transform" size={22} /></>
                )}
              </button>
              <button 
                type="button" 
                onClick={() => router.back()}
                className="h-16 px-10 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
