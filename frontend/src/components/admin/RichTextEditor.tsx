"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200 border-dashed rounded-2xl text-slate-400 gap-3">
      <Loader2 className="animate-spin" size={24} />
      <span className="text-sm font-bold uppercase tracking-widest">Loading Editor...</span>
    </div>
  ),
});

const MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }, { size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
    [{ align: [] }],
    ["blockquote", "code-block"],
    ["link"],
    ["clean"],
  ],
};

const FORMATS = [
  "header", "size",
  "bold", "italic", "underline", "strike",
  "color", "background",
  "script",
  "list", "indent",
  "align",
  "blockquote", "code-block",
  "link",
];

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write your teaching content here...",
  minHeight = 420,
}: RichTextEditorProps) {
  return (
    <div className="rich-editor-root">
      <style>{`
        /* ── Quill container ── */
        .rich-editor-root .ql-container.ql-snow {
          border: none;
          font-family: inherit;
        }
        .rich-editor-root .ql-editor {
          min-height: ${minHeight}px;
          font-size: 16px;
          line-height: 1.8;
          color: #1e293b;
          padding: 20px 24px;
        }
        .rich-editor-root .ql-editor.ql-blank::before {
          color: #cbd5e1;
          font-style: italic;
          font-size: 15px;
        }

        /* ── Toolbar ── */
        .rich-editor-root .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid #f1f5f9;
          background: #f8fafc;
          padding: 10px 14px;
          border-radius: 20px 20px 0 0;
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          align-items: center;
        }
        .rich-editor-root .ql-snow .ql-formats {
          margin-right: 4px;
          display: flex;
          align-items: center;
          gap: 1px;
        }
        /* separator between format groups */
        .rich-editor-root .ql-snow .ql-formats:not(:last-child)::after {
          content: '';
          display: inline-block;
          width: 1px;
          height: 18px;
          background: #e2e8f0;
          margin-left: 6px;
        }

        /* ── Toolbar buttons ── */
        .rich-editor-root .ql-snow.ql-toolbar button,
        .rich-editor-root .ql-snow .ql-toolbar button {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s;
          color: #64748b;
        }
        .rich-editor-root .ql-snow.ql-toolbar button:hover,
        .rich-editor-root .ql-snow .ql-toolbar button:hover {
          background: #e2e8f0;
          color: #1e293b;
        }
        .rich-editor-root .ql-snow.ql-toolbar button.ql-active,
        .rich-editor-root .ql-snow .ql-toolbar button.ql-active {
          background: #eef2ff;
          color: #4f46e5;
        }
        .rich-editor-root .ql-snow .ql-stroke {
          stroke: currentColor;
        }
        .rich-editor-root .ql-snow .ql-fill {
          fill: currentColor;
        }

        /* ── Dropdowns (header, size, color, align) ── */
        .rich-editor-root .ql-snow .ql-picker {
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
        }
        .rich-editor-root .ql-snow .ql-picker-label {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 3px 8px;
          background: white;
          transition: all 0.15s;
        }
        .rich-editor-root .ql-snow .ql-picker-label:hover {
          border-color: #c7d2fe;
          background: #eef2ff;
          color: #4f46e5;
        }
        .rich-editor-root .ql-snow .ql-picker-options {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.08), 0 4px 10px -5px rgba(0,0,0,0.04);
          padding: 6px;
          background: white;
        }
        .rich-editor-root .ql-snow .ql-picker-item {
          border-radius: 8px;
          padding: 5px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
        }
        .rich-editor-root .ql-snow .ql-picker-item:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .rich-editor-root .ql-snow .ql-picker-item.ql-selected {
          background: #eef2ff;
          color: #4f46e5;
        }

        /* ── Color picker ── */
        .rich-editor-root .ql-color-picker .ql-picker-label svg,
        .rich-editor-root .ql-background .ql-picker-label svg {
          width: 16px;
          height: 16px;
        }

        /* ── Content typography ── */
        .rich-editor-root .ql-editor h1 { font-size: 2em; font-weight: 800; color: #0f172a; margin-bottom: 0.5em; }
        .rich-editor-root .ql-editor h2 { font-size: 1.5em; font-weight: 700; color: #1e293b; margin-bottom: 0.4em; }
        .rich-editor-root .ql-editor h3 { font-size: 1.25em; font-weight: 700; color: #334155; margin-bottom: 0.4em; }
        .rich-editor-root .ql-editor p  { margin-bottom: 0.75em; }
        .rich-editor-root .ql-editor blockquote {
          border-left: 4px solid #818cf8;
          background: #eef2ff;
          color: #4338ca;
          padding: 12px 20px;
          border-radius: 0 12px 12px 0;
          margin: 1em 0;
          font-style: italic;
        }
        .rich-editor-root .ql-editor pre.ql-syntax {
          background: #0f172a;
          color: #e2e8f0;
          border-radius: 12px;
          padding: 16px 20px;
          font-size: 13px;
          line-height: 1.7;
          overflow-x: auto;
        }
        .rich-editor-root .ql-editor ul,
        .rich-editor-root .ql-editor ol {
          padding-left: 1.5em;
          margin-bottom: 0.75em;
        }
        .rich-editor-root .ql-editor li { margin-bottom: 4px; }
        .rich-editor-root .ql-editor a { color: #4f46e5; text-decoration: underline; }
      `}</style>

      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={MODULES}
        formats={FORMATS}
      />
    </div>
  );
}
