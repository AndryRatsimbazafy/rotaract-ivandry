# Tasks: Actions

**Input**: Design documents from `/specs/005-actions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/actions.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`.

**Organization**: les tâches sont groupées par récit utilisateur, dans l'ordre de la spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US6).

## Path Conventions

Tout le code vit dans `apps/api/src/`. Les commandes npm se lancent depuis la racine du dépôt. Style du code de l'API : guillemets simples, virgules finales, Prettier et oxlint.

## Décisions verrouillées à respecter

1. **T001 d'abord** : `ARCHITECTURE.md` est aligné avant toute modification de code.
2. Aucune dépendance à installer. Les DTO de modification sont écrits à la main.
3. **Aucune photographie** : ni champ `photos`, ni envoi, ni stockage d'image par adresse, ni module `media`.
4. **Aucun refactor de `004-members`** : aucun fichier de `members/` n'est modifié ni déplacé, et `actions/` n'importe rien de `members/`. Sont réutilisés depuis `common/` : la pagination et `parseRotaryYearLabel`.
5. Slug : unique par index ; généré depuis le titre avec suffixe `-2`, `-3` ; jamais régénéré quand le titre change ; `years` réservé (génération : `years-2` ; fourni explicitement : `400`).
6. Publication : `publishedAt` est posé à la première publication et n'est jamais réécrit. Ni transaction, ni verrou.
7. Ordre manuel : entier ≥ 1, facultatif, global, doublons autorisés. **Aucune route de réordonnancement.**
8. Tri public : actions ayant un ordre, par ordre croissant ; puis date décroissante ; puis identifiant. Tri d'administration : `date`, `title`, `createdAt`, dans les deux sens, `-date` par défaut ; rien d'autre.
9. Impact : facultatif ; remplacement de l'objet entier ; rubriques de 500 caractères, 20 partenaires de 120 caractères ; absent des réponses s'il n'a aucune rubrique.
10. Les deux conflits répondent `409` « Conflit avec une ressource existante. ». **Messages de validation : ceux de `contracts/actions.md`, et aucun autre.**
11. `null` efface `summary`, `description`, `order`, `impact` ; `""` est refusée.
12. Le contrôleur d'administration porte `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')` **sur la classe**, dès sa création.
13. Les références se déclarent avec `SchemaTypes.ObjectId` (`PROJECT_CONTEXT.md`, points d'attention).
14. Aucune donnée d'exemple. `apps/web`, `apps/admin`, `DESIGN.md`, la constitution, l'authentification et le socle ne sont pas modifiés. La contradiction `DESIGN.md` / `ARCHITECTURE.md` sur le registre d'impact n'est pas résolue.

## Prérequis manuels (hors tâches)

Une base MongoDB Atlas joignable, `apps/api/.env` renseigné, et le mot de passe du compte d'administration. Si l'un manque au moment de vérifier, le signaler explicitement et laisser les tâches de vérification concernées non cochées : aucune vérification n'est inventée.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose** : aligner la source de vérité avant tout code.

- [X] T001 Aligner `ARCHITECTURE.md`, en appliquant exactement les huit modifications du tableau « Alignements d'ARCHITECTURE.md proposés » de `specs/005-actions/plan.md`, et rien d'autre : (1) section 1.4, `photos` : « Non mis en œuvre avant le stockage de fichiers. » ; (2) section 1.4, `order` : entier supérieur ou égal à 1, global, doublons permis, aucun réordonnancement ; (3) section 1.4, `ActionImpact` : rubriques de texte de 500 caractères au plus, 20 partenaires au plus de 120 caractères chacun, une modification remplace l'objet entier ; (4) section 1.4, `publishedAt` : conservé à la dépublication et à la republication, création directement publiée possible ; (5) section 6, actions (administration) : création `201`, suppression `204`, `409` pour un slug déjà pris ; (6) section 6, `GET /actions` : liste vide (`200`) si l'année n'existe pas ; (7) section 8, slug : un titre dont aucun slug ne peut être tiré est refusé (`400`) si aucun slug n'est fourni ; (8) section 8, slug : `years` est réservé pour les actions, la génération automatique passe à `years-2`, fourni par l'administrateur il est refusé (`400`). Ne modifier ni la table des décisions verrouillées, ni la section 13, ni la décision ouverte sur le registre d'impact. **Aucun fichier de code n'est modifié avant la fin de cette tâche.**

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose** : la liste des domaines, la génération de slug, le modèle et le module, dont tous les récits dépendent.

**⚠️ CRITICAL** : aucun récit ne peut commencer avant la fin de cette phase.

- [X] T002 [P] Créer `apps/api/src/common/enums/focus-area.enum.ts` : l'énumération `FocusArea` avec exactement les sept valeurs `paix`, `maladies`, `eau`, `sante`, `education`, `economie`, `environnement`. Aucun libellé (FR-004).
- [X] T003 [P] Créer `apps/api/src/common/utils/slug.ts` : une fonction pure qui tire un slug d'un texte — accents retirés, minuscules, toute suite de caractères autres que lettres et chiffres remplacée par un tiret, tirets de début et de fin retirés, 120 caractères au plus. Le résultat respecte `^[a-z0-9]+(-[a-z0-9]+)*$` ou est vide. Aucune lecture de la base, aucune règle propre aux actions (research.md, décision 3).
- [X] T004 [P] Créer `apps/api/src/actions/schemas/action.schema.ts` : schéma `Action`, option `timestamps`, collection `actions`. `title` « obligatoire, 1 à 120 caractères, espaces retirés » ; `slug` « obligatoire, **unique** » ; `summary` « facultatif, 500 caractères au plus » ; `description` « facultatif, 20 000 caractères au plus » ; `date` « obligatoire » ; `rotaryYear` « référence obligatoire », déclarée avec `SchemaTypes.ObjectId` ; `focusAreas` « tableau de `FocusArea`, vide par défaut » ; `impact` « sous-document facultatif, sans identifiant propre » aux six rubriques `objective`, `beneficiaries`, `location`, `period`, `partners`, `results` ; `isPublished` « faux par défaut » ; `publishedAt` « facultatif » ; `order` « facultatif ». **Aucun champ `photos`.** Index : `slug` unique ; `(isPublished, date)` ; `(rotaryYear, isPublished)` ; `focusAreas` ; texte sur `title`, `summary`, sans racinisation (data-model.md). Dépend de T002.
- [X] T005 Créer `apps/api/src/actions/actions.module.ts` : déclarer les modèles `Action` et `RotaryYear` (`MongooseModule.forFeature`), importer `AuthModule`. Ne pas importer `RotaryYearsModule` ni `MembersModule`. L'importer dans `apps/api/src/app.module.ts`. Dépend de T004.

**Checkpoint** : `npm run build:api` passe ; au démarrage, `actions` existe, vide, avec ses index, dont `slug` unique.

---

## Phase 3: User Story 1 - Rédiger et gérer une action (Priority: P1) 🎯 MVP

**Goal** : créer, lister, consulter, modifier et supprimer une action, derrière l'authentification.

**Independent Test** : `quickstart.md`, sections 1 et 2.

### Implementation for User Story 1

- [X] T006 [P] [US1] Créer `apps/api/src/actions/dto/create-action.dto.ts` : `title`, `date` « ISO 8601 », `rotaryYear` « identifiant bien formé » obligatoires ; `slug` « `^[a-z0-9]+(-[a-z0-9]+)*$`, 120 caractères au plus », `summary` « 1 à 500 caractères », `description` « 1 à 20 000 caractères », `focusAreas` « valeurs de `FocusArea`, sans doublon », `isPublished` « booléen », `order` « entier supérieur ou égal à 1 » facultatifs. Aucun champ `photos` ni `publishedAt`. Messages de `contracts/actions.md`, exactement. L'impact est ajouté en T021.
- [X] T007 [P] [US1] Créer `apps/api/src/actions/dto/update-action.dto.ts`, écrit à la main : les mêmes champs, tous facultatifs ; `null` accepté pour `summary`, `description` et `order` ; `""` refusée ; `title`, `slug`, `date`, `rotaryYear`, `focusAreas` et `isPublished` ne peuvent pas être `null`.
- [X] T008 [P] [US1] Créer `apps/api/src/actions/dto/query-admin-actions.dto.ts` : étend `PaginationQueryDto` (`common/dto/`) avec `q` « 2 caractères au moins », `year` « label », validé avec `parseRotaryYearLabel` (`common/utils/`), `focusArea` « un des sept domaines », `published` « `true` ou `false` », `sort` parmi exactement `date`, `-date`, `title`, `-title`, `createdAt`, `-createdAt`, défaut `-date`. Ne rien importer de `members/`.
- [X] T009 [US1] Créer `apps/api/src/actions/actions.service.ts` : création, liste d'administration, consultation, modification, suppression. Création et modification : vérifier que l'année existe, sinon `400` avec le détail sur `rotaryYear` (« Cette année Rotary n'existe pas. ») ; enregistrer l'année telle quelle, sans la comparer à la date. Slug à la création : celui fourni, sinon celui tiré du titre par T003 ; la collision, le slug réservé et les conflits sont traités en T012. Modification : champ absent inchangé, `null` efface. Liste : brouillons compris, recherche par l'index texte, filtres `year` (année inexistante → page vide, `200`), `focusArea`, `published`, tri, `meta`. Forme de sortie d'administration construite explicitement : tous les champs, `rotaryYear` en `{ id, label }`, `summary`, `description`, `publishedAt`, `order` à `null` s'ils sont absents. Action inexistante : `404` (FR-001 à FR-005, FR-016 à FR-019, FR-026). Dépend de T005 à T008.
- [X] T010 [US1] Créer `apps/api/src/actions/actions.admin.controller.ts` : contrôleur `admin/actions` portant **sur la classe** `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')`. `GET`, `GET :id`, `POST` (`201`), `PATCH :id`, `DELETE :id` (`204`), avec `ParseObjectIdPipe`. **Aucune route `order`.** Le déclarer, avec le service, dans `actions.module.ts`. Dépend de T009.
- [X] T011 [US1] Vérification manuelle : dérouler `quickstart.md`, sections 1 et 2.

**Checkpoint** : les actions se gèrent par l'API ; sans jeton, rien n'est lu ni écrit.

---

## Phase 4: User Story 2 - Donner à chaque action une adresse stable (Priority: P1)

**Goal** : slug unique, généré avec suffixe, jamais modifié sans demande ; `years` réservé.

**Independent Test** : `quickstart.md`, section 3.

### Implementation for User Story 2

- [X] T012 [US2] Dans `apps/api/src/actions/actions.service.ts`, compléter la gestion du slug. **Généré** : slug vide tiré du titre → `400`, détail sur `slug` (« Aucun slug ne peut être tiré de ce titre : fournissez-en un. ») ; lire les slugs existants de même base ; prendre la base si elle est libre et n'est pas `years`, sinon le premier suffixe libre à partir de `-2`, en raccourcissant la base pour tenir en 120 caractères ; si l'index unique refuse l'écriture, recommencer, cinq fois au plus. **Fourni** : `years` → `400`, détail sur `slug` (« Ce slug est réservé. ») ; sinon écrit tel quel, sans suffixe ; clé dupliquée → `409` générique, à la création comme à la modification. **Stabilité** : à la modification, le slug n'est écrit que si le champ est envoyé ; modifier le titre ne le change pas (FR-006 à FR-009, FR-030a). Dépend de T009.
- [X] T013 [US2] Vérification manuelle : dérouler `quickstart.md`, section 3, y compris les deux créations simultanées du même titre et les quatre cas du slug `years`.

**Checkpoint** : aucun doublon de slug possible ; aucune action ne peut prendre l'adresse `/actions/years`.

---

## Phase 5: User Story 3 - Publier et dépublier (Priority: P1)

**Goal** : brouillon par défaut ; date de première publication conservée.

**Independent Test** : `quickstart.md`, section 4.

### Implementation for User Story 3

- [X] T014 [US3] Dans `apps/api/src/actions/actions.service.ts`, traiter la publication : à la création comme à la modification, quand `isPublished` passe à vrai et que `publishedAt` n'existe pas, écrire `publishedAt` à l'instant courant ; dans tous les autres cas, ne pas toucher à `publishedAt`. Ne l'accepter jamais en entrée. Ni transaction, ni verrou (FR-010, FR-011, FR-019a). Dépend de T012.
- [X] T015 [US3] Vérification manuelle : dérouler `quickstart.md`, section 4, sauf la ligne du détail public d'un brouillon, vérifiée en T019.

**Checkpoint** : une action se publie et se dépublie sans perdre sa date de première publication.

---

## Phase 6: User Story 4 - Lire les actions publiées (Priority: P2)

**Goal** : liste paginée, détail par slug et années, sans authentification et sans donnée d'administration.

**Independent Test** : `quickstart.md`, sections 5 et 7.

### Implementation for User Story 4

- [X] T016 [P] [US4] Créer `apps/api/src/actions/dto/query-public-actions.dto.ts` : étend `PaginationQueryDto` avec `q`, `year` et `focusArea`, aux mêmes règles et messages qu'en T008. Ni `published` ni `sort`.
- [X] T017 [US4] Dans `apps/api/src/actions/actions.service.ts`, ajouter les trois lectures publiques, qui ne voient que les actions **publiées**. Liste : par une agrégation — filtre, clé calculée « a un ordre », tri sur cette clé, puis `order` croissant, puis `date` décroissante, puis identifiant, puis saut et limite ; année inexistante → page vide. Détail par slug : `404` si le slug est inconnu ou l'action non publiée. Années : celles référencées par au moins une action publiée, dans la forme et le tri de la liste des années Rotary. Forme de sortie publique construite explicitement : `id`, `slug`, `title`, `summary` et `description` s'ils existent, `date`, `rotaryYear` (label), `focusAreas`, `impact` s'il existe ; **jamais** `isPublished`, `publishedAt`, `order`, `createdAt`, `updatedAt` (FR-012, FR-020 à FR-025). Dépend de T014 et T016.
- [X] T018 [US4] Créer `apps/api/src/actions/actions.public.controller.ts` : contrôleur `actions` sans garde, avec `GET`, `GET years` et `GET :slug`, **`years` déclaré avant `:slug`**. Le déclarer dans `actions.module.ts`. Dépend de T017.
- [X] T019 [US4] Vérification manuelle : dérouler `quickstart.md`, sections 5 et 7 (tri public avec ordres, ordre en double, valeurs d'ordre refusées, retrait par `null`, absence de route de réordonnancement), et la ligne du détail public d'un brouillon de la section 4.

**Checkpoint** : seules les actions publiées sont lisibles sans jeton, dans l'ordre prévu.

---

## Phase 7: User Story 5 - Décrire l'impact sans rien inventer (Priority: P2)

**Goal** : impact facultatif, remplacé en entier, jamais rempli par défaut.

**Independent Test** : `quickstart.md`, section 6.

### Implementation for User Story 5

- [X] T020 [US5] Dans `apps/api/src/actions/dto/create-action.dto.ts` et `apps/api/src/actions/dto/update-action.dto.ts`, ajouter `impact` : objet facultatif validé en profondeur, dont les rubriques `objective`, `beneficiaries`, `location`, `period`, `results` comptent chacune « 1 à 500 caractères » et `partners` « 20 éléments au plus, chacun de 1 à 120 caractères » ; rubrique inconnue refusée. En modification, `null` est accepté. Messages de `contracts/actions.md`. Dépend de T006 et T007.
- [X] T021 [US5] Dans `apps/api/src/actions/actions.service.ts`, traiter l'impact : un objet sans aucune rubrique équivaut à l'absence d'impact et n'est pas enregistré ; un objet avec rubriques **remplace l'impact entier**, sans fusion ; `null` l'efface. Dans les deux formes de sortie, omettre `impact` quand il est absent ou sans rubrique, et ne renvoyer que les rubriques renseignées (FR-013 à FR-015a). Dépend de T017 et T020.
- [X] T022 [US5] Vérification manuelle : dérouler `quickstart.md`, section 6.

**Checkpoint** : aucune réponse ne contient une rubrique d'impact non renseignée.

---

## Phase 8: User Story 6 - Protéger les années Rotary référencées (Priority: P2)

**Goal** : une année Rotary référencée par une action ne se supprime pas.

**Independent Test** : `quickstart.md`, section 8.

### Implementation for User Story 6

- [X] T023 [US6] Dans `apps/api/src/rotary-years/rotary-years.module.ts`, déclarer aussi le modèle `Action`, sans importer `ActionsModule`. Dans `apps/api/src/rotary-years/rotary-years.service.ts`, ajouter au contrôle existant des mandats celui des actions, brouillons compris : `409` générique, année et actions conservées. Ne rien changer d'autre à ce service ; le refus pour les mandats reste inchangé (FR-027). Dépend de T004.
- [X] T024 [US6] Vérification manuelle : dérouler les trois premières lignes de `quickstart.md`, section 8 (année référencée par un brouillon, suppression de l'action puis de l'année, suppression d'une action sans effet sur l'année).

**Checkpoint** : les six récits fonctionnent.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose** : contrôles de fin d'étape, nettoyage, mise à jour des documents.

- [X] T025 Formater et contrôler : `npm run format --workspace=api`, puis `npm run lint`, `npm run build:api`, `npm run build:web` et `npm run build:admin` depuis la racine. Corriger toute erreur dans `apps/api/src/actions`, `common/` ou `rotary-years/` uniquement.
- [X] T026 Non-régression et nettoyage (`quickstart.md`, sections 8 et 9) : santé, authentification, années Rotary, membres et mandats répondent comme avant, dont le refus de supprimer une année référencée par un mandat ; `401` avec un jeton altéré sur les routes d'administration des actions ; puis supprimer par l'API toutes les actions, tous les membres et toutes les années de vérification, et constater que `actions`, `members`, `membermandates` et `rotaryyears` sont vides. `git status` ne montre aucun fichier modifié dans `apps/web`, `apps/admin`, `DESIGN.md` ni `apps/api/src/members` ; aucun secret ni mot de passe dans les fichiers versionnables.
- [X] T027 [P] Mettre à jour `PROJECT_CONTEXT.md` (sections « apps/api », « Périmètre et prochaines étapes », « Points d'attention ») et la ligne d'état de `CLAUDE.md` : module `actions` en place (administration, slug, publication, impact, lectures publiques), suppression d'une année référencée par une action refusée, photographies reportées au stockage de fichiers, contradiction `DESIGN.md` / `ARCHITECTURE.md` sur le registre d'impact toujours ouverte pour la migration du Front Office. Ne pas modifier `ARCHITECTURE.md` (fait en T001), `DESIGN.md` ni la constitution.
- [X] T028 Dérouler `quickstart.md` en entier une dernière fois et consigner dans ce fichier, pour chaque section, ce qui a été vérifié et ce qui ne l'a pas été. Ne cocher cette tâche que si toutes les sections ont réellement été déroulées.

---

## Résultat des vérifications (2026-10-02)

Déroulées contre la base MongoDB Atlas du projet, API lancée depuis le build sur le port 4100, avec le compte d'administration existant. Le quickstart a été déroulé une première fois récit par récit, puis une seconde fois en entier (T028) : 93 contrôles, aucun échec.

| Section du quickstart | Résultat |
|---|---|
| 1. Démarrage | Vérifié : collection `actions` créée vide ; index `slug` unique, `(isPublished, date)`, `(rotaryYear, isPublished)`, `focusAreas`, texte ; listes publiques vides ; `401` sans jeton. |
| 2. Rédiger et gérer | Vérifié : création minimale (slug généré, brouillon, champs facultatifs à `null`, ni `impact` ni `photos`) ; treize refus de validation, dont `photos` et `publishedAt` ; année inexistante `400` ; date hors année acceptée, année enregistrée telle quelle ; liste paginée à 20 ; six tris acceptés, un refusé ; recherche, filtres par année, domaine et publication ; année inexistante en filtre `200` et liste vide ; `null` efface, chaîne vide refusée ; année modifiable ; `400` « Identifiant invalide. » et `404`. |
| 3. Slug | Vérifié : slug sans accents ; suffixes `-2` et `-3` ; slug fourni écrit tel quel ; slug déjà pris `409` à la création et à la modification, rien modifié ; sept slugs mal formés refusés ; titre modifié sans changement de slug ; titre sans slug possible `400` ; trois créations simultanées du même titre : trois slugs distincts ; `years-2` puis `years-3` en génération ; `years` fourni : `400` « Ce slug est réservé. » à la création et à la modification ; titre de 120 caractères en double : slug de 120 caractères avec suffixe. |
| 4. Publication | Vérifié : brouillon `404` côté public ; publication, dépublication et republication avec `publishedAt` identique ; création directement publiée avec `publishedAt` égal à `createdAt` ; `publishedAt` refusé en entrée. |
| 5. Lecture publique | Vérifié : actions publiées seulement ; champs publics sans donnée d'administration ; tri par ordre puis date ; même ordre pour deux actions, départagées par la date ; pagination ; filtres par année et domaine ; recherche qui ignore les brouillons ; année inexistante `200` et liste vide ; détail par slug, `404` pour un slug inconnu ou un brouillon ; années ayant une action publiée, sans celle qui n'a qu'un brouillon. |
| 6. Impact | Vérifié : absent par défaut ; deux rubriques ; remplacement complet sans fusion ; objet vide et `null` : champ absent ; rubrique vide, 501 caractères, 21 partenaires, partenaire de 121 caractères, partenaire vide, rubrique inconnue, impact non objet : `400` ; impact à la création. |
| 7. Ordre | Vérifié : 0, négatif, décimal, texte refusés ; `null` retire l'ordre ; aucune route de réordonnancement (`404`). |
| 8. Années et non-régression | Vérifié : année référencée par un brouillon ou par des actions publiées `409`, rien supprimé ; année supprimable après suppression de l'action ; suppression d'une action sans effet sur l'année ; année référencée par un mandat toujours refusée ; santé, `/auth/me`, années Rotary, annuaire des membres comme avant ; `401` avec un jeton altéré ; en-têtes de sécurité. |
| 9. Nettoyage | Vérifié : `actions`, `members`, `membermandates` et `rotaryyears` vides ; `admins` : un compte, inchangé. |
| 10. Fin d'étape | Vérifié : format, lint, `build:api`, `build:web`, `build:admin` réussis ; aucun fichier modifié dans `apps/web`, `apps/admin`, `DESIGN.md` ni `apps/api/src/members`. |

Écarts et points à connaître :

- **Défaut corrigé en cours de vérification** : pour une action créée directement publiée, `publishedAt` précédait `createdAt` d'une centaine de millisecondes, les deux dates étant prises à des moments différents. La création écrit désormais le même instant dans les deux champs ; section 4 rejouée.
- **Réponse à un impact envoyé comme tableau** : deux lignes de détail (« impact » et « impact.0 ») portant le même message, au lieu d'une.
- **`PATCH /admin/actions/order`** répond `400` « Identifiant invalide. » et non `404` : l'adresse est lue comme une modification de l'action d'identifiant « order ». Aucune route de réordonnancement n'existe.
- **Aides dupliquées** : le retrait des espaces et la contrainte « label d'année » sont écrits dans `actions/dto/`, comme décidé, sans toucher à `004-members`.
- **Recherche** : par mot entier ; une partie de mot ne trouve rien.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (phase 1)** : T001, seule, avant tout code.
- **Foundational (phase 2)** : dépend de T001. Bloque tous les récits.
- **US1 (phase 3)** : dépend de la phase 2.
- **US2 (phase 4)** : dépend de US1 (le service).
- **US3 (phase 5)** : dépend de US2.
- **US4 (phase 6)** : dépend de US3 (seules les actions publiées sont lues).
- **US5 (phase 7)** : dépend de US1 pour les DTO et de US4 pour la forme de sortie publique.
- **US6 (phase 8)** : dépend de la phase 2 pour le code ; sa vérification suppose US1.
- **Polish (phase 9)** : après tous les récits.

### Within Each User Story

- `actions.service.ts` est modifié par T009, T012, T014, T017 et T021 ; `create-action.dto.ts` et `update-action.dto.ts` par T006, T007 et T020 ; `actions.module.ts` par T005, T010 et T018. Ces tâches se font **l'une après l'autre**.
- Le contrôleur d'administration est créé avec ses gardes : aucune route `/admin` n'existe sans protection.
- La vérification manuelle clôt chaque récit.

### Parallel Opportunities

- T002, T003 entre elles ; T004 après T002.
- T006, T007 et T008.
- T016 pendant US2 ou US3.
- T023 dès la fin de T004.
- T027 pendant T025 et T026.

## Parallel Example: User Story 1

```text
T006 : apps/api/src/actions/dto/create-action.dto.ts
T007 : apps/api/src/actions/dto/update-action.dto.ts
T008 : apps/api/src/actions/dto/query-admin-actions.dto.ts
puis T009 : apps/api/src/actions/actions.service.ts
puis T010 : apps/api/src/actions/actions.admin.controller.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

Phases 1 et 2, puis US1 : les actions s'administrent, en brouillon. Arrêt et validation.

### Incremental Delivery

1. Alignement d'`ARCHITECTURE.md`, puis fondations.
2. US1, vérification, validation.
3. US2, vérification, validation.
4. US3, vérification, validation.
5. US4, vérification, validation.
6. US5, vérification, validation.
7. US6, vérification, validation.
8. Polish.

Un seul intervenant : pas de stratégie d'équipe. Les arrêts pour validation suivent la constitution (principe II) ; aucun commit sans demande explicite (principe XI).

## Notes

- Aucune tâche n'écrit de test automatisé, de photographie, d'envoi de fichier, d'actualité, de candidature, de registre d'impact agrégé ni de route de réordonnancement.
- Aucune tâche ne touche `apps/web`, `apps/admin`, `DESIGN.md`, la constitution, `main.ts`, la configuration, le filtre d'erreurs, les pipes existants, l'authentification ni `apps/api/src/members`.
- Seule T001 modifie `ARCHITECTURE.md`.
- Aucune tâche n'installe de dépendance ni n'insère de donnée d'exemple.
- Aucun message n'est créé pendant l'implémentation : ceux de `contracts/actions.md` suffisent.
- Une contradiction découverte en cours de route est signalée, pas résolue d'autorité (constitution, principe I).
