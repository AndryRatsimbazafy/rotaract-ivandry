# Tasks: Membres et mandats

**Input**: Design documents from `/specs/004-members/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/members.md, contracts/mandates.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`.

**Organization**: les tâches sont groupées par récit utilisateur, dans l'ordre de priorité de la spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US5).
- **(manuel)** : opération faite à la main par le porteur du projet.

## Path Conventions

Tout le code vit dans `apps/api/src/`. Les commandes npm se lancent depuis la racine du dépôt. Style du code de l'API : guillemets simples, virgules finales, Prettier et oxlint.

## Décisions verrouillées à respecter

1. **T001 d'abord** : `ARCHITECTURE.md` est aligné avant toute modification de code.
2. Aucune dépendance à installer. Les DTO de modification sont écrits à la main.
3. Aucun portrait : ni champ, ni stockage d'image.
4. `order` n'est jamais fourni à la création : il vaut le plus grand ordre de l'année plus un, ou 1. Trous permis ; seul le réordonnancement de l'année les referme.
5. Deux index uniques sur les mandats : `(member, rotaryYear)` et `(rotaryYear, order)`.
6. Réordonnancement : une transaction ; à l'intérieur, contrôle complet de la liste, puis ordres multipliés par −1, puis ordres 1 à n. Aucune modification partielle, aucun ordre négatif visible. La nouvelle exécution éventuelle par le pilote n'est pas une garantie : la fonction doit pouvoir être exécutée plusieurs fois.
7. Aucune autre transaction, aucune abstraction de concurrence.
8. Les trois conflits répondent `409` « Conflit avec une ressource existante. ». Aucun nouveau message de conflit ; les messages de validation sont ceux des contrats.
9. Modification d'un membre : `null` efface `occupation`, `email` ou `phone` ; `""` est refusée.
10. Chaque contrôleur d'administration porte `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')` **sur la classe**, dès sa création.
11. Aucune donnée d'exemple. `apps/web`, `apps/admin`, `DESIGN.md`, la constitution, l'authentification et le socle ne sont pas modifiés.

## Prérequis manuels (hors tâches)

Une base MongoDB Atlas joignable, `apps/api/.env` renseigné, et le mot de passe du compte d'administration. Si l'un manque au moment de vérifier, le signaler explicitement et laisser les tâches de vérification concernées non cochées : aucune vérification n'est inventée.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose** : aligner la source de vérité avant tout code.

- [X] T001 Aligner `ARCHITECTURE.md`, en appliquant exactement les huit modifications du tableau « Écarts entre la spec et ARCHITECTURE.md » de `specs/004-members/plan.md`, et rien d'autre : (1) section 1.3, `order` : entier supérieur ou égal à 1, unique dans son année, attribué automatiquement à la création (plus grand ordre de l'année plus un), trous permis, refermés par le seul réordonnancement ; (2) section 3, index `(rotaryYear, order)` **unique** ; (3) section 3, « une seule transaction, pour le réordonnancement des mandats d'une année » ; (4) section 6, mandats : `201`, `204`, `409` pour un mandat en double ou un ordre déjà pris, liste de réordonnancement complète ; (5) section 6, membres : `201`, `204` ; (6) section 6, `GET /members` : liste vide si l'année n'existe pas ou sans année courante ; (7) section 6, `GET /members/years` : même forme que `GET /rotary-years` ; (8) section 1.2, `portrait` : non mis en œuvre avant le stockage de fichiers. Ne pas modifier la table des décisions verrouillées ni la section 13. **Aucun fichier de code n'est modifié avant la fin de cette tâche.**

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose** : les aides communes, les deux modèles et le module, dont tous les récits dépendent.

**⚠️ CRITICAL** : aucun récit ne peut commencer avant la fin de cette phase.

- [X] T002 [P] Créer `apps/api/src/common/enums/member-role.enum.ts` : l'énumération `MemberRole` avec exactement les dix valeurs `president`, `vice-president`, `tresorier`, `responsable-action`, `responsable-image-publique`, `responsable-camaraderie`, `responsable-effectif`, `responsable-fondation`, `protocole`, `secretaire`. Aucun libellé, aucune hiérarchie (FR-009).
- [X] T003 [P] Créer `apps/api/src/common/dto/pagination-query.dto.ts` : `page` « entier, 1 au moins, défaut 1 » et `limit` « entier de 1 à 100, défaut 20 », convertis depuis le texte de l'adresse ; messages « La page doit être un entier supérieur ou égal à 1. » et « La taille de page doit être un entier entre 1 et 100. ». Y déclarer la forme d'une réponse paginée : `{ data, meta: { page, limit, total, totalPages } }` (research.md, décision 10).
- [X] T004 [P] Dans `apps/api/src/common/utils/rotary-year.ts`, ajouter une fonction qui lit un label : une chaîne `AAAA-AAAA` de deux années consécutives donne son année de début ; toute autre chaîne est refusée. Ne pas modifier les trois fonctions existantes (research.md, décision 11).
- [X] T005 [P] Créer `apps/api/src/members/schemas/member.schema.ts` : schéma `Member`, option `timestamps`, collection `members`. `firstName` et `lastName` : « obligatoires, 1 à 120 caractères, espaces de début et de fin retirés » ; `occupation` : « facultatif, 1 à 120 caractères » ; `email` : « facultatif, mis en minuscules, 254 caractères au plus » ; `phone` : « facultatif ». Index `(lastName, firstName)` et index texte sur `firstName`, `lastName`. Aucun champ de fonction, d'état ni de portrait ; aucun index unique (FR-001 à FR-005).
- [X] T006 [P] Créer `apps/api/src/members/schemas/member-mandate.schema.ts` : schéma `MemberMandate`, option `timestamps`, collection `membermandates`. `member` et `rotaryYear` : « références, obligatoires » ; `roles` : « tableau de `MemberRole`, vide par défaut » ; `order` : « entier, obligatoire ». Index **uniques** `(member, rotaryYear)` et `(rotaryYear, order)` ; index `(rotaryYear, roles)`. Ne pas imposer « supérieur ou égal à 1 » dans le schéma : le réordonnancement passe par des valeurs négatives dans sa transaction (research.md, décision 2). Dépend de T002.
- [X] T007 Créer `apps/api/src/members/members.module.ts` : déclarer les modèles `Member`, `MemberMandate` et `RotaryYear` (`MongooseModule.forFeature`), importer `AuthModule`. Ne pas importer `RotaryYearsModule`. L'importer dans `apps/api/src/app.module.ts`. Dépend de T005 et T006.

**Checkpoint** : `npm run build:api` passe ; au démarrage, `members` et `membermandates` existent, vides, avec leurs index, dont deux uniques sur `membermandates`.

---

## Phase 3: User Story 1 - Gérer les membres (Priority: P1) 🎯 MVP

**Goal** : créer, lister, consulter, modifier et supprimer un membre, derrière l'authentification.

**Independent Test** : `quickstart.md`, sections 1 et 2.

### Implementation for User Story 1

- [X] T008 [P] [US1] Créer `apps/api/src/members/dto/create-member.dto.ts` : `firstName` et `lastName` obligatoires, `occupation`, `email`, `phone` facultatifs, avec les règles de `data-model.md` (téléphone : « chiffres, espaces, `+`, `-`, `.`, parenthèses ; au moins 8 chiffres » ; email : « valide, 254 caractères au plus, mis en minuscules ») et les messages de `contracts/members.md`. Espaces de début et de fin retirés.
- [X] T009 [P] [US1] Créer `apps/api/src/members/dto/update-member.dto.ts`, écrit à la main : les cinq mêmes champs, tous facultatifs ; `null` accepté pour `occupation`, `email` et `phone` (effacement) ; `""` refusée ; `firstName` et `lastName` ne peuvent être ni `null` ni vides.
- [X] T010 [P] [US1] Créer `apps/api/src/members/dto/query-members.dto.ts` : étend la pagination de T003 avec `q` « 2 caractères au moins », `year` « label `AAAA-AAAA`, deux années consécutives », `role` « une des dix fonctions », `sort` « `lastName` (défaut), `-lastName`, `createdAt`, `-createdAt` », et les messages de `contracts/members.md`.
- [X] T011 [US1] Créer `apps/api/src/members/members.service.ts` : création ; modification partielle (champ absent inchangé, `null` efface) ; liste paginée avec recherche par l'index texte, filtres `year` et `role` résolus par les mandats, tri, et `meta` ; fiche avec **tous** les mandats du membre, de l'année la plus récente à la plus ancienne. Deux formes de sortie construites explicitement : membre d'administration (sans mandats, champs facultatifs à `null` s'ils sont absents) et fiche (avec `mandates`). Membre inexistant : `404`. La suppression est écrite en T028. Dépend de T007 à T010.
- [X] T012 [US1] Créer `apps/api/src/members/members.admin.controller.ts` : contrôleur `admin/members` portant **sur la classe** `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')`. `GET` (liste), `GET :id`, `POST` (`201`), `PATCH :id`, avec `ParseObjectIdPipe` sur l'identifiant. Le déclarer, avec le service, dans `members.module.ts`. Dépend de T011.
- [X] T013 [US1] Vérification manuelle : dérouler `quickstart.md`, sections 1 et 2, sauf les lignes de suppression, vérifiées en T030.

**Checkpoint** : les membres se gèrent par l'API ; sans jeton, rien n'est lu ni écrit.

---

## Phase 4: User Story 2 - Gérer les mandats et les fonctions (Priority: P1)

**Goal** : inscrire un membre dans une année avec ses fonctions ; un seul mandat par couple.

**Independent Test** : `quickstart.md`, section 3.

### Implementation for User Story 2

- [X] T014 [P] [US2] Créer `apps/api/src/members/dto/create-mandate.dto.ts` : `member` et `rotaryYear` « obligatoires, identifiants bien formés » ; `roles` « facultatif, valeurs de `MemberRole`, sans doublon ». **Aucun champ `order`.** Messages de `contracts/mandates.md`.
- [X] T015 [P] [US2] Créer `apps/api/src/members/dto/update-mandate.dto.ts`, écrit à la main : `roles` (mêmes règles) et `order` « entier supérieur ou égal à 1 », tous deux facultatifs. Ni `member` ni `rotaryYear`.
- [X] T016 [P] [US2] Créer `apps/api/src/members/dto/query-mandates.dto.ts` : `year` (label) et `member` (identifiant), facultatifs.
- [X] T017 [US2] Créer `apps/api/src/members/mandates.service.ts` : création, liste, modification des fonctions, suppression d'un mandat. À la création : vérifier que le membre et l'année existent, sinon `400` avec le détail sur le champ (« Ce membre n'existe pas. », « Cette année Rotary n'existe pas. ») ; attribuer l'ordre au plus grand ordre de l'année plus un, ou 1 ; écrire. Sur une erreur de clé dupliquée, lire l'index en cause : `(member, rotaryYear)` → `409` générique, sans nouvelle tentative ; `(rotaryYear, order)` → recalculer l'ordre et réessayer, trois fois au plus. Forme de sortie d'un mandat : `id`, `member`, `rotaryYear` (`id` et `label`), `roles`, `order`, `createdAt`, `updatedAt`. Liste : filtres `year` et `member`, de l'année la plus récente à la plus ancienne puis par ordre ; année ou membre inconnus : liste vide. Mandat inexistant : `404`. La suppression d'un mandat ne touche ni le membre ni l'année ni les autres ordres (FR-006 à FR-012, FR-016, FR-017, FR-024, FR-026). Dépend de T007, T014 à T016.
- [X] T018 [US2] Créer `apps/api/src/members/mandates.admin.controller.ts` : contrôleur `admin/mandates` gardé **sur la classe** comme en T012. `GET`, `POST` (`201`), `PATCH :id`, `DELETE :id` (`204`), avec `ParseObjectIdPipe`. Le déclarer, avec le service, dans `members.module.ts`. Dépend de T017.
- [X] T019 [US2] Vérification manuelle : dérouler `quickstart.md`, section 3, après avoir créé par l'API les deux années de vérification.

**Checkpoint** : un membre peut être inscrit dans une année avec ses fonctions ; aucun doublon possible.

---

## Phase 5: User Story 3 - Choisir l'ordre d'affichage d'une année (Priority: P2)

**Goal** : ordre strict par année, modifiable mandat par mandat ou en une fois.

**Independent Test** : `quickstart.md`, section 4.

### Implementation for User Story 3

- [X] T020 [P] [US3] Créer `apps/api/src/members/dto/reorder-mandates.dto.ts` : `rotaryYear` « identifiant bien formé » et `mandateIds` « tableau d'identifiants bien formés, sans doublon ». Message : « La liste doit contenir tous les mandats de l'année, chacun une seule fois. ».
- [X] T021 [US3] Dans `apps/api/src/members/mandates.service.ts`, traiter la modification de l'ordre d'un mandat : écriture directe ; une clé dupliquée sur `(rotaryYear, order)` donne le `409` générique, sans rien modifier (FR-011c). Dépend de T017.
- [X] T022 [US3] Dans `apps/api/src/members/mandates.service.ts`, écrire le réordonnancement selon `plan.md`, section « Stratégie de réordonnancement » : année inexistante → `400` ; puis **une transaction** (`Connection.transaction` de Mongoose) dont la fonction, exécutable plusieurs fois et sans état, fait dans l'ordre : (a) lire dans la transaction les mandats de l'année et refuser (`400`, détail sur `mandateIds`) si la liste reçue n'est pas exactement cet ensemble, avant toute écriture ; (b) multiplier tous les ordres de l'année par −1 ; (c) donner à chaque mandat sa position dans la liste plus un. Après validation, relire et renvoyer les mandats de l'année dans leur nouvel ordre. Aucune autre transaction dans le code. Ne pas ajouter de nouvelle tentative applicative ni de message : un échec de transaction remonte au filtre du socle (FR-018). Dépend de T020 et T021.
- [X] T023 [US3] Dans `apps/api/src/members/mandates.admin.controller.ts`, ajouter `PUT order`, qui répond `200` avec `{ "data": [...] }`. Dépend de T022.
- [X] T024 [US3] Vérification manuelle : dérouler `quickstart.md`, section 4. Après chaque demande refusée, relire les mandats de l'année et constater que les ordres sont inchangés et qu'aucun n'est négatif.

**Checkpoint** : l'ordre d'une année est strict, et un réordonnancement refusé ne modifie rien.

---

## Phase 6: User Story 4 - Lire l'annuaire d'une année (Priority: P2)

**Goal** : lecture publique de l'annuaire et des années qui ont des membres, sans donnée interne.

**Independent Test** : `quickstart.md`, sections 5 et 6.

### Implementation for User Story 4

- [X] T025 [P] [US4] Créer `apps/api/src/members/dto/query-directory.dto.ts` : `year` « label, facultatif » et `limit` « entier de 1 à 100, facultatif ».
- [X] T026 [US4] Dans `apps/api/src/members/mandates.service.ts`, ajouter les deux lectures publiques. Annuaire : résoudre l'année (label reçu, sinon année courante) ; année inexistante ou aucune année courante → liste vide ; sinon les mandats de l'année triés par ordre, limités si `limit` est donné, chacun sous la forme publique `id`, `firstName`, `lastName`, `occupation` s'il existe, `rotaryYear` (label), `roles`, `order` — **jamais** `email`, `phone`, `portrait` ni dates techniques. Années ayant des membres : les années distinctes référencées par les mandats, dans la forme et le tri de la liste des années Rotary. Créer `apps/api/src/members/members.public.controller.ts` : contrôleur `members` sans garde, avec `GET` et `GET years`, réponses `{ "data": [...] }` ; le déclarer dans `members.module.ts` (FR-019 à FR-022). Dépend de T017 et T025.
- [X] T027 [US4] Vérification manuelle : dérouler `quickstart.md`, section 5. La section 6 (aucune année courante) est déroulée pendant le nettoyage, en T032.

**Checkpoint** : l'annuaire d'une année se lit sans jeton, dans l'ordre du club, sans donnée interne.

---

## Phase 7: User Story 5 - Conséquences des suppressions (Priority: P2)

**Goal** : aucune donnée orpheline ; aucune année référencée supprimée.

**Independent Test** : `quickstart.md`, section 7.

### Implementation for User Story 5

- [X] T028 [US5] Dans `apps/api/src/members/members.service.ts`, écrire la suppression d'un membre : `404` s'il n'existe pas ; sinon supprimer **d'abord** tous ses mandats, **puis** le membre. Pas de transaction. Dans `apps/api/src/members/members.admin.controller.ts`, ajouter `DELETE :id` (`204`) (FR-023). Dépend de T012 et T017.
- [X] T029 [US5] Dans `apps/api/src/rotary-years/rotary-years.module.ts`, déclarer aussi le modèle `MemberMandate`, sans importer `MembersModule`. Dans `apps/api/src/rotary-years/rotary-years.service.ts`, faire refuser la suppression d'une année référencée par au moins un mandat : `409` générique, année et mandats conservés ; une année sans mandat reste supprimable, et une année inexistante répond toujours `404`. Ne rien changer d'autre à ce service (FR-025). Dépend de T006.
- [X] T030 [US5] Vérification manuelle : dérouler `quickstart.md`, section 7, et les lignes de suppression de la section 2.

**Checkpoint** : les cinq récits fonctionnent.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose** : contrôles de fin d'étape, nettoyage, mise à jour des documents.

- [X] T031 Formater et contrôler : `npm run format --workspace=api`, puis `npm run lint`, `npm run build:api`, `npm run build:web` et `npm run build:admin` depuis la racine. Corriger toute erreur dans `apps/api` uniquement.
- [X] T032 Non-régression et nettoyage (`quickstart.md`, sections 6, 8 et 9) : routes existantes inchangées ; années créées, dédoublées et supprimées comme avant ; `401` sans jeton sur les nouvelles routes d'administration ; annuaire vide quand aucune année n'est courante ; puis supprimer par l'API tous les membres et toutes les années de vérification, et constater que `members`, `membermandates` et `rotaryyears` sont vides. `git status` ne montre aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md` ; aucun secret ni mot de passe dans les fichiers versionnables.
- [X] T033 [P] Mettre à jour `PROJECT_CONTEXT.md` (sections « apps/api », « Périmètre et prochaines étapes », « Points d'attention ») et la ligne d'état de `CLAUDE.md` : module `members` en place (membres, mandats, ordre, annuaire public), suppression d'une année référencée refusée, une transaction pour le réordonnancement, portrait reporté au stockage de fichiers. Ne pas modifier `ARCHITECTURE.md` (fait en T001), `DESIGN.md` ni la constitution.
- [X] T034 Dérouler `quickstart.md` en entier une dernière fois et consigner dans ce fichier, pour chaque section, ce qui a été vérifié et ce qui ne l'a pas été. Ne cocher cette tâche que si toutes les sections ont réellement été déroulées.

---

## Résultat des vérifications (2026-10-02)

Déroulées contre la base MongoDB Atlas du projet, API lancée depuis le build sur le port 4100, avec le compte d'administration existant. Le quickstart a été déroulé une première fois récit par récit, puis une seconde fois en entier (T034) : 81 contrôles, aucun échec.

| Section du quickstart | Résultat |
|---|---|
| 1. Démarrage | Vérifié : `members` et `membermandates` créées vides ; index `(member, rotaryYear)` et `(rotaryYear, order)` uniques ; annuaire et années publics vides. |
| 2. Membres | Vérifié : création (champs facultatifs à `null`, email en minuscules, espaces retirés) ; neuf refus de validation, dont `portrait` ; liste paginée à 20, tris, pages, recherche par mot entier ; dix paramètres refusés ; fiche ; modification partielle ; `null` efface, chaîne vide refusée ; `400` « Identifiant invalide. » et `404` ; `401` sans jeton. |
| 3. Mandats et fonctions | Vérifié : création avec ordres 1, 2, 3 ; mandat en double `409` ; deux créations simultanées du même couple (une `201`, une `409`) ; trois créations simultanées dans une même année (ordres 1, 2, 3) ; fonctions hors liste ou en double, `order` à la création, membre ou année inexistants : `400` ; même fonction pour deux membres ; membre et année non modifiables ; listes par année et par membre ; fiche avec tous les mandats ; filtres par année et fonction. |
| 4. Ordre | Vérifié : ordre pris `409` sans modification ; ordre libre accepté ; ordres 0, négatif, décimal, texte, `null` refusés ; réordonnancement en 1 à n ; liste incomplète, mandat en double, mandat d'une autre année, mandat inexistant, année inexistante : `400`, ordres inchangés ; l'autre année n'est pas touchée ; trou après suppression, nouveau mandat à la suite, trou refermé par le réordonnancement. Douze réordonnancements et modifications simultanés : état final 1 à n, aucun ordre négatif en base. |
| 5. Annuaire public | Vérifié : membres de l'année dans l'ordre du club ; année courante par défaut ; `limit` ; année inexistante `200` et liste vide ; labels mal formés et `limit` hors règle `400` ; années ayant des membres, sans l'année sans mandat ; aucun `email`, `phone`, `portrait` ni date technique dans les réponses. |
| 6. Aucune année courante | Vérifié après le nettoyage : `200` et liste vide. |
| 7. Suppressions | Vérifié : année référencée `409` « Conflit avec une ressource existante. », année et mandats conservés ; suppression d'un mandat sans effet sur le membre ni l'année ; suppression d'un membre et de ses trois mandats, années conservées ; année sans mandat supprimée. |
| 8. Non-régression | Vérifié : santé, `/auth/me`, années publiques et d'administration (création, doublon, valeur invalide, suppression, identifiant mal formé, année inconnue), `401` avec un jeton altéré, en-têtes de sécurité, `404` au format commun. |
| 9. Nettoyage | Vérifié : `members`, `membermandates` et `rotaryyears` vides ; `admins` : un compte, inchangé. |
| 10. Fin d'étape | Vérifié : format, lint, `build:api`, `build:web`, `build:admin` réussis ; aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md`. |

Écarts et points à connaître :

- **Défaut corrigé en cours de vérification** : le schéma des mandats déclarait ses références avec `Types.ObjectId` au lieu de `SchemaTypes.ObjectId`. L'identifiant du membre était enregistré en texte ; le filtre par membre et la fiche ne trouvaient aucun mandat. Corrigé dans `member-mandate.schema.ts`, données de vérification recréées, section 3 rejouée.
- **Ajout à T004** : en plus de la lecture d'un label, `common/utils/rotary-year.ts` reçoit une fonction qui donne l'année de début contenant un instant, nécessaire à l'annuaire de l'année courante (T026).
- **Nouvelle exécution d'une transaction par le pilote** : non observée directement. Les douze opérations simultanées ont toutes répondu `200` et laissé un état valide.
- **Recherche** : par mot entier ; une partie de mot ne trouve rien, comme prévu par l'architecture.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (phase 1)** : T001, seule, avant tout code.
- **Foundational (phase 2)** : dépend de T001. Bloque tous les récits.
- **US1 (phase 3)** : dépend de la phase 2.
- **US2 (phase 4)** : dépend de la phase 2 pour le code ; sa vérification suppose des membres créés par US1.
- **US3 (phase 5)** : dépend de US2 (le service des mandats).
- **US4 (phase 6)** : dépend de US2 ; l'ordre affiché se vérifie mieux après US3.
- **US5 (phase 7)** : dépend de US1 et US2.
- **Polish (phase 8)** : après tous les récits.

### Within Each User Story

- `mandates.service.ts` est modifié par T017, T021, T022 et T026 ; `members.service.ts` par T011 et T028 ; `members.admin.controller.ts` par T012 et T028 ; `mandates.admin.controller.ts` par T018 et T023 ; `members.module.ts` par T007, T012, T018 et T026. Ces tâches se font **l'une après l'autre**.
- Chaque contrôleur d'administration est créé avec ses gardes : aucune route `/admin` n'existe sans protection.
- La vérification manuelle clôt chaque récit.

### Parallel Opportunities

- T002, T003, T004 et T005 entre elles ; T006 après T002.
- T008, T009 et T010.
- T014, T015 et T016, pendant US1.
- T020 pendant US2 ; T025 pendant US3.
- T029 dès la fin de T006.
- T033 pendant T031 et T032.

## Parallel Example: User Story 1

```text
T008 : apps/api/src/members/dto/create-member.dto.ts
T009 : apps/api/src/members/dto/update-member.dto.ts
T010 : apps/api/src/members/dto/query-members.dto.ts
puis T011 : apps/api/src/members/members.service.ts
puis T012 : apps/api/src/members/members.admin.controller.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

Phases 1 et 2, puis US1 : les membres s'administrent. Arrêt et validation.

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

- Aucune tâche n'écrit de test automatisé, de portrait, d'envoi de fichier, d'action, d'actualité ni de candidature.
- Aucune tâche ne touche `apps/web`, `apps/admin`, `DESIGN.md`, la constitution, `main.ts`, la configuration, le filtre d'erreurs, les pipes existants ni l'authentification.
- Seule T001 modifie `ARCHITECTURE.md`.
- Aucune tâche n'installe de dépendance ni n'insère de donnée d'exemple.
- Une contradiction découverte en cours de route est signalée, pas résolue d'autorité (constitution, principe I).
