import { NextResponse, type NextRequest } from "next/server";

// Deux langues (fonctionnalité 014). Le français garde ses adresses sans
// préfixe : elles sont réécrites vers /fr, invisible pour le visiteur. Une
// adresse /fr/… est redirigée vers sa forme sans préfixe, pour qu'une page
// n'ait qu'une adresse française. L'anglais vit sous /en.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) {
    return NextResponse.next();
  }

  if (pathname === "/fr" || pathname.startsWith("/fr/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/fr" ? "/" : pathname.slice(3);
    return NextResponse.redirect(url, 308);
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/fr" : `/fr${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Fichiers servis tels quels : ressources de Next.js, images, icône, et tout
  // chemin qui porte une extension.
  matcher: ["/((?!_next|images|icon.png|.*\\..*).*)"],
};
