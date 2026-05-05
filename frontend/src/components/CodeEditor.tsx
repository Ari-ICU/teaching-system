"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { Play, RotateCcw, Maximize2, Minimize2, Code2 } from "lucide-react";

type SupportedLang = "html" | "css" | "javascript" | "typescript" | "other";

function normalizeLang(raw: string): SupportedLang {
  const l = (raw ?? "javascript").toLowerCase().trim();
  if (l === "html") return "html";
  if (l === "css") return "css";
  if (l === "typescript" || l === "ts") return "typescript";
  if (l === "javascript" || l === "js") return "javascript";
  return "other";
}

function cssToHtml(css: string) {
  return `<!DOCTYPE html><html><head><style>
body { font-family: sans-serif; padding: 1rem; }
${css}
</style></head><body><p>CSS Preview</p><div class="box"></div></body></html>`;
}

export default function CodeEditor({
  initialCode,
  language = "javascript",
  runnable = false,
  fillHeight = false,
}: {
  initialCode: string;
  language?: string;
  runnable?: boolean;
  fillHeight?: boolean;
}) {
  const [code, setCode] = useState(initialCode);
  const [output, setOutput] = useState("");
  const [iframeKey, setIframeKey] = useState(0);
  const [iframeSrc, setIframeSrc] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const lang = normalizeLang(language);
  const isMarkupLang = lang === "html" || lang === "css";

  // Auto-load markup into iframe on mount
  useEffect(() => {
    if (isMarkupLang && runnable) {
      setIframeSrc(lang === "css" ? cssToHtml(initialCode) : initialCode);
    }
  }, []);

  // Native fullscreen API — sync state with browser events
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Keyboard shortcut: F or Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) exitFullscreen();
      if ((e.key === "f" || e.key === "F") && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement)?.tagName)) {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error);
    } else {
      exitFullscreen();
    }
  };

  const exitFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
  };

  const handleRun = () => {
    if (isMarkupLang) {
      const src = lang === "css" ? cssToHtml(code) : code;
      setIframeSrc(src);
      setIframeKey((prev) => prev + 1);
      return;
    }

    if (lang === "javascript" || lang === "typescript") {
      try {
        const logs: string[] = [];
        const origLog = console.log;
        const origWarn = console.warn;
        const origError = console.error;

        console.log = (...args) =>
          logs.push(args.map((a) => (typeof a === "object" ? JSON.stringify(a, null, 2) : String(a))).join(" "));
        console.warn = (...args) => logs.push("⚠ " + args.map(String).join(" "));
        console.error = (...args) => logs.push("✖ " + args.map(String).join(" "));

        // eslint-disable-next-line no-eval
        eval(code);

        console.log = origLog;
        console.warn = origWarn;
        console.error = origError;
        setOutput(logs.length ? logs.join("\n") : "(no output)");
      } catch (err: any) {
        setOutput(`Error: ${err.message}`);
      }
      return;
    }

    setOutput("Run is not supported for this language in the browser.");
  };

  const handleReset = () => {
    setCode(initialCode);
    setOutput("");
    if (isMarkupLang) {
      const src = lang === "css" ? cssToHtml(initialCode) : initialCode;
      setIframeSrc(src);
      setIframeKey((prev) => prev + 1);
    }
  };

  return (
    <div
      ref={containerRef}
      style={isFullscreen ? { height: '100vh' } : fillHeight ? {} : { height: '680px', minHeight: '680px' }}
      className={`
        flex flex-col w-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${fillHeight && !isFullscreen ? 'h-full' : ''}
        ${isFullscreen
          ? "fixed inset-0 z-[9999] bg-[#0f172a] rounded-none min-w-screen m-0"
          : fillHeight
            ? "bg-[#0f172a]"
            : "rounded-[32px] border border-slate-200/60 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]"
        }
      `}
    >
      {/* ── Premium Fullscreen Header ── */}
      {isFullscreen && (
        <div className="h-[72px] px-6 md:px-10 flex items-center justify-between border-b border-white/10 bg-slate-900/80 backdrop-blur-xl z-20 shrink-0">
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500 text-white rounded-full text-[10px] font-extrabold tracking-widest shadow-[0_4px_12px_rgba(99,102,241,0.2)]">
              <Code2 size={12} />
              <span>LIVE PLAYGROUND</span>
            </div>
            <div className="w-px h-5 bg-white/10" />
            <h2 className="text-[15px] font-bold text-slate-300 m-0 tracking-tight">Interactive Code Demo</h2>
          </div>

          <button
            className="w-10 h-10 flex items-center justify-center rounded-xl border-none bg-transparent text-slate-400 cursor-pointer transition-all hover:bg-white/10 hover:text-white"
            onClick={toggleFullscreen}
            title="Exit Fullscreen (F / Esc)"
          >
            <Minimize2 size={20} />
          </button>
        </div>
      )}

      {/* ── Editor + Preview row ─────────────────────────────────────── */}
      <div className={`
        grid gap-0 flex-1 h-full overflow-hidden
        ${runnable ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}
      `}>

        {/* Editor pane */}
        <div
          className={`
            bg-slate-800 border border-slate-700 overflow-hidden flex flex-col relative h-full
            ${runnable ? "md:border-r-0 md:rounded-l-[32px] md:rounded-r-none" : "rounded-[32px]"}
            ${isFullscreen ? "rounded-none border-0" : ""}
          `}
        >
          {/* Chrome bar */}
          <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#1e293b] shrink-0">
            <div className="flex gap-2 items-center">
              <div className="flex gap-1.5 mr-2">
                <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded-md">
                {lang}
              </span>
            </div>

            <div className="flex gap-2 items-center">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                onClick={handleReset}
                title="Reset code"
              >
                <RotateCcw size={12} /> Reset
              </button>

              {runnable && (
                <button
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all shadow-sm"
                  onClick={handleRun}
                  title="Run Code"
                >
                  <Play size={12} /> Run
                </button>
              )}

              {!isFullscreen && (
                <button
                  className="flex items-center justify-center w-8 h-8 ml-1 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={toggleFullscreen}
                  title="Fullscreen (F)"
                >
                  <Maximize2 size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Monaco editor */}
          <div className="flex-1 min-h-[300px] overflow-hidden bg-[#0f172a]">
            <Editor
              height="100%"
              language={lang === "other" ? "plaintext" : lang}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || "")}
              options={{
                minimap: { enabled: isFullscreen },
                fontSize: isFullscreen ? 16 : 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                padding: { top: 24, bottom: 24 },
                scrollBeyondLastLine: false,
                wordWrap: "on",
                lineHeight: 1.6,
                renderLineHighlight: "all",
              }}
            />
          </div>
        </div>

        {/* Output / Preview pane */}
        {runnable && (
          <div
            className={`
              flex flex-col h-full min-h-[300px]
              ${isFullscreen ? "rounded-none border-l border-white/10 bg-slate-50" : "md:rounded-r-[32px] md:rounded-l-none md:border-l-0 border border-slate-200 bg-white"}
            `}
          >
            {isMarkupLang ? (
              <>
                {/* ── Browser title bar ── */}
                <div className={`shrink-0 flex flex-col border-b ${isFullscreen ? "border-slate-200 bg-white" : "border-slate-200 bg-[#f1f3f4]"}`}>
                  {/* Top chrome row: dots + title */}
                  <div className="px-4 pt-3 pb-1 flex items-center gap-3">
                    {/* Traffic lights */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_4px_rgba(255,95,87,0.4)] cursor-pointer hover:brightness-90 transition" />
                      <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_4px_rgba(255,189,46,0.4)] cursor-pointer hover:brightness-90 transition" />
                      <span className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_4px_rgba(40,200,64,0.4)] cursor-pointer hover:brightness-90 transition" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 truncate">Live Preview</span>
                    <div className="ml-auto flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
                      <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
                    </div>
                  </div>
                  {/* URL bar row */}
                  <div className="px-4 pb-2.5 flex items-center gap-2">
                    {/* Lock icon */}
                    <svg className="w-3 h-3 text-slate-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 bg-white border border-slate-300 rounded-md px-3 py-1 flex items-center gap-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                      <span className="text-[11px] text-slate-400 font-mono font-semibold select-all">localhost:3000</span>
                    </div>
                  </div>
                </div>

                {/* iframe content */}
                <div className="flex-1 relative overflow-hidden bg-white">
                  <div className={`w-full h-full ${isFullscreen ? "p-6 bg-slate-100/50" : "p-0"}`}>
                    <div className={`w-full h-full bg-white overflow-hidden ${isFullscreen ? "rounded-xl shadow-sm border border-slate-200/60" : ""}`}>
                      <iframe
                        key={iframeKey}
                        srcDoc={iframeSrc}
                        className="w-full h-full border-none"
                        title="preview"
                        sandbox="allow-scripts"
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* ── Console header ── */}
                <div className={`px-5 py-3 flex items-center gap-2 border-b shrink-0 ${isFullscreen ? "bg-white border-slate-200" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <span className="w-3 h-3 rounded-full bg-[#28c840]" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 ml-1">Console Output</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Ready</span>
                  </div>
                </div>
                <pre
                  className={`p-6 m-0 font-mono text-[14px] whitespace-pre-wrap flex-1 overflow-auto leading-relaxed
                    ${output.startsWith("Error:") || output.includes("✖")
                      ? "text-rose-600 bg-rose-50/50"
                      : output === "(no output)"
                      ? "text-slate-400 bg-slate-50"
                      : "text-slate-700 bg-white"
                    }
                  `}
                >
                  {output || "// Click ▶ Run to see output"}
                </pre>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
