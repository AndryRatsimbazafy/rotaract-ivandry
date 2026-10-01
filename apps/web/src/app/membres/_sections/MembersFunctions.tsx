import { SectionLabel } from "@/components/ui/SectionLabel";
import { memberRoleLabels, membersFunctions } from "@/content/members";
import { rolesForYear } from "@/data/members";
import type { Member, MemberRole } from "@/types/member";
import styles from "./MembersFunctions.module.css";

const roles = Object.keys(memberRoleLabels) as MemberRole[];

interface MembersFunctionsProps {
  members: Member[];
  year: string;
}

/** L'index inverse de l'annuaire : pour chaque fonction, qui la tient. */
export function MembersFunctions({ members, year }: MembersFunctionsProps) {
  return (
    <section className={styles.field} aria-labelledby="fonctions-titre">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={membersFunctions.number}>
            {membersFunctions.label}
          </SectionLabel>
          <h2 id="fonctions-titre" className={styles.title}>
            {membersFunctions.title}
          </h2>
          <p className={styles.intro}>{membersFunctions.intro}</p>
        </div>

        <dl className={styles.index}>
          {roles.map((role) => {
            const holders = members.filter((member) =>
              rolesForYear(member, year).includes(role),
            );

            return (
              <div key={role} className={styles.row}>
                <dt className={styles.role}>{memberRoleLabels[role]}</dt>
                {holders.length > 0 ? (
                  holders.map((member) => (
                    <dd key={member.id} className={styles.holder}>
                      {member.firstName} {member.lastName}
                    </dd>
                  ))
                ) : (
                  <dd className={`label ${styles.vacant}`}>
                    {membersFunctions.vacant}
                  </dd>
                )}
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
