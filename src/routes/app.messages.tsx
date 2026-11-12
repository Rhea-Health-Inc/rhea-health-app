import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Send,
  Paperclip,
  FileText,
  Share2,
  Mail,
  MessagesSquare,
  Smartphone,
  Search,
  Flag,
  Check,
  ShieldAlert,
  Plug,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { APPOINTMENTS } from "@/lib/mock";
import {
  ASSIGNEES,
  CHANNEL_LABEL,
  SEED_CONVERSATIONS,
  type Assignee,
  type Channel,
  type Conversation,
} from "@/lib/messages";
import { useInboxConnection } from "@/hooks/use-inbox-connection";

export const Route = createFileRoute("/app/messages")({
  component: Messages,
});

const PATIENTS = new Map(APPOINTMENTS.map((a) => [a.patient.id, a.patient]));
const CHANNEL_ICON: Record<Channel, LucideIcon> = {
  email: Mail,
  portal: MessagesSquare,
  text: Smartphone,
};

type Filter = "all" | "needs-reply" | "unassigned" | "done";

function Messages() {
  const { inbox } = useInboxConnection();
  const [convos, setConvos] = useState<Conversation[]>(SEED_CONVERSATIONS);
  const [activeId, setActiveId] = useState(SEED_CONVERSATIONS[0].patientId);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState("");

  const active = convos.find((c) => c.patientId === activeId) ?? convos[0];
  const activePatient = PATIENTS.get(active.patientId)!;

  const counts = useMemo(
    () => ({
      all: convos.length,
      "needs-reply": convos.filter((c) => c.status === "needs-reply").length,
      unassigned: convos.filter((c) => c.assignee === "Unassigned").length,
      done: convos.filter((c) => c.status === "done").length,
    }),
    [convos],
  );
  const totalUnread = convos.reduce((n, c) => n + c.unread, 0);

  const visible = convos.filter((c) => {
    if (filter === "needs-reply" && c.status !== "needs-reply") return false;
    if (filter === "unassigned" && c.assignee !== "Unassigned") return false;
    if (filter === "done" && c.status !== "done") return false;
    if (query) {
      const p = PATIENTS.get(c.patientId);
      const last = c.messages[c.messages.length - 1]?.text ?? "";
      return `${p?.name ?? ""} ${last}`.toLowerCase().includes(query.toLowerCase());
    }
    return true;
  });

  const patch = (patientId: string, p: Partial<Conversation>) =>
    setConvos((prev) => prev.map((c) => (c.patientId === patientId ? { ...c, ...p } : c)));

  const open = (c: Conversation) => {
    setActiveId(c.patientId);
    if (c.unread) patch(c.patientId, { unread: 0 });
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setConvos((prev) =>
      prev.map((c) =>
        c.patientId === active.patientId
          ? { ...c, messages: [...c.messages, { from: "clinician" as const, text, time: "Now" }] }
          : c,
      ),
    );
    setDraft("");
  };

  return (
    <div className="flex flex-col min-h-screen max-h-screen">
      {/* inbox connection strip */}
      <div className="flex items-center gap-3 border-b border-border/70 px-6 py-3">
        {inbox.connected ? (
          <>
            <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            <p className="text-[13px] text-muted-foreground">
              Practice inbox connected · <span className="text-foreground">{inbox.address}</span> (
              {inbox.provider}) · Synced {inbox.lastSyncMins} min ago
            </p>
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />
            <p className="text-[13px] text-muted-foreground">
              Practice inbox not connected. Patient emails won&apos;t appear here.
            </p>
          </>
        )}
        <Link
          to="/app/settings/inbox"
          className="ml-auto inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground hover:underline underline-offset-4"
        >
          <Plug className="w-3.5 h-3.5" /> Inbox settings
        </Link>
      </div>

      <div className="grid grid-cols-12 flex-1 min-h-0">
        {/* ------------------------- triage list ------------------------- */}
        <aside className="col-span-4 border-r border-border/70 flex flex-col min-h-0">
          <div className="p-4 pb-3">
            <div className="flex items-baseline gap-2 px-1">
              <h1 className="text-[17px] font-semibold">Messages</h1>
              {totalUnread > 0 && (
                <span className="text-[13px] text-muted-foreground">{totalUnread} unread</span>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              <FilterPill active={filter === "all"} onClick={() => setFilter("all")}>
                All · {counts.all}
              </FilterPill>
              <FilterPill
                active={filter === "needs-reply"}
                onClick={() => setFilter("needs-reply")}
              >
                Needs reply · {counts["needs-reply"]}
              </FilterPill>
              <FilterPill active={filter === "unassigned"} onClick={() => setFilter("unassigned")}>
                Unassigned · {counts.unassigned}
              </FilterPill>
              <FilterPill active={filter === "done"} onClick={() => setFilter("done")}>
                Done · {counts.done}
              </FilterPill>
            </div>
            <div className="mt-3 flex items-center gap-2 rounded-full hairline bg-card px-4 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search patients or messages…"
                className="flex-1 bg-transparent text-[14px] outline-none min-w-0"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {visible.length === 0 && (
              <p className="px-3 py-8 text-[14px] text-muted-foreground text-center">
                Nothing here. New patient messages will appear in this list.
              </p>
            )}
            {visible.map((c) => {
              const p = PATIENTS.get(c.patientId)!;
              const last = c.messages[c.messages.length - 1];
              const Icon = CHANNEL_ICON[c.channel];
              const isActive = c.patientId === activeId;
              return (
                <button
                  key={c.patientId}
                  onClick={() => open(c)}
                  className={`w-full text-left p-3 rounded-2xl transition ${
                    isActive ? "bg-primary/10" : "hover:bg-muted"
                  } ${c.status === "done" ? "opacity-70" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={p.photo}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {c.priority === "high" && (
                          <Flag
                            className="w-3.5 h-3.5 text-red-600 shrink-0"
                            aria-label="Priority"
                          />
                        )}
                        <span
                          className={`text-[14px] truncate ${c.unread ? "font-semibold" : "font-medium"}`}
                        >
                          {p.name}
                        </span>
                        <span className="ml-auto text-[12px] text-muted-foreground shrink-0">
                          {last?.time.replace(/^(Today|Yesterday|Mon|Tue|Wed|Thu|Fri) /, "") ?? ""}
                        </span>
                      </div>
                      <div
                        className={`mt-0.5 text-[13px] truncate ${c.unread ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        {last?.from === "clinician" ? "You: " : ""}
                        {last?.text}
                      </div>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          <Icon className="w-3 h-3" /> {CHANNEL_LABEL[c.channel]}
                        </span>
                        <span className="text-[12px] text-muted-foreground">{c.assignee}</span>
                        {c.status === "done" && (
                          <span className="inline-flex items-center gap-1 text-[12px] text-muted-foreground">
                            <Check className="w-3 h-3" /> Done
                          </span>
                        )}
                        {c.unread > 0 && (
                          <span className="ml-auto inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                            {c.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* ---------------------------- thread ---------------------------- */}
        <section className="col-span-8 flex flex-col min-h-0 max-h-full">
          <div className="h-16 border-b border-border/70 px-6 flex items-center gap-3 shrink-0">
            <img src={activePatient.photo} className="w-9 h-9 rounded-full object-cover" alt="" />
            <div>
              <div className="text-[14px] font-medium leading-tight">{activePatient.name}</div>
              <div className="text-[13px] text-muted-foreground leading-tight">
                {activePatient.mrn} · Verified via email + phone
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <QuickBtn icon={FileText}>Share visit summary</QuickBtn>
              <QuickBtn icon={Share2}>Send referral</QuickBtn>
            </div>
          </div>

          <div className="flex items-center gap-3 border-b border-border/70 bg-muted/40 px-6 py-2.5 shrink-0">
            <p className="flex items-center gap-2 text-[12.5px] text-muted-foreground min-w-0">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span className="truncate">
                Patients are told replies come within 2 business days, and that messaging isn&apos;t
                for emergencies.
              </span>
            </p>
            <div className="ml-auto flex items-center gap-2 shrink-0">
              <select
                value={active.assignee}
                onChange={(e) => patch(active.patientId, { assignee: e.target.value as Assignee })}
                aria-label="Assign conversation"
                className="h-9 rounded-full hairline bg-card pl-4 text-[13px] outline-none"
              >
                {ASSIGNEES.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              <button
                onClick={() =>
                  patch(active.patientId, {
                    status: active.status === "done" ? "needs-reply" : "done",
                  })
                }
                className="h-9 px-4 rounded-full hairline bg-card text-[13px] font-medium hover:bg-muted transition inline-flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                {active.status === "done" ? "Reopen" : "Mark done"}
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-3">
            <p className="text-center text-[12px] uppercase tracking-wider text-muted-foreground pb-2">
              {active.origin}
            </p>
            {active.messages.map((m, i) => (
              <Bubble key={i} side={m.from === "clinician" ? "me" : "them"} time={m.time}>
                {m.text}
              </Bubble>
            ))}
          </div>

          <div className="p-4 border-t border-border/70 shrink-0">
            <div className="flex items-center gap-2 rounded-2xl hairline bg-card px-4 py-3">
              <button className="rounded-full p-1.5 -m-1 text-muted-foreground hover:text-foreground hover:bg-muted transition">
                <Paperclip className="w-4 h-4" />
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Write a secure message…"
                className="flex-1 bg-transparent text-[14px] outline-none min-w-0"
              />
              <button
                onClick={send}
                className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-[14px] inline-flex items-center gap-1.5 hover:opacity-90 transition"
              >
                <Send className="w-3.5 h-3.5" /> Send
              </button>
            </div>
            <p className="mt-2.5 px-1 text-[12px] text-muted-foreground">
              The patient is notified by email, and the notification itself never contains health
              details.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`h-8 px-3.5 rounded-full text-[13px] font-medium transition ${
        active
          ? "bg-foreground text-background"
          : "hairline bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Bubble({
  side,
  time,
  children,
}: {
  side: "me" | "them";
  time: string;
  children: ReactNode;
}) {
  return (
    <div className={`flex flex-col ${side === "me" ? "items-end" : "items-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
          side === "me" ? "bg-primary/10 text-foreground" : "bg-muted text-foreground"
        }`}
      >
        {children}
      </div>
      <span className="mt-1 px-1 text-[11px] text-muted-foreground">{time}</span>
    </div>
  );
}

function QuickBtn({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <button
      type="button"
      className="h-10 px-4 rounded-full hairline bg-card text-[14px] text-foreground hover:bg-muted transition inline-flex items-center gap-1.5"
    >
      <Icon className="w-3.5 h-3.5" /> {children}
    </button>
  );
}
