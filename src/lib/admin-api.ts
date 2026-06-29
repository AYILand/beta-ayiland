"use client";

import type { Candidate, CandidateStatus } from "./repo";

interface DbCandidate {
  email: string;
  status: CandidateStatus;
  submitted_at: string | null;
  xp: number | null;
  linkedin_handle: string | null;
  twitter_handle: string | null;
  whatsapp: string | null;
  linkedin_proof_url: string | null;
  twitter_proof_url: string | null;
  flow_state: { done?: Record<string, true>; achievements?: string[] } | null;
  notes: string | null;
}

function mapToCandidate(db: DbCandidate): Candidate {
  return {
    email: db.email,
    status: db.status,
    submittedAt: db.submitted_at,
    notes: db.notes ?? undefined,
    flow: {
      step: 4,
      xp: db.xp ?? 0,
      done: (db.flow_state?.done ?? {}) as Candidate["flow"]["done"],
      achievements: (db.flow_state?.achievements ?? []) as Candidate["flow"]["achievements"],
      data: {
        email: db.email,
        linkedinHandle: db.linkedin_handle ?? undefined,
        twitterHandle: db.twitter_handle ?? undefined,
        whatsapp: db.whatsapp ?? undefined,
        linkedinProof: db.linkedin_proof_url ?? undefined,
        twitterProof: db.twitter_proof_url ?? undefined,
      },
    },
  };
}

function authHeaders(): HeadersInit {
  const pwd = typeof window !== "undefined"
    ? (window.localStorage.getItem("ayiland-admin-password") ?? "ayitech2026")
    : "";
  return { "x-admin-password": pwd };
}

export function rememberAdminPassword(pwd: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("ayiland-admin-password", pwd);
  }
}

export async function fetchCandidates(): Promise<Candidate[]> {
  const res = await fetch("/api/admin/candidates", { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const json = (await res.json()) as { candidates: DbCandidate[] };
  return json.candidates.map(mapToCandidate);
}

export async function patchCandidateStatus(email: string, status: CandidateStatus) {
  const res = await fetch("/api/admin/candidates", {
    method: "PATCH",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ email, status }),
  });
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
}
