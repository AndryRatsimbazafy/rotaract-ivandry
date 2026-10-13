# Contrat API : réglages du site

Préfixe `/api/v1`. Format d'erreur commun de l'API (`ARCHITECTURE.md`, section 10, « Erreurs »). Formes des images : `AdminImage` et `PublicImage` de [specs/011-image-storage/contracts/api-images.md](../../011-image-storage/contracts/api-images.md).

## Lecture publique

### `GET /site-settings`

Public, sans authentification. `200` :

```json
{
  "social": { "facebook": "https://www.facebook.com/rotaractivandry" },
  "club": { "foundedYear": 2012, "memberCount": 24 },
  "faq": { "frequence": "Le club se réunit deux fois par mois." },
  "photos": {
    "accueil-club": {
      "url": "https://res.cloudinary.com/…/site/pages/abc.webp",
      "width": 1600, "height": 2000,
      "alt": "Des membres autour d'une table pendant une réunion.",
      "caption": "Réunion statutaire, mars 2026.",
      "focus": "50% 35%"
    }
  }
}
```

- Les quatre clés `social`, `club`, `faq`, `photos` sont toujours présentes, en objets éventuellement vides ; à l'intérieur, seuls les champs renseignés figurent.
- Document absent : `{ "social": {}, "club": {}, "faq": {}, "photos": {} }`.

## Administration

Toutes les routes : `JwtAuthGuard` + `RolesGuard`, rôle `ADMIN`, posés sur la classe du contrôleur. `401` sans jeton valide, `403` sans le rôle.

### `GET /admin/site-settings`

`200` : `AdminSiteSettingsView` ([data-model.md](../data-model.md)), mêmes clés que la lecture publique, images en `AdminImage`, plus `updatedAt` (ISO 8601 ou `null`).

### `PATCH /admin/site-settings`

Corps JSON, partiel. Chaque clé présente est écrite ; une valeur `null` vide le champ ; une clé absente ne change rien. Les espaces de bord sont retirés ; une chaîne vide après retrait est traitée comme `null`.

```json
{
  "social": { "facebook": "https://www.facebook.com/rotaractivandry", "instagram": null },
  "club": { "foundedYear": 2012, "sponsorClub": "Rotary Club Antananarivo Ivandry" },
  "faq": { "frequence": "Deux fois par mois, le jeudi soir." }
}
```

| Champ | Règle | Message (`details[].message`) |
|---|---|---|
| `social.facebook` | `https://`, hôte `facebook.com`, `www.facebook.com`, `m.facebook.com` ou `fb.com`, ≤ 300 | « Indiquez l'adresse complète de la page Facebook du club, commençant par https://. » |
| `social.instagram` | `https://`, hôte `instagram.com` ou `www.instagram.com`, ≤ 300 | « Indiquez l'adresse complète du compte Instagram du club, commençant par https://. » |
| `club.foundedYear` | entier, 1968 à l'année en cours | « L'année de création est une année entre 1968 et l'année en cours. » |
| `club.sponsorClub` | ≤ 120 | « Le club parrain compte 120 caractères au plus. » |
| `club.memberCount` | entier, 1 à 999 | « Le nombre de membres est un entier de 1 à 999. » |
| `club.meetingPlace` | ≤ 160 | « Le lieu des réunions compte 160 caractères au plus. » |
| `club.meetingRhythm` | ≤ 160 | « Le rythme des réunions compte 160 caractères au plus. » |
| `faq.<question>` | ≤ 1000 | « La réponse compte 1000 caractères au plus. » |
| `faq.rencontre`, `faq.sympathisant`, `faq.avant`, `faq.membre` | non vide (`null` refusé) | « Cette question a besoin d'une réponse. » |
| clé inconnue | refusée (`forbidNonWhitelisted`) | message global de validation |

`field` dans `details` : le chemin pointé, par exemple `club.foundedYear`, `faq.frequence`.

Réponses : `200` avec la vue d'administration ; `400` validation.

### `PUT /admin/site-settings/photos/:slot`

`:slot` ∈ `SitePhotoSlot`, sinon `404`. Corps `multipart/form-data` : `image` (fichier), `alt`, `caption`, `credit`, `focus`, mêmes règles que l'ajout d'un portrait (011).

- Emplacement vide : l'image est enregistrée. Emplacement occupé : elle remplace l'ancienne, dont le fichier est retiré après l'écriture.
- `200` avec la vue d'administration.
- Erreurs : celles de 011 : `400` (fichier absent, texte alternatif), `413`, `415`, `503` « Service indisponible. ».

### `PATCH /admin/site-settings/photos/:slot`

Corps JSON : `alt`, `caption` (`null` retire), `credit` (`null` retire), `focus`, tous facultatifs (`UpdateImageFieldsDto` de 011). `200` avec la vue ; `404` si l'emplacement est vide ou inconnu.

### `DELETE /admin/site-settings/photos/:slot`

Retire le fichier, puis l'image. `200` avec la vue ; `404` si l'emplacement est vide ou inconnu ; `503` si le stockage ne répond pas (l'image reste).

## Ce qui n'est jamais renvoyé

`publicId` ; dans la lecture publique, `name`, `mimeType`, `size`, `id` des images et `updatedAt`.
