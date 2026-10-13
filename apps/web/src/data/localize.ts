import type { Lang } from "@/lib/locale";

// Choix de la langue d'un champ saisi (fonctionnalité 014). Le français est
// la référence : un champ français absent reste absent, même traduit. Sur une
// page anglaise, sans traduction, le texte français est gardé et signalé.

export interface Picked {
  value?: string;
  /** Vrai quand une page anglaise affiche le texte français. */
  french: boolean;
}

export function pick(fr: string | undefined, en: string | undefined, lang: Lang): Picked {
  if (!fr) return { value: undefined, french: false };
  if (lang === "en" && en) return { value: en, french: false };
  return { value: fr, french: lang === "en" };
}

/** Accumule les champs affichés en français : « french.title = true ». */
export function picker<K extends string>(lang: Lang) {
  const french: Partial<Record<K, true>> = {};
  return {
    french,
    take(key: K, fr: string | undefined, en: string | undefined) {
      const picked = pick(fr, en, lang);
      if (picked.french) french[key] = true;
      return picked.value;
    },
  };
}
