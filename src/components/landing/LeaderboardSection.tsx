"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { leaderboardDisplay } from "@/lib/display-name";

interface LeaderboardRow {
  ref_code: string;
  linkedin_handle: string | null;
  display_name: string | null;
  display_mode: "name_initial" | "handle" | "anonymous" | "hidden";
  xp: number;
  referral_count: number;
}

interface Stats {
  total_candidates: number;
  total_submitted: number;
  top_referrals: number | null;
}

const MIN_CANDIDATES = 20;
const MIN_TOP_REFERRALS = 3;

export function LeaderboardSection() {
  const t = useTranslations("leaderboard");
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => r.json())
      .then(({ leaderboard, stats }) => {
        setRows(leaderboard ?? []);
        setStats(stats ?? null);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  if (!loaded) return null;

  const ready =
    stats &&
    (stats.total_candidates ?? 0) >= MIN_CANDIDATES &&
    (stats.top_referrals ?? 0) >= MIN_TOP_REFERRALS;

  return (
    <section className="relative z-10 mx-auto w-full max-w-3xl px-6 pb-16 pt-4 lg:px-10">
      <header className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-1.5 text-[11px] font-medium tracking-widest text-brand-blue backdrop-blur">
          <Trophy size={13} />
          {t("title")}
        </div>
        <p className="mt-3 text-sm text-text-secondary">{t("subtitle")}</p>
      </header>

      {!ready ? (
        <div className="rounded-2xl border border-dashed border-border bg-white/60 px-6 py-10 text-center backdrop-blur">
          <Trophy className="mx-auto text-text-muted" size={28} />
          <h3 className="mt-3 text-base font-medium text-text-primary">{t("emptyTitle")}</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-text-secondary sm:text-sm">
            {t("emptyBody")}
          </p>
        </div>
      ) : (
        <div
          className="relative overflow-hidden rounded-2xl border border-border bg-white/80 backdrop-blur-xl"
          style={{
            boxShadow:
              "0 20px 50px -25px rgba(30,91,168,0.3), 0 8px 18px -8px rgba(42,157,111,0.18), inset 0 1px 0 rgba(255,255,255,0.6)",
          }}
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 0% 0%, rgba(30,91,168,0.08), transparent 50%), radial-gradient(circle at 100% 100%, rgba(42,157,111,0.08), transparent 50%)",
            }}
          />
          <div className="relative">
            <div className="grid grid-cols-[40px_1fr_70px_70px] gap-2 border-b border-border px-4 py-2 text-[10px] font-medium uppercase tracking-widest text-text-secondary sm:grid-cols-[44px_1fr_90px_80px] sm:px-5">
              <span>#</span>
              <span></span>
              <span className="text-right">{t("referralsCol")}</span>
              <span className="text-right">{t("xpCol")}</span>
            </div>
            <ul className="divide-y divide-border">
              {rows.map((row, i) => (
                <motion.li
                  key={row.ref_code}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[40px_1fr_70px_70px] items-center gap-2 px-4 py-3 sm:grid-cols-[44px_1fr_90px_80px] sm:px-5"
                >
                  <span
                    className={
                      "flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium " +
                      (i === 0
                        ? "bg-amber-100 text-amber-700"
                        : i === 1
                        ? "bg-slate-100 text-slate-700"
                        : i === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-surface-soft text-text-secondary")
                    }
                  >
                    {i + 1}
                  </span>
                  <span className="truncate text-sm font-medium text-text-primary">
                    {leaderboardDisplay(
                      row.display_mode,
                      row.linkedin_handle,
                      row.display_name,
                      row.ref_code,
                      t("anonymousAlias"),
                    )}
                  </span>
                  <span className="inline-flex items-center justify-end gap-1 text-sm font-medium tabular-nums text-brand-blue">
                    <Users size={12} className="text-text-muted" />
                    {row.referral_count}
                  </span>
                  <span className="inline-flex items-center justify-end gap-1 text-sm font-medium tabular-nums text-brand-green">
                    <Zap size={12} className="text-text-muted" />
                    {row.xp}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <p className="mt-4 text-center text-[11px] italic text-text-muted">{t("noteSelection")}</p>
    </section>
  );
}
