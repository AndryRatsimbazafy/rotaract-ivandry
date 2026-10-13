import type { Metadata } from "next";
import { connection } from "next/server";
import { languageAlternates } from "@/lib/page-metadata";
import { getFeaturedMembers } from "@/data/members";
import { getLatestActions } from "@/data/actions";
import { getLatestNews } from "@/data/news";
import { getCurrentRotaryYear } from "@/data/rotary-years";
import { getSiteSettings } from "@/data/site-settings";
import { About } from "./_sections/About";
import { FocusAreas } from "./_sections/FocusAreas";
import { JoinField } from "./_sections/JoinField";
import { LatestActions } from "./_sections/LatestActions";
import { LatestNews } from "./_sections/LatestNews";
import { MembersPreview } from "./_sections/MembersPreview";
import { Opening } from "./_sections/Opening";
import { RotaryValues } from "./_sections/RotaryValues";

export function generateMetadata(): Metadata {
  return { alternates: languageAlternates("/") };
}

export default async function HomePage() {
  // Rendue à la demande, à partir du cache de données, comme les pages de
  // liste. Régénérée statiquement, la page relirait au premier plan une entrée
  // périmée : une API indisponible remplacerait alors un contenu déjà lu par
  // l'état vide.
  await connection();

  const [actions, news, members, currentYear, settings] = await Promise.all([
    getLatestActions(3),
    getLatestNews(3),
    getFeaturedMembers(4),
    getCurrentRotaryYear(),
    getSiteSettings(),
  ]);

  return (
    <>
      <Opening rotaryYear={currentYear} photo={settings.photos["accueil-ouverture"]} />
      <About club={settings.club} clubFrench={settings.clubFrench} photo={settings.photos["accueil-club"]} />
      <RotaryValues />
      <FocusAreas />
      <LatestActions actions={actions} />
      <LatestNews news={news} />
      <MembersPreview members={members} rotaryYear={currentYear} />
      <JoinField photo={settings.photos["accueil-rejoindre"]} />
    </>
  );
}
