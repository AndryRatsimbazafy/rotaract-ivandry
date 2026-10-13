# Tasks: Refonte visuelle du Back Office

**Input**: Design documents from `/specs/010-admin-redesign/`

**Prerequisites**: plan.md, spec.md, research.md (R1 à R15), data-model.md, contracts/shell.md, contracts/screens.md, contracts/quick-search.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`, plus `npm run lint --workspace=admin` et `npm run build:admin`.

**Organization**: les tâches sont groupées par récit utilisateur, dans l'ordre de la spec (US1 à US7).

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US7).

## Path Conventions

Tout le code vit dans `apps/admin/` ; les commandes npm se lancent depuis la racine. Style : TypeScript 5 strict, ESLint, guillemets doubles, alias `@/*` → `./src/*`, commentaires en français, sobres, comme dans le code existant. Avant d'écrire du code Next.js, consulter `apps/admin/node_modules/next/dist/docs/` (`apps/admin/AGENTS.md`). Référence visuelle, en lecture seule : `/home/andry/Workspace-perso/rotaract-app/rotaract-ivandry-runner/` (abrégée « la référence », fichiers sous `client/src/`). MUI 9 : `justifyContent` / `alignItems` dans `sx` des `Stack`.

## Décisions verrouillées à respecter

1. **Aucune modification** de `apps/api`, `apps/web`, du `DESIGN.md` racine, de `packages/` ni de la constitution.
2. **Aucune dépendance ajoutée** : `apps/admin/package.json` et `package-lock.json` ne changent pas. Tout vient de `@mui/material`, `@mui/icons-material`, `@mui/material-nextjs` et `next`.
3. **Le navigateur n'appelle jamais l'API** : lectures dans des Server Components, écritures et recherche rapide par des Server Actions ; aucune variable `NEXT_PUBLIC_*`.
4. **Inchangés** : `src/lib/api.ts`, `src/lib/session.ts`, `src/lib/session-cookie.ts`, `src/lib/dates.ts`, `src/lib/form-errors.ts`, `src/lib/form-state.ts`, `src/lib/labels.ts`, `src/lib/content-actions.ts`, `src/proxy.ts`, `src/types/*`, les Server Actions des domaines (`*/actions.ts`, sauf l'ajout de `quickSearch` dans `src/app/(admin)/actions.ts`), `candidatures/[id]/cv/route.ts`, `session/fin/route.ts`.
5. **Adresses, champs, messages et avis** : exactement ceux de `specs/008-back-office/contracts/screens.md`, mot pour mot. Seul paramètre d'adresse ajouté : `selection`.
6. **Dates** : tout formatage passe encore par `src/lib/dates.ts`, sur le serveur.
7. **Couleurs** : valeurs officielles de `BRAND` de la référence, sans retouche ; jamais de couleur seule pour un état.
8. **Chiffres de l'accueil** : uniquement des `meta.total` renvoyés par l'API ; valeur absente = « — », jamais `0`.
9. **Rien n'est commité ni poussé** sans demande explicite.

## Prérequis manuels (hors tâches)

Ceux de `specs/008-back-office/quickstart.md` (API et base, compte d'administration, `apps/admin/.env.local`, Chrome ou Firefox), plus les données de vérification de `quickstart.md` de cette fonctionnalité. S'il en manque au moment de vérifier, le signaler et laisser la vérification non cochée.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: poser la direction écrite et les ressources avant tout code.

- [X] T001 Écrire `apps/admin/DESIGN.md` d'après R14. Partir du `DESIGN.md` de la référence, au même format : en-tête de valeurs, Overview, Colors, Typography, Layout, Elevation & Depth, Shapes, Components, Do's and Don'ts.
  - Nom : « La grille » ; origine citée ; renvoi à `ARCHITECTURE.md`, décision 18.
  - Retirer : barre de calcul, ruban des mois, solde et deux caisses, montants, `figure-in`, `balance`, cotisations, radiation.
  - Ajouter : aperçu des listes, avec ses états de `data-model.md` ; menu de ligne ; recherche rapide côté serveur ; barre de chiffres de l'accueil ; marques d'état du Back Office (Publié en Lawn Green, Brouillon en marque neutre, En cours en Azure) ; panneaux latéraux pour l'année et le mandat ; page de connexion.
  - **Arrêt de validation** : faire relire ce document au porteur du projet avant T004.
- [X] T002 [P] Copier à la main, depuis `client/public/images/` de la référence, `logo-club-light.png`, `logo-club-dark.png` et `logo-emblem.png` vers `apps/admin/public/images/` (dossier à créer), sans les modifier.
- [X] T003 [P] Créer `apps/admin/src/components/ClubLogo.tsx` (`ClubLogo` et `ClubEmblem`), repris de `client/src/components/ClubLogo.tsx` de la référence :
  - ratio 960 × 299 ;
  - variante claire ou sombre choisie en CSS par `theme.applyStyles("dark", …)` ;
  - emblème 508 × 560 ;
  - `alt` « Rotaract Club Ivandry » pour le logo ; emblème décoratif par défaut.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: thème, polices, montage des schémas de couleurs et composants de présentation communs. **Aucun récit ne commence avant la fin de cette phase.**

- [X] T004 Réécrire `apps/admin/src/theme/theme.ts` d'après R1 et R2, à partir de `client/src/app/theme.ts` de la référence.
  - Exporter `BRAND`, `GRID` (clair et sombre), `MONO`, `EASE_OUT`, `TOPBAR_HEIGHT = 48`, `tabularNums`, `tabularText`, et `theme` en export nommé.
  - Configuration : `cssVariables: { colorSchemeSelector: "class" }`, `colorSchemes` clair et sombre, `shape.borderRadius: 2`, `motion.reducedMotion: "system"`, typographie (`SANS = "var(--font-sans), Arial, sans-serif"`), et toutes les surcharges de composants de la référence.
  - Retirer `figureIn`, `--figure-in` et tout ce qui est propre à la trésorerie.
- [X] T005 Mettre à jour `apps/admin/src/app/layout.tsx` d'après R2, R3 et la référence (`client/src/app/layout.tsx`) :
  - `Open_Sans` (variable `--font-sans`) et `Red_Hat_Mono` (variable `--font-mono`) par `next/font/google` ;
  - `<html lang="fr" … suppressHydrationWarning>` ;
  - `InitColorSchemeScript attribute="class"` en tête de `<body>` ;
  - `AppRouterCacheProvider`, puis `ThemeProvider theme={theme}` et `CssBaseline enableColorScheme` ;
  - `viewport` avec `viewportFit: "cover"` et `themeColor` clair `#ffffff` et sombre `#0f1623` ;
  - garder le `metadata` actuel.
  - Supprimer `apps/admin/src/theme/ThemeRegistry.tsx`, désormais inutile, et réduire `apps/admin/src/app/globals.css` à la hauteur de page.
- [X] T006 [P] Créer `apps/admin/src/components/StatusMark.tsx` (R11) : `StatusMark` (carré plein de 8 px de la couleur d'état, puis libellé en 600, encre) et `NeutralMark` (carré vide cerclé de 1 px, libellé en encre secondaire). Adapter `DotChip` et `NeutralMark` de la référence. Exporter des raccourcis `PublishedMark({ isPublished })` (« Publié » en `success` ou « Brouillon » neutre) et `CurrentYearMark` (« En cours », couleur `info`).
- [X] T007 [P] Réécrire `apps/admin/src/components/PageHeader.tsx` d'après `contracts/shell.md` et `client/src/components/PageHeader.tsx` de la référence.
  - Propriétés : `back?: { href, label }`, `title`, `marks?`, `meta?`, `actions?`.
  - Rendu : un `h1` (variante `h4`), filet dessous, aucune carte.
  - Ajouter et exporter `SectionHeading` (titre `h2` en variante `h6`, filet fort dessous, actions éventuelles).
  - Conserver l'export par défaut actuel, ou adapter tous ses appelants dans les tâches des récits : `children` devient `actions`.
- [X] T008 [P] Créer `apps/admin/src/components/FieldList.tsx` : lignes libellé / valeur réglées sur deux colonnes, filets fins, « — » pour une valeur absente, option `numeric` qui applique `tabularText` (repris de `FieldList` de la référence).
- [X] T009 [P] Créer `apps/admin/src/components/SideSheet.tsx` (R10), repris de `client/src/components/SideSheet.tsx` de la référence :
  - tiroir droit de 480 px, plein écran sous `sm` ;
  - tête sur `var(--grid-chrome)` avec titre `h2` et bouton « Fermer » ;
  - `aria-labelledby` ;
  - marges intérieures de 20 px et zones sûres.
- [X] T010 [P] Restyler les composants d'état et de retour, sans changer leurs textes ni leurs propriétés publiques :
  - `apps/admin/src/components/EmptyState.tsx`, `LoadingState.tsx` et `InfoAlert.tsx` : sans `Paper`, filets ;
  - `Notice.tsx` : avis sombre de la référence, au-dessus de la barre d'onglets sur téléphone grâce à la surcharge `MuiSnackbar` de T004 ;
  - `ConfirmDialog.tsx` et `PublishedSlugDialog.tsx` : titre à filet, pied d'outillage ; suppression en bouton plein `color="error"` ;
  - `LinkButton.tsx` et `RowAction.tsx`.
- [X] T011 Vérifier la phase : `npm run lint --workspace=admin` et `npm run build:admin` passent ; `npm run dev:admin`, la connexion et un écran s'affichent avec le nouveau thème (le cadre viendra en US1).

**Checkpoint**: thème, polices et composants communs prêts.

---

## Phase 3: User Story 1 - Retrouver le Back Office sous sa nouvelle direction (Priority: P1) 🎯 MVP

**Goal**: cadre (barre latérale, barre supérieure) et en-tête de page sur tous les écrans, marques d'état, grilles à filets ; toutes les opérations de 008 intactes.

**Independent Test**: `quickstart.md`, sections 1 (rejeu de 008) et 2.

- [X] T012 [US1] Créer `apps/admin/src/components/AccountMenu.tsx` d'après `contracts/shell.md` :
  - bouton-icône « Mon compte » avec un avatar Royal Blue portant l'initiale de l'email en `tabularNums` ;
  - menu : email, « Administrateur », séparateur, puis « Se déconnecter » dans un `<form action={logoutAction}>`.
  - Propriétés : `email`, `logoutAction`. Aucun changement de mot de passe.
- [X] T013 [US1] Réécrire `apps/admin/src/components/AppShell.tsx` d'après R5, `contracts/shell.md` et `client/src/components/AppShell.tsx` de la référence.
  - Lien d'évitement « Aller au contenu ».
  - Barre latérale de 216 px dès `md`, collante, sur `var(--grid-chrome)` :
    - `ClubLogo` de 132 px dans un bandeau de 48 px, lien vers `/` ;
    - les six entrées actuelles (`ENTRIES`), icônes de 18 px, `aria-current` ;
    - pied « ANNÉE ROTARY » (`overline`), puis le label de l'année en cours en `tabularNums`, ou « — ».
  - Barre supérieure de 48 px, collante : fil d'Ariane « Rotaract Club Ivandry / <entrée active> » ; un emplacement réservé à la recherche (US5) et au thème (US4) ; `AccountMenu`.
  - `<main id="contenu">` limité à 1440 px, marges 16, 24 et 32 px ; `Notice` conservé dans `Suspense`.
  - Propriétés : `email`, `currentYearLabel: string | null`, `logoutAction`.
  - La barre d'onglets du bas est faite en US6 ; d'ici là, garder sous `md` un accès à la navigation, par exemple le tiroir actuel.
- [X] T014 [US1] Mettre à jour `apps/admin/src/app/(admin)/layout.tsx` : lire en parallèle `/auth/me` (comme aujourd'hui) et `/admin/rotary-years` ; en déduire `currentYearLabel` (l'année dont `isCurrent` vaut vrai, sinon `null`). Un échec de la lecture des années donne `null` sans casser le cadre. Passer ces données à `AppShell`.
- [X] T015 [P] [US1] Restyler `apps/admin/src/components/ListToolbar.tsx`, `ListPagination.tsx` et `SortableHeader.tsx` :
  - barre d'outils en ligne, sans `Paper` ;
  - pagination sous un filet fort, compteurs en `tabularNums` ;
  - en-têtes en petites capitales (thème).
  - Logique d'adresse inchangée à ce stade (la sélection vient en US2).
- [X] T016 [P] [US1] Mettre `apps/admin/src/app/(admin)/annees/_components/YearsView.tsx` au nouveau style, sans encore changer le dialogue de création (fait en US3) :
  - `PageHeader` avec l'action « Nouvelle année » ;
  - grille sans `Paper` ;
  - `CurrentYearMark` à la place du `Chip` ;
  - dates et labels en `tabularNums`.
- [X] T017 [P] [US1] Mettre au nouveau style `apps/admin/src/components/ContentTable.tsx` (actions et actualités) : grille sans `Paper`, `PublishedMark` à la place du `Chip`, dates en `tabularNums`. Colonnes et actions inchangées à ce stade. Adapter l'appel de `PageHeader` dans `apps/admin/src/app/(admin)/actions/page.tsx` et `apps/admin/src/app/(admin)/actualites/page.tsx` (`actions`).
- [X] T018 [P] [US1] Mettre au nouveau style `apps/admin/src/app/(admin)/membres/_components/MembersTable.tsx` et `apps/admin/src/app/(admin)/membres/page.tsx` : en-tête avec « Nouveau membre » et « Ordre d'une année », grille sans `Paper`.
- [X] T019 [P] [US1] Mettre au nouveau style `apps/admin/src/app/(admin)/candidatures/_components/ApplicationsTable.tsx` et `apps/admin/src/app/(admin)/candidatures/page.tsx` : grille sans `Paper`, dates en `tabularNums`.
- [X] T020 [US1] Mettre au nouveau style les fiches et formulaires longs, d'après `contracts/screens.md` :
  - `apps/admin/src/app/(admin)/actions/_components/ActionForm.tsx`, `actions/[id]/page.tsx` et `actions/nouvelle/page.tsx` :
    - `PageHeader` avec `back` vers l'adresse `retour`, `PublishedMark` et `meta` « Première publication le … » (texte existant) ;
    - groupes de champs séparés par `SectionHeading` ;
    - pied d'actions « Enregistrer » (plein) et « Annuler » (texte) ;
    - erreurs de l'API en `Alert` en tête.
  - Faire de même pour `apps/admin/src/app/(admin)/actualites/_components/NewsForm.tsx`, `actualites/[id]/page.tsx` et `actualites/nouvelle/page.tsx`.
- [X] T021 [US1] Mettre au nouveau style `apps/admin/src/app/(admin)/membres/[id]/page.tsx`, `membres/nouveau/page.tsx`, `membres/_components/MemberForm.tsx` et `membres/_components/MemberDelete.tsx` :
  - `PageHeader` avec retour « Membres » ;
  - section « Mandats » titrée par `SectionHeading` dans `MandatesSection.tsx`, dont les dialogues restent jusqu'à US3.
  - `apps/admin/src/components/DeleteSection.tsx` : zone séparée par un filet, bouton plein `error`.
- [X] T022 [US1] Mettre au nouveau style `apps/admin/src/app/(admin)/membres/ordre/page.tsx`, `membres/_components/MandateOrderList.tsx` et `membres/_components/OrderYearPicker.tsx` : liste en grille, rang en `tabularNums`, actions de la page dans `PageHeader`. Comportement inchangé.
- [X] T023 [US1] Mettre au nouveau style `apps/admin/src/app/(admin)/candidatures/[id]/page.tsx` et `candidatures/_components/ApplicationDetail.tsx` : `PageHeader` avec retour ; informations en `FieldList` (taille du CV en `tabularText`) ; boutons « Télécharger le CV », « Contacter par email », « Supprimer » ; alertes `?cv=` inchangées.
- [X] T024 [US1] Mettre au nouveau style `apps/admin/src/app/(admin)/page.tsx` et `apps/admin/src/app/(admin)/_components/HomeLinks.tsx` : les cinq accès et leur phrase en liste à filets, sans carte. La barre de chiffres vient en T050.
- [X] T025 [US1] Mettre au nouveau style `apps/admin/src/app/(admin)/error.tsx`, `apps/admin/src/app/(admin)/loading.tsx`, `apps/admin/src/app/(admin)/not-found.tsx`, `apps/admin/src/app/(admin)/[...introuvable]/page.tsx`, `apps/admin/src/app/error.tsx`, `apps/admin/src/app/acces-refuse/page.tsx` et `apps/admin/src/app/acces-refuse/AccessDenied.tsx` : `PageHeader` et textes de 008 inchangés.
- [ ] T026 [US1] Vérification manuelle : `quickstart.md`, section 1 (rejeu complet de `specs/008-back-office/quickstart.md`, sections 1 à 8) et section 2, plus `npm run lint --workspace=admin` et `npm run build:admin`. Noter tout écart dans ce fichier.

**Checkpoint**: le Back Office complet est dans la nouvelle direction (thème clair), toutes les opérations de 008 fonctionnent. Livrable minimal.

---

## Phase 4: User Story 2 - Parcourir les listes et voir un élément sans quitter la grille (Priority: P1)

**Goal**: sélection dans l'adresse (`selection`), aperçu lu côté serveur, en colonne dès `lg` et en tiroir en dessous, menu de ligne, colonnes adaptées.

**Independent Test**: `quickstart.md`, sections 4 et 5 (première ligne).

- [X] T027 [US2] Étendre `apps/admin/src/lib/navigation.ts` d'après `data-model.md` :
  - `listPath` conserve `selection` ;
  - ajouter `withSelection(path, id | null)` qui pose ou retire `selection` ;
  - ajouter `withoutSelection(search)`.
  - Dans `ListToolbar.tsx`, `SortableHeader.tsx` et `ListPagination.tsx`, tout changement de recherche, de filtre, de tri ou de page retire `selection`.
- [X] T028 [US2] Créer `apps/admin/src/components/SelectableGrid.tsx` (client), d'après R6, R13 et `contracts/screens.md`. Elle reçoit les identifiants des lignes et `selected`.
  - Clic ou Espace sur une ligne la marque tout de suite (`selected` sur `TableRow`, `aria-selected`).
  - ↑ ↓ choisissent la ligne voisine. Entrée ou double-clic ouvrent `hrefOf(id)` (fiche, avec `retour`).
  - Raccourcis actifs seulement quand la grille a le focus, jamais dans un champ.
  - L'adresse est remplacée par `router.replace(withSelection(…), { scroll: false })`, immédiatement au clic, après environ 150 ms sans autre choix au clavier.
  - La ligne choisie reste visible (`scrollIntoView({ block: "nearest" })`).
- [X] T029 [US2] Créer `apps/admin/src/components/InspectorLayout.tsx` (client), d'après R6 et `contracts/screens.md`.
  - Dès `lg` : grille et colonne d'aperçu de 360 px, collante sous `TOPBAR_HEIGHT`, filet à gauche.
  - Sous `lg` (`useMediaQuery`, rendu serveur supposé large) : tiroir droit de 400 px, plein écran sous `sm`, ouvert quand `selected` existe. Fermeture par bouton, Échap ou clic à côté : `router.replace(adresse sans selection, { scroll: false })`.
  - Zone d'aperçu en `aria-live="polite"`.
  - Créer aussi `InspectorPlaceholder` (« Choisissez une ligne pour voir sa fiche. » et « ↑ ↓ changer de ligne · Entrée ouvrir la fiche »), `InspectorPending` (squelettes), `InspectorError` (« Une erreur est survenue. Réessayez. » et « Réessayer » qui appelle `router.refresh()`) et `InspectorNotFound` (« Ressource introuvable. »).
- [X] T030 [P] [US2] Créer `apps/admin/src/components/RowMenu.tsx` (client) : bouton-icône `MoreVert` dont le nom accessible est « Actions pour <élément> », avec un menu d'entrées fourni par l'appelant. Ouvrir est un lien. Publier ou Dépublier réutilise `RowAction`. Supprimer ouvre la confirmation existante (`ConfirmDialog`, avec le même texte qu'aujourd'hui).
- [X] T031 [US2] Créer `apps/admin/src/components/inspector.ts` (serveur), un utilitaire de lecture pour l'aperçu.
  - `readInspected<T>(path)` renvoie `{ status: "ok", data } | { status: "not-found" } | { status: "error" }` à partir d'`apiRead`.
  - Un `404` donne `not-found` ; une autre `ApiError` donne `error` ; un `401` garde la redirection d'`apiRead`.
  - Ajouter `pickSelection(params, rowIds)`, qui renvoie l'identifiant seulement s'il fait partie des lignes affichées.
- [X] T032 [US2] Actions et actualités : modifier `apps/admin/src/components/ContentTable.tsx` pour utiliser `SelectableGrid`, `InspectorLayout` et `RowMenu`, d'après R7.
  - Colonnes principales : État, Titre, Date. Colonnes secondaires (Année, Ordre ou Type, Création) : `display` à partir de `xl` quand l'aperçu est en colonne, à partir de `sm` sinon.
  - Le contenu de l'aperçu est reçu en propriété (`inspector: React.ReactNode`).
- [X] T033 [US2] Créer `apps/admin/src/app/(admin)/actions/_components/ActionInspector.tsx` (serveur) d'après `data-model.md`.
  - Lecture `GET /admin/actions/:id` par `readInspected`.
  - Contenu : état, titre, date, année, ordre, résumé, domaines (libellés de `labels.ts`), impact avec ses seules rubriques renseignées, première publication.
  - Actions « Ouvrir la fiche », « Publier » ou « Dépublier » (`setActionPublished`), « Supprimer » (`deleteAction`, avec un `returnTo` sans `selection`).
  - Dates par `src/lib/dates.ts`.
  - Brancher l'aperçu dans `apps/admin/src/app/(admin)/actions/page.tsx` : `pickSelection`, puis `<Suspense key={selection} fallback={<InspectorPending/>}>`.
- [X] T034 [US2] Créer `apps/admin/src/app/(admin)/actualites/_components/NewsInspector.tsx` (serveur), sur le même modèle que T033.
  - Lecture `GET /admin/news/:id`.
  - Contenu : état, type, titre, date et heure en heure de Madagascar (`dates.ts`), année, lieu, résumé, première publication.
  - Actions : `setNewsPublished` et la suppression existantes.
  - Brancher dans `apps/admin/src/app/(admin)/actualites/page.tsx`.
- [X] T035 [US2] Membres : modifier `apps/admin/src/app/(admin)/membres/_components/MembersTable.tsx` pour utiliser `SelectableGrid`, `InspectorLayout` et `RowMenu` (Ouvrir, Supprimer).
  - Colonnes principales : Nom, Prénom. Secondaires : Profession ou études, Email, Téléphone.
  - Créer `membres/_components/MemberInspector.tsx` (serveur) : `GET /admin/members/:id` ; coordonnées en `FieldList` ; mandats du plus récent au plus ancien (année en `tabularNums`, fonctions par `labels.ts`) ; « Ouvrir la fiche » et « Supprimer » (texte existant « Ses mandats seront supprimés avec lui. »).
  - Brancher dans `apps/admin/src/app/(admin)/membres/page.tsx`.
- [X] T036 [US2] Candidatures : modifier `apps/admin/src/app/(admin)/candidatures/_components/ApplicationsTable.tsx` pour utiliser `SelectableGrid`, `InspectorLayout` et `RowMenu` (Ouvrir seulement).
  - Colonnes principales : Nom, Prénom, Date de candidature. Secondaires : Email, Situation.
  - Créer `candidatures/_components/ApplicationInspector.tsx` (serveur) : `GET /admin/applications/:id` ; coordonnées, situation, date (`dates.ts`) ; CV avec nom d'origine, type et taille ; « Télécharger le CV » (lien vers `/candidatures/<id>/cv`), « Contacter par email » (`mailto:` existant), « Ouvrir la fiche ».
  - Aucune référence de stockage.
  - Brancher dans `apps/admin/src/app/(admin)/candidatures/page.tsx`.
- [X] T037 [US2] Années : `apps/admin/src/app/(admin)/annees/page.tsx` et `annees/_components/YearsView.tsx` passent à `SelectableGrid`, `InspectorLayout` et `RowMenu` (Supprimer).
  - Colonnes principales : Année, En cours. Secondaires : Début, Fin.
  - L'aperçu, sans lecture supplémentaire, montre label, début, fin, `CurrentYearMark` et « Supprimer ». Pas d'Entrée vers une fiche (il n'en existe pas) : Entrée ne fait rien.
- [ ] T038 [US2] Vérification manuelle : `quickstart.md`, section 4 et première ligne de la section 5 ; lint et build.

**Checkpoint**: les cinq listes ont la sélection dans l'adresse et l'aperçu.

---

## Phase 5: User Story 3 - Saisir sans perdre le fil (Priority: P1)

**Goal**: création d'une année et saisie des mandats en panneau latéral ; règles de saisie inchangées ; plein écran sur téléphone.

**Independent Test**: `quickstart.md`, section 1 (rejeu des cas années et mandats de 008) et section 5 (troisième ligne).

- [X] T039 [US3] Dans `apps/admin/src/app/(admin)/annees/_components/YearsView.tsx`, remplacer `CreateYearDialog` par un `SideSheet` titré « Nouvelle année ».
  - Même `useActionState(createYear, …)`, même champ « Année de début », mêmes messages.
  - Pied « Créer » (plein) et « Annuler » (texte).
  - En cas de réussite : fermeture, rafraîchissement de la liste et avis « Enregistrement créé. », comme aujourd'hui.
- [X] T040 [US3] Dans `apps/admin/src/app/(admin)/membres/_components/MandatesSection.tsx`, remplacer `MandateDialog` par un `SideSheet`. Titres « Ajouter un mandat » et « Modifier les fonctions » ; mêmes champs (Année, dix cases à cocher), même action serveur, mêmes messages, y compris le `409` « Ce membre a déjà un mandat pour cette année. ».
- [ ] T041 [US3] Vérifier sur téléphone (outils du navigateur, 375 px) que les panneaux latéraux et les dialogues de saisie sont plein écran, que les champs font 16 px et que les boutons font 40 px de haut (surcharges de T004). Corriger dans `SideSheet.tsx` ou `theme.ts` si besoin.
- [ ] T042 [US3] Vérification manuelle : récit 3 de `spec.md` (scénarios 1 à 5) ; lint et build.

**Checkpoint**: tous les récits P1 sont livrés.

---

## Phase 6: User Story 4 - Choisir son thème (Priority: P2)

**Goal**: choix clair, sombre ou système, conservé, sans éclair, lisible partout.

**Independent Test**: `quickstart.md`, section 3.

- [X] T043 [US4] Créer `apps/admin/src/components/ColorModeButton.tsx`, repris de la référence : menu « Clair », « Sombre », « Comme le système » via `useColorScheme()`, option courante cochée, nom accessible « Thème : <option> », icône système tant que `mode` est indéfini. L'insérer dans la barre supérieure d'`AppShell.tsx`.
- [ ] T044 [US4] Revoir chaque écran en sombre et corriger toute couleur écrite en dur qui ne suit pas le thème (`grep` de `#` et de `rgb` dans `apps/admin/src/app` et `apps/admin/src/components`, hors `theme.ts`) :
  - toutes les couleurs passent par la palette, `var(--grid-*)` ou `BRAND` ;
  - vérifier que chaque variante du logo n'apparaît que dans son thème ;
  - vérifier les contrastes WCAG 2.2 AA avec l'outil des navigateurs.
- [ ] T045 [US4] Vérification manuelle : `quickstart.md`, section 3.

---

## Phase 7: User Story 5 - Aller vite au bon endroit avec la recherche rapide (Priority: P2)

**Goal**: Ctrl+K ou ⌘K, recherche des écrans dans le navigateur et des contenus par une action serveur.

**Independent Test**: `quickstart.md`, section 6.

- [X] T046 [US5] Ajouter l'action serveur `quickSearch(q: string)` dans `apps/admin/src/app/(admin)/actions.ts`, exactement selon `contracts/quick-search.md`.
  - `q` est épuré ; moins de 2 caractères donne quatre listes vides sans appel.
  - Quatre lectures en parallèle (`/admin/members`, `/admin/actions`, `/admin/news`, `/admin/applications`, avec `q` et `limit=5`) par `apiRead` et `queryString`. Ne pas utiliser `Promise.allSettled` d'une façon qui avalerait la redirection du `401` : relancer les erreurs de redirection de Next.
  - Un échec d'une autre nature donne une liste vide pour sa nature.
  - Forme `QuickHit { id, primary, secondary?, href }` : `primary` et `secondary` comme dans le contrat, dates par `dates.ts`, libellés par `labels.ts`.
- [X] T047 [US5] Créer `apps/admin/src/components/CommandSearch.tsx` (client), adapté de `client/src/components/CommandSearch.tsx` de la référence et de `contracts/quick-search.md`.
  - Champ de 280 px avec la touche « Ctrl K » ou « ⌘ K » (`useSyncExternalStore`) dès `md`, bouton-icône en dessous.
  - Écoute de Ctrl+K ou ⌘K sur le document, y compris dans un champ (`preventDefault`).
  - Dialogue plein écran sur téléphone.
  - Écrans filtrés dans le navigateur ; contenus par `quickSearch` après 250 ms et 2 caractères ; réponses périmées ignorées.
  - Groupes Membres, Actions, Actualités, Candidatures ; `role="listbox"` et `aria-activedescendant` ; ↑ ↓ Entrée.
  - Barre de progression pendant l'attente ; « Aucun résultat ».
  - L'insérer dans `AppShell.tsx` avec les six entrées comme destinations.
- [ ] T048 [US5] Vérification manuelle : `quickstart.md`, section 6. Contrôler en particulier dans l'onglet Réseau qu'aucune requête ne part vers le port 4000 et que le terme n'apparaît dans aucune adresse.

---

## Phase 8: User Story 6 - Utiliser le Back Office sur téléphone (Priority: P2)

**Goal**: barre d'onglets du bas, logo dans la barre supérieure, grilles qui défilent seules.

**Independent Test**: `quickstart.md`, section 5 (deuxième et troisième lignes).

- [X] T049 [US6] Dans `apps/admin/src/components/AppShell.tsx`, ajouter sous `md` la barre d'onglets fixe du bas, reprise de `BottomNav` de la référence : 64 px plus la zone sûre ; Années, Membres, Actions, Actualités, Candidatures ; onglet actif en cranberry avec un trait de 2 px en haut ; `aria-current`.
  - Retirer le tiroir de navigation provisoire de T013.
  - Afficher `ClubLogo` (120 px, lien vers `/`) dans la barre supérieure sous `md`.
  - Réserver la place sous `<main>` (`calc(64px + 32px + env(safe-area-inset-bottom))`).
  - Vérifier que les grilles défilent en largeur sans faire défiler la page (`MuiTableContainer` de T004).
- [ ] T050 [US6] Vérification manuelle : `quickstart.md`, section 5, à 375 px.

---

## Phase 9: User Story 7 - Se connecter sur la nouvelle page de connexion (Priority: P3)

**Goal**: composition à deux colonnes avec le panneau Royal Blue et l'emblème.

**Independent Test**: `quickstart.md`, section 8, et section 1 de 008 (connexion).

- [X] T051 [US7] Recomposer `apps/admin/src/app/connexion/_components/LoginForm.tsx` (et `apps/admin/src/app/connexion/page.tsx` si besoin) d'après R12 et la page de connexion de la référence (`client/src/app/(auth)/login`).
  - Dès `md` : formulaire de 360 px à gauche ; à droite, un panneau `BRAND.royalBlue` tramé de filets de 32 px (dégradés CSS) portant `ClubEmblem`.
  - Sous `md` : `ClubLogo` au-dessus du formulaire.
  - Champs en taille normale.
  - Garder exactement la logique, les champs, les messages (dont « Votre session a expiré. Reconnectez-vous. ») et les redirections actuels.
- [ ] T052 [US7] Vérification manuelle : `quickstart.md`, section 8, et la section 1 de `specs/008-back-office/quickstart.md` (connexion).

---

## Phase 10: Accueil — barre de chiffres (FR-016, rattachée à US1)

**Purpose**: chiffres réels de l'accueil (clarification Q1). Indépendante des autres récits une fois US1 faite.

- [X] T053 [P] [US1] Créer `apps/admin/src/components/SummaryBar.tsx`, repris de `client/src/components/SummaryBar.tsx` de la référence.
  - Cases réglées côte à côte sur `var(--grid-chrome)`, en 2 × 2 sur téléphone.
  - Libellé de zone (`overline`) au-dessus, valeur en `tabularNums` (600, 0.9375rem).
  - Chaque case est un lien (propriété `href`) ; valeur `null` affichée « — ».
- [X] T054 [US1] Brancher la barre dans `apps/admin/src/app/(admin)/page.tsx`, d'après R9 et `data-model.md`, au-dessus des cinq accès (`HomeLinks`).
  - Lire les années, puis en parallèle `GET /admin/members?year=<label courant>&limit=1`, `/admin/actions?published=true&limit=1`, `/admin/news?published=true&limit=1` et `/admin/applications?limit=1`.
  - Garder `meta.total` de chacune. Un échec, ou l'absence d'année en cours pour la case membres, donne `null`, jamais `0`.
  - Le `401` garde sa redirection.
  - Libellés : « MEMBRES <label> » (ou « MEMBRES » sans année), « ACTIONS PUBLIÉES », « ACTUALITÉS PUBLIÉES », « CANDIDATURES ».
  - Liens : `/membres?annee=<label>`, `/actions?publie=true`, `/actualites?publie=true`, `/candidatures`.
- [ ] T055 [US1] Vérification manuelle : `quickstart.md`, section 7.

---

## Phase 11: Polish & Cross-Cutting Concerns

- [ ] T056 Accessibilité et mouvement : `quickstart.md`, section 9. Vérifier :
  - le parcours complet au clavier et le focus visible ;
  - l'annonce de la ligne choisie et de l'aperçu ;
  - qu'aucune transition ne reste quand l'utilisateur demande moins d'animations.
- [X] T057 [P] Contrôles de périmètre (décisions verrouillées 1, 2 et 4) :
  - `git diff --stat main -- apps/api apps/web DESIGN.md packages .specify/memory` est vide ;
  - `apps/admin/package.json` et `package-lock.json` sont inchangés ;
  - aucun fichier de la liste « Inchangés » n'est modifié ;
  - `grep -rn "NEXT_PUBLIC_" apps/admin/src` ne renvoie rien ;
  - `grep -rn "cloudinary" -i apps/admin/src` ne renvoie rien.
- [X] T058 Mettre la documentation à jour d'après `plan.md`, section A, « À faire en fin d'implémentation » :
  - `ARCHITECTURE.md`, section 11 : arborescence (`DESIGN.md`, `public/images/`, nouveaux composants) ;
  - `PROJECT_CONTEXT.md`, section Back Office : retirer « un seul thème MUI, fonctionnel et dense » ; ajouter thèmes clair et sombre, Red Hat Mono, aperçu, recherche rapide, chiffres de l'accueil ;
  - ligne d'état de `CLAUDE.md` : refonte faite.
  - Si une valeur visuelle a changé pendant l'implémentation, corriger d'abord `apps/admin/DESIGN.md`.
- [ ] T059 Contrôle final : `npm run lint --workspace=admin`, `npm run build:admin` et `npm run build` (les trois applications) passent. Rejouer `quickstart.md` en entier, puis supprimer les données de vérification (section 10).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)** : aucune dépendance. T001 doit être validé par le porteur du projet avant la phase 2.
- **Foundational (Phase 2)** : dépend de la phase 1. Bloque tous les récits.
- **US1 (Phase 3)** : dépend de la phase 2. C'est le livrable minimal.
- **US2 (Phase 4)** : dépend d'US1 (tables et en-têtes restylés).
- **US3 (Phase 5)** : dépend de la phase 2 (`SideSheet`). Elle peut suivre US1 sans US2, mais T039 et T037 touchent le même fichier `YearsView.tsx` : faire T037 avant T039.
- **US4 (Phase 6)** : dépend d'US1 (`AppShell`). Indépendante d'US2 et d'US3.
- **US5 (Phase 7)** : dépend d'US1 (`AppShell`).
- **US6 (Phase 8)** : dépend d'US1 (`AppShell`). À faire après US4 et US5, qui touchent aussi `AppShell.tsx`.
- **US7 (Phase 9)** : dépend de la phase 2 seulement.
- **Accueil (Phase 10)** : dépend d'US1 (T024).
- **Polish (Phase 11)** : après tous les récits.

### Fichiers partagés (pas de parallélisme)

- `AppShell.tsx` : T013, T043, T047, T049, dans cet ordre.
- `YearsView.tsx` : T016, T037, T039.
- `ContentTable.tsx` : T017, T032.
- `MembersTable.tsx` : T018, T035.
- `MandatesSection.tsx` : T021, T040.

### Parallel Opportunities

- Phase 1 : T002 et T003 pendant la relecture de T001.
- Phase 2 : T006, T007, T008, T009 et T010 en parallèle, après T004 et T005.
- US1 : T015 à T019 en parallèle ; puis T020 à T025.
- US2 : T030 en parallèle de T028 et T029 ; puis T033 à T037, chacun sur son domaine, en parallèle une fois T027 à T032 faits.
- US7 et la phase 10 peuvent avancer en parallèle d'US2 à US6.

### Parallel Example: User Story 2

```text
Après T027–T031 :
  T033 ActionInspector + actions/page.tsx
  T034 NewsInspector + actualites/page.tsx
  T035 MemberInspector + MembersTable + membres/page.tsx
  T036 ApplicationInspector + ApplicationsTable + candidatures/page.tsx
  T037 YearsView + annees/page.tsx
```

---

## Implementation Strategy

### MVP First

1. Phases 1 et 2, avec `apps/admin/DESIGN.md` validé.
2. US1 : tout le Back Office dans la nouvelle direction, toutes les opérations de 008 vérifiées.
3. **Arrêt** pour validation par le porteur du projet.

### Incremental Delivery

US2 (aperçu), puis US3 (panneaux latéraux), puis US4 (thème sombre), puis US5 (recherche), puis US6 (téléphone), puis US7 (connexion), puis l'accueil chiffré, puis la finition. Chaque étape se termine par sa vérification manuelle, son lint et son build. Rien n'est commité sans demande.

---

## État de l'implémentation (2026-10-13)

Toutes les tâches de code sont faites. `npm run lint` et `npm run build` (les trois applications) passent.

**Vérifications manuelles non cochées.** Ces tâches demandent une session d'administrateur, que l'agent n'ouvre pas : T026, T038, T041, T042, T044 (contrôle des contrastes), T045, T048, T050, T052, T055, T056, T059 (rejeu complet de `quickstart.md`). Ce qui a été vérifié sans session, dans le navigateur :
- page de connexion à 1280 px et à 375 px ;
- thème sombre (celui du système) puis thème clair, gardé après rechargement ;
- variante du logo selon le thème ;
- message « Votre session a expiré. Reconnectez-vous. ».

**Écarts par rapport au texte des tâches :**
1. **`src/proxy.ts` modifié**, alors qu'il figure dans la liste « Inchangés » (décision verrouillée 4). Son `matcher` exclut désormais `images/`. Sans cela, le proxy redirigeait vers `/connexion` les requêtes des logos (`public/images`), et la page de connexion n'affichait aucune image. Ces fichiers sont publics et ne portent aucune donnée.
2. **T005 :** `src/theme/ThemeRegistry.tsx` est conservé, simplifié (`ThemeProvider` et `CssBaseline enableColorScheme`), au lieu d'être supprimé : le thème, qui contient des fonctions, reste entièrement côté client. Le plan, section B3, l'autorisait.
3. **T028 :** la sélection est un hook, `useRowSelection`, exporté par `src/components/SelectableGrid.tsx`.
4. **T029 :** les états de l'aperçu (`InspectorPanel`, `InspectorSection`, `InspectorPending`, `InspectorError`, `InspectorNotFound`) sont dans `src/components/Inspector.tsx`. `InspectorPlaceholder` et la constante `secondaryCell` sont dans `InspectorLayout.tsx`.
5. **T030 :** `RowMenu` gère lui-même la publication et la confirmation de suppression. `ConfirmDialog` accepte pour cela `open` et `onClose` ; sans `triggerLabel`, il n'affiche pas son bouton.
6. **T031 :** l'utilitaire de lecture est `src/lib/inspector.ts`, et non `src/components/inspector.ts`.
7. **US4, US5 et US6 :** `ColorModeButton`, `CommandSearch` et la barre d'onglets ont été intégrés à `AppShell.tsx` dès T013, pour ne pas réécrire ce fichier quatre fois.
8. **Accueil (T024, T053, T054) :** les accès aux domaines forment une liste à filets sous un titre de section « Domaines ».
9. **Candidatures :** le type et la taille du CV sont mis en forme par `candidatures/_components/cv.ts`, partagé entre la fiche et l'aperçu.
