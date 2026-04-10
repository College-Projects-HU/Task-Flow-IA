import { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css";
import "../App.css";

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    // Step 2
    password: "",
    confirmPassword: "",
    role: "member", // 'manager' or 'member'
    // Step 3
    jobTitle: "",
    profilePicture: null,
  });

  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData({
      ...formData,
      [name]: type === "file" ? files[0] : value,
    });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate current step
  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
      if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }
      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    }

    if (step === 2) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.role) newErrors.role = "Please select a role";
    }

    if (step === 3) {
      if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Next step handler
  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Previous step handler
  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateStep()) {
      console.log("Form submitted:", formData);
      // Here you will send data to backend
      alert("Registration submitted! Waiting for admin approval.");
    }
  };

  // Progress percentage
  const progressPercentage = (step / 3) * 100;

  return (
    <div className="container">
      <div className="card register-card">
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          <div className="progress-steps">
            <div className={`progress-step ${step >= 1 ? "active" : ""}`}>1</div>
            <div className={`progress-step ${step >= 2 ? "active" : ""}`}>2</div>
            <div className={`progress-step ${step >= 3 ? "active" : ""}`}>3</div>
          </div>
        </div>

        <h2>Create Account</h2>
        <p className="subtitle">
          {step === 1 && "Step 1/3: Personal Information"}
          {step === 2 && "Step 2/3: Account Security"}
          {step === 3 && "Step 3/3: Professional Details"}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          {step === 1 && (
            <div className="step-content">
              <div className="row">
                <div className="inputBox">
                  <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                  {errors.firstName && <span className="error">{errors.firstName}</span>}
                </div>
                <div className="inputBox">
                  <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                  {errors.lastName && <span className="error">{errors.lastName}</span>}
                </div>
              </div>

              <div className="inputBox">
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>

              <div className="inputBox">
                <input
                  type="tel"
                  name="phone"
                  placeholder="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="step-content">
              <div className="inputBox">
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                />
                {errors.password && <span className="error">{errors.password}</span>}
              </div>

              <div className="inputBox">
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>

              <div className="role-section">
                <p className="role-label">Register as:</p>
                <div className="role-options">
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="manager"
                      checked={formData.role === "manager"}
                      onChange={handleChange}
                    />
                    <span>📋 Project Manager</span>
                  </label>
                  <label className="role-option">
                    <input
                      type="radio"
                      name="role"
                      value="member"
                      checked={formData.role === "member"}
                      onChange={handleChange}
                    />
                    <span>👤 Team Member</span>
                  </label>
                </div>
                {errors.role && <span className="error">{errors.role}</span>}
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="step-content">
              <div className="inputBox">
                <input
                  type="text"
                  name="jobTitle"
                  placeholder="Job Title (e.g., Frontend Developer)"
                  value={formData.jobTitle}
                  onChange={handleChange}
                />
                {errors.jobTitle && <span className="error">{errors.jobTitle}</span>}
              </div>

              <div className="inputBox file-input">
                <input
                  type="file"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleChange}
                />
                <span className="file-placeholder">
                  {formData.profilePicture ? formData.profilePicture.name : "Profile Picture (Optional)"}
                </span>
              </div>

              <div className="info-box">
                <p>📌 After registration, an admin will review your account.</p>
                <p>✅ You will receive a notification when approved.</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="navigation-buttons">
            {step > 1 && (
              <button type="button" className="btn-secondary" onClick={prevStep}>
                ← Back
              </button>
            )}
            
            {step < 3 ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Next →
              </button>
            ) : (
              <button type="submit" className="btn-primary">
                Register ✨
              </button>
            )}
          </div>
        </form>

        <p className="switch">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;