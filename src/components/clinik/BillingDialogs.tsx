import { useState, type ReactNode } from "react";
import { toast } from "sonner";
import { X } from "lucide-react";
import {
  COUNTRIES,
  SEAT_PRICE,
  money,
  prorationDetails,
  savePractice,
  type BillingContacts,
  type BillingPreferences,
  type PaymentMethod,
  type Practice,
  type PurchaseOrder,
  type TaxInfo,
} from "@/lib/practice";

const inputCls =
  "mt-1.5 w-full h-11 rounded-xl hairline bg-card px-3.5 text-[15px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition";

const STATUS_LABEL: Record<string, string> = {
  trialing: "Trial",
  active: "Active",
  past_due: "Past due",
  canceled: "Cancelled",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[13px] font-medium text-foreground/80">{label}</span>
      {children}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl hairline bg-muted/40 px-4 py-3.5">
      <div className="text-[12px] font-medium text-muted-foreground">{label}</div>
      <div className="mt-1 text-[15px] font-medium">{value}</div>
    </div>
  );
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-2.5">
      <span className="text-[14px]">{label}</span>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`shrink-0 w-11 h-6 rounded-full transition relative ${checked ? "bg-primary" : "bg-muted hairline"}`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 rounded-full bg-background shadow transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function Modal({
  title,
  description,
  onClose,
  size = "md",
  footer,
  children,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  size?: "md" | "lg";
  footer?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto px-4 py-10 bg-foreground/10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${size === "lg" ? "max-w-4xl" : "max-w-xl"} rounded-2xl bg-card hairline shadow-[var(--shadow-clinik-lg)]`}
      >
        <div className="flex items-start justify-between gap-6 px-8 pt-8 pb-6 border-b border-border">
          <div className="min-w-0">
            <div className="text-[22px] font-semibold tracking-[-0.015em]">{title}</div>
            {description && (
              <p className="mt-2 text-[14px] text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            aria-label="Close"
            onClick={onClose}
            className="shrink-0 w-9 h-9 rounded-full hairline bg-card hover:bg-muted transition inline-flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-8 py-8">{children}</div>
        {footer && (
          <div className="px-8 py-6 border-t border-border flex items-center justify-end gap-3 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="py-8 first:pt-0 border-b border-border last:border-0">
      <div className="text-[18px] font-medium">{title}</div>
      {description && (
        <p className="mt-1.5 text-[14px] text-muted-foreground leading-relaxed">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

const btnPrimary =
  "h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition";
const btnGhost = "h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition";

/* ---------------- Manage subscription ---------------- */

export function ManageSubscriptionDialog({
  practice,
  onClose,
  onManageSeats,
}: {
  practice: Practice;
  onClose: () => void;
  onManageSeats: () => void;
}) {
  const assigned = practice.members.filter((m) => m.seat && m.status !== "deactivated").length;
  const available = Math.max(0, practice.seatsPurchased - assigned);
  const monthlyCost = practice.seatsPurchased * SEAT_PRICE;

  const [autoRenew, setAutoRenew] = useState(practice.autoRenew ?? true);
  const [cycle, setCycle] = useState<Practice["billingCycle"]>(practice.billingCycle);
  const [contacts, setContacts] = useState<BillingContacts>(
    practice.billingContacts ?? {
      contactName: practice.ownerName,
      contactEmail: practice.ownerEmail,
      apEmail: "",
      financeEmail: "",
    },
  );
  const [po, setPo] = useState<PurchaseOrder>(
    practice.purchaseOrder ?? { poNumber: "", department: "", internalRef: "" },
  );
  const [tax, setTax] = useState<TaxInfo>(
    practice.taxInfo ?? {
      businessName: practice.name,
      taxId: "",
      vatNumber: "",
      gstNumber: "",
      exemptionStatus: "Not exempt",
      country: practice.country ?? "United States",
    },
  );
  const [prefs, setPrefs] = useState<BillingPreferences>(
    practice.billingPreferences ?? {
      invoicesByEmail: true,
      copyBillingContact: true,
      copyAccountsPayable: false,
      paymentReminders: true,
      renewalReminders: true,
      pdfInvoices: true,
    },
  );

  const saveAll = (message = "Subscription settings saved.") => {
    savePractice({
      autoRenew,
      billingCycle: cycle,
      billingContacts: contacts,
      purchaseOrder: po,
      taxInfo: tax,
      billingPreferences: prefs,
    });
    toast.success(message);
  };

  const created = new Date(practice.createdAt).toISOString().slice(0, 10);

  return (
    <Modal
      title="Manage subscription"
      description="Review and update your organization's plan, renewal, billing details, and invoice preferences."
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btnGhost}>
            Close
          </button>
          <button
            onClick={() => {
              saveAll();
              onClose();
            }}
            className={btnPrimary}
          >
            Save changes
          </button>
        </>
      }
    >
      <Section
        title="Subscription information"
        description="A read-only summary of your current subscription."
      >
        <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
          <div className="grid gap-4 sm:grid-cols-2">
            <Row label="Current plan" value={practice.planLabel} />
            <Row label="Subscription status" value={STATUS_LABEL[practice.subscriptionStatus]} />
            <Row label="Billing cycle" value={cycle === "annual" ? "Annual" : "Monthly"} />
            <Row label="Clinician seats included" value={`${practice.seatsPurchased}`} />
            <Row label="Current monthly cost" value={`${money(monthlyCost)}/month`} />
            <Row label="Organization created" value={created} />
            <Row label="Renewal date" value={practice.renewalDate} />
            <Row label="Next billing date" value={practice.renewalDate} />
          </div>
          <div className="space-y-3">
            <div className="text-[13px] font-medium text-muted-foreground">Actions</div>
            <button
              onClick={() => {
                savePractice({ plan: "team", planLabel: "Teams", subscriptionStatus: "active" });
                toast.success("Plan upgraded to Teams.");
              }}
              className={`${btnPrimary} w-full`}
            >
              Upgrade plan
            </button>
            {practice.plan !== "professional" && (
              <button
                onClick={() => {
                  if (!window.confirm("Downgrade to the Professional plan at the next renewal?"))
                    return;
                  savePractice({ plan: "professional", planLabel: "Professional" });
                  toast.success("Downgrade scheduled for the next renewal.");
                }}
                className={`${btnGhost} w-full`}
              >
                Downgrade plan
              </button>
            )}
            <button
              onClick={() => {
                if (
                  !window.confirm(
                    "Cancel this subscription at the end of the current billing period?",
                  )
                )
                  return;
                savePractice({ subscriptionStatus: "canceled", autoRenew: false });
                setAutoRenew(false);
                toast.success("Subscription set to cancel at period end.");
              }}
              className={`${btnGhost} w-full text-destructive`}
            >
              Cancel subscription
            </button>
          </div>
        </div>
      </Section>

      <Section title="Renewal details" description="Control how and when your subscription renews.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Row label="Next renewal date" value={practice.renewalDate} />
          <Row
            label="Renewal amount"
            value={
              cycle === "annual" ? `${money(monthlyCost * 12)}/year` : `${money(monthlyCost)}/month`
            }
          />
          <Row label="Auto renewal" value={autoRenew ? "On" : "Off"} />
          <Row
            label="Payment method on file"
            value={
              practice.paymentMethod
                ? `${practice.paymentMethod.brand} ending ${practice.paymentMethod.last4}`
                : "None on file"
            }
          />
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 items-end">
          <Toggle checked={autoRenew} onChange={setAutoRenew} label="Auto renewal" />
          <Field label="Billing cycle">
            <select
              className={inputCls}
              value={cycle}
              onChange={(e) => setCycle(e.target.value as Practice["billingCycle"])}
            >
              <option value="monthly">Monthly</option>
              <option value="annual">Annual</option>
            </select>
          </Field>
        </div>
        <p className="mt-4 text-[13px] text-muted-foreground leading-relaxed">
          Billing cycle changes take effect on your next renewal unless otherwise specified.
        </p>
      </Section>

      <Section
        title="Billing contacts"
        description="Who receives invoices and billing communications."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Billing contact name">
            <input
              className={inputCls}
              value={contacts.contactName}
              onChange={(e) => setContacts({ ...contacts, contactName: e.target.value })}
            />
          </Field>
          <Field label="Billing contact email">
            <input
              className={inputCls}
              value={contacts.contactEmail}
              onChange={(e) => setContacts({ ...contacts, contactEmail: e.target.value })}
            />
          </Field>
          <Field label="Accounts payable email (optional)">
            <input
              className={inputCls}
              value={contacts.apEmail}
              onChange={(e) => setContacts({ ...contacts, apEmail: e.target.value })}
            />
          </Field>
          <Field label="Finance department email (optional)">
            <input
              className={inputCls}
              value={contacts.financeEmail}
              onChange={(e) => setContacts({ ...contacts, financeEmail: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => {
              savePractice({ billingContacts: contacts });
              toast.success("Billing contacts saved.");
            }}
            className={btnPrimary}
          >
            Save billing contacts
          </button>
          <button
            onClick={() =>
              setContacts(
                practice.billingContacts ?? {
                  contactName: practice.ownerName,
                  contactEmail: practice.ownerEmail,
                  apEmail: "",
                  financeEmail: "",
                },
              )
            }
            className={btnGhost}
          >
            Reset changes
          </button>
        </div>
      </Section>

      <Section title="Purchase order" description="These values may appear on future invoices.">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Purchase order number (optional)">
            <input
              className={inputCls}
              value={po.poNumber}
              onChange={(e) => setPo({ ...po, poNumber: e.target.value })}
            />
          </Field>
          <Field label="Department / cost centre (optional)">
            <input
              className={inputCls}
              value={po.department}
              onChange={(e) => setPo({ ...po, department: e.target.value })}
            />
          </Field>
          <Field label="Internal reference number (optional)">
            <input
              className={inputCls}
              value={po.internalRef}
              onChange={(e) => setPo({ ...po, internalRef: e.target.value })}
            />
          </Field>
        </div>
        <div className="mt-6">
          <button
            onClick={() => {
              savePractice({ purchaseOrder: po });
              toast.success("Purchase order details saved.");
            }}
            className={btnPrimary}
          >
            Save
          </button>
        </div>
      </Section>

      <Section
        title="Tax information"
        description="Future invoices will use this information automatically."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business / organization name">
            <input
              className={inputCls}
              value={tax.businessName}
              onChange={(e) => setTax({ ...tax, businessName: e.target.value })}
            />
          </Field>
          <Field label="Tax ID / business number">
            <input
              className={inputCls}
              value={tax.taxId}
              onChange={(e) => setTax({ ...tax, taxId: e.target.value })}
            />
          </Field>
          <Field label="VAT number (where applicable)">
            <input
              className={inputCls}
              value={tax.vatNumber}
              onChange={(e) => setTax({ ...tax, vatNumber: e.target.value })}
            />
          </Field>
          <Field label="GST / HST number (Canada)">
            <input
              className={inputCls}
              value={tax.gstNumber}
              onChange={(e) => setTax({ ...tax, gstNumber: e.target.value })}
            />
          </Field>
          <Field label="Tax exemption status">
            <select
              className={inputCls}
              value={tax.exemptionStatus}
              onChange={(e) => setTax({ ...tax, exemptionStatus: e.target.value })}
            >
              <option>Not exempt</option>
              <option>Exempt - certificate on file</option>
              <option>Exemption pending review</option>
            </select>
          </Field>
          <Field label="Country">
            <select
              className={inputCls}
              value={tax.country}
              onChange={(e) => setTax({ ...tax, country: e.target.value })}
            >
              {COUNTRIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-6">
          <button
            onClick={() => {
              savePractice({ taxInfo: tax });
              toast.success("Tax information saved.");
            }}
            className={btnPrimary}
          >
            Save tax information
          </button>
        </div>
      </Section>

      <Section
        title="Billing preferences"
        description="Choose which billing communications your organization receives."
      >
        <div className="divide-y divide-border/60">
          <Toggle
            checked={prefs.invoicesByEmail}
            onChange={(v) => setPrefs({ ...prefs, invoicesByEmail: v })}
            label="Receive invoices by email"
          />
          <Toggle
            checked={prefs.copyBillingContact}
            onChange={(v) => setPrefs({ ...prefs, copyBillingContact: v })}
            label="Send invoice copies to billing contact"
          />
          <Toggle
            checked={prefs.copyAccountsPayable}
            onChange={(v) => setPrefs({ ...prefs, copyAccountsPayable: v })}
            label="Send invoice copies to accounts payable"
          />
          <Toggle
            checked={prefs.paymentReminders}
            onChange={(v) => setPrefs({ ...prefs, paymentReminders: v })}
            label="Receive payment reminders"
          />
          <Toggle
            checked={prefs.renewalReminders}
            onChange={(v) => setPrefs({ ...prefs, renewalReminders: v })}
            label="Receive renewal reminders"
          />
          <Toggle
            checked={prefs.pdfInvoices}
            onChange={(v) => setPrefs({ ...prefs, pdfInvoices: v })}
            label="Allow downloadable PDF invoices"
          />
        </div>
        <div className="mt-6">
          <button
            onClick={() => {
              savePractice({ billingPreferences: prefs });
              toast.success("Billing preferences saved.");
            }}
            className={btnPrimary}
          >
            Save preferences
          </button>
        </div>
      </Section>

      <Section
        title="Seat summary"
        description="Clinician seats purchased and assigned in this organization."
      >
        <div className="grid gap-4 sm:grid-cols-4">
          <Row label="Purchased seats" value={`${practice.seatsPurchased}`} />
          <Row label="Assigned seats" value={`${assigned}`} />
          <Row label="Available seats" value={`${available}`} />
          <Row label="Current monthly seat cost" value={`${money(monthlyCost)}/month`} />
        </div>
        <div className="mt-6">
          <button
            onClick={() => {
              onClose();
              onManageSeats();
            }}
            className={btnGhost}
          >
            Manage seats
          </button>
        </div>
      </Section>
    </Modal>
  );
}

/* ---------------- Payment method ---------------- */

export function PaymentMethodDialog({
  practice,
  onClose,
}: {
  practice: Practice;
  onClose: () => void;
}) {
  const existing = practice.paymentMethod;
  const [replacing, setReplacing] = useState(!existing);
  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    cardholder: existing?.cardholder ?? practice.ownerName,
    billingAddress: existing?.billingAddress ?? practice.address ?? "",
    country: existing?.country ?? practice.country ?? "United States",
    postalCode: existing?.postalCode ?? practice.postalCode ?? "",
  });

  const brandOf = (num: string) => {
    const d = num.replace(/\D/g, "");
    if (d.startsWith("4")) return "Visa";
    if (/^5[1-5]/.test(d)) return "Mastercard";
    if (/^3[47]/.test(d)) return "American Express";
    return "Card";
  };

  const save = () => {
    if (!replacing) {
      toast.success("Payment method saved.");
      onClose();
      return;
    }
    const digits = card.number.replace(/\D/g, "");
    if (digits.length < 13 || !card.expiry || card.cvv.length < 3 || !card.cardholder) {
      toast.error("Please complete the card details.");
      return;
    }
    savePractice({
      paymentMethod: {
        brand: brandOf(card.number),
        last4: digits.slice(-4),
        expiry: card.expiry,
        cardholder: card.cardholder,
        billingAddress: card.billingAddress,
        country: card.country,
        postalCode: card.postalCode,
      },
    });
    toast.success("Payment method updated.");
    onClose();
  };

  return (
    <Modal
      title="Payment method"
      description="Update the payment method used for your subscription."
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button onClick={save} className={btnPrimary}>
            Save changes
          </button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <div className="text-[13px] font-medium text-muted-foreground">
            Current payment method
          </div>
          {existing ? (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Row label="Card brand" value={existing.brand} />
              <Row label="Last four digits" value={`•••• ${existing.last4}`} />
              <Row label="Expiry date" value={existing.expiry} />
              <Row label="Cardholder name" value={existing.cardholder} />
              <div className="sm:col-span-2">
                <Row
                  label="Billing address"
                  value={
                    [existing.billingAddress, existing.postalCode, existing.country]
                      .filter(Boolean)
                      .join(", ") || "-"
                  }
                />
              </div>
            </div>
          ) : (
            <p className="mt-2 text-[14px] text-muted-foreground">No payment method on file.</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => setReplacing(true)} className={btnGhost}>
            Replace card
          </button>
          {existing && (
            <button
              onClick={() => {
                if (!window.confirm("Remove this payment method from your organization?")) return;
                savePractice({ paymentMethod: null });
                toast.success("Payment method removed.");
                onClose();
              }}
              className={`${btnGhost} text-destructive`}
            >
              Remove card
            </button>
          )}
        </div>

        {replacing && (
          <div className="rounded-xl hairline bg-muted/30 p-6">
            <div className="text-[15px] font-medium">New card details</div>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Card number">
                  <input
                    className={inputCls}
                    inputMode="numeric"
                    placeholder="4242 4242 4242 4242"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Expiry date">
                <input
                  className={inputCls}
                  placeholder="MM/YY"
                  value={card.expiry}
                  onChange={(e) => setCard({ ...card, expiry: e.target.value })}
                />
              </Field>
              <Field label="CVV">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={card.cvv}
                  onChange={(e) => setCard({ ...card, cvv: e.target.value })}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Cardholder name">
                  <input
                    className={inputCls}
                    value={card.cardholder}
                    onChange={(e) => setCard({ ...card, cardholder: e.target.value })}
                  />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Billing address">
                  <input
                    className={inputCls}
                    value={card.billingAddress}
                    onChange={(e) => setCard({ ...card, billingAddress: e.target.value })}
                  />
                </Field>
              </div>
              <Field label="Country">
                <select
                  className={inputCls}
                  value={card.country}
                  onChange={(e) => setCard({ ...card, country: e.target.value })}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </Field>
              <Field label="Postal code">
                <input
                  className={inputCls}
                  value={card.postalCode}
                  onChange={(e) => setCard({ ...card, postalCode: e.target.value })}
                />
              </Field>
            </div>
            <p className="mt-5 text-[13px] text-muted-foreground leading-relaxed">
              Card details are stored locally in this demo. Secure card capture will be handled by
              the payment provider once billing is connected.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ---------------- Billing history ---------------- */

type Invoice = {
  number: string;
  date: string;
  period: string;
  amount: number;
  status: "Paid" | "Pending" | "Failed" | "Refunded";
  method: string;
};

function buildInvoices(practice: Practice): Invoice[] {
  const amount = practice.seatsPurchased * SEAT_PRICE;
  const method = practice.paymentMethod
    ? `${practice.paymentMethod.brand} •••• ${practice.paymentMethod.last4}`
    : "Visa •••• 4242";
  const statuses: Invoice["status"][] = [
    "Paid",
    "Paid",
    "Paid",
    "Pending",
    "Paid",
    "Refunded",
    "Paid",
    "Failed",
    "Paid",
  ];
  const start = new Date();
  return statuses.map((status, i) => {
    const d = new Date(start.getFullYear(), start.getMonth() - i, 1);
    const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    const iso = (x: Date) => x.toISOString().slice(0, 10);
    return {
      number: `INV-${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}-${String(1042 - i)}`,
      date: iso(d),
      period: `${iso(d)} to ${iso(end)}`,
      amount,
      status,
      method,
    };
  });
}

export function BillingHistoryDialog({
  practice,
  onClose,
}: {
  practice: Practice;
  onClose: () => void;
}) {
  const invoices = buildInvoices(practice);
  const perPage = 5;
  const [page, setPage] = useState(0);
  const pages = Math.ceil(invoices.length / perPage);
  const rows = invoices.slice(page * perPage, page * perPage + perPage);

  const act = (label: string, inv: Invoice) =>
    toast.info(`${label} - ${inv.number}`, {
      description: "Documents will be available once billing is connected.",
    });

  const statusCls = (s: Invoice["status"]) =>
    s === "Paid"
      ? "bg-primary/10 text-primary"
      : s === "Failed"
        ? "bg-destructive/10 text-destructive"
        : "bg-muted text-muted-foreground";

  return (
    <Modal
      title="Billing history"
      description="View previous invoices, payments and receipts."
      size="lg"
      onClose={onClose}
      footer={
        <button onClick={onClose} className={btnGhost}>
          Close
        </button>
      }
    >
      <div className="rounded-2xl hairline overflow-x-auto">
        <table className="w-full text-left min-w-[860px]">
          <thead>
            <tr className="text-[12px] uppercase tracking-[0.1em] text-muted-foreground border-b border-border">
              <th className="px-5 py-4 font-semibold">Invoice</th>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Billing period</th>
              <th className="px-5 py-4 font-semibold">Amount</th>
              <th className="px-5 py-4 font-semibold">Status</th>
              <th className="px-5 py-4 font-semibold">Payment method</th>
              <th className="px-5 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((inv) => (
              <tr key={inv.number} className="border-b border-border/60 last:border-0">
                <td className="px-5 py-4 text-[14px] font-medium">{inv.number}</td>
                <td className="px-5 py-4 text-[14px] text-muted-foreground">{inv.date}</td>
                <td className="px-5 py-4 text-[13px] text-muted-foreground">{inv.period}</td>
                <td className="px-5 py-4 text-[14px]">{money(inv.amount)}</td>
                <td className="px-5 py-4">
                  <span className={`text-[12px] px-2.5 py-1 rounded-full ${statusCls(inv.status)}`}>
                    {inv.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-[14px] text-muted-foreground">{inv.method}</td>
                <td className="px-5 py-4 text-right whitespace-nowrap">
                  <div className="inline-flex items-center gap-3">
                    {["View invoice", "Download PDF", "Download receipt"].map((l) => (
                      <button
                        key={l}
                        onClick={() => act(l, inv)}
                        className="text-[13px] text-muted-foreground hover:text-foreground transition"
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="mt-6 flex items-center justify-between gap-4">
          <div className="text-[13px] text-muted-foreground">
            Page {page + 1} of {pages}
          </div>
          <div className="flex items-center gap-3">
            <button
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
              className={`${btnGhost} disabled:opacity-40`}
            >
              Previous
            </button>
            <button
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
              className={`${btnGhost} disabled:opacity-40`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

/* ---------------- Add seat ---------------- */

export function AddSeatDialog({
  practice,
  onConfirm,
  onClose,
}: {
  practice: Practice;
  onConfirm: (n: number) => void;
  onClose: () => void;
}) {
  const [additional, setAdditional] = useState(1);
  const { daysRemaining, totalDays, perSeat } = prorationDetails(
    practice.renewalDate,
    practice.billingCycle,
  );
  const current = practice.seatsPurchased;
  const newTotal = current + additional;
  const monthlyIncrease = additional * SEAT_PRICE;
  const totalProrated = Math.round((perSeat * additional + Number.EPSILON) * 100) / 100;

  return (
    <Modal
      title="Add seat"
      description={`Add clinician seats to your practice at ${money(SEAT_PRICE)} per clinician/month.`}
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className={btnGhost}>
            Cancel
          </button>
          <button onClick={() => onConfirm(additional)} className={btnPrimary}>
            Add {additional} seat{additional > 1 ? "s" : ""}
          </button>
        </>
      }
    >
      <div>
        <span className="text-[13px] font-medium text-foreground/80">Additional seats</span>
        <div className="mt-2 flex items-center gap-3">
          <button
            aria-label="Decrease additional seats"
            onClick={() => setAdditional((a) => Math.max(1, a - 1))}
            className="w-11 h-11 rounded-full hairline bg-card text-[18px] hover:bg-muted transition"
          >
            -
          </button>
          <input
            type="number"
            min={1}
            value={additional}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10);
              setAdditional(Number.isNaN(n) ? 1 : Math.max(1, n));
            }}
            className="w-24 h-11 rounded-xl hairline bg-card px-3.5 text-[15px] text-center outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition"
          />
          <button
            aria-label="Increase additional seats"
            onClick={() => setAdditional((a) => a + 1)}
            className="w-11 h-11 rounded-full hairline bg-card text-[18px] hover:bg-muted transition"
          >
            +
          </button>
        </div>
      </div>

      <div className="mt-7 space-y-2.5">
        {[
          ["Current seats", `${current}`],
          ["Additional seats", `${additional}`],
          ["New total seats", `${newTotal}`],
          ["Seat price", `${money(SEAT_PRICE)}/month`],
          ["Days remaining in billing cycle", `${daysRemaining} of ${totalDays}`],
          ["Prorated charge per seat", money(perSeat)],
          ["Monthly increase", `${money(monthlyIncrease)}/month`],
        ].map(([label, value]) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="text-[14px] text-muted-foreground">{label}</span>
            <span className="text-[14px] font-medium">{value}</span>
          </div>
        ))}
        <div className="pt-3 mt-3 border-t border-border flex items-center justify-between gap-4">
          <span className="text-[15px] font-medium">Total charge today</span>
          <span className="text-[18px] font-semibold">{money(totalProrated)}</span>
        </div>
      </div>

      <p className="mt-5 text-[13px] text-muted-foreground leading-relaxed">
        Today's charge is prorated based on the remaining time in your current billing cycle. Future
        invoices will include the full monthly cost for all active clinician seats.
      </p>
    </Modal>
  );
}
