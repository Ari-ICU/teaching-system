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
    <div className="page">
      <Link href="/admin" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <header className="page-header" style={{ marginBottom: '40px' }}>
        <h1 className="page-title">Enrollment Verification</h1>
        <p className="page-subtitle">Review student invoices and approve access to curriculum.</p>
      </header>

      {enrollments.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
          <CheckCircle size={48} color="var(--emerald)" style={{ margin: '0 auto 20px', opacity: 0.5 }} />
          <h3>All caught up!</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>No pending enrollment requests at the moment.</p>
        </div>
      ) : (
        <div className="grid-1" style={{ gap: '20px' }}>
          {enrollments.map((enroll) => (
            <div key={`${enroll.course_id}-${enroll.user_id}`} className="glass-card" style={{ padding: '32px', display: 'flex', gap: '40px', alignItems: 'center' }}>
              {/* Invoice Preview */}
              <div style={{ width: '120px', height: '160px', background: 'var(--bg-secondary)', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                {enroll.payment_screenshot ? (
                  <img 
                    src={`${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage'}/${enroll.payment_screenshot}`} 
                    alt="Invoice" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <AlertCircle color="var(--text-muted)" />
                  </div>
                )}
                <a 
                  href={`${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage'}/${enroll.payment_screenshot}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', opacity: 0, transition: 'opacity 0.2s', color: 'white', textDecoration: 'none' }}
                  className="hover-opacity"
                >
                  <Eye size={24} />
                </a>
              </div>

              {/* Student Info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{enroll.user_name}</h3>
                  <span className="badge badge-amber">PENDING VERIFICATION</span>
                </div>
                <div style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '16px', fontWeight: 600 }}>
                  Wants to join: <span style={{ color: 'var(--indigo)' }}>{enroll.course_title}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Mail size={14} /> {enroll.user_email}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Phone size={14} /> {enroll.phone || 'No phone'}
                   </div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Calendar size={14} /> {new Date(enroll.created_at).toLocaleDateString()}
                   </div>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minWidth: '160px' }}>
                <button 
                  onClick={() => handleAction(enroll.course_id, enroll.user_id, 'approve')}
                  className="btn btn-primary" 
                  style={{ background: 'var(--emerald)', borderColor: 'var(--emerald)', width: '100%', justifyContent: 'center' }}
                  disabled={actionId === `${enroll.course_id}-${enroll.user_id}`}
                >
                  {actionId === `${enroll.course_id}-${enroll.user_id}` ? <Loader2 className="animate-spin" size={18} /> : <><CheckCircle size={18} /> Approve Access</>}
                </button>
                <button 
                   onClick={() => handleAction(enroll.course_id, enroll.user_id, 'reject')}
                   className="btn btn-ghost" 
                   style={{ color: 'var(--rose)', width: '100%', justifyContent: 'center' }}
                   disabled={actionId === `${enroll.course_id}-${enroll.user_id}`}
                >
                  <XCircle size={18} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .hover-opacity:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}
