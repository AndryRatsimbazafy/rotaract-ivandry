# Contrat : format d'erreur commun

Référence : `ARCHITECTURE.md`, section 10 (« Erreurs »). Le socle met ce format en place ; il ne définit aucune erreur propre à une ressource.

## Forme

```json
{
  "statusCode": 404,
  "error": "Not Found",
  "message": "Ressource introuvable."
}
```

| Champ | Toujours présent | Contenu |
|---|---|---|
| `statusCode` | oui | Le code HTTP de la réponse. |
| `error` | oui | Le libellé standard du code HTTP. |
| `message` | oui | Une phrase en français, affichable telle quelle. |
| `details` | non | Seulement pour une erreur de validation : une entrée par champ en erreur. |

## Erreur de validation

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Données invalides.",
  "details": [{ "field": "email", "message": "Adresse email invalide." }]
}
```

L'exemple reprend celui d'`ARCHITECTURE.md`. Le socle n'a aucune route qui reçoive des données : ce cas sera observable avec la première fonctionnalité qui en a.

## Messages produits par le socle

| Code | Situation | Message |
|---|---|---|
| `400` | Corps de requête mal formé | Requête mal formée. |
| `400` | Validation en échec | Données invalides. |
| `404` | Adresse inconnue, ou méthode non prévue sur une adresse existante | Ressource introuvable. |
| `500` | Erreur interne | Une erreur interne est survenue. |
| `503` | Base injoignable, sur la route de santé | La base de données ne répond pas. |

## Messages par défaut par code

Ce tableau est la source de vérité des messages par défaut : le filtre les reprend à l'identique. Un message par défaut sert quand le code appelant n'en fournit pas ; un message fourni par le code appelant est conservé.

| Code | Message par défaut |
|---|---|
| `400` | Requête mal formée. |
| `401` | Authentification requise. |
| `403` | Accès refusé. |
| `404` | Ressource introuvable. |
| `405` | Méthode non autorisée. |
| `409` | Conflit avec une ressource existante. |
| `413` | Contenu trop volumineux. |
| `415` | Type de contenu non pris en charge. |
| `429` | Trop de requêtes. Réessayez plus tard. |
| `500` | Une erreur interne est survenue. |
| `503` | Service indisponible. |

Aucune route du socle ne produit `401`, `403`, `405`, `409`, `415` ni `429` ; leur usage est défini par les fonctionnalités concernées. Sur la route de santé, le `503` porte son propre message (« La base de données ne répond pas. »), pas le message par défaut.

## Règles

- Une réponse d'erreur ne contient jamais de trace d'exécution, de nom de fichier, de requête à la base ni l'adresse appelée.
- Une erreur interne est journalisée côté serveur par son type et ses lignes d'appel, sans son message, qui pourrait contenir un détail de connexion à la base ; le client ne reçoit que le message générique.
- Toute erreur de l'API, y compris sur une adresse hors de `/api/v1`, a cette forme.
