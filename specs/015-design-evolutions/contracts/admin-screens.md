# Contrat des écrans : Back Office (015)

Le Back Office reste en français. Aspect : `apps/admin/DESIGN.md`. Aucune action serveur nouvelle : les actions existantes envoient les champs en plus.

## Fiche d'une action (`ActionForm`)

- Case à cocher « Action marquante (frise du club) », après le choix de l'année Rotary.
- Aide : « Trois au plus par année Rotary. »
- Refus de l'API (`field: "highlighted"`) affiché sous la case ; les autres champs gardent leur saisie.
- Liste des actions : pas de colonne nouvelle (l'inspecteur montre « Marquante » quand c'est le cas).

## Écran « Site »

- **Histoire du club** (nouvelle carte, après « Présentation du club ») :
  - « Histoire » : multiligne, 4 000 caractères au plus, aide « Séparez les paragraphes par une ligne vide. » ;
  - « Histoire (anglais) » : multiligne, facultatif, mêmes limites ;
  - bouton « Enregistrer » de la carte, comme les autres groupes.
- **Photographies fixes** : un huitième emplacement « Le club — ouverture », avec l'aide « Ouverture de la page Le club. Sans elle, la page reprend la photographie « Accueil — le club ». »
