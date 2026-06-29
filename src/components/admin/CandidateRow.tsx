"use client";

import { motion } from "framer-motion";
import { Check, X, Eye, ExternalLink, ImageIcon, Mail, MessageCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Candidate, CandidateStatus } from "@/lib/repo";

interface CandidateRowProps {
  candidate: Candidate;
  onApprove: () => void;
  onReject: () => void;
  onReset: () => void;
  onView: () => void;
}

export function CandidateRow({ candidate, onApprove, onReject, onReset, onView }: CandidateRowProps) {
  const t = useTranslations("admin");
  const { flow } = candidate;
  const statusPill = STATUS_PILL[candidate.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-white p-3 sm:p-4"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg brand-gradient-bg text-sm font-medium text-white">
          {(flow.data.linkedinHandle ?? candidate.email).slice(0, 2).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium text-text-primary">
              {flow.data.linkedinHandle ?? candidate.email}
            </p>
            <span
              className={
                "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider " + statusPill.cls
              }
            >
              {t(`stats.${statusPill.key}` as "stats.approved")}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-secondary">
            <span className="inline-flex items-center gap-1">
              <Mail size={11} />
              {candidate.email}
            </span>
            {flow.data.whatsapp && (
              <span className="inline-flex items-center gap-1">
                <MessageCircle size={11} />
                {flow.data.whatsapp}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <span className="font-medium text-brand-blue">{flow.xp}</span>
              <span>{t("candidate.xp")}</span>
            </span>
            {candidate.submittedAt && (
              <span>{new Date(candidate.submittedAt).toLocaleDateString()}</span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <ProofChip
              label={t("candidate.linkedin")}
              icon="in"
              bg="#0a66c2"
              handle={flow.data.linkedinHandle}
              hasProof={!!flow.data.linkedinProof}
            />
            <ProofChip
              label={t("candidate.twitter")}
              icon="𝕏"
              bg="#000000"
              handle={flow.data.twitterHandle}
              hasProof={!!flow.data.twitterProof}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onView}
            className="flex h-8 items-center gap-1 rounded-lg border border-border bg-white px-2.5 text-[11px] font-medium text-text-secondary transition hover:border-border-strong"
          >
            <Eye size={13} />
            {t("actions.details")}
          </button>
          {candidate.status !== "approved" && (
            <button
              type="button"
              onClick={onApprove}
              className="flex h-8 items-center gap-1 rounded-lg bg-brand-green px-2.5 text-[11px] font-medium text-white transition hover:opacity-90"
            >
              <Check size={13} />
              {t("actions.approve")}
            </button>
          )}
          {candidate.status !== "rejected" && (
            <button
              type="button"
              onClick={onReject}
              className="flex h-8 items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2.5 text-[11px] font-medium text-red-600 transition hover:border-red-400"
            >
              <X size={13} />
              {t("actions.reject")}
            </button>
          )}
          {candidate.status !== "pending" && (
            <button
              type="button"
              onClick={onReset}
              className="flex h-8 items-center gap-1 rounded-lg border border-border bg-white px-2.5 text-[11px] font-medium text-text-muted transition hover:border-border-strong"
            >
              {t("actions.reset")}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProofChip({
  label,
  icon,
  bg,
  handle,
  hasProof,
}: {
  label: string;
  icon: string;
  bg: string;
  handle?: string;
  hasProof: boolean;
}) {
  if (!handle) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-soft px-2 py-1">
      <span
        className="flex h-4 w-4 items-center justify-center rounded text-[9px] font-medium text-white"
        style={{ background: bg }}
      >
        {icon}
      </span>
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary">{handle}</span>
      {hasProof ? (
        <ImageIcon size={11} className="text-brand-green" />
      ) : (
        <span className="text-red-500">•</span>
      )}
    </span>
  );
}

const STATUS_PILL: Record<CandidateStatus, { cls: string; key: "approved" | "pending" | "rejected" }> = {
  approved: { cls: "bg-brand-green/10 text-brand-green", key: "approved" },
  pending: { cls: "bg-brand-blue/10 text-brand-blue", key: "pending" },
  rejected: { cls: "bg-red-50 text-red-600", key: "rejected" },
};
