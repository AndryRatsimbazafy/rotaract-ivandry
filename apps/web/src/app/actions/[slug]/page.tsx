import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { JoinReminder } from "@/components/sections/JoinReminder";
import { Onward } from "@/components/sections/Onward";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { routes } from "@/config/routes";
import { actionPage } from "@/content/actions";
import { getActionBySlug } from "@/data/actions";
import { toExcerpt } from "@/lib/paragraphs";
import { shareImages } from "@/lib/share-image";
import { ActionPlate } from "./_sections/ActionPlate";
import { ActionStory } from "./_sections/ActionStory";
import styles from "./page.module.css";

export async function generateMetadata({
  params,
}: PageProps<"/actions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const action = await getActionBySlug(slug);
  if (!action) notFound();

  const description = toExcerpt(action.summary ?? action.description?.[0]);
  return {
    title: action.title,
    description,
    openGraph: {
      type: "article",
      title: action.title,
      description,
      images: await shareImages(action.photos[0]),
    },
  };
}

export default async function ActionPage({ params }: PageProps<"/actions/[slug]">) {
  // Rendue à la demande, à partir du cache de données, comme l'accueil. Hors
  // de toute attente : un contenu absent répond avec le statut 404.
  await connection();

  const { slug } = await params;
  const action = await getActionBySlug(slug);
  if (!action) notFound();

  return (
    <>
      <ActionStory action={action} />
      <ActionPlate photos={action.photos.slice(1)} />
      <div className={`container ${styles.back}`}>
        <ArrowLink href={routes.actions}>{actionPage.backLabel}</ArrowLink>
      </div>
      <Onward label={actionPage.onward.label} links={actionPage.onward.links} />
      <JoinReminder />
    </>
  );
}
