import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, SectionHeader } from "@/components/clinik/PageHeader";
import { CLINICIAN } from "@/lib/mock";

export const Route = createFileRoute("/app/settings/")({
  component: Settings,
});

const CARDS = [
  {
    title: "Documentation",
    desc: "Templates, style, auto behaviors, signature, and document defaults.",
    to: "/app/settings/ai-documentation" as const,
  },
  {
    title: "Appearance",
    desc: "Theme, density, navigation, and accessibility.",
    to: "/app/settings/appearance" as const,
  },
  { title: "Recording", desc: "Microphone, ambient sensitivity, storage retention.", to: null },
  {
    title: "Integrations",
    desc: "Connect EHR, calendar, and secure messaging.",
    to: "/app/settings/integrations" as const,
  },
  { title: "Notifications", desc: "Email, in-app, and mobile push.", to: null },
  {
    title: "Privacy & consent",
    desc: "Data processing, consent, exports, and privacy documents.",
    to: "/app/settings/privacy" as const,
  },
  {
    title: "Security",
    desc: "Password, two-factor, sessions, and audit access.",
    to: "/app/settings/security" as const,
  },
];

function Settings() {
  const [toast, setToast] = useState<string | null>(null);
  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="max-w-4xl mx-auto px-12 py-14">
      <PageHeader
        breadcrumb={[{ label: "Workspace", to: "/app" }, { label: "Settings" }]}
        title="Settings"
        description="Manage your clinician profile, documentation behaviour, workspace appearance, and account security."
      />

      <section className="mb-12">
        <SectionHeader
          title="Account"
          description="The identity shown on your documentation and across your care team."
        />
        <div className="rounded-2xl bg-card hairline p-8 flex items-center gap-5 shadow-[var(--shadow-clinik-sm)]">
          <img src={CLINICIAN.photo} className="w-16 h-16 rounded-full object-cover" alt="" />
          <div className="flex-1 min-w-0">
            <div className="text-[18px] font-medium">{CLINICIAN.name}</div>
            <div className="text-[14px] text-muted-foreground mt-0.5">
              {CLINICIAN.role} · {CLINICIAN.hospital}
            </div>
          </div>
          <Link
            to="/app/settings/profile"
            className="h-10 px-5 rounded-full hairline bg-card text-[14px] font-medium hover:bg-muted transition inline-flex items-center"
          >
            Edit profile
          </Link>
        </div>
      </section>

      <section>
        <SectionHeader
          title="Preferences"
          description="Configure how Rhea behaves for you across the workspace."
        />
        <div className="grid gap-4">
          {CARDS.map((s) => {
            const inner = (
              <>
                <div className="text-[18px] font-medium">{s.title}</div>
                <div className="text-[15px] text-muted-foreground mt-1.5 leading-relaxed">
                  {s.desc}
                </div>
              </>
            );
            return s.to ? (
              <Link
                key={s.title}
                to={s.to}
                className="block rounded-2xl bg-card hairline p-7 hover:shadow-[var(--shadow-clinik)] transition"
              >
                {inner}
              </Link>
            ) : (
              <button
                key={s.title}
                onClick={() => flash(`${s.title} preferences coming soon`)}
                className="w-full text-left rounded-2xl bg-card hairline p-7 hover:shadow-[var(--shadow-clinik)] transition"
              >
                {inner}
              </button>
            );
          })}
        </div>
      </section>

      {toast && (
        <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-foreground text-background px-4 py-3 text-[14px] shadow-[var(--shadow-clinik-lg)]">
          {toast}
        </div>
      )}
    </div>
  );
}
