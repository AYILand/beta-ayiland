"use client";

import { useTranslations, useLocale } from "next-intl";
import { ExternalLink } from "lucide-react";
import { StepCard } from "./StepCard";
import { SocialConnectButton } from "./SocialConnectButton";
import { ScreenshotUpload } from "@/components/quest/ScreenshotUpload";
import type { FlowState } from "@/lib/flow";
import { POINTS } from "@/lib/flow";
import { BETA_CONFIG } from "@/lib/config";
import { linkedinLoginUrl } from "@/lib/auth-urls";

interface Step1Props {
  state: FlowState;
  onConnect?: () => void;
  onFollowProof: (dataUrl: string) => void;
  onFollowReset: () => void;
}

export function Step1Linkedin({ state, onConnect, onFollowProof, onFollowReset }: Step1Props) {
  const t = useTranslations("steps.step1");
  const locale = useLocale();

  return (
    <StepCard step={1} title={t("title")} desc={t("desc")}>
      <SocialConnectButton
        icon={<span className="text-sm font-medium">in</span>}
        iconBg="#0a66c2"
        label="LinkedIn"
        status={state.done.connectLinkedin ? "connected" : "idle"}
        handle={state.data.linkedinHandle}
        points={POINTS.connectLinkedin}
        href={linkedinLoginUrl(locale)}
        onClick={onConnect}
      />
      {state.done.connectLinkedin && (
        <div className="mt-3 space-y-2">
          <a
            href={BETA_CONFIG.social.ayitechLinkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-brand-blue/40 bg-brand-blue/5 px-3 py-2 text-xs font-medium text-brand-blue transition hover:bg-brand-blue/10"
          >
            <ExternalLink size={13} />
            {t("followBtn")}
          </a>
          <ScreenshotUpload
            initial={state.data.linkedinProof}
            points={POINTS.followLinkedin}
            onUpload={onFollowProof}
            onRemove={onFollowReset}
          />
        </div>
      )}
    </StepCard>
  );
}
