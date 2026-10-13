# Quickstart : vérifier la refonte du Back Office

Ce guide de vérification manuelle remplace les tests automatisés (constitution, principe IX). Il renvoie aux contrats : [shell.md](./contracts/shell.md), [screens.md](./contracts/screens.md) et [quick-search.md](./contracts/quick-search.md). Valeurs visuelles : `apps/admin/DESIGN.md`.

## Prérequis

Les mêmes que pour `specs/008-back-office/quickstart.md` :
- l'API et sa base ;
- le compte d'administration ;
- `apps/admin/.env.local` ;
- Chrome ou Firefox.

Il faut aussi :
- au moins une année Rotary en cours ;
- deux membres ayant un mandat cette année-là ;
- une action publiée et une en brouillon ;
- une actualité publiée ;
- une candidature.

Ces données sont créées pour l'occasion et supprimées à la fin.

Démarrage : `npm run dev:api` et `npm run dev:admin` depuis la racine. Back Office : `http://localhost:3001`.

Contrôle de fin : `npm run lint --workspace=admin` et `npm run build:admin` passent sans erreur.

## 1. Non-régression fonctionnelle

Rejouer **en entier** les sections 1 à 8 de `specs/008-back-office/quickstart.md`. Chaque résultat attendu doit se vérifier à l'identique, avec deux adaptations :
- **Création d'une année et saisie des mandats** : elles passent par un panneau latéral (voir [screens.md](./contracts/screens.md)).
- **Contrôle « rien dans `localStorage` »** : il devient « seule la préférence de thème de MUI y figure ». Elle est enregistrée sous une clé `mui-…` qui ne contient que `light`, `dark` ou `system`. Le jeton n'y est jamais.

Ce rejeu vérifie SC-002.

## 2. Direction et cadre

| Action | Résultat attendu |
|---|---|
| Ouvrir chaque écran à 1440 px | Barre latérale de 216 px, barre supérieure de 48 px, fil d'Ariane juste, entrée active marquée ; en-tête de page avec un seul `h1` et un filet dessous |
| Inspecter les surfaces posées dans la page | Aucune ombre, aucune carte ; séparation par des filets et par le fond d'outillage |
| Boutons pleins et à contour | Coins de 2 px, chanfrein en bas à droite, aucun effet d'onde ; focus clavier visible (2 px) |
| États Publié / Brouillon / En cours | Carré de 8 px + libellé ; brouillon en carré vide cerclé |
| Dates courtes, années, rangs, tailles | Police à chasse fixe ; « Première publication le … » en police de l'interface |
| Tab dès l'ouverture d'une page | « Aller au contenu » apparaît en premier |
| Menu du compte | Email, « Administrateur », « Se déconnecter » seulement |
| Pied de la barre latérale | Label de l'année en cours ; « — » s'il n'y en a pas |

## 3. Thème

| Action | Résultat attendu |
|---|---|
| Thème → Sombre, puis recharger | Sombre dès le premier affichage, sans éclair clair, y compris sur `/connexion` après déconnexion |
| Thème → Comme le système, changer le thème du système | Le Back Office suit |
| Parcourir tous les écrans dans les deux thèmes | Textes, contours de champ et marques lisibles (contrastes WCAG 2.2 AA vérifiés avec l'outil des navigateurs) ; bon logo dans chaque thème |

## 4. Listes et aperçu (`lg` et plus)

| Action | Résultat attendu |
|---|---|
| `/actions` à 1280 px, aucune sélection | Grille et aperçu côte à côte ; aperçu en invitation avec les raccourcis |
| Cliquer une action | La ligne est marquée ; l'adresse gagne `selection=<id>` sans nouvelle entrée d'historique ; l'aperçu attend brièvement, puis montre la fiche (impact si présent) |
| Tab jusqu'à la grille, ↓ ↓ ↓ rapidement | Seule la dernière ligne choisie s'affiche dans l'aperçu ; aucune réponse en retard ne la remplace |
| Entrée | La fiche s'ouvre à son adresse habituelle ; « retour » ramène à la liste avec la même sélection |
| Recharger la liste, ou copier l'adresse dans un autre onglet | Même ligne choisie, même aperçu |
| Filtre qui exclut la ligne choisie | La sélection quitte l'adresse ; aperçu en invitation |
| `selection=abc` à la main | La liste s'affiche ; aperçu en invitation |
| Supprimer l'élément dans un autre onglet, puis rechoisir sa ligne restée affichée | « Ressource introuvable. » dans l'aperçu |
| Publier ou supprimer depuis l'aperçu, puis depuis le menu de ligne | Mêmes confirmations et mêmes avis qu'en 008 |
| Membres, actualités, candidatures, années | Contenu de l'aperçu conforme à [data-model.md](./data-model.md) ; années sans attente |
| 1280 px puis 1600 px | Les colonnes secondaires n'apparaissent qu'à 1536 px et plus ; aucune grille ne défile en largeur dès 1200 px |

Ce tableau vérifie SC-004.

## 5. Aperçu en tiroir et téléphone

| Action | Résultat attendu |
|---|---|
| 1024 px, choisir une ligne | Tiroir droit de 400 px ; Échap, clic à côté ou « Fermer » le ferment et retirent `selection` |
| 375 px (outils du navigateur) | Barre d'onglets de cinq domaines en bas ; logo en haut, qui ramène à l'accueil ; avis au-dessus des onglets ; aucun défilement horizontal de la page, seules les grilles défilent |
| 375 px, « Nouvelle année », puis une création d'actualité complète | Panneau plein écran ; champs à 16 px, sans zoom au focus ; boutons de 40 px ; création réussie |

Ce tableau vérifie SC-006.

## 6. Recherche rapide

| Action | Résultat attendu |
|---|---|
| Ctrl+K (⌘K) sur un écran, puis dans un champ de formulaire | Le dialogue s'ouvre dans les deux cas ; la saisie du formulaire est intacte après Échap |
| Taper « ac » | L'écran « Actions » apparaît ; les groupes de contenus apparaissent après un court délai |
| Taper le début du nom d'un membre, ↓, Entrée | La fiche du membre s'ouvre en moins de 10 secondes depuis l'appui sur Ctrl+K |
| Texte sans correspondance | « Aucun résultat » |
| Onglet Réseau pendant la recherche | Aucune requête vers le port 4000 ; seuls des appels d'action serveur vers le port 3001 ; le terme n'apparaît dans aucune adresse |
| Altérer le cookie, puis chercher | Retour à la connexion avec « Votre session a expiré. Reconnectez-vous. » |

Ce tableau vérifie SC-003 et SC-007.

## 7. Accueil

| Action | Résultat attendu |
|---|---|
| Ouvrir `/` | Quatre chiffres égaux aux totaux des listes filtrées correspondantes ; chaque case mène à sa liste |
| Arrêter l'API, recharger `/` | Les chiffres valent « — » (jamais 0) ; l'écran reste utilisable |
| Aucune année en cours (supprimer temporairement l'année de test si elle n'est pas utilisée, ou utiliser une base sans année courante) | Case membres à « — » |

## 8. Connexion et pages à part

| Action | Résultat attendu |
|---|---|
| `/connexion` à 1280 px puis à 375 px | Panneau Royal Blue tramé avec l'emblème à côté du formulaire, puis formulaire seul avec le logo |
| `/acces-refuse`, une adresse inconnue, une erreur d'API | Textes de 008 dans le nouveau style |

## 9. Accessibilité et mouvement

| Action | Résultat attendu |
|---|---|
| Parcourir tout le Back Office au clavier | Tout est atteignable ; focus toujours visible ; raccourcis de grille inactifs dans les champs |
| Lecteur d'écran sur une grille | La ligne choisie est annoncée comme sélectionnée ; l'aperçu est annoncé quand il change |
| Préférence « réduire les animations » | Aucune transition ; indicateurs de chargement fixes |

Ce tableau vérifie SC-005.

## 10. Nettoyage

Supprimer les données factices créées pour la vérification, comme en 008 (section 9).
