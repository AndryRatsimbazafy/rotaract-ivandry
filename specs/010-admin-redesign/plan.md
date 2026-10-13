# Implementation Plan: Refonte visuelle du Back Office

**Branch**: `010-admin-redesign` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/010-admin-redesign/spec.md`

## Summary

Cette fonctionnalité redonne au Back Office (`apps/admin`) la direction « La grille » de l'application de trésorerie du club. Elle est d'abord consignée dans `apps/admin/DESIGN.md`. Ce qui est repris de la référence, en l'adaptant :
- le thème MUI clair et sombre, sans éclair au chargement ;
- Open Sans et Red Hat Mono ;
- le cadre de l'application : barre latérale, barre supérieure, barre d'onglets sur téléphone ;
- l'en-tête de page, les marques d'état, les panneaux latéraux et la page de connexion.

Trois éléments sont propres au Back Office :
- un aperçu des listes, lu côté serveur à partir du paramètre d'adresse `selection` ;
- une recherche rapide (Ctrl+K) qui passe par une action serveur ;
- une barre de chiffres réels sur l'accueil.

L'API, le Front Office, les adresses, la session et les dates ne changent pas. Aucune dépendance n'est ajoutée. Les décisions détaillées sont dans [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5 (strict), Node 22.

**Primary Dependencies**: Next.js 16.3 (App Router, Server Components, Server Actions), React 19.2, MUI 9 (`@mui/material`, `@mui/icons-material`, `@mui/material-nextjs`), Emotion 11 — tous déjà installés.

**Storage**: aucun côté Back Office. Seule la préférence de thème est gardée dans le `localStorage` du navigateur, par MUI.

**Testing**: aucun test automatisé (constitution, principe IX). Vérification manuelle avec [quickstart.md](./quickstart.md), plus `npm run lint --workspace=admin` et `npm run build:admin`.

**Target Platform**: navigateurs récents (Chrome, Firefox, Safari), de 375 px à 1920 px de large.

**Project Type**: application web (Back Office Next.js) dans le monorepo npm.

**Performance Goals**: aperçu affiché en moins d'une seconde après la sélection ; résultats de la recherche rapide en moins d'une seconde après la dernière frappe (API locale).

**Constraints**:
- le navigateur n'appelle jamais l'API ;
- les lectures se font dans des composants serveur, les écritures par actions serveur ;
- aucune nouvelle dépendance ;
- contrastes WCAG 2.2 AA dans les deux thèmes ;
- `apps/web`, `apps/api` et le `DESIGN.md` racine restent inchangés.

**Scale/Scope**: un administrateur ; 14 écrans, 1 gestionnaire de route et environ 30 composants restylés ou créés ; listes de 20 lignes par page.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Décision 18 révisée dans `ARCHITECTURE.md` **avant** cette spec (2026-10-13), avec `PROJECT_CONTEXT.md` et `CLAUDE.md`. `apps/admin/DESIGN.md` sera la référence visuelle du Back Office, écrite avant le code. Aucune opération hors contrats. | Conforme |
| II. Étapes validées | Spec et clarifications closes le 2026-10-13. Ce plan s'arrête après la phase 1 : ni tâches ni code. | Conforme |
| III. Préférence pour le manuel | Aucun script. Les trois images du logo sont copiées à la main depuis la référence. | Conforme |
| IV. Simplicité technique | Mécanismes natifs : thèmes de MUI (`colorSchemes`, `InitColorSchemeScript`, `useColorScheme`), `next/font`, `next/image`, `searchParams` et `Suspense` pour l'aperçu, action serveur pour la recherche. **Aucune dépendance ajoutée.** Les composants repris (`SideSheet`, `PageHeader`, `SummaryBar`, `StatusMark`, `CommandSearch`) répondent à des besoins présents sur plusieurs écrans. | Conforme |
| V. Architecture backend | Non modifiée. Seuls `/auth/*` et `/admin/*` existants sont appelés. | Conforme |
| VI. Intégrité du modèle métier | Rien ne change : mandats séparés, plusieurs fonctions, année explicite, candidature sans état. L'aperçu d'une candidature n'ajoute aucun état. | Conforme |
| VII. Front Office | Non touché. | Conforme |
| VIII. Qualité et contenu | Les chiffres de l'accueil sont les totaux renvoyés par l'API ; une valeur manquante s'affiche « — », jamais 0 (R9). Aucun contenu fictif. | Conforme |
| IX. Tests | Aucun test ni outillage de test. | Conforme |
| X. Outillage et infrastructure | npm, `node_modules` propre à l'application, aucun changement de structure du monorepo. | Conforme |
| XI. Git et collaboration | Branche `010-admin-redesign` créée par Spec Kit à la demande explicite du porteur du projet, comme pour les fonctionnalités précédentes. Aucun commit ni push sans demande. | Conforme |
| XII. Non-régression | Toutes les opérations de 008 sont rejouées (quickstart, section 1). `DESIGN.md` racine, `apps/web` et `apps/api` sont inchangés. | Conforme |

**Résultat de la porte** : passée. Aucune violation à justifier.

**Re-vérification après la phase 1** : inchangée. La conception (research, data-model, contracts) n'ajoute ni dépendance, ni opération d'API, ni donnée métier.

**Remarque sur la constitution.** Amendée en 1.1.0 le 2026-10-13, après ce plan : `apps/admin/DESIGN.md` est une source de vérité (principe I), Cloudinary est le fournisseur retenu (principe V), et les décisions ouvertes renvoient à `ARCHITECTURE.md`, section 14. Le contrôle ci-dessus reste conforme.

## A. Alignements de la documentation

**Appliqués le 2026-10-13, avant la spec**, à la demande du porteur du projet :
- `ARCHITECTURE.md` : section 2, Cloudinary pour les images ; section 8, 5 Mo par image ; section 11, « Envoi de fichiers » et « Aspect » ; section 14, décisions 10 et 18 révisées, trois lignes ouvertes retirées ou mises à jour ; section 15, étapes 9 et 10.
- `PROJECT_CONTEXT.md` (sections 8, 9 et 10) et `CLAUDE.md` mis à jour dans le même sens.

**À faire en fin d'implémentation** :
- Dans `ARCHITECTURE.md`, section 11, mettre à jour l'arborescence. Ajouter `public/images/`, `DESIGN.md` et les nouveaux composants. Changer la phrase « MUI installé » si un paquet a changé (aucun prévu).
- Mettre à jour la ligne d'état de `CLAUDE.md` et la section Back Office de `PROJECT_CONTEXT.md` : refonte faite, Red Hat Mono, thèmes clair et sombre, aperçu et recherche rapide.
- Dans `PROJECT_CONTEXT.md`, section Back Office, retirer « un seul thème MUI, fonctionnel et dense ».

## B. Conception

### B1. Ordre de réalisation

1. `apps/admin/DESIGN.md` (R14), écrit et relu avant tout code.
2. Socle : thème (R1, R2), polices (R3), images et composants de logo (R4), `layout.tsx` racine.
3. Composants communs :
   - `AppShell` avec barre latérale, barre supérieure, barre d'onglets, `AccountMenu`, `ColorModeButton` (R5) ;
   - `PageHeader` et `SectionHeading` ;
   - `StatusMark` et `NeutralMark` (R11) ;
   - `SideSheet` (R10) ;
   - `SummaryBar` ;
   - `FieldList`, pour les listes libellé / valeur ;
   - restylage de `ListToolbar`, `EmptyState`, `LoadingState`, `ListPagination`, `SortableHeader`, `ConfirmDialog`, `Notice`, `InfoAlert`.
4. Listes avec sélection et aperçu (R6, R7) :
   - composants `SelectableGrid` (sélection, clavier, adresse), `InspectorLayout` (colonne ou tiroir), `RowMenu` ;
   - puis chaque domaine : années, membres, actions et actualités (`ContentTable`), candidatures.
5. Fiches et formulaires : membres (avec les mandats en panneau latéral), actions, actualités, candidatures, ordre d'une année.
6. Recherche rapide : action serveur `quickSearch` et `CommandSearch` (R8).
7. Accueil avec la barre de chiffres (R9).
8. Connexion, accès refusé, introuvable, erreur (R12).
9. Documentation (section A), lint, build, quickstart complet.

### B2. Aperçu : flux d'une sélection (R6)

```text
clic / Espace / ↑↓ sur une ligne   (navigateur)
  → ligne marquée tout de suite (état local)
  → après ~150 ms sans autre choix : router.replace(?…&selection=<id>, { scroll: false })
page.tsx (serveur) relit searchParams
  → lit la liste comme aujourd'hui
  → si selection ∈ lignes affichées : <Suspense key={selection}> <Inspector id=…/> (lecture GET /admin/<ressource>/:id)
  → sinon : aperçu en invitation
InspectorLayout (navigateur) : colonne 360 px dès lg ; sinon tiroir 400 px ouvert si selection
fermer → router.replace(adresse sans selection)
```

- Les actions de l'aperçu réutilisent les actions serveur existantes (`setActionPublished`, `deleteAction`, …) avec leur `returnTo`. Une suppression retire la sélection de l'adresse de retour.
- La lecture de l'aperçu passe par `apiRead`. Un `404` donne l'état « introuvable ». Les autres erreurs donnent l'état « erreur » avec « Réessayer » (`router.refresh()`). Un `401` déclenche la redirection existante.
- `listPath` conserve `selection`. Les liens de filtre, de tri, de recherche et de pagination de `ListToolbar`, `SortableHeader` et `ListPagination` la retirent.

### B3. Thème (R1, R2)

- `theme/theme.ts` : adaptation de la référence. Retraits : `figureIn`, `--figure-in`, couleurs de caisse. Ajouts : aucun.
- `app/layout.tsx` :
  - polices `--font-sans` et `--font-mono` ;
  - `InitColorSchemeScript` et `suppressHydrationWarning` ;
  - `viewport` (`viewportFit: "cover"`, `themeColor` clair et sombre) ;
  - `ThemeProvider` et `CssBaseline enableColorScheme`.
- `ThemeRegistry.tsx` est remplacé par ce montage, ou réduit à lui.

### B4. Fichiers touchés

Voir « Source Code » ci-dessous. Restent inchangés : `lib/api.ts`, `lib/session*.ts`, `lib/dates.ts`, `lib/form-*.ts`, `lib/labels.ts`, `lib/content-actions.ts`, `proxy.ts`, toutes les actions serveur des domaines (`*/actions.ts`, hormis l'ajout de `quickSearch`), `candidatures/[id]/cv/route.ts`, `session/fin/route.ts` et `types/`.

## Project Structure

### Documentation (this feature)

```text
specs/010-admin-redesign/
├── spec.md
├── plan.md              # ce fichier
├── research.md          # phase 0 : R1 à R15
├── data-model.md        # phase 1 : états d'interface (thème, selection, aperçu, recherche, chiffres)
├── quickstart.md        # phase 1 : vérification manuelle
├── contracts/
│   ├── shell.md         # cadre, en-tête de page
│   ├── screens.md       # écarts par écran par rapport à 008
│   └── quick-search.md  # recherche rapide et action serveur quickSearch
├── checklists/requirements.md
└── tasks.md             # phase 2 (/speckit-tasks), pas encore créé
```

### Source Code (repository root)

```text
apps/admin/
├── DESIGN.md                         # nouveau : direction « La grille » du Back Office
├── public/images/                    # nouveau : logo-club-light.png, logo-club-dark.png, logo-emblem.png
└── src/
    ├── theme/theme.ts                # réécrit (R1, R2)
    ├── theme/ThemeRegistry.tsx       # simplifié ou retiré (R2)
    ├── app/
    │   ├── layout.tsx                # polices, InitColorSchemeScript, viewport
    │   ├── globals.css               # minimal
    │   ├── connexion/                # composition à deux colonnes (R12)
    │   ├── acces-refuse/  error.tsx
    │   └── (admin)/
    │       ├── layout.tsx            # lit aussi l'année en cours pour la barre latérale
    │       ├── actions.ts            # + quickSearch (R8)
    │       ├── page.tsx              # accueil : SummaryBar + accès (R9)
    │       ├── _components/HomeLinks.tsx
    │       ├── annees/  membres/  actions/  actualites/  candidatures/
    │       │   ├── page.tsx          # + lecture de selection et aperçu
    │       │   └── _components/      # + <Domaine>Inspector.tsx ; tables, formulaires et vues restylés
    │       ├── error.tsx  loading.tsx  not-found.tsx  [...introuvable]/
    └── components/
        ├── AppShell.tsx              # réécrit (R5)
        ├── AccountMenu.tsx  ColorModeButton.tsx  CommandSearch.tsx  ClubLogo.tsx   # nouveaux
        ├── PageHeader.tsx            # back, marks, meta, actions + SectionHeading
        ├── StatusMark.tsx  SideSheet.tsx  SummaryBar.tsx  FieldList.tsx            # nouveaux
        ├── SelectableGrid.tsx  InspectorLayout.tsx  RowMenu.tsx                    # nouveaux (R6, R7)
        ├── ContentTable.tsx          # sélection, menu de ligne, colonnes selon la largeur
        └── ListToolbar.tsx  EmptyState.tsx  LoadingState.tsx  ListPagination.tsx  SortableHeader.tsx
            ConfirmDialog.tsx  Notice.tsx  InfoAlert.tsx  RowAction.tsx  LinkButton.tsx            # restylés
```

**Structure Decision** : on garde la structure de `apps/admin` décrite dans `ARCHITECTURE.md`, section 11. Seuls s'ajoutent `DESIGN.md`, `public/images/` et des composants dans `src/components/` et `_components/`. Ni dossier ni paquet nouveau.

## Complexity Tracking

Aucune violation de la constitution à justifier.
