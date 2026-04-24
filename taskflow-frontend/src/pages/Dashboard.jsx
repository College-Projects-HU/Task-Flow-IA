import { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";
import api, { getProjects, getProjectTasks } from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError("");

        const fetchedProjects = await getProjects();
        setProjects(fetchedProjects);

        const taskResults = await Promise.allSettled(
          fetchedProjects.map((project) => getProjectTasks(project.id))
        );

        const mergedTasks = taskResults.flatMap((result) =>
          result.status === "fulfilled" && Array.isArray(result.value)
            ? result.value
            : []
        );
        setAllTasks(mergedTasks);

        if (user.role === "Admin") {
          const pendingRes = await api.get("/admin/pending-users");
          setPendingUsers(Array.isArray(pendingRes.data) ? pendingRes.data : []);
        } else {
          setPendingUsers([]);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const statusCounts = useMemo(() => {
    const counts = { ToDo: 0, InProgress: 0, Done: 0 };

    allTasks.forEach((task) => {
      if (counts[task.status] !== undefined) {
        counts[task.status] += 1;
      }
    });

    return counts;
  }, [allTasks]);

  const memberTasks = useMemo(
    () => allTasks.filter((task) => task.assignedUserId === user?.id),
    [allTasks, user?.id]
  );

  const memberCompleted = memberTasks.filter((task) => task.status === "Done").length;
  const memberInProgress = memberTasks.filter(
    (task) => task.status === "InProgress"
  ).length;

  const totalTasks = allTasks.length;
  const completionRate = totalTasks
    ? Math.round((statusCounts.Done / totalTasks) * 100)
    : 0;

  const kpis = {
    Admin: [
      { label: "Total Projects", value: projects.length },
      { label: "Total Tasks", value: totalTasks },
      { label: "Completed", value: statusCounts.Done },
      { label: "Pending PM Approvals", value: pendingUsers.length },
    ],
    ProjectManager: [
      { label: "Projects", value: projects.length },
      { label: "Total Tasks", value: totalTasks },
      { label: "In Progress", value: statusCounts.InProgress },
      { label: "Completion Rate", value: `${completionRate}%` },
    ],
    Member: [
      { label: "Assigned To You", value: memberTasks.length },
      { label: "Your In Progress", value: memberInProgress },
      { label: "Your Completed", value: memberCompleted },
      {
        label: "Your Completion",
        value: memberTasks.length
          ? `${Math.round((memberCompleted / memberTasks.length) * 100)}%`
          : "0%",
      },
    ],
  };

  const role = user?.role || "Member";
  const activeKpis = kpis[role] || kpis.Member;

  const statusData =
    role === "Member"
      ? {
          ToDo: memberTasks.filter((task) => task.status === "ToDo").length,
          InProgress: memberInProgress,
          Done: memberCompleted,
        }
      : statusCounts;

  const statusTotal = statusData.ToDo + statusData.InProgress + statusData.Done;
  const todoPct = statusTotal ? (statusData.ToDo / statusTotal) * 100 : 0;
  const progressPct = statusTotal ? (statusData.InProgress / statusTotal) * 100 : 0;
  const donePct = statusTotal ? (statusData.Done / statusTotal) * 100 : 0;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <h4>Loading dashboard...</h4>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard"
      activeItem="dashboard"
      subtitle={`Welcome ${user?.name || user?.email} (${role})`}
    >
        {error && <div className="dashboard-error">{error}</div>}

        <section className="dashboard-kpis">
          {activeKpis.map((kpi) => (
            <article key={kpi.label} className="dashboard-card dashboard-kpi">
              <p>{kpi.label}</p>
              <h3>{kpi.value}</h3>
            </article>
          ))}
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <div className="dashboard-card-header">
              <h4>{role === "Member" ? "My Task Status" : "Task Status"}</h4>
            </div>
            <div
              className="dashboard-donut"
              style={{
                background: `conic-gradient(
                  #ef4444 0% ${todoPct}%,
                  #38bdf8 ${todoPct}% ${todoPct + progressPct}%,
                  #14b8a6 ${todoPct + progressPct}% 100%
                )`,
              }}
            />
            <div className="dashboard-legend">
              <span>To Do: {statusData.ToDo}</span>
              <span>In Progress: {statusData.InProgress}</span>
              <span>Done: {statusData.Done}</span>
            </div>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-header">
              <h4>Performance</h4>
            </div>
            <div className="dashboard-bars">
              <div>
                <label>To Do</label>
                <div className="bar-track">
                  <div style={{ width: `${todoPct}%` }} className="bar-fill todo"></div>
                </div>
              </div>
              <div>
                <label>In Progress</label>
                <div className="bar-track">
                  <div
                    style={{ width: `${progressPct}%` }}
                    className="bar-fill in-progress"
                  ></div>
                </div>
              </div>
              <div>
                <label>Done</label>
                <div className="bar-track">
                  <div style={{ width: `${donePct}%` }} className="bar-fill done"></div>
                </div>
              </div>
            </div>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-card-header">
              <h4>Projects Overview</h4>
            </div>
            {projects.length === 0 ? (
              <p className="dashboard-muted">No projects yet.</p>
            ) : (
              <ul className="dashboard-list">
                {projects.slice(0, 5).map((project) => (
                  <li key={project.id}>
                    <span>{project.name}</span>
                    <small>{project.taskCount} tasks</small>
                  </li>
                ))}
              </ul>
            )}
          </article>

          {role === "Admin" ? (
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <h4>Pending Project Managers</h4>
                <Link to="/admin" className="dashboard-link-btn">
                  Manage
                </Link>
              </div>
              {pendingUsers.length === 0 ? (
                <p className="dashboard-muted">No pending approvals.</p>
              ) : (
                <ul className="dashboard-list">
                  {pendingUsers.slice(0, 5).map((pendingUser) => (
                    <li key={pendingUser.id}>
                      <span>{pendingUser.fullName}</span>
                      <small>{pendingUser.email}</small>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ) : (
            <article className="dashboard-card">
              <div className="dashboard-card-header">
                <h4>Quick Actions</h4>
              </div>
              <div className="dashboard-actions">
                <Link to="/Projects" className="dashboard-link-btn">
                  View Projects
                </Link>
                {role === "ProjectManager" && (
                  <Link to="/Projects" className="dashboard-link-btn">
                    Create Project
                  </Link>
                )}
              </div>
            </article>
          )}
        </section>
    </DashboardLayout>
  );
}
