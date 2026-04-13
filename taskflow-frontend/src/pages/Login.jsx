import { useState } from "react";
import { Link } from "react-router-dom";

function Login() {
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      alert("Login Success 🎉");
    }, 1000);
  };

  // ===== SAME REGISTER COLORS =====
  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #8c8ca5, #0749ac)",
    },

    card: {
      width: "380px",
      padding: "25px",
      borderRadius: "15px",
      background: "rgba(132, 132, 139, 0.39)",
      color: "white",
      boxShadow: "0 10px 30px rgba(58, 58, 58, 0.3)",
    },

    input: {
      width: "100%",
      padding: "10px",
      marginBottom: "5px",
      borderRadius: "8px",
      border: "none",
      outline: "none",
    },

    error: {
      color: "#ff6b6b",
      fontSize: "12px",
      marginBottom: "8px",
      display: "block",
    },

    btn: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "none",
      background: "linear-gradient(90deg, #0f6bb6, #0349a5)",
      color: "white",
      fontWeight: "bold",
      cursor: "pointer",
    },

    link: {
      color: "#002c5e",
      textDecoration: "none",
      fontWeight: "bold",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <h3 style={{ textAlign: "center" }}>Welcome Back</h3>
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          Login to TaskFlow
        </p>

        <form onSubmit={handleSubmit}>

          {/* EMAIL */}
          <input
            style={styles.input}
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />
          <span style={styles.error}>{errors.email}</span>

          {/* PASSWORD */}
          <div style={{ position: "relative" }}>
            <input
              style={styles.input}
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

          <span style={styles.error}>{errors.password}</span>

          {/* OPTIONS */}
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "15px" }}>

            <label>
              <input
                type="checkbox"
                name="rememberMe"
                onChange={handleChange}
              /> Remember me
            </label>

            <Link to="/forgot-password" style={styles.link}>
              Forgot?
            </Link>
          </div>

          {/* BUTTON */}
          <button style={styles.btn} type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "LOGIN"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Don't have account?{" "}
          <Link to="/register" style={styles.link}>
            Create
          </Link>
        </p>

      </div>
    </div>
  );
}

export default Login;