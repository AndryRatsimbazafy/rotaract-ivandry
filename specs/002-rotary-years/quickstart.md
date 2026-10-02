# Quickstart : vérifier les années Rotary (temps 1)

Guide de vérification manuelle. Il remplace les tests automatisés (constitution, principe IX). Contrat : [contracts/rotary-years.md](./contracts/rotary-years.md). Modèle : [data-model.md](./data-model.md).

Seul le temps 1 est vérifié ici. La création, la liste d'administration et la suppression seront vérifiées avec l'authentification.

## Prérequis

- Node.js 22, dépendances installées depuis la racine (`npm install`).
- `apps/api/.env` renseigné et base MongoDB Atlas joignable depuis le poste.
- Un accès à la base pour y insérer et retirer des documents à la main (Atlas, Data Explorer, collection `rotaryyears`).

Démarrage : `npm run dev:api` depuis la racine. L'API écoute sur `http://localhost:4000`.

Les années insérées ci-dessous sont des données de vérification : elles sont **retirées à la fin** (section 5).

## 1. Liste vide

| Action | Résultat attendu |
|---|---|
| Démarrer l'API sur une base sans année | Démarrage normal. La collection `rotaryyears` existe, vide, avec un index unique sur `startYear`. |
| `curl -i http://localhost:4000/api/v1/rotary-years` | `200` et `{"data":[]}`. Aucune année n'a été créée d'avance. |

## 2. Liste et valeurs calculées

Insérer à la main trois documents dans `rotaryyears` : `{ "startYear": 2026 }`, `{ "startYear": 2025 }`, `{ "startYear": 2030 }` (valeurs en nombre).

| Action | Résultat attendu |
|---|---|
| `curl -s http://localhost:4000/api/v1/rotary-years` | Trois années, dans l'ordre 2030, 2026, 2025. |
| Lire l'année 2026 | `label` `2026-2027`, `startDate` `2026-07-01T00:00:00.000Z`, `endDate` `2027-06-30T23:59:59.999Z`. |
| Lire les champs de chaque année | Exactement `id`, `startYear`, `label`, `startDate`, `endDate`, `isCurrent`. Ni `_id`, ni `__v`, ni `createdAt`, ni `updatedAt`. |
| Lire `isCurrent` | Vrai pour la seule année dont la période contient la date du jour ; faux pour les autres. |
| Regarder un document dans Atlas | Seul `startYear` est enregistré (avec `_id`) : ni label, ni dates, ni indicateur courant. |

## 3. Aucune année courante

| Action | Résultat attendu |
|---|---|
| Retirer l'année qui contient la date du jour, relire la liste | Aucune année n'a `isCurrent: true`. Réponse `200`, sans erreur. |

## 4. Unicité

| Action | Résultat attendu |
|---|---|
| Insérer à la main un second document `{ "startYear": 2030 }` | Refusé par la base (clé dupliquée). La liste ne contient toujours qu'une année 2030. |

## 5. Bornes du calcul

Les deux bornes ne s'observent pas sans attendre le 30 juin. La fonction de calcul prend l'instant en paramètre : elle se vérifie à la main, après `npm run build:api`, en l'appelant depuis `apps/api` pour une année de début 2026 avec quatre instants.

| Instant | `isCurrent` attendu pour 2026 |
|---|---|
| `2026-06-30T23:59:59.999Z` | faux |
| `2026-07-01T00:00:00.000Z` | vrai |
| `2027-06-30T23:59:59.999Z` | vrai |
| `2027-07-01T00:00:00.000Z` | faux |

## 6. Aucune route d'administration

| Action | Résultat attendu |
|---|---|
| `curl -i http://localhost:4000/api/v1/admin/rotary-years` | `404` au format commun. |
| `curl -i -X POST -H "Content-Type: application/json" -d '{"startYear":2026}' http://localhost:4000/api/v1/admin/rotary-years` | `404` au format commun. Rien n'est créé. |
| `curl -i -X POST -H "Content-Type: application/json" -d '{"startYear":2026}' http://localhost:4000/api/v1/rotary-years` | `404` au format commun : la liste publique n'accepte que `GET`. |

## 7. Nettoyage

| Action | Résultat attendu |
|---|---|
| Retirer à la main toutes les années insérées pour la vérification | `curl http://localhost:4000/api/v1/rotary-years` renvoie `{"data":[]}`. |

## 8. Contrôles de fin d'étape

| Commande (depuis la racine) | Résultat attendu |
|---|---|
| `npm run lint` | Aucune erreur. |
| `npm run build:api` | Build réussi. |
| `npm run build:web` et `npm run build:admin` | Builds réussis, comme avant. |
| `curl -i http://localhost:4000/api/v1/health` | `200`, comme avant : le socle est inchangé. |
| `git status` | Aucun fichier modifié dans `apps/web`, `apps/admin` ni `DESIGN.md` ; `apps/api/.env` absent de la liste. |
