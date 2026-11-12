import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  BellOff,
  FileCheck2,
  Fingerprint,
  Lock,
  MailCheck,
  ScanSearch,
  ScrollText,
  Users,
} from "lucide-react";
import { SettingsHeader, Section, Toggle } from "@/components/clinik/SettingsUI";
import { ConfirmDialog, type ConfirmRequest } from "@/components/clinik/ConfirmDialog";
import { useInboxConnection } from "@/hooks/use-inbox-connection";

export const Route = createFileRoute("/app/settings/inbox")({
  component: PracticeInbox,
});

function PracticeInbox() {
  const { inbox, update } = useInboxConnection();
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="max-w-4xl mx-auto px-12 py-14">
      <SettingsHeader
        title="Practice inbox"
        description="Connect the practice email inbox so messages from patients arrive in Messages, matched to their records, instead of sitting in a shared mailbox."
      />

      <Section
        title="Connected email"
        description="The connection itself is managed in Integrations. Rhea reads this inbox with read-only access and imports only mail from patients' verified addresses."
      >
        {inbox.connected ? (
          <div className="flex items-center gap-5 flex-wrap">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-[18px] font-semibold text-primary">
              {inbox.provider === "Google Workspace" ? "G" : "M"}
            </span>
            <div className="flex-1 min-w-[220px]">
              <div className="flex items-center gap-2.5">
                <span className="text-[16px] font-medium">{inbox.address}</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-[12px] font-medium text-primary">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Connected
                </span>
              </div>
              <p className="mt-1 text-[14px] text-muted-foreground">
                {inbox.provider} · Read-only access · Last synced {inbox.lastSyncMins} min ago
              </p>
            </div>
            <button
              onClick={() =>
                setConfirm({
                  title: "Disconnect the practice inbox?",
                  body: "New patient emails will stop appearing in Messages. Conversations already imported stay in Messages, and nothing is deleted from the mailbox itself.",
                  danger: true,
                  action: () => {
                    update({ connected: false });
                    flash("Practice inbox disconnected");
                  },
                })
              }
              className="h-10 px-5 rounded-full hairline bg-card text-[14px] font-medium hover:bg-muted transition"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[15px] text-muted-foreground leading-relaxed">
              No email connected. Patient emails currently stay in your regular mailbox and never
              reach Messages.
            </p>
            <Link
              to="/app/settings/integrations"
              className="mt-5 inline-flex h-11 items-center px-6 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
            >
              Connect in Integrations
            </Link>
          </div>
        )}
      </Section>

      <Section
        title="How patient email is matched"
        description="Connecting an inbox does not import the whole mailbox into Rhea."
      >
        <div className="divide-y divide-border/60">
          <InfoRow
            icon={Fingerprint}
            title="Verified address matching"
            body="An email becomes a conversation only when the sender's address matches the verified email on a patient's record. It is attached to that patient's chart automatically."
          />
          <InfoRow
            icon={MailCheck}
            title="Unmatched mail is never imported"
            body="Mail from anyone else (labs, insurers, personal contacts) stays in your email where it belongs. Rhea never copies it."
          />
          <InfoRow
            icon={ScanSearch}
            title="Attachments are scanned first"
            body="Patient attachments are checked for malware and phishing before anyone on the care team can open them."
          />
        </div>
      </Section>

      <Section
        title="Security & privacy"
        description="What protects the health information that flows through the connected inbox."
      >
        <div className="divide-y divide-border/60">
          <InfoRow
            icon={Lock}
            title="Encrypted end to end"
            body="Messages are encrypted in transit and at rest inside Rhea, and the connection uses read-only access, so Rhea cannot send or delete mail from your mailbox."
          />
          <InfoRow
            icon={FileCheck2}
            title="Covered by a BAA"
            body="Only connect an account covered by a business associate agreement (Google Workspace or Microsoft 365 on a healthcare plan). A personal Gmail or Outlook account should never be connected."
          />
          <InfoRow
            icon={ScrollText}
            title="Full audit trail"
            body="Every open, reply, assignment and export in Messages is recorded, so you always know who saw what, and when."
          />
          <InfoRow
            icon={BellOff}
            title="Notifications carry no health details"
            body="When you reply, the patient gets a plain email saying they have a new secure message, and the content stays behind their Rhea sign-in."
          />
          <InfoRow
            icon={Users}
            title="Role-based access"
            body="Only care-team members with messaging permission can see the inbox. Access follows the same roles as the rest of the workspace."
          />
        </div>
      </Section>

      <Section title="Preferences">
        <div className="divide-y divide-border/60">
          <Toggle
            checked={inbox.autoImport}
            onChange={(v) => update({ autoImport: v })}
            label="Import patient emails automatically"
            description="Matched patient emails appear in Messages as they arrive. When off, they wait for a manual sync."
          />
          <Toggle
            checked={inbox.notifyPatients}
            onChange={(v) => update({ notifyPatients: v })}
            label="Notify patients about new secure messages"
            description="Sends the content-free email notification described above."
          />
          <Toggle
            checked={inbox.allowAttachments}
            onChange={(v) => update({ allowAttachments: v })}
            label="Allow attachments from patients"
            description="Patients can attach documents and photos to their messages. Attachments are scanned before opening."
          />
        </div>
      </Section>

      {confirm && <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />}
      {toast && (
        <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-foreground text-background px-4 py-3 text-[14px] shadow-[var(--shadow-clinik-lg)]">
          {toast}
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon: Icon, title, body }: { icon: typeof Lock; title: string; body: string }) {
  return (
    <div className="flex gap-4 py-5 first:pt-0 last:pb-0">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
        <Icon className="w-4.5 h-4.5" />
      </span>
      <div>
        <div className="text-[15px] font-medium">{title}</div>
        <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}
