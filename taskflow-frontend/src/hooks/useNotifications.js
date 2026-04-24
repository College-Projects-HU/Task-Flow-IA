import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { API_ORIGIN } from "../services/api";
import { getNotifications, markNotificationAsRead } from "../services/api";

const useNotifications = (token) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      return undefined;
    }

    let isMounted = true;
    let fallbackIntervalId = null;

    const loadNotifications = async (preserveReadState = false) => {
      try {
        const data = await getNotifications();
        if (isMounted) {
          setNotifications((current) => {
            const next = Array.isArray(data) ? data : [];

            if (!preserveReadState) {
              return next;
            }

            return next.map((notification) => {
              const notificationId = notification?.id ?? notification?.Id;
              const existing = current.find((item) => {
                const currentId = item?.id ?? item?.Id;
                return currentId === notificationId;
              });

              if (!existing) {
                return notification;
              }

              const wasRead = existing?.isRead ?? existing?.IsRead ?? false;
              return wasRead
                ? { ...notification, isRead: true, IsRead: true }
                : notification;
            });
          });
        }
      } catch (error) {
        console.error("Failed to load notifications", error);
      }
    };

    loadNotifications();

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_ORIGIN}/hubs/notifications`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("NewNotification", (notification) => {
      if (!isMounted) {
        return;
      }

      setNotifications((current) => {
        const notificationId = notification?.id ?? notification?.Id;
        const alreadyExists = current.some((item) => {
          const currentId = item?.id ?? item?.Id;
          return currentId === notificationId;
        });

        return alreadyExists ? current : [notification, ...current];
      });
    });

    connection.onreconnected(() => {
      loadNotifications(true);
      if (fallbackIntervalId) {
        window.clearInterval(fallbackIntervalId);
        fallbackIntervalId = null;
      }
    });

    connection.onclose(() => {
      if (!fallbackIntervalId) {
        fallbackIntervalId = window.setInterval(() => {
          loadNotifications(true);
        }, 15000);
      }
    });

    connection.start().catch((error) => {
      console.error("Notification hub connection failed", error);
      if (!fallbackIntervalId) {
        fallbackIntervalId = window.setInterval(() => {
          loadNotifications(true);
        }, 15000);
      }
    });

    return () => {
      isMounted = false;
      if (fallbackIntervalId) {
        window.clearInterval(fallbackIntervalId);
      }
      connection.stop().catch(() => {});
    };
  }, [token]);

  const markAsRead = async (notificationId) => {
    await markNotificationAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId || notification.Id === notificationId
          ? { ...notification, isRead: true, IsRead: true }
          : notification,
      ),
    );
  };

  return { notifications, markAsRead };
};

export default useNotifications;
