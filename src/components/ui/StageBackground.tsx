export function StageBackground() {
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 15% 25%, rgba(30,91,168,0.10), transparent 45%), radial-gradient(circle at 85% 75%, rgba(42,157,111,0.10), transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(30,91,168,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(30,91,168,0.04) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-10 -left-10 h-60 w-60 rounded-full opacity-25 blur-3xl"
        style={{ background: "#1E5BA8", animation: "ay-orb1 14s ease-in-out infinite" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-10 -right-10 h-60 w-60 rounded-full opacity-25 blur-3xl"
        style={{ background: "#2A9D6F", animation: "ay-orb2 17s ease-in-out infinite" }}
      />
    </>
  );
}
