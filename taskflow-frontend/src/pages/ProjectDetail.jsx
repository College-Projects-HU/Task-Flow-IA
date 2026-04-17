import { useParams } from "react-router-dom";
import { projectsMock } from "../data/projectsMock";
import "./Projects/Project.css";

const ProjectDetail = () => {
  const { id } = useParams();

  // 👇 نجيب المشروع
  const project = projectsMock.find((p) => p.id === Number(id));

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