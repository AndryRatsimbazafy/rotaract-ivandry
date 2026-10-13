// Les six questions fréquentes de la page « Nous rejoindre ». Liste fermée,
// identique aux id de apps/web/src/content/join.ts ; les intitulés restent dans
// le code du Front Office.
export enum FaqQuestion {
  Qui = 'qui',
  Rencontre = 'rencontre',
  Sympathisant = 'sympathisant',
  Avant = 'avant',
  Membre = 'membre',
  Frequence = 'frequence',
}

// Questions dont le Front Office affiche déjà une réponse : elles ne se vident
// pas.
export const REQUIRED_FAQ_QUESTIONS: readonly FaqQuestion[] = [
  FaqQuestion.Rencontre,
  FaqQuestion.Sympathisant,
  FaqQuestion.Avant,
  FaqQuestion.Membre,
];
