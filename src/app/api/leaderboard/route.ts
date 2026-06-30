import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const supabase = supabaseServer();

  const { data: rows, error } = await supabase.from("leaderboard").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: stats } = await supabase.from("leaderboard_stats").select("*").maybeSingle();

  return NextResponse.json({
    leaderboard: rows ?? [],
    stats: stats ?? { total_candidates: 0, total_submitted: 0, top_referrals: 0 },
  });
}
