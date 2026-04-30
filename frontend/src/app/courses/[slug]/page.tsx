"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChevronRight, PlayCircle, Loader2 } from "lucide-react";
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
      <div
        className="page"
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "60px",
        }}
      >
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  // ❌ Not found
  if (!course) {
    return <div className="page">Course not found.</div>;
  }

  return (
    <div className="page">
      <header className="page-header">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "8px",
            color: "var(--text-muted)",
            fontSize: "13px",
            marginBottom: "16px",
          }}
        >
          <Link href="/" style={{ color: "inherit", textDecoration: "none" }}>
            Dashboard
          </Link>
          <ChevronRight size={14} />
          <Link
            href="/courses"
            style={{ color: "inherit", textDecoration: "none" }}
          >
            Courses
          </Link>
          <ChevronRight size={14} />
          <span
            style={{ color: "var(--text-primary)", fontWeight: 600 }}
          >
            {course.title}
          </span>
        </div>

        <h1 className="page-title responsive-title">
          {course.title}
        </h1>

        <p className="page-subtitle">
          {course.description ||
            "Explore the modules in this curriculum package."}
        </p>
      </header>

      <div style={{ marginTop: "40px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              width: "4px",
              height: "24px",
              background: "var(--indigo)",
              borderRadius: "2px",
            }}
          ></div>
          <h2 style={{ fontSize: "20px", fontWeight: 800 }}>
            Curriculum Modules
          </h2>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}
        >
          {course.modules?.map((module: any, index: number) => (
            <div
              key={module.id}
              className="glass-card animate-fadeInUp"
              style={{
                padding: "0",
                overflow: "hidden",
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <div className="module-header-row">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "14px",
                      background: module.color || "var(--indigo)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      boxShadow: "var(--shadow-md)",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        overflow: "hidden",
                      }}
                    >
                      <ModuleIcon
                        icon={module.icon}
                        imageUrl={module.image}
                      />
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
                      {index + 1}. {module.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "13px",
                        color: "var(--text-muted)",
                        fontWeight: 500,
                      }}
                    >
                      {module.lessons?.length || 0} Lessons in this
                      module
                    </p>
                  </div>
                </div>

                <Link
                  href={module.lessons && module.lessons.length > 0 
                    ? `/lessons/${module.lessons[0].id}` 
                    : "#"}
                  className={`btn ${module.lessons && module.lessons.length > 0 ? 'btn-ghost' : 'btn-disabled'}`}
                  style={{
                    border: "1px solid var(--border)",
                    background: "white",
                    opacity: module.lessons && module.lessons.length > 0 ? 1 : 0.5,
                    pointerEvents: module.lessons && module.lessons.length > 0 ? 'auto' : 'none'
                  }}
                >
                  {module.lessons && module.lessons.length > 0 ? "Start Learning" : "Coming Soon"} <ChevronRight size={16} />
                </Link>
              </div>

              <div className="lessons-list">
                {module.lessons && module.lessons.length > 0 ? (
                  module.lessons.map((lesson: any) => (
                    <Link
                      key={lesson.id}
                      href={`/lessons/${lesson.id}`}
                      className="lesson-row"
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <div className="play-icon-wrapper">
                          <PlayCircle size={18} />
                        </div>
                        <span className="lesson-title">
                          {lesson.title}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        <span className="lesson-meta">
                          {lesson.duration || "20 min"}
                        </span>
                        <span className="lesson-meta-badge">
                          {lesson.slides_count || 0} slides
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      color: "var(--text-muted)",
                      fontSize: "14px",
                    }}
                  >
                    No lessons published in this module yet.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .responsive-title {
          font-size: clamp(28px, 5vw, 40px);
        }
        .module-header-row {
          padding: 24px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0, 0, 0, 0.015);
          gap: 16px;
        }
        .lessons-list {
          padding: 8px 24px;
          background: white;
        }
        .lesson-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 0;
          border-bottom: 1px solid var(--border);
          text-decoration: none;
          color: inherit;
          transition: all 0.2s ease;
        }
        .lesson-row:last-child {
          border-bottom: none;
        }
        .lesson-row:hover {
          padding-left: 8px;
          color: var(--indigo);
        }
        .play-icon-wrapper {
          color: var(--text-muted);
          transition: color 0.2s ease;
        }
        .lesson-row:hover .play-icon-wrapper {
          color: var(--indigo);
        }
        .lesson-title {
          font-size: 14px;
          font-weight: 600;
        }
        .lesson-meta {
          font-size: 12px;
          color: var(--text-muted);
        }
        .lesson-meta-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 2px 8px;
          background: var(--bg-secondary);
          border-radius: 6px;
          color: var(--text-muted);
        }

        @media (max-width: 768px) {
          .module-header-row {
            flex-direction: column;
            align-items: flex-start;
            padding: 20px;
          }
          .module-header-row .btn {
            width: 100%;
            justify-content: center;
          }
          .lessons-list {
            padding: 8px 16px;
          }
          .lesson-meta {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}