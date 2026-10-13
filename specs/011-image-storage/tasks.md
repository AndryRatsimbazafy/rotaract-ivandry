# Tasks: Stockage des images

**Input**: Design documents from `/specs/011-image-storage/`

**Prerequisites**: plan.md, spec.md, research.md (R1 à R11), data-model.md, contracts/api-images.md, contracts/admin-screens.md, contracts/front-office.md, quickstart.md

**Tests**: aucun test automatisé (constitution, principe IX). Chaque récit se termine par une tâche de **vérification manuelle** tirée de `quickstart.md`, avec `npm run lint` et `npm run build`.

**Organization**: les tâches sont groupées par récit utilisateur. US1 (photographies d'une action) porte l'essentiel de l'infrastructure partagée avec US3 ; US2 (portrait) en réutilise une partie.

## Format: `[ID] [P?] [Story] Description`

- **[P]** : peut se faire en parallèle (fichier différent, aucune dépendance sur une tâche non terminée).
- **[Story]** : récit concerné (US1 à US4).

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
2. **Le navigateur n'appelle ni l'API ni le fournisseur.** Les envois passent par une action serveur du Back Office, qui relaie à l'API en `multipart/form-data`.
3. **Le fournisseur n'est connu que de `apps/api/src/media/`.** Aucun autre fichier n'importe `cloudinary`.
4. **`publicId` n'apparaît dans aucune réponse de l'API.** Les lectures publiques n'exposent que `url`, `width`, `height`, `alt`, `caption`, `credit` et `focus`.
5. **Validation des images**, reprise telle quelle :
   - JPEG, PNG ou WebP, constaté sur le contenu ;
   - « de 1 à 5 242 880 octets » ;
   - `alt` « de 1 à 300 caractères après épuration » ;
   - `caption` « 300 au plus » ;
   - `credit` « 120 au plus » ;
   - `focus` au format `^(\d{1,3})% (\d{1,3})%$`, « chaque valeur de 0 à 100 », défaut `"50% 50%"` ;
   - `photos` « de 0 à 20 ».
6. **Ménage** (research, R8) :
   - dépôt, puis écriture, puis retrait du fichier si l'écriture échoue ;
   - un retrait commence par le fichier ;
   - la suppression d'un contenu commence par ses fichiers ;
   - stockage indisponible : `503` et rien n'est modifié ;
   - un fichier déjà absent n'empêche rien.
7. **Messages** : ceux de `contracts/api-images.md` et `contracts/admin-screens.md`, mot pour mot.
8. **Inchangés** : le CV (routes, stockage privé, `FileRef`) et les corps d'écriture des contrats 004 à 006.
9. Rien n'est commité ni poussé sans demande explicite.

## Prérequis manuels (hors tâches)

- `apps/api/.env` complet (avec les `CLOUDINARY_*`), `apps/admin/.env.local` et `apps/web/.env.local`.
- Un accès à la console Cloudinary.
- Les images de test de `quickstart.md`.

---

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 [P] Dans `apps/admin/next.config.ts`, en gardant `logging` :
  - ajouter `experimental.serverActions.bodySizeLimit: "6mb"`, avec un commentaire repris de `apps/web/next.config.ts` et adapté aux images (research, R6) ;
  - ajouter `images.remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com", pathname: "/*/image/upload/**" }]`.
- [X] T002 [P] Dans `apps/web/next.config.ts`, ajouter le même `images.remotePatterns`, sans toucher à `serverActions` (research, R9).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose** : stockage d'image, schéma `MediaRef`, validation, relais du Back Office et composants de saisie. **Aucun récit ne commence avant la fin de cette phase.**

### API

- [X] T003 Dans `apps/api/src/media/storage.service.ts`, ajouter à `StorageService` :
  - `export type ImageFolder = 'membres' | 'actions' | 'actualites'` ;
  - `export type StoredImage = { id: string; url: string; width: number; height: number; bytes: number; format: string }` ;
  - les méthodes abstraites `uploadImage(content: Buffer, folder: ImageFolder): Promise<StoredImage>` et `deleteImage(id: string): Promise<StorageDeletion>` ;
  - des commentaires qui ne nomment aucun fournisseur.

  Ne pas toucher à `upload`, `read` ni `delete`.
- [X] T004 Dans `apps/api/src/media/cloudinary-storage.service.ts`, réaliser `uploadImage` et `deleteImage` (research, R2 et R4).
  - **Envoi** : `upload_stream` avec `resource_type: 'image'`, `type: 'upload'`, `public_id: \`site/${folder}/${randomUUID()}\``, `overwrite: false`, `timeout: TIMEOUT_MS`, et la transformation entrante `transformation: [{ angle: 'exif' }]`. Renvoyer `{ id: result.public_id, url: result.secure_url, width, height, bytes, format }`.
  - **Suppression** : `destroy(id, { resource_type: 'image', type: 'upload', invalidate: true })`, avec le même traitement de `'ok'` et de `'not found'` que `delete`.
  - **Échecs** : passer par `failure()`, en ajoutant les opérations `'envoi d'image'` et `'suppression d'image'` au type `Operation`.
  - Garder la constante `FOLDER` des CV pour le CV seulement.
- [X] T005 [P] Créer `apps/api/src/media/image-file.ts` (research, R3).
  - `export const IMAGE_MAX_BYTES = 5 * 1024 * 1024` ;
  - `export const IMAGE_TYPE_MESSAGE = 'Format d'image non accepté : JPEG, PNG ou WebP.'` ;
  - `export function detectImageType(content: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null`, par les signatures :
    - JPEG : `FF D8 FF` ;
    - PNG : `89 50 4E 47 0D 0A 1A 0A` ;
    - WebP : `RIFF` aux octets 0 à 3 et `WEBP` aux octets 8 à 11.
- [X] T006 [P] Créer `apps/api/src/media/image-upload.interceptor.ts` sur le modèle exact de `apps/api/src/applications/cv-upload.interceptor.ts`.
  - Champ `IMAGE_FIELD = 'image'`, `limits: { files: 1, fileSize: IMAGE_MAX_BYTES, fields: 10, fieldSize: 2048 }`, `defParamCharset: 'utf8'`.
  - Type `UploadedImage = { originalname: string; size: number; buffer: Buffer }`.
  - Dépassement : `413`. Mauvais champ ou plusieurs fichiers : `400` avec `details: [{ field: 'image', message: 'Une image est attendue, dans le champ « image ».' }]`.
- [X] T007 Dans `apps/api/src/media/media.module.ts`, exporter ce qu'il faut pour que les modules métier utilisent l'intercepteur (il n'a pas de dépendance injectée : l'importer suffit). Vérifier que `MembersModule`, `ActionsModule` et `NewsModule` importent `MediaModule`, et l'ajouter sinon.
- [X] T008 [P] Créer `apps/api/src/common/schemas/media-ref.schema.ts` (data-model, R5).
  - Schéma `MediaRef` **avec** `_id`, et les champs :
    - `url`, obligatoire ;
    - `publicId`, obligatoire, commenté « Jamais renvoyé par l'API » ;
    - `name`, obligatoire, `maxlength: 255` ;
    - `mimeType`, obligatoire, enum des trois types ;
    - `size`, obligatoire, `min: 1`, `max: 5242880` ;
    - `width` et `height`, obligatoires, `min: 1` ;
    - `alt`, obligatoire, `trim`, `minlength: 1`, `maxlength: 300` ;
    - `caption`, `trim`, `maxlength: 300` ;
    - `credit`, `trim`, `maxlength: 120` ;
    - `focus`, obligatoire, défaut `'50% 50%'`.
  - Exporter `MediaRefSchema`.
  - Exporter `toAdminImage(ref)`, qui renvoie `{ id, url, width, height, alt, caption: caption ?? null, credit: credit ?? null, focus, name, mimeType, size }`, et `toPublicImage(ref)`, qui renvoie `{ url, width, height, alt, focus }`, plus `caption` et `credit` seulement s'ils sont présents.
- [X] T009 [P] Créer `apps/api/src/common/dto/image-fields.dto.ts` avec `class-validator` et la transformation d'épuration déjà utilisée dans les DTO des membres.
  - `ImageFieldsDto` : `alt`, chaîne obligatoire, de 1 à 300 après épuration (« Le texte alternatif est obligatoire. », « Le texte alternatif compte 300 caractères au plus. ») ; `caption` facultatif, 300 au plus (« La légende compte 300 caractères au plus. ») ; `credit` facultatif, 120 au plus (« Le crédit compte 120 caractères au plus. ») ; `focus` facultatif, motif `^(\d{1,3})% (\d{1,3})%$` avec chaque valeur de 0 à 100 (« Le point d'intérêt doit être de la forme « 50% 30% ». »). Une chaîne vide de `caption` ou de `credit` devient `undefined`.
  - `UpdateImageFieldsDto` : les mêmes champs, tous facultatifs ; `caption` et `credit` acceptent `null` (retrait).
  - `ReorderPhotosDto` : `photoIds`, tableau d'ObjectId valides, de 0 à 20, sans doublon.
- [X] T010 Créer `apps/api/src/media/content-images.ts` (plan, B1.5), un utilitaire **sans fournisseur**, utilisé par les services.
  - `storeImage(storage, file, folder, fields)` :
    - contrôle `size > 0`, sinon le `400` du champ `image` ;
    - `detectImageType`, sinon `415` avec `IMAGE_TYPE_MESSAGE` ;
    - `uploadImage` ; une `StorageError` devient `503` « Service indisponible. » ;
    - renvoie l'objet `MediaRef` à écrire, avec `name` passé par `cleanFileName` de `applications/cv-file.ts` (l'importer).
  - `discardImage(storage, publicId, logger)` : `deleteImage` sans relancer ; un échec est journalisé « Fichier orphelin au stockage : <id>. ».
  - `removeImageFile(storage, publicId)` : `deleteImage` ; une `StorageError` devient `503`.
  - `assertCompleteOrder(current: string[], requested: string[])`, sinon `400` « La liste doit contenir toutes les photographies, chacune une fois. ».
  - `PHOTOS_MAX = 20`, `PHOTOS_FULL_MESSAGE = 'Ce contenu a déjà 20 photographies.'`.

### Back Office

- [X] T011 Dans `apps/admin/src/lib/api.ts`, ajouter `apiUpload<T>(path, method: "POST" | "PUT", formData: FormData): Promise<T>` (research, R7).
  - Même traitement que `apiWrite` : `401`, puis `clearSession` et la redirection vers `LOGIN_EXPIRED_PATH` ; `403`, puis `FORBIDDEN_PATH`.
  - Jeton dans `Authorization`, **sans** `Content-Type` ; délai de 30 000 ms ; `toApiError` pour les échecs.
  - Ne rien changer aux fonctions existantes.
- [X] T012 [P] Créer `apps/admin/src/types/media.ts`, avec `AdminImage = { id; url; width; height; alt; caption: string | null; credit: string | null; focus; name; mimeType; size }`. Dans `apps/admin/src/types/member.ts`, ajouter `portrait: AdminImage | null` à `Member`. Dans `apps/admin/src/types/action.ts` et `news.ts`, ajouter `photos: AdminImage[]`.
- [X] T013 [P] Créer `apps/admin/src/lib/image-reduction.ts` (client), d'après `client/src/lib/imageCompression.ts` de l'application de trésorerie (research, R6). Exporter `prepareImage(file: File): Promise<{ blob: Blob; name: string; width: number; height: number }>`.
  - Refus, avec une `Error` dont le message est le texte de l'API : type hors `image/jpeg`, `image/png` ou `image/webp` (« Format d'image non accepté : JPEG, PNG ou WebP. »), ou plus de 5 242 880 octets (« L'image dépasse 5 Mo. »).
  - Réduction : `createImageBitmap(file)` ; côté le plus long ramené à 3000 au plus, sans agrandir ; dessin sur un `canvas` ; `toBlob("image/webp", 0.85)`, ou `"image/jpeg"` si le résultat n'est pas du WebP.
  - Repli : si la réduction échoue, ou si le résultat est plus lourd que l'original, renvoyer l'original avec ses dimensions (lues par `createImageBitmap` si possible).
  - Nom : celui d'origine, avec l'extension du type produit.
- [X] T014 [P] Créer `apps/admin/src/components/ImageThumb.tsx` : `next/image` en `fill` dans un cadre au ratio donné (`"4/5"`, `"3/2"`), avec `object-fit: cover` et `object-position: focus`, un fond `var(--grid-chrome)` et un filet ; propriétés `image`, `ratio`, `width` (px), `sizes`.
- [X] T015 [P] Créer `apps/admin/src/components/FocusPicker.tsx` (client), d'après `contracts/admin-screens.md`.
  - L'image entière (`object-fit: contain`) dans un cadre de 432 px de large au plus ; repère circulaire de 16 px, au contour cranberry et au centre transparent.
  - Un clic fixe le point en pourcentages entiers. Au clavier, la zone a `tabIndex=0` et `role="slider"`-like : les flèches déplacent de 5, et le nom accessible dit « Point d'intérêt : X %, Y % ».
  - Bouton texte « Recentrer » ; `value` et `onChange` au format `"X% Y%"`.
- [X] T016 Créer `apps/admin/src/components/ImageSheet.tsx` (client), le panneau image de `contracts/admin-screens.md`, construit sur `SideSheet`.
  - **Propriétés** : `title`, `mode` (`"create"` ou `"edit"`), `initial?: AdminImage`, `recommendedWidth` (1200 ou 1600), `action: (state, formData) => Promise<FormState>`, `onClose`.
  - **En création** : bouton « Choisir une image » ; `prepareImage` avec « Préparation de l'image… » (`LinearProgress`) ; vignette `FocusPicker` sur un `URL.createObjectURL`, libéré à la fermeture.
  - **En modification** : vignette de l'image existante, sans choix de fichier.
  - **Champs** : texte alternatif (multiligne, aide « Décrit ce que l'image montre, pour qui ne la voit pas. »), légende (aide « Quoi, où, quand. »), crédit.
  - **Dimensions** : `L × H px` en `tabularNums`, et l'avertissement « Image plus petite que la largeur conseillée : elle sera affichée en petit. » sous `recommendedWidth`.
  - **Envoi** : construire un `FormData` (`image` = le blob avec son nom, `alt`, `caption`, `credit`, `focus`) et appeler l'action dans `startTransition`, en passant par `useActionState`. Pied « Enregistrer » (« Envoi… » pendant l'envoi) et « Annuler ».
  - **Erreurs** : `fieldErrors` sous les champs (`image` sous le bouton), `message` en tête ; la saisie est conservée.

### Front Office

- [X] T017 [P] Créer `apps/web/src/data/media.ts`, avec `ApiImage = { url; width; height; alt; caption?; credit?; focus }` et `toPhoto(image: ApiImage): Photo`, qui renvoie `{ src: image.url, width, height, alt, caption, credit, focus }` (`ARCHITECTURE.md`, section 10).
- [X] T018 [P] Modifier `apps/web/src/components/media/PhotoFrame.tsx` et son module CSS (research, R9 ; `contracts/front-office.md`) :
  - quand une photo existe, poser sur le cadre `style={{ maxWidth: photo.width }}` : une image plus petite que le cadre ne s'étire jamais ;
  - afficher le crédit même sans légende, en `figcaption` (« Photo : <crédit>. ») ;
  - ne pas changer le gabarit.
- [X] T019 Vérifier la phase : `npm run lint` et `npm run build` passent pour les trois applications.

**Checkpoint** : infrastructure prête, rien de visible encore.

---

## Phase 3: User Story 1 - Ajouter les photographies d'une action (Priority: P1) 🎯 MVP

**Goal** : de 0 à 20 photographies par action, saisies sur la fiche, ordonnées, affichées par le site.

**Independent Test** : `quickstart.md`, sections 2 et 3.

- [X] T020 [US1] Dans `apps/api/src/actions/schemas/action.schema.ts`, ajouter `@Prop({ type: [MediaRefSchema], default: [] }) photos: MediaRef[]`. Dans `apps/api/src/actions/actions.service.ts` :
  - ajouter `photos: AdminImage[]` à `AdminActionView` (par `toAdminImage`) et `photos: PublicImage[]` à `PublicActionView` (par `toPublicImage`) ;
  - remplir ces champs dans les fonctions de vue existantes.
- [X] T021 [US1] Dans `apps/api/src/actions/actions.service.ts`, ajouter quatre méthodes, avec les utilitaires de T010 et le dossier `'actions'`. Chacune renvoie la vue de détail d'administration.
  - **`addPhoto(id, file, dto)`** :
    1. contenu introuvable : `404` (rien n'est déposé) ;
    2. `photos.length >= 20` : `409` avec `PHOTOS_FULL_MESSAGE` ;
    3. `storeImage` ;
    4. `findOneAndUpdate({ _id: id, 'photos.19': { $exists: false } }, { $push: { photos: ref } })` ;
    5. sans document modifié : `discardImage`, puis `404` ou `409`.
  - **`updatePhoto(id, photoId, dto)`** : `$set` sur `photos.$` par `photos._id` ; `null` retire `caption` ou `credit` (`$unset`) ; `404` si l'action ou la photographie n'existe pas.
  - **`removePhoto(id, photoId)`** : trouver la photographie (`404`), `removeImageFile` (`503` possible), puis `$pull`.
  - **`reorderPhotos(id, dto)`** : `assertCompleteOrder`, puis réécriture de `photos` dans l'ordre demandé.
- [X] T022 [US1] Dans `apps/api/src/actions/actions.admin.controller.ts`, ajouter les routes de `contracts/api-images.md`, protégées comme le reste du contrôleur, et `ParseObjectIdPipe` sur `:id` et `:photoId` :
  - `@Post(':id/photos')`, avec `@UseInterceptors(ImageUploadInterceptor)`, `@UploadedFile()` et `@Body() ImageFieldsDto`, en `201` ;
  - `@Patch(':id/photos/:photoId')`, avec `UpdateImageFieldsDto` ;
  - `@Delete(':id/photos/:photoId')`, en `200`, avec la vue ;
  - `@Put(':id/photos/order')`, avec `ReorderPhotosDto`.

  **Déclarer `order` avant `:photoId`** dans le contrôleur.
- [ ] T023 [US1] Vérifier l'API avec `curl` : multipart avec un jeton obtenu par `POST /api/v1/auth/login`, cas de `quickstart.md` section 2 (`413`, `415`, `409`, ordre, absence de `publicId` dans les réponses) et section 3 (orientation).
- [X] T024 [P] [US1] Créer `apps/admin/src/app/(admin)/actions/images-actions.ts` (`"use server"`), avec `addPhoto(id, returnTo, state, formData)`, `updatePhoto(id, photoId, returnTo, state, formData)`, `removePhoto(id, photoId, returnTo)` et `reorderPhotos(id, photoIds, returnTo)`.
  - Lire et épurer `alt`, `caption`, `credit` et `focus`, puis relayer par `apiUpload` (ajout) ou `apiWrite` (le reste).
  - Les erreurs passent par `failure` et `failureMessage` de `lib/form-errors.ts`. Un `404` du contenu donne `goneToList`.
  - Réussite : `revalidatePath("/actions", "layout")`, puis `{ values: {}, ok: true }` pour le panneau. Pour le retrait et l'ordre : `redirect(withNotice(<fiche>, "supprime" | "ordre"))`.
- [X] T025 [US1] Créer `apps/admin/src/components/PhotosSection.tsx` (client), partagé avec US3, d'après `contracts/admin-screens.md`.
  - Propriétés : `photos`, `returnTo`, et les quatre actions déjà liées au contenu.
  - Titre de section « Photographies · N / 20 », compteur en chiffres tabulaires ; « Ajouter une photographie » désactivé à 20, avec l'infobulle.
  - Grille : rang (« Principale » en `StatusMark` `info` au rang 1), `ImageThumb` 3:2 de 96 px, texte alternatif et légende, dimensions avec avertissement sous 1600 px, « Monter » et « Descendre » (`IconButton`, noms accessibles « Monter la photographie N »), et un menu de ligne `RowMenu` avec « Modifier » et « Retirer ». « Retirer » ouvre la confirmation « Retirer cette photographie ? » / « Le fichier sera supprimé. ».
  - « Aucune photographie. » quand la liste est vide.
  - `ImageSheet` en création (titre « Ajouter une photographie ») et en modification (« Modifier l'image »), avec `recommendedWidth: 1600`.
  - Après réussite du panneau : `router.refresh()` et l'avis (`?avis=cree` ou `modifie`, comme `MandatesSection`).
  - `RowMenu` accepte aujourd'hui `openHref`, `publish` et `remove`. Si une entrée « Modifier » y manque, lui ajouter une propriété facultative `edit?: { label: string; onClick: () => void }`.
- [X] T026 [US1] Dans `apps/admin/src/app/(admin)/actions/[id]/page.tsx`, ajouter `PhotosSection` entre `ActionForm` et `DeleteSection`, avec les actions liées à `action.id` et à l'adresse de la fiche. Dans `apps/admin/src/app/(admin)/actions/nouvelle/page.tsx`, ajouter sous le formulaire la ligne « Les photographies s'ajoutent sur la fiche, après l'enregistrement. » (`Typography` `body2`, `text.secondary`).
- [X] T027 [P] [US1] Dans `apps/admin/src/app/(admin)/actions/_components/ActionInspector.tsx`, quand `action.photos[0]` existe, afficher en tête un `ImageThumb` 3:2 sur toute la largeur et, dans le `FieldList`, « Photographies : N ».
- [X] T028 [P] [US1] Dans `apps/web/src/data/actions.ts`, ajouter `photos: ApiImage[]` à la forme de l'API et remplacer `photos: []` par `action.photos.map(toPhoto)`.
- [ ] T029 [US1] Vérification manuelle : `quickstart.md`, sections 2, 3 et 6 (action). Puis lint et build.

**Checkpoint** : US1 livrable seule.

---

## Phase 4: User Story 2 - Donner un portrait à un membre (Priority: P1)

**Goal** : un portrait par membre, ajouté, remplacé, modifié ou retiré sur la fiche, et affiché par le site.

**Independent Test** : `quickstart.md`, section 1.

- [X] T030 [US2] Dans `apps/api/src/members/schemas/member.schema.ts`, ajouter `@Prop({ type: MediaRefSchema, default: null }) portrait: MediaRef | null`.
  - Dans `apps/api/src/members/members.service.ts`, ajouter `portrait: AdminImage | null` à `AdminMemberView` (et donc à `AdminMemberDetailView`), par `toAdminImage`.
  - Dans `apps/api/src/members/mandates.service.ts`, ajouter `portrait?: PublicImage` à `DirectoryEntryView`, rempli par `toPublicImage` quand `member.portrait` existe ; ni email ni téléphone.
- [X] T031 [US2] Dans `apps/api/src/members/members.service.ts`, ajouter trois méthodes avec le dossier `'membres'`. Chacune renvoie la vue de détail.
  - **`setPortrait(id, file, dto)`** :
    1. membre introuvable : `404` ;
    2. `storeImage` ;
    3. `findOneAndUpdate` avec `$set: { portrait: ref }` et `{ new: false }`, pour récupérer l'ancien portrait ;
    4. sans document : `discardImage`, puis `404` ;
    5. sinon, si un ancien portrait existait, `discardImage(ancien.publicId)` (échec journalisé, opération réussie).
  - **`updatePortrait(id, dto)`** : `404` sans membre ou sans portrait ; `$set` sur les champs, `$unset` pour `null`.
  - **`removePortrait(id)`** : `404` sans portrait ; `removeImageFile` (`503` possible), puis `$set: { portrait: null }`.
- [X] T032 [US2] Dans `apps/api/src/members/members.admin.controller.ts`, ajouter :
  - `@Put(':id/portrait')`, avec `ImageUploadInterceptor`, `@UploadedFile()` et `ImageFieldsDto`, en `200` ;
  - `@Patch(':id/portrait')`, avec `UpdateImageFieldsDto` ;
  - `@Delete(':id/portrait')`, en `200`, avec la vue.

  `ParseObjectIdPipe` sur `:id`.
- [X] T033 [P] [US2] Créer `apps/admin/src/app/(admin)/membres/images-actions.ts` (`"use server"`), avec `setPortrait(id, state, formData)`, `updatePortrait(id, state, formData)` et `removePortrait(id)`, sur le modèle de T024 : `revalidatePath("/membres", "layout")` ; le retrait redirige vers la fiche avec `?avis=supprime`.
- [X] T034 [US2] Créer `apps/admin/src/app/(admin)/membres/_components/PortraitSection.tsx` (client), d'après `contracts/admin-screens.md`.
  - `SectionHeading` « Portrait ».
  - Sans portrait : gabarit 4:5 de 160 px sur `var(--grid-chrome)`, « Aucun portrait. », et « Ajouter un portrait » (contour).
  - Avec portrait : `ImageThumb` 4:5 de 160 px ; texte alternatif ; dimensions avec avertissement sous 1200 px ; « Remplacer », « Modifier », et « Retirer » avec la confirmation « Retirer ce portrait ? » / « Le fichier sera supprimé. ».
  - `ImageSheet` avec `recommendedWidth: 1200` et les titres « Ajouter un portrait », « Remplacer le portrait » ou « Modifier l'image ».
- [X] T035 [US2] Dans `apps/admin/src/app/(admin)/membres/[id]/page.tsx`, insérer `PortraitSection` entre `MemberForm` et `MandatesSection`. Dans `apps/admin/src/app/(admin)/membres/nouveau/page.tsx`, ajouter « Le portrait s'ajoute sur la fiche, après l'enregistrement. ».
- [X] T036 [P] [US2] Dans `apps/admin/src/app/(admin)/membres/_components/MemberInspector.tsx`, afficher en tête `ImageThumb` 4:5 sur toute la largeur quand `member.portrait` existe.
- [X] T037 [P] [US2] Dans `apps/web/src/data/members.ts`, ajouter `portrait?: ApiImage` à `ApiMember`, et `portrait: member.portrait && toPhoto(member.portrait)` dans `toMember`. Corriger le commentaire de tête : « ni email, ni téléphone ».
- [ ] T038 [US2] Vérification manuelle : `quickstart.md`, section 1 et section 6 (membre) ; lint et build.

---

## Phase 5: User Story 3 - Ajouter les photographies d'une actualité (Priority: P2)

**Goal** : même mécanisme que US1 pour les actualités.

**Independent Test** : `quickstart.md`, section 4.

- [X] T039 [US3] Dans `apps/api/src/news/schemas/news.schema.ts` et `apps/api/src/news/news.service.ts`, faire comme T020 (`photos`, vues d'administration et publique) et comme T021 (`addPhoto`, `updatePhoto`, `removePhoto`, `reorderPhotos`, dossier `'actualites'`).
- [X] T040 [US3] Dans `apps/api/src/news/news.admin.controller.ts`, ajouter les quatre routes, comme T022.
- [X] T041 [P] [US3] Créer `apps/admin/src/app/(admin)/actualites/images-actions.ts`, comme T024 (`revalidatePath("/actualites", "layout")`).
- [X] T042 [US3] Dans `apps/admin/src/app/(admin)/actualites/[id]/page.tsx`, ajouter `PhotosSection`, comme T026 ; dans `actualites/nouvelle/page.tsx`, ajouter la ligne d'information.
- [X] T043 [P] [US3] Dans `apps/admin/src/app/(admin)/actualites/_components/NewsInspector.tsx`, ajouter l'image principale et « Photographies : N », comme T027.
- [X] T044 [P] [US3] Dans `apps/web/src/data/news.ts`, lire `photos`, comme T028.
- [ ] T045 [US3] Vérification manuelle : `quickstart.md`, section 4, et section 6 (actualité) ; lint et build.

---

## Phase 6: User Story 4 - Ne rien laisser traîner (Priority: P2)

**Goal** : la suppression d'un contenu retire ses fichiers ; stockage indisponible : rien n'est supprimé.

**Independent Test** : `quickstart.md`, section 5.

- [X] T046 [US4] Dans `apps/api/src/actions/actions.service.ts`, modifier `remove(id)` :
  - trouver l'action (`404`) ;
  - pour chaque photographie, `removeImageFile` (`503` dès le premier échec, et l'action reste ; un fichier absent est journalisé en avertissement) ;
  - puis supprimer le document.
- [X] T047 [P] [US4] Dans `apps/api/src/news/news.service.ts`, faire de même pour `remove(id)`.
- [X] T048 [P] [US4] Dans `apps/api/src/members/members.service.ts`, modifier `remove(id)` : retirer le fichier du portrait d'abord (`503` possible), puis le membre et ses mandats, comme aujourd'hui.
- [X] T049 [US4] Côté Back Office, vérifier que les suppressions existantes (`deleteAction`, `deleteNews`, `deleteMember`) affichent déjà « Service indisponible. » sur un `503`, par `failureMessage`. Ne rien corriger si c'est le cas.
- [ ] T050 [US4] Vérification manuelle : `quickstart.md`, section 5, avec une API lancée avec un secret faux pour les cas `503`.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T051 [P] Dans `apps/admin/DESIGN.md`, section Components, ajouter :
  - « Panneau image et point d'intérêt » : `ImageSheet`, `FocusPicker`, avertissement de largeur ;
  - « Photographies d'un contenu » : `PhotosSection`, rang « Principale », Monter et Descendre ;
  - « Portrait » : `PortraitSection`.
- [X] T052 Mettre la documentation à jour d'après `plan.md`, section A, « À faire en fin d'implémentation » :
  - `ARCHITECTURE.md` : en-tête « Implémenté », section 1 (retirer « Non mis en œuvre avant le stockage de fichiers » des trois lignes), section 15 (étape 10 faite) ;
  - `PROJECT_CONTEXT.md` : état, « Fait », « Prochaines étapes », section Back Office (« Hors de ce qui est construit ») ;
  - ligne d'état de `CLAUDE.md`.
- [X] T053 [P] Contrôles de périmètre :
  - `git diff --stat main -- '*/package.json' package-lock.json` est vide ;
  - `grep -rn "cloudinary" apps/api/src` ne trouve que `apps/api/src/media/` ;
  - `grep -rni "cloudinary" apps/admin/src apps/web/src` ne trouve rien, hors commentaires ;
  - aucune réponse de l'API ne contient `publicId` (`grep` du mot dans les vues).
- [ ] T054 Contrôle final : `npm run lint` et `npm run build` (les trois applications), puis `quickstart.md` en entier et le nettoyage de la section 8.

---

## Dependencies & Execution Order

- **Phase 1** : aucune dépendance.
- **Phase 2** : après la phase 1 ; bloque tout. Ordre interne :
  - T003, puis T004 ;
  - T005, T006, T008 et T009 en parallèle, puis T007 et T010 ;
  - T011 à T016 côté Back Office, avec T016 après T013, T014 et T015 ;
  - T017 et T018 côté Front Office.
- **US1 (phase 3)** : après la phase 2. Elle crée `PhotosSection`, réutilisé par US3.
- **US2 (phase 4)** : après la phase 2 ; indépendante d'US1, mais elle partage `RowMenu` si T025 l'a modifié.
- **US3 (phase 5)** : après US1 (`PhotosSection`, modèle des services).
- **US4 (phase 6)** : après les schémas d'US1, US2 et US3 (T020, T030, T039).
- **Phase 7** : en dernier.

### Fichiers partagés (pas de parallélisme)

| Fichier | Tâches |
|---|---|
| `actions.service.ts` | T020, T021, T046 |
| `news.service.ts` | T039, T047 |
| `members.service.ts` | T030, T031, T048 |
| `RowMenu.tsx` | T025 seulement |

### Parallel Example: User Story 1

```text
Après T020–T022 :
  T024 actions/images-actions.ts
  T027 ActionInspector.tsx
  T028 web/data/actions.ts
```

## Implementation Strategy

1. **MVP** : phases 1 et 2, puis US1. Vérifier, puis **arrêt** pour validation.
2. US2, puis US3, puis US4, chacune avec sa vérification.
3. Finition : documentation, contrôles de périmètre, rejeu complet.

Rien n'est commité sans demande.

---

## État de l'implémentation (2026-10-13)

Toutes les tâches de code sont faites. `npm run lint` et `npm run build` (les trois applications) passent. Aucun `package.json` n'a changé.

**Vérifications non cochées.** Elles demandent un jeton d'administrateur, ou des envois réels chez Cloudinary : T023 (`curl`), T029, T038, T045, T050 et T054 (rejeu de `quickstart.md`). La section 3 du guide, sur l'orientation EXIF, est à vérifier en priorité : c'est la seule hypothèse de la recherche (R4) qui n'a pas pu être constatée sans envoi réel.

**Écarts par rapport au texte des tâches :**
1. **`content-images.ts` (T010)** contient aussi les opérations sur les photographies (`addPhoto`, `updatePhoto`, `removePhoto`, `reorderPhotos`, `removeImageFiles`) et `imageFieldsUpdate`. Les services des actions et des actualités les appellent, puis relisent leur vue de détail : la logique de ménage n'existe qu'une fois. `removeImageFile` prend aussi le journal en paramètre.
2. **`apps/admin/src/lib/image-forms.ts`**, nouveau : corps multipart et JSON d'une image, et traduction de `413` et `415` en erreur sous le choix du fichier. Les actions serveur des trois domaines s'appuient dessus.
3. **`ImageSheet`** a deux modes, `upload` (ajout et remplacement) et `edit`, au lieu de `create` et `edit` ; il appelle `onSaved` après une réussite.
4. **`FocusPicker`** reçoit les dimensions de l'image : une image déjà envoyée passe par `next/image`, une image pas encore envoyée (adresse `blob:`) par une balise `img`.
5. **`RowMenu`** gagne la propriété facultative `edit` (T025), utilisée par `PhotosSection`.
6. **Réponses des routes d'image** : la vue de détail d'administration du contenu, comme le prévoit le contrat ; `POST …/photos` répond `201`.
7. **`apps/api/src/config/app-config.ts`** nomme Cloudinary depuis la fonctionnalité 007 (configuration). Ce n'est pas un écart de cette fonctionnalité ; T053 le relève.
