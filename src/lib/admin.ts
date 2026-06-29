"use client";

const AUTH_KEY = "ayiland-admin-auth";
const FALLBACK_PASSWORD = "ayitech2026";

export function adminPassword(): string {
  return process.env.NEXT_PUBLIC_ADMIN_PASSWORD || FALLBACK_PASSWORD;
}

export function loadAdminAuth(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_KEY) === "1";
}

export function setAdminAuth(value: boolean) {
  if (typeof window === "undefined") return;
  if (value) window.localStorage.setItem(AUTH_KEY, "1");
  else window.localStorage.removeItem(AUTH_KEY);
}
