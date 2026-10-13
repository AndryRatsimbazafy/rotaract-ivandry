# Recherche : stockage des images

Décisions techniques pour réaliser `spec.md` (clarifications Q1 à Q3 comprises).

## R1. Routes d'envoi : rattachées à leur contenu, pas un `/admin/media` générique

- **Décision** : les images s'envoient et se gèrent sous la ressource qui les porte. Contrat : [contracts/api-images.md](./contracts/api-images.md).
  - Portrait : `PUT`, `PATCH` et `DELETE /admin/members/:id/portrait`.
  - Photographies : `POST /admin/actions/:id/photos`, `PATCH` et `DELETE /admin/actions/:id/photos/:photoId`, `PUT /admin/actions/:id/photos/order`, et les mêmes sous `/admin/news/:id/photos`.
- **Pourquoi** :
  - la clarification Q3 (FR-012) veut qu'un envoi rattache l'image à son contenu dans la même opération. Une route `/admin/media` qui renvoie une référence à recopier ensuite dans un `PATCH` du contenu crée justement la fenêtre où un fichier n'appartient à rien ;
  - les routes rattachées permettent aussi à l'API de vérifier la limite de 20 et l'existence du contenu avant tout dépôt.
- **Écarté** : `POST /admin/media` puis `PATCH` du contenu, la forme provisoire d'`ARCHITECTURE.md`, section 6 (orphelins, deux appels, ménage plus complexe) ; l'envoi des images dans le `PATCH` du contenu (multipart mêlé aux champs JSON existants, contrats 005 et 006 à rouvrir).
- **Conséquence** : `ARCHITECTURE.md`, section 6, ligne « Médias », est remplacée (section A du plan).

## R2. Abstraction de stockage : deux opérations d'image

- **Décision** : `StorageService` gagne deux méthodes, sans toucher à celles du CV :
  - `uploadImage(content: Buffer, folder: ImageFolder): Promise<StoredImage>`, où `StoredImage = { id, url, width, height, bytes, format }` ;
  - `deleteImage(id): Promise<StorageDeletion>`.

  `ImageFolder` vaut `'membres' | 'actions' | 'actualites'`. `CloudinaryStorageService` les réalise :
  - type de ressource `image`, livraison publique (`type: 'upload'`) ;
  - identifiant aléatoire `site/<dossier>/<uuid>` ;
  - `overwrite: false` et le même délai de 10 s ;
  - adresse renvoyée : `secure_url` ;
  - largeur, hauteur, poids et format pris dans la réponse du fournisseur.
- **Pourquoi** : le CV est un fichier brut privé, une image est publique et a des dimensions ; ce sont deux réalités du fournisseur. L'abstraction ne nomme toujours pas le fournisseur, et le module `media` reste le seul à le connaître (décision 10).
- **Écarté** : une seule méthode `upload` paramétrée par « privé ou public » (elle mêlerait les règles du CV et des images) ; un second fournisseur.

## R3. Contrôle du type et du poids dans l'API

- **Décision** :
  - Un intercepteur de réception propre aux images (`ImageUploadInterceptor`, sur le modèle de `CvUploadInterceptor`) lit un seul fichier dans le champ `image`, en mémoire, 5 242 880 octets au plus. Au-delà : `413` avec le message du socle.
  - Le type est constaté sur les premiers octets, sans dépendance :
    - JPEG : `FF D8 FF` ;
    - PNG : `89 50 4E 47 0D 0A 1A 0A` ;
    - WebP : `RIFF`, puis `WEBP` aux octets 8 à 11.
    - Autre contenu : `415`, « Format d'image non accepté : JPEG, PNG ou WebP. »
  - L'extension du nom n'est pas exigée : le Back Office renomme le fichier réduit.
- **Pourquoi** : c'est le même principe que `cv-file.ts` (type constaté, jamais annoncé). Aucune bibliothèque d'image n'est nécessaire, puisque les dimensions viennent du fournisseur (R4).
- **Écarté** : `file-type` ou `sharp` (dépendances inutiles ici).

## R4. Dimensions et orientation

- **Décision** :
  - Le fournisseur applique l'orientation EXIF à la réception, par une transformation entrante `angle: 'exif'` ; le fichier stocké est droit, et la largeur et la hauteur renvoyées sont celles de l'image affichée.
  - Côté Back Office, la réduction dans le navigateur (R6) dessine l'image avec son orientation, si bien que le fichier envoyé est déjà droit dans le cas courant. La transformation entrante couvre le cas où l'original est envoyé tel quel.
  - Les dimensions enregistrées sont celles que renvoie le fournisseur.
- **Pourquoi** : FR-003 (dimensions réelles après orientation), sans bibliothèque.
- **À vérifier à l'implémentation** (quickstart, section 3) : une photo de téléphone en portrait, envoyée sans réduction, doit revenir avec une hauteur supérieure à sa largeur.

## R5. Forme enregistrée : `MediaRef` gagne un identifiant

- **Décision** :
  - `MediaRef` devient un sous-document avec `_id`, exposé en `id`. Il faut un identifiant stable pour modifier, retirer et réordonner une photographie. Le portrait en porte un aussi, par simplicité.
  - Champs : `url`, `publicId`, `name`, `mimeType`, `size`, `width`, `height`, `alt` (1 à 300), `caption` (300 au plus), `credit` (120 au plus) et `focus`, au format `^(\d{1,3})% (\d{1,3})%$` avec des valeurs de 0 à 100, « 50% 50% » par défaut.
  - `Member.portrait` vaut `MediaRef | null`. `Action.photos` et `News.photos` valent `MediaRef[]`, 20 au plus, dans l'ordre de l'index.
- **Pourquoi** : la section 2 d'`ARCHITECTURE.md` prévoit déjà ces champs ; seul `id` s'ajoute.
- **Lectures** :
  - **publiques** : `{ url, width, height, alt, caption?, credit?, focus }`, sans `publicId`, `name`, `size` ni `id` (FR-007) ;
  - **d'administration** : `{ id, url, width, height, alt, caption, credit, focus, name, mimeType, size }`. `publicId` n'est **jamais** renvoyé, comme pour le CV.

## R6. Passage d'une image de 5 Mo (clarification Q1)

- **Décision** : les deux mécanismes à la fois.
  1. **Dans le navigateur**, `apps/admin/src/lib/image-reduction.ts`, sans dépendance :
     - refus immédiat au-dessus de 5 242 880 octets, ou pour un type autre que `image/jpeg`, `image/png` ou `image/webp` ;
     - puis `createImageBitmap(file)` (orientation appliquée par défaut) ;
     - côté le plus long ramené à 3000 px au plus, sans agrandir ;
     - dessin sur un `canvas`, puis `toBlob` en `image/webp` à 0,85, ou `image/jpeg` à 0,85 si le WebP n'est pas pris en charge ;
     - en cas d'échec de la réduction, ou si le résultat est plus lourd que l'original, le fichier d'origine part tel quel.

     Ce code est repris de `imageCompression.ts` de l'application de trésorerie, simplifié (pas de vignette).
  2. **Sur le serveur du Back Office**, `experimental.serverActions.bodySizeLimit: "6mb"` dans `apps/admin/next.config.ts`, comme le fait déjà `apps/web` pour le CV.
- **Pourquoi** :
  - une photo de 3000 px en WebP à 0,85 pèse en général de 0,5 à 1,5 Mo, très en dessous du plafond d'environ 4,5 Mo de Vercel ;
  - la limite à 6 Mo couvre le repli sur l'original en local ;
  - l'API reste l'autorité (R3).

## R7. Relais par le Back Office

- **Décision** :
  - Les écritures d'images sont des actions serveur dans les dossiers des domaines (`membres/images-actions.ts`, `actions/images-actions.ts`, `actualites/images-actions.ts`), qui reçoivent un `FormData` : fichier `image`, `alt`, `caption`, `credit`, `focus`.
  - Elles l'envoient à l'API en `multipart/form-data` par une nouvelle fonction `apiUpload(path, method, formData)` dans `apps/admin/src/lib/api.ts`. Elle reprend `apiWrite` (même traitement de `401` et `403`, jeton du cookie), sans en-tête `Content-Type` : `fetch` pose la frontière du multipart.
  - Délai d'attente : 30 s pour un envoi (au lieu de 15 s), car l'API attend elle-même le fournisseur.
  - Les modifications de champs seuls (texte alternatif, légende, crédit, point d'intérêt, ordre) restent du JSON, par `apiWrite`.
- **Pourquoi** : le navigateur n'appelle jamais l'API (FR-001, décision 9).

## R8. Ménage du stockage

- **Décision** :
  - **Envoi** : dépôt chez le fournisseur, puis écriture dans la base. Si l'écriture échoue (contenu disparu, limite de 20 atteinte entre-temps), le fichier déposé est retiré, et un échec de ce retrait est journalisé comme orphelin. C'est le schéma de `applications.service.ts`.
  - **Remplacement d'un portrait** : nouveau dépôt, écriture, puis retrait de l'ancien fichier. Un échec de ce dernier retrait est journalisé, et l'opération reste réussie (FR-020).
  - **Retrait d'une image** : retrait du fichier d'abord, puis écriture. Si le stockage est indisponible : `503`, et rien n'est modifié (US4, scénario 3). Un fichier déjà absent n'empêche rien.
  - **Suppression d'un membre, d'une action ou d'une actualité** : retrait de tous ses fichiers, puis suppression du document. Si le stockage est indisponible : `503`, et le document est conservé (FR-019). Les fichiers déjà retirés avant la panne sont ensuite « absents », ce qui est toléré.
- **Pourquoi** : SC-003 (zéro orphelin) et la cohérence avec la suppression d'une candidature.

## R9. Front Office : affichage et taille servie

- **Décision** :
  - `apps/web/next.config.ts` gagne `images.remotePatterns` : `https://res.cloudinary.com/*/image/upload/**`.
  - `next/image`, déjà utilisé par `PhotoFrame`, sert chaque image à la largeur de `sizes`, en WebP ou AVIF : FR-018 et SC-004.
  - Les fonctions de `src/data/*` font correspondre `MediaRef` et `Photo` (`url` donne `src`, les autres champs sont repris tels quels). C'est la correspondance déjà prévue par `ARCHITECTURE.md`, section 10.
  - `members.ts` lit `portrait` ; `actions.ts` et `news.ts` lisent `photos`, au lieu du `[]` actuel.
- **Pas d'agrandissement** (`DESIGN.md`, section 7 ; FR-017) : `PhotoFrame` limite la largeur du cadre à la largeur réelle de l'image (`max-width: <width>px`) quand elle est plus petite que le cadre prévu. Une image trop petite s'affiche donc en plus petit, jamais étirée.
- **Point d'intérêt, légende et crédit** : `PhotoFrame` applique déjà `object-position` à partir de `focus`, et affiche la légende suivie du crédit. Seul ajout : le crédit s'affiche aussi quand il n'y a pas de légende (`DESIGN.md` : « le crédit n'apparaît que s'il y a un auteur à créditer »).
- **Écarté** : un « loader » Cloudinary personnalisé pour `next/image` (le Front Office connaîtrait le fournisseur) ; servir directement `secure_url` sans redimensionnement (contraire à SC-004).

## R10. Back Office : saisie

- **Décision** (contrat : [contracts/admin-screens.md](./contracts/admin-screens.md)) :
  - Un composant `ImageSheet`, le panneau latéral de 010, sert à l'ajout, au remplacement et à la modification. Il contient :
    - le choix du fichier (`<input type="file" accept="image/jpeg,image/png,image/webp">`) ;
    - la réduction (R6) ;
    - une vignette de prévisualisation, avec le repère du point d'intérêt (clic, ou flèches au clavier par pas de 5 %, et « Recentrer ») ;
    - les champs « Texte alternatif » (obligatoire), « Légende » et « Crédit » ;
    - les dimensions, en chiffres tabulaires, et l'avertissement de largeur (FR-013).
  - Un composant `PortraitSection` sur la fiche d'un membre, et un composant `PhotosSection` sur la fiche d'une action et d'une actualité : liste réglée (vignette, texte alternatif, dimensions, « Monter », « Descendre », « Modifier », « Retirer »), et « Ajouter une photographie », désactivé à 20.
  - L'ordre s'enregistre à chaque déplacement, comme pour les mandats.
  - Les vignettes passent par `next/image`, avec le même `remotePatterns` dans `apps/admin/next.config.ts`.
  - Les aperçus de 010 (`MemberInspector`, `ActionInspector`, `NewsInspector`) montrent l'image principale en tête.
- **Pourquoi** : `apps/admin/DESIGN.md` (panneaux latéraux pour les saisies courtes, ordre par « Monter » et « Descendre », sans glisser-déposer ni bibliothèque).

## R11. Ce qui ne change pas

- Le CV, ses routes et son stockage privé.
- Les contrats existants des membres, actions et actualités : leurs corps de création et de modification ne prennent pas d'image. Les réponses gagnent `portrait` ou `photos`.
- Les variables d'environnement : mêmes `CLOUDINARY_*`.
- Aucune dépendance ajoutée, ni dans `apps/api`, ni dans `apps/admin`, ni dans `apps/web`.
