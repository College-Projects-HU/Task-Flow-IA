import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import forgotPasswordImage from "../assets/forgot password.png";
import "./Login.css";

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
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const progress = (step / 3) * 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateStep = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (step === 1) {
      if (!formData.email) {
        newErrors.email = "Required";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
    }

    if (step === 2 && !formData.otp) {
      newErrors.otp = "Required";
    }

    if (step === 3) {
      if (!formData.newPassword) {
        newErrors.newPassword = "Required";
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = "Password must be at least 6 characters";
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Required";
      } else if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep()) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      alert("Password reset successfully.");
      navigate("/");
    }, 900);
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-logo-icon"></div>
        <span className="auth-brand-name">Flowbit</span>
      </div>

      <div className="auth-content row m-0">
        <div className="col-lg-6 auth-image-col">
          <img
            src={forgotPasswordImage}
            alt="Forgot Password Illustration"
            className="auth-image"
          />
        </div>

        <div className="col-lg-6 auth-form-col">
          <h3 className="auth-title">Forgot Password</h3>
          <p className="auth-subtitle">
            Reset your password in three quick steps.
          </p>

          <div
            className="progress mb-4"
            style={{ height: "4px", backgroundColor: "#e5e7eb" }}
          >
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
                backgroundColor: "#111827",
                transition: "width 0.3s ease",
              }}
            ></div>
          </div>

          <div className="auth-step-meta">Step {step} of 3</div>

          <form onSubmit={handleSubmit}>
            {step === 1 && (
              <div className="auth-input-group">
                <label className="auth-label">Email</label>
                <input
                  className="auth-input"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <small className="text-danger">{errors.email}</small>
              </div>
            )}

            {step === 2 && (
              <div className="auth-input-group">
                <label className="auth-label">Verification Code</label>
                <input
                  className="auth-input"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                />
                <small className="text-danger">{errors.otp}</small>
              </div>
            )}

            {step === 3 && (
              <>
                <div className="auth-input-group password-wrapper">
                  <label className="auth-label">New Password</label>
                  <input
                    className="auth-input"
                    type={showNewPassword ? "text" : "password"}
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? "🙈" : "👁️"}
                  </button>
                  <small className="text-danger d-block">{errors.newPassword}</small>
                </div>

                <div className="auth-input-group password-wrapper">
                  <label className="auth-label">Confirm Password</label>
                  <input
                    className="auth-input"
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                  <small className="text-danger d-block">
                    {errors.confirmPassword}
                  </small>
                </div>
              </>
            )}

            <div className="auth-actions">
              {step > 1 && (
                <button
                  type="button"
                  className="auth-button auth-button-secondary"
                  onClick={prevStep}
                >
                  Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  className="auth-button"
                  onClick={nextStep}
                >
                  {step === 1 ? "Send Code" : "Verify"}
                </button>
              ) : (
                <button type="submit" className="auth-button" disabled={isLoading}>
                  {isLoading ? "Resetting..." : "Reset Password"}
                </button>
              )}
            </div>
          </form>

          <div className="auth-footer mt-4">
            Remembered your password?{" "}
            <Link to="/" className="auth-footer-link">
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;