"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, MessageCircle, Trophy } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Candidate } from "@/lib/repo";

interface CandidateDrawerProps {
  candidate: Candidate | null;
  onClose: () => void;
}

export function CandidateDrawer({ candidate, onClose }: CandidateDrawerProps) {
  const t = useTranslations("admin.candidate");
  return (
    <AnimatePresence>
      {candidate && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: 480, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 480, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 26 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-y-auto border-l border-border bg-white"
          >
            <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-5 py-4">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
                  {candidate.flow.data.linkedinHandle ?? "—"}
                </p>
                <p className="truncate text-sm font-medium text-text-primary">{candidate.email}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-text-secondary transition hover:border-border-strong"
              >
                <X size={14} />
              </button>
            </header>

            <div className="flex flex-col gap-4 p-5">
              <div className="grid grid-cols-2 gap-3">
                <Metric icon={<Trophy size={14} />} label={t("xp")} value={candidate.flow.xp.toString()} />
                <Metric
                  icon={<Mail size={14} />}
                  label={t("email")}
                  value={candidate.flow.data.email ?? candidate.email}
                />
                <Metric
                  icon={<MessageCircle size={14} />}
                  label={t("whatsapp")}
                  value={candidate.flow.data.whatsapp ?? "—"}
                />
                <Metric
                  icon={<span className="text-[11px] font-medium">in</span>}
                  label={t("linkedin")}
                  value={candidate.flow.data.linkedinHandle ?? "—"}
                />
                <Metric
                  icon={<span className="text-[11px]">𝕏</span>}
                  label={t("twitter")}
                  value={candidate.flow.data.twitterHandle ?? "—"}
                />
                <Metric
                  icon={<span>📅</span>}
                  label={t("submittedAt")}
                  value={candidate.submittedAt ? new Date(candidate.submittedAt).toLocaleString() : "—"}
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <ProofImage label={t("linkedinProof")} src={candidate.flow.data.linkedinProof} />
                <ProofImage label={t("twitterProof")} src={candidate.flow.data.twitterProof} />
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface-soft p-3">
      <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-widest text-text-secondary">
        <span className="text-brand-blue">{icon}</span>
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-text-primary">{value}</p>
    </div>
  );
}

function ProofImage({ label, src }: { label: string; src?: string }) {
  const t = useTranslations("admin.candidate");
  return (
    <div className="rounded-xl border border-border bg-surface-soft p-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-widest text-text-secondary">{label}</p>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={label} className="h-32 w-full rounded-lg object-cover" />
      ) : (
        <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border text-[11px] text-text-muted">
          {t("proofMissing")}
        </div>
      )}
    </div>
  );
}
