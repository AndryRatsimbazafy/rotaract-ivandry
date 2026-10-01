# Feature Specification: Socle de l'API backend

**Feature Branch**: `001-api-foundation`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: « Mettre en place le socle technique minimal de `apps/api` permettant aux futures fonctionnalités backend de s'appuyer sur une base cohérente. »

**Références** : `ARCHITECTURE.md` (sections 0, 5, 10 « Erreurs », 12, 14), `PROJECT_CONTEXT.md`, `CLAUDE.md`, `.specify/memory/constitution.md`.

## Contexte et périmètre

`apps/api` est aujourd'hui le gabarit d'origine : une seule route qui répond « Hello World! », aucune configuration, aucune base de données. Cette fonctionnalité en fait un socle sur lequel les fonctionnalités suivantes (authentification, années Rotary, membres, actions, actualités, candidatures) pourront se brancher sans rien refaire.

Le socle n'apporte **aucune fonctionnalité métier**. Ses utilisateurs sont la personne qui développe et exploite l'API, et, indirectement, les fonctionnalités qui viendront s'y appuyer.

Les choix techniques ne sont pas à décider ici : ils sont verrouillés dans `ARCHITECTURE.md`, section 14 (application modulaire, base de données et bibliothèque d'accès, préfixe `/api/v1`, typage strict). Cette spec dit **ce que le socle doit garantir** ; le plan dira comment.

### Dans le périmètre

1. L'application backend reste `apps/api`, organisée en modules selon `ARCHITECTURE.md`, section 5.
2. La configuration par variables d'environnement, vérifiée au démarrage.
3. La connexion à la base de données, prête à recevoir les modèles futurs.
4. Le préfixe global `/api/v1`.
5. Le format d'erreur commun et la validation des entrées, tels que décrits dans `ARCHITECTURE.md`.
6. La politique d'origines croisées (CORS) telle que documentée.

### Hors périmètre

Authentification `ADMIN`, garde JWT, compte `ADMIN` ; limitation du nombre de requêtes ; aides communes sans utilisateur (pagination, validation d'identifiant, énumérations, sous-documents de fichiers, slug) ; RotaryYear, Members, MemberMandates, Actions, News, Applications, Media ; envoi de fichiers et tout fournisseur de stockage ; Back Office ; migration du Front Office ; tests automatisés ; Docker ; CI/CD ; déploiement.

Aucune collection métier, aucun endpoint métier, aucun contrat d'API métier n'est créé par cette fonctionnalité. `DESIGN.md` et `apps/web` ne sont pas modifiés.

## Clarifications

### Session 2026-10-01

- Q: Une fois la route « Hello World! » retirée, le socle doit-il exposer une route technique qui indique si l'API tourne et si la base de données répond ? → A: Oui : `GET /api/v1/health`, qui renvoie l'état de l'API et de la connexion à la base.
- Q: Le socle doit-il créer dès maintenant les aides communes prévues par `ARCHITECTURE.md` (pagination, validation d'identifiant, énumérations métier, sous-documents de fichiers, génération de slug) ? → A: Non : chaque aide est créée par la première fonctionnalité qui en a besoin.
- Q: Le socle doit-il mettre en place les en-têtes de sécurité HTTP et la limitation du nombre de requêtes ? → A: Les en-têtes de sécurité dans le socle ; la limitation de fréquence avec l'authentification.

## User Scenarios & Testing *(mandatory)*

Conformément à la constitution (principe IX), il n'y a pas de test automatisé : chaque récit décrit une **vérification manuelle**.

### User Story 1 - Démarrer l'API avec une configuration vérifiée (Priority: P1)

La personne qui développe renseigne les variables d'environnement à partir d'un fichier d'exemple, puis démarre l'API. Si une variable obligatoire manque ou est invalide, l'API refuse de démarrer et dit laquelle. Si tout est correct, elle démarre sur le port prévu.

**Why this priority** : sans configuration fiable, rien d'autre ne peut fonctionner, et une API qui démarre avec un secret absent est un risque de sécurité pour toutes les fonctionnalités suivantes.

**Independent Test** : vérification manuelle. Démarrer l'API sans `MONGODB_URI`, puis sans `JWT_SECRET`, puis avec toutes les variables : observer deux refus nommant la variable manquante, puis un démarrage réussi.

**Acceptance Scenarios** :

1. **Given** un environnement sans `MONGODB_URI`, **When** l'API démarre, **Then** elle s'arrête avec un message qui nomme `MONGODB_URI` et n'accepte aucune requête.
2. **Given** un environnement sans `JWT_SECRET`, ou avec un `JWT_SECRET` trop court, **When** l'API démarre, **Then** elle s'arrête avec un message qui nomme `JWT_SECRET`.
3. **Given** toutes les variables obligatoires renseignées et `PORT` absent, **When** l'API démarre, **Then** elle écoute sur le port 4000.
4. **Given** `PORT` renseigné avec une valeur valide, **When** l'API démarre, **Then** elle écoute sur ce port.
5. **Given** un dépôt fraîchement cloné, **When** la personne lit le fichier d'exemple de `apps/api`, **Then** elle y trouve le nom de chaque variable, sans aucune valeur réelle.

---

### User Story 2 - Se connecter à la base de données au démarrage (Priority: P1)

Au démarrage, l'API établit sa connexion à la base de données indiquée par la configuration. La personne qui exploite l'API sait, en lisant le journal de démarrage, si la connexion est établie. Aucune collection métier n'est créée.

**Why this priority** : toutes les fonctionnalités suivantes lisent ou écrivent en base ; elles doivent trouver une connexion déjà en place.

**Independent Test** : vérification manuelle. Démarrer l'API avec une adresse de base valide, puis avec une adresse injoignable : observer dans le premier cas un message de connexion établie et un `200` sur `GET /api/v1/health`, dans le second un échec explicite sans que l'adresse complète ni ses identifiants apparaissent.

**Acceptance Scenarios** :

1. **Given** une adresse de base valide et joignable, **When** l'API démarre, **Then** le journal indique que la connexion est établie et l'API accepte des requêtes.
2. **Given** une adresse de base injoignable ou des identifiants refusés, **When** l'API démarre, **Then** l'échec est signalé clairement, sans afficher les identifiants ni l'adresse complète.
3. **Given** une API démarrée et connectée, **When** on consulte la base, **Then** aucune collection métier n'a été créée par le socle.
4. **Given** une API démarrée et connectée, **When** on appelle `GET /api/v1/health`, **Then** la réponse est un `200` qui indique que l'API et la base répondent.
5. **Given** une API démarrée dont la base est devenue injoignable, **When** on appelle `GET /api/v1/health`, **Then** la réponse est un `503` qui indique que la base ne répond pas, sans aucun détail de connexion.

---

### User Story 3 - Des adresses et des erreurs uniformes (Priority: P2)

Toute route de l'API vit sous `/api/v1`. Toute erreur, quelle que soit sa cause, a la même forme : celle de `ARCHITECTURE.md`, section 10. Une fonctionnalité future n'a donc ni à choisir son préfixe ni à inventer son format d'erreur.

**Why this priority** : c'est le contrat que les deux fronts consommeront. Le fixer dans le socle évite que chaque fonctionnalité le réinterprète.

**Independent Test** : vérification manuelle. Appeler une adresse inexistante sous `/api/v1` et une adresse hors préfixe : observer dans les deux cas une réponse `404` au format commun, avec un message en français.

**Acceptance Scenarios** :

1. **Given** une API démarrée, **When** on appelle une adresse inexistante sous `/api/v1`, **Then** la réponse est un `404` au format d'erreur commun (`statusCode`, `error`, `message`).
2. **Given** une API démarrée, **When** on appelle une adresse hors de `/api/v1`, **Then** aucune route n'y répond et la réponse est un `404` au même format.
3. **Given** une API démarrée, **When** on observe les en-têtes de n'importe quelle réponse, **Then** les en-têtes de sécurité HTTP sont présents.
4. **Given** une erreur interne inattendue, **When** elle survient pendant une requête, **Then** la réponse est un `500` au format commun, avec un message générique, sans détail technique ni trace d'exécution.
5. **Given** une route future qui reçoit des données invalides, **When** la validation échoue, **Then** la réponse est un `400` au format commun, avec un `details` listant chaque champ en erreur.

---

### User Story 4 - Une politique d'origines fermée par défaut (Priority: P3)

Par défaut, aucun navigateur n'est autorisé à appeler l'API depuis un autre site : les deux fronts l'appellent depuis leur serveur. Une liste d'origines autorisées peut être fournie par configuration, pour le jour où un envoi direct de fichiers serait retenu.

**Why this priority** : la politique est déjà décidée (`ARCHITECTURE.md`, section 12). Il s'agit seulement de la mettre en place telle quelle, sans en décider une autre.

**Independent Test** : vérification manuelle. Envoyer une requête portant une origine étrangère, sans puis avec cette origine dans `CORS_ORIGINS` : observer l'absence puis la présence de l'en-tête d'autorisation dans la réponse.

**Acceptance Scenarios** :

1. **Given** `CORS_ORIGINS` absent ou vide, **When** une requête arrive avec une origine de navigateur, **Then** la réponse n'autorise aucune origine croisée.
2. **Given** `CORS_ORIGINS` contenant une origine, **When** une requête arrive de cette origine, **Then** la réponse l'autorise, et seulement elle.
3. **Given** `CORS_ORIGINS` contenant une valeur qui n'est pas une origine valide, **When** l'API démarre, **Then** elle s'arrête avec un message qui nomme `CORS_ORIGINS`.

---

### Edge Cases

- `PORT` renseigné avec une valeur qui n'est pas un numéro de port valide : l'API refuse de démarrer et nomme la variable.
- Une variable présente mais vide est traitée comme absente : `PORT`, `NODE_ENV`, `JWT_EXPIRES_IN` et `CORS_ORIGINS` prennent leur valeur par défaut (pour `PORT`, 4000) ; `MONGODB_URI` et `JWT_SECRET` sont signalées comme manquantes et l'API refuse de démarrer. Le détail est dans `data-model.md`.
- Plusieurs variables obligatoires manquent : le message les nomme toutes, pas seulement la première.
- La base devient injoignable après un démarrage réussi : l'API reste en service ; une requête qui a besoin de la base échoue au format d'erreur commun, sans détail technique.
- Un corps de requête mal formé (JSON invalide) : `400` au format commun.
- Une méthode non prévue sur une adresse existante : réponse au format commun.
- Le fichier d'environnement local est présent dans le dépôt de travail : il reste ignoré par Git ; seul le fichier d'exemple est versionné.
- La route « Hello World! » du gabarit : elle disparaît, puisque ce n'est pas une route du projet. La route d'état de santé est la seule route du socle.

## Requirements *(mandatory)*

### Functional Requirements

**Application**

- **FR-001** : Le backend MUST rester l'application `apps/api`, sur son port par défaut 4000, sans changer la structure du monorepo.
- **FR-002** : Le code MUST être organisé en modules selon `ARCHITECTURE.md`, section 5, de sorte qu'un module métier futur s'ajoute sans modifier l'organisation du socle.
- **FR-003** : Le typage strict MUST rester activé, et `npm run lint` comme `npm run build:api` MUST passer.
- **FR-004** : La route de démonstration du gabarit (« Hello World! ») MUST être retirée.

**Configuration**

- **FR-005** : L'API MUST lire sa configuration dans des variables d'environnement, dont la liste, le caractère obligatoire et les valeurs par défaut sont ceux de `ARCHITECTURE.md`, section 12.
- **FR-006** : `MONGODB_URI` et `JWT_SECRET` MUST être obligatoires. `JWT_SECRET` MUST respecter la longueur minimale fixée par `ARCHITECTURE.md`, bien qu'aucune fonction d'authentification ne l'utilise encore.
- **FR-007** : `PORT`, `NODE_ENV`, `JWT_EXPIRES_IN` et `CORS_ORIGINS` MUST être facultatives, avec les valeurs par défaut documentées.
- **FR-008** : L'API MUST valider toute la configuration au démarrage et MUST refuser de démarrer si une variable obligatoire manque ou si une valeur est invalide, avec un message qui nomme chaque variable en cause.
- **FR-009** : Une valeur secrète MUST NOT figurer dans le code ni dans Git. Un fichier d'exemple versionné MUST lister le nom de chaque variable, sans valeur réelle.
- **FR-010** : Les variables réservées à des fonctionnalités futures et non encore nécessaires (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, variables du stockage) MUST NOT être exigées par le socle.

**Base de données**

- **FR-011** : L'API MUST établir au démarrage une connexion à la base de données désignée par `MONGODB_URI`, par le moyen fixé dans `ARCHITECTURE.md`, section 4.
- **FR-012** : Le journal de démarrage MUST indiquer si la connexion est établie ou a échoué.
- **FR-013** : L'adresse de la base, son nom d'hôte, ses identifiants et tout autre détail sensible de connexion MUST NOT apparaître dans un journal ni dans une réponse, y compris lors d'un échec de démarrage et lors d'une erreur interne en cours de fonctionnement.
- **FR-014** : Le socle MUST permettre à un module futur de déclarer ses modèles sans modifier le socle, et MUST NOT créer lui-même de collection métier, de modèle métier ni de donnée.

**API**

- **FR-015** : Toutes les routes MUST être servies sous le préfixe `/api/v1`.
- **FR-016** : L'organisation MUST rester compatible avec la séparation future entre routes publiques et routes d'administration (`/admin`), sans créer aucune de ces routes ni aucune garde.

**Erreurs et conventions**

- **FR-017** : Toute réponse d'erreur MUST suivre le format unique de `ARCHITECTURE.md`, section 10 : `statusCode`, `error`, `message`, et `details` pour les seules erreurs de validation.
- **FR-018** : Les messages d'erreur MUST être en français et affichables tels quels.
- **FR-019** : Une erreur interne MUST NOT exposer de détail technique (trace, nom de fichier, requête à la base).
- **FR-020** : Les données entrantes MUST être validées globalement selon `ARCHITECTURE.md`, section 8 : champs inconnus refusés, valeurs converties vers leur type.
- **FR-021** : Le socle MUST NOT définir de contrat d'API métier, d'endpoint métier ni de règle de validation propre à une ressource.

**Origines croisées**

- **FR-022** : Par défaut, l'API MUST n'autoriser aucune origine croisée.
- **FR-023** : Quand `CORS_ORIGINS` est renseignée, l'API MUST autoriser exactement les origines listées, et aucune autre.

**Route technique**

- **FR-024** : Le socle MUST exposer une route technique publique, `GET /api/v1/health`, qui indique l'état de l'API et de la connexion à la base : `200` quand les deux répondent, `503` quand la base ne répond pas. Elle MUST NOT exposer d'information sensible (adresse de la base, identifiants, version des composants). C'est la seule route du socle, et ce n'est pas une route métier.
**Limites du socle**

- **FR-025** : Le socle MUST NOT créer les aides communes qui n'ont pas encore d'utilisateur (pagination, validation d'identifiant, énumérations métier, sous-documents de fichiers, génération de slug). Chacune est créée par la première fonctionnalité qui en a besoin, à l'emplacement prévu par `ARCHITECTURE.md`, section 5.
**Sécurité**

- **FR-026** : Toutes les réponses de l'API MUST porter les en-têtes de sécurité HTTP usuels, par le moyen prévu dans `ARCHITECTURE.md`, section 5.
- **FR-027** : Le socle MUST NOT mettre en place de limitation du nombre de requêtes : elle arrive avec l'authentification, dont la route de connexion est la première à protéger.

### Key Entities

Aucune entité métier. Le socle manipule une seule notion :

- **Configuration** : l'ensemble des variables d'environnement de l'API, chacune avec son nom, son caractère obligatoire ou facultatif, sa valeur par défaut éventuelle et sa règle de validité. Décrite dans `ARCHITECTURE.md`, section 12.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : À partir d'un dépôt cloné et d'une base disponible, une personne démarre l'API en moins de 10 minutes en suivant le seul fichier d'exemple, sans aide extérieure.
- **SC-002** : Dans 100 % des cas de configuration invalide vérifiés (variable obligatoire absente, valeur invalide), l'API refuse de démarrer et le message nomme la variable en cause.
- **SC-003** : Aucun secret n'est présent dans le dépôt : une recherche des valeurs réelles dans les fichiers versionnés ne renvoie rien.
- **SC-004** : 100 % des réponses d'erreur observées pendant la vérification (adresse inconnue, corps mal formé, erreur interne) ont la même forme.
- **SC-005** : Aucune réponse d'erreur ni aucun journal observé ne contient un identifiant de base de données ou une trace d'exécution.
- **SC-006** : Après démarrage, la base ne contient aucune collection métier créée par le socle.
- **SC-007** : La fonctionnalité suivante (authentification) peut ajouter son module sans modifier la configuration, la connexion à la base, le préfixe ni le format d'erreur mis en place ici.
- **SC-008** : Le Front Office est strictement inchangé : aucun fichier de `apps/web` ni `DESIGN.md` n'est modifié, et son build passe comme avant.
- **SC-009** : 100 % des réponses observées pendant la vérification portent les en-têtes de sécurité.

## Assumptions

- **Base de données fournie par le porteur du projet.** La création du cluster MongoDB Atlas Free, de son utilisateur et de son adresse de connexion est une opération manuelle faite par le porteur du projet (constitution, principe III). Le socle ne crée ni cluster ni base.
- **Échec de connexion au démarrage.** Si la base est injoignable au démarrage, l'API signale l'échec et ne se met pas en service ; elle ne démarre pas « à vide ». Le détail (nombre de tentatives, délai) relève du plan.
- **Longueur de `JWT_SECRET`.** `ARCHITECTURE.md` demande « 32 octets aléatoires au moins » ; le socle vérifie une longueur minimale de 32 caractères, sans juger de l'aléa.
- **`JWT_EXPIRES_IN`** est lu et validé par le socle mais n'est utilisé par aucune fonction avant l'étape d'authentification.
- **Dépendances.** Seules des dépendances déjà listées dans `ARCHITECTURE.md`, section 5, et nécessaires à ce périmètre sont installées ; leur liste exacte est établie au plan et soumise à validation (constitution, principe IV).
- **Journalisation.** Le journal par défaut de l'application suffit ; aucun outil de journalisation n'est ajouté.
- **Documents de référence.** Si le socle révèle un manque ou une contradiction dans `ARCHITECTURE.md`, il est signalé et le document est corrigé d'abord (constitution, principe I). La route `GET /api/v1/health`, absente d'`ARCHITECTURE.md`, y sera inscrite (section 6) avant l'implémentation, avec la validation du porteur du projet.
- **Branche.** La branche `001-api-foundation` a été créée par Spec Kit à la demande explicite du porteur du projet pour cette fonctionnalité.
