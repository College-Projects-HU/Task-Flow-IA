import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./ForgotPassword.css";
import "../App.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [emailSent, setEmailSent] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Start countdown timer for resend
  const startTimer = () => {
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Step 1: Send reset email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsLoading(true);
    
    // API call to send OTP
    try {
      // const response = await fetch("/api/forgot-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: formData.email }),
      // });
      // const data = await response.json();
      
      // Simulate API delay - Remove this in production
      setTimeout(() => {
        setIsLoading(false);
        setEmailSent(formData.email);
        setStep(2);
        setResendTimer(60);
        startTimer();
      }, 1500);
      
    } catch (error) {
      setIsLoading(false);
      setErrors({ email: "Something went wrong. Please try again." });
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.otp.trim()) {
      newErrors.otp = "Verification code is required";
    } else if (formData.otp.length < 6) {
      newErrors.otp = "Code must be 6 digits";
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsLoading(true);
    
    // API call to verify OTP
    try {
      // const response = await fetch("/api/verify-otp", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: emailSent, otp: formData.otp }),
      // });
      // const data = await response.json();
      
      // if (response.ok) {
      //   setStep(3);
      // } else {
      //   setErrors({ otp: data.message || "Invalid verification code" });
      // }
      
      // Simulate API delay - Remove this in production
      setTimeout(() => {
        setIsLoading(false);
        setStep(3);
      }, 1500);
      
    } catch (error) {
      setIsLoading(false);
      setErrors({ otp: "Something went wrong. Please try again." });
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    
    // API call to resend OTP
    try {
      // const response = await fetch("/api/resend-otp", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email: emailSent }),
      // });
      
      // Simulate API delay - Remove this in production
      setTimeout(() => {
        setIsLoading(false);
        setResendTimer(60);
        startTimer();
      }, 1000);
      
    } catch (error) {
      setIsLoading(false);
      setErrors({ otp: "Failed to resend code. Please try again." });
    }
  };

  // Step 3: Set new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    
    setIsLoading(true);
    
    // API call to reset password
    try {
      // const response = await fetch("/api/reset-password", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ 
      //     email: emailSent, 
      //     otp: formData.otp,
      //     newPassword: formData.newPassword 
      //   }),
      // });
      
      // if (response.ok) {
      //   navigate("/");
      // }
      
      // Simulate API delay - Remove this in production
      setTimeout(() => {
        setIsLoading(false);
        navigate("/");
      }, 1500);
      
    } catch (error) {
      setIsLoading(false);
      setErrors({ newPassword: "Something went wrong. Please try again." });
    }
  };

  // Progress percentage
  const progressPercentage = (step / 3) * 100;

  return (
    <div className="container">
      <div className="card forgot-card">
        
        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar" style={{ width: `${progressPercentage}%` }}></div>
          <div className="progress-steps">
            <div className={`progress-step ${step >= 1 ? "active" : ""}`}>1</div>
            <div className={`progress-step ${step >= 2 ? "active" : ""}`}>2</div>
            <div className={`progress-step ${step >= 3 ? "active" : ""}`}>3</div>
          </div>
        </div>

        {/* Header */}
        <div className="logo-icon">
          <span className="icon">🔐</span>
        </div>

        <h2>Reset Password</h2>
        <p className="subtitle">
          {step === 1 && "Enter your email to receive a verification code"}
          {step === 2 && `Enter the 6-digit code sent to ${emailSent}`}
          {step === 3 && "Create your new password"}
        </p>

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendEmail}>
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

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : "Send Reset Code"}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyOTP}>
            <div className="inputBox">
              <span className="input-icon">🔢</span>
              <input
                type="text"
                name="otp"
                placeholder="Enter 6-digit code"
                maxLength="6"
                value={formData.otp}
                onChange={handleChange}
              />
            </div>
            {errors.otp && <span className="error">{errors.otp}</span>}

            <div className="resend-section">
              {resendTimer > 0 ? (
                <span className="resend-timer">Resend code in {resendTimer}s</span>
              ) : (
                <button type="button" className="resend-btn" onClick={handleResendOTP}>
                  Resend Code
                </button>
              )}
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : "Verify Code"}
            </button>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <div className="inputBox">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="newPassword"
                placeholder="New Password"
                value={formData.newPassword}
                onChange={handleChange}
              />
              <span 
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
            {errors.newPassword && <span className="error">{errors.newPassword}</span>}

            <div className="inputBox">
              <span className="input-icon">🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm New Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
            {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

            <div className="password-requirements">
              <p>Password must:</p>
              <ul>
                <li>Be at least 6 characters long</li>
              </ul>
            </div>

            <button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? <span className="spinner"></span> : "Reset Password"}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <p className="switch">
          <Link to="/">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
}

export default ForgotPassword;