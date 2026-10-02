# Research: Authentification de l'administrateur

Phase 0 du plan. Chaque décision répond à une exigence de la [spec](./spec.md) et reste dans le cadre d'`ARCHITECTURE.md`. Aucune inconnue ne subsiste ; deux points sont à confirmer à l'implémentation et sont marqués comme tels.

## 1. Compte d'administration

- **Decision** : schéma Mongoose `Admin` dans `auth/schemas/admin.schema.ts`, trois champs : `email` (obligatoire, unique, en minuscules, sans espaces autour), `passwordHash` (obligatoire), `role` (obligatoire, seule valeur `ADMIN`). Option `timestamps`. Collection `admins`.
- **Rationale** : `ARCHITECTURE.md`, sections 1.7 et 3 ; FR-001. Aucun champ ajouté : la spec a écarté toute date de changement de mot de passe.
- **Alternatives considered** : un module `users`, écarté par l'architecture (« il n'y a pas d'utilisateurs »).

## 2. Hachage du mot de passe

- **Decision** : paquet `argon2`, type Argon2id, réglages par défaut de la bibliothèque. La vérification utilise la fonction de comparaison de la bibliothèque.
- **Rationale** : décision 6, FR-006. Les réglages par défaut suivent les recommandations courantes ; les ajuster à la main serait une complexité sans besoin constaté.
- **Alternatives considered** : `bcrypt`, écarté par la décision 6 ; régler mémoire et itérations, écarté faute de besoin.

## 3. Commande d'initialisation

- **Decision** : script npm `seed:admin` dans `apps/api/package.json`, lancé par `npm run seed:admin --workspace=api`. Il compile l'API (`nest build`) puis exécute un point d'entrée distinct, `auth/seed-admin.ts`, qui ouvre un contexte d'application NestJS sans serveur HTTP : il réutilise la configuration validée, la connexion à la base et le modèle `Admin`.
- **Lecture des deux valeurs** : `ADMIN_EMAIL` et `ADMIN_PASSWORD` sont placés temporairement dans `apps/api/.env`, et seulement là : le script npm passe ce fichier à Node (`--env-file`), ce qui évite de les taper dans le terminal, où ils resteraient dans l'historique. Ils sont retirés du fichier après la commande et avant la vérification normale de l'API. L'API ne les lit jamais : sa validation ne retient que ses six variables (FR-005). Ils ne sont jamais journalisés ni commités ; `.env.example` n'en porte que les noms.
- **Comportement** : aucun compte → création ; un compte de même email (comparé après normalisation) → mot de passe remplacé ; un compte d'un autre email → refus, rien n'est modifié (FR-004, FR-004a). Email invalide, mot de passe de moins de 12 caractères ou valeur absente → refus qui nomme la variable, sans valeur (FR-003).
- **Journal** : le contexte est créé sans le journal de NestJS, et la commande écrit ses propres messages. Sans cela, un échec de connexion à la base afficherait le nom d'hôte, comme constaté sur le socle (FR-013 du socle). Ni mot de passe, ni hachage, ni email existant ne sont affichés.
- **Rationale** : décision 5 ; principe III (automatisation justifiée par la sécurité). Réutiliser le contexte d'application évite de dupliquer la lecture de la configuration et la connexion.
- **Alternatives considered** : lancer le fichier TypeScript directement avec `ts-node`, écarté car la configuration `nodenext` du projet rend ce chemin fragile, alors que la compilation existe déjà ; un script autonome sans NestJS, écarté car il dupliquerait configuration et connexion ; une route d'initialisation, interdite par la décision 5.

## 4. Connexion

- **Decision** : `POST /auth/login` avec un DTO à deux champs, `email` et `password`, chacun « chaîne non vide ». L'email est normalisé (espaces retirés, minuscules) avant la recherche. Email inconnu ou mot de passe faux : même exception `401`, message « Email ou mot de passe incorrect. ».
- **Temps de traitement** : quand l'email est inconnu, un hachage factice est vérifié quand même, pour que la durée de la réponse ne révèle pas si l'email existe (FR-010, SC-004).
- **Validation, verrouillée** :
  - aucun contrôle de format d'email à la connexion, ni de longueur de mot de passe (FR-011) ;
  - `email` absent ou vide : `400`, « L'email est obligatoire. » ;
  - `password` absent ou vide : `400`, « Le mot de passe est obligatoire. » ;
  - email présent mais mal formé : traité comme un email inconnu, donc `401` ;
  - email inconnu et mot de passe faux : même `401`, même message, même corps ;
  - un champ en trop est refusé par le socle.
- **Alternatives considered** : valider le format de l'email à la connexion, écarté car un email mal formé est simplement un email inconnu, et doit recevoir la même réponse.

## 5. Jeton

- **Decision** : `@nestjs/jwt`, configuré depuis la configuration validée : secret `JWT_SECRET`, algorithme HS256 à la signature et **imposé à la vérification**, durée `JWT_EXPIRES_IN`. Contenu : `sub` (identifiant du compte), `role`, `iat`, `exp`. La réponse de connexion porte `expiresIn`, la durée effective en secondes.
- **Rationale** : `ARCHITECTURE.md`, section 7 ; FR-012 à FR-014. Imposer l'algorithme à la vérification évite qu'un jeton d'un autre algorithme soit accepté.
- **Alternatives considered** : Passport, écarté par l'architecture (une seule stratégie).

## 6. Règle de `JWT_EXPIRES_IN`

- **Decision** : dans `config/env.validation.ts`, la règle devient : « nombre suivi de `s`, `m`, `h` ou `d` ; durée strictement positive et de 8 heures au plus ». Une fonction convertit la valeur en secondes ; elle sert à la validation et à `expiresIn`. Le message de configuration nomme la variable et sa règle, sans la valeur, comme pour les autres.
- **Exemples** : acceptées `1s`, `60s`, `480m`, `8h`, `28800s` ; refusées `0s`, `0h`, `481m`, `9h`, `1d`. Une valeur négative est déjà refusée par le format.
- **Rationale** : FR-013, FR-013a. C'est le seul changement du socle (FR-026a).
- **Alternatives considered** : plafonner en silence à 8 heures, écarté car la spec demande un refus au démarrage.

## 7. Gardes et décorateurs

- **Decision** : `JwtAuthGuard` lit l'en-tête `Authorization: Bearer`, vérifie le jeton, relit le compte par son identifiant et l'attache à la requête ; tout échec lève `UnauthorizedException`. `RolesGuard` lit les rôles demandés par `@Roles` et lève `ForbiddenException` si le compte n'en a aucun. `@CurrentAdmin` donne le compte attaché. Les deux gardes sont posées **sur la classe** de chaque contrôleur d'administration ; `GET /auth/me` ne porte que la première.
- **Messages** : les gardes lèvent toujours l'exception sans message : le filtre du socle applique alors « Authentification requise. » et « Accès refusé. ». Une garde qui se contenterait de renvoyer « faux » produirait le message anglais de NestJS.
- **`401` et `403` restent distincts** : la première garde répond `401`, la seconde `403`. Avec l'unique rôle `ADMIN`, le `403` n'a pas de scénario métier naturel dans cette fonctionnalité : aucun jeton valide ne peut porter un autre rôle. Il est vérifié structurellement, par relecture de la garde.
- **Rationale** : `ARCHITECTURE.md`, sections 5 et 7 ; FR-015 à FR-019. La pose sur la classe rend la protection structurelle : une route ajoutée au contrôleur est protégée d'office.
- **Alternatives considered** : une garde globale avec un décorateur « public », écartée car l'architecture fixe la garde par contrôleur, et parce que la majorité des routes futures de lecture sont publiques.

## 8. Limitation de fréquence

- **Decision** : `@nestjs/throttler`, compteur en mémoire. La garde de limitation est posée **uniquement** sur `POST /api/v1/auth/login` : 5 demandes par fenêtre de 60 secondes et par adresse IP, toutes les demandes comptant, réussies ou non. **Aucune garde de limitation globale** n'est installée : le module de la bibliothèque est configuré, mais sa garde n'est déclarée que sur cette route. Message d'erreur configuré en français : « Trop de requêtes. Réessayez plus tard. ».
- **À confirmer à l'implémentation** : l'option de message de la bibliothèque. Son message par défaut est en anglais et ne serait pas remplacé par le filtre du socle ; si l'option ne convenait pas, la garde serait spécialisée localement pour lever l'exception sans message.
- **Adresse IP** : celle que voit le serveur. En local, c'est celle de l'appelant. Derrière un hébergeur, il faudra déclarer le mandataire de confiance ; c'est une question de déploiement, hors périmètre.
- **Rationale** : décision 17 ; FR-021, FR-022.
- **Alternatives considered** : un compteur écrit à la main, écarté car la bibliothèque est prévue par l'architecture ; un stockage partagé du compteur, écarté (une seule instance, spec : compteur en mémoire).

## 9. Opérations d'administration des années

- **Decision** : `rotary-years.admin.controller.ts`, contrôleur `admin/rotary-years` gardé sur la classe. Liste : la même méthode de service que la liste publique. Création : DTO `startYear` « entier, de 2000 à 2100 », message unique « L'année de début doit être un entier entre 2000 et 2100. » ; réponse `201`. Le doublon n'est pas recherché avant l'écriture : l'erreur de clé dupliquée de l'index unique est convertie en `409` « Cette année Rotary existe déjà. », ce qui couvre aussi deux demandes simultanées. Suppression : `204` ; année inconnue, `404`.
- **Rationale** : `specs/002-rotary-years/contracts/rotary-years.md` et sa research (décisions 7 et 8). Le socle ne convertit pas implicitement les types : `"2026"` reste un texte et est refusé.
- **Refus d'une année référencée** : aucune entité ne référence encore une année ; rien n'est écrit pour ce cas (FR-023 de `002`).

## 10. Identifiant mal formé

- **Decision** : un `ParseObjectIdPipe` dans `common/pipes/parse-object-id.pipe.ts`, qui lève un `400` « Identifiant invalide. ».
- **Rationale** : FR-025 ; emplacement prévu par `ARCHITECTURE.md`, section 5. `@nestjs/mongoose` fournit un pipe du même nom, mais son message est en anglais.
- **Alternatives considered** : utiliser le pipe de la bibliothèque, écarté pour son message.

## 11. Installation des dépendances

- **Decision** : une seule commande, depuis la racine : `npm install @nestjs/jwt argon2 @nestjs/throttler --workspace=api`.
- **Rationale** : règle du monorepo. Versions constatées au registre le 2026-10-02 : `@nestjs/jwt` 12.0.2, `argon2` 0.45.1, `@nestjs/throttler` 6.7.1.
- **À confirmer à l'implémentation** : `argon2` est un module natif ; son binaire précompilé doit s'installer sans compilation sur le poste. Sinon, le signaler avant de continuer.
