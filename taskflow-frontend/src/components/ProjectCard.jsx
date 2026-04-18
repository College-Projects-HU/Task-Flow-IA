import { useNavigate } from "react-router-dom";
import "../pages/ProjectsPage.css";

const ProjectCard = ({ project }) => {
  const navigate = useNavigate();

  return (
    <div
      className="col-12 col-sm-6 col-md-4"
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{ cursor: "pointer" }}
    >
      <div className="card project-card h-100">
        <div className="card-body d-flex flex-column justify-content-between">
          {/* Top */}
          <div>
            <h5 className="project-title">{project.name}</h5>
            <p className="project-desc">
              {project.description || "No description provided"}
            </p>
          </div>

          {/* Bottom */}
          <div className="project-meta mt-3">
            <div>📌 Tasks: {project.taskCount || 0}</div>
            <div>📅 {project.createdAt}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
