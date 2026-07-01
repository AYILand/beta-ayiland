import { Suspense } from "react";
import MeClient from "./MeClient";

export const dynamic = "force-dynamic";

export default function MePage() {
  return (
    <Suspense
      fallback={
        <main
          className="flex min-h-screen items-center justify-center"
          style={{ background: "linear-gradient(135deg, #f0f7ff 0%, #ffffff 45%, #ecfdf5 100%)" }}
        />
      }
    >
      <MeClient />
    </Suspense>
  );
}
