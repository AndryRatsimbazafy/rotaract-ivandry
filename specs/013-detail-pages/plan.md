# Implementation Plan: Pages de détail

**Branch**: `013-detail-pages` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/013-detail-pages/spec.md`

## Summary

Chaque action et chaque actualité publiée gagne sa page, `/actions/<slug>` et `/actualites/<slug>`, lue par la couche de données du site depuis les routes de détail de l'API, déjà en place.

- **Les listes** (accueil, Actions, Actualités) mènent aux pages ; les dépliants « Lire la suite » deviennent des liens (clarification Q1).
- **La page d'une action** est un reportage dominé par la photographie, avec la date en marge (Q2) ; **celle d'une actualité**, un article dominé par la date.
- **Un vrai 404** pour un contenu non publié ou inconnu : les pages de liste passent dans un groupe de routes, pour que les pages de détail échappent à leur attente (le flux forcerait un statut 200).
- **Deux pages manquantes au site** sont créées : la page introuvable et la page d'erreur.
- **Métadonnées** de partage propres à chaque page.

**Aucun changement dans l'API ni le Back Office, aucune dépendance, aucune variable.** Décisions : [research.md](./research.md) (R1 à R9).

## Technical Context

**Language/Version**: TypeScript 5, Next.js 16 (App Router), React 19 ; Node 22.

**Primary Dependencies**: aucune nouvelle. `next/image` (par `PhotoFrame`), `next/navigation` (`notFound`), `next/server` (`connection`).

**Storage**: aucun ; lecture de l'API (`GET /actions/:slug`, `GET /news/:slug`).

**Testing**: aucun test automatisé (principe IX). [quickstart.md](./quickstart.md), `npm run lint`, `npm run build`.

**Target Platform**: Linux en local ; plus tard Vercel.

**Project Type**: monorepo web ; seule `apps/web` change.

**Performance Goals**: images servies à la taille d'affichage, ≤ 500 Ko sur téléphone (SC-005) ; fraîcheur d'environ 60 s (FR-015).

**Constraints**:
- statut HTTP 404 réel (FR-002, SC-003) ;
- une panne n'est jamais une 404 (FR-003) ;
- rien d'inventé (décision 1) ;
- `DESIGN.md` d'abord.

**Scale/Scope**: 2 pages de détail, 2 pages système (introuvable, erreur), 5 sections de liste modifiées, 2 pages de liste déplacées.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Compositions, règle du lien « Lire la suite », date d'une action sur sa page, pages introuvable et d'erreur écrites dans `DESIGN.md` et `ARCHITECTURE.md` **avant** le code (section A), après validation de ce plan. | Conforme |
| II. Étapes validées | Spec et clarifications (Q1, Q2) closes le 2026-10-13. Ce plan s'arrête à la phase 1. | Conforme |
| III. Préférence pour le manuel | Aucun script. | Conforme |
| IV. Simplicité technique | Routes de l'API existantes ; un groupe de routes plutôt qu'un contrôle dans `proxy.ts` (R2) ; aucune dépendance, aucune variable (R5). | Conforme |
| V. Architecture backend | Inchangée ; le site n'appelle que des routes publiques. | Conforme |
| VI. Intégrité du modèle métier | Action et actualité restent distinctes, avec deux compositions différentes ; année Rotary explicite affichée. | Conforme |
| VII. Front Office | `DESIGN.md` suivi et complété (R7) ; compositions propres à chaque page, aucune grille de cartes, aucune copie de l'accueil. | Conforme, sous réserve de validation de R7 |
| VIII. Qualité et contenu | Rubriques d'impact vides absentes ; aucun texte de substitution ; gabarit seulement pour la photographie d'une action. | Conforme |
| IX. Tests | Aucun. | Conforme |
| X. Outillage | npm, `node_modules` par application. | Conforme |
| XI. Git | Branche `013-detail-pages` créée par Spec Kit ; aucun commit sans demande. | Conforme |
| XII. Non-régression | Adresses des listes inchangées, filtres et ancre conservés (quickstart, section 4) ; seule la fiche dépliable des listes disparaît, par décision (Q1). | Conforme |

**Résultat de la porte** : passée. **Re-vérification après la phase 1** : inchangée.

**Écarts assumés** :
- **Déplacement des deux pages de liste** dans un groupe de routes `(liste)` : une restructuration de fichiers, sans changement d'adresse, nécessaire au statut 404 (R2).
- **Deux pages système ajoutées** hors du périmètre initialement écrit (introuvable, erreur) : la spec supposait la première existante ; sans elles, FR-002 et FR-003 ne tiennent pas (R3, R3 bis). La spec a été corrigée.
- **Image de partage de repli limitée** aux images à adresse absolue (R5) : la photographie livrée avec le site ne sert de repli qu'une fois l'adresse publique du site connue.

## A. Alignements des documents de référence

**À appliquer après validation de ce plan, avant tout code :**

| Document | Changement |
|---|---|
| `DESIGN.md`, section 10, « La fiche dépliable » | Remplacée par « Le lien vers la page » (texte ci-dessous) |
| `DESIGN.md`, section 10 | Ajout de « La page d'une action » et « La page d'une actualité » (texte ci-dessous) |
| `DESIGN.md`, section 12, ligne « Dépliant » | « (FAQ, filtre des domaines) » à la place de « (FAQ, fiche d'une action ou d'une actualité, filtre des domaines) » |
| `DESIGN.md`, section 9 | Ajout de « Page introuvable » ; la ligne « Erreur » renvoie à la page d'erreur |
| `DESIGN.md`, section 17 | Deux lignes : « Action (détail) », « Actualité (détail) » |
| `ARCHITECTURE.md`, section 6 | `GET /actions/:slug` : « Détail, page `/actions/<slug>` du Front Office » (retirer « page à venir ») |
| `ARCHITECTURE.md`, section 10 | Pages de détail : `getActionBySlug`, `getNewsBySlug`, `apiGetOrNull` (404 → introuvable, autre erreur → page d'erreur), rendu à la demande, groupe `(liste)` |
| `ARCHITECTURE.md`, section 15 | Étape 12 : pages de détail |

Textes proposés pour `DESIGN.md`, section 10 :

> **Le lien vers la page.** Dans les listes (accueil, Actions, Actualités), une action ou une actualité montre son titre, ses métadonnées, son résumé et sa photographie principale. Le titre et la photographie mènent à sa page, ainsi que le lien fléché « Lire la suite ». Le récit, l'impact et les autres photographies ne se lisent que sur la page.

> **La page d'une action : le reportage.** La photographie domine. Ouverture sur le fond de page : les métadonnées en marge gauche sur deux colonnes (étiquette « Action », année Rotary, date, domaines), le titre condensé très grand sur huit colonnes, la photographie principale en 3:2 à bord perdu à droite, que le titre mord par un aplat blanc. Sur feuille blanche : le résumé en accroche, en voix de récit, puis le récit sur la colonne de lecture ; en marge droite, la fiche d'impact (une ligne par rubrique renseignée, filets encre, intitulé en étiquette) et les partenaires. Puis la planche : les autres photographies en alternance d'une grande sur huit colonnes et de deux plus petites décalées, de formats et de hauteurs de départ différents, chacune avec sa légende. Jamais une grille de vignettes égales. Sortie : lien fléché vers toutes les actions, liens de sortie, rappel cranberry. Sans photographie, l'ouverture garde le gabarit 3:2 et la planche disparaît.

> **La page d'une actualité : l'article.** La date domine. Ouverture typographique sur le fond de page : le jour en chiffre monumental au trait dans la marge gauche, le mois et l'année puis le type en étiquettes, le titre en largeur normale et très grand, le lieu en métadonnée dessous. La photographie principale, si elle existe, en 16:9 à bord perdu sous l'ouverture. Sur feuille blanche : le résumé en chapeau (Open Sans 600), puis le texte en voix de récit sur la colonne de lecture, décalée d'une colonne ; les autres photographies dans la marge droite, au fil du texte, sur trois colonnes (sous le texte sur téléphone). Sortie : lien fléché vers toutes les actualités, liens de sortie. Sans photographie, aucun gabarit : la date et le texte suffisent.

Texte proposé pour `DESIGN.md`, section 9 (nouvelle ligne du tableau) :

> **Page introuvable** : sur le fond de page, « 404 » en chiffre monumental au trait dans la marge, le titre « Cette page n'existe pas, ou plus. », une phrase calme, trois liens fléchés (Accueil, Actions, Actualités). La page d'erreur suit la même composition, sans chiffre, avec un bouton « Réessayer ».

**À faire en fin d'implémentation** : `ARCHITECTURE.md` (en-tête), `PROJECT_CONTEXT.md` (état, « Fait », structure de `app/`, prochaines étapes), ligne d'état de `CLAUDE.md`, le guide publié (pages de détail, slug).

## B. Conception (`apps/web` seulement)

1. **Données**
   - `lib/api.ts` : `apiGetOrNull` (R1).
   - `data/actions.ts` : `getActionBySlug` ; `data/news.ts` : `getNewsBySlug`.
   - `lib/dates.ts` : `formatFullDate` (Madagascar) et `formatCalendarDate` (temps universel).
   - `config/routes.ts` : `actionPath`, `newsItemPath`.
2. **Routes** (R2)
   - Déplacer `app/actions/page.tsx` et `loading.tsx` vers `app/actions/(liste)/`, et de même pour `app/actualites/` ; ajuster les imports relatifs.
   - Créer `app/actions/[slug]/page.tsx` et `app/actualites/[slug]/page.tsx` : `await connection()`, lecture, `notFound()` sur `null`, `generateMetadata` (R5).
3. **Compositions** (R7), sections dans le dossier de chaque page :
   - `app/actions/[slug]/_sections/ActionStory.tsx` (+ CSS) : ouverture, récit, fiche d'impact ;
   - `app/actions/[slug]/_sections/ActionPlate.tsx` (+ CSS) : la planche ;
   - `app/actualites/[slug]/_sections/NewsArticle.tsx` (+ CSS) : ouverture, photographie, texte, marge photographique.
   - Sortie : `ArrowLink`, `Onward`, `JoinReminder` existants.
4. **Listes et accueil** (R6) : `LatestActions`, `LatestNews`, `ActionsIndex`, `NewsFeature`, `NewsRegister` (+ leurs CSS : retrait des styles du dépliant, liens).
5. **Pages système** : `app/not-found.tsx` (+ CSS) et `app/error.tsx` (+ CSS) (R3, R3 bis).
6. **Contenus** : `content/actions.ts` et `content/news.ts` (libellés « Lire la suite », « Toutes les actions », « Toutes les actualités », étiquette « Action ») ; `content/common.ts` (textes des pages introuvable et d'erreur).

### Ordre de réalisation

Documents (section A), puis données et routes (B1, B2, vérifiés par `curl` sur les statuts), puis page d'une action, puis page d'une actualité, puis listes et accueil, puis pages système, puis documentation de fin.

## Project Structure

### Documentation (this feature)

```text
specs/013-detail-pages/
├── spec.md
├── plan.md                 # ce fichier
├── research.md             # R1 à R9
├── data-model.md
├── quickstart.md
├── contracts/front-office.md
├── checklists/requirements.md
└── tasks.md                # /speckit-tasks
```

### Source Code (repository root)

```text
apps/web/src/
├── lib/            api.ts (+apiGetOrNull), dates.ts (+formatFullDate, formatCalendarDate)
├── data/           actions.ts (+getActionBySlug), news.ts (+getNewsBySlug)
├── config/         routes.ts (+actionPath, newsItemPath)
├── content/        actions.ts, news.ts, common.ts
└── app/
    ├── not-found.tsx, error.tsx (+ CSS)                                   (nouveaux)
    ├── _sections/  LatestActions.tsx, LatestNews.tsx
    ├── actions/
    │   ├── (liste)/        page.tsx, loading.tsx                          (déplacés)
    │   ├── [slug]/         page.tsx, _sections/ActionStory.tsx, ActionPlate.tsx (+ CSS)   (nouveaux)
    │   └── _sections/      ActionsIndex.tsx (+ CSS)
    └── actualites/
        ├── (liste)/        page.tsx, loading.tsx                          (déplacés)
        ├── [slug]/         page.tsx, _sections/NewsArticle.tsx (+ CSS)    (nouveaux)
        └── _sections/      NewsFeature.tsx, NewsRegister.tsx (+ CSS)
```

**Structure Decision** : `apps/web` seulement ; les sections d'une page restent dans son dossier (`_sections`), comme partout dans le site ; le groupe `(liste)` ne change aucune adresse.

## Complexity Tracking

Aucune violation de la constitution. Les trois écarts assumés sont nommés dans le contrôle de constitution.
