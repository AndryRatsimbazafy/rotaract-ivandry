import { PhotoFrame } from "@/components/media/PhotoFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { routes } from "@/config/routes";
import { memberRoleLabels, membersDirectory } from "@/content/members";
import type { Member } from "@/types/member";
import styles from "./MembersDirectory.module.css";

/** Trois niveaux de lecture : une personne, puis trois, puis les autres. */
const PLATE_SIZE = 3;

interface ProfileProps {
  member: Member;
  /** Niveau de titre du nom, selon la place du profil dans la page. */
  level: "lead" | "plate" | "line";
}

function Profile({ member, level }: ProfileProps) {
  // Les fonctions de l'année affichée sont fournies avec le membre.
  const roles = member.roles;
  const name = `${member.firstName} ${member.lastName}`;

  return (
    <article className={`${styles.profile} ${styles[level]}`}>
      <div className={styles.portrait}>
        <PhotoFrame
          photo={member.portrait}
          brief={membersDirectory.portraitBrief}
          format="4:5"
          sizes={
            level === "lead"
              ? "(min-width: 1024px) 42vw, 78vw"
              : level === "plate"
                ? "(min-width: 1024px) 30vw, 70vw"
                : "96px"
          }
          compact={level === "line"}
          className={styles.frame}
        />
      </div>
      <div className={styles.identity}>
        <h3 className={styles.name}>{name}</h3>
        {/* Une personne peut tenir plusieurs fonctions, ou aucune. */}
        {roles.length > 0 ? (
          <ul className={`label ${styles.roles}`}>
            {roles.map((role) => (
              <li key={role}>{memberRoleLabels[role]}</li>
            ))}
          </ul>
        ) : null}
        {member.occupation ? (
          <p className={styles.occupation}>{member.occupation}</p>
        ) : null}
      </div>
    </article>
  );
}

interface MembersDirectoryProps {
  members: Member[];
  year: string;
  /** L'année la plus récente qui a des membres, pour sortir d'une année vide. */
  latestYear: string;
}

export function MembersDirectory({
  members,
  year,
  latestYear,
}: MembersDirectoryProps) {
  const [lead, ...others] = members;
  const plate = others.slice(0, PLATE_SIZE);
  const lines = others.slice(PLATE_SIZE);

  return (
    <section
      id="annuaire"
      className={styles.sheet}
      aria-labelledby="annuaire-titre"
    >
      <div className="container">
        <div className={styles.head}>
          <SectionLabel number={membersDirectory.number}>
            {membersDirectory.label}
          </SectionLabel>
          {/* L'année, tracée au trait : le mandat que l'on consulte. */}
          <h2 id="annuaire-titre" className={styles.title}>
            <span className={`label ${styles.titleLabel}`}>
              {membersDirectory.yearLabel}
            </span>{" "}
            <span className={styles.year}>{year}</span>
          </h2>
          {members.length > 0 ? (
            <p className={`meta ${styles.count}`}>
              {members.length}{" "}
              {members.length > 1
                ? membersDirectory.countMany
                : membersDirectory.countOne}
            </p>
          ) : null}
        </div>

        {!lead ? (
          <div className={styles.empty}>
            <p className={styles.emptyText}>
              {membersDirectory.emptyBefore} {year}{" "}
              {membersDirectory.emptyAfter}
            </p>
            {year === latestYear ? null : (
              <ArrowLink href={`${routes.members}?annee=${latestYear}#annuaire`}>
                {membersDirectory.backToCurrent}
              </ArrowLink>
            )}
          </div>
        ) : (
          <>
            <div className="grid">
              <Profile member={lead} level="lead" />
            </div>

            {plate.length > 0 ? (
              <ul className={`grid ${styles.plateList}`}>
                {plate.map((member) => (
                  <li key={member.id} className={styles.plateItem}>
                    <Profile member={member} level="plate" />
                  </li>
                ))}
              </ul>
            ) : null}

            {lines.length > 0 ? (
              <ul className={styles.lineList}>
                {lines.map((member) => (
                  <li key={member.id} className={styles.lineItem}>
                    <Profile member={member} level="line" />
                  </li>
                ))}
              </ul>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
