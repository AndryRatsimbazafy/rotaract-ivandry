# Contrat : écrans après la refonte

Ce contrat ne décrit que ce qui change par rapport à `specs/008-back-office/contracts/screens.md`. Champs, colonnes, filtres, tris, messages, avis, gestionnaires de route et adresses de ce contrat 008 restent valables.

## Règles communes aux listes

| Règle | Détail |
|---|---|
| Composition | En-tête de page, barre d'outils (recherche et filtres en ligne), puis la zone « grille \| aperçu » |
| Grille | Pleine largeur, filets horizontaux et verticaux, en-têtes en petites capitales sur fond d'outillage, figés sous la barre supérieure dès `lg` ; pagination sous un filet fort, compteurs en chiffres tabulaires |
| Aperçu dès `lg` | Colonne de 360 px à droite, collante sous la barre supérieure, filet à gauche |
| Aperçu sous `lg` | Tiroir droit de 400 px (plein écran sous `sm`) quand une sélection existe |
| Sélection | Clic ou Espace sur une ligne ; ↑ ↓ ligne voisine ; Entrée ou double-clic : fiche complète. Paramètre `selection` (voir [data-model.md](../data-model.md)) |
| Menu de ligne | Bouton-icône « Actions pour <élément> » ouvrant : Ouvrir, Publier ou Dépublier (actions, actualités), Supprimer (avec la confirmation existante). Les candidatures n'ont que « Ouvrir » |
| Colonnes secondaires | Quand l'aperçu est en colonne, elles ne s'affichent qu'à partir de `xl` ; sinon à partir de `sm`, comme aujourd'hui |
| États | Attente, erreur avec « Réessayer », vide avec « Effacer les filtres » : textes de 008 |
| Invitation de l'aperçu | « Choisissez une ligne pour voir sa fiche. », puis les raccourcis : « ↑ ↓ changer de ligne · Entrée ouvrir la fiche » |

## Par écran

### `/` — Accueil

- En-tête : « Accueil ».
- Barre de chiffres : quatre cases (« MEMBRES <année> », « ACTIONS PUBLIÉES », « ACTUALITÉS PUBLIÉES », « CANDIDATURES »). Chaque valeur est en chiffres tabulaires, ou « — » ; chaque case est un lien. Lectures : [data-model.md](../data-model.md), « Chiffres de l'accueil ».
- Sous la barre : les cinq accès de 008, avec leur phrase, en liste à filets (pas de cartes).

### `/annees`

- Colonnes principales : Année, En cours (marque). Secondaires : Début, Fin.
- Aperçu (sans lecture) : label, début, fin, marque « En cours », « Supprimer ».
- « Nouvelle année » ouvre un **panneau latéral** (titre « Nouvelle année », champ « Année de début », « Créer » et « Annuler »), à la place du dialogue.

### `/membres`

- Principales : Nom, Prénom. Secondaires : Profession ou études, Email, Téléphone.
- Aperçu : coordonnées, mandats (année en chiffres tabulaires, fonctions), « Ouvrir la fiche », « Supprimer ».
- « Nouveau membre » et « Ordre d'une année » restent dans l'en-tête.

### `/membres/[id]`

- En-tête : retour « Membres », titre prénom et nom.
- Section « Mandats » : titre de section à filet. « Ajouter un mandat » et « Modifier les fonctions » ouvrent un **panneau latéral** (mêmes champs et messages).

### `/membres/ordre`

- Composition en grille : rang en chiffres tabulaires, nom, fonctions, boutons « Monter » et « Descendre ». Actions de la page dans l'en-tête. Comportement inchangé.

### `/actions` et `/actualites`

- Principales : État (marque), Titre, Date. Secondaires : Année, Ordre (actions) ou Type (actualités), Création.
- Aperçu : voir [data-model.md](../data-model.md) ; actions « Ouvrir la fiche », « Publier » ou « Dépublier », « Supprimer ».

### `/actions/nouvelle`, `/actions/[id]`, `/actualites/nouvelle`, `/actualites/[id]`

- Pages entières. En-tête : retour, titre, marque d'état, contexte « Première publication le … ».
- Groupes de champs séparés par des titres de section à filet. Pied d'actions : « Enregistrer » (plein), « Annuler » (texte). Erreurs de l'API en tête dans une alerte à filet teinté.

### `/candidatures`

- Principales : Nom, Prénom, Date de candidature. Secondaires : Email, Situation.
- Aperçu : coordonnées, situation, date, CV (nom, type, taille en chiffres tabulaires) ; « Télécharger le CV », « Contacter par email », « Ouvrir la fiche ». La suppression reste sur la fiche.

### `/candidatures/[id]`

- En-tête : retour, nom ; informations en liste libellé / valeur sur deux colonnes, « — » pour une valeur absente.

### `/connexion`

- Dès `md` : deux colonnes. À gauche, le formulaire (360 px) ; à droite, le panneau Royal Blue tramé de filets portant l'emblème. Sous `md` : le logo au-dessus du formulaire. Champs en taille normale. Comportement et messages inchangés.

### `/acces-refuse`, introuvable, erreur

- En-tête de page et textes de 008 ; actions en boutons du nouveau style.
