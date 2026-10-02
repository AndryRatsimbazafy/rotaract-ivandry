# PROJECT_CONTEXT — Rotaract Club Ivandry

> Document de référence du projet. État au 2026-10-01 : le Front Office V1 est terminé et audité (données locales, aucune connexion à l'API) ; l'architecture du Backend et du Back Office est spécifiée dans `ARCHITECTURE.md`, ses décisions principales sont verrouillées ; le socle de l'API (`apps/api`) est en place, avec l'authentification de l'administrateur et une première ressource métier, les années Rotary, administrable ; `apps/admin` est encore le gabarit d'origine.

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
│   ├── admin/    Back Office — Next.js (App Router) + TypeScript, MUI prévu — gabarit
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

### apps/admin — Back Office (gabarit)

Gabarit `create-next-app` intact : page d'accueil du gabarit, polices Geist, `lang="fr"`, titre « Administration — Rotaract Club Ivandry ». MUI n'est pas installé. La structure prévue est décrite dans `ARCHITECTURE.md`, section 11.

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
- `apps/api/.env.example` liste les six variables, sans valeur. `apps/api/.env` est local et ignoré par Git.

État : le code du socle est **implémenté** ; la **configuration** réelle (`apps/api/.env`) et le cluster MongoDB Atlas sont des **opérations manuelles** du porteur du projet, faites ; le socle a été vérifié contre Atlas (`specs/001-api-foundation/tasks.md`, T011, T016, T026). `PORT` absente ou vide vaut 4000.

Deux collections : `rotaryyears` et `admins`. Aucun autre module métier, aucune gestion des comptes, aucun jeton de rafraîchissement. `JWT_EXPIRES_IN` : défaut `8h`, durée strictement positive et de 8 heures au plus, sinon l'API refuse de démarrer. La suite de la structure est décrite dans `ARCHITECTURE.md`, section 5.

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
| MUI (`admin`) | prévu — non installé |
| Configuration (`api`) | `@nestjs/config` `^12` |
| Validation (`api`) | `class-validator` `^0.15`, `class-transformer` `^0.5` |
| En-têtes de sécurité (`api`) | `helmet` `^8` |
| Jeton (`api`) | `@nestjs/jwt` `^12` |
| Hachage du mot de passe (`api`) | `argon2` `^0.45` (module natif, binaire précompilé) |
| Limitation de fréquence (`api`) | `@nestjs/throttler` `^6`, sur la connexion seulement |
| Base de données | MongoDB Atlas Free — connexion implémentée dans l'API ; cluster et `apps/api/.env` créés à la main par le porteur du projet ; connexion à Atlas vérifiée |
| ODM | Mongoose `^9` + `@nestjs/mongoose` `^12` — installés, aucun modèle |
| Authentification | JWT HS256, un seul rôle `ADMIN` — en place dans l'API ; le Back Office ne s'en sert pas encore |

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
- **Fichiers** : le fournisseur de stockage n'est pas choisi ; les modèles restent indépendants de tout fournisseur.

## 9. Décisions encore ouvertes

Les décisions techniques verrouillées (Mongoose, mandats en collection séparée, slugs, pagination, compte `ADMIN` unique créé par script, JWT HS256 de 8 heures avec Argon2id, préfixe `/api/v1`, cinq types d'actualité, année Rotary explicite sur les contenus, impact optionnel sans faux contenu) sont listées dans `ARCHITECTURE.md`, section 14.

Restent ouvertes :

- fournisseur de stockage des images et chemin d'envoi des fichiers ;
- stockage des CV et durée de conservation des candidatures ;
- sort du registre d'impact agrégé de la page Actions (il affiche encore « Donnée à venir », ce que la décision sur l'impact interdit : `DESIGN.md` et le Front Office seront alignés à la migration) ;
- limites de taille des fichiers, cache du Front Office, anti-spam du formulaire.

Autres points repoussés : contenu de `packages/` ; solution d'internationalisation ; spécification visuelle du Back Office ; famille d'icônes du Front Office ; déploiement et CI/CD.

## 10. Périmètre et prochaines étapes

**Fait** : fondations du monorepo ; direction design ; Front Office V1 (cinq pages, responsive, accessible, sur données locales) ; spécification de l'architecture Backend et Back Office ; socle de l'API (configuration, MongoDB, validation, erreurs, route de santé) ; années Rotary (modèle, calculs, liste publique, administration) ; authentification de l'administrateur (compte par commande manuelle, connexion, jeton, gardes, limitation des tentatives).

**Prochaines étapes**, chacune sur demande explicite, selon `ARCHITECTURE.md` :

1. membres et mandats ;
2. actions, actualités ;
3. stockage de fichiers, candidatures ;
4. socle du Back Office (MUI, connexion, session, client API) ;
5. écrans du Back Office ;
6. connexion du Front Office à l'API.

**Hors périmètre pour l'instant** : tests, CI/CD, Docker, déploiement, version anglaise, rôles autres que `ADMIN`, workflow de candidature.

## 11. Points d'attention

- **TypeScript** : 5.x pour `web`/`admin`, 6.x pour `api`. Avec l'installation sans hoisting, c'est une des raisons de ne pas partager de types entre applications pour l'instant.
- **`@types/node`** : `^20` pour `web`/`admin`, `^24` pour `api`, alors que le projet cible Node 22.
- **Node 22.18.0 local** : `@nestjs/cli` 12 demande Node `^22.22.3` ; `npm install` affiche des avertissements `EBADENGINE` sans conséquence constatée.
- **Next.js 16** : des conventions ont changé (par exemple `proxy.ts` remplace `middleware.ts`). Consulter `node_modules/next/dist/docs/` avant d'écrire du code Next.js.
- `apps/web` télécharge Open Sans au build (`next/font/google`). `apps/admin` charge encore les polices Geist du gabarit.
- `next dev` génère `AGENTS.md` et `CLAUDE.md` dans `apps/web` et `apps/admin`.
- Les README de `apps/*` sont ceux des gabarits.
- `apps/api/.env.example` existe ; l'API refuse de démarrer sans `apps/api/.env` valide (`MONGODB_URI`, `JWT_SECRET`) ni sans base joignable. Les autres applications n'ont pas encore de `.env.example`.
- **Compte d'administration** : un seul, créé par `npm run seed:admin --workspace=api`. `ADMIN_EMAIL` et `ADMIN_PASSWORD` ne restent dans `apps/api/.env` que le temps de la commande. Relancée avec un autre email, la commande refuse ; changer d'email demande de retirer le compte à la main dans la base. Un changement de mot de passe n'invalide pas les jetons déjà délivrés ; seul un changement de `JWT_SECRET` les invalide tous.
- **Suppression d'une année Rotary** : aucune entité ne référence encore une année, donc toute année est supprimable. Chaque fonctionnalité qui introduit une référence (mandats, actions, actualités) doit ajouter son refus `409`.
- **Limitation des tentatives de connexion** : par adresse IP vue par l'API. Derrière un hébergeur, il faudra déclarer le mandataire de confiance au déploiement.
- Le journal de l'API ne doit contenir aucun nom d'hôte, adresse ni identifiant de la base : le journal de démarrage est filtré dans `main.ts` (classe `StartupLogger`, locale, à ne pas généraliser) et le filtre d'erreurs ne journalise jamais le message d'une erreur interne.
- Le Front Office affiche encore des contenus provisoires à remplacer avant mise en ligne (texte de présentation du club, photographies, adresses des réseaux sociaux).
