import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";
import { sendBetaEmail } from "@/lib/mailer";

export const runtime = "nodejs";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "ayitech2026";

function checkAuth(req: Request) {
  const header = req.headers.get("x-admin-password");
  return header === ADMIN_PASSWORD;
}

export async function GET(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("candidates")
    .select("*")
    .order("submitted_at", { ascending: false, nullsFirst: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ candidates: data ?? [] });
}

export async function PATCH(req: Request) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { email?: string; status?: "pending" | "approved" | "rejected"; notes?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const email = (body.email ?? "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  const patch: Record<string, unknown> = {};
  if (body.status) patch.status = body.status;
  if (body.notes !== undefined) patch.notes = body.notes;

  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("candidates")
    .update(patch)
    .eq("email", email)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (body.status === "approved" || body.status === "rejected") {
    try {
      await sendBetaEmail({
        to: email,
        kind: body.status === "approved" ? "selected" : "rejected",
        locale: "fr",
        recipientHandle: data?.linkedin_handle ?? data?.twitter_handle ?? undefined,
      });
    } catch (e) {
      console.error("Failed to send status email", e);
    }
  }

  return NextResponse.json({ candidate: data });
}
