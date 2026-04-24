import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { getProjectById, getProjectTasks } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import DashboardLayout from "../components/DashboardLayout";
import "./ProjectsPage.css";
import { useNavigate } from "react-router-dom";

const formatDate = (value) => {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleDateString([], {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getInitials = (value) => {
  if (!value) {
    return "NA";
  }

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const getStatusTone = (status) => {
  if (status === "Done") {
    return "completed";
  }

  if (status === "InProgress") {
    return "active";
  }

  return "queued";
};

const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const normalizeTask = (task) => ({
    id: task?.id ?? task?.Id,
    title: task?.title ?? task?.Title ?? "Untitled",
    description: task?.description ?? task?.Description ?? "",
    priority: task?.priority ?? task?.Priority ?? "Low",
    status: task?.status ?? task?.Status ?? "ToDo",
    dueDate: task?.dueDate ?? task?.DueDate ?? null,
    assignedUserId: task?.assignedUserId ?? task?.AssignedUserId ?? null,
    assignedUserName: task?.assignedUserName ?? task?.AssignedUserName ?? "",
  });

  const deriveSchedule = (tasks) => {
    const datedTasks = tasks
      .map((task) => task.dueDate)
      .filter(Boolean)
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a - b);

    return {
      startDate: datedTasks[0]?.toISOString() ?? null,
      endDate: datedTasks[datedTasks.length - 1]?.toISOString() ?? null,
    };
  };

  const fetchProject = async () => {
    try {
      const [projectData, projectTasks] = await Promise.all([
        getProjectById(id),
        getProjectTasks(id),
      ]);

      const normalizedTasks = Array.isArray(projectTasks)
        ? projectTasks.map(normalizeTask)
        : [];
      const completedTasks = normalizedTasks.filter((task) => task.status === "Done").length;
      const inProgressTasks = normalizedTasks.filter(
        (task) => task.status === "InProgress",
      ).length;
      const { startDate, endDate } = deriveSchedule(normalizedTasks);

      setProject({
        ...projectData,
        tasks: normalizedTasks,
        taskCount: normalizedTasks.length,
        completedTasks,
        inProgressTasks,
        startDate,
        endDate,
      });
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <DashboardLayout title="Project" activeItem="projects">
        <div className="projects-page">
          <div className="empty-state">
            <h4>Loading project...</h4>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Project" activeItem="projects">
        <div className="projects-page">
          <div className="empty-state">
            <h4>Project not found</h4>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const projectState = project.taskCount
    ? project.completedTasks === project.taskCount
      ? "Completed"
      : project.inProgressTasks > 0
        ? "On Track"
        : "Queued"
    : "Planning";

  return (
    <DashboardLayout
      title="Projects"
      activeItem="projects"
      subtitle={`Projects / ${project.name}`}
    >
      <div className="projects-page project-detail-page">
        <section className="project-detail-hero">
          <div className="project-detail-heading">
            <p className="projects-eyebrow">Projects / {project.name}</p>
            <div className="project-detail-title-row">
              <h2>{project.name}</h2>
              <span className={`project-state-chip ${getStatusTone(projectState === "On Track" ? "InProgress" : projectState === "Completed" ? "Done" : "ToDo")}`}>
                {projectState}
              </span>
            </div>
            <p className="project-detail-description">
              {project.description || "No description has been added for this project yet."}
            </p>
          </div>

          <div className="project-detail-actions">
            <button
              type="button"
              className="dashboard-link-btn"
              onClick={() => navigate(`/projects/${id}/stats`)}
            >
              View Statistics
            </button>

            {user?.role === "ProjectManager" && (
              <button
                className="create-btn"
                onClick={() => setShowCreateModal(true)}
              >
                Add Task
              </button>
            )}
          </div>
        </section>

        <section className="project-detail-summary">
          <article className="project-summary-card">
            <span>Start Date</span>
            <strong>{formatDate(project.startDate)}</strong>
          </article>
          <article className="project-summary-card">
            <span>End Date</span>
            <strong>{formatDate(project.endDate)}</strong>
          </article>
          <article className="project-summary-card">
            <span>Total Tasks</span>
            <strong>{project.taskCount}</strong>
          </article>
          <article className="project-summary-card">
            <span>Completed</span>
            <strong>{project.completedTasks}</strong>
          </article>
        </section>

        <section className="project-task-shell">
          <div className="project-task-head">
            <span>Task</span>
            <span>Dates</span>
            <span>Status</span>
            <span>Owner</span>
            <span>Actions</span>
          </div>

          {project.tasks && project.tasks.length > 0 ? (
            <div className="project-task-list">
              {project.tasks.map((task) => (
                <article key={task.id} className="project-task-row">
                  <div className="project-task-main">
                    <button
                      type="button"
                      className="project-task-title"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      {task.title}
                    </button>
                    <p className="project-task-subtitle">
                      {task.description || "No task description provided."}
                    </p>
                  </div>

                  <div className="project-task-date-group">
                    <div>
                      <span>Start</span>
                      <strong>{formatDate(project.startDate)}</strong>
                    </div>
                    <div>
                      <span>Due</span>
                      <strong>{formatDate(task.dueDate)}</strong>
                    </div>
                  </div>

                  <div className="project-task-status-group">
                    <span className={`task-chip ${getStatusTone(task.status)}`}>
                      {task.status === "InProgress" ? "In Progress" : task.status}
                    </span>
                    <span className="task-chip priority">{task.priority}</span>
                  </div>

                  <div className="project-task-owner">
                    <span className="project-avatar">
                      {getInitials(task.assignedUserName || "Unassigned")}
                    </span>
                    <div>
                      <span>Assignee</span>
                      <strong>{task.assignedUserName || "Unassigned"}</strong>
                    </div>
                  </div>

                  <div className="project-task-actions">
                    {user?.role === "ProjectManager" && (
                      <button
                        type="button"
                        className="task-action-btn"
                        onClick={() => handleEditClick(task)}
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      className="task-action-btn"
                      onClick={() => navigate(`/tasks/${task.id}`)}
                    >
                      Open
                    </button>
                    <button
                      type="button"
                      className="task-action-btn"
                      onClick={() => navigate(`/tasks/${task.id}/attachments`)}
                    >
                      Files
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <h4>No tasks in this project yet</h4>
            </div>
          )}
        </section>
      </div>

      <CreateTaskModal
        show={showCreateModal}
        handleClose={() => setShowCreateModal(false)}
        projectId={id}
        onTaskCreated={fetchProject}
      />

      <EditTaskModal
        show={showEditModal}
        handleClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        projectId={id}
        task={selectedTask}
        onTaskUpdated={fetchProject}
      />
    </DashboardLayout>
  );
};

export default ProjectDetail;
