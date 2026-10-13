# Contrat : saisie des images dans le Back Office

Direction : `apps/admin/DESIGN.md`. Les écrans, champs et messages de `specs/008-back-office/contracts/screens.md` et `specs/010-admin-redesign/contracts/screens.md` restent valables ; voici ce qui s'ajoute.

## Formulaires de création

`/membres/nouveau`, `/actions/nouvelle` et `/actualites/nouvelle` ne proposent aucun envoi d'image (FR-012). Une ligne d'information, en encre secondaire, figure sous le formulaire :
- membre : « Le portrait s'ajoute sur la fiche, après l'enregistrement. » ;
- action ou actualité : « Les photographies s'ajoutent sur la fiche, après l'enregistrement. »

## `/membres/[id]` : section « Portrait »

Elle est placée entre le formulaire du membre et la section « Mandats », sous un titre de section à filet.

| État | Contenu | Actions |
|---|---|---|
| Sans portrait | Gabarit 4:5 sur fond d'outillage, « Aucun portrait. » | « Ajouter un portrait » (contour) |
| Avec portrait | Vignette 4:5 de 160 px de large, recadrée selon le point d'intérêt ; texte alternatif ; dimensions `L × H px` en chiffres tabulaires ; avertissement de largeur sous 1200 px | « Remplacer », « Modifier », « Retirer » |

« Retirer » ouvre la confirmation « Retirer ce portrait ? », avec le texte « Le fichier sera supprimé. ».

## `/actions/[id]` et `/actualites/[id]` : section « Photographies »

Elle est placée après le formulaire, avant la zone de suppression. Le titre de section porte le compteur en chiffres tabulaires (« Photographies · 3 / 20 ») et, à droite, l'action « Ajouter une photographie » (contour), désactivée à 20 avec l'infobulle « 20 photographies au plus. ».

La grille a une ligne par photographie :

| Colonne | Contenu |
|---|---|
| Rang | 1, 2, … en chiffres tabulaires ; le rang 1 porte la marque « Principale » (Azure) |
| Image | Vignette 3:2 de 96 px |
| Texte alternatif | Tronqué sur deux lignes ; légende en encre secondaire en dessous |
| Dimensions | `L × H px` ; avertissement sous 1600 px |
| Actions | « Monter », « Descendre » (boutons-icônes, noms accessibles « Monter la photographie N »), puis « Modifier » et « Retirer » dans le menu de ligne |

- Sans photographie : « Aucune photographie. »
- Chaque déplacement enregistre l'ordre immédiatement (`PUT …/photos/order`), puis affiche l'avis « Ordre enregistré. ».
- « Retirer » ouvre la confirmation « Retirer cette photographie ? », avec le texte « Le fichier sera supprimé. ».

## Panneau « image » (`ImageSheet`)

Panneau latéral de 480 px, plein écran sur téléphone. Titres : « Ajouter un portrait », « Remplacer le portrait », « Ajouter une photographie », « Modifier l'image ».

| Élément | Règle |
|---|---|
| Fichier | Présent à l'ajout et au remplacement seulement. Bouton « Choisir une image » (`accept="image/jpeg,image/png,image/webp"`) ; plus de 5 Mo ou autre type : message immédiat sous le bouton, avec les textes de l'API |
| Réduction | Après le choix, « Préparation de l'image… » (barre fine), puis la vignette |
| Vignette | L'image entière, contenue dans un cadre de 432 px de large au plus ; repère circulaire de 16 px au point d'intérêt ; clic pour le placer ; au clavier, la vignette prend le focus, les flèches le déplacent de 5 %, et le nom accessible annonce « Point d'intérêt : 50 %, 30 % » |
| « Recentrer » | Bouton texte ; ramène à « 50% 50% » |
| Dimensions | `L × H px` de l'image qui sera envoyée ; avertissement de FR-013 sous la largeur conseillée |
| Texte alternatif* | Champ multiligne, 300 caractères ; aide : « Décrit ce que l'image montre, pour qui ne la voit pas. » |
| Légende | 300 caractères ; aide : « Quoi, où, quand. » |
| Crédit | 120 caractères |
| Pied | « Enregistrer » (plein ; « Envoi… » pendant l'envoi), « Annuler » (texte) |

Les erreurs de l'API s'affichent sous leur champ ou en tête du panneau ; la saisie est conservée. En cas de réussite, le panneau se ferme, la fiche est relue, et un avis s'affiche : « Enregistrement créé. » pour un ajout, « Modifications enregistrées. » pour un remplacement ou une modification.

## Aperçus (fonctionnalité 010)

- `MemberInspector` : le portrait, en 4:5 sur toute la largeur de l'aperçu, quand il existe.
- `ActionInspector` et `NewsInspector` : la photographie principale, en 3:2, et « N photographies » en zone.
- Sans image : aucun gabarit dans l'aperçu.

## Listes

Les colonnes ne changent pas : les listes ne montrent aucune vignette, pour rester denses.
