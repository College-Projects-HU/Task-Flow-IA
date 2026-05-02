import { useState } from "react";

const CreateProjectModal = ({ show, handleClose, onCreate }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.startDate && form.endDate) {
      if (new Date(form.startDate) > new Date(form.endDate)) {
        setError("Start date cannot be after the end date.");
        return;
      }
    }

    const newProject = {
      id: Date.now(),
      ...form,
      taskCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    try {
      setIsSubmitting(true);
      await onCreate(newProject);
      setForm({ name: "", description: "", startDate: "", endDate: "" });
      handleClose();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to create project. Please check your inputs.";
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* 🔥 Overlay */}
      <div
        className="modal-backdrop fade show"
        style={{ backdropFilter: "blur(5px)" }}
      ></div>

      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content custom-modal bg-dark text-white border border-secondary shadow-lg">
            
            {/* Header */}
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Create Project</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
                disabled={isSubmitting}
              ></button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-3">
                <div className="alert alert-danger py-2 mb-0" role="alert">
                  {error}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter project name..."
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter description..."
                    rows="3"
                  />
                </div>

                {/* Start Date */}
                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    className="form-control"
                    value={form.startDate}
                    onChange={handleChange}
                  />
                </div>

                {/* End Date */}
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    className="form-control"
                    value={form.endDate}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-light fw-semibold" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </>
  );
};

export default CreateProjectModal;