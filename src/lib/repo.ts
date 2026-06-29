"use client";

import type { FlowState } from "./flow";

export type CandidateStatus = "pending" | "approved" | "rejected";

export type Candidate = {
  email: string;
  status: CandidateStatus;
  submittedAt: string | null;
  flow: FlowState;
  notes?: string;
};

const SESSION_PREFIX = "ayiland-beta-session-";
const META_KEY = "ayiland-beta-candidates-meta";
const SEEDED_KEY = "ayiland-beta-demo-seeded";

type MetaMap = Record<string, { status: CandidateStatus; submittedAt: string | null; notes?: string }>;

function loadMeta(): MetaMap {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(META_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveMeta(meta: MetaMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(META_KEY, JSON.stringify(meta));
}

export function listCandidates(): Candidate[] {
  if (typeof window === "undefined") return [];
  const meta = loadMeta();
  const out: Candidate[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith(SESSION_PREFIX)) continue;
    const email = key.slice(SESSION_PREFIX.length);
    try {
      const flow = JSON.parse(window.localStorage.getItem(key) ?? "{}") as FlowState;
      const m = meta[email] ?? { status: "pending" as CandidateStatus, submittedAt: null };
      out.push({ email, status: m.status, submittedAt: m.submittedAt, notes: m.notes, flow });
    } catch {
      // skip malformed entry
    }
  }
  return out.sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""));
}

export function setStatus(email: string, status: CandidateStatus) {
  const meta = loadMeta();
  const cur = meta[email.toLowerCase()] ?? { status: "pending" as CandidateStatus, submittedAt: null };
  meta[email.toLowerCase()] = { ...cur, status };
  saveMeta(meta);
}

export function markSubmitted(email: string, submittedAt?: string) {
  const meta = loadMeta();
  const cur = meta[email.toLowerCase()] ?? { status: "pending" as CandidateStatus, submittedAt: null };
  meta[email.toLowerCase()] = { ...cur, submittedAt: submittedAt ?? new Date().toISOString() };
  saveMeta(meta);
}

export function setNotes(email: string, notes: string) {
  const meta = loadMeta();
  const cur = meta[email.toLowerCase()] ?? { status: "pending" as CandidateStatus, submittedAt: null };
  meta[email.toLowerCase()] = { ...cur, notes };
  saveMeta(meta);
}

const DEMO_NAMES = [
  { handle: "marie.joseph", first: "Marie", last: "Joseph" },
  { handle: "jean.pierre", first: "Jean", last: "Pierre" },
  { handle: "alex.morisset", first: "Alex", last: "Morisset" },
  { handle: "sara.bellevue", first: "Sara", last: "Bellevue" },
  { handle: "leo.augustin", first: "Léo", last: "Augustin" },
];

export function seedDemoCandidates() {
  if (typeof window === "undefined") return;
  if (window.localStorage.getItem(SEEDED_KEY)) return;
  const meta = loadMeta();
  DEMO_NAMES.forEach((n, i) => {
    const email = `${n.handle}@demo.ayiland.app`;
    const flow: FlowState = {
      step: 4,
      xp: 1000,
      done: {
        connectLinkedin: true,
        followLinkedin: true,
        connectTwitter: true,
        followTwitter: true,
        fillEmail: true,
        fillWhatsapp: true,
        submit: true,
      },
      achievements: ["firstStep", "socialButterfly", "loyalFan", "readyToRoll", "betaWarrior"],
      data: {
        linkedinHandle: n.handle,
        twitterHandle: `@${n.handle.replace(".", "_")}`,
        email,
        whatsapp: `+509 0000 ${1000 + i}`,
      },
    };
    window.localStorage.setItem(SESSION_PREFIX + email, JSON.stringify(flow));
    meta[email] = {
      status: i === 0 ? "approved" : i === 4 ? "rejected" : "pending",
      submittedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    };
  });
  saveMeta(meta);
  window.localStorage.setItem(SEEDED_KEY, "1");
}

export function purgeCandidate(email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_PREFIX + email.toLowerCase());
  const meta = loadMeta();
  delete meta[email.toLowerCase()];
  saveMeta(meta);
}
