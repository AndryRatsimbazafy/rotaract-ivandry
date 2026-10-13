# Modèle de données : stockage des images

Références : `ARCHITECTURE.md`, section 2 (`MediaRef`), section 1 (Member, Action, News), section 8 (validation), et [research.md](./research.md), R5.

## MediaRef (sous-document embarqué, avec identifiant)

| Champ | Type | Obligatoire | Règle | Lecture d'administration | Lecture publique |
|---|---|---|---|---|---|
| `_id` → `id` | ObjectId | oui | Posé à l'envoi | oui | non |
| `url` | string | oui | Adresse publique renvoyée par le fournisseur (`https://res.cloudinary.com/…/image/upload/…`) | oui | oui |
| `publicId` | string | oui | `site/<membres\|actions\|actualites>/<uuid>` | **jamais** | **jamais** |
| `name` | string | oui | Nom d'origine épuré (`cleanFileName`), 255 au plus | oui | non |
| `mimeType` | string | oui | `image/jpeg`, `image/png` ou `image/webp`, constaté sur le contenu | oui | non |
| `size` | number | oui | Octets reçus, de 1 à 5 242 880 | oui | non |
| `width`, `height` | number | oui | Pixels, renvoyés par le fournisseur après orientation | oui | oui |
| `alt` | string | oui | Épuré des espaces aux extrémités, de 1 à 300 caractères | oui | oui |
| `caption` | string | non | 300 au plus ; vide → absent | oui (`null` si absent) | oui, si présent |
| `credit` | string | non | 120 au plus ; vide → absent | oui (`null` si absent) | oui, si présent |
| `focus` | string | oui | `^(\d{1,3})% (\d{1,3})%$`, chaque valeur de 0 à 100 ; défaut `"50% 50%"` | oui | oui |

**Messages de validation** (en français, renvoyés dans `details`) :

| Champ | Message |
|---|---|
| `alt` | « Le texte alternatif est obligatoire. », « Le texte alternatif compte 300 caractères au plus. » |
| `caption` | « La légende compte 300 caractères au plus. » |
| `credit` | « Le crédit compte 120 caractères au plus. » |
| `focus` | « Le point d'intérêt doit être de la forme « 50% 30% ». » |
| `image` | « Une image est attendue, dans le champ « image ». » |

## Rattachements

| Entité | Champ | Type | Règle |
|---|---|---|---|
| Member | `portrait` | `MediaRef \| null` | Zéro ou un ; défaut `null` |
| Action | `photos` | `MediaRef[]` | De 0 à 20, ordre de l'index ; la première est la principale ; défaut `[]` |
| News | `photos` | `MediaRef[]` | Idem |

Les corps de création et de modification existants (`CreateMemberDto`, `UpdateMemberDto`, `CreateActionDto`, `UpdateActionDto`, `CreateNewsDto`, `UpdateNewsDto`) n'acceptent **ni** `portrait` **ni** `photos`. Avec le `whitelist` du socle, ces champs sont refusés s'ils sont envoyés. Les images ne passent que par les routes de [contracts/api-images.md](./contracts/api-images.md).

## Cycle de vie d'une image

```text
(fichier choisi) → réduit dans le navigateur → envoyé (multipart)
  → API : type et poids contrôlés → déposé chez le fournisseur → écrit dans le document
      └─ écriture en échec → fichier retiré (orphelin journalisé si ce retrait échoue)
rattachée ─ PATCH (alt, légende, crédit, point d'intérêt) ─→ rattachée
rattachée ─ PUT order (photos) ─→ rattachée, nouvelle position
rattachée ─ DELETE ─→ fichier retiré, puis retirée du document (503 et rien de modifié si le stockage est indisponible)
portrait ─ PUT (nouveau fichier) ─→ nouveau rattaché, puis ancien fichier retiré (échec journalisé)
contenu supprimé ─→ tous ses fichiers retirés, puis document supprimé (503 et rien de supprimé si le stockage est indisponible)
```

## Front Office (`apps/web`)

`Photo` (type existant, `src/types/media.ts`) ← `PublicImage` de l'API : `src = url`, et `width`, `height`, `alt`, `caption`, `credit`, `focus` sont repris tels quels. C'est la correspondance d'`ARCHITECTURE.md`, section 10.

| Fonction | Champ | Avant | Après |
|---|---|---|---|
| `data/members.ts` `toMember` | `portrait` | absent | `toPhoto(member.portrait)` s'il existe |
| `data/actions.ts` | `photos` | `[]` | `action.photos.map(toPhoto)` |
| `data/news.ts` | `photos` | `[]` | `news.photos.map(toPhoto)` |

## Back Office (`apps/admin`)

Types ajoutés dans `src/types/media.ts` : `AdminImage = { id, url, width, height, alt, caption, credit, focus, name, mimeType, size }`. Le champ `portrait: AdminImage | null` s'ajoute à `Member`, et `photos: AdminImage[]` à `Action` et à `News`.

Largeurs conseillées, servant à l'avertissement de FR-013 : 1200 px pour un portrait, 1600 px pour une photographie.
