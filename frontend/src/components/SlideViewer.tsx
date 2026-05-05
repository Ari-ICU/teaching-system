"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Terminal,
  Globe,
  Code2,
  Info,
} from "lucide-react";
import { marked } from "marked";

interface Slide {
  id: number;
  title: string;
  content: string;
  type: string;
  layout_type?: string;
  image?: string;
  secondary_image?: string;
  image_position?: "top" | "bottom" | "left" | "right";
  image_width?: string;
  secondary_image_position?: "top" | "bottom" | "left" | "right";
  secondary_image_width?: string;
  code_snippet?: string;
  code_position?: "bottom" | "right";
  code_theme?: "terminal" | "browser" | "editor";
}

// Resolve an image path to a usable <img> src.
// If the value is already a full URL (blob:, http:, https:, or //) → use as-is.
// Otherwise prepend the storage base URL.
function resolveImg(path: string | undefined, storageUrl: string): string {
  if (!path) return "";
  if (/^(blob:|https?:|\/\/)/.test(path)) return path;
  return `${storageUrl}/${path}`;
}

export default function SlideViewer({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  const storageUrl =
    process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:8080/storage";

  // ── Keyboard navigation ─────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight")
        setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
      else if (e.key === "ArrowLeft")
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      else if (e.key === "f" || e.key === "F") toggleFullscreen();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement)
      viewerRef.current.requestFullscreen().catch(console.error);
    else document.exitFullscreen();
  };

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!slides || slides.length === 0)
    return (
      <div className="bg-white border border-slate-200/60 rounded-[32px] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)] p-10 text-center">
        <Info size={48} className="mx-auto mb-4 opacity-20" />
        <p className="text-slate-500">No slides available for this lesson.</p>
      </div>
    );

  const currentSlide = slides[currentIndex];

  return (
    <div
      className={`
        flex flex-col bg-white border border-slate-200/60 overflow-hidden relative min-h-[680px]
        shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08),0_0_0_1px_rgba(0,0,0,0.02)]
        transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${isFullscreen ? "fixed inset-0 w-screen h-screen rounded-none z-[9999] m-0" : "rounded-[32px]"}
      `}
      ref={viewerRef}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div 
        className={`
          flex items-center justify-between border-b z-20 transition-all duration-300
          ${isFullscreen 
            ? "h-[72px] px-10 border-white/10 bg-slate-900/80 backdrop-blur-xl text-white" 
            : "h-[60px] px-10 border-slate-200/60 bg-white/50 backdrop-blur-[20px] text-slate-900"
          }
        `}
      >
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500 text-white rounded-full text-[10px] font-extrabold tracking-widest shadow-[0_4px_12px_rgba(99,102,241,0.2)]">
            {currentSlide.type === "practice" ? (
              <Code2 size={12} />
            ) : (
              <Info size={12} />
            )}
            <span>{currentSlide.type.toUpperCase()}</span>
          </div>
          <div className={`text-[12px] font-bold ${isFullscreen ? "text-slate-400" : "text-slate-400"}`}>
            Slide {currentIndex + 1}{" "}
            <span className="opacity-40">/ {slides.length}</span>
          </div>
          <div className={`w-px h-5 ${isFullscreen ? "bg-white/10" : "bg-slate-200/60"}`} />
          <h2 className={`text-[15px] font-bold m-0 tracking-tight ${isFullscreen ? "text-slate-200" : "text-slate-500"}`}>
            {currentSlide.title}
          </h2>
        </div>

        <button
          className={`
            w-10 h-10 flex items-center justify-center rounded-xl border-none bg-transparent cursor-pointer transition-all 
            ${isFullscreen 
              ? "text-slate-400 hover:bg-white/10 hover:text-white" 
              : "text-slate-400 hover:bg-slate-100 hover:text-indigo-500"
            }
          `}
          onClick={toggleFullscreen}
          title="Toggle Fullscreen (F)"
        >
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* ── Slide Content ────────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-y-auto bg-[radial-gradient(circle_at_top_left,#ffffff_0%,#f8fafc_100%)] [scrollbar-width:thin] [scrollbar-color:#e2e8f0_transparent]">
        <SlideContent
          currentSlide={currentSlide}
          isFullscreen={isFullscreen}
          storageUrl={storageUrl}
        />
      </div>

      {/* ── Footer Navigation ───────────────────────────────────────────── */}
      <div className="h-[72px] px-10 flex items-center justify-between border-t border-slate-200/60 bg-white/70 backdrop-blur-[20px] z-20">
        <button
          className="flex items-center gap-3 px-7 py-3 rounded-[18px] border border-slate-200/60 bg-white text-slate-600 font-bold text-[15px] cursor-pointer transition-all duration-300 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-slate-50 hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-[0_10px_15px_-3px_rgba(0,0,0,0.05)] disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale"
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} />
          <span>Previous</span>
        </button>

        {/* Dot indicators */}
        <div className="flex gap-3 bg-slate-100 px-3 py-1.5 rounded-full">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`
                h-2.5 rounded-full border-none cursor-pointer transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] p-0
                ${idx === currentIndex ? "w-8 bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "w-2.5 bg-slate-300"}
              `}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>

        <button
          className="flex items-center gap-3 px-7 py-3 rounded-[18px] border-none bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-bold text-[15px] cursor-pointer transition-all duration-300 shadow-[0_10px_25px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_35px_-5px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 hover:scale-[1.02] disabled:opacity-30 disabled:cursor-not-allowed disabled:grayscale"
          onClick={() =>
            setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))
          }
          disabled={currentIndex === slides.length - 1}
        >
          <span>Next</span>
          <ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
}

// ── SlideContent ── extracted to avoid calling useMemo inside JSX ──────────
function SlideContent({
  currentSlide,
  isFullscreen,
  storageUrl,
}: {
  currentSlide: Slide;
  isFullscreen: boolean;
  storageUrl: string;
}) {
  const img = (path?: string) => resolveImg(path, storageUrl);

  const renderedContent = useMemo(() => {
    const raw = (currentSlide.content || "").replace(/&nbsp;/g, " ");
    let html = marked.parse(raw, { breaks: true, gfm: true }) as string;
    // Merge bold tag split across word boundary
    html = html.replace(/<strong>(\w)<\/strong>(\w+)/gi, "<strong>$1$2</strong>");
    // Strip duplicate title heading if present
    const titlePattern = new RegExp(
      `^<h[12][^>]*>${currentSlide.title}<\\/h[12]>`,
      "i"
    );
    return html.replace(titlePattern, "");
  }, [currentSlide.content, currentSlide.title]);

  const imgBoxClass =
    "rounded-[20px] overflow-hidden bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1),0_0_0_1px_rgba(226,232,240,0.6)] aspect-[16/10] flex items-center justify-center transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] animate-slideIn";

  const codeRight =
    currentSlide.code_snippet &&
    (currentSlide.code_position === "right" ||
      currentSlide.layout_type === "full-code");

  return (
    <div
      className={`
        min-h-full py-20 px-[60px] md:px-[120px] flex gap-16 items-center justify-center w-full mx-auto animate-slideIn
        ${codeRight ? "flex-row" : "flex-col"}
        ${currentSlide.layout_type === "full-code" ? "max-w-full p-10 flex-row" : ""}
        ${currentSlide.layout_type === "centered" ? "text-center md:px-[160px]" : ""}
      `}
      key={currentSlide.id}
    >
      {/* ── Text + Images column ── */}
      <div
        className={`flex-1 flex flex-col justify-center gap-12 w-full ${currentSlide.layout_type === "full-code" ? "flex-[0_0_40%]" : ""}`}
      >
        {/* TOP images */}
        {(currentSlide.image_position === "top" ||
          currentSlide.secondary_image_position === "top") && (
          <div className="flex gap-6 mb-8 w-full justify-center">
            {currentSlide.image_position === "top" && currentSlide.image && (
              <div
                className={imgBoxClass}
                style={{ width: `${currentSlide.image_width || 100}%` }}
              >
                <img
                  src={img(currentSlide.image)}
                  alt=""
                  className="w-[90%] h-[90%] object-contain"
                />
              </div>
            )}
            {currentSlide.secondary_image_position === "top" &&
              currentSlide.secondary_image && (
                <div
                  className={imgBoxClass}
                  style={{
                    width: `${currentSlide.secondary_image_width || 100}%`,
                  }}
                >
                  <img
                    src={img(currentSlide.secondary_image)}
                    alt=""
                    className="w-[90%] h-[90%] object-contain"
                  />
                </div>
              )}
          </div>
        )}

        {/* Grid row: LEFT image | Text | RIGHT image */}
        <div
          className={`
            grid gap-12 items-center w-full
            ${currentSlide.layout_type === "split" ? "grid-cols-2" : "grid-cols-1 md:grid-cols-[1.2fr_0.8fr]"}
            ${currentSlide.layout_type === "centered" ? "flex flex-col items-center text-center" : ""}
          `}
        >
          {/* LEFT images */}
          {(currentSlide.image_position === "left" ||
            currentSlide.secondary_image_position === "left") && (
            <div className="flex flex-col gap-6 min-w-0 order-first md:order-none">
              {currentSlide.image_position === "left" &&
                currentSlide.image && (
                  <div
                    className={imgBoxClass}
                    style={{ width: `${currentSlide.image_width || 100}%` }}
                  >
                    <img
                      src={img(currentSlide.image)}
                      alt=""
                      className="w-[90%] h-[90%] object-contain"
                    />
                  </div>
                )}
              {currentSlide.secondary_image_position === "left" &&
                currentSlide.secondary_image && (
                  <div
                    className={imgBoxClass}
                    style={{
                      width: `${currentSlide.secondary_image_width || 100}%`,
                    }}
                  >
                    <img
                      src={img(currentSlide.secondary_image)}
                      alt=""
                      className="w-[90%] h-[90%] object-contain"
                    />
                  </div>
                )}
            </div>
          )}

          {/* Rich-text content */}
          <div className="min-w-0 w-full overflow-hidden">
            <div
              className={`
                text-[20px] leading-[1.8] text-slate-800 font-[450] text-left break-words
                ${isFullscreen ? "text-[26px]" : ""}
                ${currentSlide.layout_type === "centered" ? "text-center" : ""}
                [&_p]:mb-4
                [&_h1]:text-slate-900 [&_h1]:font-extrabold [&_h1]:tracking-tight [&_h1]:mb-6 [&_h1]:text-3xl
                [&_h2]:text-slate-900 [&_h2]:font-extrabold [&_h2]:tracking-tight [&_h2]:mb-6 [&_h2]:text-2xl
                [&_strong]:font-bold [&_strong]:text-inherit
                [&_ul]:pl-10 [&_ul]:my-6 [&_ul]:list-disc [&_ul_li]:marker:text-indigo-500 [&_ul_li]:marker:text-[1.1em]
                [&_ol]:pl-10 [&_ol]:my-6 [&_ol]:list-decimal [&_ol_li]:marker:text-indigo-500 [&_ol_li]:marker:font-bold
                [&_li]:mb-4 [&_li]:text-left [&_li]:pl-2
                [&_.ql-indent-1]:pl-8 [&_.ql-indent-2]:pl-16 [&_.ql-indent-3]:pl-24 
                [&_.ql-indent-4]:pl-32 [&_.ql-indent-5]:pl-40 [&_.ql-indent-6]:pl-48 
                [&_.ql-indent-7]:pl-56 [&_.ql-indent-8]:pl-64
                [&_.ql-align-center]:text-center
                [&_.ql-align-right]:text-right
                [&_.ql-align-justify]:text-justify
              `}
              dangerouslySetInnerHTML={{ __html: renderedContent }}
            />
          </div>

          {/* RIGHT images */}
          {(currentSlide.image_position === "right" ||
            currentSlide.secondary_image_position === "right") && (
            <div className="flex flex-col gap-6 min-w-0 items-center justify-center">
              {currentSlide.image_position === "right" &&
                currentSlide.image && (
                  <div
                    className={imgBoxClass}
                    style={{ width: `${currentSlide.image_width || 100}%` }}
                  >
                    <img
                      src={img(currentSlide.image)}
                      alt=""
                      className="w-[90%] h-[90%] object-contain"
                    />
                  </div>
                )}
              {currentSlide.secondary_image_position === "right" &&
                currentSlide.secondary_image && (
                  <div
                    className={imgBoxClass}
                    style={{
                      width: `${currentSlide.secondary_image_width || 100}%`,
                    }}
                  >
                    <img
                      src={img(currentSlide.secondary_image)}
                      alt=""
                      className="w-[90%] h-[90%] object-contain"
                    />
                  </div>
                )}
            </div>
          )}
        </div>

        {/* BOTTOM images */}
        {(currentSlide.image_position === "bottom" ||
          currentSlide.secondary_image_position === "bottom") && (
          <div className="flex gap-6 mt-8 w-full justify-center">
            {currentSlide.image_position === "bottom" &&
              currentSlide.image && (
                <div
                  className={imgBoxClass}
                  style={{ width: `${currentSlide.image_width || 100}%` }}
                >
                  <img
                    src={img(currentSlide.image)}
                    alt=""
                    className="w-[90%] h-[90%] object-contain"
                  />
                </div>
              )}
            {currentSlide.secondary_image_position === "bottom" &&
              currentSlide.secondary_image && (
                <div
                  className={imgBoxClass}
                  style={{
                    width: `${currentSlide.secondary_image_width || 100}%`,
                  }}
                >
                  <img
                    src={img(currentSlide.secondary_image)}
                    alt=""
                    className="w-[90%] h-[90%] object-contain"
                  />
                </div>
              )}
          </div>
        )}

        {/* Code — bottom position */}
        {currentSlide.code_snippet &&
          currentSlide.code_position === "bottom" &&
          currentSlide.layout_type !== "full-code" && (
            <CodeSnippet currentSlide={currentSlide} isFullscreen={isFullscreen} />
          )}
      </div>

      {/* ── Code — right / full-code position ── */}
      {codeRight && (
        <div className="flex-[0_0_48%] flex flex-col min-h-[500px]">
          <CodeSnippet currentSlide={currentSlide} isFullscreen={isFullscreen} />
        </div>
      )}
    </div>
  );
}

// ── CodeSnippet ─────────────────────────────────────────────────────────────
function CodeSnippet({
  currentSlide,
  isFullscreen,
}: {
  currentSlide: Slide;
  isFullscreen: boolean;
}) {
  const theme = currentSlide.code_theme || "terminal";

  return (
    <div
      className={`
        rounded-[20px] overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.35),0_0_0_1px_rgba(255,255,255,0.05)]
        flex flex-col flex-1 border border-white/5
        ${theme === "terminal" ? "bg-slate-900 text-slate-200" : ""}
        ${theme === "editor" ? "bg-[#1e1e1e] text-[#d4d4d4]" : ""}
        ${theme === "browser" ? "bg-white text-slate-700 border-slate-200" : ""}
      `}
    >
      {/* Window chrome */}
      <div
        className={`h-12 flex items-center px-5 gap-5 ${theme === "browser" ? "bg-slate-50 border-b border-slate-200" : "bg-black/20"}`}
      >
        {theme !== "editor" && (
          <div className="flex gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[0_0_8px_rgba(255,95,86,0.3)]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[0_0_8px_rgba(255,189,46,0.3)]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[0_0_8px_rgba(39,201,63,0.3)]" />
          </div>
        )}
        <div
          className={`flex items-center gap-2.5 text-[12px] font-bold tracking-wider opacity-60 ${theme === "browser" ? "text-slate-500" : "text-slate-400"}`}
        >
          {theme === "browser" ? (
            <Globe size={14} />
          ) : theme === "terminal" ? (
            <Terminal size={14} />
          ) : (
            <Code2 size={14} />
          )}
          <span>
            {theme === "browser"
              ? "localhost:3000"
              : theme === "terminal"
              ? "bash"
              : "editor.tsx"}
          </span>
        </div>
      </div>

      <pre
        className={`m-0 p-8 font-mono leading-[1.8] overflow-x-auto whitespace-pre-wrap ${isFullscreen ? "text-[20px]" : "text-[15px]"}`}
      >
        <code>{currentSlide.code_snippet}</code>
      </pre>
    </div>
  );
}
