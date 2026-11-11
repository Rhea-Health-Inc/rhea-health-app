import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/clinik/PageHeader";
import { Panel, PrimaryButton, StatCard } from "@/components/clinik/AdminUI";
import { Toggle, Select } from "@/components/clinik/SettingsUI";
import { RequirePermission } from "./admin";

export const Route = createFileRoute("/admin/security")({
  head: () => ({
    meta: [
      { title: "Security policy - Rhea administration" },
      {
        name: "description",
        content:
          "Single sign-on, MFA enforcement, session, and access policy for your organization.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePermission permission="security.manage" label="security policy">
      <SecurityPage />
    </RequirePermission>
  ),
});

function SecurityPage() {
  const [sso, setSso] = useState(true);
  const [scim, setScim] = useState(true);
  const [mfa, setMfa] = useState(false);
  const [ip, setIp] = useState(false);
  const [session, setSession] = useState("8");

  return (
    <div className="px-12 py-14 max-w-5xl">
      <PageHeader
        breadcrumb={[{ label: "Administration", to: "/admin" }, { label: "Security" }]}
        title="Security"
        description="Organization-wide authentication and access policy. Changes apply to every member at their next sign-in."
        actions={
          <PrimaryButton onClick={() => toast.success("Security policy updated")}>
            Save policy
          </PrimaryButton>
        }
      />

      <div className="grid gap-5 sm:grid-cols-3 mb-10">
        <StatCard
          label="Identity provider"
          value="Azure AD"
          hint="SAML 2.0, verified domain."
          tone="positive"
        />
        <StatCard
          label="MFA coverage"
          value="94%"
          hint="6 administrators without MFA."
          tone="warning"
        />
        <StatCard label="Active sessions" value="412" hint="Across all devices." />
      </div>

      <div className="space-y-6">
        <Panel title="Authentication" description="How members prove who they are.">
          <Toggle
            checked={sso}
            onChange={setSso}
            label="Require single sign-on"
            description="Members must authenticate through your identity provider."
          />
          <Toggle
            checked={scim}
            onChange={setScim}
            label="SCIM provisioning"
            description="Create and deactivate users automatically from your directory."
          />
          <Toggle
            checked={mfa}
            onChange={setMfa}
            label="Enforce MFA for administrative roles"
            description="Blocks administrative access until a second factor is registered."
          />
        </Panel>

        <Panel title="Access controls" description="Where and how long members can stay signed in.">
          <Toggle
            checked={ip}
            onChange={setIp}
            label="Restrict access to approved networks"
            description="Only the organization IP allow-list may reach clinical data."
          />
          <div className="mt-4 max-w-sm">
            <Select
              label="Session timeout"
              value={session}
              onChange={setSession}
              options={[
                { value: "1", label: "1 hour" },
                { value: "4", label: "4 hours" },
                { value: "8", label: "8 hours" },
                { value: "24", label: "24 hours" },
              ]}
            />
          </div>
        </Panel>
      </div>
    </div>
  );
}
