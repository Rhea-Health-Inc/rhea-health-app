import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { APPOINTMENTS } from "@/lib/mock";
import { PageHeader } from "@/components/clinik/PageHeader";
import { addPatient, usePatients, type Patient } from "@/lib/patients";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/app/patients")({
  component: Patients,
});

const FILTERS = ["Active", "New", "Recent", "Archived"] as const;
type Filter = (typeof FILTERS)[number];

function Patients() {
  const patients = usePatients();
  const [q, setQ] = useState("");
  const [f, setF] = useState<Filter>("Active");
  const [addOpen, setAddOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = [...patients];
    if (f === "New") list = list.filter((p) => p.source === "manual");
    if (f === "Recent") list = list.sort((a, b) => b.createdAt - a.createdAt).slice(0, 6);
    if (f === "Archived") list = [];
    if (q) list = list.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
    return list;
  }, [patients, f, q]);

  const apptById = useMemo(() => {
    const map = new Map<string, (typeof APPOINTMENTS)[number]>();
    APPOINTMENTS.forEach((a) => map.set(a.patient.id, a));
    return map;
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  return (
    <div className="max-w-6xl mx-auto px-12 py-14">
      <PageHeader
        breadcrumb={[{ label: "Workspace", to: "/app" }, { label: "Patients" }]}
        title="Patients"
        description="Your full patient directory, including recent encounters, documentation status and care team assignment."
        actions={
          <button
            onClick={() => setAddOpen(true)}
            className="inline-flex items-center h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add new patient
          </button>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 flex items-center gap-2 h-11 rounded-xl hairline bg-card px-4">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search patients"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-1 bg-muted rounded-full p-1">
          {FILTERS.map((x) => (
            <button
              key={x}
              onClick={() => setF(x)}
              className={`text-[14px] px-3 h-8 rounded-full transition ${
                f === x
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {x}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-card hairline p-16 text-center">
          <UserPlus className="w-6 h-6 mx-auto text-muted-foreground" />
          <div className="mt-3 text-[14px] font-medium text-foreground">
            {f === "Archived" ? "No archived patients." : "No patients match."}
          </div>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {f === "Archived"
              ? "Archived records will appear here."
              : "Try a different filter or add a new patient."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((p) => {
            const appt = apptById.get(p.id) ?? APPOINTMENTS[0];
            return (
              <Link
                key={p.id}
                to="/app/visit/$id"
                params={{ id: appt.id }}
                search={{ tab: "workspace" }}
                className="rounded-2xl bg-card hairline p-6 hover:shadow-[var(--shadow-clinik)] hover:-translate-y-0.5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <img src={p.photo} alt={p.name} className="w-12 h-12 rounded-full object-cover" />
                  <div className="min-w-0">
                    <div className="text-[14px] font-medium truncate">{p.name}</div>
                    <div className="text-[14px] text-muted-foreground">
                      {p.age || "N/A"} · {p.sex} · {p.mrn}
                    </div>
                  </div>
                  {p.source === "manual" && (
                    <span className="ml-auto text-[12px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      New
                    </span>
                  )}
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-[14px]">
                  <div>
                    <div className="text-muted-foreground">Primary condition</div>
                    <div className="text-foreground mt-0.5">{p.conditions || "-"}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Last visit</div>
                    <div className="text-foreground mt-0.5">
                      {p.source === "manual" ? "-" : "Mar 04, 2026"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Next appointment</div>
                    <div className="text-foreground mt-0.5">
                      {p.source === "manual" ? "Not scheduled" : `${appt.time} today`}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Reason</div>
                    <div className="text-foreground mt-0.5 truncate">
                      {p.source === "manual" ? "-" : appt.reason}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <AddPatientDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onCreated={(p) => flash(`${p.name} added to directory`)}
      />

      {toast && (
        <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-foreground text-background px-4 py-3 text-[14px] shadow-[var(--shadow-clinik-lg)]">
          {toast}
        </div>
      )}
    </div>
  );
}

function AddPatientDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (p: Patient) => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    phone: "",
    preferredName: "",
    gender: "",
    address: "",
    emergencyContact: "",
    allergies: "",
    medications: "",
    conditions: "",
    insurance: "",
    primaryPhysician: "",
  });
  const [error, setError] = useState<string | null>(null);

  const update = (k: keyof typeof form, v: string) => setForm((s) => ({ ...s, [k]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError("First and last name are required.");
      return;
    }
    if (!form.dob) {
      setError("Date of birth is required.");
      return;
    }
    if (!form.email.trim() || !form.phone.trim()) {
      setError("Email and phone number are required.");
      return;
    }
    setError(null);
    const patient = addPatient({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      preferredName: form.preferredName.trim() || undefined,
      dob: form.dob,
      email: form.email.trim(),
      phone: form.phone.trim(),
      sex: form.gender.toLowerCase().startsWith("f")
        ? "F"
        : form.gender.toLowerCase().startsWith("m")
          ? "M"
          : "Unspecified",
      gender: form.gender.trim() || undefined,
      address: form.address.trim() || undefined,
      emergencyContact: form.emergencyContact.trim() || undefined,
      allergies: form.allergies.trim() || undefined,
      medications: form.medications.trim() || undefined,
      conditions: form.conditions.trim() || undefined,
      insurance: form.insurance.trim() || undefined,
      primaryPhysician: form.primaryPhysician.trim() || undefined,
    });
    onCreated(patient);
    onClose();
    setForm({
      firstName: "",
      lastName: "",
      dob: "",
      email: "",
      phone: "",
      preferredName: "",
      gender: "",
      address: "",
      emergencyContact: "",
      allergies: "",
      medications: "",
      conditions: "",
      insurance: "",
      primaryPhysician: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add new patient</DialogTitle>
          <DialogDescription>
            Create a patient record manually. A unique patient ID is generated on save.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <FieldGrid>
            <Field label="First name *">
              <Input v={form.firstName} on={(v) => update("firstName", v)} />
            </Field>
            <Field label="Last name *">
              <Input v={form.lastName} on={(v) => update("lastName", v)} />
            </Field>
            <Field label="Preferred name">
              <Input v={form.preferredName} on={(v) => update("preferredName", v)} />
            </Field>
            <Field label="Date of birth *">
              <Input type="date" v={form.dob} on={(v) => update("dob", v)} />
            </Field>
            <Field label="Gender">
              <Input
                v={form.gender}
                on={(v) => update("gender", v)}
                placeholder="Female / Male / Other"
              />
            </Field>
            <Field label="Email *">
              <Input type="email" v={form.email} on={(v) => update("email", v)} />
            </Field>
            <Field label="Phone *">
              <Input v={form.phone} on={(v) => update("phone", v)} placeholder="(555) 555-0100" />
            </Field>
            <Field label="Primary physician">
              <Input v={form.primaryPhysician} on={(v) => update("primaryPhysician", v)} />
            </Field>
          </FieldGrid>
          <Field label="Address">
            <Input v={form.address} on={(v) => update("address", v)} />
          </Field>
          <Field label="Emergency contact">
            <Input
              v={form.emergencyContact}
              on={(v) => update("emergencyContact", v)}
              placeholder="Name · relationship · phone"
            />
          </Field>
          <FieldGrid>
            <Field label="Allergies">
              <Input v={form.allergies} on={(v) => update("allergies", v)} />
            </Field>
            <Field label="Current medications">
              <Input v={form.medications} on={(v) => update("medications", v)} />
            </Field>
            <Field label="Existing conditions">
              <Input v={form.conditions} on={(v) => update("conditions", v)} />
            </Field>
            <Field label="Insurance">
              <Input
                v={form.insurance}
                on={(v) => update("insurance", v)}
                placeholder="Plan · Member ID"
              />
            </Field>
          </FieldGrid>

          {error && <div className="text-[14px] text-destructive">{error}</div>}

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> Create patient
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-3">{children}</div>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[12px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}
function Input({
  v,
  on,
  type = "text",
  placeholder,
}: {
  v: string;
  on: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <input
      type={type}
      value={v}
      placeholder={placeholder}
      onChange={(e) => on(e.target.value)}
      className="w-full h-10 rounded-xl hairline bg-card px-3 text-[14px] text-foreground outline-none focus:border-primary transition"
    />
  );
}
