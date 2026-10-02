import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ApiError, apiRaw, SESSION_END_PATH } from "@/lib/api";
import { getSessionToken } from "@/lib/session";

// En-têtes repris de l'API, et aucun autre.
const RELAYED = ["content-type", "content-length", "content-disposition"];

// Relais du CV : l'API renvoie le fichier lui-même, le Back Office le
// transmet tel quel. Aucune adresse de stockage n'existe côté navigateur.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));
  const detail = `/candidatures/${encodeURIComponent(id)}`;

  if (!(await getSessionToken())) {
    return to("/connexion");
  }

  let response: Response;
  try {
    response = await apiRaw(`/admin/applications/${encodeURIComponent(id)}/cv`);
  } catch (error) {
    if (error instanceof ApiError) {
      return to(`${detail}?cv=indisponible`);
    }
    throw error;
  }

  if (response.status === 401) {
    return to(SESSION_END_PATH);
  }
  if (response.status === 403) {
    return to("/acces-refuse");
  }
  if (response.status === 404 || response.status === 400) {
    return to(`${detail}?cv=introuvable`);
  }
  if (!response.ok || !response.body) {
    return to(`${detail}?cv=indisponible`);
  }

  const headers = new Headers({ "Cache-Control": "no-store" });
  for (const name of RELAYED) {
    const value = response.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }
  return new Response(response.body, { status: 200, headers });
}
