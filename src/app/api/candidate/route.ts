import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { sendBetaEmail } from "@/lib/mailer";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("candidates")
    .select(
      "email,status,submitted_at,xp,linkedin_handle,twitter_handle,whatsapp,linkedin_proof_url,twitter_proof_url,flow_state",
    )
    .eq("email", email)
    .maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidate: data ?? null });
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
