import { PhotoFrame } from "@/components/media/PhotoFrame";
import { formatCalendarDate } from "@/lib/dates";
import type { Action, ActionImpact } from "@/types/action";
import styles from "./ActionStory.module.css";
import { currentLang } from "@/lib/current-lang";
import { frenchLang, hasFrench, LangMark } from "@/components/ui/LangMark";
import { getContent } from "@/content";

type ImpactKey = Exclude<keyof ActionImpact, "partners">;
const IMPACT_KEYS: ImpactKey[] = ["objective", "beneficiaries", "location", "period", "results"];

/**
 * Le reportage (DESIGN.md, section 10) : métadonnées en marge, titre condensé
 * qui mord la photographie principale, puis le récit et sa fiche d'impact.
 */
export async function ActionStory({ action }: { action: Action }) {
  const content = await getContent();
  const lang = await currentLang();
  const { actionPage, actionsIndex } = content.actions;
  const { focusAreas } = content.home;
  const areas = focusAreas.areas.filter((area) => action.focusAreas.includes(area.id));
  // Une rubrique absente n'a pas de ligne (décision 1).
  const facts = IMPACT_KEYS.flatMap((key) => {
    const value = action.impact?.[key];
    return value ? [{ key, label: actionsIndex.impactLabels[key], value }] : [];
  });
  const partners = action.impact?.partners ?? [];
  const hasSheet = facts.length > 0 || partners.length > 0;

  return (
    <article aria-labelledby="action-titre">
      <header className={styles.opening}>
        <div className={`container grid ${styles.stage}`}>
          <ul className={`meta ${styles.meta}`}>
            <li className="label">{actionPage.label}</li>
            <li>
              {actionPage.yearLabel} {action.rotaryYear}
            </li>
            <li>
              <time dateTime={action.date.slice(0, 10)}>{formatCalendarDate(action.date, lang)}</time>
            </li>
            {areas.map((area) => (
              <li key={area.id}>{area.title}</li>
            ))}
            {hasFrench(action.french) ? (
              <li>
                <LangMark show />
              </li>
            ) : null}
          </ul>
          <div className={styles.media}>
            <PhotoFrame
              photo={action.photos[0]}
              brief={actionPage.photoBrief}
              format="3:2"
              sizes="(min-width: 1024px) 66vw, 100vw"
              priority
              tone="paper"
              className={styles.frame}
            />
          </div>
          <h1 id="action-titre" className={styles.title} lang={frenchLang(action.french?.title)}>
            {action.title}
          </h1>
        </div>
      </header>

      {action.summary || action.description || hasSheet ? (
        <div className={styles.sheet}>
          <div className={`container grid ${styles.story}`}>
            <div className={styles.text}>
              {action.summary ? (
                <p className={styles.lede} lang={frenchLang(action.french?.summary)}>
                  {action.summary}
                </p>
              ) : null}
              {action.description?.map((paragraph, index) => (
                <p
                  key={index}
                  className={styles.paragraph}
                  lang={frenchLang(action.french?.description)}
                >
                  {paragraph}
                </p>
              ))}
            </div>
            {hasSheet ? (
              <aside className={styles.impact} aria-labelledby="action-impact">
                <h2 id="action-impact" className={`label ${styles.impactTitle}`}>
                  {actionPage.impactTitle}
                </h2>
                <dl className={styles.facts}>
                  {facts.map((fact) => (
                    <div key={fact.key} className={styles.fact}>
                      <dt className="label">{fact.label}</dt>
                      <dd lang={frenchLang(action.french?.[fact.key])}>{fact.value}</dd>
                    </div>
                  ))}
                  {partners.length > 0 ? (
                    <div className={styles.fact}>
                      <dt className="label">{actionPage.partnersLabel}</dt>
                      <dd>
                        <ul className={styles.partners}>
                          {partners.map((partner) => (
                            <li key={partner}>{partner}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}
                </dl>
              </aside>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}
