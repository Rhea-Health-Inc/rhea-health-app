import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { useDialogDismiss } from "@/hooks/use-dialog-dismiss";
import { toast } from "sonner";
import { KeyRound, ShieldCheck, Search, Monitor, LogOut } from "lucide-react";
import { SettingsHeader, Section, Toggle } from "@/components/clinik/SettingsUI";

export const Route = createFileRoute("/app/settings/security")({
  component: SecuritySettings,
});

type Session = {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  ip: string;
  lastActive: string;
  current?: boolean;
};

const SESSIONS: Session[] = [
  {
    id: "s1",
    device: 'MacBook Pro 16"',
    browser: "Chrome 128",
    os: "macOS 15.2",
    location: "San Francisco, CA",
    ip: "73.162.44.18",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "s2",
    device: "iPhone 15 Pro",
    browser: "Safari Mobile",
    os: "iOS 18.3",
    location: "San Francisco, CA",
    ip: "73.162.44.19",
    lastActive: "12 minutes ago",
  },
  {
    id: "s3",
    device: "Clinic Workstation 4",
    browser: "Edge 127",
    os: "Windows 11",
    location: "Ridgemont Health, CA",
    ip: "10.42.8.91",
    lastActive: "Yesterday, 6:12 PM",
  },
  {
    id: "s4",
    device: "iPad Air",
    browser: "Safari 17",
    os: "iPadOS 18.1",
    location: "Oakland, CA",
    ip: "73.162.51.7",
    lastActive: "3 days ago",
  },
];

const LOGIN_ACTIVITY = Array.from({ length: 20 }, (_, i) => {
  const ok = i % 7 !== 3;
  return {
    id: `l${i}`,
    time: `${["Today", "Yesterday", "Mar 12", "Mar 11", "Mar 10"][i % 5]}, ${String(7 + (i % 12)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")} ${i % 2 ? "AM" : "PM"}`,
    method: ["Password + Authenticator", "Password + SMS", "SSO (Ridgemont Health)"][i % 3],
    location: ["San Francisco, CA", "Oakland, CA", "Ridgemont Health, CA", "Unknown"][i % 4],
    ip: `73.162.${40 + (i % 20)}.${10 + i}`,
    status: ok ? "Success" : "Failed",
  };
});

const AUDIT = [
  {
    id: "a1",
    type: "Account change",
    event: "Profile phone number updated",
    who: "Dr. Sarah Chen",
    when: "Today, 8:52 AM",
  },
  {
    id: "a2",
    type: "Security event",
    event: "New device signed in (iPad Air)",
    who: "System",
    when: "3 days ago",
  },
  {
    id: "a3",
    type: "Permission change",
    event: "Granted Documentation Reviewer role",
    who: "A. Whitfield (Admin)",
    when: "Mar 9, 2026",
  },
  {
    id: "a4",
    type: "Security event",
    event: "Recovery codes regenerated",
    who: "Dr. Sarah Chen",
    when: "Mar 2, 2026",
  },
  {
    id: "a5",
    type: "Account change",
    event: "Password changed",
    who: "Dr. Sarah Chen",
    when: "Feb 28, 2026",
  },
  {
    id: "a6",
    type: "Permission change",
    event: "Removed access to Cardiology panel",
    who: "A. Whitfield (Admin)",
    when: "Feb 14, 2026",
  },
  {
    id: "a7",
    type: "Security event",
    event: "Failed login attempt blocked",
    who: "System",
    when: "Feb 11, 2026",
  },
];

const AUDIT_TYPES = ["All", "Account change", "Security event", "Permission change"];

function SecuritySettings() {
  const [sessions, setSessions] = useState(SESSIONS);
  const [twoFA, setTwoFA] = useState({ app: true, sms: false });
  const [alerts, setAlerts] = useState({ newLogin: true, passwordChange: true, newDevice: true });
  const [pwOpen, setPwOpen] = useState(false);
  const [codesOpen, setCodesOpen] = useState(false);
  const [activityQuery, setActivityQuery] = useState("");
  const [activityStatus, setActivityStatus] = useState("All");
  const [auditQuery, setAuditQuery] = useState("");
  const [auditType, setAuditType] = useState("All");

  const setAlert = (k: keyof typeof alerts, v: boolean) => {
    setAlerts((a) => ({ ...a, [k]: v }));
    toast.success("Notification preference saved");
  };

  const activity = useMemo(
    () =>
      LOGIN_ACTIVITY.filter(
        (l) =>
          (activityStatus === "All" || l.status === activityStatus) &&
          `${l.time} ${l.method} ${l.location} ${l.ip}`
            .toLowerCase()
            .includes(activityQuery.toLowerCase()),
      ),
    [activityQuery, activityStatus],
  );

  const audit = useMemo(
    () =>
      AUDIT.filter(
        (a) =>
          (auditType === "All" || a.type === auditType) &&
          `${a.event} ${a.who} ${a.when}`.toLowerCase().includes(auditQuery.toLowerCase()),
      ),
    [auditQuery, auditType],
  );

  return (
    <div className="max-w-5xl mx-auto px-12 py-14">
      <SettingsHeader
        title="Security"
        description="Manage credentials, verification methods, active sessions, and account audit history."
      />

      <Section
        title="Password"
        description="Last changed February 28, 2026."
        actions={
          <button
            onClick={() => setPwOpen(true)}
            className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition inline-flex items-center gap-2 shrink-0"
          >
            <KeyRound className="w-3.5 h-3.5" /> Change password
          </button>
        }
      >
        <div className="text-[14px] text-muted-foreground">
          Use at least 12 characters with a mix of letters, numbers, and symbols. You will be signed
          out of other devices after a password change.
        </div>
      </Section>

      <Section
        title="Two-factor authentication"
        description="Add a second verification step when signing in."
      >
        <div className="divide-y divide-border">
          <Toggle
            label="Authenticator app"
            description="Time-based codes from Google Authenticator, Authy, or 1Password."
            checked={twoFA.app}
            onChange={(v) => {
              setTwoFA((t) => ({ ...t, app: v }));
              toast.success(v ? "Authenticator app enabled" : "Authenticator app disabled");
            }}
          />
          <Toggle
            label="SMS"
            description="Codes sent to (415) 555-0199."
            checked={twoFA.sms}
            onChange={(v) => {
              setTwoFA((t) => ({ ...t, sms: v }));
              toast.success(v ? "SMS verification enabled" : "SMS verification disabled");
            }}
          />
          <div className="flex items-start justify-between gap-4 py-2.5">
            <div>
              <div className="text-[14px]">Recovery codes</div>
              <div className="text-[14px] text-muted-foreground mt-0.5">
                8 single-use codes, 6 remaining.
              </div>
            </div>
            <button
              onClick={() => setCodesOpen(true)}
              className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition shrink-0"
            >
              View codes
            </button>
          </div>
        </div>
      </Section>

      <Section
        title="Login sessions"
        description="Devices currently signed in to your Rhea account."
        actions={
          <button
            onClick={() => {
              setSessions((s) => s.filter((x) => x.current));
              toast.success("Signed out of all other devices");
            }}
            className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition shrink-0"
          >
            Sign out other devices
          </button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[12px] uppercase tracking-wider text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Device</th>
                <th className="py-2 pr-4 font-medium">Browser / OS</th>
                <th className="py-2 pr-4 font-medium">Location</th>
                <th className="py-2 pr-4 font-medium">IP address</th>
                <th className="py-2 pr-4 font-medium">Last active</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessions.map((s) => (
                <tr key={s.id} className="text-[14px]">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4 text-muted-foreground" />
                      <span className="text-[14px]">{s.device}</span>
                      {s.current && (
                        <span className="text-[14px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          Current
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {s.browser} · {s.os}
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.location}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.ip}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{s.lastActive}</td>
                  <td className="py-3">
                    <button
                      onClick={() => {
                        setSessions((list) => list.filter((x) => x.id !== s.id));
                        toast.success(`Signed out ${s.device}`);
                      }}
                      className="text-[14px] text-muted-foreground hover:text-destructive inline-flex items-center gap-1"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Recent login activity"
        description="The last 20 sign-in attempts on your account."
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={activityQuery}
              onChange={(e) => setActivityQuery(e.target.value)}
              placeholder="Search by location, IP, or method"
              className="w-full h-9 pl-9 pr-3 rounded-xl hairline bg-card text-[14px] outline-none focus:border-primary"
            />
          </div>
          {["All", "Success", "Failed"].map((s) => (
            <button
              key={s}
              onClick={() => setActivityStatus(s)}
              className={`h-10 px-4 rounded-full text-[14px] transition hairline ${
                activityStatus === s
                  ? "border-primary bg-primary/5 text-primary"
                  : "bg-card hover:bg-muted"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="divide-y divide-border max-h-[360px] overflow-y-auto">
          {activity.map((l) => (
            <div key={l.id} className="flex items-center gap-4 py-2.5 text-[14px]">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${l.status === "Success" ? "bg-[var(--color-success)]" : "bg-destructive"}`}
              />
              <span className="text-[14px] w-40 shrink-0">{l.time}</span>
              <span className="text-muted-foreground flex-1 min-w-0 truncate">{l.method}</span>
              <span className="text-muted-foreground w-44 shrink-0 truncate">{l.location}</span>
              <span className="text-muted-foreground w-32 shrink-0">{l.ip}</span>
              <span
                className={l.status === "Success" ? "text-muted-foreground" : "text-destructive"}
              >
                {l.status}
              </span>
            </div>
          ))}
          {activity.length === 0 && (
            <div className="py-6 text-[14px] text-muted-foreground">No matching activity.</div>
          )}
        </div>
      </Section>

      <Section
        title="Security alerts"
        description="Notification preferences are saved automatically."
      >
        <div className="divide-y divide-border">
          <Toggle
            label="Notify on new login"
            checked={alerts.newLogin}
            onChange={(v) => setAlert("newLogin", v)}
          />
          <Toggle
            label="Notify on password changes"
            checked={alerts.passwordChange}
            onChange={(v) => setAlert("passwordChange", v)}
          />
          <Toggle
            label="Notify on new device"
            checked={alerts.newDevice}
            onChange={(v) => setAlert("newDevice", v)}
          />
        </div>
      </Section>

      <Section
        title="Audit access"
        description="Account changes, security events, and permission changes."
      >
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={auditQuery}
              onChange={(e) => setAuditQuery(e.target.value)}
              placeholder="Search audit events"
              className="w-full h-9 pl-9 pr-3 rounded-xl hairline bg-card text-[14px] outline-none focus:border-primary"
            />
          </div>
          {AUDIT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setAuditType(t)}
              className={`h-10 px-4 rounded-full text-[14px] transition hairline ${
                auditType === t
                  ? "border-primary bg-primary/5 text-primary"
                  : "bg-card hover:bg-muted"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="divide-y divide-border">
          {audit.map((a) => (
            <div key={a.id} className="flex items-start justify-between gap-4 py-2.5">
              <div className="min-w-0">
                <div className="text-[14px]">{a.event}</div>
                <div className="text-[14px] text-muted-foreground mt-0.5">
                  {a.type} · {a.who}
                </div>
              </div>
              <span className="text-[14px] text-muted-foreground shrink-0">{a.when}</span>
            </div>
          ))}
          {audit.length === 0 && (
            <div className="py-6 text-[14px] text-muted-foreground">No matching events.</div>
          )}
        </div>
      </Section>

      {pwOpen && <ChangePassword onClose={() => setPwOpen(false)} />}
      {codesOpen && <RecoveryCodes onClose={() => setCodesOpen(false)} />}
    </div>
  );
}

function ChangePassword({ onClose }: { onClose: () => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const valid = current.length > 0 && next.length >= 12 && next === confirm;

  return (
    <Modal
      onClose={onClose}
      title="Change password"
      icon={<KeyRound className="w-4 h-4 text-primary" />}
    >
      <div className="space-y-3">
        {[
          ["Current password", current, setCurrent],
          ["New password", next, setNext],
          ["Confirm new password", confirm, setConfirm],
        ].map(([label, val, set]) => (
          <label key={label as string} className="block">
            <span className="block text-[14px] text-muted-foreground mb-1.5">
              {label as string}
            </span>
            <input
              type="password"
              value={val as string}
              onChange={(e) => (set as (v: string) => void)(e.target.value)}
              className="w-full h-11 rounded-xl hairline bg-card px-3.5 text-[14px] outline-none focus:border-primary"
            />
          </label>
        ))}
        <div className="text-[14px] text-muted-foreground">
          Minimum 12 characters. {next && next.length < 12 && "Password is too short."}
          {next && confirm && next !== confirm && " Passwords do not match."}
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
        >
          Cancel
        </button>
        <button
          disabled={!valid}
          onClick={() => {
            toast.success("Password updated");
            onClose();
          }}
          className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition disabled:opacity-50"
        >
          Update password
        </button>
      </div>
    </Modal>
  );
}

function RecoveryCodes({ onClose }: { onClose: () => void }) {
  const codes = [
    "4F2A-91BD",
    "7C10-3EE8",
    "B923-77AC",
    "51DF-0C6B",
    "9AE4-12F0",
    "2D77-8B41",
    "6E05-CC39",
    "A18C-4F92",
  ];
  return (
    <Modal
      onClose={onClose}
      title="Recovery codes"
      icon={<ShieldCheck className="w-4 h-4 text-primary" />}
    >
      <p className="text-[14px] text-muted-foreground mb-3">
        Store these somewhere safe. Each code can be used once if you lose access to your other
        methods.
      </p>
      <div className="grid grid-cols-2 gap-2 font-mono text-[14px]">
        {codes.map((c, i) => (
          <div
            key={c}
            className={`rounded-lg bg-muted px-3 py-2 ${i >= 6 ? "line-through opacity-50" : ""}`}
          >
            {c}
          </div>
        ))}
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button
          onClick={() => toast.success("New recovery codes generated")}
          className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
        >
          Regenerate
        </button>
        <button
          onClick={onClose}
          className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
        >
          Done
        </button>
      </div>
    </Modal>
  );
}

function Modal({
  title,
  icon,
  children,
  onClose,
}: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  onClose: () => void;
}) {
  const { backdropProps, panelProps } = useDialogDismiss(onClose);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-foreground/20 backdrop-blur-sm"
      {...backdropProps}
    >
      <div
        {...panelProps}
        aria-label={title}
        className="w-full max-w-md rounded-2xl bg-card hairline p-8 shadow-[var(--shadow-clinik-lg)] outline-none"
      >
        <h3 className="text-[16px] font-medium inline-flex items-center gap-2 mb-4">
          {icon} {title}
        </h3>
        {children}
      </div>
    </div>
  );
}
