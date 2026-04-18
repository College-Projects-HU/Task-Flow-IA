import { useState, useEffect } from "react";
import { getProjects, createProject } from "../services/api";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import { getRoleFromToken } from "../utils/decodeToken";
import "./ProjectsPage.css";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 🔥 GET projects from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        console.log("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔥 CREATE project via API
  const handleCreate = async (newProject) => {
    try {
      const created = await createProject(newProject);

      // 👇 مهم جدًا: backend بيرجع project بدون taskCount
      setProjects((prev) => [
        {
          ...created,
          taskCount: 0,
          createdAt: new Date().toISOString().split("T")[0],
        },
        ...prev,
      ]);
    } catch (err) {
      console.log("Error creating project:", err);
    }
  };

  // 🔐 role
  const role = getRoleFromToken();

  // 🔄 loading
  if (loading) {
    return (
      <div className="projects-page text-center text-white">
        <h4>Loading...</h4>
      </div>
    );
  }

  return (
    <div className="projects-page">
      {/* 🔥 Header */}
      <div className="projects-header">
        <h2 className="projects-title">Projects</h2>

        {role === "ProjectManager" && (
          <button
            className="create-btn"
            onClick={() => setShowModal(true)}
          >
            + Create Project
          </button>
        )}
      </div>

      {/* 📭 Empty */}
      {projects.length === 0 ? (
        <div className="empty-state">
          <h4>No projects yet 😢</h4>
        </div>
      ) : (
        <div className="row">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}

      {/* 🔥 Modal */}
      <CreateProjectModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        onCreate={handleCreate}
      />
    </div>
  );
};

export default ProjectsPage;