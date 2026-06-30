"use client";

import { useCallback, useEffect, useState } from "react";
import { initialFlowState, type FlowState } from "./flow";

const EMAIL_KEY = "ayiland-beta-email";
const REF_KEY = "ayiland-beta-ref";
const sessionKey = (email: string) => `ayiland-beta-session-${email.toLowerCase()}`;

export function loadRefCode(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REF_KEY);
}

export function persistRefCode(code: string) {
  if (typeof window === "undefined") return;
  if (!/^[a-z0-9]{6}$/.test(code)) return;
  window.localStorage.setItem(REF_KEY, code.toLowerCase());
}

export function clearRefCode() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(REF_KEY);
}

export function loadEmail(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(EMAIL_KEY);
}

export function persistEmail(email: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(EMAIL_KEY, email);
}

export function clearEmail() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(EMAIL_KEY);
}

export function loadSession(email: string): FlowState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(sessionKey(email));
  if (!raw) return null;
  try {
    return { ...initialFlowState, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function persistSession(email: string, state: FlowState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(sessionKey(email), JSON.stringify(state));
}

export function useSession(email: string | null) {
  const [state, setState] = useState<FlowState>(initialFlowState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (!email) {
      setHydrated(true);
      return;
    }
    const stored = loadSession(email);
    if (stored) {
      setState({ ...stored, data: { ...stored.data, email } });
    } else {
      setState({ ...initialFlowState, data: { email } });
    }
    setHydrated(true);
  }, [email]);

  const update = useCallback(
    (updater: FlowState | ((prev: FlowState) => FlowState)) => {
      setState((prev) => {
        const next = typeof updater === "function" ? (updater as (p: FlowState) => FlowState)(prev) : updater;
        if (email) persistSession(email, next);
        return next;
      });
    },
    [email],
  );

  return { state, update, hydrated };
}
