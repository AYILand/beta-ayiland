import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { auth0 } from "./lib/auth0";

const intl = createIntlMiddleware(routing);

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/auth")) {
    return auth0.middleware(req);
  }
  return intl(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
