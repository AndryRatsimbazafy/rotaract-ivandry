# Contrat : GET /api/v1/health

Route technique, publique, non métier. Référence : `ARCHITECTURE.md`, section 6 (« Route technique ») et décision 16.

## Requête

`GET /api/v1/health`, sans paramètre, sans corps, sans authentification.

## Réponse `200` : l'API et la base répondent

```json
{
  "status": "ok",
  "database": "up"
}
```

## Réponse `503` : la base n'est pas joignable

Au format d'erreur commun ([errors.md](./errors.md)) :

```json
{
  "statusCode": 503,
  "error": "Service Unavailable",
  "message": "La base de données ne répond pas."
}
```

## Règles

- La réponse ne contient jamais l'adresse de la base, un identifiant, un nom d'hôte, une version de composant ni une durée de fonctionnement.
- La route n'écrit rien et n'envoie aucune requête à la base : elle lit l'état de la connexion.
- Si l'API elle-même ne tourne pas, il n'y a pas de réponse : c'est l'absence de réponse qui l'indique.
