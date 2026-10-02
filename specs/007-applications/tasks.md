# Tasks: Candidatures (Applications)

**Input**: Design documents from `/specs/007-applications/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/applications.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX) : ni Jest, ni Vitest, ni Playwright, ni Cypress. Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`.

**Organization**: les tâches sont groupées par récit utilisateur, dans l'ordre de la spec.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US5).

## Path Conventions

Tout le code vit dans `apps/api/src/`. Les commandes npm se lancent depuis la racine du dépôt. Style du code de l'API : guillemets simples, virgules finales, Prettier et oxlint.

## Décisions verrouillées à respecter

1. **T001 d'abord** : `ARCHITECTURE.md` est aligné avant toute modification de code.
2. **Une seule dépendance** : `cloudinary`, dans `apps/api`. Aucune dépendance de types, aucune bibliothèque de détection de type de fichier.
3. Une candidature n'a **aucun état de traitement** et ne se modifie pas : ni `POST`, ni `PATCH`, ni `PUT` sous `/admin/applications` ; pas de `updatedAt`.
4. `applicantStatus` vaut exactement `etudiant` ou `professionnel`.
5. CV : PDF, DOC ou DOCX ; 5 242 880 octets au plus ; non vide ; un seul fichier, champ `cv`. Le type est **constaté par l'API** sur le contenu (signatures de `research.md`, R3) ; l'extension doit concorder ; le type annoncé par le client n'est pas utilisé.
6. Ordre des refus au dépôt : `429`, `413`, `400`, `415`. Aucun fichier n'est envoyé au stockage avant la fin des vérifications.
7. Limite de fréquence : 20 demandes par heure et par adresse IP sur le dépôt, par `ThrottlerGuard` et `@Throttle` posés sur la route. Le réglage global et la route de connexion ne sont pas modifiés.
8. Stockage : Cloudinary, ressource `raw`, accès `authenticated`, identifiant `candidatures/cv/<UUID aléatoire>`. Envoi, lecture et suppression côté serveur, par appels signés.
9. **Seul `media/cloudinary-storage.service.ts` connaît Cloudinary.** Le module `applications` n'importe que `StorageService`.
10. **Aucun identifiant Cloudinary, aucune adresse Cloudinary, aucune référence de stockage** dans une réponse de l'API, publique ou d'administration, corps ou en-têtes.
11. **Toute erreur Cloudinary reste abstraite** : `503` « Service indisponible. », sans détail du fournisseur. Seul le type de l'erreur est journalisé.
12. Cohérence : échec de la base après l'envoi → le fichier est retiré ; suppression → le fichier d'abord, la candidature ensuite ; fichier déjà absent à la suppression → la candidature est supprimée quand même, `204` ; stockage indisponible ou autre erreur à la suppression → `503`, rien n'est supprimé.
13. Lecture du CV : l'API renvoie le fichier, en téléchargement, sans cache. Fichier disparu du stockage : `404`, **à la lecture seulement**.
14. Aucune suppression automatique ; aucune unicité sur l'email ; aucun email envoyé ; aucune lecture publique.
15. Trois variables obligatoires : `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. `.env.example` ne porte que leurs noms. **`apps/api/.env` n'est modifié par aucune tâche.**
16. Le contrôleur d'administration porte `JwtAuthGuard`, `RolesGuard` et `@Roles('ADMIN')` **sur la classe**, dès sa création.
17. **Messages : ceux de `contracts/applications.md`, et aucun autre.** Duplication limitée conservée : le retrait des espaces et le motif du téléphone sont réécrits dans `applications/dto/` ; rien n'est importé de `members/`, `actions/` ni `news/`.
18. Aucune donnée d'exemple. `apps/web`, `apps/admin`, `DESIGN.md`, la constitution, `main.ts`, le filtre d'erreurs, les pipes, l'authentification et les modules métier existants ne sont pas modifiés.

### Règle de suppression, confirmée le 2026-10-02

Pour `DELETE /api/v1/admin/applications/:id` : fichier présent → fichier supprimé, candidature supprimée, `204` ; fichier déjà absent → considéré comme supprimé, candidature supprimée quand même, `204`, une ligne de journal technique ; stockage indisponible ou erreur autre qu'une absence → candidature **conservée**, `503` « Service indisponible. ». Pour un fichier disparu, `404` est réservé à `GET /admin/applications/:id/cv`.

## Prérequis manuels (hors tâches)

1. Un compte Cloudinary, et ses trois valeurs placées dans `apps/api/.env` **par le porteur du projet**.
2. Une base MongoDB Atlas joignable et le mot de passe du compte d'administration.

Si l'un manque au moment de vérifier, le signaler explicitement et laisser les tâches de vérification concernées non cochées : aucune vérification n'est inventée. Sans les variables Cloudinary, l'API ne démarre plus à partir de T003.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: aligner la source de vérité, installer la dépendance, configurer le stockage.

- [X] T001 Appliquer à `ARCHITECTURE.md` les dix alignements de `plan.md`, section A, et rien d'autre : section 2 (Cloudinary pour le CV, fournisseur des images toujours ouvert ; `FileRef` du CV avec `publicId` obligatoire et sans `url` ; `StorageService` : envoyer, lire, supprimer) ; section 6 (`POST /applications` : 20 par heure et par adresse IP, codes `201`, `400`, `413`, `415`, `429`, `503` ; CV renvoyé par l'API, suppression `204`, `503` si le stockage échoue) ; section 8 (limites du CV confirmées) ; section 9 (tris dans les deux sens, `from` et `to` bornes incluses) ; section 12 (trois variables `CLOUDINARY_*`) ; section 14 (décision 10, décisions ouvertes « Stockage des CV » et « Limites des fichiers ») ; section 15 (étape 5). Ne modifier ni la section 1.6, ni les exemples JSON de la section 13.
- [X] T002 Installer la dépendance : `npm install cloudinary --workspace=api` depuis la racine. Vérifier que seuls `apps/api/package.json` et `package-lock.json` changent, qu'une seule dépendance est ajoutée, et que `apps/api/node_modules` reste propre à l'application (pas de remontée à la racine).
- [X] T003 Ajouter `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` et `CLOUDINARY_API_SECRET` à `apps/api/src/config/env.validation.ts` : trois chaînes obligatoires et non vides, avec leur entrée dans `RULES` (« obligatoire ; … »). Le message d'erreur nomme la variable et sa règle, jamais sa valeur.
- [X] T004 Exposer les réglages du stockage dans `apps/api/src/config/app-config.ts` (`cloudinary: { cloudName, apiKey, apiSecret }`), lus par `getAppConfig`.
- [X] T005 [P] Ajouter à `apps/api/.env.example` les trois noms `CLOUDINARY_*`, commentés en français (« Obligatoire. … »), **sans aucune valeur**. Ne pas toucher `apps/api/.env`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: le stockage, puis le modèle. Le stockage vient d'abord : un obstacle chez le fournisseur doit être connu avant d'écrire les candidatures.

**⚠️ CRITICAL**: aucun récit ne commence avant la fin de cette phase.

- [X] T006 Créer l'abstraction dans `apps/api/src/media/storage.service.ts` : classe abstraite `StorageService` avec trois opérations — envoyer un contenu et recevoir un identifiant ; lire un contenu par identifiant, ou signaler qu'il est absent ; supprimer par identifiant, en indiquant si le fichier a été supprimé ou s'il était déjà absent, ce second cas n'étant pas une erreur — et la classe `StorageError`, sans message du fournisseur. Aucun import de `cloudinary` dans ce fichier.
- [X] T007 Créer `apps/api/src/media/cloudinary-storage.service.ts`, seule implémentation : configuration explicite depuis `getAppConfig` (jamais la variable implicite `CLOUDINARY_URL`) ; envoi signé par flux depuis la mémoire, `resource_type: raw`, `type: authenticated`, identifiant `candidatures/cv/<crypto.randomUUID()>`, sans écrasement ; lecture par adresse de téléchargement signée valable 60 secondes, consommée côté serveur par `fetch` ; suppression avec invalidation, « introuvable » renvoyé comme « déjà absent » et non comme une erreur ; délai de 10 secondes par appel ; toute erreur du fournisseur convertie en `StorageError` ; journal limité au type de l'erreur, jamais son message, l'adresse appelée, la clé ni le secret.
- [X] T008 Créer `apps/api/src/media/media.module.ts` : fournit `StorageService` par `CloudinaryStorageService` et n'exporte que `StorageService`. N'importe aucun module métier.
- [X] T009 Confirmer le stockage contre le compte réel (`research.md`, R5), par une commande ponctuelle lancée depuis le build, **sans ajouter de fichier au dépôt** : envoyer un petit PDF, le relire et comparer son empreinte, vérifier chez Cloudinary qu'il est `raw` et `authenticated` et que son adresse de livraison non signée est refusée, le supprimer, vérifier qu'une seconde suppression et une lecture ne lèvent pas d'erreur de stockage (absent). Si l'adresse de téléchargement signée ne convient pas, appliquer le repli de R5 dans T007. Si la lecture d'un PDF est refusée par le compte, **s'arrêter et le signaler** au porteur du projet (réglage de sécurité du compte). Ne laisser aucun fichier chez Cloudinary.
- [X] T010 [P] Créer `apps/api/src/common/enums/applicant-status.enum.ts` : `ApplicantStatus` avec exactement `etudiant` et `professionnel`.
- [X] T011 [P] Créer `apps/api/src/common/schemas/file-ref.schema.ts` : sous-document sans identifiant propre, avec `publicId` (chaîne, obligatoire), `name` (chaîne, obligatoire, 255 caractères au plus), `mimeType` (chaîne, obligatoire), `size` (entier, obligatoire, 1 à 5 242 880). Aucun champ `url`.
- [X] T012 Créer `apps/api/src/applications/schemas/application.schema.ts` : collection `applications` ; `firstName` et `lastName` (obligatoires, 120 caractères au plus), `email` (obligatoire, minuscules, 254 au plus, **non unique**), `phone` (obligatoire), `applicantStatus` (obligatoire, énumération `ApplicantStatus`), `cv` (`FileRef`, obligatoire) ; horodatage limité à `createdAt` (pas de `updatedAt`) ; index sur `createdAt` et index texte sur `firstName`, `lastName`, `email` avec `default_language: 'none'`. Aucun champ d'état de traitement.
- [X] T013 Créer `apps/api/src/applications/applications.module.ts` (déclare le modèle `Application`, importe `MediaModule` et `AuthModule`) et l'importer dans `apps/api/src/app.module.ts` après `NewsModule`. Sans contrôleur à ce stade.

**Checkpoint**: l'API démarre, la collection `applications` existe avec ses index, le stockage est confirmé.

---

## Phase 3: User Story 1 - Déposer une candidature (Priority: P1) 🎯 MVP

**Goal**: une candidature complète est enregistrée avec son CV ; tout dépôt invalide est refusé sans rien laisser.

**Independent Test**: `quickstart.md`, sections 1, 2 et 5.

### Implementation for User Story 1

- [X] T014 [P] [US1] Créer `apps/api/src/applications/dto/create-application.dto.ts` : `firstName`, `lastName` (espaces retirés, 1 à 120 caractères), `email` (espaces retirés, minuscules, email valide, 254 au plus), `phone` (motif du projet : chiffres, espaces, `+`, `-`, `.`, parenthèses, au moins 8 chiffres), `applicantStatus` (énumération), tous obligatoires, avec les messages exacts de `contracts/applications.md`. Les aides `trim` et le motif du téléphone sont réécrits localement. Aucun autre champ : tout champ non prévu est refusé par le socle.
- [X] T015 [P] [US1] Créer `apps/api/src/applications/cv-file.ts` : à partir du contenu et du nom d'origine, constater le type selon `research.md`, R3 (PDF : `%PDF-` ; DOC : `D0 CF 11 E0 A1 B1 1A E1` ; DOCX : `PK 03 04` et entrée `word/document.xml`), exiger l'extension concordante sans tenir compte de la casse, renvoyer le type à enregistrer ou signaler un type refusé ; réduire le nom d'origine à son dernier segment et à 255 caractères.
- [X] T016 [P] [US1] Créer `apps/api/src/applications/cv-upload.interceptor.ts` : enveloppe `FileInterceptor('cv')` en mémoire, limité à un fichier et 5 242 880 octets, avec des champs texte en nombre et en taille bornés ; convertit le dépassement de taille en `413` sans message (le filtre fournit « Contenu trop volumineux. ») et un fichier dans un autre champ ou en surnombre en `400` « Données invalides. » avec le détail `cv` : « Un seul fichier est attendu, dans le champ « cv ». ». Aucun message anglais ne doit atteindre la réponse. Le filtre du socle n'est pas modifié.
- [X] T017 [US1] Créer `apps/api/src/applications/applications.service.ts` avec le dépôt : refuser un fichier absent ou vide (`400`, détail `cv` : « Le CV est obligatoire. ») ; constater le type par `cv-file.ts`, sinon `415` sans message ; envoyer le contenu par `StorageService` ; enregistrer la candidature avec `cv` (`publicId`, `name`, `mimeType` constaté, `size`) ; si l'enregistrement échoue après l'envoi, supprimer le fichier puis relancer l'erreur d'origine, et si cette suppression échoue journaliser le seul identifiant orphelin ; convertir toute `StorageError` en `503` sans message. Ne rien journaliser de la candidature. Renvoyer `{ received: true }`.
- [X] T018 [US1] Créer `apps/api/src/applications/applications.public.controller.ts` (contrôleur `applications`, sans garde d'authentification) : `POST` répondant `201`, avec `ThrottlerGuard` et `@Throttle` (20 demandes par 3 600 000 ms) puis l'intercepteur de T016, dans cet ordre ; l'enregistrer dans `applications.module.ts`. Ne pas modifier le réglage de `ThrottlerModule` dans `app.module.ts` ni `auth.controller.ts`.
- [X] T019 [US1] Vérification manuelle : dérouler `quickstart.md`, sections 1, 2 et 5 (démarrage sans puis avec les variables ; dépôts valides en PDF, DOCX et DOC ; même email deux fois ; chaque refus `400`, `413`, `415` avec son message ; 5 242 880 octets accepté et 5 242 881 refusé ; rien de plus en base ni chez Cloudinary après un refus ; vingt-et-unième dépôt `429` ; connexion non affectée et toujours limitée à 5 par minute). Corriger tout écart et rejouer le scénario avant de cocher.

**Checkpoint**: les candidatures se déposent.

---

## Phase 4: User Story 2 - Consulter les candidatures (Priority: P1)

**Goal**: l'administrateur liste, cherche, filtre, ouvre une candidature et télécharge son CV.

**Independent Test**: `quickstart.md`, section 3.

### Implementation for User Story 2

- [X] T020 [P] [US2] Créer `apps/api/src/applications/dto/query-applications.dto.ts`, qui étend `PaginationQueryDto` : `q` (espaces retirés, 2 caractères au moins), `from` et `to` (dates ISO 8601), `sort` parmi exactement `createdAt`, `-createdAt`, `lastName`, `-lastName`, défaut `-createdAt` ; messages de `contracts/applications.md`.
- [X] T021 [US2] Ajouter à `apps/api/src/applications/applications.service.ts` : la forme d'administration, construite explicitement (`id`, `firstName`, `lastName`, `email`, `phone`, `applicantStatus`, `cv` réduit à `name`, `mimeType`, `size`, `createdAt`) — **jamais `publicId`** ; la liste paginée (`q` par l'index texte, période sur `createdAt` bornes incluses, une date sans heure couvrant la journée entière en temps universel, `from` postérieur à `to` donnant une liste vide, tri puis identifiant) ; la fiche (`404` si inconnue) ; la lecture du CV par `StorageService` (`404` si la candidature est inconnue ou le fichier absent, `503` sans message sur `StorageError`).
- [X] T022 [US2] Créer `apps/api/src/applications/applications.admin.controller.ts` (contrôleur `admin/applications`) portant `JwtAuthGuard`, `RolesGuard` et `@Roles(ADMIN_ROLE)` **sur la classe** : `GET` (liste), `GET :id`, `GET :id/cv`, avec `ParseObjectIdPipe`. Le CV est renvoyé par `StreamableFile` avec `Content-Type` constaté, `Content-Length`, `Content-Disposition: attachment` portant le nom d'origine (repli ASCII et forme encodée UTF-8) et `Cache-Control: no-store` ; aucun en-tête ne porte de référence de stockage. Aucun `POST`, `PATCH` ni `PUT`. L'enregistrer dans `applications.module.ts`.
- [X] T023 [US2] Vérification manuelle : dérouler `quickstart.md`, section 3 (liste, champs exacts, type constaté du DOCX, quatre tris, refus de paramètres, recherche par mot entier, périodes dont les bornes et la période inversée, fiche, CV identique par empreinte et en-têtes, absence de toute référence de stockage dans corps et en-têtes, identifiants mal formés et inconnus, absence de `POST`/`PATCH`/`PUT`, `401` sans jeton et avec un jeton altéré). Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les candidatures se consultent.

---

## Phase 5: User Story 3 - Supprimer une candidature (Priority: P1)

**Goal**: supprimer une candidature retire aussi son CV du stockage.

**Independent Test**: `quickstart.md`, section 6.

### Implementation for User Story 3

- [X] T024 [US3] Ajouter la suppression à `apps/api/src/applications/applications.service.ts`, selon FR-015 : `404` si la candidature est inconnue ; supprimer le fichier par `StorageService`, puis la candidature (`204`) ; si le stockage signale que le fichier était déjà absent, le considérer comme supprimé, supprimer quand même la candidature et journaliser une seule ligne technique (le fait et l'identifiant de la candidature — ni nom, ni email, ni identifiant de stockage) ; `StorageError` (stockage indisponible, ou erreur autre qu'une absence) → `503` sans message, **la candidature n'est pas supprimée**. Jamais de `404` pour un fichier disparu. Pour cela, la suppression de `StorageService` (T006, T007) distingue « supprimé » de « déjà absent » sans lever d'erreur.
- [X] T025 [US3] Ajouter `DELETE :id` (`204`, sans corps, `ParseObjectIdPipe`) à `apps/api/src/applications/applications.admin.controller.ts`.
- [X] T026 [US3] Vérification manuelle : dérouler `quickstart.md`, section 6 (suppression `204` ; fiche et CV `404` ensuite ; fichier absent de Cloudinary ; fichier retiré à la main chez Cloudinary puis lecture du CV `404`, suppression `204` avec la candidature retirée de la liste et une ligne de journal technique sans donnée personnelle ni référence Cloudinary ; identifiant mal formé ou inconnu ; `401` sans jeton). Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: les candidatures se suppriment, fichier compris.

---

## Phase 6: User Story 4 - Protéger les données des candidats (Priority: P1)

**Goal**: rien de sensible ne sort de l'API, ni vers le public, ni dans les journaux, et les erreurs du stockage restent abstraites.

**Independent Test**: `quickstart.md`, section 4.

### Implementation for User Story 4

- [X] T027 [US4] Relire `apps/api/src/applications/` et `apps/api/src/media/` contre FR-017 à FR-019 et FR-027 à FR-031 : aucune route publique de lecture ; `publicId` absent de toute forme de sortie ; aucun import de `cloudinary` hors de `media/cloudinary-storage.service.ts` ; aucune journalisation d'un champ de candidature, d'un message d'erreur du fournisseur, d'une adresse signée, de la clé ni du secret. Corriger tout écart dans ces deux dossiers uniquement.
- [X] T028 [US4] Vérification manuelle : dérouler `quickstart.md`, section 4 (fichiers `raw` et `authenticated` chez Cloudinary, identifiants aléatoires ; adresse de livraison non signée refusée ; seconde instance lancée avec un secret Cloudinary faux passé au lancement, `.env` inchangé : dépôt `503` sans candidature créée, lecture du CV `503`, suppression `503` avec candidature conservée et toujours lisible ensuite, message « Service indisponible. » sans détail du fournisseur ; journal sans email, téléphone, nom, valeur `CLOUDINARY_*` ni adresse signée). Corriger tout écart et rejouer avant de cocher.

**Checkpoint**: la confidentialité est vérifiée.

---

## Phase 7: User Story 5 - Ce que le formulaire et l'écran devront pouvoir faire (Priority: P3)

**Goal**: les contrats suffisent aux futures interfaces, sans les construire.

**Independent Test**: relecture.

### Implementation for User Story 5

- [X] T029 [US5] Vérification par relecture, sans modifier `apps/web` ni `apps/admin` : comparer `contracts/applications.md` et les réponses réelles de l'API au formulaire existant (`apps/web/src/app/rejoindre/_sections/ApplicationForm.tsx`, `apps/web/src/types/application.ts`) — les six champs sont acceptés, la situation sous le nom `applicantStatus` ; chaque message de validation désigne son champ ; `413`, `415`, `429` et `503` portent un message français affichable ; la fiche fournit l'email nécessaire à un lien `mailto:` ; aucune opération de modification ni d'état n'existe. Consigner les divergences du Front Office (champ `status`) comme sujets de migration, sans les corriger.

**Checkpoint**: les contrats sont suffisants.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: contrôles de fin d'étape.

- [X] T030 Formater et contrôler : `npm run format --workspace=api`, puis `npm run lint`, `npm run build:api`, `npm run build:web` et `npm run build:admin` depuis la racine. Corriger toute erreur dans `apps/api/src/applications`, `apps/api/src/media`, `apps/api/src/config`, `common/enums/applicant-status.enum.ts` ou `common/schemas/file-ref.schema.ts` uniquement.
- [X] T031 Non-régression 001→006 : dérouler `quickstart.md`, section 7 (santé ; `/auth/me` sans et avec jeton ; limite de la connexion inchangée ; années Rotary ; membres et mandats ; actions ; actualités : une création, une lecture publique, une suppression chacun ; refus de supprimer une année référencée ; en-têtes de sécurité). Corriger tout écart et rejouer avant de cocher.
- [X] T032 Nettoyage, exclusivement par l'API : supprimer toutes les candidatures et les données de non-régression ; vérifier `applications`, `news`, `actions`, `members`, `membermandates`, `rotaryyears` à 0, `admins` à 1, et **aucun fichier dans le dossier des CV chez Cloudinary**.
- [ ] T033 Secrets, périmètre et dépendances : une recherche des valeurs de `apps/api/.env` (trois valeurs Cloudinary, `JWT_SECRET`, utilisateur, mot de passe et hôte de la base) et du mot de passe du compte dans les fichiers versionnables ne renvoie rien, sans jamais afficher ces valeurs ; `apps/api/.env` n'apparaît pas dans `git status` et ne contient aucune variable `ADMIN_` ; `apps/api/.env.example` ne contient aucune valeur ; `git status` ne montre aucun fichier modifié dans `apps/web`, `apps/admin`, `DESIGN.md`, la constitution, `main.ts`, `common/filters`, `common/pipes`, `auth`, `rotary-years`, `members`, `actions`, `news` ; `apps/api/package.json` ne gagne que `cloudinary`.
- [X] T034 [P] Mettre à jour `PROJECT_CONTEXT.md` (sections « apps/api », « Périmètre et prochaines étapes », « Points d'attention », décisions ouvertes) et la ligne d'état de `CLAUDE.md` : modules `applications` et `media` en place ; Cloudinary pour le CV, fournisseur des images toujours ouvert ; CV et nom d'origine confiés à un prestataire extérieur (données personnelles) ; aucune suppression automatique ; trois variables obligatoires ; dix dépendances au lieu de neuf ; limite acceptée de la reconnaissance du type DOC ; compteur de fréquence en mémoire ; divergence `status` / `applicantStatus` du Front Office. Ne pas modifier `ARCHITECTURE.md` (fait en T001), `DESIGN.md` ni la constitution.
- [X] T035 Dérouler `quickstart.md` en entier une dernière fois, puis refaire le nettoyage de T032, et consigner dans ce fichier, pour chaque section, ce qui a été vérifié et ce qui ne l'a pas été. Ne cocher cette tâche que si toutes les sections ont réellement été déroulées.

---

## État au 2026-10-02 : vérifié contre le compte Cloudinary réel

**34 tâches sur 35 sont cochées.** Seule T033 ne l'est pas, pour un seul point : `apps/api/.env` contient encore `ADMIN_EMAIL` et `ADMIN_PASSWORD` (voir « Écarts et précisions »). Tous les autres contrôles de T033 sont faits et conformes.

Les trois variables `CLOUDINARY_*` ont été placées dans `apps/api/.env` par le porteur du projet. Le quickstart a été déroulé en entier sur une instance lancée depuis le build, port 4100, contre le compte Cloudinary réel et la base MongoDB Atlas du projet ; une seconde instance, port 4101, a reçu un secret Cloudinary faux au lancement.

| Section du quickstart | État |
|---|---|
| 1. Démarrage | **Vérifié** : sans `CLOUDINARY_API_SECRET`, arrêt avec « Configuration invalide : CLOUDINARY_API_SECRET (obligatoire ; secret Cloudinary). », sans valeur ; démarrage normal avec les trois variables ; collection `applications` vide avec ses index (`createdAt`, texte), aucun index unique ; `401` sans jeton ; `GET /applications` `404` ; aucune valeur `CLOUDINARY_*` dans le journal. |
| 2. Déposer | **Vérifié** : sept dépôts `201` `{"received":true}` (PDF, DOCX annoncé `text/plain`, DOC, même email deux fois, 5 242 880 octets, nom de fichier accentué, extension en majuscules) ; en base, `cv` porte `publicId`, `name`, `mimeType`, `size` et rien d'autre, sans `updatedAt` ; un fichier `raw` et `authenticated` par candidature chez Cloudinary ; tous les refus `400` avec leur message, `413` à 5 242 881 octets, `415` pour un texte nommé `.pdf` et un PDF nommé `.docx` ; après les refus, ni candidature ni fichier de plus. |
| 3. Consulter | **Vérifié** : liste, `meta`, champs exacts (ni `publicId`, ni `url`, ni `updatedAt`) ; type DOCX constaté ; quatre tris dans l'ordre attendu ; refus de `sort`, `q` court, `limit`, `page`, dates mal formées, paramètre non prévu ; recherche par mot entier (nom entier : un résultat ; début de nom : aucun) ; pagination ; journée entière, veille, lendemain, période inversée, bornes exactes incluses et exclues à une milliseconde près ; fiche ; six CV téléchargés identiques par empreinte, avec `Content-Type` constaté, `Content-Length`, `Content-Disposition: attachment` (repli ASCII et forme UTF-8), `Cache-Control: no-store` ; aucune référence de stockage dans les corps ni les en-têtes ; `400` et `404` sur les identifiants ; `POST`, `PATCH`, `PUT` : `404` ; `401` sans jeton et avec un jeton altéré sur les quatre routes. |
| 4. Stockage et confidentialité | **Vérifié** : fichiers `raw` et `authenticated`, identifiants `candidatures/cv/<UUID>` ; adresse de livraison non signée refusée (`401`, et `404` sous le type `upload`) ; avec un secret faux : dépôt `503` sans candidature créée, lecture du CV `503`, suppression `503` avec candidature et fichier conservés, relus ensuite sur l'instance normale ; corps « Service indisponible. » sans détail ; journaux sans email, téléphone, nom, valeur `CLOUDINARY_*`, adresse signée ni identifiant de stockage. |
| 5. Limite de fréquence | **Vérifié** : vingt dépôts reçoivent leur réponse, le vingt-et-unième (valide) `429` ; la connexion répond normalement juste après, sa sixième demande en une minute `429`. |
| 6. Supprimer | **Vérifié**, les trois cas : fichier présent → `204`, fiche et CV `404`, fichier retiré de Cloudinary ; fichier retiré à la main → lecture du CV `404`, suppression `204`, candidature retirée de la liste, une ligne de journal avec le seul identifiant de la candidature ; stockage en erreur → `503`, candidature conservée. |
| 7. Non-régression et nettoyage | **Vérifié** : santé ; `/auth/me` ; années Rotary (création, doublon `409`) ; membre et mandat (doublon `409`) ; action et actualité publiées, lues par slug ; archives ; année référencée `409` ; en-têtes de sécurité ; suppressions. Après nettoyage par l'API : `applications`, `news`, `actions`, `members`, `membermandates`, `rotaryyears` à 0, `admins` à 1, **aucun fichier sous `candidatures/` chez Cloudinary**. |
| 8. Fin d'étape | **Vérifié** : format sans changement, lint, `build:api`, `build:web`, `build:admin` réussis ; aucun fichier modifié hors périmètre ; une seule dépendance ajoutée, `cloudinary` ; aucune valeur de `.env` dans les fichiers versionnables ni dans l'historique Git ; `.env` ignoré ; `.env.example` sans valeur. |

T009 : envoi d'un PDF, relecture à l'identique par empreinte, ressource `raw` et `authenticated`, livraison non signée refusée, suppression, seconde suppression « déjà absent », lecture « absent », aucun fichier laissé. **Les deux points de `research.md`, R5, sont confirmés** : la lecture par adresse de téléchargement signée fonctionne telle qu'écrite (le repli n'a pas été nécessaire), et le compte utilisé livre les PDF.

Défaut trouvé et corrigé pendant la première vérification : un fichier envoyé dans un autre champ recevait « Requête mal formée. » au lieu du détail sur `cv` (le message d'origine est « Unexpected file field », pas « Unexpected field ») ; corrigé dans `cv-upload.interceptor.ts`, scénario rejoué. Aucun défaut de code trouvé pendant la vérification réelle.

Écarts et précisions :

- **`ADMIN_EMAIL` et `ADMIN_PASSWORD` dans `apps/api/.env`** : les deux variables y figurent, ce que T033 interdit. Le mot de passe qui s'y trouvait ne correspondait pas au compte ; à la demande du porteur du projet, un nouveau mot de passe a été écrit dans `ADMIN_PASSWORD` et appliqué par `npm run seed:admin --workspace=api`. Le porteur du projet retire lui-même ces deux lignes ; T033 se coche ensuite.
- **Lecture d'un CV volumineux** : le délai de 10 secondes (`research.md`, R5) couvre le téléchargement entier. Sur la liaison du poste de vérification, la lecture du CV de 5 242 880 octets a pris 5,5 à 8,7 secondes deux fois, et a dépassé le délai deux fois : `503` « Service indisponible. », conforme au contrat. Aucun code modifié ; le délai est une décision documentée, à revoir par le porteur du projet s'il le souhaite.
- **Refus `403`** : il ne peut pas être provoqué par l'API, le modèle n'admettant qu'un compte, de rôle `ADMIN`, relu en base à chaque demande. Vérifié par relecture : `JwtAuthGuard`, `RolesGuard` et `@Roles(ADMIN_ROLE)` sont sur la classe du contrôleur d'administration.
- **Aucun filtre par situation** : `?applicantStatus=` reçoit `400` « Champ non autorisé. », conformément au contrat (`q`, `from`, `to`, `page`, `limit`, `sort` seulement).
- **Recherche à plusieurs mots** : une adresse email entière est découpée en mots par l'index texte ; chercher `prenom.nom@exemple.org` renvoie toute candidature portant l'un de ces mots (ici, toutes celles du domaine `exemple.org`). C'est le fonctionnement de la recherche par mot entier, comme en 004, 005 et 006.
- **Exemple du contrat corrigé** (première vérification) : l'exemple de `400` montre deux champs texte ; les champs texte sont vérifiés avant le fichier.
- **Journal du stockage** : il porte l'opération, le type de l'erreur et son code HTTP, jamais son message.
- **Fichier orphelin** : si le retrait d'un fichier échoue après un échec de la base, son identifiant de stockage est journalisé (`research.md`, R7). Il n'apparaît dans aucune réponse. Ce cas n'a pas pu être provoqué.

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (phase 1)** : T001 seule, avant tout code. T002 avant T007. T003 avant T004. T005 indépendante.
- **Foundational (phase 2)** : dépend de la phase 1. T006 → T007 → T008 → T009 ; T009 exige le compte Cloudinary. T010 et T011 → T012 → T013 ; T013 dépend aussi de T008. Bloque tous les récits.
- **US1 (phase 3)** : dépend de la phase 2.
- **US2 (phase 4)** : dépend de US1 (le service, et des candidatures à lire).
- **US3 (phase 5)** : dépend de US2 (le contrôleur d'administration).
- **US4 (phase 6)** : dépend de US1 à US3 (elle relit et vérifie les trois).
- **US5 (phase 7)** : dépend de US1 à US3.
- **Polish (phase 8)** : après tous les récits. T032 après T031 ; T035 en dernier.

### Within Each User Story

- `applications.service.ts` est créé par T017, puis modifié par T021 et T024 ; `applications.module.ts` par T013, T018 et T022 ; `applications.admin.controller.ts` par T022 et T025. Ces tâches se font **l'une après l'autre**.
- Le contrôleur d'administration est créé avec ses gardes : aucune route `/admin` n'existe sans protection.
- La vérification manuelle clôt chaque récit.

### Parallel Opportunities

- T005 pendant T002 à T004.
- T010 et T011, pendant T006 à T009.
- T014, T015 et T016.
- T020 pendant la fin de US1.
- T034 pendant T030 à T033.

## Parallel Example: User Story 1

```text
T014 : apps/api/src/applications/dto/create-application.dto.ts
T015 : apps/api/src/applications/cv-file.ts
T016 : apps/api/src/applications/cv-upload.interceptor.ts
puis T017 : apps/api/src/applications/applications.service.ts
puis T018 : apps/api/src/applications/applications.public.controller.ts
```

## Implementation Strategy

### MVP First (User Story 1 Only)

Phases 1 et 2, puis US1 : les candidatures se déposent et sont conservées avec leur CV. Arrêt et validation. À ce stade elles ne sont pas encore consultables par l'API.

### Incremental Delivery

1. Alignement d'`ARCHITECTURE.md`, installation, configuration.
2. Stockage, confirmé contre le compte réel ; modèle.
3. US1, vérification, validation.
4. US2, vérification, validation.
5. US3, vérification, validation.
6. US4, vérification, validation.
7. US5, relecture.
8. Polish.

Un seul intervenant : pas de stratégie d'équipe. Les arrêts pour validation suivent la constitution (principe II) ; aucun commit sans demande explicite (principe XI).

## Couverture des exigences

| Exigences | Tâches |
|---|---|
| FR-001, FR-002, FR-003, FR-004 | T010, T012, T014 |
| FR-005 | T011, T012, T015, T016 |
| FR-006, FR-007 | T017, T018 |
| FR-008, FR-009 | T014, T015, T016, T017 |
| FR-010 | T018 |
| FR-011 | T017 |
| FR-012 | T020, T021, T022 |
| FR-013, FR-014 | T021, T022 |
| FR-015 | T024, T025 |
| FR-016 | T022, T023 |
| FR-017, FR-018, FR-019 | T021, T022, T027, T028 |
| FR-020 | T012 (aucun mécanisme d'expiration), T027 |
| FR-021, FR-022 | T022, T025 |
| FR-023 | T014, T016, T017, T020 |
| FR-024, FR-025, FR-026 | T027, T029, T033 |
| FR-027, FR-028, FR-029 | T006, T007, T008, T009 |
| FR-030 | T007, T017, T021, T024, T028 |
| FR-031 | T003, T004, T005 |
| SC-001 à SC-011 | T019, T023, T026, T028, T031, T033, T035 |

## Notes

- Aucune tâche n'écrit de test automatisé, d'état de traitement, de modification de candidature, d'email, de compte candidat, de suppression automatique, de protection anti-spam au-delà de la limite de fréquence, ni de stockage d'images.
- Aucune tâche n'ajoute Docker, CI/CD, déploiement ni configuration de mandataire.
- Aucune tâche ne touche `apps/web`, `apps/admin`, `DESIGN.md`, la constitution, `main.ts`, le filtre d'erreurs, les pipes, l'authentification, ni les modules `rotary-years`, `members`, `actions`, `news`. La configuration (`config/`) n'est modifiée que par T003 et T004.
- Seule T001 modifie `ARCHITECTURE.md` ; seule T002 installe une dépendance ; aucune tâche ne modifie `apps/api/.env`.
- Aucun message n'est créé pendant l'implémentation : ceux de `contracts/applications.md` suffisent.
- Une contradiction découverte en cours de route est signalée, pas résolue d'autorité (constitution, principe I).
