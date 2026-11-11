import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/clinik/Logo";
import { signIn } from "@/lib/auth";
import {
  COUNTRIES,
  ROLES,
  SPECIALTIES,
  createPractice,
  statesFor,
  type OnboardingDraft,
} from "@/lib/practice";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your workspace - Rhea" },
      {
        name: "description",
        content: "Set up your Rhea Health clinician workspace in a few steps.",
      },
      { property: "og:title", content: "Create your workspace - Rhea" },
      {
        property: "og:description",
        content: "Set up your Rhea Health clinician workspace in a few steps.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignUp,
});

const BASE_STEPS = ["Create your workspace", "Your practice", "Verification", "Choose your plan"];
const TEAM_STEP = "Team size";

const TEAM_MIN_SEATS = 5;
const TEAM_SEAT_PRICE = 179;

const inputCls =
  "mt-2 w-full h-12 rounded-xl hairline bg-card px-4 text-[15px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-[14px] font-medium text-foreground">{label}</span>
      {children}
      {hint && <span className="mt-2 block text-[13px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

function StepHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="max-w-2xl">
      <h1 className="h-display text-[32px] font-semibold tracking-[-0.02em] leading-tight">
        {title}
      </h1>
      <p className="mt-4 text-[16px] text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-start gap-3.5 text-left w-full"
    >
      <span
        className={`mt-0.5 w-[20px] h-[20px] shrink-0 rounded-[6px] hairline flex items-center justify-center transition ${
          checked ? "bg-primary border-primary" : "bg-card"
        }`}
      >
        {checked && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
      </span>
      <span className="text-[15px] text-muted-foreground leading-relaxed">{children}</span>
    </button>
  );
}

function PlanCard({
  eyebrow,
  eyebrowTone = "muted",
  name,
  tagline,
  price,
  priceNote,
  priceLead,
  description,
  recommended,
  wide,
  children,
}: {
  eyebrow?: string;
  eyebrowTone?: "muted" | "primary";
  name: string;
  tagline: string;
  price: string;
  priceNote?: string;
  priceLead?: string;
  description: string;
  recommended?: boolean;
  wide?: boolean;
  children: React.ReactNode;
}) {
  if (wide) {
    return (
      <div className="rounded-2xl hairline bg-card p-9 sm:p-10 grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
        <div className="min-w-0">
          {eyebrow && (
            <div className="text-[12px] uppercase tracking-[0.12em] font-semibold text-muted-foreground">
              {eyebrow}
            </div>
          )}
          <div className="mt-3 flex items-baseline gap-4 flex-wrap">
            <span className="text-[18px] font-medium">{name}</span>
            <span className="text-[24px] font-semibold tracking-[-0.02em]">{price}</span>
          </div>
          <div className="mt-2 text-[14px] text-muted-foreground leading-relaxed">{tagline}</div>
          <p className="mt-4 text-[14px] text-muted-foreground leading-relaxed max-w-2xl">
            {description}
          </p>
        </div>
        <div className="space-y-3">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col rounded-2xl hairline bg-card p-9 h-full ${
        recommended ? "border-primary/50 shadow-[var(--shadow-clinik-sm)]" : ""
      }`}
    >
      {eyebrow && (
        <div
          className={`text-[12px] uppercase tracking-[0.12em] font-semibold ${
            eyebrowTone === "primary" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {eyebrow}
        </div>
      )}
      <div className="mt-3 text-[18px] font-medium">{name}</div>
      <div className="mt-1.5 text-[14px] text-muted-foreground leading-relaxed">{tagline}</div>
      <div className="mt-7">
        {priceLead && <div className="text-[13px] text-muted-foreground">{priceLead}</div>}
        <div className="mt-1 text-[32px] font-semibold tracking-[-0.02em] leading-none whitespace-nowrap">
          {price}
          {priceNote && (
            <span className="text-[15px] font-normal text-muted-foreground"> {priceNote}</span>
          )}
        </div>
      </div>
      <p className="mt-5 text-[14px] text-muted-foreground leading-relaxed">{description}</p>
      <div className="mt-auto pt-8 space-y-3">{children}</div>
    </div>
  );
}

function SignUp() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  // Step 2
  const [practiceName, setPracticeName] = useState("");
  const [country, setCountry] = useState("United States");
  const [state, setState] = useState("");
  const [role, setRole] = useState("");
  const [specialty, setSpecialty] = useState("");

  // Step 3
  const [license, setLicense] = useState("");
  const [licenseCountry, setLicenseCountry] = useState("United States");
  const [licenseState, setLicenseState] = useState("");
  const [npi, setNpi] = useState("");
  const [attest, setAttest] = useState(false);

  // Teams onboarding
  const [teamStatus, setTeamStatus] = useState<"trialing" | "active">("trialing");
  const [teamSeats, setTeamSeats] = useState<number>(TEAM_MIN_SEATS);

  const draft: OnboardingDraft = {
    firstName,
    lastName,
    email,
    practiceName,
    country,
    state,
    role,
    specialty,
    license,
    licenseCountry,
    licenseState,
    npi,
  };

  const steps = step === 4 ? [...BASE_STEPS, TEAM_STEP] : BASE_STEPS;

  const stateOptions = useMemo(() => statesFor(country), [country]);
  const licenseStateOptions = useMemo(() => statesFor(licenseCountry), [licenseCountry]);

  const next = () => {
    setError(null);
    if (step === 0) {
      if (!firstName || !lastName || !email || !password || !confirm)
        return setError("Please complete all required fields.");
      if (password.length < 8) return setError("Password must be at least 8 characters.");
      if (password !== confirm) return setError("Passwords do not match.");
      if (!terms || !privacy)
        return setError("Please accept the Terms of Service and Privacy Policy.");
    }
    if (step === 1) {
      if (!practiceName || !country || !state || !role || !specialty)
        return setError("Please complete all required fields.");
    }
    if (step === 2) {
      if (!license || !licenseCountry || !licenseState)
        return setError("Please complete all required fields.");
      if (!attest)
        return setError("Please confirm that you are a licensed healthcare professional.");
    }
    setStep((s) => Math.min(s + 1, 3));
  };

  const finish = (
    status: "trialing" | "active",
    planLabel: string,
    plan: "professional" | "team",
    seats = 1,
  ) => {
    createPractice(draft, { plan, planLabel, status, cycle: "monthly", seats });
    signIn(email);
    toast.success(
      status === "trialing"
        ? "Free trial activated. Welcome to Rhea."
        : "Subscription activated. Welcome to Rhea.",
      {
        description:
          plan === "team"
            ? `${practiceName} is ready - you're the organization owner with ${seats} clinician seats provisioned.`
            : `${practiceName} is ready - you're the organization owner with one clinician seat assigned.`,
      },
    );
    navigate({ to: "/app" });
  };

  const startTeam = (status: "trialing" | "active") => {
    setError(null);
    setTeamStatus(status);
    setStep(4);
  };

  const completeTeam = () => {
    if (!Number.isFinite(teamSeats) || teamSeats < TEAM_MIN_SEATS) {
      return setError(`Please select at least ${TEAM_MIN_SEATS} clinician seats.`);
    }
    finish(teamStatus, "Teams", "team", teamSeats);
  };

  return (
    <div className="rhea-app min-h-screen bg-[var(--onboarding-bg)] text-foreground">
      <div className="mx-auto max-w-4xl px-6 sm:px-10 py-14">
        <div className="flex items-center justify-between gap-6">
          <Link to="/" aria-label="Rhea home" className="w-fit">
            <Logo height={36} />
          </Link>
          <div className="text-[14px] text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>

        {/* Stepper */}
        <ol className="mt-14 flex items-center gap-4 flex-wrap">
          {steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <li key={s} className="flex items-center gap-2.5">
                <span
                  className={`w-8 h-8 rounded-full text-[13px] font-semibold flex items-center justify-center transition ${
                    done
                      ? "bg-primary text-primary-foreground"
                      : active
                        ? "bg-primary/10 text-primary hairline border-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </span>
                <span
                  className={`text-[14px] ${active ? "text-foreground font-semibold" : "text-muted-foreground"}`}
                >
                  {s}
                </span>
                {i < steps.length - 1 && <span className="w-8 h-px bg-border" />}
              </li>
            );
          })}
        </ol>

        <div className="mt-10 rounded-2xl bg-card hairline p-8 sm:p-12 shadow-[var(--shadow-clinik-sm)]">
          {step === 0 && (
            <div>
              <StepHeading
                title="Create your workspace"
                description="Create a secure Rhea Health workspace for your practice."
              />
              <div className="mt-10 grid gap-7 sm:grid-cols-2">
                <Field label="First name *">
                  <input
                    className={inputCls}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </Field>
                <Field label="Last name *">
                  <input
                    className={inputCls}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Work email *">
                    <input
                      type="email"
                      className={inputCls}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Password *" hint="At least 8 characters.">
                  <input
                    type="password"
                    className={inputCls}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
                <Field label="Confirm password *">
                  <input
                    type="password"
                    className={inputCls}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </Field>
              </div>
              <div className="mt-10 pt-8 border-t border-border space-y-4">
                <CheckRow checked={terms} onChange={setTerms}>
                  I agree to the <span className="text-foreground">Terms of Service</span>.
                </CheckRow>
                <CheckRow checked={privacy} onChange={setPrivacy}>
                  I agree to the <span className="text-foreground">Privacy Policy</span>.
                </CheckRow>
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <StepHeading
                title="Tell us about your practice"
                description="This creates your organization. You can invite colleagues and add seats later."
              />
              <div className="mt-10 grid gap-7 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Practice name *">
                    <input
                      className={inputCls}
                      value={practiceName}
                      onChange={(e) => setPracticeName(e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Country *">
                  <select
                    className={inputCls}
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setState("");
                    }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="State / Province *">
                  <select
                    className={inputCls}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {stateOptions.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Role *">
                  <select
                    className={inputCls}
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Primary specialty *">
                  <select
                    className={inputCls}
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {SPECIALTIES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <StepHeading
                title="Professional verification"
                description="We verify every clinician before documentation features are enabled."
              />
              <div className="mt-10 grid gap-7 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Field label="Medical license number *">
                    <input
                      className={inputCls}
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                    />
                  </Field>
                </div>
                <Field label="Licensing country *">
                  <select
                    className={inputCls}
                    value={licenseCountry}
                    onChange={(e) => {
                      setLicenseCountry(e.target.value);
                      setLicenseState("");
                    }}
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Licensing state / province *">
                  <select
                    className={inputCls}
                    value={licenseState}
                    onChange={(e) => setLicenseState(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {licenseStateOptions.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label={
                      licenseCountry === "United States"
                        ? "National Provider Identifier (NPI)"
                        : "National provider number"
                    }
                    hint="Optional."
                  >
                    <input
                      className={inputCls}
                      value={npi}
                      onChange={(e) => setNpi(e.target.value)}
                    />
                  </Field>
                </div>
              </div>
              <div className="mt-10 pt-8 border-t border-border">
                <CheckRow checked={attest} onChange={setAttest}>
                  I confirm that I am a licensed healthcare professional.
                </CheckRow>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <StepHeading
                title="Choose your plan"
                description="Start with a 14-day free trial or subscribe now. You can change plans anytime from Practice settings."
              />

              <div className="mt-12 grid gap-8 lg:grid-cols-2 items-stretch">
                <PlanCard
                  name="Professional"
                  tagline="For individual clinicians and solo practices."
                  price="$199"
                  priceNote="/clinician /mo"
                  description="Ambient documentation, SOAP generation, review queue, and one clinician seat included."
                >
                  <button
                    onClick={() => finish("trialing", "Professional", "professional")}
                    className="w-full h-11 rounded-full hairline bg-card text-[15px] hover:bg-muted transition"
                  >
                    Start free trial
                  </button>
                  <button
                    onClick={() => finish("active", "Professional", "professional")}
                    className="w-full h-11 rounded-full hairline bg-card text-[15px] hover:bg-muted transition"
                  >
                    Subscribe now
                  </button>
                </PlanCard>

                <PlanCard
                  recommended
                  eyebrow="Recommended"
                  eyebrowTone="primary"
                  name="Teams"
                  tagline="For clinics, group practices, and urgent care centers."
                  priceLead="Starting at"
                  price="$179"
                  priceNote="per clinician/month"
                  description="Multi-clinician collaboration, centralized practice management, shared workflows, role-based access, and organization administration, with a minimum of five clinician seats included."
                >
                  <button
                    onClick={() => startTeam("trialing")}
                    className="w-full h-11 rounded-full bg-primary text-primary-foreground text-[15px] font-medium hover:opacity-90 transition"
                  >
                    Start team trial
                  </button>
                  <button
                    onClick={() => startTeam("active")}
                    className="w-full h-11 rounded-full hairline bg-card text-[15px] hover:bg-muted transition"
                  >
                    Subscribe now
                  </button>
                </PlanCard>
              </div>

              <div className="mt-8">
                <PlanCard
                  wide
                  eyebrow="For hospitals"
                  name="Enterprise"
                  tagline="For hospitals and health systems."
                  price="Custom pricing"
                  description="Large-scale deployments, advanced security, custom integrations, dedicated implementation, and organization-wide governance."
                >
                  <a
                    href="mailto:sales@rhea.health"
                    className="w-full h-11 rounded-full hairline bg-card text-[15px] hover:bg-muted transition inline-flex items-center justify-center"
                  >
                    Contact sales
                  </a>
                </PlanCard>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <StepHeading
                title="How many clinician seats would you like to purchase today?"
                description="Your Teams plan requires a minimum of five clinician seats. Purchase only the number of seats your practice needs today. Additional seats can be purchased at any time as your practice grows."
              />
              <div className="mt-10 rounded-xl hairline bg-card p-6">
                <div className="text-[14px] font-medium text-foreground">Clinician seats</div>
                <div className="mt-3 flex items-center gap-3">
                  <button
                    aria-label="Decrease seats"
                    onClick={() => setTeamSeats((s) => Math.max(TEAM_MIN_SEATS, s - 1))}
                    className="w-11 h-11 rounded-xl hairline bg-card text-[18px] hover:bg-muted transition"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={TEAM_MIN_SEATS}
                    value={teamSeats}
                    onChange={(e) => {
                      const n = parseInt(e.target.value, 10);
                      setTeamSeats(Number.isNaN(n) ? TEAM_MIN_SEATS : Math.max(TEAM_MIN_SEATS, n));
                      setError(null);
                    }}
                    className="w-24 h-11 rounded-xl hairline bg-card px-3.5 text-[15px] text-center outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition"
                  />
                  <button
                    aria-label="Increase seats"
                    onClick={() => setTeamSeats((s) => s + 1)}
                    className="w-11 h-11 rounded-xl hairline bg-card text-[18px] hover:bg-muted transition"
                  >
                    +
                  </button>
                </div>
                <div className="mt-6 grid gap-5 sm:grid-cols-3">
                  <div>
                    <div className="text-[13px] font-medium text-muted-foreground">
                      Clinician seats
                    </div>
                    <div className="mt-1.5 text-[18px] font-medium">{teamSeats}</div>
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-muted-foreground">Price</div>
                    <div className="mt-1.5 text-[18px] font-medium">
                      ${TEAM_SEAT_PRICE} per clinician/month
                    </div>
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-muted-foreground">
                      Monthly total
                    </div>
                    <div className="mt-1.5 text-[18px] font-medium">
                      ${(teamSeats * TEAM_SEAT_PRICE).toLocaleString()}/month
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <button
                  onClick={completeTeam}
                  className="h-12 px-8 rounded-full bg-primary text-primary-foreground text-[15px] font-medium hover:opacity-90 transition"
                >
                  {teamStatus === "trialing" ? "Start team trial" : "Subscribe now"}
                </button>
              </div>
            </div>
          )}

          {error && <div className="mt-8 text-[14px] text-destructive">{error}</div>}

          <div className="mt-12 pt-8 border-t border-border flex items-center justify-between gap-4">
            <button
              onClick={() => (step === 0 ? navigate({ to: "/signin" }) : setStep((s) => s - 1))}
              className="inline-flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            {step < 3 && (
              <button
                onClick={next}
                className="h-12 px-8 rounded-full bg-primary text-primary-foreground text-[15px] font-medium hover:opacity-90 transition"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
