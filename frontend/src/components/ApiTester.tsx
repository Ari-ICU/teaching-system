"use client";

import { useState } from "react";
import axios from "axios";
import { Send, Server } from "lucide-react";

export default function ApiTester() {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("/api/demo/users");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const fullUrl = `http://localhost${url}`;
      let res;
      if (method === "GET") {
        res = await axios.get(fullUrl);
      } else if (method === "POST") {
        res = await axios.post(fullUrl, { sample: "data" });
      }
      
      setResponse({
        status: res?.status,
        data: res?.data
      });
    } catch (err: any) {
      setResponse({
        status: err.response?.status || 500,
        error: err.message,
        data: err.response?.data
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3">
        <Server size={18} className="text-cyan-600" />
        <span className="font-semibold text-slate-900 text-sm">Live API Tester</span>
      </div>
      
      <div className="p-4 border-b border-slate-100 flex gap-2">
        <select 
          className="bg-slate-100 border border-slate-200 rounded-md text-emerald-600 font-bold text-xs px-3 py-2 cursor-pointer font-mono outline-none focus:border-indigo-500 transition-colors"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
        
        <input 
          type="text" 
          className="flex-1 bg-slate-50 border border-slate-200 rounded-md text-slate-900 text-xs px-3 py-2 font-mono outline-none focus:border-indigo-500 transition-colors"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/api/endpoint"
        />
        
        <button 
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#0d3d1f] to-[#1a5c2a] text-[#e8c547] rounded-md text-sm font-semibold shadow-md border border-[#2d7a47] hover:from-[#1a5c2a] hover:to-[#0d3d1f] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Sending..." : <><Send size={14} /> Send</>}
        </button>
      </div>

      <div className="p-4 font-mono text-xs bg-slate-900 min-h-[200px] max-h-[400px] overflow-y-auto leading-relaxed scrollbar-thin scrollbar-thumb-slate-700">
        {response ? (
          <div>
            <div className={`mb-2 font-bold ${response.status === 200 ? "text-emerald-400" : "text-rose-400"}`}>
              Status: {response.status}
            </div>
            <pre className="text-emerald-500 whitespace-pre-wrap">
              {JSON.stringify(response.data || response.error, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="text-slate-500 italic">
            // Click Send to see the API response
          </div>
        )}
      </div>
    </div>
  );
}
