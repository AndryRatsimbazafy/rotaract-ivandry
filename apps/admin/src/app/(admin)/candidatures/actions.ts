"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError, apiWrite, isNotFound } from "@/lib/api";
import { failureMessage } from "@/lib/form-errors";
import type { ActionResult } from "@/lib/form-state";
import { safeReturnPath, withNotice } from "@/lib/navigation";

const LIST = "/candidatures";

// Seule écriture possible : la suppression, qui retire aussi le CV. Fichier
// présent ou déjà absent : même issue. Stockage indisponible : la candidature
// est conservée et le message de l'API est rendu, sans redirection.
export async function deleteApplication(
  id: string,
  returnTo: string,
): Promise<ActionResult> {
  const target = safeReturnPath(returnTo, LIST);
  try {
    await apiWrite(`/admin/applications/${id}`, "DELETE");
  } catch (error) {
    if (error instanceof ApiError && isNotFound(error)) {
      revalidatePath(LIST, "layout");
      redirect(withNotice(target, "introuvable"));
    }
    return { message: failureMessage(error) };
  }
  revalidatePath(LIST, "layout");
  redirect(withNotice(target, "supprime"));
}
