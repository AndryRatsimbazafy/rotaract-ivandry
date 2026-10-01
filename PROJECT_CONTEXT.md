# PROJECT_CONTEXT — Rotaract Club Ivandry

> Document de référence du projet. État au 2026-10-01 : le Front Office V1 est terminé et audité (données locales, aucune connexion à l'API) ; l'architecture du Backend et du Back Office est spécifiée dans `ARCHITECTURE.md`, ses décisions principales sont verrouillées ; `apps/admin` et `apps/api` sont encore les gabarits d'origine.

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
│   └── api/      Backend — NestJS + TypeScript — gabarit
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

### apps/api — Backend (gabarit)

Gabarit `nest new`, débarrassé de l'outillage de test et de déploiement : `main.ts`, `app.module.ts`, `app.controller.ts`, `app.service.ts` (un `GET /` qui répond « Hello World! »). Aucune connexion à MongoDB, aucune authentification, aucun module métier. La structure prévue est décrite dans `ARCHITECTURE.md`, section 5.

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
| Base de données | MongoDB Atlas Free — non installée |
| ODM | Mongoose + `@nestjs/mongoose` — décidé, non installé |
| Authentification | JWT — non installée |

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
| `api` | 4000 | `process.env.PORT ?? 4000` dans `main.ts` |

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

**Fait** : fondations du monorepo ; direction design ; Front Office V1 (cinq pages, responsive, accessible, sur données locales) ; spécification de l'architecture Backend et Back Office.

**Prochaines étapes**, chacune sur demande explicite, selon `ARCHITECTURE.md` :

1. socle de l'API (configuration, MongoDB, validation, erreurs) ;
2. authentification et compte `ADMIN` ;
3. années Rotary, membres et mandats ;
4. actions, actualités ;
5. stockage de fichiers, candidatures ;
6. socle du Back Office (MUI, connexion, session, client API) ;
7. écrans du Back Office ;
8. connexion du Front Office à l'API.

**Hors périmètre pour l'instant** : tests, CI/CD, Docker, déploiement, version anglaise, rôles autres que `ADMIN`, workflow de candidature.

## 11. Points d'attention

- **TypeScript** : 5.x pour `web`/`admin`, 6.x pour `api`. Avec l'installation sans hoisting, c'est une des raisons de ne pas partager de types entre applications pour l'instant.
- **`@types/node`** : `^20` pour `web`/`admin`, `^24` pour `api`, alors que le projet cible Node 22.
- **Node 22.18.0 local** : `@nestjs/cli` 12 demande Node `^22.22.3` ; `npm install` affiche des avertissements `EBADENGINE` sans conséquence constatée.
- **Next.js 16** : des conventions ont changé (par exemple `proxy.ts` remplace `middleware.ts`). Consulter `node_modules/next/dist/docs/` avant d'écrire du code Next.js.
- `apps/web` télécharge Open Sans au build (`next/font/google`). `apps/admin` charge encore les polices Geist du gabarit.
- `next dev` génère `AGENTS.md` et `CLAUDE.md` dans `apps/web` et `apps/admin`.
- Les README de `apps/*` sont ceux des gabarits.
- Aucun fichier `.env.example` pour l'instant : ils seront créés avec le socle de l'API.
- Le Front Office affiche encore des contenus provisoires à remplacer avant mise en ligne (texte de présentation du club, photographies, adresses des réseaux sociaux).
