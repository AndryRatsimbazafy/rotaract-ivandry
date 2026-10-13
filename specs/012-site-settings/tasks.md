# Tasks: Réglages du site

**Input**: Design documents from `/specs/012-site-settings/`

**Prerequisites**: plan.md, spec.md, research.md (R1 à R10), data-model.md, contracts/api-site-settings.md, contracts/admin-screens.md, contracts/front-office.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`, avec `npm run lint` et `npm run build`.

**Organization**: les tâches sont groupées par récit utilisateur. La phase 2 pose le document, ses lectures et l'écran vide ; chaque récit ajoute ensuite sa partie dans l'API, le Back Office et le site.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US3).

## Path Conventions

| Application | Style |
|---|---|
| `apps/api` | TypeScript 6, NestJS, Prettier (guillemets simples, virgules finales), oxlint |
| `apps/admin`, `apps/web` | TypeScript 5, ESLint, guillemets doubles, alias `@/*` |

- Commentaires en français, sobres, comme dans le code existant.
- Avant d'écrire du code Next.js, consulter `node_modules/next/dist/docs/` de l'application concernée.
- Node 22 : `export PATH=$HOME/.nvm/versions/node/v22.23.3/bin:$PATH`.

## Décisions verrouillées à respecter

1. **Aucune dépendance ajoutée** : `package.json` et `package-lock.json` inchangés dans les trois applications.
2. **Le navigateur n'appelle ni l'API ni le fournisseur** : lectures dans les composants serveur, écritures par actions serveur.
3. **`publicId` jamais renvoyé** ; la lecture publique ne contient ni `name`, ni `mimeType`, ni `size`, ni `id` d'image, ni `updatedAt`.
4. **Rien d'inventé** : un réglage vide laisse la page dans son état actuel (FR-013).
5. **Documents avant le code** (phase 1).

---

## Phase 1: Setup (documents de référence)

**Purpose**: écrire les décisions avant le code (constitution, principes I et XII ; plan, section A).

- [X] T001 Mettre à jour `ARCHITECTURE.md` d'après `plan.md`, section A :
  - section 1 : entité **SiteSettings** (document unique `_id: "site"`, collection `site_settings`, champs et règles de `data-model.md`, listes `FaqQuestion` et `SitePhotoSlot`) ;
  - section 2 : `ImageFolder` gagne `pages` (`site/pages/`) ;
  - section 6 : `GET /site-settings` (public) ; `GET` et `PATCH /admin/site-settings` ; `PUT`, `PATCH`, `DELETE /admin/site-settings/photos/:slot` ;
  - sections 10 et 11 : `data/site-settings.ts` et ses correspondances ; écran `/site` ;
  - section 14 : décision verrouillée 21, texte du plan ;
  - section 15 : étape 11, réglages du site.
- [X] T002 [P] Mettre à jour `DESIGN.md` :
  - section 6, après le tableau « Compositions de la Home » : le paragraphe **« La fiche du club »**, mot pour mot depuis `plan.md`, section A ;
  - « Points ouverts » 1 (adresses des réseaux sociaux), 2 (photographies) et 3 (textes) : ils se renseignent désormais dans le Back Office, écran « Site ».

---

## Phase 2: Foundational (document, lectures, écran vide)

**Purpose**: le document existe, se lit en public et en administration, l'écran « Site » s'ouvre, et le site sait lire les réglages. ⚠️ Bloque toutes les histoires.

### API

- [X] T003 [P] Créer `apps/api/src/common/enums/faq-question.enum.ts` : `enum FaqQuestion { Qui = 'qui', Rencontre = 'rencontre', Sympathisant = 'sympathisant', Avant = 'avant', Membre = 'membre', Frequence = 'frequence' }`, commentaire « Liste fermée, identique aux id de apps/web/src/content/join.ts », et `REQUIRED_FAQ_QUESTIONS` = `rencontre`, `sympathisant`, `avant`, `membre` (« ne se vident pas »).
- [X] T004 [P] Créer `apps/api/src/common/enums/site-photo-slot.enum.ts` : `enum SitePhotoSlot` avec, dans cet ordre, `accueil-ouverture`, `accueil-club`, `accueil-rejoindre`, `actions-ouverture`, `actions-detail`, `membres-ouverture`, `rejoindre-ouverture`.
- [X] T005 [P] Dans `apps/api/src/media/storage.service.ts`, ajouter `'pages'` à `ImageFolder`. Vérifier que `cloudinary-storage.service.ts` dépose bien sous `site/<dossier>/` sans autre changement.
- [X] T006 Créer `apps/api/src/site-settings/schemas/site-settings.schema.ts` (dépend de T003, T004) :
  - `@Schema({ collection: 'site_settings', timestamps: true })`, `_id: { type: String }` ;
  - sous-schémas sans `_id` : `social` (`facebook?`, `instagram?`), `club` (`foundedYear?: number`, `sponsorClub?`, `memberCount?: number`, `meetingPlace?`, `meetingRhythm?`), `faq` (une propriété `String` facultative par valeur de `FaqQuestion`), `photos` (une propriété `MediaRefSchema` facultative par valeur de `SitePhotoSlot`) ;
  - constante `SITE_SETTINGS_ID = 'site'`.
- [X] T007 Créer `apps/api/src/site-settings/site-settings.service.ts` avec la lecture (dépend de T006) :
  - `findAdmin(): Promise<AdminSiteSettingsView>` et `findPublic(): Promise<PublicSiteSettingsView>`, types exportés d'après `data-model.md`, section Vues ;
  - document absent : `{ social: {}, club: {}, faq: {}, photos: {} }` (+ `updatedAt: null` en administration) ;
  - images par `toAdminImage` et `toPublicImage` de `common/schemas/media-ref.schema.ts` ; seules les clés présentes sont renvoyées.
- [X] T008 Créer `apps/api/src/site-settings/site-settings.controller.ts` (`@Controller('site-settings')`, `GET` → `findPublic`) et `site-settings.admin.controller.ts` (`@Controller('admin/site-settings')`, `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(ADMIN_ROLE)` sur la classe, commentaire « Gardé au niveau de la classe : toute route ajoutée ici est protégée. », `GET` → `findAdmin`).
- [X] T009 Créer `apps/api/src/site-settings/site-settings.module.ts` (Mongoose `forFeature`, fournisseur de `StorageService` comme `members.module.ts`), et l'importer dans `apps/api/src/app.module.ts` après `ApplicationsModule`.
- [X] T010 Vérifier avec `curl` : `GET /api/v1/site-settings` → `200` et `{"social":{},"club":{},"faq":{},"photos":{}}` ; `GET /api/v1/admin/site-settings` sans jeton → `401`. `npm run lint --workspace=api` et `npm run build:api`.

### Back Office

- [X] T011 [P] Créer `apps/admin/src/types/site-settings.ts` : `SitePhotoSlot`, `FaqQuestionId`, `SiteSettings` (forme de `AdminSiteSettingsView`, images en `AdminImage` de `types/media.ts`).
- [X] T012 [P] Créer `apps/admin/src/content/site.ts` avec `SITE_PHOTO_SLOTS` : pour chaque emplacement de `data-model.md` (dans l'ordre), `page` (« Accueil », « Actions », « Membres », « Nous rejoindre »), `label` (« Ouverture », « Le club », « Appel Nous rejoindre », « Ouverture, grande », « Ouverture, détail », « Ouverture », « Ouverture »), `ratio` (`"16 / 9"`, `"4 / 5"`, `"3 / 2"`, `"2 / 1"`), `format` affiché (`"16:9"`, `"4:5"`, `"3:2"`, `"2:1"`), `recommendedWidth` (2400 pour `accueil-ouverture` et `membres-ouverture`, 1600 sinon), `brief` repris des gabarits du site (`apps/web/src/content/*.ts` : « Une action du club, sur le terrain. », « La vie du club : une réunion, un moment d'équipe. », « Un moment de camaraderie. », « Une action en cours : des gestes, des visages. », « Un détail de la même action. », « Les membres du club, réunis pour l'année Rotary. », « Une image propre au recrutement. ») et `emptyText` (« Photographie livrée avec le site. » pour `accueil-ouverture`, « Reprend l'ouverture de l'accueil. » pour `rejoindre-ouverture`, « Aucune photographie. » sinon).
- [X] T013 [P] Dans `apps/admin/src/components/AppShell.tsx`, ajouter `{ href: "/site", label: "Site", short: "Site", Icon: LanguageOutlined }` après « Candidatures » (import `@mui/icons-material/LanguageOutlined`). Mettre à jour le commentaire des onglets (« six onglets »).
- [X] T014 Créer `apps/admin/src/app/(admin)/site/page.tsx` (composant serveur, dépend de T011) : `apiRead<SiteSettings>("/admin/site-settings")`, `PageHeader` titre « Site », sous-titre de `contracts/admin-screens.md`. Les sections sont ajoutées par les récits.

### Front Office

- [X] T015 [P] Créer `apps/web/src/types/site-settings.ts` : `FaqQuestionId`, `SitePhotoSlot`, `SiteSettings` (forme de `contracts/front-office.md`).
- [X] T016 Créer `apps/web/src/data/site-settings.ts` (dépend de T015) : `getSiteSettings()` lit `apiGet("/site-settings")`, applique `toPhoto` (`data/media.ts`) aux images et `toParagraphs` (`lib/paragraphs.ts`) aux réponses ; en cas d'erreur, renvoie l'état vide. Commentaire de tête : seule porte des réglages du site, repli sur l'état vide.

**Checkpoint** : `/site` s'ouvre vide, `getSiteSettings()` renvoie l'état vide, le site n'a pas changé.

---

## Phase 3: User Story 1 - Remplacer les gabarits des photographies du site (Priority: P1) 🎯 MVP

**Goal** : sept emplacements photographiques gérés dans le Back Office et affichés par le site, avec leurs replis.

**Independent Test** : `quickstart.md`, sections 0 et 1.

### API

- [X] T017 [US1] Dans `apps/api/src/site-settings/site-settings.service.ts`, ajouter, sur le modèle exact de `MembersService.setPortrait`, `updatePortrait` et `removePortrait` (research R5), avec le dossier `'pages'` et le chemin `photos.<slot>` :
  - `setPhoto(slot, file, dto: ImageFieldsDto)` : `storeImage`, puis `findOneAndUpdate({ _id: 'site' }, { $set: { [`photos.${slot}`]: image } }, { upsert: true })` qui renvoie l'état précédent ; en cas d'échec d'écriture, `discardImage` du nouveau fichier ; puis `discardImage` de l'ancien s'il existait ; renvoie `findAdmin()` ;
  - `updatePhoto(slot, dto: UpdateImageFieldsDto)` : `imageFieldsUpdate('photos.' + slot, dto)` sur `{ _id: 'site', ['photos.' + slot]: { $exists: true } }` ; `404` si rien ne correspond ;
  - `removePhoto(slot)` : `404` si l'emplacement est vide ; `removeImageFile` (`503` possible, l'image reste), puis `$unset` de `photos.<slot>`.
- [X] T018 [US1] Dans `site-settings.admin.controller.ts`, ajouter `@Put('photos/:slot')` (`ImageUploadInterceptor`, `@UploadedFile()`, `@Body() ImageFieldsDto`, `200`), `@Patch('photos/:slot')` (`UpdateImageFieldsDto`) et `@Delete('photos/:slot')` (`200`). `:slot` passe par `new ParseEnumPipe(SitePhotoSlot, { exceptionFactory: () => new NotFoundException() })`.
- [ ] T019 [US1] Vérifier avec `curl` et un jeton (`POST /api/v1/auth/login`) : `PUT …/photos/accueil-club` multipart → `200`, image en `AdminImage` sans `publicId` ; `PUT …/photos/inconnu` → `404` ; PDF renommé → `415` ; 6 Mo → `413` ; `PATCH` du texte alternatif ; `DELETE` → emplacement vide ; `GET /site-settings` sans `publicId`, `name`, `size`.

### Back Office

- [X] T020 [P] [US1] Créer `apps/admin/src/app/(admin)/site/photo-actions.ts` (`"use server"`), sur le modèle de `membres/images-actions.ts` : `setSitePhoto(slot, state, formData)` (`apiUpload("/admin/site-settings/photos/" + slot, "PUT", imageUploadBody(formData))`), `updateSitePhoto(slot, state, formData)` (`apiWrite(…, "PATCH", imageFieldsBody(formData))`), `removeSitePhoto(slot)` (`apiWrite(…, "DELETE")`, puis `redirect(withNotice("/site", "supprime"))` ; `404` → `withNotice("/site", "introuvable")`). Après chaque réussite : `revalidatePath("/site")`. Erreurs : `imageFailure`, `failureMessage`.
- [X] T021 [US1] Créer `apps/admin/src/app/(admin)/site/_components/SitePhotoCard.tsx` (client), d'après `contracts/admin-screens.md`, section « Photographies », en reprenant la structure de `membres/_components/PortraitSection.tsx` :
  - propriétés : la description de l'emplacement (`SITE_PHOTO_SLOTS`), `image: AdminImage | undefined`, et les trois actions liées à l'emplacement ;
  - en tête : page en étiquette, libellé, format en chiffres tabulaires, `brief` ;
  - vide : gabarit au `ratio` sur `var(--grid-chrome)`, `emptyText`, « Ajouter une photographie » ;
  - occupée : `ImageThumb` au `ratio`, texte alternatif, dimensions, avertissement si `width < recommendedWidth`, « Remplacer », « Modifier », « Retirer » (`ConfirmDialog` « Retirer cette photographie ? » / « Le fichier sera supprimé. Le site reviendra à son emplacement d'origine. ») ;
  - `ImageSheet` (« Ajouter une photographie », « Remplacer la photographie », « Modifier l'image »), `recommendedWidth` de l'emplacement ; après réussite, avis `cree` ou `modifie` et `router.refresh()`.
- [X] T022 [US1] Dans `apps/admin/src/app/(admin)/site/page.tsx`, ajouter la section « Photographies » (`SectionHeading`) : une grille de `SitePhotoCard` dans l'ordre de `SITE_PHOTO_SLOTS`, deux colonnes à partir de 900 px, une sur téléphone ; actions liées par `.bind(null, slot)`.

### Front Office

- [X] T023 [P] [US1] `apps/web/src/app/_sections/Opening.tsx` : propriété `photo?: Photo` ; `photo ?? opening.photo`. Voile, signature et `priority` inchangés.
- [X] T024 [P] [US1] `apps/web/src/app/_sections/About.tsx` : propriété `photo?: Photo`, passée à `PhotoFrame`. `JoinField.tsx` : même chose.
- [X] T025 [P] [US1] `apps/web/src/app/actions/_sections/ActionsOpening.tsx` : propriétés `mainPhoto?: Photo` et `detailPhoto?: Photo`, passées aux deux `PhotoFrame`. `apps/web/src/app/membres/_sections/MembersOpening.tsx` : propriété `photo?: Photo`.
- [X] T026 [P] [US1] `apps/web/src/app/rejoindre/_sections/JoinOpening.tsx` : propriétés `photo?: Photo` et `homeOpening?: Photo` ; image affichée : `photo`, sinon `homeOpening` (son propre point d'intérêt), sinon `{ ...opening.photo, focus: "55% 40%" }` comme aujourd'hui.
- [X] T027 [US1] Pages (dépend de T016, T023 à T026) :
  - `apps/web/src/app/page.tsx` : `getSiteSettings()` dans le `Promise.all` ; `Opening photo={settings.photos["accueil-ouverture"]}`, `About photo={settings.photos["accueil-club"]}`, `JoinField photo={settings.photos["accueil-rejoindre"]}` ;
  - `apps/web/src/app/actions/page.tsx` : `actions-ouverture` et `actions-detail` vers `ActionsOpening` ;
  - `apps/web/src/app/membres/page.tsx` : `membres-ouverture` vers `MembersOpening` ;
  - `apps/web/src/app/rejoindre/page.tsx` : `await connection()` (`next/server`) avec le commentaire de `app/page.tsx` sur le rendu à la demande ; `rejoindre-ouverture` et `accueil-ouverture` vers `JoinOpening`.
- [ ] T028 [US1] Vérification manuelle : `quickstart.md`, sections 0 et 1, puis lint et build des trois applications.

**Checkpoint** : US1 livrable seule.

---

## Phase 4: User Story 2 - Relier les pictogrammes des réseaux sociaux (Priority: P1)

**Goal** : deux adresses saisies dans le Back Office, pictogrammes reliés partout sur le site.

**Independent Test** : `quickstart.md`, section 2.

### API

- [X] T029 [US2] Créer `apps/api/src/site-settings/dto/update-site-settings.dto.ts` avec la partie `social` :
  - transformation commune : `trim` (de `members/dto/create-member.dto.ts`), puis chaîne vide → `null` ;
  - `SocialDto` : `facebook?: string | null` (`@ValidateIf(v !== null)`, `@IsUrl({ protocols: ['https'], require_protocol: true, host_whitelist: ['facebook.com', 'www.facebook.com', 'm.facebook.com', 'fb.com'] })`, `@MaxLength(300)`, message « Indiquez l'adresse complète de la page Facebook du club, commençant par https:// ») et `instagram?: string | null` (hôtes `instagram.com`, `www.instagram.com`, message « Indiquez l'adresse complète du compte Instagram du club, commençant par https:// ») ;
  - `UpdateSiteSettingsDto` : `social?: SocialDto` (`@IsOptional`, `@ValidateNested`, `@Type(() => SocialDto)`).

  Vérifier que le filtre d'erreurs produit des `details[].field` en chemin pointé (`social.facebook`) ; sinon, l'adapter dans la seule fonction qui aplatit les erreurs imbriquées.
- [X] T030 [US2] Dans `site-settings.service.ts`, ajouter `update(dto)` : pour chaque clé présente, `$set` de `<groupe>.<champ>` ou `$unset` si `null` ; `findOneAndUpdate({ _id: 'site' }, update, { upsert: true })` ; renvoie `findAdmin()`. Dans `site-settings.admin.controller.ts`, ajouter `@Patch()` avec `UpdateSiteSettingsDto`.
- [ ] T031 [US2] Vérifier avec `curl` : `PATCH` `{ "social": { "facebook": "https://www.facebook.com/x" } }` → `200` ; `http://…` et une adresse Instagram dans `facebook` → `400` avec `details[].field = "social.facebook"` ; `{ "social": { "facebook": null } }` vide le champ ; clé inconnue → `400`.

### Back Office

- [X] T032 [P] [US2] Créer `apps/admin/src/app/(admin)/site/actions.ts` (`"use server"`) avec `saveSocial(state, formData)` : lit `facebook` et `instagram` (vide → `null`), `apiWrite("/admin/site-settings", "PATCH", { social })`, erreurs par `failure` de `lib/form-errors.ts` (champs `social.facebook` et `social.instagram` ramenés aux noms du formulaire) ; réussite : `revalidatePath("/site")`, `redirect(withNotice("/site", "modifie"))`.
- [X] T033 [US2] Créer `apps/admin/src/app/(admin)/site/_components/SocialForm.tsx` (client, `useActionState`, sur le modèle de `membres/_components/MemberForm.tsx`) : champs « Page Facebook » et « Compte Instagram » (`type="url"`, `inputMode="url"`), aides de `contracts/admin-screens.md`, erreurs sous les champs, bouton « Enregistrer ». L'ajouter à `site/page.tsx` dans une section « Réseaux sociaux », après « Photographies ».

### Front Office

- [X] T034 [US2] `apps/web/src/components/layout/SocialLinks.tsx` devient un composant serveur asynchrone : adresse de chaque réseau lue dans `(await getSiteSettings()).social`, libellés et identifiants de `config/site.ts`. Une adresse absente garde le rendu actuel (« … : lien à venir »). Dans `apps/web/src/config/site.ts`, retirer `href` de `SocialLink` et les adresses vides ; mettre à jour les commentaires. Vérifier que `SiteHeader`, `SiteFooter` et `MobileMenu` (qui reçoit `<SocialLinks />` en propriété) compilent sans autre changement.
- [ ] T035 [US2] Vérification manuelle : `quickstart.md`, section 2, à 1280 px et dans le menu du téléphone à 375 px ; lint et build.

---

## Phase 5: User Story 3 - Présenter le club et répondre aux questions fréquentes (Priority: P2)

**Goal** : cinq informations de présentation et six réponses de FAQ saisies dans le Back Office, affichées par le site.

**Independent Test** : `quickstart.md`, section 3.

### API

- [X] T036 [US3] Dans `apps/api/src/site-settings/dto/update-site-settings.dto.ts`, ajouter :
  - `ClubDto` : `foundedYear?: number | null` (entier, « de 1968 à l'année en cours », borne haute calculée à la validation, message « L'année de création est une année entre 1968 et l'année en cours. ») ; `sponsorClub?: string | null` (« 120 caractères au plus », message « Le club parrain compte 120 caractères au plus. ») ; `memberCount?: number | null` (« Entier de 1 à 999 », message « Le nombre de membres est un entier de 1 à 999. ») ; `meetingPlace?: string | null` (« 160 caractères au plus », message « Le lieu des réunions compte 160 caractères au plus. ») ; `meetingRhythm?: string | null` (« 160 caractères au plus », message « Le rythme des réunions compte 160 caractères au plus. ») ;
  - `FaqDto` : une propriété `string | null` facultative par valeur de `FaqQuestion`, « 1 à 1000 caractères », message « La réponse compte 1000 caractères au plus. » ; pour `REQUIRED_FAQ_QUESTIONS`, `null` refusé avec « Cette question a besoin d'une réponse. » ;
  - `club?: ClubDto` et `faq?: FaqDto` dans `UpdateSiteSettingsDto` (`ValidateNested`, `Type`).

  `update(dto)` (T030) les écrit sans changement.
- [ ] T037 [US3] Vérifier avec `curl` : `club` partiel → `200` ; `foundedYear: 1950` et `memberCount: 0` → `400` ; `faq.frequence` sur deux paragraphes → `200` ; `faq.sympathisant: null` → `400` « Cette question a besoin d'une réponse. » ; `faq.qui: null` → champ retiré.

### Back Office

- [X] T038 [P] [US3] Dans `apps/admin/src/content/site.ts`, ajouter `FAQ_QUESTIONS` : pour chaque valeur de `FaqQuestionId`, dans l'ordre du site, `question` (intitulé exact de `apps/web/src/content/join.ts`), `currentAnswer` (les réponses actuelles de `rencontre`, `sympathisant`, `avant`, `membre`, paragraphes joints par une ligne vide ; vide pour `qui` et `frequence`) et `required` (vrai pour les quatre). Commentaire : copie de `apps/web/src/content/join.ts`, sert d'intitulé et de valeur initiale tant que rien n'est enregistré (research R3).
- [X] T039 [US3] Dans `apps/admin/src/app/(admin)/site/actions.ts`, ajouter `saveClub(state, formData)` (nombres convertis par `Number`, vide → `null`) et `saveFaq(state, formData)` (six clés envoyées ; vide → `null`), sur le modèle de `saveSocial`, champs `club.*` et `faq.*` ramenés aux noms du formulaire.
- [X] T040 [US3] Créer `apps/admin/src/app/(admin)/site/_components/ClubForm.tsx` (client) : cinq champs de `contracts/admin-screens.md` (« Année de création » et « Nombre de membres » en `inputMode="numeric"`), aide de tête « Seules les informations remplies apparaissent sur le site. », aide « À mettre à jour à chaque année Rotary. » sous le nombre de membres.
- [X] T041 [US3] Créer `apps/admin/src/app/(admin)/site/_components/FaqForm.tsx` (client) : six champs multilignes intitulés par leur question ; valeur initiale = réponse enregistrée, sinon `currentAnswer` ; aide « Vide : la question n'apparaît pas sur le site. » sous `qui` et `frequence`, aide générale « Séparez les paragraphes par une ligne vide. » ; un champ `required` vidé est refusé avant l'envoi avec « Cette question a besoin d'une réponse. ».
- [X] T042 [US3] Dans `site/page.tsx`, ajouter la section « Textes » après « Réseaux sociaux » : `ClubForm` (sous-titre « Présentation du club ») puis `FaqForm` (sous-titre « Questions fréquentes »).

### Front Office

- [X] T043 [P] [US3] `apps/web/src/content/home.ts` : dans `about`, ajouter `facts` avec les intitulés « Création », « Club parrain », « Membres », « Réunions », « Rythme » ; garder `pending`.
- [X] T044 [US3] `apps/web/src/app/_sections/About.tsx` et `About.module.css` : propriété `club` ; sous les paragraphes, la fiche du club telle que `DESIGN.md` la décrit (T002) : `<dl>`, une ligne par information renseignée, filets encre de 1 px (`var(--rule-strong)` ou le token des filets du registre), intitulé en étiquette (`label`, couleur `var(--text-secondary)`) à gauche, valeur en graisse 600 à droite, `font-variant-numeric: tabular-nums` pour l'année et le nombre ; `pending` affiché seulement si les cinq sont vides. Passer `settings.club` depuis `app/page.tsx`.
- [X] T045 [US3] `apps/web/src/app/rejoindre/_sections/JoinFaq.tsx` : propriété `answers: SiteSettings["faq"]` ; pour chaque question, `answers[item.id] ?? item.answer` ; une question sans réponse reste masquée. Le filtre passe du niveau du module à l'intérieur du composant. Passer `settings.faq` depuis `app/rejoindre/page.tsx`.
- [ ] T046 [US3] Vérification manuelle : `quickstart.md`, section 3 ; contrôle visuel de la fiche du club à 1280 et 375 px ; lint et build.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [X] T047 [P] `apps/admin/DESIGN.md`, section Components : ajouter « Carte d'emplacement photographique » (`SitePhotoCard` : gabarit au format, description attendue, actions) et l'écran « Site ».
- [X] T048 Documentation de fin d'après `plan.md`, section A : `ARCHITECTURE.md` (en-tête « Implémenté », étape 11 faite) ; `PROJECT_CONTEXT.md` (état, « Fait », section Back Office, retrait des photographies du site de « Hors de ce qui est construit », note sur `/rejoindre` rendue à la demande) ; ligne d'état de `CLAUDE.md`.
- [X] T049 [P] Contrôles de périmètre :
  - `git diff --stat main -- '*/package.json' package-lock.json` est vide ;
  - `grep -rn "cloudinary" apps/api/src` ne trouve que `apps/api/src/media/` ;
  - `grep -rn "publicId" apps/api/src/site-settings` ne le trouve que dans le service, jamais dans une vue renvoyée ;
  - aucun appel à `/admin` dans `apps/web/src`.
- [ ] T050 Contrôle final : `quickstart.md` sections 4 (pannes) et 5 (téléphone, six onglets à 375 px), `npm run lint` et `npm run build`, puis nettoyage (section 6).
- [X] T051 Mettre à jour le guide publié (`https://claude.ai/artifact/LNKaGG9d13Jesiqoc1nC4Y`) : repères `Code` des réseaux sociaux, de la présentation, de la FAQ et des photographies fixes remplacés par `BO` (écran « Site ») ; module « Réglages du site » décrit.

---

## Dependencies & Execution Order

- **Phase 1** (T001, T002) avant tout code.
- **Phase 2** bloque les récits. Ordre interne : T003–T005 → T006 → T007 → T008 → T009 → T010 ; T011–T013 en parallèle, puis T014 ; T015 puis T016.
- **US1** (phase 3), **US2** (phase 4) et **US3** (phase 5) ne dépendent que de la phase 2. Exceptions : T036 complète le DTO créé par T029 et réutilise `update()` de T030 ; T039 complète `actions.ts` créé par T032. Si US3 se fait avant US2, créer alors le DTO, `update()` et `actions.ts` dans US3.
- **Phase 6** après les récits retenus.

### Parallel Opportunities

- Phase 2 : T003, T004, T005, T011, T012, T013, T015.
- US1 : T020 avec T023–T026 (fichiers différents), après T017–T019 pour l'API.
- US3 : T038 et T043 dès le début du récit.

## Implementation Strategy

1. **MVP** : phases 1, 2 et 3 (photographies). C'est le gain le plus visible ; vérifier `quickstart.md`, sections 0 et 1, puis s'arrêter si besoin.
2. **Incrément 2** : US2 (réseaux sociaux), le plus court.
3. **Incrément 3** : US3 (textes), avec la fiche du club.
4. Polish, puis mise à jour du guide.
