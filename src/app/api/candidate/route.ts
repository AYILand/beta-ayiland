import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { sendBetaEmail } from "@/lib/mailer";

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
    const [refRes, aheadRes, totalRes, approvedRes] = await Promise.all([
      supabase
        .from("candidates")
        .select("email", { count: "exact", head: true })
        .eq("referred_by", email)
        .not("submitted_at", "is", null),
      supabase
        .from("candidates")
        .select("email", { count: "exact", head: true })
        .not("submitted_at", "is", null)
        .gt("xp", data.xp ?? 0),
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
    if (data.submitted_at) rank = (aheadRes.count ?? 0) + 1;
    totalSubmitted = totalRes.count ?? 0;
    approvedCount = approvedRes.count ?? 0;
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
    .select("referred_by,display_mode")
    .eq("email", email)
    .maybeSingle();

  const payload: Record<string, unknown> = {
    email,
    xp: body.xp ?? 0,
    linkedin_handle: body.linkedinHandle ?? null,
    twitter_handle: body.twitterHandle ?? null,
    whatsapp: body.whatsapp ?? null,
    linkedin_proof_url: body.linkedinProofUrl ?? null,
    twitter_proof_url: body.twitterProofUrl ?? null,
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
