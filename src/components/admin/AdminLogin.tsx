"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, ArrowRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { AyiMascot } from "@/components/mascot/AyiMascot";
import { StageBackground } from "@/components/ui/StageBackground";
import { LangSwitcher } from "@/components/ui/LangSwitcher";
import { BETA_CONFIG } from "@/lib/config";
import { adminPassword } from "@/lib/admin";

interface AdminLoginProps {
  onAuth: () => void;
}

export function AdminLogin({ onAuth }: AdminLoginProps) {
  const t = useTranslations("admin");
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  function submit() {
    if (value === adminPassword()) {
      setError(false);
      if (typeof window !== "undefined") {
        window.localStorage.setItem("ayiland-admin-password", value);
      }
      onAuth();
    } else {
      setError(true);
    }
  }

  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
    >
      <StageBackground />

      <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 lg:px-10">
        <Image src={BETA_CONFIG.logoUrl} alt="AYILand" width={200} height={200} priority style={{ height: 56, width: "auto" }} />
        <LangSwitcher />
      </header>

      <section className="relative z-10 mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 pb-10 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-36">
          <AyiMascot pose="detective" className="w-full" />
        </motion.div>

        <h1 className="mt-2 text-3xl font-medium tracking-tight">
          <span className="brand-gradient-text">{t("loginTitle")}</span>
        </h1>
        <p className="mt-2 text-sm text-text-secondary">{t("loginSubtitle")}</p>

        <div className="mt-6 w-full">
          <div
            className={
              "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition " +
              (error
                ? "border-red-400"
                : "border-border focus-within:border-brand-blue focus-within:shadow-[0_0_0_3px_rgba(30,91,168,0.08)]")
            }
          >
            <Lock size={18} className="text-text-muted" />
            <input
              type="password"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
              placeholder={t("passwordPlaceholder")}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
              autoFocus
            />
          </div>
          {error && <p className="mt-1 text-left text-[11px] text-red-600">{t("wrongPassword")}</p>}

          <button
            type="button"
            onClick={submit}
            className="relative mt-4 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl brand-gradient-bg px-6 py-3.5 text-sm font-medium text-white"
            style={{ boxShadow: "0 12px 28px rgba(30,91,168,0.25)" }}
          >
            <span className="relative z-10">{t("loginBtn")}</span>
            <ArrowRight size={16} className="relative z-10" />
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full"
              style={{
                background: "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
                animation: "ay-shine 2.8s ease-in-out infinite",
              }}
            />
          </button>
        </div>
      </section>
    </main>
  );
}
