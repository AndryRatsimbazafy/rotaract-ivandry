# Contrat : membres

Référence : `ARCHITECTURE.md`, sections 1.2, 6, 8, 9, 10 et 13. Format d'erreur : `specs/001-api-foundation/contracts/errors.md`. Protection : `specs/003-admin-auth/contracts/auth.md`.

Les valeurs des exemples sont des emplacements, pas des données du club.

---

## Lecture publique

### GET /api/v1/members

Sans authentification.

| Paramètre | Règle |
|---|---|
| `year` | Facultatif. Label `AAAA-AAAA`, deux années consécutives. Par défaut : l'année courante. |
| `limit` | Facultatif. Entier de 1 à 100 : nombre maximal de membres renvoyés. |

**Réponse `200`**

```json
{
  "data": [
    {
      "id": "66f0c1a2b3c4d5e6f7a8b9c1",
      "firstName": "Prénom",
      "lastName": "Nom",
      "occupation": "Profession ou études",
      "rotaryYear": "2026-2027",
      "roles": ["president", "responsable-image-publique"],
      "order": 1
    }
  ]
}
```

- Les membres qui ont un mandat dans l'année, dans l'ordre du club. Pas de pagination.
- `occupation` est absent quand il n'est pas renseigné. Jamais d'`email`, de `phone` ni de `portrait`.
- Année bien formée mais inexistante, ou aucune année courante sans `year` : `{ "data": [] }`.

**Erreurs** : `400` « Données invalides. » avec le détail, pour un `year` mal formé ou un `limit` hors règle.

### GET /api/v1/members/years

Sans authentification, sans paramètre.

**Réponse `200`** : `{ "data": [...] }`, les années Rotary qui ont au moins un mandat, de la plus récente à la plus ancienne, chacune dans la forme de `specs/002-rotary-years/contracts/rotary-years.md`. Aucune : `{ "data": [] }`.

---

## Administration

Toutes ces routes exigent un jeton valide et le rôle `ADMIN` : `401` « Authentification requise. », `403` « Accès refusé. ».

### Forme d'un membre (administration)

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c1",
  "firstName": "Prénom",
  "lastName": "Nom",
  "occupation": "Profession ou études",
  "email": "prenom.nom@exemple.org",
  "phone": "+261 00 00 000 00",
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-01T08:00:00.000Z"
}
```

Les champs facultatifs non renseignés valent `null`.

### GET /api/v1/admin/members

| Paramètre | Règle |
|---|---|
| `page` | Entier, 1 au moins. Défaut 1. |
| `limit` | Entier de 1 à 100. Défaut 20. |
| `q` | Recherche sur le prénom et le nom. 2 caractères au moins. |
| `year` | Label : membres qui ont un mandat cette année-là. |
| `role` | Une des dix fonctions : membres qui tiennent cette fonction (cette année-là si `year` est donné). |
| `sort` | `lastName` (défaut), `-lastName`, `createdAt`, `-createdAt`. |

**Réponse `200`**

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

Chaque élément a la forme ci-dessus, **sans** ses mandats.

**Erreurs** : `400` avec le détail, pour un paramètre hors règle (page, taille, recherche trop courte, label mal formé, fonction inconnue, tri non autorisé).

### GET /api/v1/admin/members/:id

**Réponse `200`** : la forme ci-dessus, plus `mandates` : **tous** les mandats du membre, de l'année la plus récente à la plus ancienne.

```json
"mandates": [
  {
    "id": "66f0c1a2b3c4d5e6f7a8b9c2",
    "rotaryYear": { "id": "66f0c1a2b3c4d5e6f7a8b9c0", "label": "2026-2027" },
    "roles": ["president", "responsable-image-publique"],
    "order": 1
  }
]
```

**Erreurs** : `400` « Identifiant invalide. » ; `404` « Ressource introuvable. ».

### POST /api/v1/admin/members

**Corps**

```json
{ "firstName": "Prénom", "lastName": "Nom", "occupation": "Profession ou études", "email": "prenom.nom@exemple.org", "phone": "+261 00 00 000 00" }
```

Seuls `firstName` et `lastName` sont obligatoires.

**Réponse `201`** : le membre créé, dans la forme d'administration.

### PATCH /api/v1/admin/members/:id

**Corps** : un ou plusieurs des cinq champs. Un champ absent est inchangé. `null` efface `occupation`, `email` ou `phone`.

**Réponse `200`** : le membre modifié.

**Erreurs** : `400` « Identifiant invalide. » ; `404`.

### DELETE /api/v1/admin/members/:id

**Réponse `204`**, sans corps. Les mandats du membre sont supprimés avec lui.

**Erreurs** : `400` « Identifiant invalide. » ; `404`.

### Messages de validation (création et modification)

Validés le 2026-10-02. `message` : « Données invalides. » ; un élément de `details` par champ en erreur.

| Champ | Message |
|---|---|
| `firstName` | « Le prénom est obligatoire, 120 caractères au plus. » |
| `lastName` | « Le nom est obligatoire, 120 caractères au plus. » |
| `occupation` | « La profession ou les études comptent 120 caractères au plus. » |
| `email` | « Adresse email invalide. » |
| `phone` | « Numéro de téléphone invalide. » |
| champ non prévu, y compris `portrait` | « Champ non autorisé. » |

### Messages de validation (paramètres des listes)

Validés le 2026-10-02.

| Paramètre | Message |
|---|---|
| `page` | « La page doit être un entier supérieur ou égal à 1. » |
| `limit` | « La taille de page doit être un entier entre 1 et 100. » |
| `q` | « La recherche doit compter 2 caractères au moins. » |
| `year` | « L'année doit être au format AAAA-AAAA, avec deux années consécutives. » |
| `role` | « Fonction inconnue. » |
| `sort` | « Tri non autorisé. » |
