# Contrat API : changements de 015

Format d'erreur commun, préfixe `/api/v1`, `/admin/*` derrière JWT + `ADMIN` (`ARCHITECTURE.md`, sections 5 à 7). Seuls les changements sont décrits.

## Actions

### `POST /admin/actions` et `PATCH /admin/actions/:id`

Corps : champ facultatif `highlighted` (booléen).

| Cas | Réponse |
|---|---|
| `highlighted` absent à la création | Action non marquée |
| `highlighted: "oui"` | `400`, `details[{ field: "highlighted", message: "L'indication « marquante » est vraie ou fausse." }]` |
| `highlighted: true` alors que l'année compte déjà trois autres actions marquantes | `400`, `details[{ field: "highlighted", message: "L'année 2025-2026 compte déjà trois actions marquantes." }]` ; rien n'est enregistré |
| `rotaryYear` changé sur une action marquée vers une année pleine | Même `400` |
| `highlighted: false` | Toujours accepté |

### Vues

- `GET /admin/actions`, `GET /admin/actions/:id` : `highlighted` toujours présent (`true` ou `false`).
- `GET /actions`, `GET /actions/:slug` : `"highlighted": true` seulement pour une action marquée.

## Réglages du site

### `PATCH /admin/site-settings`

Nouveau groupe facultatif :

```json
{ "history": "Paragraphe un.\n\nParagraphe deux.", "en": { "history": "First paragraph.\n\nSecond paragraph." } }
```

| Cas | Réponse |
|---|---|
| `history` de 4 001 caractères | `400`, `details[{ field: "history", message: "L'histoire du club compte 4000 caractères au plus." }]` |
| `history: null` ou `""` | Champ vidé |
| `en.history` de 4 001 caractères | `400`, `field: "en.history"`, message `englishLengthMessage` |
| `en.history: null` | Traduction retirée |

### Lectures

- `GET /site-settings` et `GET /admin/site-settings` : `history` (si saisi) et `en.history` (si saisi), `photos["club-ouverture"]` (si déposée).
- `PUT`, `PATCH`, `DELETE /admin/site-settings/photos/club-ouverture` : comme les sept autres emplacements ; emplacement inconnu : `404` (inchangé).

## Membres

Aucun changement : la frise lit `GET /members/years` puis `GET /members?year=<label>` pour chaque année.
