import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "ayitech2026";

function checkAuth(req: Request) {
  return req.headers.get("x-admin-password") === ADMIN_PASSWORD;
}

export async function GET() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("custom_quests")
    .select("*")
    .order("position", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ quests: data ?? [] });
}

export async function POST(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const quest = await req.json();
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("custom_quests")
    .upsert({
      id: quest.id,
      title_fr: quest.titleFr,
      title_en: quest.titleEn,
      desc_fr: quest.descFr,
      desc_en: quest.descEn,
      url: quest.url,
      points: quest.points,
      require_screenshot: quest.requireScreenshot,
      active: quest.active,
      position: quest.position,
    })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ quest: data });
}

export async function DELETE(req: Request) {
  if (!checkAuth(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const supabase = supabaseServer();
  const { error } = await supabase.from("custom_quests").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
