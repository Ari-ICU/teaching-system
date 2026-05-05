"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Eye, Mail, Phone, Calendar, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const { token, isLoading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && token) fetchEnrollments();
  }, [token, authLoading]);

  const fetchEnrollments = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/enrollments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setEnrollments(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (courseId: number, userId: number, action: 'approve' | 'reject') => {
    const id = `${courseId}-${userId}`;
    setActionId(id);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const res = await fetch(`${apiUrl}/admin/enrollments/${courseId}/${userId}/${action}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (res.ok) {
        setEnrollments(enrollments.filter(e => !(e.course_id === courseId && e.user_id === userId)));
      } else {
        alert("Action failed.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto">
      <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mb-8 font-medium">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="mb-12 space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Enrollment Verification</h1>
        <p className="text-slate-500 text-lg font-medium">Review student invoices and approve access to curriculum.</p>
      </header>

      {enrollments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[32px] p-20 text-center shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mb-2">All caught up!</h3>
          <p className="text-slate-500 font-medium">No pending enrollment requests at the moment.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {enrollments.map((enroll) => {
            const isProcessing = actionId === `${enroll.course_id}-${enroll.user_id}`;
            return (
              <div 
                key={`${enroll.course_id}-${enroll.user_id}`} 
                className="group bg-white border border-slate-200 rounded-[32px] p-6 md:p-8 flex flex-col lg:flex-row gap-8 items-center shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Invoice Preview */}
                <div className="relative w-32 h-44 bg-slate-100 rounded-2xl overflow-hidden shrink-0 shadow-inner group/invoice cursor-pointer border border-slate-200">
                  {enroll.payment_screenshot ? (
                    <img 
                      src={`${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage'}/${enroll.payment_screenshot}`} 
                      alt="Invoice" 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover/invoice:scale-110" 
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-300">
                      <AlertCircle size={32} />
                    </div>
                  )}
                  <a 
                    href={`${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage'}/${enroll.payment_screenshot}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-slate-900/40 opacity-0 group-hover/invoice:opacity-100 transition-opacity text-white"
                  >
                    <Eye size={28} />
                  </a>
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight truncate">{enroll.user_name}</h3>
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black rounded-full uppercase tracking-wider border border-amber-100">
                      PENDING VERIFICATION
                    </span>
                  </div>
                  
                  <div className="text-base font-bold text-slate-700">
                    Wants to join: <span className="text-indigo-600">{enroll.course_title}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 pt-2">
                     <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                        <Mail size={16} className="text-indigo-400" /> 
                        <span className="truncate">{enroll.user_email}</span>
                     </div>
                     <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                        <Phone size={16} className="text-indigo-400" /> 
                        <span>{enroll.phone || 'No phone'}</span>
                     </div>
                     <div className="flex items-center gap-2.5 text-sm font-medium text-slate-500">
                        <Calendar size={16} className="text-indigo-400" /> 
                        <span>{new Date(enroll.created_at).toLocaleDateString()}</span>
                     </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full lg:w-48">
                  <button 
                    onClick={() => handleAction(enroll.course_id, enroll.user_id, 'approve')}
                    className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isProcessing}
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> Approve</>}
                  </button>
                  <button 
                     onClick={() => handleAction(enroll.course_id, enroll.user_id, 'reject')}
                     className="flex-1 py-3.5 bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={isProcessing}
                  >
                    <XCircle size={18} /> Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
