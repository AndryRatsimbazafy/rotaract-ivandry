# Tasks: Back Office

**Input**: Design documents from `/specs/008-back-office/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/screens.md, contracts/api-usage.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX) : ni Jest, ni Vitest, ni Playwright, ni Cypress. Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`.

**Organization**: les tâches sont groupées par récit utilisateur, dans l'ordre de la spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US7).

## Path Conventions

Tout le code vit dans `apps/admin/`. Les commandes npm se lancent depuis la racine du dépôt. Style de `apps/admin` : TypeScript 5 strict, ESLint, guillemets doubles, alias `@/*` → `./src/*`. Avant d'écrire du code Next.js, consulter la documentation embarquée (`apps/admin/node_modules/next/dist/docs/`), comme le demande `apps/admin/AGENTS.md`.

## Décisions verrouillées à respecter

1. **Adresses** : exactement celles d'`ARCHITECTURE.md`, section 11 (`/connexion`, `/`, `/annees`, `/membres`, `/actions`, `/actualites`, `/candidatures` et leurs sous-adresses de `plan.md`, B1). Aucune adresse d'écran sous `/admin`. Deux adresses techniques seulement : `/session/fin` et `/acces-refuse` (P2).
2. **Intermédiaire** : le navigateur n'appelle jamais l'API. Lectures dans des Server Components, écritures par Server Actions, CV par un gestionnaire de route. `API_URL` est une variable serveur ; aucune variable `NEXT_PUBLIC_*`.
3. **Session** : cookie `rci_admin_session`, `httpOnly`, `Secure` (partout, P1), `SameSite=Lax`, `Path=/`, `Max-Age` = `expiresIn` reçu. Jamais de `localStorage` ni de `sessionStorage`.
4. **Opérations** : uniquement les 29 de `contracts/api-usage.md`. Aucune opération inventée ; `apps/api` n'est pas modifié. Un besoin non couvert est **signalé**, pas résolu.
5. **Dépendances** : les cinq prévues, plus `@emotion/cache`, validée le 2026-10-02 (voir « État ») — `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/material-nextjs`, `@mui/icons-material`. Aucune bibliothèque de formulaires, de validation, de dates, de tableaux, d'état ni de glisser-déposer.
6. **Fuseau** : toute conversion Madagascar ↔ temps universel et tout formatage de date passent par `apps/admin/src/lib/dates.ts`, exécuté sur le serveur. **Aucun autre fichier** ne contient `+03:00`, `Indian/Antananarivo`, ni un calcul de décalage.
7. **Messages** : ceux de l'API sont affichés tels quels ; les seuls messages propres au Back Office sont ceux de `contracts/screens.md` (P3).
8. **Listes** : recherche, filtres et tris exactement ceux des contrats. **Aucun filtre par situation** des candidatures. État de la liste dans l'adresse.
9. **Saisie** : champ facultatif vide non envoyé à la création, envoyé à `null` en modification, jamais en chaîne vide ; `slug` envoyé seulement s'il est saisi ou modifié ; jamais `order` d'un mandat, `photos`, `portrait` ni `publishedAt`.
10. **Année d'un contenu** : proposée de façon visible d'après la date, toujours modifiable ; écart signalé sans bloquer.
11. **Candidatures** : lecture et suppression seulement ; aucune référence de stockage ni le mot « Cloudinary » à l'écran, dans le code ou dans ce que le navigateur reçoit ; aucune donnée de candidat mise en cache ni journalisée.
12. **Aspect** : un seul thème MUI (`plan.md`, B11). Rien n'est importé de `apps/web` ; `DESIGN.md` ne s'applique pas et n'est pas modifié.
13. **Périmètre** : `apps/web`, `apps/api`, `DESIGN.md`, la constitution et `packages/` ne sont pas modifiés. Ni Docker, ni CI/CD, ni déploiement, ni test automatisé. Aucun commit ni push sans demande explicite.
14. Aucune donnée d'exemple n'est laissée en base : tout ce que les vérifications créent est supprimé (T060).

## Prérequis manuels (hors tâches)

1. `apps/api/.env` renseigné ; le mot de passe du compte d'administration connu du porteur du projet.
2. `apps/admin/.env.local`, créé **à la main par le porteur du projet** : `API_URL=http://localhost:4000/api/v1`. Aucune tâche ne crée ni ne modifie ce fichier.
3. Chrome ou Firefox pour la vérification locale (cookie `Secure` sur `localhost`).

Si l'un manque au moment de vérifier, le signaler et laisser les tâches de vérification concernées non cochées : aucune vérification n'est inventée.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: préparer `apps/admin` : dépendances, configuration, gabarit retiré.

- [X] T001 Installer les dépendances depuis la racine : `npm install @mui/material @emotion/react @emotion/styled @mui/material-nextjs @mui/icons-material --workspace=admin`. Vérifier que seuls `apps/admin/package.json` et `package-lock.json` changent, que cinq dépendances exactement sont ajoutées, et que `apps/admin/node_modules` reste propre à l'application (pas de remontée à la racine).
- [X] T002 [P] Ajouter l'exception `!.env.example` sous la règle `.env*` de `apps/admin/.gitignore`, puis créer `apps/admin/.env.example` : le seul nom `API_URL=`, commenté en français (« Obligatoire. Adresse de l'API, côté serveur seulement. »), **sans valeur**. Ne créer ni `.env` ni `.env.local`.
- [X] T003 Retirer le gabarit : supprimer `apps/admin/src/app/page.module.css`, `apps/admin/src/app/page.tsx` et les cinq images de `apps/admin/public/` (`file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`) ; réduire `apps/admin/src/app/globals.css` au strict nécessaire (hauteur de page, aucune couleur ni police : le thème les porte). Le layout racine est repris en T008.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: types, utilitaires, thème, session, client d'API, éléments partagés. Rien n'est visible avant US1.

**⚠️ CRITICAL**: aucun récit ne commence avant la fin de cette phase.

- [X] T004 [P] Créer les types de `data-model.md` dans `apps/admin/src/types/` : `api.ts` (`Paginated<T>`, `Listed<T>`, `ApiErrorBody`, `Admin`), `rotary-year.ts` (`RotaryYear`, `YearRef`), `member.ts` (`Member`, `MemberWithMandates`, `Mandate`, `MemberRole`), `action.ts` (`Action`, `ActionImpact`, `FocusArea`), `news.ts` (`News`, `NewsType`), `application.ts` (`Application`, `ApplicantStatus`). Champs exacts des contrats 002 à 007 : facultatifs à `null` là où le contrat le dit, `impact` facultatif, dates en chaînes ISO. Aucun champ de photographie, de portrait ni de stockage.
- [X] T005 [P] Créer `apps/admin/src/lib/labels.ts` : libellés français recopiés d'`ARCHITECTURE.md`, section 1 — les dix fonctions (1.3), les sept domaines (1.4), les cinq types d'actualité (1.5), les deux situations (« Étudiant », « Professionnel ») — et, pour chacun, la liste ordonnée des valeurs. Rien n'est importé de `apps/web` ni d'`apps/api`.
- [X] T006 [P] Créer `apps/admin/src/lib/dates.ts`, **seul fichier** à définir le fuseau `Indian/Antananarivo` et son décalage constant `+03:00`, sans aucune dépendance : (a) heure de Madagascar saisie `AAAA-MM-JJTHH:mm` → instant ISO UTC, `null` si la valeur est mal formée ; (b) instant ISO → valeur `AAAA-MM-JJTHH:mm` en heure de Madagascar, pour préremplir un champ ; (c) instant → texte français, date seule ou date et heure, en heure de Madagascar ; (d) date sans heure d'une action ou borne d'une année Rotary → texte français formaté en temps universel ; (e) date d'une action → valeur `AAAA-MM-JJ` d'un champ ; (f) jour de Madagascar `AAAA-MM-JJ` → instants ISO UTC de début (00:00:00.000) et de fin (23:59:59.999) du jour ; (g) bornes `startDate` et `endDate` d'une année Rotary → chaînes comparables à la valeur d'un champ de date : `AAAA-MM-JJ` en temps universel (actions) et `AAAA-MM-JJTHH:mm` en heure de Madagascar (actualités). Fonctions pures, destinées au serveur.
- [X] T007 [P] Créer `apps/admin/src/lib/form-state.ts` : le type d'état renvoyé par les Server Actions (`message?`, `fieldErrors?`, `values`), l'état initial, et la conversion d'une erreur d'API en cet état (`details` → `fieldErrors` par champ ; sinon `message`).
- [X] T008 Créer `apps/admin/src/theme/theme.ts` selon `plan.md`, B11 : clair uniquement ; principale `#17458f`, secondaire `#d41367`, texte `#0f1c36`, fond `#f3f6f9`, surfaces blanches, erreur `#b3261e`, succès `#0b6b34`, avertissement `#7a4a00` ; Open Sans ; 14 px de base ; rayon 6 px ; tableaux et champs `size="small"` par défaut ; bordures plutôt qu'ombres. Créer `apps/admin/src/theme/ThemeRegistry.tsx` (Client Component : `ThemeProvider`, `CssBaseline`). Réécrire `apps/admin/src/app/layout.tsx` : `lang="fr"`, titre « Administration — Rotaract Club Ivandry », Open Sans par `next/font/google` à la place des polices Geist, fournisseur de cache de `@mui/material-nextjs` pour l'App Router (entrée fournie par la version installée), puis `ThemeRegistry`.
- [X] T009 Créer `apps/admin/src/lib/session.ts`, côté serveur : nom du cookie (`rci_admin_session`), lecture du jeton, écriture (`httpOnly`, `secure: true`, `sameSite: "lax"`, `path: "/"`, `maxAge` = `expiresIn`), effacement. Aucune autre donnée n'est conservée.
- [X] T010 Créer `apps/admin/src/lib/api.ts`, côté serveur : lit `API_URL` (erreur explicite au premier appel si elle manque, sans afficher de valeur) ; ajoute `Authorization: Bearer` depuis `session.ts` ; `cache: "no-store"` ; délai de 15 secondes ; renvoie le corps typé, ou lève `ApiError` (`status`, `message`, `details?`) ; erreur réseau, délai ou corps illisible → `ApiError` de statut 0 et message « Une erreur est survenue. Réessayez. ». Deux aides selon `plan.md`, B3 : pour une **lecture**, `401` → redirection vers `/session/fin?motif=expiree`, `403` → `/acces-refuse`, `404` ou `400` « Identifiant invalide. » → `notFound()` ; pour une **écriture**, `401` → cookie effacé puis redirection vers `/connexion?motif=expiree`, `403` → `/acces-refuse`, les autres erreurs renvoyées à l'action. Une aide de plus pour obtenir la réponse brute (flux et en-têtes), utilisée par le CV. Rien n'est journalisé.
- [X] T011 [P] Créer `apps/admin/src/components/ConfirmDialog.tsx` (dialogue de confirmation : titre, texte nommant l'élément et sa conséquence, « Annuler », action destructrice, bouton inactif pendant l'envoi, message d'échec dans le dialogue), `apps/admin/src/components/Notice.tsx` (lit `?avis=`, affiche le texte du code dans un `Snackbar` `role="status"` selon la table « Avis » de `contracts/screens.md`, puis retire le paramètre de l'adresse ; code inconnu : rien) et `apps/admin/src/components/EmptyState.tsx` (deux variantes : « aucun élément » avec une action, « aucun résultat » avec « Effacer les filtres »).
- [X] T012 [P] Créer `apps/admin/src/components/ListToolbar.tsx` (Client Component : champ de recherche soumis par Entrée, emplacements de filtres ; chaque changement met à jour l'adresse et remet `page` à 1 ; affiche sous le champ le message d'erreur de paramètre reçu de la page), `apps/admin/src/components/SortableHeader.tsx` (en-tête de colonne cliquable, bascule entre `champ` et `-champ` dans `?tri=`, `aria-sort`) et `apps/admin/src/components/ListPagination.tsx` (`TablePagination` de MUI : page dans l'adresse, 20 par page, total affiché, libellés en français).

**Checkpoint**: `npm run build:admin` réussit ; aucune page n'existe encore.

---

## Phase 3: User Story 1 - Se connecter et rester protégé (Priority: P1) 🎯 MVP

**Goal**: l'administrateur se connecte, est protégé partout, se déconnecte ; une session expirée ramène à la connexion.

**Independent Test**: `quickstart.md`, section 1.

### Implementation for User Story 1

- [X] T013 [US1] Créer `apps/admin/src/app/connexion/actions.ts` : Server Action de connexion → `POST /auth/login` ; `200` → cookie par `session.ts`, redirection vers `/` ; `400` → messages de l'API sous `email` ou `password` ; `401` et `429` → message de l'API en tête ; autre erreur → message générique. L'email saisi est renvoyé dans `values` ; le mot de passe ne l'est jamais.
- [X] T014 [US1] Créer `apps/admin/src/app/connexion/page.tsx` et son formulaire (`apps/admin/src/app/connexion/_components/LoginForm.tsx`, `useActionState`) : champs « Email » et « Mot de passe », bouton « Se connecter » inactif pendant l'envoi, alerte « Votre session a expiré. Reconnectez-vous. » quand `?motif=expiree`. Ni inscription, ni mot de passe oublié.
- [X] T015 [US1] Créer `apps/admin/src/proxy.ts` (convention de Next.js 16) : sans cookie, toute adresse autre que `/connexion`, `/session/fin` et les fichiers statiques est redirigée vers `/connexion` ; avec cookie, `/connexion` est redirigée vers `/`. Présence du cookie seulement : aucun appel à l'API.
- [X] T016 [P] [US1] Créer `apps/admin/src/app/session/fin/route.ts` : `GET` efface le cookie et redirige vers `/connexion`, en reportant `motif=expiree` s'il est fourni et aucune autre valeur.
- [X] T017 [P] [US1] Créer `apps/admin/src/app/acces-refuse/page.tsx` : « Accès refusé. » et un bouton « Se déconnecter ».
- [X] T018 [US1] Créer `apps/admin/src/app/(admin)/actions.ts` (Server Action de déconnexion : efface le cookie, redirige vers `/connexion`) et `apps/admin/src/app/(admin)/layout.tsx` : lecture de `GET /auth/me` par l'aide de lecture de `api.ts` ; rend ses enfants avec, provisoirement, l'email du compte et un bouton « Se déconnecter » (la coque arrive en T021). Créer `apps/admin/src/app/(admin)/page.tsx` avec le seul titre « Accueil » (complété en T022).
- [X] T019 [US1] Vérification manuelle : dérouler `quickstart.md`, section 1 (redirection sans session ; champs vides ; identifiants faux, même message ; sixième tentative ; connexion ; cookie `httpOnly` et `Secure`, rien dans `localStorage`, aucune requête vers le port 4000 ; `/connexion` en étant connecté ; cookie altéré → retour à la connexion sans boucle, cookie disparu ; déconnexion puis bouton « précédent »). Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: la connexion fonctionne et protège.

---

## Phase 4: User Story 2 - Naviguer dans le Back Office (Priority: P1)

**Goal**: une navigation permanente vers les cinq domaines, la déconnexion, et les états communs.

**Independent Test**: `quickstart.md`, section 2.

### Implementation for User Story 2

- [X] T020 [P] [US2] Créer `apps/admin/src/app/(admin)/loading.tsx` (squelette de contenu), `apps/admin/src/app/(admin)/error.tsx` (Client Component : « Une erreur est survenue. Réessayez. », bouton « Réessayer », `role="alert"`, aucun détail technique) et `apps/admin/src/app/(admin)/not-found.tsx` (« Ressource introuvable. », retour à l'accueil).
- [X] T021 [US2] Créer `apps/admin/src/components/AppShell.tsx` selon `plan.md`, B12 : barre latérale de 240 px avec Accueil, Années Rotary, Membres, Actions, Actualités, Candidatures (icône et libellé, `aria-current="page"` sur l'entrée en cours, déterminée par l'adresse) ; barre supérieure avec le titre, l'email du compte et « Se déconnecter » ; sous 900 px, tiroir ouvert par un bouton « Menu » (`aria-label`) ; lien d'évitement « Aller au contenu » ; zone principale `<main>`.
- [X] T022 [US2] Brancher `AppShell` dans `apps/admin/src/app/(admin)/layout.tsx` (à la place de l'en-tête provisoire de T018) et compléter `apps/admin/src/app/(admin)/page.tsx` : cinq accès vers les domaines, chacun avec une phrase de description, **aucun chiffre**. Y placer `Notice`.
- [X] T023 [US2] Vérification manuelle : dérouler `quickstart.md`, section 2 (cinq entrées, entrée en cours marquée, email visible ; accueil sans chiffre ; 800 px puis 400 px ; adresse inconnue ; parcours au clavier). Les cinq domaines répondent encore « introuvable » : c'est attendu à ce stade. Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: le cadre est en place.

---

## Phase 5: User Story 3 - Gérer les années Rotary (Priority: P1)

**Goal**: lister, créer, supprimer les années.

**Independent Test**: `quickstart.md`, section 3.

### Implementation for User Story 3

- [X] T024 [US3] Créer `apps/admin/src/app/(admin)/annees/actions.ts` : création (`POST /admin/rotary-years`, `startYear` converti en **nombre entier** ; `400` → message sous le champ ; `409` → message de l'API « Cette année Rotary existe déjà. » en tête) et suppression (`DELETE /admin/rotary-years/:id` ; `409` → « Cette année ne peut pas être supprimée : des mandats, des actions ou des actualités s'y rattachent. » ; `404` → « Ressource introuvable. »). Succès : `revalidatePath("/annees")` et avis `cree` ou `supprime`.
- [X] T025 [US3] Créer `apps/admin/src/app/(admin)/annees/page.tsx` (lecture de `GET /admin/rotary-years`) et ses composants dans `apps/admin/src/app/(admin)/annees/_components/` : tableau (Année = `label` ; Début et Fin formatés par `dates.ts` en temps universel ; pastille « En cours » si `isCurrent` ; Supprimer avec `ConfirmDialog`), dialogue « Nouvelle année » à un champ « Année de début » (`type="number"`, `min=2000`, `max=2100`), état vide invitant à créer la première année. Aucune action de modification.
- [X] T026 [US3] Vérification manuelle : dérouler `quickstart.md`, section 3, sauf la suppression d'une année utilisée, vérifiée en T035. Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les années se gèrent.

---

## Phase 6: User Story 4 - Gérer les membres et leurs mandats (Priority: P1)

**Goal**: membres (liste, création, modification, suppression), mandats (création, fonctions, suppression), ordre d'une année.

**Independent Test**: `quickstart.md`, section 4.

### Implementation for User Story 4

- [X] T027 [US4] Créer `apps/admin/src/app/(admin)/membres/actions.ts` : créer (`POST /admin/members` : `firstName`, `lastName`, et `occupation`, `email`, `phone` **seulement s'ils sont renseignés**), modifier (`PATCH /admin/members/:id` : champ vidé → `null`), supprimer (`DELETE`). Erreurs selon `plan.md`, B3. Succès : `revalidatePath`, redirection vers la liste d'origine avec l'avis.
- [X] T028 [US4] Créer `apps/admin/src/app/(admin)/membres/page.tsx` et `apps/admin/src/app/(admin)/membres/_components/MembersTable.tsx` : lecture de `GET /admin/members` avec la traduction des paramètres d'adresse (`q`, `annee`→`year`, `fonction`→`role`, `tri`→`sort`, `page`) ; colonnes Nom, Prénom, Profession ou études, Email, Téléphone, actions Ouvrir et Supprimer (la confirmation annonce « Ses mandats seront supprimés avec lui. ») ; `ListToolbar` avec les filtres Année (années de `GET /admin/rotary-years`) et Fonction (dix libellés) ; tri sur Nom (`lastName`) et Date de création (`createdAt`), dans les deux sens ; `ListPagination` ; les deux états vides ; un `400` de paramètre affiché par la barre, liste inchangée ; une page au-delà de la dernière ramenée à la dernière ; boutons « Nouveau membre » et « Ordre d'une année ». Email et téléphone masqués sous 600 px.
- [X] T029 [US4] Créer `apps/admin/src/app/(admin)/membres/_components/MemberForm.tsx` (`useActionState` ; Prénom*, Nom*, Profession ou études, Email, Téléphone ; `maxLength` 120 sur les trois premiers, 254 sur l'email ; erreur de l'API sous chaque champ ; saisie conservée ; « Enregistrer » inactif pendant l'envoi ; « Annuler » vers la liste d'origine) et `apps/admin/src/app/(admin)/membres/nouveau/page.tsx`. Aucun champ de portrait.
- [X] T030 [US4] Créer `apps/admin/src/app/(admin)/membres/[id]/page.tsx` : lecture de `GET /admin/members/:id` (introuvable ou identifiant mal formé → page « introuvable ») ; `MemberForm` prérempli ; suppression du membre ; emplacement de la section des mandats (T032).
- [X] T031 [US4] Ajouter à `apps/admin/src/app/(admin)/membres/actions.ts` les actions des mandats : créer (`POST /admin/mandates` : `member`, `rotaryYear`, `roles` — **jamais `order`** ; `409` → « Ce membre a déjà un mandat pour cette année. »), modifier les fonctions (`PATCH /admin/mandates/:id` : `roles` seulement), supprimer (`DELETE`), réordonner (`PUT /admin/mandates/order` : `rotaryYear` et **tous** les `mandateIds` dans l'ordre ; `400` portant sur `mandateIds` → « La liste a changé. Rechargez-la avant d'enregistrer l'ordre. » ; succès → avis `ordre`).
- [X] T032 [US4] Créer `apps/admin/src/app/(admin)/membres/_components/MandatesSection.tsx` et l'intégrer à la fiche : un mandat par ligne (Année, Fonctions en libellés, « Modifier les fonctions », « Supprimer »), de l'année la plus récente à la plus ancienne ; dialogue « Ajouter un mandat » (Année* parmi les années existantes, Fonctions : dix cases à cocher, zéro permis) ; dialogue de modification des fonctions (année non modifiable) ; lien « Ordre de cette année » vers `/membres/ordre?annee=<label>`. L'ordre n'est ni affiché en saisie ni modifiable ici. Aucune année existante : « Créez d'abord une année Rotary. » et lien vers `/annees`.
- [X] T033 [US4] Créer `apps/admin/src/app/(admin)/membres/ordre/page.tsx` : choix de l'année (`?annee=<label>`) ; lecture de `GET /admin/mandates?year=` (ordre) et de `GET /admin/members?year=&limit=100`, **page après page jusqu'à `totalPages`**, pour les noms ; sans année : invitation à en choisir une ; année sans mandat : état vide.
- [X] T034 [US4] Créer `apps/admin/src/app/(admin)/membres/_components/MandateOrderList.tsx` (Client Component) : rang, nom et prénom, fonctions ; boutons « Monter » et « Descendre » avec `aria-label` nommant la personne, inactifs en bout de liste, utilisables au clavier, le focus suivant la ligne déplacée ; « Enregistrer l'ordre » (inactif sans changement et pendant l'envoi) ; « Annuler les changements » ; message de liste changée avec « Recharger » ; avertissement en quittant la page avec un ordre non enregistré.
- [X] T035 [US4] Vérification manuelle : dérouler `quickstart.md`, section 4, puis la ligne « Supprimer une année utilisée » de la section 3. Vérifier par l'API que le réordonnancement numérote de 1 à n. Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: membres, mandats et ordre se gèrent.

---

## Phase 7: User Story 5 - Gérer les actions (Priority: P1)

**Goal**: actions (liste, création, modification, publication, impact, ordre, suppression).

**Independent Test**: `quickstart.md`, section 5.

### Implementation for User Story 5

- [X] T036 [P] [US5] Créer `apps/admin/src/components/RotaryYearField.tsx` (Client Component, partagé par les actions et les actualités) : liste déroulante des années. Il reçoit de la page, pour chaque année, ses deux bornes **déjà exprimées par `dates.ts` dans la forme du champ de date du formulaire** (`AAAA-MM-JJ` en temps universel pour une action ; `AAAA-MM-JJTHH:mm` en heure de Madagascar pour une actualité), et la valeur courante du champ de date : la comparaison est une simple comparaison de chaînes, **sans aucun calcul de fuseau dans ce fichier** (décision 6). Il présélectionne l'année qui contient la date, avec la mention « Année proposée d'après la date. », tant que l'administrateur n'a pas choisi lui-même, et ne l'écrase plus ensuite ; il affiche l'avertissement non bloquant « Cette date ne tombe pas dans l'année Rotary choisie. » ; sans aucune année : « Créez d'abord une année Rotary. » et lien vers `/annees`.
- [X] T037 [P] [US5] Créer `apps/admin/src/components/SlugField.tsx` (champ facultatif, aide « Laissé vide, il est généré à partir du titre », `maxLength` 120, jamais recalculé quand le titre change) et `apps/admin/src/components/PublishedSlugDialog.tsx` (dialogue « L'adresse publique de ce contenu va changer. », « Annuler » / « Confirmer »).
- [X] T038 [US5] Créer `apps/admin/src/app/(admin)/actions/actions.ts` : créer (`POST /admin/actions` : `title`, `date` en `AAAA-MM-JJ`, `rotaryYear` ; `slug`, `summary`, `description`, `focusAreas`, `isPublished`, `order` seulement s'ils sont renseignés ; `impact` avec **les seules rubriques renseignées**, omis si aucune ; `partners` : une ligne non vide par partenaire), modifier (`PATCH` : `summary`, `description`, `order` vidés → `null` ; `impact` : objet des rubriques renseignées, ou `null` si toutes sont vides ; `slug` seulement s'il diffère du slug d'origine), publier et dépublier (`PATCH { isPublished }`, avis `publie` ou `depublie`), supprimer. `409` → « Ce slug est déjà utilisé. » en tête ; `400` → messages de l'API sous les champs, y compris `impact.objective` et les autres rubriques. Aucun `photos`, aucun `publishedAt`.
- [X] T039 [US5] Créer `apps/admin/src/app/(admin)/actions/page.tsx` et `apps/admin/src/app/(admin)/actions/_components/ActionsTable.tsx` : `GET /admin/actions` avec `q`, `annee`→`year`, `domaine`→`focusArea`, `publie`→`published`, `tri`→`sort`, `page` ; colonnes État (pastille « Brouillon » ou « Publié »), Titre, Date (formatée par `dates.ts`, sans heure), Année, Ordre, actions Ouvrir, Publier ou Dépublier, Supprimer ; filtres Année, Domaine (sept libellés), Publication ; tri Date (`-date` par défaut), Titre, Date de création, dans les deux sens ; pagination, états vides, erreurs de paramètre ; « Nouvelle action ». Année et Ordre masqués sous 600 px.
- [X] T040 [US5] Créer `apps/admin/src/app/(admin)/actions/_components/ActionForm.tsx` selon `contracts/screens.md` : Contenu (Titre* `maxLength` 120, `SlugField`, Résumé `maxLength` 500, Description `maxLength` 20000 avec l'aide « Séparez les paragraphes par une ligne vide ») ; Calendrier (Date* `type="date"`, `RotaryYearField`) ; Domaines (sept cases à cocher) ; Impact facultatif (Objectif, Bénéficiaires, Lieu, Période, Résultats : `maxLength` 500 chacun ; Partenaires : un par ligne, 20 au plus, 120 caractères chacun) ; Publication (interrupteur « Publié », Ordre manuel `type="number"` `min=1` facultatif, « Première publication le … » si `publishedAt` existe). À l'envoi, si l'action est publiée et que le slug diffère de celui d'origine : `PublishedSlugDialog` avant l'envoi. Erreurs sous les champs, conflit en tête, saisie conservée, bouton inactif pendant l'envoi. Aucun champ de photographie ; aucun texte d'attente dans l'impact.
- [X] T041 [US5] Créer `apps/admin/src/app/(admin)/actions/nouvelle/page.tsx` et `apps/admin/src/app/(admin)/actions/[id]/page.tsx` (lecture de `GET /admin/actions/:id` et des années ; introuvable → page « introuvable » ; suppression avec `ConfirmDialog`).
- [X] T042 [US5] Vérification manuelle : dérouler `quickstart.md`, section 5, en contrôlant par l'API les rubriques d'impact enregistrées et leur retrait. Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les actions se gèrent.

---

## Phase 8: User Story 6 - Gérer les actualités (Priority: P1)

**Goal**: actualités, avec la date et l'heure en heure de Madagascar.

**Independent Test**: `quickstart.md`, section 6.

### Implementation for User Story 6

- [X] T043 [US6] Créer `apps/admin/src/app/(admin)/actualites/actions.ts` : créer (`POST /admin/news` : `title`, `type`, `rotaryYear`, et `date` = **l'instant UTC obtenu par `dates.ts`** depuis la valeur `AAAA-MM-JJTHH:mm` saisie en heure de Madagascar ; valeur mal formée → message « La date doit être au format ISO 8601. » sous le champ, sans appel à l'API ; `slug`, `location`, `summary`, `content`, `isPublished` seulement s'ils sont renseignés), modifier (`PATCH` : `location`, `summary`, `content` vidés → `null`, **jamais de chaîne vide** ; `slug` seulement s'il a changé), publier et dépublier, supprimer. `409` → « Ce slug est déjà utilisé. ». Aucun `photos`, `publishedAt`, `order` ni `impact`. Aucun décalage écrit dans ce fichier.
- [X] T044 [US6] Créer `apps/admin/src/app/(admin)/actualites/page.tsx` et `apps/admin/src/app/(admin)/actualites/_components/NewsTable.tsx` : `GET /admin/news` avec `q`, `annee`→`year`, `type`, `publie`→`published`, `tri`→`sort`, `page` ; colonnes État, Type (libellé), Titre, Date et heure (**heure de Madagascar**, par `dates.ts`), Année, actions Ouvrir, Publier ou Dépublier, Supprimer ; filtres Année (c'est ainsi que les archives se consultent), Type (cinq libellés), Publication ; tri Date, Titre, Date de création ; pagination, états vides, erreurs de paramètre ; « Nouvelle actualité ».
- [X] T045 [US6] Créer `apps/admin/src/app/(admin)/actualites/_components/NewsForm.tsx` : Contenu (Titre* `maxLength` 120, `SlugField`, Type* parmi les cinq, Lieu `maxLength` 120, Résumé `maxLength` 500, Contenu `maxLength` 20000 avec l'aide sur les paragraphes) ; Calendrier (« Date et heure (heure de Madagascar) »* en `type="datetime-local"`, préremplie par la valeur que la page a calculée avec `dates.ts` ; `RotaryYearField`, alimenté par des instants déjà convertis) ; Publication (« Publié », « Première publication le … »). `PublishedSlugDialog` comme pour les actions. Ni photographie, ni ordre, ni impact, ni domaine, ni date de fin.
- [X] T046 [US6] Créer `apps/admin/src/app/(admin)/actualites/nouvelle/page.tsx` et `apps/admin/src/app/(admin)/actualites/[id]/page.tsx` (lecture de `GET /admin/news/:id` et des années ; conversion de `date` en valeur de champ par `dates.ts` ; introuvable → page « introuvable » ; suppression).
- [X] T047 [US6] Vérification manuelle : dérouler `quickstart.md`, section 6 — en particulier 15/09/2026 18:30 → `2026-09-15T15:30:00.000Z` par l'API ; 10/10/2026 01:00 → `2026-10-09T22:00:00.000Z` et affichage au 10/10 ; mêmes date et heure après changement du fuseau de l'ordinateur ; 01/07/2027 02:00 → année proposée 2026-2027 et avertissement si 2027-2028 est choisie. Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les actualités se gèrent, dans le bon fuseau.

---

## Phase 9: User Story 7 - Consulter et supprimer les candidatures (Priority: P1)

**Goal**: liste, fiche, CV, contact, suppression — sans rien exposer du stockage.

**Independent Test**: `quickstart.md`, section 7.

### Implementation for User Story 7

- [X] T048 [US7] Créer `apps/admin/src/app/(admin)/candidatures/page.tsx` et `apps/admin/src/app/(admin)/candidatures/_components/ApplicationsTable.tsx` : `GET /admin/applications` avec `q`, `du`→`from` et `au`→`to` (jours de Madagascar convertis en bornes UTC **par `dates.ts`**), `tri`→`sort`, `page` — **aucun autre paramètre** ; colonnes Nom, Prénom, Email, Situation (libellé), Date de candidature (heure de Madagascar), action Ouvrir ; période « Du » / « Au » (`type="date"`) ; tri Date de candidature (`-createdAt` par défaut) et Nom, dans les deux sens ; pagination ; les deux états vides (« aucune candidature » sans action de création). Aucun filtre par situation, aucun bouton de création. Email masqué sous 600 px.
- [X] T049 [US7] Créer `apps/admin/src/app/(admin)/candidatures/actions.ts` : suppression (`DELETE /admin/applications/:id`) — `204` → `revalidatePath`, retour à la liste d'origine avec l'avis `supprime` (fichier présent ou déjà absent : même issue) ; `503` → état d'échec avec le message de l'API « Service indisponible. », **sans redirection**, la fiche restant affichée ; `404` → retour à la liste avec « Ressource introuvable. ». Aucune autre action : ni création, ni modification.
- [X] T050 [US7] Créer `apps/admin/src/app/(admin)/candidatures/[id]/page.tsx` : lecture de `GET /admin/applications/:id` ; Prénom, Nom, Email, Téléphone, Situation, Date de candidature ; CV : nom d'origine, type lisible (PDF, Word), taille en Ko ou Mo ; « Télécharger le CV » (lien vers `/candidatures/[id]/cv`), « Contacter par email » (lien `mailto:` vers l'email du candidat, rien d'autre), « Supprimer » (`ConfirmDialog` : « Le CV sera supprimé avec la candidature. », message d'échec `503` affiché, nouvel essai possible) ; alertes `?cv=introuvable` → « Le fichier du CV est introuvable. » et `?cv=indisponible` → « Service indisponible. ». Aucun champ modifiable, aucun état de traitement.
- [X] T051 [US7] Créer `apps/admin/src/app/(admin)/candidatures/[id]/cv/route.ts` : `GET` ; sans cookie → redirection vers `/connexion` ; appelle `GET /admin/applications/:id/cv` par l'aide de réponse brute de `api.ts` ; `200` → renvoie le flux avec **uniquement** `Content-Type`, `Content-Length`, `Content-Disposition` et `Cache-Control: no-store` repris de l'API ; `401` → `/session/fin?motif=expiree` ; `404` → redirection vers la fiche avec `?cv=introuvable` ; `503`, délai ou autre erreur → `?cv=indisponible`. Aucun en-tête de l'API n'est relayé en dehors de ces quatre ; rien n'est journalisé ni mis en cache.
- [X] T052 [US7] Vérification manuelle : dérouler `quickstart.md`, section 7 (liste, recherche, période du jour de Madagascar, période inversée, tris ; fiche ; CV téléchargé identique par empreinte et sous son nom d'origine ; `mailto:` ; fichier retiré chez le fournisseur → message, puis suppression réussie ; suppression avec CV présent ; API au secret de stockage faux → « Service indisponible. » au téléchargement et à la suppression, candidature toujours présente ; aucune occurrence de « cloudinary », d'identifiant ni d'adresse de stockage dans les pages, les réponses et les en-têtes). Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les candidatures se consultent et se suppriment.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: erreurs transverses, écrans étroits, accessibilité, conformité, documents, contrôles de fin d'étape.

- [X] T053 Erreurs et états transverses : dérouler `quickstart.md`, section 8 (API arrêtée en lecture puis en écriture, ressource supprimée entre-temps, double clic, page au-delà de la dernière) sur **les cinq domaines**. Vérifier que chaque liste a ses états d'attente, d'erreur et vides, et que chaque opération donne un avis ou un message. Corriger dans `apps/admin/src/` tout écart, puis rejouer.
- [X] T054 Écrans étroits : parcourir tous les écrans à 1280, 800 et 400 px de large. Attendu (`plan.md`, B12) : tiroir sous 900 px ; tableaux défilant dans leur conteneur ; colonnes secondaires masquées sous 600 px ; formulaires en une colonne ; dialogues utilisables ; aucun débordement horizontal de la page. Corriger dans `apps/admin/src/` et rejouer.
- [X] T055 Accessibilité : parcourir tous les écrans au clavier seul. Attendu : lien d'évitement ; un `h1` par écran ; focus visible ; libellés associés aux champs ; erreurs reliées par `aria-describedby` et focus sur le premier champ en erreur ; avis en `role="status"`, erreurs en `role="alert"` ; dialogues à focus piégé, fermables par Échap ; boutons d'icône avec `aria-label` ; ordre des mandats entièrement utilisable au clavier ; contrastes AA du thème. Corriger dans `apps/admin/src/` et rejouer.
- [X] T056 Relecture de conformité de `apps/admin/src/` contre les « Décisions verrouillées » : une recherche de `+03:00`, `Antananarivo` et `getTimezoneOffset` ne renvoie que `lib/dates.ts` ; une recherche de `cloudinary`, `publicId`, `localStorage`, `sessionStorage`, `NEXT_PUBLIC`, `console.log` ne renvoie rien ; les seules adresses d'API appelées sont les 29 de `contracts/api-usage.md` ; aucun paramètre de liste hors contrat (dont tout filtre par situation) ; aucun `order` de mandat, `photos`, `portrait` ni `publishedAt` envoyé ; aucun import depuis `apps/web` ou `apps/api` ; les seuls messages propres au Back Office sont ceux de `contracts/screens.md`. Corriger tout écart.
- [X] T057 Contrôler : `npm run lint`, puis `npm run build:admin`, `npm run build:web` et `npm run build:api` depuis la racine. Corriger toute erreur dans `apps/admin/` uniquement. Vérifier ensuite que ni la valeur d'`API_URL` ni le jeton n'apparaissent dans `apps/admin/.next/static`.
- [X] T058 [P] Aligner les documents sur ce qui existe : `ARCHITECTURE.md` (en-tête d'état ; section 11 : « Structure prévue (non créée) » devient la structure réelle, avec `session/fin`, `acces-refuse`, `components/` et les fichiers de `lib/` ; MUI « installé ») ; `PROJECT_CONTEXT.md` (état, section « apps/admin », tableau des technologies, « Fait » et « Prochaines étapes », retrait de « spécification visuelle du Back Office » des points repoussés, points d'attention : cookie `Secure` vérifié avec Chrome ou Firefox en local, fuseau des actualités à traiter à la migration du Front Office, cinq dépendances ajoutées à `apps/admin`) ; ligne d'état et section « Decided constraints » de `CLAUDE.md` (MUI en place, Back Office construit). Ne modifier ni `DESIGN.md`, ni la constitution, ni aucune décision.
- [X] T059 Périmètre et secrets : `git status` ne montre aucun fichier modifié dans `apps/web`, `apps/api/src`, `DESIGN.md`, `.specify/memory/constitution.md`, `packages/` ; aucun `.env` ni `.env.local` listé ; `apps/admin/.env.example` ne contient aucune valeur ; `apps/admin/package.json` ne gagne que les cinq dépendances ; aucun fichier ni outillage de test ; une recherche des valeurs de `apps/api/.env` et de `apps/admin/.env.local` dans les fichiers versionnables ne renvoie rien, sans jamais afficher ces valeurs.
- [X] T060 Nettoyage et non-régression : dérouler `quickstart.md`, section 9 — supprimer **par le Back Office** toutes les données de vérification ; vérifier `applications`, `news`, `actions`, `members`, `membermandates`, `rotaryyears` à 0, `admins` à 1, aucun fichier de CV au stockage ; `GET /api/v1/health` et une lecture publique répondent comme avant ; `npm run dev:web` affiche le Front Office inchangé.
- [X] T061 Dérouler `quickstart.md` **en entier** une dernière fois (sections 1 à 10), refaire le nettoyage de T060, et consigner dans ce fichier, section par section, ce qui a été vérifié et ce qui ne l'a pas été. Ne cocher cette tâche que si toutes les sections ont réellement été déroulées.

---

## État au 2026-10-02 : implémenté et vérifié

**Les 61 tâches sont cochées.** T001 et T059 l'ont été après la décision du porteur du projet, le 2026-10-02 : `@emotion/cache` est **validée** comme sixième dépendance explicite, nécessaire à `@mui/material-nextjs` avec l'installation sans hoisting (`plan.md`, section D). Les autres écarts de structure de la section D sont acceptés ; aucune refonte n'est faite pour reproduire le plan.

Clôture du 2026-10-02 : `apps/admin/.env.local` a été créé (`API_URL`, ignoré par Git) ; sur le build de production lancé **sans** `API_URL` au lancement, la connexion du compte existant, le cookie de session, les cinq écrans protégés et la déconnexion ont été revérifiés, ainsi que lint, les trois builds et `git diff --check`.

Restent **non jugés**, et non présentés comme vérifiés : le focus visible à l'œil, l'usage d'un lecteur d'écran, Safari. `ADMIN_EMAIL` et `ADMIN_PASSWORD` restent dans `apps/api/.env`, par décision du porteur du projet ; ce fichier est ignoré par Git et n'est modifié par aucune tâche.

Les vérifications ont été faites **dans un vrai navigateur** (Chrome sans interface, piloté par le protocole DevTools, sans rien ajouter au dépôt), contre l'API lancée depuis son build, la base MongoDB Atlas et le compte Cloudinary du projet. Le quickstart a été déroulé une première fois récit par récit sur le serveur de développement, puis **en entier sur le build de production** (`next start`). `apps/admin/.env.local` n'existant pas, `API_URL` a été passée au lancement.

| Section du quickstart | État |
|---|---|
| 1. Connexion et protection | **Vérifié** : redirection sans session sur quatre adresses, dont le CV ; champs vides, mot de passe faux et email inconnu (même message, email conservé, mot de passe non renvoyé) ; sixième tentative `429` ; cookie `httpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, durée de 28 799 secondes ; rien dans `document.cookie`, `localStorage` ni `sessionStorage` ; aucune requête du navigateur vers l'API ; `/connexion` en étant connecté ; cookie altéré en lecture puis à l'envoi d'un formulaire → connexion avec le message, cookie effacé, sans boucle ; déconnexion et bouton « précédent ». |
| 2. Navigation et accueil | **Vérifié** : six entrées, entrée en cours, email affiché, accueil sans chiffre, un seul `h1`, lien d'évitement ; tiroir à 800 px, fermé par Échap ; aucun débordement à 400 px ; adresses inconnues avec la navigation. |
| 3. Années Rotary | **Vérifié** : état vide ; création, libellé, 01/07 et 30/06, « En cours », ordre ; doublon ; 1999 et vide ; suppression confirmée ; année utilisée conservée avec son message ; aucune modification. |
| 4. Membres et mandats | **Vérifié** : création, erreurs sous les champs, saisie conservée, focus sur le premier champ en erreur ; tris, recherche entière et partielle, recherche d'un caractère (message, liste conservée), page au-delà de la dernière ; retour d'une fiche avec recherche et tri ; champs effacés (`null` par l'API) ; mandat à deux fonctions, sans fonction, en double ; fonctions remplacées, année non modifiable ; filtres année et fonction ; ordre déplacé, enregistré, conservé, numéroté de 1 à n par l'API ; liste devenue incomplète (message, aucun ordre modifié, rechargement) ; suppression d'un mandat ; confirmation de suppression d'un membre ; aucun portrait. |
| 5. Actions | **Vérifié** : aucune année ; année proposée, choix manuel non écrasé, avertissement d'écart ; brouillon et slug généré ; titre modifié sans effet sur le slug ; impact (rubriques renseignées seulement, puis retrait complet) ; publication par le formulaire et par la liste, date de première publication inchangée ; avertissement de slug publié (annuler, confirmer), aucun pour un brouillon ; slug déjà pris, réservé, mal formé ; ordre 2, vide, 0 ; filtres, recherche, tris ; suppression ; aucune photographie. |
| 6. Actualités | **Vérifié** : cinq types ; 15/09/2026 18:30 → `2026-09-15T15:30:00.000Z`, affiché et prérempli à 18:30 ; mêmes valeurs et même instant enregistré avec l'ordinateur réglé sur `America/New_York` ; 10/10/2026 01:00 → `2026-10-09T22:00:00.000Z`, affiché le 10/10 ; 01/07/2027 02:00 → année proposée 2026-2027, 03:00 → 2027-2028, avertissement si l'année choisie ne contient pas la date ; champs effacés ; slug `archives` ; publication ; filtres année (archives, brouillons compris), type, publication ; suppression ; ni photographie, ni ordre, ni impact, ni domaine. |
| 7. Candidatures | **Vérifié** : liste, situation en clair, date en heure de Madagascar ; recherche entière et partielle ; période du jour de Madagascar, veille, période inversée, date mal formée ; quatre tris ; aucun filtre par situation ; fiche ; CV PDF et DOCX identiques par empreinte, sous leur nom d'origine, avec `Content-Type`, `Content-Length`, `Content-Disposition` et `Cache-Control: no-store` ; `mailto:` ; fichier retiré chez le fournisseur → message, puis suppression réussie ; stockage en erreur → « Service indisponible. » au téléchargement et à la suppression, candidature et fichier conservés, puis nouvel essai réussi ; aucune référence de stockage dans la page, les données reçues ni les en-têtes. |
| 8. Erreurs transverses | **Vérifié** : ressource supprimée entre-temps (retour à la liste avec le message, fiche introuvable) ; triple clic → une seule création ; API arrêtée en écriture (message générique, saisie conservée) et en lecture sur les cinq domaines (message, « Réessayer », navigation présente, aucun détail technique) ; reprise par « Réessayer » ; états « aucun résultat ». |
| 9. Nettoyage et non-régression | **Vérifié** : données supprimées par le Back Office ; `applications`, `news`, `actions`, `members`, `membermandates`, `rotaryyears` à 0, `admins` à 1, aucun fichier de CV au stockage ; santé et lectures publiques de l'API ; les cinq pages du Front Office répondent. |
| 10. Fin d'étape | **Vérifié** : lint, `build:admin`, `build:web`, `build:api` réussis ; rien de modifié dans `apps/web`, `apps/api`, `DESIGN.md`, la constitution, `packages/` ; aucun `.env` listé ; `.env.example` sans valeur ; aucune valeur de `apps/api/.env` dans les fichiers versionnables ; ni adresse de l'API ni nom du cookie dans `.next/static` ; aucun outillage de test. Six dépendances, la sixième validée le 2026-10-02. |

Écrans étroits (T054) : quinze écrans à 1280, 800 et 400 px sans débordement horizontal ; colonnes secondaires masquées et tableau défilant à 400 px ; dialogue et formulaire utilisables. Accessibilité (T055) : un `h1` par écran, tous les champs libellés, tous les boutons nommés, `lang="fr"`, lien d'évitement, erreur reliée à son champ, focus piégé dans les dialogues et fermeture par Échap, avis en `role="status"`, erreurs en `role="alert"`, ordre des mandats au clavier, contrastes de 6,5 à 15,6.

Défauts trouvés et corrigés pendant la vérification :

- **Module introuvable** au premier rendu : `@emotion/cache` non résolu → dépendance déclarée (écart ci-dessus).
- **Code serveur importé par un composant du navigateur** : `form-state.ts` importait le client d'API ; la conversion des erreurs a été déplacée dans `lib/form-errors.ts`.
- **API injoignable** : le layout protégé échouait avant la page, sans navigation ni « Réessayer » ; il garde maintenant le cadre et laisse l'écran afficher l'erreur.
- **Journal de développement** : `next dev` écrivait un terme de recherche et l'email saisi à la connexion ; désactivé dans `next.config.ts`, puis revérifié (aucune ligne).
- **Règle de lint** sur l'avis (`Notice`) : état dérivé pendant le rendu plutôt que dans un effet.

Limite de la vérification : le focus visible et l'usage d'un lecteur d'écran n'ont pas été jugés à l'œil ni à l'oreille ; seuls les attributs et le comportement au clavier ont été contrôlés. Safari n'a pas été essayé (cookie `Secure` sur `localhost`, P1).

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (phase 1)** : T001 d'abord (T008 en dépend). T002 indépendante. T003 avant T008 et T018.
- **Foundational (phase 2)** : dépend de la phase 1. T004 à T007 en parallèle. T008 après T001 et T003. T009 → T010 (qui dépend aussi de T004 et T007). T011 et T012 après T008. Bloque tous les récits.
- **US1 (phase 3)** : dépend de la phase 2. T013 → T014 ; T015, T016, T017 indépendantes entre elles ; T018 après T010 ; T019 en dernier.
- **US2 (phase 4)** : dépend de US1 (le layout protégé).
- **US3 (phase 5)** : dépend de US2.
- **US4 (phase 6)** : dépend de US3 (un mandat exige une année).
- **US5 (phase 7)** : dépend de US3. Indépendante de US4.
- **US6 (phase 8)** : dépend de US3 et de T036, T037 (créés en US5).
- **US7 (phase 9)** : dépend de US2 seulement. Indépendante de US3 à US6.
- **Polish (phase 10)** : après tous les récits. T053 à T056 avant T057 ; T058 en parallèle ; T060 après T059 ; T061 en dernier.

### Within Each User Story

- `actions.ts` d'un domaine, puis ses pages et composants ; la vérification manuelle clôt le récit.
- `apps/admin/src/app/(admin)/membres/actions.ts` est créé par T027 puis complété par T031 ; `apps/admin/src/app/(admin)/layout.tsx` par T018 puis T022 ; `apps/admin/src/app/(admin)/page.tsx` par T018 puis T022. Ces tâches se font **l'une après l'autre**.
- Aucun écran protégé n'existe avant T015 et T018 : rien n'est jamais accessible sans protection.

### Parallel Opportunities

- T002 pendant T001.
- T004, T005, T006, T007 ; puis T011 et T012.
- T016 et T017.
- T020 pendant T021.
- T036 et T037.
- US5, US6 et US7 peuvent avancer en parallèle une fois US3 terminé (US6 après T036 et T037).
- T058 pendant T053 à T057.

## Parallel Example: Foundational

```text
T004 : apps/admin/src/types/*.ts
T005 : apps/admin/src/lib/labels.ts
T006 : apps/admin/src/lib/dates.ts
T007 : apps/admin/src/lib/form-state.ts
puis T008 : thème et layout racine
puis T009 → T010 : session, client d'API
puis T011 et T012 : composants partagés
```

## Implementation Strategy

### MVP First (User Story 1 Only)

Phases 1 et 2, puis US1 : l'administrateur se connecte, est protégé, se déconnecte. Arrêt et validation. À ce stade aucune donnée n'est encore gérable.

### Incremental Delivery

1. Préparation de `apps/admin`, thème, session, client d'API, éléments partagés.
2. US1 (connexion et protection), vérification, validation.
3. US2 (navigation et états communs), vérification, validation.
4. US3 (années), vérification, validation.
5. US4 (membres, mandats, ordre), vérification, validation.
6. US5 (actions), vérification, validation.
7. US6 (actualités et fuseau), vérification, validation.
8. US7 (candidatures et CV), vérification, validation.
9. Polish : erreurs transverses, écrans étroits, accessibilité, conformité, documents, non-régression, quickstart complet.

Un seul intervenant : pas de stratégie d'équipe. Les arrêts pour validation suivent la constitution (principe II) ; aucun commit sans demande explicite (principe XI).

## Couverture des exigences

| Exigences | Tâches |
|---|---|
| FR-001, FR-002, FR-008 | T009, T013, T014 |
| FR-003, FR-005 | T010, T015, T016, T017, T018 |
| FR-004 | T002, T009, T010, T056, T057 |
| FR-006, FR-007 | T014, T018, T021 |
| FR-008b | T015, T016, T017, et les pages de chaque récit ; T056 |
| FR-009 | T021, T022 |
| FR-010, FR-011, FR-012 | T011, T012, T020, T028, T039, T044, T048, T053 |
| FR-013, FR-014 | T011, et les actions de chaque récit |
| FR-015, FR-016, FR-017, FR-018, FR-019 | T007, T010, et les formulaires de chaque récit ; T053 |
| FR-020 | T005, T008 |
| FR-021 | T021, T054, T055 |
| FR-022 à FR-025 | T024, T025 |
| FR-026, FR-027, FR-033 | T027, T028, T029, T030 |
| FR-028, FR-029, FR-030, FR-032 | T030, T031, T032 |
| FR-031 | T031, T033, T034 |
| FR-034, FR-038, FR-039, FR-040, FR-041 | T038, T039, T040, T041 |
| FR-035 | T006, T036 |
| FR-036, FR-037 | T037, T038, T040, T045 |
| FR-042, FR-043, FR-044, FR-045, FR-047 | T043, T044, T045, T046 |
| FR-046 | T006, T043, T044, T045, T046, T056 |
| FR-048 | T006, T048 |
| FR-049, FR-051 | T050, T051 |
| FR-050 | T049, T050 |
| FR-052, FR-053, FR-054 | T048 à T051, T056 |
| FR-055 | T008, T021, T054, T055 |
| FR-056, FR-057 | T056, T059 |
| SC-001 à SC-012 | T019, T023, T026, T035, T042, T047, T052, T053, T060, T061 |

## Notes

- Aucune tâche n'écrit de test automatisé, de gestion de compte, de mot de passe oublié, de photographie, d'état de candidature, d'envoi d'email, d'aperçu du Front Office, ni de tableau de bord.
- Aucune tâche n'ajoute Docker, CI/CD, déploiement, ni dépendance hors des cinq prévues.
- Aucune tâche ne touche `apps/web`, `apps/api`, `DESIGN.md`, la constitution ni `packages/`. Seule T058 modifie `ARCHITECTURE.md`, `PROJECT_CONTEXT.md` et `CLAUDE.md`, pour décrire ce qui existe ; les six alignements de décision d'`ARCHITECTURE.md` ont été appliqués avant le plan.
- Aucune tâche ne crée ni ne modifie `apps/admin/.env.local` ni `apps/api/.env`.
- Aucun message n'est créé pendant l'implémentation : ceux de l'API et ceux de `contracts/screens.md` suffisent.
- Une contradiction découverte en cours de route, ou un besoin que l'API ne couvre pas, est signalé, pas résolu d'autorité (constitution, principe I).
