import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Download, FileText, Trash2, ExternalLink, ShieldCheck } from "lucide-react";
import { SettingsHeader, Section, Toggle } from "@/components/clinik/SettingsUI";
import { ConfirmDialog, type ConfirmRequest } from "@/components/clinik/ConfirmDialog";

export const Route = createFileRoute("/app/settings/privacy")({
  component: PrivacySettings,
});

const CONSENT_HISTORY = [
  {
    date: "May 14, 2026",
    event: "Allowed AI processing of clinical conversations",
    by: "Dr. Sarah Chen",
  },
  { date: "May 14, 2026", event: "Accepted Privacy Policy v4.2", by: "Dr. Sarah Chen" },
  { date: "Feb 2, 2026", event: "Enabled anonymised product improvement", by: "Dr. Sarah Chen" },
  { date: "Nov 8, 2025", event: "Declined research participation", by: "Dr. Sarah Chen" },
];

const DOCS = [
  { label: "Privacy Policy", hint: "How Rhea collects, uses, and retains data." },
  { label: "Terms of Service", hint: "Your agreement with Rhea Health." },
  { label: "HIPAA Compliance", hint: "Safeguards, BAAs, and covered-entity obligations." },
  { label: "Audit Information", hint: "Logging, retention, and access review practices." },
];

function PrivacySettings() {
  const [consent, setConsent] = useState({
    ai: true,
    improvement: true,
    analytics: false,
    research: false,
  });
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-12 py-14">
      <SettingsHeader
        title="Privacy & consent"
        description="Review how Rhea handles clinical data and manage the permissions you have granted."
      />

      <Section title="Data processing">
        <div className="rounded-xl bg-muted p-4 text-[14px] leading-relaxed text-muted-foreground space-y-2">
          <p>
            When you record an encounter, Rhea streams the audio to its clinical AI service,
            produces a transcript, and drafts structured documentation from that transcript. Audio
            and transcripts are encrypted in transit and at rest.
          </p>
          <p>
            Generated documentation is treated as a draft until a clinician reviews it. Rhea does
            not use identifiable patient data to train foundation models. Anonymised, de-identified
            excerpts are used for product improvement only when you have allowed it below.
          </p>
          <p className="inline-flex items-center gap-2 text-foreground">
            <ShieldCheck className="w-4 h-4 text-primary" /> This page is maintained by Rhea Health
            and describes current product behaviour; it is not an independent certification.
          </p>
        </div>
      </Section>

      <Section
        title="Consent preferences"
        description="You can change these at any time. Changes are recorded in your consent history."
      >
        <div className="divide-y divide-border">
          <Toggle
            label="Allow AI processing"
            description="Required for transcription and AI-generated documentation."
            checked={consent.ai}
            onChange={(v) => {
              setConsent((c) => ({ ...c, ai: v }));
              toast.success(v ? "AI processing allowed" : "AI processing disabled");
            }}
          />
          <Toggle
            label="Allow product improvement using anonymized data"
            description="De-identified excerpts may be reviewed to improve documentation quality."
            checked={consent.improvement}
            onChange={(v) => setConsent((c) => ({ ...c, improvement: v }))}
          />
          <Toggle
            label="Share anonymous usage analytics"
            description="Aggregate feature usage and performance metrics only."
            checked={consent.analytics}
            onChange={(v) => setConsent((c) => ({ ...c, analytics: v }))}
          />
          <Toggle
            label="Research participation"
            description="Coming soon - opt in to approved clinical research programmes."
            checked={consent.research}
            onChange={(v) => setConsent((c) => ({ ...c, research: v }))}
          />
        </div>
      </Section>

      <Section
        title="Data controls"
        description="Export your information or request removal of your account."
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              setConfirm({
                title: "Download my data",
                body: "We will prepare an archive of your account data and email a secure download link when it is ready.",
                action: () =>
                  toast.success("Data export requested - you'll receive an email shortly"),
              })
            }
            className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5" /> Download my data
          </button>
          <button
            onClick={() =>
              setConfirm({
                title: "Export documentation",
                body: "Export all notes you have authored as a PDF and structured JSON bundle.",
                action: () => toast.success("Documentation export started"),
              })
            }
            className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" /> Export documentation
          </button>
          <button
            onClick={() =>
              setConfirm({
                title: "Request account deletion",
                body: "This starts an irreversible deletion request. Your access is revoked and personal data is removed after the retention period required by your organisation.",
                danger: true,
                action: () => toast.success("Account deletion request submitted for review"),
              })
            }
            className="h-10 px-5 rounded-full text-[14px] transition inline-flex items-center gap-2 border border-destructive/40 text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="w-3.5 h-3.5" /> Request account deletion
          </button>
        </div>
      </Section>

      <Section title="Privacy documents">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
          {DOCS.map((d) => (
            <button
              key={d.label}
              onClick={() => toast.info(`${d.label} opens in a new tab on the published site`)}
              className="text-left rounded-xl hairline bg-card p-4 hover:bg-muted transition"
            >
              <div className="text-[14px] font-medium inline-flex items-center gap-2">
                {d.label} <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <div className="text-[14px] text-muted-foreground mt-1">{d.hint}</div>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Records">
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-3 mb-5">
          {[
            ["Last privacy policy acceptance", "May 14, 2026"],
            ["Data storage region", "United States (us-east)"],
            ["Retention policy", "7 years, org-controlled"],
          ].map(([l, v]) => (
            <div key={l} className="rounded-xl bg-muted p-4">
              <div className="text-[14px] text-muted-foreground">{l}</div>
              <div className="text-[14px] mt-1">{v}</div>
            </div>
          ))}
        </div>
        <div className="text-[12px] uppercase tracking-wider text-muted-foreground mb-2">
          Consent history
        </div>
        <div className="divide-y divide-border">
          {CONSENT_HISTORY.map((c, i) => (
            <div key={i} className="flex items-start justify-between gap-4 py-2.5">
              <div>
                <div className="text-[14px]">{c.event}</div>
                <div className="text-[14px] text-muted-foreground mt-0.5">{c.by}</div>
              </div>
              <span className="text-[14px] text-muted-foreground shrink-0">{c.date}</span>
            </div>
          ))}
        </div>
      </Section>

      {confirm && <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />}
    </div>
  );
}
