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
    taskCount: p.tasks.length,
    createdAt: "2026-04-01",
  };
};

export default api;