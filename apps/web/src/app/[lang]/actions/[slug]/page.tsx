import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { JoinReminder } from "@/components/sections/JoinReminder";
import { Onward } from "@/components/sections/Onward";
import { ArrowLink } from "@/components/ui/ArrowLink";
import { actionPath, routes } from "@/config/routes";
import { getActionBySlug } from "@/data/actions";
import { languageAlternates } from "@/lib/page-metadata";
import { toExcerpt } from "@/lib/paragraphs";
import { ActionPlate } from "./_sections/ActionPlate";
import { ActionStory } from "./_sections/ActionStory";
import styles from "./page.module.css";
import { getContent } from "@/content";
import { PhotoGallery } from "@/components/media/PhotoGallery";
import { galleryProps } from "@/lib/gallery";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/actions/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const action = await getActionBySlug(slug);
  if (!action) notFound();

  const description = toExcerpt(action.summary ?? action.description?.[0]);
  return {
    title: action.title,
    description,
    alternates: languageAlternates(actionPath(slug)),
    openGraph: {
      type: "article",
      title: action.title,
      description,
    },
  };
}

export default async function ActionPage({ params }: PageProps<"/[lang]/actions/[slug]">) {
  const content = await getContent();
  const { actionPage } = content.actions;
  // Rendue à la demande, à partir du cache de données, comme l'accueil. Hors
  // de toute attente : un contenu absent répond avec le statut 404.
  await connection();

  const { slug } = await params;
  const action = await getActionBySlug(slug);
  if (!action) notFound();
  const gallery = await galleryProps(action.photos, action.title);

  return (
    <>
      <PhotoGallery photos={gallery.photos} labels={gallery.labels}>
        <ActionStory action={action} />
        <ActionPlate photos={action.photos.slice(1)} />
      </PhotoGallery>
      <div className={`container ${styles.back}`}>
        <ArrowLink href={routes.actions}>{actionPage.backLabel}</ArrowLink>
      </div>
      <Onward label={actionPage.onward.label} links={actionPage.onward.links} />
      <JoinReminder />
    </>
  );
}
