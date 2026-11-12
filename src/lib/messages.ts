/* ------------------------------------------------------------------ */
/* Messages: practice-inbox data layer (demo data).                    */
/* Conversations arrive from three channels: the patient portal, text, */
/* and the practice's connected email inbox. Email threads only exist  */
/* for senders whose address matches a patient's verified address.    */
/* ------------------------------------------------------------------ */

export type Channel = "email" | "portal" | "text";
export type ConvoStatus = "needs-reply" | "done";
export type Assignee = "Dr. Sarah Chen" | "Clinical pool" | "Front desk" | "Unassigned";

export const ASSIGNEES: Assignee[] = [
  "Dr. Sarah Chen",
  "Clinical pool",
  "Front desk",
  "Unassigned",
];

export interface ThreadMessage {
  from: "patient" | "clinician";
  text: string;
  time: string;
}

export interface Conversation {
  patientId: string;
  channel: Channel;
  unread: number;
  status: ConvoStatus;
  assignee: Assignee;
  priority?: "high";
  /** When the thread started and how, shown as a divider in the thread. */
  origin: string;
  messages: ThreadMessage[];
}

export const CHANNEL_LABEL: Record<Channel, string> = {
  email: "Email",
  portal: "Portal",
  text: "Text",
};

export const SEED_CONVERSATIONS: Conversation[] = [
  {
    patientId: "p1",
    channel: "email",
    unread: 2,
    status: "needs-reply",
    assignee: "Dr. Sarah Chen",
    origin: "Started by email · matched to Marta's verified address",
    messages: [
      {
        from: "patient",
        text: "Hi Dr. Chen - the chest tightness is much better this week.",
        time: "Tue 4:02 PM",
      },
      {
        from: "clinician",
        text: "Great to hear. Keep tracking your morning BP and we'll review at your next visit.",
        time: "Tue 4:20 PM",
      },
      { from: "patient", text: "Will do. Should I keep avoiding coffee?", time: "Tue 4:31 PM" },
      {
        from: "clinician",
        text: "Try one small cup and note any palpitations. I'll message you a follow-up form in a week.",
        time: "Tue 4:45 PM",
      },
      {
        from: "patient",
        text: "Morning readings are in: 128/82, 126/80, 131/84. I added them to the form as well.",
        time: "Today 8:47 AM",
      },
      {
        from: "patient",
        text: "Also, is it okay to restart my evening walks?",
        time: "Today 9:12 AM",
      },
    ],
  },
  {
    patientId: "p2",
    channel: "portal",
    unread: 1,
    status: "needs-reply",
    assignee: "Clinical pool",
    origin: "Started in the patient portal",
    messages: [
      {
        from: "patient",
        text: "Hi, my metformin runs out on Friday. Could I get a refill sent to the usual pharmacy?",
        time: "Today 8:15 AM",
      },
    ],
  },
  {
    patientId: "p3",
    channel: "text",
    unread: 0,
    status: "needs-reply",
    assignee: "Front desk",
    origin: "Started by text message",
    messages: [
      {
        from: "patient",
        text: "Hello, I need to move Thursday's appointment if possible.",
        time: "Yesterday 3:40 PM",
      },
      {
        from: "clinician",
        text: "Of course. I can offer Friday 10:30 AM or Monday 9:00 AM. Which suits you better?",
        time: "Yesterday 3:52 PM",
      },
      { from: "patient", text: "Friday 10:30 works, thank you!", time: "Yesterday 4:05 PM" },
    ],
  },
  {
    patientId: "p4",
    channel: "email",
    unread: 0,
    status: "done",
    assignee: "Dr. Sarah Chen",
    origin: "Started by email · matched to Samuel's verified address",
    messages: [
      {
        from: "patient",
        text: "Confirming our appointment next week.",
        time: "Yesterday 11:18 AM",
      },
      {
        from: "clinician",
        text: "Confirmed, see you Tuesday at 9:30 AM.",
        time: "Yesterday 11:40 AM",
      },
      { from: "patient", text: "Thanks, Doctor. See you then.", time: "Yesterday 11:41 AM" },
    ],
  },
  {
    patientId: "p5",
    channel: "portal",
    unread: 3,
    status: "needs-reply",
    assignee: "Unassigned",
    priority: "high",
    origin: "Started in the patient portal",
    messages: [
      {
        from: "patient",
        text: "Since the visit I've felt dizzy twice when standing up quickly.",
        time: "Tue 6:12 PM",
      },
      {
        from: "patient",
        text: "It passes after a minute or so, but it is new.",
        time: "Tue 6:13 PM",
      },
      {
        from: "patient",
        text: "Should I stop the new tablet until I hear from you?",
        time: "Tue 6:14 PM",
      },
    ],
  },
  {
    patientId: "p6",
    channel: "email",
    unread: 0,
    status: "done",
    assignee: "Clinical pool",
    origin: "Started by email · matched to Lukas's verified address",
    messages: [
      {
        from: "patient",
        text: "My insurer needs the visit summary from October. Can you send it over?",
        time: "Mon 9:03 AM",
      },
      {
        from: "clinician",
        text: "Sent securely this morning. Let us know if they need anything else.",
        time: "Mon 10:26 AM",
      },
    ],
  },
];

/* ------------------------- inbox connection ------------------------ */

export interface InboxConnection {
  connected: boolean;
  provider: "Google Workspace" | "Microsoft 365";
  address: string;
  lastSyncMins: number;
  autoImport: boolean;
  notifyPatients: boolean;
  allowAttachments: boolean;
}

export const DEFAULT_INBOX: InboxConnection = {
  connected: true,
  provider: "Google Workspace",
  address: "care@ridgemont.health",
  lastSyncMins: 4,
  autoImport: true,
  notifyPatients: true,
  allowAttachments: true,
};

const INBOX_KEY = "rhea.inbox.v1";

export function loadInbox(): InboxConnection {
  try {
    const raw = localStorage.getItem(INBOX_KEY);
    if (raw) return { ...DEFAULT_INBOX, ...(JSON.parse(raw) as Partial<InboxConnection>) };
  } catch {
    /* storage unavailable: fall through to the default */
  }
  return DEFAULT_INBOX;
}

export function saveInbox(conn: InboxConnection) {
  try {
    localStorage.setItem(INBOX_KEY, JSON.stringify(conn));
  } catch {
    /* storage unavailable: state still updates in memory */
  }
}
