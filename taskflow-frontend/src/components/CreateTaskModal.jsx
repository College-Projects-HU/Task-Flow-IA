import { useState, useEffect } from "react";
import { getProjectMembers, createTask } from "../services/api";

const CreateTaskModal = ({ show, handleClose, projectId, onTaskCreated }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    dueDate: "",
    assignedUserId: "",
  });

  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
      assignedUserId: "",
    });
    setError("");
  };

  useEffect(() => {
    if (show && projectId) {
      getProjectMembers(projectId)
        .then((data) => setMembers(data))
        .catch((err) => console.error("Failed to load members", err));
    } else if (!show) {
      resetForm();
    }
  }, [show, projectId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError(""); // clear error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (form.dueDate) {
      const selectedDate = new Date(form.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        setError("Due Date must be in the future.");
        return;
      }
    }

    try {
      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        description: form.description || null,
        priority: form.priority,
        status: "ToDo",
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        assignedUserId: form.assignedUserId ? parseInt(form.assignedUserId, 10) : null,
      };

      await createTask(projectId, payload);
      await onTaskCreated();
      handleClose();
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Failed to create task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop fade show" style={{ backdropFilter: "blur(5px)" }}></div>

      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content custom-modal bg-dark text-white border border-secondary shadow-lg">
            
            <div className="modal-header border-0">
              <h5 className="modal-title fw-bold">Add Task</h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                onClick={handleClose}
              ></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && <div className="alert alert-danger p-2">{error}</div>}
                
                <div className="mb-3">
                  <label className="form-label">Title *</label>
                  <input
                    type="text"
                    name="title"
                    className="form-control"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Enter task title..."
                    required
                  />
                </div>

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

                <div className="mb-3">
                  <label className="form-label">Priority</label>
                  <select
                    name="priority"
                    className="form-select"
                    value={form.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Due Date</label>
                  <input
                    type="date"
                    name="dueDate"
                    className="form-control"
                    value={form.dueDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Assigned Member</label>
                  <select
                    name="assignedUserId"
                    className="form-select"
                    value={form.assignedUserId}
                    onChange={handleChange}
                  >
                    <option value="">-- Unassigned --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.fullName || m.name || m.email || m.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer border-0 d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-outline-light"
                  onClick={handleClose}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-light fw-semibold" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateTaskModal;
