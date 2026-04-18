import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: 2,
    jobTitle: "",
    profilePicture: null,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
  };

  const validateStep = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (step === 1) {
      if (!formData.firstName) newErrors.firstName = "Required";
      if (!formData.lastName) newErrors.lastName = "Required";
      
      if (!formData.email) {
        newErrors.email = "Required";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }

      if (!formData.phone) newErrors.phone = "Required";
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = "Required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (step === 3) {
      if (!formData.jobTitle) newErrors.jobTitle = "Required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep()) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);
    setErrors({});

    try {
      // Send the properties expected by the backend DTO
      await api.post("/Auth/register", {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: parseInt(formData.role, 10) // dynamically use the selected role
      });
      alert("Registered Successfully 🎉");
      navigate("/"); // Redirect to Login page
    } catch (err) {
      setErrors({
        ...errors,
        jobTitle: err.response?.data?.message || err.response?.data || "Registration failed."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  // ================= STYLE OBJECTS =================
  const styles = {
    container: {
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #8c8ca5, #0749ac)",
    },

    card: {
      width: "440px",
      padding: "25px",
      borderRadius: "15px",
      background: "rgba(137, 137, 155, 0.55)",
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

    steps: {
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

    buttons: {
      display: "flex",
      gap: "10px",
      marginTop: "15px",

    },

    btn: {
      flex: 1,
      padding: "10px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
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

        {/* Progress */}
        <div style={styles.progressBar}>
          <div style={styles.progressFill}></div>
        </div>

        <div style={styles.steps}>
          <div style={styles.step(step >= 1)}>1</div>
          <div style={styles.step(step >= 2)}>2</div>
          <div style={styles.step(step >= 3)}>3</div>
        </div>

        <h3 style={{ textAlign: "center" }}>Create Account</h3>
        <p style={{ textAlign: "center", opacity: 0.7 }}>Step {step}/3</p>

        <form onSubmit={handleSubmit}>

          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input style={styles.input} value={formData.firstName} name="firstName" placeholder="First Name" onChange={handleChange} />
              <span style={styles.error}>{errors.firstName}</span>

              <input style={styles.input} value={formData.lastName} name="lastName" placeholder="Last Name" onChange={handleChange} />
              <span style={styles.error}>{errors.lastName}</span>

              <input style={styles.input} value={formData.email} name="email" placeholder="Email" onChange={handleChange} />
              <span style={styles.error}>{errors.email}</span>

              <input style={styles.input} value={formData.phone} name="phone" placeholder="Phone" onChange={handleChange} />
              <span style={styles.error}>{errors.phone}</span>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input style={styles.input} value={formData.password} type="password" name="password" placeholder="Password" onChange={handleChange} />
              <span style={styles.error}>{errors.password}</span>

              <input style={styles.input} value={formData.confirmPassword} type="password" name="confirmPassword" placeholder="Confirm Password" onChange={handleChange} />
              <span style={styles.error}>{errors.confirmPassword}</span>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input style={styles.input} value={formData.jobTitle} name="jobTitle" placeholder="Job Title" onChange={handleChange} />
              <span style={styles.error}>{errors.jobTitle}</span>

              {/* ROLE SELECTION (RADIO BUTTONS) */}
              <div style={{ marginBottom: "15px", display: "flex", gap: "15px", alignItems: "center" }}>
                <span style={{ fontWeight: "bold" }}>Join as:</span>
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <input
                    type="radio"
                    name="role"
                    value={2} // Enum for Member
                    checked={parseInt(formData.role, 10) === 2}
                    onChange={handleChange}
                  />
                  Member
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <input
                    type="radio"
                    name="role"
                    value={1} // Enum for ProjectManager
                    checked={parseInt(formData.role, 10) === 1}
                    onChange={handleChange}
                  />
                  Project Manager
                </label>
              </div>

              <input style={styles.input} type="file" name="profilePicture" onChange={handleChange} />

              <div style={{ marginTop: "10px", color: "#f8f8f8", minHeight: "20px", fontSize: "14px" }}>
                {parseInt(formData.role, 10) === 1 
                  ? "Admin will need to review and approve your account." 
                  : "You can log in immediately after registering."}
              </div>
            </>
          )}

          {/* BUTTONS */}
          <div style={styles.buttons}>
            {step > 1 && (
              <button
                type="button"
                style={{ ...styles.btn, background: "#888", color: "white" }}
                onClick={prevStep}
              >
                Back
              </button>
            )}

            {step < 3 ? (
            <button
              type="button"
              style={{
                  ...styles.btn,
                  background: "linear-gradient(90deg, #0f6bb6, #0349a5)",
                  color: "white"
                  }}
              onClick={nextStep}
            >
                Next
            </button>
            ) : (
              <button
                type="submit"
                style={{ ...styles.btn, background: "#2196f3", color: "white" }}
              >
                Register
              </button>
            )}
          </div>

        </form>

        <p style={{ textAlign: "center", marginTop: "15px" }}>
          Already have account?  <Link to="/" style={styles.link}>
  Login
</Link>
        </p>

      </div>
    </div>
  );
}

export default Register;