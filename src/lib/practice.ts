// Client-side organization ("practice") store backed by localStorage.
// Created during self-service onboarding; scales to multi-user clinics later.

import { useSyncExternalStore } from "react";

const KEY = "rhea.practice.v1";

export type OrgRole = "owner" | "admin" | "clinician";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: OrgRole;
  status: "active" | "invited" | "deactivated";
  lastActive: string;
  seat: boolean;
};

export type BillingContacts = {
  contactName: string;
  contactEmail: string;
  apEmail: string;
  financeEmail: string;
};

export type PurchaseOrder = {
  poNumber: string;
  department: string;
  internalRef: string;
};

export type TaxInfo = {
  businessName: string;
  taxId: string;
  vatNumber: string;
  gstNumber: string;
  exemptionStatus: string;
  country: string;
};

export type BillingPreferences = {
  invoicesByEmail: boolean;
  copyBillingContact: boolean;
  copyAccountsPayable: boolean;
  paymentReminders: boolean;
  renewalReminders: boolean;
  pdfInvoices: boolean;
};

export type PaymentMethod = {
  brand: string;
  last4: string;
  expiry: string;
  cardholder: string;
  billingAddress: string;
  country: string;
  postalCode: string;
};

export const SEAT_PRICE = 179;

/** Prorated charge per seat = seat price x (days remaining / total billing days). */
export function prorationDetails(
  renewalDate: string,
  cycle: "monthly" | "annual",
  seatPrice = SEAT_PRICE,
) {
  const totalDays = cycle === "annual" ? 365 : 30;
  const now = new Date();
  const renewal = new Date(`${renewalDate}T00:00:00`);
  const msPerDay = 86_400_000;
  let daysRemaining = Math.ceil((renewal.getTime() - now.getTime()) / msPerDay);
  if (!Number.isFinite(daysRemaining) || daysRemaining < 0) daysRemaining = 0;
  daysRemaining = Math.min(daysRemaining, totalDays);
  const perSeat = round2(seatPrice * (daysRemaining / totalDays));
  return { daysRemaining, totalDays, perSeat };
}

export function round2(n: number) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function money(n: number) {
  return `$${round2(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export type Practice = {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  role: string;
  specialty: string;
  country: string;
  state: string;
  license: { number: string; country: string; state: string; npi?: string };
  plan: "professional" | "team" | "clinics" | "enterprise";
  planLabel: string;
  billingCycle: "monthly" | "annual";
  subscriptionStatus: "trialing" | "active" | "past_due" | "canceled";
  renewalDate: string;
  seatsPurchased: number;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  logo?: string;
  members: TeamMember[];
  createdAt: number;
  autoRenew?: boolean;
  billingContacts?: BillingContacts;
  purchaseOrder?: PurchaseOrder;
  taxInfo?: TaxInfo;
  billingPreferences?: BillingPreferences;
  paymentMethod?: PaymentMethod | null;
};

const listeners = new Set<() => void>();
let cache: Practice | null | undefined;

function read(): Practice | null {
  if (typeof window === "undefined") return null;
  if (cache !== undefined) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Practice) : null;
  } catch {
    cache = null;
  }
  return cache;
}

function write(p: Practice | null) {
  cache = p;
  if (typeof window !== "undefined") {
    if (p) window.localStorage.setItem(KEY, JSON.stringify(p));
    else window.localStorage.removeItem(KEY);
  }
  listeners.forEach((l) => l());
}

export function getPractice() {
  return read();
}

export function savePractice(patch: Partial<Practice>) {
  const current = read();
  if (!current) return;
  write({ ...current, ...patch });
}

export function updateMember(id: string, patch: Partial<TeamMember>) {
  const current = read();
  if (!current) return;
  write({
    ...current,
    members: current.members.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  });
}

export function inviteMember(name: string, email: string, role: OrgRole) {
  const current = read();
  if (!current) return;
  write({
    ...current,
    members: [
      ...current.members,
      {
        id: `m_${Date.now()}`,
        name,
        email,
        role,
        status: "invited",
        lastActive: "Never",
        seat: current.members.filter((m) => m.seat).length < current.seatsPurchased,
      },
    ],
  });
}

export function addSeat(count = 1) {
  const current = read();
  if (!current) return;
  write({ ...current, seatsPurchased: current.seatsPurchased + count });
}

export type OnboardingDraft = {
  firstName: string;
  lastName: string;
  email: string;
  practiceName: string;
  country: string;
  state: string;
  role: string;
  specialty: string;
  license: string;
  licenseCountry: string;
  licenseState: string;
  npi: string;
};

export function createPractice(
  draft: OnboardingDraft,
  plan: {
    plan: Practice["plan"];
    planLabel: string;
    status: Practice["subscriptionStatus"];
    cycle: Practice["billingCycle"];
    seats?: number;
  },
): Practice {
  const ownerName = `${draft.firstName} ${draft.lastName}`.trim();
  const renew = new Date();
  renew.setDate(
    renew.getDate() + (plan.status === "trialing" ? 14 : plan.cycle === "annual" ? 365 : 30),
  );
  const practice: Practice = {
    id: `org_${Date.now()}`,
    name: draft.practiceName,
    ownerName,
    ownerEmail: draft.email,
    role: draft.role,
    specialty: draft.specialty,
    country: draft.country,
    state: draft.state,
    license: {
      number: draft.license,
      country: draft.licenseCountry,
      state: draft.licenseState,
      npi: draft.npi || undefined,
    },
    plan: plan.plan,
    planLabel: plan.planLabel,
    billingCycle: plan.cycle,
    subscriptionStatus: plan.status,
    renewalDate: renew.toISOString().slice(0, 10),
    seatsPurchased: plan.seats ?? 1,
    email: draft.email,
    members: [
      {
        id: "m_owner",
        name: ownerName,
        email: draft.email,
        role: "owner",
        status: "active",
        lastActive: "Just now",
        seat: true,
      },
    ],
    createdAt: Date.now(),
  };
  write(practice);
  return practice;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function usePractice() {
  return useSyncExternalStore(subscribe, read, () => null);
}

export const COUNTRIES = [
  "United States",
  "Canada",
  "United Kingdom",
  "Ireland",
  "Australia",
  "New Zealand",
  "South Africa",
  "Nigeria",
  "Kenya",
  "India",
  "Singapore",
  "United Arab Emirates",
];

export const STATES: Record<string, string[]> = {
  "United States": [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
    "District of Columbia",
  ],
  Canada: [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
  ],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  Australia: [
    "New South Wales",
    "Queensland",
    "South Australia",
    "Tasmania",
    "Victoria",
    "Western Australia",
    "Australian Capital Territory",
    "Northern Territory",
  ],
};

export function statesFor(country: string) {
  return STATES[country] ?? ["Other / Not listed"];
}

export const ROLES = [
  "Physician",
  "Specialist",
  "Nurse Practitioner",
  "Physician Assistant",
  "Dentist",
  "Other",
];

export const SPECIALTIES = [
  "Internal Medicine",
  "Family Medicine",
  "Pediatrics",
  "Cardiology",
  "Dermatology",
  "Emergency Medicine",
  "Endocrinology",
  "Gastroenterology",
  "General Surgery",
  "Geriatrics",
  "Hematology",
  "Infectious Disease",
  "Nephrology",
  "Neurology",
  "Obstetrics & Gynecology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Otolaryngology",
  "Pain Medicine",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Sports Medicine",
  "Urology",
  "Anesthesiology",
  "Dentistry",
  "Other",
];
