# Tasks: Années Rotary (RotaryYear) — temps 1

**Input**: Design documents from `/specs/002-rotary-years/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/rotary-years.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`.

**Organization**: les tâches sont groupées par récit utilisateur. Seuls les récits du **temps 1** ont des tâches : récit 1 (liste publique) et récit 2 (unicité). Les récits 3 (créer et supprimer) et 4 (Back Office) sont **différés** au temps 2, livré avec l'authentification : ils n'ont aucune tâche ici.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1, US2).
- **(manuel)** : opération faite à la main par le porteur du projet.

## Path Conventions

Tout le code vit dans `apps/api/src/`. Les commandes npm se lancent depuis la racine du dépôt. Style du code de l'API : guillemets simples, virgules finales, Prettier et oxlint.

## Décisions verrouillées à respecter

1. Seul `startYear` est enregistré. `label`, `startDate`, `endDate` et `isCurrent` sont calculés, jamais stockés.
2. L'unicité de `startYear` est portée par un index unique en base.
3. Une seule route : `GET /api/v1/rotary-years`, publique.
4. **Aucune route `/admin`**, aucune garde, aucun code d'authentification, aucun DTO de création, aucune création ni suppression d'année par le code.
5. Aucune dépendance à installer. `main.ts`, `config/`, `common/filters/` et `common/pipes/` ne sont pas modifiés.
6. Aucune année créée par le code : ni au démarrage, ni d'avance, ni comme exemple, ni par script.

## Prérequis manuel (hors tâches de cette fonctionnalité)

Une base MongoDB Atlas joignable depuis le poste, avec `apps/api/.env` renseigné : c'est la tâche T011 de `specs/001-api-foundation/tasks.md`, encore ouverte. Le code peut être écrit sans elle ; les vérifications T007, T008 et T012 en ont besoin. Si la base n'est pas joignable au moment de vérifier, le signaler explicitement et laisser ces tâches non cochées : aucune vérification n'est inventée.

---

## Phase 1: Setup (Shared Infrastructure)

Aucune tâche : pas de dépendance à installer, pas de structure à initialiser. Le socle (`001-api-foundation`) fournit tout.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose** : le modèle et son module, dont les deux récits dépendent.

**⚠️ CRITICAL** : aucun récit ne peut commencer avant la fin de cette phase.

- [X] T001 Créer `apps/api/src/rotary-years/schemas/rotary-year.schema.ts` : schéma Mongoose `RotaryYear` avec l'option `timestamps` (`createdAt`, `updatedAt`) et un seul champ métier, `startYear` : « nombre », « obligatoire », « **Unique.** Identifie l'année Rotary » (index unique déclaré dans le schéma). Aucun autre champ : ni label, ni date de l'année, ni indicateur courant (FR-001, FR-003). Ne pas répéter les bornes 2000 à 2100 dans le schéma (research.md, décision 7). Le nom de modèle `RotaryYear` doit donner la collection `rotaryyears` (`data-model.md`).
- [X] T002 Créer `apps/api/src/rotary-years/rotary-years.module.ts` : module qui déclare le modèle avec `MongooseModule.forFeature`. L'importer dans `apps/api/src/app.module.ts` (une ligne dans `imports`, après `HealthModule`). Ne pas désactiver `autoIndex` : l'index unique doit être créé au démarrage (research.md, décision 2). Dépend de T001.

**Checkpoint** : `npm run build:api` passe ; au démarrage, la collection `rotaryyears` existe, vide, avec son index unique.

---

## Phase 3: User Story 1 - Lire la liste publique des années Rotary (Priority: P1) 🎯 MVP

**Goal** : `GET /api/v1/rotary-years` renvoie toutes les années, de la plus récente à la plus ancienne, chacune avec ses valeurs calculées.

**Independent Test** : `quickstart.md`, sections 1, 2, 3, 5 et 6.

### Implementation for User Story 1

- [X] T003 [P] [US1] Créer `apps/api/src/common/utils/rotary-year.ts` : trois fonctions pures, sans accès à la base ni à l'horloge. (a) Le label : `startYear`, un tiret, `startYear + 1` (`2026` donne `"2026-2027"`). (b) Les bornes : `startDate` = 1er juillet de `startYear`, 00:00:00.000 UTC ; `endDate` = 30 juin de `startYear + 1`, 23:59:59.999 UTC. (c) Le caractère courant : vrai si un instant **reçu en paramètre** est entre `startDate` et `endDate`, bornes incluses (FR-005 à FR-008 ; research.md, décision 3).
- [X] T004 [US1] Créer `apps/api/src/rotary-years/rotary-years.service.ts` : une méthode de lecture qui renvoie toutes les années triées par `startYear` décroissant, chacune convertie en `{ id, startYear, label, startDate, endDate, isCurrent }` avec les fonctions de T003. `id` est l'identifiant du document en chaîne ; les dates sortent en ISO 8601 UTC. Prendre **un seul instant** au début de la lecture et l'utiliser pour toutes les années. Ne pas exposer `_id`, `__v`, `createdAt` ni `updatedAt`. Aucune méthode de création, de suppression ni de lecture d'une année seule (FR-009, FR-011, FR-012, FR-014). Dépend de T001 et T003.
- [X] T005 [US1] Créer `apps/api/src/rotary-years/rotary-years.public.controller.ts` : contrôleur `rotary-years` avec un seul `GET`, sans paramètre, qui renvoie `{ "data": [...] }` ; une collection vide donne `{ "data": [] }` en `200` (FR-010, FR-012, FR-013 ; `contracts/rotary-years.md`). Aucune garde, aucune autre méthode HTTP, aucun contrôleur d'administration. Dépend de T004.
- [X] T006 [US1] Dans `apps/api/src/rotary-years/rotary-years.module.ts`, déclarer le contrôleur de T005 et le service de T004. Dépend de T002, T004 et T005.
- [X] T007 [US1] Vérification manuelle : dérouler `quickstart.md`, sections 1 (liste vide), 2 (liste et valeurs calculées, après insertion manuelle de trois années dans Atlas), 3 (aucune année courante), 5 (les quatre instants aux bornes, en appelant la fonction compilée) et 6 (aucune route d'administration : `404`). Noter le résultat de chaque ligne.

**Checkpoint** : la liste publique répond, vide ou remplie, avec des valeurs calculées justes ; aucune adresse `/admin` ne répond.

---

## Phase 4: User Story 2 - Une seule année par année de début (Priority: P1)

**Goal** : il ne peut exister qu'une année par année de début, et seule cette année de début est enregistrée.

**Independent Test** : `quickstart.md`, section 4, et la dernière ligne de la section 2.

### Implementation for User Story 2

Le code de ce récit est l'index unique de T001 et sa création au démarrage (T002) : il n'y a pas d'autre code à écrire.

- [X] T008 [US2] Vérification manuelle : dans Atlas, constater l'index unique sur `startYear` de la collection `rotaryyears` ; dérouler `quickstart.md`, section 4 (une seconde insertion de la même année est refusée par la base) ; constater sur un document que seul `startYear` est enregistré, sans label, date de l'année ni indicateur courant (FR-002, FR-003, SC-002, SC-004).

**Checkpoint** : les deux récits du temps 1 fonctionnent.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose** : contrôles de fin d'étape, nettoyage des données de vérification, mise à jour des documents.

- [X] T009 Formater et contrôler : `npm run format --workspace=api`, puis `npm run lint`, `npm run build:api`, `npm run build:web` et `npm run build:admin` depuis la racine. Corriger toute erreur dans `apps/api` uniquement.
- [X] T010 (manuel) Nettoyage et non-régression : retirer d'Atlas toutes les années insérées pour la vérification, puis constater que `GET /api/v1/rotary-years` renvoie `{"data":[]}` (`quickstart.md`, section 7, FR-028). `git status` ne montre aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md`, et `apps/api/.env` n'apparaît pas ; `apps/api/.env.example` ne contient aucune valeur réelle ; `GET /api/v1/health` répond comme avant (SC-007).
- [X] T011 [P] Mettre à jour `PROJECT_CONTEXT.md` (section « apps/api », « Périmètre et prochaines étapes ») et la ligne d'état de `CLAUDE.md` : le module `rotary-years` est en place avec sa liste publique ; la création, la liste d'administration et la suppression des années sont **reportées à la fonctionnalité d'authentification**, selon `specs/002-rotary-years/contracts/rotary-years.md`. Ne pas modifier `ARCHITECTURE.md`.
- [X] T012 Dérouler `quickstart.md` en entier une dernière fois et consigner, pour chaque section, ce qui a été vérifié et ce qui ne l'a pas été. Ne cocher cette tâche que si toutes les sections ont réellement été déroulées contre la base.

---

## Résultat des vérifications (2026-10-01)

Déroulées contre la base MongoDB Atlas du projet, API lancée depuis le build. Les années de vérification ont été insérées puis retirées avec le pilote de la base, hors dépôt (aucun script ajouté au projet).

| Section du quickstart | Résultat |
|---|---|
| 1. Liste vide | Vérifié : `200` et `{"data":[]}` ; collection `rotaryyears` créée vide avec un index unique sur `startYear`. |
| 2. Liste et valeurs calculées | Vérifié avec 2026, 2025 et 2030 : ordre 2030, 2026, 2025 ; label et dates conformes ; champs `id`, `startYear`, `label`, `startDate`, `endDate`, `isCurrent` seulement ; 2026 seule courante ; en base, seul `startYear` est enregistré. |
| 3. Aucune année courante | Vérifié après retrait de 2026 : aucune année courante, `200`. |
| 4. Unicité | Vérifié : seconde insertion de 2030 refusée par la base (clé dupliquée, code 11000). |
| 5. Bornes du calcul | Vérifié sur la fonction compilée : faux, vrai, vrai, faux pour les quatre instants. |
| 6. Aucune route d'administration | Vérifié : `404` au format commun sur `GET`, `POST` et `DELETE` sous `/admin/rotary-years`, et sur `POST /rotary-years`. |
| 7. Nettoyage | Vérifié : les trois années retirées, liste revenue à `{"data":[]}`, collection vide. |
| 8. Fin d'étape | Vérifié : lint, `build:api`, `build:web`, `build:admin` réussis ; santé `200` ; aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md`. |

Non vérifié : rien. Écart de méthode : les insertions et le nettoyage (T007, T008, T010) prévus « à la main dans Atlas, Data Explorer » ont été faits par commande avec le pilote de la base, à la demande du porteur du projet.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (phase 1)** : aucune tâche.
- **Foundational (phase 2)** : aucune dépendance. T001 puis T002. Bloque les deux récits.
- **US1 (phase 3)** : dépend de la phase 2.
- **US2 (phase 4)** : dépend de la phase 2 seulement pour le code. Sa vérification (T008) est plus simple après T007, qui a déjà inséré des années.
- **Polish (phase 5)** : après les deux récits.

### Within Each User Story

- `rotary-years.module.ts` est modifié par T002 puis T006 : l'une après l'autre.
- T003, T004, T005, T006 se suivent, sauf T003 qui peut démarrer pendant la phase 2.
- La vérification manuelle clôt chaque récit.

### Parallel Opportunities

- T003 pendant T001 et T002 (fichier différent, aucune dépendance).
- T011 pendant T009 et T010.

## Parallel Example: User Story 1

```text
T001 : apps/api/src/rotary-years/schemas/rotary-year.schema.ts
T003 : apps/api/src/common/utils/rotary-year.ts        (en parallèle)
puis T004 : apps/api/src/rotary-years/rotary-years.service.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

Phase 2, puis US1 : la liste publique avec ses valeurs calculées. Arrêt et validation.

### Incremental Delivery

1. Foundational : modèle et module.
2. US1, vérification, validation.
3. US2, vérification, validation.
4. Polish.

Un seul intervenant : pas de stratégie d'équipe. Les arrêts pour validation suivent la constitution (principe II) ; aucun commit sans demande explicite (principe XI).

## Notes

- Aucune tâche n'écrit de test automatisé, de route `/admin`, de garde, de code d'authentification, de DTO de création, de création ni de suppression d'année.
- Aucune tâche ne crée de membre, de mandat, d'action ni d'actualité.
- Aucune tâche ne touche `apps/web`, `apps/admin`, `DESIGN.md` ni `ARCHITECTURE.md`.
- Aucune tâche n'installe de dépendance ni ne modifie le socle (`main.ts`, `config/`, `common/filters/`, `common/pipes/`).
- Les exigences FR-016 à FR-025 de la spec (temps 2) ne sont couvertes par aucune tâche ici : elles sont reprises par la fonctionnalité d'authentification.
- Une contradiction découverte en cours de route est signalée, pas résolue d'autorité (constitution, principe I).
