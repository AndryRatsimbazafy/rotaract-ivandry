# Data Model: Version anglaise

Le français reste la référence ; chaque champ anglais est facultatif, avec les mêmes limites que son équivalent français. Un champ vide n'est pas stocké ; un objet `en` vide non plus.

## Action (`actions`)

| Champ ajouté | Type | Règle |
|---|---|---|
| `en.title` | string | 1 à 120 caractères (comme `title`) |
| `en.summary` | string | 500 au plus (comme `summary`) |
| `en.description` | string | 20 000 au plus (comme `description`) ; paragraphes séparés par une ligne vide |
| `en.impact.objective`, `beneficiaries`, `location`, `period`, `results` | string | 500 au plus chacun (comme l'impact français) |

Les partenaires ne se traduisent pas.

## Actualité (`news`)

| Champ ajouté | Type | Règle |
|---|---|---|
| `en.title` | string | 1 à 120 caractères (comme `title`) |
| `en.summary` | string | 500 au plus |
| `en.content` | string | 20 000 au plus |
| `en.location` | string | 120 au plus |

## Réglages du site (`site_settings`)

| Champ ajouté | Type | Règle |
|---|---|---|
| `en.club.sponsorClub` | string | 120 au plus |
| `en.club.meetingPlace`, `en.club.meetingRhythm` | string | 160 au plus |
| `en.faq.<question>` | string | 1000 au plus ; `<question>` ∈ `FaqQuestion`. Les quatre questions obligatoires en français ne le sont pas en anglais. |

L'année de création et le nombre de membres ne se traduisent pas.

## Image (`MediaRef`, embarquée)

| Champ ajouté | Type | Règle |
|---|---|---|
| `altEn` | string | 1 à 300 caractères |
| `captionEn` | string | 300 au plus |

Le crédit ne se traduit pas.

## Vues

- **Lecture publique** : chaque contenu renvoie `en` avec ses seuls champs présents, ou pas de clé `en` ; une image renvoie `altEn` et `captionEn` s'ils existent.
- **Lecture d'administration** : idem, plus les champs existants.

## Résolution dans le site (`src/data/*`)

| Langue de la page | Champ anglais | Résultat |
|---|---|---|
| `fr` | — | texte français, `lang: "fr"` |
| `en` | présent | texte anglais, `lang: "en"` |
| `en` | absent, français présent | texte français, `lang: "fr"` (passage signalé) |
| `fr` ou `en` | français absent | champ absent |

`Localized = { text: string; lang: "fr" | "en" }` ; `Photo` gagne `altLang` et `captionLang`.

## Relations, états

Inchangés.
