import { PORTRAITS } from "@/components/clinik/Portraits";

const patientPhoto = (seed: string) =>
  `https://images.unsplash.com/${seed}?auto=format&fit=crop&w=200&h=200&q=80&crop=faces`;

export type Appointment = {
  id: string;
  time: string;
  duration: string;
  patient: {
    id: string;
    name: string;
    age: number;
    sex: "F" | "M";
    photo: string;
    mrn: string;
  };
  reason: string;
  room: string;
  status: "Upcoming" | "Checked in" | "In progress" | "Completed";
};

export const APPOINTMENTS: Appointment[] = [
  {
    id: "a1",
    time: "8:30 AM",
    duration: "20 min",
    patient: {
      id: "p1",
      name: "Marta Kellner",
      age: 42,
      sex: "F",
      photo: patientPhoto("photo-1544005313-94ddf0286df2"),
      mrn: "MRN 09821",
    },
    reason: "Follow-up · stable angina",
    room: "Room 3",
    status: "In progress",
  },
  {
    id: "a2",
    time: "9:00 AM",
    duration: "30 min",
    patient: {
      id: "p2",
      name: "Daniel Ortega",
      age: 58,
      sex: "M",
      photo: patientPhoto("photo-1522075469751-3a6694fb2f61"),
      mrn: "MRN 10412",
    },
    reason: "New patient · fatigue",
    room: "Room 3",
    status: "Checked in",
  },
  {
    id: "a3",
    time: "9:45 AM",
    duration: "15 min",
    patient: {
      id: "p3",
      name: "Aiko Tanaka",
      age: 34,
      sex: "F",
      photo: patientPhoto("photo-1531123897727-8f129e1688ce"),
      mrn: "MRN 11208",
    },
    reason: "Medication review",
    room: "Telehealth",
    status: "Upcoming",
  },
  {
    id: "a4",
    time: "10:15 AM",
    duration: "20 min",
    patient: {
      id: "p4",
      name: "Samuel Achebe",
      age: 61,
      sex: "M",
      photo: patientPhoto("photo-1607746882042-944635dfe10e"),
      mrn: "MRN 08155",
    },
    reason: "Post-op check · knee",
    room: "Room 5",
    status: "Upcoming",
  },
  {
    id: "a5",
    time: "11:00 AM",
    duration: "45 min",
    patient: {
      id: "p5",
      name: "Priya Menon",
      age: 29,
      sex: "F",
      photo: patientPhoto("photo-1573496359142-b8d87734a5a2"),
      mrn: "MRN 12099",
    },
    reason: "Annual physical",
    room: "Room 3",
    status: "Upcoming",
  },
  {
    id: "a6",
    time: "1:30 PM",
    duration: "20 min",
    patient: {
      id: "p6",
      name: "Lukas Weber",
      age: 47,
      sex: "M",
      photo: patientPhoto("photo-1500648767791-00dcc994a43e"),
      mrn: "MRN 07733",
    },
    reason: "Hypertension follow-up",
    room: "Room 3",
    status: "Upcoming",
  },
];

export const CLINICIAN = {
  name: "Dr. Sarah Chen",
  role: "Internal Medicine",
  photo: PORTRAITS.drChen,
  hospital: "Ridgemont General Hospital",
};

export const STATS = [
  { label: "Patients today", value: "12", hint: "6 remaining" },
  { label: "Pending notes", value: "4", hint: "2 need review" },
  { label: "Completed notes", value: "38", hint: "This week" },
  { label: "Unread messages", value: "7", hint: "3 from patients" },
  { label: "Urgent follow-ups", value: "2", hint: "Due today" },
  { label: "Time saved", value: "6.4h", hint: "This week, avg 22 min/visit" },
];

export const TRANSCRIPT = [
  { s: "doctor", t: "How has the chest tightness been since we adjusted the metoprolol dose?" },
  {
    s: "patient",
    t: "Better overall. Still noticeable when I climb stairs, but no episodes at rest this week.",
  },
  { s: "doctor", t: "Any lightheadedness, palpitations, or shortness of breath while resting?" },
  {
    s: "patient",
    t: "No lightheadedness. Occasional palpitations after coffee, but they pass quickly.",
  },
  { s: "doctor", t: "Good. And you've been checking your blood pressure at home?" },
  { s: "patient", t: "Yes, mornings mostly. Averaging around 128 over 82." },
  {
    s: "doctor",
    t: "That's right in range. Let's continue the current therapy and repeat a lipid panel in six weeks.",
  },
];

export const AI_CARDS = {
  chiefComplaint: "Exertional chest tightness, improving.",
  symptoms: [
    "Chest tightness on exertion",
    "Occasional post-caffeine palpitations",
    "No rest angina",
  ],
  medications: ["Metoprolol 50 mg BID (current)", "Atorvastatin 20 mg QHS"],
  conditions: ["Stable angina", "Essential hypertension"],
  procedures: [],
  tests: ["Lipid panel - repeat in 6 weeks"],
  followups: ["Home BP log review at next visit", "Cardiology if symptoms worsen"],
  missing: ["Family history of cardiac events", "Recent caffeine intake quantified"],
  suggested: ["Subjective", "Objective - vitals", "Assessment", "Plan"],
};

export const HISTORY = [
  {
    date: "Mar 04, 2026",
    reason: "Lab results reviewed",
    provider: "Dr. Chen",
    summary: "Lipid panel improved. Continue statin.",
  },
  {
    date: "Feb 18, 2026",
    reason: "Referral · Cardiology",
    provider: "Dr. Chen",
    summary: "Referred for stress echo; awaiting scheduling.",
  },
  {
    date: "Jan 22, 2026",
    reason: "Initial consult",
    provider: "Dr. Chen",
    summary: "New onset exertional chest tightness. Started metoprolol.",
  },
  {
    date: "Nov 09, 2025",
    reason: "Annual physical",
    provider: "Dr. Patel",
    summary: "BP elevated, recommended lifestyle changes.",
  },
];
