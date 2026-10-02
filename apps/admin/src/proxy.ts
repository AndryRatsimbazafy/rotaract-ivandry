import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";

// Premier niveau de protection : la seule présence du cookie. La vérification
// réelle est celle de l'API, à chaque lecture et à chaque écriture.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (pathname === "/connexion") {
    return hasSession
      ? NextResponse.redirect(new URL("/", request.url))
      : NextResponse.next();
  }
  if (pathname === "/session/fin") {
    return NextResponse.next();
  }
  if (!hasSession) {
    return NextResponse.redirect(new URL("/connexion", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
