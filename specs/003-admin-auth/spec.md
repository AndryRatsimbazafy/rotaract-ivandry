# Feature Specification: Authentification de l'administrateur

**Feature Branch**: `003-admin-auth`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: « Authentification du backend : connexion de l'administrateur unique (`POST /auth/login`, `GET /auth/me`), jeton JWT HS256 de 8 heures, mot de passe haché en Argon2id, compte `ADMIN` créé par script manuel, gardes JWT et rôle `ADMIN` protégeant tout `/admin`, limitation de fréquence sur la connexion. Inclut la livraison du temps 2 de `002-rotary-years` (création, liste d'administration, suppression des années sous `/admin`), selon son contrat existant. »

**Références** : `ARCHITECTURE.md` (sections 0, 1.7, 3, 5, 6, 7, 8, 10 « Erreurs », 11, 12, 13 « Login », 14 décisions 5, 6, 9 et 17, 15), `PROJECT_CONTEXT.md`, `CLAUDE.md`, `.specify/memory/constitution.md` (principes I, III, V, VIII, IX), `specs/001-api-foundation/` (socle, `contracts/errors.md`), `specs/002-rotary-years/` (`spec.md` FR-016 à FR-025, `contracts/rotary-years.md`).

## Contexte et périmètre

L'API a un socle et une première ressource en lecture seule, les années Rotary. Rien ne peut encore être écrit : toute écriture passe par des routes d'administration, et aucune route `/admin` ne peut exister sans authentification (constitution, principe V ; `ARCHITECTURE.md`, décision 9).

Cette fonctionnalité met en place l'authentification de l'unique administrateur, puis s'en sert aussitôt pour livrer les premières routes d'administration : celles des années Rotary, spécifiées et différées par `002-rotary-years` (« temps 2 »).

Les choix ne sont pas à décider ici : ils sont verrouillés dans `ARCHITECTURE.md`, section 7 et décisions 5, 6, 9 et 17. Cette spec dit **ce que la fonctionnalité doit garantir** ; le plan dira comment.

### Dans le périmètre

1. Le compte d'administration : un seul, créé et mis à jour par une commande lancée à la main.
2. La connexion par email et mot de passe, qui délivre un jeton d'accès.
3. La lecture du compte connecté.
4. La protection de toute adresse d'administration : jeton valide et rôle `ADMIN` exigés.
5. La limitation du nombre de tentatives de connexion.
6. Les opérations d'administration des années Rotary (temps 2 de `002-rotary-years`) : création, liste d'administration, suppression. Elles sont les premières routes protégées, et la preuve que la protection fonctionne.

### Hors périmètre

- Tout écran : page de connexion, session, cookie, client API, MUI. `apps/admin` n'est pas modifié (étapes 6 et 7 d'`ARCHITECTURE.md`, section 15).
- Inscription, création de compte par l'API, gestion des comptes, second compte, autres rôles, permissions fines.
- Mot de passe oublié, changement de mot de passe par l'API, jeton de rafraîchissement, déconnexion côté API.
- Limitation de fréquence sur d'autres routes que la connexion (le dépôt de candidature aura la sienne avec sa fonctionnalité).
- Membres, mandats, actions, actualités, candidatures, médias, et leurs routes d'administration.
- Le message du refus de suppression d'une année référencée : fixé par la première fonctionnalité qui rend ce cas possible (`002-rotary-years`, hypothèses).
- La connexion du Front Office à l'API : `apps/web` et `DESIGN.md` ne sont pas modifiés. Le Front Office ne possède jamais de jeton.
- Les tests automatisés (constitution, principe IX).

## Clarifications

### Session 2026-10-02

- Q: Que fait la commande d'initialisation si un compte existe déjà avec un email différent de `ADMIN_EMAIL` ? → A: Elle refuse. Elle ne remplace pas l'email et ne crée pas de second compte. Avec le même email, elle remplace toujours le mot de passe.
- Q: Un jeton délivré avant un changement de mot de passe reste-t-il valable ? → A: Oui, jusqu'à son expiration normale. Le changement de mot de passe n'invalide aucun jeton existant. Aucun champ de date de changement n'est ajouté au compte.
- Q: L'API suit-elle `JWT_EXPIRES_IN` ou impose-t-elle 8 heures ? → A: Elle suit la variable, défaut 8 heures, sans jamais dépasser 8 heures : une valeur supérieure fait échouer la validation de configuration et empêche le démarrage.

- Q: Quelle est la durée minimale de `JWT_EXPIRES_IN` ? → A: Strictement positive. `0s` et toute durée négative sont refusées à la validation de configuration. Aucun minimum au-delà d'une seconde. Le maximum reste 8 heures.
- Q: Le message « Identifiant invalide. » est-il retenu ? → A: Oui, pour un identifiant mal formé lors de la suppression d'une année Rotary.

Choix validés à la même session : message de connexion refusée « Email ou mot de passe incorrect. » ; les 12 caractères minimum ne valent qu'à la création ou à l'initialisation du mot de passe ; 5 tentatives par minute et par adresse IP, toutes les tentatives comptant, réussies ou non ; compteur en mémoire ; limite sur la connexion seulement ; codes `201` et `204` à inscrire dans `ARCHITECTURE.md` avant l'implémentation.

## User Scenarios & Testing *(mandatory)*

Conformément à la constitution (principe IX), il n'y a pas de test automatisé : chaque récit décrit une **vérification manuelle**.

### User Story 1 - Créer le compte d'administration (Priority: P1)

Le porteur du projet crée l'unique compte d'administration en lançant une commande à la main, après avoir placé l'email et le mot de passe dans l'environnement. Le mot de passe n'est enregistré que sous forme hachée. Relancer la commande change le mot de passe.

**Why this priority** : sans compte, personne ne peut se connecter, et rien d'autre dans cette fonctionnalité n'est vérifiable.

**Independent Test** : vérification manuelle. Lancer la commande avec un email et un mot de passe de 12 caractères au moins : un compte existe en base, avec un mot de passe illisible. La relancer avec un autre mot de passe : il n'y a toujours qu'un compte, et seul le nouveau mot de passe permet de se connecter.

**Acceptance Scenarios** :

1. **Given** aucun compte, **When** la commande est lancée avec un email valide et un mot de passe de 12 caractères au moins, **Then** un compte de rôle `ADMIN` est créé, son email est enregistré en minuscules, et son mot de passe n'est enregistré que haché.
2. **Given** un compte existant, **When** la commande est relancée avec le même email et un nouveau mot de passe, **Then** le mot de passe est remplacé et il n'existe toujours qu'un seul compte.
3. **Given** un mot de passe de moins de 12 caractères, un email invalide, ou l'une des deux valeurs absente, **When** la commande est lancée, **Then** elle échoue avec un message qui nomme la valeur en cause sans l'afficher, et rien n'est créé ni modifié.
4. **Given** une commande réussie, **When** on lit ce qu'elle a affiché, **Then** ni le mot de passe ni son hachage n'y apparaissent.
5. **Given** l'API en fonctionnement, **When** elle démarre sans `ADMIN_EMAIL` ni `ADMIN_PASSWORD`, **Then** elle démarre normalement : ces deux valeurs ne servent qu'à la commande.
6. **Given** un compte existant, **When** la commande est relancée avec un **autre** email, **Then** elle refuse l'opération en indiquant qu'un compte d'administration existe déjà, sans afficher son email ; l'email et le mot de passe du compte existant sont inchangés et aucun second compte n'est créé.
7. **Given** un compte existant, **When** la commande est relancée avec le même email écrit avec une autre casse ou des espaces autour, **Then** c'est le même compte : son mot de passe est remplacé.

---

### User Story 2 - Se connecter et obtenir un jeton (Priority: P1)

L'administrateur envoie son email et son mot de passe ; il reçoit un jeton d'accès, valable 8 heures au plus, et la description de son compte. Une erreur d'identifiants reçoit toujours la même réponse, qu'elle porte sur l'email ou sur le mot de passe.

**Why this priority** : c'est l'entrée de tout le Back Office futur.

**Independent Test** : vérification manuelle. Se connecter avec les bons identifiants : réponse avec jeton, type, durée et compte. Recommencer avec un mauvais mot de passe, puis avec un email inconnu : même code, même message dans les deux cas.

**Acceptance Scenarios** :

1. **Given** un compte existant, **When** l'administrateur envoie le bon email et le bon mot de passe, **Then** la réponse contient un jeton d'accès, son type (`Bearer`), sa durée en secondes et le compte (`id`, `email`, `role`), sans aucun élément du mot de passe.
2. **Given** un compte existant, **When** l'email est envoyé avec des majuscules ou des espaces autour, **Then** la connexion réussit comme avec l'email exact.
3. **Given** un mot de passe faux, **When** la connexion est demandée, **Then** la réponse est `401` avec un message générique.
4. **Given** un email inconnu, **When** la connexion est demandée, **Then** la réponse est `401`, avec exactement le même corps que pour un mot de passe faux.
5. **Given** une demande sans email ou sans mot de passe, ou avec un champ non prévu, **When** elle est traitée, **Then** la réponse est `400` au format de validation, avec le détail par champ.
6. **Given** une connexion réussie ou échouée, **When** on lit le journal de l'API, **Then** ni le mot de passe, ni le jeton, ni le hachage n'y figurent.

---

### User Story 3 - Protéger l'administration (Priority: P1)

Toute adresse d'administration, et la lecture du compte connecté, exigent un jeton valide. Un appel sans jeton, avec un jeton altéré ou expiré, est refusé avant toute lecture ou écriture.

**Why this priority** : c'est la raison d'être de la fonctionnalité. Une seule route d'administration laissée ouverte suffirait à tout compromettre.

**Independent Test** : vérification manuelle. Lire le compte connecté sans jeton, avec un jeton altéré, puis avec un jeton valide : deux refus `401`, puis le compte. Refaire de même sur une route d'administration.

**Acceptance Scenarios** :

1. **Given** un jeton valide, **When** l'administrateur lit le compte connecté, **Then** il reçoit `id`, `email` et `role`, et rien d'autre.
2. **Given** aucun jeton, un jeton mal formé, un jeton signé avec un autre secret ou un jeton expiré, **When** une adresse protégée est appelée, **Then** la réponse est `401` au format commun, identique dans les quatre cas.
3. **Given** un jeton valide dont le compte n'existe plus, **When** une adresse protégée est appelée, **Then** la réponse est `401`.
4. **Given** un jeton valide dont le rôle n'est pas `ADMIN`, **When** une adresse d'administration est appelée, **Then** la réponse est `403`.
5. **Given** une adresse publique (santé, liste publique des années), **When** elle est appelée sans jeton, **Then** elle répond comme avant.
6. **Given** un jeton délivré, **When** sa durée de validité (8 heures par défaut, jamais plus) est écoulée, **Then** il est refusé et l'administrateur doit se reconnecter : il n'y a pas de renouvellement.
7. **Given** un jeton encore valide délivré **avant** un changement de mot de passe, **When** il est utilisé après ce changement, **Then** il est accepté jusqu'à son expiration normale : le changement de mot de passe n'invalide aucun jeton déjà délivré.

---

### User Story 4 - Administrer les années Rotary (Priority: P2)

L'administrateur connecté ouvre une année Rotary, consulte la liste d'administration et retire une année créée par erreur. C'est le temps 2 de `002-rotary-years`, dont les règles sont déjà validées.

**Why this priority** : première utilisation réelle de la protection, et condition pour que l'API contienne enfin des années sans insertion manuelle. Dépend des récits 1 à 3.

**Independent Test** : vérification manuelle. Connecté : créer 2026 (`201`), la recréer (`409`), envoyer des valeurs invalides (`400`), lire la liste d'administration, supprimer l'année (`204`). Sans jeton : chacun de ces appels est refusé (`401`) et rien n'est lu ni modifié.

**Acceptance Scenarios** :

1. **Given** un administrateur connecté, **When** il exécute les opérations du contrat `specs/002-rotary-years/contracts/rotary-years.md` (section « Temps 2 »), **Then** chacune répond comme ce contrat le décrit : scénarios 1 à 10 du récit 3 de `002-rotary-years`.
2. **Given** un appel sans jeton valide, **When** il vise la création, la liste d'administration ou la suppression, **Then** il est refusé (`401`) et aucune année n'est lue, créée ni supprimée.
3. **Given** une année créée par l'administration, **When** on lit la liste publique, **Then** elle y apparaît, avec les mêmes valeurs calculées.
4. **Given** une suppression visant un identifiant mal formé, **When** elle est traitée, **Then** la réponse est `400` avec le message « Identifiant invalide. ».

---

### User Story 5 - Limiter les tentatives de connexion (Priority: P2)

Au-delà de cinq tentatives de connexion en une minute depuis une même adresse, les suivantes sont refusées sans même examiner les identifiants, jusqu'à la fin de la minute.

**Why this priority** : la connexion est la seule route où deviner un mot de passe est possible. La limite complète la protection sans en être la base.

**Independent Test** : vérification manuelle. Envoyer six demandes de connexion en moins d'une minute : les cinq premières sont traitées, la sixième reçoit `429`. Une minute plus tard, une nouvelle demande est traitée.

**Acceptance Scenarios** :

1. **Given** cinq tentatives de connexion en moins d'une minute depuis la même adresse, **When** une sixième arrive, **Then** la réponse est `429` au format commun, que les identifiants soient bons ou non.
2. **Given** une adresse bloquée, **When** la minute est écoulée, **Then** une nouvelle tentative est traitée normalement.
3. **Given** une adresse bloquée sur la connexion, **When** elle appelle une autre route, **Then** cette route répond normalement : la limite ne porte que sur la connexion.

---

### Edge Cases

- **Aucun compte créé** : toute connexion répond `401`, comme pour un email inconnu. L'API démarre normalement.
- **En-tête d'autorisation présent mais d'un autre type** (pas `Bearer`), ou `Bearer` sans jeton : `401`.
- **Jeton valide envoyé à une route publique** : ignoré, la route répond comme sans jeton.
- **`JWT_EXPIRES_IN` supérieure à 8 heures** (par exemple `1d`, `9h`, `481m`) : l'API refuse de démarrer et le message de configuration nomme `JWT_EXPIRES_IN`, sans afficher sa valeur. `8h`, `480m`, `28800s` et toute durée strictement positive plus courte sont acceptées.
- **`JWT_EXPIRES_IN` nulle ou négative** (`0s`, `0h`, `-1h`) : l'API refuse de démarrer, de la même façon. `1s` est acceptée : aucune durée minimale au-delà d'une seconde n'est imposée.
- **`JWT_EXPIRES_IN` absente ou vide** : 8 heures, comme dans le socle.
- **Changement d'email du compte** : la commande ne le fait pas. Il faut retirer le compte à la main dans la base, puis relancer la commande.
- **Corps de connexion mal formé** (JSON invalide) : `400` du socle.
- **Base injoignable pendant une connexion** : erreur au format commun, sans détail technique ; jamais un `401` trompeur.
- **Commande d'initialisation lancée sans base joignable** : elle échoue avec un message générique, sans adresse ni identifiant de la base.
- **Suppression d'une année référencée** : aucune entité ne référence encore une année ; toute année est supprimable (`002-rotary-years`, FR-023).

## Requirements *(mandatory)*

### Functional Requirements

**Compte d'administration**

- **FR-001** : Il MUST exister au plus un compte d'administration. Il porte un email unique, enregistré en minuscules, un mot de passe enregistré uniquement sous forme hachée, et le rôle `ADMIN`, seule valeur possible.
- **FR-002** : Le compte MUST être créé uniquement par une commande lancée à la main, qui lit l'email et le mot de passe dans `ADMIN_EMAIL` et `ADMIN_PASSWORD`. Aucune route de l'API ne crée, ne modifie ni ne supprime de compte.
- **FR-003** : La commande MUST refuser un email invalide, un mot de passe de moins de 12 caractères, ou une valeur absente, en nommant la valeur en cause sans l'afficher, et sans rien créer ni modifier.
- **FR-004** : Relancer la commande avec l'email du compte existant (comparé sans tenir compte de la casse ni des espaces autour) MUST remplacer son mot de passe, sans créer de second compte. C'est le seul moyen de changer le mot de passe en V1.
- **FR-004a** : Si un compte existe et que `ADMIN_EMAIL` désigne un autre email, la commande MUST refuser l'opération : elle MUST NOT remplacer l'email, MUST NOT modifier le mot de passe et MUST NOT créer de second compte. Son message indique qu'un compte existe déjà, sans afficher l'email existant.
- **FR-005** : `ADMIN_EMAIL` et `ADMIN_PASSWORD` MUST NOT être lus ni exigés par l'API en fonctionnement.
- **FR-006** : Le mot de passe MUST être haché avec l'algorithme fixé par `ARCHITECTURE.md`, section 7. Ni le mot de passe ni son hachage MUST NOT apparaître dans une réponse, un journal, ni la sortie de la commande.

**Connexion**

- **FR-007** : L'API MUST offrir une connexion sur `POST /api/v1/auth/login`, publique, qui reçoit `email` et `password`.
- **FR-008** : Une connexion réussie MUST renvoyer, dans la forme de l'exemple d'`ARCHITECTURE.md`, section 13 : `accessToken`, `tokenType` (`Bearer`), `expiresIn` (durée en secondes) et `admin` (`id`, `email`, `role`).
- **FR-009** : L'email reçu MUST être comparé sans tenir compte de la casse ni des espaces de début et de fin.
- **FR-010** : Un email inconnu et un mot de passe faux MUST recevoir exactement la même réponse : `401`, même message. Rien dans la réponse ne MUST permettre de savoir si l'email existe.
- **FR-011** : Une demande de connexion sans `email`, sans `password`, ou avec un champ non prévu MUST être refusée par une erreur de validation (`400`) avec le détail par champ. La règle des 12 caractères MUST NOT être appliquée à la connexion : elle ne vaut qu'à la création du mot de passe.

**Jeton**

- **FR-012** : Le jeton MUST être signé avec `JWT_SECRET`, selon l'algorithme fixé par `ARCHITECTURE.md`, section 7, et porter l'identifiant du compte, son rôle, sa date d'émission et sa date d'expiration.
- **FR-013** : Le jeton MUST expirer après la durée donnée par `JWT_EXPIRES_IN`, 8 heures par défaut. Cette durée MUST NOT dépasser 8 heures : la décision verrouillée d'`ARCHITECTURE.md` (décision 6) devient un maximum.
- **FR-013a** : Une valeur de `JWT_EXPIRES_IN` supérieure à 8 heures MUST faire échouer la validation de la configuration au démarrage, avec un message qui nomme la variable sans afficher sa valeur. Il en va de même d'une durée nulle ou négative (`0s`, toute durée négative). Toute durée strictement positive et inférieure ou égale à 8 heures MUST être acceptée, sans autre minimum : `1s`, `60s`, `480m`, `8h` sont acceptées ; `0s`, `481m`, `9h`, `1d` sont refusées. `expiresIn`, dans la réponse de connexion, MUST être la durée effective en secondes.
- **FR-013b** : Un changement de mot de passe MUST NOT invalider les jetons déjà délivrés : ils restent valables jusqu'à leur expiration. Aucune date de changement de mot de passe n'est enregistrée sur le compte. Il n'existe ni jeton de rafraîchissement, ni renouvellement, ni déconnexion côté API.
- **FR-014** : Le jeton MUST être transmis dans l'en-tête `Authorization: Bearer <jeton>`.

**Protection**

- **FR-015** : Toute adresse sous `/api/v1/admin` MUST exiger un jeton valide **et** le rôle `ADMIN`. Les deux vérifications MUST rester distinctes.
- **FR-016** : `GET /api/v1/auth/me` MUST exiger un jeton valide et renvoyer le compte connecté : `id`, `email`, `role`.
- **FR-017** : À chaque appel protégé, le compte désigné par le jeton MUST être relu : s'il n'existe plus, l'appel est refusé (`401`).
- **FR-018** : Un jeton absent, mal formé, de signature invalide ou expiré MUST donner `401` ; un jeton valide de rôle insuffisant MUST donner `403`. Dans les deux cas, aucune donnée n'est lue ni modifiée.
- **FR-019** : La protection MUST être structurelle : une route d'administration ajoutée plus tard dans un contrôleur d'administration est protégée sans action supplémentaire (`ARCHITECTURE.md`, section 5).
- **FR-020** : Les routes publiques existantes (`GET /api/v1/health`, `GET /api/v1/rotary-years`) MUST rester accessibles sans jeton et inchangées.

**Limitation de fréquence**

- **FR-021** : La connexion MUST être limitée à 5 tentatives par minute et par adresse IP. Au-delà, la réponse est `429` au format commun, sans examen des identifiants.
- **FR-022** : La limite MUST porter sur toutes les tentatives, réussies ou non, et sur la connexion seulement.

**Années Rotary : opérations d'administration (temps 2 de `002-rotary-years`)**

- **FR-023** : Cette fonctionnalité MUST livrer les exigences FR-016 à FR-025 de `specs/002-rotary-years/spec.md`, telles que décrites par `specs/002-rotary-years/contracts/rotary-years.md` : création (`201`, `409` en cas de doublon, `400` en cas de valeur invalide), liste d'administration, suppression (`204`, `400` pour un identifiant mal formé, `404` pour une année inconnue). Ces règles ne sont ni réécrites ni modifiées ici.
- **FR-024** : Ces trois opérations MUST être protégées dès leur création, conformément à FR-015. À aucun moment une route `/admin` ne MUST exister sans protection.
- **FR-025** : Un identifiant mal formé MUST donner `400` avec le message « Identifiant invalide. ».
- **FR-026** : Le modèle, les calculs et la liste publique livrés par le temps 1 MUST NOT être modifiés.
- **FR-026a** : Du socle, seule la règle de validité de `JWT_EXPIRES_IN` est modifiée (durée strictement positive et de 8 heures au plus, FR-013a). Les autres variables, le format d'erreur, la validation globale et le journal sont inchangés.

**Erreurs et messages**

- **FR-027** : Toutes les erreurs MUST suivre le format commun du socle, en français. Messages : connexion refusée, « Email ou mot de passe incorrect. » ; jeton absent, invalide ou expiré, « Authentification requise. » ; rôle insuffisant, « Accès refusé. » ; limite atteinte, « Trop de requêtes. Réessayez plus tard. ». Les trois derniers sont les messages par défaut du socle.

**Limites**

- **FR-028** : Cette fonctionnalité MUST NOT modifier `apps/web`, `apps/admin` ni `DESIGN.md`, ni créer de route pour une autre ressource que l'authentification et les années Rotary.
- **FR-029** : Aucun secret MUST NOT figurer dans le code ni dans Git. Le fichier d'exemple des variables liste les noms nouveaux, sans valeur.

### Key Entities

- **Admin** : le compte d'administration, unique. Email (unique, en minuscules), mot de passe haché (jamais renvoyé), rôle (`ADMIN`, seule valeur). Hors des entités métier du club.
- **Jeton d'accès** : preuve de connexion, non enregistrée. Désigne un compte et son rôle, avec une date d'émission et une date d'expiration.
- **RotaryYear** : inchangée ; voir `specs/002-rotary-years/data-model.md`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : Le porteur du projet crée le compte d'administration en une commande, sans intervention dans la base.
- **SC-002** : L'administrateur obtient un jeton en une demande, avec ses seuls email et mot de passe.
- **SC-003** : 100 % des appels à une adresse d'administration sans jeton valide sont refusés, et aucun ne lit ni ne modifie de donnée.
- **SC-004** : Un email inconnu et un mot de passe faux produisent des réponses indiscernables.
- **SC-005** : Le mot de passe en clair n'existe nulle part après la commande : ni en base, ni dans un journal, ni dans une réponse, ni dans Git.
- **SC-006** : Un jeton cesse d'être accepté au terme de sa durée de validité, et aucune configuration ne permet de délivrer un jeton valable plus de 8 heures.
- **SC-007** : La sixième tentative de connexion en une minute depuis une même adresse est refusée.
- **SC-008** : L'administrateur connecté crée, liste et supprime une année Rotary sans aucune insertion manuelle dans la base ; l'année créée apparaît dans la liste publique.
- **SC-009** : Les routes publiques existantes répondent exactement comme avant.
- **SC-010** : Le Front Office et le Back Office sont strictement inchangés : aucun fichier de `apps/web`, `apps/admin` ni `DESIGN.md` n'est modifié, et leurs builds passent comme avant.

## Assumptions

- **Commande d'initialisation.** C'est une automatisation, que la constitution (principe III) demande de justifier : elle l'est par la sécurité (le hachage ne peut pas se faire à la main de façon fiable) et elle est verrouillée par `ARCHITECTURE.md`, décision 5. Son nom (`npm run seed:admin --workspace=api`) est celui de l'architecture.
- **Limite par adresse IP.** `ARCHITECTURE.md` fixe « 5 tentatives par minute et par adresse IP ». Le Back Office appellera l'API depuis son serveur : toutes ses connexions viendront de la même adresse. Avec un seul administrateur, c'est acceptable. La manière de reconnaître l'adresse d'origine derrière un hébergeur relève du plan et du déploiement, hors périmètre pour l'instant.
- **Compteur de tentatives en mémoire.** La limite n'a pas besoin de survivre à un redémarrage de l'API ; aucun stockage n'est ajouté pour elle.
- **Message de connexion refusée.** « Email ou mot de passe incorrect. », validé par le porteur du projet ; `ARCHITECTURE.md` fixe le code `401` et l'identité des deux réponses.
- **Jetons après un changement de mot de passe.** Conséquence acceptée de la décision : un jeton obtenu avec l'ancien mot de passe reste utilisable 8 heures au plus. Le seul moyen de couper court est de changer `JWT_SECRET`, ce qui invalide tous les jetons.
- **Documents à aligner avant l'implémentation** (constitution, principe I) : `ARCHITECTURE.md`, section 12 (`JWT_EXPIRES_IN` : défaut `8h`, durée strictement positive, maximum 8 heures) et section 6 (codes `201` et `204`) ; `specs/001-api-foundation/data-model.md` (règle de `JWT_EXPIRES_IN`).
- **Message d'identifiant mal formé.** « Identifiant invalide. », validé par le porteur du projet pour la suppression d'une année Rotary. Sa reprise par d'autres ressources sera décidée avec elles.
- **Dépendances.** Seules des dépendances déjà listées dans `ARCHITECTURE.md`, section 5, sont attendues ; leur liste exacte est établie au plan et soumise à validation.
- **Back Office.** Rien n'est construit dans `apps/admin`. Le cookie, la session et la page de connexion décrits dans `ARCHITECTURE.md`, section 11, arrivent avec le socle du Back Office.
- **Vérification.** Elle suppose une base joignable et un compte créé par la commande. Le compte créé pour la vérification est celui du porteur du projet, avec ses propres identifiants ; aucune année de vérification n'est laissée en base.
- **Branche.** La branche `003-admin-auth` a été créée par Spec Kit, avec l'accord explicite du porteur du projet.
