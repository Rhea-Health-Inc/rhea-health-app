import { createFileRoute } from "@tanstack/react-router";
import { Send, Paperclip, FileText, Share2, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { APPOINTMENTS } from "@/lib/mock";

export const Route = createFileRoute("/app/messages")({
  component: Messages,
});

function Messages() {
  const patients = APPOINTMENTS.map((a) => a.patient);
  const [active, setActive] = useState(patients[0]);
  const [msg, setMsg] = useState("");

  return (
    <div className="grid grid-cols-12 min-h-[calc(100vh)] max-h-screen">
      <aside className="col-span-3 border-r border-border/70 p-4 overflow-y-auto">
        <div className="text-[12px] uppercase tracking-wider text-muted-foreground px-2 mb-2">
          Conversations
        </div>
        {patients.map((p) => (
          <button
            key={p.id}
            onClick={() => setActive(p)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
              active.id === p.id ? "bg-primary/10" : "hover:bg-muted"
            }`}
          >
            <img src={p.photo} className="w-9 h-9 rounded-full object-cover" alt="" />
            <div className="flex-1 min-w-0">
              <div className="text-[14px] font-medium truncate">{p.name}</div>
              <div className="text-[14px] text-muted-foreground truncate">
                Thanks, Doctor. See you then.
              </div>
            </div>
            <div className="text-[14px] text-muted-foreground">2h</div>
          </button>
        ))}
      </aside>

      <section className="col-span-9 flex flex-col max-h-screen">
        <div className="h-16 border-b border-border/70 px-6 flex items-center gap-3">
          <img src={active.photo} className="w-9 h-9 rounded-full object-cover" alt="" />
          <div>
            <div className="text-[14px] font-medium">{active.name}</div>
            <div className="text-[14px] text-muted-foreground">
              {active.mrn} · Verified via email + phone
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <QuickBtn icon={FileText}>Share visit summary</QuickBtn>
            <QuickBtn icon={Share2}>Send referral</QuickBtn>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-3">
          <Bubble side="them">Hi Dr. Chen - the chest tightness is much better this week.</Bubble>
          <Bubble side="me">
            Great to hear. Keep tracking your morning BP and we'll review at your next visit.
          </Bubble>
          <Bubble side="them">Will do. Should I keep avoiding coffee?</Bubble>
          <Bubble side="me">
            Try one small cup and note any palpitations. I'll message you a follow-up form in a
            week.
          </Bubble>
        </div>

        <div className="p-4 border-t border-border/70">
          <div className="flex items-center gap-2 rounded-2xl hairline bg-card px-4 py-3">
            <button className="text-muted-foreground hover:text-foreground">
              <Paperclip className="w-4 h-4" />
            </button>
            <input
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Write a secure message…"
              className="flex-1 bg-transparent text-[14px] outline-none"
            />
            <button className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-[14px] inline-flex items-center gap-1.5 hover:opacity-90 transition">
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Bubble({ side, children }: { side: "me" | "them"; children: ReactNode }) {
  return (
    <div className={`flex ${side === "me" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-[14px] leading-relaxed ${
          side === "me" ? "bg-primary/10 text-foreground" : "bg-muted text-foreground"
        }`}
      >
        {children}
      </div>
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
