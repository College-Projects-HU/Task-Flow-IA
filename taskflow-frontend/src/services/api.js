import axios from 'axios';

// Create an Axios instance with a generic base URL
const api = axios.create({
  baseURL: 'http://localhost:5218/api',
});

// Request interceptor to automatically attach the auth token to every request
api.interceptors.request.use(
  (config) => {
    // Read the token from local storage
    const token = localStorage.getItem('token');

    // If we have a token, add it to the Authorization header
    if (token) {
      // Typically backends expect the "Bearer " prefix, but modify if needed!
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
export const getProjects = async () => {
  return [
    {
      id: 1,
      name: "TaskFlow",
      description: "Test project",
      taskCount: 3,
      createdAt: "2026-04-01",
    },
  ];
};

export const createProject = async (data) => {
  return data;
};
export default api;
