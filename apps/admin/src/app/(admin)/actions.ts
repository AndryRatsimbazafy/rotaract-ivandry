"use server";

import { redirect } from "next/navigation";
import { clearSession } from "@/lib/session";

// Déconnexion : le jeton est sans état, il suffit d'effacer le cookie.
export async function logout(): Promise<void> {
  await clearSession();
  redirect("/connexion");
}
