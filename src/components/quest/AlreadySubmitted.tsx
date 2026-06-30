"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Mail, MessageCircle, RotateCcw, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AyiMascot } from "@/components/mascot/AyiMascot";
import { StageBackground } from "@/components/ui/StageBackground";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { BETA_CONFIG } from "@/lib/config";

interface AlreadySubmittedProps {
  email: string;
  onNewSession: () => void;
}

export function AlreadySubmitted({ email, onNewSession }: AlreadySubmittedProps) {
  const t = useTranslations("alreadySubmitted");

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/` : "https://beta.ayiland.app";
  const shareText = t("shareText");

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
            className="h-10 sm:h-14 lg:h-16"
            style={{ width: "auto", height: "auto" }}
          />
        </Link>
        <LangSwitcher />
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 pb-10 text-center sm:px-6">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateY: -30 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 18 }}
          className="w-40 sm:w-48"
          style={{ perspective: 800 }}
        >
          <AyiMascot state="celebrating" className="w-full" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl"
        >
          <span className="brand-gradient-text">{t("title")}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 max-w-md text-sm text-text-secondary sm:text-base"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-white/70 px-4 py-2 text-xs backdrop-blur sm:text-sm"
        >
          <Mail size={13} className="text-brand-blue" />
          <span className="text-text-secondary">{t("asEmail")}</span>
          <span className="font-medium text-text-primary">{email}</span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-5 max-w-md text-xs text-text-muted sm:text-sm"
        >
          {t("body")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-7 w-full max-w-md rounded-2xl border border-border bg-white p-4 sm:p-5"
          style={{
            boxShadow:
              "0 22px 50px -22px rgba(30,91,168,0.3), 0 8px 20px -8px rgba(42,157,111,0.18)",
          }}
        >
          <p className="flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-widest text-brand-green sm:text-xs">
            <Sparkles size={13} />
            {t("shareTitle")}
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <a
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#0a66c2] px-3 py-3 text-xs font-medium text-white transition hover:opacity-90"
            >
              <span>in</span>
              <span>LinkedIn</span>
            </a>
            <a
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-black px-3 py-3 text-xs font-medium text-white transition hover:opacity-90"
            >
              <span>𝕏</span>
              <span>X</span>
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-3 text-xs font-medium text-white transition hover:opacity-90"
            >
              <MessageCircle size={14} />
              <span>WhatsApp</span>
            </a>
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
