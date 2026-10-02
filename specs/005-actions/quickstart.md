# Quickstart : vérifier les actions

Guide de vérification manuelle. Il remplace les tests automatisés (constitution, principe IX). Contrat : [contracts/actions.md](./contracts/actions.md). Modèle : [data-model.md](./data-model.md).

## Prérequis

- Node.js 22, dépendances installées depuis la racine (`npm install`).
- `apps/api/.env` renseigné, base MongoDB Atlas joignable.
- Le compte d'administration et son mot de passe.

Démarrage : `npm run dev:api` depuis la racine. Se connecter une fois par `POST /api/v1/auth/login` (limité à 5 demandes par minute) ; `$JETON` désigne le `accessToken` reçu, envoyé dans `Authorization: Bearer $JETON`.

Toutes les données créées ici sont des données de vérification : elles sont **supprimées à la fin** (section 9). Deux années sont créées par l'API pour l'occasion, par exemple 2026 et 2025.

## 1. Démarrage

| Action | Résultat attendu |
|---|---|
| Démarrer l'API | Démarrage normal. La collection `actions` existe, vide, avec ses index, dont `slug` unique. |
| `GET /api/v1/actions` et `GET /api/v1/actions/years`, sans jeton | `200` ; `data` vide. |
| `GET /api/v1/admin/actions` sans jeton | `401`. |

## 2. Rédiger et gérer

Avec le jeton.

| Action | Résultat attendu |
|---|---|
| `POST /admin/actions` avec `title`, `date` et `rotaryYear` (2026) | `201` ; slug généré ; `isPublished` faux ; `publishedAt`, `summary`, `description`, `order` à `null` ; `rotaryYear` avec `id` et `label` ; pas de champ `impact` ni `photos`. |
| Créer sans titre ; avec un titre de 121 caractères ; sans date ; avec `date` « hier » ; sans `rotaryYear` ; avec un champ `photos` ; avec `publishedAt` | `400`, détail sur le champ. |
| `rotaryYear` bien formée inexistante | `400`, détail « Cette année Rotary n'existe pas. » ; rien n'est créé. |
| Créer avec une date de 2024 et l'année 2026 | `201` ; l'année enregistrée est 2026. |
| `focusAreas` avec `"Eau"` ; avec `eau` deux fois | `400`, détail sur `focusAreas`. |
| `GET /admin/actions` | `200`, `data` et `meta` ; date la plus récente d'abord ; brouillons compris. |
| `?q=` un mot du titre ; `?year=2026-2027` ; `?focusArea=eau` ; `?published=false` | Résultats filtrés. |
| `?sort=` `date`, `-date`, `title`, `-title`, `createdAt`, `-createdAt` | Six tris acceptés ; sans `sort`, date la plus récente d'abord. |
| `?q=a` ; `?limit=101` ; `?sort=slug` ; `?published=oui` ; `?focusArea=x` ; `?year=2026` | `400` pour chacun. |
| `?year=2040-2041` (année inexistante) | `200`, `data` vide, `total` 0. |
| `PATCH /admin/actions/:id` avec le seul résumé ; puis `"summary": null` ; puis `"summary": ""` | Résumé écrit ; effacé ; `400`. |
| `PATCH` avec `rotaryYear` (2025) | `200` ; l'année est modifiée. |
| `GET`, `PATCH`, `DELETE` sur `/admin/actions/abc`, puis sur un identifiant inconnu | `400` « Identifiant invalide. » ; `404`. |

## 3. Slug

| Action | Résultat attendu |
|---|---|
| Créer « Journée de l'eau à Ivandry » sans slug | Slug `journee-de-l-eau-a-ivandry`. |
| Créer une seconde, puis une troisième action du même titre | Slugs `…-2`, puis `…-3`. |
| Créer avec un slug fourni libre | Slug enregistré tel quel. |
| Créer, puis modifier, avec un slug déjà pris | `409` « Conflit avec une ressource existante. » ; rien n'est modifié. |
| Slug fourni avec majuscules, espace, accent, tiret en bord, 121 caractères | `400`, détail sur `slug`. |
| Modifier le titre d'une action sans envoyer de slug | Slug inchangé. |
| Créer avec le titre « !!! » sans slug | `400`, détail sur `slug`. |
| Deux créations simultanées du même titre | Deux actions, deux slugs différents. |
| Créer une action intitulée « Years » sans slug, puis une seconde | Slugs `years-2`, puis `years-3`. |
| Créer, puis modifier, avec le slug `years` fourni | `400`, détail sur `slug` ; rien n'est modifié. |

## 4. Publication

| Action | Résultat attendu |
|---|---|
| `GET /api/v1/actions/:slug` d'un brouillon, sans jeton | `404`. |
| `PATCH` avec `"isPublished": true` | `200` ; `publishedAt` posé. |
| `PATCH` avec `"isPublished": false`, puis de nouveau `true` | `publishedAt` identique à la première valeur. |
| Créer une action avec `"isPublished": true` | `201` ; `publishedAt` posé. |

## 5. Lecture publique

Sans jeton, avec au moins trois actions publiées et un brouillon.

| Action | Résultat attendu |
|---|---|
| `GET /api/v1/actions` | Les seules actions publiées ; `meta.total` les compte. |
| Lire les champs d'une action | `id`, `slug`, `title`, `summary`, `description`, `date`, `rotaryYear` (label), `focusAreas`, `impact` s'il existe. Jamais `isPublished`, `publishedAt`, `order`, `createdAt`, `updatedAt`, `photos`. |
| Donner l'ordre 2 à une action ancienne et l'ordre 1 à une autre | Elles viennent en tête, dans cet ordre ; les autres suivent par date décroissante. |
| Donner le même ordre à deux actions | Acceptée ; la plus récente d'abord. |
| `?year=2026-2027` ; `?focusArea=eau` ; `?q=` un mot | Résultats filtrés, publiées seulement. |
| `?year=2040-2041` | `200`, `data` vide. |
| `?limit=1&page=2` | La deuxième action de l'ordre attendu. |
| `GET /api/v1/actions/:slug` d'une action publiée ; d'un slug inconnu | `200` ; `404`. |
| `GET /api/v1/actions/years` | Les années qui ont une action publiée ; pas celle qui n'a qu'un brouillon. |

## 6. Impact

| Action | Résultat attendu |
|---|---|
| Créer une action sans impact | Pas de champ `impact`. |
| `PATCH` avec `impact` : objectif et bénéficiaires | Seules ces deux rubriques apparaissent. |
| `PATCH` avec `impact` : lieu seulement | L'impact ne contient plus que le lieu. |
| `PATCH` avec `"impact": {}` ; puis `"impact": null` | Pas de champ `impact` dans les deux cas. |
| Rubrique vide ; rubrique de 501 caractères ; 21 partenaires ; partenaire de 121 caractères ; rubrique inconnue | `400`, détail sur la rubrique. |

## 7. Ordre

| Action | Résultat attendu |
|---|---|
| `order` 0, −1, 1.5, `"2"` | `400`, détail sur `order`. |
| `"order": null` | L'ordre est retiré. |
| `PUT /api/v1/admin/actions/order` | `404` : aucune route de réordonnancement. |

## 8. Années Rotary et non-régression

| Action | Résultat attendu |
|---|---|
| `DELETE /admin/rotary-years/:id` d'une année qui a une action en brouillon | `409` « Conflit avec une ressource existante. » ; l'année et l'action existent toujours. |
| Supprimer l'action, puis l'année | `204`, puis `204`. |
| `DELETE /admin/actions/:id` | `204` ; l'année existe toujours. |
| `GET /api/v1/health`, `GET /api/v1/rotary-years`, `GET /api/v1/members`, `GET /api/v1/auth/me` avec jeton | Comme avant. |
| Créer un membre et un mandat, tenter de supprimer l'année, puis les supprimer | `409` pour l'année ; comportement de `004` inchangé. |
| `GET /admin/actions` avec un jeton altéré | `401`. |

## 9. Nettoyage

| Action | Résultat attendu |
|---|---|
| Supprimer par l'API toutes les actions, tous les membres et toutes les années créés | `GET /admin/actions` : `total` 0 ; `GET /api/v1/rotary-years` : `{"data":[]}`. |

## 10. Contrôles de fin d'étape

| Commande (depuis la racine) | Résultat attendu |
|---|---|
| `npm run lint` | Aucune erreur. |
| `npm run build:api` | Build réussi. |
| `npm run build:web` et `npm run build:admin` | Builds réussis, comme avant. |
| `git status` | Aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md` ; `apps/api/.env` absent de la liste. |
