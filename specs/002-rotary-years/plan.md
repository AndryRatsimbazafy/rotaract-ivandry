# Implementation Plan: Années Rotary (RotaryYear)

**Branch**: `002-rotary-years` | **Date**: 2026-10-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-rotary-years/spec.md`

## Summary

Livrer le **temps 1** de la ressource RotaryYear : le modèle (seule l'année de début est enregistrée, unique), le calcul du label, des dates et du caractère courant, et la liste publique `GET /api/v1/rotary-years`.

Le **temps 2** (création, liste d'administration, suppression, sous `/admin`) est spécifié mais **n'est pas planifié ici** : il est livré avec la fonctionnalité d'authentification. Ce plan ne crée aucune route `/admin`, aucune garde, aucun DTO de création.

Approche : un module NestJS `rotary-years` de la forme prévue par `ARCHITECTURE.md`, section 5 (module, contrôleur public, service, schéma), et une aide pure dans `common/utils/` pour les calculs. Aucune dépendance nouvelle.

## Technical Context

**Language/Version** : TypeScript 6 (strict), Node.js 22. Sortie CommonJS avec `module: nodenext`, comme le socle.

**Primary Dependencies** : déjà installées par le socle : NestJS 12, `@nestjs/mongoose` 12, `mongoose` 9, `class-validator`, `class-transformer`. **Aucune dépendance à installer.**

**Storage** : MongoDB Atlas Free, via Mongoose. Une collection, `rotaryyears` (`ARCHITECTURE.md`, section 3), avec un index unique sur `startYear`.

**Testing** : aucun test automatisé (constitution, principe IX). Vérification manuelle décrite dans [quickstart.md](./quickstart.md), plus `npm run lint` et `npm run build:api`.

**Target Platform** : serveur Node.js 22, en local (port 4000). Hébergement hors périmètre.

**Project Type** : service web (API HTTP JSON) dans un monorepo npm workspaces.

**Performance Goals** : aucun objectif chiffré. La liste tient en une lecture de quelques documents (une année par an).

**Constraints** : aucune route `/admin` ; aucune donnée créée par le code ; messages d'erreur en français au format du socle ; pas de modification de `apps/web`, `apps/admin` ni `DESIGN.md` ; aucun mécanisme du socle modifié.

**Scale/Scope** : une route, un module, cinq fichiers de code nouveaux, une ligne ajoutée à `app.module.ts`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Modèle, calculs, adresse, tri et enveloppe repris d'`ARCHITECTURE.md` (sections 1.1, 3, 5, 6, 9, 10, 13). Aucune décision ouverte de la section 14 n'est touchée. | Conforme |
| II. Étapes validées | Spec validée le 2026-10-01. Ce plan s'arrête après la phase 1 : ni tâches ni code. | Conforme |
| III. Préférence pour le manuel | Aucun script. Les années de vérification sont insérées et retirées à la main dans Atlas. | Conforme |
| IV. Simplicité technique | Mécanismes natifs (schéma Mongoose, module NestJS). Aucune dépendance, aucune abstraction générique : une aide de calcul avec trois fonctions. | Conforme |
| V. Architecture backend | Route sous `/api/v1`. Aucune route `/admin` : la séparation public / administration est respectée en ne livrant que le public. | Conforme |
| VI. Intégrité du modèle métier | RotaryYear identifiée par `startYear` ; label, dates et `isCurrent` calculés, jamais stockés. | Conforme |
| VII. Front Office | Non touché. | Conforme |
| VIII. Qualité et contenu | Aucune année créée par le code, aucune donnée d'exemple. Les années de vérification sont retirées. | Conforme |
| IX. Tests | Aucun test, aucun outillage de test. | Conforme |
| X. Outillage et infrastructure | npm, aucune installation. Pas de Docker ni de CI/CD. | Conforme |
| XI. Git et collaboration | Branche `002-rotary-years` créée par Spec Kit à la demande du porteur du projet. Aucun commit sans demande. | Conforme |
| XII. Non-régression | Seul `apps/api` change. Les builds des deux fronts sont revérifiés en fin d'étape (SC-007). | Conforme |

**Dérogation validée (principe I).** `ARCHITECTURE.md`, section 15, place l'authentification avant les années. Le porteur du projet a validé le 2026-10-01 que cette fonctionnalité passe avant elle, limitée au temps 1, sans aucune route `/admin`. Ce n'est pas une violation à justifier : aucune décision verrouillée n'est contredite.

**Résultat de la porte** : passée. Aucune violation.

**Re-vérification après la phase 1** : inchangée. Le contrat, le modèle de données et le guide de vérification n'introduisent ni dépendance, ni route d'administration, ni automatisation.

## Project Structure

### Documentation (this feature)

```text
specs/002-rotary-years/
├── spec.md
├── plan.md              ce fichier
├── research.md          phase 0 : décisions techniques
├── data-model.md        phase 1 : l'entité RotaryYear
├── quickstart.md        phase 1 : vérification manuelle du temps 1
├── contracts/
│   └── rotary-years.md  contrat de la ressource (temps 1 livré, temps 2 différé)
├── checklists/
│   └── requirements.md
└── tasks.md             créé plus tard par /speckit-tasks
```

### Source Code (repository root)

```text
apps/api/src/
├── app.module.ts                              modifié : import de RotaryYearsModule
├── common/
│   └── utils/
│       └── rotary-year.ts                     nouveau : label, dates et caractère courant d'une année
└── rotary-years/
    ├── rotary-years.module.ts                 nouveau
    ├── rotary-years.public.controller.ts      nouveau : GET /rotary-years
    ├── rotary-years.service.ts                nouveau : lecture triée et mise en forme
    └── schemas/
        └── rotary-year.schema.ts              nouveau : startYear unique, dates techniques
```

**Non créés par ce plan** (temps 2, avec l'authentification) : `rotary-years.admin.controller.ts`, `dto/create-rotary-year.dto.ts`, `common/pipes/` pour l'identifiant, les méthodes de création et de suppression du service.

**Structure Decision** : la forme de module d'`ARCHITECTURE.md`, section 5, sans son contrôleur d'administration ni ses DTO, qui arrivent au temps 2. L'aide de calcul va dans `common/utils/`, emplacement que l'architecture prévoit pour « label et dates d'une année Rotary » : les fonctionnalités suivantes (filtre `year=2026-2027`, label d'une action) s'en serviront. `main.ts`, la configuration, le filtre d'erreurs et le pipe de validation ne sont pas modifiés.

## Décisions de conception

Détail et alternatives dans [research.md](./research.md).

1. **Schéma** : un seul champ métier, `startYear` (nombre, obligatoire, index unique), plus `createdAt` et `updatedAt` gérés par Mongoose. Collection `rotaryyears`.
2. **Unicité** : portée par l'index unique de la base, créé par Mongoose au démarrage. Elle tient donc sans route de création, y compris pour une insertion manuelle ou simultanée.
3. **Calculs** : trois fonctions pures dans `common/utils/rotary-year.ts` (label, bornes, caractère courant à un instant donné). Pas de propriété virtuelle Mongoose.
4. **Mise en forme** : le service convertit chaque document en `{ id, startYear, label, startDate, endDate, isCurrent }`. Un seul instant de référence est pris par requête.
5. **Liste** : toutes les années, triées par `startYear` décroissant (équivalent du tri `-startDate` de l'architecture), dans `{ "data": [...] }`.
6. **Règles de validation de `startYear`** (entier JSON, 2000 à 2100) : non mises en œuvre au temps 1, faute d'entrée à valider. Elles sont écrites dans le contrat pour le temps 2.
7. **Erreurs** : celles du socle, sans ajout. Aucun message nouveau au temps 1.

## Prérequis manuels (porteur du projet)

1. Une base joignable : `apps/api/.env` renseigné et accès réseau Atlas ouvert pour le poste (tâche T011 de `001-api-foundation`, encore ouverte).
2. Pour la vérification : insérer puis retirer à la main quelques années dans la collection `rotaryyears` (Atlas, Data Explorer).

L'implémentation peut être écrite sans ces prérequis ; la vérification en a besoin.

## Report au temps 2

À reprendre par la fonctionnalité d'authentification, à partir de [contracts/rotary-years.md](./contracts/rotary-years.md) : FR-016 à FR-025 de la spec (création en `201`, doublon en `409`, validation stricte de `startYear`, liste d'administration, suppression en `204`, refus `409` d'une année référencée, `400` et `404` sur l'identifiant). `PROJECT_CONTEXT.md` le rappelle dans ses prochaines étapes, pour que ce report ne soit pas oublié.

## Fin d'étape

- `npm run lint` et `npm run build:api` passent ; `npm run build:web` et `npm run build:admin` passent comme avant.
- Les scénarios de [quickstart.md](./quickstart.md) sont déroulés, ou explicitement signalés comme non faits (par exemple faute de base joignable).
- Aucune année ne reste en base du fait de la vérification.
- `PROJECT_CONTEXT.md` et la ligne d'état de `CLAUDE.md` sont mis à jour : module `rotary-years` en place (liste publique), opérations d'administration reportées à l'authentification.
- `ARCHITECTURE.md` n'est pas modifié par le temps 1. Les codes `201` et `204`, validés dans la spec mais absents de l'architecture, y seront inscrits avec le temps 2, qui les met en œuvre.

## Complexity Tracking

Aucune violation de la constitution à justifier.
