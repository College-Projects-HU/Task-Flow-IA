import { useContext, useState, useEffect } from "react";
import { getProjects, createProject, getProjectTasks } from "../services/api";
import ProjectCard from "../components/ProjectCard";
import CreateProjectModal from "../components/CreateProjectModal";
import { AuthContext } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import "./ProjectsPage.css";

const deriveSchedule = (tasks) => {
  const datedTasks = tasks
    .map((task) => task?.dueDate ?? task?.DueDate)
    .filter(Boolean)
    .map((value) => new Date(value))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => a - b);

  return {
    startDate: datedTasks[0]?.toISOString() ?? null,
    endDate: datedTasks[datedTasks.length - 1]?.toISOString() ?? null,
  };
};

const ProjectsPage = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseProjects = await getProjects();
        const taskResults = await Promise.allSettled(
          baseProjects.map((project) => getProjectTasks(project.id)),
        );

        const enrichedProjects = baseProjects.map((project, index) => {
          const tasks =
            taskResults[index]?.status === "fulfilled" && Array.isArray(taskResults[index].value)
              ? taskResults[index].value
              : [];
          const { startDate, endDate } = deriveSchedule(tasks);
          const completedTasks = tasks.filter(
            (task) => (task.status ?? task.Status) === "Done",
          ).length;
          const inProgressTasks = tasks.filter(
            (task) => (task.status ?? task.Status) === "InProgress",
          ).length;
          const taskCount = tasks.length;
          const progressLabel = taskCount
            ? `${Math.round((completedTasks / taskCount) * 100)}%`
            : "0%";

          return {
            ...project,
            taskCount,
            completedTasks,
            inProgressTasks,
            startDate,
            endDate,
            progressLabel,
          };
        });

        setProjects(enrichedProjects);
      } catch (err) {
        console.log("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCreate = async (newProject) => {
    try {
      const created = await createProject(newProject);
      setProjects((prev) => [
        {
          ...created,
          taskCount: 0,
          completedTasks: 0,
          inProgressTasks: 0,
          startDate: null,
          endDate: null,
          progressLabel: "0%",
        },
        ...prev,
      ]);
    } catch (err) {
      console.log("Error creating project:", err);
    }
  };

  const role = user?.role;
  const filteredProjects = projects.filter((project) => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) {
      return true;
    }

    return [project.name, project.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(needle));
  });

  return (
    <DashboardLayout
      title="Projects"
      activeItem="projects"
      subtitle="Track schedule, scope, and task volume across your active projects."
    >
      <div className="projects-page projects-workspace">
        <div className="projects-toolbar">
          <div>
            <p className="projects-eyebrow">Workspace</p>
            <h3 className="projects-title">Projects Overview</h3>
          </div>

          <div className="projects-toolbar-actions">
            <label className="projects-search">
              <span className="projects-search-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M10.5 4a6.5 6.5 0 1 0 4.03 11.6l4.43 4.44 1.06-1.06-4.44-4.43A6.5 6.5 0 0 0 10.5 4Zm0 1.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search projects"
              />
            </label>

            {role === "ProjectManager" && (
              <button className="create-btn" onClick={() => setShowModal(true)}>
                Create Project
              </button>
            )}
          </div>
        </div>

        <div className="projects-list-shell">
          <div className="projects-list-head">
            <span>Project</span>
            <span>Timeline</span>
            <span>Tasks</span>
            <span>Progress</span>
            <span></span>
          </div>

          {loading ? (
            <div className="empty-state">
              <h4>Loading projects...</h4>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="empty-state">
              <h4>{projects.length === 0 ? "No projects yet" : "No matching projects"}</h4>
            </div>
          ) : (
            <div className="projects-list">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>

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
