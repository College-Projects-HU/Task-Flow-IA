import { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "../pages/Dashboard.css";

function DashboardLayout({ title, subtitle, activeItem, children }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role || "Member";

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand-wrap">
          <div className="dashboard-logo-icon"></div>
          <span className="dashboard-brand-name">Flowbit</span>
        </div>

        <nav className="dashboard-nav">
          <NavLink
            to="/dashboard"
            className={`dashboard-nav-item ${activeItem === "dashboard" ? "active" : ""}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/Projects"
            className={`dashboard-nav-item ${activeItem === "projects" ? "active" : ""}`}
          >
            Projects
          </NavLink>
          <NavLink
            to="/taskboard"
            className={`dashboard-nav-item ${activeItem === "tasks" ? "active" : ""}`}
          >
            Tasks Board
          </NavLink>
          {role === "Admin" && (
            <NavLink
              to="/admin"
              className={`dashboard-nav-item ${activeItem === "approvals" ? "active" : ""}`}
            >
              Approvals
            </NavLink>
          )}
        </nav>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <h2>{title}</h2>
            <p>
              {subtitle || `Welcome ${user?.name || user?.email} (${role})`}
            </p>
          </div>
          <div className="dashboard-topbar-actions">
            <Link to="/dashboard" className="dashboard-link-btn">
              Home
            </Link>
            <button className="dashboard-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;
