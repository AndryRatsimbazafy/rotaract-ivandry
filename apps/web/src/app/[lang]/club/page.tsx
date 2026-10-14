import type { Metadata } from "next";
import { connection } from "next/server";
import { JoinReminder } from "@/components/sections/JoinReminder";
import { Onward } from "@/components/sections/Onward";
import { routes } from "@/config/routes";
import { getContent } from "@/content";
import { getActionCount } from "@/data/actions";
import { getSiteSettings } from "@/data/site-settings";
import { getClubTimeline } from "@/data/timeline";
import { staticPageMetadata } from "@/lib/page-metadata";
import { ClubFigures, hasFigures } from "./_sections/ClubFigures";
import { ClubHistory } from "./_sections/ClubHistory";
import { ClubOpening } from "./_sections/ClubOpening";
import { ClubTimeline } from "./_sections/ClubTimeline";
import { RotaryLink } from "./_sections/RotaryLink";
import styles from "./page.module.css";

export function generateMetadata(): Promise<Metadata> {
  return staticPageMetadata("clubPage", routes.club);
}

/**
 * « Le club » (fonctionnalité 015) : l'histoire saisie dans le Back Office, le
 * Rotaract dans le Rotary, des chiffres réels et la frise des années.
 */
export default async function ClubPage() {
  const { onward } = (await getContent()).club;
  // Rendue à la demande, à partir du cache de données, comme l'accueil.
  await connection();

  const [settings, timeline, actionCount] = await Promise.all([
    getSiteSettings(),
    getClubTimeline(),
    getActionCount(),
  ]);
  const { club } = settings;
  const history = settings.history ?? [];
  const figures = {
    foundedYear: club.foundedYear,
    memberCount: club.memberCount,
    actionCount,
    yearCount: timeline.length,
  };
  // Les sections absentes ne laissent pas de trou dans la numérotation.
  const present = [
    history.length > 0 && "history",
    "rotary",
    hasFigures(figures) && "figures",
    timeline.length > 0 && "timeline",
  ].filter(Boolean);
  const number = (section: string) => String(present.indexOf(section) + 1).padStart(2, "0");

  return (
    <>
      <ClubOpening photo={settings.photos["club-ouverture"] ?? settings.photos["accueil-club"]} />
      <div className={styles.sheet}>
        <ClubHistory
          paragraphs={history}
          french={settings.historyFrench}
          number={number("history")}
        />
        <div className={`container grid ${styles.facts}`}>
          <div className={styles.rotary}>
            <RotaryLink
              sponsorClub={club.sponsorClub}
              sponsorFrench={settings.clubFrench?.sponsorClub}
              number={number("rotary")}
            />
          </div>
          <div className={styles.figures}>
            <ClubFigures values={figures} number={number("figures")} />
          </div>
        </div>
      </div>
      <ClubTimeline years={timeline} number={number("timeline")} />
      <Onward label={onward.label} links={onward.links} />
      <JoinReminder />
    </>
  );
}
