"use client";

const LINKEDIN_CONNECTION =
  process.env.NEXT_PUBLIC_AUTH0_LINKEDIN_CONNECTION ?? "";
const TWITTER_CONNECTION =
  process.env.NEXT_PUBLIC_AUTH0_TWITTER_CONNECTION ?? "";

function buildLoginUrl(opts: { connection: string; locale: string; tag: string }) {
  const returnTo = `/${opts.locale}/apply?connected=${opts.tag}`;
  const params = new URLSearchParams({
    connection: opts.connection,
    returnTo,
    prompt: "login",
  });
  return `/auth/login?${params.toString()}`;
}

export function linkedinLoginUrl(locale: string) {
  return buildLoginUrl({ connection: LINKEDIN_CONNECTION, locale, tag: "linkedin" });
}

export function twitterLoginUrl(locale: string) {
  return buildLoginUrl({ connection: TWITTER_CONNECTION, locale, tag: "twitter" });
}

export const authConfigured = !!(LINKEDIN_CONNECTION && TWITTER_CONNECTION);
