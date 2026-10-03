# Tasks: Intégration du Front Office avec l'API

**Input**: Design documents from `/specs/009-front-office-integration/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/data-layer.md, contracts/application-form.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX) : ni Jest, ni Vitest, ni Playwright, ni Cypress. Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`.

**Organization**: les tâches sont groupées par récit utilisateur, dans l'ordre de la spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US7).

## Path Conventions

Tout le code vit dans `apps/web/`. Les commandes npm se lancent depuis la racine du dépôt. Style de `apps/web` : TypeScript 5 strict, ESLint, guillemets doubles, CSS Modules et tokens, alias `@/*` → `./src/*`. Avant d'écrire du code Next.js, consulter la documentation embarquée (`apps/web/node_modules/next/dist/docs/`), comme le demande `apps/web/AGENTS.md`.

## Décisions verrouillées à respecter

1. **T001 et T002 d'abord** : `DESIGN.md` et `ARCHITECTURE.md` sont alignés avant toute modification de code, et seulement sur les passages de `plan.md`, section A.
2. **Couche de données** : les pages ne lisent leurs données que par `apps/web/src/data/*`. Aucun composant, aucune page n'appelle `fetch`.
3. **Serveur seulement** : le client d'API et `API_URL` restent côté serveur. Aucune variable `NEXT_PUBLIC_*`. Le navigateur n'appelle jamais l'API ; aucun jeton, aucun secret, aucune adresse d'API ne lui parvient.
4. **Opérations** : uniquement les huit de `contracts/data-layer.md`. Aucune route `/admin/*`. `apps/api` et `apps/admin` ne sont pas modifiés ; un besoin non couvert est **signalé**, pas résolu.
5. **Aucune dépendance** n'est ajoutée à `apps/web`.
6. **Cache** : revalidation de Next.js réglée à 60 secondes, valeur écrite une seule fois dans `src/lib/api.ts`. Objectif de fraîcheur : environ 60 secondes, **sans garantie à la seconde près** ; SC-013 se vérifie au seuil de 90 secondes. Une visite ne déclenche pas systématiquement une lecture de l'API. Une revalidation qui échoue ne remplace pas volontairement par un état vide un contenu déjà correctement mis en cache ; la couche de données n'écrit jamais de valeur vide dans le cache. Limites connues : cache local au serveur, vidé par un build ou un redéploiement.
7. **Listes** : actions et actualités lues en entier, `limit=100` par demande, pages assemblées dans l'ordre de l'API. Aucune pagination visible, aucun « voir plus », aucun compteur de pages. Les filtres existants restent.
8. **Récupération partielle** : première lecture impossible sans cache → état vide de repli ; page déjà en cache dont la revalidation échoue → dernière réponse correcte conservée ; page jamais lue et inaccessible → éléments disponibles affichés avec l'unique mention « Cette liste est incomplète pour le moment. », dans le style de la mention « Contenu à venir ». Jamais une liste partielle présentée comme complète, jamais une liste vide à sa place.
9. **Fuseau** : `apps/web/src/lib/dates.ts` est le seul fichier à porter un fuseau. Jour, mois et regroupement mensuel des actualités en heure de Madagascar ; **l'heure n'est jamais affichée**.
10. **Contenu** : aucun contenu inventé. Un champ absent n'est pas rendu, sans texte de remplacement. Aucune occurrence de « Donnée à venir ». Aucun profil de démonstration. Aucune année écrite en dur. Les emplacements photographiques restent des gabarits.
11. **Candidature** : Server Action ; `FormData` reconstruit côté serveur avec **exactement** six champs (`firstName`, `lastName`, `email`, `phone`, `applicantStatus`, `cv`) ; envoi immédiat, sans cache ; corps admis : 6 Mo ; rien n'est conservé ni journalisé ; aucune référence de stockage ni le nom du prestataire vers le navigateur.
12. **CV de 5 Mo : vérification réelle obligatoire, aucun repli automatique.** Si le passage d'un fichier de 5 242 880 octets par la Server Action échoue, **arrêter** l'implémentation de la candidature, décrire précisément l'incompatibilité, et attendre une validation. Aucun gestionnaire de route n'est créé à la place.
13. **Messages validés**, à l'identique : « Le fichier est trop volumineux. » ; « Le format du CV n'est pas accepté. » ; « Trop de demandes. Veuillez réessayer plus tard. » ; « Service temporairement indisponible. Veuillez réessayer plus tard. » ; « Envoi en cours… » ; aide du champ CV : « Un fichier PDF ou Word, de 5 Mo au plus. » ; liste incomplète : « Cette liste est incomplète pour le moment. ». Aucun autre message n'est créé.
14. **Design** : compositions, grille, typographie, couleurs et composants de `DESIGN.md` conservés. Les trois `loading.tsx` sont sobres, techniques, aux dimensions du contenu, sans composition éditoriale nouvelle. Aucune modification de `DESIGN.md` au-delà de T001.
15. **SC-007 et SC-013** ne sont pas reformulés ; `spec.md` n'est pas modifié.
16. Ni Docker, ni CI/CD, ni déploiement, ni test automatisé. Aucun commit, push ni merge sans demande explicite.

## Prérequis manuels (hors tâches)

1. `apps/api/.env` renseigné ; l'API et le Back Office en état de marche ; le mot de passe du compte d'administration.
2. `apps/web/.env.local`, créé **à la main par le porteur du projet** : `API_URL=http://localhost:4000/api/v1`. Aucune tâche ne crée ni ne modifie ce fichier.
3. Des fichiers factices hors du dépôt : PDF, DOC, DOCX, un fichier de 5 242 880 octets et un de 5 242 881 octets commençant par `%PDF-`, un fichier texte renommé en `.pdf`.

Si l'un manque au moment de vérifier, le signaler et laisser les tâches de vérification concernées non cochées : aucune vérification n'est inventée. Les vérifications de cache et d'indisponibilité se font sur `npm run build:web` puis `npm run start --workspace=web`, jamais sur `next dev`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: aligner les sources de vérité, puis préparer la configuration de `apps/web`.

- [X] T001 Appliquer à `DESIGN.md` les alignements D1 à D4 de `plan.md`, section A, et rien d'autre : section 8, suppression de la puce « Profils de démonstration » ; section 10, remplacement du paragraphe « Le registre d'impact » par : aucun registre d'impact agrégé n'est affiché tant qu'aucune donnée réelle ne le porte, et « Donnée à venir » n'est écrit nulle part (la phrase « L'impact n'affiche que des données réelles. » reste) ; ligne « Actions » des compositions de pages, suppression de « Registre d'impact sur champ encre. » ; toute autre mention du registre d'impact ou des profils de démonstration, alignée de même. Aucune direction visuelle nouvelle.
- [X] T002 Appliquer à `ARCHITECTURE.md` les alignements A1 à A6 de `plan.md`, section A, et rien d'autre : section 10, puce « Cache » (revalidation par durée, configurée à environ 60 secondes ; visible en une minute environ, sans garantie à la seconde près ; une visite ne déclenche pas systématiquement une lecture ; une revalidation qui échoue ne remplace pas volontairement par un état vide un contenu déjà correctement mis en cache, tant que le cache existe) ; section 10, écart 3 (jour et mois d'une actualité en heure de Madagascar, jamais l'heure, fil groupé par mois dans ce fuseau) ; section 10, lecture complète des listes d'actions et d'actualités par pages de 100, sans pagination visible ; section 14, ajout de la décision 20 « Cache du Front Office », complément de la décision 19, retrait de la seule ligne ouverte « Cache du Front Office ». **La ligne ouverte « Registre d'impact agrégé de la page Actions » n'est ni retirée ni modifiée.**
- [X] T003 [P] Ajouter l'exception `!.env.example` sous la règle `.env*` de `apps/web/.gitignore`, puis créer `apps/web/.env.example` : le seul nom `API_URL=`, commenté en français (« Obligatoire. Adresse de l'API, côté serveur seulement. »), **sans valeur**. Ne créer ni `.env` ni `.env.local`.
- [X] T004 [P] Régler dans `apps/web/next.config.ts` la taille admise pour une Server Action : `experimental.serverActions.bodySizeLimit` à `"6mb"`, avec un commentaire qui dit pourquoi (CV de 5 242 880 octets, champs et habillage `multipart` ; l'API reste l'autorité sur la limite de 5 Mo). Aucun autre réglage.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: le client d'API, les dates, l'année en cours. Aucune page ne change encore.

**⚠️ CRITICAL**: aucun récit ne commence avant la fin de cette phase.

- [X] T005 Créer `apps/web/src/lib/api.ts`, côté serveur : lit `API_URL` (erreur explicite au premier appel si elle manque, sans afficher de valeur) ; la constante de revalidation, **60**, définie ici et nulle part ailleurs ; `apiGet(chemin, paramètres)` : `fetch` avec `next: { revalidate }` et un délai de 10 secondes, qui **lève une erreur pour toute réponse autre que `200`** (elle n'est alors pas mise en cache) et renvoie le corps typé ; `apiGetAll(chemin, paramètres)` pour une liste paginée : page 1 avec `limit=100`, puis les pages 2 à `meta.totalPages` en parallèle, chacune étant une requête à part ; assemblage dans l'ordre ; renvoie `{ items, total, complete }` — si la première page échoue, l'erreur est levée ; si une page suivante échoue, les pages lues sont renvoyées avec `complete: false` et `total` = `meta.total`. Aucune nouvelle tentative immédiate. Rien n'est journalisé. Aucune fonction d'administration, aucun jeton.
- [X] T006 [P] Modifier `apps/web/src/lib/dates.ts` : `formatDay` et `formatMonthYear` passent du temps universel au fuseau `Indian/Antananarivo`, seul endroit du site où un fuseau est écrit ; le commentaire d'en-tête dit que le jour et le mois d'une actualité sont ceux de Madagascar, quel que soit le serveur ou le visiteur ; **supprimer `formatFullDate`** (aucun appelant, aucune exigence de la spec, aucune page qui en ait besoin). Aucune fonction n'affiche l'heure.
- [X] T007 [P] Créer `apps/web/src/lib/paragraphs.ts` : une fonction qui découpe un texte en paragraphes sur une ou plusieurs lignes vides et retire les paragraphes vides ; pour un texte absent, un tableau vide. Elle sert au contenu d'une actualité et à la description d'une action (`data-model.md`, « Conversions »).
- [X] T008 [P] Ajouter à `apps/web/src/content/common.ts` le libellé `incompleteLabel` : « Cette liste est incomplète pour le moment. », commenté comme un état technique exceptionnel, pas un contenu éditorial.
- [X] T009 Créer `apps/web/src/data/rotary-years.ts` : `getCurrentRotaryYear()` lit `GET /rotary-years` et renvoie le libellé de l'année dont `isCurrent` est vrai ; sans année en cours, ou en cas d'échec, le libellé de l'année du calendrier par `rotaryYearOf` appliqué à la date du jour. Dans `apps/web/src/lib/rotary-year.ts`, **supprimer la constante `currentRotaryYear`** (les pages qui l'importent sont corrigées dans leurs récits) et garder `rotaryYearOf` pour ce seul repli.

**Checkpoint**: le client d'API existe ; le build échoue encore là où `currentRotaryYear` est importé — c'est attendu, les récits suivants le corrigent.

---

## Phase 3: User Story 1 - Lire les actions du club (Priority: P1) 🎯 MVP

**Goal**: la page Actions affiche les actions publiées, leurs domaines, leur description et leur impact réel ; le registre d'impact disparaît.

**Independent Test**: `quickstart.md`, section 2.

### Implementation for User Story 1

- [X] T010 [US1] Mettre à jour `apps/web/src/types/action.ts` selon `data-model.md` : `focusArea?: string` devient `focusAreas: string[]` ; ajouter `description?: string[]` (paragraphes) et `date: string` ; `photos` reste ; **supprimer `ImpactIndicator`**.
- [X] T011 [US1] Réécrire `apps/web/src/data/actions.ts` selon `contracts/data-layer.md` : `getActions({ rotaryYear?, focusArea? })` par `apiGetAll("/actions", { year, focusArea })`, qui renvoie `{ actions, complete }` ; `getLatestActions(limit)` par `GET /actions?limit=` ; `getActionYears()` par `GET /actions/years` (libellés) ; `getActionCount()` par `GET /actions?limit=1` (`meta.total`). Conversion de chaque action : champs de la forme publique, `description` découpée par `paragraphs.ts`, `photos: []`. **Chaque fonction attrape tout échec et renvoie sa valeur vide** (`{ actions: [], complete: true }`, `[]`, `0`). Supprimer la liste locale et `getImpactIndicators`.
- [X] T012 [US1] Supprimer le registre d'impact : les fichiers `apps/web/src/app/actions/_sections/ImpactLedger.tsx` et `apps/web/src/app/actions/_sections/ImpactLedger.module.css`, et l'objet `impactLedger` de `apps/web/src/content/actions.ts` (dont « Donnée à venir »). Ne rien mettre à leur place.
- [X] T013 [US1] Mettre à jour `apps/web/src/app/actions/page.tsx` : retirer `ImpactLedger` et `getImpactIndicators` ; année en cours par `getCurrentRotaryYear()` ; passer à `ActionsIndex` les actions et l'indicateur `complete`. La page se termine par l'index puis `JoinReminder`.
- [X] T014 [US1] Mettre à jour `apps/web/src/app/actions/_sections/ActionsIndex.tsx` (et `ActionsIndex.module.css` seulement si un élément nouveau l'exige) : nommer **tous** les domaines d'une action dans ses métadonnées, avec leurs libellés ; lire la description, paragraphe par paragraphe, dans la fiche dépliable, au-dessus des rubriques d'impact ; proposer la fiche dès qu'il y a une description, une rubrique d'impact ou une photographie supplémentaire ; afficher `incompleteLabel` **une seule fois**, à l'emplacement et dans le style de la mention « Contenu à venir », quand la liste est incomplète. Ne rien changer aux trois compositions alternées, aux filtres ni aux états vides existants. Aucune pagination, aucun compteur.
- [X] T015 [US1] Mettre à jour `apps/web/src/app/_sections/LatestActions.tsx` pour le type `Action` (domaines au pluriel) et pour ne montrer que les actions reçues : avec une ou deux actions, aucun emplacement fictif ne complète la section ; sans aucune action, les emplacements et « Contenu à venir » existants restent.
- [X] T016 [P] [US1] Créer `apps/web/src/app/actions/loading.tsx` : squelette sobre aux dimensions du contenu (`DESIGN.md`, section 9), fait des tokens existants ; il reprend l'encombrement de l'ouverture et du bloc de liste, sans texte inventé, sans composition éditoriale nouvelle, avec un libellé d'attente accessible.
- [X] T017 [US1] Vérification manuelle : dérouler `quickstart.md`, section 2 (trois actions publiées et un brouillon ; deux domaines ; description en deux paragraphes ; deux rubriques d'impact et aucune autre ; action sans résumé ni impact ; filtres année et domaine, combinés ; action rattachée à une autre année que celle de sa date ; `?annee=abc`, `?domaine=inconnu` ; ordre 1 donné dans le Back Office ; aucune occurrence de « Donnée à venir » ; aucune section de registre). Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les actions se lisent.

---

## Phase 4: User Story 2 - Lire les actualités du club (Priority: P1)

**Goal**: la page Actualités affiche les actualités publiées, à la une et dans le fil, avec leurs archives, dans le fuseau du club.

**Independent Test**: `quickstart.md`, section 3.

### Implementation for User Story 2

- [X] T018 [US2] Mettre à jour `apps/web/src/types/news.ts` : ajouter `rotaryYear` (libellé fourni par l'API) ; `body?: string[]` et `photos` restent.
- [X] T019 [US2] Réécrire `apps/web/src/data/news.ts` selon `contracts/data-layer.md` : `getNews({ type?, rotaryYear? })` par `apiGetAll("/news", { type, year })`, qui renvoie `{ news, complete }` ; `getLatestNews(limit)` par `GET /news?limit=` ; `getNewsCount()` par `GET /news?limit=1` ; `getNewsArchives()` par `GET /news/archives` (`{ rotaryYear: libellé, count }`) — **aucun calcul local d'archives**. Conversion : `content` découpé en `body` par `paragraphs.ts`, `photos: []`, `rotaryYear` de l'API. Supprimer la liste locale, le tri local et tout usage de `rotaryYearOf`. Chaque fonction attrape tout échec et renvoie sa valeur vide.
- [X] T020 [US2] Mettre à jour `apps/web/src/app/actualites/page.tsx` : année en cours par `getCurrentRotaryYear()` ; passer au fil l'indicateur `complete`. La première actualité de la sélection reste à la une.
- [X] T021 [US2] Mettre à jour `apps/web/src/app/actualites/_sections/NewsRegister.tsx`, `apps/web/src/app/actualites/_sections/NewsFeature.tsx` et `apps/web/src/app/actualites/_sections/NewsArchives.tsx` : jour, mois et regroupement par mois par les formateurs de `lib/dates.ts` (heure de Madagascar), **sans heure** ; l'attribut `datetime` garde l'instant ; « Lire la suite » seulement quand il y a un contenu ; lieu et résumé absents non rendus ; `incompleteLabel` une seule fois dans le fil, dans le style de la mention existante, quand la liste est incomplète ; archives avec les années et les nombres reçus. Ne rien changer à la composition.
- [X] T022 [US2] Mettre à jour `apps/web/src/app/_sections/LatestNews.tsx` : dates par `lib/dates.ts` ; registre vide existant conservé quand il n'y a aucune actualité.
- [X] T023 [P] [US2] Créer `apps/web/src/app/actualites/loading.tsx`, sur le même principe que T016.
- [X] T024 [US2] Vérification manuelle : dérouler `quickstart.md`, section 3 — en particulier l'actualité du 10/10/2026 à 01:00 (jour **10**, octobre) ; celle du 01/11/2026 à 00:30 (rangée sous **novembre**) ; aucune heure affichée ; mêmes jours et mois après changement du fuseau de l'ordinateur ; cinq rubriques ; archives avec leurs nombres, dont une actualité rattachée à une autre année que celle de sa date ; brouillon absent partout ; « Lire la suite » seulement avec un contenu ; rubrique sans résultat et `?rubrique=inconnue`. Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les actualités se lisent, dans le bon fuseau.

---

## Phase 5: User Story 3 - Découvrir les membres du club (Priority: P1)

**Goal**: la page Membres affiche les membres réels d'une année, dans l'ordre du club, avec leurs fonctions de cette année.

**Independent Test**: `quickstart.md`, section 4.

### Implementation for User Story 3

- [X] T025 [US3] Mettre à jour `apps/web/src/types/member.ts` selon `data-model.md` : ajouter `roles: MemberRole[]` (fonctions de l'année demandée) et `order: number` ; **supprimer `mandates`, `MemberMandate` et `isDemo`** ; `portrait?` reste.
- [X] T026 [US3] Réécrire `apps/web/src/data/members.ts` : `getMembers(year)` par `GET /members?year=<libellé>`, dans l'ordre reçu, jamais retrié ; `getMemberYears()` par `GET /members/years` (libellés) ; `getFeaturedMembers(limit)` par `GET /members?limit=`. **Supprimer les sept profils de démonstration, la fonction `demo` et `rolesForYear`.** Chaque fonction attrape tout échec et renvoie `[]`.
- [X] T027 [US3] Mettre à jour `apps/web/src/app/membres/_sections/MembersDirectory.tsx`, `apps/web/src/app/membres/_sections/MembersFunctions.tsx` et `apps/web/src/app/_sections/MembersPreview.tsx` pour lire `member.roles` ; retirer la mention et le traitement des profils de démonstration, les règles `.demo` de `apps/web/src/app/membres/_sections/MembersDirectory.module.css`, et `demoNote` de `apps/web/src/content/members.ts`. La composition (une personne en grand, trois portraits, puis les lignes), l'état vide de l'annuaire et « Non attribuée » restent ; un membre sans fonction ou sans profession s'affiche sans texte de remplacement.
- [X] T028 [US3] Mettre à jour `apps/web/src/app/membres/page.tsx` : année par défaut = la plus récente de `getMemberYears()`, à défaut `getCurrentRotaryYear()` ; plus aucun import de `currentRotaryYear`.
- [X] T029 [P] [US3] Créer `apps/web/src/app/membres/loading.tsx`, sur le même principe que T016.
- [X] T030 [US3] Vérification manuelle : dérouler `quickstart.md`, section 4 (ordre du club, puis ordre inversé dans le Back Office ; deux fonctions ; membre sans fonction ; membre sans profession ; changement d'année avec une fonction différente ; index des dix fonctions ; année sans membre et `?annee=2020-2021` ; ni email ni téléphone dans le code source de la page ; aucun profil de démonstration). Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les membres se lisent.

---

## Phase 6: User Story 4 - Voir sur l'accueil ce que le club vient de faire (Priority: P1)

**Goal**: l'accueil reflète le contenu réel et l'année en cours.

**Independent Test**: `quickstart.md`, section 5.

### Implementation for User Story 4

- [X] T031 [US4] Mettre à jour `apps/web/src/app/page.tsx` : année en cours par `getCurrentRotaryYear()`, transmise à l'ouverture et à l'aperçu des membres ; plus aucun import de `currentRotaryYear`. Les sections éditoriales ne sont pas touchées. Vérifier par une recherche qu'aucun fichier de `apps/web/src` n'importe encore `currentRotaryYear`, `rolesForYear`, `isDemo`, `getImpactIndicators` ni `formatFullDate`, puis que `npm run build:web` réussit.
- [X] T032 [US4] Vérification manuelle : dérouler `quickstart.md`, section 5 (trois actions dans l'ordre de la page Actions ; trois actualités les plus récentes, jours en heure de Madagascar ; aperçu des membres de l'année en cours dans l'ordre du club ; une seule action publiée → une seule affichée ; année affichée = année en cours de l'API ; sections éditoriales identiques à avant). Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les quatre pages de lecture sont reliées ; le build réussit.

---

## Phase 7: User Story 5 - Envoyer sa candidature (Priority: P1)

**Goal**: la candidature et son CV arrivent réellement au club ; chaque refus est rendu à sa place.

**Independent Test**: `quickstart.md`, section 6.

### Implementation for User Story 5

- [X] T033 [US5] Mettre à jour `apps/web/src/types/application.ts` (`status` devient `applicantStatus`) et `apps/web/src/content/join.ts` selon `contracts/application-form.md` : clé de champ `applicantStatus` (libellé « Statut » inchangé) ; aide du CV : « Un fichier PDF ou Word, de 5 Mo au plus. » ; messages ajoutés, à l'identique : « Le fichier est trop volumineux. », « Le format du CV n'est pas accepté. », « Trop de demandes. Veuillez réessayer plus tard. », « Service temporairement indisponible. Veuillez réessayer plus tard. », « Envoi en cours… » ; **supprimer** `notConnectedTitle` et `notConnected`. Les autres textes de la page ne changent pas.
- [X] T034 [US5] Réécrire `apps/web/src/data/applications.ts` en Server Action (`"use server"`) : `submitApplication(formData)` reconstruit un `FormData` avec **exactement** `firstName`, `lastName`, `email`, `phone`, `applicantStatus` et `cv` (le fichier avec son nom d'origine), l'envoie à `POST /applications` par `fetch`, sans cache, avec un délai de 60 secondes, en laissant `fetch` écrire l'en-tête `multipart/form-data` ; renvoie un résultat typé et rien d'autre : accepté (`201`) ; refus par champ (`400` avec `details` → message de l'API par champ ; `413` → `cv` : fichier trop volumineux ; `415` → `cv` : format refusé) ; refus d'ensemble (`429` → trop de demandes ; `503`, tout autre code, réseau, délai, `400` sans détail → service indisponible). Aucun corps de réponse de l'API, aucune adresse, aucune référence de stockage ne sort de la fonction ; rien n'est journalisé ni conservé.
- [X] T035 [US5] Mettre à jour `apps/web/src/app/rejoindre/_sections/ApplicationForm.tsx` : champ `applicantStatus` ; contrôle de taille du CV (5 Mo au plus) et motif du téléphone aligné sur celui de l'API (chiffres, espaces, `+`, `-`, `.`, parenthèses, au moins 8 chiffres), en plus des contrôles existants ; appel de la Server Action avec le `FormData` ; **dès le clic**, bouton inactif et « Envoi en cours… » dans la zone `role="status"` ; succès → confirmation existante et formulaire vidé ; refus par champ → message sous le champ dans la forme existante (« Erreur : … », `aria-describedby`, focus sur le premier champ en erreur) ; refus d'ensemble → message dans la zone de résultat ; toute exception pendant l'appel → message d'indisponibilité. Dans tous les cas d'échec la saisie est conservée et aucune confirmation n'est affichée. Retirer l'issue « non relié ». Ne rien changer à la composition du formulaire ni au reste de la page.
- [X] T036 [US5] **Vérification obligatoire du CV de 5 Mo** (décision 12) : sur le site lancé depuis son build, envoyer par le formulaire un fichier de **5 242 880 octets** ; le retrouver dans le Back Office ; télécharger le CV et comparer son empreinte à celle du fichier envoyé. **Si l'envoi échoue : ne pas cocher, ne créer aucun gestionnaire de route, ne pas modifier l'architecture ; arrêter les tâches de ce récit, noter ici la taille atteinte, le message obtenu et le réglage essayé, et signaler l'incompatibilité au porteur du projet.**
  - **Replay du 2026-10-03 : PASS** (décision du porteur du projet : rejouer le gate seul, sans modifier `apps/api`, les limites, les délais ni le stockage). Environnement propre au départ (collections à 0, `admins` à 1, aucun fichier de CV). Fichier de 5 242 880 octets commençant par `%PDF-`, SHA-256 `038cfa5542412ab0aac8cb78186d6417383be2908ece9de3320d9b3d36616635`. Première tentative, 08 h 46 : envoyé par le formulaire réel (site lancé depuis son build, relié directement à l'API) ; « Envoi en cours… » à 441 ms, bouton inactif ; « Candidature envoyée » après 19,1 s, formulaire vidé ; candidature créée (`cv.size` 5 242 880, `application/pdf`) ; CV relu par l'API à 5 242 880 octets, empreinte identique ; retrouvée dans la liste et la fiche du Back Office ; CV téléchargé par le Back Office : 5 242 880 octets, empreinte identique ; requêtes du navigateur vers le site seulement ; aucune erreur de stockage au journal de l'API. Nettoyage immédiat : candidature et fichier supprimés ; 30 s plus tard, collections à 0 et aucun fichier au stockage.
  - **Constat du 2026-10-02 (avant le replay).** Taille : 5 242 880 octets (`max.pdf`, SHA-256 `038cfa55…6635`). Réglage : `bodySizeLimit: "6mb"`, délai de la Server Action 60 s, site lancé depuis son build. Quatre envois par le formulaire : **deux acceptés** (20 h 4x, 18,0 s, candidature retrouvée dans le Back Office et CV téléchargé par lui, empreinte identique ; 21 h 23, 17,0 s, empreinte identique par l'opération d'administration de l'API, téléchargement par le Back Office refusé par le délai de lecture du stockage) et **deux refusés** (21 h 53 et 21 h 57, « Service temporairement indisponible. Veuillez réessayer plus tard. » après 22,1 s et 20,5 s). Étape de l'échec : après la Server Action — le fichier atteint l'API (`POST /api/v1/applications` reçu), qui répond `503` ; journal de l'API : « Erreur du stockage (envoi, HTTP 499) », le délai de 10 s de `apps/api/src/media/cloudinary-storage.service.ts`. Le même fichier envoyé **directement à l'API, sans le site**, échoue de même deux fois sur trois (503 en 22,0 s, 201 en 17,7 s, 503 en 29,3 s) ; un fichier de 193 octets passe en 3,2 s. La Server Action relaie donc bien les 5 Mo ; l'échec, intermittent, tient à la liaison de l'API vers le stockage. Un envoi abandonné a laissé un fichier orphelin de 5 242 880 octets au stockage (retiré à la main). Aucun gestionnaire de route créé, API non modifiée, limite inchangée.
- [X] T037 [US5] Vérification manuelle : dérouler le reste de `quickstart.md`, section 6 (candidature valide en PDF, en DOC et en DOCX, retrouvée dans le Back Office avec un CV identique ; fichier de 5 242 881 octets, contrôle du formulaire contourné → « Le fichier est trop volumineux. » sous le champ ; fichier trop gros choisi normalement → même message, sans envoi ; fichier texte renommé en `.pdf` → « Le format du CV n'est pas accepté. » ; champs vides, email et téléphone invalides → messages sous les champs, rien n'est transmis ; refus `400` de l'API rendu sous son champ ; « Envoi en cours… » dès le clic et double envoi impossible ; vingt-et-unième envoi dans l'heure → « Trop de demandes. Veuillez réessayer plus tard. » ; API au secret de stockage faux, puis API arrêtée → « Service temporairement indisponible. Veuillez réessayer plus tard. », saisie conservée, aucune candidature de plus ; aide du CV ; plus de message « non relié » ; dans l'onglet réseau et le code source, requêtes vers le site seulement et aucune occurrence de « cloudinary », d'adresse d'API ni de référence de stockage). Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les candidatures arrivent.

---

## Phase 8: User Story 6 - Un site lisible quand le contenu manque ou que l'API ne répond pas (Priority: P2)

**Goal**: états vides, fraîcheur, listes longues et indisponibilité vérifiés sur le build.

**Independent Test**: `quickstart.md`, sections 1, 7, 8 et 9.

### Implementation for User Story 6

- [X] T038 [US6] Relire `apps/web/src/lib/api.ts` et `apps/web/src/data/*.ts` contre `plan.md`, B2 à B4 : la durée de revalidation n'est écrite qu'une fois ; aucune lecture ne passe `cache: "no-store"` ; une réponse autre que `200` lève une erreur avant toute mise en cache ; aucune fonction de données n'écrit de valeur vide dans le cache ; `apiGetAll` renvoie `complete: false` quand une page suivante échoue, jamais une liste vide, jamais `complete: true`. Corriger tout écart dans ces fichiers uniquement.
- [X] T039 [US6] Vérification manuelle, base vide : dérouler `quickstart.md`, section 1 (les cinq pages composées ; emplacements et « Contenu à venir » ; état vide de l'annuaire ; aucun profil de démonstration ; aucune occurrence de « Donnée à venir » ; année du calendrier sans année dans l'API ; aucune requête du navigateur vers l'API).
- [X] T040 [US6] Vérification manuelle, fraîcheur (SC-013) : dérouler `quickstart.md`, section 7, sur `next build` puis `next start` — publication visible, puis dépublication disparue, **au seuil de 90 secondes** ; dix rechargements en vingt secondes ne produisent pas dix lectures de l'API (journal de l'API). Noter les délais observés ; ne pas conclure à une garantie à la seconde près.
- [X] T041 [US6] Vérification manuelle, listes longues (SC-014) : dérouler `quickstart.md`, section 8 — 120 actions et 120 actualités publiées (créées par les opérations d'administration de l'API) ; **120 actions affichées**, dans l'ordre de l'API ; **120 actualités affichées**, une à la une et 119 dans le fil ; nombres affichés exacts ; deux demandes par liste à la première lecture, `limit=100` (journal de l'API) ; aucune pagination, aucun « voir plus » ; filtre par année réduit la liste.
- [X] T042 [US6] Vérification manuelle, API indisponible : dérouler `quickstart.md`, section 9 — site déjà consulté puis API arrêtée : le contenu déjà lu reste affiché au-delà d'une minute, listes de 120 comprises ; API relancée : mise à jour après le délai ; build et lancement avec l'API arrêtée : build réussi, pages à l'état vide, composées ; `/rejoindre` entière, seul l'envoi échoue. **Liste partielle** : relire le code du cas « page suivante jamais lue et inaccessible », puis tenter de le provoquer en arrêtant l'API entre deux lectures ; consigner **ce qui a réellement été observé**, sans présenter comme vérifiés les états internes du cache qui ne sont pas observables.

**Checkpoint**: le site tient dans tous les états.

---

## Phase 9: User Story 7 - Un site inchangé dans sa forme (Priority: P2)

**Goal**: design, adaptation aux écrans et accessibilité conservés avec du contenu réel.

**Independent Test**: `quickstart.md`, section 10.

### Implementation for User Story 7

- [X] T043 [US7] Écrans et design : avec un titre de 120 caractères, un résumé de 500, une action à sept domaines et un membre à dix fonctions, parcourir les cinq pages à 1280, 768 et 375 px. Attendu : aucune page ne déborde horizontalement, aucun texte ne se superpose, les compositions sont celles de `DESIGN.md` (aucune grille de cartes, aucune pagination, aucun tableau de bord) ; les trois squelettes d'attente tiennent les dimensions du contenu, sans saut de mise en page. Corriger dans `apps/web/src/` les seuls modules CSS concernés, puis rejouer.
- [X] T044 [US7] Accessibilité (WCAG 2.2 AA) : parcourir au clavier les filtres, les fiches dépliables et le formulaire. Attendu : tout est atteignable ; focus visible ; hiérarchie des titres, textes alternatifs et libellés existants conservés ; erreurs du formulaire reliées à leur champ et focus sur le premier champ en erreur ; « Envoi en cours… », le résultat de l'envoi et la mention de liste incomplète annoncés ; aucune information portée par la seule couleur. Corriger dans `apps/web/src/` et rejouer. Noter ce qui n'a pas pu être jugé (lecteur d'écran, rendu sur un téléphone réel).

**Checkpoint**: la forme est intacte.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: conformité, contrôles, documents, non-régression.

- [X] T045 Relecture de conformité de `apps/web/src/` contre les « Décisions verrouillées » : une recherche de `Donnée à venir`, `isDemo`, `Profil`, `currentRotaryYear`, `rolesForYear`, `formatFullDate`, `ImpactLedger`, `notConnected`, `NEXT_PUBLIC`, `cloudinary`, `console.` ne renvoie rien ; `Antananarivo` et tout fuseau n'apparaissent que dans `lib/dates.ts` ; `fetch(` n'apparaît que dans `lib/api.ts` et `data/applications.ts` ; `revalidate` n'est défini que dans `lib/api.ts` ; les seules adresses d'API sont les huit de `contracts/data-layer.md` ; aucune adresse `/admin` ; aucun message hors de ceux de la décision 13 et de ceux qui existaient. Corriger tout écart.
- [X] T046 Contrôler : `npm run lint`, puis `npm run build:web`, `npm run build:admin` et `npm run build:api` depuis la racine. Corriger toute erreur dans `apps/web/` uniquement. Vérifier ensuite que la valeur d'`API_URL` n'apparaît pas dans `apps/web/.next/static`.
- [X] T047 [P] Aligner les documents sur ce qui existe, sans changer aucune décision : `ARCHITECTURE.md` (en-tête d'état ; décision 15, « Front Office sur ses données locales », qui devient : relié à l'API depuis la fonctionnalité 009 ; section 10, écarts traités) ; `PROJECT_CONTEXT.md` (état, section « apps/web », « Fait » et « Prochaines étapes », points d'attention : cache local au serveur et vidé par un build, limite de fréquence des candidatures partagée par tous les visiteurs, corps de 6 Mo admis pour la Server Action et limite possible chez un futur hébergeur, divergences du Front Office désormais résolues) ; ligne d'état de `CLAUDE.md`. Ne modifier ni `DESIGN.md` au-delà de T001, ni la constitution, ni la décision ouverte sur le registre d'impact.
- [X] T048 Périmètre et secrets : `git status` ne montre aucun fichier modifié dans `apps/api`, `apps/admin`, `.specify/memory/constitution.md`, `packages/` ; aucun `.env` ni `.env.local` listé ; `apps/web/.env.example` ne contient aucune valeur ; `apps/web/package.json` est inchangé ; aucun fichier ni outillage de test ; `git diff` de `DESIGN.md` et d'`ARCHITECTURE.md` ne montre que les passages de `plan.md`, section A, et de T047 ; `spec.md` est inchangé ; une recherche des valeurs de `apps/api/.env` et de `apps/web/.env.local` dans les fichiers versionnables ne renvoie rien, sans jamais afficher ces valeurs ; `git diff --check` est propre.
- [X] T049 Nettoyage et non-régression : supprimer par le Back Office (ou par les opérations d'administration de l'API pour les 240 contenus de T041) toutes les données de vérification ; vérifier `applications`, `news`, `actions`, `members`, `membermandates`, `rotaryyears` à 0, `admins` à 1, aucun fichier de CV au stockage ; le Back Office s'ouvre et ses cinq écrans répondent ; `GET /api/v1/health` répond ; les **cinq routes** du Front Office (`/`, `/actions`, `/actualites`, `/membres`, `/rejoindre`) répondent et s'affichent composées.
- [X] T050 Dérouler `quickstart.md` **en entier** une dernière fois (sections 1 à 10) sur le build, refaire le nettoyage de T049, et consigner dans ce fichier, section par section, ce qui a été vérifié et ce qui ne l'a pas été — dont, honnêtement, le cas de liste partielle, le lecteur d'écran et tout rendu non essayé. Ne cocher cette tâche que si toutes les sections ont réellement été déroulées.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (phase 1)** : T001 et T002 avant tout code. T003 et T004 indépendantes.
- **Foundational (phase 2)** : dépend de la phase 1. T005 d'abord ; T006, T007, T008 en parallèle ; T009 après T005. Bloque tous les récits.
- **US1 (phase 3)** : dépend de la phase 2. T010 → T011 → T012 → T013 → T014 → T015 ; T016 indépendante ; T017 en dernier.
- **US2 (phase 4)** : dépend de la phase 2 (T006 et T007 en particulier). Indépendante de US1.
- **US3 (phase 5)** : dépend de la phase 2. Indépendante de US1 et US2.
- **US4 (phase 6)** : dépend de US1, US2 et US3 (l'accueil réunit leurs trois sections ; c'est ici que le build redevient vert).
- **US5 (phase 7)** : dépend de T004 et T005 seulement. Indépendante des lectures. **T036 conditionne T037** et la fin du récit.
- **US6 (phase 8)** : dépend de US1 à US4 (et de US5 pour la page Rejoindre de T042).
- **US7 (phase 9)** : dépend de US1 à US5.
- **Polish (phase 10)** : après tous les récits. T045 avant T046 ; T047 en parallèle ; T049 après T048 ; T050 en dernier.

### Within Each User Story

- Type, puis fonction de données, puis page et sections ; la vérification manuelle clôt le récit.
- `apps/web/src/content/actions.ts` est modifié par T012 seulement ; `apps/web/src/content/join.ts` par T033 seulement ; `apps/web/src/app/_sections/MembersPreview.tsx` par T027 ; `apps/web/src/app/page.tsx` par T031.
- Entre la fin de la phase 2 et T031, `npm run build:web` peut échouer (imports en cours de correction) ; il doit réussir à la fin de US4.
- Le contenu de vérification se saisit dans le Back Office ; il est supprimé en T049.

### Parallel Opportunities

- T003 et T004 pendant T001 et T002.
- T006, T007, T008.
- T016, T023 et T029 (les trois squelettes).
- US1, US2 et US3 peuvent avancer en parallèle après la phase 2 ; US5 aussi.
- T047 pendant T045 et T046.

## Parallel Example: Foundational

```text
T005 : apps/web/src/lib/api.ts
puis, ensemble :
T006 : apps/web/src/lib/dates.ts
T007 : apps/web/src/lib/paragraphs.ts
T008 : apps/web/src/content/common.ts
puis T009 : apps/web/src/data/rotary-years.ts, apps/web/src/lib/rotary-year.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

Phases 1 et 2, puis US1 : la page Actions lit l'API, sans registre d'impact. Arrêt et validation. À ce stade le build complet peut encore échouer sur les pages non migrées : la validation de US1 se fait sur `/actions` en développement, et le build est validé à la fin de US4.

### Incremental Delivery

1. Alignement de `DESIGN.md` et d'`ARCHITECTURE.md`, configuration.
2. Client d'API, dates, année en cours.
3. US1 (actions), vérification, validation.
4. US2 (actualités et fuseau), vérification, validation.
5. US3 (membres), vérification, validation.
6. US4 (accueil), build réussi, vérification, validation.
7. US5 (candidature) : **vérification du CV de 5 Mo d'abord**, puis le reste.
8. US6 (états, fraîcheur, listes longues, indisponibilité).
9. US7 (écrans, accessibilité).
10. Polish : conformité, contrôles, documents, non-régression, quickstart complet.

Un seul intervenant : pas de stratégie d'équipe. Les arrêts pour validation suivent la constitution (principe II) ; aucun commit sans demande explicite (principe XI).

## Couverture des exigences

| Exigences | Tâches |
|---|---|
| FR-001, FR-004 | T011, T019, T026, T031 |
| FR-002, FR-003, FR-050 | T003, T005, T034, T045, T046, T048 |
| FR-005 | T014, T021, T027 |
| FR-006 | T011, T019, T026 (lectures publiques seulement), T017, T024 |
| FR-007 | T014, T021, T027 |
| FR-008 | T009, T013, T020, T028, T031 |
| FR-009 | T002, T005, T038, T040 |
| FR-010 | T005, T011, T014, T019, T021, T041, T042 |
| FR-011, FR-012, FR-013, FR-014, FR-015, FR-017 | T010, T011, T013, T014, T017 |
| FR-016 | T001, T012, T013, T045 |
| FR-018, FR-019, FR-020, FR-021, FR-024 | T018, T019, T020, T021, T024 |
| FR-022, FR-023 | T002, T006, T021, T022, T024 |
| FR-025, FR-026, FR-027, FR-029 | T025, T026, T027, T028, T030 |
| FR-028 | T001, T026, T027, T045 |
| FR-030, FR-031 | T015, T022, T027, T031, T032 |
| FR-032, FR-033 | T033, T034, T035, T036, T037 |
| FR-034, FR-035, FR-036, FR-037, FR-038, FR-039 | T033, T034, T035, T037 |
| FR-040, FR-041 | T034, T037, T045 |
| FR-042, FR-043, FR-044 | T011, T019, T026, T038, T039, T042 |
| FR-045 | T016, T023, T029, T043 |
| FR-046, FR-047, FR-048 | T014, T021, T027, T043, T044 |
| FR-049 | T036, T048 |
| FR-051 | T001, T002 |
| SC-001, SC-002 | T017, T024, T030, T039, T045 |
| SC-003 | T024 |
| SC-004 | T030 |
| SC-005, SC-006, SC-007 | T036, T037 |
| SC-008 | T039, T042 |
| SC-009 | T037, T039, T046 |
| SC-010, SC-011 | T043, T044 |
| SC-012 | T048, T049 |
| SC-013 | T040 |
| SC-014 | T041 |

## Notes

- Aucune tâche n'écrit de test automatisé, de pagination, de page de détail, de recherche, de photographie, de gestionnaire de route, ni de contenu éditorial.
- Aucune tâche n'ajoute Docker, CI/CD, déploiement ni dépendance.
- Aucune tâche ne touche `apps/api`, `apps/admin`, la constitution, `packages/` ni `spec.md`. `DESIGN.md` n'est modifié que par T001 ; `ARCHITECTURE.md` par T002 (décisions) et T047 (état).
- Aucune tâche ne crée ni ne modifie `apps/web/.env.local` ni `apps/api/.env`.
- Aucun message n'est créé pendant l'implémentation : ceux de la décision 13 et les textes existants suffisent.
- Une contradiction découverte en cours de route, un besoin que l'API ne couvre pas, ou l'échec du passage de 5 Mo, est signalé, pas résolu d'autorité (constitution, principe I).

## Compte rendu d'exécution (T050) — 2026-10-02

Déroulé complet du quickstart sur le build final (`next build` puis `next start`), de 21 h 18 à 21 h 42, par un navigateur Chrome piloté (protocole DevTools) et par les opérations d'administration de l'API. Un relais d'observation hors dépôt, placé entre le site et l'API, a servi à compter les lectures et à rendre une page inaccessible. 183 contrôles conformes ; les écarts sont listés ci-dessous.

| Section | Vérifié | Non vérifié, ou écart |
|---|---|---|
| 1. Base vide | Cinq pages composées ; emplacements et « Contenu à venir » ; état vide de l'annuaire, sans index des fonctions ; année du calendrier sans année dans l'API ; aucun profil de démonstration, aucun « Donnée à venir », aucun registre ; aucune requête du navigateur vers l'API. | — |
| 2. Actions | A, B, D dans l'ordre de l'API, C absente, nombre 3 ; deux domaines ; description en deux paragraphes ; deux rubriques d'impact ; B sans résumé, sans impact, sans fiche ; filtres année, domaine, combinés ; `?annee=abc`, `?domaine=inconnu` ; ordre 1 donné à B (60 s). | — |
| 3. Actualités | Une, fil, mois ; N2 au jour 10 ; N3 sous novembre ; aucune heure ; `datetime` exact ; mêmes jours avec un navigateur réglé sur un autre fuseau ; cinq rubriques ; archives de l'API ; « Lire la suite » seulement avec un contenu ; rubrique vide et inconnue. | Le changement de fuseau a été fait dans le navigateur, pas sur l'ordinateur ni sur le serveur. |
| 4. Membres | Ordre du club, puis ordre inversé dans l'administration (70 s) ; deux fonctions ; sans fonction ; sans profession ; année 2025-2026 et sa fonction propre ; dix fonctions, « Non attribuée » ; ni email ni téléphone ; `?annee=2020-2021`. | — |
| 5. Accueil | Trois actions dans l'ordre de `/actions` ; trois actualités, jours de Madagascar ; aperçu des membres ; une seule action publiée → une seule affichée ; année de l'API ; sections éditoriales présentes. | « Identiques à avant » jugé sur la présence des sections, pas par comparaison d'images. |
| 6. Candidature | PDF, DOC, DOCX, nom accentué : acceptés, CV identiques par empreinte ; 5 242 881 octets, contrôle contourné → « Le fichier est trop volumineux. » ; trop gros choisi normalement → même message, sans envoi ; texte renommé → « Le format du CV n’est pas accepté. » ; champs vides, email, téléphone ; refus `400` sous son champ ; « Envoi en cours… » dès le clic, double envoi impossible ; 429 ; secret de stockage faux (503) ; API arrêtée ; aucune trace de l'API ni du stockage dans le navigateur. | **Fichier de 5 242 880 octets : résultat intermittent**, voir T036. Dans ce déroulé : accepté en 17,0 s, empreinte identique par l'API ; le téléchargement par le Back Office a échoué (délai de lecture du stockage, 10 s, dans l'API). |
| 7. Fraîcheur | Publication visible en 70 s, dépublication en 60 s (page relue toutes les 10 s ; seuil de vérification : 90 s) ; dix visites en vingt secondes → une lecture de la liste. | Aucune garantie à la seconde près n'est déduite de ces mesures. |
| 8. Listes longues | 120 actions affichées dans l'ordre de l'API ; 1 + 119 actualités ; nombres 120 ; 14 mois en marge ; archives 19 et 101 ; deux lectures par liste (`limit=100`, pages 1 et 2) ; aucune pagination ; filtre par année transmis à l'API ; 375 px sans débordement. | Liste partielle : voir section 9. |
| 9. API indisponible | API arrêtée 2 min 30 : les quatre pages de lecture gardent leur contenu, 120 éléments compris ; API relancée : mise à jour en 71 s ; build et lancement API arrêtée : build réussi, pages à l'état vide ; `/rejoindre` entière, l'envoi échoue avec son message. **Liste partielle, observée par le relais** (réponse `503` sur `page=2`, pas un arrêt de l'API entre deux lectures) : cache vide → 100 éléments, la phrase « Cette liste est incomplète pour le moment. » une fois, nombre 120, aucune pagination ; page 2 de nouveau lisible → 120 à la visite suivante ; cache chaud et page 2 illisible pendant 70 s → 120 éléments, sans mention. | L'état interne du cache n'est pas observé : seul l'affichage l'est. Que la page en échec ne soit pas mise en cache est déduit du code (`lib/api.ts`) et du retour à 120 à la visite suivante. |
| 10. Forme | 1280, 768, 375 px sur les cinq pages avec un titre de 120 caractères, un résumé de 500, sept domaines, dix fonctions : aucun débordement, aucun texte hors de la page ; clavier : filtres (le filtre par domaine s'ouvre par Entrée), fiches, formulaire dans l'ordre, focus visible ; erreurs reliées, focus sur le premier champ en erreur ; un `h1`, images avec `alt`, `lang="fr"` ; squelettes affichés à l'arrivée sur une page de liste ; nettoyage ; lint ; trois builds ; adresse de l'API absente de `.next/static`. | **Non vérifié** : lecteur d'écran ; téléphone réel ; contrastes mesurés. Lors d'un simple changement de filtre, le squelette n'apparaît pas : le contenu précédent reste affiché jusqu'au nouveau. Le squelette (1 584 px) ne reprend pas la hauteur du contenu. |

Écarts au plan, constatés pendant l'exécution :

- **Accueil rendu à la demande** (`await connection()` dans `app/page.tsx`), au lieu de « généré statiquement » (plan, B2). Constat : régénéré statiquement, l'accueil repassait à l'état vide après environ deux minutes d'API arrêtée. Validé par le porteur du projet le 2026-10-02 ; reporté dans `ARCHITECTURE.md`, section 10.
- **Le cache survit à `next build`** en local (`apps/web/.next/cache/fetch-cache` est conservé) : la phrase d'A2 « repart de zéro après un build » a été remplacée par « un build ou un redéploiement peut le vider ».
- `SiteHeader.tsx` et `SiteFooter.tsx` lisent l'année en cours par `getCurrentRotaryYear()` : ils importaient la constante supprimée par T009.
- Les trois `loading.tsx` partagent un composant `components/ui/PageSkeleton` et sa feuille de style ; leurs libellés d'attente (« Chargement des actions », « … des actualités », « … des membres ») sont des libellés accessibles nouveaux.
- T045 : la recherche de `Profil` renvoie le composant `Profile` de l'annuaire et un commentaire CSS, antérieurs à 009 et sans lien avec les profils de démonstration ; `Antananarivo` apparaît aussi dans `config/site.ts`, comme nom de lieu.
- `apps/web/.env.local` a été créé pour la vérification (`API_URL=http://localhost:4000/api/v1`, fichier ignoré par Git).
- Un fichier orphelin de 5 242 880 octets est resté au stockage après un envoi abandonné par l'API au délai ; il a été retiré à la main. État final : toutes les collections à 0, `admins` à 1, aucun fichier de CV.

## Phase 11: Convergence

- [X] T051 Rendre l'attente conforme à FR-045 sur les pages Actions, Actualités et Membres, ou faire trancher le porteur du projet : constaté le 2026-10-02, un changement de filtre ou d'année avec le cache vide ne montre aucun squelette (le contenu précédent reste affiché, sans signal, jusqu'au nouveau), et `components/ui/PageSkeleton` est un bloc fixe de 1 584 px qui ne reprend pas les dimensions du contenu (`quickstart.md`, section 10, « Changement de filtre avec le cache vide » ; T016, T043). Soit les squelettes reprennent l'encombrement réel de l'ouverture et du bloc de liste et apparaissent aussi au changement de filtre, dans `apps/web/src/` seulement, sans dépendance ni composition nouvelle ; soit le comportement actuel est validé et inscrit dans `plan.md` (B10) et `quickstart.md` per FR-045 (partial)
  - **Fait le 2026-10-03.** Cause : les filtres sont des liens qui ne changent que les paramètres d'adresse ; Next.js traite ce changement comme une transition et ne réactive pas la frontière de `loading.tsx`, liée au segment de route. Correction : la lecture filtrée n'est plus attendue par la page mais passée en promesse à une frontière `Suspense` dont la clé est le filtre, autour des seules zones qui en dépendent — liste des actions et mention de liste incomplète (`ActionsIndex.tsx`), actualité à la une (`actualites/page.tsx`), fil et mention (`NewsRegister.tsx`), annuaire et index des fonctions (`membres/page.tsx`). Le titre et les liens de filtre restent montés : le focus du lien choisi est conservé. `PageSkeleton` reprend l'ouverture puis le début de la liste ; `ListSkeleton` (même fichier) prend la forme de la zone remplacée (actions, lignes du fil, une, annuaire), aux hauteurs relevées sur les pages réelles ; l'attente de l'annuaire porte l'ancre `#annuaire`. Libellés d'attente déplacés dans `content/`. Aucun changement du cache, des données, de l'API ni du Back Office. Vérifié à 1280, 768 et 375 px, lecture ralentie à 2,5 s par le relais d'observation : squelette au premier affichage et au changement de filtre au clavier sur les trois pages, liens et focus en place pendant l'attente, résultat identique à l'API, ancre atteinte, aucun débordement ; changement vers une cible déjà lue correct ; non-régression des sections 2 à 5, du clavier, des listes de 120, de la liste partielle (« Cette liste est incomplète pour le moment. » une fois) et de l'API arrêtée.
