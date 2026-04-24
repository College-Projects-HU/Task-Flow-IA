import { useContext, useState, useEffect } from "react";
import { getProjects, createProject } from "../services/api";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import "./ProjectsPage.css";

const ProjectsPage = () => {
  const { user } = useContext(AuthContext);
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
  const role = user?.role;

  // 🔄 loading
  // if (loading) {
  //   return (
  //     <div className="dashboard-loading">
  //       <h4>Loading projects...</h4>
  //     </div>
  //   );
  // }

  return (
    <DashboardLayout title="Projects" activeItem="projects">
      <div className="projects-page">
        <div className="projects-header">
          <h3 className="projects-title">Projects Workspace</h3>

          {role === "ProjectManager" && (
            <button className="create-btn" onClick={() => setShowModal(true)}>
              + Create Project
            </button>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <h4>No projects yet</h4>
          </div>
        ) : (
          <div className="row">
            {projects.map((p) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        )}

        <CreateProjectModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      </div>
    </DashboardLayout>
  );
};

export default ProjectsPage;