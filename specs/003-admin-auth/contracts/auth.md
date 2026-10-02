# Contrat : authentification

Référence : `ARCHITECTURE.md`, sections 6, 7 et 13. Format d'erreur : `specs/001-api-foundation/contracts/errors.md`.

## POST /api/v1/auth/login

Publique. Limitée à 5 demandes par fenêtre de 60 secondes et par adresse IP, toutes les demandes comptant, réussies ou non. C'est la seule route limitée.

**Corps**

```json
{ "email": "admin@exemple.org", "password": "…" }
```

**Réponse `200`**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs…",
  "tokenType": "Bearer",
  "expiresIn": 28800,
  "admin": { "id": "66f0c1a2b3c4d5e6f7a8b9c6", "email": "admin@exemple.org", "role": "ADMIN" }
}
```

- `expiresIn` : durée effective du jeton en secondes (28800 pour `8h`).
- L'email est comparé sans tenir compte de la casse ni des espaces autour.
- Aucun contrôle de format n'est appliqué à l'email : un email présent mais mal formé est traité comme un email inconnu (`401`).
- La règle des 12 caractères ne s'applique pas à la connexion.

**Erreurs**

| Code | Situation | Corps |
|---|---|---|
| `400` | `email` ou `password` absent ou vide | `message` : « Données invalides. » ; `details` : `[{ "field": "email", "message": "L'email est obligatoire." }]` ou `[{ "field": "password", "message": "Le mot de passe est obligatoire." }]` |
| `400` | Champ non prévu | `message` : « Données invalides. » ; `details` : `[{ "field": "<champ>", "message": "Champ non autorisé." }]` |
| `401` | Email inconnu **ou** mot de passe faux (corps identique) | `message` : « Email ou mot de passe incorrect. » |
| `429` | Sixième demande dans la minute, identifiants bons ou non | `message` : « Trop de requêtes. Réessayez plus tard. » |

## GET /api/v1/auth/me

Exige un jeton valide : `Authorization: Bearer <jeton>`.

**Réponse `200`**

```json
{ "id": "66f0c1a2b3c4d5e6f7a8b9c6", "email": "admin@exemple.org", "role": "ADMIN" }
```

**Erreurs** : `401` « Authentification requise. ».

## Protection des adresses

| Adresses | Exigence | Refus |
|---|---|---|
| `/api/v1/auth/me` | Jeton valide | `401` |
| `/api/v1/admin/*` | Jeton valide **et** rôle `ADMIN` | `401`, puis `403` |
| Toutes les autres | Aucune | |

| Code | Situation | Message |
|---|---|---|
| `401` | Jeton absent, mal formé, de signature invalide, expiré, ou dont le compte n'existe plus | « Authentification requise. » |
| `403` | Jeton valide, rôle insuffisant | « Accès refusé. » |

Le `403` n'a pas de scénario métier naturel dans cette fonctionnalité : il n'existe qu'un rôle, `ADMIN`. La distinction `401` / `403` est conservée dans les gardes et vérifiée structurellement.

Les quatre cas de `401` ont le même corps. Un appel refusé ne lit ni ne modifie aucune donnée.

## Ce qui n'existe pas

Inscription, création ou modification de compte par l'API, mot de passe oublié, changement de mot de passe, jeton de rafraîchissement, déconnexion.

## Années Rotary

Les opérations `GET`, `POST` et `DELETE` sous `/api/v1/admin/rotary-years` suivent `specs/002-rotary-years/contracts/rotary-years.md`, section « Temps 2 ». Précision apportée ici : identifiant mal formé à la suppression, `400` « Identifiant invalide. ».
