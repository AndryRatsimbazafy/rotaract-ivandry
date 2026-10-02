# Contrat : années Rotary

Référence : `ARCHITECTURE.md`, sections 1.1, 6, 8, 9, 10 et 13. Format d'erreur : `specs/001-api-foundation/contracts/errors.md`.

## Forme d'une année

La même sur toutes les routes de la ressource.

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c0",
  "startYear": 2026,
  "label": "2026-2027",
  "startDate": "2026-07-01T00:00:00.000Z",
  "endDate": "2027-06-30T23:59:59.999Z",
  "isCurrent": true
}
```

Les valeurs sont des emplacements, pas des données du club.

---

## Temps 1 — livré par cette fonctionnalité

### GET /api/v1/rotary-years

Publique, sans authentification, sans paramètre, sans corps.

**Réponse `200`**

```json
{
  "data": [
    {
      "id": "66f0c1a2b3c4d5e6f7a8b9c1",
      "startYear": 2027,
      "label": "2027-2028",
      "startDate": "2027-07-01T00:00:00.000Z",
      "endDate": "2028-06-30T23:59:59.999Z",
      "isCurrent": false
    },
    {
      "id": "66f0c1a2b3c4d5e6f7a8b9c0",
      "startYear": 2026,
      "label": "2026-2027",
      "startDate": "2026-07-01T00:00:00.000Z",
      "endDate": "2027-06-30T23:59:59.999Z",
      "isCurrent": true
    }
  ]
}
```

- Toutes les années, de la plus récente à la plus ancienne. Pas de pagination, pas de `meta`.
- Aucune année : `{ "data": [] }`, toujours en `200`.
- Au plus une année porte `isCurrent: true`.

**Erreurs** : aucune erreur propre. Une panne de lecture donne le `500` générique du socle.

### Adresses sous /admin pendant le temps 1

Aucune n'existe. `GET`, `POST` ou `DELETE` sur `/api/v1/admin/rotary-years` répondent le `404` « Ressource introuvable. » du socle.

---

## Temps 2 — différé, livré avec l'authentification

Contrat validé, **non mis en œuvre par cette fonctionnalité**. Toutes ces routes exigent un jeton valide et le rôle `ADMIN` : `401` sans jeton valide, `403` sans le rôle.

### GET /api/v1/admin/rotary-years

Même réponse que la liste publique.

### POST /api/v1/admin/rotary-years

**Corps**

```json
{ "startYear": 2026 }
```

**Réponse `201`** : l'année créée, dans la forme ci-dessus.

**Erreurs**

| Code | Situation | Corps |
|---|---|---|
| `400` | `startYear` absent, nul, texte (y compris `"2026"`), décimal, inférieur à 2000 ou supérieur à 2100 | `message` : « Données invalides. » ; `details` : `[{ "field": "startYear", "message": "L'année de début doit être un entier entre 2000 et 2100." }]` |
| `400` | Champ autre que `startYear` | `message` : « Données invalides. » ; `details` : `[{ "field": "<champ>", "message": "Champ non autorisé." }]` |
| `409` | Une année de même `startYear` existe déjà | `message` : « Cette année Rotary existe déjà. » |

### DELETE /api/v1/admin/rotary-years/:id

**Réponse `204`**, sans corps.

**Erreurs**

| Code | Situation | Message |
|---|---|---|
| `400` | Identifiant mal formé | Fixé avec la validation des identifiants, au temps 2. |
| `404` | Aucune année ne porte cet identifiant | « Ressource introuvable. » |
| `409` | Année référencée par un mandat, une action ou une actualité | Fixé par la première fonctionnalité qui rend ce cas possible ; d'ici là, message par défaut du `409`. |

### Ce qui n'existe pas

- Aucune modification d'une année (`PUT`, `PATCH`).
- Aucune lecture d'une année seule.
