"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Copy, Check, MessageCircle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { Link } from "@/i18n/navigation";
import { AyiMascot } from "@/components/mascot/AyiMascot";
import { StageBackground } from "@/components/ui/StageBackground";
import { BETA_CONFIG } from "@/lib/config";
import { loadEmail } from "@/lib/session";

export default function SuccessPage() {
  const t = useTranslations("success");
  const tShare = useTranslations("share");
  const [refCode, setRefCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const colors = ["#1E5BA8", "#2A9D6F", "#3DB58A", "#3B82C4"];
    const shoot = (origin: { x: number; y: number }) => {
      confetti({
        particleCount: 90,
        spread: 75,
        startVelocity: 45,
        ticks: 220,
        origin,
        colors,
        scalar: 1.1,
      });
    };
    shoot({ x: 0.25, y: 0.55 });
    setTimeout(() => shoot({ x: 0.75, y: 0.55 }), 200);
    setTimeout(() => shoot({ x: 0.5, y: 0.5 }), 500);
  }, []);

  useEffect(() => {
    const email = loadEmail();
    if (!email) return;
    fetch(`/api/candidate?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then(({ candidate }) => {
        if (candidate?.ref_code) setRefCode(candidate.ref_code);
      })
      .catch(() => {});
  }, []);

  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://beta.ayiland.app";
  const shareUrl = refCode ? `${origin}/?ref=${refCode}` : `${origin}/`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  }

  return (
    <main
      className="relative flex min-h-screen flex-col overflow-hidden"
      style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
    >
      <StageBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <Image
          src={BETA_CONFIG.logoUrl}
          alt="AYILand"
          width={200}
          height={200}
          priority
          className="h-12 w-auto sm:h-14"
        />

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="mt-6 w-full max-w-[200px]"
        >
          <AyiMascot state="celebrating" className="w-full" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-4xl font-medium leading-tight tracking-tight text-text-primary sm:text-5xl"
        >
          <span className="brand-gradient-text">{t("title")}</span>
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 max-w-md text-sm text-text-secondary sm:text-base"
        >
          {t("subtitle")}
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 w-full max-w-md rounded-2xl border border-border bg-white p-5"
        >
          <p className="flex items-center justify-center gap-2 text-xs font-medium uppercase tracking-widest text-brand-green">
            <Sparkles size={14} />
            {t("shareTitle")}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 truncate rounded-lg border border-border bg-surface-soft px-3 py-2 text-xs">
              {shareUrl}
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
            <ShareButton
              icon={<span className="text-sm font-medium">in</span>}
              label="LinkedIn"
              bg="#0a66c2"
              href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            />
            <ShareButton
              icon={<span className="text-base">𝕏</span>}
              label="X"
              bg="#000000"
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(tShare("twitter"))}&url=${encodeURIComponent(shareUrl)}`}
            />
            <ShareButton
              icon={<MessageCircle size={16} />}
              label="WhatsApp"
              bg="#25D366"
              href={`https://wa.me/?text=${encodeURIComponent(tShare("whatsapp", { url: shareUrl }))}`}
            />
          </div>
        </motion.div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <Link
            href="/me"
            className="inline-flex items-center gap-1.5 rounded-xl brand-gradient-bg px-5 py-2.5 text-xs font-medium text-white"
            style={{ boxShadow: "0 8px 20px rgba(30,91,168,0.25)" }}
          >
            <Sparkles size={12} />
            Mon tableau de bord →
          </Link>
          <Link
            href="/"
            className="text-xs font-medium uppercase tracking-widest text-text-secondary underline-offset-4 hover:text-brand-blue hover:underline"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </main>
  );
}

function ShareButton({ icon, label, bg, href }: { icon: React.ReactNode; label: string; bg: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-medium text-white transition hover:opacity-90"
      style={{ background: bg }}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
}
