# Implementation Plan: Actions

**Branch**: `005-actions` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/005-actions/spec.md`

## Summary

Introduire les actions du club : un modèle `Action` avec slug unique, état de publication, année Rotary explicite, domaines d'action, impact facultatif et ordre manuel facultatif ; son administration protégée ; trois lectures publiques (liste paginée, détail par slug, années ayant des actions publiées) ; et le refus de supprimer une année Rotary qu'une action référence.

Approche : un module NestJS `actions` de la forme prévue par `ARCHITECTURE.md`, section 5 (module, contrôleur public, contrôleur d'administration, service, schéma, DTO). L'unicité du slug est portée par un index unique de la base. Aucune photographie, aucun envoi de fichier, aucun réordonnancement, aucune transaction, aucune dépendance nouvelle.

## Technical Context

**Language/Version** : TypeScript 6 (strict), Node.js 22. Sortie CommonJS avec `module: nodenext`.

**Primary Dependencies** : toutes déjà installées : NestJS 12, `@nestjs/mongoose` 12, `mongoose` 9, `class-validator`, `class-transformer`, et l'authentification de `003-admin-auth`. **Aucune dépendance à installer.** La génération du slug est écrite à la main (une fonction d'une dizaine de lignes) plutôt que d'ajouter une bibliothèque.

**Storage** : MongoDB Atlas Free, via Mongoose. Une collection nouvelle, `actions`. Aucun stockage de fichiers.

**Testing** : aucun test automatisé (constitution, principe IX). Vérification manuelle décrite dans [quickstart.md](./quickstart.md), plus `npm run lint` et `npm run build:api`.

**Target Platform** : serveur Node.js 22, en local (port 4000). Hébergement hors périmètre.

**Project Type** : service web (API HTTP JSON) dans un monorepo npm workspaces.

**Performance Goals** : aucun objectif chiffré. Un club publie quelques dizaines d'actions par an.

**Constraints** : aucune route d'administration sans ses gardes ; aucun brouillon visible du public ; aucune donnée d'exemple ; aucun champ `photos` ; messages en français au format du socle, sans nouveau message de conflit ; pas de modification de `apps/web`, `apps/admin`, `DESIGN.md`, de l'authentification ni du socle.

**Scale/Scope** : cinq routes d'administration, trois routes publiques, une dizaine de fichiers nouveaux, trois modifiés. Aucun fichier de `004-members` n'est modifié.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Modèle, adresses, validation, listes et tris repris d'`ARCHITECTURE.md` (sections 1.4, 3, 5, 6, 8, 9, 13). Les précisions décidées dans la spec sont listées ci-dessous comme alignements ; ce plan ne les applique pas. | Conforme, alignements validés, appliqués par la première tâche |
| II. Étapes validées | Spec validée le 2026-10-02. Ce plan s'arrête après la phase 1 : ni tâches ni code. | Conforme |
| III. Préférence pour le manuel | Aucun script, aucune donnée insérée par le code. | Conforme |
| IV. Simplicité technique | Mécanismes natifs de NestJS et de Mongoose. Aucune dépendance. Aucune transaction, aucun réordonnancement. | Conforme |
| V. Architecture backend | Routes sous `/api/v1` ; administration sous `/admin`, gardée au niveau de la classe ; lecture publique dans son propre contrôleur. | Conforme |
| VI. Intégrité du modèle métier | Action et News restent séparées. L'action porte une référence explicite et obligatoire vers RotaryYear, jamais déduite de la date. | Conforme |
| VII. Front Office | Non touché. La contradiction `DESIGN.md` / `ARCHITECTURE.md` sur le registre d'impact reste un point de migration. | Conforme |
| VIII. Qualité et contenu | Aucune action fictive. Une rubrique d'impact non renseignée n'existe pas. | Conforme |
| IX. Tests | Aucun test, aucun outillage de test. | Conforme |
| X. Outillage et infrastructure | npm ; aucune installation. | Conforme |
| XI. Git et collaboration | Branche `005-actions` créée par Spec Kit avec l'accord du porteur du projet. Aucun commit sans demande. | Conforme |
| XII. Non-régression | Les routes existantes sont revérifiées ; seule la suppression d'une année référencée par une action change. | Conforme |

**Résultat de la porte** : passée. Les alignements d'`ARCHITECTURE.md` et les arbitrages du plan ont été validés par le porteur du projet le 2026-10-02. Aucune violation à justifier.

**Re-vérification après la phase 1** : inchangée.

## Alignements d'ARCHITECTURE.md proposés

**Aucun n'est appliqué par ce plan.** Aucun n'est une contradiction : chacun inscrit une précision décidée dans la spec, ou reporte un champ. Les huit ont été validés le 2026-10-02 ; ils sont appliqués par la **première tâche**, T001, avant tout code. Aucun autre changement d'architecture n'est ajouté.

| # | Section | Texte actuel | Changement exact | Pourquoi |
|---|---|---|---|---|
| 1 | 1.4, champ `photos` | « MediaRef[], oui. La première est la photographie principale. Peut être vide. » | Ajouter : « Non mis en œuvre avant le stockage de fichiers. » | La spec exclut les photographies ; sans cette note, l'architecture dit qu'une action porte un champ `photos` que l'API ne renvoie pas. |
| 2 | 1.4, champ `order` | « number, non. Ordre manuel éventuel. Tri public : … » | Ajouter : « Entier supérieur ou égal à 1, global (non lié à l'année), doublons permis. Aucun réordonnancement. » | Règles décidées dans la spec, absentes de l'architecture. |
| 3 | 1.4, `ActionImpact` | Liste des six rubriques | Ajouter : « Rubriques de texte : 500 caractères au plus. Partenaires : 20 au plus, 120 caractères chacun. Une modification remplace l'objet entier. » | Limites et règle de remplacement décidées dans la spec ; la section 8 ne les couvre pas. |
| 4 | 1.4, champ `publishedAt` | « Posé à la première publication. » | Ajouter : « Conservé à la dépublication et à la republication. Une action peut être créée directement publiée. » | Comportement décidé dans la spec. |
| 5 | 6, ligne « Actions » (administration) | « `GET /admin/actions` (…) · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` » | Ajouter : « Création : `201`. Suppression : `204`. `409` pour un slug déjà pris. » | Codes validés, absents de l'architecture. |
| 6 | 6, `GET /actions` (public) | « `year`, `focusArea`, `q`, `page`, `limit` — Liste paginée » | Ajouter : « Liste vide (`200`) si l'année n'existe pas. » | Décision de la spec, déjà inscrite pour `/members`. |
| 7 | 8, « Slug » | Règles de génération et de collision | Ajouter : « Un titre dont aucun slug ne peut être tiré est refusé (`400`) si aucun slug n'est fourni. » | Décision de la spec. |
| 8 | 8, « Slug » | Idem | Ajouter : « `years` est réservé pour les actions : il désigne la route `/actions/years`. La génération automatique passe à `years-2` ; fourni par l'administrateur, il est refusé (`400`). » | Validé : sans cette règle, une action de slug `years` serait publiée mais illisible par son détail. |

La contradiction `DESIGN.md` / `ARCHITECTURE.md` sur le registre d'impact n'entraîne aucune modification : elle reste un point de migration du Front Office.

## Project Structure

### Documentation (this feature)

```text
specs/005-actions/
├── spec.md
├── plan.md              ce fichier
├── research.md          phase 0 : décisions techniques
├── data-model.md        phase 1 : Action, ActionImpact, FocusArea, index
├── quickstart.md        phase 1 : vérification manuelle
├── contracts/
│   └── actions.md       administration et lecture publique
├── checklists/
│   └── requirements.md
└── tasks.md             créé plus tard par /speckit-tasks
```

### Source Code (repository root)

```text
apps/api/src/
├── app.module.ts                              modifié : import d'ActionsModule
├── common/
│   ├── enums/
│   │   └── focus-area.enum.ts                 nouveau : les sept domaines d'action
│   └── utils/
│       └── slug.ts                            nouveau : générer un slug depuis un titre
├── actions/
│   ├── actions.module.ts                      nouveau
│   ├── schemas/action.schema.ts               nouveau : modèle Action, impact embarqué, index
│   ├── actions.service.ts                     nouveau : écriture, slug, publication, listes, détail
│   ├── actions.admin.controller.ts            nouveau : /admin/actions, gardé sur la classe
│   ├── actions.public.controller.ts           nouveau : /actions, /actions/years, /actions/:slug
│   └── dto/
│       ├── create-action.dto.ts               nouveau : dont la forme de l'impact
│       ├── update-action.dto.ts               nouveau
│       ├── query-admin-actions.dto.ts         nouveau : recherche, filtres, tri, pagination
│       └── query-public-actions.dto.ts        nouveau : recherche, filtres, pagination
└── rotary-years/
    ├── rotary-years.module.ts                 modifié : déclare aussi le modèle Action
    └── rotary-years.service.ts                modifié : refus de supprimer une année référencée par une action
```

**Non modifiés** : `main.ts`, `config/`, `common/filters/`, `common/pipes/`, `auth/`, `health/`, les contrôleurs et le schéma des années Rotary.

**Aides et `004-members`** (arbitrage du 2026-10-02) : aucun fichier de `members/` n'est déplacé ni modifié, et les DTO des actions n'importent rien du module `members`. Ils réutilisent ce qui est déjà générique dans `common/` : la pagination (`common/dto/pagination-query.dto.ts`) et la lecture d'un label d'année (`parseRotaryYearLabel`, dans `common/utils/rotary-year.ts`). Les quelques lignes propres à la validation (retrait des espaces, contrainte « label d'année ») sont écrites dans les DTO des actions. Un seul nouvel utilitaire est créé dans `common/` : la génération de slug, générique par nature puisque les actualités s'en serviront, et prévue à cet endroit par `ARCHITECTURE.md`, section 5.

**Structure Decision** : la forme de module d'`ARCHITECTURE.md`, section 5, exactement. La génération du slug va dans `common/utils/`, emplacement prévu par l'architecture ; les actualités s'en serviront. `actions` et `rotary-years` déclarent chacun les modèles qu'ils lisent, sans s'importer, comme `members`.

## Décisions de conception

Détail et alternatives dans [research.md](./research.md). La numérotation suit les points demandés.

1. **Modèle Action** : `title`, `slug`, `summary`, `description`, `date`, `rotaryYear` (référence déclarée `SchemaTypes.ObjectId`), `focusAreas`, `impact` (sous-document sans identifiant propre), `isPublished` (faux par défaut), `publishedAt`, `order`, plus les dates techniques. Aucun champ `photos`.
2. **Slug généré** : depuis le titre, par `common/utils/slug.ts` (accents retirés, minuscules, tout ce qui n'est pas lettre ou chiffre devient un tiret, tirets de bord retirés). En cas de collision, le premier suffixe libre à partir de `-2`. L'index unique tranche les créations simultanées : la création réessaie avec le suffixe suivant. **`years` est réservé** : la génération le traite comme déjà pris et donne `years-2`, puis `years-3`.
3. **Slug fourni** : validé par sa forme, puis écrit tel quel ; l'index unique refuse un slug déjà pris, converti en `409` générique. Aucun suffixe n'est ajouté à un slug choisi par l'administrateur. Le slug `years` fourni explicitement est refusé (`400`).
4. **Stabilité du slug** : la modification n'écrit le slug que si le champ `slug` est envoyé. Le titre ne déclenche aucune régénération.
5. **Brouillon, publication, dépublication** : un seul champ, `isPublished`, modifié par `PATCH`. Aucune route dédiée.
6. **Date de première publication** : écrite au passage à « publié » seulement si elle n'existe pas encore ; jamais effacée ni réécrite. Aucune transaction, aucun verrou : la V1 repose sur l'hypothèse d'un seul administrateur.
7. **Création directement publiée** : `isPublished` est accepté à la création ; `publishedAt` prend alors l'instant de création.
8. **Listes paginées** : contrat commun (`common/dto/pagination-query.dto.ts`), 20 par défaut, 100 au plus, réponse `{ data, meta }`. La liste publique ne lit que les actions publiées.
9. **Recherches et filtres** : `q` par l'index texte sur le titre et le résumé (mot entier) ; `year` par label, converti en année ; `focusArea` ; `published` côté administration seulement. **Tri d'administration** : exactement trois champs, `date`, `title`, `createdAt`, chacun dans les deux sens, `-date` par défaut ; aucun autre critère.
10. **Année inexistante en filtre** : le service répond tout de suite une page vide (`200`), sans interroger les actions.
11. **Tri public** : les actions qui ont un ordre d'abord, par ordre croissant ; puis date décroissante ; puis identifiant, pour une pagination stable. Un tri simple placerait les actions sans ordre en tête : le tri passe par une clé calculée « a un ordre ».
12. **Ordre manuel** : entier supérieur ou égal à 1, facultatif, global, sans index unique. `null` le retire. Aucune route de réordonnancement.
13. **Impact** : sous-document facultatif. Un impact envoyé remplace l'objet entier ; `null` l'efface.
14. **Limites de l'impact** : 1 à 500 caractères par rubrique de texte ; 20 partenaires au plus, 1 à 120 caractères chacun.
15. **Impact absent** : un objet sans rubrique n'est pas enregistré ; une action sans impact n'a pas de champ `impact` dans les réponses.
16. **Année Rotary référencée** : `RotaryYearsService.remove` vérifie aussi les actions, brouillons compris ; `409` générique. Le contrôle des mandats est inchangé.
17. **Photographies** : rien. Aucun champ, aucun DTO, aucune route, aucun module `media`.
18. **Codes et messages** : `201`, `200`, `204`, `400`, `401`, `403`, `404`, `409` ; conflits génériques ; messages de validation : ceux du contrat, et aucun autre. Aucun message n'est inventé pendant l'implémentation.
19. **Protection** : `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')` sur la classe du contrôleur d'administration, dès sa création.
20. **Vérification et nettoyage** : [quickstart.md](./quickstart.md) ; toutes les actions et années de vérification sont supprimées par l'API.
21. **Lint, build, non-régression** : fin d'étape ci-dessous.

## Arbitrages du 2026-10-02

1. **Slug `years`** : réservé. Génération automatique : `years-2`, `years-3`… Fourni explicitement : `400`. Inscrit dans `ARCHITECTURE.md` par T001.
2. **Aides de `members/dto/`** : non déplacées ; `004-members` n'est pas refactoré. Les utilitaires génériques déjà présents dans `common/` sont réutilisés.
3. **Messages de validation** : ceux de la spec et du contrat ; aucun nouveau message pendant l'implémentation.
4. **Tri d'administration** : `date`, `title`, `createdAt`, dans les deux sens ; rien d'autre. Le tri public reste distinct : ordre croissant pour les actions qui en ont un, puis date décroissante, puis identifiant.
5. **Alignements d'`ARCHITECTURE.md`** : les huit sont validés ; T001 est la première tâche.
6. **Publication concurrente** : ni transaction, ni verrou, ni mécanisme spécifique.

## Prérequis manuels (porteur du projet)

1. Une base MongoDB Atlas joignable et `apps/api/.env` renseigné.
2. Le mot de passe du compte d'administration, pour les vérifications.

## Fin d'étape

- `npm run lint` et `npm run build:api` passent ; `npm run build:web` et `npm run build:admin` passent comme avant.
- Les scénarios de [quickstart.md](./quickstart.md) sont déroulés, ou explicitement signalés comme non faits.
- Aucune action ni année de vérification ne reste en base.
- Non-régression : santé, authentification, années Rotary, membres et mandats répondent comme avant.
- `PROJECT_CONTEXT.md` et la ligne d'état de `CLAUDE.md` sont mis à jour.

## Complexity Tracking

Aucune violation de la constitution à justifier.
