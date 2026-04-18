import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProjectById } from "../services/api";
import "./ProjectsPage.css";

const ProjectDetail = () => {
  const { id } = useParams();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProjectById(id);
        setProject(data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  // 🔄 loading
  if (loading) {
    return (
      <div className="projects-page text-white text-center">
        <h4>Loading...</h4>
      </div>
    );
  }

  // ❌ not found
  if (!project) {
    return (
      <div className="projects-page text-white text-center">
        <h3>Project not found 😢</h3>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="container text-white">

        <h2 className="mb-3">{project.name}</h2>

        <p>{project.description}</p>

        <div className="mt-4">
          <p>📌 Tasks: {project.taskCount}</p>
          <p>📅 Created: {project.createdAt}</p>
        </div>

      </div>
    </div>
  );
};

export default ProjectDetail;