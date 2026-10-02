# Feature Specification: Actions

**Feature Branch**: `005-actions`

**Created**: 2026-10-02

**Status**: Draft

**Input**: User description: « Prochaine fonctionnalité métier : les actions du club. Spécifier séparément, avant tout plan ou implémentation, en respectant `PROJECT_CONTEXT.md`, `ARCHITECTURE.md`, `DESIGN.md`, la constitution et les décisions déjà verrouillées. »

**Références** : `ARCHITECTURE.md` (sections 1.1, 1.4, 2, 3, 5, 6, 8, 9, 10, 13, 14 décisions 3, 4, 9, 10, 12, 13 et 15, et les décisions ouvertes), `DESIGN.md` (section 10 et composition de la page « Actions »), `PROJECT_CONTEXT.md`, `CLAUDE.md`, `.specify/memory/constitution.md` (principes I, V, VI, VIII, IX), `specs/001-api-foundation/contracts/errors.md`, `specs/002-rotary-years/`, `specs/003-admin-auth/`, `specs/004-members/` (conventions reprises : pagination, effacement par `null`, messages de conflit), `apps/web/src/types/action.ts` et `apps/web/src/data/actions.ts` (besoins du Front Office).

## Contexte et périmètre

Une action est un projet ou une activité du club avec un objectif ou un impact concret. C'est le premier **contenu éditorial** de l'API : il a un titre, une adresse lisible (son slug), un état brouillon ou publié, et il est rattaché à une année Rotary choisie par l'administrateur.

Le modèle est verrouillé par `ARCHITECTURE.md`, section 1.4. Les actions et les actualités restent deux entités séparées (constitution, principe VI) : cette spec ne traite que des actions. Elle dit **ce que la fonctionnalité doit garantir** ; le plan dira comment.

Elle s'appuie sur ce qui existe : années Rotary, authentification et gardes, format d'erreur, validation, pagination commune. Aucun de ces mécanismes n'est modifié, à une exception près, prévue depuis `002-rotary-years` : la suppression d'une année Rotary référencée par une action est désormais refusée.

### Dans le périmètre

1. L'entité Action et ses règles : titre, slug unique, résumé, description, date, année Rotary, domaines d'action, impact facultatif, état de publication, ordre manuel facultatif. Sans photographies.
2. La liste fermée des sept domaines d'action du Rotary, sous forme de valeurs autorisées.
3. L'administration des actions : créer, lister, consulter, modifier, publier et dépublier, supprimer.
4. Les lectures publiques dont la page `/actions` aura besoin : la liste paginée des actions publiées, le détail d'une action publiée par son slug, les années qui ont au moins une action publiée.
5. Le refus de supprimer une année Rotary référencée par une action.

### Hors périmètre

- Les actualités (News) : fonctionnalité distincte.
- Les **photographies** de l'action : aucun champ `photos`, aucun envoi de fichier, aucun stockage d'image par adresse. Aucun fournisseur n'est choisi (`ARCHITECTURE.md`, section 14, décision ouverte) ; elles seront traitées avec cette décision.
- Toute route de réordonnancement des actions.
- Le **registre d'impact agrégé** de la page Actions : aucune entité ne le porte et sa décision est ouverte (`ARCHITECTURE.md`, section 14). Cette fonctionnalité ne le crée pas et ne tranche pas.
- Toute modification du Front Office : `apps/web` et `DESIGN.md` ne sont pas modifiés. La page `/actions` reste sur ses données locales (`ARCHITECTURE.md`, décision 15).
- Tout écran du Back Office : `apps/admin` n'est pas modifié. L'avertissement « la date tombe hors de l'année choisie » et le signalement d'un changement de slug publié sont des comportements d'écran, décrits pour mémoire seulement.
- Une page de détail côté Front Office : l'API offre le détail par slug, la page viendra plus tard.
- Toute donnée d'exemple : aucune action fictive n'est enregistrée.
- Toute modification de l'authentification, du socle, des membres et des mandats.
- Les tests automatisés (constitution, principe IX).

## Clarifications

### Session 2026-10-02

- Q: Les photographies de l'action font-elles partie de cette fonctionnalité ? → A: Non. Aucun champ `photos`, aucun envoi de fichier, aucun stockage d'image par adresse. Elles seront traitées avec la future décision de stockage.
- Q: Quelle règle pour l'ordre manuel ? → A: Entier supérieur ou égal à 1, facultatif, global (non lié à l'année Rotary), doublons autorisés. Aucune route de réordonnancement. Le tri public reste celui d'`ARCHITECTURE.md` : ordre croissant lorsqu'il existe, puis date décroissante.

Hypothèses validées à la même session : les conflits `409` utilisent « Conflit avec une ressource existante. » ; pour les champs facultatifs, `null` efface la valeur et la chaîne vide `""` est refusée ; une modification de l'impact remplace l'objet entier, sans fusion rubrique par rubrique ; rubriques textuelles de l'impact de 500 caractères au plus, partenaire de 120 caractères au plus ; une année Rotary inexistante en filtre répond `200` avec une liste vide ; une action peut être créée directement publiée ; un titre qui ne produit aucun slug est refusé en `400`.

Contradiction `DESIGN.md` / `ARCHITECTURE.md` sur le registre d'impact : non résolue ici, conservée comme point de migration du Front Office ; l'API suit `ARCHITECTURE.md`.

## User Scenarios & Testing *(mandatory)*

Conformément à la constitution (principe IX), il n'y a pas de test automatisé : chaque récit décrit une **vérification manuelle**.

### User Story 1 - Rédiger et gérer une action (Priority: P1)

L'administrateur connecté enregistre une action : son titre, sa date, l'année Rotary à laquelle il la rattache, et s'il les connaît un résumé, une description et les domaines d'action concernés. L'action naît en brouillon. Il peut la retrouver, la consulter, la corriger et la supprimer.

**Why this priority** : sans action enregistrée, rien ne peut être publié ni lu.

**Independent Test** : vérification manuelle. Connecté, créer une action avec un titre, une date et une année existante : elle est renvoyée avec un slug tiré du titre, en brouillon. La modifier, la retrouver dans la liste d'administration, puis la supprimer. Sans jeton, chacun de ces appels est refusé.

**Acceptance Scenarios** :

1. **Given** une année Rotary existante, **When** l'administrateur crée une action avec un titre, une date et cette année, **Then** l'action est enregistrée en brouillon et renvoyée avec son identifiant, un slug généré depuis le titre, et l'année (identifiant et label).
2. **Given** un titre absent, vide ou de plus de 120 caractères, une date absente ou mal formée, ou une année absente, **When** la création est demandée, **Then** elle est refusée (`400`) avec le détail du champ en cause.
3. **Given** un identifiant d'année bien formé qui ne correspond à aucune année, **When** l'action est créée ou modifiée, **Then** la demande est refusée (`400`) et rien n'est enregistré.
4. **Given** une date qui tombe hors de l'année Rotary choisie, **When** l'action est créée, **Then** elle est acceptée et l'année choisie est enregistrée telle quelle : l'année n'est jamais déduite ni corrigée à partir de la date.
5. **Given** un domaine d'action hors de la liste des sept, ou le même domaine deux fois, **When** l'action est créée ou modifiée, **Then** la demande est refusée (`400`) avec le détail sur les domaines.
6. **Given** des actions enregistrées, **When** l'administrateur lit la liste d'administration, **Then** elle est paginée (20 par page par défaut), de la date la plus récente à la plus ancienne, brouillons compris, et peut être cherchée par titre ou résumé et filtrée par année, par domaine et par état de publication.
7. **Given** une action existante, **When** l'administrateur modifie une partie de ses champs, **Then** seuls les champs envoyés changent ; l'année Rotary est modifiable.
8. **Given** une action existante, **When** l'administrateur la supprime, **Then** elle n'existe plus ; l'année Rotary existe toujours.
9. **Given** un identifiant mal formé, **When** une action est consultée, modifiée ou supprimée, **Then** la réponse est `400` « Identifiant invalide. » ; un identifiant bien formé inconnu donne `404`.
10. **Given** un appel sans jeton valide, **When** il vise une de ces opérations, **Then** il est refusé (`401`) et rien n'est lu ni modifié.

---

### User Story 2 - Donner à chaque action une adresse stable (Priority: P1)

Chaque action a un slug : la partie lisible de son adresse publique. Il est généré depuis le titre quand l'administrateur n'en fournit pas, reste unique, et ne change jamais sans que l'administrateur l'ait demandé.

**Why this priority** : le slug est l'identifiant public de l'action. Deux actions de même slug, ou un slug qui change tout seul, casseraient les adresses.

**Independent Test** : vérification manuelle. Créer deux actions de même titre sans slug : la seconde reçoit le suffixe `-2`. Créer une action en imposant un slug déjà pris : refus. Modifier le titre d'une action : son slug ne change pas.

**Acceptance Scenarios** :

1. **Given** une action créée sans slug avec le titre « Journée de l'eau à Ivandry », **When** elle est enregistrée, **Then** son slug est en minuscules, sans accents, mots séparés par des tirets.
2. **Given** une action dont le slug généré existe déjà, **When** elle est enregistrée, **Then** son slug reçoit un suffixe `-2`, puis `-3` au besoin, et la création réussit.
3. **Given** un slug fourni par l'administrateur, bien formé et libre, **When** l'action est créée ou modifiée, **Then** ce slug est enregistré tel quel.
4. **Given** un slug fourni déjà porté par une autre action, **When** l'action est créée ou modifiée, **Then** la demande est refusée par un conflit (`409`) et rien n'est modifié.
5. **Given** un slug fourni mal formé (majuscules, espaces, accents, tiret en début ou en fin, plus de 120 caractères), **When** il est envoyé, **Then** la demande est refusée (`400`) avec le détail sur le slug.
6. **Given** une action existante, **When** l'administrateur modifie son titre sans envoyer de slug, **Then** le slug est inchangé.
7. **Given** deux créations simultanées qui produiraient le même slug, **When** elles sont traitées, **Then** il n'existe jamais deux actions de même slug.

---

### User Story 3 - Publier et dépublier (Priority: P1)

Une action reste invisible du public tant que l'administrateur ne l'a pas publiée. Il la publie, peut la dépublier, et la date de première publication est conservée.

**Why this priority** : c'est ce qui sépare le travail en cours de ce que le site montre. Un brouillon ne doit jamais fuiter.

**Independent Test** : vérification manuelle. Une action en brouillon n'apparaît dans aucune lecture publique et son adresse publique répond `404`. Une fois publiée, elle apparaît ; dépubliée, elle disparaît à nouveau.

**Acceptance Scenarios** :

1. **Given** une action en brouillon, **When** l'administrateur la publie, **Then** elle devient visible du public et sa date de première publication est enregistrée.
2. **Given** une action publiée, **When** l'administrateur la dépublie, **Then** elle n'est plus visible du public ; sa date de première publication est conservée.
3. **Given** une action dépubliée, **When** elle est republiée, **Then** sa date de première publication n'a pas changé.
4. **Given** une action créée directement comme publiée, **When** elle est enregistrée, **Then** elle est visible du public et porte sa date de première publication.
5. **Given** une action en brouillon, **When** un visiteur demande son détail par son slug, **Then** la réponse est `404`, comme si elle n'existait pas.

---

### User Story 4 - Lire les actions publiées (Priority: P2)

Le Front Office, plus tard, lit sans authentification les actions publiées : la liste paginée, filtrable par année et par domaine, le détail d'une action par son slug, et les années qui ont au moins une action publiée. Aucune donnée d'administration n'est exposée.

**Why this priority** : c'est la lecture que la page `/actions` et l'aperçu de l'accueil utiliseront. Elle n'a de sens qu'une fois des actions publiées.

**Independent Test** : vérification manuelle. Avec trois actions publiées et un brouillon, lire la liste sans jeton : trois actions, dans l'ordre attendu, chacune avec le label de son année ; aucun champ d'administration.

**Acceptance Scenarios** :

1. **Given** des actions publiées et des brouillons, **When** on lit la liste publique, **Then** seules les actions publiées sont renvoyées, paginées (20 par page par défaut), avec le nombre total.
2. **Given** des actions publiées, **When** on lit la liste, **Then** celles qui ont un ordre viennent d'abord, par ordre croissant ; à ordre égal, et pour celles qui n'en ont pas, la date la plus récente vient d'abord.
3. **Given** un filtre par année (label) ou par domaine, **When** on lit la liste, **Then** seules les actions publiées de cette année, ou rattachées à ce domaine, sont renvoyées.
4. **Given** une recherche, **When** on lit la liste, **Then** seules les actions publiées dont le titre ou le résumé contient le mot cherché sont renvoyées.
5. **Given** une action publiée, **When** on lit la liste ou son détail, **Then** elle porte son identifiant, son slug, son titre, son résumé, sa description, sa date, le **label** de son année, ses domaines et son impact s'il existe ; ni son état de publication, ni son ordre, ni ses dates techniques, ni aucune photographie.
6. **Given** une action publiée, **When** on demande son détail par son slug, **Then** on l'obtient ; un slug inconnu donne `404`.
7. **Given** une année précisée, bien formée, qui n'existe pas, **When** on lit la liste, **Then** la réponse est `200` avec une liste vide.
8. **Given** des actions publiées dans deux années et un brouillon dans une troisième, **When** on lit les années qui ont au moins une action publiée, **Then** seules les deux premières sont renvoyées, de la plus récente à la plus ancienne.

---

### User Story 5 - Décrire l'impact sans rien inventer (Priority: P2)

L'administrateur peut décrire l'impact d'une action : objectif, bénéficiaires, lieu, période, partenaires, résultats. Chaque rubrique est facultative. Ce qui n'est pas renseigné n'existe pas : ni valeur par défaut, ni texte de remplacement.

**Why this priority** : c'est la règle « rien n'est inventé » appliquée aux actions (`ARCHITECTURE.md`, décision 12 ; constitution, principe VIII).

**Independent Test** : vérification manuelle. Créer une action sans impact : la réponse n'a pas de champ d'impact. Renseigner deux rubriques : seules ces deux apparaissent. Effacer l'impact : le champ disparaît.

**Acceptance Scenarios** :

1. **Given** une action sans aucune rubrique d'impact, **When** on la lit, côté public ou administration, **Then** le champ d'impact est absent de la réponse.
2. **Given** une action dont deux rubriques d'impact sont renseignées, **When** on la lit, **Then** seules ces deux rubriques apparaissent.
3. **Given** une action avec un impact, **When** l'administrateur envoie `null` pour l'impact, **Then** le champ est absent des lectures suivantes.
4. **Given** une action dont l'objectif et les bénéficiaires sont renseignés, **When** l'administrateur envoie un impact ne contenant que le lieu, **Then** l'impact enregistré ne contient plus que le lieu : l'objet entier est remplacé, sans fusion.
5. **Given** une rubrique d'impact envoyée comme chaîne vide, ou de plus de 500 caractères, **When** la demande est traitée, **Then** elle est refusée (`400`) avec le détail sur la rubrique.
6. **Given** une liste de plus de 20 partenaires, un partenaire vide ou de plus de 120 caractères, **When** elle est envoyée, **Then** la demande est refusée (`400`).
7. **Given** un impact envoyé comme objet sans aucune rubrique, **When** la demande est traitée, **Then** aucun impact n'est enregistré et le champ est absent des lectures.

---

### User Story 6 - Protéger les années Rotary référencées (Priority: P2)

Une année Rotary à laquelle une action est rattachée ne peut pas être supprimée.

**Why this priority** : sans ce refus, des actions désigneraient une année qui n'existe plus.

**Independent Test** : vérification manuelle. Tenter de supprimer une année qui a une action, brouillon ou publiée : refus. Supprimer l'action, puis l'année : accepté.

**Acceptance Scenarios** :

1. **Given** une année Rotary référencée par au moins une action, publiée ou non, **When** l'administrateur tente de la supprimer, **Then** la demande est refusée par un conflit (`409`) et l'année comme ses actions sont conservées.
2. **Given** une année Rotary qui n'est référencée ni par une action ni par un mandat, **When** l'administrateur la supprime, **Then** elle est supprimée.
3. **Given** une année Rotary référencée par un mandat seulement, **When** l'administrateur tente de la supprimer, **Then** le refus existant est inchangé.

---

### Edge Cases

- **Titre qui ne donne aucun slug** (uniquement des signes de ponctuation) : la création est refusée (`400`) avec le détail sur le slug, tant que l'administrateur n'en fournit pas un.
- **Titres identiques** : permis ; seuls les slugs sont uniques.
- **Domaines vides** : un tableau vide est valide ; l'absence du champ à la création vaut un tableau vide.
- **Changement de slug d'une action publiée** : accepté ; l'ancienne adresse cesse de répondre. Le signalement à l'administrateur relève du futur écran.
- **Photographies** : exclues. L'action n'a aucun champ `photos` ; un champ `photos` envoyé est refusé comme champ non prévu (`400`), et aucune réponse n'en contient.
- **Ordre manuel** : entier supérieur ou égal à 1, facultatif, global. Deux actions peuvent porter le même ordre, y compris dans des années différentes ; la date les départage. Zéro, un nombre négatif, un décimal ou un texte sont refusés (`400`). `null` retire l'ordre.
- **Ordre et filtre par année** : l'ordre étant global, une action épinglée garde sa place en tête quel que soit le filtre appliqué.
- **Champ non prévu** dans une demande : refusé par le socle (`400`).
- **Recherche de moins de deux caractères**, tri non autorisé, page ou taille hors bornes, label d'année mal formé, domaine inconnu en filtre : `400`, selon le contrat commun des listes.
- **Base injoignable** : erreur au format commun, sans détail technique (socle).

## Requirements *(mandatory)*

### Functional Requirements

**Action**

- **FR-001** : Une action MUST porter un titre, un slug, une date et une année Rotary, obligatoires ; et MAY porter un résumé, une description, des domaines d'action et un impact. Elle porte un état de publication et, éventuellement, un ordre. Aucune photographie n'est enregistrée ni acceptée par cette fonctionnalité.
- **FR-001a** : L'ordre manuel MUST être facultatif. Quand il existe, il MUST être un entier supérieur ou égal à 1. Il est global : il ne dépend pas de l'année Rotary. Plusieurs actions MAY porter le même ordre. Aucune route de réordonnancement n'est offerte : l'ordre se fixe et se retire par la modification de l'action.
- **FR-002** : Le titre MUST compter de 1 à 120 caractères, espaces de début et de fin retirés. Le résumé MUST compter 500 caractères au plus. La description, texte brut dont les paragraphes sont séparés par une ligne vide, MUST compter 20 000 caractères au plus. La date MUST être au format ISO 8601 (`ARCHITECTURE.md`, section 8).
- **FR-003** : L'année Rotary MUST être désignée par l'identifiant d'une année existante, choisie par l'administrateur, à la création comme à la modification. Elle MUST NOT être déduite de la date, ni corrigée quand la date tombe hors de l'année. Une année inexistante MUST donner `400`. Aucune donnée de l'année n'est recopiée dans l'action.
- **FR-004** : Les domaines d'action MUST être une liste de zéro, une ou plusieurs valeurs, sans doublon, parmi exactement les sept de `ARCHITECTURE.md`, section 1.4 : `paix`, `maladies`, `eau`, `sante`, `education`, `economie`, `environnement`. Liste fermée de valeurs, identiques à celles du Front Office ; aucune entité ni collection n'est créée pour elles.
- **FR-005** : Une action MUST NOT être confondue avec une actualité : aucun champ, aucune route ni aucune collection n'est partagé entre les deux.

**Slug**

- **FR-006** : Le slug MUST être unique parmi les actions, y compris quand deux écritures arrivent en même temps. Cette garantie MUST être portée par le modèle.
- **FR-007** : Sans slug fourni à la création, le système MUST le générer depuis le titre : sans accents, en minuscules, mots séparés par des tirets. En cas de collision, il MUST ajouter le suffixe `-2`, puis `-3`, et ainsi de suite.
- **FR-008** : Un slug fourni par l'administrateur, à la création ou à la modification, MUST respecter la forme `^[a-z0-9]+(-[a-z0-9]+)*$` et compter 120 caractères au plus, sinon `400`. S'il est déjà porté par une autre action, la demande MUST être refusée par un conflit (`409`).
- **FR-009** : Modifier le titre MUST NOT régénérer le slug. Le slug ne change que si l'administrateur en envoie un.

**Publication**

- **FR-010** : Une action MUST être en brouillon par défaut. L'administrateur la publie et la dépublie par la modification de son état ; il n'existe pas de route dédiée.
- **FR-011** : La date de première publication MUST être enregistrée quand l'action est publiée pour la première fois, et MUST NOT changer ensuite, ni à la dépublication ni à une republication.
- **FR-012** : Une action non publiée MUST NOT apparaître dans aucune lecture publique ; son détail public MUST répondre `404`, comme si elle n'existait pas.

**Impact**

- **FR-013** : L'impact MUST être facultatif. Ses rubriques — objectif, bénéficiaires, lieu, période, partenaires, résultats — MUST toutes être facultatives. Seules les rubriques fournies sont enregistrées ; aucune n'est jamais estimée ni remplie par défaut.
- **FR-014** : Une action sans aucune rubrique d'impact MUST NOT porter de champ d'impact dans les réponses. Aucun texte de remplacement ne tient lieu d'impact (`ARCHITECTURE.md`, décision 12).
- **FR-015** : Chaque rubrique textuelle de l'impact (objectif, bénéficiaires, lieu, période, résultats) MUST compter de 1 à 500 caractères. Les partenaires MUST être une liste de 20 éléments au plus, chacun de 1 à 120 caractères.
- **FR-015a** : Une modification de l'impact MUST remplacer l'objet d'impact entier : les rubriques non envoyées ne sont pas conservées. Il n'y a pas de fusion rubrique par rubrique. `null` MUST effacer l'impact ; un objet d'impact sans aucune rubrique équivaut à l'absence d'impact.

**Administration** (sous `/api/v1/admin/actions`)

- **FR-016** : L'administrateur MUST pouvoir créer une action, la consulter, modifier une partie de ses champs, et la supprimer.
- **FR-017** : L'administrateur MUST disposer d'une liste paginée de toutes les actions, brouillons compris, selon le contrat commun des listes, avec recherche sur le titre et le résumé, filtres par année (label), par domaine et par état de publication, tri par date décroissante par défaut, ou par titre ou date de création.
- **FR-018** : Les réponses d'administration MUST porter tous les champs de l'action, dans la forme de l'exemple d'`ARCHITECTURE.md`, section 13, l'année étant renvoyée avec son identifiant et son label.
- **FR-019** : Dans une modification, un champ absent MUST rester inchangé ; `null` MUST effacer un champ facultatif (résumé, description, ordre, impact) ; une chaîne vide `""` MUST être refusée. C'est la convention de `004-members`. Le titre, le slug, la date et l'année Rotary ne peuvent pas être effacés.
- **FR-019a** : Une action MAY être créée directement publiée ; sa date de première publication est alors celle de sa création.

**Lecture publique**

- **FR-020** : L'API MUST offrir sans authentification, sur `GET /api/v1/actions`, la liste paginée des actions **publiées**, avec recherche sur le titre et le résumé et filtres par année (label) et par domaine.
- **FR-021** : La liste publique MUST être triée comme le fixe `ARCHITECTURE.md` : les actions qui ont un ordre d'abord, par ordre croissant ; puis, à ordre égal et pour celles qui n'en ont pas, par date décroissante.
- **FR-022** : L'API MUST offrir sans authentification, sur `GET /api/v1/actions/:slug`, le détail d'une action publiée ; un slug inconnu ou une action non publiée MUST donner `404`.
- **FR-023** : L'API MUST offrir sans authentification, sur `GET /api/v1/actions/years`, les années Rotary qui ont au moins une action publiée, de la plus récente à la plus ancienne, dans la même forme que la liste des années Rotary.
- **FR-024** : Les réponses publiques MUST omettre l'état de publication, l'ordre et les dates techniques, et MUST renvoyer l'année sous la forme de son **label** (`ARCHITECTURE.md`, section 13).
- **FR-025** : Un label d'année mal formé MUST donner `400` ; une année bien formée qui n'existe pas MUST donner `200` avec une liste vide, sur la liste publique comme sur la liste d'administration.

**Suppressions et intégrité**

- **FR-026** : Supprimer une action MUST NOT supprimer l'année Rotary. Rien d'autre ne référence une action.
- **FR-027** : Supprimer une année Rotary référencée par au moins une action, publiée ou non, MUST être refusé par un conflit (`409`), l'année et ses actions étant conservées (`ARCHITECTURE.md`, section 1.1). Le refus existant pour les mandats MUST rester inchangé.

**Protection, erreurs, limites**

- **FR-028** : Toutes les opérations d'administration MUST exiger un jeton valide et le rôle `ADMIN`, par les gardes existantes posées sur le contrôleur d'administration. Aucune route d'administration ne MUST exister sans protection. L'authentification n'est pas modifiée.
- **FR-029** : Un identifiant mal formé MUST donner `400` « Identifiant invalide. » ; une ressource inexistante MUST donner `404`. Une création réussie répond `201`, une suppression réussie `204` sans corps.
- **FR-030** : Toutes les erreurs MUST suivre le format commun du socle, en français. Les deux conflits de cette fonctionnalité (slug déjà pris ; année Rotary utilisée) MUST répondre `409` avec le message générique « Conflit avec une ressource existante. » : aucun message de conflit spécifique n'est créé.
- **FR-030a** : Un titre dont aucun slug ne peut être tiré, sans slug fourni, MUST être refusé (`400`).
- **FR-031** : Cette fonctionnalité MUST NOT modifier `apps/web`, `apps/admin` ni `DESIGN.md`, ni créer d'actualité, de candidature, de registre d'impact agrégé, ou de route les concernant.
- **FR-032** : Elle MUST NOT inventer de donnée : aucune action d'exemple, aucun script d'insertion (constitution, principes III et VIII).

### Key Entities

- **Action** : un projet ou une activité du club. Titre, slug unique, résumé, description, date, année Rotary (référence), domaines d'action, impact facultatif, état de publication, date de première publication, ordre manuel facultatif (entier à partir de 1, global, non unique). Pas de photographies dans cette fonctionnalité.
- **ActionImpact** : la fiche d'impact d'une action, embarquée dans l'action. Six rubriques facultatives : objectif, bénéficiaires, lieu, période, partenaires, résultats.
- **FocusArea** : un des sept domaines d'action du Rotary. Liste fermée de valeurs, sans entité propre.
- **RotaryYear** : inchangée. Désormais référencée aussi par les actions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : L'administrateur enregistre une action avec trois informations seulement : son titre, sa date et son année Rotary.
- **SC-002** : Il n'existe jamais deux actions de même slug, quel que soit le nombre de tentatives, y compris simultanées.
- **SC-003** : Aucune action non publiée n'apparaît dans une réponse publique, liste, détail ou années.
- **SC-004** : Le slug d'une action ne change jamais sans demande explicite de l'administrateur.
- **SC-005** : 100 % des actions enregistrées portent l'année Rotary choisie par l'administrateur, même quand leur date tombe hors de cette année.
- **SC-006** : Aucune réponse ne contient une rubrique d'impact que l'administrateur n'a pas renseignée.
- **SC-007** : Une année Rotary qui a au moins une action ne peut pas être supprimée ; aucune action ne désigne jamais une année inexistante.
- **SC-008** : 100 % des appels d'administration sans jeton valide sont refusés, sans lecture ni écriture.
- **SC-009** : Les routes existantes (santé, authentification, années Rotary, membres et mandats) répondent comme avant, hormis le refus de supprimer une année référencée par une action.
- **SC-010** : Le Front Office et le Back Office sont strictement inchangés : aucun fichier de `apps/web`, `apps/admin` ni `DESIGN.md` n'est modifié, et leurs builds passent comme avant.

## Assumptions

- **Contradiction `DESIGN.md` / `ARCHITECTURE.md`, conservée comme point de migration du Front Office.** `DESIGN.md`, section 10, prescrit la mention « Donnée à venir » pour le registre d'impact de la page Actions ; `ARCHITECTURE.md` (décision 12 et section 10, « Écarts ») décide : pas de donnée, pas de section. Décision du porteur du projet le 2026-10-02 : ne pas la résoudre maintenant, ne modifier ni `DESIGN.md` ni `apps/web`, suivre `ARCHITECTURE.md` pour l'API. Elle reste à traiter à la migration du Front Office, où `DESIGN.md` devra être corrigé d'abord.
- **Registre d'impact agrégé : décision ouverte, laissée ouverte.** La fonction `getImpactIndicators` du Front Office n'a aucun équivalent dans l'API tant que le porteur du projet n'a pas décidé de le retirer ou de le faire saisir.
- **Écart de forme avec le Front Office, déjà prévu.** Le type `Action` de `apps/web` porte un seul `focusArea` et n'a ni `description` ni `date` ; `ARCHITECTURE.md`, section 10, prévoit qu'il passera à `focusAreas` au pluriel et recevra ces deux champs à la connexion. Rien n'est à faire maintenant.
- **Nombre d'actions pour l'accueil.** La fonction `getActionCount` du Front Office sera servie par le nombre total de la liste paginée ; aucune route dédiée n'est créée.
- **Messages de conflit.** Message générique du `409`, validé pour cette fonctionnalité. Conséquence : le futur écran distingue « slug déjà pris » et « année utilisée » par l'opération demandée, pas par le texte.
- **Effacement par `null`.** Validé : résumé, description, ordre et impact entier.
- **Modification de l'impact.** Validé : remplacement de l'objet entier.
- **Longueur des rubriques d'impact.** Validé : 500 caractères par rubrique textuelle, 120 par partenaire. `ARCHITECTURE.md` ne les fixait pas.
- **Année inexistante en filtre.** Validé : `200` et liste vide.
- **Photographies.** `ARCHITECTURE.md`, section 1.4, garde `photos` dans le modèle cible de l'action : le champ n'est pas retiré de l'architecture, seulement reporté à la décision de stockage. Les exemples de l'architecture qui le montrent restent valables pour plus tard.
- **Précisions à inscrire dans `ARCHITECTURE.md` au plan** (constitution, principe I), sans contradiction : règles de l'ordre (entier à partir de 1, global, doublons permis) ; photographies non mises en œuvre avant le stockage ; longueurs des rubriques d'impact ; codes `201` et `204` ; liste vide pour une année inexistante. Cette spec ne modifie pas `ARCHITECTURE.md`.
- **Recherche.** Par les index texte de MongoDB, mot entier, sans tolérance (`ARCHITECTURE.md`, section 3).
- **Création directement publiée.** Validé.
- **Messages de validation par champ.** En français ; leurs textes sont proposés au plan, dans le contrat, et soumis à validation.
- **Dépendances.** Aucune dépendance nouvelle n'est attendue.
- **Vérification.** Elle suppose une base joignable et le compte d'administration. Les actions et années créées pour la vérification sont supprimées ensuite par l'API.
- **Branche.** La branche `005-actions` a été créée par Spec Kit depuis `main`, après fusion de `004-members`, avec l'accord explicite du porteur du projet.
