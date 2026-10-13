# Contrat des écrans : Back Office

Aspect : `apps/admin/DESIGN.md` (« La grille »). Composants réutilisés de 011 : `ImageSheet`, `FocusPicker`, `ImageThumb`, `ConfirmDialog`. Le navigateur n'appelle jamais l'API : lecture dans le composant serveur de la page, écritures par actions serveur.

## Navigation

- Entrée « Site » (icône `LanguageOutlined`) après « Candidatures », dans la barre latérale et dans les onglets du téléphone (libellé court « Site »).
- Destination « Site » dans la recherche rapide (Ctrl+K), par la même liste.

## Page `/site`

`PageHeader` : titre « Site », sous-titre « Photographies, réseaux sociaux et textes du site public. Une modification apparaît sur le site en une minute environ. »

États : chargement (squelette de page existant), erreur de lecture (`error.tsx` du groupe), avis après chaque opération (`?avis=…`, `Notice`).

### Section « Photographies »

`SectionHeading` « Photographies ». Une grille de sept cartes, dans l'ordre de `SitePhotoSlot` ([data-model.md](../data-model.md)) : deux colonnes à partir de 900 px, une sur téléphone.

Chaque carte :
- en tête : la page en étiquette (« Accueil », « Actions », « Membres », « Nous rejoindre ») et le libellé de l'emplacement (« Ouverture », « Le club », « Appel Nous rejoindre », « Ouverture, grande », « Ouverture, détail ») ;
- le format en chiffres tabulaires (« 4:5 ») et la description de l'image attendue, reprise du gabarit du site (« Un moment de camaraderie. ») ;
- **vide** : un gabarit au format de l'emplacement sur `var(--grid-chrome)`, « Aucune photographie. » (pour `accueil-ouverture` : « Photographie livrée avec le site. » ; pour `rejoindre-ouverture` : « Reprend l'ouverture de l'accueil. »), bouton « Ajouter une photographie » (contour) ;
- **occupée** : `ImageThumb` au format de l'emplacement, texte alternatif, dimensions, avertissement de largeur si besoin, boutons « Remplacer », « Modifier » et « Retirer » ;
- « Retirer » ouvre `ConfirmDialog` « Retirer cette photographie ? » / « Le fichier sera supprimé. Le site reviendra à son emplacement d'origine. ».

`ImageSheet` : titres « Ajouter une photographie », « Remplacer la photographie », « Modifier l'image » ; `recommendedWidth` de l'emplacement (2400 ou 1600). Après réussite : `router.refresh()` et avis `cree` ou `modifie`.

### Section « Réseaux sociaux »

`SectionHeading` « Réseaux sociaux ». Formulaire, une colonne :
- « Page Facebook », aide « Adresse complète, par exemple https://www.facebook.com/… Vide : le pictogramme reste sans lien. » ;
- « Compte Instagram », même aide avec https://www.instagram.com/… ;
- bouton « Enregistrer » ; erreurs de l'API sous chaque champ.

### Section « Textes »

`SectionHeading` « Textes ». Deux formulaires l'un sous l'autre, chacun avec son bouton « Enregistrer ».

**Présentation du club** (accueil, section « Qui sommes-nous ? »), aide de tête « Seules les informations remplies apparaissent sur le site. » :
- « Année de création » (numérique, 4 chiffres) ;
- « Club parrain » ;
- « Nombre de membres » (numérique), aide « À mettre à jour à chaque année Rotary. » ;
- « Lieu des réunions » ;
- « Rythme des réunions », exemple en aide : « Deux fois par mois, le jeudi soir ».

**Questions fréquentes** (page « Nous rejoindre ») : six champs multilignes, chacun intitulé par sa question, dans l'ordre du site.
- Valeur initiale : la réponse enregistrée, sinon la réponse actuelle du site (`src/content/site.ts`, research R3), sinon vide.
- Aide sous `qui` et `frequence` : « Vide : la question n'apparaît pas sur le site. »
- Aide générale : « Séparez les paragraphes par une ligne vide. »
- Le formulaire refuse tout de suite de vider les quatre autres, avec le message de l'API.

## Actions serveur (`app/(admin)/site/actions.ts`)

| Action | Appel | Après réussite |
|---|---|---|
| `saveSocial(state, formData)` | `PATCH /admin/site-settings` `{ social }` | `revalidatePath("/site")`, état `ok`, avis `modifie` |
| `saveClub(state, formData)` | `PATCH` `{ club }` (nombres convertis ; vide → `null`) | idem |
| `saveFaq(state, formData)` | `PATCH` `{ faq }` (six clés envoyées) | idem |
| `setSitePhoto(slot, state, formData)` | `PUT …/photos/:slot` (multipart, `apiUpload`) | `{ values: {}, ok: true }` pour le panneau |
| `updateSitePhoto(slot, state, formData)` | `PATCH …/photos/:slot` | idem |
| `removeSitePhoto(slot)` | `DELETE …/photos/:slot` | `redirect(withNotice("/site", "supprime"))` |

Erreurs : `failure` et `failureMessage` de `lib/form-errors.ts`, `imageFailure` de `lib/image-forms.ts` ; `503` → « Service indisponible. ».
