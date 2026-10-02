# Feature Specification: Membres et mandats

**Feature Branch**: `004-members`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: « Introduire le domaine des membres du club et de leurs mandats par année Rotary : entité Member, entité séparée MemberMandate (un seul par couple membre et année, plusieurs fonctions possibles, ordre d'affichage), liste fermée de dix fonctions, administration protégée, données prêtes pour la page `/membres`, conséquences des suppressions. »

**Références** : `ARCHITECTURE.md` (sections 1.1, 1.2, 1.3, 2, 3, 5, 6, 8, 9, 10, 13, 14 décisions 2, 4, 9, 10 et 15), `DESIGN.md` (section « Members » : l'ordre des personnes est celui que le club choisit), `PROJECT_CONTEXT.md`, `CLAUDE.md`, `.specify/memory/constitution.md` (principes I, V, VI, VIII, IX), `specs/001-api-foundation/contracts/errors.md`, `specs/002-rotary-years/` (FR-023, contrat), `specs/003-admin-auth/` (gardes, `ParseObjectIdPipe`), `apps/web/src/types/member.ts` et `apps/web/src/data/members.ts` (besoins du Front Office).

## Contexte et périmètre

L'API sait authentifier l'administrateur et gérer les années Rotary. Elle ne connaît encore aucune personne. Cette fonctionnalité introduit les membres du club et leur présence année par année.

Le modèle est verrouillé par `ARCHITECTURE.md` (sections 1.2 et 1.3, décision 2) : un **membre** est une personne ; sa **fonction n'est pas une propriété du membre**, elle vit dans un **mandat**, qui dit qu'un membre a été présent au club une année Rotary donnée, avec zéro, une ou plusieurs fonctions et un ordre d'affichage. Cette spec dit **ce que la fonctionnalité doit garantir** ; le plan dira comment.

Elle s'appuie sur ce qui existe : le modèle RotaryYear et son administration, l'authentification et ses deux gardes, le format d'erreur et la validation du socle. Aucun de ces mécanismes n'est modifié, à une exception près, prévue depuis `002-rotary-years` : la suppression d'une année référencée par un mandat est désormais refusée.

### Dans le périmètre

1. L'entité Member et l'entité MemberMandate, avec leurs règles d'intégrité.
2. La liste fermée des dix fonctions, sous forme de valeurs autorisées (aucune entité nouvelle).
3. L'administration des membres : créer, lister, consulter avec ses mandats, modifier, supprimer.
4. L'administration des mandats : créer, lister, modifier les fonctions et l'ordre, supprimer, réordonner une année.
5. Les lectures publiques dont la page `/membres` aura besoin : l'annuaire d'une année, et les années qui ont au moins un membre.
6. Le refus de supprimer une année Rotary référencée par un mandat.

### Hors périmètre

- Toute modification du Front Office : `apps/web` et `DESIGN.md` ne sont pas modifiés. La page `/membres` reste sur ses données locales ; sa connexion à l'API est une étape ultérieure (`ARCHITECTURE.md`, décision 15).
- Tout écran du Back Office : `apps/admin` n'est pas modifié.
- L'envoi de fichiers et le stockage des images : aucun fournisseur n'est choisi (`ARCHITECTURE.md`, section 14, décision ouverte).
- Actions, actualités, candidatures, et le refus de supprimer une année qu'elles référenceraient.
- Toute modification de l'authentification, tout compte utilisateur pour les membres : un membre n'est pas un compte et ne se connecte pas.
- Un champ actif ou inactif sur le membre, une date d'adhésion, une biographie, des réseaux sociaux : aucune de ces données n'est prévue par l'architecture.
- Toute donnée d'exemple : aucun membre fictif n'est enregistré ; les profils de démonstration du Front Office ne sont jamais écrits en base.
- Les tests automatisés (constitution, principe IX).

## Clarifications

### Session 2026-10-02

- Q: Le portrait du membre fait-il partie de cette fonctionnalité ? → A: Non. Aucun champ de portrait, même provisoire, et aucune solution de stockage d'image. Il arrivera avec le stockage de fichiers.
- Q: Quelle règle pour l'ordre et le réordonnancement ? → A: `order` est un entier à partir de 1. Deux mandats d'une même année Rotary ne peuvent pas porter le même ordre : une collision produit `409`. Le réordonnancement préserve cet ordre strict.
- Q: Que répond l'annuaire public pour une année inexistante, ou sans année courante ? → A: `200` avec une liste vide, dans les deux cas.

Hypothèses validées à la même session : une référence inexistante à la création d'un mandat produit `400` ; les deux nouveaux conflits (mandat déjà existant pour le couple, année Rotary utilisée à la suppression) répondent `409` avec le message générique existant « Conflit avec une ressource existante. », sans nouveau message ; la liste d'administration des membres renvoie les champs du membre sans ses mandats, la fiche les renvoie ; la liste des années ayant des membres reprend la forme de la liste des années Rotary.

## User Scenarios & Testing *(mandatory)*

Conformément à la constitution (principe IX), il n'y a pas de test automatisé : chaque récit décrit une **vérification manuelle**.

### User Story 1 - Gérer les membres (Priority: P1)

L'administrateur connecté enregistre une personne membre du club : son prénom, son nom, et s'il les connaît sa profession ou ses études, son email et son téléphone. Il peut retrouver un membre dans une liste, consulter sa fiche, la corriger, et le retirer.

**Why this priority** : sans membre, aucun mandat ne peut exister et l'annuaire reste vide.

**Independent Test** : vérification manuelle. Connecté, créer un membre avec un prénom et un nom : il apparaît dans la liste d'administration et sa fiche se consulte. Le modifier, puis le supprimer : il disparaît. Sans jeton, chacun de ces appels est refusé.

**Acceptance Scenarios** :

1. **Given** un administrateur connecté, **When** il crée un membre avec un prénom et un nom, **Then** le membre est enregistré et renvoyé avec son identifiant ; les champs facultatifs absents ne sont pas inventés.
2. **Given** un prénom ou un nom absent, vide, ou de plus de 120 caractères, **When** la création est demandée, **Then** elle est refusée (`400`) avec le détail du champ en cause.
3. **Given** un email mal formé ou un téléphone qui ne respecte pas la règle du projet, **When** la création ou la modification est demandée, **Then** elle est refusée (`400`) avec le détail du champ en cause.
4. **Given** des membres enregistrés, **When** l'administrateur lit la liste, **Then** elle est paginée (20 par page par défaut), triée par nom, et peut être cherchée par prénom ou nom et filtrée par année ou par fonction ; chaque élément porte les champs du membre, sans ses mandats.
5. **Given** un membre existant, **When** l'administrateur consulte sa fiche, **Then** il obtient ses informations, y compris l'email et le téléphone, et **tous** ses mandats, chacun avec son année, ses fonctions et son ordre.
6. **Given** un membre existant, **When** l'administrateur modifie une partie de ses informations, **Then** seuls les champs envoyés changent.
7. **Given** un identifiant mal formé, **When** une fiche est consultée, modifiée ou supprimée, **Then** la réponse est `400` « Identifiant invalide. » ; un identifiant bien formé qui ne correspond à aucun membre donne `404`.
8. **Given** un appel sans jeton valide, **When** il vise une de ces opérations, **Then** il est refusé (`401`) et rien n'est lu ni modifié.

---

### User Story 2 - Gérer les mandats et les fonctions (Priority: P1)

L'administrateur inscrit un membre dans une année Rotary : c'est son mandat. Il y indique les fonctions tenues cette année-là, aucune, une ou plusieurs, parmi les dix fonctions du club. Il peut changer ces fonctions, ou retirer le mandat.

**Why this priority** : c'est le mandat qui fait qu'un membre apparaît dans l'annuaire d'une année, et qui porte ses fonctions.

**Independent Test** : vérification manuelle. Créer un mandat pour un membre et une année existants, avec deux fonctions : il est renvoyé avec son année et un ordre. Recréer le même couple : refus. Changer les fonctions, puis supprimer le mandat : le membre existe toujours.

**Acceptance Scenarios** :

1. **Given** un membre et une année Rotary existants, **When** l'administrateur crée un mandat avec les fonctions « secrétaire » et « protocole », **Then** le mandat est enregistré et renvoyé avec l'année (identifiant et label), les deux fonctions et un ordre.
2. **Given** un mandat existant pour un membre et une année, **When** l'administrateur en crée un second pour le même couple, **Then** la demande est refusée par un conflit (`409`, « Conflit avec une ressource existante. ») et il n'existe toujours qu'un mandat pour ce couple, y compris si deux demandes arrivent en même temps.
3. **Given** un mandat sans aucune fonction, **When** il est créé, **Then** il est accepté : le membre est présent cette année-là sans fonction.
4. **Given** une fonction hors de la liste des dix, ou la même fonction deux fois, **When** un mandat est créé ou modifié, **Then** la demande est refusée (`400`) avec le détail sur les fonctions.
5. **Given** un identifiant de membre ou d'année bien formé mais qui ne correspond à rien, **When** un mandat est créé, **Then** la demande est refusée (`400`) et aucun mandat n'est créé.
6. **Given** deux membres et la même année, **When** chacun reçoit la fonction « trésorier », **Then** les deux mandats sont acceptés : une même fonction peut être tenue par deux personnes la même année.
7. **Given** un mandat existant, **When** l'administrateur modifie ses fonctions, **Then** seules les fonctions changent ; le membre et l'année d'un mandat ne se modifient pas.
8. **Given** un mandat existant, **When** l'administrateur le supprime, **Then** le mandat disparaît ; le membre et l'année Rotary existent toujours.
9. **Given** un membre avec des mandats dans plusieurs années, **When** l'administrateur liste les mandats d'une année ou d'un membre, **Then** il obtient ceux qui correspondent.

---

### User Story 3 - Choisir l'ordre d'affichage d'une année (Priority: P2)

Le club décide de l'ordre dans lequel ses membres apparaissent pour une année. L'administrateur fixe cet ordre, en une fois pour toute l'année ou mandat par mandat. Ce n'est jamais un classement par fonction.

**Why this priority** : `DESIGN.md` fait de cet ordre un choix du club. Sans lui, l'annuaire a un ordre arbitraire ; mais il reste lisible.

**Independent Test** : vérification manuelle. Avec trois mandats dans une année, envoyer un nouvel ordre : l'annuaire public de l'année renvoie les membres dans cet ordre.

**Acceptance Scenarios** :

1. **Given** une année avec plusieurs mandats, **When** l'administrateur envoie la liste complète de ses mandats dans l'ordre voulu, **Then** les ordres sont réécrits de 1 à n selon cette liste, sans doublon, et l'annuaire de l'année la suit.
2. **Given** une liste de réordonnancement qui omet un mandat de l'année, en cite un deux fois, ou en cite un d'une autre année, **When** elle est envoyée, **Then** elle est refusée (`400`) et aucun ordre n'est modifié.
3. **Given** un mandat existant, **When** l'administrateur lui donne un ordre libre dans son année, **Then** l'ordre de ce mandat change.
4. **Given** un mandat existant, **When** l'administrateur lui donne un ordre déjà porté par un autre mandat de la même année, **Then** la demande est refusée par un conflit (`409`) et aucun ordre n'est modifié.
5. **Given** un ordre qui n'est pas un entier supérieur ou égal à 1 (zéro, négatif, décimal, texte), **When** il est envoyé, **Then** la demande est refusée (`400`) avec le détail sur l'ordre.
6. **Given** un nouveau mandat, **When** il est créé, **Then** il prend l'ordre qui suit le plus grand ordre de son année ; le premier mandat d'une année reçoit l'ordre 1.
7. **Given** deux années, **When** l'ordre de l'une est modifié, **Then** l'ordre de l'autre est inchangé : l'ordre est propre à chaque année, et le même ordre peut exister dans deux années différentes.

---

### User Story 4 - Lire l'annuaire d'une année (Priority: P2)

Le Front Office, plus tard, lit sans authentification l'annuaire d'une année Rotary : les membres présents cette année-là, dans l'ordre du club, chacun avec ses fonctions de l'année. Il lit aussi la liste des années qui ont au moins un membre. Aucune donnée interne n'est exposée.

**Why this priority** : c'est la lecture que la page `/membres` et l'aperçu de l'accueil utiliseront. Elle n'a de sens qu'une fois membres et mandats saisis.

**Independent Test** : vérification manuelle. Après avoir saisi trois membres et leurs mandats pour une année, lire l'annuaire de cette année sans jeton : trois membres, dans l'ordre choisi, avec leurs fonctions ; ni email ni téléphone.

**Acceptance Scenarios** :

1. **Given** des mandats dans l'année `2026-2027`, **When** on lit l'annuaire de `2026-2027`, **Then** chaque membre présent est renvoyé une fois, dans l'ordre du club, avec son prénom, son nom, sa profession ou ses études s'ils existent, l'année, ses fonctions de l'année et son ordre. Aucun portrait n'est renvoyé.
2. **Given** un membre avec un email et un téléphone, **When** on lit l'annuaire, **Then** ni l'un ni l'autre n'apparaît.
3. **Given** un membre sans mandat dans l'année demandée, **When** on lit l'annuaire de cette année, **Then** il n'y figure pas.
4. **Given** aucune année précisée, **When** on lit l'annuaire, **Then** c'est celui de l'année courante.
5. **Given** un nombre maximal de membres demandé, **When** on lit l'annuaire, **Then** seuls les premiers, dans l'ordre du club, sont renvoyés.
6. **Given** des mandats répartis sur deux années, **When** on lit la liste des années qui ont au moins un membre, **Then** ces deux années sont renvoyées, de la plus récente à la plus ancienne ; une année sans aucun mandat n'y figure pas.
7. **Given** une année précisée, bien formée, qui n'existe pas, **When** on lit l'annuaire, **Then** la réponse est `200` avec une liste vide.
8. **Given** aucune année précisée et aucune année Rotary courante, **When** on lit l'annuaire, **Then** la réponse est `200` avec une liste vide.
9. **Given** une année précisée dont le label est mal formé (`2026`, `2026-2028`, `abc`), **When** on lit l'annuaire, **Then** la réponse est `400`.

---

### User Story 5 - Conséquences des suppressions (Priority: P2)

Supprimer une personne, un mandat ou une année ne doit jamais laisser de donnée orpheline, ni faire disparaître par surprise ce que l'administrateur n'a pas demandé à supprimer.

**Why this priority** : l'intégrité entre membres, mandats et années n'est assurée par personne d'autre que l'API.

**Independent Test** : vérification manuelle. Supprimer un membre qui a deux mandats : ses deux mandats disparaissent, les années restent. Tenter de supprimer une année qui a un mandat : refus ; supprimer le mandat, puis l'année : accepté.

**Acceptance Scenarios** :

1. **Given** un membre avec des mandats, **When** l'administrateur supprime ce membre, **Then** ses mandats sont supprimés avec lui, et les années Rotary concernées existent toujours.
2. **Given** un mandat, **When** l'administrateur le supprime, **Then** seul ce mandat disparaît.
3. **Given** une année Rotary référencée par au moins un mandat, **When** l'administrateur tente de la supprimer, **Then** la demande est refusée par un conflit (`409`, « Conflit avec une ressource existante. ») et l'année comme ses mandats sont conservés.
4. **Given** une année Rotary sans aucun mandat, **When** l'administrateur la supprime, **Then** elle est supprimée, comme avant cette fonctionnalité.

---

### Edge Cases

- **Membre sans aucun mandat** : il existe dans l'administration et n'apparaît dans aucun annuaire public.
- **Homonymes** : deux membres peuvent porter le même prénom et le même nom ; aucune unicité n'est exigée sur une personne.
- **Fonctions vides** : un tableau de fonctions vide est valide ; l'absence du champ à la création vaut un tableau vide.
- **Fonction écrite autrement** (« Président », « PRESIDENT ») : refusée ; seules les dix valeurs exactes de l'architecture sont acceptées.
- **Champ non prévu** dans une demande : refusé par le socle (`400`).
- **Portrait** : exclu. Le membre n'a aucun champ de portrait dans cette fonctionnalité ; un champ `portrait` envoyé est refusé comme champ non prévu (`400`).
- **Échanger deux ordres** : modifier un seul mandat vers un ordre déjà pris est refusé (`409`) ; un échange se fait par le réordonnancement de l'année.
- **Ordre envoyé à la création d'un mandat** : non accepté ; l'ordre d'un nouveau mandat est toujours attribué à la suite.
- **Suppression d'un mandat au milieu de l'ordre** : les autres mandats de l'année gardent leur ordre ; un trou dans la numérotation est permis et n'a pas d'effet sur l'affichage. Le réordonnancement de l'année le referme.
- **Recherche de moins de deux caractères**, tri sur un champ non autorisé, page ou taille hors bornes : `400`, selon le contrat commun des listes.
- **Base injoignable** : erreur au format commun, sans détail technique (socle).

## Requirements *(mandatory)*

### Functional Requirements

**Membre**

- **FR-001** : Un membre MUST porter un prénom et un nom, obligatoires, et MAY porter une profession ou des études, un email et un téléphone, facultatifs. Aucune fonction n'est enregistrée sur le membre. Aucun portrait n'est enregistré ni accepté par cette fonctionnalité.
- **FR-002** : Le prénom et le nom MUST compter de 1 à 120 caractères, espaces de début et de fin retirés. La profession ou les études suivent la même limite. L'email MUST être un email valide de 254 caractères au plus, mis en minuscules. Le téléphone MUST suivre la règle du projet : chiffres, espaces, `+`, `-`, `.`, parenthèses, au moins 8 chiffres (`ARCHITECTURE.md`, section 8).
- **FR-003** : L'email et le téléphone MUST NOT apparaître sur la surface publique : ils sont à l'usage interne de l'administration.
- **FR-004** : Un membre MUST NOT porter de champ actif ou inactif : sa présence une année donnée est portée par l'existence de son mandat cette année-là.
- **FR-005** : Aucune unicité n'est exigée entre membres : deux membres peuvent avoir le même nom ou le même email.

**Mandat**

- **FR-006** : Un mandat MUST appartenir à exactement un membre et à exactement une année Rotary, tous deux existants, désignés par leur identifiant. Aucune donnée de l'année n'est recopiée dans le mandat.
- **FR-007** : Il MUST exister au plus un mandat par couple (membre, année Rotary), y compris quand deux créations arrivent en même temps. Cette garantie MUST être portée par le modèle.
- **FR-008** : Un mandat MUST porter la liste des fonctions tenues par le membre cette année-là : zéro, une ou plusieurs, sans doublon.
- **FR-009** : Les fonctions autorisées MUST être exactement les dix valeurs de `ARCHITECTURE.md`, section 1.3 : `president`, `vice-president`, `tresorier`, `responsable-action`, `responsable-image-publique`, `responsable-camaraderie`, `responsable-effectif`, `responsable-fondation`, `protocole`, `secretaire`. Elles forment une liste fermée de valeurs, identiques à celles du Front Office ; aucune entité ni collection n'est créée pour elles, et aucune hiérarchie n'existe entre elles.
- **FR-010** : Une même fonction MAY être tenue par plusieurs membres la même année.
- **FR-011** : Un mandat MUST porter un ordre d'affichage, propre à son année : un entier supérieur ou égal à 1.
- **FR-011a** : Deux mandats d'une même année Rotary MUST NOT porter le même ordre, y compris quand deux écritures arrivent en même temps. Le même ordre MAY exister dans deux années différentes. Les trous dans la numérotation sont permis.
- **FR-011b** : L'ordre d'un nouveau mandat MUST être attribué par le système : le plus grand ordre de l'année plus un, ou 1 pour le premier mandat de l'année. Un ordre envoyé à la création n'est pas accepté.
- **FR-011c** : Donner à un mandat un ordre déjà porté par un autre mandat de la même année MUST être refusé par un conflit (`409`), sans rien modifier.
- **FR-012** : Le membre et l'année d'un mandat MUST NOT être modifiables : seuls ses fonctions et son ordre le sont. Changer d'année ou de personne, c'est supprimer le mandat et en créer un autre.

**Administration des membres** (sous `/api/v1/admin/members`)

- **FR-013** : L'administrateur MUST pouvoir créer un membre, modifier une partie de ses champs, et le supprimer.
- **FR-014** : L'administrateur MUST disposer d'une liste paginée des membres, selon le contrat commun des listes (`page`, `limit` de 20 par défaut et 100 au plus), avec recherche sur le prénom et le nom, filtres par année (label) et par fonction, tri par nom par défaut ou par date de création. Chaque élément MUST porter les champs du membre, y compris les champs internes, **sans** ses mandats.
- **FR-015** : L'administrateur MUST pouvoir consulter la fiche d'un membre, avec ses champs internes et **tous** ses mandats, dans la forme de l'exemple d'`ARCHITECTURE.md`, section 13.

**Administration des mandats** (sous `/api/v1/admin/mandates`)

- **FR-016** : L'administrateur MUST pouvoir créer un mandat, modifier ses fonctions et son ordre, et le supprimer.
- **FR-017** : L'administrateur MUST pouvoir lister les mandats, filtrés par année (label) et par membre.
- **FR-018** : L'administrateur MUST pouvoir réordonner en une demande les mandats d'une année, en envoyant l'année et la liste ordonnée de ses mandats. La liste MUST contenir exactement tous les mandats de cette année, chacun une fois ; sinon la demande est refusée (`400`) et aucun ordre n'est modifié. Après un réordonnancement réussi, les ordres valent 1 à n dans l'ordre de la liste, sans doublon. Un réordonnancement MUST NOT laisser l'année dans un état où deux mandats portent le même ordre.

**Lecture publique**

- **FR-019** : L'API MUST offrir sans authentification l'annuaire d'une année sur `GET /api/v1/members` : les membres qui ont un mandat cette année-là, dans l'ordre du club, chacun avec son prénom, son nom, sa profession ou ses études, le label de l'année, ses fonctions de l'année et son ordre, dans la forme de l'exemple d'`ARCHITECTURE.md`, section 13.
- **FR-020** : L'année de l'annuaire MUST être désignée par son label (`2026-2027`), jamais par un identifiant ; sans année précisée, c'est l'année courante. Un label mal formé MUST donner `400`.
- **FR-020a** : Si l'année précisée n'existe pas, ou si aucune année n'est précisée et qu'aucune année Rotary n'est courante, l'annuaire MUST répondre `200` avec une liste vide.
- **FR-021** : L'annuaire MUST accepter un nombre maximal de membres à renvoyer ; il n'est pas paginé : une année tient en une réponse.
- **FR-022** : L'API MUST offrir sans authentification, sur `GET /api/v1/members/years`, les années Rotary qui ont au moins un mandat, de la plus récente à la plus ancienne, dans la même forme que la liste des années Rotary (`specs/002-rotary-years/contracts/rotary-years.md`).

**Suppressions et intégrité**

- **FR-023** : Supprimer un membre MUST supprimer tous ses mandats (`ARCHITECTURE.md`, sections 1.3 et 3). Aucun mandat ne MUST subsister sans membre.
- **FR-024** : Supprimer un mandat MUST NOT supprimer ni le membre ni l'année Rotary.
- **FR-025** : Supprimer une année Rotary référencée par au moins un mandat MUST être refusé par un conflit (`409`, message générique), l'année et ses mandats étant conservés (`ARCHITECTURE.md`, section 1.1 ; `specs/002-rotary-years/spec.md`, FR-023). Une année sans mandat reste supprimable.
- **FR-026** : Créer un mandat pour un membre ou une année qui n'existe pas MUST être refusé (`400`), sans rien créer.

**Protection, erreurs, limites**

- **FR-027** : Toutes les opérations d'administration MUST exiger un jeton valide et le rôle `ADMIN`, par les gardes existantes posées sur chaque contrôleur d'administration. Aucune route d'administration ne MUST exister sans protection. L'authentification n'est pas modifiée.
- **FR-028** : Un identifiant mal formé MUST donner `400` « Identifiant invalide. » ; une ressource inexistante désignée dans l'adresse MUST donner `404`. Une création réussie répond `201`, une suppression réussie `204` sans corps, comme pour les années Rotary.
- **FR-029** : Toutes les erreurs MUST suivre le format commun du socle, en français. Les messages par défaut du socle s'appliquent : `400` « Données invalides. » avec le détail par champ, `404` « Ressource introuvable. », `409` « Conflit avec une ressource existante. ».
- **FR-029a** : Les trois conflits de cette fonctionnalité (mandat déjà existant pour le couple membre et année ; ordre déjà pris dans l'année ; suppression d'une année Rotary utilisée) MUST répondre `409` avec le message générique « Conflit avec une ressource existante. ». Aucun message spécifique n'est créé.
- **FR-030** : Cette fonctionnalité MUST NOT modifier `apps/web`, `apps/admin` ni `DESIGN.md`, ni créer d'action, d'actualité, de candidature ou de route les concernant.
- **FR-031** : Elle MUST NOT inventer de donnée : aucun membre d'exemple, aucun mandat fictif, aucun script d'insertion (constitution, principes III et VIII).

### Key Entities

- **Member** : une personne membre du club. Prénom, nom ; facultatifs : profession ou études, email et téléphone (internes). N'a ni fonction, ni état actif, ni portrait dans cette fonctionnalité.
- **MemberMandate** : la présence d'un membre au club pendant une année Rotary. Référence un membre et une année ; porte les fonctions de l'année (zéro à plusieurs, parmi dix) et un ordre d'affichage, entier à partir de 1, unique dans son année. Un seul par couple (membre, année).
- **MemberRole** : une des dix fonctions du club. Liste fermée de valeurs, sans entité propre ni hiérarchie.
- **RotaryYear** : inchangée (`specs/002-rotary-years/data-model.md`). Désormais référencée par les mandats.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : L'administrateur enregistre un membre avec deux informations seulement, son prénom et son nom.
- **SC-002** : Il n'existe jamais deux mandats pour un même membre et une même année, quel que soit le nombre de tentatives, y compris simultanées.
- **SC-003** : 100 % des fonctions enregistrées appartiennent à la liste des dix ; aucune n'est enregistrée deux fois dans un même mandat.
- **SC-004** : L'annuaire public d'une année renvoie exactement les membres qui y ont un mandat, dans l'ordre fixé par l'administrateur ; deux membres d'une même année n'ont jamais le même ordre.
- **SC-005** : Aucun email ni téléphone de membre n'apparaît dans une réponse publique.
- **SC-006** : Après la suppression d'un membre, il ne reste aucun mandat qui le désigne.
- **SC-007** : Une année Rotary qui a au moins un mandat ne peut pas être supprimée ; aucun mandat ne désigne jamais une année inexistante.
- **SC-008** : 100 % des appels d'administration sans jeton valide sont refusés, sans lecture ni écriture.
- **SC-009** : Les routes existantes (santé, années Rotary publiques et d'administration, authentification) répondent comme avant, hormis le refus de supprimer une année référencée.
- **SC-010** : Le Front Office et le Back Office sont strictement inchangés : aucun fichier de `apps/web`, `apps/admin` ni `DESIGN.md` n'est modifié, et leurs builds passent comme avant.

## Assumptions

- **Cascade à la suppression d'un membre : déjà verrouillée.** `ARCHITECTURE.md` l'écrit deux fois (section 1.3 : « Supprimer un membre supprime ses mandats » ; section 3 : « suppression en cascade des mandats »). Cette spec l'applique sans la décider.
- **Références inexistantes à la création d'un mandat : `400`.** Règle d'`ARCHITECTURE.md`, section 8, pour l'année d'une action ou d'une actualité, étendue au membre et à l'année d'un mandat. Validée par le porteur du projet.
- **Messages de conflit.** Aucun message spécifique : les trois conflits répondent avec le message générique du `409`. Le texte que `specs/002-rotary-years` renvoyait à cette fonctionnalité pour l'année utilisée est donc ce message générique. Conséquence acceptée : le futur écran du Back Office ne distingue pas ces trois cas par leur message, seulement par l'opération qu'il vient de demander. Le conflit d'ordre n'était pas nommé dans la décision sur les messages ; il suit la même règle, par cohérence.
- **Messages de validation par champ.** Ils doivent être en français (socle, FR-018) : leurs textes sont proposés au plan, dans le contrat, et soumis à validation.
- **Forme de la liste d'administration des membres.** Champs du membre sans ses mandats ; la fiche les donne. Validé par le porteur du projet.
- **Forme de la liste des années ayant des membres.** La même que la liste des années Rotary, dans `{ "data": [] }`. Validé par le porteur du projet.
- **Portrait.** `ARCHITECTURE.md`, section 1.2, garde un portrait facultatif sur le membre : il n'est pas retiré du modèle cible, seulement reporté au stockage de fichiers. Les exemples de l'architecture qui le montrent restent valables pour plus tard.
- **Ordre strict : précision à inscrire dans l'architecture.** `ARCHITECTURE.md`, section 3, liste un index `(rotaryYear, order)` sans le dire unique, et la section 1.3 ne fixe ni le type entier ni l'unicité. La décision du porteur du projet (ordre entier à partir de 1, unique par année) précise ces points ; `ARCHITECTURE.md` est à aligner avant l'implémentation, au plan (constitution, principe I). Cette spec ne le modifie pas.
- **Réordonnancement sans état intermédiaire en double.** `ARCHITECTURE.md`, section 3, indique « aucune transaction requise ». Réécrire les ordres d'une année sans jamais laisser deux mandats au même ordre est une contrainte que le plan doit résoudre, en disant ce qui se passe si l'opération est interrompue.
- **Liste des mandats.** Non paginée, comme les membres d'une année ; chaque mandat dans la forme de l'exemple de l'architecture.
- **Recherche.** Par les index texte de MongoDB, mot entier, sans tolérance (`ARCHITECTURE.md`, section 3).
- **Front Office.** Aucun changement n'est nécessaire maintenant. À la connexion, son type `Member` (`mandates[]`) laissera place aux fonctions de l'année demandée, comme le prévoit `ARCHITECTURE.md`, section 10.
- **Premières aides communes.** Cette fonctionnalité est la première à avoir besoin d'une liste paginée et d'une liste fermée de valeurs ; leurs emplacements (`common/dto/`, `common/enums/`) sont ceux d'`ARCHITECTURE.md`, section 5, et relèvent du plan.
- **Dépendances.** Aucune dépendance nouvelle n'est attendue.
- **Vérification.** Elle suppose une base joignable et le compte d'administration existant. Les membres et mandats créés pour la vérification sont supprimés ensuite par l'API : aucune donnée fictive n'est laissée en base.
- **Branche.** La branche `004-members` a été créée par Spec Kit, avec l'accord explicite du porteur du projet.
