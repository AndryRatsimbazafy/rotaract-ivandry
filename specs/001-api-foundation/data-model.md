# Data Model: Socle de l'API backend

**Aucune entité métier, aucune collection, aucun modèle Mongoose** n'est créé par cette fonctionnalité. Les modèles du projet sont décrits dans `ARCHITECTURE.md`, section 1, et arrivent avec leurs fonctionnalités.

La seule structure de données du socle est la configuration.

## Configuration

Lue dans les variables d'environnement, validée une fois au démarrage, puis immuable. Source : `ARCHITECTURE.md`, section 12.

| Variable | Obligatoire | Défaut | Règle de validité | Secret |
|---|---|---|---|---|
| `MONGODB_URI` | oui | | Commence par `mongodb://` ou `mongodb+srv://` | oui |
| `JWT_SECRET` | oui | | 32 caractères au moins | oui |
| `PORT` | non | `4000` | Entier de 1 à 65535 | non |
| `NODE_ENV` | non | `development` | `development` ou `production` | non |
| `JWT_EXPIRES_IN` | non | `8h` | Nombre suivi de `s`, `m`, `h` ou `d` | non |
| `CORS_ORIGINS` | non | vide | Origines séparées par des virgules ; chacune avec schéma et hôte, sans chemin | non |

Règles :

- Une variable obligatoire absente ou une valeur invalide empêche le démarrage ; le message nomme chaque variable en cause et n'affiche aucune valeur.
- `JWT_SECRET` et `JWT_EXPIRES_IN` sont validées par le socle mais ne sont utilisées qu'à partir de l'authentification.
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` et les variables de stockage ne sont ni lues ni exigées par le socle.
- Une valeur secrète n'apparaît ni dans le code, ni dans Git, ni dans un journal, ni dans une réponse.

## État de la connexion à la base

Non stocké : c'est l'état courant de la connexion, lu par la route de santé.

| État | Signification | Réponse de `GET /api/v1/health` |
|---|---|---|
| Connectée | La base répond | `200` |
| Tout autre état | La base n'est pas joignable | `503` |
