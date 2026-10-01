# Constitution — Rotaract Club Ivandry

Cette constitution fixe les principes de développement et les invariants du projet. Elle ne recopie ni l'architecture technique ni la direction artistique : elle renvoie aux documents qui les portent.

## Core Principles

### I. Source de vérité

- `ARCHITECTURE.md` est la référence pour l'architecture backend, les modèles métier, leurs relations, les API et les décisions techniques.
- `DESIGN.md` est la référence pour la direction artistique et le système visuel du Front Office.
- `PROJECT_CONTEXT.md` décrit le contexte global du projet.
- Une spec, un plan ou une liste de tâches MUST s'appuyer sur ces documents et MUST NOT les contredire.
- En cas de contradiction entre documents, ou entre un document et une demande, une résolution MUST NOT être inventée : la contradiction est signalée et une validation est demandée.

### II. Travail par étapes validées

- Le projet se développe fonctionnalité par fonctionnalité.
- Une spécification MUST être validée avant son plan ; un plan avant ses tâches ; les tâches avant l'implémentation.
- L'implémentation MUST NOT anticiper une fonctionnalité non validée.
- Plusieurs étapes importantes MUST NOT être enchaînées implicitement : chaque étape se termine par un arrêt et une demande de validation.

### III. Préférence pour le manuel

- Quand une opération simple peut être faite à la main de façon fiable, la solution manuelle est préférée.
- Un script, une automatisation, une abstraction ou une dépendance MUST NOT être créés dans le seul but d'automatiser une opération ponctuelle et simple.
- Toute automatisation MUST avoir une justification réelle : répétition, fiabilité, sécurité, ou réduction significative de la complexité. La justification est écrite dans le plan.

### IV. Simplicité technique

- TypeScript strict.
- Les solutions natives des frameworks déjà utilisés (Next.js, NestJS) sont préférées.
- Pas de dépendance supplémentaire sans besoin réel.
- Pas d'abstraction prématurée ; pas de système générique quand un besoin concret et limité suffit.

### V. Architecture backend

- NestJS pour l'API ; MongoDB Atlas Free ; Mongoose avec `@nestjs/mongoose`.
- L'API vit sous `/api/v1`.
- L'accès public et l'administration sont clairement séparés. Tout `/admin/*` MUST exiger une authentification JWT et le rôle `ADMIN`.
- Authentification : JWT HS256, durée de 8 heures, sans jeton de rafraîchissement.
- Les mots de passe `ADMIN` sont hachés avec Argon2id.
- Un seul compte `ADMIN` en V1, créé par script ; aucun écran de gestion des comptes.
- Le stockage de fichiers reste derrière `StorageService` ; aucun fournisseur concret n'est imposé à ce stade.

Le détail (collections, endpoints, contrats, variables d'environnement) est dans `ARCHITECTURE.md`.

### VI. Intégrité du modèle métier

- Les modèles et relations définis dans `ARCHITECTURE.md` MUST être respectés strictement.
- Une Action et une News portent chacune une référence explicite et obligatoire vers une RotaryYear.
- Une RotaryYear est identifiée par son `startYear` ; `label`, dates et `isCurrent` sont calculés.
- Les mandats sont séparés des membres.
- Un membre peut avoir plusieurs fonctions dans une même année, via `roles[]`.
- Les candidatures n'ont pas de workflow de statut en V1.

### VII. Front Office

- Le Front Office reste en français pour la V1.
- L'architecture MUST permettre l'anglais plus tard, sans l'implémenter maintenant.
- Le Front Office MUST NOT devenir un gabarit générique.
- Toute évolution visuelle MUST respecter `DESIGN.md`.
- Un composant, une mise en page ou un motif qui contredit la direction éditoriale validée MUST NOT être réintroduit.

### VIII. Qualité et contenu

- Aucun contenu métier inventé n'est présenté comme réel.
- Une donnée provisoire MUST être explicitement identifiée comme telle.
- Pas de faux indicateur ni de fausse statistique.
- Quand une donnée métier n'existe pas, aucune valeur n'est fabriquée pour remplir l'interface.
- Les cinq types de News en V1 sont : `evenement`, `participation`, `reunion`, `formation`, `annonce`.

### IX. Tests

- Aucun test automatisé n'est prévu en V1.
- Un framework de test, une configuration Jest, Vitest, Playwright ou Cypress, ou une tâche de test automatisé MUST NOT être ajoutés sans décision explicite ultérieure.
- Les rubriques « tests » des gabarits Spec Kit sont donc sans objet.
- Les vérifications manuelles et les commandes de lint et de build restent possibles.

### X. Outillage et infrastructure

- npm uniquement ; chaque application conserve son propre `node_modules`.
- Pas de Docker, pas de CI/CD, pas de déploiement dans le périmètre actuel.
- Turborepo, Nx, pnpm et yarn MUST NOT être ajoutés.
- La structure du monorepo existant MUST NOT être modifiée sans nécessité.

### XI. Git et collaboration

- Les commits suivent Conventional Commits.
- Les branches de fonctionnalité suivent la convention existante du projet, notamment `feat/*`.
- Spec Kit peut numéroter les spécifications (`001`, `002`, …) ; ces numéros ne remplacent pas la convention de branches Git.
- Un commit MUST NOT être créé sans demande explicite.
- Un push vers un remote MUST NOT être fait sans demande explicite.

### XII. Non-régression

- Avant toute modification, l'état existant du projet est pris en compte.
- Le Front Office existant MUST NOT être modifié quand une fonctionnalité backend n'en a pas besoin.
- `DESIGN.md` et le système visuel MUST NOT être modifiés pour résoudre un problème technique sans validation explicite.
- Quand une décision d'architecture existante doit évoluer, elle est identifiée explicitement avant de modifier le code.

## Décisions ouvertes

Les points marqués `[ouvert]` dans `ARCHITECTURE.md` (section 14) ne sont pas tranchés par cette constitution : fournisseur de stockage des images et chemin d'envoi, stockage des CV et durée de conservation, registre d'impact agrégé de la page Actions, limites de taille des fichiers, cache du Front Office, anti-spam du formulaire, spécification visuelle du Back Office.

Une spec ou un plan qui dépend de l'un de ces points MUST le signaler et attendre la décision du porteur du projet ; il MUST NOT choisir à sa place.

## Flux de travail Spec Kit

Chaque fonctionnalité suit cette séquence, avec une validation explicite entre deux étapes :

1. La fonctionnalité est spécifiée.
2. La spec est validée.
3. Le plan est rédigé, puis validé.
4. Les tâches sont rédigées, puis validées.
5. L'implémentation est réalisée.

Règles associées :

- Une fonctionnalité Spec Kit correspond à une étape demandée explicitement.
- Chaque plan comporte un contrôle de constitution : les douze principes sont vérifiés, tout écart est nommé avec sa justification et soumis à validation.
- Une spec renvoie aux sections des documents de référence plutôt que de les recopier, et liste ce qui est hors périmètre.
- Les vérifications manuelles remplacent les tests automatisés dans le workflow de la V1 : chaque récit utilisateur décrit ce que l'on fait et ce que l'on doit observer.

## Governance

- Cette constitution prévaut sur les gabarits Spec Kit et sur les habitudes de travail.
- Elle ne remplace pas `ARCHITECTURE.md`, `DESIGN.md` ni `PROJECT_CONTEXT.md` : elle fixe les règles, eux portent le contenu des décisions.
- Amendement : proposé par écrit, soumis à la validation explicite du porteur du projet, puis appliqué par `/speckit-constitution` avec version et date mises à jour.
- Versionnage sémantique : MAJEUR pour un principe retiré ou redéfini, MINEUR pour un principe ou une section ajoutés, CORRECTIF pour une clarification.
- Conformité : vérifiée à chaque plan et à chaque fin d'étape.
- `CLAUDE.md` donne les consignes de travail quotidiennes et MUST rester cohérent avec cette constitution.

**Version**: 1.0.0 | **Ratified**: 2026-10-01 | **Last Amended**: 2026-10-01
