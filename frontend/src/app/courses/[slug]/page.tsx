"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, PlayCircle, Loader2, BookOpen, Layers } from "lucide-react";
import ModuleIcon from "@/components/ModuleIcon";
import { useAuth } from "@/context/AuthContext";

export default function CourseDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { token } = useAuth();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setIsLoading(true);

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost/api";

        const res = await fetch(`${apiUrl}/courses/${slug}`, {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const data = await res.json();
        setCourse(data.data);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) fetchCourseDetails();
  }, [slug, token]);

  // ✅ Loading UI
  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  // ❌ Not found
  if (!course) {
    return (
      <div className="p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <BookOpen size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Course not found</h2>
        <Link href="/courses" className="text-indigo-600 font-bold hover:underline">
          Back to all courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-10 lg:p-12">
      <header className="space-y-6">
        <nav className="flex items-center gap-2 text-sm font-bold text-slate-400">
          <Link href="/" className="hover:text-slate-900 transition-colors">
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link href="/courses" className="hover:text-slate-900 transition-colors">
            Courses
          </Link>
          <ChevronRight size={14} />
          <span className="text-indigo-600">
            {course.title}
          </span>
        </nav>

        <div className="space-y-4 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {course.title}
          </h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
            {course.description || "Explore the modules in this curriculum package."}
          </p>
        </div>
      </header>

      <div className="mt-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 bg-indigo-500 rounded-full" />
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Curriculum Modules
          </h2>
        </div>

        <div className="space-y-6">
          {course.modules?.map((module: any, index: number) => {
            const hasLessons = module.lessons && module.lessons.length > 0;
            return (
              <div
                key={module.id}
                className="bg-white border border-slate-200 rounded-[32px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-6">
                    <div
                      className="w-16 h-16 rounded-[20px] flex items-center justify-center shrink-0 shadow-lg"
                      style={{ backgroundColor: module.color || "#6366f1" }}
                    >
                      <ModuleIcon
                        icon={module.icon}
                        imageUrl={module.image}
                        size={32}
                        color="white"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
                        {index + 1}. {module.title}
                      </h3>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {module.lessons?.length || 0} Lessons in this module
                      </p>
                    </div>
                  </div>

                  <Link
                    href={hasLessons ? `/lessons/${module.lessons[0].id}` : "#"}
                    className={`
                      inline-flex items-center justify-center gap-2 px-8 py-3 rounded-2xl font-bold text-sm transition-all
                      ${hasLessons 
                        ? 'bg-white border border-slate-200 text-slate-900 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 shadow-sm' 
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
                    `}
                  >
                    {hasLessons ? "Start Learning" : "Coming Soon"} 
                    <ChevronRight size={16} />
                  </Link>
                </div>

                <div className="px-6 md:px-8 py-4 bg-white divide-y divide-slate-50">
                  {hasLessons ? (
                    module.lessons.map((lesson: any) => (
                      <Link
                        key={lesson.id}
                        href={`/lessons/${lesson.id}`}
                        className="group flex items-center justify-between py-4 hover:pl-2 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            <PlayCircle size={18} />
                          </div>
                          <span className="text-sm md:text-base font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="hidden md:block text-xs font-bold text-slate-400">
                            {lesson.duration || "20 min"}
                          </span>
                          <span className="px-3 py-1 bg-slate-50 text-slate-400 text-[10px] font-black rounded-lg uppercase tracking-wider group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                            {lesson.slides_count || 0} slides
                          </span>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-sm font-medium text-slate-400 italic">No lessons published in this module yet.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
