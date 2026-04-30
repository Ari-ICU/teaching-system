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
    <div className="page">
      <Link href="/admin/slides" className="btn btn-ghost" style={{ marginBottom: '24px' }}>
        <ArrowLeft size={16} /> Back to Lessons
      </Link>

      <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="page-title">Slides: {lesson.title}</h1>
          <p className="page-subtitle">Manage slides for this specific lesson.</p>
        </div>
        <Link href={`/admin/slides/${lesson.id}/new`} className="btn btn-primary">
          <Plus size={16} /> New Slide
        </Link>
      </header>

      <SlideTable initialSlides={slides} lessonId={lessonId} />
    </div>
  );
}
