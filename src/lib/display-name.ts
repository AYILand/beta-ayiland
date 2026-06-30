type DisplayMode = "name_initial" | "handle" | "anonymous" | "hidden";

export function leaderboardDisplay(
  mode: DisplayMode,
  handle: string | null | undefined,
  displayName: string | null | undefined,
  refCode: string,
  anonymousAliasTemplate: string,
): string {
  if (mode === "hidden") return "—";
  if (mode === "anonymous") return anonymousAliasTemplate.replace("{code}", refCode);
  if (mode === "handle") return handle ?? `Mystery #${refCode}`;
  if (displayName) return displayName;
  if (!handle) return `Mystery #${refCode}`;
  const cleaned = handle.replace(/[._-]+/g, " ").trim();
  const parts = cleaned.split(/\s+/);
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const last = parts[parts.length - 1];
  const lastInitial = last.charAt(0).toUpperCase();
  return `${first.charAt(0).toUpperCase()}${first.slice(1).toLowerCase()} ${lastInitial}.`;
}
