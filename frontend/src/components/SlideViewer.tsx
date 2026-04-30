"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";

export default function SlideViewer({ slides }: { slides: any[] }) {
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

  // Sync fullscreen state with document state
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
      viewerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (!slides || slides.length === 0) return <div>No slides available.</div>;

  const currentSlide = slides[currentIndex];

  return (
    <div className={`slide-viewer ${isFullscreen ? 'is-fullscreen' : ''}`} ref={viewerRef}>
      <div className="slide-header">
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span className={`badge badge-${currentSlide.type === 'code' ? 'indigo' : 'emerald'}`} style={{ padding: '4px 12px', fontSize: '10px' }}>
              {currentSlide.type.toUpperCase()}
            </span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-secondary)', padding: '2px 8px', borderRadius: '4px' }}>
              Slide {currentIndex + 1} of {slides.length}
            </span>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'var(--border)' }} />
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{currentSlide.title}</h3>
        </div>
        <button 
          className="btn btn-ghost" 
          style={{ width: '40px', height: '40px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>

      <div 
        className="slide-content animate-slideIn" 
        key={currentSlide.id}
        style={{
          display: 'flex',
          flexDirection: 
            currentSlide.code_position === 'right' ? 'row' : 'column',
          gap: isFullscreen ? '64px' : '48px',
          alignItems: currentSlide.code_position === 'right' ? 'stretch' : 'center'
        }}
      >
        {/* Main Content Area (Text + Optional Image) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
          <div 
            style={{ 
              display: 'flex',
              flexDirection: 
                currentSlide.image_position === 'top' ? 'column' :
                currentSlide.image_position === 'bottom' ? 'column-reverse' :
                currentSlide.image_position === 'left' ? 'row' : 'row-reverse',
              gap: isFullscreen ? '48px' : '32px',
              alignItems: (currentSlide.image_position === 'left' || currentSlide.image_position === 'right') ? 'center' : 'stretch'
            }}
          >
            {currentSlide.image && (
              <div style={{ 
                flex: (currentSlide.image_position === 'left' || currentSlide.image_position === 'right') ? `0 0 ${currentSlide.image_width || 50}%` : 'none',
                width: (currentSlide.image_position === 'top' || currentSlide.image_position === 'bottom') ? `${currentSlide.image_width || 100}%` : 'auto',
                margin: (currentSlide.image_position === 'top' || currentSlide.image_position === 'bottom') ? '0 auto' : '0',
                borderRadius: '24px', 
                overflow: 'hidden', 
                boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 0 0 1px var(--border)',
                maxHeight: (currentSlide.image_position === 'top' || currentSlide.image_position === 'bottom') ? '450px' : 'none',
                transition: 'all 0.4s ease'
              }}>
                <img 
                  src={`${process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8080/storage'}/${currentSlide.image}`} 
                  alt={currentSlide.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', background: '#f8fafc' }} 
                />
              </div>
            )}
            <div style={{ flex: 1, maxWidth: (currentSlide.image_position === 'top' || currentSlide.image_position === 'bottom') ? '900px' : 'none', margin: (currentSlide.image_position === 'top' || currentSlide.image_position === 'bottom') ? '0 auto' : '0' }}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({children}) => <h1 style={{ background: 'linear-gradient(135deg, var(--text-primary), var(--indigo))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{children}</h1>,
                  code({node, inline, className, children, ...props}: any) {
                    return (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    )
                  }
                }}
              >
                {currentSlide.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Code Snippet at Bottom */}
          {currentSlide.code_snippet && currentSlide.code_position === 'bottom' && (
             <div style={{ 
               marginTop: '32px', borderRadius: '16px', overflow: 'hidden', 
               background: currentSlide.code_theme === 'browser' ? '#ffffff' : currentSlide.code_theme === 'editor' ? '#1e1e1e' : '#0f172a',
               border: currentSlide.code_theme === 'browser' ? '1px solid #e2e8f0' : '1px solid #1e293b', 
               boxShadow: '0 10px 30px rgba(0,0,0,0.15)' 
             }}>
                <div style={{ 
                  padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', 
                  background: currentSlide.code_theme === 'browser' ? '#f1f5f9' : currentSlide.code_theme === 'editor' ? '#2d2d2d' : '#1e293b',
                  borderBottom: currentSlide.code_theme === 'browser' ? '1px solid #e2e8f0' : '1px solid #334155' 
                }}>
                   {currentSlide.code_theme !== 'editor' && (
                     <div style={{ display: 'flex', gap: '6px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} /><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} /><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                     </div>
                   )}
                   {currentSlide.code_theme === 'browser' ? (
                     <div style={{ flex: 1, margin: '0 16px', background: 'white', borderRadius: '6px', height: '24px', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid #e2e8f0' }}>
                       <span style={{ fontSize: '10px', color: '#94a3b8' }}>localhost:3000</span>
                     </div>
                   ) : (
                     <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: currentSlide.code_theme === 'editor' ? '0' : '12px', fontWeight: 600, letterSpacing: '0.05em' }}>
                       {currentSlide.code_theme === 'editor' ? 'editor.ts' : 'TERMINAL'}
                     </span>
                   )}
                </div>
                <pre style={{ 
                  padding: '24px', margin: 0, fontSize: isFullscreen ? '18px' : '14px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: '1.7',
                  color: currentSlide.code_theme === 'browser' ? '#334155' : '#e2e8f0'
                }}><code>{currentSlide.code_snippet}</code></pre>
             </div>
          )}
        </div>

        {/* Code Snippet on Right Side */}
        {currentSlide.code_snippet && currentSlide.code_position === 'right' && (
           <div style={{ 
             flex: '0 0 45%', borderRadius: '20px', overflow: 'hidden', display: 'flex', flexDirection: 'column',
             background: currentSlide.code_theme === 'browser' ? '#ffffff' : currentSlide.code_theme === 'editor' ? '#1e1e1e' : '#0f172a',
             border: currentSlide.code_theme === 'browser' ? '1px solid #e2e8f0' : '1px solid #1e293b', 
             boxShadow: '0 20px 50px rgba(0,0,0,0.15)'
           }}>
              <div style={{ 
                padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '8px', 
                background: currentSlide.code_theme === 'browser' ? '#f1f5f9' : currentSlide.code_theme === 'editor' ? '#2d2d2d' : '#1e293b',
                borderBottom: currentSlide.code_theme === 'browser' ? '1px solid #e2e8f0' : '1px solid #334155' 
              }}>
                 {currentSlide.code_theme !== 'editor' && (
                   <div style={{ display: 'flex', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} /><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} /><div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
                   </div>
                 )}
                 {currentSlide.code_theme === 'browser' ? (
                   <div style={{ flex: 1, margin: '0 16px', background: 'white', borderRadius: '6px', height: '24px', display: 'flex', alignItems: 'center', padding: '0 12px', border: '1px solid #e2e8f0' }}>
                     <span style={{ fontSize: '10px', color: '#94a3b8' }}>localhost:3000</span>
                   </div>
                 ) : (
                   <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: currentSlide.code_theme === 'editor' ? '0' : '12px', fontWeight: 600, letterSpacing: '0.05em' }}>
                     {currentSlide.code_theme === 'editor' ? 'editor.ts' : 'TERMINAL'}
                   </span>
                 )}
              </div>
              <pre style={{ 
                flex: 1, padding: '24px', margin: 0, fontSize: isFullscreen ? '18px' : '14px', fontFamily: 'monospace', overflowX: 'auto', lineHeight: '1.7',
                color: currentSlide.code_theme === 'browser' ? '#334155' : '#e2e8f0'
              }}><code>{currentSlide.code_snippet}</code></pre>
           </div>
        )}
      </div>

      <div className="slide-footer">
        <button 
          className="btn btn-ghost" 
          style={{ padding: '10px 16px', borderRadius: '12px' }}
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
        >
          <ChevronLeft size={18} /> Prev
        </button>
        
        <div className="slide-progress">
          {slides.map((_, idx) => (
            <div 
              key={idx} 
              className={`slide-dot ${idx === currentIndex ? "active" : ""}`}
              onClick={() => setCurrentIndex(idx)}
              title={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button 
          className="btn btn-primary" 
          style={{ padding: '10px 20px', borderRadius: '12px' }}
          onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, slides.length - 1))}
          disabled={currentIndex === slides.length - 1}
        >
          Next <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
