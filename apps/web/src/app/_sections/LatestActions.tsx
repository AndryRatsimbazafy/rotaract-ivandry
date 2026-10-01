import Link from "next/link";
import { PhotoFrame } from "@/components/media/PhotoFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { routes } from "@/config/routes";
import { pendingLabel } from "@/content/common";
import { latestActions } from "@/content/home";
import type { Action } from "@/types/action";
import type { Photo } from "@/types/media";
import styles from "./LatestActions.module.css";

/** Une grande action, puis une verticale et une horizontale. */
const SLOTS = [
  { format: "3:2", sizes: "(min-width: 1024px) 66vw, 100vw" },
  { format: "4:5", sizes: "(min-width: 1024px) 32vw, 100vw" },
  { format: "3:2", sizes: "(min-width: 1024px) 48vw, 100vw" },
];

interface ActionEntry {
  key: string;
  meta: string;
  title: string;
  summary?: string;
  impact?: string;
  photo?: Photo;
  href?: string;
}

function toEntry(action: Action): ActionEntry {
  const impact = action.impact;

  return {
    key: action.id,
    meta: `${latestActions.yearLabel} ${action.rotaryYear}`,
    title: action.title,
    summary: action.summary,
    impact: impact?.results ?? impact?.beneficiaries ?? impact?.objective,
    photo: action.photos[0],
    // La page de détail d'une action n'existe pas encore.
    href: routes.actions,
  };
}

function placeholderEntries(): ActionEntry[] {
  return SLOTS.map((_, index) => ({
    key: `emplacement-${index}`,
    ...latestActions.placeholder,
  }));
}

interface LatestActionsProps {
  actions: Action[];
}

export function LatestActions({ actions }: LatestActionsProps) {
  const isPending = actions.length === 0;
  const entries = isPending ? placeholderEntries() : actions.map(toEntry);

  return (
    <section
      id="actions"
      className={styles.section}
      aria-labelledby="actions-titre"
    >
      <div className="container">
        <div className={styles.head}>
          <div>
            <SectionLabel number={latestActions.number}>
              {latestActions.label}
            </SectionLabel>
            <h2 id="actions-titre" className={styles.title}>
              {latestActions.title}
            </h2>
            {isPending ? (
              <p className={`meta ${styles.note}`}>{pendingLabel}</p>
            ) : null}
          </div>
          <p>
            <ArrowLink href={routes.actions}>{latestActions.allLink}</ArrowLink>
          </p>
        </div>

        <div
          className={
            isPending ? `grid ${styles.entries} ${styles.pending}` : `grid ${styles.entries}`
          }
        >
          {entries.slice(0, SLOTS.length).map((entry, index) => (
            <article key={entry.key} className={styles.entry}>
              <div className={styles.media}>
                <PhotoFrame
                  photo={entry.photo}
                  brief={latestActions.photoBrief}
                  format={SLOTS[index].format}
                  sizes={SLOTS[index].sizes}
                  className={styles.frame}
                />
              </div>
              <div className={styles.text}>
                <p className={`meta ${styles.meta}`}>
                  {entry.meta}
                </p>
                <h3 className={styles.name}>
                  {entry.href ? (
                    <Link href={entry.href} className={styles.link}>
                      {entry.title}
                    </Link>
                  ) : (
                    entry.title
                  )}
                </h3>
                {entry.summary ? (
                  <p className={styles.summary}>{entry.summary}</p>
                ) : null}
                {entry.impact ? (
                  <dl className={styles.impact}>
                    <dt className="label">{latestActions.impactLabel}</dt>
                    <dd>{entry.impact}</dd>
                  </dl>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
