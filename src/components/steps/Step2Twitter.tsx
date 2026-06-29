"use client";

import { useTranslations, useLocale } from "next-intl";
import { ExternalLink } from "lucide-react";
import { StepCard } from "./StepCard";
import { SocialConnectButton } from "./SocialConnectButton";
import { ScreenshotUpload } from "@/components/quest/ScreenshotUpload";
import type { FlowState } from "@/lib/flow";
import { POINTS } from "@/lib/flow";
import { BETA_CONFIG } from "@/lib/config";
import { twitterLoginUrl } from "@/lib/auth-urls";

interface Step2Props {
  state: FlowState;
  onConnect?: () => void;
  onFollowProof: (file: File) => Promise<void> | void;
  onFollowReset: () => void;
}

export function Step2Twitter({ state, onConnect, onFollowProof, onFollowReset }: Step2Props) {
  const t = useTranslations("steps.step2");
  const locale = useLocale();

  return (
    <StepCard step={2} title={t("title")} desc={t("desc")}>
      <SocialConnectButton
        icon={<span className="text-base font-medium">𝕏</span>}
        iconBg="#000000"
        label="X / Twitter"
        status={state.done.connectTwitter ? "connected" : "idle"}
        handle={state.data.twitterHandle}
        points={POINTS.connectTwitter}
        href={twitterLoginUrl(locale)}
        onClick={onConnect}
      />
      {state.done.connectTwitter && (
        <div className="mt-3 space-y-2">
          <a
            href={BETA_CONFIG.social.ayitechTwitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-brand-blue/40 bg-brand-blue/5 px-3 py-2 text-xs font-medium text-brand-blue transition hover:bg-brand-blue/10"
          >
            <ExternalLink size={13} />
            {t("followBtn")}
          </a>
          <ScreenshotUpload
            initial={state.data.twitterProof}
            points={POINTS.followTwitter}
            onFile={onFollowProof}
            onRemove={onFollowReset}
          />
        </div>
      )}
    </StepCard>
  );
}
