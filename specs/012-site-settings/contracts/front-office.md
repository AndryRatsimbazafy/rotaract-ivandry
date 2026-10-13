# Contrat : Front Office

Le Front Office lit les réglages par `src/data/site-settings.ts` seulement, depuis son serveur (`ARCHITECTURE.md`, section 10). Il n'appelle jamais les routes `/admin`.

## Couche de données

`getSiteSettings(): Promise<SiteSettings>` :
- lit `GET /site-settings` par `apiGet` (revalidation de 60 s) ;
- fait correspondre les images par `toPhoto` (011) et découpe les réponses par `toParagraphs` ;
- en cas d'échec de lecture, renvoie l'état vide (`social`, `club`, `faq`, `photos` vides).

```ts
type SiteSettings = {
  social: { facebook?: string; instagram?: string };
  club: { foundedYear?: number; sponsorClub?: string; memberCount?: number; meetingPlace?: string; meetingRhythm?: string };
  faq: Partial<Record<FaqQuestionId, string[]>>;   // paragraphes
  photos: Partial<Record<SitePhotoSlot, Photo>>;
};
```

## Affichage

| Où | Réglage | Renseigné | Vide (état actuel conservé) |
|---|---|---|---|
| `SocialLinks` (en-tête, pied de page, menu du téléphone) | `social.*` | Lien vers l'adresse, nom lisible « Facebook », « Instagram » | Pictogramme sans lien, « … : lien à venir » |
| Accueil, `About` | `club.*` | Fiche du club (`DESIGN.md`, section 6, ajout de R8) : une ligne par information renseignée | Mention « Présentation à compléter » si les cinq sont vides |
| Nous rejoindre, `JoinFaq` | `faq.<id>` | Réponse enregistrée, en paragraphes | Réponse du code ; question masquée si le code n'en a pas |
| Accueil, `Opening` | `photos.accueil-ouverture` | Image, voile et signature inchangés | `opening.photo`, fichier livré avec le site |
| Accueil, `About` | `photos.accueil-club` | Image 4:5 | Gabarit |
| Accueil, `JoinField` | `photos.accueil-rejoindre` | Image 4:5 | Gabarit |
| Actions, `ActionsOpening` | `photos.actions-ouverture`, `photos.actions-detail` | Images 4:5 et 3:2 | Gabarits |
| Membres, `MembersOpening` | `photos.membres-ouverture` | Image 2:1 | Gabarit |
| Nous rejoindre, `JoinOpening` | `photos.rejoindre-ouverture` | Image 4:5 | Ouverture de l'accueil en vigueur ; fichier livré recadré « 55% 40% » |

- Les intitulés de la fiche du club : « Création », « Club parrain », « Membres », « Réunions », « Rythme ».
- Toutes les images passent par `PhotoFrame` (texte alternatif, légende, crédit, point d'intérêt, jamais agrandies).
- `/rejoindre` est rendue à la demande (`await connection()`), comme l'accueil (research, R6).

## Ce qui ne change pas

Les compositions, les tokens, les textes de `content/*` hors des réponses de la FAQ, et toutes les pages pour une base sans réglages (SC-002).
