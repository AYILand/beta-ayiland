"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

interface SocialConnectButtonProps {
  icon: ReactNode;
  iconBg: string;
  label: string;
  status: "idle" | "connected";
  handle?: string;
  points: number;
  onClick?: () => void;
  href?: string;
}

export function SocialConnectButton({
  icon,
  iconBg,
  label,
  status,
  handle,
  points,
  onClick,
  href,
}: SocialConnectButtonProps) {
  const connected = status === "connected";
  const Tag = !connected && href ? motion.a : motion.button;
  const tagProps = !connected && href
    ? { href, role: "button" as const }
    : { type: "button" as const, onClick, disabled: connected };

  return (
    <Tag
      {...(tagProps as object)}
      whileHover={!connected ? { y: -2 } : undefined}
      whileTap={!connected ? { scale: 0.98 } : undefined}
      className={
        "group relative flex w-full items-center gap-3 overflow-hidden rounded-xl border p-4 text-left transition " +
        (connected
          ? "border-brand-green/40 bg-gradient-to-r from-brand-green/5 to-brand-blue/5"
          : "border-border bg-white hover:border-brand-blue hover:shadow-[0_10px_24px_rgba(30,91,168,0.12)]")
      }
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-medium text-white"
        style={{ background: iconBg }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
          {label}
        </p>
        <p className="truncate text-sm font-medium text-text-primary">
          {connected ? (handle ?? "Connecté") : `+${points} XP`}
        </p>
      </div>
      {connected ? (
        <motion.div
          initial={{ scale: 0, rotate: -60 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 14 }}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-green text-white"
        >
          <Check size={14} />
        </motion.div>
      ) : (
        <ArrowRight size={16} className="text-text-muted transition group-hover:translate-x-1 group-hover:text-brand-blue" />
      )}
      {!connected && (
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full opacity-0 transition group-hover:opacity-100"
          style={{
            background:
              "linear-gradient(120deg, transparent 30%, rgba(30,91,168,0.06) 50%, transparent 70%)",
            animation: "ay-shine 2.4s ease-in-out infinite",
          }}
        />
      )}
    </Tag>
  );
}
