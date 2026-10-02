# Research: Membres et mandats

Phase 0 du plan. Chaque décision répond à une exigence de la [spec](./spec.md) et reste dans le cadre d'`ARCHITECTURE.md`. Aucune inconnue ne subsiste ; les points soumis au porteur du projet ont été validés le 2026-10-02.

## 1. Modèle Member

- **Decision** : schéma Mongoose `Member`, option `timestamps`, collection `members`. Champs : `firstName` et `lastName` (obligatoires, sans espaces autour), `occupation`, `email` (en minuscules), `phone` (facultatifs). Index `(lastName, firstName)` et index texte sur `firstName`, `lastName`.
- **Rationale** : `ARCHITECTURE.md`, sections 1.2 et 3 ; FR-001 à FR-005. Pas de portrait (clarification Q1), pas de champ actif.
- **Alternatives considered** : garder un champ `portrait` vide en attendant, écarté par la décision du porteur du projet.

## 2. Modèle MemberMandate

- **Decision** : schéma `MemberMandate`, option `timestamps`, collection `membermandates`. Champs : `member` (référence, obligatoire), `rotaryYear` (référence, obligatoire), `roles` (tableau de fonctions, vide par défaut), `order` (entier). Index uniques `(member, rotaryYear)` et `(rotaryYear, order)` ; index `(rotaryYear, roles)`.
- **Rationale** : sections 1.3 et 3 ; FR-006 à FR-011a. Les deux unicités doivent tenir pour des écritures simultanées : seule la base peut l'assurer.
- **Borne du schéma sur `order`** : le schéma n'impose pas « supérieur ou égal à 1 » : le réordonnancement passe par des valeurs négatives à l'intérieur de sa transaction. La règle « entier à partir de 1 » est tenue par la validation d'entrée et par le fait que le système calcule lui-même tous les ordres qu'il écrit.
- **Alternatives considered** : embarquer les mandats dans le membre, écarté par la décision 2 de l'architecture.

## 3. Les dix fonctions

- **Decision** : une énumération TypeScript `MemberRole` dans `common/enums/member-role.enum.ts`, avec les dix valeurs exactes de la section 1.3. Elle sert à la validation des DTO (« valeur de la liste », « sans doublon ») et à la contrainte `enum` du schéma.
- **Rationale** : FR-009 ; emplacement prévu par la section 5. Les libellés français restent au Front Office et au futur Back Office : l'API n'échange que les valeurs.
- **Alternatives considered** : une collection de fonctions, écartée : la liste est fermée et identique à celle du Front Office.

## 4. Ordre à la création

- **Decision** : le DTO de création n'a pas de champ `order` ; en envoyer un est refusé par le socle comme champ non prévu. Le service lit le plus grand ordre de l'année (par l'index) et écrit le suivant ; 1 si l'année n'a aucun mandat.
- **Concurrence** : deux créations simultanées dans la même année peuvent calculer le même ordre. L'index unique refuse la seconde ; le service recalcule et réessaie, trois fois au plus. Si l'erreur vient de l'index `(member, rotaryYear)`, il n'y a pas de nouvelle tentative : c'est un mandat en double, `409`.
- **Rationale** : FR-011b. Sans nouvelle tentative, une création légitime recevrait un `409` par simple coïncidence.
- **Alternatives considered** : un compteur par année dans le document de l'année, écarté car il ajouterait une donnée à RotaryYear, qui ne stocke que `startYear`.

## 5. Modification d'un mandat

- **Decision** : `PATCH` accepte `roles` et `order`, tous deux facultatifs. `member` et `rotaryYear` ne sont pas dans le DTO : les envoyer est refusé comme champ non prévu. Un ordre déjà pris fait échouer l'écriture sur l'index unique : `409`.
- **Rationale** : FR-011c, FR-012. Pas de lecture préalable « l'ordre est-il libre ? » : l'index tranche, y compris pour deux modifications simultanées.

## 6. Réordonnancement d'une année

- **Decision** : une transaction, ouverte par `Connection.transaction` de Mongoose, contenant dans l'ordre le contrôle complet de la liste, puis deux écritures : tous les ordres de l'année multipliés par −1, puis chaque mandat reçoit sa position dans la liste plus un. Détail dans [plan.md](./plan.md), section « Stratégie de réordonnancement ».
- **Rationale** : FR-018. Les valeurs négatives vident la zone des ordres positifs : la seconde écriture ne peut rencontrer aucun doublon. La transaction rend les deux écritures indissociables et invisibles tant qu'elles ne sont pas validées.
- **Disponibilité** : le cluster Atlas est un jeu de réplicas (constaté le 2026-10-02) ; les transactions y fonctionnent, y compris en offre gratuite. Rien à installer.
- **Validé** par le porteur du projet le 2026-10-02 : `ARCHITECTURE.md`, section 3, sera aligné (« une seule transaction, pour le réordonnancement »).
- **Comportement en cas d'échec, vérifié dans le code installé** (`mongodb` 7.6.0, `lib/sessions.js`, `withTransaction` ; `mongoose` 9.10.3, `lib/connection.js`, `transaction`) : une erreur levée par la fonction annule la transaction ; elle n'est suivie d'une nouvelle exécution de la fonction que si c'est une erreur de la base portant l'étiquette `TransientTransactionError` (conflit d'écriture, bascule), dans la limite d'un délai de 120 secondes par défaut ; toute autre erreur, dont un refus applicatif, est transmise sans nouvelle exécution. La nouvelle exécution n'a pas été observée, seulement lue : la fonctionnalité ne s'appuie que sur l'annulation.
- **Conséquence** : la fonction passée à la transaction refait le contrôle complet à chaque exécution et ne garde aucun état.
- **Alternatives considered** : les deux écritures sans transaction, écartées car un arrêt entre les deux laisse des ordres négatifs ; une vérification applicative de l'unicité sans index, écartée car elle ne protège pas d'écritures simultanées ; une seule écriture groupée, écartée car elle n'est pas indissociable et rencontre des doublons transitoires.

## 7. Références d'un mandat

- **Decision** : à la création, le service vérifie que le membre et l'année existent ; sinon `400`, avec le détail sur le champ en cause. Un identifiant mal formé dans le corps est aussi un `400` de validation.
- **Rationale** : FR-026 ; règle de la section 8, étendue par la spec.
- **Limite connue, acceptée pour la V1** (validé le 2026-10-02) : la vérification et l'écriture sont deux opérations. Un membre ou une année supprimé entre les deux laisserait un mandat orphelin. Avec un seul administrateur, le cas est théorique : pas de transaction supplémentaire, pas d'abstraction de concurrence.

## 8. Suppression d'un membre

- **Decision** : `404` si le membre n'existe pas ; sinon supprimer ses mandats, puis le membre. Réponse `204`.
- **Rationale** : FR-023 ; « dans le service » (section 1.3). L'ordre des deux suppressions compte : si l'API s'arrête entre les deux, il reste un membre sans mandat, état valide, et la suppression peut être relancée. L'ordre inverse laisserait des mandats orphelins.
- **Alternatives considered** : une transaction, écartée car l'ordre des opérations suffit.

## 9. Suppression d'une année Rotary

- **Decision** : `RotaryYearsService.remove` vérifie d'abord qu'aucun mandat ne référence l'année ; sinon `409` générique. Le module `rotary-years` déclare pour cela le modèle `MemberMandate`.
- **Rationale** : FR-025 ; FR-023 de `002-rotary-years`. Les fonctionnalités suivantes (actions, actualités) ajouteront leur propre vérification au même endroit.
- **Dépendance entre modules** : `members` lit les années, `rotary-years` lit les mandats. Chaque module déclare les modèles qu'il lit ; aucun n'importe l'autre, ce qui évite une dépendance circulaire.
- **Limite connue** : même fenêtre que la décision 7 entre la vérification et la suppression.

## 10. Liste paginée des membres

- **Decision** : `common/dto/pagination-query.dto.ts` porte `page` (entier, 1 au moins, défaut 1) et `limit` (entier de 1 à 100, défaut 20), convertis depuis le texte de l'adresse. `query-members.dto.ts` l'étend avec `q` (2 caractères au moins), `year` (label), `role` (une des dix valeurs) et `sort` (`lastName`, `-lastName`, `createdAt`, `-createdAt` ; défaut `lastName`). Réponse : `{ data, meta: { page, limit, total, totalPages } }`.
- **Filtres par année et par fonction** : ils portent sur les mandats. Le service en tire les identifiants des membres concernés, puis lit ces membres. Les deux filtres ensemble désignent les membres qui tiennent cette fonction cette année-là. Une année inconnue donne une liste vide.
- **Recherche** : index texte de MongoDB, mot entier, sans tolérance (section 3).
- **Rationale** : FR-014 ; section 9. Première liste paginée du projet : l'aide commune a un utilisateur immédiat.

## 11. Lecture d'un label d'année

- **Decision** : une fonction ajoutée à `common/utils/rotary-year.ts` : un label `AAAA-AAAA` de deux années consécutives donne son année de début ; toute autre chaîne est refusée. Elle sert aux filtres `year` de l'administration et de l'annuaire.
- **Rationale** : FR-020 ; règle de la section 8 (« label au format `AAAA-AAAA` avec deux années consécutives »). `specs/002-rotary-years` avait reporté cette conversion aux listes qui en auraient besoin.

## 12. Annuaire public

- **Decision** : `GET /members` lit l'année (label, ou année courante), puis les mandats de cette année triés par ordre, avec leur membre. Chaque élément : `id`, `firstName`, `lastName`, `occupation` s'il existe, `rotaryYear` (label), `roles`, `order`. `limit` : entier de 1 à 100, facultatif. Année inconnue ou absence d'année courante : `{ "data": [] }`. `GET /members/years` : les années distinctes référencées par les mandats, dans la forme et le tri de la liste des années.
- **Rationale** : FR-019 à FR-022. La forme de sortie publique est construite à part : elle ne peut pas contenir l'email ni le téléphone.

## 13. Formes de sortie

- **Decision** : trois formes construites explicitement par les services : membre public (annuaire), membre d'administration (liste, sans mandats), fiche d'administration (avec tous ses mandats, triés de l'année la plus récente à la plus ancienne). Un mandat d'administration porte `id`, `member`, `rotaryYear` (`id` et `label`), `roles`, `order`, `createdAt`, `updatedAt`.
- **Rationale** : exemples de la section 13 ; « deux formes de sortie » de la section 5.

## 14. Effacer un champ facultatif

- **Decision** (validée le 2026-10-02) : dans une modification de membre, envoyer `null` pour `occupation`, `email` ou `phone` efface le champ ; ne pas l'envoyer le laisse inchangé. Une chaîne vide `""` est refusée.
- **Rationale** : sans cela, une profession ou un téléphone saisi par erreur ne pourrait plus être retiré. Ni la spec ni l'architecture ne tranchent ce point.

## 15. Messages

- **Decision** : aucun message de conflit nouveau (FR-029a). Les messages de validation par champ sont ceux des contrats, validés le 2026-10-02 ; aucun autre n'est créé.

## 16. Dépendances

- **Decision** : aucune installation. Les DTO de modification sont écrits à la main, faute de `@nestjs/mapped-types`, plutôt que d'ajouter ce paquet pour deux classes.
