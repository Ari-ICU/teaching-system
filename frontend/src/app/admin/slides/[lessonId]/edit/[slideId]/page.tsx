"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Image as ImageIcon, X, Code2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import DropdownSelect from "@/components/ui/DropdownSelect";

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

type ImageField = "image" | "secondary_image";

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:8080/storage";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";

export default function EditSlidePage({
  params,
}: {
  params: Promise<{ lessonId: string; slideId: string }>;
}) {
  const resolvedParams = use(params);
  const { lessonId, slideId } = resolvedParams;
  const router = useRouter();

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

  // Primary image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [removePrimary, setRemovePrimary] = useState(false);

  // Secondary image
  const [secondaryImageFile, setSecondaryImageFile] = useState<File | null>(null);
  const [secondaryImagePreview, setSecondaryImagePreview] = useState<string | null>(null);
  const [currentSecondaryImage, setCurrentSecondaryImage] = useState<string | null>(null);
  const [removeSecondary, setRemoveSecondary] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const secondaryImageInputRef = useRef<HTMLInputElement>(null);

  const [status, setStatus] = useState<"loading_initial" | "idle" | "saving" | "error" | "not_found">(
    "loading_initial"
  );

  const set = (key: keyof FormData, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    fetchSlide();
  }, [slideId]);

  const fetchSlide = async () => {
    try {
      const res = await fetch(`${API_URL}/slides/${slideId}`);
      if (res.status === 404) { setStatus("not_found"); return; }
      if (!res.ok) throw new Error("Failed to fetch slide");

      const { data: s } = await res.json();
      setFormData({
        lesson_id: s.lesson_id?.toString() || lessonId,
        title: s.title || "",
        content: s.content || "",
        type: s.type || "concept",
        layout_type: s.layout_type || "standard",
        code_snippet: s.code_snippet || "",
        code_position: s.code_position || "bottom",
        code_theme: s.code_theme || "terminal",
        image_position: s.image_position || "right",
        image_width: s.image_width || "50",
        secondary_image_position: s.secondary_image_position || "right",
        secondary_image_width: s.secondary_image_width || "50",
      });

      if (s.image) setCurrentImage(`${STORAGE_URL}/${s.image}`);
      if (s.secondary_image) setCurrentSecondaryImage(`${STORAGE_URL}/${s.secondary_image}`);

      setStatus("idle");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  const handleImageChange = (field: ImageField) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    if (field === "image") {
      setImageFile(file);
      setImagePreview(preview);
      setRemovePrimary(false);
    } else {
      setSecondaryImageFile(file);
      setSecondaryImagePreview(preview);
      setRemoveSecondary(false);
    }
  };

  const clearImage = (field: ImageField) => {
    if (field === "image") {
      setImageFile(null);
      setImagePreview(null);
      setCurrentImage(null);
      setRemovePrimary(true);
      if (imageInputRef.current) imageInputRef.current.value = "";
    } else {
      setSecondaryImageFile(null);
      setSecondaryImagePreview(null);
      setCurrentSecondaryImage(null);
      setRemoveSecondary(true);
      if (secondaryImageInputRef.current) secondaryImageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("saving");

    try {
      const data = new FormData();
      data.append("_method", "PUT");

      // Append all text fields
      (Object.keys(formData) as (keyof typeof formData)[]).forEach((key) => {
        data.append(key, formData[key]);
      });

      // Images
      if (imageFile) data.append("image", imageFile);
      if (secondaryImageFile) data.append("secondary_image", secondaryImageFile);
      if (removePrimary) data.append("remove_image", "1");
      if (removeSecondary) data.append("remove_secondary_image", "1");

      const res = await fetch(`${API_URL}/slides/${slideId}`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) throw new Error("Failed to update slide");

      alert("Slide updated successfully!");
      router.push(`/admin/slides/${lessonId}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  // ── UI helpers ──────────────────────────────────────────────────────────
  const inputClass =
    "w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none";
  const labelClass = "block text-sm font-bold text-slate-700 ml-1 mb-2";
  const sectionClass = "bg-white border border-slate-100 rounded-[28px] p-8 shadow-sm space-y-6";
  const sectionTitle = "text-base font-extrabold text-slate-800 tracking-tight mb-1";

  // ── Loading / Not Found states ───────────────────────────────────────────
  if (status === "loading_initial") {
    return (
      <div className="min-h-[400px] flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={32} />
          <span className="font-medium">Loading slide content...</span>
        </div>
      </div>
    );
  }

  if (status === "not_found") {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-12 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Slide Not Found</h2>
        <Link
          href={`/admin/slides/${lessonId}`}
          className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
        >
          Go Back
        </Link>
      </div>
    );
  }

  // ── Reusable image uploader block ────────────────────────────────────────
  const ImageUploader = ({
    field,
    label,
    accentClass,
    inputRef,
    preview,
    current,
    positionKey,
    widthKey,
  }: {
    field: ImageField;
    label: string;
    accentClass: string;
    inputRef: React.RefObject<HTMLInputElement | null>;
    preview: string | null;
    current: string | null;
    positionKey: keyof FormData;
    widthKey: keyof FormData;
  }) => {
    const displaySrc = preview || current;
    return (
      <div className={sectionClass}>
        <div className="flex items-center gap-2 mb-1">
          <ImageIcon size={18} className={accentClass} />
          <p className={sectionTitle + " mb-0"}>{label}</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Thumbnail */}
          <div className="relative group shrink-0">
            <div
              className={`w-40 h-28 rounded-2xl bg-slate-50 border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors ${
                displaySrc ? "border-indigo-200" : "border-slate-200 group-hover:border-indigo-300"
              }`}
            >
              {displaySrc ? (
                <img src={displaySrc} alt="Preview" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon size={32} className="text-slate-300 group-hover:text-indigo-400 transition-colors" />
              )}
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="file"
                accept="image/*"
                onChange={handleImageChange(field)}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
            </div>
            {displaySrc && (
              <button
                type="button"
                onClick={() => clearImage(field)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors z-20"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Controls */}
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
                value={formData[positionKey] as string}
                onChange={(v) => set(positionKey, v)}
              />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Width (%)</label>
              <input
                type="number"
                min={10}
                max={100}
                className={inputClass}
                value={formData[widthKey] as string}
                onChange={(e) => set(widthKey, e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

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
          Edit Slide
        </h1>
        <p className="text-slate-500 text-lg font-medium">Update all slide content and layout settings.</p>
      </header>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* ── Basic Info ─────────────────────────────────── */}
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

        {/* ── Primary Image ──────────────────────────────── */}
        <ImageUploader
          field="image"
          label="Primary Image"
          accentClass="text-indigo-500"
          inputRef={imageInputRef}
          preview={imagePreview}
          current={currentImage}
          positionKey="image_position"
          widthKey="image_width"
        />

        {/* ── Secondary Image ────────────────────────────── */}
        <ImageUploader
          field="secondary_image"
          label="Secondary Image"
          accentClass="text-violet-500"
          inputRef={secondaryImageInputRef}
          preview={secondaryImagePreview}
          current={currentSecondaryImage}
          positionKey="secondary_image_position"
          widthKey="secondary_image_width"
        />

        {/* ── Code Snippet ───────────────────────────────── */}
        <div className={sectionClass}>
          <div className="flex items-center gap-2 mb-1">
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

        {/* ── Actions ────────────────────────────────────── */}
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
            disabled={status === "saving"}
          >
            <Save size={18} />
            {status === "saving" ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>

        {status === "error" && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-sm font-medium flex items-center gap-3">
            <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
            Failed to save changes. Please check your connection and try again.
          </div>
        )}
      </form>
    </div>
  );
}
