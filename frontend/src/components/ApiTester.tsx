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
    <div className="api-tester">
      <div className="api-tester-header">
        <Server size={18} color="var(--cyan)" />
        <span style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>Live API Tester</span>
      </div>
      
      <div style={{ padding: "16px", borderBottom: "1px solid var(--border)", display: "flex", gap: "8px" }}>
        <select 
          className="method-select"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
        </select>
        
        <input 
          type="text" 
          className="url-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/api/endpoint"
        />
        
        <button 
          className="btn btn-primary" 
          style={{ padding: "8px 16px" }}
          onClick={handleSend}
          disabled={loading}
        >
          {loading ? "Sending..." : <><Send size={14} /> Send</>}
        </button>
      </div>

      <div className="api-response">
        {response ? (
          <div>
            <div style={{ marginBottom: "8px", color: response.status === 200 ? "var(--emerald)" : "var(--rose)" }}>
              Status: {response.status}
            </div>
            {JSON.stringify(response.data || response.error, null, 2)}
          </div>
        ) : (
          <div style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            // Click Send to see the API response
          </div>
        )}
      </div>
    </div>
  );
}
