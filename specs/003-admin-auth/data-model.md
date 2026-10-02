# Data Model: Authentification de l'administrateur

Source : `ARCHITECTURE.md`, sections 1.7, 3, 7 et 12.

## Admin

Collection : `admins`. Au plus un document en V1.

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| `_id` | ObjectId | oui | Exposé en `id` (chaîne). |
| `email` | chaîne | oui | **Unique**, en minuscules, sans espaces autour. |
| `passwordHash` | chaîne | oui | Hachage Argon2id. Jamais renvoyé par l'API, jamais journalisé. |
| `role` | `ADMIN` | oui | Seule valeur possible. |
| `createdAt`, `updatedAt` | date | oui | Gérés automatiquement. Non exposés. |

Index : `email` unique.

### Règles

- Le compte n'est créé et modifié que par la commande d'initialisation ([contracts/seed-admin.md](./contracts/seed-admin.md)). Aucune route ne l'écrit.
- Mot de passe : 12 caractères au moins, contrôlé à la création ou au remplacement seulement.
- Aucun autre champ : pas de date de changement de mot de passe, pas de compteur de tentatives, pas d'état actif ou inactif.

### Forme exposée

`{ "id", "email", "role" }`, dans la réponse de connexion et sur `GET /auth/me`.

## Jeton d'accès

Non enregistré.

| Élément | Valeur |
|---|---|
| `sub` | Identifiant du compte. |
| `role` | `ADMIN`. |
| `iat` | Date d'émission. |
| `exp` | Date d'expiration : émission plus la durée de `JWT_EXPIRES_IN`. |
| Signature | HS256, avec `JWT_SECRET`. |

- Un jeton reste valable jusqu'à son expiration, même après un changement de mot de passe.
- Un jeton dont le compte n'existe plus est refusé.
- Changer `JWT_SECRET` invalide tous les jetons.

## Configuration

Une seule règle du socle change.

| Variable | Obligatoire | Défaut | Règle de validité |
|---|---|---|---|
| `JWT_EXPIRES_IN` | non | `8h` | Nombre suivi de `s`, `m`, `h` ou `d` ; durée strictement positive et de 8 heures au plus. |

Absente ou vide : `8h`. Hors règle (`0s`, `481m`, `9h`, `1d`) : erreur de configuration au démarrage, qui nomme la variable.

`ADMIN_EMAIL` et `ADMIN_PASSWORD` : lues par la commande d'initialisation seulement, jamais par l'API en fonctionnement.

## Compteur de tentatives de connexion

Non enregistré : en mémoire, par adresse IP, remis à zéro au redémarrage. Cinq demandes par fenêtre de 60 secondes.

## RotaryYear

Inchangée : `specs/002-rotary-years/data-model.md`. Règle d'entrée appliquée à la création : `startYear` entier JSON de 2000 à 2100.
