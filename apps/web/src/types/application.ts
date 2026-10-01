/** Statut déclaré par la personne qui candidate. */
export type ApplicantStatus = "etudiant" | "professionnel";

/** Candidature au club, telle que le formulaire la transmettra à l'API. */
export interface MembershipApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: ApplicantStatus;
  /** Le CV, en fichier. Son stockage n'est pas encore décidé. */
  cv: File;
}

export type ApplicationField = keyof MembershipApplication;
