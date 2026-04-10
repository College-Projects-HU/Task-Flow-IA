import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleMockLogin = () => {
    // We pass a dummy token and user object for now
    login("secret-mock-token", { name: "Admin User", role: "admin" });
    navigate("/dashboard");
  };

  return (
    <div className="container mt-5">
      <h2>Login Page</h2>
      <p>This is a placeholder. You'll add your Bootstrap form here later.</p>
      <button className="btn btn-primary" onClick={handleMockLogin}>
        Mock Login
      </button>
    </div>
  );
}
