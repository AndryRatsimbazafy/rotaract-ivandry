import type { Metadata } from "next";
import { PageOutlineView } from "@/components/scaffold/PageOutlineView";
import { actionsPage } from "@/content/pages";

export const metadata: Metadata = {
  title: actionsPage.title,
  description: actionsPage.description,
};

export default function ActionsPage() {
  return <PageOutlineView outline={actionsPage} />;
}
