"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Mail, ArrowRight, RotateCcw } from "lucide-react";
import Image from "next/image";
import { AyiMascot } from "@/components/mascot/AyiMascot";
import { StageBackground } from "@/components/ui/StageBackground";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { BETA_CONFIG } from "@/lib/config";

interface EmailGateProps {
  hasPrevious: boolean;
  initialEmail?: string;
  onSubmit: (email: string, mode: "resume" | "new") => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailGate({ hasPrevious, initialEmail, onSubmit }: EmailGateProps) {
  const t = useTranslations("gate");
  const tErr = useTranslations("errors");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [error, setError] = useState<string | null>(null);

  function submit(mode: "resume" | "new") {
    const trimmed = email.trim().toLowerCase();
    if (!EMAIL_RE.test(trimmed)) {
      setError(tErr("emailInvalid"));
      return;
    }
    setError(null);
    onSubmit(trimmed, mode);
  }

  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
    >
      <StageBackground />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 lg:px-10">
        <Image
          src={BETA_CONFIG.logoUrl}
          alt="AYILand"
          width={200}
          height={200}
          priority
          style={{ height: 56, width: "auto" }}
        />
        <LangSwitcher />
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className="w-40"
        >
          <AyiMascot state="pointing" className="w-full" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 text-3xl font-medium tracking-tight text-text-primary"
        >
          <span className="brand-gradient-text">{t("title")}</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-2 text-sm text-text-secondary"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 w-full"
        >
          <div
            className={
              "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition " +
              (error
                ? "border-red-400"
                : "border-border focus-within:border-brand-blue focus-within:shadow-[0_0_0_3px_rgba(30,91,168,0.08)]")
            }
          >
            <Mail size={18} className="text-text-muted" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit(hasPrevious ? "resume" : "new");
              }}
              placeholder={t("emailPlaceholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
              autoFocus
            />
          </div>
          {error && <p className="mt-1 text-left text-[11px] text-red-600">{error}</p>}

          {hasPrevious && (
            <p className="mt-3 text-xs text-text-secondary">{t("savedHint")}</p>
          )}

          <button
            type="button"
            onClick={() => submit(hasPrevious ? "resume" : "new")}
            className="relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl brand-gradient-bg px-6 py-3.5 text-sm font-medium text-white"
            style={{ boxShadow: "0 12px 28px rgba(30,91,168,0.25)" }}
          >
            <span className="relative z-10">{hasPrevious ? t("resumeBtn") : t("startBtn")}</span>
            <ArrowRight size={16} className="relative z-10" />
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full"
              style={{
                background:
                  "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                animation: "ay-shine 2.8s ease-in-out infinite",
              }}
            />
          </button>

          {hasPrevious && (
            <button
              type="button"
              onClick={() => submit("new")}
              className="mt-2 flex w-full items-center justify-center gap-1 text-xs font-medium text-text-secondary transition hover:text-brand-blue"
            >
              <RotateCcw size={12} />
              {t("newSession")}
            </button>
          )}
        </motion.div>
      </section>
    </main>
  );
}
