import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/clinik/PageHeader";
import {
  Badge,
  GhostButton,
  KeyValue,
  Panel,
  StatCard,
  Table,
  Td,
  Tr,
  statusTone,
} from "@/components/clinik/AdminUI";
import { RequirePermission } from "./admin";
import { INVOICES, LICENSE_SUMMARY } from "@/lib/admin";

export const Route = createFileRoute("/admin/billing")({
  head: () => ({
    meta: [
      { title: "Billing and contracts - Rhea administration" },
      {
        name: "description",
        content: "Enterprise contract, invoices, and billing contacts for your organization.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <RequirePermission permission="billing.manage" label="billing and contracts">
      <BillingPage />
    </RequirePermission>
  ),
});

function BillingPage() {
  return (
    <div className="px-12 py-14 max-w-6xl">
      <PageHeader
        breadcrumb={[{ label: "Administration", to: "/admin" }, { label: "Billing" }]}
        title="Billing and contracts"
        description="Enterprise agreements are billed annually against a purchase order. Changes are coordinated with your account team."
        actions={
          <GhostButton onClick={() => toast.success("Your account team has been notified")}>
            Contact account team
          </GhostButton>
        }
      />

      <div className="grid gap-5 sm:grid-cols-4 mb-10">
        <StatCard label="Contract value" value="$576,000" hint="Annual, billed monthly." />
        <StatCard label="Licenses" value={LICENSE_SUMMARY.purchased} hint="Contracted seats." />
        <StatCard label="Next invoice" value="1 Sep 2026" hint="Auto-billed to purchase order." />
        <StatCard
          label="Payment status"
          value="Current"
          tone="positive"
          hint="No outstanding balance."
        />
      </div>

      <div className="mb-10">
        <Panel title="Contract details" description="Terms agreed with your Rhea account team.">
          <KeyValue
            items={[
              { label: "Plan", value: "Enterprise" },
              { label: "Term", value: "1 Jan 2026 - 31 Dec 2026" },
              { label: "Renewal", value: "Automatic, 60-day notice" },
              { label: "Purchase order", value: "PO-88213" },
              { label: "Billing contact", value: "finance@organization.health" },
              { label: "Payment method", value: "ACH transfer" },
              { label: "Tax status", value: "Exempt - certificate on file" },
              { label: "Currency", value: "USD" },
            ]}
          />
        </Panel>
      </div>

      <Panel
        title="Invoices"
        description="Statements issued under the current contract."
        padded={false}
      >
        <Table head={["Invoice", "Issued", "Period", "Purchase order", "Amount", "Status", ""]}>
          {INVOICES.map((inv) => (
            <Tr key={inv.id}>
              <Td className="font-medium">{inv.id}</Td>
              <Td className="text-muted-foreground">{inv.date}</Td>
              <Td className="text-muted-foreground">{inv.period}</Td>
              <Td className="text-muted-foreground">{inv.po}</Td>
              <Td>${inv.amount.toLocaleString()}</Td>
              <Td>
                <Badge tone={statusTone(inv.status)}>{inv.status}</Badge>
              </Td>
              <Td className="text-right">
                <button
                  onClick={() => toast.success(`${inv.id} download started`)}
                  className="text-[14px] text-primary hover:underline"
                >
                  Download
                </button>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
