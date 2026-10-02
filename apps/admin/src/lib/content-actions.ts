import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiWrite, isNotFound } from "./api";
import { failureMessage } from "./form-errors";
import type { ActionResult } from "./form-state";
import { safeReturnPath, withNotice } from "./navigation";

// Opérations identiques pour les actions et les actualités : publication et
// suppression. base : « /actions » ou « /actualites » ; api : la ressource.

export const SLUG_TAKEN = "Ce slug est déjà utilisé.";

export function goneToList(error: unknown, base: string, returnTo: string): void {
  if (error instanceof ApiError && isNotFound(error)) {
    revalidatePath(base, "layout");
    redirect(withNotice(returnTo, "introuvable"));
  }
}

export async function setPublished(
  base: string,
  api: string,
  id: string,
  isPublished: boolean,
  returnTo: string,
): Promise<ActionResult> {
  const target = safeReturnPath(returnTo, base);
  try {
    await apiWrite(`${api}/${id}`, "PATCH", { isPublished });
  } catch (error) {
    goneToList(error, base, target);
    return { message: failureMessage(error) };
  }
  revalidatePath(base, "layout");
  redirect(withNotice(target, isPublished ? "publie" : "depublie"));
}

export async function remove(
  base: string,
  api: string,
  id: string,
  returnTo: string,
): Promise<ActionResult> {
  const target = safeReturnPath(returnTo, base);
  try {
    await apiWrite(`${api}/${id}`, "DELETE");
  } catch (error) {
    goneToList(error, base, target);
    return { message: failureMessage(error) };
  }
  revalidatePath(base, "layout");
  redirect(withNotice(target, "supprime"));
}
