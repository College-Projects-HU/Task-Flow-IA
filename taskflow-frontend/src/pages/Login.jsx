import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import loginImage from "../assets/login.png";
import "./Login.css";

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
      navigate("/dashboard");
    } catch (err) {
      setErrors({
        ...errors,
        password:
          err.response?.data || "Login failed. Please check your credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Brand Logo Corner */}
      <div className="auth-header">
        <div className="auth-logo-icon"></div>
        <span className="auth-brand-name">Flowbit</span>
      </div>

      <div className="auth-content row m-0">
        {/* Left Side: Image */}
        <div className="col-lg-6 auth-image-col">
          <img src={loginImage} alt="Login Access" className="auth-image" />
        </div>

        {/* Right Side: Form */}
        <div className="col-lg-6 auth-form-col">
          <h3 className="auth-title">Welcome back!</h3>
          <p className="auth-subtitle">
            Welcome back! Please enter your details.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="auth-input-group">
              <label className="auth-label">Email</label>
              <input
                className="auth-input"
                type="email"
                name="email"
                placeholder=""
                onChange={handleChange}
              />
              <small className="text-danger">{errors.email}</small>
            </div>

            <div className="auth-input-group password-wrapper">
              <label className="auth-label">Password</label>
              <input
                className="auth-input"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder=""
                onChange={handleChange}
              />
              <button
                type="button"
                className="password-toggle"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
              <small className="text-danger d-block">{errors.password}</small>
            </div>

            <div className="auth-options">
              <label>
                <input
                  type="checkbox"
                  name="rememberMe"
                  onChange={handleChange}
                  className="auth-checkbox"
                />
                Remember me
              </label>

              <Link to="/forgot-password" className="auth-link">
                Forgot Password
              </Link>
            </div>

            <button className="auth-button" type="submit" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Log in"}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{" "}
            <Link to="/register" className="auth-footer-link">
              Sign up for free
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
