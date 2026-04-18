import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5218/api",
});

// 🔐 interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 GET projects
export const getProjects = async () => {
  const res = await api.get("/projects");

  return res.data.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    taskCount: p.tasks.length,
    createdAt: "2026-04-01",
  }));
};

// 🔹 CREATE project
export const createProject = async (data) => {
  const res = await api.post("/projects", {
    name: data.name,
    description: data.description,
  });

  const p = res.data;

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    taskCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };
};

// 🔹 GET by id
export const getProjectById = async (id) => {
  const res = await api.get(`/projects/${id}`);

  const p = res.data;

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    taskCount: p.tasks?.length || 0,
    createdAt: p.createdAt || "2026-04-01",
    tasks: p.tasks || []
  };
};

// 🔹 GET project tasks (full task objects)
export const getProjectTasks = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/tasks`);
  return res.data;
};

// 🔹 GET project members
export const getProjectMembers = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/members`);
  return res.data;
};

// 🔹 CREATE task
export const createTask = async (projectId, taskData) => {
  const res = await api.post(`/projects/${projectId}/tasks`, taskData);
  return res.data;
};

// 🔹 UPDATE task
export const updateTask = async (taskId, taskData) => {
  const res = await api.put(`/tasks/${taskId}`, taskData);
  return res.data;
};

export default api;