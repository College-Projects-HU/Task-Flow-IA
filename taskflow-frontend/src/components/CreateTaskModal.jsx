import { useState, useEffect } from "react";
import { getProjectMembers, createTask } from "../services/api";

const normalizeDateOnly = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

const CreateTaskModal = ({ show, handleClose, projects = [], projectId, projectEndDate, onTaskCreated }) => {
  const [form, setForm] = useState({
    projectId: projectId || "",
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
      projectId: projectId || "",
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
      assignedUserId: "",
    });
    setError("");
  };

  // Load members when project is selected
  useEffect(() => {
    if (form.projectId) {
      getProjectMembers(form.projectId)
        .then((data) => setMembers(data))
        .catch((err) => {
          console.error("Failed to load members", err);
          setMembers([]);
        });
    }
  }, [form.projectId, show]);

  useEffect(() => {
    if (!show) {
      resetForm();
    }
  }, [show]);

  const selectedProject = projects.find(
    (project) => String(project.id) === String(form.projectId),
  );
  const selectedProjectEndDate = projectEndDate ?? selectedProject?.endDate ?? null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value,
    });
    setError(""); // clear error on change

    // Reset members and assignedUserId when project changes
    if (name === "projectId") {
      setForm((prevForm) => ({
        ...prevForm,
        projectId: value,
        assignedUserId: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!form.projectId) {
      setError("Please select a project.");
      return;
    }

    if (form.dueDate) {
      const selectedDate = normalizeDateOnly(form.dueDate);
      const today = normalizeDateOnly(new Date());
      
      if (selectedDate <= today) {
        setError("Due Date must be in the future.");
        return;
      }

      const projectEnd = normalizeDateOnly(selectedProjectEndDate);
      if (projectEnd && selectedDate > projectEnd) {
        setError("Due date must be before project ending.");
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

      await createTask(form.projectId, payload);
      await onTaskCreated();
      handleClose();
      resetForm();
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create task. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  const isProjectMode = !projectId; // If projectId not provided, user must select project

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
                
                {isProjectMode && (
                  <div className="mb-3">
                    <label className="form-label">Project *</label>
                    <select
                      name="projectId"
                      className="form-select"
                      value={form.projectId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select a project --</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {projects.length === 0 && (
                      <small className="text-muted">
                        No projects available. Please create a project first from the Projects page.
                      </small>
                    )}
                  </div>
                )}
                
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
                  </select>                  {form.projectId && members.length === 0 && (
                    <small className="text-muted">
                      No members available for this project.
                    </small>
                  )}
                  {!form.projectId && isProjectMode && (
                    <small className="text-muted">
                      Select a project first to load available members.
                    </small>
                  )}                </div>
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
