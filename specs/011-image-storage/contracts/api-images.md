# Contrat : routes des images (API)

Toutes les routes sont sous `/api/v1/admin`, derrière JWT et le rôle `ADMIN`. Les formes d'image sont celles de [data-model.md](../data-model.md). Les erreurs suivent le format du socle (`specs/001-api-foundation/contracts/errors.md`). Elles remplacent la ligne provisoire « Médias » (`POST` et `DELETE /admin/media`) d'`ARCHITECTURE.md`, section 6 (research, R1).

## Envoi : corps `multipart/form-data`

| Champ | Obligatoire | Règle |
|---|---|---|
| `image` | oui (envoi, remplacement) | Un seul fichier ; JPEG, PNG ou WebP constaté sur le contenu ; de 1 à 5 242 880 octets |
| `alt` | oui | De 1 à 300 caractères après épuration |
| `caption` | non | 300 au plus ; vide → absent |
| `credit` | non | 120 au plus ; vide → absent |
| `focus` | non | `"NN% NN%"`, valeurs de 0 à 100 ; absent → `"50% 50%"` |

Erreurs propres à l'envoi :

| Situation | Code | Message |
|---|---|---|
| Fichier de plus de 5 242 880 octets | `413` | message du socle |
| Contenu ni JPEG, ni PNG, ni WebP | `415` | « Format d'image non accepté : JPEG, PNG ou WebP. » |
| Aucun fichier, fichier vide, plusieurs fichiers ou mauvais champ | `400` | `details: [{ field: "image", message: "Une image est attendue, dans le champ « image »." }]` |
| Champ texte invalide | `400` | `details` par champ (data-model) |
| Contenu introuvable | `404` | « Ressource introuvable. » (rien n'est déposé) |
| 20 photographies déjà présentes | `409` | « Ce contenu a déjà 20 photographies. » (rien n'est déposé) |
| Stockage indisponible | `503` | « Service indisponible. » |

L'ordre des contrôles est le suivant :
1. réception, avec la limite de poids ;
2. validation des champs ;
3. existence du contenu et limite de 20 ;
4. type du fichier ;
5. dépôt ;
6. écriture.

Si l'écriture échoue après le dépôt, le fichier est retiré.

## Membres : portrait

| Méthode et adresse | Corps | Réponse |
|---|---|---|
| `PUT /admin/members/:id/portrait` | multipart (ci-dessus) | `200` : le membre en détail d'administration (forme de `GET /admin/members/:id`), avec `portrait`. L'ancien fichier éventuel est retiré après l'écriture |
| `PATCH /admin/members/:id/portrait` | JSON `{ alt?, caption?, credit?, focus? }` (`caption` ou `credit` à `null` ou à `""` les retirent) | `200` : le membre en détail. `404` si le membre ou son portrait n'existe pas |
| `DELETE /admin/members/:id/portrait` | — | `200` : le membre en détail, avec `portrait: null`. `404` sans portrait. `503` si le stockage est indisponible, et rien n'est modifié |

## Actions et actualités : photographies

`<ressource>` vaut `actions` ou `news`.

| Méthode et adresse | Corps | Réponse |
|---|---|---|
| `POST /admin/<ressource>/:id/photos` | multipart | `201` : le contenu en détail d'administration, la nouvelle photographie en dernier |
| `PATCH /admin/<ressource>/:id/photos/:photoId` | JSON `{ alt?, caption?, credit?, focus? }` | `200` : le contenu en détail. `404` si le contenu ou la photographie n'existe pas |
| `DELETE /admin/<ressource>/:id/photos/:photoId` | — | `200` : le contenu en détail. `404`, ou `503` (rien n'est modifié) |
| `PUT /admin/<ressource>/:id/photos/order` | JSON `{ photoIds: string[] }`, exactement toutes les photographies du contenu, chacune une fois | `200` : le contenu en détail, dans le nouvel ordre. `400` si la liste n'est pas complète : « La liste doit contenir toutes les photographies, chacune une fois. » |

`:photoId` mal formé : `400` « Identifiant invalide. », comme pour les autres identifiants.

## Lectures

| Route | Champ ajouté | Forme |
|---|---|---|
| `GET /admin/members`, `GET /admin/members/:id` | `portrait` | `AdminImage \| null` |
| `GET /admin/actions`, `/admin/actions/:id`, `/admin/news`, `/admin/news/:id` | `photos` | `AdminImage[]` |
| `GET /members` (annuaire public) | `portrait` | `PublicImage`, absent sans portrait |
| `GET /actions`, `/actions/:slug`, `/news`, `/news/:slug` | `photos` | `PublicImage[]` |

- `AdminImage` = `{ id, url, width, height, alt, caption, credit, focus, name, mimeType, size }`.
- `PublicImage` = `{ url, width, height, alt, caption?, credit?, focus }`.
- `publicId` n'apparaît dans **aucune** réponse.

## Suppressions existantes

`DELETE /admin/members/:id`, `/admin/actions/:id` et `/admin/news/:id` retirent d'abord tous les fichiers du contenu. Un fichier déjà absent n'empêche rien. Si le stockage est indisponible : `503` « Service indisponible. », et le contenu est conservé.

## Limitation de fréquence

Aucune limite particulière : ce sont des routes d'administration, comme les autres écritures de l'administrateur.
