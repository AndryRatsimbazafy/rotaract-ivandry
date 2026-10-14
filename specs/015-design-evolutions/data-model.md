# Data Model : Évolutions design du site public

Modifications des modèles d'`ARCHITECTURE.md`, section 1. Rien n'est supprimé ; aucune migration : un document existant sans les nouveaux champs se lit comme « non marquante », « pas d'histoire », « pas de photographie ».

## Action (collection `actions`)

| Champ | Type | Règles |
|---|---|---|
| `highlighted` | booléen | Facultatif à l'écriture, `false` par défaut. « Action marquante » de la frise (Q3). |

**Règle FR-027 (Q5)** : au plus **trois** actions `highlighted: true` par `rotaryYear`, publiées ou non.
- Vérifiée par le service à la création et à toute modification dont le résultat est une action marquée (`highlighted` passe à `true`, ou `rotaryYear` change sur une action marquée).
- Compte : autres actions (`_id` différent) de la même `rotaryYear` avec `highlighted: true`. À 3 ou plus : refus `400`, `details[{ field: "highlighted", message: "L'année <label> compte déjà trois actions marquantes." }]`, `<label>` au format `2025-2026`.
- Décocher, dépublier ou supprimer une action ne vérifie rien.
- La suppression d'une action libère sa place.

**Vues** :
- admin : `highlighted` toujours présent (booléen) ;
- publique : `highlighted: true` seulement quand l'action est marquée (champ absent sinon, comme les autres champs facultatifs).

## SiteSettings (collection `site_settings`, document `"site"`)

| Champ | Type | Règles |
|---|---|---|
| `history` | texte | Facultatif. 1 à 4 000 caractères après suppression des espaces de bord ; paragraphes séparés par une ligne vide. `null` le vide. Histoire du club, en français (Q1). |
| `en.history` | texte | Facultatif. Mêmes limites. Traduction anglaise de `history` ; ignorée à l'affichage si `history` est vide (règle de 014 : un champ français absent reste absent). Message : `englishLengthMessage("L'histoire du club", 4000)`. |
| `photos.club-ouverture` | MediaRef | Huitième emplacement fixe (Q4) : même forme et mêmes règles que les sept autres (alt, légende, crédit, `altEn`, `captionEn`, 5 Mo, dossier `site/pages/`). |

`SitePhotoSlot` gagne `club-ouverture` dans l'API (`common/enums/site-photo-slot.enum.ts`), le Back Office (`types/site-settings.ts`, `content/site.ts`) et le Front Office (`types/site-settings.ts`).

**Repli de l'ouverture de « Le club »** (FR-026) : `club-ouverture` → `accueil-club` → gabarit « Photographie à venir ». L'image de partage de la page suit le même ordre, puis `accueil-ouverture`, puis l'image livrée avec le site.

## Lectures du Front Office (sans stockage)

### Frise (`ClubTimeline`)

```text
TimelineYear {
  year: RotaryYear            // « 2025-2026 »
  presidents: { firstName, lastName }[]   // mandats de l'année dont roles contient "president", ordre du club
  actions: { slug, title, focusAreas, french? }[]  // actions publiées marquantes de l'année, ordre de la liste publique
}
ClubTimeline = TimelineYear[]  // de la plus récente à la plus ancienne ; années sans président ni action écartées
```

### Chiffres clés (`ClubFigures`)

| Chiffre | Source | Absent quand |
|---|---|---|
| Année de fondation | `club.foundedYear` | non saisie |
| Membres | `club.memberCount` | non saisi |
| Actions menées | nombre d'actions publiées | zéro ou lecture en échec |
| Années Rotary | nombre d'années de la frise | zéro |

Aucun chiffre calculé n'est arrondi ni estimé (constitution, principe VIII).

### Image de partage

Aucune donnée stockée : le titre (langue de la page, repli français), la photographie (`Photo.src`, `Photo.focus`) et le texte alternatif de l'image (« <titre> — Rotaract Club Ivandry »).

## Inchangés

Membres, mandats (la fonction `president` existe déjà), années Rotary, actualités, candidatures.
