# Research: Actualités (News)

Phase 0 du plan. Chaque décision répond à une exigence de la [spec](./spec.md) et reste dans le cadre d'`ARCHITECTURE.md`. Aucune inconnue technique ne subsiste ; les points soumis au porteur du projet ont été validés le 2026-10-02.

## 1. Modèle News

- **Decision** : schéma Mongoose `News`, option `timestamps`, collection `news`. Champs : `title`, `slug`, `type`, `date`, `rotaryYear` (référence, type `SchemaTypes.ObjectId`), `location`, `summary`, `content`, `isPublished` (faux par défaut), `publishedAt`.
- **Rationale** : `ARCHITECTURE.md`, section 1.5 ; FR-001 à FR-006a. Le type de référence est celui dont `004-members` a montré la nécessité.
- **Nom de la collection** : `ARCHITECTURE.md`, section 3, la nomme `news`. Mongoose met les noms de modèle au pluriel ; « news » étant un nom sans pluriel, le nom de collection est fixé explicitement dans le schéma pour ne pas dépendre de cette règle.
- **Ce qui n'existe pas** : `photos`, impact, domaines, ordre, mise en avant, heure séparée, date de fin (clarifications Q1 et Q11, FR-006a).

## 2. Index

- **Decision** : ceux d'`ARCHITECTURE.md`, section 3 : `slug` unique ; `(isPublished, date)` ; `(rotaryYear, isPublished)` ; `type` ; texte sur `title`, `summary`, sans racinisation.
- **Rationale** : FR-007 demande une unicité qui tienne pour des écritures simultanées. `(isPublished, date)` sert la liste publique ; `(rotaryYear, isPublished)` sert le filtre par année et les archives.
- **Portée de l'unicité** : l'index porte sur la collection `news` ; une action et une actualité peuvent partager un slug.

## 3. Types

- **Decision** : énumération `NewsType` dans `common/enums/news-type.enum.ts`, cinq valeurs exactes, utilisée par les DTO et par le schéma.
- **Rationale** : FR-003 ; emplacement prévu par `ARCHITECTURE.md`, section 5. Les libellés restent au Front Office.

## 4. Slug

- **Decision** : réutiliser `slugify` et `withSlugSuffix` de `common/utils/slug.ts`. Dans le service : slug généré → base si elle est libre et n'est pas `archives`, sinon premier suffixe libre à partir de `-2` ; nouvelle tentative, cinq fois au plus, si l'index unique refuse l'écriture. Slug fourni → `archives` refusé (`400`, « Ce slug est réservé. »), sinon écrit tel quel ; clé dupliquée → `409` générique. À la modification, le slug n'est écrit que s'il est envoyé.
- **Rationale** : FR-007 à FR-011a ; clarifications Q3 et Q9. `/news/archives` et `/news/:slug` sont au même niveau d'adresse, comme `years` pour les actions.
- **Duplication avec `actions`** (validée le 2026-10-02) : cette logique de service existe déjà dans `actions.service.ts`. Elle est réécrite dans `news.service.ts`, avec son propre slug réservé, sans toucher à `005`. La regrouper dans `common/` demanderait de modifier le service des actions.

## 5. Publication

- **Decision** : `isPublished` accepté à la création et à la modification. Quand il passe à vrai et que `publishedAt` n'existe pas, `publishedAt` reçoit l'instant courant ; à la création publiée, cet instant est aussi écrit dans `createdAt`. `publishedAt` n'est jamais accepté en entrée.
- **Rationale** : FR-012 à FR-014b ; clarification Q2. Écrire le même instant dans les deux champs est la correction apportée aux actions pendant `005` : prises séparément, les deux dates différaient d'une centaine de millisecondes.
- **Concurrence** : ni transaction ni verrou ; hypothèse d'un seul administrateur, comme pour les actions.

## 6. Année Rotary

- **Decision** : `rotaryYear` est un identifiant bien formé (sinon `400` de validation, « Identifiant d'année Rotary invalide. ») d'une année existante (sinon `400`, « Cette année Rotary n'existe pas. »). Il est enregistré tel quel, sans comparaison avec la date.
- **Rationale** : FR-004 ; décision 13 de l'architecture. Les deux messages existent depuis `004` et `005`.

## 7. Champs facultatifs

- **Decision** : `location` (1 à 120 caractères), `summary` (1 à 500), `content` (1 à 20 000), espaces de début et de fin retirés. À la création, absents ou `null`, ils ne sont pas enregistrés. À la modification : absent → inchangé ; `null` → effacé ; `""` → `400`.
- **Rationale** : FR-002, FR-002a, FR-018 ; clarifications Q6 et Q10.

## 8. Date

- **Decision** : `date` est une chaîne ISO 8601 convertie en date, comme pour les actions. Une date sans heure vaut minuit UTC. Aucun autre champ temporel.
- **Rationale** : FR-002b ; clarification Q11.

## 9. Listes, recherche, filtres, tri

- **Decision** : pagination commune de `common/dto/pagination-query.dto.ts`. Liste publique : `q`, `year`, `type` ; tri par date décroissante, puis identifiant. Liste d'administration : les mêmes filtres, plus `published` (`true` ou `false`) et `sort` parmi exactement `date`, `-date`, `title`, `-title`, `createdAt`, `-createdAt`, défaut `-date`. Un label d'année inexistant répond une page vide sans lire les actualités ; un label mal formé, `400`.
- **Rationale** : FR-016, FR-016a, FR-019, FR-023 ; clarifications Q5 et Q8 ; `ARCHITECTURE.md`, section 9.
- **Pas d'agrégation pour la liste publique** : contrairement aux actions, il n'y a pas d'ordre manuel ; un tri simple suffit.

## 10. Archives

- **Decision** : `GET /news/archives` regroupe les actualités **publiées** par année Rotary et compte chaque groupe, puis lit les années concernées. Réponse : `{ "data": [ { "rotaryYear": { id, startYear, label, startDate, endDate, isCurrent }, "count": n } ] }`, de l'année la plus récente à la plus ancienne. Une année sans actualité publiée n'y figure pas.
- **Rationale** : FR-021 ; clarification Q4. La forme de l'année est celle de `specs/002-rotary-years/contracts/rotary-years.md`.
- **Pas de route `/news/years`** : `ARCHITECTURE.md`, section 6, ne prévoit que les archives pour les actualités.

## 11. Formes de sortie

- **Decision** : deux formes construites explicitement. Administration : tous les champs, `rotaryYear` en `{ id, label }`, `location`, `summary`, `content` et `publishedAt` à `null` quand ils sont absents. Publique : `id`, `slug`, `title`, `type`, `date`, `rotaryYear` (label), et `location`, `summary`, `content` s'ils existent ; jamais `isPublished`, `publishedAt`, `createdAt`, `updatedAt`.
- **Rationale** : FR-017, FR-022 ; exemple de la section 13 de l'architecture, sans `photos`.

## 12. Suppression d'une année Rotary

- **Decision** : `RotaryYearsService.remove` ajoute le contrôle des actualités à ceux des mandats et des actions ; le module `rotary-years` déclare le modèle `News`. `409` générique.
- **Rationale** : FR-025 ; `PROJECT_CONTEXT.md` désigne cet endroit.
- **Limite connue, acceptée depuis `004`** : la vérification et la suppression sont deux opérations, sans transaction.

## 13. Messages

- **Decision** : les messages communs aux actions sont repris à l'identique (titre, slug, résumé, date, année, état de publication, recherche, label d'année, tri, pagination, slug réservé, titre sans slug). Quatre textes n'avaient pas d'équivalent : type (champ), type (filtre), lieu, contenu ; ils sont dans le contrat, validés le 2026-10-02.
- **Rationale** : FR-028 ; consigne de ne pas inventer de message différent pour une règle commune.

## 14. Aides de validation

- **Decision** (validée le 2026-10-02) : le retrait des espaces et la contrainte « label d'année » sont réécrits dans `news/dto/`, comme ils l'ont été dans `actions/dto/`. Aucun fichier de `members/` ni d'`actions/` n'est modifié, et `news/` n'importe rien de ces modules.
- **Rationale** : arbitrage rendu pour `005` (« ne pas refactorer 004 »). `PROJECT_CONTEXT.md` note cette duplication et propose de la regrouper dans `common/` ; ce regroupement toucherait deux fonctionnalités validées et reste une décision du porteur du projet.

## 15. Dépendances

- **Decision** : aucune installation.
