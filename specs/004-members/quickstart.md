# Quickstart : vérifier les membres et les mandats

Guide de vérification manuelle. Il remplace les tests automatisés (constitution, principe IX). Contrats : [contracts/members.md](./contracts/members.md), [contracts/mandates.md](./contracts/mandates.md). Modèle : [data-model.md](./data-model.md).

## Prérequis

- Node.js 22, dépendances installées depuis la racine (`npm install`).
- `apps/api/.env` renseigné, base MongoDB Atlas joignable.
- Le compte d'administration et son mot de passe.

Démarrage : `npm run dev:api` depuis la racine. Se connecter par `POST /api/v1/auth/login` ; `$JETON` désigne le `accessToken` reçu, envoyé dans `Authorization: Bearer $JETON`. La connexion est limitée à 5 demandes par minute : se connecter une fois et réutiliser le jeton.

Toutes les données créées ici sont des données de vérification : elles sont **supprimées à la fin** (section 9). Deux années sont créées par l'API pour l'occasion, par exemple 2026 et 2025.

## 1. Démarrage

| Action | Résultat attendu |
|---|---|
| Démarrer l'API | Démarrage normal. Les collections `members` et `membermandates` existent, vides, avec leurs index : deux index uniques sur `membermandates`. |
| `GET /api/v1/members` et `GET /api/v1/members/years`, sans jeton | `200` et `{"data":[]}`. |

## 2. Membres

| Action | Résultat attendu |
|---|---|
| `POST /admin/members` avec un prénom et un nom | `201` ; `occupation`, `email`, `phone` valent `null`. |
| Créer deux autres membres, l'un avec profession, email et téléphone | `201` ; l'email est en minuscules. |
| Créer sans nom ; avec un prénom de 121 caractères ; avec un email mal formé ; avec un téléphone de 5 chiffres ; avec un champ `portrait` | `400`, détail sur le champ en cause. |
| `GET /admin/members` | `200`, `data` et `meta` ; tri par nom ; aucun élément ne porte de mandats. |
| `GET /admin/members?q=` suivi d'un nom existant ; `?q=a` ; `?limit=101` ; `?sort=email` ; `?page=0` | Résultat filtré ; puis `400` pour chacun des quatre autres. |
| `GET /admin/members/:id` | `200`, avec `mandates` vide. |
| `PATCH /admin/members/:id` avec la seule profession ; puis avec `"phone": null` | Seul le champ envoyé change ; le téléphone est effacé. |
| `GET`, `PATCH`, `DELETE` sur `/admin/members/abc`, puis sur un identifiant bien formé inconnu | `400` « Identifiant invalide. » ; `404`. |
| Les mêmes appels sans jeton | `401` ; rien n'est lu ni modifié. |

## 3. Mandats et fonctions

| Action | Résultat attendu |
|---|---|
| `POST /admin/mandates` pour le membre 1 et l'année 2026, avec `secretaire` et `protocole` | `201`, `rotaryYear` avec `id` et `label`, `order` 1. |
| Créer les mandats des membres 2 et 3 dans 2026 | `order` 2, puis 3. |
| Recréer le mandat du membre 1 en 2026 | `409` « Conflit avec une ressource existante. » ; toujours un seul mandat. |
| Créer un mandat sans `roles` | `201`, `roles` vide. |
| `roles` avec `"Président"` ; avec `secretaire` deux fois ; avec un champ `order` | `400`, détail sur le champ. |
| `member` bien formé inexistant ; `rotaryYear` bien formée inexistante | `400`, détail sur le champ ; aucun mandat créé. |
| Donner `tresorier` à deux membres de 2026 | Accepté. |
| `PATCH /admin/mandates/:id` avec de nouvelles fonctions ; puis avec `member` | Fonctions remplacées ; puis `400` « Champ non autorisé. ». |
| `GET /admin/mandates?year=2026-2027`, puis `?member=` l'identifiant du membre 1 | Les mandats correspondants. |
| `GET /admin/members/:id` du membre 1, après lui avoir créé un mandat en 2025 | `mandates` contient les deux, 2026 d'abord. |
| `GET /admin/members?year=2026-2027&role=tresorier` | Les seuls membres qui tiennent cette fonction cette année-là. |

## 4. Ordre

| Action | Résultat attendu |
|---|---|
| `PATCH /admin/mandates/:id` du membre 1 avec `order` 2 (déjà pris) | `409` ; aucun ordre modifié. |
| Avec `order` 10 (libre) | `200`. |
| Avec `order` 0, −1, 1.5, `"2"` | `400`, détail sur `order`. |
| `PUT /admin/mandates/order` avec les trois mandats de 2026 dans un nouvel ordre | `200` ; ordres 1, 2, 3 selon la liste. |
| La même demande avec un mandat en moins ; un mandat en double ; un mandat de 2025 | `400`, détail sur `mandateIds` ; relire les mandats de 2026 : ordres inchangés. |
| Vérifier le mandat de 2025 après le réordonnancement de 2026 | Ordre inchangé. |
| Supprimer le mandat d'ordre 2, puis créer un nouveau mandat dans 2026 | Les autres gardent 1 et 3 ; le nouveau reçoit 4. |
| Réordonner 2026 | Ordres 1, 2, 3 : le trou est refermé. |

## 5. Annuaire public

Sans jeton.

| Action | Résultat attendu |
|---|---|
| `GET /api/v1/members?year=2026-2027` | Les membres de 2026, dans l'ordre fixé, chacun avec `rotaryYear` `2026-2027`, ses fonctions et son ordre. |
| Lire les champs d'un membre | Jamais `email`, `phone`, `portrait`, `createdAt`. `occupation` absent s'il n'est pas renseigné. |
| `GET /api/v1/members` sans `year` | L'annuaire de l'année courante. |
| `?limit=2` | Les deux premiers, dans l'ordre. |
| `?year=2040-2041` (année inexistante) | `200` et `{"data":[]}`. |
| `?year=2026`, `?year=2026-2028`, `?limit=0` | `400`. |
| `GET /api/v1/members/years` | Les années qui ont un mandat, la plus récente d'abord, dans la forme de la liste des années. Une année sans mandat n'y figure pas. |

## 6. Aucune année courante

| Action | Résultat attendu |
|---|---|
| Sur une base où aucune année ne contient la date du jour, `GET /api/v1/members` sans `year` | `200` et `{"data":[]}`. |

Ce cas demande de retirer l'année courante : il se vérifie pendant le nettoyage (section 9), après la suppression de ses mandats et de l'année.

## 7. Suppressions

| Action | Résultat attendu |
|---|---|
| `DELETE /admin/rotary-years/:id` de 2026, qui a des mandats | `409` « Conflit avec une ressource existante. » ; l'année et ses mandats existent toujours. |
| `DELETE /admin/mandates/:id` | `204` ; le membre et l'année existent toujours. |
| `DELETE /admin/members/:id` d'un membre qui a deux mandats | `204` ; `GET /admin/mandates?member=` son identifiant renvoie une liste vide ; les années existent toujours. |
| Supprimer les derniers mandats de 2025, puis l'année 2025 | `204` : une année sans mandat se supprime. |

## 8. Non-régression

| Action | Résultat attendu |
|---|---|
| `GET /api/v1/health`, `GET /api/v1/rotary-years`, `GET /api/v1/auth/me` avec jeton | Comme avant. |
| Création, doublon et suppression d'une année sans mandat | `201`, `409` « Cette année Rotary existe déjà. », `204`, comme avant. |
| `GET /admin/members` et `GET /admin/mandates` sans jeton, puis avec un jeton altéré | `401`. |

## 9. Nettoyage

| Action | Résultat attendu |
|---|---|
| Supprimer par l'API tous les membres créés, puis les années créées | `GET /admin/members` : `total` 0 ; `GET /admin/mandates` : liste vide ; `GET /api/v1/rotary-years` : `{"data":[]}`. |

## 10. Contrôles de fin d'étape

| Commande (depuis la racine) | Résultat attendu |
|---|---|
| `npm run lint` | Aucune erreur. |
| `npm run build:api` | Build réussi. |
| `npm run build:web` et `npm run build:admin` | Builds réussis, comme avant. |
| `git status` | Aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md` ; `apps/api/.env` absent de la liste. |
