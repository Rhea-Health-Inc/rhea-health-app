import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, KeyRound, MailCheck } from "lucide-react";
import { Logo } from "@/components/clinik/Logo";

export const Route = createFileRoute("/reset")({
  head: () => ({
    meta: [
      { title: "Reset password - Rhea" },
      { name: "description", content: "Reset your Rhea clinician workspace password." },
      { property: "og:title", content: "Reset password - Rhea" },
      { property: "og:description", content: "Reset your Rhea clinician workspace password." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

type Step = "request" | "verify" | "done";

function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(["", "", "", "", "", ""]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  const requestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("verify");
    }, 600);
  };

  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 5) codeRefs.current[i + 1]?.focus();
  };

  const onCodeKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0) codeRefs.current[i - 1]?.focus();
  };

  const submitReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.some((d) => !d)) {
      setError("Enter the full 6-digit verification code.");
      return;
    }
    if (password.length < 8) {
      setError("Your new password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match. Try again.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("done");
    }, 600);
  };

  const inputCls =
    "mt-1.5 w-full h-11 rounded-xl hairline bg-card px-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition";

  return (
    <div className="rhea-app min-h-screen bg-background text-foreground flex flex-col px-8 sm:px-14 py-8">
      <Link to="/" className="flex items-center w-fit" aria-label="Rhea home">
        <Logo height={36} />
      </Link>

      <div className="flex-1 flex items-center">
        <div className="w-full max-w-sm mx-auto">
          {step === "request" && (
            <>
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <KeyRound aria-hidden className="w-5 h-5" />
              </div>
              <h1 className="h-display text-[30px] text-foreground mt-5">Reset your password</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Enter your work email and we'll send you a 6-digit verification code.
              </p>
              <form onSubmit={requestCode} className="mt-8 space-y-4">
                <label className="block">
                  <span className="text-[13px] font-medium text-foreground/80">Work email</span>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@clinic.org"
                    className={inputCls}
                  />
                </label>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading ? "Sending code…" : "Send verification code"}
                </button>
              </form>
            </>
          )}

          {step === "verify" && (
            <>
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <MailCheck aria-hidden className="w-5 h-5" />
              </div>
              <h1 className="h-display text-[30px] text-foreground mt-5">Check your inbox</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                We sent a 6-digit code to{" "}
                <span className="text-foreground font-medium">{email}</span>. Enter it below with
                your new password.
              </p>
              <form onSubmit={submitReset} className="mt-8 space-y-5">
                <div>
                  <span className="text-[13px] font-medium text-foreground/80">
                    Verification code
                  </span>
                  <div
                    className="mt-2 flex gap-2"
                    role="group"
                    aria-label="6-digit verification code"
                  >
                    {code.map((d, i) => (
                      <input
                        key={i}
                        ref={(el) => {
                          codeRefs.current[i] = el;
                        }}
                        inputMode="numeric"
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        aria-label={`Digit ${i + 1}`}
                        value={d}
                        onChange={(e) => setDigit(i, e.target.value)}
                        onKeyDown={(e) => onCodeKeyDown(i, e)}
                        className="w-11 h-12 rounded-xl hairline bg-card text-center text-[17px] font-medium outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition"
                      />
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="text-[13px] font-medium text-foreground/80">New password</span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={inputCls}
                  />
                </label>
                <label className="block">
                  <span className="text-[13px] font-medium text-foreground/80">
                    Confirm new password
                  </span>
                  <input
                    type="password"
                    required
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    className={inputCls}
                  />
                </label>
                {error && (
                  <p role="alert" className="text-[13px] text-destructive">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
                >
                  {loading ? "Resetting…" : "Reset password"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    setError(null);
                  }}
                  className="w-full text-[13px] text-muted-foreground hover:text-foreground transition"
                >
                  Use a different email
                </button>
              </form>
            </>
          )}

          {step === "done" && (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-success/10 text-success flex items-center justify-center">
                <CheckCircle2 aria-hidden className="w-6 h-6" />
              </div>
              <h1 className="h-display text-[30px] text-foreground mt-5">Password updated</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Your password has been reset. You can sign in with your new password now.
              </p>
              <button
                onClick={() => navigate({ to: "/signin" })}
                className="mt-8 w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition"
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>

      <Link
        to="/signin"
        className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground hover:text-foreground transition w-fit"
      >
        <ArrowLeft aria-hidden className="w-3.5 h-3.5" /> Back to sign in
      </Link>
    </div>
  );
}
