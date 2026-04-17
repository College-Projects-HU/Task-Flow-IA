import { useState } from "react";

const CreateProjectModal = ({ show, handleClose, onCreate }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newProject = {
      id: Date.now(),
      ...form,
      taskCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };

    onCreate(newProject);
    handleClose();

    setForm({ name: "", description: "" });
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
          <div className="modal-content custom-modal">
            
            {/* Header */}
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Create Project</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
              ></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                
                {/* Name */}
                <div className="mb-3">
                  <label className="form-label">Project Name</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control custom-input"
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
                    className="form-control custom-input"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Enter description..."
                    rows="3"
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer border-0 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={handleClose}
                >
                  Cancel
                </button>

                <button type="submit" className="btn btn-light">
                  Create
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