import { useState, useEffect } from "react";
import { getProjects, createProject } from "../services/api";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import "./ProjectsPage.css";

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // 🔥 fetch projects
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getProjects();
        setProjects(data || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 🔥 create project (FIXED ✅)
  const handleCreate = async (newProject) => {
    try {
      const created = await createProject(newProject);
      setProjects([created, ...projects]);
    } catch (err) {
      console.log(err);
    }
  };

  // 👇 role
  const role = localStorage.getItem("role") || "ProjectManager";

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
          <button className="create-btn" onClick={() => setShowModal(true)}>
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
        onCreate={handleCreate} // ✅ FIXED
      />
    </div>
  );
};

export default ProjectsPage;
