# Implementation Plan: Candidatures (Applications)

**Branch**: `007-applications` | **Date**: 2026-10-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-applications/spec.md`

## Summary

Donner à l'API de quoi recevoir une candidature au club et permettre à l'administrateur de la consulter et de la supprimer : un modèle `Application` sans état de traitement ; un dépôt public en `multipart/form-data`, limité à 20 demandes par heure et par adresse IP ; une liste, une fiche, la lecture du CV et la suppression sous `/admin/applications` ; et le stockage du CV chez Cloudinary, derrière l'abstraction `StorageService`.

Approche : deux modules NestJS. `media` porte l'abstraction `StorageService` et son unique implémentation, Cloudinary ; lui seul connaît le fournisseur. `applications` a la forme des modules métier existants (module, contrôleur public, contrôleur d'administration, service, schéma, DTO) et n'utilise que l'abstraction. Le socle est réutilisé tel quel : validation, format d'erreur, gardes, pagination, limitation de fréquence route par route. Une seule dépendance nouvelle, `cloudinary`. Ni `apps/web` ni `apps/admin` ne sont touchés.

## Technical Context

**Language/Version** : TypeScript 6 (strict), Node.js 22. Sortie CommonJS avec `module: nodenext`.

**Primary Dependencies** : déjà installées : NestJS 12 (dont l'intercepteur de fichier de `@nestjs/platform-express`, avec `multer` 2.4), `@nestjs/mongoose` 12, `mongoose` 9, `class-validator`, `class-transformer`, `@nestjs/throttler` 6, l'authentification de `003-admin-auth`. **Une dépendance à installer : `cloudinary`** (client officiel), dans `apps/api` seulement, par `npm install cloudinary --workspace=api` depuis la racine. Aucune dépendance de types.

**Storage** : MongoDB Atlas Free, via Mongoose : une collection nouvelle, `applications`. Fichiers : Cloudinary, ressource `raw`, accès `authenticated`.

**Testing** : aucun test automatisé (constitution, principe IX) : ni Jest, ni Vitest, ni Playwright, ni Cypress, aucune suite ajoutée. Vérification manuelle structurée dans [quickstart.md](./quickstart.md), plus `npm run lint` et `npm run build:api`.

**Target Platform** : serveur Node.js 22, en local (port 4000). Hébergement hors périmètre : ni Docker, ni CI/CD, ni déploiement.

**Project Type** : service web (API HTTP) dans un monorepo npm workspaces.

**Performance Goals** : aucun objectif chiffré. Un club reçoit quelques candidatures par mois.

**Constraints** : CV de 5 242 880 octets au plus, tenu en mémoire le temps de la demande ; 20 dépôts par heure et par adresse IP ; appels au fournisseur bornés à 10 secondes ; aucune donnée personnelle ni aucun secret dans les journaux.

**Scale/Scope** : cinq routes, deux modules, une collection.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Modèle, adresses, validation et listes repris d'`ARCHITECTURE.md` (sections 1.6, 2, 5, 6, 8, 9, 13). Les décisions Q1 à Q9 ferment des points que l'architecture laissait ouverts ; elles y sont reportées par les alignements de la section A, avant tout code. | Conforme, alignements validés, appliqués par la première tâche |
| II. Étapes validées | Arbitrages validés le 2026-10-02. Ce plan s'arrête après la phase 1 : ni tâches ni code. | Conforme |
| III. Préférence pour le manuel | Aucun script, aucune donnée insérée par le code. Le compte Cloudinary et `.env` sont préparés par le porteur du projet. | Conforme |
| IV. Simplicité technique | Mécanismes natifs de NestJS pour le fichier et la limite de fréquence ; vérification du type sans bibliothèque. Une dépendance, justifiée par un besoin réel (R4). `StorageService` est l'abstraction déjà décidée par l'architecture ; elle ne porte que les trois opérations dont le CV a besoin. | Conforme |
| V. Architecture backend | Routes sous `/api/v1` ; administration sous `/admin`, gardée au niveau de la classe ; dépôt public dans son propre contrôleur. | Conforme |
| VI. Intégrité du modèle métier | Candidature sans état de traitement ni workflow ; `applicantStatus` décrit la personne. Aucune opération de modification. | Conforme |
| VII. Front Office | Non touché. `apps/web` n'est pas branché. | Conforme |
| VIII. Qualité et contenu | Aucune candidature fictive conservée ; aucun secret dans le code ni dans `.env.example`. | Conforme |
| IX. Tests | Aucun test, aucun outillage de test. | Conforme |
| X. Outillage et infrastructure | npm ; une installation dans `apps/api`, `node_modules` par application conservé. | Conforme |
| XI. Git et collaboration | Branche créée à la demande du porteur du projet. Aucun commit sans demande. | Conforme |
| XII. Non-régression | Les routes existantes sont revérifiées. Seul changement transverse : trois variables d'environnement obligatoires de plus. | Conforme, point à connaître |

**Résultat de la porte** : passée. Les alignements (section A), les précisions P1 à P5, les trois messages nouveaux et la dépendance ont été validés le 2026-10-02. Aucune violation à justifier.

**Re-vérification après la phase 1** : inchangée.

## A. Alignements d'ARCHITECTURE.md proposés

**Aucun n'est appliqué par ce plan.** Validés le 2026-10-02, ils sont appliqués par la première tâche, T001, avant tout code.

| # | Section | Texte actuel | Changement | Origine |
|---|---|---|---|---|
| 1 | 2, premier paragraphe | « Aucun fournisseur n'est choisi ni intégré [ouvert] » | Cloudinary est le fournisseur du CV ; le fournisseur des images reste ouvert. | Q1 |
| 2 | 2, `FileRef` | `url` (oui), `publicId` (non), `name`, `mimeType`, `size` | Pour le CV : `publicId` obligatoire, aucune `url` enregistrée ; fichier `raw` en accès authentifié, sans adresse publique ; mention « ouvert » retirée. | P1, P3 |
| 3 | 2, `StorageService` | `upload`, `delete`, éventuellement `signedUrl` | Envoyer, lire, supprimer ; l'adresse signée reste interne à l'implémentation. | Q7 |
| 4 | 6, `POST /applications` | « Limité en fréquence » | 20 par heure et par adresse IP ; codes `201`, `400`, `413`, `415`, `429`, `503`. | Q6, P4 |
| 5 | 6, ligne « Candidatures » | `GET /:id/cv` (accès au fichier) · `DELETE /:id` | Le CV est renvoyé par l'API (fichier joint, sans cache) ; suppression `204` ; `503` si le stockage échoue. | Q7, P4 |
| 6 | 8, « CV » | « Limites à confirmer [ouvert] » | Limites confirmées ; type constaté sur le contenu, extension concordante ; mention « ouvert » retirée. | Q4 |
| 7 | 9, « Applications » | tri `-createdAt` (défaut), `lastName` | `createdAt` et `lastName`, deux sens ; `from` et `to` bornes incluses. | Q9 |
| 8 | 12, `apps/api` | « Variables du stockage : à définir » | Les trois variables `CLOUDINARY_*`, obligatoires, secrètes. | P5 |
| 9 | 14, décision 10 et décisions ouvertes | « Aucun fournisseur choisi » ; « Stockage des CV » et « Limites des fichiers » ouverts | Décision 10 mise à jour ; « Stockage des CV » fermé (Cloudinary, aucune suppression automatique) ; « Limites des fichiers » : CV fermé, images toujours ouvert. | Q1, Q4, Q5 |
| 10 | 15, étape 5 | « Stockage de fichiers, puis candidatures » | Le stockage du CV est livré avec les candidatures ; celui des images reste à faire. | Q1 |

Les exemples JSON de la section 13 ne changent pas : la forme d'une candidature y est déjà celle du contrat. `1.6` ne change pas.

## Project Structure

### Documentation (this feature)

```text
specs/007-applications/
├── spec.md
├── plan.md              ce fichier
├── research.md          phase 0 : décisions techniques
├── data-model.md        phase 1 : Application, FileRef, ApplicantStatus
├── quickstart.md        phase 1 : vérification manuelle
├── contracts/
│   └── applications.md  dépôt public, administration, configuration, abstraction de stockage
├── checklists/
│   └── requirements.md
└── tasks.md             créé plus tard par /speckit-tasks
```

### Source Code (repository root)

```text
apps/api/
├── .env.example                               modifié : trois noms CLOUDINARY_*, sans valeur
├── package.json                               modifié : dépendance cloudinary
└── src/
    ├── app.module.ts                          modifié : import de ApplicationsModule
    ├── config/
    │   ├── env.validation.ts                  modifié : trois variables obligatoires
    │   └── app-config.ts                      modifié : réglages du stockage
    ├── common/
    │   ├── enums/applicant-status.enum.ts     nouveau : etudiant, professionnel
    │   └── schemas/file-ref.schema.ts         nouveau : sous-document FileRef
    ├── media/
    │   ├── media.module.ts                    nouveau : lie l'abstraction à son implémentation
    │   ├── storage.service.ts                 nouveau : abstraction (envoyer, lire, supprimer), erreur de stockage
    │   └── cloudinary-storage.service.ts      nouveau : seule partie du code qui connaît Cloudinary
    └── applications/
        ├── applications.module.ts             nouveau
        ├── schemas/application.schema.ts      nouveau : modèle, index
        ├── applications.service.ts            nouveau : dépôt, liste, fiche, CV, suppression
        ├── applications.public.controller.ts  nouveau : POST /applications, limité en fréquence
        ├── applications.admin.controller.ts   nouveau : /admin/applications, gardé sur la classe
        ├── cv-file.ts                         nouveau : vérification du contenu et de l'extension
        ├── cv-upload.interceptor.ts           nouveau : réception du fichier, erreurs au format du socle
        └── dto/
            ├── create-application.dto.ts      nouveau
            └── query-applications.dto.ts      nouveau : recherche, période, tri, pagination
```

Le fichier `package-lock.json` de la racine change avec l'installation.

**Réutilisés sans modification** : `common/dto/pagination-query.dto.ts`, `common/pipes/` (validation, `ParseObjectIdPipe`), `common/filters/all-exceptions.filter.ts`, les gardes et décorateurs de `auth/`, le réglage `ThrottlerModule` d'`app.module.ts`.

**Non modifiés** : `main.ts`, `auth/`, `health/`, `rotary-years/`, `members/`, `actions/`, `news/`, `apps/web`, `apps/admin`, `DESIGN.md`.

**Structure Decision** : l'arborescence d'`ARCHITECTURE.md`, section 5, qui prévoit déjà `applications/`, `media/`, `common/schemas/` (FileRef) et `ApplicantStatus` dans `common/enums/`. `applications` importe `MediaModule` et `AuthModule` ; `media` n'importe aucun module métier.

## Décisions de conception

Détail et alternatives dans [research.md](./research.md).

### B. Modèle Application

- Champs d'`ARCHITECTURE.md`, section 1.6 : `firstName`, `lastName`, `email`, `phone`, `applicantStatus`, `cv`, tous obligatoires ; `createdAt` seul horodatage (pas de `updatedAt`).
- `cv` : sous-document `FileRef` sans identifiant propre : `publicId`, `name`, `mimeType`, `size`.
- Index : `createdAt` ; texte sur `firstName`, `lastName`, `email`, langue neutre. Aucun index unique : plusieurs candidatures par email (Q8).
- Une seule forme de sortie, d'administration, construite explicitement par le service : elle n'inclut jamais `publicId`.

### C. Stockage : `media`

- `StorageService`, classe abstraite : envoyer un contenu et recevoir un identifiant ; lire un contenu par identifiant (ou « absent ») ; supprimer par identifiant (absent = succès). Une seule erreur, `StorageError`, sans message du fournisseur.
- `CloudinaryStorageService` : configuration explicite depuis `AppConfig` (jamais la variable implicite `CLOUDINARY_URL`) ; envoi signé par flux, `raw`, `authenticated`, identifiant `candidatures/cv/<UUID>` ; lecture par adresse signée de 60 secondes consommée côté serveur ; suppression avec invalidation ; délai de 10 secondes par appel.
- Journal : le type de l'erreur seulement. Jamais le message, l'adresse appelée, la clé ni le secret.
- Le service d'`applications` convertit `StorageError` en `503` sans message : le filtre fournit « Service indisponible. ».
- **Deux points à confirmer par la première tâche de stockage** ([research.md](./research.md), R5) : la forme de l'adresse de téléchargement signée pour une ressource `raw` authentifiée, et le réglage de livraison des PDF sur un compte gratuit. Aucun des deux ne change le contrat de l'API.

### D. Dépôt public

- `applications.public.controller.ts`, contrôleur `applications`, une route : `POST`, `201`, corps `{ "received": true }`.
- Chaîne d'exécution : `ThrottlerGuard` avec `@Throttle` (20 par 3 600 000 ms) → intercepteur de fichier (champ `cv`, un fichier, 5 242 880 octets, en mémoire) → validation du DTO par le socle → présence du fichier → type constaté et extension → envoi au stockage → enregistrement.
- Refus, dans cet ordre : `429`, `413`, `400`, `415`. Aucun fichier n'est envoyé au stockage avant la fin des vérifications.
- Compensation : si l'enregistrement échoue après l'envoi, le fichier est supprimé du stockage ; si cette suppression échoue, l'identifiant orphelin est journalisé (R7).
- Le type enregistré est celui constaté par l'API. Le nom d'origine est réduit à son dernier segment et à 255 caractères.

### E. Administration

- `applications.admin.controller.ts`, contrôleur `admin/applications`, portant `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')` **sur la classe**, dès sa création.
- `GET` (liste), `GET :id`, `GET :id/cv`, `DELETE :id` (`204`), avec `ParseObjectIdPipe`. Aucun `POST`, `PATCH` ni `PUT`.
- Liste : pagination commune ; `q` par l'index texte ; `from` et `to` sur `createdAt`, bornes incluses ; `sort` parmi `createdAt`, `-createdAt`, `lastName`, `-lastName`, puis identifiant.
- CV : `StreamableFile`, `Content-Type` constaté, `Content-Disposition: attachment` avec le nom d'origine, `Cache-Control: no-store`. Fichier absent : `404`.
- Suppression : le fichier d'abord, la candidature ensuite, `204`. Fichier déjà absent : considéré comme supprimé, la candidature est supprimée, `204`, avec une ligne de journal technique. Stockage indisponible ou autre erreur : `503`, rien n'est supprimé.

### F. Limitation de fréquence

- Mécanisme existant, inchangé : pas de garde globale ; `ThrottlerGuard` posée sur la route. Le réglage par défaut (5 par minute) reste celui de la connexion ; le dépôt le remplace pour lui seul par `@Throttle`.
- Compteur en mémoire, par route et par adresse IP. Aucune configuration de mandataire n'est ajoutée : hébergement hors périmètre.

### G. Configuration

- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` : obligatoires, validées au démarrage par le mécanisme existant ; le message d'erreur nomme la variable et sa règle, jamais sa valeur.
- `apps/api/.env.example` : les trois noms, commentés, sans valeur. `apps/api/.env` n'est pas modifié par l'implémentation : il est renseigné par le porteur du projet.

### H. Validation et messages

- Messages repris tels quels pour le prénom, le nom, l'email, le téléphone, la recherche, le tri, les dates et la pagination ; **trois messages nouveaux**, listés dans [contracts/applications.md](./contracts/applications.md), validés le 2026-10-02. Aucun autre message n'est créé pendant l'implémentation.
- Les règles communes (retrait des espaces, motif du téléphone) sont réécrites dans `applications/dto/`, comme décidé pour `005` et `006` : aucun import depuis `members/`, aucun refactor de `common/`.
- Champ non prévu (dont tout état de traitement) : refusé par le socle, « Champ non autorisé. ».

### I. Confidentialité

- Aucune lecture publique. La réponse du dépôt ne contient rien de la candidature.
- Aucune réponse ne contient d'adresse ni d'identifiant de stockage ; vérifié sur les corps et les en-têtes.
- Aucun champ d'une candidature n'est journalisé.

### J. Non-régression et tests

Section « Fin d'étape » et [quickstart.md](./quickstart.md). Aucun test automatisé.

## Validations du 2026-10-02

Validés par le porteur du projet : Q1 à Q9 ; P1 à P5 ; les dix alignements d'`ARCHITECTURE.md` (section A) ; les trois messages nouveaux ; la dépendance `cloudinary`.

### Réserve du porteur du projet, conservée telle quelle

- lors de la suppression d'une candidature, si le fichier distant a déjà disparu, appliquer le comportement 404 prévu ;
- ne jamais exposer l'identifiant Cloudinary, l'URL Cloudinary ou une référence de stockage dans les réponses API publiques ou administratives ;
- les erreurs Cloudinary doivent rester abstraites en 503 côté API.

**Première ligne précisée par le porteur du projet le 2026-10-02 (lecture A).** Pour `DELETE /api/v1/admin/applications/:id` :

| Situation chez Cloudinary | Fichier | Candidature | Réponse |
|---|---|---|---|
| Le CV existe | supprimé | supprimée | `204` |
| Le CV est déjà absent | considéré comme déjà supprimé | supprimée quand même | `204` |
| Indisponible, ou erreur autre qu'une absence | inchangé | **conservée** | `503` « Service indisponible. » |

- Fichier déjà absent : le journal ne garde que l'information technique nécessaire — le fait, et l'identifiant de la candidature. Aucun détail Cloudinary n'est exposé au client.
- Pour un fichier disparu, `404` est réservé à `GET /admin/applications/:id/cv`. Sur `DELETE`, `404` reste celui d'une candidature inconnue (FR-022), comme sur toutes les routes par identifiant.

La contradiction signalée à la génération des tâches est levée : spec (FR-015, récit 3), contrat et tâches (T024 à T026) portent cette règle.

## Prérequis manuels (porteur du projet)

1. Un compte Cloudinary, et ses trois valeurs placées dans `apps/api/.env`. Je ne crée pas le compte et ne modifie pas `.env`.
2. Si la lecture d'un CV PDF est refusée par Cloudinary : activer la livraison des fichiers PDF dans les réglages de sécurité du compte (R5).
3. Une base MongoDB Atlas joignable et le mot de passe du compte d'administration, pour les vérifications.

## Fin d'étape

- `npm run format --workspace=api`, `npm run lint`, `npm run build:api` passent ; `npm run build:web` et `npm run build:admin` passent comme avant.
- Les scénarios de [quickstart.md](./quickstart.md) sont déroulés, ou explicitement signalés comme non faits.
- Aucune candidature de vérification ne reste en base, aucun fichier chez Cloudinary.
- Non-régression : santé, authentification (dont sa limite de fréquence), années Rotary, membres et mandats, actions, actualités répondent comme avant.
- Aucun fichier modifié dans `apps/web`, `apps/admin`, `DESIGN.md`, ni dans les modules métier existants.
- Aucun secret dans les fichiers versionnables ; `.env.example` ne porte que des noms.
- `PROJECT_CONTEXT.md` (fournisseur du CV, données personnelles confiées à un prestataire, décisions fermées, prochaines étapes) et la ligne d'état de `CLAUDE.md` (dix dépendances au lieu de neuf) sont mis à jour.

## Ordre recommandé des phases

1. Alignement d'`ARCHITECTURE.md`, avant tout code.
2. Installation de `cloudinary` ; configuration (trois variables, `.env.example`).
3. Stockage : abstraction, implémentation, et confirmation des deux points de R5 contre le compte réel.
4. Fondations des candidatures : énumération, `FileRef`, schéma, module.
5. Récit 1 : dépôt (DTO, réception du fichier, vérification du type, limite de fréquence, compensation).
6. Récit 2 : consultation (liste, fiche, CV).
7. Récit 3 : suppression.
8. Récit 4 : confidentialité (relecture des réponses, des en-têtes et du journal ; stockage en erreur).
9. Finition : format, lint, builds, non-régression, nettoyage de la base et de Cloudinary, documents.

Le stockage (3) précède tout le reste : s'il révèle un obstacle chez le fournisseur, il est connu avant d'écrire les candidatures.

## Complexity Tracking

Aucune violation de la constitution à justifier.
