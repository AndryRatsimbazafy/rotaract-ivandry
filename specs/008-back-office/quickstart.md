# Quickstart : vérifier le Back Office

Guide de vérification manuelle structurée. Il remplace les tests automatisés (constitution, principe IX). Écrans : [contracts/screens.md](./contracts/screens.md). Opérations : [contracts/api-usage.md](./contracts/api-usage.md).

## Prérequis

- Node.js 22, dépendances installées depuis la racine (`npm install`).
- `apps/api/.env` renseigné (base, `JWT_SECRET`, `CLOUDINARY_*`) ; le compte d'administration et son mot de passe.
- `apps/admin/.env.local`, créé à la main : `API_URL=http://localhost:4000/api/v1`.
- Chrome ou Firefox (cookie `Secure` sur `localhost`).
- Pour la section 7 : deux ou trois candidatures déposées par `POST /api/v1/applications` avec de petits fichiers factices, et une instance de l'API lancée avec un secret Cloudinary faux pour le cas du stockage indisponible (comme en 007).

Démarrage : `npm run dev:api` et `npm run dev:admin` depuis la racine. Back Office : `http://localhost:3001`.

Toutes les données créées ici sont factices et **supprimées à la fin** (section 9).

## 1. Connexion et protection

| Action | Résultat attendu |
|---|---|
| Ouvrir `/`, `/annees`, `/membres/ordre`, `/candidatures/…/cv` sans être connecté | Redirection vers `/connexion` ; aucune donnée. |
| Email ou mot de passe vide | Message de l'API sous le champ. |
| Mot de passe faux, puis email inconnu | « Email ou mot de passe incorrect. » dans les deux cas ; l'email saisi reste. |
| Six tentatives en une minute | « Trop de requêtes. Réessayez plus tard. » |
| Identifiants corrects | Accueil. |
| Outils du navigateur : cookies, stockage, réseau | Un cookie `httpOnly` ; rien dans `localStorage` ; aucune requête vers le port 4000 ; `document.cookie` ne montre pas le jeton. |
| Ouvrir `/connexion` en étant connecté | Redirection vers `/`. |
| Altérer la valeur du cookie dans le navigateur, puis recharger | Retour à `/connexion` avec « Votre session a expiré. » ; le cookie a disparu ; pas de boucle de redirection. |
| Altérer le cookie, puis envoyer un formulaire resté ouvert | Même retour à la connexion. |
| « Se déconnecter », puis bouton « précédent » | Connexion ; aucun écran protégé ne revient. |

## 2. Navigation et accueil

| Action | Résultat attendu |
|---|---|
| Parcourir les cinq entrées | Chaque écran s'ouvre ; l'entrée en cours est marquée ; l'email du compte est visible. |
| Accueil | Cinq accès, aucun chiffre. |
| Fenêtre à 800 px, puis 400 px | Menu en tiroir ; tableaux défilants ; formulaires lisibles. |
| Adresse inconnue (`/membres/abc`, `/nimporte`) | Page « introuvable », navigation présente. |
| Navigation au clavier seul | Lien d'évitement, focus visible, dialogues fermables par Échap. |

## 3. Années Rotary

| Action | Résultat attendu |
|---|---|
| Liste vide | État vide invitant à créer la première année. |
| Créer 2026, puis 2025 | Deux lignes, la plus récente d'abord ; libellé, 1er juillet, 30 juin ; « En cours » sur l'année courante ; avis. |
| Créer 2026 à nouveau | « Cette année Rotary existe déjà. » en tête du dialogue. |
| Créer 1999, « abc », vide | Message de l'API sous le champ. |
| Supprimer 2025 (sans contenu) | Confirmation, puis disparition et avis. |
| Supprimer une année utilisée (après la section 4) | Année conservée ; message d'année utilisée. |
| Chercher une action de modification | Aucune. |

## 4. Membres et mandats

| Action | Résultat attendu |
|---|---|
| Créer un membre avec prénom et nom seuls | Créé ; champs facultatifs vides. |
| Créer avec un email « abc », un téléphone « 12 » | Messages de l'API sous les champs ; saisie conservée. |
| Créer trois membres ; chercher un nom entier, une partie de nom, « a » | Un résultat ; aucun ; message de l'API. |
| Trier par nom, par date de création, dans les deux sens ; changer de page avec plus de 20 membres ou `limit` | Ordres conformes ; total affiché. |
| Ouvrir une fiche depuis une liste filtrée, puis revenir | Filtres, tri et page conservés. Idem après rechargement. |
| Vider la profession, l'email, le téléphone ; enregistrer | Données effacées. |
| Ajouter un mandat 2026-2027 avec deux fonctions, puis un sans fonction à un autre membre | Mandats créés ; aucun ordre demandé. |
| Ajouter un second mandat 2026-2027 au même membre | « Ce membre a déjà un mandat pour cette année. » |
| Modifier les fonctions d'un mandat | Liste remplacée. |
| Filtrer la liste par année, par fonction | Membres concernés. |
| `/membres/ordre` pour 2026-2027 : descendre le premier, enregistrer | Nouvel ordre conservé après rechargement ; avis. Vérifier par l'API : ordres de 1 à n. |
| Ouvrir l'écran d'ordre, supprimer un mandat de l'année dans un autre onglet, enregistrer | « La liste a changé… » ; aucun ordre modifié. |
| Supprimer un mandat | Disparaît ; le membre reste. |
| Supprimer un membre qui a des mandats | La confirmation annonce la suppression des mandats ; membre et mandats disparus. |
| Chercher un champ de portrait | Aucun. |

## 5. Actions

| Action | Résultat attendu |
|---|---|
| Sans aucune année : ouvrir `/actions/nouvelle` | « Créez d'abord une année Rotary. », lien vers `/annees`. |
| Saisir une date de 2026-2027 | L'année est proposée, avec sa mention ; elle reste modifiable. |
| Choisir une autre année que celle de la date | Avertissement non bloquant ; l'enregistrement réussit avec l'année choisie. |
| Créer avec titre, date, année | Brouillon ; slug généré, visible à la réouverture. |
| Modifier le titre | Le slug ne change pas. |
| Renseigner deux rubriques d'impact et trois partenaires | Par l'API : seules ces rubriques existent. |
| Vider toutes les rubriques | Par l'API : plus de champ `impact`. |
| Publier ; dépublier ; republier | État mis à jour ; « Première publication le … » ne change pas. |
| Publier depuis la liste | Même effet, avis. |
| Changer le slug d'une action publiée | Dialogue d'avertissement ; « Annuler » ne change rien ; « Confirmer » enregistre. |
| Changer le slug d'un brouillon | Aucun avertissement. |
| Slug déjà pris ; slug `years` ; slug « Avec Espaces » | « Ce slug est déjà utilisé. » en tête ; messages de l'API sous le champ ; saisie conservée. |
| Ordre 2, puis vide ; ordre 0 | Enregistré, effacé ; message de l'API. |
| Recherche, filtres année, domaine, publication ; tris | Conformes au contrat 005. |
| Supprimer | Confirmation, disparition. |
| Chercher un champ de photographie | Aucun. |

## 6. Actualités

| Action | Résultat attendu |
|---|---|
| Liste de types du formulaire | Cinq, avec leurs libellés. |
| Créer une actualité datée du 15/09/2026 à 18:30 | Par l'API : `date` = `2026-09-15T15:30:00.000Z`. Liste et fiche : 15/09/2026 18:30. |
| Rouvrir cette actualité | Le champ affiche 15/09/2026 18:30. |
| Changer le fuseau de l'ordinateur (ou du navigateur), recharger | Mêmes date et heure affichées et préremplies. |
| Créer une actualité datée du 10/10/2026 à 01:00 | Par l'API : `2026-10-09T22:00:00.000Z` ; le Back Office affiche le 10/10/2026 01:00. |
| Dater une actualité du 01/07/2027 à 02:00 | L'année proposée est 2026-2027 (borne de l'API en temps universel) ; choisir 2027-2028 déclenche l'avertissement non bloquant. |
| Vider lieu, résumé, contenu | Effacés (par l'API : `null`). |
| Filtrer par une année passée | Ses actualités, brouillons compris. |
| Filtres type, publication ; recherche ; tris | Conformes au contrat 006. |
| Publication, slug (dont `archives`), année, suppression | Comme la section 5. |
| Chercher photographie, ordre, impact, domaine, date de fin | Aucun. |

## 7. Candidatures

| Action | Résultat attendu |
|---|---|
| Liste | La plus récente d'abord ; situation en clair ; date en heure de Madagascar. |
| Chercher un nom entier ; une partie de nom | Résultat ; aucun. |
| Période « Du » et « Au » à la date du jour (Madagascar) | Les candidatures du jour, telles que la colonne de date les affiche. |
| « Du » postérieur à « Au » | Liste vide, état « aucun résultat ». |
| Tris date et nom, dans les deux sens | Conformes. |
| Chercher un filtre par situation, un bouton de création ou de modification | Aucun. |
| Ouvrir une fiche | Tous les champs ; CV : nom, type, taille. |
| « Télécharger le CV » | Fichier téléchargé sous son nom d'origine ; empreinte identique à celle du fichier déposé ; on reste sur la fiche. |
| « Contacter par email » | Le client de messagerie s'ouvre sur l'email du candidat. |
| Retirer à la main le fichier chez Cloudinary, puis « Télécharger le CV » | « Le fichier du CV est introuvable. » ; la fiche reste utilisable. |
| Supprimer cette candidature | Supprimée, avis, sans message d'erreur. |
| Supprimer une candidature dont le CV existe | Supprimée, avis. |
| Back Office pointé sur l'API au secret Cloudinary faux : télécharger, puis supprimer | « Service indisponible. » dans les deux cas ; la candidature est toujours dans la liste et dans sa fiche. |
| Code source des pages, réponses réseau, adresses, en-têtes du téléchargement | Aucune occurrence de « cloudinary », d'un identifiant de fichier ni d'une adresse de stockage. |

## 8. Erreurs transverses

| Action | Résultat attendu |
|---|---|
| Arrêter l'API, ouvrir une liste | Message générique, « Réessayer » ; navigation utilisable ; aucun détail technique. |
| Arrêter l'API, envoyer un formulaire rempli | Message générique en tête ; saisie conservée. |
| Supprimer une ressource dans un onglet, l'ouvrir ou l'enregistrer dans un autre | « Ressource introuvable. », retour à la liste. |
| Double clic rapide sur « Enregistrer » | Une seule création. |
| Aller à `?page=99` sur une liste courte | Dernière page existante. |

## 9. Nettoyage et non-régression

| Action | Résultat attendu |
|---|---|
| Supprimer par le Back Office candidatures, actualités, actions, membres, années | Listes vides. |
| Compter en base et chez Cloudinary | `applications`, `news`, `actions`, `members`, `membermandates`, `rotaryyears` : 0 ; `admins` : 1 ; aucun fichier de CV. |
| `GET /api/v1/health` ; une lecture publique | `200` : l'API est inchangée. |

## 10. Contrôles de fin d'étape

| Commande (depuis la racine) | Résultat attendu |
|---|---|
| `npm run lint` | Aucune erreur. |
| `npm run build:admin` | Build réussi. |
| `npm run build:web` et `npm run build:api` | Builds réussis, comme avant. |
| `git status` | Aucun fichier modifié dans `apps/web`, `apps/api/src`, `DESIGN.md` ; aucun `.env` ni `.env.local` listé. |
| `apps/admin/package.json` | Les cinq dépendances du plan, plus `@emotion/cache` (plan, section D). |
| Recherche de `API_URL` et du jeton dans les fichiers servis au navigateur (`.next/static`) | Aucune valeur. |
| Recherche de fichiers de test ou d'outillage de test | Aucun. |
