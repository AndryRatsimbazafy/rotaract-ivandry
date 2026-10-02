# Research: Actions

Phase 0 du plan. Chaque décision répond à une exigence de la [spec](./spec.md) et reste dans le cadre d'`ARCHITECTURE.md`. Aucune inconnue technique ne subsiste ; les points soumis au porteur du projet ont été arbitrés le 2026-10-02.

## 1. Modèle Action

- **Decision** : schéma Mongoose `Action`, option `timestamps`, collection `actions`. Champs : `title`, `slug`, `summary`, `description`, `date`, `rotaryYear` (référence, type `SchemaTypes.ObjectId`), `focusAreas` (tableau de valeurs de `FocusArea`, vide par défaut), `impact` (sous-document sans identifiant), `isPublished` (faux par défaut), `publishedAt`, `order`.
- **Rationale** : `ARCHITECTURE.md`, section 1.4 ; FR-001 à FR-005. Le type de référence est celui constaté nécessaire pendant `004-members` : avec `Types.ObjectId`, l'identifiant serait enregistré en texte.
- **Pas de champ `photos`** : clarification Q1. Le socle refuse déjà tout champ non prévu.
- **Alternatives considered** : un champ `photos` vide en attendant, écarté par la décision du porteur du projet.

## 2. Index

- **Decision** : ceux d'`ARCHITECTURE.md`, section 3 : `slug` unique ; `(isPublished, date)` ; `(rotaryYear, isPublished)` ; `focusAreas` ; texte sur `title`, `summary`.
- **Rationale** : FR-006 demande une unicité qui tienne pour des écritures simultanées : seule la base l'assure. Les autres servent aux listes et aux filtres.
- **Index texte** : sans racinisation ni mots vides, comme pour les membres. L'architecture demande une recherche « mot entier, sans tolérance ».
- **Pas d'index sur `order`** : il est facultatif, non unique, et porte sur quelques actions.

## 3. Génération du slug

- **Decision** : une fonction pure dans `common/utils/slug.ts` : décomposer les caractères accentués et retirer les accents, passer en minuscules, remplacer toute suite de caractères autres que lettres et chiffres par un tiret, retirer les tirets de début et de fin. Le résultat respecte `^[a-z0-9]+(-[a-z0-9]+)*$` ou est vide.
- **Titre sans slug possible** : résultat vide → `400` avec le détail sur `slug` (FR-030a).
- **Longueur** : le titre fait 120 caractères au plus, donc le slug aussi. Quand un suffixe est ajouté, la base est raccourcie pour que l'ensemble tienne en 120 caractères.
- **Rationale** : FR-007 ; règle de la section 8. `ARCHITECTURE.md`, section 5, prévoit `common/utils/` pour le slug ; les actualités réutiliseront la fonction.
- **Alternatives considered** : une bibliothèque de génération de slug, écartée : une dépendance pour une dizaine de lignes.

## 4. Collision d'un slug généré

- **Decision** : lire les slugs existants qui valent la base ou la base suivie d'un suffixe numérique ; prendre la base si elle est libre, sinon le premier suffixe libre à partir de `-2`. Écrire. Si l'index unique refuse (deux créations simultanées), recommencer, cinq fois au plus.
- **Rationale** : FR-006, FR-007. La lecture préalable donne le bon suffixe dans le cas courant ; l'index couvre la concurrence.
- **Alternatives considered** : essayer `-2`, `-3`… en écrivant à chaque fois, écarté : une écriture ratée par suffixe déjà pris.

## 5. Slug fourni par l'administrateur

- **Decision** : validé par le DTO (forme et 120 caractères), écrit tel quel. Une clé dupliquée donne le `409` générique. Aucun suffixe n'est ajouté : l'administrateur a choisi cette adresse.
- **Rationale** : FR-008 ; « un slug saisi déjà pris répond `409` » (section 8).

## 6. Slug réservé

- **Decision** (validée le 2026-10-02) : `years` est réservé. La génération automatique le traite comme déjà pris et applique le mécanisme de suffixe (`years-2`, puis `years-3`) ; fourni explicitement par l'administrateur, il est refusé (`400`), à la création comme à la modification.
- **Rationale** : `/actions/years` et `/actions/:slug` sont au même niveau d'adresse ; le contrôleur déclare `years` avant `:slug`, donc une action de slug `years` serait publiée mais illisible par son détail. Ni la spec ni l'architecture ne le prévoient.
- **Alternatives considered** : ne rien faire et accepter le cas, écarté car il crée une action publiée sans adresse.

## 7. Stabilité du slug

- **Decision** : à la modification, `slug` n'est écrit que s'il est envoyé. Aucune régénération depuis le titre.
- **Rationale** : FR-009 ; « modifier le titre ne régénère pas le slug » (section 8).

## 8. Publication

- **Decision** : `isPublished` est accepté à la création et à la modification. Quand il passe à vrai et que `publishedAt` n'existe pas, `publishedAt` reçoit l'instant courant. Dans tous les autres cas, `publishedAt` n'est pas touché ; il n'est jamais accepté en entrée.
- **Rationale** : FR-010, FR-011, FR-019a.
- **Écriture** : le service lit l'action, puis écrit les champs modifiés. Deux publications simultanées de la même action poseraient deux dates quasi identiques. Décision du 2026-10-02 : ni transaction, ni verrou, ni mécanisme spécifique ; la V1 repose sur l'hypothèse d'un seul administrateur.

## 9. Année Rotary

- **Decision** : `rotaryYear` est un identifiant bien formé (sinon `400` de validation) d'une année existante (sinon `400` avec le détail sur le champ, « Cette année Rotary n'existe pas. », message déjà validé pour les mandats). Il est enregistré tel quel, sans comparaison avec la date.
- **Rationale** : FR-003 ; décision 13.

## 10. Domaines d'action

- **Decision** : une énumération `FocusArea` dans `common/enums/focus-area.enum.ts`, sept valeurs exactes, utilisée par les DTO (« valeur de la liste », « sans doublon ») et par le schéma.
- **Rationale** : FR-004 ; section 1.4. Les libellés restent au Front Office.

## 11. Impact

- **Decision** : sous-document facultatif à six rubriques. Validation imbriquée : chaque rubrique de texte, 1 à 500 caractères ; `partners`, 20 éléments au plus, 1 à 120 caractères chacun. À l'écriture : un objet sans rubrique équivaut à l'absence d'impact ; un objet avec rubriques remplace l'impact entier ; `null` l'efface.
- **Sortie** : le champ `impact` est omis quand il n'existe pas ou n'a aucune rubrique ; seules les rubriques présentes sont renvoyées.
- **Rationale** : FR-013 à FR-015a ; décision 12.

## 12. Ordre manuel

- **Decision** : `order` facultatif, entier supérieur ou égal à 1, sans index unique. `null` le retire. Aucune route de réordonnancement, aucune transaction.
- **Rationale** : FR-001a, clarification Q2.

## 13. Tri public

- **Decision** : la liste publique est lue par une agrégation : filtre (publiées, plus recherche et filtres), clé calculée « a un ordre », tri sur cette clé, puis `order` croissant, puis `date` décroissante, puis identifiant, puis saut et limite.
- **Rationale** : FR-021. Un tri simple sur `order` croissant place en tête les documents sans ordre, à l'inverse de la règle. L'identifiant en dernier critère rend la pagination stable quand deux actions ont le même ordre et la même date.
- **Alternatives considered** : enregistrer une très grande valeur à la place d'un ordre absent, écarté : une donnée fabriquée serait stockée ; trier en mémoire, écarté : incompatible avec la pagination.

## 14. Listes, recherche, filtres

- **Decision** : pagination commune de `common/dto/pagination-query.dto.ts`. Liste publique : `q`, `year`, `focusArea`. Liste d'administration : les mêmes, plus `published` (`true` ou `false`) et `sort`. Un label d'année inexistant répond une page vide sans lire les actions ; un label mal formé, `400`.
- **Tri d'administration** (validé le 2026-10-02) : exactement trois champs, `date`, `title`, `createdAt`, chacun dans les deux sens ; `-date` par défaut. Aucun autre critère.
- **Rationale** : FR-017, FR-020, FR-025 ; section 9.

## 15. Formes de sortie

- **Decision** : deux formes construites explicitement. Administration : tous les champs, `rotaryYear` en `{ id, label }`, `summary`, `description`, `publishedAt` et `order` à `null` quand ils sont absents, `impact` omis s'il est absent. Publique : `id`, `slug`, `title`, `summary`, `description`, `date`, `rotaryYear` (label), `focusAreas`, `impact` s'il existe ; jamais `isPublished`, `publishedAt`, `order`, `createdAt`, `updatedAt`.
- **Rationale** : FR-018, FR-024 ; exemple de la section 13. Le contrôleur public ne peut pas renvoyer la forme d'administration.

## 16. Détail public et années

- **Decision** : `GET /actions/:slug` cherche une action publiée de ce slug ; sinon `404`. `GET /actions/years` : les années distinctes référencées par les actions publiées, dans la forme et le tri de la liste des années. Le contrôleur déclare `years` avant `:slug`.
- **Rationale** : FR-022, FR-023.

## 17. Suppression d'une année Rotary

- **Decision** : `RotaryYearsService.remove` ajoute un contrôle des actions à celui des mandats ; le module `rotary-years` déclare le modèle `Action`. `409` générique.
- **Rationale** : FR-027 ; `PROJECT_CONTEXT.md` désigne cet endroit pour chaque nouvelle référence.
- **Limite connue, acceptée comme pour `004`** : la vérification et la suppression sont deux opérations, sans transaction.

## 18. Aides partagées

- **Decision** (arbitrage du 2026-10-02) : aucun fichier de `members/dto/` n'est déplacé ni modifié, et `actions` n'importe rien du module `members`. Sont réutilisés, parce qu'ils sont déjà dans `common/` et génériques : la pagination et la lecture d'un label d'année (`parseRotaryYearLabel`). Le retrait des espaces et la contrainte de validation « label d'année » tiennent en quelques lignes et sont écrits dans les DTO des actions.
- **Seul nouvel utilitaire dans `common/`** : la génération de slug, que les actualités utiliseront aussi et que l'architecture place à cet endroit.
- **Rationale** : pas de refactor de `004-members` pour les besoins des actions ; pas de couplage entre modules de ressources.

## 19. Dépendances

- **Decision** : aucune installation.
