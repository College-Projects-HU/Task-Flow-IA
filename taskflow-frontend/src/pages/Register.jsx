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
      await api.post("/Auth/register", {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: parseInt(formData.role, 10),
      });

      alert("Registered Successfully 🎉");
      navigate("/");
    } catch (err) {
      setErrors({
        ...errors,
        jobTitle:
          err.response?.data?.message ||
          err.response?.data ||
          "Registration failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / 3) * 100;

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
          width: "440px",
          borderRadius: "15px",
          background: "rgba(137, 137, 155, 0.55)",
          color: "white",
        }}
      >
        {/* Progress */}
        <div className="progress mb-2" style={{ height: "6px" }}>
          <div
            className="progress-bar"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #3787ff, #001a8d)",
            }}
          ></div>
        </div>

        {/* Steps */}
        <div className="d-flex justify-content-between mb-3">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className="d-flex align-items-center justify-content-center"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background:
                  step >= num ? "#033092" : "rgba(255,255,255,0.2)",
                fontSize: "12px",
                fontWeight: "bold",
              }}
            >
              {num}
            </div>
          ))}
        </div>

        <h3 className="text-center">Create Account</h3>
        <p className="text-center opacity-75">Step {step}/3</p>

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                className="form-control mb-3"
                value={formData.firstName}
                name="firstName"
                placeholder="First Name"
                onChange={handleChange}
              />
              <small className="text-danger">{errors.firstName}</small>

              <input
                className="form-control mb-3"
                value={formData.lastName}
                name="lastName"
                placeholder="Last Name"
                onChange={handleChange}
              />
              <small className="text-danger">{errors.lastName}</small>

              <input
                className="form-control mb-3"
                value={formData.email}
                name="email"
                placeholder="Email"
                onChange={handleChange}
              />
              <small className="text-danger">{errors.email}</small>

              <input
                className="form-control mb-3"
                value={formData.phone}
                name="phone"
                placeholder="Phone"
                onChange={handleChange}
              />
              <small className="text-danger">{errors.phone}</small>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input
                className="form-control mb-3"
                value={formData.password}
                type="password"
                name="password"
                placeholder="Password"
                onChange={handleChange}
              />
              <small className="text-danger">{errors.password}</small>

              <input
                className="form-control mb-3"
                value={formData.confirmPassword}
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
              />
              <small className="text-danger">
                {errors.confirmPassword}
              </small>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <input
                className="form-control mb-3"
                value={formData.jobTitle}
                name="jobTitle"
                placeholder="Job Title"
                onChange={handleChange}
              />
              <small className="text-danger">{errors.jobTitle}</small>

              {/* Role */}
              <div className="mb-3">
                <span className="fw-bold me-2">Join as:</span>

                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    value={2}
                    checked={parseInt(formData.role, 10) === 2}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">Member</label>
                </div>

                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="role"
                    value={1}
                    checked={parseInt(formData.role, 10) === 1}
                    onChange={handleChange}
                  />
                  <label className="form-check-label">
                    Project Manager
                  </label>
                </div>
              </div>

              <input
                className="form-control mb-2"
                type="file"
                name="profilePicture"
                onChange={handleChange}
              />

              <div className="small text-light">
                {parseInt(formData.role, 10) === 1
                  ? "Admin will need to review and approve your account."
                  : "You can log in immediately after registering."}
              </div>
            </>
          )}

          {/* BUTTONS */}
          <div className="d-flex gap-2 mt-3">
            {step > 1 && (
              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={prevStep}
              >
                Back
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                className="btn w-100 text-white"
                style={{
                  background:
                    "linear-gradient(90deg, #0f6bb6, #0349a5)",
                }}
                onClick={nextStep}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Register"}
              </button>
            )}
          </div>
        </form>

        <p className="text-center mt-3">
          Already have account?{" "}
          <Link to="/" className="fw-bold text-decoration-none text-primary">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Register;