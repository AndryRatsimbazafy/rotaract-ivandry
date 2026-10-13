# Implementation Plan: Version anglaise

**Branch**: `014-english-version` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/014-english-version/spec.md`

## Summary

Le site public existe en français à ses adresses actuelles et en anglais sous `/en`, l'adresse anglaise étant l'adresse française précédée de `/en` (Q1).

- **Site** :
  - toutes les routes passent sous `app/[lang]/` ;
  - un `proxy.ts` réécrit les adresses sans préfixe vers le français ;
  - les textes fixes vivent dans deux dictionnaires de même forme (`content/fr`, `content/en`), lus par `next/root-params` ;
  - les contenus saisis se résolvent champ par champ, avec repli sur le français signalé (`lang="fr"` et l'étiquette « In French »).
- **API** : un objet `en` facultatif sur les actions, les actualités et les réglages du site, et `altEn` / `captionEn` sur chaque image, en lecture comme en écriture.
- **Back Office** : une section « English (facultatif) » dans les formulaires d'action et d'actualité, deux champs dans le panneau image, des champs anglais dans l'écran « Site ». L'interface reste en français.

**Aucune dépendance, aucune variable d'environnement.** Décisions : [research.md](./research.md) (R1 à R12).

## Technical Context

**Language/Version**: TypeScript ; Node 22 ; NestJS (API, TypeScript 6) ; Next.js 16.3 (Front Office et Back Office, TypeScript 5).

**Primary Dependencies**: aucune nouvelle. `next/root-params` (stable en 16.3), `proxy.ts`, `Intl.DateTimeFormat`.

**Storage**: MongoDB (sous-documents `en`, champs `altEn` et `captionEn`) ; aucune migration : les champs sont facultatifs.

**Testing**: aucun test automatisé (principe IX). [quickstart.md](./quickstart.md), `npm run lint`, `npm run build`.

**Target Platform**: Linux en local ; plus tard Vercel et Render.

**Project Type**: monorepo web ; les trois applications changent.

**Performance Goals**: une seule entrée de cache par contenu pour les deux langues ; pages anglaises aussi rapides que les françaises.

**Constraints**:
- adresses françaises inchangées (SC-005) ;
- français identique hormis le sélecteur (SC-006) ;
- rien d'inventé, aucune traduction automatique ;
- documents de référence corrigés d'abord.

**Scale/Scope**: environ 60 fichiers du site (déplacement sous `[lang]`, sections qui lisent `getContent()`), 7 dictionnaires anglais, 4 modèles de l'API, 4 formulaires du Back Office.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Les décisions levées (« French only », « version anglaise hors périmètre », « solution d'internationalisation repoussée ») et les nouvelles règles (adresses, repère « In French », typographie anglaise, champs `en`) sont écrites dans `CLAUDE.md`, `PROJECT_CONTEXT.md`, `ARCHITECTURE.md` et `DESIGN.md` **avant** le code (section A). | Conforme |
| II. Étapes validées | Spec et clarification Q1 closes le 2026-10-13 ; demande explicite du porteur du projet. Ce plan s'arrête à la phase 1. | Conforme |
| III. Préférence pour le manuel | Aucun script ; les traductions sont saisies par le club. | Conforme |
| IV. Simplicité technique | Mécanismes natifs de Next 16 (`[lang]`, `proxy.ts`, `next/root-params`) au lieu d'une bibliothèque d'internationalisation ; dictionnaires TypeScript typés ; un objet `en` plutôt qu'une collection de traductions. | Conforme |
| V. Architecture backend | Aucune route nouvelle ; champs facultatifs ; validation et messages comme l'existant ; gardes inchangées. | Conforme |
| VI. Intégrité du modèle métier | Action et actualité restent distinctes ; le français reste la référence ; un contenu sans français n'existe pas en anglais. | Conforme |
| VII. Front Office | `DESIGN.md` complété (repère « In French », sélecteur, typographie anglaise) ; compositions inchangées et vérifiées avec des textes anglais longs. | Conforme, sous réserve de validation de R7 et R8 |
| VIII. Qualité et contenu | Rien d'inventé ; repli visible et déclaré. | Conforme |
| IX. Tests | Aucun. | Conforme |
| X. Outillage | npm ; `node_modules` par application. | Conforme |
| XI. Git | Branche `014-english-version` créée par Spec Kit ; aucun commit sans demande. | Conforme |
| XII. Non-régression | Décision existante levée explicitement par le porteur du projet ; quickstart, section 0. | Conforme |

**Résultat de la porte** : passée. **Re-vérification après la phase 1** : inchangée.

**Écarts assumés** :
- **Restructuration du site** : tout `app/` passe sous `app/[lang]/` et `content/` se divise en `content/fr` et `content/en`. C'est imposé par l'internationalisation des adresses (R1, R2). Les adresses publiques ne changent pas.
- **Les sections deviennent asynchrones** pour lire leur dictionnaire (R2) ; leur rendu ne change pas.

## A. Alignements des documents de référence

**À appliquer après validation de ce plan, avant tout code :**

| Document | Changement |
|---|---|
| `CLAUDE.md` | « Public UI is French only for v1… » remplacé par : site en français et en anglais (`/en`), Back Office en français ; `content/fr` et `content/en` ; `app/[lang]` et `proxy.ts` |
| `PROJECT_CONTEXT.md` | Section 9 : retirer « solution d'internationalisation » ; section 10 : retirer « version anglaise » du hors périmètre ; état du Front Office |
| `ARCHITECTURE.md` | Section 1 : champs `en` (action, actualité, réglages) ; section 2 : `altEn`, `captionEn` ; section 6 : les corps acceptent `en` ; section 10 : sous-section « Deux langues » (adresses, `proxy.ts`, dictionnaires, résolution et repli) ; section 11 : section « English » des formulaires ; section 14 : décision 22 ; section 15 : étape 13 |
| `DESIGN.md` | Section 4 : « Typographie anglaise » (R8) ; section 9 : ligne « Sélecteur de langue » ; section 8 : « Mention de langue » (R7) ; « Portée » : le français et l'anglais |
| `apps/admin/DESIGN.md` | Section Components : « Section English » |

Textes proposés pour `DESIGN.md` :

> **Sélecteur de langue** (section 9) : dans la une, à droite, avant les réseaux sociaux, et au bas du sommaire du téléphone : « FR · EN » en étiquettes. La langue courante est en encre, soulignée d'un filet bleu de 2 px ; l'autre est un lien en Charcoal. Il mène à la même page dans l'autre langue.

> **Mention de langue** (section 8) : sur une page anglaise, un bloc qui contient un passage français (action, actualité, fiche du club, question de la FAQ) porte une fois l'étiquette « In French », en Charcoal, en bord de bloc. Pas d'icône, pas de couleur, pas de drapeau. Le passage reste lisible tel quel.

> **Typographie anglaise** (section 4) : guillemets “ ” et ‘ ’ ; aucune espace avant `; : ! ?` ; apostrophe typographique ; dates « 14 March 2026 » ; majuscule au premier mot seulement dans les titres et les étiquettes, comme en français.

**À faire en fin d'implémentation** : `ARCHITECTURE.md` (en-tête), `PROJECT_CONTEXT.md` (état, « Fait », structure `src/`), ligne d'état de `CLAUDE.md`, le guide publié (traductions, sélecteur).

## B. Conception

### B1. API (`apps/api`)

1. `common/schemas/media-ref.schema.ts` : `altEn`, `captionEn` ; `toAdminImage` et `toPublicImage` les renvoient s'ils existent.
2. `common/dto/image-fields.dto.ts` : `altEn`, `captionEn` dans `ImageFieldsDto` (envoi) et `UpdateImageFieldsDto` (`null` retire) ; `media/content-images.ts` : `storeImage` et `imageFieldsUpdate` les prennent en compte.
3. `common/dto/translation.dto.ts` (nouveau) : transformation commune (espaces retirés, vide → `null`) et validateur de longueur avec le message « (anglais) ».
4. Actions : sous-schéma `en` (`title`, `summary`, `description`, `impact`) ; DTO `ActionEnDto` dans la création et la modification ; service : écriture en chemins pointés, vues publiques et d'administration avec `en`.
5. Actualités : sous-schéma `en` (`title`, `summary`, `content`, `location`) ; DTO, service et vues de même.
6. Réglages du site : `en.club`, `en.faq` dans le schéma, `UpdateSiteSettingsDto.en`, `update()` (chemins `en.club.*`, `en.faq.*`) et les vues.

### B2. Back Office (`apps/admin`)

1. Types : `en` dans `Action`, `News`, `SiteSettings` ; `altEn`, `captionEn` dans `AdminImage`.
2. `ActionForm`, `NewsForm` : section « English (facultatif) » ; leurs actions serveur envoient `en`.
3. `ImageSheet` et `lib/image-forms.ts` : deux champs, relayés à l'envoi et au `PATCH`.
4. `site/_components/ClubForm.tsx`, `FaqForm.tsx` et `site/actions.ts` : champs anglais, envoyés dans `en`.
5. `apps/admin/DESIGN.md` : « Section English ».

### B3. Front Office (`apps/web`)

1. **Routes** (R1) : déplacer tout `app/` (hors `globals.css`, `tokens.css`, `icon.png`) sous `app/[lang]/` ; `layout.tsx` y pose `<html lang>` et vérifie `lang` ; `app/[lang]/[...missing]/page.tsx` ; `src/proxy.ts`.
2. **Langue** (R3) : `lib/locale.ts`.
3. **Dictionnaires** (R2) : déplacer `content/*.ts` vers `content/fr/` ; écrire `content/en/` ; `content/index.ts` (`getContent()`).
4. **Sections** : remplacer les imports de `@/content/...` par `await getContent()` ; passer les liens par `localize` ; les composants client reçoivent textes et langue.
5. **Dates** (R4) : `lib/dates.ts` prend la langue.
6. **Données** (R5, R6) : types `Localized`, `Photo.altLang` et `captionLang` ; `data/actions.ts`, `news.ts`, `site-settings.ts`, `members.ts` (portraits), `media.ts` résolvent selon `currentLang()`.
7. **Repère et `lang`** (R7) : petit composant `components/ui/LangMark.tsx` (étiquette « In French ») ; `lang` sur les éléments des passages français ; `PhotoFrame` pose `lang` sur l'image et la légende.
8. **Sélecteur** : `components/layout/LanguageSwitch.tsx` (client, `usePathname` et `useSearchParams`) dans `SiteHeader` et `MobileMenu`.
9. **Métadonnées** (R9) : `generateMetadata` des pages et de la mise en page : `alternates.languages`, `openGraph.locale`, textes du dictionnaire.
10. **Candidature** (R10) : `data/applications.ts` (`submitApplication(formData, lang)`), `ApplicationForm`.

### B4. Ordre de réalisation

Documents (section A) ; API (B1, vérifiée par `curl`) ; Back Office (B2) ; site : routes, `proxy.ts` et langue en premier (B3.1 à B3.2, contrôle de non-régression française), puis dictionnaires et sections, puis données et repère, puis sélecteur, métadonnées et candidature ; documentation de fin.

## Project Structure

### Documentation (this feature)

```text
specs/014-english-version/
├── spec.md
├── plan.md                 # ce fichier
├── research.md             # R1 à R12
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-translations.md
│   ├── front-office.md
│   └── admin-screens.md
├── checklists/requirements.md
└── tasks.md                # /speckit-tasks
```

### Source Code (repository root)

```text
apps/api/src/
├── common/schemas/media-ref.schema.ts, common/dto/image-fields.dto.ts, common/dto/translation.dto.ts (nouveau)
├── media/content-images.ts
├── actions/   schemas/action.schema.ts, dto/*, actions.service.ts
├── news/      schemas/news.schema.ts, dto/*, news.service.ts
└── site-settings/  schemas/site-settings.schema.ts, dto/update-site-settings.dto.ts, site-settings.service.ts

apps/admin/src/
├── types/       action.ts, news.ts, media.ts, site-settings.ts
├── lib/         image-forms.ts
├── components/  ImageSheet.tsx
└── app/(admin)/ actions/ (ActionForm, actions.ts), actualites/ (NewsForm, actions.ts), site/ (ClubForm, FaqForm, actions.ts)

apps/web/src/
├── proxy.ts                                   (nouveau)
├── app/
│   ├── globals.css, tokens.css, icon.png      (restent)
│   └── [lang]/                                (tout le reste, déplacé)
│       ├── layout.tsx, page.tsx, not-found.tsx, error.tsx, [...missing]/page.tsx
│       ├── _sections/, actions/, actualites/, membres/, rejoindre/
├── content/  fr/*.ts (déplacés), en/*.ts (nouveaux), index.ts (nouveau)
├── lib/      locale.ts (nouveau), dates.ts
├── data/     actions.ts, news.ts, members.ts, media.ts, site-settings.ts, applications.ts
├── types/    action.ts, news.ts, media.ts, site-settings.ts, locale.ts (nouveau)
└── components/ layout/LanguageSwitch.tsx (nouveau), ui/LangMark.tsx (nouveau), media/PhotoFrame.tsx, layout/*
```

**Structure Decision** : la structure de chaque application est gardée ; seul `apps/web` se réorganise sous `[lang]` et `content/{fr,en}`, comme le guide d'internationalisation de Next 16 le décrit.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| Déplacement de tout `app/` sous `[lang]` | `<html lang>` et toutes les pages dépendent de la langue | Une arborescence `app/en/` doublerait chaque page |
| Sections rendues asynchrones | Lecture du dictionnaire par `next/root-params` | Faire descendre `lang` en propriété toucherait encore plus de fichiers |
