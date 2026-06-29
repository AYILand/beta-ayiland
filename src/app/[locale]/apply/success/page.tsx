"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { MessageCircle, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { Link } from "@/i18n/navigation";
import { AyiMascot } from "@/components/mascot/AyiMascot";
import { StageBackground } from "@/components/ui/StageBackground";
import { BETA_CONFIG } from "@/lib/config";

export default function SuccessPage() {
  const t = useTranslations("success");

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

  const shareUrl =
    typeof window !== "undefined" ? `${window.location.origin}/` : "https://beta.ayiland.app";
  const shareText = t("shareText");

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
          style={{ height: 64, width: "auto" }}
        />

        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="mt-6 w-full max-w-xs"
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
              href={`https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
            />
            <ShareButton
              icon={<MessageCircle size={16} />}
              label="WhatsApp"
              bg="#25D366"
              href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
            />
          </div>
        </motion.div>

        <Link
          href="/"
          className="mt-8 text-xs font-medium uppercase tracking-widest text-text-secondary underline-offset-4 hover:text-brand-blue hover:underline"
        >
          {t("backHome")}
        </Link>
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
