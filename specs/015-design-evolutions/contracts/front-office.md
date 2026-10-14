# Contrat Front Office : 015

Direction : `DESIGN.md` (sections complétées avant le code, voir le plan). Deux langues (014) : tout texte fixe existe dans `content/fr` et `content/en`.

## Adresses nouvelles

| Adresse | Contenu | Statut |
|---|---|---|
| `/club`, `/en/club` | Page « Le club » | `200` |
| `<page>/opengraph-image…` | Image de partage PNG 1200 × 630 de chaque page | `200` ; `404` pour un contenu non publié |

`/fr/club` → `308` vers `/club` (règle du `proxy.ts`, inchangée).

## Métadonnées de partage (toutes les pages)

- `og:image` (1200 × 630), `og:image:alt`, `twitter:card = summary_large_image`, `twitter:image`.
- Le titre de l'image suit la langue de l'adresse ; repli français pour un contenu non traduit.
- Pages : accueil, Actions, Actualités, Membres, Nous rejoindre, Le club, page d'une action, page d'une actualité.

## Navigation

- Ordre : Accueil · **Le club** · Actions · Actualités · Membres · Nous rejoindre.
- Libellés : « Le club » / « The club ». Rubrique courante soulignée en bleu sur `/club`.
- Section « Le club » de l'accueil : un lien fléché « En savoir plus sur le club » / « More about the club » vers `/club`.

## Page « Le club » (ordre de lecture)

1. Ouverture : titre de page (H1), photographie `club-ouverture` (repli FR-026).
2. Histoire : paragraphes de `history` (ou `en.history`, sinon `history` marqué « In French ») ; absente si rien n'est saisi.
3. Le Rotaract et le Rotary : texte fixe ; club parrain (`club.sponsorClub`) s'il est saisi.
4. Chiffres clés : liste de définitions, une ligne par chiffre présent ; chiffres tabulaires ; aucun mouvement.
5. Frise des années : `<ol>` de la plus récente à la plus ancienne ; absente si vide.
6. Liens de sortie (Actions, Nous rejoindre) et rappel cranberry existant.

## Galerie plein écran (pages de détail)

| Élément | Français | Anglais |
|---|---|---|
| Bouton d'une photographie | « Agrandir la photographie : <alt> » | « Enlarge photograph: <alt> » |
| Dialogue | « Photographies de <titre> » | « Photographs of <title> » |
| Commandes | « Photographie précédente », « Photographie suivante », « Fermer » | « Previous photograph », « Next photograph », « Close » |
| Annonce | « Photographie 3 sur 12 » | « Photograph 3 of 12 » |

Clavier : ← → passent, Échap ferme, Tab circule dans le dialogue. Retour du navigateur : ferme. Une seule photographie : ni position ni flèches.

## Téléphone

- `<meta name="theme-color" content="#ffffff">`, `viewport-fit=cover`, zoom manuel autorisé.
- Aucun texte ni commande sous l'encoche ou la barre d'accueil (en-tête, menu, pied de page, galerie).
- Appui : changement de couleur immédiat, sans surbrillance du navigateur.
