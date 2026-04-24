import { useNavigate } from "react-router-dom";
import "../pages/ProjectsPage.css";

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

const getProjectState = (project) => {
  if (!project.taskCount) {
    return { label: "Planning", tone: "planning" };
  }

  if (project.completedTasks === project.taskCount) {
    return { label: "Completed", tone: "completed" };
  }

  if (project.inProgressTasks > 0) {
    return { label: "On Track", tone: "active" };
  }

  return { label: "Queued", tone: "queued" };
};

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const state = getProjectState(project);

  return (
    <button
      type="button"
      className="project-row"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className="project-row-main">
        <div className="project-row-heading">
          <div>
            <p className="project-row-kicker">Project</p>
            <h3 className="project-row-title">{project.name}</h3>
          </div>
          <span className={`project-state-chip ${state.tone}`}>{state.label}</span>
        </div>

        <p className="project-row-description">
          {project.description || "No description provided for this project yet."}
        </p>
      </div>

      <div className="project-row-metrics">
        <div className="project-metric">
          <span className="project-metric-label">Start Date</span>
          <strong>{formatDate(project.startDate)}</strong>
        </div>
        <div className="project-metric">
          <span className="project-metric-label">End Date</span>
          <strong>{formatDate(project.endDate)}</strong>
        </div>
        <div className="project-metric">
          <span className="project-metric-label">Tasks</span>
          <strong>{project.taskCount || 0}</strong>
        </div>
        <div className="project-metric compact">
          <span className="project-metric-label">Progress</span>
          <strong>{project.progressLabel}</strong>
        </div>
        <div className="project-row-arrow" aria-hidden="true">
          View
        </div>
      </div>
    </button>
  );
};

export default ProjectCard;
