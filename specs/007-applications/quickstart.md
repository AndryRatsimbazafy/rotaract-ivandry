# Quickstart : vérifier les candidatures

Guide de vérification manuelle structurée. Il remplace les tests automatisés (constitution, principe IX). Contrat : [contracts/applications.md](./contracts/applications.md). Modèle : [data-model.md](./data-model.md).

## Prérequis

- Node.js 22, dépendances installées depuis la racine (`npm install`).
- `apps/api/.env` renseigné par le porteur du projet : base MongoDB Atlas joignable, et les trois variables `CLOUDINARY_*` d'un compte Cloudinary.
- Le compte d'administration et son mot de passe.
- Des fichiers de vérification, créés dans un dossier temporaire hors du dépôt : un petit PDF, un DOCX, un DOC, un fichier texte renommé en `.pdf`, un PDF renommé en `.docx`, un fichier de 5 242 880 octets exactement et un de 5 242 881 octets commençant tous deux par `%PDF-`, un fichier vide.

Démarrage : `npm run dev:api` depuis la racine. Se connecter une fois par `POST /api/v1/auth/login` ; `$JETON` désigne le `accessToken` reçu.

Les candidatures déposées ici portent des données factices. Elles sont **supprimées à la fin** par l'API (section 7), ce qui retire aussi leurs fichiers de Cloudinary.

Le dépôt est limité à 20 demandes par heure : la section 2 en consomme une partie. Le compteur est en mémoire ; **redémarrer l'API** le remet à zéro, ce qui est fait avant la section 5.

## 1. Démarrage

| Action | Résultat attendu |
|---|---|
| Démarrer l'API sans `CLOUDINARY_API_SECRET` (variable vidée au lancement, sans modifier `.env`) | Arrêt avec « Configuration invalide : CLOUDINARY_API_SECRET (…) », sans aucune valeur affichée. |
| Démarrer l'API normalement | Démarrage normal. La collection `applications` existe, vide, avec ses index. Le journal ne contient aucune valeur `CLOUDINARY_*`. |
| `GET /api/v1/admin/applications` sans jeton | `401`. |
| `GET /api/v1/applications` | `404` : aucune lecture publique. |

## 2. Déposer une candidature

Sans jeton.

| Action | Résultat attendu |
|---|---|
| `POST /applications` complet, avec le PDF | `201`, corps exactement `{"received":true}`. |
| Même dépôt avec le DOCX, puis le DOC, situation `professionnel` | `201` pour chacun. |
| Second dépôt avec le même email | `201` : deux candidatures. |
| Sans `firstName` ; sans `lastName` ; email « abc » ; téléphone « 12 » ; sans `applicantStatus` | `400`, détail sur le champ, message du contrat. |
| `applicantStatus` : « Étudiant », `student`, `ETUDIANT` | `400`, détail sur `applicantStatus`. |
| Champ supplémentaire `status=accepted` | `400`, « Champ non autorisé. ». |
| Sans fichier ; avec le fichier vide | `400`, détail sur `cv` : « Le CV est obligatoire. ». |
| Fichier envoyé dans un champ `document` ; deux fichiers | `400`, détail sur `cv`. |
| Fichier de 5 242 881 octets | `413`, « Contenu trop volumineux. ». |
| Fichier de 5 242 880 octets | `201`. |
| Fichier texte nommé `.pdf` ; PDF nommé `.docx` | `415`, « Type de contenu non pris en charge. ». |
| Après chaque refus, lire la liste d'administration et le dossier des CV chez Cloudinary | Aucune candidature ni aucun fichier de plus. |
| Corps JSON au lieu de `multipart` | `400` au format commun. |

## 3. Consulter

Avec le jeton.

| Action | Résultat attendu |
|---|---|
| `GET /admin/applications` | `200`, `data` et `meta` ; la plus récente d'abord ; `limit` 20. |
| Lire les champs d'une candidature | `id`, `firstName`, `lastName`, `email`, `phone`, `applicantStatus`, `cv` (`name`, `mimeType`, `size` seulement), `createdAt`. Ni `publicId`, ni `url`, ni `updatedAt`. |
| `mimeType` du DOCX déposé | Le type DOCX, quel que soit le type annoncé à l'envoi. |
| `?sort=` `createdAt`, `-createdAt`, `lastName`, `-lastName` | Quatre tris acceptés, ordre conforme. |
| `?sort=email` ; `?q=a` ; `?limit=101` ; `?from=hier` ; `?status=x` | `400` pour chacun. |
| `?q=` un nom entier ; une partie de nom | Résultats ; aucun résultat. |
| `?from=` et `?to=` à la date du jour, sans heure | Toutes les candidatures du jour. |
| `?to=` la veille ; `?from=` le lendemain ; `from` postérieur à `to` | `200`, liste vide. |
| `GET /admin/applications/:id` | `200`, même forme. |
| `GET /admin/applications/:id/cv` | `200` ; fichier identique à celui déposé (même empreinte) ; `Content-Type` du type constaté ; `Content-Disposition: attachment` avec le nom d'origine ; `Cache-Control: no-store`. |
| En-têtes et corps des réponses | Aucune occurrence de « cloudinary », de l'identifiant du fichier ni d'une adresse de stockage. |
| `GET`, `GET …/cv`, `DELETE` sur `abc`, puis sur un identifiant inconnu | `400` « Identifiant invalide. » ; `404`. |
| `POST`, `PATCH`, `PUT` sur `/admin/applications` et `/admin/applications/:id` | `404` : aucune de ces opérations n'existe. |
| Les quatre routes d'administration sans jeton, puis avec un jeton altéré | `401`. |

## 4. Stockage et confidentialité

| Action | Résultat attendu |
|---|---|
| Lire le dossier des CV chez Cloudinary (console ou API d'administration du fournisseur) | Un fichier par candidature ; ressource `raw`, type `authenticated` ; identifiants aléatoires, sans nom de candidat. |
| Appeler sans signature l'adresse de livraison d'un de ces fichiers | Refus : le fichier n'a pas d'adresse publique. |
| Démarrer une seconde instance avec un secret Cloudinary faux (variable passée au lancement, `.env` inchangé), déposer une candidature valide | `503`, « Service indisponible. » ; aucune candidature de plus. |
| Sur cette instance : `GET …/cv` ; `DELETE` d'une candidature | `503` ; la candidature existe toujours. |
| Lire le journal de l'API | Aucun email, téléphone ou nom de candidat ; aucune valeur `CLOUDINARY_*` ; aucune adresse signée. |

## 5. Limite de fréquence

Après un redémarrage de l'API.

| Action | Résultat attendu |
|---|---|
| 20 dépôts (des refus `400` suffisent), puis un vingt-et-unième | Les 20 premiers reçoivent leur réponse normale ; le suivant `429`, « Trop de requêtes. Réessayez plus tard. ». |
| `POST /auth/login` juste après | Réponse normale : le compteur de la connexion est distinct. |
| 6 connexions en une minute | La sixième : `429`, comme avant. |

## 6. Supprimer

| Action | Résultat attendu |
|---|---|
| `DELETE /admin/applications/:id` | `204`, sans corps. |
| `GET` de sa fiche, puis de son CV | `404`, `404`. |
| Lire le dossier des CV chez Cloudinary | Le fichier n'y est plus. |
| Retirer à la main un fichier chez Cloudinary, puis `GET …/cv` de sa candidature | `404`. |
| `DELETE` de cette candidature | `204` ; elle n'est plus dans la liste ; le journal porte une ligne technique avec son identifiant, sans nom, email ni référence Cloudinary. |

## 7. Non-régression et nettoyage

| Action | Résultat attendu |
|---|---|
| `GET /api/v1/health` | `200`. |
| `GET /api/v1/auth/me` sans jeton, puis avec jeton | `401`, puis `200`. |
| Années Rotary, membres et mandats, actions, actualités : une création, une lecture publique, une suppression chacun | Comme avant. |
| En-têtes d'une réponse publique | En-têtes de sécurité présents. |
| Supprimer par l'API toutes les candidatures et les données de non-régression | `GET /admin/applications` : `total` 0. |
| Compter les documents en base et les fichiers du dossier des CV | `applications`, `news`, `actions`, `members`, `membermandates`, `rotaryyears` : 0 ; `admins` : 1 ; aucun fichier chez Cloudinary. |

## 8. Contrôles de fin d'étape

| Commande (depuis la racine) | Résultat attendu |
|---|---|
| `npm run format --workspace=api` | Aucun fichier à corriger hors de la fonctionnalité. |
| `npm run lint` | Aucune erreur. |
| `npm run build:api` | Build réussi. |
| `npm run build:web` et `npm run build:admin` | Builds réussis, comme avant. |
| `git status` | Aucun fichier modifié dans `apps/web`, `apps/admin`, `DESIGN.md`, ni dans les modules `members`, `actions`, `news`, `rotary-years`, `auth` ; `apps/api/.env` absent de la liste. |
| Recherche des valeurs de `apps/api/.env` dans les fichiers versionnables | Aucune ; `.env.example` ne porte que des noms. |
| `apps/api/package.json` | Une seule dépendance ajoutée : `cloudinary`. |
