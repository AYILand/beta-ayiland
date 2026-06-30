"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import {
  Copy,
  Check,
  Mail,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AyiMascot } from "@/components/mascot/AyiMascot";
import { StageBackground } from "@/components/ui/StageBackground";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { BETA_CONFIG } from "@/lib/config";

type DisplayMode = "name_initial" | "handle" | "anonymous" | "hidden";

interface AlreadySubmittedProps {
  email: string;
  refCode: string | null;
  referralCount: number;
  displayMode: DisplayMode;
  linkedinHandle: string | null;
  onNewSession: () => void;
}

export function AlreadySubmitted({
  email,
  refCode,
  referralCount,
  displayMode: initialMode,
  linkedinHandle,
  onNewSession,
}: AlreadySubmittedProps) {
  const t = useTranslations("alreadySubmitted");
  const tShare = useTranslations("share");
  const tLb = useTranslations("leaderboard.displayMode");
  const [displayMode, setDisplayMode] = useState<DisplayMode>(initialMode);
  const [savingMode, setSavingMode] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setDisplayMode(initialMode);
  }, [initialMode]);

  const origin = typeof window !== "undefined" ? window.location.origin : "https://beta.ayiland.app";
  const referralUrl = refCode ? `${origin}/?ref=${refCode}` : origin;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`;
  const twitterUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tShare("twitter"))}&url=${encodeURIComponent(referralUrl)}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(tShare("whatsapp", { url: referralUrl }))}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  async function updateMode(mode: DisplayMode) {
    if (mode === displayMode || savingMode) return;
    setSavingMode(true);
    setDisplayMode(mode);
    try {
      await fetch("/api/candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, displayMode: mode }),
      });
    } catch {
      setDisplayMode(initialMode);
    } finally {
      setSavingMode(false);
    }
  }

  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden"
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
        <LangSwitcher />
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center px-5 pb-10 text-center sm:px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="w-36 sm:w-44"
        >
          <AyiMascot state="celebrating" className="w-full" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl"
        >
          <span className="brand-gradient-text">{t("title")}</span>
        </motion.h1>

        <p className="mt-2 max-w-md text-sm text-text-secondary">{t("subtitle")}</p>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-1.5 text-xs backdrop-blur">
          <Mail size={12} className="text-brand-blue" />
          <span className="text-text-secondary">{t("asEmail")}</span>
          <span className="font-medium text-text-primary">{email}</span>
        </div>

        {refCode && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-6 w-full max-w-lg rounded-2xl border border-border bg-white p-4 text-left sm:p-5"
            style={{
              boxShadow:
                "0 22px 50px -22px rgba(30,91,168,0.3), 0 8px 20px -8px rgba(42,157,111,0.18)",
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-medium uppercase tracking-widest text-brand-blue">
                {tShare("referralLabel")}
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-green/10 px-2 py-0.5 text-[11px] font-medium text-brand-green">
                <Users size={11} />
                {referralCount} {tShare("yourReferrals").toLowerCase()}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 truncate rounded-lg border border-border bg-surface-soft px-3 py-2 text-xs text-text-primary">
                {referralUrl}
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
            <p className="mt-2 text-[11px] text-text-muted">{tShare("referralHint")}</p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#0a66c2] px-3 py-3 text-xs font-medium text-white transition hover:opacity-90"
              >
                <span>in</span>
                <span>LinkedIn</span>
              </a>
              <a
                href={twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-xs font-medium text-white transition hover:opacity-90"
              >
                <span>𝕏</span>
                <span>X</span>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-xs font-medium text-white transition hover:opacity-90"
              >
                <MessageCircle size={14} />
                <span>WhatsApp</span>
              </a>
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mt-4 w-full max-w-lg rounded-2xl border border-border bg-white/70 p-4 text-left backdrop-blur sm:p-5"
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
            <Sparkles size={11} className="-mt-1 mr-1 inline" />
            {tLb("label")}
          </p>
          <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {(["name_initial", "handle", "anonymous", "hidden"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => updateMode(mode)}
                className={
                  "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-xs transition " +
                  (displayMode === mode
                    ? "border-brand-blue bg-brand-blue/5 text-text-primary"
                    : "border-border bg-white text-text-secondary hover:border-border-strong")
                }
              >
                <span
                  className={
                    "h-2 w-2 flex-shrink-0 rounded-full " +
                    (displayMode === mode ? "bg-brand-blue" : "bg-text-muted/30")
                  }
                />
                {tLb(mode)}
              </button>
            ))}
          </div>
        </motion.div>

        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-widest text-text-secondary underline-offset-4 hover:text-brand-blue hover:underline"
          >
            {t("backHome")}
          </Link>
          <span className="hidden text-text-muted sm:inline">·</span>
          <button
            type="button"
            onClick={onNewSession}
            className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-widest text-text-secondary hover:text-brand-blue"
          >
            <RotateCcw size={12} />
            {t("newSession")}
          </button>
        </div>
      </section>
    </main>
  );
}
