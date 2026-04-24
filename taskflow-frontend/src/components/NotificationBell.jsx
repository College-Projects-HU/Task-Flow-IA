import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const normalizeNotification = (notification) => ({
  id: notification?.id ?? notification?.Id,
  message: notification?.message ?? notification?.Message ?? "New notification",
  taskId: notification?.taskId ?? notification?.TaskId,
  isRead: notification?.isRead ?? notification?.IsRead ?? false,
  createdAt: notification?.createdAt ?? notification?.CreatedAt ?? null,
});

const formatTimestamp = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function NotificationBell({ notifications, onNotificationRead }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const items = useMemo(
    () => notifications.map(normalizeNotification),
    [notifications],
  );

  const unreadCount = items.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await onNotificationRead(notification.id);
      }
      setIsOpen(false);
      if (notification.taskId) {
        navigate(`/tasks/${notification.taskId}`);
      }
    } catch (error) {
      console.error("Failed to update notification", error);
    }
  };

  return (
    <div className="notification-container" ref={containerRef}>
      <button
        type="button"
        className="notification-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Notifications"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="notification-icon"
        >
          <path
            d="M12 3a5 5 0 0 0-5 5v2.13c0 .8-.32 1.56-.88 2.12L4.7 13.67A1 1 0 0 0 5.41 15h13.18a1 1 0 0 0 .71-1.71l-1.42-1.42A3 3 0 0 1 17 10.13V8a5 5 0 0 0-5-5Zm0 18a3 3 0 0 0 2.82-2h-5.64A3 3 0 0 0 12 21Z"
            fill="currentColor"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown">
          <div className="notification-dropdown-header">
            <strong>Notifications</strong>
          </div>

          {items.length === 0 ? (
            <p className="notification-empty">No notifications yet.</p>
          ) : (
            <div className="notification-list">
              {items.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  className={`notification-item ${notification.isRead ? "" : "unread"}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <span className="notification-message">{notification.message}</span>
                  {notification.createdAt && (
                    <span className="notification-time">
                      {formatTimestamp(notification.createdAt)}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
