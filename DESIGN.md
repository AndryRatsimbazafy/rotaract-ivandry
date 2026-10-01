---
name: Rotaract Club Ivandry
description: Direction artistique du Front Office du Rotaract Club Ivandry. Éditorial premium, documentaire, association contemporaine, sur la fondation de marque Rotary.
---

# DESIGN.md : Rotaract Club Ivandry

> Source de vérité pour la direction visuelle du Front Office (`apps/web`).
> Deuxième version, du 2026-10-01. Elle remplace la première direction, jugée trop sobre et trop institutionnelle après revue dans le navigateur. La Home en est la première mise en œuvre.
> **Elle vaut pour tout le Front Office, pas seulement pour la Home** (voir « Portée »).
> Les valeurs exactes vivent dans `apps/web/src/app/tokens.css`. Ce document dit ce qu'elles signifient et comment s'en servir.
> Le Back Office (`apps/admin`) fera l'objet d'une spécification distincte.
> Une décision devenue obsolète se corrige ici avant de se corriger dans le code.

## Sources

| Source | Ce que nous en retenons |
|---|---|
| `PROJECT_CONTEXT.md`, `CLAUDE.md` | CSS Modules, aucune dépendance ajoutée, pas de Tailwind, français seul en V1, pas de tests. |
| Rotary Brand Center | Couleurs officielles et familles typographiques. Elles sont normatives. La hiérarchie entre les couleurs et les graisses sont des choix du projet. |
| Taste, Impeccable | Refus des gabarits de catégorie, discipline de composition, contraste et états. Quand ils contredisent une décision du club, la décision du club l'emporte (section 15). |

---

## Portée : tout le Front Office

Cette direction est la référence obligatoire de toutes les pages de `apps/web` : `/`, `/actions`, `/actualites`, `/membres`, `/rejoindre`, et celles qui suivront. Le site doit donner l'impression qu'une seule direction artistique l'a conçu en entier.

**Ce que chaque page doit être.** Éditoriale et premium, contemporaine, photographique, asymétrique mais maîtrisée, avec une typographie expressive, des blancs intentionnels, des détails éditoriaux, de la profondeur, des interactions discrètes, et une identité Rotaract Club Ivandry forte.

**Règles pour toute nouvelle page ou fonctionnalité.**

1. Lire ce document avant d'implémenter.
2. Réutiliser les tokens, l'échelle typographique, la grille, les espacements, les couleurs et les procédés de composition existants.
3. Ne jamais revenir à un design générique parce qu'une page est plus fonctionnelle.
4. Donner à chaque page sa composition principale, son rythme, sa hiérarchie et son traitement photographique, dans le même système visuel.
5. Ne pas répéter mécaniquement la même structure de section d'une page à l'autre. La Home ne se copie pas.
6. Ne pas transformer les contenus en grille de cartes par défaut.
7. Utiliser la photographie comme élément de composition dès qu'une image existe.
8. Garder une hiérarchie éditoriale forte même quand le contenu est provisoire.
9. Garder le bleu royal comme couleur structurelle et le cranberry comme accent maîtrisé.
10. Garder des interactions sobres : élégantes, rapides, discrètes.
11. Concevoir le responsive en même temps que la page, pas après.
12. Respecter WCAG 2.2 AA.

**Ce qui reste constant d'une page à l'autre.** La une et l'en-tête, le pied de page, l'étiquette de section numérotée, l'échelle typographique à deux étages, les filets, le gabarit photographique, les trois écarts permis à la grille.

**Ce qui change.** La composition principale, le point de départ sur la grille, la place de la photographie, la densité.

**En cas de contradiction.** Si une idée contredit ce document, on n'improvise pas : on nomme la contradiction, on propose une évolution cohérente du système, et on met ce document à jour avant d'écrire le code. Avant toute implémentation importante, la conformité à ce document est vérifiée explicitement.

---

## 1. Philosophie

**Direction : éditorial premium, documentaire, association contemporaine.** Pas « minimal ».

**Concept : « Le journal du club ».** Le site documente ce que le club fait. Il se regarde comme un magazine haut de gamme ou le rapport annuel d'une institution contemporaine : une signature typographique, de grandes photographies, des pages composées une à une.

**Ce que l'on doit ressentir.** La première réaction recherchée n'est pas « c'est propre » mais « c'est élégant, travaillé, distinctif ». Rotary apporte la crédibilité, le club apporte la personnalité.

**Quatre matériaux.**

1. **La typographie comme matière graphique.** Très grands titres, chiffres monumentaux, contrastes d'échelle marqués, petites informations très fines.
2. **La photographie documentaire.** Grande, recadrée, débordante, parfois porteuse d'un titre.
3. **Le blanc comme élément de composition.** Il sépare, il met en tension, il laisse une colonne vide en face d'un bloc dense. Il n'est jamais une simple absence de design : le fond de page est une brume marquée par les repères de la grille, et le blanc est une feuille que l'on pose dessus.
4. **Le détail éditorial.** Étiquettes, numéros de section, métadonnées en marge, filets fins.

**Principes.**

1. **Chaque section est une page composée.** Deux sections voisines n'ont ni la même structure, ni le même fond, ni le même point de départ sur la grille.
2. **La tension vient des proportions.** Un titre immense face à une légende minuscule, une image sur huit colonnes face à un texte sur quatre.
3. **La profondeur vient des superpositions.** Un texte mord sur une image, une photographie traverse la frontière entre deux sections. Jamais d'ombre pour simuler la profondeur.
4. **Le contenu réel reste le moteur.** Rien n'est inventé : ni action, ni chiffre, ni citation, ni photographie.
5. **Maîtrise.** L'asymétrie suit la grille. Une composition expérimentale mais désordonnée est un échec.
6. **Léger par respect.** Le visiteur type est sur téléphone, en connexion mobile.

**Modes du visiteur.** Home et Join persuadent : la composition y est la plus expressive. Actions, News et Members se lisent : la régularité y redevient une qualité, dans le même langage.

**Thème clair uniquement.** Pas de mode sombre en V1. Les champs sombres décrits plus bas sont des sections, pas un thème.

---

## 2. Architecture de marque

| Couche | Ce qu'elle apporte | Ce qui est intouchable | Où elle vit |
|---|---|---|---|
| **Rotary** | Crédibilité, palette, familles typographiques | Les valeurs de couleur, le dessin du logo | Bleu royal structurel, valeurs et axes du Rotary |
| **Rotaract** | Le logo du programme, le cranberry | La signature du club fournie par le Brand Center | En-tête, champ cranberry |
| **Club Ivandry** | La signature typographique, la une, la photographie, la composition | Rien d'officiel : c'est l'espace de création | Toute la mise en page |
| **UI fonctionnelle** | Neutres dérivés, états, focus | Les contrastes | Contrôles, emplacements sans contenu |

**Logo.** La signature officielle du club (`logo-club.png`) figure dans l'en-tête et dans le pied de page. L'emblème seul (`logo-club-sans-texte.png`) sert d'icône d'onglet. Ils ne sont jamais redessinés, recolorés, déformés ni animés. Les deux fichiers ont un fond blanc opaque : la signature se pose sur du blanc, et dans le pied de page elle garde un cartouche blanc. La roue n'est jamais un motif, un filigrane ou une puce.

**Signatures propres au club.** Ce qui rend le site reconnaissable, contenu retiré.

- **La signature typographique.** « Rotaract » et « Club Ivandry » en très grand, sur deux lignes décalées, à cheval sur le bord d'une photographie.
- **La une.** Au-dessus de l'en-tête, une ligne fine donne le lieu et l'année Rotary, comme la manchette d'un journal.
- **Les chiffres monumentaux.** Numéros de section au trait, « 7 » plein.
- **Le gabarit photographique.** Un emplacement sans photo montre des repères de cadrage et le format attendu.
- **Le trait d'or.** Un seul par page.

---

## 3. Couleurs

**Stratégie.** Un fond de page brume, des feuilles blanches posées dessus, trois couleurs de marque à rôle fixe, et une gamme de neutres qui apporte les nuances : brume, blanc, encre, filets. La couleur s'engage par grandes surfaces rares et bien placées. La page n'est jamais un blanc uniforme.

### Couleurs de marque (valeurs officielles Rotary, non modifiables)

| Nom | Hex | Rôle |
|---|---|---|
| **Royal Blue** | `#17458f` | **Structure et interaction.** Liens, focus, rubrique active, chiffres monumentaux, filets sur encre, une bande verticale. |
| **Cranberry** | `#d41367` | **Accent Rotaract, rare et expressif.** Le champ cranberry, et le label « Action » dans une liste mixte. |
| **Gold** | `#f7a81b` | **Le trait d'or uniquement.** |
| **Powder Blue** | `#b9d9eb` | Texte secondaire sur bleu royal et sur encre. |
| **White** | `#ffffff` | Fond principal, texte sur champ fort. |

### Neutres officiels

| Nom | Hex | Rôle |
|---|---|---|
| **Charcoal** | `#54565a` | Texte secondaire, étiquettes, métadonnées. |
| **Tin** | `#898a8d` | Bordures de contrôle, repères de cadrage, grand texte des emplacements sans contenu. |
| **Silver** | `#d0cfcd` | Filets légers. |

### Neutres fonctionnels dérivés

Ce sont des outils d'interface, pas des couleurs de marque. Ils ne sortent jamais du site : pas de logo, pas de support imprimé, pas de communication du club.

| Nom | Hex | Origine | Rôle |
|---|---|---|---|
| **Encre** | `#0f1c36` | Royal Blue assombri | Texte principal, filets forts, champ encre, pied de page, menu du téléphone. |
| **Brume** | `#f3f6f9` | Royal Blue à 5 % sur blanc | Fond de page, gabarit photographique. |
| **Voile** | Encre à 50 % | | Posé sur une photographie qui porte un titre. |

### Hiérarchie des surfaces

| Surface | Fréquence | Usage sur la Home |
|---|---|---|
| **Fond de page : brume**, avec les repères de grille | Le fond par défaut de tout le site | Ouverture, axes stratégiques, actualités |
| **Feuille blanche** | Une section sur deux environ, jamais deux d'affilée sans raison | En-tête, club, actions, membres |
| **Champ encre** | Une section par page, plus le pied de page | Valeurs du Rotary |
| **Bleu royal** | Jamais en plein cadre. Une bande verticale ou un bloc partiel par page au plus | Derrière les portraits des membres |
| **Champ cranberry** | Une fois sur le site, en entier | Conclusion de la Home |
| **Champ cranberry d'ouverture** | Sur Join seulement, en partie de l'écran | Ouverture de la page Join |
| **Rappel cranberry** | Une fois par page, hors Home et Join | Conclusion des autres pages |

### Le fond de page

- **La brume est le fond de tout le site.** Le blanc devient une surface choisie : une « feuille » qui porte une section, l'en-tête, ou l'aplat qui mord sur une image.
- **Les repères de grille.** Trois filets verticaux de 1 px, en Silver, sont tracés sur le fond de page aux quarts du conteneur, à partir de la tablette. Sur téléphone, où le texte occupe toute la largeur, il n'y en a pas. Ils tombent dans les gouttières de la grille. Ils montrent la grille sur laquelle la page est composée et disparaissent sous les feuilles blanches et les champs forts. Ce sont des filets unis : ni motif, ni texture, ni dégradé visible.
- **L'alternance.** Les sections passent du fond de page à la feuille blanche, puis à un champ fort. C'est cette alternance, et non une couleur ajoutée, qui donne son relief à la page.
- **Sur le fond de page**, le gabarit photographique et le survol d'une ligne sont blancs. **Sur une feuille blanche**, ils sont brume.

### Règles nommées

**La règle de la couleur d'interaction.** Ce qui se clique est encre ou bleu royal sur fond clair, blanc sur champ fort. Le cranberry et l'or ne signalent jamais une interaction.

**La règle du bleu structurel.** Le bleu royal porte des chiffres, des filets, des états et une bande. Il ne remplit jamais une section entière : l'accumulation d'aplats bleus est ce qui fait un « site Rotary générique ».

**La règle du cranberry expressif.** Le cranberry est rare, mais quand il apparaît il s'engage : un champ entier, une question en très grand, une photographie qui en dépasse. Jamais un bouton, un lien, une bordure ou un survol. Une page ne porte qu'une seule surface cranberry : le champ entier à la fin de la Home, le champ d'ouverture en tête de Join, le rappel à la fin des autres pages.

**La règle du trait d'or.** Un filet de 4 px sur 48 px, un seul par page, attaché au titre principal. Il ne porte jamais seul une information. La page Join n'en a pas : son titre est sur cranberry, où l'or est interdit.

**La règle des couleurs séparées.** Cranberry et bleu royal ne se touchent pas. L'or ne se pose pas sur le cranberry.

### États (fonctionnels, hors charte)

| État | Texte et icône | Fond teinté |
|---|---|---|
| Erreur | `#b3261e` | `#fdeeee` |
| Succès | `#0b6b34` | `#ebf7ef` |
| Avertissement | `#7a4a00` | `#fef3df` |
| Information | `#17458f` | `#ecf0f6` |

### Contraste

Rapports calculés selon WCAG 2.2. Seuils : 4,5 pour un texte, 3 pour un grand texte (24 px, ou 18,66 px en gras) et pour un élément d'interface. **Une couleur n'est utilisable dans un rôle que si la paire figure ici avec un verdict qui couvre ce rôle.**

| Premier plan | Fond | Rapport | Autorisé pour |
|---|---|---|---|
| Encre | White, Brume | 16,9 et 15,6 | Tout texte |
| Charcoal | White, Brume | 7,4 et 6,8 | Tout texte |
| Royal Blue | White, Brume | 9,2 et 8,5 | Tout texte, liens, chiffres |
| Cranberry | White | 5,1 | Tout texte |
| White | Royal Blue | 9,2 | Tout texte |
| White | Encre | 16,9 | Tout texte |
| Powder Blue | Royal Blue, Encre | 6,2 et 11,4 | Tout texte |
| White | Cranberry | 5,1 | Tout texte |
| Tin | White, Brume | 3,5 et 3,2 | **Grand texte seulement**, bordures, repères |
| White | Voile sur une photographie | 3,3 au pire | **Grand texte seulement** |
| Gold | Encre, Royal Blue | 8,5 et 4,6 | Élément graphique |
| États | White et leur fond teinté | 5,8 à 7,5 | Tout texte |

| Paire interdite | Rapport | Conséquence |
|---|---|---|
| Gold sur White | 2,0 | Jamais un texte, jamais le seul porteur d'une information |
| Tin en petit texte | 3,5 | Les petits textes provisoires sont en Charcoal |
| Royal Blue sur Encre | 1,8 | Réservé aux filets et tracés décoratifs. Les liens sur encre sont blancs. |
| Royal Blue et Cranberry | 1,8 | Jamais au contact |
| Powder Blue sur Cranberry | 3,5 | Sur cranberry, tout le texte est blanc |
| Silver sur White | 1,6 | Décoratif seulement |

### Usages interdits

- Or en texte, en fond ou en bouton.
- Dégradé visible, quel qu'il soit.
- Couleur de marque éclaircie ou assombrie pour fabriquer une teinte.
- Noir pur.
- Gris chauds officiels et couleurs officielles hors de cette section.
- Photographie teintée, en duotone ou colorée. Le Voile est le seul traitement autorisé.

---

## 4. Typographie

**Deux familles, une seule police web.**

| Voix | Famille | Repli | Rôle |
|---|---|---|---|
| **Structure** | Open Sans variable (axes `wght` 300 à 800 et `wdth` 75 à 100) | Arial, sans-serif | Titres, chiffres, étiquettes, métadonnées, interface |
| **Récit** | Georgia (police système) | « Times New Roman », « Noto Serif », serif | Accroches, phrases de récit, descriptions, légendes |

Open Sans est chargée par `next/font`, auto-hébergée, sous-ensemble latin, avec l'axe `wdth` demandé explicitement (sans lui, la largeur condensée ne s'applique pas). Georgia n'est pas téléchargée : sur la plupart des téléphones Android, la serif système la remplace.

**Deux largeurs.** Condensée (75 %) pour tout ce qui est grand. Normale (100 %) pour le reste.

### Échelle éditoriale

L'échelle a deux étages : un étage **graphique**, où le texte est une image, et un étage **de lecture**.

| Rôle | Famille | Graisse, largeur | Taille (téléphone à grand écran) | Interligne | Usage |
|---|---|---|---|---|---|
| **Signature** | Open Sans | 800, condensée | 3,5 rem à 13,5 rem | 0,9 | Le nom du club dans l'ouverture, la question du champ cranberry. Une fois par section. |
| **Chiffre monumental** | Open Sans | 800, condensée | 6 rem à 17 rem (jusqu'à une fois et demie pour le « 7 ») | 0,8 | Numéro de section au trait, « 7 » plein. Décoratif ou partie d'un titre. |
| **Très grand titre** | Open Sans | 800, condensée | 2,5 rem à 6,5 rem | 0,95 | Titres de section, noms des valeurs, jour d'une actualité. |
| **H1** | Open Sans | 800, condensée | 2,25 rem à 4 rem | 1,05 | Titre de page, nom d'un membre, appel du champ cranberry. |
| **H2** | Open Sans | 700 à 800, condensée | 1,75 rem à 2,75 rem | 1,1 | Titre d'une action. |
| **H3** | Open Sans | 700, normale | 1,5 rem à 1,75 rem | 1,2 | Titre d'une actualité, d'un axe. |
| **H4** | Open Sans | 700, normale | 1,125 rem | 1,3 | Titre de bloc. |
| **Accroche** | Georgia | 400 | 1,5 rem à 2,5 rem | 1,25 | La phrase de récit d'une section. |
| **Chapô** | Georgia, souvent en italique | 400 | 1,25 rem à 1,5 rem | 1,45 | Phrase d'ouverture, introduction. |
| **Corps de lecture** | Georgia | 400 | 1,0625 rem à 1,125 rem | 1,65 | Texte long. Mesure de 60 à 70 caractères. |
| **Corps d'interface** | Open Sans | 400, normale | 1 rem | 1,55 | Textes courts, formulaires. |
| **Petit texte** | Open Sans | 400, normale | 0,875 rem | 1,5 | Aides, texte en attente. |
| **Navigation** | Open Sans | 600, normale | 0,9375 rem | 1 | En-tête, pied de page. |
| **Étiquette** | Open Sans | 700, normale | 0,8125 rem, capitales, approche 0,06 em | 1,2 | Étiquette de section, une, fonction, type, format. |
| **Métadonnée** | Open Sans | 600, normale | 0,8125 rem | 1,4 | Années, numéros, compteurs. |
| **Légende** | Georgia italique | 400 | 0,875 rem | 1,45 | Sous une photographie. |

### Règles nommées

**La règle du bas de casse.** Aucun titre en capitales. Les capitales sont réservées à l'Étiquette.

**La règle de l'écart.** Dans une section, le plus grand texte est au moins quatre fois plus grand que le plus petit. C'est cet écart qui fait la tension éditoriale.

**La règle des deux voix.** Open Sans structure, Georgia raconte. Georgia en italique sert les textes courts qui commentent : accroche, description d'une valeur, résumé d'une actualité.

**La règle du grand texte.** Au-dessus de 6,5 rem, un texte est un élément graphique : il peut être tracé au trait, coupé par le bord de la page, posé sur une photographie. En dessous, il reste plein et entièrement lisible.

**La règle de la ligne courte.** Les textes de la Home sont courts : une accroche de 25 mots au plus, une description d'une phrase.

### Étiquettes, numérotation, métadonnées

- **Étiquette de section.** Un numéro à deux chiffres, un filet de 48 px, quelques mots. Elle précède le titre de la section. Une par section, toujours au même format.
- **Numérotation.** Les sections d'une page sont numérotées de 01 à n. Les éléments d'une liste finie (valeurs, axes, étapes) le sont aussi. Une liste de contenus publiés (actions, actualités, membres) ne l'est pas.
- **Métadonnées.** Année Rotary, lieu, date, type, fonction. Elles se placent en marge ou en bord de ligne, jamais au centre.
- **La une.** Lieu à gauche, année Rotary à droite, au-dessus de l'en-tête.
- **Filets.** 1 px. Encre pour structurer (en-tête, registre, liste de membres, axes), Silver pour les états provisoires, bleu royal sur encre.

### Typographie française

Guillemets « » avec espaces insécables, espace insécable avant `;` `:` `!` `?`, dates en toutes lettres dans le récit. Pas de tiret long ni de point médian décoratif. Les titres ne sont jamais coupés par une césure.

---

## 5. Grille et mise en page

| Plage | Largeur | Colonnes | Gouttière | Marge |
|---|---|---|---|---|
| Téléphone | moins de 768 px | 4 | 16 px | 20 px |
| Tablette | 768 à 1023 px | 8 | 24 px | 32 px |
| Ordinateur | 1024 à 1439 px | 12 | 32 px | 48 px |
| Grand écran | 1440 px et plus | 12 | 32 px | 64 px |

- **Conteneur** : 1320 px au plus. **Lecture** : 680 px au plus.
- **Espacement** : échelle unique 4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160.
- **Rythme entre sections** : 64, 96 ou 128 px selon la plage ; respiration majeure de 96, 128 ou 160 px.
- **Formes** : rayon 0 partout, 2 px pour les contrôles. Aucune pilule, aucun cercle.
- **Ombre** : aucune sur le contenu. Une seule existe, pour une modale ou un tiroir.

**Sortir de la grille.** Trois écarts sont permis, et seulement ceux-là :

1. **Le bord perdu.** Une photographie ou un champ va jusqu'au bord de l'écran, d'un seul côté.
2. **Le débord.** Un élément dépasse de sa section de 96 à 160 px pour entrer dans la suivante.
3. **Le retrait.** Une ligne ou une colonne part une colonne plus loin que sa voisine.

Tout le reste s'aligne sur les colonnes.

---

## 6. Composition

### Asymétrie

- Les proportions utiles sont 8/4, 7/5, 5/7, 3/8 et 2/10. Le 6/6 est évité.
- Le point de départ change d'une section à l'autre : colonne 1, colonne 3, colonne 4, colonne 5, colonne 7.
- Une colonne laissée vide est une décision, pas un oubli.

### Profondeur et superpositions

| Procédé | Description | Exemple sur la Home |
|---|---|---|
| **Titre à cheval** | Un très grand titre dont une ligne est sur l'image et l'autre sur le blanc | La signature de l'ouverture |
| **Aplat mordant** | Le texte, sur un aplat blanc, recouvre un angle de l'image | La première action |
| **Photographie traversante** | Une image passe d'une section à la suivante | Club vers valeurs, membres vers champ cranberry |
| **Bande verticale** | Une bande bleu royal derrière des images qui la recouvrent en partie | Portraits des membres |
| **Chevauchement d'images** | Deux photographies de tailles différentes se recouvrent | Portraits des membres |
| **Coupe** | Un très grand texte est coupé par le bord de la page | Le nom du club dans le pied de page |

Une section utilise un procédé, deux au plus. Jamais d'ombre, de flou ni de transparence pour créer la profondeur.

### Compositions de la Home

| Section | Composition | Fond |
|---|---|---|
| **Ouverture** | Marge de deux colonnes (étiquette, année), photographie panoramique à bord perdu à droite, signature à cheval, accroche et liens sous la signature | Fond de page |
| **01 Le club** | Chiffre au trait sur trois colonnes, question en très grand, accroche, texte, photographie verticale à bord perdu qui descend dans la section suivante | Blanc |
| **02 Nos valeurs** | Cinq lignes en escalier, chacune décalée d'une colonne, la définition en regard à droite | Encre |
| **03 Nos causes** | « 7 » monumental, « axes stratégiques » posé contre lui, sept entrées numérotées sur deux colonnes décalées | Fond de page |
| **04 Sur le terrain** | Une action sur huit colonnes à bord perdu à gauche avec aplat mordant, puis une verticale et une horizontale à des hauteurs différentes | Blanc |
| **05 Vie du club** | Titre en marge sur trois colonnes, registre sur huit : jour en très grand, titre, type | Fond de page |
| **06 Le collectif** | Noms en très grand, une ligne par personne, une sur deux en retrait ; deux portraits qui se chevauchent sur une bande bleue | Blanc |
| **07 Nous rejoindre** | Champ cranberry, question en signature, photographie qui dépasse par le haut, appel sur une ligne entière, parcours d'adhésion en quatre étapes au bas | Cranberry |

### Règles

**La règle de non-répétition.** Sur une page qui persuade, deux sections voisines n'ont ni la même composition ni le même fond.

**La règle anti-cartes.** Aucune grille de cartes identiques. Un contenu d'une collection est une image et un texte, sans cadre, sans fond, sans ombre, et ses voisins n'ont ni la même taille ni la même hauteur de départ. Même les portraits de la page Members changent de taille et de hauteur d'un niveau de lecture à l'autre.

**La règle du motif unique.** « Titre, paragraphe, bouton » n'apparaît qu'une fois par page au plus.

**La règle des appels.** Un appel est un lien fléché. Le seul appel fort de la Home est la ligne du champ cranberry. Un libellé par intention : l'entrée vers le recrutement s'appelle « Nous rejoindre » partout.

---

## 7. Photographie

**Parti pris : documentaire.** Des personnes réelles, en train de faire, là où cela s'est passé. Priorité aux photographies du club. Aucune image générée, aucune banque d'images, aucune photo de groupe posée ou de poignée de main comme image principale.

**Ce que l'on cherche.** L'action, le mouvement, l'interaction, les gestes, les détails, les portraits, les scènes de terrain, les moments spontanés.

### Présence dans la page

| Usage | Format | Procédé |
|---|---|---|
| Ouverture | Panoramique, 16:9 ou plus large | Bord perdu à droite, signature à cheval, Voile |
| Action principale | 3:2 | Bord perdu à gauche, aplat mordant |
| Action secondaire | 4:5 et 3:2 | Hauteurs de départ différentes |
| Vie du club, recrutement | 4:5 | Photographie traversante |
| Portraits | 4:5 | Chevauchement sur bande bleue |
| Vignette d'actualité | 1:1 | Facultative |

Une image peut être très grande, recadrée, débordante, verticale ou panoramique, partiellement recouverte par un aplat ou une autre image.

### Traitements

- **Couleur naturelle**, balance des blancs neutre, un seul traitement léger pour toutes les images. Pas de noir et blanc ponctuel, pas de filtre, pas de teinte de marque.
- **Le Voile** est le seul traitement ajouté : encre à 50 %, uni, sur toute l'image, seulement quand un titre est posé dessus.
- **Texte sur image.** Uniquement un texte de l'étage graphique (Signature, Très grand titre), en blanc, sur une image voilée. Jamais un paragraphe, une étiquette ou un bouton.
- **Recadrage.** Chaque photographie peut déclarer un point d'intérêt, conservé quand le cadre change de format. Le sujet est hors de la zone couverte par un titre ou un aplat. On ne coupe ni les visages ni les mains. On ne déforme et on n'agrandit jamais une image au-delà de sa taille d'origine.
- **Survol.** L'image d'un contenu cliquable grossit de 3 % en 480 ms à l'intérieur de son cadre.

### Qualité et légendes

- Largeur minimale du fichier : 2400 px pour une ouverture ou un bord perdu, 1600 px pour une image de contenu, 1200 px pour un portrait.
- **La qualité décide du poids visuel.** Une photo trop petite pour un emplacement passe dans un emplacement plus petit.
- Une photographie de contenu porte une légende réelle (quoi, où, quand) en Georgia italique. Le crédit n'apparaît que s'il y a un auteur à créditer.
- Accord des personnes identifiables. Pour les mineurs, accord d'un responsable.

---

## 8. Emplacements sans contenu

Tant que le club n'a pas fourni un contenu, la page garde sa composition et le signale avec retenue. Elle ne doit jamais ressembler à une maquette inachevée.

- **Photographie absente : le gabarit.** Un aplat brume ou encre, deux repères de cadrage dans les angles, l'étiquette « Photographie à venir » suivie d'une description de l'image attendue, et le format en très grand, ton sur ton. C'est un objet d'édition, pas une fausse image.
- **Texte absent.** Le libellé décrit l'emplacement (« Titre de l'action », « Prénom Nom »), sans crochets. En grand, il est en Tin. En petit, il est en Charcoal. Les filets passent en Silver.
- **Une mention par section.** « Contenu à venir », une seule fois, près du titre de la section.
- **Registre vide.** Un registre sans aucune ligne ne répète pas trois lignes fantômes : il montre ses en-têtes de colonnes, une phrase qui dit qu'il n'y a encore rien, et ses filets.
- **Un emplacement n'est jamais cliquable.**
- **Rien n'est inventé.** Ni action, ni date, ni membre, ni chiffre, ni citation.
- **Profils de démonstration.** La page Members peut montrer quelques profils fictifs pour faire voir sa composition tant que le club n'a pas fourni les siens. Ils vivent dans les données, pas dans les composants ; ils sont marqués comme tels ; ils s'appellent « Profil 01 », « Profil 02 », jamais d'un nom plausible ; ils n'ont pas de portrait ; ils s'affichent comme des emplacements (gris, mention « Profils de démonstration ») et n'apparaissent sur aucune autre page.
- **Petit cadre.** Sous 120 px de large, le gabarit photographique ne garde que son aplat et ses repères.

---

## 9. Interface

**Caractère.** Net, plat, rectangulaire, fin. Un contrôle se reconnaît à sa forme et à son libellé.

| Élément | Langage |
|---|---|
| **En-tête** | La une (lieu, année Rotary) sur une ligne fine, puis l'en-tête, fixe en haut de l'écran, fermé par un filet encre. Signature officielle du club à gauche, haute de 44 px sur téléphone et de 56 px sur ordinateur. Hauteur de l'en-tête : 68 px et 88 px. |
| **Navigation** | À partir de 1024 px : liens en ligne, un filet bleu de 2 px sous la rubrique courante. « Nous rejoindre » dans un cadre fin de 1 px. |
| **Menu du téléphone** | Le mot « Menu » en étiquette et deux filets inégaux. Il ouvre le **sommaire** : plein écran sur encre, rubriques numérotées en très grand, lieu et année au bas, bouton « Fermer ». Fermeture par Échap, focus retenu dans le sommaire. |
| **Lien fléché** | Libellé en graisse 600 et flèche. C'est la forme d'appel par défaut. |
| **Liens dans un texte** | Bleu royal, soulignés. Sur champ fort : blancs, soulignés. |
| **Boutons** | Réservés aux formulaires et à l'accès à un formulaire (« Candidater »). Rectangle, rayon 2 px. Principal : fond bleu royal, texte blanc. Secondaire : contour encre. Sur champ fort : fond blanc, texte encre. |
| **Appel du champ cranberry** | Une ligne de texte en H1 sur toute la largeur, entre deux filets blancs, flèche à droite. |
| **Étiquettes et badges** | Texte seul, sans fond ni contour. |
| **Filtres** | Un index, pas une barre d'outils : une étiquette, puis les choix en texte sur une ligne. Le choix courant est en encre, souligné d'un filet bleu de 2 px ; les autres sont en Charcoal. Une liste longue se replie derrière son choix courant et se déplie sur place. Ni pilule, ni menu déroulant habillé, ni bouton. Un filtre est un lien : il change l'adresse de la page. |
| **Formulaires** | Une colonne, libellé au-dessus, aide et erreur dessous, champs de 48 px, bordure Tin, texte de 16 px au moins. Une erreur s'écrit sous son champ, précédée du mot « Erreur », avec une bordure plus épaisse : jamais par la couleur seule. Le choix entre deux options se fait par boutons radio dans un groupe titré. Le dépôt de fichier est un champ natif dans une zone à bordure pointillée. Ce qui se passe après l'envoi est écrit avant le bouton. |
| **Accordéon** | Lignes séparées par un filet encre, question en H4, signe plus ou moins à droite, toute la ligne cliquable. Élément natif, sans script. |
| **Modale, tiroir** | Rayon 0, l'unique ombre du système. |
| **Notification** | Bandeau à fond teinté d'état avec bordure de 1 px, icône et texte. |
| **Chargement** | Squelettes aux dimensions du contenu. |
| **Erreur** | Une phrase calme, la cause et la correction. |
| **Pied de page** | Sur encre : signature du club dans un cartouche blanc, navigation en colonne, lieu et année, puis le nom du club en très grand, tracé au trait et coupé par le bas. |

**Icônes.** Trait de 1,5 px, 20 ou 24 px. Jamais d'émoji. La famille reste à choisir.

---

## 10. Actions et actualités

| | **Action** | **Actualité** |
|---|---|---|
| **Définition** | Projet ou activité du club avec un objectif ou un impact concret | Événement, participation, réunion, formation ou annonce |
| **Élément dominant** | La photographie | La date |
| **Titre** | Condensé, très grand | Largeur normale |
| **Bloc propre** | Année Rotary, description en voix de récit, impact sous un filet | Jour en très grand, mois et année en étiquette, type en étiquette |
| **Composition en liste** | Grandes images de formats et de hauteurs différents | Registre : lignes datées séparées par un filet encre |
| **Survol** | L'image grossit, le titre passe au bleu | La ligne devient blanche, le jour passe au bleu |
| **Classement** | Par année Rotary | Chronologique |

L'impact n'affiche que des données réelles.

**Le registre d'impact.** La page Actions peut réunir l'impact de l'ensemble des actions, à une condition de forme : c'est un **registre**, pas un bandeau de statistiques. Une ligne par indicateur, le libellé à gauche, la valeur à droite, un filet entre les lignes, sur le champ encre. Jamais de tuiles « grand chiffre, petit libellé » alignées, jamais de compteur animé. Une valeur absente s'écrit « Donnée à venir » : aucun chiffre n'est inventé ni arrondi pour l'effet.

**La définition.** Ce qu'est une action s'explique sous la forme d'une entrée de dictionnaire : le mot en très grand, sa nature grammaticale en italique, la définition en voix de récit.

**Le mois en marge.** Dans le registre de la page News, les actualités sont groupées par mois. Le nom du mois, en très grand, occupe la marge et reste visible tant que ses lignes défilent (position collante, sans script). C'est le rythme temporel de la page.

**Les archives.** Les années Rotary se lisent comme le dos des volumes d'une collection : une ligne par année, en très grand, avec le nombre d'actualités. Seules les années qui ont du contenu apparaissent.

**La fiche dépliable.** Tant que la page de détail n'existe pas, une action ou une actualité publiée offre un « plus » sous la forme d'un bloc qui se déplie sur place : la fiche complète ou le texte, et les autres photographies.

---

## 11. Recrutement

**Parcours d'adhésion.** `Candidater → Être invité à une réunion ou une action → Participer → Devenir sympathisant → Être validé par l'Assemblée Générale → Devenir membre`

La page Join montre les six étapes. Le champ cranberry de la Home en donne la version courte, en quatre temps.

Entre la candidature et l'adhésion, la personne est **sympathisante** : pas encore membre, elle peut participer aux réunions, aux actions et aux moments de camaraderie, et devient membre après validation par l'Assemblée Générale.

Rejoindre un club est un engagement, pas un achat. Le site invite, explique et laisse décider.

- **Le champ cranberry** conclut la Home, et seulement la Home. Il contient une question, une phrase, l'appel et le parcours en quatre étapes numérotées.
- **Le rappel cranberry** conclut les autres pages. C'est une bande basse : l'étiquette, la question, et l'appel sur une ligne. Ni photographie, ni parcours, ni phrase d'explication. Il rappelle, il n'insiste pas.
- **Sur Join, le cranberry ouvre la page.** Un champ qui n'occupe que la gauche de l'écran, le titre « Nous rejoindre » en blanc, une photographie verticale qui le recouvre en partie à droite. La page n'a ni rappel ni autre surface cranberry : elle se termine par des liens de sortie.
- **Aucune promesse.** Pas de slogan, pas de bénéfice vanté, pas de chiffre, pas de témoignage. La page explique, dans l'ordre : ce qu'est le club, pourquoi y participer, comment se passe le parcours, comment candidater.
- **« Nous rejoindre »** figure dans l'en-tête, dans le champ cranberry et dans le pied de page.
- **Interdits** : fenêtre surgissante, bandeau fixe, compte à rebours, « places limitées », vocabulaire commercial, points d'exclamation en série, appel répété à chaque section, témoignage inventé.

---

## 12. Mouvement

**Thèse.** Le mouvement donne une sensation de finition. Il répond à un geste du visiteur. Il ne se déclenche jamais seul.

| Durée | Usage |
|---|---|
| 120 ms | Changement de couleur au survol ou à l'appui |
| 200 ms | Tracé d'un filet, déplacement d'une flèche |
| 320 ms | Ouverture du sommaire, d'une modale |
| 480 ms | Grossissement d'une image au survol |

Courbe unique, en décélération. Aucun rebond.

| Interaction | Comportement |
|---|---|
| **Navigation** | Un filet se trace de gauche à droite sous le lien. Il reste, en bleu, sous la rubrique courante. |
| **Lien fléché** | Le filet se trace sous le libellé, la flèche avance de 4 px. |
| **Image d'un contenu cliquable** | Grossit de 3 % dans son cadre. |
| **Ligne du registre** | Devient blanche, le jour passe au bleu. |
| **Appel du champ cranberry** | La ligne s'inverse (fond blanc, texte encre), se resserre de 16 px, la flèche avance de 8 px. |
| **Sommaire du téléphone** | Apparaît en fondu avec un déplacement de 8 px. |
| **Focus** | Contour de 2 px, décalé de 2 px : bleu royal sur fond clair, blanc sur champ fort. Toujours visible. |

**Interdits.** Animation permanente, apparition des sections au défilement, parallaxe, défilement détourné, effet 3D, compteur animé, transition lente.

**Mouvement réduit.** Quand `prefers-reduced-motion` est actif, tous les déplacements, tracés et grossissements sont supprimés. Les changements de couleur restent, instantanés.

---

## 13. Accessibilité

Cible : **WCAG 2.2 niveau AA**.

- **Contraste.** Seules les paires de la section 3 sont utilisables, chacune dans son rôle.
- **Grand texte décoratif.** Un chiffre monumental ou un nom répété pour l'effet est masqué aux lecteurs d'écran, et l'information qu'il porte existe ailleurs en texte.
- **Titres.** Un seul H1 par page, niveaux sans saut, quelle que soit la taille visuelle.
- **Clavier.** Tout est atteignable, dans l'ordre visuel. Lien d'évitement « Aller au contenu ». Le sommaire retient le focus et se ferme avec Échap.
- **Focus.** Toujours visible, jamais masqué par l'en-tête fixe.
- **Texte.** Tailles relatives, zoom à 200 %, une colonne à 320 px sans défilement horizontal.
- **Images.** Texte alternatif pour toute image de contenu, distinct de la légende. Un gabarit sans photographie n'est pas une image : sa description est un texte.
- **Cibles tactiles.** 44 px par 44 px.
- **Sémantique.** Repères de page, listes pour les listes, rubrique courante signalée, langue déclarée.

---

## 14. Responsive

Le téléphone est conçu, pas réduit.

| Élément | Téléphone | Tablette | Ordinateur |
|---|---|---|---|
| **En-tête** | Année seule dans la une, nom du club, « Menu » | Une complète, « Menu » | Une complète, navigation en ligne |
| **Ouverture** | Photographie bord à bord, signature à cheval sur son bord inférieur | Idem, photographie moins haute | Marge de deux colonnes, photographie à bord perdu à droite. La photographie et la signature tiennent dans le premier écran ; sur un écran bas, l'accroche passe dessous pour que les visages restent visibles |
| **Signature** | 16,5 % de la largeur de l'écran | Idem | Plafonnée à 13,5 rem |
| **Escalier des valeurs** | Pas de 12 px, définition sous le nom | Idem | Pas d'une colonne, définition à droite |
| **Axes** | Une colonne | Deux colonnes décalées | Deux colonnes décalées, en regard du « 7 » |
| **Actions** | Première image bord à bord, les autres en colonne | Deux images côte à côte, décalées | Bord perdu, aplat mordant, décalages |
| **Registre** | Jour à gauche, titre et type à droite | Idem | Titre de section en marge, type en bout de ligne |
| **Membres** | Noms, puis portraits sur leur bande | Idem | Noms sur sept colonnes, portraits à droite |
| **Champ cranberry** | Photographie qui dépasse en haut à droite, parcours sur deux colonnes | Parcours sur quatre colonnes | Question sur huit colonnes, photographie à bord perdu |

- Aucun contenu coupé, aucun défilement horizontal.
- Les superpositions restent sur téléphone quand elles tiennent : signature à cheval, photographies traversantes, chevauchement des portraits.
- Les très grandes tailles suivent la largeur de l'écran.

**Performance.** Affichage du contenu principal en moins de 2,5 s sur téléphone, décalage de mise en page inférieur à 0,1, un seul fichier de police (environ 80 Ko), images servies à la taille de l'écran.

---

## 15. Ce que le site ne doit jamais devenir

- **Un template de landing page** : hero centré, titre, paragraphe, deux boutons, trois colonnes.
- **Une grille de cartes répétitives** : mêmes cadres, mêmes tailles, mêmes ombres.
- **Un site corporate générique** : bandeau de chiffres clés, mur de logos, photos de poignées de main.
- **Un site Rotary générique** : bleu partout, or en abondance, roue en filigrane, titres en capitales.
- **Un tableau de bord** : widgets, indicateurs, barres de progression.
- **Un design SaaS** : fond bleu nuit et néon, dégradés, glassmorphism, captures d'interface, pilules.
- **Un minimalisme vide** : une page uniformément blanche, du blanc sans tension, des sections qui se suivent au même rythme, une typographie timide.
- **Une accumulation d'aplats bleus.**
- **Un usage excessif du cranberry** : en bouton, en lien, en titre, ou plus d'une fois par page.
- **Des animations décoratives gratuites.**

### Interdits de détail

- Ombres sur le contenu, grands arrondis, portraits en cercle.
- Barre colorée épaisse sur le côté d'un bloc.
- Motifs, textures, grain, formes abstraites décoratives. Les repères de grille sont la seule trace graphique du fond de page.
- Troisième famille typographique, police monospace, émoji.
- Texte courant sur une photographie.
- Faux contenu : chiffres, témoignages, membres, photographies.
- Curseur personnalisé, carrousel automatique, vidéo en lecture automatique.

### Arbitrages

| Sujet | Recommandation d'un outil | Décision du projet |
|---|---|---|
| Étiquette au-dessus d'un titre | Taste la rationne, Impeccable la refuse | Retenue, à la demande du club : une par section, toujours au même format |
| Numérotation des sections | Les deux la déconseillent | Retenue : elle fait partie du langage du journal |
| Taille maximale d'un titre | Impeccable plafonne à 6 rem | Dépassée pour l'étage graphique, jusqu'à 17 rem |
| Texte sur image | La première version l'interdisait | Permis pour un grand titre blanc sur une image voilée |
| Grossissement d'image au survol | La première version l'interdisait | Permis, 3 %, sur un contenu cliquable |
| Mode sombre | Taste le demande | Pas en V1 |
| Tailwind, bibliothèques d'animation et d'icônes | Taste les propose | Refusés : CSS natif, aucune dépendance |
| Images générées | Taste les propose | Refusées |

---

## 16. Tokens

Implémentés dans `apps/web/src/app/tokens.css`, sur deux niveaux : les primitives portent les valeurs, les tokens sémantiques portent les rôles. Les composants n'utilisent que les seconds.

| Famille | Contenu |
|---|---|
| **Couleurs** | Marque, neutres officiels, neutres dérivés, états ; rôles sur fond clair et sur champ fort ; emplacement sans contenu ; voile |
| **Typographie** | Deux familles, quatre graisses, deux largeurs, un jeu taille, interligne, approche par rôle, étage graphique compris |
| **Espacement** | Échelle de 4 à 160 px, rythmes, grille par plage, largeur d'une colonne, distance au bord de l'écran |
| **Mise en page** | Conteneurs, hauteur d'en-tête, hauteur de contrôle, cible tactile, ordre de superposition |
| **Formes** | Rayons, épaisseurs de filet, trait d'or, contour de focus, l'unique ombre |
| **Mouvement** | Quatre durées, une courbe |

Une valeur absente des tokens s'ajoute là avant d'être utilisée. Points de rupture : 768, 1024, 1440 px.

---

## 17. Direction par page

Seule la Home est conçue. Les quatre autres pages reprendront ce langage en mode lecture. Ces lignes fixent une intention, pas un périmètre fonctionnel.

| Page | Intention |
|---|---|
| **Home** | Voir section 6. Signature, sept sections numérotées, champ cranberry. |
| **Actions** | Le reportage. Ouverture typographique sur le fond de page, avec une photographie verticale à bord perdu qui descend dans la section suivante et une seconde image qui la chevauche. Définition en entrée de dictionnaire sur feuille blanche. Index des filtres, puis les actions une à une, chacune dans l'une de trois compositions qui alternent : grand format avec titre au-dessus et métadonnées en marge, verticale à gauche avec fiche à droite, texte à gauche avec image décalée à droite. Registre d'impact sur champ encre. Rappel cranberry. |
| **News** | Le journal. Ouverture purement typographique, en deux lignes décalées, comme une manchette. Une actualité à la une : le jour en chiffre monumental, une grande photographie à bord perdu, le titre sur un aplat blanc qui mord dessus. Sur feuille blanche, les rubriques en index puis le registre, groupé par mois : le mois reste en marge pendant que ses lignes défilent. Les archives par année Rotary sur champ encre, les années en très grand. Deux liens vers les actions et les membres, puis le rappel cranberry. |
| **Join** | L'invitation. Ouverture sur champ cranberry partiel, photographie verticale qui le recouvre. « Un club, des actions, des liens » en trois lignes décalées sur feuille blanche. Les valeurs de part et d'autre d'un axe central : le nom à gauche de l'axe, la définition à droite. Les sept domaines sur champ encre, en lignes alternées gauche et droite. Le parcours en six étapes le long d'un filet vertical, chiffres au trait, le statut de sympathisant expliqué à son étape. Les quatre questions du Rotary en voix de récit, en grand. La candidature : colonne éditoriale et formulaire. Les questions fréquentes en accordéon. Liens de sortie. |
| **Members** | L'annuaire. Le titre sur une seule ligne, en signature. Une photographie de groupe panoramique à bord perdu à gauche, les années Rotary en regard à droite. Sur feuille blanche, l'année tracée au trait en très grand, puis trois niveaux de lecture : une personne en grand format, trois portraits de tailles et de hauteurs différentes, puis les autres en lignes. Sur champ encre, l'index des fonctions : qui tient quoi, sans hiérarchie entre les fonctions. Liens de sortie, rappel cranberry. L'ordre des personnes est celui que le club choisit, jamais un classement par fonction. |

---

## Décisions verrouillées

1. Direction : éditorial premium, documentaire, association contemporaine. Concept « Le journal du club ».
2. Royal Blue `#17458f` : structure et interaction, jamais en plein cadre.
3. Cranberry `#d41367` : accent rare et expressif, un champ par site.
4. Or `#f7a81b` : le trait d'or uniquement.
5. Encre `#0f1c36` et Brume `#f3f6f9` : neutres fonctionnels dérivés, hors marque.
6. Open Sans (condensée par l'axe `wdth`) et Georgia. Aucune autre police web.
7. Pas de mode sombre en V1.
8. Rayon 0, aucune ombre sur le contenu.
9. Photographie documentaire réelle uniquement.
10. Aucun contenu inventé. Emplacements discrets.
11. Mouvement en réponse à un geste, respect de `prefers-reduced-motion`.
12. WCAG 2.2 AA, paires de couleurs autorisées par leur contraste réel.
13. Aucune dépendance ajoutée pour le design.

## Points ouverts

1. **Logos à fond transparent.** Les fichiers fournis ont un fond blanc opaque. Une version transparente, et une version inversée pour le pied de page, supprimeraient le cartouche blanc.
2. **Photographies.** Seule l'ouverture en a une. Les autres sont à fournir, avec pour chacune sa légende (quoi, où, quand).
3. **Textes.** Présentation du club, accroches, libellés des étiquettes.
4. **Famille d'icônes.**
5. **Chiffres tabulaires d'Open Sans.** À vérifier sur le fichier servi.
6. **Georgia sur Android.** Le rendu de la serif système de remplacement est à contrôler sur un téléphone réel.
