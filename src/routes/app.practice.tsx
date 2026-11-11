import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useDialogDismiss } from "@/hooks/use-dialog-dismiss";
import { toast } from "sonner";
import { PageHeader, SectionHeader } from "@/components/clinik/PageHeader";
import {
  AddSeatDialog,
  BillingHistoryDialog,
  ManageSubscriptionDialog,
  PaymentMethodDialog,
} from "@/components/clinik/BillingDialogs";
import {
  COUNTRIES,
  addSeat,
  inviteMember,
  savePractice,
  statesFor,
  updateMember,
  usePractice,
  type OrgRole,
} from "@/lib/practice";

export const Route = createFileRoute("/app/practice")({
  head: () => ({
    meta: [
      { title: "Practice - Rhea" },
      {
        name: "description",
        content: "Manage your practice information, subscription, usage, and team.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PracticePage,
});

const inputCls =
  "mt-1.5 w-full h-11 rounded-xl hairline bg-card px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition";

function Card({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-card hairline p-6 shadow-[var(--shadow-clinik-sm)]">
      <div className="text-[13px] font-medium text-muted-foreground">{title}</div>
      <div className="mt-2 text-[22px] font-semibold tracking-[-0.015em] truncate">{value}</div>
      <div className="mt-2 text-[12px] text-muted-foreground leading-relaxed">{description}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-foreground/80">{label}</span>
      {children}
    </label>
  );
}

const STATUS_LABEL: Record<string, string> = {
  trialing: "Free trial",
  active: "Active",
  past_due: "Past due",
  canceled: "Canceled",
};

function PracticePage() {
  const practice = usePractice();
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({});
  const [dirty, setDirty] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [seatsOpen, setSeatsOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadedPracticeId = useRef<string | null>(null);

  useEffect(() => {
    if (practice && loadedPracticeId.current !== practice.id) {
      loadedPracticeId.current = practice.id;
      setForm({
        name: practice.name,
        email: practice.email ?? "",
        phone: practice.phone ?? "",
        website: practice.website ?? "",
        address: practice.address ?? "",
        city: practice.city ?? "",
        state: practice.state ?? "",
        postalCode: practice.postalCode ?? "",
        country: practice.country ?? "United States",
        logo: practice.logo ?? "",
      });
      setDirty(false);
    }
  }, [practice]);

  if (!practice) {
    return (
      <div className="px-12 py-14 max-w-3xl">
        <PageHeader
          breadcrumb={[{ label: "Workspace", to: "/app" }, { label: "Practice" }]}
          title="Practice"
          description="Manage your practice information, subscription, organization usage, and team settings."
        />
        <div className="rounded-2xl bg-card hairline p-8 shadow-[var(--shadow-clinik-sm)]">
          <div className="text-[18px] font-medium">No practice found</div>
          <p className="mt-2 text-[15px] text-muted-foreground leading-relaxed">
            You don't own or administer an organization yet. Create your workspace to set up a
            practice.
          </p>
          <button
            onClick={() => navigate({ to: "/signup" })}
            className="mt-6 h-10 px-6 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
          >
            Create your workspace
          </button>
        </div>
      </div>
    );
  }

  const assigned = practice.members.filter((m) => m.seat && m.status !== "deactivated").length;
  const available = Math.max(0, practice.seatsPurchased - assigned);
  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setDirty(true);
  };

  return (
    <div className="px-12 py-14 max-w-6xl">
      <PageHeader
        breadcrumb={[{ label: "Workspace", to: "/app" }, { label: "Practice" }]}
        title="Practice"
        description="Manage your practice information, subscription, organization usage, and team settings."
      />

      {/* Overview */}
      <section className="mb-16">
        <SectionHeader
          title="Practice overview"
          description="A snapshot of your organization, its plan, and how it's being used."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Practice name"
            value={practice.name}
            description="The organization documentation is filed under."
          />
          <Card
            title="Owner"
            value={practice.ownerName}
            description="The account with full administrative control."
          />
          <Card
            title="Current plan"
            value={practice.planLabel}
            description="Your active Rhea subscription tier."
          />
          <Card
            title="Subscription status"
            value={STATUS_LABEL[practice.subscriptionStatus]}
            description="Whether billing is active, trialing, or lapsed."
          />
          <Card
            title="Seats used"
            value={`${assigned}`}
            description="Clinicians currently holding an assigned seat."
          />
          <Card
            title="Available seats"
            value={`${available}`}
            description="Unassigned seats ready for new clinicians."
          />
          <Card
            title="Storage usage"
            value="1.8 GB"
            description="Recordings and documents stored for this practice."
          />
          <Card
            title="Patient count"
            value="128"
            description="Active patients in your practice directory."
          />
          <Card
            title="Documentation this month"
            value="342"
            description="Notes generated by Rhea across the organization."
          />
        </div>
      </section>

      {/* Subscription */}
      <section className="mb-16">
        <SectionHeader
          title="Subscription"
          description="Your plan, billing cycle, and payment management."
        />
        <div className="rounded-2xl bg-card hairline p-8 shadow-[var(--shadow-clinik-sm)]">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-[13px] font-medium text-muted-foreground">Current plan</div>
              <div className="mt-1.5 text-[15px]">{practice.planLabel}</div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-muted-foreground">Billing cycle</div>
              <div className="mt-1.5 text-[15px] capitalize">{practice.billingCycle}</div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-muted-foreground">Renewal date</div>
              <div className="mt-1.5 text-[15px]">{practice.renewalDate}</div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-muted-foreground">Status</div>
              <div className="mt-1.5 text-[15px]">{STATUS_LABEL[practice.subscriptionStatus]}</div>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setManageOpen(true)}
              className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
            >
              Upgrade plan
            </button>
            <button
              onClick={() => setManageOpen(true)}
              className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
            >
              Manage subscription
            </button>
            <button
              onClick={() => setPaymentOpen(true)}
              className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
            >
              Update payment method
            </button>
            <button
              onClick={() => setHistoryOpen(true)}
              className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
            >
              View billing history
            </button>
          </div>
          <p className="mt-5 text-[12px] text-muted-foreground">
            Billing is not yet connected - amounts and invoices shown are placeholders until
            payments are enabled.
          </p>
        </div>
      </section>

      {/* Seats */}
      <section id="seats" className="mb-16 scroll-mt-8">
        <SectionHeader
          title="Seats"
          description="Each licensed clinician requires an assigned seat to document with Rhea."
        />
        <div className="rounded-2xl bg-card hairline p-8 shadow-[var(--shadow-clinik-sm)]">
          <div className="grid gap-6 sm:grid-cols-3">
            <div>
              <div className="text-[13px] font-medium text-muted-foreground">Purchased seats</div>
              <div className="mt-1.5 text-[22px] font-semibold">{practice.seatsPurchased}</div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-muted-foreground">Assigned seats</div>
              <div className="mt-1.5 text-[22px] font-semibold">{assigned}</div>
            </div>
            <div>
              <div className="text-[13px] font-medium text-muted-foreground">Available seats</div>
              <div className="mt-1.5 text-[22px] font-semibold">{available}</div>
            </div>
          </div>
          <button
            onClick={() => setSeatsOpen(true)}
            className="mt-8 h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
          >
            Add seat
          </button>
        </div>
      </section>

      {/* Usage */}
      <section className="mb-16">
        <SectionHeader
          title="Usage"
          description="Organization-wide activity for the current billing period."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Card
            title="Storage used"
            value="1.8 GB"
            description="Total recordings and generated documents."
          />
          <Card
            title="Storage remaining"
            value="48.2 GB"
            description="Remaining capacity on your current plan."
          />
          <Card
            title="Active patients"
            value="128"
            description="Patients seen in the last 90 days."
          />
          <Card
            title="Documentation this month"
            value="342"
            description="Notes finalized by clinicians in your practice."
          />
          <Card
            title="Recording hours"
            value="61.5 h"
            description="Ambient recording captured this month."
          />
          <Card
            title="Avg. processing time"
            value="38 s"
            description="Average time to generate a draft note."
          />
        </div>
      </section>

      {/* Practice information */}
      <section className="mb-16">
        <SectionHeader
          title="Practice information"
          description="Details that appear on documentation, referrals, and correspondence."
        />
        <div className="rounded-2xl bg-card hairline p-8 shadow-[var(--shadow-clinik-sm)]">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Practice name">
              <input
                className={inputCls}
                value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
              />
            </Field>
            <Field label="Practice email">
              <input
                className={inputCls}
                value={form.email ?? ""}
                onChange={(e) => set("email", e.target.value)}
              />
            </Field>
            <Field label="Practice phone number">
              <input
                className={inputCls}
                value={form.phone ?? ""}
                onChange={(e) => set("phone", e.target.value)}
              />
            </Field>
            <Field label="Practice website">
              <input
                className={inputCls}
                value={form.website ?? ""}
                onChange={(e) => set("website", e.target.value)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Street address">
                <input
                  className={inputCls}
                  value={form.address ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                />
              </Field>
            </div>
            <Field label="City">
              <input
                className={inputCls}
                value={form.city ?? ""}
                onChange={(e) => set("city", e.target.value)}
              />
            </Field>
            <Field label="State / Province">
              <select
                className={inputCls}
                value={form.state ?? ""}
                onChange={(e) => set("state", e.target.value)}
              >
                <option value="">Select…</option>
                {statesFor(form.country ?? "United States").map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </Field>
            <Field label="Postal code">
              <input
                className={inputCls}
                value={form.postalCode ?? ""}
                onChange={(e) => set("postalCode", e.target.value)}
              />
            </Field>
            <Field label="Country">
              <select
                className={inputCls}
                value={form.country ?? "United States"}
                onChange={(e) => {
                  set("country", e.target.value);
                  set("state", "");
                }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="mt-8">
            <div className="text-[13px] font-medium text-foreground/80">Practice logo</div>
            <div className="mt-3 flex items-center gap-5">
              <div className="w-16 h-16 rounded-xl hairline bg-muted overflow-hidden flex items-center justify-center text-[13px] text-muted-foreground">
                {form.logo ? (
                  <img src={form.logo} alt="Practice logo" className="w-full h-full object-cover" />
                ) : (
                  "Logo"
                )}
              </div>
              <label className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center cursor-pointer">
                Upload logo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => set("logo", String(reader.result));
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
              {form.logo && (
                <button
                  onClick={() => set("logo", "")}
                  className="text-[14px] text-muted-foreground hover:text-foreground transition"
                >
                  Remove
                </button>
              )}
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={() => {
                savePractice({
                  name: form.name,
                  email: form.email,
                  phone: form.phone,
                  website: form.website,
                  address: form.address,
                  city: form.city,
                  state: form.state,
                  postalCode: form.postalCode,
                  country: form.country,
                  logo: form.logo || undefined,
                });
                setDirty(false);
                toast.success("Practice information saved.");
              }}
              className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
            >
              Save changes
            </button>
            {dirty && <span className="text-[13px] text-muted-foreground">Unsaved changes</span>}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mb-8">
        <SectionHeader
          title="Team"
          description="Clinicians and administrators with access to this practice."
          actions={
            <button
              onClick={() => setInviteOpen(true)}
              className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
            >
              Invite member
            </button>
          }
        />
        <div className="rounded-2xl bg-card hairline overflow-hidden shadow-[var(--shadow-clinik-sm)]">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[12px] uppercase tracking-[0.1em] text-muted-foreground border-b border-border">
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last active</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {practice.members.map((m) => (
                <tr key={m.id} className="border-b border-border/60 last:border-0">
                  <td className="px-6 py-5">
                    <div className="text-[15px] font-medium">{m.name}</div>
                    <div className="text-[12px] text-muted-foreground">{m.email}</div>
                  </td>
                  <td className="px-6 py-5">
                    <select
                      value={m.role}
                      disabled={m.role === "owner"}
                      onChange={(e) => {
                        updateMember(m.id, { role: e.target.value as OrgRole });
                        toast.success("Role updated.");
                      }}
                      className="h-9 rounded-xl hairline bg-card px-2.5 text-[14px] capitalize disabled:opacity-60"
                    >
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                      <option value="clinician">Clinician</option>
                    </select>
                  </td>
                  <td className="px-6 py-5">
                    <span
                      className={`text-[12px] px-2.5 py-1 rounded-full ${
                        m.status === "active"
                          ? "bg-primary/10 text-primary"
                          : m.status === "invited"
                            ? "bg-muted text-muted-foreground"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {m.status === "active"
                        ? "Active"
                        : m.status === "invited"
                          ? "Invited"
                          : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-[14px] text-muted-foreground">{m.lastActive}</td>
                  <td className="px-6 py-5 text-right">
                    {m.role === "owner" ? (
                      <span className="text-[13px] text-muted-foreground">Organization owner</span>
                    ) : (
                      <button
                        onClick={() => {
                          const next = m.status === "deactivated" ? "active" : "deactivated";
                          updateMember(m.id, {
                            status: next,
                            seat: next === "active" ? m.seat : false,
                          });
                          toast.success(
                            next === "active" ? "Member reactivated." : "Member deactivated.",
                          );
                        }}
                        className="text-[14px] text-muted-foreground hover:text-foreground transition"
                      >
                        {m.status === "deactivated" ? "Reactivate" : "Deactivate"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {inviteOpen && <InviteDialog onClose={() => setInviteOpen(false)} />}
      {seatsOpen && (
        <AddSeatDialog
          practice={practice}
          onClose={() => setSeatsOpen(false)}
          onConfirm={(n) => {
            addSeat(n);
            toast.success(`${n} seat${n > 1 ? "s" : ""} added`, {
              description: "Assign them to clinicians from the Team section.",
            });
            setSeatsOpen(false);
          }}
        />
      )}
      {manageOpen && (
        <ManageSubscriptionDialog
          practice={practice}
          onClose={() => setManageOpen(false)}
          onManageSeats={() =>
            document.getElementById("seats")?.scrollIntoView({ behavior: "smooth" })
          }
        />
      )}
      {paymentOpen && (
        <PaymentMethodDialog practice={practice} onClose={() => setPaymentOpen(false)} />
      )}
      {historyOpen && (
        <BillingHistoryDialog practice={practice} onClose={() => setHistoryOpen(false)} />
      )}
    </div>
  );
}

function InviteDialog({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrgRole>("clinician");
  const { backdropProps, panelProps } = useDialogDismiss(onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-foreground/10 backdrop-blur-sm"
      {...backdropProps}
    >
      <div
        {...panelProps}
        aria-label="Invite member"
        className="w-full max-w-md rounded-2xl bg-card hairline p-8 shadow-[var(--shadow-clinik-lg)] outline-none"
      >
        <div className="text-[18px] font-medium">Invite member</div>
        <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
          They'll receive an email invitation to join this practice.
        </p>
        <div className="mt-6 space-y-4">
          <Field label="Full name">
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Work email">
            <input className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
          <Field label="Role">
            <select
              className={inputCls}
              value={role}
              onChange={(e) => setRole(e.target.value as OrgRole)}
            >
              <option value="clinician">Clinician</option>
              <option value="admin">Admin</option>
            </select>
          </Field>
        </div>
        <div className="mt-7 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (!name || !email) {
                toast.error("Please enter a name and email.");
                return;
              }
              inviteMember(name, email, role);
              toast.success("Invitation sent.");
              onClose();
            }}
            className="h-10 px-6 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
          >
            Send invite
          </button>
        </div>
      </div>
    </div>
  );
}
