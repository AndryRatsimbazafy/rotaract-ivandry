# Quickstart : vérifier le stockage des images

Ce guide de vérification manuelle remplace les tests automatisés (constitution, principe IX). Contrats : [api-images.md](./contracts/api-images.md), [admin-screens.md](./contracts/admin-screens.md) et [front-office.md](./contracts/front-office.md).

## Prérequis

- Node 22 (`nvm use`) et les dépendances installées depuis la racine.
- `apps/api/.env` complet, avec les trois `CLOUDINARY_*` : ce sont les mêmes que pour les CV.
- `apps/admin/.env.local` et `apps/web/.env.local` (`API_URL`).
- Accès à la console Cloudinary du compte, pour constater les fichiers.
- Images de test :
  - une photo JPEG de téléphone en portrait, d'environ 4 Mo ;
  - un PNG de 800 px de large (trop petit) ;
  - un WebP ;
  - un fichier de 6 Mo ;
  - un PDF renommé `photo.jpg` ;
  - un GIF.
- Données de test : une action publiée, une actualité publiée et un membre avec un mandat dans l'année en cours. Toutes sont supprimées à la fin (section 8).

Démarrage, depuis la racine : `npm run dev:api`, `npm run dev:admin`, `npm run dev:web`.

Contrôle de fin : `npm run lint` et `npm run build` passent.

## 1. Portrait d'un membre (US2)

| Action | Résultat attendu |
|---|---|
| `/membres/nouveau` | Ligne « Le portrait s'ajoute sur la fiche, après l'enregistrement. » ; aucun champ d'image |
| Fiche du membre → « Ajouter un portrait », choisir la photo JPEG en portrait | « Préparation de l'image… », puis la vignette droite ; dimensions de 3000 px au plus sur le côté le plus long, hauteur supérieure à la largeur |
| Enregistrer sans texte alternatif | « Le texte alternatif est obligatoire. » sous le champ ; rien n'est envoyé ni stocké |
| Cliquer en haut de la vignette, saisir le texte alternatif, Enregistrer | Avis « Enregistrement créé. » ; vignette 4:5 recadrée vers le haut ; un fichier dans `site/membres/` chez Cloudinary |
| Onglet Réseau pendant l'envoi | Une seule requête, vers le port 3001 ; aucune vers le 4000 ni vers Cloudinary (SC-006) |
| « Remplacer » par le PNG de 800 px | Avertissement « Image plus petite que la largeur conseillée… » ; après l'enregistrement, l'ancien fichier a disparu chez Cloudinary |
| « Retirer » et confirmer | « Aucun portrait. » ; le fichier a disparu chez Cloudinary |
| Remettre un portrait, ouvrir `http://localhost:3000/membres` (attendre environ 60 s) | Portrait à la place du gabarit, texte alternatif juste ; ni email ni téléphone dans la réponse de `GET /api/v1/members` |

## 2. Photographies d'une action (US1)

| Action | Résultat attendu |
|---|---|
| `/actions/nouvelle` | Ligne « Les photographies s'ajoutent sur la fiche, après l'enregistrement. » |
| Fiche de l'action → ajouter le JPEG, puis le WebP | « Photographies · 2 / 20 » ; le rang 1 porte « Principale » |
| « Descendre » la première | Avis « Ordre enregistré. » ; l'ordre est inversé après rechargement |
| « Modifier » la seconde : légende et crédit | Modifications enregistrées ; aucun nouveau fichier chez Cloudinary |
| Fichier de 6 Mo, GIF, PDF renommé | Refus immédiat dans le panneau, avec le message de l'API ; rien chez Cloudinary (SC-002) |
| Envoyer le PDF renommé directement à l'API (`curl` multipart avec le jeton) | `415` « Format d'image non accepté : JPEG, PNG ou WebP. » |
| Envoyer 6 Mo directement à l'API | `413` |
| Atteindre 20 photographies (images légères) | « Ajouter une photographie » désactivé ; une 21e envoyée à l'API répond `409` |
| Page Actions et accueil du site | Photographie principale à la place du gabarit ; les suivantes dans la planche du dépliant ; légende et crédit sous l'image |
| Outils de développement, téléphone (375 px), page Actions | Aucune image livrée de plus de 500 Ko (SC-004) |
| Réponses de `GET /api/v1/actions` et `GET /api/v1/admin/actions/:id` | Aucun `publicId` ; pas de `name` ni de `size` dans la lecture publique |

## 3. Orientation (research, R4)

| Action | Résultat attendu |
|---|---|
| Envoyer à l'API, sans passer par le Back Office, une photo de téléphone en portrait dont l'orientation est dans l'EXIF | Le `height` renvoyé est supérieur au `width` ; l'image s'affiche droite sur le site |

## 4. Actualités (US3)

| Action | Résultat attendu |
|---|---|
| Ajouter une photographie à l'actualité la plus récente et publiée | Même comportement qu'en section 2 |
| Page Actualités | Photographie à la une et dans le registre |

## 5. Ménage (US4)

| Action | Résultat attendu |
|---|---|
| Supprimer l'action qui a deux photographies | Les deux fichiers ont disparu chez Cloudinary (SC-003) |
| Supprimer le membre qui a un portrait | Fichier disparu |
| Lancer une API avec un `CLOUDINARY_API_SECRET` faux, puis retirer une photographie | « Service indisponible. » ; la photographie reste |
| Même API, supprimer une actualité qui a une photographie | « Service indisponible. » ; l'actualité reste |

## 6. Aperçus (010)

| Action | Résultat attendu |
|---|---|
| Choisir dans sa liste un membre avec portrait, puis une action avec photographies | Image en tête de l'aperçu ; « N photographies » pour l'action |

## 7. Accessibilité

| Action | Résultat attendu |
|---|---|
| Placer le point d'intérêt au clavier | Les flèches déplacent le repère de 5 % ; l'annonce donne la position ; « Recentrer » ramène à 50 %, 50 % |
| Parcourir le site sans image | Gabarits identiques à avant (SC-007) |

## 8. Nettoyage

Supprimer les données de test depuis le Back Office ; vérifier qu'aucun fichier de test ne reste dans `site/` chez Cloudinary.
