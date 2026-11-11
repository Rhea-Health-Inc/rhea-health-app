import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/clinik/PageHeader";
import { Panel, PrimaryButton, StatCard } from "@/components/clinik/AdminUI";
import { Toggle, Select } from "@/components/clinik/SettingsUI";
import { RequirePermission } from "./admin";

export const Route = createFileRoute("/admin/ai-governance")({
  head: () => ({
    meta: [
      { title: "AI governance - Rhea administration" },
      {
        name: "description",
        content:
          "Organization-level policy for AI documentation, retention, and clinician oversight.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePermission permission="ai.govern" label="AI governance">
      <AiGovernancePage />
    </RequirePermission>
  ),
});

function AiGovernancePage() {
  const [ambient, setAmbient] = useState(true);
  const [review, setReview] = useState(true);
  const [training, setTraining] = useState(false);
  const [retention, setRetention] = useState("30");
  const [model, setModel] = useState("balanced");

  return (
    <div className="px-12 py-14 max-w-5xl">
      <PageHeader
        breadcrumb={[{ label: "Administration", to: "/admin" }, { label: "AI governance" }]}
        title="AI governance"
        description="Organization policy for how Rhea's AI may be used clinically. These settings override individual clinician preferences."
        actions={
          <PrimaryButton onClick={() => toast.success("AI governance policy saved")}>
            Save policy
          </PrimaryButton>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3 mb-10">
        <StatCard
          label="AI adoption"
          value="79%"
          hint="Clinicians using AI documentation weekly."
          tone="positive"
        />
        <StatCard
          label="Notes reviewed before signing"
          value="100%"
          hint="Clinician review is enforced."
          tone="positive"
        />
        <StatCard
          label="Audio retention"
          value={`${retention} days`}
          hint="Then permanently deleted."
        />
      </div>

      <div className="space-y-6">
        <Panel
          title="Clinical AI usage"
          description="What clinicians may do with AI across the organization."
        >
          <Toggle
            checked={ambient}
            onChange={setAmbient}
            label="Allow ambient recording"
            description="Clinicians may capture encounter audio for documentation."
          />
          <Toggle
            checked={review}
            onChange={setReview}
            label="Require clinician review before signing"
            description="AI-generated notes cannot be signed without an explicit review step."
          />
          <Toggle
            checked={training}
            onChange={setTraining}
            label="Contribute de-identified data to model improvement"
            description="Off by default. No patient identifiers are ever shared."
          />
        </Panel>

        <Panel title="Data handling" description="Retention and model behaviour.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Select
              label="Audio retention period"
              value={retention}
              onChange={setRetention}
              options={[
                { value: "7", label: "7 days" },
                { value: "30", label: "30 days" },
                { value: "90", label: "90 days" },
                { value: "0", label: "Delete after note is signed" },
              ]}
            />
            <Select
              label="Model behaviour"
              value={model}
              onChange={setModel}
              options={[
                { value: "conservative", label: "Conservative - minimal inference" },
                { value: "balanced", label: "Balanced" },
                { value: "comprehensive", label: "Comprehensive - fuller drafts" },
              ]}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
