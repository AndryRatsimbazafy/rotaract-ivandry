"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { apiWrite } from "@/lib/api";
import { failure } from "@/lib/form-errors";
import { formValues, text, type FormState } from "@/lib/form-state";
import { withNotice } from "@/lib/navigation";

// Réseaux sociaux et textes du site (contracts/api-site-settings.md) : chaque
// formulaire écrit son groupe par un PATCH partiel. Un champ vidé est retiré :
// null, jamais une chaîne vide.
const PAGE = "/site";

const SOCIAL = ["facebook", "instagram"] as const;
const CLUB_TEXT = ["sponsorClub", "meetingPlace", "meetingRhythm"] as const;
const CLUB_NUMBER = ["foundedYear", "memberCount"] as const;
const FAQ = ["qui", "rencontre", "sympathisant", "avant", "membre", "frequence"] as const;

// L'API nomme le champ par son chemin (« social.facebook ») ; le formulaire,
// par son nom seul.
// Traduction : « en.club.sponsorClub » devient « en.sponsorClub ».
function groupFailure(error: unknown, formData: FormData, group: string): FormState {
  const state = failure(error, formValues(formData));
  if (state.fieldErrors) {
    state.fieldErrors = Object.fromEntries(
      Object.entries(state.fieldErrors).map(([field, message]) => [
        field.replace(`en.${group}.`, "en.").replace(`${group}.`, ""),
        message,
      ]),
    );
  }
  return state;
}

// Écrit un groupe et, s'il y en a une, sa traduction anglaise (fonctionnalité 014).
async function save(
  group: string,
  body: Record<string, unknown>,
  formData: FormData,
  en?: Record<string, unknown>,
) {
  try {
    await apiWrite("/admin/site-settings", "PATCH", {
      [group]: body,
      ...(en ? { en: { [group]: en } } : {}),
    });
  } catch (error) {
    return groupFailure(error, formData, group);
  }
  revalidatePath(PAGE);
  redirect(withNotice(PAGE, "modifie"));
}

export async function saveSocial(_previous: FormState, formData: FormData): Promise<FormState> {
  const body: Record<string, string | null> = {};
  for (const key of SOCIAL) {
    body[key] = text(formData, key) || null;
  }
  return save("social", body, formData);
}

export async function saveClub(_previous: FormState, formData: FormData): Promise<FormState> {
  const body: Record<string, string | number | null> = {};
  for (const key of CLUB_TEXT) {
    body[key] = text(formData, key) || null;
  }
  // Un nombre mal saisi est transmis tel quel : l'API le refuse avec son message.
  for (const key of CLUB_NUMBER) {
    const value = text(formData, key);
    body[key] = value === "" ? null : Number.isNaN(Number(value)) ? value : Number(value);
  }
  const en: Record<string, string | null> = {};
  for (const key of CLUB_TEXT) {
    en[key] = text(formData, `en.${key}`) || null;
  }
  return save("club", body, formData, en);
}

export async function saveFaq(_previous: FormState, formData: FormData): Promise<FormState> {
  const body: Record<string, string | null> = {};
  for (const key of FAQ) {
    body[key] = text(formData, key) || null;
  }
  const en: Record<string, string | null> = {};
  for (const key of FAQ) {
    en[key] = text(formData, `en.${key}`) || null;
  }
  return save("faq", body, formData, en);
}
