import { useState, useEffect } from "react";
import { getProjectMembers, updateTask } from "../services/api";

const statusOrder = ["ToDo", "InProgress", "Done"];

const EditTaskModal = ({ show, handleClose, projectId, task, onTaskUpdated }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "Medium",
    status: "ToDo",
    dueDate: "",
    assignedUserId: "",
  });

  const [members, setMembers] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const currentStatus = task?.status ?? task?.Status ?? "ToDo";
  const currentStatusIndex = statusOrder.indexOf(currentStatus);
  const allowedStatuses = statusOrder.slice(currentStatusIndex >= 0 ? currentStatusIndex : 0);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      priority: "Medium",
      status: "ToDo",
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

  // Pre-fill form when task changes
  useEffect(() => {
    if (task) {
      setForm({
        title: task.title ?? task.Title ?? "",
        description: task.description ?? task.Description ?? "",
        priority: task.priority ?? task.Priority ?? "Medium",
        status: task.status ?? task.Status ?? "ToDo",
        dueDate: task.dueDate ?? task.DueDate
          ? new Date(task.dueDate ?? task.DueDate).toISOString().split("T")[0]
          : "",
        assignedUserId: String(task.assignedUserId ?? task.AssignedUserId ?? ""),
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setError("");
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
      const taskId = task?.id ?? task?.Id;

      if (!taskId) {
        setError("Task ID is missing. Please refresh and try again.");
        return;
      }

      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        description: form.description || null,
        priority: form.priority,
        status: form.status,
        dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
        assignedUserId: form.assignedUserId ? parseInt(form.assignedUserId, 10) : null,
      };

      await updateTask(taskId, payload);
      await onTaskUpdated();
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Failed to update task. Please try again.");
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
              <h5 className="modal-title fw-bold">Edit Task</h5>
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
                  <label className="form-label">Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={form.status}
                    onChange={handleChange}
                  >
                    {allowedStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status === "InProgress" ? "In Progress" : status}
                      </option>
                    ))}
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
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditTaskModal;
