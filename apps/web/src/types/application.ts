/** Situation déclarée par la personne qui candidate. */
export type ApplicantStatus = "etudiant" | "professionnel";

/** Candidature au club, telle que le formulaire la transmet à l'API. */
export interface MembershipApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  applicantStatus: ApplicantStatus;
  /** Le CV, en fichier : PDF ou Word, 5 Mo au plus. */
  cv: File;
}

export type ApplicationField = keyof MembershipApplication;
