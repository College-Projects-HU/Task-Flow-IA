import { useState } from "react";
import api from "../services/api";

export default function CreateUserModal({ show, handleClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: 2, // 1 for PM, 2 for Member
    approvePM: false, // For admin to auto-approve PM
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.firstName) newErrors.firstName = "Required";
    if (!formData.lastName) newErrors.lastName = "Required";

    if (!formData.email) {
      newErrors.email = "Required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsLoading(true);
    try {
      // 1. Create the user
      const response = await api.post("/Auth/register", {
        fullName: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: parseInt(formData.role, 10),
      });

      const { userId } = response.data;

      // 2. Auto-approve if PM and checkbox is checked
      const roleInt = parseInt(formData.role, 10);
      if (roleInt === 1 && formData.approvePM && userId) {
        await api.put(`/admin/users/${userId}/approve`);
      }

      onSuccess();
      handleClose();
      // Reset form state for next time
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: 2,
        approvePM: false,
      });
      setErrors({});
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || "Failed to create user.";
      setErrors({ submit: errMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>

      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content custom-modal bg-dark text-white border border-secondary shadow-lg">
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Create User</h5>
              <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {errors.submit && <div className="alert alert-danger py-2">{errors.submit}</div>}

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      className="form-control bg-secondary text-white border-0"
                      value={formData.firstName}
                      onChange={handleChange}
                    />
                    {errors.firstName && <small className="text-danger">{errors.firstName}</small>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      className="form-control bg-secondary text-white border-0"
                      value={formData.lastName}
                      onChange={handleChange}
                    />
                    {errors.lastName && <small className="text-danger">{errors.lastName}</small>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control bg-secondary text-white border-0"
                    value={formData.email}
                    onChange={handleChange}
                  />
                  {errors.email && <small className="text-danger">{errors.email}</small>}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Password *</label>
                    <input
                      type="password"
                      name="password"
                      className="form-control bg-secondary text-white border-0"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && <small className="text-danger">{errors.password}</small>}
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      className="form-control bg-secondary text-white border-0"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                    />
                    {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label d-block">Role</label>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="role" 
                      id="roleAdminModal" 
                      value="0" 
                      checked={parseInt(formData.role, 10) === 0} 
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="roleAdminModal">Admin</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="role" 
                      id="roleMemberModal" 
                      value="2" 
                      checked={parseInt(formData.role, 10) === 2} 
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="roleMemberModal">Member</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="role" 
                      id="rolePMModal" 
                      value="1" 
                      checked={parseInt(formData.role, 10) === 1} 
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="rolePMModal">Project Manager</label>
                  </div>
                </div>

                {parseInt(formData.role, 10) === 1 && (
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="approvePM"
                        id="approvePMModal"
                        checked={formData.approvePM}
                        onChange={handleChange}
                      />
                      <label className="form-check-label text-success fw-bold" htmlFor="approvePMModal">
                        Approve user immediately
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer border-0 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-light fw-semibold" disabled={isLoading}>
                  {isLoading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
