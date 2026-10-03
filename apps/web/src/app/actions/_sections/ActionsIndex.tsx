import Link from "next/link";
import { Suspense } from "react";
import { PhotoFrame } from "@/components/media/PhotoFrame";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { ListSkeleton } from "@/components/ui/PageSkeleton";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { routes } from "@/config/routes";
import { actionsIndex } from "@/content/actions";
import { incompleteLabel, pendingLabel } from "@/content/common";
import { focusAreas } from "@/content/home";
import type { ActionFilters, ActionList } from "@/data/actions";
import type { Action, ActionImpact } from "@/types/action";
import type { Photo } from "@/types/media";
import type { RotaryYear } from "@/types/rotary-year";
import styles from "./ActionsIndex.module.css";

/** Trois compositions qui alternent : chaque action a sa mise en page. */
const VARIANTS = [
  { name: styles.wide, format: "16:9", sizes: "(min-width: 1024px) 84vw, 100vw" },
  { name: styles.tall, format: "4:5", sizes: "(min-width: 1024px) 42vw, 80vw" },
  { name: styles.offset, format: "3:2", sizes: "(min-width: 1024px) 50vw, 86vw" },
];

interface Entry {
  key: string;
  meta: string[];
  title: string;
  summary?: string;
  /** L'essentiel, toujours visible. */
  impact?: string;
  /** La description, paragraphe par paragraphe, dans la fiche dépliable. */
  description: string[];
  /** Les rubriques d'impact renseignées, dans la fiche dépliable. */
  facts: { label: string; value: string }[];
  photos: Photo[];
}

function toFacts(impact: ActionImpact | undefined) {
  if (!impact) return [];

  const labels = actionsIndex.impactLabels;
  const facts = [
    { label: labels.objective, value: impact.objective },
    { label: labels.beneficiaries, value: impact.beneficiaries },
    { label: labels.location, value: impact.location },
    { label: labels.period, value: impact.period },
    { label: labels.partners, value: impact.partners?.join(", ") },
    { label: labels.results, value: impact.results },
  ];

  // Une rubrique vide disparaît.
  return facts.filter(
    (fact): fact is { label: string; value: string } => Boolean(fact.value),
  );
}

function toEntry(action: Action): Entry {
  // Une action peut relever de plusieurs domaines, ou d'aucun.
  const areas = focusAreas.areas.filter((item) =>
    action.focusAreas.includes(item.id),
  );

  return {
    key: action.id,
    meta: [
      `${actionsIndex.yearLabel} ${action.rotaryYear}`,
      ...areas.map((area) => area.title),
    ],
    title: action.title,
    summary: action.summary,
    impact: action.impact?.results ?? action.impact?.beneficiaries,
    description: action.description ?? [],
    facts: toFacts(action.impact),
    photos: action.photos,
  };
}

function placeholderEntries(): Entry[] {
  const { meta, title, summary, impact } = actionsIndex.placeholder;

  return VARIANTS.map((_, index) => ({
    key: `emplacement-${index}`,
    meta: [meta],
    title,
    summary,
    impact,
    description: [],
    facts: [],
    photos: [],
  }));
}

function filterHref(filters: ActionFilters) {
  const query = new URLSearchParams();
  if (filters.rotaryYear) query.set("annee", filters.rotaryYear);
  if (filters.focusArea) query.set("domaine", filters.focusArea);
  const search = query.toString();

  return `${routes.actions}${search ? `?${search}` : ""}#liste`;
}

interface ActionsIndexProps {
  /** La lecture des actions du filtre, attendue dans la seule zone de liste. */
  list: Promise<ActionList>;
  /** Vrai tant qu'aucune action n'est publiée, tous filtres confondus. */
  isPending: boolean;
  years: RotaryYear[];
  filters: ActionFilters;
}

/** La mention de liste incomplète, une fois la lecture terminée. */
async function IncompleteNote({ list }: { list: Promise<ActionList> }) {
  const { complete } = await list;

  return complete ? null : (
    <p className={`meta ${styles.note}`}>{incompleteLabel}</p>
  );
}

export function ActionsIndex({
  list,
  isPending,
  years,
  filters,
}: ActionsIndexProps) {
  // Une frontière d'attente par filtre : à chaque changement, la zone de liste
  // montre son squelette pendant la lecture, tandis que le titre et les filtres
  // restent en place (le focus du lien choisi est conservé).
  const listKey = `${filters.rotaryYear ?? ""}|${filters.focusArea ?? ""}`;
  const currentArea = focusAreas.areas.find(
    (area) => area.id === filters.focusArea,
  );

  return (
    <section id="liste" className={styles.section} aria-labelledby="liste-titre">
      <div className="container">
        <div className={`grid ${styles.head}`}>
          <div className={styles.heading}>
            <SectionLabel number={actionsIndex.number}>
              {actionsIndex.label}
            </SectionLabel>
            <h2 id="liste-titre" className={styles.title}>
              {actionsIndex.title}
            </h2>
            {isPending ? (
              <p className={`meta ${styles.note}`}>{pendingLabel}</p>
            ) : null}
            <Suspense key={listKey} fallback={null}>
              <IncompleteNote list={list} />
            </Suspense>
          </div>

          {/* L'index des filtres : des liens, qui changent l'adresse de la page. */}
          <nav aria-label={actionsIndex.filtersLabel} className={styles.filters}>
            <div className={styles.filter}>
              <p className={`label ${styles.filterLabel}`}>
                {actionsIndex.yearFilter.label}
              </p>
              <ul className={styles.options}>
                <li>
                  <Link
                    href={filterHref({ focusArea: filters.focusArea })}
                    className={styles.option}
                    aria-current={filters.rotaryYear ? undefined : "true"}
                  >
                    {actionsIndex.yearFilter.all}
                  </Link>
                </li>
                {years.map((year) => (
                  <li key={year}>
                    <Link
                      href={filterHref({ ...filters, rotaryYear: year })}
                      className={styles.option}
                      aria-current={
                        filters.rotaryYear === year ? "true" : undefined
                      }
                    >
                      {year}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <details className={styles.filter}>
              <summary className={styles.summary}>
                <span className={`label ${styles.filterLabel}`}>
                  {actionsIndex.areaFilter.label}
                </span>
                <span className={styles.current}>
                  {currentArea?.title ?? actionsIndex.areaFilter.all}
                </span>
              </summary>
              <ul className={styles.areas}>
                <li>
                  <Link
                    href={filterHref({ rotaryYear: filters.rotaryYear })}
                    className={styles.option}
                    aria-current={filters.focusArea ? undefined : "true"}
                  >
                    {actionsIndex.areaFilter.all}
                  </Link>
                </li>
                {focusAreas.areas.map((area) => (
                  <li key={area.id}>
                    <Link
                      href={filterHref({ ...filters, focusArea: area.id })}
                      className={styles.option}
                      aria-current={
                        filters.focusArea === area.id ? "true" : undefined
                      }
                    >
                      {area.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </nav>
        </div>

        <Suspense
          key={listKey}
          fallback={
            <ListSkeleton label={actionsIndex.loadingLabel} shape="entry" />
          }
        >
          <ActionsEntries list={list} isPending={isPending} />
        </Suspense>
      </div>
    </section>
  );
}

/** Les actions du filtre, une à une, ou l'état « aucun résultat ». */
async function ActionsEntries({
  list,
  isPending,
}: {
  list: Promise<ActionList>;
  isPending: boolean;
}) {
  const { actions } = await list;
  const entries = isPending ? placeholderEntries() : actions.map(toEntry);

  return (
    <>
      {entries.length === 0 ? (
        <div className={styles.empty}>
          <p>{actionsIndex.empty}</p>
          <ArrowLink href={filterHref({})}>{actionsIndex.reset}</ArrowLink>
        </div>
      ) : (
        <div className={isPending ? styles.pending : undefined}>
          {entries.map((entry, index) => {
            const variant = VARIANTS[index % VARIANTS.length];
            const more = entry.photos.slice(1);

            return (
              <article
                key={entry.key}
                className={`grid ${styles.entry} ${variant.name}`}
              >
                <ul className={`meta ${styles.meta}`}>
                  {entry.meta.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <h3 className={styles.name}>{entry.title}</h3>
                <div className={styles.media}>
                  <PhotoFrame
                    photo={entry.photos[0]}
                    brief={actionsIndex.photoBrief}
                    format={variant.format}
                    sizes={variant.sizes}
                    tone="paper"
                    className={styles.frame}
                  />
                </div>
                <div className={styles.body}>
                  {entry.summary ? (
                    <p className={styles.text}>{entry.summary}</p>
                  ) : null}
                  {entry.impact ? (
                    <p className={styles.impact}>{entry.impact}</p>
                  ) : null}
                  {entry.description.length > 0 ||
                  entry.facts.length > 0 ||
                  more.length > 0 ? (
                    <details className={styles.more}>
                      <summary className={styles.moreSummary}>
                        {actionsIndex.moreLabel}
                      </summary>
                      {entry.description.map((paragraph, position) => (
                        <p key={position} className={styles.text}>
                          {paragraph}
                        </p>
                      ))}
                      {entry.facts.length > 0 ? (
                        <dl className={styles.facts}>
                          {entry.facts.map((fact) => (
                            <div key={fact.label}>
                              <dt className="label">{fact.label}</dt>
                              <dd>{fact.value}</dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}
                      {more.length > 0 ? (
                        <div className={styles.plate}>
                          {more.map((photo) => (
                            <PhotoFrame
                              key={photo.src}
                              photo={photo}
                              brief={actionsIndex.photoBrief}
                              format="3:2"
                              sizes="(min-width: 1024px) 20vw, 45vw"
                              className={styles.plateFrame}
                            />
                          ))}
                        </div>
                      ) : null}
                    </details>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
