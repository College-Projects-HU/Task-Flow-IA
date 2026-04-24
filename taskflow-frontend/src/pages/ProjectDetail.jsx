import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import { getProjectById, getProjectTasks } from "../services/api";
import { AuthContext } from "../context/AuthContext";
import CreateTaskModal from "../components/CreateTaskModal";
import EditTaskModal from "../components/EditTaskModal";
import "./ProjectsPage.css";
import FileAttachments from "../components/FileAttachments";
import { useNavigate } from "react-router-dom";
const ProjectDetail = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
   const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modals state
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

  const fetchProject = async () => {
    try {
      const [projectData, projectTasks] = await Promise.all([
        getProjectById(id),
        getProjectTasks(id),
      ]);

      const normalizedTasks = Array.isArray(projectTasks)
        ? projectTasks.map(normalizeTask)
        : [];

      setProject({
        ...projectData,
        tasks: normalizedTasks,
        taskCount: normalizedTasks.length,
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

  // loading
  if (loading) {
    return (
      <div className="projects-page text-white text-center">
        <h4>Loading...</h4>
      </div>
    );
  }

  // not found
  if (!project) {
    return (
      <div className="projects-page text-white text-center">
        <h3>Project not found 😢</h3>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="container text-white py-4">

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2>{project.name}</h2>
          {user?.role === "ProjectManager" && (
            <button
              className="btn btn-light fw-bold"
              onClick={() => setShowCreateModal(true)}
            >
              + Add Task
            </button>
          )}
        </div>

        <p>{project.description}</p>

        <div className="mt-4 mb-4">
          <p>📌 Tasks: {project.tasks?.length || project.taskCount}</p>
          <p>📅 Created: {project.createdAt}</p>
        </div>

        {/* Temporary tasks list for context/editing testing */}
        {project.tasks && project.tasks.length > 0 && (
          <div className="card bg-dark text-white border-light p-3 shadow-sm">
            <h4 className="mb-3">Tasks</h4>
            <ul className="list-group list-group-flush">
              {project.tasks.map((t) => (
  <li
    key={t.id}
    className="list-group-item bg-dark text-white border-secondary"
  >
    <div className="d-flex justify-content-between align-items-center">
      
      <div>
        <h6 className="mb-1 fw-semibold">
          {t.title}
          <span className="badge bg-secondary ms-2">
            {t.priority}
          </span>
          <span className="badge bg-info ms-1">
            {t.status}
          </span>
        </h6>

        {t.dueDate && (
          <small className="text-muted d-block">
            Due: {new Date(t.dueDate).toLocaleDateString()}
          </small>
        )}

        {t.assignedUserName && (
          <small className="text-muted d-block">
            Assigned to: {t.assignedUserName}
          </small>
        )}
      </div>

      {user?.role === "ProjectManager" && (
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => handleEditClick(t)}
        >
          Edit
        </button>
      )}
    </div>

    {/* 🔥 Attachments Component */}
  <button
  className="btn btn-sm btn-outline-info ms-2"
  onClick={() => navigate(`/tasks/${t.id}/attachments`)}
>
  Attachments
</button>

<button
  className="btn btn-primary mt-2"
  onClick={() => navigate(`/tasks/${t.id}`)}
>
  💬 Comments
</button>
<button
  className="btn btn-dark mt-3"
  onClick={() => navigate(`/projects/${id}/stats`)}
>
  📊 View Statistics
</button>
  </li>
))}
            </ul>
          </div>
        )}

      </div>
      
      {/* Modals */}
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
    </div>
  );
};

export default ProjectDetail;