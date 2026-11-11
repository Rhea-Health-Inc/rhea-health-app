// Client-side patient store backed by localStorage.
// Seeds from the mock APPOINTMENTS on first load, then supports adding
// new patients through the "Add new patient" flow.

import { useSyncExternalStore } from "react";
import { APPOINTMENTS } from "@/lib/mock";

const KEY = "rhea.patients.v1";

export type Patient = {
  id: string;
  mrn: string;
  firstName: string;
  lastName: string;
  preferredName?: string;
  name: string;
  age: number;
  sex: "F" | "M" | "Other" | "Unspecified";
  photo: string;
  dob?: string;
  email?: string;
  phone?: string;
  gender?: string;
  address?: string;
  emergencyContact?: string;
  allergies?: string;
  medications?: string;
  conditions?: string;
  insurance?: string;
  primaryPhysician?: string;
  createdAt: number;
  source: "seed" | "manual";
};

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80&crop=faces";

const listeners = new Set<() => void>();
let cache: Patient[] | null = null;

function read(): Patient[] {
  if (typeof window === "undefined") return seed();
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw);
      return cache!;
    }
  } catch {
    /* ignore */
  }
  cache = seed();
  write(cache);
  return cache;
}

function write(list: Patient[]) {
  cache = list;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(list));
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

function seed(): Patient[] {
  return APPOINTMENTS.map((a): Patient => {
    const [firstName, ...rest] = a.patient.name.split(" ");
    return {
      id: a.patient.id,
      mrn: a.patient.mrn,
      firstName,
      lastName: rest.join(" "),
      name: a.patient.name,
      age: a.patient.age,
      sex: a.patient.sex,
      photo: a.patient.photo,
      createdAt: Date.now(),
      source: "seed",
    };
  });
}

export function listPatients(): Patient[] {
  return read();
}

export function getPatient(id: string): Patient | undefined {
  return read().find((p) => p.id === id);
}

export function addPatient(
  input: Omit<Patient, "id" | "mrn" | "name" | "createdAt" | "source" | "photo" | "age"> & {
    age?: number;
    photo?: string;
  },
): Patient {
  const list = read();
  const id = `p${Date.now().toString(36)}`;
  const mrn = `MRN ${String(Math.floor(10000 + Math.random() * 90000))}`;
  const age = input.age ?? (input.dob ? calcAge(input.dob) : 0);
  const patient: Patient = {
    ...input,
    id,
    mrn,
    age,
    photo: input.photo ?? DEFAULT_PHOTO,
    name: `${input.firstName} ${input.lastName}`.trim(),
    sex: input.sex ?? "Unspecified",
    createdAt: Date.now(),
    source: "manual",
  };
  write([patient, ...list]);
  return patient;
}

export function archivePatient(id: string) {
  const list = read().filter((p) => p.id !== id);
  write(list);
}

function calcAge(dob: string): number {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return 0;
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

let serverSnapshot: Patient[] | null = null;
function getServerSnapshot(): Patient[] {
  if (!serverSnapshot) serverSnapshot = seed();
  return serverSnapshot;
}

export function usePatients(): Patient[] {
  return useSyncExternalStore(subscribe, read, getServerSnapshot);
}
