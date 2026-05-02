"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Terminal, Globe, Code2, ImageIcon, Info } from "lucide-react";
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

export default function SlideViewer({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [slides.length]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen();
    }
  };

  if (!slides || slides.length === 0) return (
    <div className="glass-card" style={{ padding: '40px', textAlign: 'center' }}>
      <Info size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
      <p>No slides available for this lesson.</p>
    </div>
  );

  const currentSlide = slides[currentIndex];
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage';

  return (
    <div className={`slide-viewer-container ${isFullscreen ? 'is-fullscreen' : ''}`} ref={viewerRef}>
      {/* Premium Header */}
      <div className="slide-viewer-header">
        <div className="slide-info">
          <div className="slide-type-badge">
            {currentSlide.type === 'practice' ? <Code2 size={12} /> : <Info size={12} />}
            <span>{currentSlide.type.toUpperCase()}</span>
          </div>
          <div className="slide-counter">
            Slide {currentIndex + 1} <span>/ {slides.length}</span>
          </div>
          <div className="header-divider" />
          <h2 className="slide-title">{currentSlide.title}</h2>
        </div>

        <button className="fullscreen-toggle" onClick={toggleFullscreen} title="Toggle Fullscreen">
          {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
        </button>
      </div>

      {/* Dynamic Content Area */}
      <div className="slide-viewport">
        <div
          className="slide-layout-engine animate-slideIn"
          key={currentSlide.id}
          data-layout={currentSlide.layout_type || 'standard'}
          data-code-pos={currentSlide.code_snippet ? currentSlide.code_position : 'none'}
        >
          {/* Main Content (Text + Images) */}
          <div className="main-content-area">
            {/* TOP SLOT IMAGES */}
            {(currentSlide.image_position === 'top' || currentSlide.secondary_image_position === 'top') && (
              <div style={{ display: 'flex', gap: '24px', marginBottom: '32px', width: '100%', justifyContent: 'center' }}>
                {currentSlide.image_position === 'top' && currentSlide.image && (
                  <div className="slide-image-wrapper animate-slideIn" style={{ width: `${currentSlide.image_width || 100}%` }}>
                    <img src={`${storageUrl}/${currentSlide.image}`} alt="" className="slide-img" />
                  </div>
                )}
                {currentSlide.secondary_image_position === 'top' && currentSlide.secondary_image && (
                  <div className="slide-image-wrapper animate-slideIn" style={{ width: `${currentSlide.secondary_image_width || 100}%` }}>
                    <img src={`${storageUrl}/${currentSlide.secondary_image}`} alt="" className="slide-img" />
                  </div>
                )}
              </div>
            )}

            <div
              className="content-layout-wrapper"
            >
              {/* LEFT SLOT IMAGES */}
              {(currentSlide.image_position === 'left' || currentSlide.secondary_image_position === 'left') && (
                <div className="side-images-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {currentSlide.image_position === 'left' && currentSlide.image && (
                    <div className="slide-image-wrapper animate-slideIn" style={{ width: `${currentSlide.image_width || 100}%`, transform: 'rotate(-1deg)' }}>
                      <img src={`${storageUrl}/${currentSlide.image}`} alt="" className="slide-img" />
                    </div>
                  )}
                  {currentSlide.secondary_image_position === 'left' && currentSlide.secondary_image && (
                    <div className="slide-image-wrapper animate-slideIn" style={{ width: `${currentSlide.secondary_image_width || 100}%`, transform: 'rotate(1deg)' }}>
                      <img src={`${storageUrl}/${currentSlide.secondary_image}`} alt="" className="slide-img" />
                    </div>
                  )}
                </div>
              )}

              {/* Textual Content Area */}
              <div className="text-content-wrapper">
                <div
                  className="prose-content"
                  dangerouslySetInnerHTML={{
                    __html: useMemo(() => {
                      // Ensure we have a string
                      const content = currentSlide.content || '';

                      // Parse markdown with modern options
                      // breaks: true allows single newlines to be rendered as <br>
                      // gfm: true enables GitHub Flavored Markdown (tables, tasklists, etc.)
                      let html = marked.parse(content, {
                        breaks: true,
                        gfm: true
                      }) as string;

                      // Fix common copy-paste issues where bold tags might be broken across words
                      html = html.replace(/<strong>(\w)<\/strong>(\w+)/gi, '<strong>$1$2</strong>');

                      // Filter out the title from the content if it's identical to the header title
                      // to avoid redundancy on the slide
                      const titlePattern = new RegExp(`^<h[12][^>]*>${currentSlide.title}<\/h[12]>`, 'i');
                      return html.replace(titlePattern, '');
                    }, [currentSlide.content, currentSlide.title])
                  }}
                />
              </div>

              {/* RIGHT SLOT IMAGES */}
              {(currentSlide.image_position === 'right' || currentSlide.secondary_image_position === 'right') && (
                <div className="side-images-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {currentSlide.image_position === 'right' && currentSlide.image && (
                    <div className="slide-image-wrapper animate-slideIn" style={{ width: `${currentSlide.image_width || 100}%`, transform: 'rotate(-1deg)' }}>
                      <img src={`${storageUrl}/${currentSlide.image}`} alt="" className="slide-img" />
                    </div>
                  )}
                  {currentSlide.secondary_image_position === 'right' && currentSlide.secondary_image && (
                    <div className="slide-image-wrapper animate-slideIn" style={{ width: `${currentSlide.secondary_image_width || 100}%`, transform: 'rotate(1deg)' }}>
                      <img src={`${storageUrl}/${currentSlide.secondary_image}`} alt="" className="slide-img" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* BOTTOM SLOT IMAGES */}
            {(currentSlide.image_position === 'bottom' || currentSlide.secondary_image_position === 'bottom') && (
              <div style={{ display: 'flex', gap: '24px', marginTop: '32px', width: '100%', justifyContent: 'center' }}>
                {currentSlide.image_position === 'bottom' && currentSlide.image && (
                  <div className="slide-image-wrapper animate-slideIn" style={{ width: `${currentSlide.image_width || 100}%` }}>
                    <img src={`${storageUrl}/${currentSlide.image}`} alt="" className="slide-img" />
                  </div>
                )}
                {currentSlide.secondary_image_position === 'bottom' && currentSlide.secondary_image && (
                  <div className="slide-image-wrapper animate-slideIn" style={{ width: `${currentSlide.secondary_image_width || 100}%` }}>
                    <img src={`${storageUrl}/${currentSlide.secondary_image}`} alt="" className="slide-img" />
                  </div>
                )}
              </div>
            )}

            {/* Code Snippet (Bottom Position) */}
            {currentSlide.code_snippet && currentSlide.code_position === 'bottom' && currentSlide.layout_type !== 'full-code' && (
              <CodeSnippet currentSlide={currentSlide} isFullscreen={isFullscreen} />
            )}
          </div>

          {/* Code Snippet (Side Position / Full Code) */}
          {currentSlide.code_snippet && (currentSlide.code_position === 'right' || currentSlide.layout_type === 'full-code') && (
            <div className="side-code-area">
              <CodeSnippet currentSlide={currentSlide} isFullscreen={isFullscreen} />
            </div>
          )}
        </div>
      </div>

      {/* Premium Footer Controls */}
      <div className="slide-viewer-footer">
        <button
          className="nav-btn prev"
          onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={24} />
          <span>Previous</span>
        </button>

        <div className="slide-pagination">
          {slides.map((_, idx) => (
            <button
              key={idx}
              className={`pagination-dot ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>

        <button
          className="nav-btn next"
          onClick={() => setCurrentIndex(prev => Math.min(prev + 1, slides.length - 1))}
          disabled={currentIndex === slides.length - 1}
        >
          <span>Next</span>
          <ChevronRight size={24} />
        </button>
      </div>

      <style jsx>{`
        .slide-viewer-container {
          --slide-bg: #ffffff;
          --slide-text: #1e293b;
          --slide-border: rgba(226, 232, 240, 0.6);
          --slide-accent: #6366f1;
          --slide-header-h: 60px;
          --slide-footer-h: 72px;
          --radius-lg: 32px;
          --radius-md: 20px;
          --shadow-premium: 0 30px 60px -12px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0,0,0,0.02);
          
          display: flex;
          flex-direction: column;
          background: var(--slide-bg);
          border-radius: var(--radius-lg);
          border: 1px solid var(--slide-border);
          overflow: hidden;
          position: relative;
          min-height: 680px;
          box-shadow: var(--shadow-premium);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .slide-viewer-container.is-fullscreen {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          border-radius: 0;
          z-index: 9999;
          margin: 0;
        }

        .slide-viewer-header {
          height: var(--slide-header-h);
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--slide-border);
          background: rgba(255, 255, 255, 0.5);
          backdrop-filter: blur(20px);
          z-index: 20;
        }

        .slide-info {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .slide-type-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 12px;
          background: var(--slide-accent);
          color: white;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
        }

        .slide-counter {
          font-size: 12px;
          font-weight: 700;
          color: #94a3b8;
        }

        .slide-counter span {
          opacity: 0.4;
        }

        .header-divider {
          width: 1px;
          height: 20px;
          background: var(--slide-border);
        }

        .slide-title {
          font-size: 15px;
          font-weight: 700;
          color: #64748b;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .fullscreen-toggle {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          border: none;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fullscreen-toggle:hover {
          background: #f1f5f9;
          color: var(--slide-accent);
        }

        .slide-viewport {
          flex: 1;
          position: relative;
          overflow-y: auto;
          background: radial-gradient(circle at top left, #ffffff 0%, #f8fafc 100%);
          scrollbar-width: thin;
          scrollbar-color: #e2e8f0 transparent;
        }

        .slide-layout-engine {
          min-height: 100%;
          padding: 80px 120px;
          display: flex;
          gap: 64px;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin: 0 auto;
        }

        /* Centered Layout */
        .slide-layout-engine[data-layout="centered"] {
          text-align: center;
          padding: 80px 160px;
        }

        .slide-layout-engine[data-layout="centered"] .content-layout-wrapper {
          display: flex !important;
          flex-direction: column !important;
          align-items: center;
          text-align: center;
        }

        /* Split Screen Layout */
        .slide-layout-engine[data-layout="split"] .content-layout-wrapper {
          grid-template-columns: 1fr 1fr !important;
          gap: 40px;
          width: 100%;
        }

        .slide-layout-engine[data-layout="split"] .text-content-wrapper,
        .slide-layout-engine[data-layout="split"] .side-images-wrapper {
          padding: 0;
        }

        /* Full Code Layout */
        .slide-layout-engine[data-layout="full-code"] .side-images-wrapper {
          display: none !important;
        }

        .slide-layout-engine[data-layout="full-code"] .main-content-area {
          flex: 0 0 40%;
        }

        .slide-layout-engine[data-code-pos="right"] {
          flex-direction: row;
        }

        .slide-layout-engine[data-code-pos="bottom"],
        .slide-layout-engine[data-code-pos="none"] {
          flex-direction: column;
          width: 100%;
          margin: 0 auto;
        }

        .slide-layout-engine[data-layout="full-code"] {
          flex-direction: row !important;
          max-width: 100% !important;
          padding: 40px;
        }

        .main-content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 48px;
          width: 100%;
        }

        .content-layout-wrapper {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 40px;
          align-items: center;
          width: 100%;
        }

        .text-content-wrapper {
          min-width: 0; /* Prevents grid blowout */
        }

        .side-images-wrapper {
          min-width: 0; /* Prevents grid blowout */
        }

        .slide-image-wrapper {
          border-radius: var(--radius-md);
          overflow: hidden;
          background: white;
          box-shadow: 0 20px 40px -15px rgba(0,0,0,0.1), 0 0 0 1px var(--slide-border);
          aspect-ratio: 16/10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .slide-image-wrapper:hover {
          transform: scale(1.02);
        }

        .slide-img {
          width: 90%;
          height: 90%;
          object-fit: contain;
        }

        .prose-content {
          font-size: 20px;
          line-height: 1.8;
          color: #1e293b;
          font-weight: 450;
          text-align: left;
        }

        .prose-content :global(p) {
          margin-bottom: 1em;
        }

        .prose-content :global(h1), .prose-content :global(h2) {
          color: #0f172a;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 24px;
          text-align: inherit;
        }

        .prose-content :global(strong) {
          font-weight: 700;
          color: inherit;
        }

        .prose-content :global(ul) {
          padding-left: 24px;
          margin: 16px 0;
          display: block;
          list-style-type: disc;
        }

        .prose-content :global(ol) {
          padding-left: 24px;
          margin: 16px 0;
          display: block;
          list-style-type: decimal;
        }

        .prose-content :global(li) {
          margin-bottom: 8px;
          color: inherit;
          text-align: left;
        }

        .prose-content :global(.ql-align-center) { text-align: center; }
        .prose-content :global(.ql-align-right) { text-align: right; }
        .prose-content :global(.ql-align-justify) { text-align: justify; }

        .is-fullscreen .prose-content {
          font-size: 26px;
        }

        .side-code-area {
          flex: 0 0 48%;
          display: flex;
          flex-direction: column;
          min-height: 500px;
        }

        .slide-viewer-footer {
          height: var(--slide-footer-h);
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--slide-border);
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          z-index: 20;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 28px;
          border-radius: 18px;
          border: 1px solid var(--slide-border);
          background: white;
          color: #475569;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .nav-btn:not(:disabled):hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
        }

        .nav-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
          filter: grayscale(1);
        }

        .nav-btn.next {
          background: linear-gradient(135deg, var(--slide-accent) 0%, #4f46e5 100%);
          color: white;
          border: none;
          box-shadow: 0 10px 25px -5px rgba(99, 102, 241, 0.4);
        }

        .nav-btn.next:not(:disabled):hover {
          background: white;
          color: #0f172a;
          border: 1px solid var(--slide-accent);
          box-shadow: 0 15px 35px -5px rgba(99, 102, 241, 0.3);
          transform: translateY(-2px) scale(1.02);
        }

        .slide-pagination {
          display: flex;
          gap: 12px;
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 100px;
        }

        .pagination-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #cbd5e1;
          border: none;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
        }

        .pagination-dot.active {
          width: 32px;
          border-radius: 100px;
          background: var(--slide-accent);
          box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(30px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .animate-slideIn {
          animation: slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

function CodeSnippet({ currentSlide, isFullscreen }: { currentSlide: Slide, isFullscreen: boolean }) {
  const theme = currentSlide.code_theme || 'terminal';

  return (
    <div className={`code-window theme-${theme}`}>
      <div className="code-header">
        {theme !== 'editor' && (
          <div className="window-dots">
            <span className="dot red" /><span className="dot yellow" /><span className="dot green" />
          </div>
        )}
        <div className="window-label">
          {theme === 'browser' ? <Globe size={14} /> : theme === 'terminal' ? <Terminal size={14} /> : <Code2 size={14} />}
          <span>{theme === 'browser' ? 'localhost:3000' : theme === 'terminal' ? 'bash' : 'editor.tsx'}</span>
        </div>
      </div>
      <pre className="code-body">
        <code>{currentSlide.code_snippet}</code>
      </pre>

      <style jsx>{`
        .code-window {
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 40px 80px -20px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
          display: flex;
          flex-direction: column;
          flex: 1;
          background: #0f172a;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .theme-terminal { background: #0f172a; color: #e2e8f0; }
        .theme-editor { background: #1e1e1e; color: #d4d4d4; }
        .theme-browser { background: #ffffff; color: #334155; border: 1px solid #e2e8f0; }

        .code-header {
          height: 48px;
          display: flex;
          align-items: center;
          padding: 0 20px;
          gap: 20px;
          background: rgba(0,0,0,0.2);
        }

        .theme-browser .code-header { background: #f8fafc; border-bottom: 1px solid #e2e8f0; }

        .window-dots {
          display: flex;
          gap: 10px;
        }

        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .red { background: #ff5f56; box-shadow: 0 0 8px rgba(255,95,86,0.3); }
        .yellow { background: #ffbd2e; box-shadow: 0 0 8px rgba(255,189,46,0.3); }
        .green { background: #27c93f; box-shadow: 0 0 8px rgba(39,201,63,0.3); }

        .window-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.05em;
          opacity: 0.6;
          color: #94a3b8;
        }

        .theme-browser .window-label { color: #64748b; }

        .code-body {
          margin: 0;
          padding: 32px;
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          font-size: ${isFullscreen ? '20px' : '15px'};
          line-height: 1.8;
          overflow-x: auto;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
}
