# Contrat : candidatures

Préfixe commun : `/api/v1`. Format d'erreur : celui du socle (`specs/001-api-foundation/contracts/errors.md`). Modèle : [data-model.md](../data-model.md).

Ce contrat est celui dont le formulaire de la page « Rejoindre » et le futur écran « Candidatures » auront besoin. Aucun des deux n'est construit par cette fonctionnalité.

## Dépôt public

### `POST /applications`

Sans authentification. Corps en `multipart/form-data`.

| Champ | Nature | Obligatoire | Règle |
|---|---|---|---|
| `firstName` | texte | oui | 1 à 120 caractères. |
| `lastName` | texte | oui | 1 à 120 caractères. |
| `email` | texte | oui | Email valide, 254 caractères au plus ; mis en minuscules. |
| `phone` | texte | oui | Chiffres, espaces, `+`, `-`, `.`, parenthèses ; au moins 8 chiffres. |
| `applicantStatus` | texte | oui | `etudiant` ou `professionnel`. |
| `cv` | fichier | oui | Un seul. PDF, DOC ou DOCX ; 5 242 880 octets au plus ; non vide. |

Limite : 20 demandes par heure et par adresse IP, réussies ou non.

Réponse `201` :

```json
{ "received": true }
```

Rien d'autre : ni identifiant, ni donnée déposée.

| Code | Cas | Message |
|---|---|---|
| `400` | Champ absent, mal formé ou non prévu ; CV absent ou vide ; fichier dans un autre champ ; plusieurs fichiers | « Données invalides. », avec `details` |
| `413` | CV de plus de 5 242 880 octets | « Contenu trop volumineux. » |
| `415` | Contenu qui n'est ni PDF, ni DOC, ni DOCX, ou extension qui contredit le contenu | « Type de contenu non pris en charge. » |
| `429` | Limite de fréquence dépassée | « Trop de requêtes. Réessayez plus tard. » |
| `503` | Stockage injoignable ou en erreur | « Service indisponible. » |

Ordre des refus : `429`, puis `413`, puis `400`, puis `415`. Dans tous ces cas, rien n'est enregistré, ni en base ni au stockage.

Exemple de `400` :

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Données invalides.",
  "details": [
    { "field": "email", "message": "Adresse email invalide." },
    { "field": "phone", "message": "Numéro de téléphone invalide." }
  ]
}
```

Les champs texte sont vérifiés avant le fichier : un refus sur le CV (`cv`) n'apparaît qu'une fois les champs texte valides.

## Administration

Toutes les routes exigent `Authorization: Bearer <jeton>` et le rôle `ADMIN`. Sans jeton valide : `401` « Authentification requise. ». Les gardes sont posées sur la classe du contrôleur.

Il n'existe ni `POST`, ni `PATCH`, ni `PUT` sous `/admin/applications`.

### Forme d'une candidature

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c5",
  "firstName": "Prénom",
  "lastName": "Nom",
  "email": "prenom.nom@exemple.org",
  "phone": "+261 00 00 000 00",
  "applicantStatus": "etudiant",
  "cv": {
    "name": "cv.pdf",
    "mimeType": "application/pdf",
    "size": 245760
  },
  "createdAt": "2026-10-01T08:00:00.000Z"
}
```

`cv` ne contient jamais d'adresse ni d'identifiant de stockage. La forme est la même dans la liste et dans la fiche.

### `GET /admin/applications`

| Paramètre | Règle | Défaut |
|---|---|---|
| `page` | Entier ≥ 1. | 1 |
| `limit` | Entier de 1 à 100. | 20 |
| `q` | 2 caractères au moins. Recherche par mot entier dans le prénom, le nom et l'email. | — |
| `from` | Date ISO 8601. Borne incluse. Sans heure : début de la journée, en temps universel. | — |
| `to` | Date ISO 8601. Borne incluse. Sans heure : fin de la journée, en temps universel. | — |
| `sort` | `createdAt`, `-createdAt`, `lastName`, `-lastName`. | `-createdAt` |

Réponse `200` : `{ "data": [ … ], "meta": { "page", "limit", "total", "totalPages" } }`.

`from` postérieur à `to` : `200`, liste vide. Paramètre mal formé ou non prévu : `400` avec `details`.

### `GET /admin/applications/:id`

`200` : la candidature. `400` « Identifiant invalide. ». `404` « Ressource introuvable. ».

### `GET /admin/applications/:id/cv`

`200` : le fichier lui-même, à l'identique de celui déposé.

| En-tête | Valeur |
|---|---|
| `Content-Type` | Le type constaté au dépôt. |
| `Content-Length` | La taille du fichier. |
| `Content-Disposition` | `attachment`, avec le nom d'origine. |
| `Cache-Control` | `no-store` |

Aucun en-tête ne porte d'adresse ni d'identifiant de stockage.

| Code | Cas |
|---|---|
| `400` | Identifiant mal formé : « Identifiant invalide. » |
| `404` | Candidature inconnue, ou fichier absent du stockage : « Ressource introuvable. » |
| `503` | Stockage injoignable ou en erreur : « Service indisponible. » |

### `DELETE /admin/applications/:id`

`204` sans corps : le fichier est supprimé du stockage, puis la candidature.

Si le fichier est déjà absent du stockage, il est considéré comme déjà supprimé : la candidature est supprimée quand même et la réponse reste `204`. Le serveur journalise le fait et l'identifiant de la candidature, rien d'autre ; rien n'en est dit au client.

| Code | Cas |
|---|---|
| `400` | Identifiant mal formé : « Identifiant invalide. » |
| `404` | Candidature inconnue : « Ressource introuvable. ». Jamais pour un fichier disparu. |
| `503` | Stockage indisponible, ou erreur autre que l'absence du fichier : « Service indisponible. » ; la candidature est conservée. |

## Messages de validation

Aucun autre message n'est créé pendant l'implémentation.

**Repris tels quels** des fonctionnalités précédentes :

| Champ | Message |
|---|---|
| `firstName` | Le prénom est obligatoire, 120 caractères au plus. |
| `lastName` | Le nom est obligatoire, 120 caractères au plus. |
| `email` | Adresse email invalide. |
| `phone` | Numéro de téléphone invalide. |
| `q` | La recherche doit compter 2 caractères au moins. |
| `sort` | Tri non autorisé. |
| `from`, `to` | La date doit être au format ISO 8601. |
| `page` | La page doit être un entier supérieur ou égal à 1. |
| `limit` | La taille de page doit être un entier entre 1 et 100. |
| champ non prévu | Champ non autorisé. |

**Nouveaux**, validés le 2026-10-02 :

| Champ | Cas | Message |
|---|---|---|
| `applicantStatus` | Absent ou autre valeur | La situation doit être « etudiant » ou « professionnel ». |
| `cv` | Absent ou vide | Le CV est obligatoire. |
| `cv` | Fichier dans un autre champ, ou plusieurs fichiers | Un seul fichier est attendu, dans le champ « cv ». |

## Configuration

| Variable | Obligatoire | Règle |
|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | oui | Nom du compte. |
| `CLOUDINARY_API_KEY` | oui | Clé d'API. |
| `CLOUDINARY_API_SECRET` | oui | Secret. Jamais transmis à un client, jamais journalisé, jamais versionné. |

Une variable absente ou vide arrête le démarrage, avec un message qui la nomme sans afficher de valeur. `apps/api/.env.example` porte les trois noms, sans valeur.

## Abstraction de stockage (interne à l'API)

Le module des candidatures ne connaît que cette interface ; elle ne nomme aucun fournisseur.

| Opération | Entrée | Sortie | Erreur |
|---|---|---|---|
| Envoyer | Contenu du fichier | Identifiant du fichier | Erreur de stockage |
| Lire | Identifiant | Contenu du fichier, ou « absent » | Erreur de stockage |
| Supprimer | Identifiant | « Supprimé » ou « déjà absent » ; le second n'est pas une erreur | Erreur de stockage |

Une erreur de stockage devient `503` pour l'appelant de l'API, sans aucun détail du fournisseur.
