import { cookies } from "next/headers";
import { SESSION_COOKIE } from "./session-cookie";

// La session se réduit à un cookie : le jeton reçu de l'API, hors de portée
// des scripts du navigateur.

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

// Server Action ou Route Handler seulement.
export async function setSession(
  token: string,
  maxAgeSeconds: number,
): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

// Server Action ou Route Handler seulement.
export async function clearSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
