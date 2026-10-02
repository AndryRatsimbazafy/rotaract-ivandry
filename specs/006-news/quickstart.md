# Quickstart : vérifier les actualités

Guide de vérification manuelle structurée. Il remplace les tests automatisés (constitution, principe IX). Contrat : [contracts/news.md](./contracts/news.md). Modèle : [data-model.md](./data-model.md).

## Prérequis

- Node.js 22, dépendances installées depuis la racine (`npm install`).
- `apps/api/.env` renseigné, base MongoDB Atlas joignable.
- Le compte d'administration et son mot de passe.

Démarrage : `npm run dev:api` depuis la racine. Se connecter une fois par `POST /api/v1/auth/login` (limité à 5 demandes par minute) ; `$JETON` désigne le `accessToken` reçu, envoyé dans `Authorization: Bearer $JETON`.

Toutes les données créées ici sont des données de vérification : elles sont **supprimées à la fin** (section 8). Deux années sont créées par l'API pour l'occasion, par exemple 2026 et 2025.

## 1. Démarrage

| Action | Résultat attendu |
|---|---|
| Démarrer l'API | Démarrage normal. La collection `news` existe, vide, avec ses index, dont `slug` unique. |
| `GET /api/v1/news` et `GET /api/v1/news/archives`, sans jeton | `200` ; `data` vide. |
| `GET /api/v1/admin/news` sans jeton | `401`. |

## 2. Rédiger et gérer

Avec le jeton.

| Action | Résultat attendu |
|---|---|
| `POST /admin/news` avec `title`, `type`, `date` et `rotaryYear` (2026) | `201` ; slug généré ; `isPublished` faux ; `publishedAt`, `location`, `summary`, `content` à `null` ; `rotaryYear` avec `id` et `label` ; pas de champ `photos`. |
| Créer sans titre ; avec un titre de 121 caractères ; sans type ; sans date ; avec `date` « hier » ; sans `rotaryYear` ; avec un champ `photos` ; avec `publishedAt` ; avec `order` | `400`, détail sur le champ. |
| `type` : `"Réunion"`, `"REUNION"`, `"autre"` | `400`, détail sur `type`. |
| Chacun des cinq types exacts | `201`. |
| `rotaryYear` bien formée inexistante | `400`, détail « Cette année Rotary n'existe pas. » ; rien n'est créé. |
| Créer avec une date de 2024 et l'année 2026 | `201` ; l'année enregistrée est 2026. |
| Créer avec une date sans heure, puis avec une date et une heure | `201` ; minuit UTC pour la première, l'instant envoyé pour la seconde. |
| `location` de 121 caractères ; `summary` de 501 caractères ; `location` vide | `400`, détail sur le champ. |
| `GET /admin/news` | `200`, `data` et `meta` ; date la plus récente d'abord ; brouillons compris. |
| `?q=` un mot du titre ; `?year=2026-2027` ; `?type=reunion` ; `?published=false` | Résultats filtrés. |
| `?sort=` `date`, `-date`, `title`, `-title`, `createdAt`, `-createdAt` | Six tris acceptés. |
| `?q=a` ; `?limit=101` ; `?sort=slug` ; `?published=oui` ; `?type=x` ; `?year=2026` | `400` pour chacun. |
| `?year=2040-2041` (année inexistante) | `200`, `data` vide, `total` 0. |
| `PATCH /admin/news/:id` avec le seul lieu ; puis `"location": null` ; puis `"location": ""` | Lieu écrit ; effacé ; `400`. |
| `PATCH` avec `"summary": null` et `"content": null` | Les deux sont effacés ; le reste est inchangé. |
| `PATCH` avec `"title": null`, `"type": null`, `"date": null` | `400` pour chacun. |
| `PATCH` avec `type` et `rotaryYear` (2025) | `200` ; les deux sont modifiés. |
| `GET`, `PATCH`, `DELETE` sur `/admin/news/abc`, puis sur un identifiant inconnu | `400` « Identifiant invalide. » ; `404`. |

## 3. Slug

| Action | Résultat attendu |
|---|---|
| Créer « Réunion de rentrée à Ivandry » sans slug | Slug `reunion-de-rentree-a-ivandry`. |
| Créer une seconde, puis une troisième actualité du même titre | Slugs `…-2`, puis `…-3`. |
| Créer avec un slug fourni libre | Slug enregistré tel quel. |
| Créer, puis modifier, avec un slug déjà pris | `409` « Conflit avec une ressource existante. » ; rien n'est modifié. |
| Slug fourni avec majuscules, espace, accent, tiret en bord, 121 caractères | `400`, détail sur `slug`. |
| Modifier le titre d'une actualité sans envoyer de slug | Slug inchangé. |
| Créer avec le titre « !!! » sans slug | `400`, « Aucun slug ne peut être tiré de ce titre : fournissez-en un. ». |
| Deux créations simultanées du même titre | Deux actualités, deux slugs différents. |
| Créer une actualité intitulée « Archives » sans slug, puis une seconde | Slugs `archives-2`, puis `archives-3`. |
| Créer, puis modifier, avec le slug `archives` fourni | `400` « Ce slug est réservé. » ; rien n'est modifié. |
| Créer une action et une actualité de même titre | Les deux portent le même slug : l'unicité vaut par collection. |

## 4. Publication

| Action | Résultat attendu |
|---|---|
| `GET /api/v1/news/:slug` d'un brouillon, sans jeton | `404`. |
| `PATCH` avec `"isPublished": true` | `200` ; `publishedAt` posé. |
| `PATCH` avec `"isPublished": false`, puis de nouveau `true` | `publishedAt` identique à la première valeur. |
| Créer une actualité avec `"isPublished": true` | `201` ; `publishedAt` égal à `createdAt`. |
| `PATCH` avec `publishedAt` | `400`, « Champ non autorisé. ». |

## 5. Lecture publique

Sans jeton, avec au moins trois actualités publiées dans deux années et un brouillon dans une troisième.

| Action | Résultat attendu |
|---|---|
| `GET /api/v1/news` | Les seules actualités publiées, date la plus récente d'abord ; `meta.total` les compte. |
| Lire les champs d'une actualité | `id`, `slug`, `title`, `type`, `date`, `rotaryYear` (label), et `location`, `summary`, `content` s'ils existent. Jamais `isPublished`, `publishedAt`, `createdAt`, `updatedAt`, `photos`. |
| `?year=2026-2027` ; `?type=reunion` ; `?q=` un mot | Résultats filtrés, publiées seulement. |
| `?q=` un mot qui ne figure que dans un brouillon | Aucun résultat. |
| `?year=2040-2041` | `200`, `data` vide. |
| `?limit=1&page=2` | La deuxième actualité par date. |
| `?year=2026` ; `?type=x` ; `?published=true` ; `?sort=title` | `400` pour chacun. |
| `GET /api/v1/news/:slug` d'une actualité publiée ; d'un slug inconnu | `200` ; `404`. |
| `GET /api/v1/news/archives` | Une entrée par année qui a une actualité publiée, la plus récente d'abord ; `rotaryYear` dans la forme des années ; `count` égal au nombre de publiées ; l'année qui n'a qu'un brouillon n'y figure pas. |
| Dépublier une actualité, relire les archives | Le `count` de son année baisse de un. |
| `GET /api/v1/news/years` | `404` : ce slug n'existe pas, et aucune route « years » n'existe pour les actualités. |

## 6. Années Rotary

| Action | Résultat attendu |
|---|---|
| `DELETE /admin/rotary-years/:id` d'une année qui a une actualité en brouillon | `409` « Conflit avec une ressource existante. » ; l'année et l'actualité existent toujours. |
| Supprimer l'actualité, puis l'année | `204`, puis `204`. |
| `DELETE /admin/news/:id` | `204` ; l'année existe toujours. |

## 7. Non-régression

| Action | Résultat attendu |
|---|---|
| `GET /api/v1/health` | `200`. |
| `GET /api/v1/auth/me` sans jeton, puis avec jeton | `401`, puis `200`. |
| Années Rotary : création, doublon, valeur texte, suppression | `201`, `409` « Cette année Rotary existe déjà. », `400`, `204`. |
| Membres et mandats : créer un membre et un mandat, lire l'annuaire, tenter de supprimer l'année, puis les supprimer | Comme avant ; `409` pour l'année. |
| Actions : créer une action, la publier, la lire par son slug, tenter de supprimer l'année, puis la supprimer | Comme avant ; `409` pour l'année. |
| `GET`, `POST`, `PATCH`, `DELETE` sur `/admin/news` avec un jeton altéré | `401`. |
| En-têtes d'une réponse publique | En-têtes de sécurité présents. |

## 8. Nettoyage

| Action | Résultat attendu |
|---|---|
| Supprimer par l'API toutes les actualités, actions, membres et années créés | `GET /admin/news` : `total` 0 ; `GET /api/v1/rotary-years` : `{"data":[]}`. |
| Compter les documents en base | `news`, `actions`, `members`, `membermandates`, `rotaryyears` : 0 ; `admins` : 1. |

## 9. Contrôles de fin d'étape

| Commande (depuis la racine) | Résultat attendu |
|---|---|
| `npm run format --workspace=api` | Aucun fichier à corriger hors de la fonctionnalité. |
| `npm run lint` | Aucune erreur. |
| `npm run build:api` | Build réussi. |
| `npm run build:web` et `npm run build:admin` | Builds réussis, comme avant. |
| `git status` | Aucun fichier modifié dans `apps/web`, `apps/admin`, `DESIGN.md`, `apps/api/src/members` ni `apps/api/src/actions` ; `apps/api/.env` absent de la liste. |
