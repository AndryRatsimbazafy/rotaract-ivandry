# PROJECT_CONTEXT — Rotaract Club Ivandry

> Document de référence du projet. État au 2026-10-01, après la mise en place des fondations du monorepo, de l'architecture du Front Office et de sa page d'accueil (données provisoires, aucune connexion à l'API).

## 1. Objectif du projet

Site web du **Rotaract Club Ivandry**, composé de :

- un **Front Office** public (vitrine du club) ;
- un **Back Office** d'administration réservé aux administrateurs ;
- une **API** backend servant les deux interfaces.

## 2. Architecture actuelle

```
rotaract-ivandry/
├── package.json        racine du workspace npm (scripts d'orchestration, engines)
├── package-lock.json   lockfile unique du workspace
├── .npmrc              install-strategy=nested
├── .nvmrc              22
├── .gitignore
├── README.md
├── PROJECT_CONTEXT.md
├── DESIGN.md           référence officielle du design du Front Office
├── apps/
│   ├── web/      Front Office public — Next.js (App Router) + TypeScript
│   ├── admin/    Back Office — Next.js (App Router) + TypeScript
│   └── api/      Backend — NestJS + TypeScript
└── packages/     réservé aux packages partagés futurs (vide, `.gitkeep`)
```

- Monorepo **npm workspaces** (`apps/*`, `packages/*`) avec un seul `package-lock.json` à la racine.
- Les trois applications restent **indépendantes au niveau de leurs dépendances** : chacune a son `package.json` et son propre `node_modules`. Le `.npmrc` racine (`install-strategy=nested`) désactive le hoisting ; le `node_modules` racine ne contient que les liens vers les workspaces.
- `npm install` se lance **depuis la racine**.
- Un seul dépôt Git à la racine (pas de dépôt imbriqué dans les apps).

### apps/web et apps/admin

Gabarits `create-next-app` quasi intacts :

- `src/app/` (App Router) : `layout.tsx`, `page.tsx`, `globals.css`, `page.module.css` ;
- CSS Modules (pas de Tailwind) ;
- alias d'import `@/*` → `./src/*` ;
- `next.config.ts` vide (aucune option) ;
- `layout.tsx` : `lang="fr"`, titres provisoires « Rotaract Club Ivandry » (web) et « Administration — Rotaract Club Ivandry » (admin) ;
- `eslint.config.mjs` (flat config, `eslint-config-next` core-web-vitals + typescript).

### apps/api

Gabarit `nest new`, débarrassé de l'outillage de test et de déploiement du gabarit :

- `src/` : `main.ts`, `app.module.ts`, `app.controller.ts`, `app.service.ts` ;
- `nest-cli.json` : `sourceRoot: src`, `deleteOutDir: true` ;
- `tsconfig.json` + `tsconfig.build.json`, sortie dans `dist/` ;
- lint via `oxlint.json`, formatage via `.prettierrc`.

## 3. Stack technique

| Élément | Version constatée |
|---|---|
| Node.js (poste local) | 22.18.0 |
| npm (poste local) | 10.9.3 |
| Next.js (`web`, `admin`) | 16.3.8 (version figée) |
| React / React DOM | 19.2.8 (version figée) |
| TypeScript (`web`, `admin`) | `^5` → 5.9.3 installé |
| ESLint (`web`, `admin`) | `^9` + `eslint-config-next` 16.3.8 |
| NestJS (`api`) | `^12.0.1` → 12.1.2 installé, plateforme Express |
| TypeScript (`api`) | `^6.0.2` → 6.0.3 installé |
| Lint / format (`api`) | oxlint `^1.58.0`, Prettier `^3.4.2` |
| Base de données (prévue) | MongoDB Atlas Free — non installée |
| Authentification (prévue) | JWT — non installée |

### Configurations TypeScript

| Option | `web` / `admin` | `api` |
|---|---|---|
| `target` | ES2017 | ES2023 |
| `module` / `moduleResolution` | esnext / bundler | nodenext / nodenext |
| `strict` | oui | oui (`strictPropertyInitialization: false`) |
| Émission | `noEmit` | `outDir: ./dist`, `declaration`, `sourceMap` |
| Décorateurs | — | `experimentalDecorators`, `emitDecoratorMetadata` |
| Divers | `jsx: react-jsx`, `allowJs`, alias `@/*` | `types: ["node"]` |

### Scripts npm disponibles

| Niveau | Scripts |
|---|---|
| Racine | `dev` (les trois apps en parallèle), `dev:web`, `dev:admin`, `dev:api`, `build`, `build:web`, `build:admin`, `build:api`, `lint` |
| `web`, `admin` | `dev`, `build`, `start`, `lint` |
| `api` | `build`, `start`, `start:dev`, `start:debug`, `start:prod`, `lint`, `format` |

Le script racine `dev` repose sur le shell (`&` + `wait`) : il fonctionne sous Linux/macOS, pas sous `cmd.exe`.

### Ports de développement

| App | Port | Mécanisme |
|---|---|---|
| `web` | 3000 | `next dev -p 3000` / `next start -p 3000` |
| `admin` | 3001 | `next dev -p 3001` / `next start -p 3001` |
| `api` | 4000 | `process.env.PORT ?? 4000` dans `main.ts` |

## 4. Contraintes techniques

- Gestionnaire de paquets : **npm** uniquement (workspaces natifs, sans Turborepo/Nx).
- **Node.js 22** (`.nvmrc`, `engines` racine `>=22 <23`).
- Chaque application conserve son propre `node_modules`.
- **TypeScript** partout.
- Base de données : **MongoDB Atlas Free**.
- Authentification : **JWT**.
- Un seul rôle : **`ADMIN`**.
- **Pas de Docker**.
- Hébergement visé plus tard : Front Office et Back Office sur **Vercel**, backend sur **Render**.
- Interface publique **en français** pour la première version ; architecture à préparer pour français + anglais, **sans implémenter l'anglais**.

## 5. Contraintes de développement

- **Pas de tests automatisés** (ni unitaires, ni intégration, ni E2E).
- **Pas de CI/CD** pour le moment.
- **Déploiement hors périmètre** pour l'instant.
- Ne pas ajouter de dépendances inutiles.
- Ne pas refondre la structure existante.
- Avancer par étapes explicitement demandées ; ne rien anticiper (pages, modèles, auth, API, implémentation du design, composants UI métier).

## 6. Conventions déjà présentes

- Arborescence `apps/<nom>` pour les applications, `packages/` pour le code partagé.
- Next.js : App Router sous `src/app`, CSS Modules, alias `@/*`.
- NestJS : structure module / controller / service, fichiers `*.controller.ts`, `*.service.ts`, `*.module.ts`.
- Style de code : guillemets doubles côté Next.js (gabarit), guillemets simples + virgules finales côté API (`.prettierrc`).
- Lint : ESLint (flat config) côté Next.js, oxlint côté API.
- Commits : format Conventional Commits avec scope (ex. `feat(web): …`).
- Fichiers d'environnement ignorés par Git (`.env`, `.env.*`), à l'exception de `.env.example`.

## 7. Décisions prises

- Monorepo npm workspaces avec trois applications séparées (`web`, `admin`, `api`), lockfile unique, `node_modules` par application.
- Ports fixes : web 3000, admin 3001, api 4000.
- Node.js 22.
- Front Office et Back Office sont deux applications Next.js distinctes.
- Backend NestJS distinct, consommé par les deux fronts.
- npm, TypeScript, MongoDB Atlas Free, JWT, rôle unique `ADMIN`.
- Pas de Docker, pas de tests automatisés, pas de CI/CD.
- Français seul en V1, avec une architecture prête pour l'anglais.
- Cibles d'hébergement : Vercel (fronts) et Render (API).
- Direction design du Front Office : `DESIGN.md` en est la référence officielle. Deuxième version : éditorial premium, documentaire, association contemporaine (concept « Le journal du club », palette Rotary hiérarchisée, pas de mode sombre en V1, WCAG 2.2 AA). La Home en est la première mise en œuvre ; la direction s'applique à toutes les pages du Front Office.
- Typographie : Open Sans (police web variable, avec l'axe de largeur `wdth`) pour la structure, l'interface et les titres ; Georgia (police système, avec replis) pour le récit. Aucune autre police web en V1. Les polices Geist du gabarit ne sont plus la direction typographique.

## 8. Décisions volontairement repoussées

- Contenu de `packages/` (types partagés, configuration commune, etc.).
- Gestion des variables d'environnement (`.env.example`, URL de l'API, CORS).
- Choix de l'ODM / du driver MongoDB et modélisation des données.
- Mise en œuvre de l'authentification JWT.
- Solution d'internationalisation.
- Conception des pages Actions, Actualités, Membres et Rejoindre du Front Office ; famille d'icônes.
- Spécification design du Back Office.
- Déploiement, CI/CD.

## 9. Périmètre actuel et hors périmètre

**Périmètre actuel** : fondations techniques du monorepo (workspaces, lockfile, ports, nettoyage des gabarits) direction design du Front Office (`DESIGN.md`), et dans `apps/web` : cinq routes publiques, tokens et polices, page d'accueil conçue avec des emplacements provisoires.

**Hors périmètre pour l'instant** :

- code métier ;
- pages fonctionnelles ;
- modèles MongoDB ;
- authentification ;
- APIs ;
- conception des pages autres que l'accueil et connexion du Front Office à l'API ;
- ajout de dépendances ;
- refonte de la structure ;
- tests, CI/CD, Docker, déploiement ;
- version anglaise.

## 10. Points d'attention

- **TypeScript** : 5.x pour `web`/`admin`, 6.x pour `api`.
- **`@types/node`** : `^20` pour `web`/`admin`, `^24` pour `api`, alors que le projet cible Node 22.
- **Lint** : ESLint côté Next.js, oxlint côté API ; Prettier présent uniquement dans l'API.
- **Node 22.18.0 local** : `@nestjs/cli` 12 (via `@angular-devkit`) demande Node `^22.22.3` ; `npm install` affiche des avertissements `EBADENGINE` sans conséquence constatée. Une mise à jour vers le dernier Node 22 les supprime.
- `apps/web` charge Open Sans via `next/font/google` avec l'axe `wdth` (téléchargement réseau au build). `apps/admin` charge encore les polices Geist du gabarit.
- `next dev` génère `AGENTS.md` et `CLAUDE.md` dans `apps/web` et `apps/admin`.
- Les README de `apps/*` sont ceux des gabarits ; le README racine tient en deux lignes.
- Aucun fichier `.env.example` pour l'instant.
