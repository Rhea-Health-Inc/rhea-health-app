// Recording devices: the clinician's Rhea-approved hardware, registered to
// their account. Mock store for the demo — persisted to localStorage like
// the session and appearance preferences, with a small subscribe/notify so
// every view stays in sync.

export type DeviceStatus = "connected" | "disconnected" | "pairing";
export type ConnectionMethod = "bluetooth" | "usb";

export interface RecordingDevice {
  id: string;
  /** Clinician-facing label, e.g. "Exam Room 3 Recorder". */
  name: string;
  /** Model name exactly as the device reports it during verification. */
  model: string;
  /** Key used to pick the device's visual (3D-style render or image). */
  modelId: string;
  /** Full serial number as printed on the device; the UI masks it. */
  serial: string;
  method: ConnectionMethod;
  status: DeviceStatus;
  /** Battery percentage when the hardware reports it, otherwise null. */
  battery: number | null;
  /** Firmware version when the device reports it, otherwise null. */
  firmware: string | null;
  /** ISO timestamps; null when the event has not happened yet. */
  lastConnectedAt: string | null;
  lastSyncAt: string | null;
  registeredAt: string;
}

const KEY = "rhea.devices.v1";
const listeners = new Set<(d: RecordingDevice[]) => void>();

function seed(): RecordingDevice[] {
  const now = Date.now();
  const mins = (m: number) => new Date(now - m * 60_000).toISOString();
  return [
    {
      id: "dev-exam-room-3",
      name: "Exam Room 3 Recorder",
      model: "Rhea Recorder",
      modelId: "rhea-recorder",
      serial: "RH-7302-4185",
      method: "bluetooth",
      status: "connected",
      battery: 86,
      firmware: "2.4.1",
      lastConnectedAt: mins(24),
      lastSyncAt: mins(4),
      registeredAt: mins(60 * 24 * 38),
    },
    {
      id: "dev-rounds",
      name: "Rounds Recorder",
      model: "Rhea Recorder",
      modelId: "rhea-recorder",
      serial: "RH-7302-9046",
      method: "bluetooth",
      status: "disconnected",
      battery: 42,
      firmware: "2.3.0",
      lastConnectedAt: mins(60 * 26),
      lastSyncAt: mins(60 * 26),
      registeredAt: mins(60 * 24 * 12),
    },
  ];
}

export function readDevices(): RecordingDevice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) {
      const initial = seed();
      window.localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw) as RecordingDevice[];
  } catch {
    return [];
  }
}

export function writeDevices(devices: RecordingDevice[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(devices));
  } catch {
    /* ignore */
  }
  listeners.forEach((l) => l(devices));
}

export function subscribeDevices(fn: (d: RecordingDevice[]) => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function addDevice(device: RecordingDevice) {
  writeDevices([...readDevices(), device]);
}

export function updateDevice(id: string, patch: Partial<RecordingDevice>) {
  writeDevices(readDevices().map((d) => (d.id === id ? { ...d, ...patch } : d)));
}

export function removeDevice(id: string) {
  writeDevices(readDevices().filter((d) => d.id !== id));
}

/** "RH-7302-4185" → "RH-••••-4185": only the last block is ever shown. */
export function maskSerial(serial: string) {
  const parts = serial.split("-");
  if (parts.length < 3) return serial;
  return `${parts[0]}-••••-${parts[parts.length - 1]}`;
}

export const SERIAL_PATTERN = /^RH-\d{4}-\d{4}$/i;

export interface IdentifiedDevice {
  model: string;
  modelId: string;
  firmware: string;
}

/**
 * Mock authenticity check standing in for Rhea's device registry: a
 * well-formed serial is looked up and the device reports back its model
 * and firmware. Registration must not proceed without this succeeding.
 */
export function identifyDevice(serial: string): IdentifiedDevice | null {
  if (!SERIAL_PATTERN.test(serial.trim())) return null;
  return { model: "Rhea Recorder", modelId: "rhea-recorder", firmware: "2.4.1" };
}

/** "just now", "4 min ago", "Yesterday", "12 Mar" — for device timestamps. */
export function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}
