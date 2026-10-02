# Feature Specification: Années Rotary (RotaryYear)

**Feature Branch**: `002-rotary-years`

**Created**: 2026-10-01

**Status**: Draft

**Input**: User description: « Gestion des années Rotary (RotaryYear) : création d'une année identifiée par son `startYear` unique, label, dates et `isCurrent` calculés, lecture et liste, comportement quand l'année existe déjà, validation des entrées, API concernée, comportement attendu côté Back Office, hors périmètre explicite. »

**Références** : `ARCHITECTURE.md` (sections 1.1, 3, 6, 8, 9, 10 « Format des réponses » et « Erreurs », 11, 13, 14 décisions 9 et 14, 15), `PROJECT_CONTEXT.md`, `.specify/memory/constitution.md` (principes I, V, VI, VIII, IX), `specs/001-api-foundation/` (socle : préfixe, format d'erreur, validation globale).

## Contexte et périmètre

Une année Rotary va du 1er juillet au 30 juin. C'est la première entité métier du projet, et celle dont dépendent toutes les autres : un mandat, une action et une actualité référenceront chacun une année Rotary existante.

Les règles du modèle ne sont pas à décider ici : elles sont verrouillées dans `ARCHITECTURE.md` (section 1.1 et décision 14). Cette spec dit **ce que la fonctionnalité doit garantir** ; le plan dira comment.

Elle s'appuie sur le socle de l'API (`001-api-foundation`) : préfixe `/api/v1`, format d'erreur commun, validation globale des entrées, connexion à la base. Elle ne modifie aucun de ces mécanismes.

### Deux temps de livraison

L'authentification n'existe pas encore, et aucune route `/admin` ne peut exister sans elle (constitution, principe V ; `ARCHITECTURE.md`, décision 9). La spec couvre donc toute la ressource, mais sa livraison se fait en deux temps :

| | Contenu | Livraison |
|---|---|---|
| **Temps 1** | Le modèle RotaryYear et son unicité, les valeurs calculées, la liste publique | **Cette fonctionnalité** |
| **Temps 2** | Les opérations d'administration : création, liste d'administration, suppression | **Avec la fonctionnalité d'authentification**, sous `/admin`, protégées dès leur création |

Les exigences du temps 2 sont écrites ici pour que le contrat de la ressource soit complet et validé en une fois. Elles sont marquées **[différé]** et ne donnent lieu à aucune route dans cette fonctionnalité.

**Conséquence assumée** : tant que le temps 2 n'est pas livré, aucune année ne peut être créée par l'API. La liste publique renvoie une liste vide, sauf si une année est insérée à la main dans la base pour la vérification.

### Dans le périmètre (temps 1, livré ici)

1. L'entité RotaryYear : seule l'année de début est enregistrée ; elle est unique.
2. Le calcul du label, de la date de début, de la date de fin et du caractère « courant », à partir de l'année de début.
3. La liste publique des années.

### Spécifié ici, livré avec l'authentification (temps 2)

4. La création d'une année par l'administrateur, avec la validation de l'année de début et le refus d'une année déjà existante.
5. La liste d'administration.
6. La suppression d'une année, refusée si elle est référencée.
7. Le comportement attendu du futur écran « Années » du Back Office face à ces règles (sans construire l'écran).

### Hors périmètre

- Membres, mandats, actions, actualités, candidatures, médias, envoi de fichiers.
- L'authentification elle-même : connexion, compte `ADMIN`, jeton, gardes, limitation de fréquence.
- Toute route `/admin`, protégée ou non, dans cette fonctionnalité.
- La modification d'une année : elle n'existe pas (`ARCHITECTURE.md`, section 6 : « Pas de modification : tout se calcule depuis l'année de début »).
- La lecture d'une année seule, par identifiant ou par label.
- La conversion d'un filtre `year=2026-2027` en année de début sur les listes de membres, d'actions et d'actualités : elle arrive avec ces listes.
- Les routes « années qui ont au moins un membre / une action / des actualités » (`/members/years`, `/actions/years`, `/news/archives`).
- L'écran du Back Office, son design, MUI, la session : `apps/admin` n'est pas modifié.
- La connexion du Front Office à l'API : `apps/web` et `DESIGN.md` ne sont pas modifiés.
- Toute création automatique ou d'avance d'une année ; toute donnée d'exemple ; tout script d'insertion.
- Les tests automatisés (constitution, principe IX).

## Clarifications

### Session 2026-10-01

- Q: Comment traiter les routes d'administration tant que l'authentification n'existe pas ? → A: Cette fonctionnalité livre le modèle, les calculs et la liste publique. La création et la liste d'administration sont reportées à la fonctionnalité d'authentification. Aucune route `/admin` non protégée n'est créée.
- Q: Faut-il inclure la suppression d'une année ? → A: Oui, `DELETE /admin/rotary-years/:id` est dans la spec. Le refus `409` pour une année référencée s'appliquera quand les futures entités référenceront RotaryYear.
- Q: `startYear` envoyé comme texte (`"2026"`) est-il accepté ? → A: Non. `startYear` doit être un entier JSON : `"2026"` est refusé (`400`), comme `2026.5` et toute valeur non entière.

Choix validés à la même session : aucune modification de `apps/admin` ; pas de lecture d'une année seule ; message de doublon « Cette année Rotary existe déjà. » ; création en `201` ; `isCurrent` calculé en UTC ; aucune continuité exigée entre les années.

## User Scenarios & Testing *(mandatory)*

Conformément à la constitution (principe IX), il n'y a pas de test automatisé : chaque récit décrit une **vérification manuelle**.

### User Story 1 - Lire la liste publique des années Rotary (Priority: P1) — temps 1

Toute personne ou application qui interroge l'API obtient la liste des années Rotary existantes : chacune avec son label, ses dates et son caractère courant, calculés à partir de la seule année de début. La liste est courte, complète, de la plus récente à la plus ancienne.

**Why this priority** : c'est la lecture dont le Front Office et le Back Office auront besoin pour leurs sélecteurs d'année, et c'est elle qui prouve que les calculs sont justes.

**Independent Test** : vérification manuelle. Sur une base sans année, la liste est vide. Après insertion manuelle dans la base de trois années (2025, 2026, 2030), la liste renvoie trois années, dans l'ordre 2030, 2026, 2025, chacune avec son label et ses dates ; une seule au plus est courante.

**Acceptance Scenarios** :

1. **Given** aucune année enregistrée, **When** on lit la liste, **Then** la réponse est une liste vide, sans erreur.
2. **Given** l'API venant de démarrer sur une base vide, **When** on lit la liste, **Then** elle est vide : aucune année n'a été créée d'avance.
3. **Given** plusieurs années enregistrées, **When** on lit la liste, **Then** toutes sont renvoyées, de la plus récente à la plus ancienne, sans pagination.
4. **Given** l'année de début 2026 enregistrée, **When** on lit la liste, **Then** elle porte son identifiant, `startYear` 2026, le label `2026-2027`, le 1er juillet 2026 00:00 UTC comme début et le 30 juin 2027 23:59:59.999 UTC comme fin, et `isCurrent`.
5. **Given** une année dont la période contient l'instant de la demande, **When** on lit la liste, **Then** elle est la seule marquée courante.
6. **Given** aucune année dont la période contient l'instant de la demande, **When** on lit la liste, **Then** aucune n'est marquée courante, sans erreur.
7. **Given** un visiteur non connecté, **When** il lit la liste, **Then** il l'obtient : ce n'est pas un contenu réservé.

---

### User Story 2 - Une seule année par année de début (Priority: P1) — temps 1

Il ne peut exister qu'une année Rotary pour une année de début donnée, et seule cette année de début est enregistrée. Cette garantie est portée par le modèle lui-même, indépendamment de la route qui créera les années plus tard.

**Why this priority** : l'unicité de l'année de début est l'invariant du modèle. Deux années « 2026-2027 » rendraient ambigus tous les contenus qui s'y rattacheront.

**Independent Test** : vérification manuelle. Après insertion d'une année 2026 dans la base, une seconde insertion de 2026 est refusée par la base. L'enregistrement de l'année ne contient ni label, ni dates de l'année Rotary, ni indicateur courant.

**Acceptance Scenarios** :

1. **Given** l'année 2026 enregistrée, **When** on tente d'en enregistrer une seconde de même année de début, **Then** l'enregistrement est refusé et il n'existe toujours qu'une année 2026.
2. **Given** une année enregistrée, **When** on consulte ce qui est stocké, **Then** seule l'année de début l'est (avec les dates techniques de création et de mise à jour) : ni label, ni dates de l'année Rotary, ni indicateur « courant ».
3. **Given** les années 2026, 2025 et 2030 enregistrées dans cet ordre, **When** on lit la liste, **Then** les trois existent : aucune continuité entre années n'est exigée.

---

### User Story 3 - Créer et supprimer une année (Priority: P2) — temps 2 [différé]

L'administrateur connecté ouvre une nouvelle année Rotary en indiquant seulement son année de début. Une année déjà ouverte ou une valeur invalide est refusée clairement, en français. Il peut retirer une année créée par erreur, tant qu'aucun contenu ne s'y rattache.

**Why this priority** : indispensable au fonctionnement réel, mais dépendant de l'authentification. Livré avec elle.

**Independent Test** : vérification manuelle, **à faire quand le temps 2 est livré**. Créer 2026 : réponse `201` avec label et dates. Créer 2026 à nouveau : `409`. Envoyer des valeurs invalides : `400` avec le détail sur `startYear`. Supprimer l'année : elle disparaît de la liste. Sans jeton : refus.

**Acceptance Scenarios** :

1. **Given** un administrateur connecté et aucune année enregistrée, **When** il crée l'année de début 2026, **Then** la réponse est `201` et contient l'identifiant, `startYear` 2026, le label `2026-2027`, les deux dates et `isCurrent`.
2. **Given** l'année 2026 existante, **When** il demande à nouveau la création de 2026, **Then** la réponse est `409` avec le message « Cette année Rotary existe déjà. », et aucune seconde année 2026 n'existe.
3. **Given** deux demandes de création de la même année arrivant presque en même temps, **When** elles sont traitées, **Then** une seule aboutit et l'autre reçoit le `409`.
4. **Given** une demande sans `startYear`, **When** elle est traitée, **Then** la réponse est `400` avec un détail désignant `startYear`.
5. **Given** `startYear` envoyé comme texte (`"2026"`), comme décimale (`2026.5`), comme valeur vide ou nulle, **When** la demande est traitée, **Then** la réponse est `400` avec un détail désignant `startYear`.
6. **Given** `startYear` valant 1999 ou 2101, **When** la demande est traitée, **Then** la réponse est `400` ; 2000 et 2100 sont acceptées.
7. **Given** une demande portant un champ non prévu (par exemple `label` ou `isCurrent`), **When** elle est traitée, **Then** la réponse est `400` : les valeurs calculées ne peuvent pas être imposées par l'appelant.
8. **Given** une année qu'aucun contenu ne référence, **When** l'administrateur la supprime, **Then** elle n'existe plus et n'apparaît plus dans aucune liste.
9. **Given** une année référencée par un mandat, une action ou une actualité, **When** l'administrateur tente de la supprimer, **Then** la réponse est `409` et l'année est conservée. Ce cas devient observable quand ces entités existeront.
10. **Given** un identifiant mal formé, ou un identifiant bien formé qui ne correspond à aucune année, **When** l'administrateur demande la suppression, **Then** la réponse est `400` dans le premier cas, `404` dans le second.
11. **Given** un appel sans jeton valide, ou sans le rôle `ADMIN`, **When** il vise une de ces opérations ou la liste d'administration, **Then** il est refusé (`401` ou `403`) et rien n'est lu ni modifié.

---

### User Story 4 - Comportement attendu du Back Office (Priority: P3) — temps 2 [différé]

Quand l'écran « Années » du Back Office sera construit, il devra pouvoir s'appuyer sur cette ressource sans rien y ajouter : afficher la liste, proposer la création par la seule année de début, proposer la suppression, et restituer les refus à l'administrateur.

**Why this priority** : l'écran n'est pas construit ici. Il s'agit de vérifier que les réponses de l'API suffiront à le construire.

**Independent Test** : vérification par relecture. Pour chaque comportement d'écran ci-dessous, on retrouve dans les réponses spécifiées l'information nécessaire, sans calcul côté Back Office.

**Acceptance Scenarios** :

1. **Given** la liste d'administration, **When** l'écran l'affiche, **Then** il dispose pour chaque année du label, des dates et du caractère courant, sans avoir à les calculer.
2. **Given** le formulaire de création, **When** l'administrateur saisit une année de début, **Then** c'est le seul champ demandé ; l'écran envoie un nombre entier, pas un texte ; le label et les dates affichés ensuite viennent de la réponse de l'API.
3. **Given** un refus de validation, **When** l'écran le reçoit, **Then** le détail désigne `startYear` avec un message en français affichable sous le champ.
4. **Given** un refus de doublon ou un refus de suppression d'une année utilisée, **When** l'écran le reçoit, **Then** il dispose d'un message en français affichable en tête de formulaire ou près de l'action.
5. **Given** l'écran des années, **When** on y cherche une action de modification, **Then** il n'y en a pas : une année ne se modifie pas.

---

### Edge Cases

- **Bornes** : 2000 et 2100 sont acceptées ; 1999 et 2101 sont refusées.
- **Année de début envoyée comme texte numérique** (`"2026"`) : refusée (`400`). `startYear` doit être un entier JSON ; aucune conversion depuis un texte n'est appliquée à ce champ.
- **Changement d'année Rotary** : le 30 juin à 23:59:59.999 UTC, l'année est encore courante ; le 1er juillet à 00:00 UTC, c'est la suivante, si elle existe. Les bornes sont en temps universel (`ARCHITECTURE.md`, section 1.1) : vu de Madagascar (UTC+3), le basculement a lieu le 1er juillet à 3 h du matin, heure locale.
- **Année suivante non encore créée** au 1er juillet : aucune année n'est courante jusqu'à sa création. Ce n'est pas une erreur.
- **Année future ou passée** : acceptée dans les bornes ; elle n'est simplement pas courante.
- **Base injoignable** pendant une lecture : erreur au format commun, sans détail technique (socle).
- **Appel à une adresse `/admin/rotary-years` pendant le temps 1** : la route n'existe pas ; la réponse est le `404` au format commun du socle.
- **Année insérée à la main avec une valeur hors règles** (pendant le temps 1) : les règles de validation de l'année de début sont celles de la création ; une insertion directe en base les contourne et relève de la responsabilité de la personne qui la fait.

## Requirements *(mandatory)*

### Functional Requirements

**Modèle** — temps 1

- **FR-001** : Une année Rotary MUST être identifiée par son année de début (`startYear`), qui est la seule donnée métier enregistrée.
- **FR-002** : `startYear` MUST être unique : il ne peut exister deux années Rotary de même année de début, y compris quand deux enregistrements arrivent en même temps. Cette garantie MUST être portée par le modèle, sans dépendre d'une route.
- **FR-003** : Le label, la date de début, la date de fin et le caractère courant MUST être calculés à partir de `startYear` et MUST NOT être enregistrés. Aucun indicateur « courant » n'est stocké.
- **FR-004** : Le système MUST NOT créer d'année de lui-même, ni au démarrage ni d'avance. La première année est créée par l'administrateur.

**Valeurs calculées** — temps 1

- **FR-005** : `label` MUST valoir l'année de début, un tiret, puis l'année suivante : `2026` donne `2026-2027`.
- **FR-006** : `startDate` MUST être le 1er juillet de `startYear` à 00:00:00.000 UTC.
- **FR-007** : `endDate` MUST être le 30 juin de `startYear + 1` à 23:59:59.999 UTC.
- **FR-008** : `isCurrent` MUST être vrai si et seulement si l'instant de la demande, en UTC, est compris entre `startDate` et `endDate`, bornes incluses. Il est évalué à chaque lecture.
- **FR-009** : Les dates MUST être exposées au format ISO 8601 UTC, comme toutes les dates de l'API.

**Liste publique** — temps 1

- **FR-010** : Le système MUST offrir une liste publique des années existantes sur `GET /api/v1/rotary-years`, accessible sans authentification.
- **FR-011** : Chaque année de la liste MUST porter : `id`, `startYear`, `label`, `startDate`, `endDate`, `isCurrent`, dans la forme de l'exemple d'`ARCHITECTURE.md`, section 13.
- **FR-012** : La liste MUST être complète, sans pagination ni recherche, triée de l'année la plus récente à la plus ancienne, et renvoyée dans l'enveloppe des listes non paginées (`{ "data": [] }`).
- **FR-013** : Une liste sans année MUST renvoyer une liste vide, et non une erreur.
- **FR-014** : Aucune lecture d'une année seule (par identifiant ou par label) n'est offerte : `ARCHITECTURE.md` n'en prévoit pas.

**Administration** — temps 2 [différé], livrée avec l'authentification

- **FR-015** : Aucune route `/admin` MUST NOT être créée par cette fonctionnalité. Les exigences FR-016 à FR-025 MUST être livrées avec la fonctionnalité d'authentification, protégées par jeton et rôle `ADMIN` dès leur création (`ARCHITECTURE.md`, décision 9).
- **FR-016** : L'administrateur MUST pouvoir créer une année sur `POST /api/v1/admin/rotary-years` en fournissant uniquement `{ "startYear": 2026 }`.
- **FR-017** : `startYear` MUST être un entier JSON compris entre 2000 et 2100, bornes incluses. Un texte (y compris `"2026"`), une décimale (`2026.5`), une valeur nulle, vide ou absente, ou un entier hors bornes MUST être refusés par une erreur de validation (`400`) dont le détail désigne `startYear`, avec un message en français.
- **FR-018** : Un champ autre que `startYear` dans la demande de création MUST la faire refuser (`400`) : les valeurs calculées ne sont jamais acceptées en entrée.
- **FR-019** : La création d'une année dont `startYear` existe déjà MUST être refusée par un conflit (`409`) au format d'erreur commun, avec le message « Cette année Rotary existe déjà. », et MUST NOT modifier l'année existante.
- **FR-020** : Une création réussie MUST répondre `201` et renvoyer l'année créée dans la forme de FR-011.
- **FR-021** : L'administrateur MUST disposer d'une liste d'administration sur `GET /api/v1/admin/rotary-years`, de même forme, même tri et même enveloppe que la liste publique.
- **FR-022** : L'administrateur MUST pouvoir supprimer une année sur `DELETE /api/v1/admin/rotary-years/:id`. Une année supprimée n'apparaît plus dans aucune liste.
- **FR-023** : La suppression d'une année référencée par un mandat, une action ou une actualité MUST être refusée par un conflit (`409`), l'année étant conservée. Chaque fonctionnalité qui introduit une entité référençant RotaryYear MUST ajouter sa vérification à ce refus ; tant qu'aucune n'existe, toute année est supprimable.
- **FR-024** : Une suppression visant un identifiant mal formé MUST répondre `400` ; visant un identifiant qui ne correspond à aucune année, `404`.
- **FR-025** : Une année MUST NOT pouvoir être modifiée : aucune opération de modification n'est offerte.

**Transverse**

- **FR-026** : Toutes les erreurs MUST suivre le format commun du socle (`specs/001-api-foundation/contracts/errors.md`), en français.
- **FR-027** : Cette fonctionnalité MUST NOT créer de membre, de mandat, d'action, d'actualité, ni aucune route les concernant, ni de garde ou de mécanisme d'authentification, ni modifier `apps/web`, `apps/admin` ou `DESIGN.md`.
- **FR-028** : Elle MUST NOT inventer de donnée : aucune année d'exemple, aucune année historique fictive, aucun script d'insertion (constitution, principes III et VIII).

### Key Entities

- **RotaryYear** : une année Rotary du club, du 1er juillet au 30 juin. Donnée enregistrée : l'année de début (`startYear`), unique. Données déduites, jamais enregistrées : le label (`2026-2027`), la date de début, la date de fin, le caractère courant. Elle sera référencée plus tard par les mandats, les actions et les actualités ; ces relations ne sont pas créées ici.

## Success Criteria *(mandatory)*

### Measurable Outcomes

**Temps 1 (vérifiables à la fin de cette fonctionnalité)**

- **SC-001** : Dans 100 % des cas vérifiés, le label et les dates renvoyés correspondent à l'année de début : 1er juillet de l'année, 30 juin de la suivante.
- **SC-002** : Il n'existe jamais deux années de même année de début : une seconde insertion de la même année est refusée.
- **SC-003** : À tout instant, au plus une année est marquée courante ; il n'y en a aucune quand aucune année enregistrée ne contient l'instant de la demande.
- **SC-004** : Pour une année enregistrée, la base ne contient ni label, ni date de l'année Rotary, ni indicateur courant.
- **SC-005** : Au démarrage sur une base vide, la liste publique est vide : aucune année n'a été créée d'avance.
- **SC-006** : Aucune adresse sous `/admin` ne répond autrement que par le `404` du socle.
- **SC-007** : Le Front Office et le Back Office sont strictement inchangés : aucun fichier de `apps/web`, `apps/admin` ni `DESIGN.md` n'est modifié, et leurs builds passent comme avant.

**Temps 2 (vérifiables quand les opérations d'administration sont livrées)**

- **SC-008** : L'administrateur ouvre une nouvelle année en fournissant une seule information, l'année de début.
- **SC-009** : 100 % des valeurs invalides vérifiées (absente, texte, décimale, hors bornes, champ en trop) sont refusées avec un message en français qui désigne le champ en cause, et rien n'est enregistré.
- **SC-010** : Aucune tentative de création d'une année existante, y compris simultanée, ne produit de doublon.
- **SC-011** : Le futur écran « Années » peut afficher la liste et restituer chaque refus sans aucun calcul de date ni de label de son côté.

## Assumptions

- **Ordre des étapes.** `ARCHITECTURE.md`, section 15, place l'authentification avant les années. Cette fonctionnalité passe avant elle, à la demande du porteur du projet, en ne livrant que ce qui ne dépend pas de l'authentification. Aucune décision verrouillée n'est contredite : aucune route `/admin` n'est créée sans protection.
- **Suppression : même temps que les autres opérations d'administration.** La suppression est spécifiée ici (décision Q2), mais c'est une route `/admin` : elle ne peut pas exister avant l'authentification (décision Q1). Elle est donc livrée au temps 2, avec la création et la liste d'administration.
- **Vérification du temps 1 par insertion manuelle.** Faute de route de création, la liste publique avec des données et l'unicité se vérifient en insérant des années à la main dans la base (constitution, principe III). Ces années de vérification sont retirées ensuite : aucune donnée n'est laissée en base par cette fonctionnalité.
- **Fonctionnalité d'API seulement.** `apps/admin` est encore le gabarit d'origine. Le « comportement attendu côté Back Office » est décrit comme ce que l'écran futur devra pouvoir faire avec les réponses de l'API (récit 4), sans rien construire.
- **Même forme pour les deux listes.** La liste publique et la liste d'administration renvoient les mêmes champs : une année n'a aucune donnée privée. `createdAt` et `updatedAt` existent en base mais ne sont pas exposés, l'exemple d'`ARCHITECTURE.md`, section 13, ne les portant pas.
- **Code de suppression.** Une suppression réussie répond `204`, sans corps, usage standard ; `ARCHITECTURE.md` ne précise pas ce code.
- **Message de suppression refusée.** Le texte du `409` pour une année utilisée est fixé par la première fonctionnalité qui rend ce cas possible ; d'ici là, le message par défaut du `409` du socle s'applique.
- **Messages de validation.** Leur texte exact (par exemple « L'année de début doit être un entier entre 2000 et 2100. ») est fixé au plan, dans le contrat de la fonctionnalité ; la spec exige seulement qu'ils soient en français et désignent `startYear`.
- **Aide partagée.** Le calcul du label et des dates sera réutilisé par les fonctionnalités suivantes ; son emplacement (`common/utils/`, prévu par `ARCHITECTURE.md`, section 5) relève du plan.
- **Dépendances.** Aucune dépendance nouvelle n'est attendue pour le temps 1.
- **Vérification.** Elle suppose une base joignable. La vérification du socle contre MongoDB Atlas (tâches T011, T016 et T026 de `001-api-foundation`) est encore ouverte.
- **Branche.** La branche `002-rotary-years` a été créée par Spec Kit à la demande explicite du porteur du projet.
