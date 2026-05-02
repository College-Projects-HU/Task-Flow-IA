import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import registerImage from "../assets/register.png";
import "./Login.css"; // Reuse the styles

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
    termsAccepted: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files, checked } = e.target;

    setFormData({
      ...formData,
      [name]:
        type === "file" ? files[0] : type === "checkbox" ? checked : value,
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
      if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the Terms & Conditions";
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
      const submitData = new FormData();
      submitData.append("fullName", `${formData.firstName} ${formData.lastName}`);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("role", parseInt(formData.role, 10));
      
      if (formData.profilePicture) {
        submitData.append("profilePicture", formData.profilePicture);
      }

      const response = await api.post("/Auth/register", submitData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert(response.data.message);
      navigate("/");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || "Registration failed.";
      alert(errMsg);
      setErrors({
        ...errors,
        jobTitle: errMsg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / 3) * 100;

  return (
    <div className="auth-container">
      {/* Brand Logo Corner */}
      <div className="auth-header">
        <div className="auth-logo-icon"></div>
        <span className="auth-brand-name">Flowbit</span>
      </div>

      <div className="auth-content row m-0 flex-row-reverse">
        {/* Right Side: Image */}
        <div className="col-lg-6 auth-image-col">
          <img src={registerImage} alt="Register Access" className="auth-image" />
        </div>

        {/* Left Side: Form */}
        <div className="col-lg-6 auth-form-col">
          <h3 className="auth-title">Create Account</h3>
          <p className="auth-subtitle">Join us and streamline your workflow today!</p>

           {/* Progress */}
           <div className="progress mb-4" style={{ height: "4px", backgroundColor: "#e5e7eb" }}>
            <div
              className="progress-bar"
              style={{
                width: `${progress}%`,
                backgroundColor: "#111827",
                transition: "width 0.3s ease"
              }}
            ></div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* STEP 1 */}
            {step === 1 && (
              <>
                <div className="row">
                   <div className="col-lg-6 auth-input-group">
                    <label className="auth-label">First Name</label>
                    <input
                      className="auth-input"
                      value={formData.firstName}
                      name="firstName"
                      placeholder=""
                      onChange={handleChange}
                    />
                    <small className="text-danger">{errors.firstName}</small>
                  </div>

                  <div className="col-lg-6 auth-input-group">
                    <label className="auth-label">Last Name</label>
                    <input
                      className="auth-input"
                      value={formData.lastName}
                      name="lastName"
                      placeholder=""
                      onChange={handleChange}
                    />
                    <small className="text-danger">{errors.lastName}</small>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Email</label>
                  <input
                    className="auth-input"
                    value={formData.email}
                    name="email"
                    type="email"
                    placeholder=""
                    onChange={handleChange}
                  />
                  <small className="text-danger">{errors.email}</small>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Phone</label>
                  <input
                    className="auth-input"
                    value={formData.phone}
                    name="phone"
                    placeholder=""
                    onChange={handleChange}
                  />
                  <small className="text-danger">{errors.phone}</small>
                </div>
              </>
            )}

            {/* STEP 2 */}
            {step === 2 && (
              <>
                 <div className="auth-input-group password-wrapper">
                  <label className="auth-label">Password</label>
                  <input
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
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

                <div className="auth-input-group password-wrapper">
                  <label className="auth-label">Confirm Password</label>
                  <input
                    className="auth-input"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    name="confirmPassword"
                    placeholder=""
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                  <small className="text-danger d-block">{errors.confirmPassword}</small>
                </div>
              </>
            )}

            {/* STEP 3 */}
            {step === 3 && (
              <>
                <div className="auth-input-group">
                  <label className="auth-label">Job Title</label>
                  <input
                    className="auth-input"
                    value={formData.jobTitle}
                    name="jobTitle"
                    placeholder=""
                    onChange={handleChange}
                  />
                  <small className="text-danger">{errors.jobTitle}</small>
                </div>

                {/* Role */}
                <div className="auth-input-group">
                  <label className="auth-label mb-2">Join as</label>
                  <div className="d-flex gap-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="role"
                        value={2}
                        id="roleMember"
                        checked={parseInt(formData.role, 10) === 2}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="roleMember">Member</label>
                    </div>

                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="radio"
                        name="role"
                        value={1}
                        id="rolePM"
                        checked={parseInt(formData.role, 10) === 1}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor="rolePM">
                        Project Manager
                      </label>
                    </div>
                  </div>
                </div>

                <div className="auth-input-group">
                  <label className="auth-label">Profile Picture</label>
                  <input
                    className="form-control mb-2"
                    type="file"
                    name="profilePicture"
                    onChange={handleChange}
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>
                
                <div className="auth-options mt-4 mb-2">
                  <label>
                    <input
                      type="checkbox"
                      name="termsAccepted"
                      checked={formData.termsAccepted}
                      onChange={handleChange}
                      className="auth-checkbox"
                    />
                    I agree to the <Link to="#" className="auth-link">Terms & Conditions</Link>
                  </label>
                </div>
                <small className="text-danger d-block mb-3">{errors.termsAccepted}</small>

                <div className="small text-muted mb-3">
                  {parseInt(formData.role, 10) === 1
                    ? "Admin will need to review and approve your account."
                    : "You can log in immediately after registering."}
                </div>
              </>
            )}

            {/* BUTTONS */}
            <div className="d-flex gap-3 mt-4">
              {step > 1 && (
                <button
                  type="button"
                  className="auth-button"
                  style={{ backgroundColor: "#e5e7eb", color: "#374151" }}
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
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Create account"}
                </button>
              )}
            </div>
          </form>

          <div className="auth-footer mt-4">
            Already have an account?{" "}
            <Link to="/" className="auth-footer-link">
              Log in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;