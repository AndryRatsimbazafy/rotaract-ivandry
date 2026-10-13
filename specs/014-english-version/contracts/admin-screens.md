# Contrat des écrans : Back Office

Le Back Office reste en français. Aspect : `apps/admin/DESIGN.md`.

## Fiche d'une action (`ActionForm`)

Après la section « Impact (facultatif) », une section « English (facultatif) » (`SectionHeading`) :
- aide : « Laissés vides, ces champs affichent le texte français sur le site anglais. » ;
- « Titre », « Résumé », « Description » (multiligne), puis « Objectif », « Bénéficiaires », « Lieu », « Période », « Résultats » ;
- mêmes limites que les champs français ; erreurs de l'API sous chaque champ (`en.title` → champ `en.title`).

## Fiche d'une actualité (`NewsForm`)

Section « English (facultatif) » : « Titre », « Lieu », « Résumé », « Contenu » (multiligne).

## Panneau image (`ImageSheet`)

Sous « Texte alternatif » et « Légende » : « Texte alternatif (anglais) » et « Légende (anglais) », facultatifs, mêmes limites. Valables pour le portrait, les photographies et les emplacements du site.

## Écran « Site »

- **Présentation du club** : sous « Club parrain », « Lieu des réunions » et « Rythme des réunions », un champ « … (anglais) ».
- **Questions fréquentes** : sous chaque réponse française, « Réponse (anglais) », facultative, même quand la réponse française est obligatoire.

## Actions serveur

Les actions serveur existantes envoient en plus `en` (chaînes vides → `null`) et, pour les images, `altEn` et `captionEn`. Aucune action nouvelle.
