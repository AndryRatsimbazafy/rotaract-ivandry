import type { Metadata } from "next";
import { connection } from "next/server";
import { Onward } from "@/components/sections/Onward";
import { joinOnward } from "@/content/join";
import { getSiteSettings } from "@/data/site-settings";
import { joinPage } from "@/content/pages";
import { FourWayTest } from "./_sections/FourWayTest";
import { JoinApplication } from "./_sections/JoinApplication";
import { JoinAreas } from "./_sections/JoinAreas";
import { JoinClub } from "./_sections/JoinClub";
import { JoinFaq } from "./_sections/JoinFaq";
import { JoinOpening } from "./_sections/JoinOpening";
import { JoinPath } from "./_sections/JoinPath";
import { JoinValues } from "./_sections/JoinValues";

export const metadata: Metadata = {
  title: joinPage.title,
  description: joinPage.description,
};

export default async function JoinPage() {
  // Rendue à la demande, à partir du cache de données, comme l'accueil : la
  // page lit les réglages du site. Régénérée statiquement, elle relirait au
  // premier plan une entrée périmée, et une API indisponible remplacerait un
  // contenu déjà lu par l'état vide.
  await connection();

  const settings = await getSiteSettings();

  return (
    <>
      <JoinOpening
        photo={settings.photos["rejoindre-ouverture"]}
        homeOpening={settings.photos["accueil-ouverture"]}
      />
      <JoinClub />
      <JoinValues />
      <JoinAreas />
      <JoinPath />
      <FourWayTest />
      <JoinApplication />
      <JoinFaq answers={settings.faq} />
      <Onward label={joinOnward.label} links={joinOnward.links} />
    </>
  );
}
