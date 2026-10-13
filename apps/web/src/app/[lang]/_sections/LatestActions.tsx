import Link from "@/components/ui/LocalLink";
import { PhotoFrame } from "@/components/media/PhotoFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { actionPath, routes } from "@/config/routes";
import type { Action } from "@/types/action";
import type { Photo } from "@/types/media";
import styles from "./LatestActions.module.css";
import { frenchLang, hasFrench, LangMark } from "@/components/ui/LangMark";
import { getContent, type Content } from "@/content";

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
  /** Passages affichés en français sur une page anglaise (014). */
  french?: { title?: boolean; summary?: boolean; impact?: boolean };
  photo?: Photo;
  href?: string;
}

function toEntry(action: Action, { latestActions }: Content["home"]): ActionEntry {
  const impact = action.impact;

  return {
    key: action.id,
    meta: `${latestActions.yearLabel} ${action.rotaryYear}`,
    title: action.title,
    summary: action.summary,
    impact: impact?.results ?? impact?.beneficiaries ?? impact?.objective,
    french: {
      title: action.french?.title,
      summary: action.french?.summary,
      impact: impact?.results
        ? action.french?.results
        : impact?.beneficiaries
          ? action.french?.beneficiaries
          : action.french?.objective,
    },
    photo: action.photos[0],
    href: actionPath(action.slug),
  };
}

function placeholderEntries({ latestActions }: Content["home"]): ActionEntry[] {
  return SLOTS.map((_, index) => ({
    key: `emplacement-${index}`,
    ...latestActions.placeholder,
  }));
}

interface LatestActionsProps {
  actions: Action[];
}

export async function LatestActions({ actions }: LatestActionsProps) {
  const content = await getContent();
  const { pendingLabel } = content.common;
  const { latestActions } = content.home;
  const isPending = actions.length === 0;
  const entries = isPending
    ? placeholderEntries(content.home)
    : actions.map((action) => toEntry(action, content.home));

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
                <LangMark show={hasFrench(entry.french)} />
                <h3 className={styles.name} lang={frenchLang(entry.french?.title)}>
                  {entry.href ? (
                    <Link href={entry.href} className={styles.link}>
                      {entry.title}
                    </Link>
                  ) : (
                    entry.title
                  )}
                </h3>
                {entry.summary ? (
                  <p className={styles.summary} lang={frenchLang(entry.french?.summary)}>
                    {entry.summary}
                  </p>
                ) : null}
                {entry.impact ? (
                  <dl className={styles.impact}>
                    <dt className="label">{latestActions.impactLabel}</dt>
                    <dd lang={frenchLang(entry.french?.impact)}>{entry.impact}</dd>
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
