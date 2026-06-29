export const BETA_CONFIG = {
  totalSpots: 500,
  applicationsCloseAt: getApplicationsCloseAt(),
  logoUrl: "https://ayiland.app/logo-ayiland.png",
  social: {
    ayitechLinkedin: "https://www.linkedin.com/company/ayitech",
    ayitechTwitter: "https://x.com/ayitech",
  },
};

function getApplicationsCloseAt() {
  const envValue = process.env.NEXT_PUBLIC_BETA_CLOSE_AT;
  if (envValue) return envValue;
  const fallback = new Date();
  fallback.setUTCDate(fallback.getUTCDate() + 7);
  fallback.setUTCHours(23, 59, 59, 0);
  return fallback.toISOString();
}
