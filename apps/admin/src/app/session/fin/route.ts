import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { clearSession } from "@/lib/session";

// Fin de session. Un cookie ne peut pas être effacé pendant le rendu d'une
// page : une lecture refusée par l'API passe par ici.
export async function GET(request: NextRequest) {
  await clearSession();
  const target = new URL("/connexion", request.url);
  if (request.nextUrl.searchParams.get("motif") === "expiree") {
    target.searchParams.set("motif", "expiree");
  }
  return NextResponse.redirect(target);
}
