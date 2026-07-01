import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { sendBetaEmail } from "@/lib/mailer";
import { MAX_XP, POINTS, REFERRAL_BONUS_XP, type ActionId } from "@/lib/flow";

function baseXpFromDone(done: unknown): number {
  const map = (done ?? {}) as Record<string, boolean>;
  return (Object.keys(POINTS) as ActionId[]).reduce(
    (sum, action) => sum + (map[action] ? POINTS[action] : 0),
    0,
  );
}

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const REF_RE = /^[a-z0-9]{6}$/;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";
  const refCode = url.searchParams.get("ref")?.trim().toLowerCase() ?? "";

  if (refCode && REF_RE.test(refCode)) {
    const supabase = supabaseServer();
    const { data, error } = await supabase
      .from("candidates")
      .select("email,linkedin_handle,ref_code")
      .eq("ref_code", refCode)
      .maybeSingle();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ candidate: data ?? null });
  }

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("candidates")
    .select(
      "email,status,submitted_at,xp,linkedin_handle,twitter_handle,whatsapp,linkedin_proof_url,twitter_proof_url,flow_state,ref_code,referred_by,display_mode",
    )
    .eq("email", email)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  let referralCount = 0;
  let rank: number | null = null;
  let totalSubmitted = 0;
  let approvedCount = 0;

  if (data) {
    const [refRes, rankRes, totalRes, approvedRes] = await Promise.all([
      supabase
        .from("candidates")
        .select("email", { count: "exact", head: true })
        .eq("referred_by", email)
        .not("submitted_at", "is", null),
      data.submitted_at
        ? supabase.from("candidate_ranks").select("rank").eq("email", email).maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("candidates")
        .select("email", { count: "exact", head: true })
        .not("submitted_at", "is", null),
      supabase
        .from("candidates")
        .select("email", { count: "exact", head: true })
        .eq("status", "approved"),
    ]);
    referralCount = refRes.count ?? 0;
    rank = (rankRes.data as { rank: number } | null)?.rank ?? null;
    totalSubmitted = totalRes.count ?? 0;
    approvedCount = approvedRes.count ?? 0;

    // Retroactive backfill : if submitted_at is set, the candidate completed the flow
    // (the UI enforces done flags before allowing submit). Force at least MAX_XP even
    // if done flags didn't persist correctly on the client. Add referral bonus on top.
    if (data.submitted_at) {
      const baseXpFromFlags = baseXpFromDone(
        (data.flow_state as { done?: unknown } | null)?.done,
      );
      const canonicalBaseXp = Math.max(baseXpFromFlags, MAX_XP);
      const canonicalXp = canonicalBaseXp + referralCount * REFERRAL_BONUS_XP;
      if ((data.xp ?? 0) < canonicalXp) {
        await supabase.from("candidates").update({ xp: canonicalXp }).eq("email", email);
        (data as { xp: number }).xp = canonicalXp;
      }
    }
  }

  return NextResponse.json({
    candidate: data ?? null,
    referralCount,
    rank,
    totalSubmitted,
    approvedCount,
  });
}

export async function POST(req: Request) {
  let body: {
    email?: string;
    xp?: number;
    linkedinHandle?: string;
    twitterHandle?: string;
    whatsapp?: string;
    linkedinProofUrl?: string;
    twitterProofUrl?: string;
    flowState?: unknown;
    submit?: boolean;
    referredByRefCode?: string;
    displayMode?: "name_initial" | "handle" | "anonymous" | "hidden";
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = supabaseServer();

  let referredByEmail: string | null = null;
  if (body.referredByRefCode && REF_RE.test(body.referredByRefCode)) {
    const { data: referrer } = await supabase
      .from("candidates")
      .select("email")
      .eq("ref_code", body.referredByRefCode.toLowerCase())
      .maybeSingle();
    if (referrer?.email && referrer.email !== email) {
      referredByEmail = referrer.email;
    }
  }

  const { data: existing } = await supabase
    .from("candidates")
    .select(
      "referred_by,display_mode,submitted_at,xp,linkedin_handle,twitter_handle,whatsapp,linkedin_proof_url,twitter_proof_url",
    )
    .eq("email", email)
    .maybeSingle();

  // XP is ALWAYS computed server-side from flow_state.done, never trusted from the client.
  // Rule: newXp = max(existingXp, canonical). Never decreases. Preserves referral bonus
  // (referral bonus lives in the same xp column and can push xp above the base canonical).
  const flowStateBody = (body.flowState ?? {}) as { done?: unknown };
  const canonicalBaseXp = baseXpFromDone(flowStateBody.done);
  const isFirstSubmitCall = body.submit && !existing?.submitted_at;
  const targetBase = isFirstSubmitCall
    ? Math.max(canonicalBaseXp, MAX_XP)
    : canonicalBaseXp;
  const nextXp = Math.max(existing?.xp ?? 0, targetBase);

  const payload: Record<string, unknown> = {
    email,
    xp: nextXp,
    linkedin_handle: body.linkedinHandle ?? existing?.linkedin_handle ?? null,
    twitter_handle: body.twitterHandle ?? existing?.twitter_handle ?? null,
    whatsapp: body.whatsapp ?? existing?.whatsapp ?? null,
    linkedin_proof_url: body.linkedinProofUrl ?? existing?.linkedin_proof_url ?? null,
    twitter_proof_url: body.twitterProofUrl ?? existing?.twitter_proof_url ?? null,
    flow_state: body.flowState ?? {},
  };
  if (body.submit) payload.submitted_at = new Date().toISOString();
  if (body.displayMode) payload.display_mode = body.displayMode;
  if (referredByEmail && !existing?.referred_by) {
    payload.referred_by = referredByEmail;
  }

  const { data, error } = await supabase
    .from("candidates")
    .upsert(payload, { onConflict: "email" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const isFirstSubmission = body.submit && !existing?.submitted_at;

  if (isFirstSubmission && data?.referred_by) {
    try {
      const { data: referrer } = await supabase
        .from("candidates")
        .select("xp")
        .eq("email", data.referred_by)
        .single();
      if (referrer) {
        await supabase
          .from("candidates")
          .update({ xp: (referrer.xp ?? 0) + REFERRAL_BONUS_XP })
          .eq("email", data.referred_by);
      }
    } catch (e) {
      console.error("Failed to award referral bonus XP", e);
    }
  }

  if (body.submit) {
    try {
      await sendBetaEmail({
        to: email,
        kind: "received",
        locale: "fr",
        recipientHandle: body.linkedinHandle ?? body.twitterHandle,
      });
    } catch (e) {
      console.error("Failed to send received email", e);
    }
  }

  return NextResponse.json({ candidate: data });
}
