"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";

interface SpeechBubbleProps {
  message: string;
}

export function SpeechBubble({ message }: SpeechBubbleProps) {
  const t = useTranslations("landing.ayi");
  return (
    <div className="relative w-full max-w-xs">
      <AnimatePresence mode="wait">
        <motion.div
          key={message}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="relative rounded-2xl border border-border bg-white px-4 py-3 shadow-[0_10px_28px_rgba(30,91,168,0.08)]"
        >
          <p className="text-[10px] font-medium uppercase tracking-widest text-brand-green">
            {t("name")}
          </p>
          <p className="mt-1 text-sm leading-snug text-text-primary">{message}</p>
          <span
            aria-hidden
            className="absolute -bottom-2 left-8 h-4 w-4 rotate-45 border-b border-r border-border bg-white"
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
