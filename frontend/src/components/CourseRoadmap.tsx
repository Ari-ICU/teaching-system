"use client";

import { CheckCircle2, Circle, Lock } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface RoadmapProps {
  course: any;
}

export default function CourseRoadmap({ course }: RoadmapProps) {
  const pathname = usePathname();

  if (!course) return null;

  return (
    <aside className="roadmap-aside">
      <div className="roadmap-header">
        <span className="badge badge-indigo" style={{ marginBottom: '8px' }}>CURRICULUM PATH</span>
        <h3>{course.title}</h3>
        <p>{course.modules?.length || 0} Modules • {Math.round(course.overall_progress || 0)}% Complete</p>
      </div>

      <div className="roadmap-content">
        <div className="roadmap-line"></div>
        
        {course.modules?.map((module: any, mIdx: number) => {
          const isModuleActive = pathname.includes(`/modules/${module.id}`);
          const isCompleted = mIdx === 0; // Placeholder for logic

          return (
            <div key={module.id} className={`roadmap-step ${isModuleActive ? 'active' : ''}`}>
              <div className="roadmap-node">
                {isCompleted ? (
                  <CheckCircle2 size={18} color="var(--emerald)" fill="white" />
                ) : isModuleActive ? (
                  <div className="active-node-outer">
                    <div className="active-node-inner"></div>
                  </div>
                ) : (
                  <Circle size={18} color="var(--text-muted)" />
                )}
              </div>
              
              <div className="roadmap-info">
                <Link href={`/modules/${module.id}`} className="roadmap-module-title">
                  {module.title}
                </Link>
                
                {isModuleActive && (
                  <div className="roadmap-lessons">
                    {module.lessons?.map((lesson: any, lIdx: number) => {
                      const isLessonActive = pathname.includes(`/lessons/${lesson.id}`);
                      return (
                        <Link 
                          key={lesson.id} 
                          href={`/lessons/${lesson.id}`}
                          className={`roadmap-lesson-item ${isLessonActive ? 'active' : ''}`}
                        >
                          <div className="lesson-dot"></div>
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

      <style jsx>{`
        .roadmap-aside {
          width: 320px;
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(10px);
          border-left: 1px solid var(--border);
          padding: 40px 24px;
          height: calc(100vh - 64px);
          position: sticky;
          top: 0;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .roadmap-aside::-webkit-scrollbar {
          width: 4px;
        }

        .roadmap-aside::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 10px;
        }

        @media (max-width: 1200px) {
          .roadmap-aside {
            width: 100%;
            height: auto;
            position: relative;
            border-left: none;
            border-top: 1px solid var(--border);
            background: transparent;
            backdrop-filter: none;
            padding: 40px 0;
          }
        }

        .roadmap-header {
          margin-bottom: 40px;
        }

        .roadmap-header h3 {
          font-size: 20px;
          font-weight: 800;
          margin-bottom: 8px;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .roadmap-header p {
          font-size: 13px;
          color: var(--text-muted);
          font-weight: 500;
        }

        .roadmap-content {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 40px;
        }

        .roadmap-line {
          position: absolute;
          left: 10px;
          top: 12px;
          bottom: 12px;
          width: 2px;
          background: linear-gradient(to bottom, var(--indigo), var(--border));
          opacity: 0.3;
          z-index: 0;
        }

        .roadmap-step {
          display: flex;
          gap: 20px;
          position: relative;
          z-index: 1;
          transition: all 0.2s ease;
        }

        .roadmap-node {
          background: var(--bg-primary);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          margin-top: 2px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .active-node-outer {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: var(--indigo-light);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 15px var(--indigo-light);
        }

        .active-node-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--indigo);
        }

        .roadmap-info {
          flex: 1;
        }

        .roadmap-module-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-secondary);
          text-decoration: none;
          display: block;
          margin-bottom: 12px;
          transition: color 0.2s;
        }

        .roadmap-step.active .roadmap-module-title {
          color: var(--indigo);
        }

        .roadmap-step:hover .roadmap-module-title {
          color: var(--indigo);
        }

        .roadmap-lessons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 16px;
          padding-left: 6px;
          border-left: 2px solid var(--bg-secondary);
        }

        .roadmap-lesson-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 13px;
          color: var(--text-muted);
          text-decoration: none;
          transition: all 0.2s;
          padding: 4px 0;
        }

        .roadmap-lesson-item:hover {
          color: var(--text-primary);
          transform: translateX(4px);
        }

        .roadmap-lesson-item.active {
          color: var(--indigo);
          font-weight: 700;
        }

        .lesson-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--border);
          transition: all 0.2s;
        }

        .roadmap-lesson-item.active .lesson-dot {
          background: var(--indigo);
          box-shadow: 0 0 8px var(--indigo-light);
          transform: scale(1.3);
        }
      `}</style>
    </aside>
  );
}
