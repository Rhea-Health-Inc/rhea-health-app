/**
 * Notifications for the signed-in clinician: new patient messages, AI notes
 * ready for review, device syncs, assignments and schedule changes. Mock
 * store for the demo, persisted to localStorage like the other demo data.
 * Clicking a notification marks it read and opens the screen it points to.
 */

export type NotificationKind = "message" | "review" | "device" | "schedule" | "assignment";

export type NotificationRoute =
  "/app/messages" | "/app/documentation" | "/app/settings/devices" | "/app/schedule";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  when: string;
  read: boolean;
  to: NotificationRoute;
};

const STORAGE_KEY = "rhea.notifications.v1";

const DEFAULT_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    kind: "message",
    title: "New message from Robert Alvarez",
    body: "Morning readings are in: 128/82, 126/80, 131/84.",
    when: "12 min ago",
    read: false,
    to: "/app/messages",
  },
  {
    id: "n2",
    kind: "review",
    title: "2 visit notes are ready for review",
    body: "Drafts from this morning's clinic are waiting in Documentation.",
    when: "1 hr ago",
    read: false,
    to: "/app/documentation",
  },
  {
    id: "n3",
    kind: "device",
    title: "Exam Room 3 Recorder synced",
    body: "This morning's recordings have uploaded and are ready to transcribe.",
    when: "2 hrs ago",
    read: false,
    to: "/app/settings/devices",
  },
  {
    id: "n4",
    kind: "assignment",
    title: "Front desk assigned you a message",
    body: "Priya Nair asked about a prescription renewal. It is waiting in Messages.",
    when: "3 hrs ago",
    read: true,
    to: "/app/messages",
  },
  {
    id: "n5",
    kind: "schedule",
    title: "Your clinic tomorrow starts at 8:30 AM",
    body: "6 patients booked. The first appointment is a follow-up with Marta Kellner.",
    when: "Yesterday",
    read: true,
    to: "/app/schedule",
  },
];

export function loadNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppNotification[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    /* storage unavailable: fall through to the defaults */
  }
  return DEFAULT_NOTIFICATIONS;
}

export function saveNotifications(notifications: AppNotification[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  } catch {
    /* storage unavailable: state still updates in memory */
  }
}
