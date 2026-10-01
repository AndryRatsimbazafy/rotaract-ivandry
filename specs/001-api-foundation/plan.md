# Implementation Plan: Socle de l'API backend

**Branch**: `001-api-foundation` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-api-foundation/spec.md`

## Summary

Transformer le gabarit `apps/api` en socle : configuration vérifiée au démarrage, connexion à MongoDB par Mongoose, préfixe `/api/v1`, format d'erreur unique en français, validation globale des entrées, en-têtes de sécurité, politique CORS fermée par défaut, et une seule route, `GET /api/v1/health`.

Approche : uniquement les mécanismes natifs de NestJS (module de configuration, module Mongoose, filtre d'exception global, `ValidationPipe` global), sans abstraction maison ni bibliothèque de plus que celles déjà listées dans `ARCHITECTURE.md`. Aucun modèle, aucune collection, aucune route métier.

## Technical Context

**Language/Version** : TypeScript 6 (strict), Node.js 22. Sortie CommonJS avec `module: nodenext`, comme le gabarit.

**Primary Dependencies** : déjà installées : NestJS 12 (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`). **À installer par cette fonctionnalité, après validation** (toutes listées dans `ARCHITECTURE.md`, section 5) :

| Paquet | Version constatée au registre | Besoin |
|---|---|---|
| `@nestjs/config` | 12.x | Lecture et validation des variables d'environnement (FR-005 à FR-008) |
| `@nestjs/mongoose` | 12.x | Connexion à la base, déclaration future des modèles (FR-011, FR-014) |
| `mongoose` | 9.x | Requis par `@nestjs/mongoose` |
| `class-validator` | 0.15.x | Validation globale des entrées (FR-020) et de la configuration |
| `class-transformer` | 0.5.x | Requis par `ValidationPipe` (conversion de type) |
| `helmet` | 8.x | En-têtes de sécurité (FR-026) |

Compatibilité vérifiée au registre npm : `@nestjs/config` et `@nestjs/mongoose` 12 acceptent NestJS 12 ; `@nestjs/mongoose` 12 accepte Mongoose 9.

**Non installées** par cette fonctionnalité : `@nestjs/jwt`, `argon2`, `@nestjs/throttler` (authentification), tout paquet de stockage.

**Storage** : MongoDB Atlas Free, via Mongoose. Connexion seulement ; aucune collection.

**Testing** : aucun test automatisé (constitution, principe IX). Vérification manuelle décrite dans [quickstart.md](./quickstart.md), plus `npm run lint` et `npm run build:api`.

**Target Platform** : serveur Node.js 22, en local (port 4000). Hébergement hors périmètre.

**Project Type** : service web (API HTTP JSON) dans un monorepo npm workspaces.

**Performance Goals** : aucun objectif chiffré pour un socle. La route de santé répond sans requête lourde.

**Constraints** : aucun secret dans le code ni dans les journaux ; messages d'erreur en français ; pas de dépendance hors liste ; pas de modification de `apps/web`, `apps/admin` ni `DESIGN.md`.

**Scale/Scope** : une route, quatre dossiers sous `apps/api/src`, environ dix fichiers de code.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Le plan suit `ARCHITECTURE.md` (sections 5, 6, 8, 10, 12, 14). Un écart est signalé ci-dessous, non résolu d'autorité. | À valider (voir « Écart ») |
| II. Étapes validées | Ce plan s'arrête après la phase 1. Ni tâches ni code. | Conforme |
| III. Préférence pour le manuel | Aucun script créé. La création du cluster Atlas et du fichier `.env` est manuelle. | Conforme |
| IV. Simplicité technique | Mécanismes natifs de NestJS seulement ; pas de bibliothèque de santé, pas de schéma de validation supplémentaire, pas de journalisation ajoutée. | Conforme |
| V. Architecture backend | NestJS, Mongoose avec `@nestjs/mongoose`, préfixe `/api/v1`. Aucune route `/admin`, aucune garde : hors périmètre. | Conforme |
| VI. Intégrité du modèle métier | Aucun modèle créé. | Conforme (sans objet) |
| VII. Front Office | Non touché. | Conforme |
| VIII. Qualité et contenu | Aucun contenu métier. La route de santé ne renvoie que des états réels. | Conforme |
| IX. Tests | Aucun test, aucun outillage de test. Le dossier `tests/` du gabarit de plan n'est pas repris. | Conforme |
| X. Outillage et infrastructure | npm, installation par `--workspace=api` depuis la racine ; pas de Docker ni de CI/CD. | Conforme |
| XI. Git et collaboration | Branche `001-api-foundation` créée par Spec Kit à la demande explicite du porteur du projet. Aucun commit sans demande. | Conforme |
| XII. Non-régression | Seul `apps/api` change. Le build du Front Office est revérifié en fin d'étape (SC-008). | Conforme |

**Écart à valider (principe I).** L'arborescence de `ARCHITECTURE.md`, section 5, ne contient pas de dossier pour la route de santé, ajoutée depuis (décision 16). Le plan propose `apps/api/src/health/`. Si cet emplacement est validé, une ligne est ajoutée à l'arborescence d'`ARCHITECTURE.md` avant l'implémentation. Ce n'est pas une décision nouvelle, seulement son emplacement dans le code.

**Résultat de la porte** : passée, sous réserve de la validation de cet emplacement. Aucune violation à justifier.

**Re-vérification après la phase 1** : inchangée. Les contrats et le guide de vérification n'introduisent ni dépendance, ni route, ni automatisation supplémentaire.

## Project Structure

### Documentation (this feature)

```text
specs/001-api-foundation/
├── spec.md
├── plan.md              ce fichier
├── research.md          phase 0 : décisions techniques
├── data-model.md        phase 1 : la configuration (aucune entité métier)
├── quickstart.md        phase 1 : vérification manuelle
├── contracts/
│   ├── health.md        contrat de GET /api/v1/health
│   └── errors.md        format d'erreur commun
├── checklists/
│   └── requirements.md
└── tasks.md             créé plus tard par /speckit-tasks
```

### Source Code (repository root)

```text
apps/api/
├── .env.example                         nouveau : noms des variables, sans valeur
├── package.json                         six dépendances ajoutées
└── src/
    ├── main.ts                          modifié : préfixe, helmet, CORS, validation, filtre, port
    ├── app.module.ts                    modifié : configuration, connexion Mongoose, module de santé
    ├── app.controller.ts                supprimé (route « Hello World! »)
    ├── app.service.ts                   supprimé
    ├── config/
    │   ├── env.validation.ts            nouveau : forme et règles des variables d'environnement
    │   └── app-config.ts                nouveau : accès typé à la configuration
    ├── common/
    │   ├── filters/
    │   │   └── all-exceptions.filter.ts nouveau : format d'erreur unique
    │   └── validation/
    │       └── validation.pipe.ts       nouveau : options du ValidationPipe et détail par champ
    └── health/
        ├── health.module.ts             nouveau
        └── health.controller.ts         nouveau : GET /health
```

**Structure Decision** : on reste dans `apps/api/src`, avec les dossiers `config/` et `common/` prévus par `ARCHITECTURE.md`, section 5, plus `health/` (voir l'écart ci-dessus). La connexion à la base est déclarée dans `app.module.ts` : un dossier `database/` dédié n'apporterait rien pour un seul appel de configuration. Dans `common/`, seuls le filtre d'erreurs et la validation sont créés ; `dto/`, `pipes/`, `enums/`, `schemas/` et `utils/` arrivent avec la première fonctionnalité qui en a besoin (FR-025). Aucun fichier hors de `apps/api`, sauf `package-lock.json` à la racine, mis à jour par l'installation.

## Décisions de conception

Détail et alternatives dans [research.md](./research.md).

1. **Configuration** : module de configuration global, fichier `apps/api/.env` en local, validation par une classe `class-validator` exécutée au démarrage. Toutes les erreurs sont rassemblées en un seul message qui nomme chaque variable, sans jamais afficher de valeur.
2. **Connexion à la base** : déclarée de façon asynchrone à partir de la configuration. Trois tentatives espacées de deux secondes, délai de sélection du serveur de cinq secondes ; en cas d'échec, l'API s'arrête avec un message générique. Le journal détaillé des tentatives est désactivé pour ne rien exposer.
3. **Préfixe** : `api/v1` en préfixe global. Pas de module de versionnage.
4. **Erreurs** : un filtre global unique. Les messages standards par code HTTP sont en français ; une erreur inconnue donne un `500` générique et est journalisée côté serveur. Les erreurs de validation portent `details`.
5. **Validation** : `ValidationPipe` global avec `whitelist`, `forbidNonWhitelisted`, `transform`, conformément à `ARCHITECTURE.md`, section 8.
6. **Sécurité** : `helmet` avec ses réglages par défaut.
7. **CORS** : désactivé quand `CORS_ORIGINS` est vide ; sinon limité à la liste.
8. **Santé** : un contrôleur qui lit l'état de la connexion Mongoose. Pas de bibliothèque dédiée.

## Prérequis manuels (porteur du projet)

1. Créer le cluster MongoDB Atlas Free, un utilisateur de base, et autoriser l'adresse IP du poste.
2. Copier `apps/api/.env.example` en `apps/api/.env` et y renseigner `MONGODB_URI` et `JWT_SECRET`.

Ces opérations sont faites à la main (constitution, principe III). L'implémentation peut être écrite sans elles ; la vérification manuelle des récits 2 et de la route de santé en a besoin.

## Fin d'étape

- `npm run lint` et `npm run build:api` passent ; `npm run build:web` passe comme avant.
- Les scénarios de [quickstart.md](./quickstart.md) sont déroulés, ou explicitement signalés comme non faits (par exemple faute de cluster disponible).
- `ARCHITECTURE.md` porte l'emplacement `health/` si l'écart est validé. `PROJECT_CONTEXT.md` et `CLAUDE.md` sont mis à jour pour dire que l'API n'est plus un gabarit.

## Complexity Tracking

Aucune violation de la constitution à justifier.
