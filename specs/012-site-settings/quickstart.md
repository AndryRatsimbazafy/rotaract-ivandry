# Quickstart : vérifier les réglages du site

Vérification manuelle, à la place des tests automatisés (constitution, principe IX). Contrats : [api-site-settings.md](./contracts/api-site-settings.md), [admin-screens.md](./contracts/admin-screens.md), [front-office.md](./contracts/front-office.md).

## Prérequis

- Node 22, dépendances installées depuis la racine ; `apps/api/.env`, `apps/admin/.env.local`, `apps/web/.env.local` comme pour 011.
- Accès à la console Cloudinary du compte.
- Images de test : une photo de 4 Mo en paysage, une en portrait, une de 1200 px de large, un PDF renommé en `.jpg`.
- Démarrage : `npm run dev:api`, `npm run dev:admin`, `npm run dev:web`.
- Contrôle de fin : `npm run lint` et `npm run build` passent.

## 0. Base sans réglages (SC-002)

| Action | Résultat attendu |
|---|---|
| `curl http://localhost:4000/api/v1/site-settings` | `200`, `{"social":{},"club":{},"faq":{},"photos":{}}` |
| Ouvrir les cinq pages du site | Identiques à avant 012 : ouverture d'accueil livrée, gabarits, « Présentation à compléter », quatre questions dans la FAQ, pictogrammes « lien à venir » |
| `/site` dans le Back Office | Sept cartes vides ; réseaux sociaux vides ; présentation vide ; FAQ pré-remplie avec les quatre réponses actuelles, `qui` et `frequence` vides |

## 1. Photographies (récit 1)

| Action | Résultat attendu |
|---|---|
| « Accueil · Le club » → ajouter la photo en portrait, texte alternatif, point d'intérêt | Avis « Enregistrement créé. » ; vignette 4:5 ; fichier sous `site/pages/` chez Cloudinary |
| Accueil du site (attendre ~60 s) | La photo remplace le gabarit de la section 01, recadrée sur le point d'intérêt |
| « Accueil · Ouverture » → photo de 1200 px | Avertissement « Image plus petite que la largeur conseillée… » ; enregistrement possible |
| Remplacer « Accueil · Ouverture » par la photo de 4 Mo | Nouvelle image sur l'accueil, voile et signature inchangés ; l'ancien fichier a disparu chez Cloudinary |
| Retirer « Accueil · Ouverture » | Le site revient à la photographie livrée |
| « Nous rejoindre · Ouverture » vide, ouverture d'accueil enregistrée | La page Nous rejoindre reprend l'ouverture de l'accueil enregistrée |
| Remplir les sept emplacements, vérifier Actions et Membres | Images aux formats 4:5, 3:2, 2:1 ; légende et crédit sous l'image quand ils existent |
| Envoyer le PDF renommé | Refus « Format d'image non accepté : JPEG, PNG ou WebP. » ; rien chez Cloudinary |
| Onglet Réseau pendant un envoi | Une requête vers le port 3001 seulement (SC-006) |
| `curl …/site-settings` | Aucune clé `publicId`, `name`, `size` |
| `curl -X PUT …/admin/site-settings/photos/inconnu` (avec jeton) | `404` |

## 2. Réseaux sociaux (récit 2)

| Action | Résultat attendu |
|---|---|
| Facebook : `https://www.facebook.com/rotaractivandry` → Enregistrer | Avis « Modifications enregistrées. » |
| En-tête, pied de page, menu du téléphone du site (~60 s) | Le pictogramme Facebook est un lien vers l'adresse ; Instagram reste « lien à venir » |
| Facebook : `http://facebook.com/x`, puis `https://www.instagram.com/x` | Refus, message sous le champ |
| Vider Facebook → Enregistrer | Le pictogramme redevient sans lien |

## 3. Textes (récit 3)

| Action | Résultat attendu |
|---|---|
| Présentation : année 2012, nombre 24, rythme → Enregistrer | Accueil : fiche du club à trois lignes (Création, Membres, Rythme), filets encre ; la mention a disparu |
| Année 1950, puis nombre 0 | Refus, messages sous les champs |
| Vider les cinq champs | La mention « Présentation à compléter » revient |
| FAQ `frequence` : deux paragraphes → Enregistrer | La question apparaît dans la FAQ de Nous rejoindre, en dernière position, en deux paragraphes |
| Modifier la réponse `rencontre` | Le site affiche la nouvelle réponse |
| Vider la réponse `sympathisant` | Refus « Cette question a besoin d'une réponse. » |
| Vider `frequence` | La question disparaît du site |

## 4. Pannes

| Action | Résultat attendu |
|---|---|
| API arrêtée, recharger les pages du site | Elles s'affichent avec leurs emplacements et replis ; une page déjà lue garde son contenu en cache |
| API avec un faux `CLOUDINARY_API_SECRET`, retirer une photo | « Service indisponible. » ; la photo reste |

## 5. Téléphone (375 px)

| Action | Résultat attendu |
|---|---|
| Back Office, barre d'onglets | Six onglets lisibles, dont « Site » |
| `/site` | Cartes en une colonne ; panneau image en plein écran ; champs de 16 px |

## 6. Nettoyage

Retirer les sept photographies de test et vider les champs de test depuis `/site` ; vérifier qu'aucun fichier ne reste sous `site/pages/` chez Cloudinary.
