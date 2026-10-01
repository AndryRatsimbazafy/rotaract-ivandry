import type { Metadata } from "next";
import { Onward } from "@/components/sections/Onward";
import { joinOnward } from "@/content/join";
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

export default function JoinPage() {
  return (
    <>
      <JoinOpening />
      <JoinClub />
      <JoinValues />
      <JoinAreas />
      <JoinPath />
      <FourWayTest />
      <JoinApplication />
      <JoinFaq />
      <Onward label={joinOnward.label} links={joinOnward.links} />
    </>
  );
}
