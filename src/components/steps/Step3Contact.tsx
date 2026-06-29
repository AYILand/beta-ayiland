"use client";

import { useTranslations } from "next-intl";
import { Mail, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { StepCard } from "./StepCard";
import type { FlowState } from "@/lib/flow";
import { POINTS } from "@/lib/flow";

interface Step3Props {
  state: FlowState;
  onEmail: (email: string) => void;
  onWhatsapp: (number: string) => void;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s]{8,16}$/;

export function Step3Contact({ state, onEmail, onWhatsapp }: Step3Props) {
  const t = useTranslations("steps.step3");
  const tErr = useTranslations("errors");
  const [email, setEmail] = useState(state.data.email ?? "");
  const [phone, setPhone] = useState(state.data.whatsapp ?? "");
  const [emailErr, setEmailErr] = useState<string | null>(null);
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const lastEmail = useRef<string | null>(state.data.email ?? null);
  const lastPhone = useRef<string | null>(state.data.whatsapp ?? null);

  useEffect(() => {
    if (!email) {
      setEmailErr(null);
      return;
    }
    const valid = EMAIL_RE.test(email);
    setEmailErr(valid ? null : tErr("emailInvalid"));
    if (valid && email !== lastEmail.current) {
      lastEmail.current = email;
      onEmail(email);
    }
  }, [email, onEmail, tErr]);

  useEffect(() => {
    if (!phone) {
      setPhoneErr(null);
      return;
    }
    const valid = PHONE_RE.test(phone);
    setPhoneErr(valid ? null : tErr("phoneInvalid"));
    if (valid && phone !== lastPhone.current) {
      lastPhone.current = phone;
      onWhatsapp(phone);
    }
  }, [phone, onWhatsapp, tErr]);

  return (
    <StepCard step={3} title={t("title")} desc={t("desc")}>
      <div className="space-y-3">
        <Field
          icon={<Mail size={18} />}
          label={t("emailLabel")}
          placeholder={t("emailPlaceholder")}
          type="email"
          value={email}
          onChange={setEmail}
          error={emailErr}
          done={!!state.done.fillEmail}
          points={POINTS.fillEmail}
        />
        <Field
          icon={<MessageCircle size={18} />}
          label={t("whatsappLabel")}
          placeholder={t("whatsappPlaceholder")}
          type="tel"
          value={phone}
          onChange={setPhone}
          error={phoneErr}
          done={!!state.done.fillWhatsapp}
          points={POINTS.fillWhatsapp}
        />
      </div>
    </StepCard>
  );
}

interface FieldProps {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  error: string | null;
  done: boolean;
  points: number;
}

function Field({ icon, label, placeholder, type, value, onChange, error, done, points }: FieldProps) {
  return (
    <label className="block">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[10px] font-medium uppercase tracking-widest text-text-secondary">
          {label}
        </span>
        {!done && (
          <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-medium text-brand-blue">
            +{points} XP
          </span>
        )}
      </div>
      <div
        className={
          "flex items-center gap-2 rounded-xl border px-4 py-3 transition " +
          (error
            ? "border-red-400 bg-red-50/60"
            : done
            ? "border-brand-green/40 bg-brand-green/5"
            : "border-border bg-surface-soft focus-within:border-brand-blue focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(30,91,168,0.08)]")
        }
      >
        <span className={done ? "text-brand-green" : "text-text-muted"}>{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>
      {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
    </label>
  );
}
