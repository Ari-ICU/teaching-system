"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, Download, Search, Layout, Database, Code } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DataExplorerPage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"courses" | "modules" | "lessons">("courses");
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (token) {
      fetchData(activeTab);
    }
  }, [token, activeTab]);

  const fetchData = async (type: string) => {
    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
      const endpoint = `/admin/${type}`;
      
      const res = await fetch(`${apiUrl}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const result = await res.json();
      setData(result.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(filteredData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredData = Array.isArray(data) 
    ? data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : data;

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(filteredData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeTab}_data.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (user?.role !== 'admin' && user?.role !== 'teacher') {
    return <div className="page">Unauthorized</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Database size={24} color="var(--indigo)" />
          <span className="badge badge-indigo">SYSTEM ADMINISTRATION</span>
        </div>
        <h1 className="page-title">JSON Data Explorer</h1>
        <p className="page-subtitle">Inspect and export raw curriculum data in JSON format.</p>
      </header>

      <div className="glass-card" style={{ padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="url-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '40px', width: '100%' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setActiveTab("courses")}
              className={`btn ${activeTab === "courses" ? "btn-primary" : "btn-ghost"}`}
            >
              Courses
            </button>
            <button 
              onClick={() => setActiveTab("modules")}
              className={`btn ${activeTab === "modules" ? "btn-primary" : "btn-ghost"}`}
            >
              Modules
            </button>
            <button 
              onClick={() => setActiveTab("lessons")}
              className={`btn ${activeTab === "lessons" ? "btn-primary" : "btn-ghost"}`}
            >
              Lessons
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code size={18} color="var(--text-secondary)" />
            <span style={{ fontWeight: 600 }}>Raw Output: {activeTab.toUpperCase()}</span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={copyToClipboard} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <Copy size={14} /> {copied ? "Copied!" : "Copy JSON"}
            </button>
            <button onClick={downloadJson} className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '13px' }}>
              <Download size={14} /> Download
            </button>
          </div>
        </div>

        <div style={{ 
          background: '#0f172a', 
          borderRadius: '12px', 
          padding: '24px', 
          maxHeight: '600px', 
          overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          {loading ? (
            <div style={{ color: '#6366f1', textAlign: 'center', padding: '40px' }}>Loading data...</div>
          ) : (
            <pre style={{ 
              color: '#94a3b8', 
              fontSize: '13px', 
              fontFamily: 'monospace',
              lineHeight: '1.6'
            }}>
              {data ? JSON.stringify(filteredData, null, 2) : "No data found."}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
