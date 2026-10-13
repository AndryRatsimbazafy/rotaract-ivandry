# Contrat API : traductions anglaises

Préfixe `/api/v1`. Aucune route nouvelle ; les corps et les réponses existants gagnent des champs facultatifs. Format d'erreur commun (`ARCHITECTURE.md`, section 10, « Erreurs »).

## Lectures

`GET /actions`, `/actions/:slug`, `/admin/actions`, `/admin/actions/:id` : chaque action gagne, si elle existe :

```json
"en": {
  "title": "Water distribution in Ambohimanarina",
  "summary": "…",
  "description": "…",
  "impact": { "beneficiaries": "120 households" }
}
```

`GET /news`, `/news/:slug`, `/admin/news`, `/admin/news/:id` : `en` avec `title`, `summary`, `content`, `location`.

`GET /site-settings`, `/admin/site-settings` : `en` avec `club` (`sponsorClub`, `meetingPlace`, `meetingRhythm`) et `faq`.

Toute image (portrait, photographies, emplacements du site), en lecture publique comme d'administration : `altEn`, `captionEn` s'ils existent.

## Écritures

| Route | Champs ajoutés | `null` |
|---|---|---|
| `POST /admin/actions`, `PATCH /admin/actions/:id` | `en: { title, summary, description, impact: { objective, beneficiaries, location, period, results } }` | retire le champ ; `en: null` retire toute la traduction |
| `POST /admin/news`, `PATCH /admin/news/:id` | `en: { title, summary, content, location }` | idem |
| `PATCH /admin/site-settings` | `en: { club: { sponsorClub, meetingPlace, meetingRhythm }, faq: { <question> } }` | retire le champ |
| Envoi d'une image (multipart : portrait, photographies, emplacements) | `altEn`, `captionEn` (champs de formulaire) | — (vide = absent) |
| `PATCH` d'une image | `altEn`, `captionEn` | retire le champ |

Actions et actualités : l'objet `en` est remplacé en entier, comme l'impact ; ses champs vides sont retirés, et un objet vide ou `null` retire la traduction. Réglages du site et images : une clé absente ne change rien ; présente, elle est écrite (`$set` du chemin pointé) ; `null` ou chaîne vide après retrait des espaces la retire (`$unset`). (Ajusté à l'implémentation, 2026-10-13.)

## Validation

Mêmes limites que les champs français (`data-model.md`). Messages, sur le modèle des messages français existants, avec « (anglais) » : par exemple « Le titre (anglais) compte 120 caractères au plus. ». `details[].field` : chemin pointé (`en.title`, `en.impact.results`, `altEn`).

## Ce qui ne change pas

Slugs, recherche `q`, filtres, tri, pagination, codes de statut.
