import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  uploadAttachment,
  getAttachments,
  getTaskById,
  deleteAttachment,
} from "../services/api";
import DashboardLayout from "../components/DashboardLayout";
import "./ProjectsPage.css";

const TaskAttachments = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [taskData, attachmentsData] = await Promise.all([
        getTaskById(taskId),
        getAttachments(taskId),
      ]);
      setTask({
        id: taskData?.id ?? taskData?.Id,
        title: taskData?.title ?? taskData?.Title ?? "Untitled task",
        projectName:
          taskData?.projectName ?? taskData?.ProjectName ?? "Project",
        projectId: taskData?.projectId ?? taskData?.ProjectId ?? null,
      });
      setFiles(attachmentsData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [taskId]);

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await uploadAttachment(taskId, formData, (event) => {
        const percent = Math.round((event.loaded * 100) / event.total);
        setProgress(percent);
      });

      setSelectedFile(null);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
      const updatedFiles = await getAttachments(taskId);
      setFiles(updatedFiles);
    } catch (err) {
      console.log(err);
      setProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const getFileName = (filePath) => {
    if (!filePath) return "Attachment";
    return filePath.split("/").pop();
  };

  const handleDelete = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this attachment?"))
      return;
    try {
      await deleteAttachment(fileId);
      setFiles(files.filter((f) => f.id !== fileId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete attachment. You might not have permission.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Task Attachments" activeItem="tasks">
        <div className="projects-page">
          <div className="empty-state">
            <h4>Loading attachments...</h4>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!task) {
    return (
      <DashboardLayout title="Task Attachments" activeItem="tasks">
        <div className="projects-page">
          <div className="empty-state">
            <h4>Task not found</h4>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Task Attachments"
      activeItem="tasks"
      subtitle={`${task.projectName} / Task ID-${task.id} / Attachments`}
    >
      <div className="projects-page project-detail-page">
        <section className="project-detail-hero">
          <div className="project-detail-heading">
            <p className="projects-eyebrow">
              {task.projectName} / Task ID-{task.id} / Attachments
            </p>
            <div className="project-detail-title-row">
              <h2>{task.title} - Files</h2>
            </div>
            <p className="project-detail-description">
              Manage and view all files attached to this task.
            </p>
          </div>

          <div className="project-detail-actions">
            <button
              type="button"
              className="task-action-btn"
              onClick={() => {
                if (task.projectId) {
                  navigate(`/projects/${task.projectId}`);
                } else {
                  navigate(-1);
                }
              }}
            >
              Back to Project
            </button>
          </div>
        </section>

        <section className="project-task-shell">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1.2rem",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              border: "1px solid #dfe9f7",
              marginBottom: "1.5rem",
              boxShadow: "0 4px 12px rgba(148, 163, 184, 0.05)",
            }}
          >
            <input
              type="file"
              className="form-control"
              ref={fileInputRef}
              style={{
                flex: 1,
                border: "1px solid #cfdbec",
                borderRadius: "10px",
                padding: "0.6rem 1rem",
                color: "#1e293b",
                backgroundColor: "#f8fafc",
              }}
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
            <button
              type="button"
              className="create-btn"
              onClick={handleUpload}
              disabled={!selectedFile || progress > 0}
              style={{
                padding: "0.6rem 1.5rem",
                minWidth: "140px",
                opacity: !selectedFile || progress > 0 ? 0.7 : 1,
                cursor:
                  !selectedFile || progress > 0 ? "not-allowed" : "pointer",
              }}
            >
              {progress > 0 ? `Uploading ${progress}%` : "Upload File"}
            </button>
          </div>

          {progress > 0 && (
            <div
              style={{
                width: "100%",
                backgroundColor: "#e4ecf8",
                height: "8px",
                borderRadius: "4px",
                marginBottom: "1.5rem",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  backgroundColor: "#2968d8",
                  height: "100%",
                  borderRadius: "4px",
                  transition: "width 0.2s ease-in-out",
                }}
              ></div>
            </div>
          )}

          <div
            className="project-task-head"
            style={{ gridTemplateColumns: "3fr 1fr 1fr" }}
          >
            <span>File Name</span>
            <span>Size</span>
            <span>Actions</span>
          </div>

          {files.length > 0 ? (
            <div className="project-task-list">
              {files.map((file) => (
                <article
                  key={file.id}
                  className="project-task-row"
                  style={{ gridTemplateColumns: "3fr 1fr 1fr" }}
                >
                  <div className="project-task-main">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "42px",
                          height: "42px",
                          backgroundColor: "#f1f5f9",
                          borderRadius: "10px",
                        }}
                      >
                        📄
                      </span>
                      <div>
                        <p
                          className="project-task-title"
                          style={{ margin: 0, fontSize: "1.05rem" }}
                        >
                          {file.fileName || getFileName(file.url)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="project-task-date-group">
                    <div>
                      <span>Size</span>
                      <strong>{(file.fileSize / 1024).toFixed(1)} KB</strong>
                    </div>
                  </div>

                  <div
                    className="project-task-actions"
                    style={{ justifyContent: "flex-start", gap: "0.5rem" }}
                  >
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      download={file.fileName}
                      className="task-action-btn"
                      style={{
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0.55rem 1rem",
                      }}
                    >
                      Download
                    </a>
                    <button
                      type="button"
                      className="task-action-btn"
                      onClick={() => handleDelete(file.id)}
                      style={{
                        color: "#d24b4b",
                        borderColor: "#fecaca",
                        backgroundColor: "#fff5f5",
                        padding: "0.55rem 1rem",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: "3rem 1rem" }}>
              <span
                style={{
                  fontSize: "3rem",
                  marginBottom: "1rem",
                  display: "block",
                }}
              >
                📭
              </span>
              <h4>No files uploaded yet</h4>
              <p
                style={{
                  color: "#64748b",
                  maxWidth: "400px",
                  margin: "0 auto",
                }}
              >
                Select a file and click Upload to add an attachment to this
                task.
              </p>
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
};

export default TaskAttachments;
