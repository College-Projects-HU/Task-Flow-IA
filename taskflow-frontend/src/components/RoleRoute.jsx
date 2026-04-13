import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function RoleRoute({ children, allowedRoles }) {
  const { token, user } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Check if current user has the required role
  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  // Redirect to a safe redirect page if role doesn't match
  return <Navigate to="/dashboard" replace />;
}
