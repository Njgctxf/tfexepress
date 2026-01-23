import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";

const AdminNotificationsContext = createContext();

export const AdminNotificationsProvider = ({ children }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (user) {
            fetchNotifications();

            // Real-time subscription
            const subscription = supabase
                .channel("admin_notifications")
                .on(
                    "postgres_changes",
                    { event: "INSERT", schema: "public", table: "admin_notifications" },
                    (payload) => {
                        // Add new notification to list
                        setNotifications((prev) => [payload.new, ...prev]);
                        if (!payload.new.read) {
                            setUnreadCount((prev) => prev + 1);
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(subscription);
            };
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from("admin_notifications")
                .select("*")
                .order("created_at", { ascending: false })
                .limit(50); // Limit to last 50 for performance

            if (error) throw error;
            setNotifications(data || []);
            setUnreadCount((data || []).filter((n) => !n.read).length);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    };

    const markAsRead = async (id) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            const { error } = await supabase
                .from("admin_notifications")
                .update({ read: true })
                .eq("id", id);

            if (error) throw error;
        } catch (error) {
            console.error("Error marking as read:", error);
            fetchNotifications(); // Revert on error
        }
    };

    const markAllAsRead = async () => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);

            const { error } = await supabase
                .from("admin_notifications")
                .update({ read: true })
                .eq("read", false); // Only update unread ones

            if (error) throw error;
        } catch (error) {
            console.error("Error marking all as read:", error);
            fetchNotifications();
        }
    };

    const deleteNotification = async (id) => {
        try {
            // Optimistic update
            const wasUnread = notifications.find(n => n.id === id)?.read === false;
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1));

            const { error } = await supabase
                .from("admin_notifications")
                .delete()
                .eq("id", id);

            if (error) throw error;
        } catch (error) {
            console.error("Error deleting notification:", error);
            fetchNotifications();
        }
    };

    return (
        <AdminNotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification }}>
            {children}
        </AdminNotificationsContext.Provider>
    );
};

export const useAdminNotifications = () => useContext(AdminNotificationsContext);
