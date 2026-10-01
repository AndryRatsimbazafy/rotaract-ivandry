import type { MembershipApplication } from "@/types/application";

export type SubmissionResult =
  | { ok: true }
  // Le formulaire n'est pas encore relié à l'API : rien n'est transmis.
  | { ok: false; reason: "not-connected" };

/**
 * Envoi d'une candidature. Sera remplacé par l'appel à l'API ; d'ici là, la
 * candidature n'est ni envoyée ni conservée.
 */
export async function submitApplication(
  application: MembershipApplication,
): Promise<SubmissionResult> {
  void application;
  return { ok: false, reason: "not-connected" };
}
