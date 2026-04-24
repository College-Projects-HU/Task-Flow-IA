import { useEffect, useState } from 'react';
import * as signalR from '@microsoft/signalr';

const useNotifications = (token) => {
    const [notifications, setNotifications] = useState([]);
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        if (!token) return;

        // 1. إنشاء الاتصال مع تمرير الـ JWT
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:5001/hubs/notifications", {
                accessTokenFactory: () => token // تمرير الـ JWT هنا
            })
            .withAutomaticReconnect()
            .build();

        // 2. الاستماع لحدث 'NewNotification'
        newConnection.on("NewNotification", (notification) => {
            setNotifications((prev) => [notification, ...prev]);
        });

        // 3. تشغيل الاتصال
        newConnection.start()
            .then(() => console.log("SignalR Connected!"))
            .catch((err) => console.error("Connection failed: ", err));

        setConnection(newConnection);

        // 4. Cleanup (عند الـ unmount) - فصل الاتصال
        return () => {
            newConnection.stop();
        };
    }, [token]);

    return { notifications, connection };
};

export default useNotifications;