# Quickstart : vérifier les évolutions design

Vérification manuelle (constitution, principe IX). Contrats : [api.md](./contracts/api.md), [front-office.md](./contracts/front-office.md), [admin-screens.md](./contracts/admin-screens.md).

## Prérequis

- Node 22, dépendances installées, les trois applications lancées.
- Données : une action publiée **A** avec au moins trois photographies dont une avec légende et crédit ; une actualité publiée **N** sans photographie ; trois années Rotary, dont une avec un président et une action marquante, une avec un président seulement, une avec ni l'un ni l'autre.
- Un téléphone réel iOS à encoche et un Android sur le même réseau, site ouvert par l'adresse IP de la machine.
- Contrôle de fin : `npm run lint`, `npm run build`.

## 1. Images de partage (récit 1)

| Action | Résultat attendu |
|---|---|
| Source de `/actions/<A>` | `og:image` 1200 × 630, `og:image:alt`, `twitter:card` `summary_large_image` |
| Ouvrir l'adresse de l'image | Photographie principale de A voilée, trait d'or, titre en blanc, logo ; aucun texte coupé |
| Même chose sur `/en/actions/<A>` avec un titre anglais | Titre anglais sur l'image |
| `/actualites/<N>` (sans photographie) | Image sur la photographie d'ouverture du site |
| Titre de 120 caractères | Abrégé au dernier mot, avec « … » |
| Dépublier A, rouvrir l'image | `404` |
| Outil d'aperçu de Facebook (Sharing Debugger) et message WhatsApp | Aperçu avec image et titre |

## 2. Galerie (récit 2)

| Action | Résultat attendu |
|---|---|
| Page de A, activer la deuxième photographie | Dialogue plein écran, « 2 / n », légende, crédit |
| ← → au clavier ; Tab | Passage ; focus reste dans le dialogue |
| Échap | Fermeture ; focus sur la deuxième photographie ; page à la même position |
| Rouvrir, retour du navigateur | Fermeture, on reste sur la page de A |
| Téléphone : balayage horizontal | Passage d'une photographie à l'autre, sans défilement de la page |
| Mouvement réduit activé | Passage sans glissement |
| Lecteur d'écran | Commandes nommées, « Photographie 3 sur n » annoncé |
| `/en/actions/<A>` | Commandes en anglais ; légende non traduite déclarée `lang="fr"` |

## 3. Page « Le club » et frise (récits 3 et 4)

| Action | Résultat attendu |
|---|---|
| En-tête à 1024 px et 1280 px, FR puis EN | Six entrées sur une ligne ; « Le club » en deuxième |
| `/club` sans histoire ni fiche du club | Page sans paragraphe d'histoire ni ligne de chiffre vide |
| Back Office → Site → Histoire (deux paragraphes) → Enregistrer | Deux paragraphes sur `/club` ; sur `/en/club`, marqués « In French » |
| Histoire (anglais) saisie | `/en/club` en anglais |
| Déposer « Le club — ouverture » | Ouverture de `/club` et image de partage avec cette photographie |
| Frise | Trois années attendues : l'année vide n'apparaît pas ; l'année sans action montre son président seul |
| Cocher « marquante » sur trois actions de 2025-2026, puis une quatrième | Refus nommant 2025-2026 sous la case |
| Déplacer une action marquée vers une année pleine | Même refus |
| Clic sur une action de la frise depuis `/en/club` | `/en/actions/<slug>` |

## 4. Téléphone (récit 5)

| Action | Résultat attendu |
|---|---|
| iPhone, portrait et paysage : accueil, menu ouvert, galerie | Barre d'état blanche ; rien sous l'encoche ni la barre d'accueil |
| Appui long sur un lien fléché, un bouton, une photographie | Changement de couleur dès l'appui, aucun flash gris |
| Focus dans un champ du formulaire de candidature | Pas d'agrandissement automatique ; pincer pour zoomer fonctionne |

## 5. Non-régression

- Les pages existantes, FR et EN, sont identiques hormis : l'entrée « Le club », le lien de la section « Le club » de l'accueil, les photographies cliquables des pages de détail.
- `curl -s -o /dev/null -w "%{http_code}"` sur les pages existantes : `200`.

## 6. Nettoyage

Retirer les actions marquées et les textes de test.
