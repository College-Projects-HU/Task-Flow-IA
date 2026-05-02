import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5218/api",
});

export const API_BASE_URL = api.defaults.baseURL;
export const API_ORIGIN = new URL(API_BASE_URL).origin;

// 🔐 interceptor - هذا الجزء يضمن إضافة التوكن لكل الطلبات تلقائياً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
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
    startDate: data.startDate || null,
    endDate: data.endDate || null,
  });

  const p = res.data;

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    startDate: p.startDate,
    endDate: p.endDate,
    taskCount: 0,
    createdAt: new Date().toISOString().split("T")[0],
  };
};

// 🔹 DELETE project
export const deleteProject = async (projectId) => {
  const res = await api.delete(`/projects/${projectId}`);
  return res.data;
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
    tasks: p.tasks || [],
  };
};

// 🔹 GET project tasks (specific project)
export const getProjectTasks = async (projectId) => {
  const res = await api.get(`/projects/${projectId}/tasks`);
  return res.data;
};

// 🔹 GET all tasks (general view with project info)
export const getAllTasks = async () => {
  const res = await api.get(`/tasks`);
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

// 🔹 DELETE task
export const deleteTask = async (taskId) => {
  const res = await api.delete(`/tasks/${taskId}`);
  return res.data;
};

// 🔹 GET task by id
export const getTaskById = async (taskId) => {
  const res = await api.get(`/tasks/${taskId}`);
  return res.data;
};

export const updateTaskStatus = async (taskId, status) => {
  const res = await api.patch(`/tasks/${taskId}/status`, { status });
  return res.data;
};
// 🔹 UPLOAD attachment
export const uploadAttachment = (taskId, formData, onUploadProgress) => {
  return api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });
};

// 🔹 GET attachments
export const getAttachments = async (taskId) => {
  const res = await api.get(`/tasks/${taskId}/attachments`);
  return res.data;
};

// 🔹 DELETE attachment
export const deleteAttachment = async (attachmentId) => {
  const res = await api.delete(`/attachments/${attachmentId}`);
  return res.data;
};

export const getComments = (taskId) =>
  api.get(`/comments/tasks/${taskId}/comments`);

export const addComment = (taskId, data) =>
  api.post(`/comments/tasks/${taskId}/comments`, data);

export const deleteComment = (id) => api.delete(`/comments/comments/${id}`);

// STATS
export const getProjectStats = (projectId) =>
  api.get(`/projects/${projectId}/stats`);

export const getNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const markNotificationAsRead = async (notificationId) => {
  await api.patch(`/notifications/${notificationId}/read`);
};

// System Users Management (Admins)
export const getSystemUsers = async () => {
  const response = await api.get("/system-users");
  return response.data;
};

export const updateSystemUserRole = async (id, role) => {
  const response = await api.put(`/system-users/${id}/role`, { role });
  return response.data;
};

export const deleteSystemUser = async (id) => {
  const response = await api.delete(`/system-users/${id}`);
  return response.data;
};

export const unrejectSystemUser = async (id) => {
  const response = await api.put(`/admin/users/${id}/unreject`);
  return response.data;
};

// Profile
export const getProfile = async () => {
  const res = await api.get("/profile");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.put("/profile", data, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

export default api;
