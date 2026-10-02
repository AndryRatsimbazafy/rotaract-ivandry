# Implementation Plan: Actualités (News)

**Branch**: `006-news` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/006-news/spec.md`

## Summary

Introduire les actualités du club : un modèle `News` avec slug unique, type parmi cinq, date, année Rotary explicite, lieu, résumé, contenu et état de publication ; son administration protégée ; trois lectures publiques (liste paginée, détail par slug, archives par année Rotary) ; et le refus de supprimer une année Rotary qu'une actualité référence.

Approche : un module NestJS `news`, de la même forme que le module `actions` existant (module, contrôleur public, contrôleur d'administration, service, schéma, DTO). Ce qui est déjà générique est réutilisé : génération de slug, pagination, lecture d'un label d'année, gardes, `ParseObjectIdPipe`. Aucune photographie, aucun état éditorial au-delà de brouillon et publié, aucune « une », aucune publication programmée, aucune transaction, aucune dépendance nouvelle.

## Technical Context

**Language/Version** : TypeScript 6 (strict), Node.js 22. Sortie CommonJS avec `module: nodenext`.

**Primary Dependencies** : toutes déjà installées : NestJS 12, `@nestjs/mongoose` 12, `mongoose` 9, `class-validator`, `class-transformer`, et l'authentification de `003-admin-auth`. **Aucune dépendance à installer.**

**Storage** : MongoDB Atlas Free, via Mongoose. Une collection nouvelle, `news`. Aucun stockage de fichiers.

**Testing** : aucun test automatisé (constitution, principe IX) : ni Jest, ni Vitest, ni Playwright, ni Cypress, aucune suite ajoutée. Vérification manuelle structurée dans [quickstart.md](./quickstart.md), plus `npm run lint` et `npm run build:api`.

**Target Platform** : serveur Node.js 22, en local (port 4000). Hébergement hors périmètre.

**Project Type** : service web (API HTTP JSON) dans un monorepo npm workspaces.

**Performance Goals** : aucun objectif chiffré. Un club publie quelques dizaines d'actualités par an.

**Constraints** : aucune route d'administration sans ses gardes ; aucun brouillon visible du public, y compris dans les nombres des archives ; aucune donnée d'exemple ; aucun champ `photos` ; messages en français au format du socle ; pas de modification de `apps/web`, `apps/admin`, `DESIGN.md`, de l'authentification, du socle, de `members/` ni de `actions/`.

**Scale/Scope** : cinq routes d'administration, trois routes publiques, dix fichiers nouveaux, trois modifiés.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Modèle, adresses, validation, listes et tris repris d'`ARCHITECTURE.md` (sections 1.5, 3, 5, 6, 8, 9, 13). Les précisions décidées dans la spec sont listées ci-dessous comme alignements ; ce plan ne les applique pas. | Conforme, alignements validés, appliqués par la première tâche |
| II. Étapes validées | Spec validée le 2026-10-02. Ce plan s'arrête après la phase 1 : ni tâches ni code. | Conforme |
| III. Préférence pour le manuel | Aucun script, aucune donnée insérée par le code. Les vérifications sont déroulées à la main. | Conforme |
| IV. Simplicité technique | Mécanismes natifs de NestJS et de Mongoose. Aucune dépendance, aucune abstraction nouvelle, aucune transaction. | Conforme |
| V. Architecture backend | Routes sous `/api/v1` ; administration sous `/admin`, gardée au niveau de la classe ; lecture publique dans son propre contrôleur. | Conforme |
| VI. Intégrité du modèle métier | News et Action restent séparées : aucune collection, route ni fichier partagé. L'actualité porte une référence explicite et obligatoire vers RotaryYear. | Conforme |
| VII. Front Office | Non touché. Les divergences du Front Office restent des sujets de migration. | Conforme |
| VIII. Qualité et contenu | Aucune actualité fictive. Les cinq types sont ceux de la constitution. | Conforme |
| IX. Tests | Aucun test, aucun outillage de test. | Conforme |
| X. Outillage et infrastructure | npm ; aucune installation. | Conforme |
| XI. Git et collaboration | Branche `006-news` créée par Spec Kit à la demande du porteur du projet. Aucun commit sans demande. | Conforme |
| XII. Non-régression | Les routes existantes sont revérifiées ; seule la suppression d'une année référencée par une actualité change. | Conforme |

**Résultat de la porte** : passée. Le plan, ses huit alignements d'`ARCHITECTURE.md`, ses quatre messages et la duplication limitée des aides ont été validés par le porteur du projet le 2026-10-02. Aucune violation à justifier.

**Re-vérification après la phase 1** : inchangée.

## A. Alignements d'ARCHITECTURE.md proposés

**Aucun n'est appliqué par ce plan.** Aucun n'est une contradiction : chacun inscrit une précision décidée dans la spec, ou reporte un champ. Validés le 2026-10-02, ils sont appliqués par la première tâche, T001, avant tout code.

| # | Section | Texte actuel | Changement exact | Pourquoi |
|---|---|---|---|---|
| 1 | 1.5, champ `photos` | « MediaRef[], oui. Peut être vide. » | Ajouter : « Non mis en œuvre avant le stockage de fichiers. » | Q1. Sans cette note, l'architecture annonce un champ que l'API ne renvoie pas. |
| 2 | 1.5, champ `publishedAt` | « Date, non » (sans note) | Ajouter : « Posé à la première publication. Conservé à la dépublication et à la republication. Une actualité peut être créée directement publiée. Jamais fourni en entrée. » | Q2. La règle existait pour l'action, pas pour l'actualité. |
| 3 | 1.5, champ `location` | « string, non. Déjà affiché par le Front Office. » | Ajouter : « 1 à 120 caractères. » | Q10. Aucune limite n'était fixée. |
| 4 | 1.5, champ `date` | « Date, oui » | Ajouter : « Un seul champ de date et heure ; ni heure séparée, ni date de fin. » | Q11. |
| 5 | 6, ligne « Actualités » (administration) | « `GET /admin/news` (…) · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` » | Ajouter : « Création : `201`. Suppression : `204`. `409` pour un slug déjà pris. » | Codes validés, absents de l'architecture. |
| 6 | 6, `GET /news` (public) | « … Liste paginée, plus récente d'abord » | Ajouter : « Liste vide (`200`) si l'année n'existe pas. » | Q5. |
| 7 | 6, `GET /news/archives` | « Années qui ont des actualités publiées, avec leur nombre » | Ajouter : « Une entrée par année : `rotaryYear` dans la forme de `/rotary-years`, et `count`, le nombre d'actualités publiées. » | Q4. Aucune forme n'était donnée. |
| 8 | 8, « Slug » | Règles communes, plus la réserve de `years` pour les actions | Ajouter : « `archives` est réservé pour les actualités : il désigne la route `/news/archives` ; la génération automatique passe à `archives-2`, et fourni par l'administrateur il est refusé (`400`). » | Q3. |

Le `409` pour une année utilisée est déjà dans la section 1.1 ; la règle du titre sans slug possible est déjà dans la section 8 depuis `005`. La table des décisions verrouillées et les exemples JSON ne sont pas modifiés.

## Project Structure

### Documentation (this feature)

```text
specs/006-news/
├── spec.md
├── plan.md              ce fichier
├── research.md          phase 0 : décisions techniques
├── data-model.md        phase 1 : News, NewsType, index
├── quickstart.md        phase 1 : vérification manuelle
├── contracts/
│   └── news.md          administration et lecture publique
├── checklists/
│   └── requirements.md
└── tasks.md             créé plus tard par /speckit-tasks
```

### Source Code (repository root)

```text
apps/api/src/
├── app.module.ts                          modifié : import de NewsModule
├── common/
│   └── enums/
│       └── news-type.enum.ts              nouveau : les cinq types d'actualité
├── news/
│   ├── news.module.ts                     nouveau
│   ├── schemas/news.schema.ts             nouveau : modèle News, index
│   ├── news.service.ts                    nouveau : écriture, slug, publication, listes, détail, archives
│   ├── news.admin.controller.ts           nouveau : /admin/news, gardé sur la classe
│   ├── news.public.controller.ts          nouveau : /news, /news/archives, /news/:slug
│   └── dto/
│       ├── create-news.dto.ts             nouveau
│       ├── update-news.dto.ts             nouveau
│       ├── query-admin-news.dto.ts        nouveau : recherche, filtres, tri, pagination
│       └── query-public-news.dto.ts       nouveau : recherche, filtres, pagination
└── rotary-years/
    ├── rotary-years.module.ts             modifié : déclare aussi le modèle News
    └── rotary-years.service.ts            modifié : refus de supprimer une année référencée par une actualité
```

**Réutilisés sans modification** : `common/utils/slug.ts` (génération et suffixe), `common/utils/rotary-year.ts` (label, bornes, lecture d'un label), `common/dto/pagination-query.dto.ts`, `common/pipes/parse-object-id.pipe.ts`, les gardes et décorateurs de `auth/`.

**Non modifiés** : `main.ts`, `config/`, `common/filters/`, `common/pipes/`, `auth/`, `health/`, `members/`, `actions/`, les contrôleurs et le schéma des années Rotary.

**Structure Decision** : la forme de module d'`ARCHITECTURE.md`, section 5, celle déjà en place pour `actions`. Le seul fichier nouveau dans `common/` est l'énumération des types, à l'emplacement que l'architecture prévoit pour `NewsType`. `news` et `rotary-years` déclarent chacun les modèles qu'ils lisent, sans s'importer.

## Décisions de conception

Détail et alternatives dans [research.md](./research.md).

### B. Modèle News

- Champs : `title`, `slug`, `type`, `date`, `rotaryYear` obligatoires ; `location`, `summary`, `content` facultatifs ; `isPublished` (faux par défaut) ; `publishedAt` ; dates techniques. Aucun champ `photos`, d'impact, de domaine, d'ordre ni de mise en avant.
- `type` : exactement `evenement`, `participation`, `reunion`, `formation`, `annonce`, par l'énumération `NewsType`, validée à l'entrée et dans le schéma.
- `rotaryYear` : référence déclarée avec `SchemaTypes.ObjectId` (leçon de `004`), jamais déduite de la date.
- Index, ceux d'`ARCHITECTURE.md`, section 3 : `slug` unique ; `(isPublished, date)` ; `(rotaryYear, isPublished)` ; `type` ; texte sur `title`, `summary`.
- Deux formes de sortie construites explicitement par le service. Administration : tous les champs, `rotaryYear` en `{ id, label }`. Publique : sans `isPublished`, `publishedAt`, `createdAt`, `updatedAt`, avec `rotaryYear` en label. Aucune donnée d'authentification n'est liée à une actualité : rien ne peut en être exposé.

### C. Slug

- Génération par `slugify` et `withSlugSuffix` de `common/utils/slug.ts`, sans les modifier.
- Unicité par l'index unique de la collection `news` : elle ne s'étend pas aux actions, qui ont leur propre collection.
- Slug généré : la base si elle est libre et n'est pas `archives`, sinon le premier suffixe libre à partir de `-2`. L'index unique tranche deux créations simultanées ; la création réessaie, cinq fois au plus.
- Slug fourni : `archives` → `400` « Ce slug est réservé. » ; sinon écrit tel quel ; déjà pris → `409` générique, sans suffixe ajouté.
- Modification : le slug n'est écrit que si le champ est envoyé ; le titre ne déclenche aucune régénération.
- Titre sans slug possible, sans slug fourni : `400`, « Aucun slug ne peut être tiré de ce titre : fournissez-en un. ».

### D. Publication

- Deux états, portés par `isPublished`, modifié par `PATCH`. Aucune route dédiée, aucun autre état.
- `publishedAt` : écrit quand `isPublished` passe à vrai et qu'il n'existe pas encore ; jamais touché autrement. À la création publiée, `createdAt` et `publishedAt` reçoivent le même instant, comme dans `actions` depuis la correction faite pendant `005`.
- `publishedAt` n'est dans aucun DTO : envoyé, il est refusé comme champ non prévu.
- Détail public : recherche d'une actualité **publiée** de ce slug, sinon `404`.
- Ni transaction ni verrou : même hypothèse d'un seul administrateur que pour les actions.

### E. API d'administration

- `news.admin.controller.ts`, contrôleur `admin/news`, portant `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')` **sur la classe**, dès sa création.
- `GET` (liste), `GET :id`, `POST` (`201`), `PATCH :id`, `DELETE :id` (`204`), avec `ParseObjectIdPipe`.
- Liste : pagination commune ; `q` par l'index texte ; filtres `year` (label), `type`, `published` (`true` ou `false`) ; `sort` parmi exactement `date`, `-date`, `title`, `-title`, `createdAt`, `-createdAt`, défaut `-date`.
- Modification : champ absent inchangé ; `null` efface `location`, `summary` ou `content` ; `""` refusée.
- Conflits : clé dupliquée de l'index du slug → `409` générique.

### F. API publique

- `news.public.controller.ts`, contrôleur `news`, sans garde : `GET`, `GET archives`, `GET :slug`, **`archives` déclaré avant `:slug`**.
- Liste : actualités publiées seulement, pagination commune, `q`, `year`, `type` ; tri par date décroissante, puis identifiant pour une pagination stable. Un tri simple suffit : il n'y a pas d'ordre manuel.
- Archives : regroupement des actualités publiées par année, puis lecture des années ; une entrée `{ rotaryYear, count }` par année, de la plus récente à la plus ancienne. **Il n'existe pas de route `/news/years`** : l'architecture ne prévoit que les archives.

### G. RotaryYear

- Référence explicite, vérifiée à la création et à la modification : année inexistante → `400`, « Cette année Rotary n'existe pas. ».
- `RotaryYearsService.remove` ajoute un contrôle des actualités, brouillons compris, à ceux des mandats et des actions : `409` générique. L'année redevient supprimable une fois ses actualités retirées.
- Filtre sur une année inexistante : page vide, `200`, sans lire les actualités.

### H. Validation

- Messages repris tels quels quand la règle est commune aux actions ; quatre messages nouveaux, propres aux actualités, listés dans [contracts/news.md](./contracts/news.md) et validés le 2026-10-02. Aucun autre message n'est créé pendant l'implémentation.
- Date : chaîne ISO 8601 convertie en date, comme pour les actions ; une date sans heure vaut minuit UTC.
- `photos` et `publishedAt` : absents des DTO, donc refusés par le socle (« Champ non autorisé. »).

### I et J. Non-régression et tests

Section « Fin d'étape » et [quickstart.md](./quickstart.md) : santé, `/auth/me`, années Rotary, membres et mandats, actions, protection des routes, format, lint, trois builds, nettoyage d'Atlas par l'API. Aucun test automatisé.

## Validations du 2026-10-02

1. **Quatre messages nouveaux** validés : type (champ), type (filtre), lieu, contenu ; textes dans [contracts/news.md](./contracts/news.md).
2. **Duplication limitée conservée** : la logique de slug du service, le retrait des espaces et la contrainte « label d'année » sont réécrits dans `news/`. Aucun refactor de `common/`, de `004-members` ni de `005-actions` pour les factoriser.
3. **Les huit alignements d'`ARCHITECTURE.md`** : validés ; première tâche.
4. **Pas de route `/news/years`** : `/news/archives` est l'unique lecture d'années pour les actualités.

## Prérequis manuels (porteur du projet)

1. Une base MongoDB Atlas joignable et `apps/api/.env` renseigné.
2. Le mot de passe du compte d'administration, pour les vérifications.

## Fin d'étape

- `npm run format --workspace=api`, `npm run lint`, `npm run build:api` passent ; `npm run build:web` et `npm run build:admin` passent comme avant.
- Les scénarios de [quickstart.md](./quickstart.md) sont déroulés, ou explicitement signalés comme non faits.
- Aucune actualité, action, membre ni année de vérification ne reste en base.
- Non-régression : santé, authentification, années Rotary, membres et mandats, actions répondent comme avant.
- Aucun fichier modifié dans `apps/web`, `apps/admin`, `DESIGN.md`, `members/` ni `actions/`.
- `PROJECT_CONTEXT.md` et la ligne d'état de `CLAUDE.md` sont mis à jour.

## Ordre recommandé des phases

1. Alignement d'`ARCHITECTURE.md`, avant tout code.
2. Fondations : énumération des types, schéma, module.
3. Récit 1 : rédiger et gérer (DTO, service, contrôleur d'administration gardé).
4. Récit 2 : slug (collisions, `archives`, conflit, stabilité).
5. Récit 3 : publication.
6. Récit 4 : lecture publique (liste, détail, archives).
7. Récit 5 : années Rotary référencées.
8. Finition : format, lint, builds, non-régression, nettoyage, documents.

Les récits 1 à 4 construisent le même service et s'enchaînent. Le récit 5 ne dépend que du schéma.

## Complexity Tracking

Aucune violation de la constitution à justifier.
