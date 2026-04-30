import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import FileAttachments from "../components/FileAttachments";
import { AuthContext } from "../context/AuthContext";
import { getTaskById, updateTaskStatus } from "../services/api";
import CommentsSection from "../components/CommentsSection";
import "./TaskDetailPage.css";

const formatDate = (value) => {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return date.toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const getPriorityTone = (priority) => {
  const value = String(priority || "Medium").toLowerCase();
  if (value === "high") return "high";
  if (value === "low") return "low";
  return "medium";
};

const getStatusTone = (status) => {
  if (status === "Done") return "done";
  if (status === "InProgress") return "progress";
  return "todo";
};

const getInitials = (value) => {
  if (!value) {
    return "NA";
  }

  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

function TaskDetailPage({ taskId: propTaskId, onClose }) {
  const params = useParams();
  const taskId = propTaskId || params.taskId;
  const isModal = Boolean(propTaskId);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        setLoading(true);
        const data = await getTaskById(taskId);
        setTask({
          id: data?.id ?? data?.Id,
          title: data?.title ?? data?.Title ?? "Untitled task",
          description: data?.description ?? data?.Description ?? "",
          priority: data?.priority ?? data?.Priority ?? "Medium",
          status: data?.status ?? data?.Status ?? "ToDo",
          dueDate: data?.dueDate ?? data?.DueDate ?? null,
          createdByUserId: data?.createdByUserId ?? data?.CreatedByUserId ?? null,
          createdByUserName: data?.createdByUserName ?? data?.CreatedByUserName ?? "",
          assignedUserId: data?.assignedUserId ?? data?.AssignedUserId ?? null,
          assignedUserName: data?.assignedUserName ?? data?.AssignedUserName ?? "",
          projectId: data?.projectId ?? data?.ProjectId ?? null,
          projectName: data?.projectName ?? data?.ProjectName ?? "Project",
        });
      } catch (err) {
        console.error("Error loading task:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  const ownerName = useMemo(() => {
    return task?.createdByUserName || user?.name || "Unassigned";
  }, [task?.createdByUserName, user?.name]);

  const nextStatus = useMemo(() => {
    if (!task) {
      return null;
    }

    if (task.status === "ToDo") {
      return "InProgress";
    }

    if (task.status === "InProgress") {
      return "Done";
    }

    return null;
  }, [task]);

  const handleClose = () => {
    if (onClose) {
      onClose();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    if (task?.projectId) {
      navigate(`/projects/${task.projectId}`);
      return;
    }

    navigate("/taskboard");
  };

  const handleAdvanceStatus = async () => {
    if (!task || !nextStatus) {
      return;
    }

    try {
      setStatusUpdating(true);
      await updateTaskStatus(task.id, nextStatus);
      setTask((current) => (current ? { ...current, status: nextStatus } : current));
    } catch (error) {
      console.error("Failed to update status", error);
    } finally {
      setStatusUpdating(false);
    }
  };

  const modalContent = (
    <div
      className="taskdetail-stage"
      style={
        isModal
          ? {
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 1050,
              overflowY: "auto",
            }
          : {}
      }
    >
      <div className="taskdetail-backdrop" onClick={handleClose} style={isModal ? { position: "fixed" } : {}} />

      {!isModal && (
        <div className="taskdetail-ghost-list" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="taskdetail-ghost-row" />
          ))}
        </div>
      )}

      <section className="taskdetail-modal" role="dialog" aria-modal="true" style={isModal ? { marginTop: "5vh" } : {}}>
        {loading ? (
          <div className="taskdetail-loading">Loading task...</div>
        ) : !task ? (
          <div className="taskdetail-loading">Task not found</div>
        ) : (
          <>
            <button type="button" className="taskdetail-close" onClick={handleClose}>
              ×
            </button>

            <div className="taskdetail-breadcrumb">
              {task.projectName} / Task ID-{task.id}
            </div>

            <div className="taskdetail-header">
              <div>
                <h2>{task.title}</h2>
              </div>
            </div>

            <div className="taskdetail-meta-grid">
              <div className="taskdetail-meta-row">
                <span>Priority</span>
                <strong className={`taskdetail-chip ${getPriorityTone(task.priority)}`}>
                  {task.priority}
                </strong>
              </div>

              <div className="taskdetail-meta-row">
                <span>Status</span>
                <div className="taskdetail-status-cell">
                  <strong className={`taskdetail-chip ${getStatusTone(task.status)}`}>
                    {task.status === "InProgress" ? "In Progress" : task.status}
                  </strong>
                  {nextStatus && (
                    <button
                      type="button"
                      className="taskdetail-advance-btn"
                      onClick={handleAdvanceStatus}
                      disabled={statusUpdating}
                    >
                      {statusUpdating
                        ? "Saving..."
                        : `Move to ${nextStatus === "InProgress" ? "In Progress" : nextStatus}`}
                    </button>
                  )}
                </div>
              </div>

              <div className="taskdetail-meta-row">
                <span>Owner</span>
                <div className="taskdetail-person">
                  <span className="taskdetail-avatar">{getInitials(ownerName)}</span>
                  <strong>{ownerName}</strong>
                </div>
              </div>

              <div className="taskdetail-meta-row">
                <span>Assignee</span>
                <div className="taskdetail-person">
                  <span className="taskdetail-avatar">
                    {getInitials(task.assignedUserName || "Unassigned")}
                  </span>
                  <strong>{task.assignedUserName || "Unassigned"}</strong>
                </div>
              </div>

              <div className="taskdetail-meta-row">
                <span>Due Date</span>
                <strong>{formatDate(task.dueDate)}</strong>
              </div>
            </div>

            <FileAttachments taskId={task.id} />

            <div className="taskdetail-section">
              <div className="taskdetail-section-header">
                <h3>Description</h3>
              </div>
              <p className="taskdetail-description">
                {task.description || "No description has been added for this task yet."}
              </p>
            </div>

            <CommentsSection taskId={taskId} />
          </>
        )}
      </section>
    </div>
  );

  if (isModal) {
    return modalContent;
  }

  return (
    <DashboardLayout title="Tasks" activeItem="tasks" subtitle="Open task workspace">
      {modalContent}
    </DashboardLayout>
  );
}

export default TaskDetailPage;
