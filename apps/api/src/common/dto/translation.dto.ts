import { registerDecorator } from 'class-validator';

// Traductions anglaises (fonctionnalité 014) : champs facultatifs, mêmes
// limites que le français. Une chaîne vide après retrait des espaces vaut
// null : le champ est retiré.

export const trimOrNull = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
};

// Un champ absent est inchangé ; null le retire sans être validé.
export const isSentAndNotNull = (_: object, value: unknown): boolean =>
  value !== undefined && value !== null;

/** « Le titre (anglais) compte 120 caractères au plus. » */
export function englishLengthMessage(label: string, max: number): string {
  return `${label} (anglais) compte ${max} caractères au plus.`;
}

/** Texte anglais de 1 à max caractères (null accepté : retrait). */
export function IsEnglishText(label: string, max: number) {
  return (target: object, propertyName: string) => {
    registerDecorator({
      name: 'isEnglishText',
      target: target.constructor,
      propertyName,
      options: { message: englishLengthMessage(label, max) },
      validator: {
        validate: (value: unknown) =>
          value === null ||
          value === undefined ||
          (typeof value === 'string' &&
            value.length >= 1 &&
            value.length <= max),
      },
    });
  };
}

type Clean<T> = T | undefined;

/**
 * Retire d'une traduction les champs vides et les sous-objets vides ; rend
 * undefined s'il ne reste rien.
 */
export function cleanTranslation<T extends object>(
  value: T | null | undefined,
): Clean<T> {
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const result: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(value)) {
    if (typeof field === 'string') {
      if (field.trim() !== '') {
        result[key] = field;
      }
    } else if (field && typeof field === 'object' && !Array.isArray(field)) {
      const nested = cleanTranslation(field as object);
      if (nested) {
        result[key] = nested;
      }
    }
  }
  return Object.keys(result).length > 0 ? (result as T) : undefined;
}
