# Quickstart : vérifier le socle de l'API

Guide de vérification manuelle. Il remplace les tests automatisés (constitution, principe IX). Contrats : [contracts/health.md](./contracts/health.md), [contracts/errors.md](./contracts/errors.md). Variables : [data-model.md](./data-model.md).

## Prérequis

- Node.js 22, dépendances installées depuis la racine (`npm install`).
- Un cluster MongoDB Atlas Free, un utilisateur de base, l'adresse IP du poste autorisée (opération manuelle du porteur du projet).
- `apps/api/.env`, copié depuis `apps/api/.env.example`, avec `MONGODB_URI` et `JWT_SECRET` renseignés.

Démarrage : `npm run dev:api` depuis la racine. Dans les commandes ci-dessous, l'API écoute sur `http://localhost:4000`.

## 1. Configuration vérifiée au démarrage (récit 1)

| Action | Résultat attendu |
|---|---|
| Retirer `MONGODB_URI` de `.env`, démarrer | L'API s'arrête ; le message nomme `MONGODB_URI`. |
| Retirer `JWT_SECRET`, démarrer | L'API s'arrête ; le message nomme `JWT_SECRET`. |
| Mettre un `JWT_SECRET` de 10 caractères, démarrer | L'API s'arrête ; le message nomme `JWT_SECRET`. |
| Retirer les deux, démarrer | Le message nomme les deux variables. |
| Mettre `PORT=abc`, démarrer | L'API s'arrête ; le message nomme `PORT`. |
| Tout renseigner, sans `PORT`, démarrer | L'API écoute sur 4000. |
| Mettre `PORT=4100`, démarrer | L'API écoute sur 4100. |

Dans aucun de ces cas une valeur de variable n'apparaît à l'écran.

## 2. Connexion à la base (récit 2)

| Action | Résultat attendu |
|---|---|
| Démarrer avec une adresse valide | Le journal indique que la connexion à la base est établie. |
| `curl -i http://localhost:4000/api/v1/health` | `200` et `{"status":"ok","database":"up"}`. |
| Démarrer avec un mot de passe de base faux | Après quelques secondes, l'API s'arrête avec un message générique ; ni l'adresse ni le mot de passe n'apparaissent. |
| Consulter la base dans Atlas après un démarrage réussi | Aucune collection créée par l'API. |

Cas facultatif : API démarrée, couper l'accès à la base (retirer l'adresse IP autorisée dans Atlas), attendre quelques secondes, rappeler la route de santé : `503` au format commun.

## 3. Adresses et erreurs uniformes (récit 3)

| Action | Résultat attendu |
|---|---|
| `curl -i http://localhost:4000/api/v1/inconnu` | `404`, corps `statusCode`, `error`, `message` (« Ressource introuvable. »). |
| `curl -i http://localhost:4000/` | `404` au même format : la route « Hello World! » n'existe plus. |
| `curl -i http://localhost:4000/health` | `404` : la route de santé n'existe que sous `/api/v1`. |
| `curl -i -X POST http://localhost:4000/api/v1/health` | `404` au format commun : NestJS répond ainsi à une méthode non prévue. |
| `curl -i -X POST -H "Content-Type: application/json" -d '{' http://localhost:4000/api/v1/health` | `400` au format commun, sans détail technique. |
| Lire les en-têtes de n'importe quelle réponse ci-dessus | Les en-têtes de sécurité sont présents (par exemple `X-Content-Type-Options: nosniff`) ; `X-Powered-By` est absent. |

## 4. Origines croisées (récit 4)

| Action | Résultat attendu |
|---|---|
| `CORS_ORIGINS` vide ; `curl -i -H "Origin: http://exemple.test" http://localhost:4000/api/v1/health` | Pas d'en-tête `Access-Control-Allow-Origin`. |
| `CORS_ORIGINS=http://exemple.test`, redémarrer, même commande | `Access-Control-Allow-Origin: http://exemple.test`. |
| Même configuration, avec `Origin: http://autre.test` | Pas d'en-tête d'autorisation pour cette origine. |
| `CORS_ORIGINS=pas-une-origine`, démarrer | L'API s'arrête ; le message nomme `CORS_ORIGINS`. |

## 5. Contrôles de fin d'étape

| Commande (depuis la racine) | Résultat attendu |
|---|---|
| `npm run lint` | Aucune erreur. |
| `npm run build:api` | Build réussi. |
| `npm run build:web` | Build réussi, comme avant. |
| `git status` | Aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md` ; `apps/api/.env` absent de la liste. |
| Rechercher la valeur de `JWT_SECRET` et le mot de passe de la base dans les fichiers suivis par Git | Aucun résultat. |
