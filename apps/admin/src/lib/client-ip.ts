import { isIP } from "node:net";
import { headers } from "next/headers";

// Adresse du visiteur, transmise à l'API pour sa limitation de fréquence : le
// navigateur n'appelle jamais l'API, qui ne verrait sinon que l'adresse de ce
// serveur, commune à tous les visiteurs. L'API ne croit l'en-tête X-Client-Ip
// que s'il est accompagné du secret partagé INTERNAL_API_SECRET (côté serveur
// seulement). Sans secret configuré, rien n'est transmis.
export async function clientIpHeaders(): Promise<Record<string, string>> {
  const secret = process.env.INTERNAL_API_SECRET;
  if (!secret) {
    return {};
  }
  const list = await headers();
  // Hébergeur (Vercel) : le premier élément de X-Forwarded-For est le
  // visiteur ; X-Real-IP en repli.
  const forwarded = list.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || list.get("x-real-ip")?.trim();
  if (!candidate || isIP(candidate) === 0) {
    return {};
  }
  return { "X-Client-Ip": candidate, "X-Internal-Secret": secret };
}
