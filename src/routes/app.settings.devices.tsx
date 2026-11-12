import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  Bluetooth,
  Check,
  Loader2,
  Mic,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Usb,
  X,
} from "lucide-react";
import { SettingsHeader, Section } from "@/components/clinik/SettingsUI";
import { ConfirmDialog, type ConfirmRequest } from "@/components/clinik/ConfirmDialog";
import { DeviceVisual } from "@/components/clinik/DeviceVisual";
import { useDialogDismiss } from "@/hooks/use-dialog-dismiss";
import { useDevices } from "@/hooks/use-devices";
import {
  addDevice,
  identifyDevice,
  maskSerial,
  relativeTime,
  removeDevice,
  updateDevice,
  SERIAL_PATTERN,
  type ConnectionMethod,
  type DeviceStatus,
  type IdentifiedDevice,
  type RecordingDevice,
} from "@/lib/devices";

export const Route = createFileRoute("/app/settings/devices")({
  component: Devices,
});

const inputCls =
  "mt-2 w-full h-11 rounded-xl hairline bg-card px-3.5 text-[14px] outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/60 transition";

function Devices() {
  const devices = useDevices();
  const [adding, setAdding] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmRequest | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2600);
  };

  const register = (device: RecordingDevice) => {
    addDevice(device);
    setAdding(false);
    flash(`${device.name} registered — pairing now`);
    // Simulated pairing handshake: the device settles to Connected shortly
    // after registration, with fresh connection/sync timestamps.
    timers.current.push(
      window.setTimeout(() => {
        const now = new Date().toISOString();
        updateDevice(device.id, { status: "connected", lastConnectedAt: now, lastSyncAt: now });
        flash(`${device.name} is connected`);
      }, 2800),
    );
  };

  const toggleConnection = (d: RecordingDevice) => {
    if (d.status === "connected") {
      updateDevice(d.id, { status: "disconnected" });
      flash(`${d.name} disconnected`);
    } else if (d.status === "disconnected") {
      updateDevice(d.id, { status: "pairing" });
      flash(`Connecting to ${d.name}…`);
      timers.current.push(
        window.setTimeout(() => {
          const now = new Date().toISOString();
          updateDevice(d.id, { status: "connected", lastConnectedAt: now, lastSyncAt: now });
        }, 1600),
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-12 py-14">
      <SettingsHeader
        title="Devices"
        description="Connect Rhea-approved recording devices to your account and use them during patient consultations. Rhea captures the conversation on the device and turns it into your clinical documentation."
        actions={
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition inline-flex items-center gap-1.5 shrink-0"
          >
            <Plus aria-hidden className="w-4 h-4" /> Add device
          </button>
        }
      />

      <Section
        title="Your devices"
        description="Every recording device registered to your account, in one place. You can register more than one device."
      >
        {devices.length === 0 ? (
          <div className="text-center py-8">
            <div className="flex justify-center">
              <DeviceVisual modelId="unknown" className="w-28 h-28 opacity-80" />
            </div>
            <h3 className="text-[16px] font-medium mt-4">No devices registered yet</h3>
            <p className="text-[14px] text-muted-foreground mt-1.5 max-w-md mx-auto leading-relaxed">
              Add your first Rhea recording device to start capturing consultations hands-free.
            </p>
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="mt-5 h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition inline-flex items-center gap-1.5"
            >
              <Plus aria-hidden className="w-4 h-4" /> Add device
            </button>
          </div>
        ) : (
          <div>
            {devices.map((d, i) => (
              <DeviceRow
                key={d.id}
                device={d}
                first={i === 0}
                onToggle={() => toggleConnection(d)}
                onRemove={() =>
                  setConfirm({
                    title: `Remove ${d.name}?`,
                    body: "The device will be unregistered from your account. You can register it again at any time with its serial number.",
                    danger: true,
                    action: () => {
                      removeDevice(d.id);
                      flash(`${d.name} removed`);
                    },
                  })
                }
              />
            ))}
          </div>
        )}
      </Section>

      <Section title="How recording devices work">
        <ol className="grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Bluetooth,
              title: "1. Pair the device",
              body: "Register a Rhea-approved device with its serial number or over Bluetooth. Rhea verifies it is genuine before it is added to your account.",
            },
            {
              icon: Mic,
              title: "2. Record the consultation",
              body: "Start the device in the room and focus on your patient. It captures the conversation securely during the encounter.",
            },
            {
              icon: RefreshCw,
              title: "3. Sync to Rhea",
              body: "When the device reconnects, the recording syncs to Rhea and is drafted into a structured note for your review.",
            },
          ].map((s) => (
            <li key={s.title}>
              <span className="w-10 h-10 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center">
                <s.icon aria-hidden className="w-5 h-5" />
              </span>
              <h3 className="text-[15px] font-medium mt-3">{s.title}</h3>
              <p className="text-[14px] text-muted-foreground mt-1 leading-relaxed">{s.body}</p>
            </li>
          ))}
        </ol>
      </Section>

      {adding && (
        <AddDeviceDialog
          existingSerials={devices.map((d) => d.serial)}
          onClose={() => setAdding(false)}
          onRegister={register}
        />
      )}
      {confirm && <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />}
      {toast && (
        <div className="fixed bottom-6 right-6 z-40 rounded-xl bg-foreground text-background px-4 py-3 text-[14px] shadow-[var(--shadow-clinik-lg)]">
          {toast}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: DeviceStatus }) {
  if (status === "connected")
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full bg-[color-mix(in_oklab,var(--color-success)_14%,transparent)] text-success">
        <span className="w-1.5 h-1.5 rounded-full bg-success" /> Connected
      </span>
    );
  if (status === "pairing")
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full bg-[color-mix(in_oklab,var(--color-warning,oklch(0.7_0.14_75))_16%,transparent)] text-[oklch(0.55_0.12_75)] dark:text-[oklch(0.8_0.12_75)]">
        <span className="w-1.5 h-1.5 rounded-full bg-[oklch(0.7_0.14_75)] animate-pulse" /> Pairing
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
      <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" /> Disconnected
    </span>
  );
}

function BatteryIndicator({ level }: { level: number | null }) {
  if (level === null) return <span className="text-muted-foreground">Not reported</span>;
  const Icon = level <= 25 ? BatteryLow : level >= 75 ? BatteryFull : BatteryMedium;
  return (
    <span
      className={`inline-flex items-center gap-2 ${level <= 25 ? "text-[oklch(0.6_0.13_60)]" : ""}`}
    >
      <Icon aria-hidden className="w-5 h-5" />
      <span className="inline-block w-14 h-1.5 rounded-full bg-muted overflow-hidden">
        <span
          className={`block h-full rounded-full ${level <= 25 ? "bg-[oklch(0.7_0.14_75)]" : "bg-success"}`}
          style={{ width: `${level}%` }}
        />
      </span>
      {level}%
    </span>
  );
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[12px] uppercase tracking-[0.06em] text-muted-foreground">{label}</div>
      <div className="text-[14px] mt-1">{children}</div>
    </div>
  );
}

function DeviceRow({
  device,
  first,
  onToggle,
  onRemove,
}: {
  device: RecordingDevice;
  first: boolean;
  onToggle: () => void;
  onRemove: () => void;
}) {
  const [renaming, setRenaming] = useState(false);
  const [name, setName] = useState(device.name);

  const saveName = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== device.name) updateDevice(device.id, { name: trimmed });
    setRenaming(false);
  };

  return (
    <article className={`py-7 ${first ? "pt-0" : "border-t border-border/70"}`}>
      <div className="flex gap-6 flex-wrap sm:flex-nowrap">
        <div className="shrink-0 w-[104px] h-[104px] rounded-2xl bg-muted/50 flex items-center justify-center">
          <DeviceVisual
            modelId={device.modelId}
            status={device.status}
            className="w-[92px] h-[92px]"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              {renaming ? (
                <span className="flex items-center gap-2">
                  <input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveName();
                      if (e.key === "Escape") setRenaming(false);
                    }}
                    className="h-9 rounded-lg hairline bg-card px-3 text-[15px] outline-none focus:ring-2 focus:ring-primary/30"
                    aria-label="Device name"
                  />
                  <button
                    type="button"
                    onClick={saveName}
                    className="w-8 h-8 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center hover:opacity-90"
                    aria-label="Save name"
                  >
                    <Check aria-hidden className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRenaming(false)}
                    className="w-8 h-8 rounded-full hairline bg-card inline-flex items-center justify-center hover:bg-muted"
                    aria-label="Cancel rename"
                  >
                    <X aria-hidden className="w-4 h-4" />
                  </button>
                </span>
              ) : (
                <h3 className="text-[17px] font-medium flex items-center gap-2">
                  {device.name}
                  <button
                    type="button"
                    onClick={() => {
                      setName(device.name);
                      setRenaming(true);
                    }}
                    className="w-7 h-7 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center transition"
                    aria-label={`Rename ${device.name}`}
                  >
                    <Pencil aria-hidden className="w-3.5 h-3.5" />
                  </button>
                </h3>
              )}
              <p className="text-[14px] text-muted-foreground mt-0.5">
                {device.model} · {maskSerial(device.serial)} ·{" "}
                {device.method === "bluetooth" ? "Bluetooth" : "USB-C"}
              </p>
            </div>
            <StatusPill status={device.status} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
            <MetaItem label="Battery">
              <BatteryIndicator level={device.battery} />
            </MetaItem>
            <MetaItem label="Firmware">{device.firmware ?? "Not reported"}</MetaItem>
            <MetaItem label="Last connected">{relativeTime(device.lastConnectedAt)}</MetaItem>
            <MetaItem label="Last synced">{relativeTime(device.lastSyncAt)}</MetaItem>
          </div>

          <div className="flex items-center gap-2 mt-5">
            <button
              type="button"
              onClick={onToggle}
              disabled={device.status === "pairing"}
              className="h-9 px-4 rounded-full hairline bg-card text-[13px] font-medium hover:bg-muted transition disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              {device.status === "connected" ? (
                "Disconnect"
              ) : device.status === "pairing" ? (
                <>
                  <Loader2 aria-hidden className="w-3.5 h-3.5 animate-spin" /> Pairing…
                </>
              ) : (
                "Connect"
              )}
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="h-9 px-4 rounded-full text-[13px] font-medium text-destructive hover:bg-[color-mix(in_oklab,var(--color-destructive)_8%,transparent)] transition inline-flex items-center gap-1.5"
            >
              <Trash2 aria-hidden className="w-3.5 h-3.5" /> Remove device
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ */
/* Add device: method → discover / details → verify → confirm → name  */
/* ------------------------------------------------------------------ */

type WizardStep = "method" | "bluetooth" | "manual" | "verify" | "confirm" | "name";
type Found = { serial: string; identified: IdentifiedDevice };

const NEARBY_SERIAL = "RH-7302-7331";

function AddDeviceDialog({
  existingSerials,
  onClose,
  onRegister,
}: {
  existingSerials: string[];
  onClose: () => void;
  onRegister: (d: RecordingDevice) => void;
}) {
  const { backdropProps, panelProps } = useDialogDismiss(onClose);
  const [step, setStep] = useState<WizardStep>("method");
  const [path, setPath] = useState<"bluetooth" | "manual">("bluetooth");
  const [scanning, setScanning] = useState(false);
  const [foundSelected, setFoundSelected] = useState(false);
  const [serial, setSerial] = useState("");
  const [code, setCode] = useState("");
  const [method, setMethod] = useState<ConnectionMethod>("bluetooth");
  const [error, setError] = useState<string | null>(null);
  const [found, setFound] = useState<Found | null>(null);
  const [name, setName] = useState("");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  useEffect(() => {
    if (step !== "bluetooth") return;
    setScanning(true);
    setFoundSelected(false);
    const t = window.setTimeout(() => setScanning(false), 1900);
    timers.current.push(t);
  }, [step]);

  const startVerify = (serialValue: string, via: "bluetooth" | "manual") => {
    setError(null);
    setStep("verify");
    timers.current.push(
      window.setTimeout(() => {
        const identified = identifyDevice(serialValue);
        if (!identified) {
          setError(
            "Rhea could not verify this device. Check the serial number and try again — only genuine Rhea-approved devices can be registered.",
          );
          setStep(via === "bluetooth" ? "bluetooth" : "manual");
          return;
        }
        setFound({ serial: serialValue.toUpperCase(), identified });
        setName(identified.model);
        setStep("confirm");
      }, 1600),
    );
  };

  const submitManual = () => {
    const s = serial.trim().toUpperCase();
    if (!SERIAL_PATTERN.test(s)) {
      setError("Enter the serial in the format printed on the device: RH-0000-0000.");
      return;
    }
    if (existingSerials.includes(s)) {
      setError("This device is already registered to your account.");
      return;
    }
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6-digit pairing code shown on the device or its packaging.");
      return;
    }
    setSerial(s);
    startVerify(s, "manual");
  };

  const finish = () => {
    if (!found) return;
    onRegister({
      id: `dev-${Date.now()}`,
      name: name.trim() || found.identified.model,
      model: found.identified.model,
      modelId: found.identified.modelId,
      serial: found.serial,
      method: path === "bluetooth" ? "bluetooth" : method,
      status: "pairing",
      battery: 100,
      firmware: found.identified.firmware,
      lastConnectedAt: null,
      lastSyncAt: null,
      registeredAt: new Date().toISOString(),
    });
  };

  const titles: Record<WizardStep, string> = {
    method: "Add a device",
    bluetooth: "Find your device",
    manual: "Enter device details",
    verify: "Verifying device",
    confirm: "Confirm your device",
    name: "Name your device",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-foreground/20 backdrop-blur-sm"
      {...backdropProps}
    >
      <div
        {...panelProps}
        aria-labelledby="add-device-title"
        className="w-full max-w-lg rounded-2xl bg-card hairline p-8 shadow-[var(--shadow-clinik-lg)] outline-none max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id="add-device-title" className="text-[18px] font-semibold">
            {titles[step]}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted inline-flex items-center justify-center transition shrink-0"
            aria-label="Close"
          >
            <X aria-hidden className="w-4 h-4" />
          </button>
        </div>

        {step === "method" && (
          <div className="mt-5">
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              How would you like to connect your Rhea recording device?
            </p>
            <div className="grid gap-3 mt-5">
              <button
                type="button"
                onClick={() => {
                  setPath("bluetooth");
                  setStep("bluetooth");
                }}
                className="text-left rounded-2xl hairline bg-card p-5 hover:shadow-[var(--shadow-clinik)] transition flex gap-4"
              >
                <span className="w-11 h-11 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                  <Bluetooth aria-hidden className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-medium">Bluetooth discovery</span>
                  <span className="block text-[14px] text-muted-foreground mt-0.5 leading-relaxed">
                    Turn the device on and Rhea will find it nearby and pair automatically.
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPath("manual");
                  setStep("manual");
                }}
                className="text-left rounded-2xl hairline bg-card p-5 hover:shadow-[var(--shadow-clinik)] transition flex gap-4"
              >
                <span className="w-11 h-11 rounded-full bg-primary/10 text-primary inline-flex items-center justify-center shrink-0">
                  <ShieldCheck aria-hidden className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-[15px] font-medium">Serial number</span>
                  <span className="block text-[14px] text-muted-foreground mt-0.5 leading-relaxed">
                    Enter the serial number and pairing code printed on the device.
                  </span>
                </span>
              </button>
            </div>
          </div>
        )}

        {step === "bluetooth" && (
          <div className="mt-5">
            {scanning ? (
              <div className="text-center py-8">
                <span className="relative inline-flex w-16 h-16">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-primary/20 animate-ping" />
                  <span className="relative inline-flex w-16 h-16 rounded-full bg-primary/10 text-primary items-center justify-center">
                    <Bluetooth aria-hidden className="w-7 h-7" />
                  </span>
                </span>
                <p className="text-[15px] font-medium mt-5">Searching for nearby devices…</p>
                <p className="text-[14px] text-muted-foreground mt-1">
                  Make sure your device is switched on and in pairing mode.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-[14px] text-muted-foreground">
                  Found nearby. Select your device to continue.
                </p>
                <button
                  type="button"
                  onClick={() => setFoundSelected(true)}
                  className={`mt-4 w-full text-left rounded-2xl hairline p-4 flex items-center gap-4 transition ${
                    foundSelected
                      ? "border-primary/60 ring-2 ring-primary/25 bg-primary/[0.04]"
                      : "bg-card hover:bg-muted/50"
                  }`}
                >
                  <DeviceVisual modelId="rhea-recorder" className="w-14 h-14 shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-medium">Rhea Recorder</span>
                    <span className="block text-[13px] text-muted-foreground">
                      {maskSerial(NEARBY_SERIAL)} · Strong signal
                    </span>
                  </span>
                  {foundSelected && (
                    <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center shrink-0">
                      <Check aria-hidden className="w-3.5 h-3.5" />
                    </span>
                  )}
                </button>
                {error && <p className="text-[13px] text-destructive mt-3">{error}</p>}
                <div className="flex justify-between gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setStep("method")}
                    className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={!foundSelected}
                    onClick={() => startVerify(NEARBY_SERIAL, "bluetooth")}
                    className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition disabled:opacity-50"
                  >
                    Pair this device
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === "manual" && (
          <div className="mt-5">
            <label className="block">
              <span className="text-[14px] font-medium">Serial number</span>
              <input
                autoFocus
                value={serial}
                onChange={(e) => setSerial(e.target.value.toUpperCase())}
                placeholder="RH-0000-0000"
                className={inputCls}
                autoComplete="off"
              />
              <span className="mt-1.5 block text-[13px] text-muted-foreground">
                Printed on the back of the device.
              </span>
            </label>
            <label className="block mt-5">
              <span className="text-[14px] font-medium">Pairing code</span>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit code"
                inputMode="numeric"
                className={inputCls}
                autoComplete="off"
              />
              <span className="mt-1.5 block text-[13px] text-muted-foreground">
                Shown on the device display or on the card in its box.
              </span>
            </label>
            <div className="mt-5">
              <span className="text-[14px] font-medium">How will this device connect?</span>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {(
                  [
                    { id: "bluetooth", label: "Bluetooth", icon: Bluetooth },
                    { id: "usb", label: "USB-C", icon: Usb },
                  ] as const
                ).map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={`h-11 rounded-xl hairline text-[14px] font-medium inline-flex items-center justify-center gap-2 transition ${
                      method === m.id
                        ? "border-primary/60 ring-2 ring-primary/25 bg-primary/[0.04]"
                        : "bg-card hover:bg-muted"
                    }`}
                  >
                    <m.icon aria-hidden className="w-4 h-4" /> {m.label}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-[13px] text-destructive mt-4">{error}</p>}
            <div className="flex justify-between gap-2 mt-6">
              <button
                type="button"
                onClick={() => setStep("method")}
                className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={submitManual}
                className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
              >
                Verify device
              </button>
            </div>
          </div>
        )}

        {step === "verify" && (
          <div className="text-center py-8">
            <Loader2 aria-hidden className="w-10 h-10 mx-auto animate-spin text-primary" />
            <p className="text-[15px] font-medium mt-5">Verifying this is a genuine Rhea device…</p>
            <p className="text-[14px] text-muted-foreground mt-1.5 max-w-sm mx-auto leading-relaxed">
              Rhea checks the serial against its approved-device registry before anything is
              registered to your account.
            </p>
          </div>
        )}

        {step === "confirm" && found && (
          <div className="mt-2">
            <div className="flex justify-center py-2">
              <DeviceVisual modelId={found.identified.modelId} className="w-44 h-44" />
            </div>
            <p className="text-center text-[16px] font-medium">
              Is this the device you want to connect?
            </p>
            <dl className="mt-5 rounded-2xl bg-muted/50 p-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[12px] uppercase tracking-[0.06em] text-muted-foreground">
                  Model
                </dt>
                <dd className="text-[14px] mt-1 font-medium">{found.identified.model}</dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.06em] text-muted-foreground">
                  Serial
                </dt>
                <dd className="text-[14px] mt-1 font-medium">{maskSerial(found.serial)}</dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.06em] text-muted-foreground">
                  Firmware
                </dt>
                <dd className="text-[14px] mt-1 font-medium">{found.identified.firmware}</dd>
              </div>
              <div>
                <dt className="text-[12px] uppercase tracking-[0.06em] text-muted-foreground">
                  Connection
                </dt>
                <dd className="text-[14px] mt-1 font-medium">
                  {path === "bluetooth" || method === "bluetooth" ? "Bluetooth" : "USB-C"}
                </dd>
              </div>
            </dl>
            <p className="text-[13px] text-muted-foreground mt-4 flex items-center gap-1.5">
              <ShieldCheck aria-hidden className="w-4 h-4 text-success shrink-0" />
              Verified as a genuine Rhea-approved device.
            </p>
            <div className="flex justify-between gap-2 mt-6">
              <button
                type="button"
                onClick={() => {
                  setFound(null);
                  setStep("method");
                }}
                className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
              >
                Not my device
              </button>
              <button
                type="button"
                onClick={() => setStep("name")}
                className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
              >
                Yes, register device
              </button>
            </div>
          </div>
        )}

        {step === "name" && found && (
          <div className="mt-5">
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              Give the device a name you'll recognise — many clinicians name it after the room it
              lives in.
            </p>
            <label className="block mt-4">
              <span className="text-[14px] font-medium">Device name</span>
              <input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Exam Room 2 Recorder"
                className={inputCls}
              />
            </label>
            <div className="flex justify-between gap-2 mt-6">
              <button
                type="button"
                onClick={() => setStep("confirm")}
                className="h-10 px-5 rounded-full hairline bg-card text-[14px] hover:bg-muted transition"
              >
                Back
              </button>
              <button
                type="button"
                onClick={finish}
                className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-[14px] font-medium hover:opacity-90 transition"
              >
                Register device
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
