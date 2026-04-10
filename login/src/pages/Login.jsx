import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";
import "../App.css";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log("Login data:", formData);
      
      // Here you will call your backend API
      // If login successful, navigate to dashboard based on role
      
      setIsLoading(false);
      
      // Example: redirect to dashboard
      // navigate("/dashboard");
      
      alert("Login successful!");
    }, 1500);
  };

  return (
    <div className="container">
      <div className="card login-card">
        
        {/* Logo or Icon */}
        <div className="logo-icon">
          <span className="icon">📋</span>
        </div>

        <h2>Welcome Back</h2>
        <p className="subtitle">Login to your TaskFlow account</p>

        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="inputBox">
            <span className="input-icon">📧</span>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          {errors.email && <span className="error">{errors.email}</span>}

          {/* Password Field with Show/Hide */}
          <div className="inputBox">
            <span className="input-icon">🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
            />
            <span 
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          {errors.password && <span className="error">{errors.password}</span>}

          {/* Options Row */}
          <div className="options">
            <label className="remember-me">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* Login Button */}
          <button type="submit" className="btn-login" disabled={isLoading}>
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              "LOGIN"
            )}
          </button>
        </form>

        {/* Register Link */}
        <p className="switch">
          Don't have an account? <Link to="/register">Create Account</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;