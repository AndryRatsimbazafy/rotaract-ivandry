# Contrat : cadre de l'espace protégé

Ce que voit l'administrateur autour de chaque écran protégé. Valeurs visuelles : `apps/admin/DESIGN.md`. Remplace la section « Cadre commun » de `specs/008-back-office/contracts/screens.md` ; le reste de ce contrat 008 demeure.

## Dès 900 px (`md`)

| Zone | Contenu |
|---|---|
| Barre latérale (216 px, collante, fond d'outillage, filet à droite) | Logo (bandeau de 48 px, lien vers `/`) ; navigation « Navigation principale » : Accueil, Années Rotary, Membres, Actions, Actualités, Candidatures (icône de 18 px, libellé ; entrée active : fond feuille, filet, icône cranberry, `aria-current="page"`) ; pied : « ANNÉE ROTARY » puis le label de l'année en cours en chiffres tabulaires, ou « — » |
| Barre supérieure (48 px, collante, filet dessous) | Fil d'Ariane « Rotaract Club Ivandry / <entrée active> » ; champ de recherche rapide (280 px, touche « Ctrl K » ou « ⌘ K ») ; bouton de thème ; bouton du compte (avatar Royal Blue, initiale de l'email) |
| Contenu | Jusqu'à 1440 px ; marges 24 px (`md`) puis 32 px (`lg`) |

## Sous 900 px

| Zone | Contenu |
|---|---|
| Barre supérieure | Logo (lien vers `/`), bouton de recherche, thème, compte |
| Barre d'onglets du bas (64 px + zone sûre, fixe) | Années, Membres, Actions, Actualités, Candidatures ; actif en cranberry avec un trait de 2 px en haut, `aria-current="page"` |
| Contenu | Marges de 16 px ; place réservée sous le contenu pour la barre d'onglets |
| Avis | Au-dessus de la barre d'onglets |

## Commun

- **Lien d'évitement** « Aller au contenu » : premier élément atteint au clavier, mène à `#contenu`.
- **Menu du compte** : email, « Administrateur », séparateur, « Se déconnecter » (envoie le formulaire de l'action serveur `logout` existante). Rien d'autre.
- **Thème** : menu « Clair », « Sombre », « Comme le système », l'option courante cochée ; nom accessible « Thème : <option> ».
- **Avis** : codes et textes de `specs/008-back-office/contracts/screens.md`, inchangés.

## En-tête de page (chaque écran protégé)

| Élément | Règle |
|---|---|
| Retour | Sur une fiche ou une page secondaire : lien texte avec flèche vers la liste (adresse de retour existante, `retour`) |
| Titre | Un seul `h1` par page |
| Marques | État de la fiche (publié, brouillon, en cours) en marque carrée |
| Contexte | Une ligne secondaire facultative (par exemple « Première publication le … ») |
| Actions | À droite (en dessous sur téléphone) ; une seule action principale pleine |
| Séparation | Filet de 1 px dessous ; aucune carte |
