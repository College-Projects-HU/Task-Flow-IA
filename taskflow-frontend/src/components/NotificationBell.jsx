import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa'; 
import axios from 'axios';

const NotificationBell = ({ notifications, token }) => {
    const [isOpen, setIsOpen] = useState(false);

    // حساب عدد الإشعارات غير المقروءة
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = async (notificationId) => {
        try {
            
            await axios.patch(`https://localhost:5001/api/notifications/${notificationId}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // window.location.href = `/tasks/${notification.taskId}`;
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    return (
        <div className="notification-container">
            <div className="bell-icon" onClick={() => setIsOpen(!isOpen)}>
                <FaBell />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    {notifications.length === 0 ? (
                        <p>No new notifications</p>
                    ) : (
                        notifications.map((n) => (
                            <div
                                key={n.id}
                                className={`notification-item ${!n.isRead ? 'unread' : ''}`}
                                onClick={() => handleNotificationClick(n.id)}
                            >
                                <p>{n.message}</p>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;