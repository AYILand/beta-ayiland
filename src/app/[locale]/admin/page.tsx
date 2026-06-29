"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { LogOut, Search, Sparkles, Users, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { CandidateRow } from "@/components/admin/CandidateRow";
import { CandidateDrawer } from "@/components/admin/CandidateDrawer";
import { QuestsManager } from "@/components/admin/QuestsManager";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { Link } from "@/i18n/navigation";
import { BETA_CONFIG } from "@/lib/config";
import { loadAdminAuth, setAdminAuth } from "@/lib/admin";
import { fetchCandidates, patchCandidateStatus } from "@/lib/admin-api";
import type { Candidate, CandidateStatus } from "@/lib/repo";

type Tab = "candidates" | "quests";
type Filter = "all" | CandidateStatus;

export default function AdminPage() {
  const t = useTranslations("admin");
  const [hydrated, setHydrated] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<Tab>("candidates");
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [drawer, setDrawer] = useState<Candidate | null>(null);

  useEffect(() => {
    setAuthed(loadAdminAuth());
    setHydrated(true);
  }, []);

  const [loadError, setLoadError] = useState<string | null>(null);

  async function refresh() {
    try {
      setLoadError(null);
      const list = await fetchCandidates();
      setCandidates(list);
    } catch (err) {
      console.error(err);
      setLoadError((err as Error).message);
    }
  }

  useEffect(() => {
    if (authed) refresh();
  }, [authed]);

  const stats = useMemo(() => {
    return {
      total: candidates.length,
      approved: candidates.filter((c) => c.status === "approved").length,
      pending: candidates.filter((c) => c.status === "pending").length,
      rejected: candidates.filter((c) => c.status === "rejected").length,
    };
  }, [candidates]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return candidates.filter((c) => {
      if (filter !== "all" && c.status !== filter) return false;
      if (!q) return true;
      return (
        c.email.toLowerCase().includes(q) ||
        (c.flow.data.linkedinHandle ?? "").toLowerCase().includes(q) ||
        (c.flow.data.twitterHandle ?? "").toLowerCase().includes(q)
      );
    });
  }, [candidates, filter, query]);

  if (!hydrated) {
    return <main className="flex min-h-screen items-center justify-center bg-surface-tint" />;
  }

  if (!authed) {
    return <AdminLogin onAuth={() => { setAdminAuth(true); setAuthed(true); }} />;
  }

  return (
    <main
      className="relative min-h-screen"
      style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
    >
      <header className="sticky top-0 z-30 border-b border-border bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <Image src={BETA_CONFIG.logoUrl} alt="AYILand" width={200} height={200} priority style={{ height: 40, width: "auto" }} />
            <span className="hidden text-xs font-medium uppercase tracking-widest text-text-secondary sm:inline">
              {t("title")}
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-full border border-border bg-white p-1 text-xs">
              <TabButton active={tab === "candidates"} onClick={() => setTab("candidates")} icon={<Users size={13} />} label={t("tabs.candidates")} />
              <TabButton active={tab === "quests"} onClick={() => setTab("quests")} icon={<Trophy size={13} />} label={t("tabs.quests")} />
            </div>
            <LangSwitcher />
            <button
              type="button"
              onClick={() => {
                setAdminAuth(false);
                setAuthed(false);
              }}
              className="flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-text-secondary transition hover:border-border-strong"
            >
              <LogOut size={12} />
              {t("logout")}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-6 lg:px-8">
        <AnimatePresence mode="wait">
          {tab === "candidates" ? (
            <motion.div
              key="candidates"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatCard label={t("stats.total")} value={stats.total} hue="brand-blue" />
                <StatCard label={t("stats.approved")} value={stats.approved} hue="brand-green" />
                <StatCard label={t("stats.pending")} value={stats.pending} hue="brand-blue" />
                <StatCard label={t("stats.rejected")} value={stats.rejected} hue="red" />
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                  />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("filters.search")}
                    className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-brand-blue focus:shadow-[0_0_0_3px_rgba(30,91,168,0.08)]"
                  />
                </div>
                <div className="flex items-center gap-1 rounded-lg border border-border bg-white p-1 text-xs">
                  {(["all", "pending", "approved", "rejected"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFilter(f)}
                      className={
                        "rounded-md px-2.5 py-1 transition " +
                        (filter === f
                          ? "brand-gradient-bg text-white"
                          : "text-text-secondary hover:bg-surface-soft")
                      }
                    >
                      {t(`filters.${f}`)}
                    </button>
                  ))}
                </div>
                {loadError && (
                  <span className="text-[11px] text-red-600">{loadError}</span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3">
                {filtered.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border bg-white px-3 py-10 text-center text-xs text-text-muted">
                    {t("candidate.noCandidates")}
                  </p>
                ) : (
                  filtered.map((c) => (
                    <CandidateRow
                      key={c.email}
                      candidate={c}
                      onApprove={async () => {
                        await patchCandidateStatus(c.email, "approved");
                        refresh();
                      }}
                      onReject={async () => {
                        await patchCandidateStatus(c.email, "rejected");
                        refresh();
                      }}
                      onReset={async () => {
                        await patchCandidateStatus(c.email, "pending");
                        refresh();
                      }}
                      onView={() => setDrawer(c)}
                    />
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="quests"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <QuestsManager />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CandidateDrawer candidate={drawer} onClose={() => setDrawer(null)} />
    </main>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium transition " +
        (active ? "brand-gradient-bg text-white" : "text-text-secondary hover:bg-surface-soft")
      }
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, hue }: { label: string; value: number; hue: "brand-blue" | "brand-green" | "red" }) {
  const cls =
    hue === "brand-blue"
      ? "from-brand-blue/10 to-brand-blue/0 text-brand-blue"
      : hue === "brand-green"
      ? "from-brand-green/10 to-brand-green/0 text-brand-green"
      : "from-red-100 to-red-50 text-red-600";
  return (
    <div className={`rounded-xl border border-border bg-gradient-to-br ${cls} p-4`}>
      <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">{label}</p>
      <p className="mt-1 text-2xl font-medium tabular-nums">{value}</p>
    </div>
  );
}
