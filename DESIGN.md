---
name: Rotaract Club Ivandry
description: Direction artistique et Design System du Front Office du Rotaract Club Ivandry. Institution Rotary, rythme éditorial, photographie documentaire, typographie forte.
---

# DESIGN.md : Rotaract Club Ivandry

> Source de vérité pour la direction visuelle du Front Office (`apps/web`). Direction validée et verrouillée le 2026-10-01, avant toute implémentation.
> Ce document décrit un langage visuel. Il ne contient ni code, ni token implémenté, ni composant, et ne décide pas du périmètre fonctionnel.
> Le Back Office (`apps/admin`) fera l'objet d'une spécification distincte. Il reprendra la palette, la typographie et les états définis ici.
> Une décision devenue obsolète se corrige ici, elle ne se contourne pas dans le code.

## Sources et méthode

| Source | Ce que nous en retenons |
|---|---|
| `PROJECT_CONTEXT.md`, `CLAUDE.md` | CSS Modules, pas de Tailwind, pas de dépendance ajoutée sans demande, français seul en V1 avec architecture prête pour l'anglais, pas de tests, avancement par étapes demandées. |
| Rotary Brand Center (couleurs, typographie) | Valeurs officielles de couleur, familles typographiques officielles et leurs alternatives gratuites. Elles sont normatives. Le Brand Center ne fixe ni la hiérarchie entre les couleurs ni les graisses : ces choix sont ceux du projet. |
| Taste (`design-taste-frontend`) | Lecture du brief avant tout, réglages de variance, mouvement et densité, interdits de mise en page, discipline du haut de page, verrou de couleur et de forme. |
| Impeccable | Mode du visiteur par surface, stratégie de couleur décidée avant les couleurs, plancher de qualité (contraste, états, mesure de lecture), refus des gabarits de catégorie. |
| Awesome Design MD | Niveau d'exigence et structuration : rôles nommés, valeurs exactes, règles citables. Aucun design n'en est repris. |

Ordre de priorité en cas de contradiction : contraintes du projet, charte Rotary, décisions du club, puis Taste et Impeccable. Les arbitrages rendus sont listés en fin de section 14.

---

## 1. Design philosophy

**Concept directeur : « Le journal du club ».** Le site documente ce que le club fait plutôt que de se décrire. Il se lit comme la publication d'une institution, pas comme une plaquette.

**Trois matériaux.** La photographie réelle, la typographie, le blanc. Le contenu réel est le moteur de la composition.

**Lecture du brief.** Site vitrine éditorial d'une association, pour des jeunes adultes qui découvrent le club, des partenaires et la famille Rotary, dans un langage institutionnel et éditorial, construit en CSS natif sur la palette et les familles typographiques officielles Rotary.

**Réglages.** Variance 6 sur 10 (asymétrie réelle, jamais de chaos). Mouvement 3 sur 10 (interactions discrètes). Densité 3 sur 10 (beaucoup d'air, peu d'éléments par écran).

**Mode du visiteur.**

| Surface | Mode | Conséquence |
|---|---|---|
| Home, Join | Persuader | La page fait comprendre le club et rend l'étape suivante évidente. La composition varie d'une section à l'autre. |
| Actions, News, Members | Lire | Lisibilité, repérage et mesure de lecture passent avant l'expression. La régularité est une qualité. |

**Thème clair uniquement.** Le visiteur type consulte le site sur un téléphone, en journée, sur une connexion mobile : un fond clair à fort contraste est le bon choix. Il n'y a pas de mode sombre en V1 et l'implémentation initiale n'en prévoit pas.

**Principes directeurs.**

1. **Le contenu réel dessine la page.** Une section existe parce qu'un contenu existe. Pas de section pour remplir, pas de chiffre inventé, pas de témoignage fabriqué.
2. **Prouver plutôt qu'affirmer.** Une action se montre par sa photo, sa date, son lieu et son résultat, pas par des adjectifs.
3. **La typographie porte la voix, la couleur porte le sens.** La hiérarchie vient de la taille, de la graisse et de l'espace. La couleur ne décore jamais.
4. **Institutionnel sans être générique.** On reconnaît la famille Rotary au premier regard, puis on comprend que ce club a sa propre manière de se présenter.
5. **Calme.** Peu d'éléments, peu d'effets, une seule action dominante par écran.
6. **Léger par respect.** Chaque image, chaque police et chaque animation justifie son poids sur une connexion mobile.

**Signatures propres au club.** Ce qui rend le site reconnaissable une fois le contenu retiré.

- **Le titre condensé en bas de casse.** Grands titres serrés et gras, jamais en capitales.
- **Le trait d'or.** Un court filet or, un seul par page (section 3).
- **La légende documentaire.** Sous une photographie de contenu, une légende réelle : qui, quoi, où, quand.
- **L'année rotarienne.** Le contenu s'archive par année rotarienne (du 1er juillet au 30 juin), comme les volumes d'une publication.

---

## 2. Brand architecture

Quatre couches, de la plus contrainte à la plus libre. Une couche ne modifie jamais celle du dessus.

| Couche | Ce qu'elle apporte | Ce qui est intouchable | Où elle vit |
|---|---|---|---|
| **Rotary** | Crédibilité, palette officielle, familles typographiques | Les valeurs de couleur, le dessin du logo | Bleu royal structurel, mentions d'appartenance, pied de page |
| **Rotaract** | Le logo du programme et sa couleur, le cranberry | Le logo Rotaract et la signature du club fournis par le Brand Center | En-tête (signature du club), accent cranberry très ponctuel |
| **Club Ivandry** | La voix éditoriale, la photographie, les quatre signatures | Rien d'officiel : c'est l'espace de création du club | Compositions, titres, légendes, rythme des pages |
| **UI fonctionnelle** | Neutres dérivés, états, focus, formulaires | Les contrastes et l'accessibilité | Tous les contrôles |

**Règles du logo.**

- La signature du club est celle fournie par le Rotary Brand Center. Elle n'est jamais redessinée, recolorée, déformée, ombrée ni animée.
- Elle apparaît une fois dans l'en-tête et une fois dans le pied de page (version inversée sur fond sombre). Pas ailleurs.
- La roue n'est jamais utilisée comme motif décoratif, filigrane, puce ou fond.
- Zone de protection et taille minimale : celles du Brand Center.

**Ce que le club ne possède pas.** Le club n'a ni couleur de marque propre ni police propre. Sa personnalité vient de la composition et de la photographie. Les neutres et couleurs d'état ajoutés en section 3 sont des outils d'interface, pas des couleurs de marque.

---

## 3. Color system

**Stratégie.** Palette officielle à trois rôles, sur fond blanc dominant. Par ordre de présence décroissante : blanc, encre (texte), bleu royal, puis très loin derrière cranberry, puis or.

### Couleurs de marque (valeurs officielles Rotary, non modifiables)

| Nom | Hex | Pantone | Rôle dans le projet |
|---|---|---|---|
| **Royal Blue** | `#17458f` | 286 C | **Couleur structurelle principale et seule couleur d'interaction.** Liens, bouton principal, focus, bande bleue. |
| **Cranberry** | `#d41367` | 214 C | **Accent Rotaract, très ponctuel.** Deux usages seulement : le champ cranberry et le label « Action ». |
| **Gold** | `#f7a81b` | 130 C | **Le trait d'or uniquement.** Jamais un texte, jamais un fond. |
| **Powder Blue** | `#b9d9eb` | 290 C | Texte secondaire sur fond bleu royal ou encre. Aucun autre usage. |
| **White** | `#ffffff` | | Fond principal. Texte sur champ fort. |

### Neutres officiels (gris froids Rotary)

| Nom | Hex | Rôle |
|---|---|---|
| **Charcoal** | `#54565a` | Texte secondaire, légendes, métadonnées, texte indicatif des champs. |
| **Tin** | `#898a8d` | Bordure des champs et des contrôles. Jamais un texte lisible. |
| **Silver** | `#d0cfcd` | Filets de séparation, squelettes de chargement. Purement décoratif. |

### Neutres fonctionnels dérivés

Ce ne sont pas des couleurs de marque. Ils n'appartiennent pas à la charte Rotary, n'ont pas de nom officiel et ne sortent jamais de l'interface du site (pas de logo, pas de support imprimé, pas de communication du club).

| Nom | Hex | Origine | Rôle |
|---|---|---|---|
| **Encre** | `#0f1c36` | Royal Blue assombri | Texte principal, titres, pied de page. Remplace le noir pur. |
| **Brume** | `#f3f6f9` | Royal Blue à 5 % sur blanc | Fond de section alterné, emplacements d'image, éléments désactivés. |

### Rôles

| Rôle | Sur fond clair (White, Brume) | Sur champ fort (Royal Blue, Cranberry, Encre) |
|---|---|---|
| Texte principal | Encre | White |
| Texte secondaire | Charcoal | Powder Blue sur Royal Blue et Encre. White seul sur Cranberry. |
| Lien | Royal Blue, souligné | White, souligné |
| Bouton principal | Fond Royal Blue, texte White | Fond White, texte Encre |
| Focus | Contour Royal Blue | Contour White |
| Filet | Silver | White |
| Bordure de contrôle | Tin | Sans objet : pas de champ de saisie sur champ fort |
| Trait d'or | Autorisé, toujours doublé d'un autre indice | Autorisé sur Royal Blue et Encre. Interdit sur Cranberry. |

### Couleurs d'état (fonctionnelles, hors charte)

Elles ne sont pas des couleurs de marque. Elles sont toujours accompagnées d'une icône et d'un texte.

| État | Texte et icône | Fond teinté |
|---|---|---|
| Erreur | `#b3261e` | `#fdeeee` |
| Succès | `#0b6b34` | `#ebf7ef` |
| Avertissement | `#7a4a00` | `#fef3df` |
| Information | `#17458f` | `#ecf0f6` |

Le rouge d'erreur est volontairement distinct du cranberry : la marque ne signale jamais une erreur.

### Contraste

Rapports calculés selon WCAG 2.2. Seuils : 4,5:1 pour un texte, 3:1 pour un grand texte (24 px, ou 18,66 px en gras), 3:1 pour une bordure de contrôle, une icône ou un indicateur de focus.

**Une couleur n'est utilisable dans un rôle que si la paire figure ci-dessous avec un verdict qui couvre ce rôle.** Appartenir à la palette Rotary ne suffit pas.

| Premier plan | Fond | Rapport | Autorisé pour |
|---|---|---|---|
| Encre | White | 16,9 | Tout texte |
| Encre | Brume | 15,6 | Tout texte |
| Charcoal | White | 7,4 | Tout texte |
| Charcoal | Brume | 6,8 | Tout texte |
| Royal Blue | White | 9,2 | Tout texte, liens, focus |
| Royal Blue | Brume | 8,5 | Tout texte, liens, focus |
| Cranberry | White | 5,1 | Tout texte (label « Action ») |
| Cranberry | Brume | 4,7 | Tout texte, marge faible : préférer le fond blanc |
| White | Royal Blue | 9,2 | Tout texte |
| Powder Blue | Royal Blue | 6,2 | Tout texte |
| White | Encre | 16,9 | Tout texte |
| Powder Blue | Encre | 11,4 | Tout texte |
| White | Cranberry | 5,1 | Tout texte |
| Tin | White | 3,5 | Bordures et icônes seulement |
| Tin | Brume | 3,2 | Bordures et icônes seulement |
| Gold | Royal Blue | 4,6 | Élément graphique (trait d'or) |
| Gold | Encre | 8,5 | Élément graphique (trait d'or) |
| Erreur `#b3261e` | White, puis `#fdeeee` | 6,5 puis 5,8 | Tout texte |
| Succès `#0b6b34` | White, puis `#ebf7ef` | 6,6 puis 6,0 | Tout texte |
| Avertissement `#7a4a00` | White, puis `#fef3df` | 7,5 puis 6,8 | Tout texte |
| Information `#17458f` | `#ecf0f6` | 8,0 | Tout texte |

**Paires interdites.**

| Premier plan | Fond | Rapport | Conséquence |
|---|---|---|---|
| Gold | White | 2,0 | Jamais un texte, jamais le seul porteur d'une information |
| Gold | Cranberry | 2,6 | Pas de trait d'or sur le champ cranberry |
| Royal Blue | Encre | 1,8 | Les liens du pied de page sont blancs, pas bleus |
| Royal Blue | Cranberry | 1,8 | Jamais au contact, ni en texte ni en aplats voisins |
| Powder Blue | Cranberry | 3,5 | Sur cranberry, tout le texte est blanc |
| Silver | White | 1,6 | Décoratif seulement |
| Slate, Tin, Light Gray | White | 4,2 et moins | Jamais un texte |

### Règles nommées

**La règle de la couleur unique d'interaction.** Tout ce qui se clique est bleu royal ou encre sur fond clair, blanc sur champ fort. Le cranberry et l'or ne signalent jamais qu'un élément est interactif.

**La règle du cranberry rare.** Le cranberry n'a que deux usages. Le **champ cranberry**, plein cadre, une seule fois sur le site : en fin de Home. Le **label « Action »**, affiché uniquement dans une liste qui mélange actions et actualités. Il n'est jamais une couleur de bouton, de lien, de titre, de bordure ou de survol.

**La règle du trait d'or.** L'or n'existe que sous la forme d'un filet de 4 px de haut et 48 px de large. Un seul par page, à l'un de ces deux emplacements : au-dessus du titre principal de la page, ou sur l'étape en cours de la ligne d'étapes (page Join). Il ne porte jamais seul une information : sur fond clair son contraste est de 2,0, l'état qu'il marque est donc aussi indiqué par la graisse et par le balisage.

**La règle d'une seule bande.** Une page contient au plus une bande bleu royal, en plus du pied de page encre. Le reste est clair.

### Usages interdits

- Or en texte, en fond de section ou en bouton.
- Dégradés, quels qu'ils soient.
- Couleur de marque éclaircie, assombrie ou rendue transparente pour fabriquer une teinte. Les seules teintes autorisées sont celles nommées dans cette section.
- Noir pur `#000000` en texte ou en fond.
- Gris chauds officiels (Storm, Ash, Platinum, Cloud) : on ne mélange pas neutres chauds et froids.
- Couleurs officielles hors périmètre en V1 : Azure, Sky Blue, Cardinal, Turquoise, Orange, Purple, Lawn Green, pastels autres que Powder Blue, Slate, Mouse Gray, Light Gray.
- Photographie teintée, en duotone ou recouverte d'un voile de couleur.

---

## 4. Typography

**Familles.** La charte Rotary prescrit Frutiger pour les titres (alternatives gratuites : Open Sans, Arial) et Sentinel pour le texte courant, les intertitres et les légendes (alternative gratuite : Georgia). Le projet utilise les alternatives gratuites officielles. Deux familles, pas une de plus, et une seule police web.

| Voix | Famille | Pile de repli | Rôle |
|---|---|---|---|
| **Structure** | Open Sans variable (police web) | Arial, sans-serif | Display, titres, navigation, labels, métadonnées, toute l'interface |
| **Récit** | Georgia (police système, non téléchargée) | « Times New Roman », « Noto Serif », serif | Chapô, texte long des articles, citations, légendes |

**Caractère.** La voix de structure est condensée, grasse et en bas de casse dans les grands titres : c'est elle qui donne la typographie forte. La voix de récit est une serif de lecture posée, qui donne le ton éditorial.

**Georgia et ses replis.** Georgia est présente sur Windows, macOS et iOS. Elle est absente de la plupart des téléphones Android, où le texte de récit s'affiche dans la serif système (Noto Serif). Cette différence de rendu est acceptée pour la V1 : aucune police de récit n'est téléchargée.

### Vérification technique d'Open Sans (2026-10-01)

Vérifié sur deux sources, sans rien télécharger : les données de polices embarquées par Next.js 16.3.8 dans `apps/web`, et le service Google Fonts.

| Point vérifié | Résultat |
|---|---|
| Axe de largeur `wdth` | Présent. Plage 75 à 100, valeur par défaut 100. |
| Axe de graisse `wght` | Présent. Plage 300 à 800. |
| Styles | Normal et italique. Seul le normal est utilisé. |
| Fichier servi pour le sous-ensemble latin avec les deux axes | Un seul fichier WOFF2, environ 83 Ko, couvrant les graisses 300 à 800 et les largeurs 75 % à 100 %. |
| Caractères français | Couverts par le sous-ensemble latin, y compris œ et Œ. |

**Conditions d'implémentation.**

- La police est chargée en version variable par le mécanisme de polices de Next.js, auto-hébergée, sous-ensemble latin, style normal.
- L'axe `wdth` doit être demandé explicitement. Par défaut, seul l'axe de graisse est inclus et le fichier servi est figé à la largeur 100 % : sans cette déclaration, la largeur condensée ne s'applique pas.
- La largeur se règle par la propriété CSS de largeur de police, en pourcentage (75 % ou 100 %).
- Open Sans Condensed n'existe pas comme famille distincte dans les données de Next.js. La seule voie est l'axe de largeur.

**Non vérifié.** La présence de chiffres tabulaires dans le fichier servi n'a pas pu être contrôlée sans télécharger la police. Elle est à vérifier à l'implémentation. À défaut, les colonnes de chiffres sont alignées par la mise en page.

**Limite connue.** Le repli Arial n'a pas de largeur condensée. Si la police web arrive après le premier affichage, les grands titres passent d'Arial à Open Sans condensé et leur nombre de lignes peut changer. Le préchargement de la police limite ce risque, à mesurer à l'implémentation.

### Hiérarchie

Deux largeurs seulement : **condensée (75 %)** pour Display, H1 et H2, **normale (100 %)** pour tout le reste. Les tailles varient linéairement entre 360 px et 1440 px de largeur d'écran, et sont bornées en dehors.

| Rôle | Famille | Graisse | Largeur | Taille (360 px à 1440 px) | Interligne | Approche | Usage |
|---|---|---|---|---|---|---|---|
| **Display** | Open Sans | 800 | 75 % | 2,75 rem à 6 rem | 1,02 | -0,02 em | Titre d'ouverture de la Home et de Join. Une fois par page. Titre court : environ 45 caractères, limite à ajuster sur le rendu réel. |
| **H1** | Open Sans | 800 | 75 % | 2,25 rem à 4 rem | 1,05 | -0,015 em | Titre de page, titre d'une Action. |
| **H2** | Open Sans | 700 | 75 % | 1,75 rem à 2,75 rem | 1,1 | -0,01 em | Titre de section. |
| **H3** | Open Sans | 700 | 100 % | 1,5 rem à 1,75 rem | 1,2 | 0 | Titre d'entrée de liste, sous-section. |
| **H4** | Open Sans | 700 | 100 % | 1,125 rem | 1,3 | 0 | Titre de bloc, d'accordéon, de fiche. |
| **Chapô** | Georgia | 400 | | 1,25 rem à 1,5 rem | 1,45 | 0 | Première phrase d'une page ou d'un article. |
| **Corps de lecture** | Georgia | 400 | | 1,0625 rem à 1,125 rem | 1,65 | 0 | Articles, récits d'actions. Mesure de 60 à 70 caractères. |
| **Corps d'interface** | Open Sans | 400 | 100 % | 1 rem | 1,55 | 0 | Textes courts, formulaires. |
| **Petit texte** | Open Sans | 400 | 100 % | 0,875 rem | 1,5 | 0 | Aides, mentions. |
| **Navigation** | Open Sans | 600 | 100 % | 0,9375 rem | 1 | 0 | Liens d'en-tête et de pied de page. Bas de casse. |
| **Bouton** | Open Sans | 600 | 100 % | 1 rem | 1 | 0 | Libellés d'action. Bas de casse. |
| **Label** | Open Sans | 700 | 100 % | 0,8125 rem | 1,2 | 0,06 em, capitales | Catégorie d'un contenu, libellé de fiche. Quelques mots, une ligne. |
| **Métadonnée** | Open Sans | 600 | 100 % | 0,8125 rem | 1,4 | 0 | Dates, lieux, compteurs. |
| **Légende** | Georgia italique | 400 | | 0,875 rem | 1,45 | 0 | Sous une photographie. Couleur Charcoal. |
| **Citation** | Georgia | 400 | | 1,5 rem à 2 rem | 1,35 | 0 | Trois lignes au plus sur desktop, toujours attribuée. |

**Graisses utilisées.** 400, 600, 700 et 800 pour Open Sans. Regular et italique pour Georgia. Aucune autre.

### Règles nommées

**La règle du bas de casse.** Aucun titre n'est composé en capitales. Les capitales sont réservées au rôle Label.

**La règle des deux voix.** Open Sans structure, Georgia raconte. L'emphase dans un titre se fait par la graisse, jamais par un mot en serif ou en italique glissé dans un titre.

**La règle du titre nu.** Aucun surtitre en capitales au-dessus d'un titre de section. La catégorie d'un contenu se place dans sa ligne de métadonnées, à côté de la date.

**La règle de l'échelle.** Deux niveaux voisins diffèrent d'au moins 25 % en taille, ou d'un cran net de graisse ou de largeur.

### Typographie française

- Guillemets français « » avec espaces insécables, apostrophe typographique.
- Espace insécable avant `;` `:` `!` `?` et dans les nombres (`1 250`).
- Dates en toutes lettres dans le récit (`14 mars 2026`), au format numérique de la langue dans les métadonnées (`14/03/2026`).
- Pas de tiret long ni de point médian comme séparateur décoratif. On sépare par un retour à la ligne, une colonne ou un filet.
- Les titres sont équilibrés sur leurs lignes et ne sont jamais coupés par une césure.

### Typographie responsive

- Les tailles varient de façon continue avec la largeur d'écran, sans saut aux points de rupture.
- Un titre Display tient sur deux lignes au plus sur desktop, trois sur mobile. S'il déborde, on raccourcit le titre, on ne réduit pas la taille.
- Le corps de lecture ne descend jamais sous 17 px. Les champs de formulaire ne descendent jamais sous 16 px.
- Toutes les tailles sont relatives : le zoom à 200 % et les réglages de taille de texte de l'utilisateur sont respectés.

---

## 5. Layout

### Largeurs

| Conteneur | Largeur maximale | Usage |
|---|---|---|
| **Page** | 1320 px | Grille principale. |
| **Lecture** | 680 px | Texte long. Jamais plus large. |
| **Large** | 1080 px | Images dans un article. |
| **Plein cadre** | Toute la largeur de l'écran | Bande bleue, champ cranberry, pied de page. |

### Grille, gouttières et points de rupture

Trois points de rupture : **768, 1024 et 1440 px**.

| Plage | Largeur d'écran | Colonnes | Gouttière | Marge latérale |
|---|---|---|---|---|
| **Mobile** | moins de 768 px | 4 | 16 px | 20 px |
| **Tablette** | 768 à 1023 px | 8 | 24 px | 32 px |
| **Desktop** | 1024 à 1439 px | 12 | 32 px | 48 px |
| **Grand écran** | 1440 px et plus | 12 | 32 px | 64 px |

### Espacement

Échelle unique, base 4 px : **4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160**. Elle s'applique aux marges, aux espacements internes et aux intervalles entre éléments. Les dimensions propres aux composants (hauteurs de contrôle, largeurs de conteneur, épaisseurs de trait) sont fixées dans ce document et ne relèvent pas de l'échelle. La marge latérale mobile de 20 px est la seule exception.

### Rythme vertical

| Intervalle | Mobile | Tablette | Desktop |
|---|---|---|---|
| Entre deux sections | 64 px | 96 px | 128 px |
| Respiration majeure (avant un champ fort, après une ouverture) | 96 px | 128 px | 160 px |
| Entre un titre de section et son contenu | 24 px | 32 px | 48 px |
| Entre deux paragraphes | 1 em | 1 em | 1 em |

- Toujours plus d'espace au-dessus d'un titre qu'en dessous.
- On regroupe par proximité avant de regrouper par conteneur.

### Comportement par format

- **Desktop.** Compositions asymétriques sur 12 colonnes. Colonnes vides assumées.
- **Tablette.** Deux blocs restent côte à côte si chacun garde au moins 320 px, sinon ils s'empilent.
- **Mobile.** Une seule colonne. Les photographies peuvent sortir des marges pour toucher les bords de l'écran. Jamais de défilement horizontal de la page.

### Formes et profondeur

**Verrou de forme.** Rayon 0 par défaut : photographies, sections, cartes, modales, tiroirs. Rayon de 2 px pour les contrôles interactifs seulement (boutons, champs, cases à cocher). Aucune pilule, aucun grand arrondi, aucun portrait en cercle.

**Plat par défaut.** Aucune ombre sur le contenu. La profondeur vient du blanc, des filets et des fonds brume. Une seule ombre existe, pour ce qui flotte réellement au-dessus de la page (modale, tiroir, menu déroulant) : douce, décalée vers le bas, teintée encre.

**Filets.** 1 px, Silver. Ils séparent des contenus réels, jamais pour décorer. Dans une liste, un filet entre les éléments, pas un cadre autour de chacun.

---

## 6. Composition

Une page est une suite de **compositions nommées**. On choisit, pour chaque contenu, la composition qui lui correspond.

### Les neuf compositions

| Nom | Description | Convient à |
|---|---|---|
| **Ouverture** | Grande photographie qui part de la colonne 4 et va jusqu'au bord droit de l'écran. Le titre, aligné à gauche, est posé sur un aplat blanc qui chevauche le bord gauche de l'image. | Haut de Home, haut d'une Action |
| **Décalage 7/5** | Image sur 7 colonnes, colonne vide, texte sur 4 colonnes, décalé verticalement de 48 ou 64 px. | Présentation d'une action |
| **Colonne de lecture** | Texte en conteneur Lecture. | Articles, récits, page Join |
| **Bande bleue** | Plein cadre bleu royal, une seule phrase en grand, texte blanc. | Mission du club, appartenance au Rotary |
| **Registre** | Liste en lignes : date, titre, type. Un filet entre les lignes. | Actualités, agenda |
| **Planche** | Deux à quatre photographies de formats différents, alignées sur la grille, avec légendes. | Retour en images d'une action |
| **Fiche** | Liste de faits structurés (libellé, valeur) sur fond brume. | Impact d'une action, informations pratiques |
| **Citation** | Phrase en Georgia grand corps, attribuée à une personne nommée avec son rôle. | Parole d'un membre réel |
| **Champ cranberry** | Plein cadre cranberry : un titre, une phrase, un bouton blanc. | Fin de Home uniquement |

### Règles de composition

**La règle de non-répétition.** Sur les pages qui persuadent (Home, Join) et sur les pages de détail, deux sections consécutives n'utilisent jamais la même composition. Les pages de liste (Actions, News, Members) sont volontairement régulières : la répétition y aide le repérage.

**La règle du zigzag.** Au plus deux compositions texte et image côte à côte d'affilée.

**La règle de l'alignement à gauche.** Titres et textes sont alignés à gauche. Le centrage est réservé à la Bande bleue, à la Citation et au Champ cranberry.

**La règle de l'ouverture.** Le haut de page tient dans le premier écran et contient au plus trois éléments de texte : un titre, une phrase de 20 mots au plus, une action. Pas de statistiques, pas de logos, pas d'invitation à défiler.

**La règle du texte hors image.** Aucun texte n'est posé sur une photographie. Il se place à côté, en dessous, ou sur un aplat blanc qui chevauche le bord de l'image.

### Asymétrie

Elle vient de la grille : une image sur 7 colonnes face à un texte sur 4, une colonne laissée vide, un décalage vertical. Elle disparaît sur mobile au profit d'une colonne.

### Photographie dans la page

La photographie est le premier matériau. Si l'image manque ou n'est pas de qualité suffisante, on choisit une composition typographique (Colonne de lecture, Registre, Bande bleue) plutôt que de combler avec une image faible.

### Sections éditoriales

Hors articles, une section porte un seul message : un titre court (8 mots au plus), un texte court (25 mots au plus), et une image ou une action. Un titre de section et son paragraphe s'empilent : ils ne sont pas placés face à face en deux colonnes.

### Cartes

La carte n'est pas l'unité de base du site. Elle sert uniquement quand un contenu est un objet autonome et cliquable dans une collection.

- Une carte est une image et un texte, sans cadre, sans ombre, sans fond.
- Jamais de carte dans une carte. Jamais de carte « icône, titre, texte ».
- Dans une liste d'actions, les entrées n'ont pas toutes le même format : la plus récente est plus grande.
- Exception : une série de portraits (Members) est uniforme par nature.

### Appels à l'action

- Un seul bouton principal visible par écran.
- Un libellé par intention, identique partout. L'entrée vers le recrutement s'appelle « Nous rejoindre ».
- Libellés de trois mots au plus, verbe concret, sur une seule ligne.
- L'action la plus fréquente est un lien fléché, pas un bouton.

### Hiérarchie

La page vue floue, on distingue encore dans l'ordre l'élément principal, le secondaire, puis les groupes. Sinon, on retire des éléments avant d'en renforcer.

---

## 7. Photography

**Parti pris : documentaire.** Les photographies montrent ce qui s'est réellement passé, avec les personnes réellement présentes. Priorité aux photographies du club. Aucune image générée. Aucune image de banque d'images présentée comme une photo du club.

| Sujet | Règles |
|---|---|
| **Actions** | Des personnes en train de faire, pas en train de poser. Plans rapprochés sur les gestes, plans larges sur le lieu. La photo de groupe alignée face à l'objectif n'est jamais l'image principale. Les bénéficiaires sont montrés avec dignité, comme des acteurs. |
| **Portraits** | Lumière naturelle, fond simple et réel, cadrage poitrine. Même cadrage et même distance pour tous les membres. Format 4:5. Pas de détourage, pas de cercle. |
| **Événements** | L'ambiance et les échanges avant l'estrade. Les banderoles et logos ne sont pas le sujet. Une image par moment fort. |

### Ratios

| Ratio | Usage |
|---|---|
| **3:2** | Format de référence. Listes d'actions, images dans un article, ouverture sur tablette. |
| **16:9** | Ouverture sur desktop. |
| **4:5** | Portraits, ouverture sur mobile. |
| **1:1** | Vignettes d'actualité uniquement. |

Dans une Planche, on mélange deux ou trois ratios. Ailleurs, un seul ratio par collection.

### Crops

- Le sujet principal est placé sur un tiers, hors de la zone que recouvre l'aplat du titre.
- On ne coupe ni les visages ni les mains en action.
- Une image d'ouverture doit rester lisible une fois recadrée de 16:9 en 4:5.
- On ne déforme jamais une image. On ne l'agrandit jamais au-delà de sa taille d'origine.

### Qualité

| Emplacement | Largeur minimale du fichier source |
|---|---|
| Ouverture | 2400 px |
| Image de contenu, liste d'actions | 1600 px |
| Portrait | 1200 px |
| Vignette | 600 px |

**La qualité décide du poids visuel.** Une photo trop petite ou trop compressée pour un emplacement est utilisée dans un emplacement plus petit, jamais agrandie. Les images sont nettes, correctement exposées, sans filtre, sans cadre, sans texte incrusté, sans logo ajouté.

### Overlays

Aucun. Pas de voile, pas de duotone, pas de dégradé, pas de texte, pas d'étiquette ni de badge sur une image.

### Captions

- Une photographie de contenu porte une légende sous l'image quand il y a une information réelle à donner : ce que l'on voit, où, quand. Les portraits de la page Members et les vignettes n'en ont pas.
- Les personnes sont nommées quand elles l'ont accepté.
- Le crédit photo n'apparaît que s'il y a un auteur réel à créditer.
- Une légende ne répète pas le titre. Elle est distincte du texte alternatif (section 12).

### Cohérence visuelle

- Couleur naturelle, balance des blancs neutre, un traitement unique et léger pour toutes les images.
- Pas de noir et blanc ponctuel.
- Accord des personnes identifiables avant publication. Pour les mineurs, accord d'un responsable.

### En attendant les photographies réelles

Les emplacements sont remplis par un aplat Brume portant, en petit texte, la description de l'image attendue.

---

## 8. UI language

Langage visuel global du Front Office. Il ne décrit pas l'implémentation du Back Office.

**Caractère commun.** Net, plat, rectangulaire, calme. Un contrôle se reconnaît à sa forme et à son libellé, pas à un effet.

**Dimensions.** Contrôles de 48 px de haut. Zone tactile de 44 px par 44 px au minimum.

| Élément | Langage |
|---|---|
| **Boutons** | Rectangle, rayon 2 px, libellé en bas de casse, graisse 600. **Principal** : fond Royal Blue, texte White ; survol : fond Encre ; appui : descend de 1 px. **Secondaire** : contour Encre de 2 px, fond transparent, texte Encre ; survol : fond Encre, texte White. **Sur champ fort** : fond White, texte Encre. **Désactivé** : fond Brume, texte Tin, marqué comme désactivé dans le balisage. **En cours** : libellé remplacé par un indicateur discret, largeur inchangée. Pas d'icône décorative, pas d'ombre. |
| **Liens** | Dans un texte : Royal Blue, toujours soulignés (1 px) ; survol : soulignement de 2 px. Sur champ fort : White, soulignés. Lien d'action isolé : texte Encre, graisse 600, suivi d'une flèche qui avance de 4 px au survol. |
| **Navigation** | Une seule ligne, 72 px de haut sur desktop, 64 px sur mobile. Fond White, filet Silver permanent en bas. Signature du club à gauche, rubriques à droite, « Nous rejoindre » en bouton secondaire à l'extrémité. Rubrique active : graisse 700 et soulignement Encre de 2 px. Pas de menu géant, pas de transparence sur photo. |
| **Filtres** | Rangée de libellés texte, pas de pilules. Sélectionné : Encre, graisse 700, soulignement Encre de 2 px. Non sélectionné : Charcoal, graisse 400. |
| **Badges** | Texte seul, rôle Label, sans fond ni contour. « Action » en Cranberry, types d'actualité en Encre. Jamais de pastille de couleur décorative. |
| **Formulaires** | Une colonne. Libellé au-dessus du champ, aide dessous, message d'erreur dessous. Les champs facultatifs sont marqués « (facultatif) ». Groupes séparés par de l'espace et un titre H4. |
| **Inputs** | Fond White, bordure Tin de 1 px, rayon 2 px, texte Encre de 16 px au minimum. Texte indicatif en Charcoal, qui ne remplace jamais le libellé. Focus : contour Royal Blue de 2 px, décalé de 2 px. Erreur : bordure de la couleur d'erreur, icône et message. |
| **Select** | Contrôle natif, stylé comme les champs, chevron à droite. |
| **Upload** | Zone à bordure pointillée Tin sur fond Brume, avec les contraintes écrites (formats, poids maximal). Après dépôt : nom du fichier, poids, progression, suppression. Les erreurs sont dites fichier par fichier. |
| **Modal** | Réservée à une confirmation ou à une tâche qui exige l'attention. Fond White, rayon 0, largeur de 560 px au plus, voile Encre à 60 %, l'unique ombre du système. Titre, texte, deux actions au plus. Fermeture par bouton, touche Échap et clic hors de la modale. |
| **Drawer** | Panneau latéral droit, 400 px sur desktop, pleine largeur sur mobile. Rayon 0, l'unique ombre du système. Usages : menu mobile, filtres sur mobile. |
| **Accordion** | Lignes séparées par un filet Silver, titre H4, signe plus ou moins à droite. Tout le bandeau est cliquable. |
| **Notification** | **Bandeau en ligne** pour ce qui concerne la page : fond teinté d'état, bordure de 1 px de la couleur d'état sur tout le pourtour, icône, texte. **Message temporaire** pour une confirmation passagère : fond Encre, texte White, en bas de l'écran, visible au moins 5 secondes, refermable. Jamais de barre colorée épaisse sur un seul côté. |
| **Loading** | Squelettes aux dimensions du contenu attendu, en Brume et Silver, sans animation insistante. Les emplacements d'image sont réservés pour éviter les sauts de mise en page. Pas d'indicateur circulaire plein écran. |
| **Empty states** | Une phrase qui dit ce qui est vide, puis une action utile. Typographie seule, pas d'illustration. |
| **Error states** | Dans un formulaire : sous le champ, avec la cause et la correction. Page introuvable ou erreur serveur : un titre H1, une phrase, un lien vers l'accueil. Le ton reste calme et ne blâme jamais l'utilisateur. |

**Icônes.** Une seule famille, trait régulier, 20 ou 24 px. Jamais d'émoji ni de caractère spécial à la place d'une icône. Le choix de la famille est un point ouvert.

**Surfaces du navigateur.** La sélection de texte (fond Royal Blue, texte White) et le curseur de saisie (Royal Blue) sont thématisés.

---

## 9. Actions vs News

La différence est structurelle et éditoriale : elle tient au rapport à l'image et au rapport au temps. La couleur n'en est qu'un rappel.

| | **Action** | **Actualité (News)** |
|---|---|---|
| **Définition** | Projet ou activité du club avec un objectif ou un impact concret. | Événement, participation, réunion, formation ou actualité. |
| **Question à laquelle elle répond** | Qu'avons-nous changé, et pour qui ? | Que se passe-t-il au club ? |
| **Durée de vie** | Durable. Reste une référence. | Datée. Vaut par sa fraîcheur. |
| **Élément dominant** | La photographie | La date |
| **Image** | Attendue, grande, 3:2 | Facultative, vignette 1:1 |
| **Titre** | Condensé (H1 en détail, H2 en liste), dit le résultat ou l'objet | Largeur normale (H3), dit le fait |
| **Marqueur** | Label « Action » en Cranberry, dans les listes mixtes seulement | Label de type en Encre |
| **Composition en liste** | Grandes entrées, la plus récente en grand | Registre : lignes datées, séparées par un filet |
| **Bloc propre** | Fiche d'impact : Objectif, Bénéficiaires, Lieu, Période, Partenaires, Résultats | Ligne pratique : Date, Heure, Lieu |
| **Page de détail** | Ouverture photo, chapô, Fiche, récit en Colonne de lecture, Planche | Colonne de lecture courte, une image au plus |
| **Classement** | Par année rotarienne | Chronologique |
| **Ton** | Récit, précis, factuel | Bref, informatif |

**Règles.**

- La Fiche d'impact n'affiche que des rubriques renseignées avec des données réelles. Une rubrique vide disparaît. Aucun chiffre inventé.
- Les chiffres d'impact ne sont jamais sortis de leur action pour former un bandeau de statistiques.
- Sur la Home, les deux ne partagent jamais la même composition : les actions en images, les actualités en registre.

---

## 10. Recruitment

**Parcours.** `Découvrir → Comprendre → Participer → Candidater → Sympathisant → Membre`

**Intention.** Rejoindre un club est un engagement, pas un achat. Le site invite, explique, puis laisse décider. Les appels sont visibles, jamais commerciaux ni agressifs.

### La ligne d'étapes

Le parcours est représenté sur la page Join par six étapes reliées par un filet : horizontales sur desktop, verticales sur mobile. C'est le seul endroit du site où une numérotation est légitime, parce que l'ordre est une information. L'étape « Candidater » porte le trait d'or. Chaque étape a un nom et une phrase, rédigés d'après le fonctionnement réel du club.

### Correspondance entre pages et étapes

| Étape | Page | Ce que le site propose |
|---|---|---|
| Découvrir | Home | Voir les actions |
| Comprendre | Actions, Members | Lire une action, voir qui compose le club |
| Participer | News | Connaître les prochaines dates |
| Candidater | Join | La candidature |
| Sympathisant, Membre | Join | L'explication de la suite |

### Échelle d'intensité des appels

| Niveau | Forme | Usage |
|---|---|---|
| 1 | Lien fléché | Partout. Forme par défaut. |
| 2 | Bouton secondaire | « Nous rejoindre » dans l'en-tête. |
| 3 | Bouton principal | Une fois par écran au plus. |
| 4 | Champ cranberry | Une seule fois sur le site, en fin de Home. |

### Traitement visuel

- La candidature se fait sur fond blanc, en une colonne, dans un conteneur Lecture. Ce qui se passe après l'envoi est écrit avant le bouton.
- Les paroles de membres sont de vraies citations, attribuées par nom et rôle.

### Interdits propres au recrutement

Fenêtre surgissante, bandeau fixe en bas d'écran, compte à rebours, « places limitées », compteur de membres mis en scène, vocabulaire commercial (« offre », « gratuit », « profitez »), points d'exclamation en série, bouton de candidature répété à chaque section, témoignage inventé.

---

## 11. Motion

**Politique minimale.** Le mouvement donne un retour à une action ou explique un changement d'état. Il ne décore pas. Aucun effet lié au défilement.

### Durées et courbe

| Durée | Usage |
|---|---|
| 120 ms | Retour immédiat : survol, appui, focus |
| 200 ms | Changement d'état courant : accordéon, filtre, soulignement, sortie d'une modale |
| 320 ms | Entrée d'une superposition : modale, tiroir |
| 480 ms | Dévoilement de la photographie d'ouverture, s'il est retenu |

Courbe unique : décélération (rapide au départ, douce à l'arrivée). Aucun rebond. La sortie est plus rapide que l'entrée.

| Domaine | Comportement |
|---|---|
| **Hover** | Lien : le soulignement s'épaissit. Lien fléché : la flèche avance de 4 px. Bouton : changement de fond. Entrée de liste : le titre se souligne. Les images ne zooment pas et ne s'assombrissent pas. |
| **Transitions** | Couleur, opacité et court déplacement seulement. |
| **Apparition** | Le contenu est visible par défaut, sans attendre de script. Aucune apparition animée des sections. Un seul effet d'entrée est permis, facultatif : la photographie d'ouverture se dévoile par un masque, une fois au chargement. Il est abandonné s'il retarde l'affichage du contenu principal. |
| **Scroll** | Défilement natif. Aucune parallaxe, aucun détournement du défilement, aucune section épinglée, aucun bandeau défilant. L'en-tête reste fixe, sans changement d'état. |
| **Modal** | Voile en fondu, panneau qui monte de 8 px en 320 ms, sortie en 200 ms. Le focus entre dans la modale et revient à son déclencheur. |
| **Navigation** | Changement de page immédiat, sans transition. Menu mobile : tiroir en 320 ms. |
| **Reduced motion** | Quand `prefers-reduced-motion` est actif : tous les déplacements et le masque d'ouverture sont supprimés, les changements de couleur et d'opacité sont conservés. Aucune information ne dépend d'une animation. |

---

## 12. Accessibility

Cible : **WCAG 2.2 niveau AA** sur tout le Front Office.

| Domaine | Règles |
|---|---|
| **Contraste** | Seules les paires autorisées en section 3 sont utilisables, chacune dans le rôle indiqué. La couleur n'est jamais le seul porteur d'une information. |
| **Clavier** | Tout est utilisable au clavier, dans l'ordre visuel. Un lien d'évitement « Aller au contenu » est le premier élément. Les modales et tiroirs retiennent le focus et se ferment avec Échap. |
| **Focus** | Toujours visible, jamais supprimé. Sur fond clair : contour Royal Blue de 2 px, décalé de 2 px. Sur champ fort : contour White de 2 px. L'élément focalisé n'est jamais masqué par l'en-tête fixe. |
| **Texte** | Tailles relatives, zoom à 200 % sans perte de contenu, mise en page en une colonne à 320 px sans défilement horizontal. Pas de texte justifié, pas de texte dans une image. Langage clair. |
| **Alt** | Toute image de contenu a un texte alternatif qui décrit ce qu'elle montre, différent de la légende. Les images décoratives ont un texte alternatif vide. Le logo porte le nom du club. Une image de contenu sans texte alternatif n'est pas publiée. |
| **Reduced motion** | Voir section 11. Aucun contenu en mouvement automatique, aucun clignotement. |
| **Sémantique** | Un seul H1 par page, niveaux de titres sans saut, repères de page (en-tête, navigation, contenu principal, pied de page). Langue de la page déclarée. Champs reliés à leur libellé, erreurs reliées à leur champ et annoncées. Rubrique courante signalée dans la navigation. |
| **Cibles tactiles** | 44 px par 44 px, espacées d'au moins 8 px. |

---

## 13. Responsive

Conception mobile d'abord : le téléphone est l'écran de référence.

| Élément | Mobile (moins de 768 px) | Tablette (768 à 1023 px) | Desktop (1024 px et plus) |
|---|---|---|---|
| **Navigation** | Signature du club et bouton de menu. Tiroir pleine largeur, « Nous rejoindre » en bouton en bas. | Identique au mobile. | Une ligne, 72 px, rubriques visibles. |
| **Typography** | Bas de l'échelle. Display sur trois lignes au plus. | Milieu de l'échelle. | Haut de l'échelle. Display sur deux lignes au plus. |
| **Images** | Ouverture en 4:5, bord à bord. Images de contenu en 3:2, pleine largeur. | Ouverture en 3:2. | Ouverture en 16:9. |
| **Compositions** | Une colonne. L'image précède le texte. Aucun décalage, aucun chevauchement. | Deux blocs côte à côte si chacun garde 320 px, sinon empilés. | Asymétrie sur 12 colonnes. |
| **Filtres** | Rangée défilante horizontalement jusqu'à cinq libellés, tiroir au-delà. | Rangée complète. | Rangée complète. |
| **Modales** | Panneau plein écran, actions en bas. | Centrée, 560 px. | Centrée, 560 px. |
| **Formulaires** | Une colonne, champs et bouton pleine largeur, clavier adapté au type de champ. | Une colonne, conteneur Lecture. | Une colonne, conteneur Lecture. |
| **Registre** | Date au-dessus du titre. | Date à gauche, titre à droite. | Date, titre, type sur une ligne. |
| **Ligne d'étapes** | Verticale. | Trois par ligne. | Six sur une ligne. |

**Règles.**

- Aucune information n'est supprimée sur mobile. Elle est réordonnée ou repliée.
- L'ordre du code suit l'ordre de lecture mobile. L'ordre visuel desktop ne contredit jamais l'ordre du focus.
- Les mises en page sont éprouvées avec des contenus longs : titres de 80 caractères, noms composés, légendes de trois lignes.

**Objectifs de performance.** Affichage du contenu principal en moins de 2,5 s sur mobile. Décalage cumulé de mise en page inférieur à 0,1. Un seul fichier de police téléchargé (environ 83 Ko). Images servies à la taille de l'écran, images hors écran chargées à la demande.

---

## 14. Anti-patterns : Things we will NOT do

### Mise en page

- Haut de page centré avec grand titre, deux boutons et trois cartes dessous.
- Trois colonnes égales « icône, titre, texte ».
- Bandeau de chiffres clés (grand nombre, petit libellé).
- Titre de section à gauche avec petit paragraphe flottant à droite.
- Surtitre en capitales au-dessus d'un titre.
- Numérotation de sections hors de la ligne d'étapes.
- Mur de logos de partenaires dans le haut de page.
- Invitation à défiler, texte vertical, bandeau de texte défilant.
- Liste où chaque ligne est encadrée.

### Surface

- Glassmorphism, flou d'arrière-plan, transparence décorative.
- Dégradés, texte en dégradé, halos lumineux.
- Ombres sur les cartes, les images ou les boutons.
- Bordures et arrondis sur tout. Pilules. Portraits en cercle.
- Barre colorée épaisse sur le côté d'une carte, d'une citation ou d'une alerte.
- Mode sombre, total ou partiel.
- Motifs, textures, grain, lignes ou grilles purement décoratives.
- Curseur personnalisé.

### Couleur

- Or en texte, en fond ou en bouton.
- Cranberry comme couleur d'interface : bouton, lien, titre, bordure, survol.
- Cranberry utilisé pour une erreur.
- Couleur officielle modifiée ou rendue transparente.
- Esthétique SaaS : fond bleu nuit, accent néon, violet, captures d'interface.

### Typographie

- Titres en capitales.
- Troisième famille, police monospace, police hors charte.
- Mot en serif ou en italique glissé dans un titre.
- Émoji dans l'interface.

### Photographie et contenu

- Banque d'images, image générée, illustration générique.
- Roue Rotary en filigrane, en motif ou en puce.
- Photo de groupe posée comme image principale.
- Texte, voile, étiquette ou badge sur une photo. Faux crédit photo.
- Storytelling artificiel : chiffres inventés, témoignages fabriqués, noms fictifs, verbes creux.
- Faux texte sur une page publiée.

### Mouvement

- Apparition animée des sections. Parallaxe. Défilement détourné.
- Carrousel automatique. Vidéo en lecture automatique.
- Zoom d'image au survol. Compteur qui s'incrémente.

### Arbitrages entre les sources

| Sujet | Recommandation d'un outil | Décision du projet |
|---|---|---|
| Styles | Taste propose Tailwind par défaut | CSS Modules |
| Animation | Taste propose des bibliothèques d'animation | CSS natif, aucune dépendance |
| Serif | Taste la déconseille par défaut | Retenue : la charte Rotary la prescrit pour le texte courant |
| Mode sombre | Taste le demande par défaut | Pas de mode sombre en V1 |
| Blanc pur | Taste le déconseille | White officiel Rotary conservé en fond. Le noir pur est remplacé par Encre. |
| Images générées | Taste les propose en premier | Refusées |
| Surtitres | Taste les rationne, Impeccable les refuse | Refusés |
| Direction tirée au sort | Impeccable propose un tirage de directions | Non lancé : la direction est fixée par le club |
| `PRODUCT.md` | Impeccable le demande avant un DESIGN.md | Non créé, sur décision du club |

---

## 15. Design tokens

Familles à implémenter plus tard. Rien n'est implémenté à ce stade.

**Deux niveaux.** Les **primitives** portent les valeurs brutes. Les **tokens sémantiques** portent les rôles et pointent vers les primitives. Les composants n'utilisent que des tokens sémantiques.

| Famille | Contenu | Source |
|---|---|---|
| **colors** | Primitives : couleurs de marque, neutres officiels, neutres fonctionnels dérivés, couleurs d'état. Sémantiques : fond, texte, lien, action, bordure, focus, accent, états, chacun sur fond clair et sur champ fort. | Section 3 |
| **typography** | Deux familles, quatre graisses, deux largeurs, et un token composé par rôle (taille, interligne, approche). | Section 4 |
| **spacing** | Échelle de 11 pas, de 4 à 160 px. Tokens de rythme : entre sections, respiration majeure, titre vers contenu. | Section 5 |
| **radius** | Deux valeurs : 0 et 2 px. | Section 5 |
| **shadows** | Une valeur : superposition. | Section 5 |
| **breakpoints** | 768, 1024, 1440 px. | Section 5 |
| **motion** | Quatre durées (120, 200, 320, 480 ms), une courbe. | Section 11 |
| **layout** | Largeurs de conteneur, colonnes, gouttières et marges par plage, hauteur d'en-tête, hauteur de contrôle, ordre de superposition (contenu, en-tête, tiroir, modale, message). | Sections 5 et 8 |

**Règles.**

- Une valeur absente des tokens n'existe pas. On l'ajoute ici avant de l'utiliser dans le code.
- Les valeurs de marque sont copiées telles quelles depuis la section 3. Aucune variante n'est calculée dans le code.
- Aucun token de thème sombre en V1. La séparation entre primitives et tokens sémantiques suffit à rendre un thème possible plus tard.

---

## 16. Art direction par page

Ces directions décrivent l'intention visuelle de chaque page. Elles ne fixent pas le périmètre fonctionnel : une section n'est construite que lorsque la fonctionnalité correspondante est demandée et que son contenu réel existe.

### Home

| | |
|---|---|
| **Objectif** | Faire comprendre en un écran qui est le club et ce qu'il fait, puis donner envie de voir les actions. Étape : Découvrir. |
| **Hiérarchie** | 1. La photographie d'une action réelle. 2. Le titre Display. 3. L'accès aux actions. |
| **Rythme** | Ouverture dense, grande respiration, puis alternance. Une bande bleue et le champ cranberry sont les deux seuls pleins cadres. |
| **Photographie** | Une image d'ouverture, la meilleure photo d'action disponible. Puis les images des actions récentes. |
| **CTA** | Bouton principal « Voir nos actions » dans l'ouverture. « Nous rejoindre » dans l'en-tête et dans le champ cranberry. |
| **Sections** | 1. **Ouverture**, avec le trait d'or au-dessus du titre. 2. **Colonne de lecture** courte : qui nous sommes. 3. Actions récentes : une grande entrée en **Décalage 7/5**, deux plus petites. 4. **Bande bleue** : la mission et l'appartenance au Rotary. 5. **Registre** : dernières actualités. 6. **Citation** d'un membre. 7. **Champ cranberry**. |
| **Responsive** | Photo en 4:5 bord à bord, titre dessous, actions empilées, registre avec date au-dessus du titre. |

### Actions

| | |
|---|---|
| **Objectif** | Prouver l'utilité du club par ses projets. Étape : Comprendre. |
| **Hiérarchie** | 1. Les photographies. 2. Les titres des actions. 3. L'année rotarienne. |
| **Rythme** | Page lente et aérée. Chaque action a de la place. L'année rotarienne rythme la page comme un chapitre. |
| **Photographie** | Une image 3:2 par action. C'est la page la plus exigeante en photographie. |
| **CTA** | Par entrée : lien fléché. En fin de page : lien fléché vers Join. |
| **Sections (liste)** | 1. Titre H1 avec trait d'or, chapô. 2. Action la plus récente en grand. 3. Actions suivantes sur deux colonnes. 4. Titre H2 à chaque changement d'année. |
| **Sections (détail)** | 1. **Ouverture** : photo, H1. 2. Chapô. 3. **Fiche** d'impact. 4. Récit en **Colonne de lecture**. 5. **Planche**. 6. Lien vers Join. |
| **Responsive** | Une colonne : image, titre, métadonnées. Fiche en liste verticale. |

### News

| | |
|---|---|
| **Objectif** | Montrer un club vivant. Étape : Participer. |
| **Hiérarchie** | 1. Les dates. 2. Les titres. 3. Le type. |
| **Rythme** | Dense et régulier, à l'opposé d'Actions. On parcourt vite. |
| **Photographie** | Secondaire. Vignette 1:1 facultative. |
| **CTA** | Le titre de chaque entrée est le lien. |
| **Sections (liste)** | 1. Titre H1 avec trait d'or. 2. **Registre** des actualités, de la plus récente à la plus ancienne. |
| **Sections (détail)** | 1. Type et date en métadonnées, H1. 2. Ligne pratique. 3. Texte en **Colonne de lecture**. 4. Une image au plus. |
| **Responsive** | Date au-dessus du titre. |

### Join

| | |
|---|---|
| **Objectif** | Expliquer honnêtement ce que rejoindre le club implique, puis recueillir une candidature. Étape : Candidater. |
| **Hiérarchie** | 1. Le titre Display. 2. La ligne d'étapes. 3. Ce que l'on attend d'un membre. 4. La candidature. |
| **Rythme** | Progressif : chaque section répond à la question que la précédente fait naître. Page plus textuelle que les autres. |
| **Photographie** | Une image de la vie du club. |
| **CTA** | Bouton principal « Envoyer ma candidature », en fin de page. |
| **Sections** | 1. Ouverture typographique : titre Display, chapô. 2. **Ligne d'étapes**, trait d'or sur « Candidater ». 3. **Décalage 7/5** : ce que le club apporte et ce qu'il attend. 4. **Citation** d'un membre. 5. Candidature en **Colonne de lecture**. Pas de champ cranberry. |
| **Responsive** | Ligne d'étapes verticale, champs et bouton pleine largeur. |

### Members

| | |
|---|---|
| **Objectif** | Donner des visages au club et montrer qui porte quelle responsabilité. Étape : Comprendre. |
| **Hiérarchie** | 1. Les portraits. 2. Les noms. 3. Les fonctions. |
| **Rythme** | Deux temps : le bureau, en grand et avec de l'air, puis les membres, en grille plus serrée. |
| **Photographie** | Portraits 4:5, même cadrage, même lumière. La cohérence de la série fait la qualité de la page. |
| **CTA** | Un lien fléché vers Join en fin de page. |
| **Sections** | 1. Titre H1 avec trait d'or, année rotarienne en cours. 2. Le bureau : grille de trois. 3. Les membres : grille de quatre, nom et rôle sous le portrait. 4. Lien vers Join. |
| **Responsive** | Bureau en une colonne, membres en deux colonnes. |

**Portrait manquant.** Aplat Brume avec les initiales en H2. Jamais de silhouette générique.

---

## Décisions verrouillées

Validées par le club le 2026-10-01. Elles ne se rediscutent pas pendant l'implémentation.

1. Concept directeur « Le journal du club » : photographie réelle, typographie, blanc.
2. Royal Blue `#17458f` : couleur structurelle et seule couleur d'interaction.
3. Cranberry `#d41367` : accent Rotaract très ponctuel, deux usages.
4. Or `#f7a81b` : trait d'or uniquement, jamais un texte.
5. Encre `#0f1c36` et Brume `#f3f6f9` : neutres fonctionnels dérivés, hors marque.
6. Open Sans pour la structure, l'interface et les titres, avec largeur condensée à 75 % par l'axe `wdth` (disponibilité vérifiée).
7. Georgia pour le récit, les citations et les légendes, avec replis système. Aucune autre police web en V1.
8. Pas de mode sombre en V1.
9. Rayon 0 par défaut, 2 px pour les contrôles, une seule ombre pour ce qui flotte.
10. Photographie documentaire réelle, sans image générée ni banque d'images.
11. Distinction structurelle et éditoriale entre Action et Actualité.
12. Parcours de recrutement en six étapes, appels jamais commerciaux, champ cranberry rare.
13. Animation minimale, aucun effet de défilement, respect de `prefers-reduced-motion`.
14. WCAG 2.2 AA, avec des paires de couleurs autorisées par leur contraste réel.

## Points ouverts

Ils ne bloquent pas la direction, mais devront être réglés avant ou pendant l'implémentation.

1. **Signature du club.** Fichier officiel à récupérer sur le Rotary Brand Center.
2. **Famille d'icônes.** Son choix implique une dépendance ou des fichiers à ajouter.
3. **Chiffres tabulaires d'Open Sans.** À vérifier sur le fichier réellement servi.
4. **Changement de largeur au chargement de la police.** Effet sur les grands titres à mesurer.
5. **Contenus réels.** Photographies, description des étapes Sympathisant et Membre, citations de membres.
