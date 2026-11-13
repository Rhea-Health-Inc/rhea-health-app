import { Calendar, CheckCheck, MessageSquare, Mic, Sparkles, UserCheck } from "lucide-react";
import type { AppNotification, NotificationKind } from "@/lib/notifications";

const KIND_ICONS: Record<NotificationKind, typeof MessageSquare> = {
  message: MessageSquare,
  review: Sparkles,
  device: Mic,
  schedule: Calendar,
  assignment: UserCheck,
};

/**
 * The notifications popover that opens from the bell in the sidebar footer.
 * Rendered inside a relatively positioned container in the footer card; it
 * opens upward and over the main content. Clicking an item marks it read and
 * navigates to the screen it points to (handled by the caller).
 */
export function NotificationsPanel({
  notifications,
  unreadCount,
  onSelect,
  onMarkAllRead,
  onClose,
}: {
  notifications: AppNotification[];
  unreadCount: number;
  onSelect: (n: AppNotification) => void;
  onMarkAllRead: () => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-40 cursor-default" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-label="Notifications"
        className="absolute bottom-[calc(100%+10px)] left-0 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl bg-card hairline shadow-[var(--shadow-clinik-lg)] overflow-hidden"
      >
        <div className="flex items-center gap-2 px-4 h-12 border-b border-border/70">
          <span className="text-[14px] font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {unreadCount} new
            </span>
          )}
          <button
            onClick={onMarkAllRead}
            disabled={unreadCount === 0}
            className="ml-auto text-[13px] text-muted-foreground hover:text-foreground transition inline-flex items-center gap-1 disabled:opacity-40 disabled:hover:text-muted-foreground"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        </div>

        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center text-[14px] text-muted-foreground">
            You are all caught up.
          </div>
        ) : (
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border/60">
            {notifications.map((n) => {
              const Icon = KIND_ICONS[n.kind];
              return (
                <button
                  key={n.id}
                  onClick={() => onSelect(n)}
                  className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/60 transition"
                >
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      n.read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="flex items-baseline gap-2">
                      <span
                        className={`flex-1 truncate text-[14px] ${n.read ? "" : "font-medium"}`}
                      >
                        {n.title}
                      </span>
                      <span className="text-[12px] text-muted-foreground shrink-0">{n.when}</span>
                    </span>
                    <span className="block text-[13px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                      {n.body}
                    </span>
                  </span>
                  {!n.read && (
                    <span
                      className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"
                      aria-label="Unread"
                    />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
