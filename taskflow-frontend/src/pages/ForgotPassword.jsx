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
          width: "400px",
          borderRadius: "15px",
          background: "rgba(132, 132, 139, 0.39)",
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

        <h3 className="text-center">Reset Password</h3>
        <p className="text-center opacity-75">Step {step}/3</p>

        <form onSubmit={handleSubmit}>
          {/* STEP 1 */}
          {step === 1 && (
            <>
              <input
                className="form-control mb-3"
                name="email"
                placeholder="Email"
                onChange={handleChange}
              />
              <small className="text-danger">{errors.email}</small>

              <button
                type="button"
                className="btn w-100 mt-2 text-white"
                style={{
                  background:
                    "linear-gradient(90deg, #0f6bb6, #0349a5)",
                }}
                onClick={nextStep}
              >
                Send Code
              </button>
            </>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <>
              <input
                className="form-control mb-4"
                name="otp"
                placeholder="Enter OTP"
                onChange={handleChange}
              />

              <button
                type="button"
                className="btn w-100 mb-3 text-white"
                style={{
                  background:
                    "linear-gradient(90deg, #0f6bb6, #0349a5)",
                }}
                onClick={nextStep}
              >
                Verify
              </button>

              <button
                type="button"
                className="btn btn-secondary w-100"
                onClick={prevStep}
              >
                Back
              </button>
            </>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <>
              <div className="position-relative">
                <input
                  className="form-control mb-4"
                  type={showPassword ? "text" : "password"}
                  name="newPassword"
                  placeholder="New Password"
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

              <input
                className="form-control mb-4"
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                onChange={handleChange}
              />

              <button
                type="submit"
                className="btn w-100 text-white"
                style={{
                  background:
                    "linear-gradient(90deg, #0f6bb6, #0349a5)",
                }}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Reset Password"}
              </button>
            </>
          )}
        </form>

        <p className="text-center mt-3">
          <Link to="/" className="fw-bold text-decoration-none text-primary">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;