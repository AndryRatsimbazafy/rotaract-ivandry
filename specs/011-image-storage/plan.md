# Implementation Plan: Stockage des images

**Branch**: `011-image-storage` | **Date**: 2026-10-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/011-image-storage/spec.md`

## Summary

Cette fonctionnalité donne un portrait aux membres et des photographies (20 au plus) aux actions et aux actualités, stockés chez Cloudinary par l'API, derrière `StorageService`.

**Côté API :**
- les images s'envoient sous la ressource qui les porte (`…/portrait`, `…/photos`), en multipart ;
- le type est constaté sur le contenu, 5 Mo au plus ;
- les dimensions et l'orientation viennent du fournisseur ;
- l'identifiant du fournisseur n'est jamais renvoyé ;
- les fichiers sont retirés à chaque retrait, remplacement ou suppression.

**Côté Back Office :**
- l'image est réduite dans le navigateur (3000 px au plus, WebP ou JPEG) avant d'être relayée par une action serveur ;
- la limite d'envoi du serveur est relevée à 6 Mo ;
- un panneau latéral sert à la saisie, avec le point d'intérêt réglable ;
- une section « Portrait » sur la fiche d'un membre, une section « Photographies » sur celle d'une action et d'une actualité.

**Côté Front Office :** la couche de données fait correspondre les images, et `next/image` les sert à la bonne taille à la place des gabarits.

**Aucune dépendance ajoutée.** Les décisions sont dans [research.md](./research.md) (R1 à R11).

## Technical Context

**Language/Version**: TypeScript ; Node 22. `apps/api` : TypeScript 6, NestJS 12. `apps/admin` et `apps/web` : TypeScript 5, Next.js 16.

**Primary Dependencies**: toutes déjà installées.
- `cloudinary` 2 (API) ;
- `@nestjs/platform-express`, qui embarque multer (API) ;
- `mongoose` 9 ;
- MUI 9 (Back Office) ;
- `next/image` (Back Office et Front Office).

**Storage**: MongoDB Atlas (sous-documents `MediaRef` embarqués), Cloudinary (fichiers image publics sous `site/`).

**Testing**: aucun test automatisé (constitution, principe IX). Vérification avec [quickstart.md](./quickstart.md), plus `npm run lint` et `npm run build`.

**Target Platform**: Linux en local ; plus tard Vercel (fronts) et Render (API), sous le plafond d'environ 4,5 Mo de Vercel.

**Project Type**: monorepo web (API NestJS, deux applications Next.js).

**Performance Goals**: ajout d'une photographie de 5 Mo en moins d'une minute (SC-001) ; 500 Ko au plus par image servie sur téléphone (SC-004).

**Constraints**:
- le navigateur n'appelle ni l'API ni le fournisseur ;
- l'identifiant du fournisseur n'est jamais renvoyé ;
- 20 photographies au plus ;
- aucune dépendance ajoutée ;
- aucun fichier orphelin, sauf interruption.

**Scale/Scope**: un administrateur ; quelques centaines d'images ; 3 modèles touchés, 12 routes, 3 écrans du Back Office, 6 sections du Front Office.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principe | Vérification | État |
|---|---|---|
| I. Source de vérité | Décision 10 (Cloudinary, envoi par l'API, 5 Mo) prise avant la spec. Les choix de conception (routes rattachées, `MediaRef.id`, `publicId` jamais renvoyé, variables) sont reportés dans `ARCHITECTURE.md` **avant** ce plan (section A). `DESIGN.md` et `apps/admin/DESIGN.md` sont suivis tels quels. | Conforme |
| II. Étapes validées | Spec et clarifications (Q1 à Q3) closes le 2026-10-13. Ce plan s'arrête à la phase 1. | Conforme |
| III. Préférence pour le manuel | Aucun script. Les images de test se préparent à la main. | Conforme |
| IV. Simplicité technique | Aucune dépendance. Type constaté par les signatures d'octets, comme pour le CV ; dimensions données par le fournisseur ; réduction par `canvas` dans le navigateur. Pas de collection de médias, pas de médiathèque. | Conforme |
| V. Architecture backend | `/admin/*` derrière JWT et `ADMIN` ; le stockage reste derrière `StorageService` (deux méthodes ajoutées) ; Cloudinary seul fournisseur. | Conforme |
| VI. Intégrité du modèle métier | Images embarquées dans leur contenu, sans existence propre. Mandats, années et candidatures inchangés. | Conforme |
| VII. Front Office | `DESIGN.md`, sections 7 et 8 : gabarit sans image, texte alternatif, légende réelle, crédit, point d'intérêt, aucun agrandissement. Compositions inchangées. | Conforme |
| VIII. Qualité et contenu | Aucune image inventée : seules les images envoyées par l'administrateur s'affichent ; ailleurs, le gabarit reste. | Conforme |
| IX. Tests | Aucun. | Conforme |
| X. Outillage | npm ; `node_modules` par application ; ni Docker, ni CI. | Conforme |
| XI. Git | Branche `011-image-storage` créée par Spec Kit à la demande du porteur du projet ; aucun commit sans demande. | Conforme |
| XII. Non-régression | CV inchangé ; contrats 004 à 006 étendus (champs de lecture ajoutés), sans changement de leurs corps d'écriture ; SC-007 vérifie les pages sans image. | Conforme |

**Résultat de la porte** : passée. **Re-vérification après la phase 1** : inchangée.

**Écart assumé** : les contrats de lecture de 004, 005 et 006 gagnent `portrait` ou `photos`. C'était prévu par `ARCHITECTURE.md`, section 1 (« non mis en œuvre avant le stockage de fichiers ») ; ce n'est pas une rupture.

## A. Alignements d'ARCHITECTURE.md

**Appliqués le 2026-10-13, avant ce plan :**

| Section | Changement |
|---|---|
| 2, `MediaRef` | Ajout de `id` ; `publicId` obligatoire et jamais renvoyé ; `focus` obligatoire, « 50% 50% » par défaut ; longueurs de `alt`, `caption` et `credit` ; formes publique et d'administration ; images publiques, orientation EXIF appliquée |
| 6, ligne « Médias » | Remplacée par la ligne « Images », qui donne les routes rattachées ; aucune route `/admin/media` |
| 12, `CLOUDINARY_*` | « Stockage des CV et des images (même compte) » ; la phrase « restent à définir » est retirée |

**À faire en fin d'implémentation** :
- `ARCHITECTURE.md` : en-tête, section 1 (retirer « Non mis en œuvre avant le stockage de fichiers »), section 15 (étape 10 faite).
- `PROJECT_CONTEXT.md` : état et prochaines étapes.
- `CLAUDE.md` : ligne d'état.

## B. Conception

### B1. API (`apps/api`)

1. **`media/`**
   - `StorageService` gagne `uploadImage` et `deleteImage`. `CloudinaryStorageService` les réalise : ressource `image`, livraison publique, `public_id` aléatoire sous `site/<dossier>/`, transformation entrante d'orientation EXIF, délai de 10 s, journal sans détail du fournisseur. Voir R2 et R4.
   - `image-file.ts` : `detectImageType(buffer)` et `IMAGE_MAX_BYTES` (R3).
   - `image-upload.interceptor.ts`, sur le modèle de `CvUploadInterceptor`, avec le champ `image`.
2. **`common/schemas/media-ref.schema.ts`** : `MediaRef` avec `_id`, et les fonctions `toAdminImage` et `toPublicImage` (R5).
3. **`common/dto/image-fields.dto.ts`** : `ImageFieldsDto` (`alt` obligatoire, `caption`, `credit`, `focus`) pour l'envoi, et `UpdateImageFieldsDto` (tout facultatif ; `caption` et `credit` à `null` les retirent) pour le `PATCH`.
4. **Membres** :
   - `member.schema.ts` : `portrait: MediaRef | null` ;
   - `members.service.ts` : `setPortrait`, `updatePortrait`, `removePortrait`, et `remove` qui retire le fichier ;
   - `members.admin.controller.ts` : trois routes ;
   - vues d'administration avec `portrait` ;
   - `mandates.service.ts` : `findDirectory` ajoute `portrait` public (le `populate` du membre doit le sélectionner).
5. **Actions et actualités** :
   - schémas : `photos: MediaRef[]` ;
   - services : `addPhoto`, `updatePhoto`, `removePhoto`, `reorderPhotos` et `remove`, qui retirent les fichiers ;
   - contrôleurs : quatre routes chacun ;
   - vues publiques et d'administration avec `photos`.

   Le code commun (dépôt puis écriture puis retrait en cas d'échec, contrôle de la limite de 20, validation de l'ordre) vit dans `media/content-images.ts`, une fonction utilitaire appelée par les deux services. Elle évite de dupliquer la logique de ménage, qui doit être juste partout.
6. **Messages et codes** : ceux de [contracts/api-images.md](./contracts/api-images.md) ; `StorageError` devient `503` par le même chemin que pour les candidatures.

### B2. Back Office (`apps/admin`)

1. `next.config.ts` : `experimental.serverActions.bodySizeLimit: "6mb"`, et `images.remotePatterns` pour Cloudinary (R6, R10).
2. `lib/api.ts` : `apiUpload(path, method, formData)`, avec un délai de 30 s (R7).
3. `lib/image-reduction.ts` (client) : `prepareImage(file)` renvoie `{ blob, width, height, name }` ou une erreur avec le message de l'API (R6).
4. `types/media.ts` (`AdminImage`), et ajout de `portrait` ou `photos` aux types `Member`, `Action` et `News`.
5. Composants :
   - `components/ImageSheet.tsx` : panneau, choix, réduction, vignette, point d'intérêt, champs ;
   - `components/FocusPicker.tsx` : repère au clic et au clavier ;
   - `components/ImageThumb.tsx` : vignette `next/image` recadrée selon le point d'intérêt.
6. `membres/_components/PortraitSection.tsx` et `membres/images-actions.ts` (`setPortrait`, `updatePortrait`, `removePortrait`).
7. `components/PhotosSection.tsx`, partagé par les actions et les actualités, à la manière de `ContentTable`, et `actions/images-actions.ts`, `actualites/images-actions.ts` (`addPhoto`, `updatePhoto`, `removePhoto`, `reorderPhotos`). Les actions serveur reviennent à la fiche avec un avis (`withNotice`).
8. Pages `membres/[id]`, `actions/[id]` et `actualites/[id]` : ajout des sections. Pages `…/nouveau` et `…/nouvelle` : ligne d'information.
9. Aperçus `MemberInspector`, `ActionInspector` et `NewsInspector` : image en tête.
10. `apps/admin/DESIGN.md`, section Components : ajout de « Panneau image et point d'intérêt » et de « Photographies d'un contenu ».

### B3. Front Office (`apps/web`)

1. `next.config.ts` : `images.remotePatterns` pour Cloudinary.
2. `data/media.ts` : `toPhoto(image)`. `data/members.ts`, `data/actions.ts` et `data/news.ts` lisent `portrait` et `photos`.
3. `components/media/PhotoFrame.tsx` : `max-width` à la largeur d'origine quand elle est plus petite que le cadre ; crédit affiché aussi sans légende.

### B4. Ordre de réalisation

API (B1), vérifiée par `curl`, puis Back Office (B2), puis Front Office (B3), puis la documentation.

## Project Structure

### Documentation (this feature)

```text
specs/011-image-storage/
├── spec.md
├── plan.md                 # ce fichier
├── research.md             # R1 à R11
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-images.md
│   ├── admin-screens.md
│   └── front-office.md
├── checklists/requirements.md
└── tasks.md                # /speckit-tasks
```

### Source Code (repository root)

```text
apps/api/src/
├── media/            storage.service.ts (+uploadImage, deleteImage), cloudinary-storage.service.ts,
│                     image-file.ts, image-upload.interceptor.ts, content-images.ts   (nouveaux : les trois derniers)
├── common/schemas/   media-ref.schema.ts (nouveau)
├── common/dto/       image-fields.dto.ts (nouveau)
├── members/          schemas/member.schema.ts, members.service.ts, members.admin.controller.ts, mandates.service.ts
├── actions/          schemas/action.schema.ts, actions.service.ts, actions.admin.controller.ts
└── news/             schemas/news.schema.ts, news.service.ts, news.admin.controller.ts

apps/admin/
├── next.config.ts
├── DESIGN.md
└── src/
    ├── lib/          api.ts (+apiUpload), image-reduction.ts (nouveau)
    ├── types/        media.ts (nouveau), member.ts, action.ts, news.ts
    ├── components/   ImageSheet.tsx, FocusPicker.tsx, ImageThumb.tsx, PhotosSection.tsx (nouveaux)
    └── app/(admin)/
        ├── membres/      images-actions.ts, _components/PortraitSection.tsx (nouveaux), [id]/page.tsx, nouveau/page.tsx, _components/MemberInspector.tsx
        ├── actions/      images-actions.ts (nouveau), [id]/page.tsx, nouvelle/page.tsx, _components/ActionInspector.tsx
        └── actualites/   images-actions.ts (nouveau), [id]/page.tsx, nouvelle/page.tsx, _components/NewsInspector.tsx

apps/web/
├── next.config.ts
└── src/
    ├── data/         media.ts (nouveau), members.ts, actions.ts, news.ts
    └── components/media/PhotoFrame.tsx
```

**Structure Decision** : on garde la structure existante des trois applications, et le module `media` reste le seul à connaître le fournisseur. Aucun dossier ni paquet nouveau (`packages/` reste vide).

## Complexity Tracking

Aucune violation de la constitution à justifier.
