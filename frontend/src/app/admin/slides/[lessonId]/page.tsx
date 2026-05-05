import Link from "next/link";
import { ArrowLeft, Plus, Edit } from "lucide-react";
import { Slide, Lesson } from "@/lib/api";
import DeleteSlideButton from "@/components/admin/DeleteSlideButton";
import SlideTable from "@/components/admin/SlideTable";
import { notFound } from "next/navigation";

async function getSlidesData(lessonId: string) {
  try {
    const apiUrl = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost/api';
    
    // Fetch lesson details for the header
    const lessonRes = await fetch(`${apiUrl}/lessons/${lessonId}`, { cache: 'no-store' });
    if (!lessonRes.ok) throw new Error("Lesson not found");
    const lessonData = await lessonRes.json();

    // Fetch slides for this lesson
    const slidesRes = await fetch(`${apiUrl}/slides/lesson/${lessonId}`, { cache: 'no-store' });
    if (!slidesRes.ok) throw new Error("Failed to fetch slides");
    const slidesData = await slidesRes.json();

    return {
      lesson: lessonData.data as Lesson,
      slides: slidesData.data as Slide[]
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

export default async function AdminLessonSlidesPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params;
  const data = await getSlidesData(lessonId);

  if (!data) {
    notFound();
  }

  const { lesson, slides } = data;

  return (
    <div className="p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto">
      <Link 
        href="/admin/slides" 
        className="inline-flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors mb-8 font-medium"
      >
        <ArrowLeft size={16} /> Back to Lessons
      </Link>

      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">Slides: {lesson.title}</h1>
          <p className="text-slate-500 text-lg font-medium">Manage slides for this specific lesson.</p>
        </div>
        <Link 
          href={`/admin/slides/${lesson.id}/new`} 
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus size={18} /> New Slide
        </Link>
      </header>

      <div className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm">
        <SlideTable initialSlides={slides} lessonId={lessonId} />
      </div>
    </div>
  );
}
