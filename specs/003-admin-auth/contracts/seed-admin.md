# Contrat : commande d'initialisation du compte

Référence : `ARCHITECTURE.md`, section 7 et décision 5.

## Lancement

Depuis la racine du dépôt :

```text
npm run seed:admin --workspace=api
```

Lancée à la main par le porteur du projet. Jamais par l'API, jamais automatiquement.

## Entrées

| Variable | Règle |
|---|---|
| `ADMIN_EMAIL` | Obligatoire. Email valide, 254 caractères au plus. Normalisé : espaces retirés, minuscules. |
| `ADMIN_PASSWORD` | Obligatoire. 12 caractères au moins. |

Placées **temporairement dans `apps/api/.env`**, et seulement là, le temps d'exécuter la commande. La commande a aussi besoin de la configuration de l'API (`MONGODB_URI`, `JWT_SECRET`) et d'une base joignable.

Déroulé :

1. Ajouter `ADMIN_EMAIL` et `ADMIN_PASSWORD` à `apps/api/.env`.
2. Lancer la commande.
3. **Retirer les deux variables de `apps/api/.env`**, avant de démarrer et de vérifier l'API normalement.

Garanties :

- L'API ne lit jamais ces deux variables : elles ne font pas partie de sa configuration.
- Elles n'apparaissent dans aucun journal, ni de la commande ni de l'API.
- Elles ne sont jamais commitées : `apps/api/.env` est ignoré par Git, et `apps/api/.env.example` ne porte que leurs noms, sans valeur.

## Comportement

| Situation | Effet | Message |
|---|---|---|
| Aucun compte | Compte créé, rôle `ADMIN` | « Compte d'administration créé. » |
| Un compte de même email | Mot de passe remplacé | « Mot de passe du compte d'administration mis à jour. » |
| Un compte d'un autre email | Rien n'est modifié | « Un compte d'administration existe déjà avec un autre email. Aucune modification. » |
| `ADMIN_EMAIL` absent ou invalide | Rien n'est modifié | « ADMIN_EMAIL : email valide obligatoire. » |
| `ADMIN_PASSWORD` absent ou trop court | Rien n'est modifié | « ADMIN_PASSWORD : 12 caractères au moins. » |
| Configuration de l'API invalide | Rien n'est modifié | Le message de configuration du socle. |
| Base injoignable | Rien n'est modifié | « Connexion à la base de données impossible. » |

Code de sortie : `0` pour les deux premières lignes, `1` pour les autres.

## Règles

- La sortie ne contient jamais le mot de passe, son hachage, l'email du compte existant, l'adresse ni le nom d'hôte de la base.
- Changer l'email du compte ne se fait pas par la commande : retirer le compte à la main dans la base, puis relancer.
- Changer le mot de passe n'invalide pas les jetons déjà délivrés.
