import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "@/components/clinik/Logo";
import { signIn } from "@/lib/auth";
import heroImg from "@/assets/signin-hero.jpg";

export const Route = createFileRoute("/signin")({
  head: () => ({
    meta: [
      { title: "Sign in - Rhea" },
      { name: "description", content: "Sign in to your Rhea clinician workspace." },
      { property: "og:title", content: "Sign in - Rhea" },
      { property: "og:description", content: "Access your Rhea clinician workspace." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("sarah.chen@ridgemont.health");
  const [password, setPassword] = useState("••••••••");
  const [loading, setLoading] = useState(false);
  const [remember, setRemember] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      signIn(email);
      navigate({ to: "/app" });
    }, 500);
  };

  return (
    <div className="rhea-app min-h-screen grid lg:grid-cols-2 bg-background text-foreground">
      {/* Left: form */}
      <div className="flex flex-col px-8 sm:px-14 py-8">
        <Link to="/" className="flex items-center w-fit" aria-label="Rhea home">
          <Logo height={36} />
        </Link>

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="h-display text-[34px] text-foreground">Welcome back</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to your clinician workspace.
            </p>

            <form onSubmit={submit} className="mt-8 space-y-4">
              <label className="block">
                <span className="text-[13px] font-medium text-foreground/80">Work email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 w-full h-11 rounded-xl hairline bg-card px-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition"
                />
              </label>
              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-medium text-foreground/80">Password</span>
                  <Link
                    to="/reset"
                    className="text-[13px] text-muted-foreground hover:text-foreground"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1.5 w-full h-11 rounded-xl hairline bg-card px-3.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition"
                />
              </label>

              <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-input accent-[var(--primary)]"
                />
                <span className="text-[13px] text-muted-foreground">
                  Remember me on this device
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition disabled:opacity-60"
              >
                {loading ? "Signing you in…" : "Sign in"}
              </button>

              <div className="flex items-center gap-3 py-2">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[13px] uppercase tracking-wider text-muted-foreground">
                  or
                </span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <Link
                to="/signup"
                className="w-full h-11 rounded-full hairline bg-card text-sm text-foreground hover:bg-muted transition inline-flex items-center justify-center gap-2"
              >
                Create your workspace
              </Link>

              <p className="text-[13px] text-center text-muted-foreground pt-4">
                By continuing you agree to Rhea's Terms and BAA.
              </p>
            </form>
          </div>
        </div>

        <div className="text-[13px] text-muted-foreground">
          Need an account?{" "}
          <Link to="/signup" className="text-foreground hover:underline">
            Create your workspace
          </Link>
        </div>
      </div>

      {/* Right: image */}
      <div className="relative hidden lg:block overflow-hidden">
        <img
          src={heroImg}
          alt="Modern hospital corridor with soft natural light"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/25 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent" />
        <div className="relative h-full flex items-end p-10">
          <div className="max-w-md rounded-3xl bg-background/80 backdrop-blur-md hairline p-6 shadow-[var(--shadow-clinik-lg)]">
            <div className="text-[13px] uppercase tracking-wider text-primary">
              - Clinicians using Rhea
            </div>
            <p className="mt-2 text-[15px] leading-relaxed text-foreground">
              "I finish my notes before I leave the room. Rhea gave me back my evenings."
            </p>
            <div className="mt-3 text-[13px] text-muted-foreground">
              Dr. Elena Moreau · Cardiology, St. Lucia Medical
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
