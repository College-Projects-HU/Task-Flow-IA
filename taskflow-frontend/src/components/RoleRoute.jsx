import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RoleRoute({ children, allowedRoles }) {
  const { token, user } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If token exists but user isn't populated yet (e.g. decoding state), show nothing until ready
  if (!user) {
    return null; // Or return a <div className="spinner-border"></div>
  }

  // Check if current user has the required role
  // We convert both to string so "Admin" tightly matches "Admin"
  if (allowedRoles.some(r => String(r) === String(user.role))) {
    return children;
  }

  // Redirect to a safe redirect page if role doesn't match
  return <Navigate to="/dashboard" replace />;
}
