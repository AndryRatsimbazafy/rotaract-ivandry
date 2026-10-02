# Tasks: Socle de l'API backend

**Input**: Design documents from `/specs/001-api-foundation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`.

**Organization**: les tâches sont groupées par récit utilisateur, dans l'ordre de priorité de la spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US4).
- **(manuel)** : opération faite à la main par le porteur du projet.

## Path Conventions

Tout le code vit dans `apps/api/`. Les commandes npm se lancent depuis la racine du dépôt. Style du code de l'API : guillemets simples, virgules finales, Prettier et oxlint.

## Décisions verrouillées à respecter

1. La route de santé vit dans `apps/api/src/health/`.
2. Six dépendances, et seulement celles-là : `@nestjs/config`, `@nestjs/mongoose`, `mongoose`, `class-validator`, `class-transformer`, `helmet`.
3. Une méthode HTTP non prévue renvoie `404`, comportement natif de NestJS.
4. `GET /api/v1/health` lit l'état de la connexion Mongoose, sans `ping` à chaque requête.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose** : aligner la documentation, installer les dépendances validées, retirer le code du gabarit.

- [X] T001 Ajouter le dossier `health/` (« route technique de santé ») à l'arborescence de la section 5 de `ARCHITECTURE.md`, entre `auth/` et `rotary-years/`. Aucune autre modification du document.
- [X] T002 Installer les six dépendances depuis la racine : `npm install @nestjs/config @nestjs/mongoose mongoose class-validator class-transformer helmet --workspace=api`. Vérifier que seuls `apps/api/package.json` et `package-lock.json` changent, et qu'aucune autre dépendance n'est ajoutée à `apps/api/package.json`.
- [X] T003 Supprimer `apps/api/src/app.controller.ts` et `apps/api/src/app.service.ts`, et retirer leurs imports, `controllers` et `providers` de `apps/api/src/app.module.ts` (FR-004).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose** : le squelette de démarrage dont tous les récits dépendent.

**⚠️ CRITICAL** : aucun récit ne peut commencer avant la fin de cette phase.

- [X] T004 Réécrire `bootstrap()` dans `apps/api/src/main.ts` : créer l'application, appeler `app.setGlobalPrefix('api/v1')` (FR-015), puis écouter. Entourer le tout d'un `try/catch` qui journalise un message générique avec le `Logger` de NestJS et termine le processus avec `process.exit(1)`, sans afficher l'erreur d'origine. Appeler `bootstrap()` avec `void` ou un `.catch` pour satisfaire la règle `no-floating-promises` d'oxlint.

**Checkpoint** : `npm run build:api` passe ; l'application démarre et répond `404` partout.

---

## Phase 3: User Story 1 - Démarrer l'API avec une configuration vérifiée (Priority: P1) 🎯 MVP

**Goal** : l'API lit ses variables d'environnement, refuse de démarrer si l'une est absente ou invalide en la nommant, et écoute sur le port configuré.

**Independent Test** : `quickstart.md`, section 1.

### Implementation for User Story 1

- [X] T005 [P] [US1] Créer `apps/api/src/config/env.validation.ts` : une classe décrivant les variables avec `class-validator`, et une fonction `validate(config)` qui transforme l'environnement avec `class-transformer`, valide, et lève une erreur dont le message nomme **toutes** les variables en cause sans jamais afficher de valeur. Règles, reprises de `data-model.md` : `MONGODB_URI` obligatoire, « commence par `mongodb://` ou `mongodb+srv://` » ; `JWT_SECRET` obligatoire, « 32 caractères au moins » ; `PORT` facultatif, défaut `4000`, « entier de 1 à 65535 » ; `NODE_ENV` facultatif, défaut `development`, « `development` ou `production` » ; `JWT_EXPIRES_IN` facultatif, défaut `8h`, « nombre suivi de `s`, `m`, `h` ou `d` » ; `CORS_ORIGINS` facultatif, défaut vide, « origines séparées par des virgules ; chacune avec schéma et hôte, sans chemin ». Ne lire ni `ADMIN_EMAIL`, ni `ADMIN_PASSWORD`, ni aucune variable de stockage (FR-010).
- [X] T006 [P] [US1] Créer `apps/api/.env.example` : les six noms de variables de `data-model.md`, sans aucune valeur réelle, avec un commentaire d'une ligne par variable (obligatoire ou facultative, défaut, règle). Vérifier que `apps/api/.env` est ignoré par Git et que `.env.example` ne l'est pas (FR-009).
- [X] T007 [US1] Créer `apps/api/src/config/app-config.ts` : le type de la configuration validée et un accès typé (port, environnement, adresse de la base, secret et durée du jeton, liste des origines déjà découpée en tableau). Dépend de T005.
- [X] T008 [US1] Dans `apps/api/src/app.module.ts`, importer `ConfigModule.forRoot` en module global, avec `envFilePath` pointant sur `apps/api/.env` et la fonction `validate` de T005 (FR-005, FR-008). Dépend de T005.
- [X] T009 [US1] Dans `apps/api/src/main.ts`, lire le port dans la configuration (plus dans `process.env`) et journaliser le port d'écoute après le démarrage. Vérifier que le `try/catch` de T004 laisse passer le message de validation, qui nomme les variables, sans afficher de valeur. Dépend de T007 et T008.
- [X] T010 [US1] Vérification manuelle : dérouler `quickstart.md`, section 1 (sept cas) et noter le résultat de chacun. Les cas sans base joignable s'observent jusqu'au message de validation.

**Checkpoint** : une configuration invalide arrête l'API en nommant la variable ; une configuration valide la fait écouter sur le bon port.

---

## Phase 4: User Story 2 - Se connecter à la base de données au démarrage (Priority: P1)

**Goal** : l'API se connecte à MongoDB au démarrage, le dit dans le journal, s'arrête proprement si la base est injoignable, et expose son état sur `GET /api/v1/health`.

**Independent Test** : `quickstart.md`, section 2.

### Implementation for User Story 2

- [X] T011 [US2] (manuel) Créer le cluster MongoDB Atlas Free, un utilisateur de base, autoriser l'adresse IP du poste, puis copier `apps/api/.env.example` en `apps/api/.env` et y renseigner `MONGODB_URI` et `JWT_SECRET`. Ne rien commiter de ce fichier.
- [X] T012 [US2] Dans `apps/api/src/app.module.ts`, déclarer `MongooseModule.forRootAsync` alimenté par la configuration : adresse `MONGODB_URI`, `retryAttempts: 3`, `retryDelay: 2000`, `serverSelectionTimeoutMS: 5000`, `verboseRetryLog: false` (research.md, décision 3). Journaliser « Connexion à la base de données établie. » quand la connexion est ouverte. Ne déclarer aucun modèle ni aucune collection (FR-014).
- [X] T013 [US2] Dans `apps/api/src/main.ts`, vérifier que l'échec de connexion aboutit au `catch` de T004 avec le message « Connexion à la base de données impossible. », sans adresse, nom d'hôte ni identifiant (FR-012, FR-013). Distinguer ce message de celui de la validation de configuration.
- [X] T014 [P] [US2] Créer `apps/api/src/health/health.controller.ts` : `GET health` qui lit l'état de la connexion Mongoose injectée. Connectée : renvoyer `{ "status": "ok", "database": "up" }`. Sinon : lever une `ServiceUnavailableException` avec le message « La base de données ne répond pas. ». Aucun `ping`, aucune autre information dans la réponse (`contracts/health.md`, FR-024).
- [X] T015 [US2] Créer `apps/api/src/health/health.module.ts` et l'importer dans `apps/api/src/app.module.ts`. Dépend de T014.
- [X] T016 [US2] Vérification manuelle : dérouler `quickstart.md`, section 2. Si le cluster n'est pas disponible, le signaler explicitement et ne vérifier que l'échec de connexion. *État : vérifié d'abord sur une base temporaire locale, puis contre MongoDB Atlas par le porteur du projet, qui l'a confirmé le 2026-10-02.*

**Checkpoint** : l'API connectée répond `200` sur `/api/v1/health` ; avec une base injoignable, elle s'arrête avec un message générique.

---

## Phase 5: User Story 3 - Des adresses et des erreurs uniformes (Priority: P2)

**Goal** : toute erreur a le format commun, en français, sans détail technique ; les entrées sont validées globalement ; toutes les réponses portent les en-têtes de sécurité.

**Independent Test** : `quickstart.md`, section 3.

### Implementation for User Story 3

- [X] T017 [P] [US3] Créer `apps/api/src/common/filters/all-exceptions.filter.ts` : un filtre global qui attrape toute exception et renvoie `statusCode`, `error`, `message`, plus `details` quand l'exception en porte. Table de messages par défaut en français pour `400`, `401`, `403`, `404`, `405`, `409`, `413`, `415`, `429`, `500`, `503`, avec les textes de `contracts/errors.md` ; un message fourni par le code appelant est conservé. Une exception non HTTP donne `500` « Une erreur interne est survenue. » et est journalisée côté serveur seulement. Un corps JSON mal formé donne `400` « Requête mal formée. ». La réponse ne contient jamais de trace, de nom de fichier ni l'adresse appelée (FR-017 à FR-019).
- [X] T018 [P] [US3] Créer `apps/api/src/common/pipes/validation.pipe.ts` : une fabrique de `ValidationPipe` avec `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`, et une `exceptionFactory` qui produit un `400` « Données invalides. » avec `details: [{ field, message }]`, une entrée par champ en erreur (FR-020, `ARCHITECTURE.md` sections 8 et 10). Aucun DTO n'est créé (FR-021).
- [X] T019 [US3] Dans `apps/api/src/main.ts`, appliquer dans cet ordre : `helmet()` (FR-026), le filtre global de T017, le `ValidationPipe` de T018. Ne pas ajouter de limitation de fréquence (FR-027). Dépend de T017 et T018.
- [X] T020 [US3] Vérification manuelle : dérouler `quickstart.md`, section 3. Confirmer en particulier que le `503` de la route de santé (T014) sort bien au format commun et que `X-Powered-By` est absent.

**Checkpoint** : toute erreur observée a la même forme ; les en-têtes de sécurité sont présents sur chaque réponse.

---

## Phase 6: User Story 4 - Une politique d'origines fermée par défaut (Priority: P3)

**Goal** : aucune origine croisée par défaut ; exactement celles de `CORS_ORIGINS` quand elle est renseignée.

**Independent Test** : `quickstart.md`, section 4.

### Implementation for User Story 4

- [X] T021 [US4] Dans `apps/api/src/main.ts`, appeler `app.enableCors({ origin: <liste> })` **seulement si** la liste des origines de la configuration n'est pas vide ; sinon ne pas activer CORS (FR-022, FR-023). La validation de chaque origine est déjà faite par T005.
- [X] T022 [US4] Vérification manuelle : dérouler `quickstart.md`, section 4 (quatre cas).

**Checkpoint** : les quatre récits fonctionnent.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose** : contrôles de fin d'étape et mise à jour des documents.

- [X] T023 Formater et contrôler : `npm run format --workspace=api`, puis `npm run lint`, `npm run build:api` et `npm run build:web` depuis la racine. Corriger toute erreur dans `apps/api` uniquement.
- [X] T024 Contrôle de non-régression et de secrets : `git status` ne montre aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md` ; `apps/api/.env` n'apparaît pas ; une recherche de la valeur de `JWT_SECRET` et du mot de passe de la base dans les fichiers suivis par Git ne renvoie rien (SC-003, SC-008).
- [X] T025 [P] Mettre à jour `PROJECT_CONTEXT.md` (sections « apps/api », « Stack technique », « Périmètre et prochaines étapes », « Points d'attention ») et la ligne d'état de `CLAUDE.md` : l'API n'est plus un gabarit, le socle est en place, les six dépendances sont installées, `apps/api/.env.example` existe.
- [X] T026 Dérouler `quickstart.md` en entier une dernière fois et consigner, pour chaque section, ce qui a été vérifié et ce qui ne l'a pas été. *État : quickstart déroulé en entier contre MongoDB Atlas par le porteur du projet, qui l'a confirmé le 2026-10-02.*

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (phase 1)** : aucune dépendance. T001, T002 et T003 sont indépendantes entre elles.
- **Foundational (phase 2)** : dépend de T002 et T003. Bloque tous les récits.
- **US1 (phase 3)** : dépend de la phase 2.
- **US2 (phase 4)** : dépend de US1 (la connexion lit la configuration). T011 est manuelle et peut être faite à tout moment avant T016.
- **US3 (phase 5)** : dépend de la phase 2. Indépendante de US2 pour le code ; sa vérification complète (le `503` au format commun) suppose US2.
- **US4 (phase 6)** : dépend de US1 (liste des origines).
- **Polish (phase 7)** : après tous les récits.

### Within Each User Story

- `main.ts` et `app.module.ts` sont modifiés par plusieurs tâches : T004, T009, T013, T019, T021 d'une part, T003, T008, T012, T015 d'autre part. Elles se font **l'une après l'autre**, jamais en parallèle.
- La vérification manuelle clôt chaque récit.

### Parallel Opportunities

- T005 et T006 (fichiers différents).
- T014 pendant T012 et T013.
- T017 et T018.
- T025 pendant T023 et T024.

## Parallel Example: User Story 3

```text
T017 : apps/api/src/common/filters/all-exceptions.filter.ts
T018 : apps/api/src/common/pipes/validation.pipe.ts
puis T019 : apps/api/src/main.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

Phases 1 et 2, puis US1 : une API qui démarre avec une configuration vérifiée. Arrêt et validation.

### Incremental Delivery

1. Setup et Foundational.
2. US1, vérification, validation.
3. US2, vérification (cluster nécessaire), validation.
4. US3, vérification, validation.
5. US4, vérification, validation.
6. Polish.

Un seul intervenant : pas de stratégie d'équipe. Les arrêts pour validation suivent la constitution (principe II) ; aucun commit sans demande explicite (principe XI).

## Notes

- Aucune tâche n'écrit de test automatisé, de modèle, de collection, de route métier, de garde, ni de code d'authentification.
- Aucune tâche ne touche `apps/web`, `apps/admin` ni `DESIGN.md`.
- Seule T001 modifie `ARCHITECTURE.md`, pour un emplacement déjà validé.
- Une contradiction découverte en cours de route est signalée, pas résolue d'autorité (constitution, principe I).
