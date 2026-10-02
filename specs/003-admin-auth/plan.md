# Implementation Plan: Authentification de l'administrateur

**Branch**: `003-admin-auth` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/003-admin-auth/spec.md`

## Summary

Mettre en place l'authentification de l'unique administrateur : compte créé par une commande manuelle, connexion par email et mot de passe, jeton d'accès de 8 heures au plus, protection de toute adresse `/admin`, limitation des tentatives de connexion. Puis livrer les premières routes protégées : les opérations d'administration des années Rotary (temps 2 de `002-rotary-years`).

Approche : un module NestJS `auth` de la forme prévue par `ARCHITECTURE.md`, section 5, avec deux gardes écrites à la main (jeton, rôle) sans Passport ; trois dépendances, toutes déjà listées dans l'architecture ; un contrôleur d'administration ajouté au module `rotary-years` existant. Du socle, seule la règle de validité de `JWT_EXPIRES_IN` change.

## Technical Context

**Language/Version** : TypeScript 6 (strict), Node.js 22. Sortie CommonJS avec `module: nodenext`, comme le socle.

**Primary Dependencies** : déjà installées : NestJS 12, `@nestjs/config`, `@nestjs/mongoose` 12, `mongoose` 9, `class-validator`, `class-transformer`, `helmet`. **À installer par cette fonctionnalité, validées le 2026-10-02** (toutes listées dans `ARCHITECTURE.md`, section 5) :

| Paquet | Version constatée au registre | Besoin |
|---|---|---|
| `@nestjs/jwt` | 12.x | Signer et vérifier le jeton (FR-012 à FR-014). Imposé par `ARCHITECTURE.md`, section 7. |
| `argon2` | 0.45.x | Hacher et vérifier le mot de passe en Argon2id (FR-006). Imposé par la décision 6. |
| `@nestjs/throttler` | 6.x | Limiter les tentatives de connexion (FR-021, FR-022). Imposé par la décision 17. |

Compatibilité vérifiée au registre npm le 2026-10-02 : `@nestjs/jwt` 12 et `@nestjs/throttler` 6 acceptent NestJS 12 ; `@nestjs/throttler` demande Node `^22.12.0` (poste : 22.18.0) ; `argon2` demande Node 16.17 ou plus et fournit des binaires précompilés.

**Non installés** : Passport et ses stratégies (écartés par l'architecture), tout paquet de stockage, toute bibliothèque de session.

**Storage** : MongoDB Atlas Free, via Mongoose. Une collection nouvelle, `admins` (index unique sur `email`). `rotaryyears` inchangée.

**Testing** : aucun test automatisé (constitution, principe IX). Vérification manuelle décrite dans [quickstart.md](./quickstart.md), plus `npm run lint` et `npm run build:api`.

**Target Platform** : serveur Node.js 22, en local (port 4000). Hébergement hors périmètre.

**Project Type** : service web (API HTTP JSON) dans un monorepo npm workspaces.

**Performance Goals** : aucun objectif chiffré. Le hachage Argon2id est volontairement coûteux (de l'ordre de la centaine de millisecondes par connexion).

**Constraints** : aucun secret dans le code, les journaux ni Git ; aucune route `/admin` sans protection, à aucun moment de l'implémentation ; messages d'erreur en français au format du socle ; pas de modification de `apps/web`, `apps/admin` ni `DESIGN.md` ; du socle, seule la règle de `JWT_EXPIRES_IN` change.

**Scale/Scope** : cinq routes nouvelles (deux d'authentification, trois d'administration des années), une commande, une douzaine de fichiers de code nouveaux, six modifiés.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Choix repris d'`ARCHITECTURE.md` (sections 1.7, 5, 6, 7, 8, 12, 13). Les précisions décidées dans la spec sont inscrites dans `ARCHITECTURE.md` par ce plan, avant tout code (voir « Alignement des documents »). | Conforme |
| II. Étapes validées | Spec validée le 2026-10-02. Ce plan s'arrête après la phase 1 : ni tâches ni code. | Conforme |
| III. Préférence pour le manuel | Une commande est créée (`seed:admin`). Justification : sécurité — un hachage Argon2id ne se produit pas à la main de façon fiable — et décision 5 de l'architecture. Aucune autre automatisation. | Conforme, justifié |
| IV. Simplicité technique | Gardes écrites à la main, sans Passport. Trois dépendances, toutes prévues. Aucune abstraction générique : pas de module `users`, pas de gestion de rôles au-delà d'un décorateur. | Conforme |
| V. Architecture backend | JWT HS256, 8 heures au plus, Argon2id, un seul compte créé par script, tout `/admin` derrière jeton et rôle. | Conforme (voir la note ci-dessous) |
| VI. Intégrité du modèle métier | RotaryYear inchangée. Admin conforme à la section 1.7 : trois champs, aucun ajout. | Conforme |
| VII. Front Office | Non touché. | Conforme |
| VIII. Qualité et contenu | Aucune donnée inventée. Le compte de vérification est celui du porteur du projet. | Conforme |
| IX. Tests | Aucun test, aucun outillage de test. | Conforme |
| X. Outillage et infrastructure | npm, installation par `--workspace=api` depuis la racine. Pas de Docker ni de CI/CD. | Conforme |
| XI. Git et collaboration | Branche `003-admin-auth` créée par Spec Kit avec l'accord explicite du porteur du projet. Aucun commit sans demande. | Conforme |
| XII. Non-régression | Les routes publiques existantes restent inchangées ; les builds des deux fronts sont revérifiés (SC-009, SC-010). | Conforme |

**Note sur le principe V.** La constitution dit « durée de 8 heures ». La règle détaillée est portée par `ARCHITECTURE.md` et la spec : défaut `8h`, durée strictement positive, maximum 8 heures. Aucun jeton ne dépasse 8 heures. Décision du porteur du projet le 2026-10-02 : la constitution n'est pas modifiée.

**Résultat de la porte** : passée. Les trois dépendances ont été validées par le porteur du projet le 2026-10-02 ; aucune autre n'est ajoutée. Aucune violation à justifier.

**Re-vérification après la phase 1** : inchangée. Les contrats, le modèle de données et le guide de vérification n'introduisent ni dépendance supplémentaire, ni route hors spec.

## Project Structure

### Documentation (this feature)

```text
specs/003-admin-auth/
├── spec.md
├── plan.md              ce fichier
├── research.md          phase 0 : décisions techniques
├── data-model.md        phase 1 : le compte Admin, le jeton, la règle de JWT_EXPIRES_IN
├── quickstart.md        phase 1 : vérification manuelle
├── contracts/
│   ├── auth.md          connexion, compte connecté, protection, limitation
│   └── seed-admin.md    commande d'initialisation du compte
├── checklists/
│   └── requirements.md
└── tasks.md             créé plus tard par /speckit-tasks
```

Le contrat des opérations d'administration des années reste `specs/002-rotary-years/contracts/rotary-years.md` : il n'est pas dupliqué.

### Source Code (repository root)

```text
apps/api/
├── .env.example                               modifié : ADMIN_EMAIL, ADMIN_PASSWORD (noms seuls) ; règle de JWT_EXPIRES_IN
├── package.json                               modifié : trois dépendances, script seed:admin
└── src/
    ├── app.module.ts                          modifié : AuthModule, limitation de fréquence
    ├── config/
    │   ├── env.validation.ts                  modifié : JWT_EXPIRES_IN strictement positive et de 8 heures au plus
    │   └── app-config.ts                      modifié : durée du jeton en secondes
    ├── common/
    │   └── pipes/
    │       └── parse-object-id.pipe.ts        nouveau : identifiant mal formé → 400 « Identifiant invalide. »
    ├── auth/
    │   ├── auth.module.ts                     nouveau
    │   ├── auth.controller.ts                 nouveau : POST /auth/login, GET /auth/me
    │   ├── auth.service.ts                    nouveau : vérification des identifiants, émission du jeton
    │   ├── seed-admin.ts                      nouveau : commande d'initialisation du compte
    │   ├── schemas/admin.schema.ts            nouveau : email unique, passwordHash, role
    │   ├── dto/login.dto.ts                   nouveau
    │   ├── guards/jwt-auth.guard.ts           nouveau
    │   ├── guards/roles.guard.ts              nouveau
    │   └── decorators/
    │       ├── roles.decorator.ts             nouveau : @Roles
    │       └── current-admin.decorator.ts     nouveau : @CurrentAdmin
    └── rotary-years/
        ├── rotary-years.module.ts             modifié : contrôleur d'administration, import d'AuthModule
        ├── rotary-years.service.ts            modifié : création, suppression
        ├── rotary-years.admin.controller.ts   nouveau : /admin/rotary-years, gardé au niveau de la classe
        └── dto/create-rotary-year.dto.ts      nouveau
```

**Non modifiés** : `main.ts`, `common/filters/`, `common/pipes/validation.pipe.ts`, `common/utils/rotary-year.ts`, `health/`, `rotary-years.public.controller.ts`, `schemas/rotary-year.schema.ts`.

**Nommage** : un fichier par rôle, selon les conventions du projet (`*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.guard.ts`, `*.decorator.ts`, `*.dto.ts`, `*.schema.ts`, `*.pipe.ts`). Contrôleurs et DTO sont des fichiers séparés. Aucune couche supplémentaire : ni dépôt de données, ni module de comptes, ni service de jeton distinct.

**Structure Decision** : la structure d'`ARCHITECTURE.md`, section 5 : `auth/` contient le schéma `Admin` et les gardes ; chaque ressource a un contrôleur public et un contrôleur d'administration gardé au niveau de la classe. La commande d'initialisation vit dans `auth/` (aucun nouveau dossier d'architecture). `ParseObjectIdPipe` va dans `common/pipes/`, emplacement prévu.

## Décisions de conception

Détail et alternatives dans [research.md](./research.md).

1. **Compte** : schéma `Admin` à trois champs (section 1.7), collection `admins`, index unique sur `email`.
2. **Commande** : `npm run seed:admin --workspace=api`. Elle compile l'API, puis lance un point d'entrée distinct qui ouvre un contexte d'application sans serveur HTTP. `ADMIN_EMAIL` et `ADMIN_PASSWORD` sont placés temporairement dans `apps/api/.env`, et seulement là, puis retirés après la commande et avant la vérification normale de l'API. L'API ne les lit jamais ; ils ne sont jamais journalisés ni commités ; `.env.example` n'en porte que les noms. Aucun compte : création. Même email : mot de passe remplacé. Autre email : refus.
3. **Mot de passe** : Argon2id, réglages par défaut de la bibliothèque. Ni le mot de passe ni son hachage ne sont journalisés.
4. **Connexion** : email normalisé (espaces retirés, minuscules), sans aucun contrôle de format. Champ absent : `400` « L'email est obligatoire. » ou « Le mot de passe est obligatoire. ». Email mal formé mais présent : traité comme un email inconnu. Email inconnu et mot de passe faux : même `401`, même message, y compris en temps de traitement (un hachage factice est vérifié quand l'email est inconnu).
5. **Jeton** : `@nestjs/jwt`, HS256 imposé à la signature et à la vérification, contenu `sub`, `role`, `iat`, `exp`. Durée : `JWT_EXPIRES_IN`.
6. **`JWT_EXPIRES_IN`** : la validation du socle exige désormais une durée strictement positive et de 8 heures au plus.
7. **Gardes** : `JwtAuthGuard` (jeton, relecture du compte) et `RolesGuard` avec `@Roles('ADMIN')`, posées sur la classe de chaque contrôleur d'administration. Elles lèvent toujours une exception explicite, pour que le filtre du socle produise les messages français par défaut. La distinction `401` / `403` est conservée ; avec l'unique rôle `ADMIN`, le `403` n'a pas de scénario métier naturel dans cette fonctionnalité et est vérifié structurellement.
8. **Limitation** : `@nestjs/throttler`, appliquée **uniquement** à `POST /api/v1/auth/login` : 5 demandes par 60 secondes et par adresse IP, toutes les demandes comptant, réussies ou non ; stockage en mémoire ; message français. Aucune garde de limitation globale n'est installée.
9. **Années Rotary** : contrôleur d'administration ; DTO de création (entier JSON de 2000 à 2100) ; le doublon est détecté par l'erreur de l'index unique, convertie en `409` ; suppression par identifiant.
10. **Ordre d'écriture** : les gardes existent avant le contrôleur d'administration des années. Aucune route `/admin` n'est jamais compilée sans ses gardes (FR-024).

## Alignement des documents

Faits par ce plan, avec l'accord du porteur du projet, avant toute implémentation :

| Document | Changement |
|---|---|
| `ARCHITECTURE.md`, section 6 | Années : codes `201` (création) et `204` (suppression) ; `400` pour un identifiant mal formé, `404` pour une année inconnue. |
| `ARCHITECTURE.md`, section 7 | Compte : la commande refuse un autre email qu'un compte existant. Jeton : durée de 8 heures au plus, fixée par `JWT_EXPIRES_IN` ; un changement de mot de passe n'invalide pas les jetons déjà délivrés. |
| `ARCHITECTURE.md`, section 12 | `JWT_EXPIRES_IN` : défaut `8h`, durée strictement positive, maximum 8 heures. |
| `specs/001-api-foundation/data-model.md` | Règle de validité de `JWT_EXPIRES_IN`, même texte. |

La table des décisions verrouillées (section 14) n'est pas modifiée : la décision 6 (« expiration 8 heures ») reste vraie comme défaut et comme maximum.

À faire en fin d'implémentation, pas maintenant : `PROJECT_CONTEXT.md`, la ligne d'état de `CLAUDE.md`, et le commentaire de `JWT_EXPIRES_IN` dans `apps/api/.env.example`.

## Prérequis manuels (porteur du projet)

1. Ramener `JWT_EXPIRES_IN` à `8h` ou moins dans `apps/api/.env` (il vaut `1d` aujourd'hui) : sinon l'API refusera de démarrer dès que la nouvelle règle sera en place.
2. Choisir l'email et le mot de passe du compte, les placer temporairement dans `apps/api/.env`, lancer la commande d'initialisation, puis les retirer du fichier avant de vérifier l'API.
3. Une base MongoDB Atlas joignable.

## Fin d'étape

- `npm run lint` et `npm run build:api` passent ; `npm run build:web` et `npm run build:admin` passent comme avant.
- Les scénarios de [quickstart.md](./quickstart.md) sont déroulés, ou explicitement signalés comme non faits.
- Aucune année de vérification ne reste en base. Le compte créé est celui du porteur du projet.
- `PROJECT_CONTEXT.md` et `CLAUDE.md` sont mis à jour : authentification en place, années Rotary administrables, trois dépendances installées.

## Complexity Tracking

Aucune violation de la constitution à justifier.
