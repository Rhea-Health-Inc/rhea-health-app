import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Settings2, Plug, Mail } from "lucide-react";
import { SettingsHeader } from "@/components/clinik/SettingsUI";
import { useState } from "react";
import { useInboxConnection } from "@/hooks/use-inbox-connection";

export const Route = createFileRoute("/app/settings/integrations")({
  component: Integrations,
});

type Integration = {
  id: string;
  group: string;
  name: string;
  description: string;
  logo: string; // short label placeholder
};

const INTEGRATIONS: Integration[] = [
  {
    id: "epic",
    group: "EHR",
    name: "Epic",
    description: "Sync patient charts, medications, and orders with Epic.",
    logo: "E",
  },
  {
    id: "cerner",
    group: "EHR",
    name: "Cerner (Oracle Health)",
    description: "Two-way sync for demographics, encounters, and notes.",
    logo: "C",
  },
  {
    id: "other-ehr",
    group: "EHR",
    name: "Other EHR",
    description: "Connect via HL7 FHIR to a custom EHR system.",
    logo: "H",
  },
  {
    id: "google-cal",
    group: "Calendar",
    name: "Google Calendar",
    description: "Sync appointments and import your working schedule.",
    logo: "G",
  },
  {
    id: "outlook-cal",
    group: "Calendar",
    name: "Microsoft Outlook",
    description: "Two-way calendar sync with Microsoft 365.",
    logo: "O",
  },
  {
    id: "secure-msg",
    group: "Secure messaging",
    name: "TigerConnect",
    description: "Route patient and care-team messages through TigerConnect.",
    logo: "T",
  },
  {
    id: "spok",
    group: "Secure messaging",
    name: "Spok",
    description: "Sync clinical alerts and paging workflows.",
    logo: "S",
  },
];

function Integrations() {
  const [connected, setConnected] = useState<Record<string, boolean>>({ "google-cal": true });
  const [pending, setPending] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { inbox, update: updateInbox } = useInboxConnection();
  const [inboxPending, setInboxPending] = useState<string | null>(null);

  const connectInbox = (provider: "Google Workspace" | "Microsoft 365") => {
    setInboxPending(provider);
    window.setTimeout(() => {
      updateInbox({ connected: true, provider, lastSyncMins: 0 });
      setInboxPending(null);
      flash(`Practice inbox connected (${provider})`);
    }, 900);
  };

  const disconnectInbox = () => {
    updateInbox({ connected: false });
    flash("Practice inbox disconnected");
  };

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  };

  const toggle = (id: string, name: string) => {
    if (connected[id]) {
      setConnected((c) => ({ ...c, [id]: false }));
      flash(`${name} disconnected`);
      return;
    }
    setPending(id);
    window.setTimeout(() => {
      setConnected((c) => ({ ...c, [id]: true }));
      setPending(null);
      flash(`${name} connected`);
    }, 900);
  };

  const groups = Array.from(new Set(INTEGRATIONS.map((i) => i.group)));

  return (
    <div className="max-w-4xl mx-auto px-12 py-14">
      <SettingsHeader
        title="Integrations"
        description="Connect Rhea to your EHR, calendar, and secure messaging tools. Changes sync in real time."
      />

      <div className="mb-12">
        <h2 className="text-[22px] font-semibold tracking-[-0.015em] mb-5">Email</h2>
        <div className="rounded-2xl bg-card hairline p-6 flex flex-col">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center">
              <Mail className="w-4.5 h-4.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-[14px] font-medium">Practice inbox</div>
                {inbox.connected && (
                  <span className="text-[12px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)] inline-flex items-center gap-1">
                    <Check className="w-3 h-3" /> Connected
                  </span>
                )}
              </div>
              <div className="text-[14px] text-muted-foreground mt-1">
                Connect the practice email inbox so patient emails arrive in Messages, matched to
                their records.
              </div>
              {inbox.connected && (
                <div className="text-[14px] mt-2">
                  {inbox.address}
                  <span className="text-muted-foreground">
                    {" "}
                    · {inbox.provider} · Read-only access
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 flex-wrap">
            {inbox.connected ? (
              <>
                <Link
                  to="/app/settings/inbox"
                  className="h-10 px-4 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-1.5"
                >
                  <Settings2 className="w-3.5 h-3.5" /> Inbox settings
                </Link>
                <button
                  onClick={disconnectInbox}
                  className="h-10 px-4 rounded-full hairline bg-card text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted transition"
                >
                  Disconnect
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => connectInbox("Google Workspace")}
                  disabled={inboxPending !== null}
                  className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Plug className="w-3.5 h-3.5" />
                  {inboxPending === "Google Workspace" ? "Connecting…" : "Connect Google Workspace"}
                </button>
                <button
                  onClick={() => connectInbox("Microsoft 365")}
                  disabled={inboxPending !== null}
                  className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Plug className="w-3.5 h-3.5" />
                  {inboxPending === "Microsoft 365" ? "Connecting…" : "Connect Microsoft 365"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {groups.map((g) => (
        <div key={g} className="mb-12">
          <h2 className="text-[22px] font-semibold tracking-[-0.015em] mb-5">{g}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {INTEGRATIONS.filter((i) => i.group === g).map((i) => {
              const isConnected = !!connected[i.id];
              const isPending = pending === i.id;
              return (
                <div key={i.id} className="rounded-2xl bg-card hairline p-6 flex flex-col">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted text-foreground flex items-center justify-center text-[14px] font-semibold">
                      {i.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-[14px] font-medium">{i.name}</div>
                        {isConnected && (
                          <span className="text-[12px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[var(--color-success)] inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Connected
                          </span>
                        )}
                      </div>
                      <div className="text-[14px] text-muted-foreground mt-1">{i.description}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    {isConnected ? (
                      <>
                        <button
                          onClick={() => flash(`${i.name} settings coming soon`)}
                          className="h-10 px-4 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-1.5"
                        >
                          <Settings2 className="w-3.5 h-3.5" /> Settings
                        </button>
                        <button
                          onClick={() => toggle(i.id, i.name)}
                          className="h-10 px-4 rounded-full hairline bg-card text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted transition"
                        >
                          Disconnect
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => toggle(i.id, i.name)}
                        disabled={isPending}
                        className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center gap-1.5 disabled:opacity-60"
                      >
                        <Plug className="w-3.5 h-3.5" />
                        {isPending ? "Connecting…" : "Connect"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {toast && (
        <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-foreground text-background px-4 py-3 text-[14px] shadow-[var(--shadow-clinik-lg)]">
          {toast}
        </div>
      )}
    </div>
  );
}
