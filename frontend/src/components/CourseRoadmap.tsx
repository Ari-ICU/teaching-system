"use client";

import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface RoadmapProps {
  course: any;
}

export default function CourseRoadmap({ course }: RoadmapProps) {
  const pathname = usePathname();

  if (!course) return null;

  return (
    <aside className={`
      w-[320px] bg-white/40 backdrop-blur-md border-l border-slate-200 p-10 px-6 
      h-screen sticky top-0 overflow-y-auto flex flex-col shrink-0 transition-all
      scrollbar-thin scrollbar-thumb-slate-200 hover:scrollbar-thumb-slate-300
      xl:w-[320px] lg:w-[280px] md:w-full md:h-auto md:relative md:border-l-0 md:border-t md:bg-transparent md:backdrop-blur-none md:py-10 md:px-0
    `}>
      <div className="mb-10">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-indigo-100 text-indigo-700 mb-2">CURRICULUM PATH</span>
        <h3 className="text-xl font-extrabold text-slate-900 mb-2 tracking-tight">{course.title}</h3>
        <p className="text-xs font-medium text-slate-500">{course.modules?.length || 0} Modules • {Math.round(course.overall_progress || 0)}% Complete</p>
      </div>

      <div className="relative flex flex-col gap-10">
        <div className="absolute left-[10px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-indigo-500 to-slate-200 opacity-30 z-0"></div>
        
        {course.modules?.map((module: any, mIdx: number) => {
          const isModuleActive = pathname.includes(`/modules/${module.id}`);
          const isCompleted = mIdx === 0; // Placeholder for logic

          return (
            <div key={module.id} className="flex gap-5 relative z-10 group transition-all">
              <div className="bg-white flex items-center justify-center w-[22px] h-[22px] mt-0.5 rounded-full shrink-0">
                {isCompleted ? (
                  <CheckCircle2 size={18} className="text-emerald-500 fill-white" />
                ) : isModuleActive ? (
                  <div className="w-[22px] h-[22px] rounded-full bg-indigo-100 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                  </div>
                ) : (
                  <Circle size={18} className="text-slate-300" />
                )}
              </div>
              
              <div className="flex-1">
                <Link 
                  href={`/modules/${module.id}`} 
                  className={`text-[15px] font-bold no-underline block mb-3 transition-colors ${isModuleActive ? 'text-indigo-600' : 'text-slate-700 hover:text-indigo-600'}`}
                >
                  {module.title}
                </Link>
                
                {isModuleActive && (
                  <div className="flex flex-col gap-3 mt-4 pl-1.5 border-l-2 border-slate-100">
                    {module.lessons?.map((lesson: any) => {
                      const isLessonActive = pathname.includes(`/lessons/${lesson.id}`);
                      return (
                        <Link 
                          key={lesson.id} 
                          href={`/lessons/${lesson.id}`}
                          className={`flex items-center gap-3 text-[13px] no-underline transition-all py-1 ${isLessonActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900 hover:translate-x-1'}`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full transition-all ${isLessonActive ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] scale-125' : 'bg-slate-200'}`}></div>
                          <span>{lesson.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
