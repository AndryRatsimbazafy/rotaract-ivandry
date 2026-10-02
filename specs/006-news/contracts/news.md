# Contrat : actualités

Référence : `ARCHITECTURE.md`, sections 1.5, 6, 8, 9, 10 et 13. Format d'erreur : `specs/001-api-foundation/contracts/errors.md`. Protection : `specs/003-admin-auth/contracts/auth.md`.

Les valeurs des exemples sont des emplacements, pas des données du club.

---

## Lecture publique

Sans authentification. Seules les actualités **publiées** sont visibles.

### Forme publique d'une actualité

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c4",
  "slug": "titre-de-l-actualite",
  "title": "Titre de l'actualité",
  "type": "reunion",
  "date": "2026-09-05T00:00:00.000Z",
  "rotaryYear": "2026-2027",
  "location": "Antananarivo",
  "summary": "Court résumé.",
  "content": "Premier paragraphe.\n\nSecond paragraphe."
}
```

- `location`, `summary` et `content` sont absents quand ils ne sont pas renseignés.
- Jamais `isPublished`, `publishedAt`, `createdAt`, `updatedAt` ni `photos`.

### GET /api/v1/news

| Paramètre | Règle |
|---|---|
| `page` | Entier, 1 au moins. Défaut 1. |
| `limit` | Entier de 1 à 100. Défaut 20. |
| `q` | Recherche sur le titre et le résumé. 2 caractères au moins. |
| `year` | Label `AAAA-AAAA`, deux années consécutives. |
| `type` | Un des cinq types. |

**Réponse `200`**

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

- Tri : de la date la plus récente à la plus ancienne.
- Année bien formée mais inexistante : `data` vide, `total` 0.

**Erreurs** : `400` « Données invalides. » avec le détail, pour un paramètre hors règle.

### GET /api/v1/news/archives

**Réponse `200`**

```json
{
  "data": [
    {
      "rotaryYear": {
        "id": "66f0c1a2b3c4d5e6f7a8b9c0",
        "startYear": 2026,
        "label": "2026-2027",
        "startDate": "2026-07-01T00:00:00.000Z",
        "endDate": "2027-06-30T23:59:59.999Z",
        "isCurrent": true
      },
      "count": 3
    }
  ]
}
```

- Une entrée par année Rotary qui a au moins une actualité publiée, de la plus récente à la plus ancienne.
- `count` : le nombre d'actualités **publiées** de l'année. Les brouillons ne sont pas comptés.
- Aucune : `{ "data": [] }`.

### GET /api/v1/news/:slug

**Réponse `200`** : l'actualité publiée, dans la forme publique.

**Erreurs** : `404` « Ressource introuvable. » pour un slug inconnu ou une actualité non publiée.

---

## Administration

Toutes ces routes exigent un jeton valide et le rôle `ADMIN` : `401` « Authentification requise. », `403` « Accès refusé. ».

### Forme d'administration d'une actualité

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c4",
  "title": "Titre de l'actualité",
  "slug": "titre-de-l-actualite",
  "type": "reunion",
  "date": "2026-09-05T00:00:00.000Z",
  "rotaryYear": { "id": "66f0c1a2b3c4d5e6f7a8b9c0", "label": "2026-2027" },
  "location": "Antananarivo",
  "summary": "Court résumé.",
  "content": "Premier paragraphe.\n\nSecond paragraphe.",
  "isPublished": false,
  "publishedAt": null,
  "createdAt": "2026-09-06T08:00:00.000Z",
  "updatedAt": "2026-09-06T08:00:00.000Z"
}
```

`location`, `summary`, `content` et `publishedAt` valent `null` quand ils ne sont pas renseignés. Aucun champ `photos`.

### GET /api/v1/admin/news

Toutes les actualités, brouillons compris.

| Paramètre | Règle |
|---|---|
| `page`, `limit`, `q`, `year`, `type` | Comme la liste publique. |
| `published` | `true` ou `false`. |
| `sort` | Trois champs, dans les deux sens : `-date` (défaut), `date`, `title`, `-title`, `createdAt`, `-createdAt`. Aucun autre. |

**Réponse `200`** : `{ data, meta }`, chaque élément dans la forme d'administration. Année inexistante : `data` vide.

### GET /api/v1/admin/news/:id

**Réponse `200`** : l'actualité. **Erreurs** : `400` « Identifiant invalide. » ; `404`.

### POST /api/v1/admin/news

**Corps**

```json
{
  "title": "Titre de l'actualité",
  "type": "reunion",
  "date": "2026-09-05",
  "rotaryYear": "66f0c1a2b3c4d5e6f7a8b9c0",
  "slug": "titre-de-l-actualite",
  "location": "Antananarivo",
  "summary": "Court résumé.",
  "content": "Premier paragraphe.\n\nSecond paragraphe.",
  "isPublished": false
}
```

Seuls `title`, `type`, `date` et `rotaryYear` sont obligatoires. Sans `slug`, il est généré depuis le titre ; si la génération donne `archives`, le slug devient `archives-2`, puis `archives-3`. Sans `isPublished`, l'actualité est un brouillon. Une date sans heure vaut minuit UTC.

**Réponse `201`** : l'actualité créée.

**Erreurs**

| Code | Situation | Corps |
|---|---|---|
| `400` | Champ absent ou hors règle, champ non prévu (dont `photos` et `publishedAt`) | « Données invalides. » avec le détail |
| `400` | Année inexistante | « Données invalides. », détail sur `rotaryYear` |
| `400` | Aucun slug ne peut être tiré du titre | « Données invalides. », détail sur `slug` |
| `400` | Slug `archives` fourni explicitement | « Données invalides. », détail sur `slug` |
| `409` | Slug fourni déjà pris | « Conflit avec une ressource existante. » |

### PATCH /api/v1/admin/news/:id

**Corps** : un ou plusieurs des champs de la création.

- Un champ absent est inchangé.
- `null` efface `location`, `summary` ou `content` ; une chaîne vide est refusée.
- `slug` n'est modifié que s'il est envoyé ; modifier `title` ne le change pas.
- `isPublished` publie ou dépublie ; `publishedAt` est posé à la première publication et conservé ensuite.

**Réponse `200`** : l'actualité modifiée.

**Erreurs** : `400` « Identifiant invalide. » ; `400` de validation, dont le slug `archives` fourni explicitement ; `404` ; `409` pour un slug déjà pris.

### DELETE /api/v1/admin/news/:id

**Réponse `204`**, sans corps. **Erreurs** : `400` « Identifiant invalide. » ; `404`.

---

## Messages de validation

`message` : « Données invalides. » ; un élément de `details` par champ en erreur.

### Repris à l'identique des fonctionnalités précédentes

| Champ | Message | Origine |
|---|---|---|
| `title` | « Le titre est obligatoire, 120 caractères au plus. » | 005 |
| `slug` | « Le slug ne contient que des minuscules, des chiffres et des tirets, 120 caractères au plus. » | 005 |
| `slug` (aucun slug tiré du titre) | « Aucun slug ne peut être tiré de ce titre : fournissez-en un. » | 005 |
| `slug` (réservé, fourni explicitement) | « Ce slug est réservé. » | 005 |
| `summary` | « Le résumé compte 500 caractères au plus. » | 005 |
| `date` | « La date doit être au format ISO 8601. » | 005 |
| `rotaryYear` (mal formé ou absent) | « Identifiant d'année Rotary invalide. » | 004 |
| `rotaryYear` (inexistante) | « Cette année Rotary n'existe pas. » | 004 |
| `isPublished` | « L'état de publication doit être vrai ou faux. » | 005 |
| `published` (filtre) | « Le filtre de publication vaut true ou false. » | 005 |
| `year` (filtre) | « L'année doit être au format AAAA-AAAA, avec deux années consécutives. » | 004 |
| `q` | « La recherche doit compter 2 caractères au moins. » | 004 |
| `page` | « La page doit être un entier supérieur ou égal à 1. » | 004 |
| `limit` | « La taille de page doit être un entier entre 1 et 100. » | 004 |
| `sort` | « Tri non autorisé. » | 004 |
| champ non prévu | « Champ non autorisé. » | 001 |

### Nouveaux, propres aux actualités — validés le 2026-10-02

| Champ | Message |
|---|---|
| `type` | « Le type doit être l'un des cinq types d'actualité. » |
| `type` (filtre) | « Type inconnu. » |
| `location` | « Le lieu compte 120 caractères au plus. » |
| `content` | « Le contenu compte 20 000 caractères au plus. » |

## Suppression d'une année Rotary

`DELETE /api/v1/admin/rotary-years/:id` répond désormais `409` « Conflit avec une ressource existante. » quand au moins une actualité, publiée ou non, référence l'année. Les refus pour les mandats et les actions sont inchangés.
