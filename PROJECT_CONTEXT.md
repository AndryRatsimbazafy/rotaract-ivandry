# PROJECT_CONTEXT — Rotaract Club Ivandry

> Document de référence du projet. État au 2026-10-02 : le Front Office V1 est terminé et audité (données locales, aucune connexion à l'API) ; l'architecture du Backend et du Back Office est spécifiée dans `ARCHITECTURE.md`, ses décisions principales sont verrouillées ; le socle de l'API (`apps/api`) est en place, avec l'authentification de l'administrateur et quatre domaines métier administrables : les années Rotary, les membres avec leurs mandats, les actions et les actualités, ainsi que les candidatures ; le Back Office (`apps/admin`) est construit : connexion, navigation et gestion de ces cinq domaines, sur l'API.

## 1. Objectif du projet

Site web du **Rotaract Club Ivandry**, composé de :

- un **Front Office** public (vitrine du club) ;
- un **Back Office** d'administration, où un administrateur gère le contenu affiché par le Front Office ;
- une **API** backend servant les deux interfaces.

## 2. Documents de référence

| Document | Rôle |
|---|---|
| `PROJECT_CONTEXT.md` | Décisions, contraintes, périmètre, état du projet. |
| `DESIGN.md` | **Source de vérité visuelle du Front Office.** Se corrige avant le code. |
| `ARCHITECTURE.md` | Référence technique du Backend et du Back Office : modèles, MongoDB, API, authentification, contrats, variables d'environnement. Spécification, pas encore implémentée. |
| `CLAUDE.md` | Règles de travail pour Claude Code. |

## 3. Architecture

```
rotaract-ivandry/
├── package.json        racine du workspace npm (scripts d'orchestration, engines)
├── package-lock.json   lockfile unique du workspace
├── .npmrc              install-strategy=nested
├── .nvmrc              22
├── PROJECT_CONTEXT.md  DESIGN.md  ARCHITECTURE.md  CLAUDE.md  README.md
├── apps/
│   ├── web/      Front Office public — Next.js (App Router) + TypeScript — terminé en V1
│   ├── admin/    Back Office — Next.js (App Router) + TypeScript + MUI — construit
│   └── api/      Backend — NestJS + TypeScript — socle en place
└── packages/     réservé aux packages partagés futurs (vide, `.gitkeep`)
```

- Monorepo **npm workspaces** (`apps/*`, `packages/*`) avec un seul `package-lock.json` à la racine.
- Les trois applications restent **indépendantes au niveau de leurs dépendances** : chacune a son `package.json` et son propre `node_modules`. Le `.npmrc` racine (`install-strategy=nested`) désactive le hoisting ; le `node_modules` racine ne contient que les liens vers les workspaces.
- `npm install` se lance **depuis la racine**.
- Un seul dépôt Git à la racine.

Flux cible (voir `ARCHITECTURE.md`) : les deux fronts appellent l'API depuis leur serveur Next.js ; l'API est seule à parler à MongoDB et au stockage de fichiers ; l'API a une surface publique et une surface d'administration (`/admin`, JWT + rôle `ADMIN`).

### apps/web — Front Office (terminé en V1)

Cinq routes publiques, conçues et auditées ensemble selon `DESIGN.md` :

| Route | Page | Rendu |
|---|---|---|
| `/` | Accueil | statique |
| `/actions` | Actions (filtres par année et domaine dans l'adresse) | dynamique |
| `/actualites` | Actualités (rubriques et archives dans l'adresse) | dynamique |
| `/membres` | Membres (année dans l'adresse) | dynamique |
| `/rejoindre` | Nous rejoindre (parcours, formulaire de candidature) | statique |

Organisation de `apps/web/src` :

| Dossier | Contenu |
|---|---|
| `app/` | Routes, `layout.tsx`, `tokens.css`, `globals.css` ; les sections de chaque page dans `_sections/`. |
| `components/` | `layout/` (en-tête, pied de page, navigation, menu du téléphone), `media/` (`PhotoFrame`), `sections/` (rappel cranberry, liens de sortie), `ui/` (lien fléché, étiquette de section, bouton). |
| `config/` | `routes.ts` (routes et navigation), `site.ts` (nom, lieu, logo, réseaux sociaux). |
| `content/` | Textes de chaque page, en français ; `common.ts` pour les libellés partagés. |
| `data/` | **Seule porte d'accès aux données.** Fonctions asynchrones (`getActions`, `getNews`, `getMembers`, `submitApplication`, …) qui renvoient aujourd'hui des données locales. |
| `lib/` | Dates, année Rotary, paramètres d'adresse. |
| `types/` | Modèles du Front Office : `Action`, `NewsItem`, `Member`, `MembershipApplication`, `Photo`, `RotaryYear`. |

État des données : aucune action ni actualité publiée ; sept profils de démonstration sur la page Membres (marqués comme tels) ; le formulaire de candidature vérifie la saisie mais **ne transmet rien**. Tant qu'un contenu manque, la page affiche un emplacement (voir `DESIGN.md`, section 8). Une seule photographie réelle : celle de l'ouverture.

Technique : CSS Modules et tokens (`tokens.css`), pas de Tailwind ; Open Sans chargée par `next/font/google` avec l'axe `wdth`, Georgia en police système ; alias `@/*` → `./src/*` ; aucune dépendance au-delà de Next.js et React.

### apps/admin — Back Office (construit)

Interface d'administration, en français, sur les opérations `/admin/*` de l'API (fonctionnalité 008). Le serveur Next.js est le seul intermédiaire : lectures dans des Server Components, écritures par Server Actions, jeton dans un cookie `httpOnly` et `Secure` ; le navigateur n'appelle jamais l'API et ne connaît ni son adresse ni le jeton.

- **Écrans** : `/connexion` ; `/` (accès aux cinq domaines, sans chiffres) ; `/annees` ; `/membres` (liste, fiche avec ses mandats, `/membres/ordre` pour l'ordre d'une année) ; `/actions` ; `/actualites` ; `/candidatures` (liste, fiche, téléchargement du CV relayé par le Back Office, contact par `mailto:`, suppression). Deux adresses techniques : `/session/fin`, `/acces-refuse`.
- **Protection** : `src/proxy.ts` (présence du cookie), layout protégé (`GET /auth/me`), puis chaque appel à l'API ; un `401` efface la session et ramène à la connexion.
- **Listes** : recherche, filtres, tri et page vivent dans l'adresse ; ce sont exactement ceux des contrats de l'API.
- **Dates** : `src/lib/dates.ts` est le seul fichier à connaître le fuseau. Une actualité se saisit en date et heure de Madagascar, convertie en temps universel sur le serveur ; les dates sont formatées sur le serveur, jamais dans le navigateur.
- **Aspect** : un seul thème MUI, fonctionnel et dense (`src/theme/theme.ts`) ; `DESIGN.md` ne s'y applique pas.
- **Hors de ce qui est construit** : photographies et portraits (stockage des images non décidé), gestion de compte, aperçu du Front Office.

Technique : MUI 9 et Emotion 11 (six dépendances), Open Sans par `next/font/google` ; aucune bibliothèque de formulaires, de dates, de tableaux ni de glisser-déposer. Variable : `API_URL`, côté serveur seulement (`apps/admin/.env.local`, à créer à la main ; `apps/admin/.env.example` en porte le nom). Structure : `ARCHITECTURE.md`, section 11. Documents : `specs/008-back-office/`.

### apps/api — Backend (socle en place)

Le gabarit `nest new` a été remplacé par le socle (spec `specs/001-api-foundation/`). La route « Hello World! » n'existe plus.

- `main.ts` : préfixe global `/api/v1`, en-têtes de sécurité (`helmet`), filtre d'erreurs global, `ValidationPipe` global, CORS activé seulement si `CORS_ORIGINS` est renseignée ; un démarrage raté journalise un message générique, sans détail de connexion, et termine le processus.
- `app.module.ts` : configuration (`@nestjs/config`, fichier `apps/api/.env`, validée au démarrage) et connexion à MongoDB (`@nestjs/mongoose`).
- `config/` : règles des variables d'environnement et accès typé à la configuration.
- `common/` : format d'erreur unique en français (`filters/`) et validation des entrées (`pipes/`).
- `health/` : `GET /api/v1/health`, route technique qui lit l'état de la connexion à la base (`200` ou `503`).
- `rotary-years/` : modèle RotaryYear (seul `startYear` est enregistré, index unique) et `GET /api/v1/rotary-years`, liste publique des années avec `label`, `startDate`, `endDate` et `isCurrent` calculés (spec `specs/002-rotary-years/`, temps 1). Les calculs sont dans `common/utils/rotary-year.ts`. Opérations d'administration sous `/api/v1/admin/rotary-years`, protégées (spec `specs/003-admin-auth/`) : liste, création (`201`, doublon `409`), suppression (`204`, identifiant mal formé `400`, année inconnue `404`). Aucune année n'est créée par le code.
- `auth/` : compte d'administration unique (collection `admins`, mot de passe haché en Argon2id) ; `POST /api/v1/auth/login` (jeton JWT HS256, 8 heures au plus, même `401` pour un email inconnu et un mot de passe faux, limité à 5 demandes par minute et par adresse IP) ; `GET /api/v1/auth/me` ; deux gardes, `JwtAuthGuard` et `RolesGuard` avec `@Roles('ADMIN')`, posées sur la classe de chaque contrôleur d'administration. Le compte se crée et son mot de passe se change **uniquement** par `npm run seed:admin --workspace=api`, qui lit `ADMIN_EMAIL` et `ADMIN_PASSWORD` placés temporairement dans `apps/api/.env` ; l'API ne les lit jamais.
- `common/pipes/parse-object-id.pipe.ts` : identifiant mal formé, `400` « Identifiant invalide. ».
- `members/` : un module pour deux modèles (spec `specs/004-members/`). **Member** : prénom, nom, profession ou études, email et téléphone (internes, jamais publics) ; pas de portrait avant le stockage de fichiers. **MemberMandate** : la présence d'un membre une année Rotary, avec ses fonctions (`roles[]`, parmi les dix de `common/enums/member-role.enum.ts`) et son ordre d'affichage ; un seul mandat par couple (membre, année), un ordre unique par année. Administration sous `/api/v1/admin/members` (liste paginée, fiche avec tous les mandats, création, modification où `null` efface un champ facultatif, suppression qui emporte les mandats) et `/api/v1/admin/mandates` (liste, création avec ordre attribué automatiquement, modification des fonctions et de l'ordre, suppression, `PUT order` pour réordonner une année). Lecture publique : `GET /api/v1/members` (annuaire d'une année, année courante par défaut, liste vide si elle n'existe pas) et `GET /api/v1/members/years`.
- `common/dto/pagination-query.dto.ts` : contrat commun des listes paginées (`page`, `limit` de 20 par défaut, 100 au plus).
- `actions/` : le modèle **Action** (spec `specs/005-actions/`) — titre, slug unique, résumé, description, date, année Rotary choisie par l'administrateur et jamais déduite de la date, domaines d'action (`focusAreas[]`, parmi les sept de `common/enums/focus-area.enum.ts`), impact facultatif embarqué, état de publication, ordre manuel facultatif. Administration sous `/api/v1/admin/actions` (liste paginée avec recherche, filtres et tri, consultation, création, modification qui publie et dépublie aussi, suppression). Lecture publique des seules actions publiées : `GET /api/v1/actions` (paginée ; tri par ordre quand il existe, puis date décroissante), `GET /api/v1/actions/years`, `GET /api/v1/actions/:slug`. Pas de photographies avant le stockage de fichiers.
- `common/utils/slug.ts` : génération d'un slug depuis un titre, utilisée par les actions et les actualités.
- `news/` : le modèle **News** (spec `specs/006-news/`, collection `news`) — titre, slug unique parmi les actualités, type parmi les cinq de `common/enums/news-type.enum.ts`, date et heure en un seul champ, année Rotary choisie par l'administrateur et jamais déduite de la date, lieu, résumé, contenu, état de publication. Entité distincte d'Action : ni impact, ni domaine, ni ordre manuel, ni mise « à la une ». Administration sous `/api/v1/admin/news` (liste paginée avec recherche, filtres et tri, consultation, création, modification qui publie et dépublie aussi, suppression). Lecture publique des seules actualités publiées : `GET /api/v1/news` (paginée, date décroissante), `GET /api/v1/news/archives` (une entrée par année Rotary, avec le nombre d'actualités publiées), `GET /api/v1/news/:slug`. Il n'existe pas de route `/news/years`. Pas de photographies avant le stockage de fichiers.
- `media/` : l'abstraction `StorageService` (envoyer, lire, supprimer un fichier) et son implémentation Cloudinary, `cloudinary-storage.service.ts`, **seul fichier du code qui connaît le fournisseur**. Appels signés, côté serveur seulement ; toute erreur du fournisseur devient une erreur de stockage sans détail, journalisée par son type.
- `applications/` : le modèle **Application** (spec `specs/007-applications/`) — prénom, nom, email, téléphone, situation (`applicantStatus` : `etudiant` ou `professionnel`, `common/enums/applicant-status.enum.ts`), CV (`common/schemas/file-ref.schema.ts`) et date de candidature. Ni état de traitement, ni modification. Dépôt public `POST /api/v1/applications` en `multipart/form-data` (répond `{ "received": true }`, 20 demandes par heure et par adresse IP). Administration sous `/api/v1/admin/applications` : liste paginée (recherche, période, tri), fiche, CV renvoyé par l'API en téléchargement, suppression qui retire aussi le fichier. Aucune lecture publique ; aucune référence de stockage dans les réponses.
- `apps/api/.env.example` liste les neuf variables, sans valeur. `apps/api/.env` est local et ignoré par Git.

État : le code du socle est **implémenté** ; la **configuration** réelle (`apps/api/.env`) et le cluster MongoDB Atlas sont des **opérations manuelles** du porteur du projet, faites ; le socle a été vérifié contre Atlas (`specs/001-api-foundation/tasks.md`, T011, T016, T026). `PORT` absente ou vide vaut 4000.

Sept collections : `rotaryyears`, `admins`, `members`, `membermandates`, `actions`, `news`, `applications`. Aucune gestion des comptes, aucun jeton de rafraîchissement. Une année Rotary référencée par un mandat, une action ou une actualité, brouillon compris, ne peut pas être supprimée (`409`). `JWT_EXPIRES_IN` : défaut `8h`, durée strictement positive et de 8 heures au plus, sinon l'API refuse de démarrer. La suite de la structure est décrite dans `ARCHITECTURE.md`, section 5.

## 4. Stack technique

| Élément | Version constatée |
|---|---|
| Node.js (poste local) | 22.18.0 |
| npm (poste local) | 10.9.3 |
| Next.js (`web`, `admin`) | 16.3.8 (version figée) |
| React / React DOM | 19.2.8 (version figée) |
| TypeScript (`web`, `admin`) | `^5` |
| ESLint (`web`, `admin`) | `^9` + `eslint-config-next` 16.3.8 |
| NestJS (`api`) | `^12`, plateforme Express |
| TypeScript (`api`) | `^6` |
| Lint / format (`api`) | oxlint, Prettier |
| MUI (`admin`) | `@mui/material`, `@mui/icons-material`, `@mui/material-nextjs` `^9` ; `@emotion/react`, `@emotion/styled`, `@emotion/cache` `^11` |
| Configuration (`api`) | `@nestjs/config` `^12` |
| Validation (`api`) | `class-validator` `^0.15`, `class-transformer` `^0.5` |
| En-têtes de sécurité (`api`) | `helmet` `^8` |
| Jeton (`api`) | `@nestjs/jwt` `^12` |
| Hachage du mot de passe (`api`) | `argon2` `^0.45` (module natif, binaire précompilé) |
| Limitation de fréquence (`api`) | `@nestjs/throttler` `^6`, sur la connexion et sur le dépôt d'une candidature, route par route |
| Stockage des CV (`api`) | `cloudinary` `^2` (client officiel) — compte et `apps/api/.env` renseignés à la main par le porteur du projet |
| Réception de fichiers (`api`) | intercepteur de fichier de `@nestjs/platform-express` (`multer`), déjà présent ; en mémoire |
| Base de données | MongoDB Atlas Free — connexion implémentée dans l'API ; cluster et `apps/api/.env` créés à la main par le porteur du projet ; connexion à Atlas vérifiée |
| ODM | Mongoose `^9` + `@nestjs/mongoose` `^12` — installés, aucun modèle |
| Authentification | JWT HS256, un seul rôle `ADMIN` — en place dans l'API ; le Back Office range le jeton dans un cookie `httpOnly`, `Secure`, `SameSite=Lax` |

### Configurations TypeScript

| Option | `web` / `admin` | `api` |
|---|---|---|
| `target` | ES2017 | ES2023 |
| `module` / `moduleResolution` | esnext / bundler | nodenext / nodenext |
| `strict` | oui | oui (`strictPropertyInitialization: false`) |
| Émission | `noEmit` | `outDir: ./dist`, `declaration`, `sourceMap` |
| Décorateurs | — | `experimentalDecorators`, `emitDecoratorMetadata` |

### Scripts npm

| Niveau | Scripts |
|---|---|
| Racine | `dev` (les trois apps en parallèle), `dev:web`, `dev:admin`, `dev:api`, `build`, `build:web`, `build:admin`, `build:api`, `lint` |
| `web`, `admin` | `dev`, `build`, `start`, `lint` |
| `api` | `build`, `start`, `start:dev`, `start:debug`, `start:prod`, `lint`, `format` |

Le script racine `dev` repose sur le shell (`&` + `wait`) : il fonctionne sous Linux/macOS, pas sous `cmd.exe`.

### Ports de développement

| App | Port | Mécanisme |
|---|---|---|
| `web` | 3000 | `next dev -p 3000` |
| `admin` | 3001 | `next dev -p 3001` |
| `api` | 4000 | variable `PORT`, défaut 4000 (`config/env.validation.ts`) |

## 5. Contraintes techniques

- Gestionnaire de paquets : **npm** uniquement (workspaces natifs, sans Turborepo/Nx).
- **Node.js 22** (`.nvmrc`, `engines` racine `>=22 <23`).
- Chaque application conserve son propre `node_modules`.
- **TypeScript** partout.
- Base de données : **MongoDB Atlas Free**.
- Authentification : **JWT**. Un seul rôle : **`ADMIN`**.
- Back Office : **Next.js + MUI**.
- **Pas de Docker**.
- Hébergement visé plus tard : Front Office et Back Office sur **Vercel**, backend sur **Render**.
- Interface publique **en français** pour la première version ; architecture à préparer pour français + anglais, **sans implémenter l'anglais**.
- Aucun secret dans le code ni dans Git.

## 6. Contraintes de développement

- **Pas de tests automatisés** (ni unitaires, ni intégration, ni E2E).
- **Pas de CI/CD** pour le moment.
- **Déploiement hors périmètre** pour l'instant.
- Ne pas ajouter de dépendances inutiles ; toute dépendance listée dans `ARCHITECTURE.md` s'installe à l'étape qui en a besoin, pas avant.
- Ne pas refondre la structure existante.
- Avancer par étapes explicitement demandées ; ne rien anticiper.
- Rien n'est inventé : ni contenu, ni chiffre, ni donnée historique.

## 7. Conventions

- Arborescence `apps/<nom>` pour les applications, `packages/` pour le code partagé.
- Next.js : App Router sous `src/app`, CSS Modules, alias `@/*`.
- NestJS : structure module / controller / service, fichiers `*.controller.ts`, `*.service.ts`, `*.module.ts`.
- Style de code : guillemets doubles côté Next.js, guillemets simples + virgules finales côté API (`.prettierrc`).
- Lint : ESLint (flat config) côté Next.js, oxlint côté API.
- Commits : Conventional Commits avec scope (ex. `feat(web): …`).
- Fichiers d'environnement ignorés par Git (`.env`, `.env.*`), à l'exception de `.env.example`.

## 8. Décisions prises

- Monorepo npm workspaces avec trois applications séparées, lockfile unique, `node_modules` par application.
- Ports fixes : web 3000, admin 3001, api 4000. Node.js 22.
- Front Office et Back Office : deux applications Next.js distinctes. Backend NestJS distinct, consommé par les deux.
- npm, TypeScript, MongoDB Atlas Free, JWT, rôle unique `ADMIN`, MUI pour le Back Office.
- Pas de Docker, pas de tests automatisés, pas de CI/CD.
- Français seul en V1, avec une architecture prête pour l'anglais.
- Cibles d'hébergement : Vercel (fronts) et Render (API).
- **Design du Front Office** : `DESIGN.md` en est la source de vérité (éditorial premium, concept « Le journal du club », palette Rotary hiérarchisée, Open Sans et Georgia, pas de mode sombre en V1, WCAG 2.2 AA). Il vaut pour toutes les pages.
- **Modèle métier** : Action et Actualité sont deux entités distinctes ; la fonction d'un membre n'est pas une propriété du membre mais d'un mandat par année Rotary, qui peut porter plusieurs fonctions ; une candidature est simplement enregistrée, **sans workflow de statut**.
- **Fichiers** : le CV des candidatures est conservé chez Cloudinary (fichier brut, accès authentifié, sans adresse publique), derrière l'abstraction `StorageService` ; le fournisseur des images n'est pas choisi. Une candidature et son CV restent jusqu'à leur suppression par l'administrateur : aucune suppression automatique. CV : PDF, DOC ou DOCX, 5 Mo au plus.

## 9. Décisions encore ouvertes

Les décisions techniques verrouillées (Mongoose, mandats en collection séparée, slugs, pagination, compte `ADMIN` unique créé par script, JWT HS256 de 8 heures avec Argon2id, préfixe `/api/v1`, cinq types d'actualité, année Rotary explicite sur les contenus, impact optionnel sans faux contenu, aspect fonctionnel du Back Office, dates du Back Office en heure de Madagascar) sont listées dans `ARCHITECTURE.md`, section 14.

Restent ouvertes :

- fournisseur de stockage des images et chemin d'envoi des fichiers ;
- sort du registre d'impact agrégé de la page Actions (il affiche encore « Donnée à venir », ce que la décision sur l'impact interdit : `DESIGN.md` et le Front Office seront alignés à la migration) ;
- limite de taille des images, cache du Front Office, anti-spam du formulaire (au-delà de la limite de fréquence).

Autres points repoussés : contenu de `packages/` ; solution d'internationalisation ; famille d'icônes du Front Office ; déploiement et CI/CD.

## 10. Périmètre et prochaines étapes

**Fait** : fondations du monorepo ; direction design ; Front Office V1 (cinq pages, responsive, accessible, sur données locales) ; spécification de l'architecture Backend et Back Office ; socle de l'API (configuration, MongoDB, validation, erreurs, route de santé) ; années Rotary (modèle, calculs, liste publique, administration) ; authentification de l'administrateur (compte par commande manuelle, connexion, jeton, gardes, limitation des tentatives) ; membres et mandats (administration, ordre par année, annuaire public) ; actions (administration, slug, publication, impact, lectures publiques) ; actualités (administration, slug, publication, lectures publiques, archives par année) ; candidatures (dépôt public avec CV, consultation, téléchargement du CV, suppression, stockage du CV chez Cloudinary) ; Back Office (connexion et session, navigation, années Rotary, membres et mandats avec l'ordre d'une année, actions, actualités en heure de Madagascar, candidatures).

**Prochaines étapes**, chacune sur demande explicite, selon `ARCHITECTURE.md` :

1. stockage des images (portrait des membres, photographies des actions et des actualités), puis leur saisie dans le Back Office ;
2. connexion du Front Office à l'API.

**Hors périmètre pour l'instant** : tests, CI/CD, Docker, déploiement, version anglaise, rôles autres que `ADMIN`, workflow de candidature.

## 11. Points d'attention

- **TypeScript** : 5.x pour `web`/`admin`, 6.x pour `api`. Avec l'installation sans hoisting, c'est une des raisons de ne pas partager de types entre applications pour l'instant.
- **`@types/node`** : `^20` pour `web`/`admin`, `^24` pour `api`, alors que le projet cible Node 22.
- **Node 22.18.0 local** : `@nestjs/cli` 12 demande Node `^22.22.3` ; `npm install` affiche des avertissements `EBADENGINE` sans conséquence constatée.
- **Next.js 16** : des conventions ont changé (par exemple `proxy.ts` remplace `middleware.ts`). Consulter `node_modules/next/dist/docs/` avant d'écrire du code Next.js.
- `apps/web` et `apps/admin` téléchargent Open Sans au build (`next/font/google`).
- `next dev` génère `AGENTS.md` et `CLAUDE.md` dans `apps/web` et `apps/admin`.
- Les README de `apps/*` sont ceux des gabarits.
- `apps/api/.env.example` existe ; l'API refuse de démarrer sans `apps/api/.env` valide (`MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) ni sans base joignable. `apps/admin/.env.example` porte le nom `API_URL` ; `apps/admin/.env.local` se crée à la main. `apps/web` n'a pas encore de `.env.example`.
- **Compte d'administration** : un seul, créé par `npm run seed:admin --workspace=api`. `ADMIN_EMAIL` et `ADMIN_PASSWORD` ne restent dans `apps/api/.env` que le temps de la commande. Relancée avec un autre email, la commande refuse ; changer d'email demande de retirer le compte à la main dans la base. Un changement de mot de passe n'invalide pas les jetons déjà délivrés ; seul un changement de `JWT_SECRET` les invalide tous.
- **Suppression d'une année Rotary** : refusée (`409`) quand un mandat, une action ou une actualité la référence. Toute entité future qui référence une année ajoute son contrôle au même endroit (`rotary-years.service.ts`).
- **Slug d'une actualité** : mêmes règles que pour une action, avec sa propre unicité (une action et une actualité peuvent partager un slug) et son propre slug réservé, `archives`, qui désigne la route `/news/archives` : la génération donne `archives-2`, et fourni explicitement il est refusé (« Ce slug est réservé. »). `years` n'est réservé que pour les actions.
- **Publication d'une actualité** : même règle que pour une action — `publishedAt` posé à la première publication, jamais réécrit, égal à `createdAt` pour une création publiée, jamais accepté en entrée.
- **Archives des actualités** : calculées à la lecture, en comptant les seules actualités publiées ; dépublier une actualité fait baisser le nombre de son année.
- **Divergences du Front Office sur les actualités** : il déduit l'année de la date et attend `body` (paragraphes) là où l'API renvoie l'année explicite et `content` (texte) ; `DESIGN.md` montre une actualité « à la une » qu'aucun champ ne désigne. Sujets de migration du Front Office.
- **Slug d'une action** : généré depuis le titre à la création seulement, avec suffixe `-2`, `-3` en cas de collision ; jamais régénéré quand le titre change ; un slug fourni déjà pris répond `409`. `years` est réservé à la route `/actions/years` : la génération donne `years-2`, et fourni explicitement il est refusé (« Ce slug est réservé. »).
- **Publication d'une action** : `publishedAt` est posé à la première publication et n'est jamais réécrit ; une action créée publiée le reçoit égal à sa date de création. Ni transaction ni verrou : la V1 suppose un seul administrateur.
- **Tri public des actions** : fait par une agrégation, parce qu'un tri simple placerait en tête les actions sans ordre. L'ordre est global, facultatif, non unique ; il n'existe aucune route de réordonnancement.
- **Impact d'une action** : une modification remplace l'objet entier ; un objet sans rubrique n'est pas enregistré ; le champ est absent des réponses quand il est vide.
- **Registre d'impact de la page Actions : contradiction toujours ouverte.** `DESIGN.md`, section 10, prescrit la mention « Donnée à venir » ; `ARCHITECTURE.md` décide « pas de donnée, pas de section ». L'API suit `ARCHITECTURE.md`. À traiter à la migration du Front Office, en corrigeant `DESIGN.md` d'abord ; le registre agrégé lui-même n'a toujours pas d'entité.
- **Code dupliqué, par décision** : le retrait des espaces et la contrainte « label d'année » existent dans `members/dto/`, `actions/dto/` et `news/dto/` (le retrait des espaces et le motif du téléphone aussi dans `applications/dto/`) ; la logique de slug du service (suffixe libre, slug réservé, nouvelles tentatives) et la mise en forme d'une année existent dans `actions.service.ts` et `news.service.ts`. Le porteur du projet a choisi de ne pas refactorer les fonctionnalités validées. Un regroupement dans `common/` reste possible, comme étape à part.
- **Réordonnancement des mandats d'une année** : seule opération de l'API faite dans une transaction MongoDB (le cluster Atlas est un jeu de réplicas). Les ordres passent en négatif puis prennent leur place de 1 à n, pour ne jamais heurter l'index unique ; en cas d'échec, rien n'est modifié. Échanger deux ordres passe par ce réordonnancement : modifier un seul mandat vers un ordre déjà pris est refusé.
- **Messages de conflit** : mandat en double, ordre déjà pris et année utilisée répondent tous le `409` générique « Conflit avec une ressource existante. » ; le Back Office les distingue par l'opération demandée, avec ses propres messages (`specs/008-back-office/contracts/screens.md`).
- **Références dans les schémas Mongoose** : déclarer le type `SchemaTypes.ObjectId`, pas `Types.ObjectId`, sans quoi l'identifiant est enregistré en texte et les recherches par référence ne trouvent rien.
- **Suppression et référence concurrentes** : les contrôles d'existence ne sont pas dans une transaction ; avec un seul administrateur, le risque d'un mandat orphelin est théorique et accepté pour la V1.
- **CV chez un prestataire extérieur** : le CV et son nom d'origine sont des données personnelles confiées à Cloudinary. Le fichier y est déposé sous un identifiant aléatoire, sans nom de candidat, et n'a aucune adresse publique ; il ne se lit que par l'API, avec un jeton d'administrateur.
- **Cohérence entre la base et le stockage** : il n'existe pas de transaction entre MongoDB et Cloudinary. Au dépôt, le fichier n'est envoyé qu'après toutes les vérifications ; si l'enregistrement échoue ensuite, le fichier est retiré, et si ce retrait échoue son identifiant est journalisé. À la suppression, le fichier part d'abord : stockage indisponible, `503` et la candidature est conservée ; fichier déjà absent, la candidature est supprimée quand même (`204`) et le journal note le fait avec l'identifiant de la candidature. `404` pour un fichier disparu ne concerne que la lecture du CV.
- **Type du CV** : constaté par l'API sur les premiers octets, sans bibliothèque (`applications/cv-file.ts`) ; l'extension doit concorder. La signature DOC est celle de tous les anciens documents Office : un ancien classeur renommé en `.doc` passerait. Limite acceptée.
- **Limite de fréquence du dépôt** : 20 par heure et par adresse IP, compteur en mémoire, distinct de celui de la connexion, remis à zéro au redémarrage. Le formulaire sera envoyé par le serveur du Front Office : tous les visiteurs partageront alors le même compteur.
- **Messages de réception de fichier** : NestJS produit des messages anglais pour un fichier trop lourd ou mal placé ; `applications/cv-upload.interceptor.ts` les remplace, sans toucher au filtre commun.
- **Divergences du Front Office sur les candidatures** : le formulaire nomme la situation `status` (l'API attend `applicantStatus`) et accepte tout téléphone d'au moins 8 chiffres, là où l'API n'admet que chiffres, espaces, `+`, `-`, `.` et parenthèses. Sujets de migration du Front Office.
- **Réglages Cloudinary** : sur un compte gratuit, la livraison des fichiers PDF peut être bloquée par un réglage de sécurité du compte ; à activer si la lecture d'un CV PDF est refusée.
- **Limitation des tentatives de connexion** : par adresse IP vue par l'API. Derrière un hébergeur, il faudra déclarer le mandataire de confiance au déploiement.
- Le journal de l'API ne doit contenir aucun nom d'hôte, adresse ni identifiant de la base : le journal de démarrage est filtré dans `main.ts` (classe `StartupLogger`, locale, à ne pas généraliser) et le filtre d'erreurs ne journalise jamais le message d'une erreur interne.
- **Cookie de session du Back Office** : `Secure` partout, y compris en local. Chrome et Firefox l'acceptent sur `http://localhost` ; Safari non : la vérification locale se fait avec Chrome ou Firefox.
- **Fuseau des actualités** : saisies et affichées en heure de Madagascar dans le Back Office, enregistrées en temps universel. Le Front Office affiche encore les dates en temps universel : à sa migration, il devra afficher celle des actualités dans le fuseau approprié. Les années Rotary sont bornées en temps universel : une actualité du 1er juillet avant 3 heures, heure de Madagascar, tombe dans l'année précédente selon l'API ; le Back Office le signale sans corriger.
- **`@emotion/cache`** : sixième dépendance du Back Office, non prévue à l'origine. C'est une dépendance paire obligatoire de `@mui/material-nextjs` ; avec l'installation sans hoisting, elle n'est pas résolue si elle n'est pas déclarée.
- **Journal de développement du Back Office** : `next dev` journalise par défaut les adresses appelées et les arguments des Server Actions, qui peuvent porter des données personnelles ; `apps/admin/next.config.ts` désactive ces deux journaux.
- **Limite des connexions vue du Back Office** : c'est le serveur du Back Office qui appelle `POST /auth/login` ; l'API voit donc son adresse, et la limite de 5 par minute est partagée par tous ceux qui se connectent par lui.
- **Lecture d'un CV volumineux** : le stockage borne chaque appel à 10 secondes ; sur une liaison lente, un CV de 5 Mo peut dépasser ce délai. Le Back Office affiche alors « Service indisponible. » et permet de réessayer.
- Le Front Office affiche encore des contenus provisoires à remplacer avant mise en ligne (texte de présentation du club, photographies, adresses des réseaux sociaux).
