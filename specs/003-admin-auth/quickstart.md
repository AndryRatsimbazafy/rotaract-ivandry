# Quickstart : vérifier l'authentification

Guide de vérification manuelle. Il remplace les tests automatisés (constitution, principe IX). Contrats : [contracts/auth.md](./contracts/auth.md), [contracts/seed-admin.md](./contracts/seed-admin.md), `specs/002-rotary-years/contracts/rotary-years.md`. Modèle : [data-model.md](./data-model.md).

## Prérequis

- Node.js 22, dépendances installées depuis la racine (`npm install`).
- `apps/api/.env` renseigné, avec `JWT_EXPIRES_IN` à `8h` ou moins (ou absente), et base MongoDB Atlas joignable.
- Un email et un mot de passe choisis par le porteur du projet pour le compte. `ADMIN_EMAIL` et `ADMIN_PASSWORD` ne sont placés dans `apps/api/.env` que pour la section 2, puis retirés.

Démarrage : `npm run dev:api` depuis la racine. L'API écoute sur `http://localhost:4000`. Dans les commandes, `$JETON` désigne le `accessToken` reçu à la connexion.

## 1. Règle de JWT_EXPIRES_IN

| Action | Résultat attendu |
|---|---|
| `JWT_EXPIRES_IN=1d`, démarrer | L'API s'arrête ; le message nomme `JWT_EXPIRES_IN`, sans sa valeur. |
| `9h`, `481m`, `0s`, démarrer | Idem pour chacune. |
| `8h`, `480m`, `60s`, `1s`, ou variable absente, démarrer | L'API démarre. |

## 2. Commande d'initialisation

| Action | Résultat attendu |
|---|---|
| Lancer sans `ADMIN_EMAIL` ou sans `ADMIN_PASSWORD` dans `apps/api/.env` | Échec ; le message nomme la variable ; aucun compte. |
| Lancer avec un mot de passe de 11 caractères | Échec ; le message nomme `ADMIN_PASSWORD`, sans sa valeur. |
| Lancer avec un email valide et un mot de passe de 12 caractères au moins | « Compte d'administration créé. » En base : un document dans `admins`, email en minuscules, `passwordHash` illisible, `role` `ADMIN`. |
| Relancer avec le même email et un autre mot de passe | « Mot de passe … mis à jour. » Toujours un seul document. |
| Relancer avec un autre email | Refus ; le compte est inchangé ; l'email existant n'est pas affiché. |
| Relire tout ce que la commande a affiché | Ni mot de passe, ni hachage, ni adresse de la base. |
| **Retirer `ADMIN_EMAIL` et `ADMIN_PASSWORD` de `apps/api/.env`**, puis démarrer l'API | Démarrage normal. Toute la suite se fait sans ces deux variables. |

## 3. Connexion

| Action | Résultat attendu |
|---|---|
| `POST /api/v1/auth/login` avec les bons identifiants | `200` : `accessToken`, `tokenType` `Bearer`, `expiresIn` (28800 pour `8h`), `admin` avec `id`, `email`, `role`. Aucun élément du mot de passe. |
| Même demande, email en majuscules avec des espaces autour | `200`. |
| Mot de passe faux | `401` « Email ou mot de passe incorrect. ». |
| Email inconnu | `401`, corps identique au précédent. |
| Email présent mais mal formé (`pas-un-email`) | `401`, même corps : aucun contrôle de format. |
| Corps sans `email` | `400`, détail « L'email est obligatoire. ». |
| Corps sans `password` | `400`, détail « Le mot de passe est obligatoire. ». |
| Corps avec un champ en trop | `400`, détail « Champ non autorisé. ». |
| Lire le journal de l'API | Ni mot de passe, ni jeton, ni hachage. |

## 4. Protection

| Action | Résultat attendu |
|---|---|
| `GET /api/v1/auth/me` avec `Authorization: Bearer $JETON` | `200` : `id`, `email`, `role`. |
| Même appel sans en-tête, avec `Bearer abc`, avec le jeton altéré d'un caractère | `401` « Authentification requise. », corps identique dans les trois cas. |
| `GET /api/v1/admin/rotary-years` sans jeton | `401`. |
| `JWT_EXPIRES_IN=2s`, redémarrer, se connecter, attendre 3 secondes, appeler `/auth/me` | `401` : le jeton a expiré. Remettre ensuite la valeur d'origine. |
| Se connecter, changer le mot de passe par la commande (en replaçant temporairement les deux variables dans `apps/api/.env`, puis en les retirant), réutiliser l'ancien jeton | `200` : il reste valable jusqu'à son expiration. L'ancien mot de passe, lui, ne permet plus de se connecter. |
| `GET /api/v1/health` et `GET /api/v1/rotary-years` sans jeton | Comme avant. |

Le `403` (jeton valide, rôle insuffisant) n'a pas de scénario métier naturel avec l'unique rôle `ADMIN`. La distinction `401` / `403` est vérifiée structurellement, par relecture des deux gardes.

## 5. Années Rotary, administration

Avec `Authorization: Bearer $JETON`.

| Action | Résultat attendu |
|---|---|
| `POST /api/v1/admin/rotary-years` avec `{"startYear":2026}` | `201`, année avec label et dates. |
| Même demande une seconde fois | `409` « Cette année Rotary existe déjà. ». |
| `{"startYear":"2026"}`, `{"startYear":2026.5}`, `{"startYear":1999}`, `{"startYear":2101}`, `{}` | `400`, détail sur `startYear`. |
| `{"startYear":2027,"label":"x"}` | `400`, détail « Champ non autorisé. ». |
| `GET /api/v1/admin/rotary-years` | `200`, même forme que la liste publique. |
| `GET /api/v1/rotary-years`, sans jeton | L'année créée y apparaît. |
| `DELETE /api/v1/admin/rotary-years/abc` | `400` « Identifiant invalide. ». |
| `DELETE` avec un identifiant bien formé inconnu | `404`. |
| `DELETE` avec l'identifiant de l'année créée | `204`, sans corps ; l'année disparaît des deux listes. |
| Les mêmes `POST` et `DELETE` sans jeton | `401` ; rien n'est créé ni supprimé. |

## 6. Limitation des tentatives

| Action | Résultat attendu |
|---|---|
| Six `POST /api/v1/auth/login` en moins d'une minute | Les cinq premières sont traitées ; la sixième répond `429` « Trop de requêtes. Réessayez plus tard. ». |
| Pendant le blocage, `GET /api/v1/health` et `GET /api/v1/auth/me` | Réponses normales : seule la connexion est limitée. |
| Attendre une minute, se reconnecter | Traitée normalement. |

## 7. Nettoyage

| Action | Résultat attendu |
|---|---|
| Supprimer par l'API les années créées pour la vérification | `GET /api/v1/rotary-years` renvoie `{"data":[]}`. |
| Vérifier que `ADMIN_EMAIL` et `ADMIN_PASSWORD` ne sont plus dans `apps/api/.env` | Aucune des deux n'y figure. |

Le compte d'administration reste : c'est celui du porteur du projet.

## 8. Contrôles de fin d'étape

| Commande (depuis la racine) | Résultat attendu |
|---|---|
| `npm run lint` | Aucune erreur. |
| `npm run build:api` | Build réussi. |
| `npm run build:web` et `npm run build:admin` | Builds réussis, comme avant. |
| `git status` | Aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md` ; `apps/api/.env` absent de la liste. |
| Rechercher le mot de passe du compte, `JWT_SECRET` et le mot de passe de la base dans les fichiers suivis par Git | Aucun résultat. |
