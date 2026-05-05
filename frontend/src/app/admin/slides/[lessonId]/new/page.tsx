"use client";

import { useState, use, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, X, Code2, Layout } from "lucide-react";
import DropdownSelect from "@/components/ui/DropdownSelect";

type ImageField = "image" | "secondary_image";

interface FormData {
  lesson_id: string;
  title: string;
  content: string;
  type: string;
  layout_type: string;
  code_snippet: string;
  code_position: string;
  code_theme: string;
  image_position: string;
  image_width: string;
  secondary_image_position: string;
  secondary_image_width: string;
}

export default function NewSlidePage({ params }: { params: Promise<{ lessonId: string }> }) {
  const resolvedParams = use(params);
  const lessonId = resolvedParams.lessonId;

  const [formData, setFormData] = useState<FormData>({
    lesson_id: lessonId,
    title: "",
    content: "",
    type: "concept",
    layout_type: "standard",
    code_snippet: "",
    code_position: "bottom",
    code_theme: "terminal",
    image_position: "right",
    image_width: "50",
    secondary_image_position: "right",
    secondary_image_width: "50",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [secondaryImageFile, setSecondaryImageFile] = useState<File | null>(null);
  const [secondaryImagePreview, setSecondaryImagePreview] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const secondaryImageInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const set = (key: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleImageChange = (field: ImageField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (field === "image") {
      setImageFile(file);
      setImagePreview(preview);
    } else {
      setSecondaryImageFile(file);
      setSecondaryImagePreview(preview);
    }
  };

  const clearImage = (field: ImageField) => {
    if (field === "image") {
      setImageFile(null);
      setImagePreview(null);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } else {
      setSecondaryImageFile(null);
      setSecondaryImagePreview(null);
      if (secondaryImageInputRef.current) secondaryImageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";
      const data = new FormData();

      // Append all text fields
      (Object.keys(formData) as (keyof FormData)[]).forEach((key) => {
        if (formData[key] !== "") data.append(key, formData[key]);
      });

      // Append image files if present
      if (imageFile) data.append("image", imageFile);
      if (secondaryImageFile) data.append("secondary_image", secondaryImageFile);

      const res = await fetch(`${apiUrl}/slides`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Failed to create slide");

      setStatus("success");
      alert("Slide created successfully!");
      window.location.href = `/admin/slides/${lessonId}`;
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const inputClass =
    "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none";
  const labelClass = "block text-sm font-bold text-slate-700 ml-1 mb-2";
  const sectionClass = "bg-white border border-slate-100 rounded-[28px] p-8 shadow-sm space-y-6";
  const sectionTitle = "text-base font-extrabold text-slate-800 tracking-tight mb-1";

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-8xl mx-auto">
      <Link
        href={`/admin/slides/${lessonId}`}
        className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mb-8 font-medium"
      >
        <ArrowLeft size={16} /> Back to Slides
      </Link>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
          Create New Slide
        </h1>
        <p className="text-slate-500 text-lg font-medium">Add a new slide to the lesson.</p>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* ── Basic Info ── */}
        <div className={sectionClass}>
          <p className={sectionTitle}>Basic Information</p>

          <div className="space-y-2">
            <label className={labelClass}>Slide Title</label>
            <input
              type="text"
              required
              placeholder="e.g., Introduction to React Components"
              className={inputClass}
              value={formData.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={labelClass}>Slide Type</label>
              <DropdownSelect
                options={[
                  { value: "concept", label: "Concept (Text/HTML)" },
                  { value: "practice", label: "Practice (Code/Interactive)" },
                  { value: "quiz", label: "Quiz (Multiple Choice)" },
                ]}
                value={formData.type}
                onChange={(v) => set("type", v)}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Layout Type</label>
              <DropdownSelect
                options={[
                  { value: "standard", label: "Standard" },
                  { value: "centered", label: "Centered" },
                  { value: "split", label: "Split (50/50)" },
                  { value: "full-code", label: "Full Code" },
                ]}
                value={formData.layout_type}
                onChange={(v) => set("layout_type", v)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Content (HTML / Markdown)</label>
            <textarea
              required
              placeholder="Write your slide content here..."
              className={`${inputClass} font-mono text-sm min-h-[260px] resize-vertical`}
              value={formData.content}
              onChange={(e) => set("content", e.target.value)}
            />
          </div>
        </div>

        {/* ── Primary Image ── */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon size={18} className="text-indigo-500" />
            <p className={sectionTitle + " mb-0"}>Primary Image</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Preview / Upload */}
            <div className="relative group shrink-0">
              <div className="w-40 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-colors group-hover:border-indigo-300">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon size={32} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
                )}
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange("image")}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
              </div>
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => clearImage("image")}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors z-20"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Position</label>
                <DropdownSelect
                  options={[
                    { value: "right", label: "Right" },
                    { value: "left", label: "Left" },
                    { value: "top", label: "Top" },
                    { value: "bottom", label: "Bottom" },
                  ]}
                  value={formData.image_position}
                  onChange={(v) => set("image_position", v)}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Width (%)</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  className={inputClass}
                  value={formData.image_width}
                  onChange={(e) => set("image_width", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Secondary Image ── */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon size={18} className="text-violet-500" />
            <p className={sectionTitle + " mb-0"}>Secondary Image</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="relative group shrink-0">
              <div className="w-40 h-28 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-colors group-hover:border-violet-300">
                {secondaryImagePreview ? (
                  <img src={secondaryImagePreview} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <ImageIcon size={32} className="text-slate-300 group-hover:text-violet-400 transition-colors" />
                )}
                <input
                  ref={secondaryImageInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange("secondary_image")}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
              </div>
              {secondaryImagePreview && (
                <button
                  type="button"
                  onClick={() => clearImage("secondary_image")}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors z-20"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelClass}>Position</label>
                <DropdownSelect
                  options={[
                    { value: "right", label: "Right" },
                    { value: "left", label: "Left" },
                    { value: "top", label: "Top" },
                    { value: "bottom", label: "Bottom" },
                  ]}
                  value={formData.secondary_image_position}
                  onChange={(v) => set("secondary_image_position", v)}
                />
              </div>
              <div className="space-y-2">
                <label className={labelClass}>Width (%)</label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  className={inputClass}
                  value={formData.secondary_image_width}
                  onChange={(e) => set("secondary_image_width", e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Code Snippet ── */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-2">
            <Code2 size={18} className="text-emerald-500" />
            <p className={sectionTitle + " mb-0"}>Code Snippet (Optional)</p>
          </div>

          <textarea
            placeholder="// Add example code here..."
            className={`${inputClass} font-mono text-sm min-h-[180px] resize-vertical`}
            value={formData.code_snippet}
            onChange={(e) => set("code_snippet", e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className={labelClass}>Code Position</label>
              <DropdownSelect
                options={[
                  { value: "bottom", label: "Bottom" },
                  { value: "right", label: "Right (side by side)" },
                ]}
                value={formData.code_position}
                onChange={(v) => set("code_position", v)}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Code Theme</label>
              <DropdownSelect
                options={[
                  { value: "terminal", label: "Terminal (dark)" },
                  { value: "editor", label: "Editor (VS Code)" },
                  { value: "browser", label: "Browser (light)" },
                ]}
                value={formData.code_theme}
                onChange={(v) => set("code_theme", v)}
              />
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex flex-col sm:flex-row justify-end gap-4 pt-2">
          <Link
            href={`/admin/slides/${lessonId}`}
            className="px-8 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            disabled={status === "loading"}
          >
            <Save size={18} />
            {status === "loading" ? "Creating Slide..." : "Save Slide"}
          </button>
        </div>

        {status === "error" && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium flex items-center gap-3">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            Failed to save the slide. Please try again.
          </div>
        )}
      </form>
    </div>
  );
}
