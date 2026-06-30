import { Suspense } from "react";
import ApplyClient from "./ApplyClient";

export const dynamic = "force-dynamic";

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <main
          className="flex min-h-screen items-center justify-center"
          style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
        />
      }
    >
      <ApplyClient />
    </Suspense>
  );
}
