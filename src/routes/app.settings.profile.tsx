import { createFileRoute, Link } from "@tanstack/react-router";
import { Camera, Upload, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { CLINICIAN } from "@/lib/mock";
import { SettingsHeader } from "@/components/clinik/SettingsUI";

export const Route = createFileRoute("/app/settings/profile")({
  component: EditProfile,
});

const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Australia",
  "Ireland",
  "New Zealand",
];
const LANGUAGES = ["English (US)", "English (UK)", "Spanish", "French", "German", "Mandarin"];
const TIMEZONES = [
  "(GMT-08:00) Pacific Time - Los Angeles",
  "(GMT-07:00) Mountain Time - Denver",
  "(GMT-06:00) Central Time - Chicago",
  "(GMT-05:00) Eastern Time - New York",
  "(GMT+00:00) London",
  "(GMT+01:00) Berlin",
  "(GMT+05:30) Mumbai",
  "(GMT+10:00) Sydney",
];

const BIO_MAX = 600;

const INITIAL = {
  photo: CLINICIAN.photo,
  firstName: "Sarah",
  lastName: "Chen",
  preferredName: "",
  email: "sarah.chen@ridgemont.health",
  mobile: "(415) 555-0199",
  officePhone: "",
  country: "United States",
  timezone: "(GMT-08:00) Pacific Time - Los Angeles",
  language: "English (US)",
  bio: "",
  visibility: "organization-only",
};

const ACCOUNT = [
  { label: "User ID", value: "USR-48291-RH" },
  { label: "Organization", value: CLINICIAN.hospital },
  { label: "Current Role", value: CLINICIAN.role },
  { label: "Member Since", value: "March 12, 2023" },
  { label: "Last Login", value: "Today at 8:42 AM" },
];

function EditProfile() {
  const [form, setForm] = useState(INITIAL);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [tzQuery, setTzQuery] = useState("");
  const [tzOpen, setTzOpen] = useState(false);

  const dirty = useMemo(
    () => (Object.keys(INITIAL) as (keyof typeof INITIAL)[]).some((k) => form[k] !== INITIAL[k]),
    [form],
  );

  const errors: Partial<Record<keyof typeof INITIAL, string>> = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";
  if (!form.email.trim()) errors.email = "Email address is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
    errors.email = "Enter a valid email address";
  if (!form.mobile.trim()) errors.mobile = "Mobile phone number is required";

  const update = (k: keyof typeof INITIAL, v: string) => setForm((s) => ({ ...s, [k]: v }));
  const blur = (k: string) => setTouched((s) => ({ ...s, [k]: true }));

  const displayName =
    `Dr. ${form.preferredName.trim() || form.firstName.trim() || "—"} ${form.lastName.trim()}`.trim();

  const filteredTz = TIMEZONES.filter((t) => t.toLowerCase().includes(tzQuery.toLowerCase()));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(errors).length) {
      setTouched({ firstName: true, lastName: true, email: true, mobile: true });
      return;
    }
    toast.success("Profile updated successfully.");
    setTouched({});
  };

  const onPhoto = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update("photo", String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-12 py-14 pb-28">
      <SettingsHeader
        title="Edit profile"
        description="Manage your personal profile and account identity. Credentials, security, and notifications live in their own settings pages."
      />

      <form onSubmit={submit} className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left column - photo */}
        <div className="lg:col-span-4">
          <div className="rounded-2xl bg-card hairline p-8 text-center lg:sticky lg:top-6">
            <div className="relative inline-block">
              {form.photo ? (
                <img
                  src={form.photo}
                  className="w-32 h-32 rounded-full object-cover mx-auto"
                  alt="Profile"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                  <Camera className="w-7 h-7" />
                </div>
              )}
            </div>
            <div className="mt-5 space-y-2">
              <label className="w-full h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" /> Upload Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => onPhoto(e.target.files?.[0])}
                />
              </label>
              <label className="w-full h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center justify-center gap-1.5 cursor-pointer">
                <Camera className="w-3.5 h-3.5" /> Change Photo
                <input
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={(e) => onPhoto(e.target.files?.[0])}
                />
              </label>
              <button
                type="button"
                onClick={() => update("photo", "")}
                className="w-full h-10 px-5 rounded-full hairline bg-card text-[14px] text-muted-foreground hover:text-foreground hover:bg-muted transition inline-flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove Photo
              </button>
            </div>
            <div className="mt-4 text-[12px] text-muted-foreground">
              Accepted file types: JPG, PNG. Up to 5 MB.
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="lg:col-span-8 space-y-6">
          <Section title="Basic information">
            <Grid>
              <Field
                label="First name"
                required
                error={touched.firstName ? errors.firstName : undefined}
              >
                <Input
                  v={form.firstName}
                  on={(v) => update("firstName", v)}
                  onBlur={() => blur("firstName")}
                  invalid={!!(touched.firstName && errors.firstName)}
                />
              </Field>
              <Field
                label="Last name"
                required
                error={touched.lastName ? errors.lastName : undefined}
              >
                <Input
                  v={form.lastName}
                  on={(v) => update("lastName", v)}
                  onBlur={() => blur("lastName")}
                  invalid={!!(touched.lastName && errors.lastName)}
                />
              </Field>
              <Field label="Preferred name" hint="Optional">
                <Input
                  v={form.preferredName}
                  on={(v) => update("preferredName", v)}
                  placeholder="How colleagues address you"
                />
              </Field>
            </Grid>
            <div className="mt-4 rounded-xl bg-muted/60 px-4 py-3">
              <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
                Display name preview
              </div>
              <div className="text-[15px] font-medium mt-0.5">{displayName}</div>
            </div>
          </Section>

          <Section title="Contact information">
            <Grid>
              <Field
                label="Email address"
                required
                error={touched.email ? errors.email : undefined}
              >
                <Input
                  type="email"
                  v={form.email}
                  on={(v) => update("email", v)}
                  onBlur={() => blur("email")}
                  invalid={!!(touched.email && errors.email)}
                />
                {form.email !== INITIAL.email && (
                  <Notice>
                    We'll send a verification link to your new address. It becomes active once
                    verified.
                  </Notice>
                )}
              </Field>
              <Field
                label="Mobile phone number"
                required
                error={touched.mobile ? errors.mobile : undefined}
              >
                <Input
                  v={form.mobile}
                  on={(v) => update("mobile", v)}
                  onBlur={() => blur("mobile")}
                  invalid={!!(touched.mobile && errors.mobile)}
                />
                {form.mobile !== INITIAL.mobile && (
                  <Notice>
                    SMS verification is required before this number is used for account access.
                  </Notice>
                )}
              </Field>
              <Field label="Office phone" hint="Optional">
                <Input
                  v={form.officePhone}
                  on={(v) => update("officePhone", v)}
                  placeholder="(415) 555-0100"
                />
              </Field>
              <Field label="Country">
                <Select v={form.country} on={(v) => update("country", v)} options={COUNTRIES} />
              </Field>
              <Field label="Time zone">
                <div className="relative">
                  <input
                    value={tzOpen ? tzQuery : form.timezone}
                    onFocus={() => {
                      setTzOpen(true);
                      setTzQuery("");
                    }}
                    onChange={(e) => setTzQuery(e.target.value)}
                    onBlur={() => window.setTimeout(() => setTzOpen(false), 120)}
                    placeholder="Search time zones"
                    className="w-full h-10 rounded-xl hairline bg-card px-3 text-[14px] text-foreground outline-none focus:border-primary transition"
                  />
                  {tzOpen && (
                    <div className="absolute z-20 mt-1 w-full max-h-56 overflow-auto rounded-xl bg-card hairline shadow-[var(--shadow-clinik)] py-1">
                      {filteredTz.length === 0 && (
                        <div className="px-3 py-2 text-[14px] text-muted-foreground">
                          No matches
                        </div>
                      )}
                      {filteredTz.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onMouseDown={() => {
                            update("timezone", t);
                            setTzOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-[14px] hover:bg-muted transition"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>
              <Field label="Preferred language">
                <Select v={form.language} on={(v) => update("language", v)} options={LANGUAGES} />
              </Field>
            </Grid>
          </Section>

          <Section title="About me">
            <textarea
              value={form.bio}
              maxLength={BIO_MAX}
              onChange={(e) => update("bio", e.target.value)}
              rows={5}
              placeholder="A short biography shown alongside your profile (optional)."
              className="w-full rounded-xl hairline bg-card px-3 py-2.5 text-[14px] text-foreground outline-none focus:border-primary transition resize-y"
            />
            <div className="text-[12px] text-muted-foreground text-right mt-1">
              {form.bio.length} / {BIO_MAX} characters
            </div>
          </Section>

          <Section title="Profile visibility">
            <div className="space-y-1">
              {[
                {
                  v: "organization-only",
                  l: "Organization Only",
                  d: "Visible to administrators of your organization.",
                },
                { v: "my-team", l: "My Team", d: "Visible to clinicians on your care team." },
                {
                  v: "everyone",
                  l: "Everyone in Organization",
                  d: "Visible to all staff in your organization.",
                },
              ].map((o) => (
                <label
                  key={o.v}
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 cursor-pointer transition ${
                    form.visibility === o.v
                      ? "bg-primary/[0.06] border border-primary/30"
                      : "hairline bg-card hover:bg-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="visibility"
                    checked={form.visibility === o.v}
                    onChange={() => update("visibility", o.v)}
                    className="mt-1 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="block text-[14px] font-medium">{o.l}</span>
                    <span className="block text-[14px] text-muted-foreground">{o.d}</span>
                  </span>
                </label>
              ))}
            </div>
          </Section>

          <Section title="Account information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {ACCOUNT.map((a) => (
                <div key={a.label}>
                  <div className="text-[12px] uppercase tracking-wider text-muted-foreground">
                    {a.label}
                  </div>
                  <div className="text-[14px] mt-0.5">{a.value}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-[12px] text-muted-foreground">
              These values are managed by your organization and can't be edited here.
            </div>
          </Section>
        </div>

        {/* Sticky action bar */}
        <div className="lg:col-span-12 fixed bottom-0 left-0 right-0 z-30 border-t border-border/70 bg-background/90 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-6 sm:px-10 py-3 flex items-center justify-end gap-3">
            {dirty && (
              <div className="mr-auto text-[14px] text-muted-foreground inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Unsaved changes
              </div>
            )}
            <Link
              to="/app/settings"
              className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] hover:opacity-90 transition inline-flex items-center"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-card hairline p-8">
      <div className="text-[12px] uppercase tracking-wider text-muted-foreground mb-4 font-medium">
        {title}
      </div>
      {children}
    </div>
  );
}
function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}
function Field({
  label,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <div className="text-[12px] uppercase tracking-wider text-muted-foreground mb-1">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
        {hint && (
          <span className="ml-2 normal-case tracking-normal text-muted-foreground/80">{hint}</span>
        )}
      </div>
      {children}
      {error && <div className="text-[12px] text-destructive mt-1">{error}</div>}
    </div>
  );
}
function Notice({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] text-muted-foreground mt-1.5 leading-snug">{children}</div>;
}
function Input({
  v,
  on,
  type = "text",
  placeholder,
  onBlur,
  invalid,
}: {
  v: string;
  on: (v: string) => void;
  type?: string;
  placeholder?: string;
  onBlur?: () => void;
  invalid?: boolean;
}) {
  return (
    <input
      type={type}
      value={v}
      placeholder={placeholder}
      onBlur={onBlur}
      onChange={(e) => on(e.target.value)}
      aria-invalid={invalid}
      className={`w-full h-10 rounded-xl bg-card px-3 text-[14px] text-foreground outline-none transition ${
        invalid ? "border border-destructive" : "hairline focus:border-primary"
      }`}
    />
  );
}
function Select({ v, on, options }: { v: string; on: (v: string) => void; options: string[] }) {
  return (
    <select
      value={v}
      onChange={(e) => on(e.target.value)}
      className="w-full h-10 rounded-xl hairline bg-card px-3 text-[14px] text-foreground outline-none focus:border-primary transition"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
