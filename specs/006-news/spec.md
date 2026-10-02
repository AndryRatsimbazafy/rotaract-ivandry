# Feature Specification: Actualités (News)

**Feature Branch**: `006-news`

**Created**: 2026-10-02

**Status**: Draft — arbitrages intégrés le 2026-10-02

**Input**: User description: « Feature 006 — News. Préparer la spécification complète à partir des documents de référence, des conventions réellement présentes dans `apps/api` et des décisions des fonctionnalités 001 à 005. Identifier ce qui est déjà verrouillé et ce qui reste à décider ; ne rien inventer ; ne rien implémenter. »

**Références** : `ARCHITECTURE.md` (sections 1.1, 1.5, 2, 3, 5, 6, 8, 9, 10, 13, 14 décisions 3, 4, 9, 10, 11, 13 et 15), `DESIGN.md` (composition de la page « News »), `PROJECT_CONTEXT.md`, `CLAUDE.md`, `.specify/memory/constitution.md` (principes I, V, VI, VIII, IX), `specs/001-api-foundation/contracts/errors.md`, `specs/003-admin-auth/`, `specs/004-members/`, `specs/005-actions/` (conventions établies), `apps/web/src/types/news.ts` et `apps/web/src/data/news.ts` (besoins du Front Office).

## Contexte et périmètre

Une actualité rend compte de la vie du club : un événement, une participation à un événement Rotary, une réunion, une formation, une annonce. C'est une **entité distincte d'une action** (`ARCHITECTURE.md`, section 1.5 ; constitution, principe VI) : la date y domine, et elle n'a ni impact, ni domaine d'action, ni ordre manuel.

Le modèle est verrouillé par `ARCHITECTURE.md`, section 1.5. Cette spec dit **ce que la fonctionnalité doit garantir** ; le plan dira comment. Elle s'appuie sur ce qui existe — années Rotary, authentification et gardes, format d'erreur, validation, pagination commune, génération de slug — sans modifier ces mécanismes, à une exception près, prévue depuis `002-rotary-years` : la suppression d'une année Rotary référencée par une actualité est refusée.

Plusieurs règles avaient été décidées pour les actions (`005-actions`) et non pour les actualités. Elles n'ont pas été reprises d'office : onze questions ont été posées au porteur du projet, qui les a arbitrées le 2026-10-02 (section « Clarifications »).

### Dans le périmètre

1. L'entité News : titre, slug unique, type, date, année Rotary, lieu, résumé, contenu, état de publication.
2. La liste fermée des cinq types d'actualité, sous forme de valeurs autorisées.
3. L'administration des actualités : créer, lister, consulter, modifier, publier et dépublier, supprimer.
4. Les lectures publiques dont la page `/actualites` aura besoin : la liste paginée des actualités publiées, le détail d'une actualité publiée par son slug, les années Rotary qui ont des actualités publiées, avec leur nombre.
5. Le refus de supprimer une année Rotary référencée par une actualité.

### Hors périmètre

- Les actions : fonctionnalité `005-actions`, non modifiée.
- Les **photographies** : aucun champ `photos`, aucun envoi de fichier, aucun stockage, aucun fournisseur de stockage. Toute gestion des photographies est hors périmètre de cette fonctionnalité.
- Tout état éditorial autre que brouillon et publié : pas de relecture, de planification ni d'archivage.
- Tout champ ou statut « à la une » : `DESIGN.md` montre une actualité à la une, mais aucun champ ne la porte ; le Front Office prend la plus récente.
- Toute heure séparée, date de fin ou plage horaire.
- Toute modification du Front Office : `apps/web` et `DESIGN.md` ne sont pas modifiés. La page `/actualites` reste sur ses données locales (`ARCHITECTURE.md`, décision 15).
- Tout écran du Back Office : `apps/admin` n'est pas modifié.
- Candidatures, médias, registre d'impact.
- Toute donnée d'exemple : aucune actualité fictive n'est enregistrée.
- Toute modification de l'authentification, du socle, des membres, des mandats et des actions.
- Les tests automatisés (constitution, principe IX).

## Ce qui est déjà verrouillé, et ce qui ne l'est pas

### Verrouillé par ARCHITECTURE.md pour les actualités

| Sujet | Règle | Source |
|---|---|---|
| Entité | Distincte d'Action ; ni impact, ni domaine | 1.5 ; constitution VI |
| Champs | `title`, `slug`, `type`, `date`, `rotaryYear` obligatoires ; `location`, `summary`, `content` facultatifs ; `isPublished` faux par défaut ; `publishedAt` facultatif | 1.5 |
| Types | Exactement `evenement`, `participation`, `reunion`, `formation`, `annonce` | 1.5 ; décision 11 |
| Année Rotary | Référence explicite, choisie par l'administrateur, jamais déduite de la date ; identifiant d'une année existante, sinon `400` | 1.4, 8 ; décision 13 |
| Slug | Unique ; généré depuis le titre s'il n'est pas fourni ; suffixe `-2`, `-3` en cas de collision ; modifiable à la main ; slug saisi déjà pris : `409` ; modifier le titre ne le régénère pas ; forme `^[a-z0-9]+(-[a-z0-9]+)*$`, 120 caractères au plus | 8 ; décision 3 |
| Longueurs | Titre : 1 à 120 ; résumé : 500 au plus ; texte long : 20 000 au plus | 8 |
| Publication | Par `PATCH` (`isPublished`), sans route dédiée ; un contenu non publié répond `404` côté public | 6 |
| Routes publiques | `GET /news` (`year`, `type`, `q`, `page`, `limit`), `GET /news/archives`, `GET /news/:slug` | 6 |
| Routes d'administration | `GET /admin/news` (`year`, `type`, `published`, `q`, `page`, `limit`, `sort`), `GET /:id`, `POST`, `PATCH /:id`, `DELETE /:id` | 6 |
| Listes | Paginées, 20 par défaut, 100 au plus ; recherche sur le titre et le résumé ; filtres `year` et `type`, plus `published` côté administration | 9 |
| Tri public | Date décroissante | 6, 9 |
| Tri d'administration | `-date` par défaut, `title`, `createdAt` | 9 |
| Forme publique | Omet `isPublished`, `createdAt`, `updatedAt` ; renvoie l'année en label | 13 |
| Suppression d'une année référencée | Refusée, `409` | 1.1 |
| Protection | Tout `/admin` exige jeton et rôle `ADMIN` | décision 9 |

### Conventions établies par 001 à 005, applicables telles quelles

| Convention | Origine |
|---|---|
| Format d'erreur commun, messages en français ; `400` « Identifiant invalide. » ; `404` « Ressource introuvable. » | 001, 003 |
| Champ non prévu refusé (`400`, « Champ non autorisé. ») | 001 |
| Création `201` ; suppression `204` sans corps | 002, 003 |
| Gardes existantes posées sur la classe du contrôleur d'administration | 003 |
| Contrat de pagination, réponse `{ data, meta }` | 004 |
| Génération de slug depuis un titre | 005 (fonction prévue pour être réutilisée) |

### Règles des actions étendues aux actualités par arbitrage

Ces règles venaient de `005-actions`. Le porteur du projet les a étendues aux actualités le 2026-10-02.

| Règle | Question |
|---|---|
| Aucune photographie avant la décision de stockage | Q1 |
| `publishedAt` posé à la première publication, jamais réécrit, jamais accepté en entrée ; création directement publiée | Q2 |
| Slug réservé pour la route sœur : `archives` | Q3 |
| Année inexistante en filtre : `200` et liste vide | Q5 |
| `null` efface un champ facultatif ; `""` refusée | Q6 |
| Conflits `409` au message générique | Q7 |
| Tri d'administration sur trois champs, dans les deux sens | Q8 |
| Titre sans slug possible refusé (`400`) | Q9 |

### Ce qui ne s'applique pas aux actualités

L'ordre manuel, l'impact et les domaines d'action n'existent pas sur une actualité. Aucun n'est repris.

## Clarifications

### Session 2026-10-02

- Q1 — Les photographies font-elles partie de cette fonctionnalité ? → A: Non. Aucun champ `photos`, aucun envoi, aucun stockage, aucun fournisseur de stockage. Toute gestion des photographies est hors périmètre.
- Q2 — Quelle règle pour la date de première publication ? → A: `publishedAt` est fixé lors de la première publication et ne change plus jamais, même après dépublication puis republication. Une actualité créée directement publiée le reçoit au même instant que `createdAt`. Ce n'est jamais un champ d'entrée.
- Q3 — Le slug `archives` est-il réservé ? → A: Oui. En génération automatique, `archives` devient `archives-2`, puis `archives-3`, selon les collisions. Fourni explicitement, il est refusé en `400` avec exactement « Ce slug est réservé. ». Les autres règles de slug des actions sont conservées.
- Q4 — Quelle forme pour `GET /api/v1/news/archives` ? → A: Une entrée par année Rotary, portant la forme d'une année Rotary du système et le nombre d'actualités publiées qui s'y rattachent. Seules les actualités publiées sont comptées. Aucune nouvelle entité ni nouvelle notion d'année.
- Q5 — Que répond un filtre sur une année inexistante ? → A: `200` avec une liste vide, sur la liste publique comme sur celle d'administration.
- Q6 — Comment traiter les champs facultatifs ? → A: `location`, `summary` et `content` sont facultatifs. Dans une modification, `null` efface le champ, une chaîne vide est refusée, et l'absence du champ signifie « ne pas modifier ».
- Q7 — Quel message pour les conflits ? → A: `409` avec exactement « Conflit avec une ressource existante. ».
- Q8 — Quels tris en administration ? → A: `date`, `title`, `createdAt`, dans les deux sens. Aucun autre critère.
- Q9 — Que faire d'un titre dont aucun slug ne peut être tiré ? → A: `400` avec le message déjà défini pour ce cas, quand aucun slug explicite valide n'est fourni. Aucun nouveau message.
- Q10 — Quelle longueur pour le lieu ? → A: 1 à 120 caractères quand il est fourni ; `null` l'efface ; chaîne vide refusée.
- Q11 — Comment porter la date et l'heure ? → A: Un seul champ de date et heure, selon le modèle de date déjà en usage dans l'API. Ni heure séparée, ni date de fin, ni plage horaire.

Précisions du porteur du projet : aucun champ ni statut « à la une » ; aucun état éditorial supplémentaire ; l'année Rotary reste une référence explicite choisie par l'administration, jamais déduite de la date ; les divergences actuelles du Front Office sur le calcul de l'année ou sur le contenu sont des sujets de migration du Front Office, pas de cette fonctionnalité.

## User Scenarios & Testing *(mandatory)*

Conformément à la constitution (principe IX), il n'y a pas de test automatisé : chaque récit décrit une **vérification manuelle**.

### User Story 1 - Rédiger et gérer une actualité (Priority: P1)

L'administrateur connecté enregistre une actualité : son titre, son type, sa date, l'année Rotary à laquelle il la rattache, et s'il les connaît un lieu, un résumé et un contenu. Elle naît en brouillon. Il peut la retrouver, la consulter, la corriger et la supprimer.

**Why this priority** : sans actualité enregistrée, rien ne peut être publié ni lu.

**Independent Test** : vérification manuelle. Connecté, créer une actualité avec un titre, un type, une date et une année existante : elle est renvoyée avec un slug tiré du titre, en brouillon. La modifier, la retrouver dans la liste d'administration, puis la supprimer. Sans jeton, chacun de ces appels est refusé.

**Acceptance Scenarios** :

1. **Given** une année Rotary existante, **When** l'administrateur crée une actualité avec un titre, un type, une date et cette année, **Then** elle est enregistrée en brouillon et renvoyée avec son identifiant, un slug généré depuis le titre et l'année (identifiant et label).
2. **Given** un titre absent, vide ou de plus de 120 caractères, un type absent, une date absente ou mal formée, ou une année absente, **When** la création est demandée, **Then** elle est refusée (`400`) avec le détail du champ en cause.
3. **Given** un type hors de la liste des cinq, ou écrit autrement (« Réunion », « REUNION »), **When** l'actualité est créée ou modifiée, **Then** la demande est refusée (`400`) avec le détail sur le type.
4. **Given** un identifiant d'année bien formé qui ne correspond à aucune année, **When** l'actualité est créée ou modifiée, **Then** la demande est refusée (`400`) et rien n'est enregistré.
5. **Given** une date qui tombe hors de l'année Rotary choisie, **When** l'actualité est créée, **Then** elle est acceptée et l'année choisie est enregistrée telle quelle.
6. **Given** des actualités enregistrées, **When** l'administrateur lit la liste d'administration, **Then** elle est paginée (20 par page par défaut), de la date la plus récente à la plus ancienne, brouillons compris, et peut être cherchée par titre ou résumé et filtrée par année, par type et par état de publication.
7. **Given** une actualité existante, **When** l'administrateur modifie une partie de ses champs, **Then** seuls les champs envoyés changent : un champ absent n'est pas modifié ; le type et l'année Rotary sont modifiables.
7a. **Given** une actualité qui a un lieu, un résumé ou un contenu, **When** l'administrateur envoie `null` pour ce champ, **Then** le champ est effacé ; une chaîne vide est refusée (`400`).
7b. **Given** un lieu de plus de 120 caractères, **When** il est envoyé, **Then** la demande est refusée (`400`) avec le détail sur le lieu.
8. **Given** une actualité existante, **When** l'administrateur la supprime, **Then** elle n'existe plus ; l'année Rotary existe toujours.
9. **Given** un identifiant mal formé, **When** une actualité est consultée, modifiée ou supprimée, **Then** la réponse est `400` « Identifiant invalide. » ; un identifiant bien formé inconnu donne `404`.
10. **Given** un appel sans jeton valide, **When** il vise une de ces opérations, **Then** il est refusé (`401`) et rien n'est lu ni modifié.

---

### User Story 2 - Donner à chaque actualité une adresse stable (Priority: P1)

Chaque actualité a un slug : la partie lisible de son adresse publique. Il est généré depuis le titre quand l'administrateur n'en fournit pas, reste unique parmi les actualités, et ne change jamais sans que l'administrateur l'ait demandé.

**Why this priority** : le slug est l'identifiant public de l'actualité.

**Independent Test** : vérification manuelle. Créer deux actualités de même titre sans slug : la seconde reçoit le suffixe `-2`. Imposer un slug déjà pris : refus. Modifier le titre : le slug ne change pas.

**Acceptance Scenarios** :

1. **Given** une actualité créée sans slug, **When** elle est enregistrée, **Then** son slug est tiré du titre : minuscules, sans accents, mots séparés par des tirets.
2. **Given** une actualité dont le slug généré existe déjà parmi les actualités, **When** elle est enregistrée, **Then** son slug reçoit le suffixe `-2`, puis `-3` au besoin.
3. **Given** un slug fourni, bien formé et libre, **When** l'actualité est créée ou modifiée, **Then** il est enregistré tel quel.
4. **Given** un slug fourni déjà porté par une autre actualité, **When** l'actualité est créée ou modifiée, **Then** la demande est refusée par un conflit (`409`) et rien n'est modifié.
5. **Given** un slug fourni mal formé, **When** il est envoyé, **Then** la demande est refusée (`400`) avec le détail sur le slug.
6. **Given** une actualité existante, **When** l'administrateur modifie son titre sans envoyer de slug, **Then** le slug est inchangé.
7. **Given** une action et une actualité de même titre, **When** elles sont créées, **Then** elles peuvent porter le même slug : l'unicité vaut parmi les actualités seulement.
8. **Given** deux créations simultanées qui produiraient le même slug, **When** elles sont traitées, **Then** il n'existe jamais deux actualités de même slug.
9. **Given** un titre qui produirait le slug `archives`, **When** l'actualité est créée sans slug, **Then** son slug est `archives-2`, puis `archives-3` pour la suivante.
10. **Given** le slug `archives` fourni explicitement, **When** l'actualité est créée ou modifiée, **Then** la demande est refusée (`400`) avec le message « Ce slug est réservé. » et rien n'est modifié.
11. **Given** un titre dont aucun slug ne peut être tiré (ponctuation seule), sans slug fourni, **When** la création est demandée, **Then** elle est refusée (`400`) avec le message « Aucun slug ne peut être tiré de ce titre : fournissez-en un. ».

---

### User Story 3 - Publier et dépublier (Priority: P1)

Une actualité reste invisible du public tant que l'administrateur ne l'a pas publiée. Il n'existe que deux états : brouillon et publié.

**Why this priority** : un brouillon ne doit jamais fuiter.

**Independent Test** : vérification manuelle. Un brouillon n'apparaît dans aucune lecture publique et son adresse répond `404`. Une fois publié, il apparaît ; dépublié, il disparaît.

**Acceptance Scenarios** :

1. **Given** une actualité en brouillon, **When** l'administrateur la publie, **Then** elle devient visible du public et sa date de première publication est enregistrée.
2. **Given** une actualité publiée, **When** l'administrateur la dépublie, **Then** elle n'est plus visible du public ; sa date de première publication est conservée.
3. **Given** une actualité en brouillon, **When** un visiteur demande son détail par son slug, **Then** la réponse est `404`, comme si elle n'existait pas.
4. **Given** une actualité dépubliée, **When** elle est republiée, **Then** sa date de première publication n'a pas changé.
5. **Given** une actualité créée directement publiée, **When** elle est enregistrée, **Then** elle est visible du public et sa date de première publication est le même instant que sa date de création.
6. **Given** une date de publication envoyée par l'appelant, à la création ou à la modification, **When** la demande est traitée, **Then** elle est refusée (`400`) comme champ non prévu.

---

### User Story 4 - Lire les actualités publiées (Priority: P2)

Le Front Office, plus tard, lit sans authentification les actualités publiées : la liste paginée, de la plus récente à la plus ancienne, filtrable par année et par type ; le détail d'une actualité par son slug ; les années Rotary qui ont des actualités publiées, avec leur nombre. Aucune donnée d'administration n'est exposée.

**Why this priority** : c'est la lecture que la page `/actualites` et l'aperçu de l'accueil utiliseront.

**Independent Test** : vérification manuelle. Avec trois actualités publiées et un brouillon, lire la liste sans jeton : trois actualités, la plus récente d'abord, chacune avec le label de son année ; aucun champ d'administration.

**Acceptance Scenarios** :

1. **Given** des actualités publiées et des brouillons, **When** on lit la liste publique, **Then** seules les publiées sont renvoyées, paginées (20 par page par défaut), avec leur nombre total.
2. **Given** des actualités publiées, **When** on lit la liste, **Then** elles sont triées de la date la plus récente à la plus ancienne.
3. **Given** un filtre par année (label) ou par type, **When** on lit la liste, **Then** seules les actualités publiées de cette année, ou de ce type, sont renvoyées.
4. **Given** une recherche, **When** on lit la liste, **Then** seules les actualités publiées dont le titre ou le résumé contient le mot cherché sont renvoyées.
5. **Given** une actualité publiée, **When** on lit la liste ou son détail, **Then** elle porte son identifiant, son slug, son titre, son type, sa date, le **label** de son année, et son lieu, son résumé et son contenu s'ils existent ; ni son état de publication, ni sa date de publication, ni ses dates techniques, ni aucune photographie.
6. **Given** une actualité publiée, **When** on demande son détail par son slug, **Then** on l'obtient ; un slug inconnu donne `404`.
7. **Given** des actualités publiées dans deux années et un brouillon dans une troisième, **When** on lit les archives, **Then** seules les deux premières années sont renvoyées, chacune avec le nombre de ses actualités **publiées**, de la plus récente à la plus ancienne.
8. **Given** une année précisée, bien formée, qui n'existe pas, **When** on lit la liste publique ou la liste d'administration, **Then** la réponse est `200` avec une liste vide.
9. **Given** les archives, **When** on les lit, **Then** chaque entrée porte une année Rotary dans la forme des autres listes d'années (identifiant, année de début, label, dates, caractère courant) et le nombre de ses actualités publiées.

---

### User Story 5 - Protéger les années Rotary référencées (Priority: P2)

Une année Rotary à laquelle une actualité est rattachée ne peut pas être supprimée.

**Why this priority** : sans ce refus, des actualités désigneraient une année qui n'existe plus.

**Independent Test** : vérification manuelle. Tenter de supprimer une année qui a une actualité, brouillon ou publiée : refus. Supprimer l'actualité, puis l'année : accepté.

**Acceptance Scenarios** :

1. **Given** une année Rotary référencée par au moins une actualité, publiée ou non, **When** l'administrateur tente de la supprimer, **Then** la demande est refusée par un conflit (`409`) et l'année comme ses actualités sont conservées.
2. **Given** une année Rotary qui n'est référencée par aucun mandat, aucune action ni aucune actualité, **When** l'administrateur la supprime, **Then** elle est supprimée.
3. **Given** une année Rotary référencée par un mandat ou une action, **When** l'administrateur tente de la supprimer, **Then** les refus existants sont inchangés.

---

### Edge Cases

- **Titres identiques** : permis ; seuls les slugs sont uniques.
- **Photographies** : un champ `photos` envoyé est refusé comme champ non prévu (`400`), et aucune réponse n'en contient.
- **Date sans heure** : acceptée ; elle vaut minuit UTC, comme pour les actions. Il n'y a ni heure séparée ni date de fin.
- **Conflit de slug** : un slug fourni déjà pris répond `409` « Conflit avec une ressource existante. » ; aucun suffixe n'est ajouté à un slug choisi par l'administrateur.
- **Changement de slug d'une actualité publiée** : accepté ; l'ancienne adresse cesse de répondre. Le signalement à l'administrateur relève du futur écran.
- **Changement de type** d'une actualité publiée : accepté ; elle change de rubrique.
- **Contenu en plusieurs paragraphes** : le texte est enregistré et renvoyé tel quel ; le découpage sur les lignes vides est fait par le Front Office (`ARCHITECTURE.md`, section 10).
- **Actualité datée du futur** : acceptée et visible dès qu'elle est publiée ; il n'y a pas de publication programmée.
- **Champ non prévu** dans une demande : refusé par le socle (`400`).
- **Recherche de moins de deux caractères**, tri non autorisé, page ou taille hors bornes, label d'année mal formé, type inconnu en filtre : `400`, selon le contrat commun des listes.
- **Base injoignable** : erreur au format commun, sans détail technique (socle).

## Requirements *(mandatory)*

### Functional Requirements

**Actualité**

- **FR-001** : Une actualité MUST porter un titre, un slug, un type, une date et une année Rotary, obligatoires ; et MAY porter un lieu, un résumé et un contenu. Elle porte un état de publication. Elle MUST NOT porter d'impact, de domaine d'action ni d'ordre manuel.
- **FR-002** : Le titre MUST compter de 1 à 120 caractères, espaces de début et de fin retirés. Le résumé MUST compter 500 caractères au plus. Le contenu, texte brut dont les paragraphes sont séparés par une ligne vide, MUST compter 20 000 caractères au plus. La date MUST être au format ISO 8601 (`ARCHITECTURE.md`, section 8).
- **FR-002a** : Le lieu, lorsqu'il est fourni, MUST compter de 1 à 120 caractères.
- **FR-002b** : Une actualité MUST porter un seul champ de date et heure, sur le même modèle que les dates déjà en usage dans l'API. Elle MUST NOT porter d'heure séparée, de date de fin ni de plage horaire.
- **FR-003** : Le type MUST être exactement une des cinq valeurs `evenement`, `participation`, `reunion`, `formation`, `annonce`. Liste fermée de valeurs, identiques à celles du Front Office ; aucune entité ni collection n'est créée pour elles. Le type est modifiable.
- **FR-004** : L'année Rotary MUST être désignée par l'identifiant d'une année existante, choisie par l'administrateur, à la création comme à la modification. Elle MUST NOT être déduite de la date, ni corrigée quand la date tombe hors de l'année. Une année inexistante MUST donner `400`. Aucune donnée de l'année n'est recopiée dans l'actualité.
- **FR-005** : Une actualité MUST NOT être confondue avec une action : aucune route ni aucune collection n'est partagée entre les deux.
- **FR-006** : Cette fonctionnalité MUST NOT enregistrer ni accepter de photographie : ni champ `photos`, ni envoi de fichier, ni stockage, ni fournisseur de stockage.
- **FR-006a** : Une actualité MUST NOT porter de champ ou de statut « à la une », ni d'état éditorial autre que brouillon et publié.

**Slug**

- **FR-007** : Le slug MUST être unique parmi les actualités, y compris quand deux écritures arrivent en même temps. Cette garantie MUST être portée par le modèle. L'unicité ne s'étend pas aux actions.
- **FR-008** : Sans slug fourni à la création, le système MUST le générer depuis le titre : sans accents, en minuscules, mots séparés par des tirets. En cas de collision, il MUST ajouter le suffixe `-2`, puis `-3`, et ainsi de suite.
- **FR-009** : Un slug fourni par l'administrateur MUST respecter la forme `^[a-z0-9]+(-[a-z0-9]+)*$` et compter 120 caractères au plus, sinon `400`. S'il est déjà porté par une autre actualité, la demande MUST être refusée par un conflit (`409`). Un slug fourni n'est jamais modifié par le système.
- **FR-010** : Modifier le titre MUST NOT régénérer le slug.
- **FR-011** : Le slug `archives` MUST être réservé : il désigne la route `/news/archives`. En génération automatique, il MUST être traité comme déjà pris et devenir `archives-2`, puis `archives-3`, selon les collisions. Fourni explicitement, à la création comme à la modification, il MUST être refusé (`400`) avec exactement le message « Ce slug est réservé. ».
- **FR-011a** : Un titre dont aucun slug ne peut être tiré, sans slug explicite valide, MUST être refusé (`400`) avec le message déjà défini pour ce cas : « Aucun slug ne peut être tiré de ce titre : fournissez-en un. ». Aucun nouveau message n'est créé.

**Publication**

- **FR-012** : Une actualité MUST être en brouillon par défaut. Il n'existe que deux états, brouillon et publié. L'administrateur publie et dépublie par la modification de l'état ; il n'existe pas de route dédiée.
- **FR-013** : Une actualité non publiée MUST NOT apparaître dans aucune lecture publique ; son détail public MUST répondre `404`, comme si elle n'existait pas.
- **FR-014** : `publishedAt` MUST être fixé lors de la première publication, et MUST NOT changer ensuite, ni à la dépublication ni à une republication.
- **FR-014a** : Une actualité MAY être créée directement publiée ; `publishedAt` MUST alors être le même instant que `createdAt`.
- **FR-014b** : `publishedAt` MUST NOT être accepté en entrée, ni à la création ni à la modification.

**Administration** (sous `/api/v1/admin/news`)

- **FR-015** : L'administrateur MUST pouvoir créer une actualité, la consulter, modifier une partie de ses champs, et la supprimer.
- **FR-016** : L'administrateur MUST disposer d'une liste paginée de toutes les actualités, brouillons compris, selon le contrat commun des listes, avec recherche sur le titre et le résumé, filtres par année (label), par type et par état de publication, tri par date décroissante par défaut.
- **FR-016a** : Les seuls champs de tri autorisés en administration MUST être `date`, `title` et `createdAt`, chacun dans les deux sens. Aucun autre critère n'est offert ; un tri non autorisé MUST donner `400`.
- **FR-017** : Les réponses d'administration MUST porter tous les champs de l'actualité, dans la forme de l'exemple d'`ARCHITECTURE.md`, section 13, l'année étant renvoyée avec son identifiant et son label.
- **FR-018** : `location`, `summary` et `content` MUST être facultatifs. Dans une modification, l'absence d'un champ MUST le laisser inchangé ; `null` MUST l'effacer ; une chaîne vide `""` MUST être refusée (`400`). Absence et `null` ne sont pas confondus. Le titre, le slug, le type, la date et l'année Rotary ne peuvent pas être effacés.

**Lecture publique**

- **FR-019** : L'API MUST offrir sans authentification, sur `GET /api/v1/news`, la liste paginée des actualités **publiées**, triée par date décroissante, avec recherche sur le titre et le résumé et filtres par année (label) et par type.
- **FR-020** : L'API MUST offrir sans authentification, sur `GET /api/v1/news/:slug`, le détail d'une actualité publiée ; un slug inconnu ou une actualité non publiée MUST donner `404`.
- **FR-021** : L'API MUST offrir sans authentification, sur `GET /api/v1/news/archives`, les années Rotary qui ont au moins une actualité publiée, de la plus récente à la plus ancienne. Chaque entrée MUST porter l'année Rotary dans la forme déjà en usage pour les années (`specs/002-rotary-years/contracts/rotary-years.md`) et le nombre des actualités **publiées** qui s'y rattachent. Les brouillons ne sont pas comptés. Aucune entité ni notion d'année nouvelle n'est introduite.
- **FR-022** : Les réponses publiques MUST omettre l'état de publication, la date de publication et les dates techniques, et MUST renvoyer l'année sous la forme de son **label**.
- **FR-023** : Un label d'année mal formé MUST donner `400`. Une année bien formée qui n'existe pas MUST donner `200` avec une liste vide, sur la liste publique comme sur la liste d'administration.

**Suppressions et intégrité**

- **FR-024** : Supprimer une actualité MUST NOT supprimer l'année Rotary. Rien d'autre ne référence une actualité.
- **FR-025** : Supprimer une année Rotary référencée par au moins une actualité, publiée ou non, MUST être refusé par un conflit (`409`), l'année et ses actualités étant conservées. Les refus existants pour les mandats et les actions MUST rester inchangés.

**Protection, erreurs, limites**

- **FR-026** : Toutes les opérations d'administration MUST exiger un jeton valide et le rôle `ADMIN`, par les gardes existantes posées sur le contrôleur d'administration. Aucune route d'administration ne MUST exister sans protection. L'authentification n'est pas modifiée.
- **FR-027** : Un identifiant mal formé MUST donner `400` « Identifiant invalide. » ; une ressource inexistante MUST donner `404`. Une création réussie répond `201`, une suppression réussie `204` sans corps.
- **FR-028** : Toutes les erreurs MUST suivre le format commun du socle, en français. Les deux conflits de cette fonctionnalité (slug fourni déjà pris ; année Rotary utilisée) MUST répondre `409` avec exactement le message « Conflit avec une ressource existante. ». Les messages de validation par champ reprennent ceux déjà définis quand ils existent ; les autres sont proposés au plan et soumis à validation.
- **FR-029** : Cette fonctionnalité MUST NOT modifier `apps/web`, `apps/admin` ni `DESIGN.md`, ni le code des actions, des membres, de l'authentification ou du socle au-delà du refus de FR-025.
- **FR-030** : Elle MUST NOT inventer de donnée : aucune actualité d'exemple, aucun script d'insertion (constitution, principes III et VIII).

### Key Entities

- **News** : une actualité du club. Titre, slug unique, type, date et heure (un seul champ), année Rotary (référence), lieu, résumé, contenu, état de publication (brouillon ou publié), date de première publication. Pas de photographies dans cette fonctionnalité.
- **NewsType** : un des cinq types d'actualité. Liste fermée de valeurs, sans entité propre.
- **RotaryYear** : inchangée. Désormais référencée aussi par les actualités.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001** : L'administrateur enregistre une actualité avec quatre informations seulement : son titre, son type, sa date et son année Rotary.
- **SC-002** : Il n'existe jamais deux actualités de même slug, quel que soit le nombre de tentatives, y compris simultanées.
- **SC-003** : Aucune actualité non publiée n'apparaît dans une réponse publique : liste, détail ou archives, y compris dans les nombres des archives.
- **SC-004** : Le slug d'une actualité ne change jamais sans demande explicite de l'administrateur.
- **SC-005** : 100 % des actualités enregistrées portent l'année Rotary choisie par l'administrateur, même quand leur date tombe hors de cette année.
- **SC-006** : 100 % des actualités enregistrées portent un des cinq types.
- **SC-007** : Une année Rotary qui a au moins une actualité ne peut pas être supprimée ; aucune actualité ne désigne jamais une année inexistante.
- **SC-008** : 100 % des appels d'administration sans jeton valide sont refusés, sans lecture ni écriture.
- **SC-009** : Les routes existantes (santé, authentification, années Rotary, membres, mandats, actions) répondent comme avant, hormis le refus de supprimer une année référencée par une actualité.
- **SC-010** : Le Front Office et le Back Office sont strictement inchangés : aucun fichier de `apps/web`, `apps/admin` ni `DESIGN.md` n'est modifié, et leurs builds passent comme avant.

## Assumptions

- **Branche.** La branche `006-news` a été créée par Spec Kit depuis `main`, à la demande explicite du porteur du projet, après le commit et la fusion de `005-actions`. La spec avait été rédigée juste avant, sur `005-actions`, sans y être commitée.
- **Divergences du Front Office : sujets de migration, pas de cette fonctionnalité.** Le Front Office déduit aujourd'hui l'année d'une actualité de sa date, et son type porte `body` (paragraphes) là où l'API porte `content` (texte). `ARCHITECTURE.md`, section 10, prévoit de les traiter à la migration du Front Office. Rien n'est à faire maintenant.
- **Photographies.** `ARCHITECTURE.md`, section 1.5, garde `photos` dans le modèle cible de l'actualité : le champ n'est pas retiré de l'architecture, seulement reporté à la décision de stockage.
- **Précisions à inscrire dans `ARCHITECTURE.md` au plan** (constitution, principe I), sans contradiction : photographies non mises en œuvre avant le stockage ; règle de `publishedAt` pour les actualités ; slug `archives` réservé ; forme de `/news/archives` ; longueur du lieu ; liste vide pour une année inexistante ; codes `201`, `204` et `409`. Cette spec ne modifie pas `ARCHITECTURE.md`.
- **Actualité à la une.** `DESIGN.md` la décrit, sans champ pour la désigner. Décision du porteur du projet : aucun champ ni statut « à la une ». Le Front Office prend la plus récente.
- **Nombre d'actualités pour l'accueil.** La fonction `getNewsCount` du Front Office sera servie par le nombre total de la liste paginée.
- **Recherche.** Par les index texte de MongoDB, mot entier, sans tolérance (`ARCHITECTURE.md`, section 3).
- **Génération de slug.** La fonction écrite pour les actions (`common/utils/slug.ts`) est générique et prévue pour être réutilisée.
- **Aides de validation.** `PROJECT_CONTEXT.md` note que deux aides sont dupliquées entre `members` et `actions` et propose de les regrouper si les actualités en ont besoin. Cette décision relève du plan.
- **Dépendances.** Aucune dépendance nouvelle n'est attendue.
- **Vérification.** Elle suppose une base joignable et le compte d'administration. Les actualités et années créées pour la vérification sont supprimées ensuite par l'API.
