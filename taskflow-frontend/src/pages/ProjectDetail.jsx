import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { deleteProject, deleteTask, getProjectById, getProjectTasks } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import DashboardLayout from "../components/DashboardLayout";
import TaskDetailPage from "./TaskDetailPage";
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
  const canInteractWithTasks = user?.canInteractWithTasks ?? true;
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedTaskDetailId, setSelectedTaskDetailId] = useState(null);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setActiveDropdown(null);
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

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
        startDate: projectData.startDate || startDate,
        endDate: projectData.endDate || endDate,
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

  const handleDeleteTask = async (taskId) => {
    const confirmed = window.confirm(
      "Delete this task and all of its comments and attachments? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteTask(taskId);
      await fetchProject();
    } catch (err) {
      console.error(err);
      window.alert("Failed to delete the task. Please try again.");
    }
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      "Delete this project and all related tasks, comments, and attachments? This cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteProject(id);
      navigate("/projects");
    } catch (err) {
      console.error(err);
      window.alert("Failed to delete the project. Please try again.");
    }
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

          <div className="project-detail-actions" style={{ alignItems: 'center' }}>
            {user?.role === "ProjectManager" && (
              <button
                type="button"
                className="create-btn"
                disabled={!canInteractWithTasks}
                style={{ opacity: canInteractWithTasks ? 1 : 0.55, cursor: canInteractWithTasks ? 'pointer' : 'not-allowed' }}
                onClick={() => setShowCreateModal(true)}
              >
                Add Task
              </button>
            )}

            {(user?.role === "ProjectManager" || user?.role === "Admin" || user?.role === 0) && (
              <div className="project-dropdown-container" style={{ position: "relative" }}>
                <button
                  type="button"
                  className="task-action-btn icon-btn permission-locked-control"
                  style={{ padding: '0.85rem', display: 'flex', alignItems: 'center' }}
                  disabled={!canInteractWithTasks}
                  onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === 'project-actions' ? null : 'project-actions'); }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="2"></circle>
                    <circle cx="12" cy="5" r="2"></circle>
                    <circle cx="12" cy="19" r="2"></circle>
                  </svg>
                </button>

                {activeDropdown === 'project-actions' && (
                  <div className="task-dropdown-menu">
                    <button
                      type="button"
                      className="dropdown-item permission-locked-control"
                      onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); navigate(`/projects/${id}/stats`); }}
                    >
                      View Statistics
                    </button>
                    {user?.role === "ProjectManager" && (
                      <button
                        type="button"
                        className="dropdown-item danger permission-locked-control"
                        onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDeleteProject(); }}
                        disabled={!canInteractWithTasks}
                      >
                        Delete Project
                      </button>
                    )}
                  </div>
                )}
              </div>
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
                <article key={task.id} className="project-task-row" onClick={() => setSelectedTaskDetailId(task.id)}>
                  <div className="project-task-main">
                    <h3 className="project-task-title">
                      {task.title}
                    </h3>
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
                    <button
                      type="button"
                      className="task-action-btn permission-locked-control"
                      onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}/attachments`); }}
                      disabled={!canInteractWithTasks}
                    >
                      Files
                    </button>
                    {user?.role === "ProjectManager" && (
                      <div className="task-dropdown-container" style={{ position: "relative" }}>
                        <button
                          type="button"
                          className="task-action-btn icon-btn permission-locked-control"
                          style={{ padding: '0.55rem', display: 'flex', alignItems: 'center' }}
                          disabled={!canInteractWithTasks}
                          onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === task.id ? null : task.id); }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="2"></circle>
                            <circle cx="12" cy="5" r="2"></circle>
                            <circle cx="12" cy="19" r="2"></circle>
                          </svg>
                        </button>

                        {activeDropdown === task.id && (
                          <div className="task-dropdown-menu">
                            <button
                              type="button"
                              className="dropdown-item permission-locked-control"
                              onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleEditClick(task); }}
                              disabled={!canInteractWithTasks}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="dropdown-item danger permission-locked-control"
                              onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); handleDeleteTask(task.id); }}
                              disabled={!canInteractWithTasks}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
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
        projectEndDate={project.endDate}
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

      {selectedTaskDetailId && (
        <TaskDetailPage
          taskId={selectedTaskDetailId}
          onClose={() => {
            setSelectedTaskDetailId(null);
            fetchProject(); // refresh task stats just in case!
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ProjectDetail;
