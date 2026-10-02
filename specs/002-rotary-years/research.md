# Research: Années Rotary (RotaryYear)

Phase 0 du plan. Chaque décision répond à une exigence de la [spec](./spec.md) et reste dans le cadre d'`ARCHITECTURE.md`. Aucune inconnue ne subsiste. Seul le temps 1 est planifié ; les décisions 7 et 8 préparent le temps 2 sans rien mettre en œuvre.

## 1. Schéma et collection

- **Decision** : un schéma Mongoose `RotaryYear` avec un seul champ métier, `startYear` (nombre, obligatoire), et l'option `timestamps` pour `createdAt` et `updatedAt`. Le modèle s'appelle `RotaryYear` ; Mongoose en déduit la collection `rotaryyears`, nom prévu par `ARCHITECTURE.md`, section 3.
- **Rationale** : FR-001, FR-003. Rien d'autre n'est enregistré : ni label, ni dates de l'année, ni indicateur courant.
- **Alternatives considered** : stocker le label pour s'en servir comme clé, écarté par la décision 14 de l'architecture (label calculé).

## 2. Unicité de l'année de début

- **Decision** : index unique sur `startYear`, déclaré dans le schéma et créé par Mongoose au démarrage de l'API (comportement par défaut, `autoIndex`).
- **Rationale** : FR-002 demande que la garantie tienne sans dépendre d'une route, et pour deux enregistrements simultanés. Seule la base peut l'assurer : une vérification « existe déjà ? » avant l'écriture laisserait passer deux demandes concurrentes.
- **Conséquence** : la collection `rotaryyears` est créée, vide, avec son index, au premier démarrage. Aucun document n'y est écrit par le code (FR-004).
- **Alternatives considered** : créer l'index à la main dans Atlas, écarté car l'index fait partie du modèle et doit suivre le code ; une vérification applicative seule, écartée car elle ne protège pas d'une course.

## 3. Calcul du label, des dates et du caractère courant

- **Decision** : trois fonctions pures dans `apps/api/src/common/utils/rotary-year.ts` : le label à partir de l'année de début ; les deux bornes (1er juillet de l'année à 00:00:00.000 UTC, 30 juin de l'année suivante à 23:59:59.999 UTC, soit une milliseconde avant le 1er juillet suivant) ; le caractère courant, pour un instant donné en paramètre, bornes incluses.
- **Rationale** : FR-005 à FR-008. L'instant est un paramètre, pas lu dans la fonction : le calcul est vérifiable à la main pour n'importe quelle date, y compris les deux bornes, sans changer l'horloge du poste. `ARCHITECTURE.md`, section 5, prévoit cet emplacement ; les listes filtrées par `year=2026-2027` s'en serviront.
- **Alternatives considered** : des propriétés virtuelles Mongoose, écartées car `isCurrent` dépend de l'instant de la demande, pas du document, et parce qu'une sortie construite explicitement est plus lisible ; une bibliothèque de dates, écartée car trois calculs en UTC n'en demandent pas.

## 4. Mise en forme de la réponse

- **Decision** : le service lit les documents et construit pour chacun `{ id, startYear, label, startDate, endDate, isCurrent }`. `id` est l'identifiant du document en chaîne. Un seul instant est pris au début de la requête et sert à toutes les années.
- **Rationale** : FR-011, exemple d'`ARCHITECTURE.md`, section 13. Un instant unique garantit qu'au plus une année est courante dans une même réponse (SC-003). `createdAt` et `updatedAt` ne sont pas exposés.
- **Alternatives considered** : renvoyer le document Mongoose tel quel, écarté car il exposerait `_id`, `__v` et les dates techniques.

## 5. Liste publique

- **Decision** : `GET /api/v1/rotary-years`, dans un contrôleur public `rotary-years.public.controller.ts`. Toutes les années, triées par `startYear` décroissant, dans l'enveloppe `{ "data": [...] }`. Aucun paramètre.
- **Rationale** : FR-010, FR-012, FR-013 ; `ARCHITECTURE.md`, sections 6, 9 et 10. Trier par `startYear` décroissant donne le même ordre que le tri `-startDate` de l'architecture, sur un champ qui existe en base et qui est indexé. Une collection vide donne `{ "data": [] }` sans cas particulier.
- **Alternatives considered** : paginer, écarté par l'architecture (une année par an).

## 6. Erreurs et base injoignable

- **Decision** : aucun traitement d'erreur propre à la fonctionnalité. Une erreur de lecture remonte au filtre du socle : `500` générique, journalisée par son type sans son message.
- **Rationale** : FR-026. Le socle couvre déjà ce cas ; le temps 1 n'a aucune erreur métier.
- **Limite connue** : quand la base se coupe en cours de fonctionnement, Mongoose met les lectures en attente une dizaine de secondes avant d'échouer. La réponse d'erreur arrive donc après ce délai. Ce comportement vient du réglage par défaut de Mongoose, que ce plan ne modifie pas : il touche toute l'API, pas cette ressource.
- **Alternatives considered** : vérifier l'état de la connexion avant chaque lecture, écarté car ce serait dupliquer la route de santé dans chaque service.

## 7. Validation de `startYear` (temps 2, non mise en œuvre ici)

- **Decision** : au temps 2, un DTO de création avec « entier » et bornes 2000 à 2100. Le pipe de validation du socle n'active pas la conversion implicite des types : un texte `"2026"` reste un texte et est refusé, comme le demande la spec (FR-017). Les champs inconnus sont déjà refusés par le socle (FR-018).
- **Rationale** : vérifié dans `apps/api/src/common/pipes/validation.pipe.ts` : `transform` est actif, la conversion implicite ne l'est pas. Aucun changement du socle n'est nécessaire.
- **Message** : « L'année de début doit être un entier entre 2000 et 2100. », un seul texte pour toutes les valeurs invalides de `startYear`.
- **Pas de règle dans le schéma** : les bornes ne sont pas répétées dans le schéma Mongoose. Elles vivent dans le DTO, seul point d'entrée prévu.

## 8. Doublon et suppression (temps 2, non mis en œuvre ici)

- **Decision** : à la création, l'erreur de clé dupliquée de la base est convertie en `409` « Cette année Rotary existe déjà. ». La suppression répond `204` ; le refus d'une année référencée est ajouté par chaque fonctionnalité qui introduit une référence.
- **Rationale** : FR-019, FR-022 à FR-024. S'appuyer sur l'erreur de l'index, et non sur une lecture préalable, couvre aussi les demandes simultanées.

## 9. Dépendances

- **Decision** : aucune installation.
- **Rationale** : tout ce qui sert au temps 1 a été installé par le socle.
