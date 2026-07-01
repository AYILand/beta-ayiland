"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  ArrowRight,
  Award,
  Check,
  Clock,
  Copy,
  Hash,
  LogOut,
  Mail,
  MessageCircle,
  Sparkles,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AyiMascot } from "@/components/mascot/AyiMascot";
import { StageBackground } from "@/components/ui/StageBackground";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { EmailGate } from "@/components/quest/EmailGate";
import { BETA_CONFIG } from "@/lib/config";
import { clearEmail, loadEmail, persistEmail } from "@/lib/session";

type Status = "pending" | "approved" | "rejected";

interface Candidate {
  email: string;
  status: Status;
  submitted_at: string | null;
  xp: number | null;
  linkedin_handle: string | null;
  twitter_handle: string | null;
  whatsapp: string | null;
  ref_code: string | null;
  display_mode: "name_initial" | "handle" | "anonymous" | "hidden";
  flow_state?: { done?: Record<string, true>; step?: number };
}

interface MeData {
  candidate: Candidate | null;
  referralCount: number;
  rank: number | null;
  totalSubmitted: number;
  approvedCount: number;
}

export default function MeClient() {
  const t = useTranslations("me");
  const tShare = useTranslations("share");
  const tStatus = useTranslations("me.status");

  const [email, setEmail] = useState<string | null>(null);
  const [emailHydrated, setEmailHydrated] = useState(false);
  const [data, setData] = useState<MeData | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const stored = loadEmail();
    if (stored) setEmail(stored);
    setEmailHydrated(true);
  }, []);

  useEffect(() => {
    if (!email) {
      setData(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/candidate?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setData(j as MeData);
      })
      .catch(() => {
        if (!cancelled) setData({ candidate: null, referralCount: 0, rank: null, totalSubmitted: 0, approvedCount: 0 });
      });
    return () => {
      cancelled = true;
    };
  }, [email]);

  if (!emailHydrated) {
    return <main className="flex min-h-screen items-center justify-center bg-surface-tint" />;
  }

  if (!email) {
    return (
      <EmailGate
        hasPrevious={false}
        onSubmit={(e) => {
          persistEmail(e);
          setEmail(e);
        }}
      />
    );
  }

  if (!data) {
    return <main className="flex min-h-screen items-center justify-center bg-surface-tint" />;
  }

  if (!data.candidate) {
    return (
      <main
        className="relative flex min-h-screen flex-col overflow-hidden"
        style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
      >
        <StageBackground />
        <section className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 text-center">
          <div className="w-36">
            <AyiMascot pose="thinking" className="w-full" />
          </div>
          <p className="mt-4 text-sm text-text-secondary">{t("noCandidate")}</p>
          <p className="mt-1 text-xs text-text-muted">{email}</p>
          <Link
            href="/apply"
            className="mt-6 inline-flex items-center gap-2 rounded-xl brand-gradient-bg px-6 py-3 text-sm font-medium text-white"
            style={{ boxShadow: "0 12px 28px rgba(30,91,168,0.25)" }}
          >
            {t("applyBtn")}
            <ArrowRight size={14} />
          </Link>
        </section>
      </main>
    );
  }

  const c = data.candidate;
  const handle = c.linkedin_handle ?? c.twitter_handle ?? null;
  const firstName = handle ? handle.replace(/[._-]+/g, " ").split(/\s+/)[0] : null;
  const welcomeStr = firstName
    ? t("welcome", { name: firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase() })
    : t("welcomeFallback");

  const origin = typeof window !== "undefined" ? window.location.origin : "https://beta.ayiland.app";
  const refUrl = c.ref_code ? `${origin}/?ref=${c.ref_code}` : origin;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(refUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  const done = c.flow_state?.done ?? {};
  const roadmap: { key: string; done: boolean; pending?: boolean }[] = [
    { key: "registered", done: true },
    { key: "linkedin", done: !!done.connectLinkedin },
    { key: "twitter", done: !!done.connectTwitter },
    { key: "contact", done: !!done.fillEmail && !!done.fillWhatsapp },
    { key: "submitted", done: !!c.submitted_at },
    { key: "review", done: c.status === "approved" || c.status === "rejected", pending: c.status === "pending" && !!c.submitted_at },
    { key: "access", done: c.status === "approved" },
  ];

  const statusPill: Record<Status, { cls: string }> = {
    pending: { cls: "bg-brand-blue/10 text-brand-blue border-brand-blue/30" },
    approved: { cls: "bg-brand-green/10 text-brand-green border-brand-green/30" },
    rejected: { cls: "bg-red-50 text-red-600 border-red-200" },
  };

  const tiers = [
    { rank: 5, label: t("rewards.top5"), icon: <Sparkles size={14} /> },
    { rank: 10, label: t("rewards.top10"), icon: <Trophy size={14} /> },
    { rank: 50, label: t("rewards.top50"), icon: <Award size={14} /> },
    { rank: 100, label: t("rewards.top100"), icon: <Hash size={14} /> },
  ];

  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
    >
      <StageBackground />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-5 py-4 sm:px-6 lg:px-10">
        <Link href="/">
          <Image
            src={BETA_CONFIG.logoUrl}
            alt="AYILand"
            width={200}
            height={200}
            priority
            className="h-10 w-auto sm:h-12 lg:h-14"
          />
        </Link>
        <div className="flex items-center gap-2">
          <span className={"hidden rounded-full border px-3 py-1.5 text-[11px] font-medium tracking-widest sm:inline " + statusPill[c.status].cls}>
            {tStatus(c.status)}
          </span>
          <LangSwitcher />
          <button
            type="button"
            onClick={() => {
              clearEmail();
              setEmail(null);
              setData(null);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-white px-3 py-1.5 text-[11px] font-medium text-text-secondary transition hover:border-border-strong"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">{t("logout")}</span>
          </button>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-5xl gap-5 px-5 pb-12 sm:px-6 lg:grid-cols-[220px_1fr] lg:gap-8 lg:px-10">
        <aside className="hidden lg:flex lg:flex-col lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full max-w-[200px]"
          >
            <AyiMascot pose="presenting" className="w-full" />
          </motion.div>
        </aside>

        <div className="space-y-5">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-border bg-white/80 p-5 backdrop-blur"
            style={{
              boxShadow:
                "0 18px 40px -20px rgba(30,91,168,0.25), inset 0 1px 0 rgba(255,255,255,0.6)",
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-medium tracking-tight">
                  <span className="brand-gradient-text">{welcomeStr}</span>
                </h1>
                <p className="mt-1 text-xs text-text-secondary">{t("yourSpace")}</p>
              </div>
              <span
                className={
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-medium uppercase tracking-widest sm:hidden " +
                  statusPill[c.status].cls
                }
              >
                <Clock size={11} />
                {tStatus(c.status)}
              </span>
            </div>
          </motion.section>

          <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              icon={<Trophy size={14} />}
              label={t("stats.rank")}
              value={data.rank ? `#${data.rank}` : t("stats.unknown")}
              hue="blue"
            />
            <StatCard
              icon={<Zap size={14} />}
              label={t("stats.points")}
              value={(c.xp ?? 0).toString()}
              hue="green"
            />
            <StatCard
              icon={<Users size={14} />}
              label={t("stats.referrals")}
              value={data.referralCount.toString()}
              hue="blue"
            />
            <StatCard
              icon={<Hash size={14} />}
              label={t("stats.spots")}
              value={`${data.approvedCount}/${BETA_CONFIG.totalSpots}`}
              hue="green"
            />
          </section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-border bg-white p-5"
            style={{
              boxShadow:
                "0 18px 40px -20px rgba(30,91,168,0.25), 0 8px 18px -8px rgba(42,157,111,0.15)",
            }}
          >
            <h2 className="text-sm font-medium text-text-primary">{t("roadmap.title")}</h2>
            <ol className="mt-4 space-y-3">
              {roadmap.map((step, i) => (
                <li key={step.key} className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.05, type: "spring", stiffness: 300 }}
                    className={
                      "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-medium " +
                      (step.done
                        ? "brand-gradient-bg text-white"
                        : step.pending
                        ? "border-2 border-brand-blue bg-white text-brand-blue"
                        : "border border-border bg-surface-soft text-text-muted")
                    }
                  >
                    {step.done ? <Check size={13} /> : step.pending ? <Clock size={13} /> : i + 1}
                  </motion.div>
                  <span
                    className={
                      "text-sm " +
                      (step.done
                        ? "text-text-primary"
                        : step.pending
                        ? "font-medium text-brand-blue"
                        : "text-text-muted")
                    }
                  >
                    {t(`roadmap.${step.key}`)}
                  </span>
                </li>
              ))}
            </ol>
          </motion.section>

          {c.ref_code && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl border border-border bg-white p-5"
              style={{
                boxShadow:
                  "0 18px 40px -20px rgba(30,91,168,0.25), 0 8px 18px -8px rgba(42,157,111,0.15)",
              }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium text-text-primary">{t("referral.title")}</h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2 py-0.5 text-[11px] font-medium text-brand-green">
                  <Users size={11} />
                  {data.referralCount}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-text-muted">{t("referral.hint")}</p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 truncate rounded-lg border border-border bg-surface-soft px-3 py-2 text-xs">
                  {refUrl}
                </code>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex items-center gap-1 rounded-lg brand-gradient-bg px-3 py-2 text-xs font-medium text-white"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? tShare("copied") : tShare("copyBtn")}
                </button>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <ShareLink
                  bg="#0a66c2"
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(refUrl)}`}
                  label="LinkedIn"
                  icon={<span className="text-sm font-medium">in</span>}
                />
                <ShareLink
                  bg="#000000"
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent(tShare("twitter"))}&url=${encodeURIComponent(refUrl)}`}
                  label="X"
                  icon={<span className="text-base">𝕏</span>}
                />
                <ShareLink
                  bg="#25D366"
                  href={`https://wa.me/?text=${encodeURIComponent(tShare("whatsapp", { url: refUrl }))}`}
                  label="WhatsApp"
                  icon={<MessageCircle size={14} />}
                />
              </div>
            </motion.section>
          )}

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border border-border bg-white p-5"
            style={{
              boxShadow:
                "0 18px 40px -20px rgba(30,91,168,0.25), 0 8px 18px -8px rgba(42,157,111,0.15)",
            }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-text-primary">{t("rewards.title")}</h2>
              {data.rank && (
                <span className="text-[11px] text-text-secondary">
                  {t("rewards.currentRank")} <b className="text-brand-blue">#{data.rank}</b>
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-text-muted">{t("rewards.subtitle")}</p>
            <ul className="mt-3 space-y-2">
              {tiers.map((tier) => {
                const unlocked = data.rank !== null && data.rank <= tier.rank;
                return (
                  <li
                    key={tier.rank}
                    className={
                      "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm " +
                      (unlocked
                        ? "border-brand-green/40 bg-gradient-to-r from-brand-green/5 to-brand-blue/5"
                        : "border-border bg-surface-soft")
                    }
                  >
                    <span
                      className={
                        "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg " +
                        (unlocked ? "brand-gradient-bg text-white" : "bg-white text-text-muted")
                      }
                    >
                      {tier.icon}
                    </span>
                    <span className="flex-1 text-text-primary">
                      <span className="font-medium">Top {tier.rank}</span>
                      <span className="text-text-secondary"> · {tier.label}</span>
                    </span>
                    {unlocked && <Check size={14} className="text-brand-green" />}
                  </li>
                );
              })}
            </ul>
          </motion.section>
        </div>
      </div>
    </main>
  );
}

function StatCard({
  icon,
  label,
  value,
  hue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hue: "blue" | "green";
}) {
  const grad =
    hue === "blue"
      ? "from-brand-blue/10 to-brand-blue/0 text-brand-blue"
      : "from-brand-green/10 to-brand-green/0 text-brand-green";
  return (
    <div className={`rounded-2xl border border-border bg-gradient-to-br ${grad} p-3 sm:p-4`}>
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-text-secondary">
        {icon}
        {label}
      </p>
      <p className="mt-1.5 text-xl font-medium tabular-nums sm:text-2xl">{value}</p>
    </div>
  );
}

function ShareLink({
  bg,
  href,
  label,
  icon,
}: {
  bg: string;
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium text-white transition hover:opacity-90"
      style={{ background: bg }}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
