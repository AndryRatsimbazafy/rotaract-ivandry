"use server";

import { redirect } from "next/navigation";
import { apiAnonymous } from "@/lib/api";
import { failure } from "@/lib/form-errors";
import { text, type FormState } from "@/lib/form-state";
import { setSession } from "@/lib/session";
import type { LoginResponse } from "@/types/api";

// Connexion : le jeton reçu est rangé dans le cookie de session. Le mot de
// passe n'est jamais renvoyé au formulaire.
export async function login(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = text(formData, "email");
  const password = formData.get("password");
  const values = { email };

  let session: LoginResponse;
  try {
    session = await apiAnonymous<LoginResponse>("/auth/login", "POST", {
      email,
      password: typeof password === "string" ? password : "",
    });
  } catch (error) {
    return failure(error, values);
  }

  await setSession(session.accessToken, session.expiresIn);
  redirect("/");
}
