"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw } from "lucide-react";

export default function CodeEditor({ initialCode, language = "javascript", runnable = false }: { initialCode: string, language?: string, runnable?: boolean }) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [key, setKey] = useState(0); // for forcing iframe refresh

  const handleRun = () => {
    if (language === "html") {
      setKey(prev => prev + 1);
    } else if (language === "javascript") {
      try {
        // Simple eval for demo purposes. In real app, use Web Workers or a sandbox.
        let logs: string[] = [];
        const originalConsoleLog = console.log;
        console.log = (...args) => {
          logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '));
        };
        
        // eslint-disable-next-line no-eval
        eval(code);
        
        console.log = originalConsoleLog;
        setOutput(logs.join('\n'));
      } catch (err: any) {
        setOutput(`Error: ${err.message}`);
      }
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput("");
  };

  return (
    <div className="grid-2" style={{ gap: "0" }}>
      <div className="editor-panel" style={{ borderRadius: runnable ? "var(--radius-lg) 0 0 var(--radius-lg)" : "var(--radius-lg)", borderRight: runnable ? "none" : "" }}>
        <div className="editor-header">
          <div className="editor-dots">
            <div className="editor-dot" style={{ background: "#f87171" }}></div>
            <div className="editor-dot" style={{ background: "#facc15" }}></div>
            <div className="editor-dot" style={{ background: "#4ade80" }}></div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: "12px" }} onClick={handleReset}>
              <RotateCcw size={12} /> Reset
            </button>
            {runnable && (
              <button className="btn btn-primary" style={{ padding: "4px 12px", fontSize: "12px" }} onClick={handleRun}>
                <Play size={12} /> Run
              </button>
            )}
          </div>
        </div>
        <div className="editor-body">
          <Editor
            height="100%"
            language={language}
            theme="vs"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "'JetBrains Mono', monospace",
              padding: { top: 16 },
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>

      {runnable && (
        <div className="preview-panel" style={{ borderRadius: "0 var(--radius-lg) var(--radius-lg) 0", display: "flex", flexDirection: "column" }}>
          <div className="preview-header">
            Preview / Output
          </div>
          <div style={{ flex: 1, position: "relative" }}>
            {language === "html" ? (
              <iframe 
                key={key}
                srcDoc={code}
                style={{ width: "100%", height: "100%", border: "none" }}
                title="preview"
              />
            ) : (
              <pre style={{ padding: "16px", margin: 0, fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", color: output.startsWith("Error:") ? "#dc2626" : "#059669", whiteSpace: "pre-wrap", background: "#f8fafc" }}>
                {output || "// Output will appear here"}
              </pre>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
