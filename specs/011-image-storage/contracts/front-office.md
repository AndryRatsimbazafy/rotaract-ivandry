# Contrat : images dans le Front Office

`apps/web` affiche les images reçues de l'API selon `DESIGN.md`, sections 7 et 8. Les compositions des pages ne changent pas : seuls les gabarits cèdent la place aux images réelles.

| Emplacement (fichier) | Image | Sans image |
|---|---|---|
| Page Membres, annuaire (`membres/_sections/MembersDirectory.tsx`) | `member.portrait` | gabarit 4:5 actuel |
| Accueil, collectif (`_sections/MembersPreview.tsx`) | portraits des deux premiers membres qui en ont un, dans l'ordre du club | gabarits actuels |
| Accueil, dernières actions (`_sections/LatestActions.tsx`) | photographie principale de chaque action | gabarit actuel |
| Page Actions, index (`actions/_sections/ActionsIndex.tsx`) | photographie principale ; planche du dépliant avec les suivantes | gabarit actuel ; planche absente |
| Page Actualités, à la une (`actualites/_sections/NewsFeature.tsx`) | photographie principale ; planche avec les suivantes | gabarit actuel |
| Page Actualités, registre (`actualites/_sections/NewsRegister.tsx`) | photographie principale (vignette) ; planche avec les suivantes | comme aujourd'hui |

Ne changent pas : les ouvertures des pages, « Le club » et « Nous rejoindre », qui n'ont pas d'image dans l'API.

## Règles

- **Texte alternatif** : toujours `photo.alt`.
- **Légende** : sous l'image si elle existe. **Crédit** : affiché s'il existe, même sans légende (« Photo : <crédit>. »).
- **Point d'intérêt** : `object-position: <focus>`, déjà en place dans `PhotoFrame`.
- **Pas d'agrandissement** : si la largeur d'origine de l'image est inférieure à la largeur du cadre, le cadre est limité à cette largeur (`max-width: <width>px`) : l'image s'affiche en petit, jamais étirée.
- **Taille servie** : par `next/image` selon `sizes`. Hôte autorisé : `res.cloudinary.com`, chemin `/*/image/upload/**`.
- **Revalidation** : celle des lectures existantes, environ 60 secondes.
- **Aucune adresse** du Back Office ni de l'API n'apparaît dans les pages ; seules les adresses publiques des images, servies par l'optimiseur de Next.js.
