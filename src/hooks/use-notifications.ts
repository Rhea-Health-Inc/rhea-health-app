import { useCallback, useMemo, useState } from "react";
import { loadNotifications, saveNotifications, type AppNotification } from "@/lib/notifications";

/** The signed-in clinician's notifications, with read state persisted. */
export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>(loadNotifications);

  const markRead = useCallback((id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, read: true } : n));
      saveNotifications(next);
      return next;
    });
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, read: true }));
      saveNotifications(next);
      return next;
    });
  }, []);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.read).length, [notifications]);

  return { notifications, unreadCount, markRead, markAllRead };
}
