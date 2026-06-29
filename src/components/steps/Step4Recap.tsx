"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Mail, MessageCircle, Sparkles } from "lucide-react";
import { StepCard } from "./StepCard";
import type { FlowState } from "@/lib/flow";

interface Step4Props {
  state: FlowState;
  onSubmit: () => void;
  submitting: boolean;
}

export function Step4Recap({ state, onSubmit, submitting }: Step4Props) {
  const t = useTranslations("steps.step4");

  const rows = [
    { icon: <span className="text-[10px] font-medium">in</span>, label: "LinkedIn", value: state.data.linkedinHandle ?? "—" },
    { icon: <span className="text-sm">𝕏</span>, label: "X", value: state.data.twitterHandle ?? "—" },
    { icon: <Mail size={16} />, label: "Email", value: state.data.email ?? "—" },
    { icon: <MessageCircle size={16} />, label: "WhatsApp", value: state.data.whatsapp ?? "—" },
  ];

  return (
    <StepCard step={4} title={t("title")} desc={t("desc")}>
      <ul className="divide-y divide-border rounded-xl border border-border bg-surface-soft">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-3 px-4 py-3">
            <span className="text-text-secondary">{row.icon}</span>
            <span className="text-[10px] uppercase tracking-widest text-text-secondary">
              {row.label}
            </span>
            <span className="ml-auto truncate text-sm font-medium text-text-primary">
              {row.value}
            </span>
          </li>
        ))}
      </ul>

      <motion.button
        type="button"
        onClick={onSubmit}
        disabled={submitting}
        whileHover={!submitting ? { y: -2 } : undefined}
        whileTap={!submitting ? { scale: 0.97 } : undefined}
        className="relative mt-5 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl brand-gradient-bg px-6 py-4 text-sm font-medium text-white disabled:opacity-70"
        style={{ boxShadow: "0 12px 28px rgba(30,91,168,0.3)" }}
      >
        <Sparkles size={16} />
        <span className="relative z-10">{submitting ? "..." : t("submitBtn")}</span>
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)",
            animation: "ay-shine 2.6s ease-in-out infinite",
          }}
        />
      </motion.button>
    </StepCard>
  );
}
