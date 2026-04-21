import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminPage from "./pages/AdminPage";
import RoleRoute from "./components/RoleRoute";
import PrivateRoute from "./components/PrivateRoute";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectDetail from "./pages/ProjectDetail";
import TaskDetailPage from "./pages/TaskDetailPage";
import StatsPage from "./pages/StatsPage";
import Dashboard from "./pages/Dashboard";
import TaskAttachments from "./pages/TaskAttachments";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <RoleRoute allowedRoles={[0, "Admin"]}>
              <AdminPage />
            </RoleRoute>
          }
        />

        <Route path="/Projects" element={<ProjectsPage />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/tasks/:taskId/attachments" element={<TaskAttachments />} />
        <Route path="/tasks/:taskId" element={<TaskDetailPage />} />

        <Route
          path="/projects/:id/stats"
          element={
            <RoleRoute allowedRoles={["ProjectManager"]}>
              <StatsPage />
            </RoleRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
