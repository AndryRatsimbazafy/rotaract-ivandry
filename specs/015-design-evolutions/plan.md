# Implementation Plan: Évolutions design du site public

**Branch**: `015-design-evolutions` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/015-design-evolutions/spec.md`

## Summary

Cinq évolutions du site public, chacune livrable seule.
1. **Images de partage** composées par `opengraph-image.tsx` (`next/og`, fourni avec Next.js) : photographie voilée, trait d'or, titre en blanc, logo, dans la langue de l'adresse.
2. **Galerie plein écran** sur les pages de détail : `<dialog>` natif et piste en défilement accroché, donc balayage natif, clavier et annonces.
3. **Page `/club`**, sixième entrée de navigation : histoire saisie dans le Back Office, lien Rotaract–Rotary, chiffres réels, ouverture sur l'emplacement `club-ouverture`.
4. **Frise des années** sur `/club` : présidents tirés des mandats et actions cochées « marquante », trois au plus par année.
5. **Finitions téléphone** : `theme-color`, zones de l'encoche, appui tactile, champs à 16 px.

Côté API : `highlighted` sur Action, avec la règle des trois par année, `history` et `en.history` dans les réglages, et le huitième emplacement photographique. Aucune dépendance npm ; un fichier de police versionné pour les images de partage.

## Technical Context

**Language/Version**: TypeScript 5 (web, admin, Next.js 16.3, React 19) ; TypeScript 6 (api, NestJS 11) ; Node 22

**Primary Dependencies**: existantes. `next/og` (`ImageResponse`, inclus dans Next.js) pour les images de partage ; aucune bibliothèque de visionneuse ni de geste.

**Storage**: MongoDB Atlas (Mongoose) : `actions.highlighted`, `site_settings.history`, `site_settings.en.history`, `site_settings.photos.club-ouverture` ; Cloudinary derrière `StorageService` pour la nouvelle photographie fixe.

**Testing**: aucun test automatisé (constitution, principe IX) ; vérifications manuelles de [quickstart.md](./quickstart.md), `npm run lint`, `npm run build`.

**Target Platform**: navigateurs récents (bureau et téléphone : iOS Safari 16+, Chrome Android) ; robots d'aperçu de liens (Facebook, WhatsApp, Instagram en message).

**Project Type**: monorepo web : Front Office Next.js, Back Office Next.js, API NestJS.

**Performance Goals**: galerie ouverte en moins d'une seconde (SC-003) ; image de partage servie depuis le cache dans la fenêtre de revalidation, et composée en moins de deux secondes sinon. Pas de régression des objectifs de `DESIGN.md`, section 14 (contenu principal en moins de 2,5 s, décalage inférieur à 0,1).

**Constraints**: `DESIGN.md` (Voile, texte sur image, mouvement, aucun compteur animé, pas de grille de cartes) ; aucune dépendance de design (décision verrouillée 13) ; deux langues (014) ; le Front Office ne connaît pas le fournisseur de stockage ; rien d'inventé.

**Scale/Scope**: une dizaine d'années Rotary, quelques dizaines d'actions, 20 photographies au plus par contenu ; une nouvelle page, huit fichiers d'image de partage, un composant de galerie, trois champs de données.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Application | Statut |
|---|---|---|
| I. Source de vérité | `DESIGN.md`, `ARCHITECTURE.md`, `PROJECT_CONTEXT.md`, `CLAUDE.md` mis à jour avant le code (research R7). Contradiction signalée : image de partage et section 7 de `DESIGN.md` (« aucune image générée »), résolue par une précision à valider. | Conforme, sous réserve de validation de la précision |
| II. Étapes validées | Spec et clarifications validées ; ce plan attend validation avant `/speckit-tasks`. | Conforme |
| III. Préférence pour le manuel | Aucune automatisation. La règle des trois actions marquantes est une validation métier, pas une automatisation. | Conforme |
| IV. Simplicité technique | Conventions natives de Next.js (`opengraph-image`, `viewport`), éléments natifs (`<dialog>`, défilement accroché) ; pas de nouvelle route publique (la frise réutilise `/members`). Un fichier de police `.ttf` versionné : un fichier, pas une dépendance, nécessaire parce qu'`ImageResponse` ne lit pas le `woff2` de `next/font`. | Conforme |
| V. Architecture backend | Champs ajoutés aux modules `actions` et `site-settings` ; nouvel emplacement par `StorageService` ; `/admin/*` inchangé côté sécurité. | Conforme |
| VI. Intégrité du modèle | Présidents lus dans les mandats (`roles`), jamais sur le membre ; une action garde une seule année Rotary explicite. | Conforme |
| VII. Front Office | Compositions éditoriales décrites dans `DESIGN.md` avant le code ; frise en filet et années au trait, sans cartes. **Écart documentaire préexistant** : le principe dit encore « Le Front Office reste en français pour la V1 », alors que 014 a été validée. L'amendement relève de `/speckit-constitution`, à la demande du porteur du projet ; 015 ne l'aggrave pas. | Conforme ; amendement de VII à planifier |
| VIII. Qualité et contenu | Chiffres clés réels seulement ; histoire saisie par le club, absente sinon ; aucun texte de substitution. | Conforme |
| IX. Tests | Aucun test automatisé. | Conforme |
| X. Outillage | Rien d'ajouté à l'outillage ni au monorepo. | Conforme |
| XI. Git | Branche créée par Spec Kit à la demande ; aucun commit sans demande. | Conforme |
| XII. Non-régression | Pages existantes inchangées hormis FR-025 ; `shareImages()` remplacé par la convention de fichier, qui couvre les mêmes pages et plus. | Conforme |

**Re-check après la phase 1** : le modèle de données, les contrats et le quickstart ne créent aucun écart nouveau.

## Project Structure

### Documentation (this feature)

```text
specs/015-design-evolutions/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api.md
│   ├── front-office.md
│   └── admin-screens.md
├── checklists/requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
apps/api/src/
├── actions/
│   ├── schemas/action.schema.ts           # highlighted
│   ├── dto/create-action.dto.ts           # highlighted (IsBoolean)
│   ├── dto/update-action.dto.ts
│   └── actions.service.ts                 # vues + règle des trois par année
├── site-settings/
│   ├── schemas/site-settings.schema.ts    # history, en.history
│   ├── dto/update-site-settings.dto.ts    # groupe history, en.history
│   └── site-settings.service.ts
└── common/enums/site-photo-slot.enum.ts   # club-ouverture

apps/admin/src/
├── app/(admin)/actions/_components/ActionForm.tsx   # case « Action marquante »
├── app/(admin)/actions/actions.ts
├── app/(admin)/site/_components/HistoryForm.tsx     # nouvelle carte
├── app/(admin)/site/actions.ts, page.tsx
├── content/site.ts                                  # emplacement « Le club — ouverture »
└── types/action.ts, site-settings.ts

apps/web/
├── src/assets/fonts/OpenSans-CondensedBold.ttf     # police des images de partage (OFL)
└── src/
    ├── app/[lang]/
    │   ├── layout.tsx                     # export viewport (themeColor, viewportFit)
    │   ├── opengraph-image.tsx            # accueil et repli
    │   ├── actions/(liste)/opengraph-image.tsx, actualites/(liste)/…, membres/…, rejoindre/…
    │   ├── actions/[slug]/opengraph-image.tsx, actualites/[slug]/opengraph-image.tsx
    │   └── club/
    │       ├── page.tsx, page.module.css, opengraph-image.tsx
    │       └── _sections/ (ClubOpening, ClubHistory, RotaryLink, ClubFigures, ClubTimeline)
    ├── lib/share-image.tsx                # composition commune (remplace share-image.ts)
    ├── components/media/PhotoGallery.tsx + .module.css
    ├── data/timeline.ts                   # getClubTimeline()
    ├── data/site-settings.ts, actions.ts  # history, highlighted, club-ouverture
    ├── config/routes.ts                   # routes.club, NavKey "club"
    ├── content/{fr,en}/club.ts, common.ts # textes de la page, navigation, galerie
    └── app/globals.css + modules existants # zones de l'encoche, appui tactile
```

**Structure Decision** : les trois applications existantes, sans nouveau dossier de premier niveau. La page « Le club » suit le modèle des autres pages (`page.tsx` + `_sections/`). La galerie est un composant de `components/media/` réutilisé par `ActionStory` et `NewsArticle`.

## Ordre de livraison

Chaque récit se livre seul ; l'ordre limite les retours en arrière.

1. **Documents** (R7) : `DESIGN.md`, `ARCHITECTURE.md`, `PROJECT_CONTEXT.md`, `CLAUDE.md`.
2. **Récit 5, téléphone** : le plus court ; la galerie en a besoin pour ses zones de l'encoche.
3. **Récit 2, galerie**.
4. **API et Back Office** (`highlighted`, `history`, `club-ouverture`), prérequis des récits 3 et 4.
5. **Récit 3, page « Le club »**, puis **récit 4, frise**.
6. **Récit 1, images de partage**, en dernier pour couvrir aussi `/club`.

## Points de vigilance

- **Police** : récupérer `OpenSans-CondensedBold.ttf` depuis le dépôt officiel Google Fonts (licence OFL). Ce téléchargement demande ton accord à l'implémentation, sauf si tu fournis le fichier.
- **Proxy et images** : vérifier que les adresses `opengraph-image` françaises passent par la réécriture `/fr` et que les anglaises restent sous `/en` (research R1).
- **En-tête à six entrées** : contrôle à 1024 px et 1280 px dans les deux langues (research R3).
- **Limite 404 connue** (PROJECT_CONTEXT) : sans effet ici. Une image de partage introuvable renvoie seulement un statut.
- **Appareils réels** obligatoires pour le récit 5 et le balayage de la galerie.

## Complexity Tracking

Aucun écart à justifier. Le fichier de police est un actif nécessaire (principe IV, ci-dessus), pas une dépendance.
