# Implementation Plan: Membres et mandats

**Branch**: `004-members` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/004-members/spec.md`

## Summary

Introduire les membres du club et leurs mandats par année Rotary : deux modèles (`Member`, `MemberMandate`), l'administration protégée des deux, l'annuaire public d'une année, et le refus de supprimer une année Rotary qu'un mandat référence.

Approche : un seul module NestJS `members`, comme le prévoit `ARCHITECTURE.md`, section 5, avec deux services (membres, mandats), deux contrôleurs d'administration et un contrôleur public. Les règles d'unicité sont portées par deux index uniques de la base. Le réordonnancement d'une année est la seule opération qui écrit plusieurs documents de façon indissociable : il est fait dans une transaction. Aucune dépendance nouvelle.

## Technical Context

**Language/Version** : TypeScript 6 (strict), Node.js 22. Sortie CommonJS avec `module: nodenext`.

**Primary Dependencies** : toutes déjà installées : NestJS 12, `@nestjs/mongoose` 12, `mongoose` 9, `class-validator`, `class-transformer`, et l'authentification de `003-admin-auth`. **Aucune dépendance à installer.** `@nestjs/mapped-types` n'est pas installé : les DTO de modification sont écrits à la main, champ par champ.

**Storage** : MongoDB Atlas Free, via Mongoose. Deux collections nouvelles, `members` et `membermandates`. Le cluster est un jeu de réplicas (vérifié en lecture le 2026-10-02) : les transactions y sont disponibles.

**Testing** : aucun test automatisé (constitution, principe IX). Vérification manuelle décrite dans [quickstart.md](./quickstart.md), plus `npm run lint` et `npm run build:api`.

**Target Platform** : serveur Node.js 22, en local (port 4000). Hébergement hors périmètre.

**Project Type** : service web (API HTTP JSON) dans un monorepo npm workspaces.

**Performance Goals** : aucun objectif chiffré. Un club compte quelques dizaines de membres par année.

**Constraints** : aucune route d'administration sans ses gardes ; aucune donnée d'exemple ; messages en français au format du socle, sans nouveau message de conflit ; pas de modification de `apps/web`, `apps/admin`, `DESIGN.md`, de l'authentification ni du socle.

**Scale/Scope** : douze routes d'administration, deux routes publiques, une quinzaine de fichiers nouveaux, trois modifiés.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Modèles, adresses, validation et listes repris d'`ARCHITECTURE.md` (sections 1.2, 1.3, 3, 5, 6, 8, 9, 13). Les précisions décidées dans la spec sont listées ci-dessous comme alignements à faire **avant** l'implémentation ; ce plan ne les applique pas. | Conforme, alignement validé, appliqué par la première tâche |
| II. Étapes validées | Spec validée le 2026-10-02. Ce plan s'arrête après la phase 1 : ni tâches ni code. | Conforme |
| III. Préférence pour le manuel | Aucun script, aucune donnée insérée par le code. | Conforme |
| IV. Simplicité technique | Mécanismes natifs de NestJS et de Mongoose. Aucune dépendance. Les aides communes créées (pagination, liste des fonctions, lecture d'un label) ont chacune un utilisateur immédiat. | Conforme |
| V. Architecture backend | Routes sous `/api/v1` ; administration sous `/admin`, gardée au niveau de la classe ; lecture publique séparée dans son propre contrôleur. | Conforme |
| VI. Intégrité du modèle métier | Mandats séparés des membres ; plusieurs fonctions par mandat dans `roles[]` ; référence explicite vers RotaryYear. | Conforme |
| VII. Front Office | Non touché. | Conforme |
| VIII. Qualité et contenu | Aucun membre fictif. Les données de vérification sont supprimées par l'API. | Conforme |
| IX. Tests | Aucun test, aucun outillage de test. | Conforme |
| X. Outillage et infrastructure | npm ; aucune installation. | Conforme |
| XI. Git et collaboration | Branche `004-members` créée par Spec Kit avec l'accord du porteur du projet. Aucun commit sans demande. | Conforme |
| XII. Non-régression | Les routes existantes sont revérifiées ; seule la suppression d'une année référencée change, comme prévu depuis `002`. | Conforme |

**Résultat de la porte** : passée. La transaction de réordonnancement et les alignements d'`ARCHITECTURE.md` ont été validés par le porteur du projet le 2026-10-02. Aucune violation à justifier.

**Re-vérification après la phase 1** : inchangée.

## Écarts entre la spec et ARCHITECTURE.md

Relevé précis. Aucun n'est une contradiction : chacun précise un point que l'architecture laissait ouvert, ou reporte un élément. **Aucune de ces modifications n'est appliquée par ce plan.** Validées par le porteur du projet le 2026-10-02, elles sont appliquées par la **première tâche** de l'implémentation, avant toute modification de code.

| # | Endroit | Texte actuel | Modification nécessaire |
|---|---|---|---|
| 1 | Section 1.3, champ `order` | « `number`, oui. Ordre d'affichage dans l'année, choisi par le club » | Préciser : entier supérieur ou égal à 1, **unique dans son année** ; attribué automatiquement à la création (plus grand ordre de l'année plus un) ; trous permis ; seul le réordonnancement de l'année les referme. |
| 2 | Section 3, ligne `membermandates` | Index « `(rotaryYear, order)` » | Le rendre unique : « **`(rotaryYear, order)` unique** ». |
| 3 | Section 3, première ligne | « Sept collections, aucune transaction requise. » | « … une seule transaction, pour le réordonnancement des mandats d'une année. » |
| 4 | Section 6, ligne « Mandats » | « `POST` · `PATCH /:id` (fonctions, ordre) · `DELETE /:id` · `PUT /admin/mandates/order` (…) » | Ajouter : création `201`, suppression `204` ; `409` pour un mandat en double ou un ordre déjà pris ; la liste de réordonnancement contient exactement tous les mandats de l'année. |
| 5 | Section 6, ligne « Membres » | Idem sans codes | Ajouter : création `201`, suppression `204`. |
| 6 | Section 6, `GET /members` | « `year` (label, défaut : année courante), `limit` » | Ajouter : liste vide (`200`) si l'année n'existe pas ou s'il n'y a pas d'année courante. |
| 7 | Section 6, `GET /members/years` | « Années qui ont au moins un membre » | Ajouter : même forme que `GET /rotary-years`. |
| 8 | Section 1.2, champ `portrait` | « MediaRef, non, oui » | Ajouter une note : non mis en œuvre avant le stockage de fichiers. Le champ reste dans le modèle cible. |

La section 13 (exemples JSON) reste valable ; `portrait` y figure pour plus tard. La table des décisions verrouillées (section 14) n'est pas modifiée.

## Project Structure

### Documentation (this feature)

```text
specs/004-members/
├── spec.md
├── plan.md              ce fichier
├── research.md          phase 0 : décisions techniques
├── data-model.md        phase 1 : Member, MemberMandate, MemberRole, index
├── quickstart.md        phase 1 : vérification manuelle
├── contracts/
│   ├── members.md       administration des membres, annuaire public
│   └── mandates.md      administration des mandats, réordonnancement
├── checklists/
│   └── requirements.md
└── tasks.md             créé plus tard par /speckit-tasks
```

### Source Code (repository root)

```text
apps/api/src/
├── app.module.ts                                modifié : import de MembersModule
├── common/
│   ├── dto/
│   │   └── pagination-query.dto.ts              nouveau : page, limit ; forme d'une réponse paginée
│   ├── enums/
│   │   └── member-role.enum.ts                  nouveau : les dix fonctions
│   └── utils/
│       └── rotary-year.ts                       modifié : lecture d'un label « AAAA-AAAA »
├── members/
│   ├── members.module.ts                        nouveau
│   ├── schemas/
│   │   ├── member.schema.ts                     nouveau : modèle Member
│   │   └── member-mandate.schema.ts             nouveau : modèle MemberMandate, deux index uniques
│   ├── members.service.ts                       nouveau : membres, liste paginée, fiche, suppression en cascade
│   ├── mandates.service.ts                      nouveau : mandats, ordre automatique, réordonnancement, annuaire
│   ├── members.admin.controller.ts              nouveau : /admin/members
│   ├── mandates.admin.controller.ts             nouveau : /admin/mandates
│   ├── members.public.controller.ts             nouveau : /members, /members/years
│   └── dto/
│       ├── create-member.dto.ts                 nouveau
│       ├── update-member.dto.ts                 nouveau
│       ├── query-members.dto.ts                 nouveau : recherche, filtres, tri, pagination
│       ├── create-mandate.dto.ts                nouveau
│       ├── update-mandate.dto.ts                nouveau
│       ├── query-mandates.dto.ts                nouveau
│       ├── reorder-mandates.dto.ts              nouveau
│       └── query-directory.dto.ts               nouveau : year, limit de l'annuaire public
└── rotary-years/
    ├── rotary-years.module.ts                   modifié : déclare aussi le modèle MemberMandate
    └── rotary-years.service.ts                  modifié : refus de supprimer une année référencée
```

**Non modifiés** : `main.ts`, `config/`, `common/filters/`, `common/pipes/`, `auth/`, `health/`, les contrôleurs et le schéma des années Rotary.

**Structure Decision** : `ARCHITECTURE.md`, section 5 : « `members` regroupe Member et MemberMandate : ils ne se lisent jamais l'un sans l'autre ». Un module, donc, mais les responsabilités restent séparées fichier par fichier, comme demandé :

| Responsabilité | Fichier |
|---|---|
| Modèle Member | `schemas/member.schema.ts` |
| Modèle MemberMandate | `schemas/member-mandate.schema.ts` |
| Service des membres (dont la cascade) | `members.service.ts` |
| Service des mandats (dont l'ordre et le réordonnancement) | `mandates.service.ts` |
| Contrôleurs d'administration | `members.admin.controller.ts`, `mandates.admin.controller.ts` |
| Contrôleur public | `members.public.controller.ts` |
| Validation | `dto/`, `common/enums/`, `common/pipes/parse-object-id.pipe.ts` (existant) |
| Pagination, recherche, filtres | `common/dto/pagination-query.dto.ts`, `dto/query-members.dto.ts` |

`members` et `rotary-years` ont chacun besoin du modèle de l'autre. Pour éviter une dépendance circulaire entre modules, chacun déclare les modèles qu'il lit ; aucun des deux n'importe l'autre.

## Décisions de conception

Détail et alternatives dans [research.md](./research.md).

1. **Member** : prénom, nom, profession ou études, email, téléphone. Aucun portrait, aucune fonction, aucun état. Dans une modification, `null` efface la profession ou les études, l'email ou le téléphone ; une chaîne vide est refusée.
2. **MemberMandate** : `member`, `rotaryYear`, `roles`, `order`. Deux index uniques : `(member, rotaryYear)` et `(rotaryYear, order)`.
3. **Fonctions** : une énumération de dix valeurs dans `common/enums/`, validée à l'entrée et dans le schéma. Aucune collection.
4. **Ordre à la création** : jamais fourni ; attribué à `max(order) + 1` dans l'année, 1 pour le premier. Deux créations simultanées dans la même année sont départagées par l'index unique, avec une nouvelle tentative.
5. **Modification de l'ordre d'un mandat** : écriture directe ; l'index unique refuse un ordre déjà pris, converti en `409`.
6. **Réordonnancement d'une année** : dans **une transaction** (validée par le porteur du projet), contrôle complet puis deux écritures qui ne peuvent pas entrer en collision (voir ci-dessous). Réponse : les mandats de l'année dans leur nouvel ordre.
7. **Suppression d'un membre** : ses mandats d'abord, le membre ensuite. Sans transaction : l'état intermédiaire est valide.
8. **Suppression d'une année Rotary** : refusée (`409`) si un mandat la référence.
8a. **Concurrence entre suppression et référence** : aucune transaction supplémentaire en V1, aucune abstraction de concurrence. Les contrôles d'existence et de référence prévus sont conservés tels quels.
9. **Listes** : la liste d'administration des membres est paginée, avec recherche par index texte, filtres par année et par fonction, tri par nom ou par date de création. Les autres listes ne sont pas paginées.
10. **Annuaire public** : lu depuis les mandats de l'année, triés par ordre ; jamais d'email ni de téléphone.
11. **Erreurs** : celles du socle. Les trois conflits répondent le `409` générique ; l'erreur de clé dupliquée de la base est la source de chacun.

## Stratégie de réordonnancement

Exigences : la demande contient exactement tous les mandats de l'année, chacun une fois ; après succès les ordres valent 1 à n ; aucune modification partielle en cas d'erreur ; aucun conflit d'unicité pendant la réécriture.

**Le problème.** L'index unique `(rotaryYear, order)` est vérifié à chaque écriture. Réécrire les ordres un à un fait passer par des états où deux mandats portent le même ordre : passer le mandat d'ordre 3 à l'ordre 1 échoue tant que l'ancien ordre 1 n'a pas bougé. Une transaction seule ne suffit pas : l'index est vérifié à chaque écriture, même à l'intérieur.

**La stratégie.**

1. **Contrôle de forme, hors transaction.** Le DTO refuse un identifiant mal formé, un champ absent ou un mandat cité deux fois ; l'année doit exister. Rien n'est lu ni écrit sur les mandats.
2. **Ouvrir une transaction.** Toute la suite se passe à l'intérieur, dans cet ordre :
   - **a. Contrôle complet, avant toute écriture.** Lire, dans la transaction, les identifiants des mandats de l'année. Si la liste reçue n'est pas exactement cet ensemble (mandat manquant, mandat d'une autre année ou inexistant), lever le refus `400` : la transaction est annulée sans qu'aucune écriture n'ait eu lieu.
   - **b. Première écriture** : multiplier tous les ordres de l'année par −1. Les ordres étaient distincts et positifs : ils deviennent distincts et négatifs. La zone des ordres positifs de l'année est vide.
   - **c. Seconde écriture** : donner à chaque mandat sa position dans la liste reçue, plus un. Les valeurs 1 à n sont distinctes et arrivent dans une zone vide : aucune collision possible.
3. **Valider la transaction.** Les deux écritures deviennent visibles ensemble.
4. **Relire** les mandats de l'année et les renvoyer dans leur nouvel ordre.

Le contrôle complet est fait **dans** la transaction, et non avant : il porte ainsi sur le même état que les écritures, et il est refait si la fonction est exécutée une seconde fois (voir ci-dessous).

**Ce que garantit la transaction, et rien de plus.** La seule propriété dont cette fonctionnalité dépend est l'**annulation** : si une étape échoue, ou si l'API s'arrête au milieu, la base annule les deux écritures, les ordres restent ceux d'avant, et aucun lecteur ne voit d'ordre négatif.

**Comportement réel en cas d'échec**, lu dans le code installé (`mongodb` 7.6.0, `ClientSession.withTransaction` ; `mongoose` 9.10.3, dont `Connection.transaction` appelle cette méthode) :

| Situation | Ce que fait le pilote | Ce que voit l'administrateur |
|---|---|---|
| La fonction lève une erreur qui n'est pas une erreur de la base (le refus `400` de l'étape a) | Annulation, erreur transmise telle quelle. **Aucune nouvelle exécution.** | `400`, aucun ordre modifié. |
| Erreur de la base **sans** l'étiquette « transitoire » (par exemple une clé dupliquée) | Annulation, erreur transmise. **Aucune nouvelle exécution.** | `500` générique du socle, aucun ordre modifié. |
| Erreur de la base **avec** l'étiquette « transitoire » (conflit d'écriture avec une autre opération sur les mêmes mandats, bascule du serveur) | Annulation, attente brève, puis **nouvelle exécution de toute la fonction**, tant que le délai du pilote n'est pas dépassé (120 secondes par défaut). | Le résultat de la nouvelle exécution : succès, ou l'un des deux refus ci-dessus. |
| Échec de la validation finale, résultat inconnu | Nouvelle tentative de validation, dans le même délai. | Succès, ou `500` générique. |
| Délai dépassé | Erreur transmise. | `500` générique, aucun ordre modifié. |

Conséquences pour l'écriture du code :

- **La nouvelle exécution est un comportement du pilote, pas une garantie de cette fonctionnalité.** Elle a été lue dans le code source, pas observée : la provoquer demande deux écritures réellement simultanées sur les mêmes mandats. Rien ici n'en dépend ; si elle n'avait pas lieu, l'administrateur recevrait un `500` et relancerait le réordonnancement, sans aucune donnée altérée.
- **La fonction passée à la transaction doit pouvoir être exécutée plusieurs fois** : elle ne garde aucun état entre deux exécutions et refait le contrôle complet à chaque fois. C'est la raison du point 2.a.
- **Aucun message n'est ajouté** pour ces échecs : ce sont des erreurs internes, déjà couvertes par le `500` du socle, journalisées par leur type seulement.
- **Délai maximal** : 120 secondes est le défaut du pilote ; avec un seul administrateur, une attente de cet ordre n'est pas attendue en pratique. Le plan ne règle pas ce délai.

**Pourquoi une transaction, alors que l'architecture n'en prévoyait pas.** « Aucune modification partielle en cas d'erreur » ne peut pas être tenu autrement quand plusieurs documents changent. Le cluster Atlas est un jeu de réplicas : les transactions y fonctionnent sans rien installer. C'est la seule opération de l'API qui en utilise une.

**Alternative sans transaction**, écartée mais chiffrée : les mêmes deux écritures, sans transaction. Si l'API s'arrête entre les deux, les ordres de l'année restent négatifs : ils violent la règle « entier à partir de 1 » et inversent l'ordre d'affichage jusqu'à ce que l'administrateur relance le réordonnancement. La garantie « aucune modification partielle » ne serait donc pas tenue.

## Index et contraintes d'unicité

| Collection | Index | Rôle |
|---|---|---|
| `members` | `(lastName, firstName)` | Tri par défaut de la liste d'administration. |
| `members` | texte sur `firstName`, `lastName` | Recherche `q`. |
| `membermandates` | **`(member, rotaryYear)` unique** | Un seul mandat par couple. Sert aussi aux lectures par membre et à la cascade. |
| `membermandates` | **`(rotaryYear, order)` unique** | Ordre strict dans l'année. Sert aussi au tri de l'annuaire et au calcul du plus grand ordre. |
| `membermandates` | `(rotaryYear, roles)` | Filtre par fonction. |

Conséquences à connaître :

- **Les deux index uniques produisent la même erreur de la base** (clé dupliquée). Le service lit quel index est en cause pour distinguer « mandat en double » (refus définitif, `409`) de « ordre pris » (nouvelle tentative à la création, `409` à la modification).
- **Aucun index unique sur `members`** : les homonymes et les emails en double sont permis (FR-005).
- **Les index sont créés par Mongoose au démarrage**, comme pour les années. Les deux collections seront créées vides.
- **L'unicité de l'ordre ne s'étend pas d'une année à l'autre** : l'index porte sur le couple.
- **Un index unique ne peut pas être ajouté sur des données qui le violent** : sans objet ici, les collections sont nouvelles.

## Prérequis manuels (porteur du projet)

1. Une base MongoDB Atlas joignable et `apps/api/.env` renseigné.
2. Le compte d'administration existant, et son mot de passe, pour les vérifications.
3. Aucune autre opération manuelle : les alignements d'`ARCHITECTURE.md` sont validés et appliqués par la première tâche.

## Fin d'étape

- `npm run lint` et `npm run build:api` passent ; `npm run build:web` et `npm run build:admin` passent comme avant.
- Les scénarios de [quickstart.md](./quickstart.md) sont déroulés, ou explicitement signalés comme non faits.
- Aucun membre, mandat ni année de vérification ne reste en base.
- `PROJECT_CONTEXT.md` et la ligne d'état de `CLAUDE.md` sont mis à jour.

## Complexity Tracking

Aucune violation de la constitution à justifier.
