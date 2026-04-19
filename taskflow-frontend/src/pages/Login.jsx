import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = "Required";
    if (!formData.password) newErrors.password = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post("/Auth/login", {
        email: formData.email,
        password: formData.password,
      });

      login(response.data.message);
      alert("Login Success");
      navigate("/dashboard");
    } catch (err) {
      setErrors({
        ...errors,
        password:
          err.response?.data ||
          "Login failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        background: "linear-gradient(135deg, #8c8ca5, #0749ac)",
      }}
    >
      <div
        className="card p-4 shadow"
        style={{
          width: "380px",
          borderRadius: "15px",
          background: "rgba(132, 132, 139, 0.39)",
          color: "white",
        }}
      >
        <h3 className="text-center">Welcome Back</h3>
        <p className="text-center opacity-75">Login to TaskFlow</p>

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <input
            className="form-control mb-3 "
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />
          <small className="text-danger">{errors.email}</small>

          {/* PASSWORD */}
          <div className="position-relative">
            <input
              className="form-control mb-3"
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              onChange={handleChange}
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "10px",
                cursor: "pointer",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <small className="text-danger">{errors.password}</small>

          {/* OPTIONS */}
          <div className="d-flex justify-content-between align-items-center mb-3 small">
            <label>
              <input
                type="checkbox"
                name="rememberMe"
                onChange={handleChange}
                className="me-1"
              />
              Remember me
            </label>

            <Link to="/forgot-password" className="fw-bold text-decoration-none text-primary">
              Forgot?
            </Link>
          </div>

          {/* BUTTON */}
          <button
            className="btn w-100 fw-bold text-white"
            style={{
              background: "linear-gradient(90deg, #0f6bb6, #0349a5)",
            }}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "LOGIN"}
          </button>
        </form>

        <p className="text-center mt-3">
          Don't have account?{" "}
          <Link to="/register" className="fw-bold text-decoration-none text-primary">
            Create
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;