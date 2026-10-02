# Tasks: Actualités (News)

**Input**: Design documents from `/specs/006-news/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/news.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX) : ni Jest, ni Vitest, ni Playwright, ni Cypress. Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`.

**Organization**: les tâches sont groupées par récit utilisateur, dans l'ordre de la spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US5).

## Path Conventions

Tout le code vit dans `apps/api/src/`. Les commandes npm se lancent depuis la racine du dépôt. Style du code de l'API : guillemets simples, virgules finales, Prettier et oxlint.

## Décisions verrouillées à respecter

1. **T001 d'abord** : `ARCHITECTURE.md` est aligné avant toute modification de code.
2. Aucune dépendance à installer. Les DTO de modification sont écrits à la main.
3. **Aucune photographie** : ni champ `photos`, ni envoi, ni stockage, ni fournisseur de stockage.
4. Aucun champ ou statut « à la une », aucun ordre manuel, aucun impact, aucun domaine, aucune publication programmée, aucun état éditorial autre que brouillon et publié, aucune heure séparée ni date de fin.
5. **Aucune route `/news/years`** : `/news/archives` est l'unique lecture d'années pour les actualités.
6. L'année Rotary est une référence explicite, choisie par l'administrateur, jamais déduite de la date.
7. **Duplication limitée conservée** : la logique de slug du service, le retrait des espaces et la contrainte « label d'année » sont réécrits dans `news/`. Aucun fichier de `common/` existant, de `members/` ni d'`actions/` n'est modifié, et `news/` n'importe rien de `members/` ni d'`actions/`. Sont réutilisés depuis `common/` : `slugify`, `withSlugSuffix`, `SLUG_PATTERN`, `SLUG_MAX_LENGTH`, `PaginationQueryDto`, `parseRotaryYearLabel`, les fonctions de `rotary-year.ts`, `ParseObjectIdPipe`.
8. Slug : unique parmi les actualités, par index ; généré depuis le titre avec suffixe `-2`, `-3` ; jamais régénéré quand le titre change ; `archives` réservé (génération : `archives-2`, `archives-3` ; fourni explicitement : `400` « Ce slug est réservé. »).
9. Publication : `publishedAt` est posé à la première publication, jamais réécrit, jamais accepté en entrée ; à la création publiée, il est égal à `createdAt`. Ni transaction, ni verrou.
10. Tri public : date décroissante, puis identifiant. Tri d'administration : `date`, `title`, `createdAt`, dans les deux sens, `-date` par défaut ; rien d'autre.
11. Les deux conflits répondent `409` « Conflit avec une ressource existante. ». **Messages de validation : ceux de `contracts/news.md`, et aucun autre.**
12. `null` efface `location`, `summary`, `content` ; `""` est refusée ; un champ absent n'est pas modifié.
13. Le contrôleur d'administration porte `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')` **sur la classe**, dès sa création.
14. Les références se déclarent avec `SchemaTypes.ObjectId`.
15. Aucune donnée d'exemple. `apps/web`, `apps/admin`, `DESIGN.md`, la constitution, l'authentification et le socle ne sont pas modifiés.

## Prérequis manuels (hors tâches)

Une base MongoDB Atlas joignable, `apps/api/.env` renseigné, et le mot de passe du compte d'administration. Si l'un manque au moment de vérifier, le signaler explicitement et laisser les tâches de vérification concernées non cochées : aucune vérification n'est inventée.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose** : aligner la source de vérité avant tout code.

- [X] T001 Aligner `ARCHITECTURE.md`, en appliquant exactement les huit modifications du tableau « A. Alignements d'ARCHITECTURE.md proposés » de `specs/006-news/plan.md`, et rien d'autre : (1) section 1.5, `photos` : « Non mis en œuvre avant le stockage de fichiers. » ; (2) section 1.5, `publishedAt` : posé à la première publication, conservé à la dépublication et à la republication, création directement publiée possible, jamais fourni en entrée ; (3) section 1.5, `location` : 1 à 120 caractères ; (4) section 1.5, `date` : un seul champ de date et heure, ni heure séparée ni date de fin ; (5) section 6, actualités (administration) : création `201`, suppression `204`, `409` pour un slug déjà pris ; (6) section 6, `GET /news` : liste vide (`200`) si l'année n'existe pas ; (7) section 6, `GET /news/archives` : une entrée par année, `rotaryYear` dans la forme de `/rotary-years` et `count`, le nombre d'actualités publiées ; (8) section 8, slug : `archives` réservé pour les actualités, `archives-2` en génération automatique, refusé (`400`) s'il est fourni par l'administrateur. Ne modifier ni la table des décisions verrouillées, ni la section 13, ni les sections relatives aux actions. **Aucun fichier de code n'est modifié avant la fin de cette tâche.**

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose** : la liste des types, le modèle et le module, dont tous les récits dépendent.

**⚠️ CRITICAL** : aucun récit ne peut commencer avant la fin de cette phase.

- [X] T002 Créer `apps/api/src/common/enums/news-type.enum.ts` : l'énumération `NewsType` avec exactement les cinq valeurs `evenement`, `participation`, `reunion`, `formation`, `annonce`. Aucun libellé (FR-003).
- [X] T003 Créer `apps/api/src/news/schemas/news.schema.ts` : schéma `News`, option `timestamps`, **nom de collection fixé explicitement à `news`**. `title` « obligatoire, 1 à 120 caractères, espaces retirés » ; `slug` « obligatoire, **unique** » ; `type` « obligatoire, une des cinq valeurs de `NewsType` » ; `date` « obligatoire » ; `rotaryYear` « référence obligatoire », déclarée avec `SchemaTypes.ObjectId` ; `location` « facultatif, 120 caractères au plus » ; `summary` « facultatif, 500 caractères au plus » ; `content` « facultatif, 20 000 caractères au plus » ; `isPublished` « faux par défaut » ; `publishedAt` « facultatif ». **Aucun champ** `photos`, d'impact, de domaine, d'ordre, de mise en avant, d'heure ni de date de fin. Index : `slug` unique ; `(isPublished, date)` ; `(rotaryYear, isPublished)` ; `type` ; texte sur `title`, `summary`, sans racinisation (data-model.md). Dépend de T002.
- [X] T004 Créer `apps/api/src/news/news.module.ts` : déclarer les modèles `News` et `RotaryYear` (`MongooseModule.forFeature`), importer `AuthModule`. Ne pas importer `RotaryYearsModule`, `MembersModule` ni `ActionsModule`. L'importer dans `apps/api/src/app.module.ts`. Dépend de T003.

**Checkpoint** : `npm run build:api` passe ; au démarrage, `news` existe, vide, avec ses index, dont `slug` unique.

---

## Phase 3: User Story 1 - Rédiger et gérer une actualité (Priority: P1) 🎯 MVP

**Goal** : créer, lister, consulter, modifier et supprimer une actualité, derrière l'authentification.

**Independent Test** : `quickstart.md`, sections 1 et 2.

### Implementation for User Story 1

- [X] T005 [P] [US1] Créer `apps/api/src/news/dto/create-news.dto.ts` : `title` « 1 à 120 caractères », `type` « une des cinq valeurs », `date` « ISO 8601 », `rotaryYear` « identifiant bien formé » obligatoires ; `slug` « `^[a-z0-9]+(-[a-z0-9]+)*$`, 120 caractères au plus », `location` « 1 à 120 caractères », `summary` « 1 à 500 caractères », `content` « 1 à 20 000 caractères », `isPublished` « booléen » facultatifs ; espaces de début et de fin retirés. **Ni `photos`, ni `publishedAt`, ni `order`** : absents du DTO, ils sont refusés par le socle. Messages de `contracts/news.md`, exactement, dont « Le type doit être l'un des cinq types d'actualité. », « Le lieu compte 120 caractères au plus. » et « Le contenu compte 20 000 caractères au plus. ».
- [X] T006 [P] [US1] Créer `apps/api/src/news/dto/update-news.dto.ts`, écrit à la main : les mêmes champs, tous facultatifs ; un champ absent n'est pas validé ; `null` accepté pour `location`, `summary` et `content` ; `""` refusée ; `title`, `slug`, `type`, `date`, `rotaryYear` et `isPublished` ne peuvent pas être `null`.
- [X] T007 [P] [US1] Créer `apps/api/src/news/dto/query-admin-news.dto.ts` : étend `PaginationQueryDto` avec `q` « 2 caractères au moins », `year` « label », validé avec `parseRotaryYearLabel`, `type` « un des cinq types » (message « Type inconnu. »), `published` « `true` ou `false` », `sort` parmi exactement `date`, `-date`, `title`, `-title`, `createdAt`, `-createdAt`, défaut `-date`. Ne rien importer de `members/` ni d'`actions/`.
- [X] T008 [US1] Créer `apps/api/src/news/news.service.ts` : création, liste d'administration, consultation, modification, suppression. Création et modification : vérifier que l'année existe, sinon `400` avec le détail sur `rotaryYear` (« Cette année Rotary n'existe pas. ») ; enregistrer l'année telle quelle, sans la comparer à la date ; convertir la date ISO 8601 en date. Slug à la création : celui fourni, sinon celui tiré du titre par `slugify` ; la collision, le slug réservé et les conflits sont traités en T011. Modification : champ absent inchangé, `null` efface `location`, `summary` ou `content`. Liste : brouillons compris, recherche par l'index texte, filtres `year` (année inexistante → page vide, `200`), `type`, `published`, tri, `meta`. Forme de sortie d'administration construite explicitement : tous les champs, `rotaryYear` en `{ id, label }`, `location`, `summary`, `content`, `publishedAt` à `null` s'ils sont absents. Actualité inexistante : `404` (FR-001 à FR-006a, FR-015 à FR-018, FR-024). Dépend de T004 à T007.
- [X] T009 [US1] Créer `apps/api/src/news/news.admin.controller.ts` : contrôleur `admin/news` portant **sur la classe** `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')`. `GET`, `GET :id`, `POST` (`201`), `PATCH :id`, `DELETE :id` (`204`), avec `ParseObjectIdPipe`. Le déclarer, avec le service, dans `news.module.ts`. Dépend de T008.
- [X] T010 [US1] Vérification manuelle : dérouler `quickstart.md`, sections 1 et 2 — dont les cinq types acceptés et trois écritures de type refusées, la date sans heure et avec heure, le lieu de 121 caractères, `null` qui efface et `""` refusée, les six tris, l'année inexistante en filtre, et le refus de `photos`, `publishedAt` et `order`.

**Checkpoint** : les actualités se gèrent par l'API ; sans jeton, rien n'est lu ni écrit.

---

## Phase 4: User Story 2 - Donner à chaque actualité une adresse stable (Priority: P1)

**Goal** : slug unique parmi les actualités, généré avec suffixe, jamais modifié sans demande ; `archives` réservé.

**Independent Test** : `quickstart.md`, section 3.

### Implementation for User Story 2

- [X] T011 [US2] Dans `apps/api/src/news/news.service.ts`, compléter la gestion du slug. **Généré** : slug vide tiré du titre → `400`, détail sur `slug` (« Aucun slug ne peut être tiré de ce titre : fournissez-en un. ») ; prendre la base si elle est libre et n'est pas `archives`, sinon le premier suffixe libre à partir de `-2` par `withSlugSuffix` (`archives-2`, `archives-3`) ; si l'index unique refuse l'écriture, recommencer, cinq fois au plus. **Fourni** : `archives` → `400`, détail sur `slug` (« Ce slug est réservé. »), à la création comme à la modification ; sinon écrit tel quel, sans suffixe ; clé dupliquée → `409` générique. **Stabilité** : à la modification, le slug n'est écrit que si le champ est envoyé ; modifier le titre ne le change pas. L'unicité ne concerne que la collection `news` (FR-007 à FR-011a). Dépend de T008.
- [X] T012 [US2] Vérification manuelle : dérouler `quickstart.md`, section 3, y compris les deux créations simultanées du même titre, les quatre cas du slug `archives`, et une action et une actualité de même titre portant le même slug.

**Checkpoint** : aucun doublon de slug possible ; aucune actualité ne peut prendre l'adresse `/news/archives`.

---

## Phase 5: User Story 3 - Publier et dépublier (Priority: P1)

**Goal** : brouillon par défaut ; date de première publication fixée une seule fois.

**Independent Test** : `quickstart.md`, section 4.

### Implementation for User Story 3

- [X] T013 [US3] Dans `apps/api/src/news/news.service.ts`, traiter la publication : à la modification, quand `isPublished` passe à vrai et que `publishedAt` n'existe pas, écrire `publishedAt` à l'instant courant ; dans tous les autres cas, ne pas y toucher. À la création publiée, écrire **le même instant** dans `createdAt` et `publishedAt`. Ne jamais accepter `publishedAt` en entrée. Ni transaction, ni verrou (FR-012, FR-014 à FR-014b). Dépend de T011.
- [X] T014 [US3] Vérification manuelle : dérouler `quickstart.md`, section 4, sauf la ligne du détail public d'un brouillon, vérifiée en T018 : `publishedAt` identique après dépublication et republication ; `publishedAt` égal à `createdAt` pour une création publiée ; `publishedAt` refusé en entrée.

**Checkpoint** : une actualité se publie et se dépublie sans perdre sa date de première publication.

---

## Phase 6: User Story 4 - Lire les actualités publiées (Priority: P2)

**Goal** : liste paginée, détail par slug et archives, sans authentification et sans donnée d'administration.

**Independent Test** : `quickstart.md`, section 5.

### Implementation for User Story 4

- [X] T015 [P] [US4] Créer `apps/api/src/news/dto/query-public-news.dto.ts` : étend `PaginationQueryDto` avec `q`, `year` et `type`, aux mêmes règles et messages qu'en T007. Ni `published` ni `sort`.
- [X] T016 [US4] Dans `apps/api/src/news/news.service.ts`, ajouter les trois lectures publiques, qui ne voient que les actualités **publiées**. Liste : filtres `q`, `year` (année inexistante → page vide), `type` ; tri par `date` décroissante, puis identifiant. Détail par slug : `404` si le slug est inconnu ou l'actualité non publiée. Archives : regrouper les actualités publiées par année Rotary et les compter ; une entrée `{ rotaryYear, count }` par année, `rotaryYear` dans la forme de la liste des années Rotary (`id`, `startYear`, `label`, `startDate`, `endDate`, `isCurrent`), de la plus récente à la plus ancienne ; les brouillons ne sont pas comptés ; une année sans actualité publiée n'y figure pas. Forme de sortie publique construite explicitement : `id`, `slug`, `title`, `type`, `date`, `rotaryYear` (label), et `location`, `summary`, `content` s'ils existent ; **jamais** `isPublished`, `publishedAt`, `createdAt`, `updatedAt` (FR-013, FR-019 à FR-023). Dépend de T013 et T015.
- [X] T017 [US4] Créer `apps/api/src/news/news.public.controller.ts` : contrôleur `news` sans garde, avec `GET`, `GET archives` et `GET :slug`, **`archives` déclaré avant `:slug`**. **Aucune route `years`.** Le déclarer dans `news.module.ts`. Dépend de T016.
- [X] T018 [US4] Vérification manuelle : dérouler `quickstart.md`, section 5, et la ligne du détail public d'un brouillon de la section 4 : publiées seulement, tri par date, filtres, recherche qui ignore les brouillons, année inexistante, pagination, archives avec leur nombre et sa baisse après une dépublication, absence de donnée d'administration, `404` sur `/news/years`.

**Checkpoint** : seules les actualités publiées sont lisibles sans jeton, la plus récente d'abord.

---

## Phase 7: User Story 5 - Protéger les années Rotary référencées (Priority: P2)

**Goal** : une année Rotary référencée par une actualité ne se supprime pas.

**Independent Test** : `quickstart.md`, section 6.

### Implementation for User Story 5

- [X] T019 [US5] Dans `apps/api/src/rotary-years/rotary-years.module.ts`, déclarer aussi le modèle `News`, sans importer `NewsModule`. Dans `apps/api/src/rotary-years/rotary-years.service.ts`, ajouter aux contrôles existants des mandats et des actions celui des actualités, brouillons compris : `409` générique, année et actualités conservées. Ne rien changer d'autre à ce service ; les refus pour les mandats et les actions restent inchangés (FR-025). Dépend de T003.
- [X] T020 [US5] Vérification manuelle : dérouler `quickstart.md`, section 6 (année référencée par un brouillon, suppression de l'actualité puis de l'année, suppression d'une actualité sans effet sur l'année).

**Checkpoint** : les cinq récits fonctionnent.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose** : contrôles de fin d'étape, non-régression, nettoyage, secrets, documents.

- [X] T021 Formater et contrôler : `npm run format --workspace=api`, puis `npm run lint`, `npm run build:api`, `npm run build:web` et `npm run build:admin` depuis la racine. Corriger toute erreur dans `apps/api/src/news`, `common/enums/news-type.enum.ts` ou `rotary-years/` uniquement.
- [X] T022 Non-régression de 001 à 005 (`quickstart.md`, section 7) : santé ; `/auth/me` sans jeton puis avec jeton ; années Rotary (création, doublon, valeur texte, suppression) ; membres et mandats (création, annuaire, refus de supprimer l'année référencée) ; actions (création, publication, lecture par slug, refus de supprimer l'année référencée) ; `401` avec un jeton altéré sur les quatre opérations d'administration des actualités ; en-têtes de sécurité.
- [X] T023 Nettoyage d'Atlas par l'API (`quickstart.md`, section 8) : supprimer par l'API toutes les actualités, actions, membres et années de vérification ; constater que `news`, `actions`, `members`, `membermandates` et `rotaryyears` sont vides et que `admins` contient toujours son unique compte. Aucune suppression directe en base.
- [X] T024 Secrets et périmètre : une recherche du mot de passe du compte, de `JWT_SECRET`, du mot de passe et de l'hôte de la base dans les fichiers versionnables ne renvoie rien ; `apps/api/.env` n'apparaît pas dans `git status` et ne contient aucune variable `ADMIN_` ; `apps/api/.env.example` ne contient aucune valeur ; `git status` ne montre aucun fichier modifié dans `apps/web`, `apps/admin`, `DESIGN.md`, `apps/api/src/members`, `apps/api/src/actions`, `apps/api/src/auth`, ni aucune dépendance ajoutée.
- [X] T025 [P] Mettre à jour `PROJECT_CONTEXT.md` (sections « apps/api », « Périmètre et prochaines étapes », « Points d'attention ») et la ligne d'état de `CLAUDE.md` : module `news` en place (administration, slug, publication, lectures publiques, archives), suppression d'une année référencée par une actualité refusée, photographies reportées au stockage de fichiers, duplication des aides entre `members`, `actions` et `news`. Ne pas modifier `ARCHITECTURE.md` (fait en T001), `DESIGN.md` ni la constitution.
- [X] T026 Dérouler `quickstart.md` en entier une dernière fois et consigner dans ce fichier, pour chaque section, ce qui a été vérifié et ce qui ne l'a pas été. Ne cocher cette tâche que si toutes les sections ont réellement été déroulées.

---

## Résultat des vérifications (2026-10-02)

Déroulées contre la base MongoDB Atlas du projet, API lancée depuis le build sur le port 4100, avec le compte d'administration existant. Le quickstart a été déroulé une première fois récit par récit, puis une seconde fois en entier (T026) : 102 contrôles, aucun échec. Aucun défaut n'a été découvert pendant les vérifications.

| Section du quickstart | Résultat |
|---|---|
| 1. Démarrage | Vérifié : collection `news` créée vide (nom exact) ; index `slug` unique, `(isPublished, date)`, `(rotaryYear, isPublished)`, `type`, texte ; listes publiques vides ; `401` sans jeton. |
| 2. Rédiger et gérer | Vérifié : création minimale (slug généré, brouillon, champs facultatifs à `null`, pas de `photos`) ; vingt-deux refus de validation, dont `photos`, `publishedAt`, `order`, `impact`, `featured`, `endDate`, trois écritures de type, lieu de 121 caractères, résumé de 501, contenu de 20 001 ; les cinq types acceptés ; contenu de 20 000 caractères accepté ; date sans heure (minuit UTC) et avec heure (instant converti) ; date hors année acceptée ; six tris acceptés, deux refusés ; recherche, filtres par année, type et publication ; année inexistante en filtre `200` et liste vide ; `null` efface, chaîne vide refusée, absence inchangée ; type et année modifiables ; `400` « Identifiant invalide. » et `404`. |
| 3. Slug | Vérifié : slug sans accents ; suffixes `-2` et `-3` ; slug fourni écrit tel quel ; slug déjà pris `409` à la création et à la modification, rien modifié ; six slugs mal formés refusés ; titre modifié sans changement de slug ; titre sans slug possible `400` avec le message existant ; trois créations simultanées : trois slugs distincts ; `archives-2` puis `archives-3` en génération ; `archives` fourni : `400` « Ce slug est réservé. » à la création et à la modification ; une action et une actualité de même titre portent le même slug. |
| 4. Publication | Vérifié : brouillon `404` côté public ; publication, dépublication et republication avec `publishedAt` identique ; inchangé après une autre modification ; création directement publiée avec `publishedAt` égal à `createdAt`, avec ou sans slug fourni ; `publishedAt` refusé en entrée. |
| 5. Lecture publique | Vérifié : actualités publiées seulement, date décroissante ; champs publics sans donnée d'administration ; pagination ; filtres par année et type ; recherche qui ignore les brouillons ; année inexistante `200` et liste vide ; détail par slug, `404` pour un slug inconnu ou un brouillon ; archives : une entrée par année avec la forme d'une année Rotary et `count`, sans l'année qui n'a qu'un brouillon ; `count` qui baisse après une dépublication ; `/news/years` répond `404`. |
| 6. Années Rotary | Vérifié : année référencée par un brouillon ou par une actualité publiée `409`, rien supprimé ; supprimable après suppression de l'actualité ; suppression d'une actualité sans effet sur l'année. |
| 7. Non-régression | Vérifié : santé ; `/auth/me` sans et avec jeton ; années (création, doublon, valeur texte, suppression, identifiant mal formé, année inconnue) ; membres et mandats (création, ordre pris `409`, réordonnancement, annuaire sans email, années ayant des membres, année référencée `409`) ; actions (publication, impact, lecture par slug, années, slug `years` réservé, année référencée `409`) ; `401` sans jeton et avec un jeton altéré sur les opérations d'administration des actualités ; en-têtes de sécurité. |
| 8. Nettoyage | Vérifié : tout supprimé par l'API ; `news`, `actions`, `members`, `membermandates` et `rotaryyears` vides ; `admins` : un compte, inchangé. |
| 9. Fin d'étape | Vérifié : format, lint, `build:api`, `build:web`, `build:admin` réussis ; aucun fichier modifié dans `apps/web`, `apps/admin`, `DESIGN.md`, `members/`, `actions/` ni `auth/` ; aucune dépendance ajoutée ; aucun secret dans les fichiers versionnables. |

Points à connaître :

- **`years` n'est pas réservé pour les actualités** : seul `archives` l'est. Une actualité peut porter le slug `years` ; il n'existe aucune route `/news/years` avec laquelle il entrerait en conflit.
- **Recherche** : par mot entier ; une partie de mot ne trouve rien, comme pour les membres et les actions.
- **Code dupliqué** entre `actions` et `news`, comme décidé : logique de slug du service, retrait des espaces, contrainte « label d'année », mise en forme d'une année.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (phase 1)** : T001, seule, avant tout code.
- **Foundational (phase 2)** : dépend de T001. Bloque tous les récits.
- **US1 (phase 3)** : dépend de la phase 2.
- **US2 (phase 4)** : dépend de US1 (le service).
- **US3 (phase 5)** : dépend de US2.
- **US4 (phase 6)** : dépend de US3 (seules les actualités publiées sont lues).
- **US5 (phase 7)** : dépend de la phase 2 pour le code ; sa vérification suppose US1.
- **Polish (phase 8)** : après tous les récits. T023 après T022 ; T026 en dernier.

### Within Each User Story

- `news.service.ts` est modifié par T008, T011, T013 et T016 ; `news.module.ts` par T004, T009 et T017. Ces tâches se font **l'une après l'autre**.
- Le contrôleur d'administration est créé avec ses gardes : aucune route `/admin` n'existe sans protection.
- La vérification manuelle clôt chaque récit.

### Parallel Opportunities

- Aucune avant la fin de T001. Dans la phase 2, T002, T003 et T004 se suivent.
- T005, T006 et T007.
- T015 pendant US2 ou US3.
- T019 dès la fin de T003.
- T025 pendant T021 à T024.

## Parallel Example: User Story 1

```text
T005 : apps/api/src/news/dto/create-news.dto.ts
T006 : apps/api/src/news/dto/update-news.dto.ts
T007 : apps/api/src/news/dto/query-admin-news.dto.ts
puis T008 : apps/api/src/news/news.service.ts
puis T009 : apps/api/src/news/news.admin.controller.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

Phases 1 et 2, puis US1 : les actualités s'administrent, en brouillon. Arrêt et validation.

### Incremental Delivery

1. Alignement d'`ARCHITECTURE.md`, puis fondations.
2. US1, vérification, validation.
3. US2, vérification, validation.
4. US3, vérification, validation.
5. US4, vérification, validation.
6. US5, vérification, validation.
7. Polish.

Un seul intervenant : pas de stratégie d'équipe. Les arrêts pour validation suivent la constitution (principe II) ; aucun commit sans demande explicite (principe XI).

## Notes

- Aucune tâche n'écrit de test automatisé, de photographie, d'envoi de fichier, de mise à la une, d'ordre manuel, d'impact, de publication programmée ni de route `/news/years`.
- Aucune tâche ne touche `apps/web`, `apps/admin`, `DESIGN.md`, la constitution, `main.ts`, la configuration, le filtre d'erreurs, les pipes, l'authentification, `apps/api/src/members` ni `apps/api/src/actions`.
- Seule T001 modifie `ARCHITECTURE.md`.
- Aucune tâche n'installe de dépendance, ne factorise du code de `004` ou de `005`, ni n'insère de donnée d'exemple.
- Aucun message n'est créé pendant l'implémentation : ceux de `contracts/news.md` suffisent.
- Une contradiction découverte en cours de route est signalée, pas résolue d'autorité (constitution, principe I).
