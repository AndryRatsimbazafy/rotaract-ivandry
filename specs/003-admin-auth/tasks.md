# Tasks: Authentification de l'administrateur

**Input**: Design documents from `/specs/003-admin-auth/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/auth.md, contracts/seed-admin.md, quickstart.md ; `specs/002-rotary-years/contracts/rotary-years.md` (section « Temps 2 »)

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`.

**Organization**: les tâches sont groupées par récit utilisateur, dans l'ordre de priorité de la spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US5).
- **(manuel)** : opération faite à la main par le porteur du projet.

## Path Conventions

Tout le code vit dans `apps/api/`. Les commandes npm se lancent depuis la racine du dépôt. Style du code de l'API : guillemets simples, virgules finales, Prettier et oxlint.

## Décisions verrouillées à respecter

1. Trois dépendances, et seulement celles-là : `@nestjs/jwt`, `argon2`, `@nestjs/throttler`. Pas de Passport.
2. **Aucune route `/admin` sans protection, à aucun moment** : les gardes (US3) sont écrites avant le contrôleur d'administration des années (US4).
3. `ADMIN_EMAIL` et `ADMIN_PASSWORD` : placées temporairement dans `apps/api/.env`, seulement pour la commande `seed:admin`, puis retirées avant la vérification normale de l'API. Jamais lues par l'API, jamais journalisées, jamais commitées. `.env.example` n'en porte que les noms.
4. Connexion : aucun contrôle de format d'email ; email inconnu, email mal formé et mot de passe faux reçoivent le même `401` « Email ou mot de passe incorrect. » ; le hachage factice est vérifié pour un email inconnu.
5. `JWT_EXPIRES_IN` : défaut `8h`, durée strictement positive, 8 heures au plus. La constitution n'est pas modifiée.
6. Limitation : uniquement sur `POST /api/v1/auth/login`, 5 demandes par 60 secondes et par adresse IP, toutes les demandes comptant, stockage en mémoire. **Aucune garde de limitation globale.**
7. `401` et `403` restent distincts dans les gardes. Le `403` n'a pas de scénario métier naturel avec l'unique rôle `ADMIN` : il est vérifié structurellement.
8. Du socle, seuls `config/env.validation.ts` et `config/app-config.ts` changent. `main.ts`, `common/filters/`, `common/pipes/validation.pipe.ts`, `health/`, la liste publique et le schéma des années ne sont pas modifiés.
9. `apps/web`, `apps/admin`, `DESIGN.md` et la constitution ne sont pas modifiés. `ARCHITECTURE.md` a déjà été aligné au plan : plus aucune modification.

## Prérequis manuels (hors code)

- Une base MongoDB Atlas joignable depuis le poste.
- T002 ci-dessous : `JWT_EXPIRES_IN` à `8h` ou moins dans `apps/api/.env`.

Si un prérequis manque au moment de vérifier, le signaler explicitement et laisser les tâches de vérification concernées non cochées : aucune vérification n'est inventée.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose** : dépendances validées et environnement prêt.

- [X] T001 Installer les trois dépendances depuis la racine : `npm install @nestjs/jwt argon2 @nestjs/throttler --workspace=api`. Vérifier que seuls `apps/api/package.json` et `package-lock.json` changent, qu'aucune autre dépendance n'est ajoutée, et que `argon2` s'installe avec son binaire précompilé, sans compilation ; sinon s'arrêter et le signaler (research.md, décision 11).
- [X] T002 (manuel) Dans `apps/api/.env`, ramener `JWT_EXPIRES_IN` à `8h` ou moins, ou retirer la ligne (elle vaut `1d` aujourd'hui). Sans cela, l'API refuse de démarrer dès T003.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose** : la règle de durée du jeton, le compte et le module d'authentification, dont tous les récits dépendent.

**⚠️ CRITICAL** : aucun récit ne peut commencer avant la fin de cette phase.

- [X] T003 Dans `apps/api/src/config/env.validation.ts`, resserrer la règle de `JWT_EXPIRES_IN` : « Nombre suivi de `s`, `m`, `h` ou `d` ; durée strictement positive et de 8 heures au plus ». Ajouter une fonction qui convertit la valeur en secondes et s'en servir pour la validation. Mettre à jour le texte de la règle dans le message de configuration, qui nomme la variable sans afficher sa valeur. Acceptées : `1s`, `60s`, `480m`, `8h`, `28800s`. Refusées : `0s`, `0h`, `481m`, `9h`, `1d`. Absente ou vide : `8h`. Ne modifier aucune autre variable (FR-013, FR-013a, FR-026a).
- [X] T004 Dans `apps/api/src/config/app-config.ts`, exposer la durée du jeton en secondes, calculée avec la fonction de T003, en plus de la valeur textuelle. Dépend de T003.
- [X] T005 [P] Créer `apps/api/src/auth/schemas/admin.schema.ts` : schéma Mongoose `Admin`, option `timestamps`, collection `admins`. Champs : `email` « chaîne, obligatoire, **Unique**, en minuscules, sans espaces autour » ; `passwordHash` « chaîne, obligatoire, jamais renvoyé par l'API » ; `role` « obligatoire, seule valeur possible : `ADMIN` ». Aucun autre champ : pas de date de changement de mot de passe, pas de compteur, pas d'état (data-model.md, FR-001, FR-013b).
- [X] T006 Créer `apps/api/src/auth/auth.module.ts` : déclarer le modèle `Admin` (`MongooseModule.forFeature`) et configurer `@nestjs/jwt` depuis la configuration validée : secret `JWT_SECRET`, algorithme HS256 à la signature et imposé à la vérification, durée `JWT_EXPIRES_IN`. L'importer dans `apps/api/src/app.module.ts`. Dépend de T001, T004 et T005.
- [X] T007 [P] Mettre à jour `apps/api/.env.example` : commentaire de `JWT_EXPIRES_IN` (« défaut 8h ; durée strictement positive et de 8 heures au plus ») ; ajouter `ADMIN_EMAIL=` et `ADMIN_PASSWORD=`, sans valeur, avec un commentaire disant qu'elles ne servent qu'à `npm run seed:admin --workspace=api`, qu'elles sont à retirer de `.env` ensuite, et que l'API ne les lit jamais (FR-005, FR-029).
- [X] T008 Vérification manuelle : dérouler `quickstart.md`, section 1 (règle de `JWT_EXPIRES_IN`), en passant chaque valeur à la commande de démarrage sans modifier `apps/api/.env`.

**Checkpoint** : `npm run build:api` passe ; l'API démarre avec une durée valide et refuse une durée nulle ou supérieure à 8 heures ; la collection `admins` existe, vide.

---

## Phase 3: User Story 1 - Créer le compte d'administration (Priority: P1) 🎯 MVP

**Goal** : une commande manuelle crée l'unique compte `ADMIN`, ou remplace son mot de passe.

**Independent Test** : `quickstart.md`, section 2.

### Implementation for User Story 1

- [X] T009 [US1] Créer `apps/api/src/auth/seed-admin.ts` : point d'entrée distinct qui ouvre un contexte d'application NestJS sans serveur HTTP et **sans le journal de NestJS**, lit `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans l'environnement, et applique `contracts/seed-admin.md` à la lettre. Règles d'entrée : `ADMIN_EMAIL` « obligatoire, email valide, 254 caractères au plus, normalisé : espaces retirés, minuscules » ; `ADMIN_PASSWORD` « obligatoire, 12 caractères au moins ». Aucun compte : création, hachage Argon2id (réglages par défaut d'`argon2`), rôle `ADMIN`. Compte de même email : mot de passe remplacé. Compte d'un autre email : refus, rien n'est modifié. Messages et codes de sortie : exactement ceux du tableau « Comportement » du contrat. La sortie ne contient jamais le mot de passe, son hachage, l'email du compte existant, ni l'adresse ou le nom d'hôte de la base (FR-002 à FR-006). Dépend de T006.
- [X] T010 [US1] Dans `apps/api/package.json`, ajouter le script `seed:admin` : il compile l'API puis exécute le fichier compilé de T009 en passant `apps/api/.env` à Node (`--env-file`). Aucune dépendance ajoutée. Dépend de T009.
- [X] T011 [US1] (manuel) Placer temporairement `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans `apps/api/.env`, avec l'email et le mot de passe choisis pour le compte.
- [X] T012 [US1] Vérification manuelle : dérouler `quickstart.md`, section 2 (valeur absente, mot de passe de 11 caractères, création, remplacement du mot de passe, refus d'un autre email, relecture de la sortie). Constater en base un seul document dans `admins`, email en minuscules, `passwordHash` illisible. Les cas de refus se vérifient en passant des valeurs de vérification à la commande, sans toucher aux valeurs réelles de T011.
- [X] T013 [US1] (manuel) **Retirer `ADMIN_EMAIL` et `ADMIN_PASSWORD` de `apps/api/.env`**, puis démarrer l'API et constater un démarrage normal. Toute la suite se fait sans ces deux variables.

**Checkpoint** : le compte existe ; l'API démarre sans connaître ses identifiants.

---

## Phase 4: User Story 2 - Se connecter et obtenir un jeton (Priority: P1)

**Goal** : `POST /api/v1/auth/login` délivre un jeton ; toute erreur d'identifiants reçoit le même `401`.

**Independent Test** : `quickstart.md`, section 3.

### Implementation for User Story 2

- [X] T014 [P] [US2] Créer `apps/api/src/auth/dto/login.dto.ts` : deux champs, `email` et `password`, chacun « chaîne non vide ». Messages : « L'email est obligatoire. », « Le mot de passe est obligatoire. ». **Aucun contrôle de format d'email, aucune longueur minimale de mot de passe** (FR-011).
- [X] T015 [US2] Créer `apps/api/src/auth/auth.service.ts` : méthode de connexion. Normaliser l'email (espaces retirés, minuscules) ; chercher le compte ; vérifier le mot de passe avec `argon2`. Email inconnu (ou mal formé) : vérifier quand même un **hachage factice**, puis lever la même exception que pour un mot de passe faux : `401` « Email ou mot de passe incorrect. ». Succès : signer un jeton portant `sub` (identifiant du compte) et `role`, et renvoyer `accessToken`, `tokenType` `Bearer`, `expiresIn` (durée effective en secondes, T004) et `admin` (`id`, `email`, `role`). Ne jamais journaliser mot de passe, jeton ni hachage (FR-007 à FR-014). Dépend de T006 et T014.
- [X] T016 [US2] Créer `apps/api/src/auth/auth.controller.ts` : contrôleur `auth` avec `POST login`, qui répond `200` (et non `201`) avec le corps de `contracts/auth.md`. Le déclarer, avec le service de T015, dans `apps/api/src/auth/auth.module.ts`. Dépend de T015.
- [X] T017 [US2] Vérification manuelle : dérouler `quickstart.md`, section 3 (bons identifiants, email en majuscules avec espaces, mot de passe faux, email inconnu, email mal formé, champ absent, champ en trop, relecture du journal). Comparer octet pour octet les corps des `401`.

**Checkpoint** : la connexion délivre un jeton ; aucune réponse ne distingue un email inconnu d'un mot de passe faux.

---

## Phase 5: User Story 3 - Protéger l'administration (Priority: P1)

**Goal** : deux gardes distinctes, jeton puis rôle ; `GET /api/v1/auth/me` renvoie le compte connecté.

**Independent Test** : `quickstart.md`, section 4.

### Implementation for User Story 3

- [X] T018 [P] [US3] Créer `apps/api/src/auth/decorators/roles.decorator.ts` (`@Roles`) et `apps/api/src/auth/decorators/current-admin.decorator.ts` (`@CurrentAdmin`, qui donne le compte attaché à la requête).
- [X] T019 [US3] Créer `apps/api/src/auth/guards/jwt-auth.guard.ts` : lire `Authorization: Bearer <jeton>`, vérifier le jeton (HS256, expiration), relire le compte par son identifiant et l'attacher à la requête sous la forme `{ id, email, role }`. En-tête absent, autre type que `Bearer`, jeton mal formé, signature invalide, jeton expiré, compte inexistant : lever `UnauthorizedException` **sans message**, pour que le filtre du socle réponde « Authentification requise. » avec le même corps dans tous les cas (FR-016 à FR-018). Dépend de T006.
- [X] T020 [US3] Créer `apps/api/src/auth/guards/roles.guard.ts` : lire les rôles demandés par `@Roles` ; si le compte attaché n'en a aucun, lever `ForbiddenException` **sans message** (« Accès refusé. »). Ne jamais renvoyer simplement « faux ». La distinction `401` / `403` reste portée par deux gardes distinctes (FR-015, FR-018). Dépend de T018.
- [X] T021 [US3] Dans `apps/api/src/auth/auth.controller.ts`, ajouter `GET me`, protégé par `JwtAuthGuard` seulement, qui renvoie `{ id, email, role }`. Dans `apps/api/src/auth/auth.module.ts`, déclarer et exporter les deux gardes et ce dont elles ont besoin, pour que les modules de ressources les utilisent. Dépend de T016, T019 et T020.
- [X] T022 [US3] Vérification manuelle : dérouler `quickstart.md`, section 4 (compte connecté, trois refus `401` de même corps, jeton expiré avec une durée de 2 secondes passée à la commande de démarrage, ancien jeton encore valable après un changement de mot de passe, routes publiques inchangées). Vérifier le `403` structurellement, par relecture de `roles.guard.ts`. Le changement de mot de passe replace temporairement les deux variables dans `apps/api/.env` (manuel), puis les retire.

**Checkpoint** : aucune adresse protégée ne répond sans jeton valide ; les routes publiques répondent comme avant.

---

## Phase 6: User Story 4 - Administrer les années Rotary (Priority: P2)

**Goal** : création, liste d'administration et suppression des années, protégées dès leur création (temps 2 de `002-rotary-years`).

**Independent Test** : `quickstart.md`, section 5.

**⚠️ Dépend de US3** : le contrôleur de T026 ne doit pas être écrit avant les gardes.

### Implementation for User Story 4

- [X] T023 [P] [US4] Créer `apps/api/src/common/pipes/parse-object-id.pipe.ts` : `ParseObjectIdPipe`, qui lève un `400` « Identifiant invalide. » pour un identifiant mal formé (FR-025). Ne pas utiliser le pipe du même nom de `@nestjs/mongoose`, dont le message est en anglais.
- [X] T024 [P] [US4] Créer `apps/api/src/rotary-years/dto/create-rotary-year.dto.ts` : un seul champ, `startYear`, « entier JSON compris entre 2000 et 2100, bornes incluses ». Message unique pour toute valeur invalide ou absente : « L'année de début doit être un entier entre 2000 et 2100. ». Aucune conversion depuis un texte : `"2026"` est refusé (`002` FR-017).
- [X] T025 [US4] Dans `apps/api/src/rotary-years/rotary-years.service.ts`, ajouter la création et la suppression. Création : écrire sans lecture préalable ; convertir l'erreur de clé dupliquée de l'index unique en `409` « Cette année Rotary existe déjà. » ; renvoyer l'année dans la forme de la liste. Suppression : année inconnue, `404`. Ne pas modifier la méthode de liste ni les calculs. Aucun contrôle « année référencée » : aucune entité ne référence encore une année (`002` FR-019, FR-022 à FR-024, FR-026). Dépend de T024.
- [X] T026 [US4] Créer `apps/api/src/rotary-years/rotary-years.admin.controller.ts` : contrôleur `admin/rotary-years` portant **sur la classe** `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')`. `GET` : même réponse que la liste publique. `POST` : `201`, année créée. `DELETE :id` avec le pipe de T023 : `204` sans corps. Aucune autre route, aucune modification d'année. Dans `apps/api/src/rotary-years/rotary-years.module.ts`, importer `AuthModule` et déclarer ce contrôleur. Dépend de T021, T023 et T025.
- [X] T027 [US4] Vérification manuelle : dérouler `quickstart.md`, section 5 (création `201`, doublon `409`, cinq valeurs invalides, champ en trop, liste d'administration, apparition dans la liste publique, `400` « Identifiant invalide. », `404`, suppression `204`, puis les mêmes écritures sans jeton : `401` et rien de créé ni de supprimé).

**Checkpoint** : les années s'administrent par l'API ; sans jeton, rien n'est lu ni écrit sous `/admin`.

---

## Phase 7: User Story 5 - Limiter les tentatives de connexion (Priority: P2)

**Goal** : la sixième demande de connexion en une minute depuis une même adresse reçoit `429`.

**Independent Test** : `quickstart.md`, section 6.

### Implementation for User Story 5

- [X] T028 [US5] Dans `apps/api/src/app.module.ts`, configurer le module de `@nestjs/throttler` : stockage en mémoire, message d'erreur « Trop de requêtes. Réessayez plus tard. ». **Ne déclarer aucune garde de limitation globale.** Si l'option de message de la bibliothèque ne convient pas, le signaler avant de choisir une autre voie (research.md, décision 8). Dépend de T001.
- [X] T029 [US5] Dans `apps/api/src/auth/auth.controller.ts`, poser la garde de limitation **sur `POST login` seulement** : 5 demandes par fenêtre de 60 secondes et par adresse IP, toutes les demandes comptant, réussies ou non. `GET me` n'est pas limité (FR-021, FR-022). Dépend de T016 et T028.
- [X] T030 [US5] Vérification manuelle : dérouler `quickstart.md`, section 6 (six connexions en moins d'une minute, autres routes pendant le blocage, reprise après une minute).

**Checkpoint** : les cinq récits fonctionnent.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose** : contrôles de fin d'étape, nettoyage, mise à jour des documents.

- [X] T031 Formater et contrôler : `npm run format --workspace=api`, puis `npm run lint`, `npm run build:api`, `npm run build:web` et `npm run build:admin` depuis la racine. Corriger toute erreur dans `apps/api` uniquement.
- [X] T032 Nettoyage, non-régression et secrets (`quickstart.md`, sections 7 et 8) : supprimer par l'API les années créées pour la vérification ; constater que `ADMIN_EMAIL` et `ADMIN_PASSWORD` ne sont plus dans `apps/api/.env` ; `git status` ne montre aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md`, et `apps/api/.env` n'apparaît pas ; `apps/api/.env.example` ne contient aucune valeur ; une recherche du mot de passe du compte, de `JWT_SECRET` et du mot de passe de la base dans les fichiers suivis par Git ne renvoie rien ; `GET /api/v1/health` et `GET /api/v1/rotary-years` répondent comme avant (SC-005, SC-009, SC-010).
- [X] T033 [P] Mettre à jour `PROJECT_CONTEXT.md` (sections « apps/api », « Stack technique », « Périmètre et prochaines étapes », « Points d'attention ») et la ligne d'état de `CLAUDE.md` : authentification en place, années Rotary administrables, trois dépendances installées, commande `seed:admin`, règle de `JWT_EXPIRES_IN`. Dans `specs/002-rotary-years/tasks.md`, ne rien modifier. Ne pas modifier `ARCHITECTURE.md` ni la constitution.
- [X] T034 Dérouler `quickstart.md` en entier une dernière fois et consigner dans ce fichier, pour chaque section, ce qui a été vérifié et ce qui ne l'a pas été. Ne cocher cette tâche que si toutes les sections ont réellement été déroulées.

---

## Résultat des vérifications (2026-10-02)

Déroulées contre la base MongoDB Atlas du projet, API lancée depuis le build sur le port 4100. Le quickstart a été déroulé une première fois récit par récit, puis une seconde fois en entier (T034).

| Section du quickstart | Résultat |
|---|---|
| 1. Règle de `JWT_EXPIRES_IN` | Vérifié : `1d`, `9h`, `481m`, `0s`, `0h` et une valeur négative empêchent le démarrage, le message nomme la variable ; `8h`, `480m`, `28800s`, `60s`, `1s` et la variable vide sont acceptées. |
| 2. Commande d'initialisation | Vérifié : refus sans variables, avec un email invalide, avec un mot de passe de 11 caractères ; création ; remplacement du mot de passe pour le même email (y compris écrit en majuscules avec des espaces) ; refus d'un autre email sans modification ; base injoignable ; codes de sortie 0 et 1 ; un seul document dans `admins`, hachage Argon2id ; aucune fuite dans la sortie. Les deux variables ont été retirées de `apps/api/.env` après chaque usage. |
| 3. Connexion | Vérifié : `200` avec jeton, type, durée (28800) et compte ; email en majuscules avec espaces ; `401` de corps identique pour un mot de passe faux, un email inconnu et un email mal formé ; `400` avec « L'email est obligatoire. », « Le mot de passe est obligatoire. », « Champ non autorisé. » ; rien de sensible dans le journal. Jeton : en-tête HS256, contenu `sub`, `role`, `iat`, `exp`. |
| 4. Protection | Vérifié : `GET /auth/me` avec jeton ; `401` de corps identique sans en-tête, avec `Bearer abc`, un jeton altéré, un autre type d'en-tête, un jeton d'un autre secret, sans algorithme, en HS512, déjà expiré, d'un compte inexistant ; jeton expiré après 2 secondes ; ancien jeton encore accepté après un changement de mot de passe, ancien mot de passe refusé, nouveau accepté ; routes publiques inchangées. `403` vérifié structurellement : `RolesGuard` appelée directement avec un rôle autre que `ADMIN` répond `403` « Accès refusé. ». |
| 5. Années Rotary | Vérifié : création `201`, doublon `409`, deux créations simultanées (une `201`, une `409`), sept valeurs invalides `400`, bornes 2000 et 2100 acceptées, champ en trop `400`, liste d'administration, apparition dans la liste publique, `401` sans jeton sur les écritures, identifiant mal formé `400` « Identifiant invalide. », année inconnue `404`, suppression `204` sans corps. |
| 6. Limitation | Vérifié : cinq demandes traitées (réussies et échouées), la sixième `429` « Trop de requêtes. Réessayez plus tard. » ; santé, liste publique, `/auth/me` et administration non limitées pendant le blocage ; reprise après une minute. |
| 7. Nettoyage | Vérifié : années de vérification supprimées par l'API, liste revenue à `{"data":[]}` ; aucune variable `ADMIN_` dans `apps/api/.env`. |
| 8. Fin d'étape | Vérifié : lint, `build:api`, `build:web`, `build:admin` réussis ; aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md` ; aucune valeur secrète dans les fichiers versionnables. |

Écarts de méthode :

- Les tâches manuelles T011 et T013 (ajout puis retrait des deux variables dans `apps/api/.env`) et le changement de mot de passe de T022 ont été faits par l'exécutant, à la demande du porteur du projet, avec un compte de vérification dont il a fourni l'email et le mot de passe.
- Les valeurs de refus de la commande (email invalide, mot de passe court, autre email) et les durées de T008 et T022 ont été passées à la commande sans modifier `apps/api/.env`.
- Le changement de mot de passe n'a pas été rejoué lors du second passage (T034) ; il l'a été une fois, en T022.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (phase 1)** : aucune dépendance. T002 est manuelle et doit être faite avant T008.
- **Foundational (phase 2)** : dépend de T001. Bloque tous les récits.
- **US1 (phase 3)** : dépend de la phase 2.
- **US2 (phase 4)** : dépend de la phase 2 pour le code ; sa vérification (T017) suppose le compte créé par US1.
- **US3 (phase 5)** : dépend de US2 (le contrôleur d'authentification et un jeton pour vérifier).
- **US4 (phase 6)** : dépend de **US3** : aucune route `/admin` avant les gardes.
- **US5 (phase 7)** : dépend de US2 (la route de connexion). Indépendante de US3 et US4.
- **Polish (phase 8)** : après tous les récits.

### Within Each User Story

- `auth.module.ts` est modifié par T006, T016 et T021 ; `auth.controller.ts` par T016, T021 et T029 ; `app.module.ts` par T006 et T028 ; `rotary-years.module.ts` par T026 ; `package.json` par T001 et T010. Ces tâches se font **l'une après l'autre**.
- Les tâches manuelles T011 et T013 encadrent la vérification de la commande : les deux variables ne sont présentes dans `apps/api/.env` qu'entre ces deux tâches (et brièvement pendant T022).
- La vérification manuelle clôt chaque récit.

### Parallel Opportunities

- T005 et T007 pendant T003 et T004.
- T014 pendant US1.
- T018 pendant T015 à T017.
- T023 et T024, entre elles et pendant US3.
- T033 pendant T031 et T032.

## Parallel Example: User Story 4

```text
T023 : apps/api/src/common/pipes/parse-object-id.pipe.ts
T024 : apps/api/src/rotary-years/dto/create-rotary-year.dto.ts
puis T025 : apps/api/src/rotary-years/rotary-years.service.ts
puis T026 : apps/api/src/rotary-years/rotary-years.admin.controller.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

Phases 1 et 2, puis US1 : le compte d'administration existe. Arrêt et validation.

### Incremental Delivery

1. Setup et Foundational.
2. US1, vérification, validation.
3. US2, vérification, validation.
4. US3, vérification, validation.
5. US4, vérification, validation.
6. US5, vérification, validation.
7. Polish.

Un seul intervenant : pas de stratégie d'équipe. Les arrêts pour validation suivent la constitution (principe II) ; aucun commit sans demande explicite (principe XI).

## Notes

- Aucune tâche n'écrit de test automatisé, de route pour une autre ressource que l'authentification et les années, d'écran, ni de code dans `apps/admin` ou `apps/web`.
- Aucune tâche ne crée de gestion des comptes, de mot de passe oublié, de jeton de rafraîchissement ni de déconnexion.
- Aucune tâche n'installe de dépendance autre que les trois validées.
- Aucune tâche ne modifie `ARCHITECTURE.md`, la constitution, `DESIGN.md`, `main.ts`, le filtre d'erreurs ni le pipe de validation du socle.
- Le mot de passe du compte n'est jamais écrit dans un fichier suivi par Git, ni dans ce fichier.
- Une contradiction découverte en cours de route est signalée, pas résolue d'autorité (constitution, principe I).
