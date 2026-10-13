# Contrat : Front Office

## Adresses (Q1)

| Française | Anglaise | Route interne |
|---|---|---|
| `/` | `/en` | `app/[lang]/page.tsx` |
| `/actions`, `/actions/<slug>` | `/en/actions`, `/en/actions/<slug>` | `app/[lang]/actions/(liste)`, `[slug]` |
| `/actualites`, `/actualites/<slug>` | `/en/actualites`, `/en/actualites/<slug>` | `app/[lang]/actualites/…` |
| `/membres` | `/en/membres` | `app/[lang]/membres` |
| `/rejoindre` | `/en/rejoindre` | `app/[lang]/rejoindre` |
| `/fr`, `/fr/…` | — | `308` vers l'adresse sans préfixe |
| adresse inconnue | adresse inconnue | `app/[lang]/[...missing]` → `notFound()` → `app/[lang]/not-found.tsx`, `404` |

Requêtes (`?annee=…`) et ancres (`#liste`) sont identiques dans les deux langues.

## `proxy.ts`

| Chemin | Effet |
|---|---|
| commence par `/_next`, `/images`, `/icon.png`, ou contient une extension | ignoré |
| `/en` ou `/en/…` | passe |
| `/fr` ou `/fr/…` | redirection `308` vers le chemin sans `/fr` |
| autre | réécriture interne vers `/fr` + chemin |

## Langue et textes

- `src/lib/locale.ts` : `Lang`, `currentLang()`, `localize(href, lang)`, `switchLanguage(pathname, search, target)`.
- `src/content/fr/*`, `src/content/en/*`, `src/content/index.ts` (`getContent()`).
- `<html lang>` : la langue de la page ; un passage dans l'autre langue porte `lang` sur son élément.
- Sélecteur : dans la une de l'en-tête (à côté des réseaux sociaux) et au bas du menu du téléphone : « FR » et « EN » ; la langue courante a `aria-current="true"` et le filet bleu ; l'autre est un lien vers `switchLanguage(...)`, avec `hrefLang` et `lang`.

## Repère « In French » (DESIGN.md, ajout de R7)

Sur une page anglaise, une seule étiquette « In French » par bloc qui contient un passage français :

| Bloc | Emplacement de l'étiquette |
|---|---|
| Entrée d'une liste d'actions ou d'actualités, ligne du registre | après les métadonnées |
| Page d'une action ou d'une actualité | dans la marge des métadonnées |
| Fiche du club | sous la fiche |
| Question de la FAQ | sous la réponse |

## Formulaire de candidature

`submitApplication(formData, lang)` ; en anglais, tous les messages viennent de `content/en/join.ts` (R10).

## Métadonnées

`alternates.languages` : `{ fr, en, "x-default": fr }` ; `openGraph.locale` : `fr_FR` / `en_GB`.
