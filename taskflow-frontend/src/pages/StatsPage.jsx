import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProjectStats, getProjectById } from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "./ProjectsPage.css";

function StatsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectRes] = await Promise.all([
          getProjectStats(id),
          getProjectById(id),
        ]);
        setStats(statsRes.data);
        setProject(projectRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout title="Project Statistics" activeItem="projects">
        <div className="projects-page">
          <div className="empty-state">
            <h4>Loading statistics...</h4>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!stats || !project) {
    return (
      <DashboardLayout title="Project Statistics" activeItem="projects">
        <div className="projects-page">
          <div className="empty-state">
            <h4>Failed to load statistics</h4>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const notStartedTasks =
    stats.totalTasks - stats.completedTasks - stats.inProgressTasks;
  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  return (
    <DashboardLayout
      title="Project Statistics"
      activeItem="projects"
      subtitle={`Projects / ${project.name} / Statistics`}
    >
      <div className="projects-page project-detail-page">
        <section className="project-detail-hero">
          <div className="project-detail-heading">
            <p className="projects-eyebrow">
              Projects / {project.name} / Statistics
            </p>
            <div className="project-detail-title-row">
              <h2>Project Statistics</h2>
              <span
                className={`project-state-chip ${
                  completionRate === 100
                    ? "completed"
                    : completionRate > 0
                    ? "active"
                    : "queued"
                }`}
              >
                {completionRate === 100 ? "Completed" : completionRate > 0 ? "On Track" : "Planning"}
              </span>
            </div>
            <p className="project-detail-description">
              Overview and performance metrics for {project.name}.
            </p>
          </div>

          <div className="project-detail-actions">
            <button
              type="button"
              className="task-action-btn"
              onClick={() => navigate(`/projects/${id}`)}
            >
              Back to Project
            </button>
          </div>
        </section>

        <section className="project-detail-summary">
          <article className="project-summary-card">
            <span>Total Tasks</span>
            <strong>{stats.totalTasks}</strong>
          </article>
          <article className="project-summary-card">
            <span>Completed</span>
            <strong>{stats.completedTasks}</strong>
          </article>
          <article className="project-summary-card">
            <span>In Progress</span>
            <strong>{stats.inProgressTasks}</strong>
          </article>
          <article className="project-summary-card">
            <span>Not Started</span>
            <strong>{notStartedTasks >= 0 ? notStartedTasks : 0}</strong>
          </article>
        </section>

        <section
          className="project-detail-summary"
          style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}
        >
          <article
            className="project-summary-card"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2.5rem 2rem",
            }}
          >
            <span style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              Completion Rate
            </span>
            <strong
              style={{
                fontSize: "3.5rem",
                color: completionRate === 100 ? "#20944f" : "#17325c",
                lineHeight: "1",
              }}
            >
              {completionRate}%
            </strong>
            <div
              style={{
                width: "100%",
                backgroundColor: "#e4ecf8",
                height: "12px",
                borderRadius: "6px",
                marginTop: "1.5rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${completionRate}%`,
                  backgroundColor:
                    completionRate === 100 ? "#20944f" : "#2968d8",
                  height: "100%",
                  borderRadius: "6px",
                  transition: "width 0.5s ease-in-out",
                }}
              ></div>
            </div>
          </article>

          <article className="project-summary-card" style={{ padding: "1.5rem" }}>
            <h3
              style={{
                margin: "0 0 1.25rem 0",
                color: "#102a54",
                fontSize: "1.2rem",
              }}
            >
              Team Performance
            </h3>
            {stats.perMember && stats.perMember.length > 0 ? (
              <div style={{ display: "grid", gap: "0.85rem" }}>
                {stats.perMember.map((m, i) => {
                  const initials =
                    m.memberName
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase())
                      .join("") || "NA";

                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.85rem 1rem",
                        backgroundColor: "#ffffff",
                        borderRadius: "12px",
                        border: "1px solid #edf2fa",
                        boxShadow: "0 2px 8px rgba(148, 163, 184, 0.05)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.85rem",
                        }}
                      >
                        <span
                          className="project-avatar"
                          style={{
                            width: "36px",
                            height: "36px",
                            fontSize: "0.85rem",
                          }}
                        >
                          {initials}
                        </span>
                        <strong
                          style={{ color: "#17325c", fontSize: "0.95rem" }}
                        >
                          {m.memberName}
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-end",
                          gap: "0.2rem",
                        }}
                      >
                        <span style={{ fontSize: "0.75rem", color: "#8797b1" }}>
                          Tasks Done
                        </span>
                        <span
                          className="task-chip completed"
                          style={{ padding: "0.25rem 0.6rem", fontSize: "0.8rem" }}
                        >
                          {m.completedTasks}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                <p>No team data available for this project.</p>
              </div>
            )}
          </article>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default StatsPage;