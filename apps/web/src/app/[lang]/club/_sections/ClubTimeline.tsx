import Link from "@/components/ui/LocalLink";
import { frenchLang, hasFrench, LangMark } from "@/components/ui/LangMark";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { actionPath } from "@/config/routes";
import { getContent } from "@/content";
import type { TimelineYear } from "@/data/timeline";
import styles from "./ClubTimeline.module.css";

/**
 * 04 : la frise des années, sur le champ encre (DESIGN.md, section 17). Un
 * filet vertical, l'année au trait en très grand dans la marge, la présidence
 * puis les actions marquantes. Sans carte ni vignette.
 */
export async function ClubTimeline({ years, number }: { years: TimelineYear[]; number: string }) {
  const content = await getContent();
  const { timeline } = content.club;
  const { areas } = content.home.focusAreas;
  if (years.length === 0) return null;

  return (
    <section className={styles.field} aria-labelledby="club-frise">
      <div className={`container grid ${styles.layout}`}>
        <div className={styles.head}>
          <SectionLabel number={number}>{timeline.label}</SectionLabel>
          <h2 id="club-frise" className={styles.title}>
            {timeline.title}
          </h2>
          <p className={styles.intro}>{timeline.intro}</p>
        </div>

        <ol className={styles.years}>
          {years.map(({ year, presidents, actions }) => (
            <li key={year} className={styles.year}>
              {/* Le chiffre au trait est décoratif ; le titre lisible le double. */}
              <span className={styles.yearName} aria-hidden="true">
                {year}
              </span>
              <div className={styles.mandate}>
                <h3 className={styles.hidden}>{timeline.yearTitle(year)}</h3>
                {presidents.length > 0 ? (
                  <div>
                    <p className={`label ${styles.role}`}>
                      {timeline.presidency(presidents.length)}
                    </p>
                    <ul className={styles.presidents}>
                      {presidents.map((president) => (
                        <li key={president.id}>
                          {president.firstName} {president.lastName}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {actions.length > 0 ? (
                  <div>
                    <p className={`label ${styles.role}`}>{timeline.actionsLabel}</p>
                    <ul className={styles.actions}>
                      {actions.map((action) => {
                        const names = areas
                          .filter((area) => action.focusAreas.includes(area.id))
                          .map((area) => area.title);
                        return (
                          <li key={action.id} className={styles.action}>
                            <Link href={actionPath(action.slug)} className={styles.link}>
                              <span lang={frenchLang(action.french?.title)}>{action.title}</span>
                              <svg
                                className={styles.arrow}
                                viewBox="0 0 20 20"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                aria-hidden="true"
                              >
                                <path d="M3 10h14M11.5 4.5 17 10l-5.5 5.5" />
                              </svg>
                            </Link>
                            {names.length > 0 ? (
                              <span className={`meta ${styles.areas}`}>{names.join(" · ")}</span>
                            ) : null}
                            {hasFrench(action.french) ? <LangMark show /> : null}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
