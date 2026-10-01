import type { Metadata } from "next";
import { PageOutlineView } from "@/components/scaffold/PageOutlineView";
import { joinPage } from "@/content/pages";

export const metadata: Metadata = {
  title: joinPage.title,
  description: joinPage.description,
};

export default function JoinPage() {
  return <PageOutlineView outline={joinPage} />;
}
