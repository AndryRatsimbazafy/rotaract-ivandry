import type { Action } from "@/types/action";

// Aucune action n'est encore publiée. Cette fonction sera remplacée par un
// appel à l'API sans que les pages aient à changer.
export async function getLatestActions(limit: number): Promise<Action[]> {
  const actions: Action[] = [];
  return actions.slice(0, limit);
}
