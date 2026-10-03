# ARCHITECTURE : Backend et Back Office

> Référence technique avant implémentation de `apps/api` et `apps/admin`, et de la connexion de `apps/web` à l'API.
> État au 2026-10-02. **Implémenté** : l'API (étapes 1 à 5 de la section 15), le Back Office (étapes 6 et 7) et la connexion du Front Office à l'API (étape 8, fonctionnalité 009). **Reste à faire** : le stockage des images.
> Les décisions verrouillées et les décisions encore ouvertes sont listées en section 14 ; les points marqués **[ouvert]** y renvoient. Une décision qui change se corrige ici avant de se corriger dans le code.
> La direction visuelle du Front Office reste dans `DESIGN.md` ; le contexte général dans `PROJECT_CONTEXT.md`.

## 0. Vue d'ensemble

```
Visiteur ──► apps/web (Next.js, 3000) ──┐
                                        ├─► apps/api (NestJS, 4000) ──► MongoDB Atlas
Admin ─────► apps/admin (Next.js + MUI, 3001) ──┘                  └─► stockage de fichiers [ouvert]
```

Principes :

1. **L'API est la seule à parler à MongoDB** et au stockage de fichiers.
2. **Les deux fronts appellent l'API depuis leur serveur Next.js** (Server Components, Server Actions, Route Handlers), jamais depuis le navigateur. Conséquences : aucune adresse d'API ni aucun jeton exposés au navigateur, pas de CORS à ouvrir par défaut.
3. **Deux surfaces d'API séparées** : publique (lecture du contenu publié, dépôt d'une candidature) et administration (tout sous `/admin`, JWT + rôle `ADMIN`).
4. **Un seul rôle** : `ADMIN`. Aucun autre rôle, aucune permission fine.
5. **Rien n'est inventé** : pas de données historiques fictives, pas d'entité sans besoin constaté dans le Front Office.

## 1. Entités métier

Conventions communes à toutes les collections : identifiant `_id` (ObjectId) exposé en `id` (chaîne) ; `createdAt` et `updatedAt` gérés automatiquement ; dates en ISO 8601 UTC dans l'API.

### 1.1 RotaryYear

Une année Rotary, du 1er juillet au 30 juin.

**Stocké :**

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| `startYear` | number | oui | L'année de début, par exemple `2026`. **Unique.** C'est elle qui identifie l'année Rotary. |

**Calculé à partir de `startYear`, jamais stocké, exposé par l'API :**

| Champ | Valeur |
|---|---|
| `label` | `"2026-2027"`. C'est la clé utilisée dans les adresses du Front Office (`?annee=2026-2027`). |
| `startDate` | 1er juillet de `startYear`, 00:00 UTC. |
| `endDate` | 30 juin de `startYear + 1`, 23:59:59.999 UTC. |
| `isCurrent` | Vrai si la date du jour tombe entre `startDate` et `endDate`. |

- **Aucun booléen « courant » n'est stocké** : pas de risque d'avoir deux années courantes, ou aucune.
- Un filtre `year=2026-2027` est converti en `startYear = 2026` par l'API.
- Une année référencée (mandat, action, actualité) ne peut pas être supprimée : `409`.
- Aucune année n'est créée d'avance : la première (`2026-2027`) est créée par l'administrateur.

### 1.2 Member

Une personne membre du club. **La fonction n'est pas une propriété du membre** : elle vit dans les mandats.

| Champ | Type | Obligatoire | Public | Notes |
|---|---|---|---|---|
| `firstName` | string | oui | oui | |
| `lastName` | string | oui | oui | |
| `occupation` | string | non | oui | Profession ou études. |
| `portrait` | MediaRef | non | oui | Voir 2. Non mis en œuvre avant le stockage de fichiers. |
| `email` | string | non | **non** | Usage interne au Back Office. |
| `phone` | string | non | **non** | Usage interne au Back Office. |

- **Pas de champ actif/inactif.** La présence d'un membre une année donnée est portée par l'existence de son mandat cette année-là. Un drapeau en plus créerait deux sources de vérité.
- Le drapeau `isDemo` du Front Office disparaît à la connexion : les profils de démonstration ne sont jamais enregistrés en base.

### 1.3 MemberMandate

La présence d'un membre au club pendant une année Rotary, avec ses fonctions cette année-là.

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| `member` | ObjectId → Member | oui | |
| `rotaryYear` | ObjectId → RotaryYear | oui | |
| `roles` | MemberRole[] | oui | **Zéro, une ou plusieurs** fonctions. Tableau vide = membre sans fonction cette année-là. Sans doublon. |
| `order` | number | oui | Ordre d'affichage dans l'année, choisi par le club (`DESIGN.md` : jamais un classement par fonction). Entier supérieur ou égal à 1, **unique dans son année**. |

- **Un seul mandat par couple (membre, année)** : index unique. Plusieurs fonctions la même année = plusieurs valeurs dans `roles`, pas plusieurs mandats.
- Supprimer un membre supprime ses mandats (dans le service).
- **Ordre.** Jamais fourni à la création : il est attribué automatiquement, au plus grand ordre de l'année plus un (1 pour le premier mandat de l'année). Un ordre déjà pris dans l'année est refusé (`409`). Les trous sont permis après une modification ou une suppression ; seul le réordonnancement de l'année les referme, en réécrivant les ordres de 1 à n.
- Une même fonction peut être tenue par deux personnes la même année : rien ne l'interdit, et l'index des fonctions du Front Office le gère déjà.

`MemberRole` (valeurs exactes, identiques à celles de `apps/web`) :

| Valeur | Libellé |
|---|---|
| `president` | Président |
| `vice-president` | Vice président |
| `tresorier` | Trésorier |
| `responsable-action` | Responsable action |
| `responsable-image-publique` | Responsable Image publique |
| `responsable-camaraderie` | Responsable camaraderie |
| `responsable-effectif` | Responsable effectif |
| `responsable-fondation` | Responsable fondation |
| `protocole` | Protocole |
| `secretaire` | Secrétaire |

### 1.4 Action

Projet ou activité du club avec un objectif ou un impact concret.

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| `title` | string | oui | |
| `slug` | string | oui | **Unique.** Voir 8. |
| `summary` | string | non | Description courte. |
| `description` | string | non | Description longue, texte brut, paragraphes séparés par une ligne vide. |
| `date` | Date | oui | Date de l'action (ou de son début). |
| `rotaryYear` | ObjectId → RotaryYear | oui | **Référence explicite, choisie par l'administrateur** à la création et modifiable ensuite. Voir « Année Rotary d'un contenu » ci-dessous. |
| `focusAreas` | FocusArea[] | oui | Zéro, un ou plusieurs domaines. Sans doublon. |
| `photos` | MediaRef[] | oui | La première est la photographie principale. Peut être vide. Non mis en œuvre avant le stockage de fichiers. |
| `impact` | ActionImpact | non | **Optionnel.** Seules les rubriques fournies sont enregistrées. Sans aucune rubrique, le champ est absent et rien ne s'affiche. |
| `isPublished` | boolean | oui | `false` par défaut. |
| `publishedAt` | Date | non | Posé à la première publication. Conservé à la dépublication et à la republication. Une action peut être créée directement publiée. |
| `order` | number | non | Ordre manuel éventuel. Tri public : `order` croissant quand il existe, puis `date` décroissante. Entier supérieur ou égal à 1, global (non lié à l'année), doublons permis. Aucun réordonnancement. |

`ActionImpact` (toutes les rubriques sont facultatives, aucune n'est jamais estimée) : `objective`, `beneficiaries`, `location`, `period`, `partners: string[]`, `results`. Rubriques de texte : 500 caractères au plus. Partenaires : 20 au plus, 120 caractères chacun. Une modification remplace l'objet entier.

**Impact absent = rien à l'écran.** Aucun texte de remplacement (« Donnée à venir » ou autre) ne tient lieu d'impact : une rubrique vide n'est pas rendue, et une action sans impact n'a pas de bloc d'impact.

**Année Rotary d'un contenu (Action et News).** L'année n'est jamais déduite en silence de la date. Le Back Office présélectionne l'année qui contient la date saisie, de façon visible, et l'administrateur peut en choisir une autre. L'API exige `rotaryYear` et l'enregistre tel quel ; si la date tombe hors de l'année choisie, le Back Office l'indique par un avertissement non bloquant, sans corriger à la place de l'administrateur.

`FocusArea` (les sept domaines du Rotary, valeurs identiques à celles de `apps/web`) :

| Valeur | Libellé |
|---|---|
| `paix` | Construction de paix et prévention des conflits |
| `maladies` | Prévention et traitement des maladies |
| `eau` | Eau, assainissement et hygiène |
| `sante` | Santé des mères et des enfants |
| `education` | Alphabétisation et éducation de base |
| `economie` | Développement économique local |
| `environnement` | Environnement |

### 1.5 News

Une actualité du club. **Entité distincte d'Action** : la date y domine, il n'y a ni impact ni domaine.

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| `title` | string | oui | |
| `slug` | string | oui | **Unique.** |
| `type` | NewsType | oui | |
| `date` | Date | oui | Un seul champ de date et heure ; ni heure séparée, ni date de fin. Enregistrée en temps universel ; saisie dans le Back Office en heure de Madagascar (voir 11). |
| `rotaryYear` | ObjectId → RotaryYear | oui | Référence explicite, choisie par l'administrateur, comme pour Action. |
| `location` | string | non | Déjà affiché par le Front Office. 1 à 120 caractères. |
| `summary` | string | non | |
| `content` | string | non | Texte brut, paragraphes séparés par une ligne vide. |
| `photos` | MediaRef[] | oui | Peut être vide. Non mis en œuvre avant le stockage de fichiers. |
| `isPublished` | boolean | oui | `false` par défaut. |
| `publishedAt` | Date | non | Posé à la première publication. Conservé à la dépublication et à la republication. Une actualité peut être créée directement publiée. Jamais fourni en entrée. |

`NewsType` : **les cinq types du Front Office V1, et seulement ceux-là.**

| Valeur | Libellé |
|---|---|
| `evenement` | Événement |
| `participation` | Participation |
| `reunion` | Réunion |
| `formation` | Formation |
| `annonce` | Annonce |

### 1.6 Application

Une candidature. **Elle est simplement enregistrée : aucun statut de traitement, aucun workflow.**

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| `firstName` | string | oui | |
| `lastName` | string | oui | |
| `email` | string | oui | |
| `phone` | string | oui | |
| `applicantStatus` | `etudiant` \| `professionnel` | oui | La situation de la personne, pas l'état du dossier. Nommé ainsi pour ne jamais être confondu avec un statut de traitement. |
| `cv` | FileRef | oui | Voir 2. |
| `createdAt` | Date | auto | C'est la date de candidature. |

- Aucun champ `pending`, `accepted`, `rejected` ni équivalent.
- **Contact par email** : en première version, le Back Office ouvre le client de messagerie de l'administrateur (`mailto:`), sans rien stocker. Un envoi depuis l'API (`POST /admin/applications/:id/contact`) est réservé pour plus tard et n'est pas spécifié ici.
- Côté administration, une candidature se **consulte** et se **supprime** (avec son CV). Elle ne se modifie pas.

### 1.7 Admin

Le compte d'administration. Hors des entités métier, nécessaire à l'authentification.

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| `email` | string | oui | **Unique**, en minuscules. |
| `passwordHash` | string | oui | Jamais renvoyé par l'API. |
| `role` | `ADMIN` | oui | Seule valeur possible. |

## 2. Médias et fichiers

**Le CV des candidatures est conservé chez Cloudinary** (décision du 2026-10-02) ; **le fournisseur des images n'est pas choisi** **[ouvert]**. Dans les deux cas l'abstraction demeure : les modèles portent les références dont le fournisseur a besoin, et le code métier ne connaît qu'une interface.

`MediaRef` (image, sous-document embarqué) :

| Champ | Type | Obligatoire | Notes |
|---|---|---|---|
| `url` | string | oui | Adresse servie au navigateur. |
| `publicId` | string | non | Identifiant chez le fournisseur, pour supprimer ou transformer. |
| `name` | string | non | Nom de fichier d'origine. |
| `mimeType` | string | non | |
| `size` | number | non | Octets. |
| `width`, `height` | number | oui | Requis par `next/image` et par les seuils de qualité de `DESIGN.md`. |
| `alt` | string | oui | Texte alternatif, distinct de la légende. |
| `caption` | string | non | Légende (quoi, où, quand). |
| `credit` | string | non | |
| `focus` | string | non | Point d'intérêt en syntaxe CSS (`"50% 30%"`). |

`FileRef` (document, pour le CV) : `publicId` (oui), `name` (oui), `mimeType` (oui), `size` (oui). Aucune `url` n'est enregistrée : le CV est déposé chez Cloudinary comme fichier brut (`raw`) en accès authentifié, sous un identifiant aléatoire, et n'a aucune adresse publique. `mimeType` est le type constaté par l'API sur le contenu. Le CV n'est jamais exposé par l'API publique ; ni son identifiant ni aucune adresse de stockage n'apparaît dans une réponse de l'API.

Dans le code : un module `media` avec une **abstraction `StorageService`** (envoyer, lire, supprimer) et son implémentation Cloudinary, seule partie du code qui connaît le fournisseur ; les autres modules ne connaissent que l'abstraction. L'envoi, la lecture et la suppression se font côté serveur, par appels signés ; l'accès signé utilisé pour lire un fichier reste interne à l'implémentation. Une erreur du fournisseur devient `503` pour l'appelant, sans détail. Pas de collection `media` : les références sont embarquées dans leur document, ce qui suffit tant qu'il n'y a pas de médiathèque partagée.

## 3. MongoDB

Atlas Free (M0). Sept collections ; une seule transaction, pour le réordonnancement des mandats d'une année.

| Collection | Références | Index |
|---|---|---|
| `rotaryyears` | | `startYear` unique |
| `members` | | `lastName, firstName` ; texte sur `firstName, lastName` (recherche) |
| `membermandates` | `member`, `rotaryYear` | **`(member, rotaryYear)` unique** ; **`(rotaryYear, order)` unique** ; `(rotaryYear, roles)` |
| `actions` | `rotaryYear` | `slug` unique ; `(isPublished, date)` ; `(rotaryYear, isPublished)` ; `focusAreas` ; texte sur `title, summary` |
| `news` | `rotaryYear` | `slug` unique ; `(isPublished, date)` ; `(rotaryYear, isPublished)` ; `type` ; texte sur `title, summary` |
| `applications` | | `createdAt` ; texte sur `firstName, lastName, email` |
| `admins` | | `email` unique |

Choix de modélisation :

- **Mandats en collection séparée**, pas embarqués dans le membre : l'ordre d'affichage dépend de l'année, la requête principale du Front Office part de l'année (« les membres de 2026-2027 »), et l'index des fonctions se lit directement.
- **Photos embarquées** dans l'action ou l'actualité : toujours lues avec leur parent, jamais partagées.
- **`rotaryYear` en référence explicite** sur Action et News : filtres et archives se lisent sur cette référence, pas sur la date.
- Intégrité référentielle assurée par les services (MongoDB ne l'assure pas) : suppression en cascade des mandats, refus de supprimer une année utilisée.
- La recherche en première version utilise les index texte de MongoDB (mot entier, sans tolérance). Atlas Search n'est pas requis.

## 4. ODM

**Décision : Mongoose avec `@nestjs/mongoose`.** Le comparatif ci-dessous en garde la justification.

| Option | Pour | Contre |
|---|---|---|
| **Mongoose** (`@nestjs/mongoose`) | Intégration officielle NestJS (module, injection des modèles) ; schémas par décorateurs, cohérents avec les DTO ; index, `timestamps`, `populate`, validation au niveau du schéma ; très documenté | Typage moins strict que le pilote natif ; une couche de plus |
| Pilote natif `mongodb` | Aucune abstraction, typage direct, léger | Tout est à écrire : schémas, index, références, conversions ; aucun garde-fou sur la forme des documents |
| Prisma | Excellent typage, client généré | Support MongoDB en retrait, étape de génération, relations par ObjectId moins naturelles ; trop pour sept collections |
| Typegoose, MikroORM | Typage par classes | Une abstraction de plus au-dessus de Mongoose, ou un ORM généraliste ; communauté plus réduite |

Le projet a sept collections, deux références simples, et un développement mené par étapes : la voie officielle de NestJS apporte la structure (schémas, index, références) sans code d'infrastructure à maintenir. Le pilote natif n'apporterait rien qui compense ce qu'il faudrait réécrire.

## 5. Structure de l'API

```
apps/api/src/
├── main.ts                  préfixe global /api/v1, ValidationPipe, filtre d'erreurs, en-têtes de sécurité
├── app.module.ts
├── config/                  lecture et validation des variables d'environnement
├── common/
│   ├── dto/                 PaginationQueryDto, réponse paginée
│   ├── filters/             format d'erreur unique
│   ├── pipes/               ParseObjectIdPipe
│   ├── enums/               MemberRole, FocusArea, NewsType, ApplicantStatus
│   ├── schemas/             MediaRef, FileRef (sous-documents)
│   └── utils/               slug, label et dates d'une année Rotary
├── auth/                    login, me ; JwtAuthGuard, RolesGuard, @Roles, @CurrentAdmin ; schéma Admin
├── health/                  route technique de santé
├── rotary-years/
├── members/                 schémas Member et MemberMandate, un seul module
├── actions/
├── news/
├── applications/
└── media/                   interface StorageService, envoi et suppression de fichiers
```

Chaque module métier a la même forme :

```
actions/
├── actions.module.ts
├── actions.public.controller.ts   GET publics, contenu publié seulement
├── actions.admin.controller.ts    /admin/actions, gardé au niveau de la classe
├── actions.service.ts
├── schemas/action.schema.ts
└── dto/  create-action.dto.ts, update-action.dto.ts, query-actions.dto.ts
```

- **Deux contrôleurs par ressource.** La séparation public / administration est structurelle : un contrôleur d'administration porte `@UseGuards(JwtAuthGuard, RolesGuard)` et `@Roles('ADMIN')` sur la classe, donc aucune route d'administration ne peut être oubliée.
- **Deux formes de sortie.** Le service renvoie une forme publique (sans `email`, `phone`, brouillons, CV) et une forme d'administration. Le contrôleur public ne peut pas renvoyer la seconde.
- `members` regroupe Member et MemberMandate : ils ne se lisent jamais l'un sans l'autre.
- `auth` contient le schéma `Admin` : pas de module `users`, il n'y a pas d'utilisateurs.

Dépendances à installer **plus tard**, chacune à l'étape qui en a besoin : `@nestjs/mongoose`, `mongoose`, `@nestjs/config`, `@nestjs/jwt`, `class-validator`, `class-transformer`, `@nestjs/throttler`, `helmet`, `argon2`. Aucune n'est installée par cette tâche.

**Sécurité transverse.** Les en-têtes de sécurité HTTP (`helmet`) s'appliquent à toutes les réponses et sont mis en place par le socle. La limitation de fréquence (`@nestjs/throttler`) intervient avec l'authentification, pas dans le socle.

## 6. Endpoints

Préfixe : `/api/v1`. Trois niveaux d'accès : **Public**, **JWT** (jeton valide), **ADMIN** (jeton valide et rôle `ADMIN`). Avec un seul rôle, JWT et ADMIN désignent en pratique le même compte ; les deux gardes restent distinctes pour que l'ajout d'un rôle ne demande aucune réécriture.

### Route technique

| Méthode | Chemin | Accès | Rôle |
|---|---|---|---|
| GET | `/api/v1/health` | Public | État de l'API et de la connexion à la base. `200` si l'API et la connexion à la base répondent, `503` si la base n'est pas joignable. Aucune information sensible. |

Route technique, non métier : elle ne porte aucun contenu du club.

### Auth

| Méthode | Chemin | Accès | Rôle |
|---|---|---|---|
| POST | `/auth/login` | Public, limité en fréquence | Email et mot de passe → jeton |
| GET | `/auth/me` | JWT | Le compte connecté |

Pas de déconnexion côté API (le jeton est sans état : le Back Office efface son cookie). Pas d'inscription, pas de mot de passe oublié en V1.

### Public (lecture seule, contenu publié uniquement)

| Méthode | Chemin | Paramètres | Sert à |
|---|---|---|---|
| GET | `/rotary-years` | | Années existantes, avec `label`, dates et `isCurrent` calculés |
| GET | `/members` | `year` (label, défaut : année courante), `limit` | Annuaire d'une année, dans l'ordre du club, avec les fonctions de l'année. Liste vide (`200`) si l'année n'existe pas ou s'il n'y a pas d'année courante |
| GET | `/members/years` | | Années qui ont au moins un membre, dans la même forme que `/rotary-years` |
| GET | `/actions` | `year`, `focusArea`, `q`, `page`, `limit` | Liste paginée. Liste vide (`200`) si l'année n'existe pas |
| GET | `/actions/years` | | Années qui ont au moins une action publiée |
| GET | `/actions/:slug` | | Détail (page à venir côté Front Office) |
| GET | `/news` | `year`, `type`, `q`, `page`, `limit` | Liste paginée, plus récente d'abord. Liste vide (`200`) si l'année n'existe pas |
| GET | `/news/archives` | | Années qui ont des actualités publiées, avec leur nombre. Une entrée par année : `rotaryYear` dans la forme de `/rotary-years`, et `count`, le nombre d'actualités publiées |
| GET | `/news/:slug` | | Détail |
| POST | `/applications` | `multipart/form-data` | Dépôt d'une candidature. Limité à 20 demandes par heure et par adresse IP. Ne renvoie rien de la candidature. `201` ; `400` (validation), `413` (CV trop lourd), `415` (type de fichier refusé), `429` (limite dépassée), `503` (stockage indisponible). |

Un contenu non publié répond `404` sur la surface publique, comme s'il n'existait pas.

### Administration (tout est ADMIN)

| Ressource | Endpoints |
|---|---|
| Années | `GET /admin/rotary-years` · `POST` (`{ startYear }`) · `DELETE /:id` (refusé si utilisée). Pas de modification : tout se calcule depuis l'année de début. Création : `201`. Suppression : `204` sans corps ; `400` si l'identifiant est mal formé, `404` si l'année n'existe pas. |
| Membres | `GET /admin/members` (`year`, `role`, `q`, `page`, `limit`, `sort`) · `GET /:id` (avec tous ses mandats) · `POST` · `PATCH /:id` · `DELETE /:id` Création : `201`. Suppression : `204`. |
| Mandats | `GET /admin/mandates` (`year`, `member`) · `POST` · `PATCH /:id` (fonctions, ordre) · `DELETE /:id` · `PUT /admin/mandates/order` (réordonner une année : `{ rotaryYear, mandateIds[] }`) Création : `201`, ordre attribué automatiquement. Suppression : `204`. `409` pour un mandat déjà existant pour le couple (membre, année) ou un ordre déjà pris dans l'année. La liste de réordonnancement contient exactement tous les mandats de l'année, chacun une fois ; l'opération est indissociable et renvoie les mandats de l'année dans leur nouvel ordre. |
| Actions | `GET /admin/actions` (`year`, `focusArea`, `published`, `q`, `page`, `limit`, `sort`) · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` Création : `201`. Suppression : `204`. `409` pour un slug déjà pris. |
| Actualités | `GET /admin/news` (`year`, `type`, `published`, `q`, `page`, `limit`, `sort`) · `GET /:id` · `POST` · `PATCH /:id` · `DELETE /:id` Création : `201`. Suppression : `204`. `409` pour un slug déjà pris. |
| Candidatures | `GET /admin/applications` (`q`, `from`, `to`, `page`, `limit`, `sort`) · `GET /:id` · `GET /:id/cv` · `DELETE /:id`. Consultation et suppression seulement : ni création, ni modification, ni statut. `GET /:id/cv` : l'API renvoie le fichier lui-même, en pièce jointe et sans cache ; `404` si le fichier n'existe plus au stockage. Suppression : `204` ; elle retire le fichier puis la candidature ; un fichier déjà absent ne l'empêche pas (`204`) ; `503` si le stockage est indisponible, et la candidature est alors conservée. |
| Médias | `POST /admin/media` (envoi d'une image → `MediaRef`) · `DELETE /admin/media` (par `publicId`). Forme définitive liée au futur fournisseur **[ouvert]**. |

La publication passe par `PATCH` (`isPublished`), sans endpoint dédié. Les corps de création et de modification d'une action ou d'une actualité portent `rotaryYear` (identifiant), obligatoire à la création.

**Tout `/admin/*` exige JWT + `ADMIN`. Le Front Office n'y a aucun accès** : il ne possède pas de jeton, et n'en demande jamais.

## 7. Authentification

| Sujet | Décision |
|---|---|
| **Compte** | **Un seul compte `ADMIN` en V1**, un document dans `admins`. Créé **uniquement** par un script lancé à la main (`npm run seed:admin --workspace=api`), qui lit `ADMIN_EMAIL` et `ADMIN_PASSWORD` dans l'environnement. Aucun endpoint de création, **aucun écran de gestion des comptes**. Relancé avec l'email du compte existant, le script remplace le mot de passe ; avec un autre email, il refuse et ne modifie rien. |
| **Mot de passe** | Jamais stocké ni journalisé. Haché en **Argon2id** (paquet `argon2`). Longueur minimale : 12 caractères. |
| **Login** | `POST /auth/login`. Réponse identique que l'email soit inconnu ou le mot de passe faux (`401`, même message). Limité à 5 tentatives par minute et par adresse IP. |
| **Jeton** | JWT signé HS256 avec `JWT_SECRET`. Contenu : `sub` (id du compte), `role: "ADMIN"`, `iat`, `exp`. Expiration : **8 heures**. **Aucun jeton de rafraîchissement en V1** : à l'expiration, on se reconnecte. La durée vient de `JWT_EXPIRES_IN` : 8 heures par défaut, jamais plus. Un changement de mot de passe n'invalide pas les jetons déjà délivrés. |
| **Transport** | En-tête `Authorization: Bearer <jeton>`, envoyé par le serveur du Back Office. |
| **Garde** | `JwtAuthGuard` vérifie la signature et l'expiration, recharge le compte, l'attache à la requête. Mise en œuvre avec `@nestjs/jwt` et une garde écrite à la main, sans Passport (une seule stratégie, donc pas besoin de la couche). |
| **Rôle** | `RolesGuard` avec le décorateur `@Roles('ADMIN')`, posé sur chaque contrôleur d'administration. |
| **Routes** | Tout ce qui est sous `/admin` exige les deux gardes. `/auth/me` exige le jeton. Le reste est public. |
| **Réponses** | `401` : jeton absent, invalide ou expiré. `403` : jeton valide, rôle insuffisant. |

Changer le mot de passe en V1 : relancer le script d'initialisation. Pas de « mot de passe oublié ».

## 8. Validation

`ValidationPipe` global : `whitelist`, `forbidNonWhitelisted`, `transform`. Les DTO de modification sont les DTO de création rendus partiels.

| Sujet | Règle |
|---|---|
| **Chaînes** | Espaces de début et de fin retirés. Titres et noms : 1 à 120 caractères. Résumés : 500 au plus. Textes longs : 20 000 au plus. |
| **Email** | Format valide, mis en minuscules, 254 caractères au plus. |
| **Téléphone** | Chiffres, espaces, `+`, `-`, `.`, parenthèses ; au moins 8 chiffres (même règle que le formulaire du Front Office). Pas de validation par pays. |
| **Dates** | ISO 8601. |
| **Année Rotary** | À la création : `startYear` entier entre 2000 et 2100, unique. Sur une action ou une actualité : `rotaryYear` est l'identifiant d'une année existante, sinon `400`. En filtre : label au format `AAAA-AAAA` avec deux années consécutives. |
| **Slug** | Minuscules, chiffres et tirets (`^[a-z0-9]+(-[a-z0-9]+)*$`), 120 caractères au plus. Voir ci-dessous. |
| **Enums** | `MemberRole`, `FocusArea`, `NewsType`, `ApplicantStatus` : valeurs de la section 1 uniquement. |
| **Tableaux** | `roles`, `focusAreas` : valeurs d'enum, sans doublon. `photos` : 20 au plus. `partners` : 20 au plus. |
| **Identifiants** | ObjectId valide, sinon `400` (et non `500`). |
| **Images** | JPEG, PNG ou WebP ; 10 Mo au plus. `alt`, `width`, `height` obligatoires. |
| **CV** | PDF, DOC ou DOCX ; 5 Mo au plus (5 242 880 octets) ; un seul fichier, non vide. Le type est constaté par l'API sur le contenu, et l'extension doit concorder ; le type annoncé par le client n'est pas utilisé. |

**Slug.** Généré automatiquement par le serveur à partir du titre quand il n'est pas fourni (sans accents, en minuscules, mots séparés par des tirets) ; en cas de collision, suffixe `-2`, `-3`. **Modifiable à la main par l'administrateur**, à la création comme ensuite ; un slug saisi déjà pris répond `409`. Modifier le titre ne régénère pas le slug. Changer le slug d'un contenu publié change son adresse publique : le Back Office le signale, sans l'empêcher. Un titre dont aucun slug ne peut être tiré est refusé (`400`) si aucun slug n'est fourni. `years` est réservé pour les actions : il désigne la route `/actions/years` ; la génération automatique passe à `years-2`, et fourni par l'administrateur il est refusé (`400`). `archives` est réservé pour les actualités : il désigne la route `/news/archives` ; la génération automatique passe à `archives-2`, et fourni par l'administrateur il est refusé (`400`).

## 9. Filtres, pagination, tri

Contrat commun des listes paginées :

- Paramètres : `page` (défaut 1), `limit` (**défaut 20**, maximum 100).
- `q` : recherche texte, 2 caractères au moins.
- `sort` (administration seulement) : un champ autorisé, préfixé de `-` pour l'ordre décroissant (`sort=-date`). Un champ non autorisé répond `400`.
- Réponse : voir 10.

| Ressource | Pagination | Recherche `q` | Filtres | Tri |
|---|---|---|---|---|
| **Members** (public) | non : une année tient en une réponse (`limit` pour l'aperçu de l'accueil) | non | `year` | ordre du club (`order`) |
| **Members** (admin) | oui | prénom, nom | `year`, `role` | `lastName` (défaut), `createdAt` |
| **Actions** (public) | oui | titre, résumé | `year`, `focusArea` | `order` puis `-date` |
| **Actions** (admin) | oui | titre, résumé | `year`, `focusArea`, `published` | `-date` (défaut), `title`, `createdAt` |
| **News** (public) | oui | titre, résumé | `year`, `type` | `-date` |
| **News** (admin) | oui | titre, résumé | `year`, `type`, `published` | `-date` (défaut), `title`, `createdAt` |
| **Applications** (admin) | oui | prénom, nom, email | `from`, `to` (date de candidature, bornes incluses) | `createdAt`, `lastName`, dans les deux sens ; `-createdAt` par défaut |
| **RotaryYears** | non | non | | `-startDate` |

`year` est toujours le **label** (`2026-2027`), jamais un identifiant : c'est ce que les adresses du Front Office portent déjà.

## 10. Front Office → API

**`apps/web` est relié à l'API depuis la fonctionnalité 009.** Cette section en fixe le contrat.

### Mode de consommation

- Les fonctions de `apps/web/src/data/*.ts` (`getActions`, `getNews`, `getMembers`, …) sont déjà asynchrones et déjà la seule porte d'accès aux données. À la connexion, **seul leur corps change** : il appelle l'API. Les pages et les composants ne bougent pas.
- Appels depuis le serveur Next.js uniquement, avec `API_URL` (variable serveur). Un petit client `src/lib/api.ts` centralise l'adresse, le traitement des erreurs et le cache.
- Cache : `fetch` avec revalidation par durée, configurée à environ 60 secondes. L'objectif est qu'un changement fait dans le Back Office soit visible en une minute environ, **sans garantie à la seconde près** ; une visite ne déclenche pas systématiquement une lecture de l'API. Une revalidation qui échoue ne remplace pas volontairement par un état vide un contenu déjà correctement mis en cache ; cela vaut tant que le cache existe (il est propre au serveur du site ; un build ou un redéploiement peut le vider). Pour que cette règle tienne, les pages de lecture, accueil compris, sont rendues à la demande à partir de ce cache : une page régénérée statiquement relirait au premier plan une entrée périmée et enregistrerait l'état vide si l'API ne répondait pas. Une invalidation à la demande depuis le Back Office pourra venir ensuite.
- Listes longues : les listes d'actions et d'actualités sont lues en entier, par pages de 100 éléments au plus ; aucune pagination n'est visible sur le site.
- Le formulaire de candidature passe par une Server Action qui transmet le `multipart` à `POST /applications` : le navigateur ne parle jamais à l'API.
- Si l'API ne répond pas : la page affiche ses emplacements sans contenu, comme aujourd'hui, plutôt qu'une erreur.

### Format des réponses

Un objet : la ressource directement. Une liste paginée :

```json
{
  "data": [],
  "meta": { "page": 1, "limit": 20, "total": 0, "totalPages": 0 }
}
```

Une liste non paginée (années, membres d'une année) : `{ "data": [] }`.

### Erreurs

Format unique, pour les deux surfaces :

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Données invalides.",
  "details": [{ "field": "email", "message": "Adresse email invalide." }]
}
```

`details` n'existe que pour les erreurs de validation. Codes utilisés : `400` (validation, identifiant malformé), `401`, `403`, `404`, `409` (slug, mandat ou année en double ; année utilisée), `413` (fichier trop lourd), `415` (type de fichier refusé), `429` (trop de tentatives), `500` (erreur interne, sans détail technique), `503` (base injoignable, sur la route de santé). Messages en français, affichables tels quels.

### Correspondance API → modèles du Front Office

| Modèle `apps/web` | Champ | Vient de l'API | Remarque |
|---|---|---|---|
| `Photo` | `src` | `MediaRef.url` | Seul renommage ; `width`, `height`, `alt`, `caption`, `credit`, `focus` sont identiques |
| `Action` | `rotaryYear` | `rotaryYear` | L'API publique renvoie le label, pas l'identifiant |
| | `impact?` | `impact?` | Absent s'il n'y a aucune donnée : le bloc d'impact ne s'affiche pas |
| | `focusArea?: string` | `focusAreas: string[]` | **Le type du Front Office passera au pluriel** à la connexion |
| | `summary`, `photos`, `slug`, `title` | identiques | |
| | (absent) | `description`, `date` | À ajouter au type ; `description` découpée en paragraphes sur les lignes vides |
| `NewsItem` | `body?: string[]` | `content: string` | Découpé en paragraphes sur les lignes vides |
| | `type` | `type` | Mêmes cinq valeurs des deux côtés |
| | (calculée par `rotaryYearOf(date)`) | `rotaryYear` | À la migration, les archives lisent l'année fournie par l'API, plus celle déduite de la date |
| | `date`, `location`, `summary`, `photos`, `slug`, `title` | identiques | |
| `Member` | `mandates: [{ rotaryYear, roles }]` | `roles` de l'année demandée | L'API publique renvoie les fonctions de l'année filtrée ; `rolesForYear` devient inutile |
| | `isDemo` | (absent) | Disparaît avec les profils de démonstration |
| `MembershipApplication` | `status` | `applicantStatus` | Renommage |
| `ImpactIndicator` | | (aucune entité) | Voir « Écarts » ci-dessous |

### Écarts traités à la migration

Trois décisions de ce document n'étaient pas reflétées par le Front Office V1 ni par `DESIGN.md`. La fonctionnalité 009 les a traitées :

1. **Impact sans faux contenu.** Le registre d'impact de la page Actions affichait cinq indicateurs avec la mention « Donnée à venir », que `DESIGN.md` (section 10) prescrivait. La décision est : pas de donnée, pas de section. `DESIGN.md` a été corrigé d'abord, puis le registre et la mention ont été retirés du Front Office. Aucune entité ne porte ce registre agrégé pour l'instant **[ouvert]**.
2. **Année Rotary explicite.** Le Front Office déduisait l'année d'une actualité de sa date ; il lit l'année fournie par l'API.
3. **Fuseau des actualités.** Le Front Office affichait les dates en temps universel. La date d'une actualité est saisie en heure de Madagascar (voir 11) : le Front Office affiche son jour et son mois en heure de Madagascar, jamais l'heure, et groupe son fil par mois dans ce fuseau.

## 11. Back Office → API

### Principe

Le Back Office est une application Next.js dont **le serveur fait l'intermédiaire** : le navigateur de l'administrateur ne parle qu'à `apps/admin`, et `apps/admin` parle à l'API.

- **Connexion.** Le formulaire appelle une Server Action, qui appelle `POST /auth/login`, puis range le jeton dans un **cookie `httpOnly`, `Secure`, `SameSite=Lax`**, de même durée que le jeton. Le JavaScript du navigateur n'y a jamais accès : pas de `localStorage`.
- **Client API.** `src/lib/api.ts`, exécutable côté serveur seulement : lit le cookie, ajoute `Authorization: Bearer`, appelle `API_URL`, convertit les erreurs de l'API en un type unique.
- **Lectures** dans des Server Components ; **écritures** par Server Actions. Les composants MUI interactifs (tableaux, formulaires) sont des Client Components qui reçoivent leurs données en props et déclenchent ces actions.
- **Protection des routes, à deux niveaux.** `src/proxy.ts` (la convention de Next.js 16, qui remplace `middleware.ts`) redirige vers `/connexion` toute requête sans cookie. Puis le layout du groupe protégé appelle `GET /auth/me` : la vérification réelle reste celle de l'API.
- **Erreurs.** `401` : cookie effacé, redirection vers `/connexion`. `403` : page d'accès refusé. `400` avec `details` : chaque message est rendu sous son champ. `409` : message en tête de formulaire. Erreur réseau ou `5xx` : message générique, la saisie est conservée.
- **Déconnexion.** Une Server Action efface le cookie et redirige.
- **Dates et fuseau.** La date d'une actualité se saisit en date et heure, **en heure de Madagascar** ; le Back Office la convertit en temps universel avant de l'envoyer à l'API, qui n'enregistre que du temps universel. Le Back Office l'affiche en heure de Madagascar, quel que soit le fuseau de l'ordinateur de l'administrateur ; il affiche de même les dates de création, de première publication et de candidature. La date d'une action est une date sans heure, affichée telle qu'elle est enregistrée. L'API et ses contrats ne changent pas.
- **Envoi de fichiers.** Dépend de la stratégie de stockage : un passage par le serveur Next.js est limité en taille sur Vercel (environ 4,5 Mo), ce qui est trop peu pour des photographies de 2400 px. Un envoi direct du navigateur vers l'API ou vers le fournisseur sera probablement nécessaire ; c'est le seul cas où CORS devrait être ouvert. **[ouvert]**

### Structure

```
apps/admin/src/
├── proxy.ts                redirection vers /connexion sans cookie
├── app/
│   ├── connexion/
│   ├── session/fin/        adresse technique : efface le cookie (impossible pendant un rendu)
│   ├── acces-refuse/       adresse technique : page du 403
│   └── (admin)/            layout protégé : barre latérale, vérification de session
│       ├── page.tsx        accueil du Back Office
│       ├── annees/  membres/  actions/  actualites/  candidatures/
│       └── candidatures/[id]/cv/   relais du fichier renvoyé par l'API
├── components/ cadre, dialogue de confirmation, avis, états, barre de liste, champs partagés
├── lib/        api.ts, session.ts, dates.ts (seul fichier à connaître le fuseau), labels.ts, …
├── theme/      thème MUI
└── types/      formes d'administration des ressources
```

Les adresses des écrans sont `/connexion`, `/`, `/annees`, `/membres`, `/actions`, `/actualites`, `/candidatures` et leurs sous-adresses ; aucune n'est sous `/admin`, qui désigne les routes de l'API.

Interface en français. MUI installé : `@mui/material`, `@emotion/react`, `@emotion/styled`, `@mui/material-nextjs`, `@mui/icons-material`, et `@emotion/cache`, dépendance paire obligatoire de `@mui/material-nextjs` que l'installation sans hoisting ne rend pas accessible autrement. Les tableaux utilisent le `Table` de MUI ; `@mui/x-data-grid` ne s'ajoute que si un besoin le justifie. **Aspect.** `DESIGN.md` ne régit pas le Back Office. Sa direction est fonctionnelle : lisibilité, densité adaptée à l'administration, formulaires clairs, tableaux et listes efficaces, états d'attente, d'erreur et de liste vide, confirmation des suppressions, retour après chaque opération, adaptation raisonnable aux écrans. Un seul thème MUI pour tous les écrans ; ses détails (couleurs, typographie, densité) sont fixés par `specs/008-back-office/plan.md`.

### Types partagés

`packages/` reste vide. Les deux fronts et l'API ont des chaînes d'outils différentes (TypeScript 5 et 6, `nodenext` côté API) et l'installation est sans hoisting : un paquet partagé coûterait plus qu'il ne rapporte à cette taille. Chaque application déclare ses types ; **ce document est le contrat**.

## 12. Environnement

Aucune valeur réelle ici ni dans le code. Chaque application aura un `.env.example` (noms seuls) versionné, et un `.env` local ignoré par Git.

### `apps/api`

| Variable | Obligatoire | Notes |
|---|---|---|
| `PORT` | non | Défaut 4000. |
| `NODE_ENV` | non | `development` ou `production`. |
| `MONGODB_URI` | **oui** | Secret. Chaîne de connexion Atlas, avec le nom de la base. |
| `JWT_SECRET` | **oui** | Secret. 32 caractères au moins, générés aléatoirement. Exigé dès le socle, utilisé à partir de l'authentification. L'API refuse de démarrer s'il manque. |
| `JWT_EXPIRES_IN` | non | Défaut `8h`. Durée strictement positive et de 8 heures au plus : une valeur nulle ou supérieure à 8 heures empêche le démarrage. |
| `CORS_ORIGINS` | non | Vide par défaut : aucun navigateur n'appelle l'API. À renseigner seulement si l'envoi direct de fichiers est retenu. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | script seulement | Lus par le script d'initialisation, jamais par l'API en fonctionnement. |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | **oui** | Stockage des CV. Secrets. L'API refuse de démarrer si l'une manque. Les variables du stockage des images restent à définir, avec leur fournisseur. |

### `apps/web`

| Variable | Obligatoire | Portée | Notes |
|---|---|---|---|
| `API_URL` | oui, à la connexion | **serveur seulement** | Par exemple `http://localhost:4000/api/v1` en local. Aucune variable `NEXT_PUBLIC_*` n'est nécessaire. |

### `apps/admin`

| Variable | Obligatoire | Portée | Notes |
|---|---|---|---|
| `API_URL` | oui | **serveur seulement** | Même forme que pour `web`. |
| `NEXT_PUBLIC_API_URL` | non | navigateur | Seulement si l'envoi direct de fichiers vers l'API est retenu. N'est pas un secret. |

Tout est validé au démarrage de l'API (module `config`) : une variable obligatoire absente arrête le démarrage avec un message clair.

## 13. Contrats : exemples JSON

Exemples de forme. Les valeurs sont des emplacements, pas des données du club.

**RotaryYear** (seul `startYear` est stocké ; `POST /admin/rotary-years` reçoit `{ "startYear": 2026 }`)

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c0",
  "startYear": 2026,
  "label": "2026-2027",
  "startDate": "2026-07-01T00:00:00.000Z",
  "endDate": "2027-06-30T23:59:59.999Z",
  "isCurrent": true
}
```

**Member** (surface publique, `GET /members?year=2026-2027`)

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c1",
  "firstName": "Prénom",
  "lastName": "Nom",
  "occupation": "Profession ou études",
  "portrait": {
    "url": "https://…",
    "width": 1200,
    "height": 1500,
    "alt": "Portrait de Prénom Nom."
  },
  "rotaryYear": "2026-2027",
  "roles": ["president", "responsable-image-publique"],
  "order": 1
}
```

**Member** (surface d'administration, `GET /admin/members/:id`)

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c1",
  "firstName": "Prénom",
  "lastName": "Nom",
  "occupation": "Profession ou études",
  "email": "prenom.nom@exemple.org",
  "phone": "+261 00 00 000 00",
  "portrait": null,
  "mandates": [
    {
      "id": "66f0c1a2b3c4d5e6f7a8b9c2",
      "rotaryYear": { "id": "66f0c1a2b3c4d5e6f7a8b9c0", "label": "2026-2027" },
      "roles": ["president", "responsable-image-publique"],
      "order": 1
    }
  ],
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-01T08:00:00.000Z"
}
```

**MemberMandate** (`POST /admin/mandates`, corps puis réponse)

```json
{ "member": "66f0c1a2b3c4d5e6f7a8b9c1", "rotaryYear": "66f0c1a2b3c4d5e6f7a8b9c0", "roles": ["secretaire", "protocole"] }
```

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c2",
  "member": "66f0c1a2b3c4d5e6f7a8b9c1",
  "rotaryYear": { "id": "66f0c1a2b3c4d5e6f7a8b9c0", "label": "2026-2027" },
  "roles": ["secretaire", "protocole"],
  "order": 3,
  "createdAt": "2026-10-01T08:00:00.000Z",
  "updatedAt": "2026-10-01T08:00:00.000Z"
}
```

**Action** (surface d'administration ; la surface publique omet `isPublished`, `order`, `createdAt`, `updatedAt` et renvoie `rotaryYear` en label). `impact` est absent de la réponse quand aucune rubrique n'est renseignée. En écriture, `rotaryYear` est l'identifiant de l'année choisie.

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c3",
  "title": "Titre de l'action",
  "slug": "titre-de-l-action",
  "summary": "Courte description.",
  "description": "Premier paragraphe.\n\nSecond paragraphe.",
  "date": "2026-09-12T00:00:00.000Z",
  "rotaryYear": { "id": "66f0c1a2b3c4d5e6f7a8b9c0", "label": "2026-2027" },
  "focusAreas": ["eau", "sante"],
  "photos": [
    {
      "url": "https://…",
      "publicId": "…",
      "name": "action.jpg",
      "mimeType": "image/jpeg",
      "size": 1843200,
      "width": 2400,
      "height": 1600,
      "alt": "Ce que l'image montre.",
      "caption": "Quoi, où, quand.",
      "focus": "50% 30%"
    }
  ],
  "impact": {
    "objective": "…",
    "beneficiaries": "…",
    "partners": ["…"]
  },
  "isPublished": true,
  "publishedAt": "2026-09-20T10:00:00.000Z",
  "order": null,
  "createdAt": "2026-09-15T08:00:00.000Z",
  "updatedAt": "2026-09-20T10:00:00.000Z"
}
```

**News** (surface d'administration ; mêmes omissions côté public)

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c4",
  "title": "Titre de l'actualité",
  "slug": "titre-de-l-actualite",
  "type": "reunion",
  "date": "2026-09-05T00:00:00.000Z",
  "rotaryYear": { "id": "66f0c1a2b3c4d5e6f7a8b9c0", "label": "2026-2027" },
  "location": "Antananarivo",
  "summary": "Court résumé.",
  "content": "Premier paragraphe.\n\nSecond paragraphe.",
  "photos": [],
  "isPublished": false,
  "publishedAt": null,
  "createdAt": "2026-09-06T08:00:00.000Z",
  "updatedAt": "2026-09-06T08:00:00.000Z"
}
```

**Application** (surface d'administration seulement)

```json
{
  "id": "66f0c1a2b3c4d5e6f7a8b9c5",
  "firstName": "Prénom",
  "lastName": "Nom",
  "email": "prenom.nom@exemple.org",
  "phone": "+261 00 00 000 00",
  "applicantStatus": "etudiant",
  "cv": {
    "name": "cv.pdf",
    "mimeType": "application/pdf",
    "size": 245760
  },
  "createdAt": "2026-10-01T08:00:00.000Z"
}
```

L'adresse du CV n'apparaît pas dans la liste : elle s'obtient par `GET /admin/applications/:id/cv`. `POST /applications` répond `201` avec `{ "received": true }`, sans rien renvoyer de la candidature.

**Login** (`POST /auth/login`, corps puis réponse)

```json
{ "email": "admin@exemple.org", "password": "…" }
```

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs…",
  "tokenType": "Bearer",
  "expiresIn": 28800,
  "admin": { "id": "66f0c1a2b3c4d5e6f7a8b9c6", "email": "admin@exemple.org", "role": "ADMIN" }
}
```

`GET /auth/me` renvoie l'objet `admin` seul.

## 14. Décisions

### Verrouillées

| # | Sujet | Décision |
|---|---|---|
| 1 | **ODM** | Mongoose + `@nestjs/mongoose`. |
| 2 | **MemberMandate** | Collection séparée de Member. Un mandat par couple (member, rotaryYear). `roles[]` porte plusieurs fonctions la même année. `order` porte l'ordre d'affichage. |
| 3 | **Slugs** | Générés automatiquement depuis le titre, modifiables à la main par l'administrateur. |
| 4 | **Pagination** | `page` / `limit`, `limit` par défaut à 20. |
| 5 | **Administration** | Un seul compte `ADMIN` en V1, créé uniquement par script manuel. Aucun écran de gestion des comptes. |
| 6 | **Auth** | JWT HS256, expiration 8 heures, Argon2id pour le mot de passe, aucun jeton de rafraîchissement en V1. |
| 7 | **Applications** | Aucun workflow de statut. `applicantStatus` = Étudiant ou Professionnel. La candidature est enregistrée, puis consultable et supprimable par l'administrateur. |
| 8 | **API** | Préfixe `/api/v1`. |
| 9 | **Public / admin** | `/admin/*` protégé par JWT + `ADMIN`. Le Front Office n'a aucun accès aux endpoints d'administration. |
| 10 | **Stockage** | Abstraction `StorageService` conservée. Cloudinary pour le CV des candidatures : fichier brut en accès authentifié, envoi côté serveur seulement, aucune référence de stockage dans les réponses de l'API. Une candidature et son CV sont conservés jusqu'à leur suppression par l'administrateur : aucune suppression automatique. Aucun fournisseur choisi pour les images ; `MediaRef` porte les références utiles à un futur fournisseur. |
| 11 | **News** | Les cinq types du Front Office V1 uniquement. |
| 12 | **Impact** | Optionnel. Aucun faux contenu : sans donnée d'impact, la section n'est pas affichée. |
| 13 | **Année Rotary d'un contenu** | Référence explicite vers RotaryYear sur Action et News, choisie par l'administrateur. Jamais déduite en silence de la date. |
| 14 | **RotaryYear** | Identifiée par son année de début. Label et dates calculés. Aucun booléen « courant » stocké. |
| 15 | **Front Office** | Relié à l'API depuis la fonctionnalité 009 : lectures publiques par `src/data/*`, candidature par une Server Action. |
| 16 | **Route de santé** | `GET /api/v1/health`, route technique publique : `200` si l'API et la base répondent, `503` si la base n'est pas joignable, aucune information sensible. Mise en place par le socle. |
| 17 | **En-têtes de sécurité** | `helmet` sur toutes les réponses, mis en place par le socle. La limitation de fréquence (`@nestjs/throttler`) arrive avec l'authentification. |
| 18 | **Aspect du Back Office** | Direction fonctionnelle, distincte de `DESIGN.md` : lisibilité, densité adaptée à l'administration, formulaires clairs, tableaux et listes efficaces, états d'attente, d'erreur et de liste vide, confirmation des suppressions, retour après chaque opération. Aucun document visuel distinct : un seul thème MUI, détaillé par le plan de la fonctionnalité 008. |
| 19 | **Dates du Back Office** | La date d'une actualité est saisie en date et heure, en heure de Madagascar, et convertie en temps universel avant l'enregistrement. Le Back Office affiche en heure de Madagascar la date des actualités et les dates de création, de première publication et de candidature, quel que soit le fuseau de l'ordinateur. L'API n'enregistre et ne renvoie que du temps universel. Le Front Office affiche le jour et le mois d'une actualité en heure de Madagascar, sans l'heure. |
| 20 | **Cache du Front Office** | Revalidation par durée, configurée à environ 60 secondes, sans garantie à la seconde près. Une visite ne déclenche pas systématiquement une lecture de l'API. Une revalidation qui échoue ne remplace pas volontairement par un état vide un contenu déjà correctement mis en cache. Les listes d'actions et d'actualités sont lues en entier, par pages de 100 ; aucune pagination n'est visible. |

### Encore ouvertes

| Sujet | Ce qu'il faut trancher | Bloque |
|---|---|---|
| **Fournisseur de stockage des images** | Lequel, et par quel chemin les fichiers sont envoyés (via l'API ou directement depuis le navigateur, ce qui ouvrirait CORS). | L'étape « stockage de fichiers », l'envoi de photos dans le Back Office |
| **Registre d'impact agrégé de la page Actions** | Aucune entité ne le porte. À décider : le retirer, ou le faire saisir dans le Back Office. Dans les deux cas il ne s'affiche pas sans données, et `DESIGN.md` (section 10) est à aligner avant de toucher au Front Office. | La migration du Front Office |
| **Limites des fichiers** | 10 Mo par image est une proposition. (5 Mo par CV : confirmé.) | L'étape « stockage de fichiers » |
| **Anti-spam du formulaire** | Au-delà de la limite de fréquence, rien n'est prévu. | Rien dans l'immédiat |

Rien de ce qui est ouvert ne bloque les trois premières étapes (socle de l'API, authentification, années, membres et mandats), ni les actions et actualités hors envoi de photos.

## 15. Ordre d'implémentation proposé

Chaque étape démarre sur demande explicite.

1. Socle de l'API : configuration, connexion MongoDB, préfixe, validation, format d'erreur, route de santé, en-têtes de sécurité.
2. Authentification et script d'initialisation du compte.
3. Années Rotary, puis membres et mandats.
4. Actions, actualités.
5. Candidatures, avec le stockage de leur CV ; le stockage des images reste à faire.
6. Socle du Back Office : MUI, connexion, session, client API, mise en page.
7. Écrans du Back Office, ressource par ressource.
8. Connexion du Front Office à l'API, en remplaçant le corps des fonctions de `src/data`.
