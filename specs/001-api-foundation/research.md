# Research: Socle de l'API backend

Phase 0 du plan. Chaque décision répond à une exigence de la [spec](./spec.md) et reste dans le cadre d'`ARCHITECTURE.md`. Aucune inconnue ne subsiste.

## 1. Lecture et validation de la configuration

- **Decision** : `@nestjs/config`, module global, avec une fonction `validate` qui transforme l'environnement en une classe et la contrôle avec `class-validator`. Fichier local `apps/api/.env`, non versionné ; `apps/api/.env.example` versionné, noms seuls.
- **Rationale** : c'est le mécanisme officiel de NestJS, et `class-validator` est déjà requis par la validation des entrées : aucune bibliothèque de plus. La validation au démarrage satisfait FR-008. Toutes les erreurs sont rassemblées pour nommer chaque variable en cause.
- **Alternatives considered** : un schéma Joi (la voie documentée la plus courante), écarté car c'est une dépendance supplémentaire pour le même résultat ; une lecture directe de `process.env`, écartée car sans validation centralisée ni typage.

## 2. Règles de validité des variables

- **Decision** : `MONGODB_URI` obligatoire, commençant par `mongodb://` ou `mongodb+srv://` ; `JWT_SECRET` obligatoire, 32 caractères au moins ; `PORT` entier de 1 à 65535, défaut 4000 ; `NODE_ENV` parmi `development` et `production`, défaut `development` ; `JWT_EXPIRES_IN` au format nombre suivi de `s`, `m`, `h` ou `d`, défaut `8h` ; `CORS_ORIGINS` liste séparée par des virgules, chaque élément étant une origine (schéma, hôte, port éventuel, sans chemin), défaut vide.
- **Rationale** : valeurs et défauts d'`ARCHITECTURE.md`, section 12. Vérifier le préfixe de l'adresse de base évite qu'une valeur mal formée soit reprise dans un message d'erreur du pilote.
- **Alternatives considered** : ne valider que la présence, écarté car un port ou une origine invalides échoueraient plus tard, moins clairement.

## 3. Connexion à la base et échec au démarrage

- **Decision** : `MongooseModule.forRootAsync`, alimenté par la configuration, dans `app.module.ts`. Trois tentatives, deux secondes d'intervalle, cinq secondes de délai de sélection du serveur, journal détaillé des tentatives désactivé. Après la dernière tentative, le démarrage échoue : `main.ts` journalise un message générique (« Connexion à la base de données impossible. ») et termine le processus avec un code d'erreur. En cas de succès, un message de connexion établie est journalisé.
- **Rationale** : la spec suppose que l'API ne démarre pas « à vide ». Les réglages par défaut de NestJS (neuf tentatives de trois secondes, avec la trace de l'erreur) feraient attendre près de trente secondes et pourraient afficher des noms d'hôtes ; FR-013 demande qu'aucun détail de connexion n'apparaisse.
- **Alternatives considered** : démarrer sans base et réessayer en tâche de fond, écarté car contraire à l'hypothèse de la spec et plus complexe ; un dossier `database/` avec son module, écarté car il ne contiendrait qu'un appel de configuration.

## 4. Préfixe d'API

- **Decision** : `app.setGlobalPrefix('api/v1')`.
- **Rationale** : une ligne, conforme à la décision 8 d'`ARCHITECTURE.md`. Toute route future hérite du préfixe sans y penser.
- **Alternatives considered** : le versionnage par URI de NestJS (`enableVersioning`), écarté : il n'y a qu'une version, et le mécanisme ajouterait un décorateur de version sur chaque contrôleur.

## 5. Format d'erreur unique

- **Decision** : un filtre d'exception global qui attrape tout. Pour une exception HTTP, il renvoie `statusCode`, `error` (libellé standard du code) et `message` en français, tiré d'une table par code (`400`, `401`, `403`, `404`, `405`, `409`, `413`, `415`, `429`, `500`, `503`) sauf si le code appelant a fourni son propre message. Pour toute autre erreur : `500`, message générique, et l'erreur est journalisée côté serveur seulement. Un corps JSON mal formé donne `400`.
- **Rationale** : FR-017 à FR-019. Les messages par défaut de NestJS sont en anglais (« Cannot GET /… ») et répètent l'adresse appelée ; la table les remplace.
- **Alternatives considered** : laisser le format par défaut de NestJS, proche mais en anglais et sans `details` structuré ; un filtre par type d'exception, écarté car un seul filtre suffit.

## 6. Validation globale des entrées

- **Decision** : `ValidationPipe` global avec `whitelist`, `forbidNonWhitelisted`, `transform`, et une fabrique d'exception qui convertit les erreurs en `details: [{ field, message }]` avec le message général « Données invalides. ».
- **Rationale** : options fixées par `ARCHITECTURE.md`, section 8 ; forme de `details` fixée par la section 10. Le socle n'a aucun DTO : il prépare seulement le comportement dont les fonctionnalités suivantes hériteront. Les messages par champ, en français, seront écrits avec chaque DTO.
- **Alternatives considered** : attendre la première fonctionnalité avec des entrées, écarté car le format d'erreur de validation fait partie du contrat commun (FR-020).

## 7. En-têtes de sécurité

- **Decision** : `helmet()` avec ses réglages par défaut, appliqué avant toute route.
- **Rationale** : décision 17 d'`ARCHITECTURE.md`. Une API JSON n'a pas besoin de régler la politique de contenu ; les défauts conviennent.
- **Alternatives considered** : écrire les en-têtes à la main, écarté car c'est réinventer une liste que la bibliothèque tient à jour.

## 8. Origines croisées

- **Decision** : `enableCors` n'est appelé que si `CORS_ORIGINS` contient au moins une origine, avec exactement cette liste. Sinon CORS reste désactivé et aucune origine croisée n'est autorisée.
- **Rationale** : FR-022, FR-023 ; politique d'`ARCHITECTURE.md`, section 12. Aucune autre politique n'est décidée ici.
- **Alternatives considered** : autoriser `localhost:3000` et `3001` en développement, écarté : les deux fronts appelleront l'API depuis leur serveur, pas depuis le navigateur.

## 9. Route de santé

- **Decision** : un module `health` avec un contrôleur. Il lit l'état de la connexion Mongoose : connectée, il répond `200` ; sinon il lève une exception `503` qui passe par le filtre commun. Contrat dans [contracts/health.md](./contracts/health.md).
- **Rationale** : FR-024, décision 16. L'état de connexion est tenu à jour par Mongoose ; aucune requête n'est envoyée à la base.
- **Alternatives considered** : `@nestjs/terminus`, écarté car c'est une dépendance hors liste pour une seule vérification ; une commande `ping` à chaque appel, plus exacte à la seconde près mais qui ferait travailler la base à chaque sonde. Limite connue et acceptée : après une coupure, l'état peut mettre quelques secondes à passer à « injoignable ».

## 10. Journalisation

- **Decision** : le journal intégré de NestJS, sans ajout.
- **Rationale** : hypothèse de la spec. Trois messages utiles au démarrage : configuration valide, base connectée, port d'écoute.
- **Alternatives considered** : une bibliothèque de journalisation structurée, écartée faute de besoin.

## 11. Installation des dépendances

- **Decision** : une seule commande, lancée depuis la racine : `npm install @nestjs/config @nestjs/mongoose mongoose class-validator class-transformer helmet --workspace=api`.
- **Rationale** : règle du monorepo (installation depuis la racine, sans hoisting). Les versions majeures sont celles constatées au registre le 2026-10-01 ; `@nestjs/config` et `@nestjs/mongoose` 12 déclarent NestJS 12 comme pair compatible.
- **Alternatives considered** : aucune.
