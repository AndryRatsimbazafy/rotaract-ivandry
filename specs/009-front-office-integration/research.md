# Research : intégration du Front Office avec l'API

Constats faits le 2026-10-02 sur `apps/web`, sur `apps/api` et sur la documentation embarquée de Next.js 16 (`apps/web/node_modules/next/dist/docs/`). Aucun point « NEEDS CLARIFICATION » ne subsiste.

## R1. État de `apps/web`

- Next.js 16.3.8, React 19.2.8, TypeScript 5 strict, CSS Modules et tokens ; **aucune autre dépendance**. `next.config.ts` est vide. Aucun appel réseau, aucune variable d'environnement, aucun `loading.tsx` ni `error.tsx`.
- Cinq routes : `/`, `/actions`, `/actualites`, `/membres`, `/rejoindre`. Les trois pages de liste lisent `searchParams` (`annee`, `domaine`, `rubrique`) : elles sont rendues à la demande. L'accueil et la page Rejoindre sont statiques.
- Les pages n'accèdent aux données que par `src/data/*`, dont toutes les fonctions sont déjà asynchrones. `ApplicationForm.tsx` est le seul Client Component qui appelle la couche de données.
- `.gitignore` de l'application ignore `.env*` : il faut une exception pour `.env.example`, comme dans `apps/admin`.
- Le détail d'une action ou d'une actualité est un bloc `<details>` dans la liste ; il n'existe ni fenêtre modale ni page de détail.

## R2. Formes publiques réelles de l'API

Relevées dans les contrats 002 à 007 et dans les services de `apps/api`.

| Opération | Forme | Écart avec les types du Front Office |
|---|---|---|
| `GET /rotary-years` | `{ data: [{ id, startYear, label, startDate, endDate, isCurrent }] }` | Le site n'a qu'un libellé ; l'année en cours y est une constante |
| `GET /members?year=&limit=` | `{ data: [{ id, firstName, lastName, occupation?, rotaryYear, roles, order }] }` | Le site attend `mandates[]` et `isDemo` ; fonctions cherchées dans les mandats |
| `GET /members/years` | `{ data: [année…] }` | — |
| `GET /actions?year=&focusArea=&page=&limit=` | `{ data: [{ id, slug, title, summary?, description?, date, rotaryYear, focusAreas, impact? }], meta }` | `focusArea` au singulier ; ni `description` ni `date` ; `photos` attendu |
| `GET /actions/years` | `{ data: [année…] }` | — |
| `GET /news?year=&type=&page=&limit=` | `{ data: [{ id, slug, title, type, date, rotaryYear, location?, summary?, content? }], meta }` | `body: string[]` attendu ; année déduite de la date ; `photos` attendu |
| `GET /news/archives` | `{ data: [{ rotaryYear: année, count }] }` | Calcul local aujourd'hui |
| `POST /applications` | `multipart/form-data` → `201 { received: true }` | `status` au lieu de `applicantStatus` ; rien n'est envoyé |

Constats utiles : un champ facultatif vide est **absent** de la réponse publique (jamais `null`) ; `rotaryYear` est un libellé ; `limit` vaut 20 par défaut et 100 au plus ; l'ordre public des actions place d'abord celles qui ont un ordre ; aucune réponse ne porte de photographie, d'email ni de téléphone. Les identifiants des sept domaines et les valeurs des dix fonctions et des cinq types sont identiques des deux côtés.

**Aucune incompatibilité bloquante.** Aucune modification de l'API n'est nécessaire.

## R3. Cache et revalidation dans Next.js 16

- **Décision** : `fetch` avec une revalidation par durée réglée à 60 (secondes). C'est le mécanisme prévu par `ARCHITECTURE.md`, section 10, et le modèle de cache par défaut de Next.js 16 (les « Cache Components » ne sont pas activés dans ce dépôt). L'objectif de fraîcheur est d'environ 60 secondes, **sans garantie à la seconde près**.
- Par défaut, `fetch` n'est pas mis en cache ; l'option le rend explicite. Le cache de données s'applique aussi aux pages rendues à la demande : une page à filtres réutilise l'entrée de son adresse d'API.
- La revalidation par durée suit le modèle « périmé pendant la relecture » : une fois l'entrée périmée, la visite suivante reçoit encore l'ancienne réponse et déclenche la relecture ; la suivante voit le nouveau contenu. D'où la tolérance de 90 secondes de SC-013. La documentation le décrit ainsi pour les pages comme pour les données.
- **Seules les réponses `200` sont enregistrées.** Si une relecture échoue, la dernière réponse correcte continue d'être servie, et une nouvelle tentative a lieu à la visite suivante. C'est ce qui porte l'intention : une revalidation qui échoue ne remplace pas volontairement par un état vide un contenu déjà correctement mis en cache. Chaque page d'une liste longue ayant sa propre entrée, cela vaut page par page ; une page jamais lue qui échoue rend la liste incomplète, ce que le site signale (plan, B4).
- Limites : cache local au serveur, vidé par un build ou un redéploiement, non partagé entre instances. En `next dev`, un cache de rechargement à chaud modifie ces comportements : la fraîcheur et l'indisponibilité se vérifient sur `next build` puis `next start`.
- **Alternatives écartées** : `cache: 'no-store'` (chaque visite appellerait l'API, contraire à Q1) ; invalidation à la demande depuis le Back Office (`revalidateTag`), que l'architecture réserve à plus tard et qui demanderait de modifier `apps/admin`.

## R4. Envoi du CV par une Server Action

- La taille du corps d'une Server Action est limitée à **1 Mo par défaut**. `experimental.serverActions.bodySizeLimit` la règle ; la limite porte sur le corps HTTP brut, habillage `multipart` compris (10 à 20 Ko de plus pour un envoi courant).
- **Décision** : `6mb`. Un fichier de 5 242 880 octets passe ; un fichier légèrement plus gros atteint l'API, qui répond `413` — l'API reste l'autorité sur la limite. Au-delà de 6 Mo, la Server Action échoue avant l'API ; le contrôle de taille du formulaire l'évite dans le cas normal, et l'échec est rendu par le message d'indisponibilité.
- `proxyClientMaxBodySize` (10 Mo par défaut) ne concerne que les applications qui ont un `proxy.ts` ; `apps/web` n'en a pas.
- `fetch` de Node 22 envoie un `FormData` en `multipart/form-data` et écrit lui-même l'en-tête avec sa frontière ; un `File` y garde son nom et son contenu.
- **Non constaté dans ce dépôt** : le passage effectif de 5 Mo. Il doit être réellement vérifié avant que le dépôt soit considéré comme terminé. **Décision du 2026-10-02** : aucun repli automatique ; en cas d'échec, signalement et arrêt pour validation.
- À connaître pour un futur déploiement (hors périmètre) : certains hébergeurs limitent le corps d'une requête à environ 4,5 Mo (`ARCHITECTURE.md`, section 11) ; un CV proche de 5 Mo n'y passerait pas par ce chemin.
- **Alternative hors plan** : un gestionnaire de route qui relaie le flux de la requête. Il éviterait la limite et la mise en mémoire, mais s'écarte de la décision d'architecture ; il n'est ni prévu ni applicable sans validation du porteur du projet.

## R5. Fuseau des actualités

- Madagascar : UTC+3 toute l'année. `Intl.DateTimeFormat` avec `timeZone: 'Indian/Antananarivo'`, sans bibliothèque.
- `src/lib/dates.ts` formate aujourd'hui en temps universel, avec ce commentaire : éviter qu'une date change de jour selon le serveur. Le passage à un fuseau **nommé** garde cette propriété : le résultat ne dépend ni du serveur ni du visiteur.
- `formatDay` et `formatMonthYear` ne servent qu'aux actualités. `formatFullDate` n'a aucun appelant.
- Les dates d'une action ne sont pas affichées ; aucune autre date du site n'est concernée.

## R6. Année Rotary en cours

- L'API calcule `isCurrent` à la lecture ; aucune année n'est créée d'avance. Sans année en cours, `GET /members` sans paramètre renvoie une liste vide.
- **Décision** : l'année en cours vient de `GET /rotary-years` ; à défaut, le libellé est calculé par `rotaryYearOf` à partir de la date du jour, ce qui est un fait de calendrier et non un contenu. Écart possible de trois heures autour du 1er juillet entre ce calcul (temps universel) et l'heure de Madagascar : sans conséquence, l'API bornant ses années de la même façon.

## R7. Ce qui est retiré

- Registre d'impact : cinq indicateurs en dur, tous sans valeur, affichés « Donnée à venir ». Aucune opération de l'API ne fournit de cumul.
- Profils de démonstration : sept profils « Profil 01 » à « Profil 07 », exclus de l'accueil, marqués par un style et une mention.
- Constante `currentRotaryYear = "2026-2027"`.
- Issue « non relié » du formulaire.

## R8. Simplicité

- Pas de client d'API générique, pas de couche de cache maison, pas de schéma de validation des réponses : une fonction de lecture, et des conversions explicites dans chaque fichier de données.
- Les composants gardent leurs propriétés actuelles autant que possible : la couche de données fournit `photos: []` et `body` (paragraphes), ce qui évite de toucher aux cadres photographiques et au texte dépliable.
- Aucune dépendance ajoutée.
