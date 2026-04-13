import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const progress = (step / 3) * 100;

  // ================= STYLE (same Register theme) =================
  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #8c8ca5, #0749ac)",
    },

    card: {
      width: "400px",
      padding: "25px",
      borderRadius: "15px",
      background: "rgba(132, 132, 139, 0.39)",
      color: "white",
      boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
    },

    progressBar: {
      height: "6px",
      background: "rgba(255,255,255,0.2)",
      borderRadius: "10px",
      overflow: "hidden",
      marginBottom: "10px",
    },

    progressFill: {
      height: "100%",
      width: `${progress}%`,
      background: "linear-gradient(90deg, #3787ff, #001a8d)",
      transition: "0.3s",
    },

    stepRow: {
      display: "flex",
      justifyContent: "space-between",
      marginBottom: "15px",
    },

    step: (active) => ({
      width: "28px",
      height: "28px",
      borderRadius: "50%",
      background: active ? "#033092" : "rgba(255,255,255,0.2)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "12px",
      fontWeight: "bold",
    }),

    input: {
      width: "100%",
      padding: "10px",
      borderRadius: "8px",
      border: "none",
      outline: "none",
      marginBottom: "5px",
    },

    error: {
      color: "#ff6b6b",
      fontSize: "12px",
      marginBottom: "10px",
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
      marginTop: "10px",
    },

    link: {
      color: "#002c5e",
      textDecoration: "none",
      fontWeight: "bold",
    },
  };

  // ================= HANDLE =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      navigate("/");
    }, 1000);
  };

  // ================= UI =================
  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Progress */}
        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>

        <div style={styles.stepRow}>
          <div style={styles.step(step >= 1)}>1</div>
          <div style={styles.step(step >= 2)}>2</div>
          <div style={styles.step(step >= 3)}>3</div>
        </div>

        <h3 style={{ textAlign: "center" }}>Reset Password</h3>
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          Step {step}/3
        </p>

        <form onSubmit={handleSubmit}>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                style={styles.input}
                name="email"
                placeholder="Email"
                onChange={handleChange}
              />
              <span style={styles.error}>{errors.email}</span>

              <button type="button" style={styles.btn} onClick={nextStep}>
                Send Code
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input
                style={styles.input}
                name="otp"
                placeholder="Enter OTP"
                onChange={handleChange}
              />

              <button type="button" style={styles.btn} onClick={nextStep}>
                Verify
              </button>

              <button type="button" style={{ ...styles.btn, background: "#888" }} onClick={prevStep}>
                Back
              </button>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div style={{ position: "relative" }}>
                <input
                  style={styles.input}
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="New Password"
                  onChange={handleChange}
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "10px", top: "10px", cursor: "pointer" }}
                >
                  {showPassword ? "🙈" : "👁️"}
                </span>
              </div>

              <input
                style={styles.input}
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
              />

              <button type="submit" style={styles.btn} disabled={isLoading}>
                {isLoading ? "Loading..." : "Reset Password"}
              </button>
            </>
          )}

        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          <Link to="/" style={styles.link}>Back to Login</Link>
        </p>

      </div>
    </div>
  );
}

export default ForgotPassword;