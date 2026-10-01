import { PhotoFrame } from "@/components/media/PhotoFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { routes } from "@/config/routes";
import { pendingLabel } from "@/content/common";
import { membersPreview } from "@/content/home";
import { memberRoleLabels } from "@/content/members";
import { rolesForYear } from "@/data/members";
import type { Member } from "@/types/member";
import type { RotaryYear } from "@/types/rotary-year";
import styles from "./MembersPreview.module.css";

const SLOTS = 4;

interface MemberLine {
  key: string;
  name: string;
  /** Un membre peut avoir plusieurs fonctions la même année, ou aucune. */
  roles: string[];
}

function placeholderLines(): MemberLine[] {
  return Array.from({ length: SLOTS }, (_, index) => ({
    key: `emplacement-${index}`,
    name: membersPreview.placeholder.name,
    roles: [membersPreview.placeholder.roles],
  }));
}

interface MembersPreviewProps {
  members: Member[];
  rotaryYear: RotaryYear;
}

export function MembersPreview({ members, rotaryYear }: MembersPreviewProps) {
  const isPending = members.length === 0;
  const lines: MemberLine[] = isPending
    ? placeholderLines()
    : members.map((member) => ({
        key: member.id,
        name: `${member.firstName} ${member.lastName}`,
        roles: rolesForYear(member, rotaryYear).map(
          (role) => memberRoleLabels[role],
        ),
      }));
  const portraits = members
    .map((member) => member.portrait)
    .filter((portrait) => portrait !== undefined);

  return (
    <section
      id="membres"
      className={styles.section}
      aria-labelledby="membres-titre"
    >
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={membersPreview.number}>
            {membersPreview.label}
          </SectionLabel>
          <h2 id="membres-titre" className={styles.title}>
            {membersPreview.title}
          </h2>
          <p className={`meta ${styles.year}`}>
            {membersPreview.yearLabel} {rotaryYear}
          </p>
          {isPending ? (
            <p className={`meta ${styles.note}`}>{pendingLabel}</p>
          ) : null}
        </div>

        <ul
          className={
            isPending ? `${styles.members} ${styles.pending}` : styles.members
          }
        >
          {lines.map((line) => (
            <li key={line.key} className={styles.member}>
              <p className={styles.name}>{line.name}</p>
              {line.roles.length > 0 ? (
                <ul className={`label ${styles.roles}`}>
                  {line.roles.map((role) => (
                    <li key={role}>{role}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>

        <p className={styles.all}>
          <ArrowLink href={routes.members}>{membersPreview.allLink}</ArrowLink>
        </p>

        {/* Deux portraits verticaux qui se chevauchent, sur une bande bleue. */}
        <div className={styles.portraits}>
          <div className={styles.portraitMain}>
            <PhotoFrame
              photo={portraits[0]}
              brief={membersPreview.portraitBrief}
              format="4:5"
              sizes="(min-width: 1024px) 26vw, 60vw"
              className={styles.frame}
            />
          </div>
          <div className={styles.portraitSecond}>
            <PhotoFrame
              photo={portraits[1]}
              brief={membersPreview.portraitBrief}
              format="4:5"
              sizes="(min-width: 1024px) 16vw, 36vw"
              tone="dark"
              className={styles.frame}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
