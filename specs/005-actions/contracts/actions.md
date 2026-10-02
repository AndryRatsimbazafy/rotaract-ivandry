# Contrat : actions

Référence : `ARCHITECTURE.md`, sections 1.4, 6, 8, 9, 10 et 13. Format d'erreur : `specs/001-api-foundation/contracts/errors.md`. Protection : `specs/003-admin-auth/contracts/auth.md`.

Les valeurs des exemples sont des emplacements, pas des données du club.

---

## Lecture publique

Sans authentification. Seules les actions **publiées** sont visibles.

### Forme publique d'une action

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c3",
  "slug": "titre-de-l-action",
  "title": "Titre de l'action",
  "summary": "Courte description.",
  "description": "Premier paragraphe.\n\nSecond paragraphe.",
  "date": "2026-09-12T00:00:00.000Z",
  "rotaryYear": "2026-2027",
  "focusAreas": ["eau", "sante"],
  "impact": { "objective": "…", "partners": ["…"] }
}
```

- `summary` et `description` sont absents quand ils ne sont pas renseignés.
- `impact` est absent quand aucune rubrique n'est renseignée ; sinon il ne porte que les rubriques renseignées.
- Jamais `isPublished`, `publishedAt`, `order`, `createdAt`, `updatedAt` ni `photos`.

### GET /api/v1/actions

| Paramètre | Règle |
|---|---|
| `page` | Entier, 1 au moins. Défaut 1. |
| `limit` | Entier de 1 à 100. Défaut 20. |
| `q` | Recherche sur le titre et le résumé. 2 caractères au moins. |
| `year` | Label `AAAA-AAAA`, deux années consécutives. |
| `focusArea` | Un des sept domaines. |

**Réponse `200`**

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

- Tri : les actions qui ont un ordre d'abord, par ordre croissant ; puis par date décroissante.
- Année bien formée mais inexistante : `data` vide, `total` 0.

**Erreurs** : `400` « Données invalides. » avec le détail, pour un paramètre hors règle.

### GET /api/v1/actions/years

**Réponse `200`** : `{ "data": [...] }`, les années Rotary qui ont au moins une action publiée, de la plus récente à la plus ancienne, dans la forme de `specs/002-rotary-years/contracts/rotary-years.md`.

### GET /api/v1/actions/:slug

**Réponse `200`** : l'action publiée, dans la forme publique.

**Erreurs** : `404` « Ressource introuvable. » pour un slug inconnu ou une action non publiée.

---

## Administration

Toutes ces routes exigent un jeton valide et le rôle `ADMIN` : `401` « Authentification requise. », `403` « Accès refusé. ».

### Forme d'administration d'une action

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c3",
  "title": "Titre de l'action",
  "slug": "titre-de-l-action",
  "summary": "Courte description.",
  "description": "Premier paragraphe.\n\nSecond paragraphe.",
  "date": "2026-09-12T00:00:00.000Z",
  "rotaryYear": { "id": "66f0c1a2b3c4d5e6f7a8b9c0", "label": "2026-2027" },
  "focusAreas": ["eau", "sante"],
  "impact": { "objective": "…", "beneficiaries": "…", "partners": ["…"] },
  "isPublished": true,
  "publishedAt": "2026-09-20T10:00:00.000Z",
  "order": null,
  "createdAt": "2026-09-15T08:00:00.000Z",
  "updatedAt": "2026-09-20T10:00:00.000Z"
}
```

`summary`, `description`, `publishedAt` et `order` valent `null` quand ils ne sont pas renseignés. `impact` est absent quand aucune rubrique n'est renseignée. Aucun champ `photos`.

### GET /api/v1/admin/actions

Toutes les actions, brouillons compris.

| Paramètre | Règle |
|---|---|
| `page`, `limit`, `q`, `year`, `focusArea` | Comme la liste publique. |
| `published` | `true` ou `false`. |
| `sort` | Trois champs, dans les deux sens : `-date` (défaut), `date`, `title`, `-title`, `createdAt`, `-createdAt`. Aucun autre. |

**Réponse `200`** : `{ data, meta }`, chaque élément dans la forme d'administration.

### GET /api/v1/admin/actions/:id

**Réponse `200`** : l'action. **Erreurs** : `400` « Identifiant invalide. » ; `404`.

### POST /api/v1/admin/actions

**Corps**

```json
{
  "title": "Titre de l'action",
  "date": "2026-09-12",
  "rotaryYear": "66f0c1a2b3c4d5e6f7a8b9c0",
  "slug": "titre-de-l-action",
  "summary": "Courte description.",
  "description": "Premier paragraphe.\n\nSecond paragraphe.",
  "focusAreas": ["eau", "sante"],
  "impact": { "objective": "…", "partners": ["…"] },
  "isPublished": false,
  "order": 1
}
```

Seuls `title`, `date` et `rotaryYear` sont obligatoires. Sans `slug`, il est généré depuis le titre ; si la génération donne `years`, le slug devient `years-2`, puis `years-3`. Sans `isPublished`, l'action est un brouillon.

**Réponse `201`** : l'action créée.

**Erreurs**

| Code | Situation | Corps |
|---|---|---|
| `400` | Champ absent ou hors règle, champ non prévu (dont `photos` et `publishedAt`) | « Données invalides. » avec le détail |
| `400` | Année inexistante | « Données invalides. », détail sur `rotaryYear` |
| `400` | Aucun slug ne peut être tiré du titre | « Données invalides. », détail sur `slug` |
| `400` | Slug `years` fourni explicitement (réservé à la route `/actions/years`) | « Données invalides. », détail sur `slug` |
| `409` | Slug fourni déjà pris | « Conflit avec une ressource existante. » |

### PATCH /api/v1/admin/actions/:id

**Corps** : un ou plusieurs des champs de la création.

- Un champ absent est inchangé.
- `null` efface `summary`, `description`, `order` ou `impact`.
- `impact` envoyé remplace l'impact entier.
- `slug` n'est modifié que s'il est envoyé ; modifier `title` ne le change pas.
- `isPublished` publie ou dépublie ; `publishedAt` est posé à la première publication et conservé ensuite.

**Réponse `200`** : l'action modifiée.

**Erreurs** : `400` « Identifiant invalide. » ; `400` de validation, dont le slug `years` fourni explicitement ; `404` ; `409` pour un slug déjà pris.

### DELETE /api/v1/admin/actions/:id

**Réponse `204`**, sans corps. **Erreurs** : `400` « Identifiant invalide. » ; `404`.

---

## Messages de validation

Validés le 2026-10-02 ; aucun autre message n'est créé pendant l'implémentation. `message` : « Données invalides. » ; un élément de `details` par champ en erreur.

| Champ | Message |
|---|---|
| `title` | « Le titre est obligatoire, 120 caractères au plus. » |
| `slug` | « Le slug ne contient que des minuscules, des chiffres et des tirets, 120 caractères au plus. » |
| `slug` (aucun slug tiré du titre) | « Aucun slug ne peut être tiré de ce titre : fournissez-en un. » |
| `slug` (`years` fourni explicitement) | « Ce slug est réservé. » |
| `summary` | « Le résumé compte 500 caractères au plus. » |
| `description` | « La description compte 20 000 caractères au plus. » |
| `date` | « La date doit être au format ISO 8601. » |
| `rotaryYear` (mal formé ou absent) | « Identifiant d'année Rotary invalide. » |
| `rotaryYear` (inexistante) | « Cette année Rotary n'existe pas. » |
| `focusAreas` | « Les domaines doivent appartenir à la liste des domaines d'action, sans doublon. » |
| `impact` | « L'impact doit être un objet. » |
| `impact.objective`, `.beneficiaries`, `.location`, `.period`, `.results` | « Cette rubrique compte 500 caractères au plus. » |
| `impact.partners` | « 20 partenaires au plus, 120 caractères chacun. » |
| `isPublished` | « L'état de publication doit être vrai ou faux. » |
| `order` | « L'ordre doit être un entier supérieur ou égal à 1. » |
| `published` (filtre) | « Le filtre de publication vaut true ou false. » |
| `focusArea` (filtre) | « Domaine inconnu. » |
| `year` (filtre) | « L'année doit être au format AAAA-AAAA, avec deux années consécutives. » |
| `q`, `page`, `limit`, `sort` | Ceux de `specs/004-members/contracts/members.md`. |
| champ non prévu | « Champ non autorisé. » |

Les deux messages de `rotaryYear` et celui de `order` existent déjà dans `specs/004-members/contracts/mandates.md`.

## Suppression d'une année Rotary

`DELETE /api/v1/admin/rotary-years/:id` répond désormais `409` « Conflit avec une ressource existante. » quand au moins une action, publiée ou non, référence l'année. Le refus pour les mandats est inchangé.
