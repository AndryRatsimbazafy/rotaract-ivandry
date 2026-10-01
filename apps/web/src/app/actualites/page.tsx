import type { Metadata } from "next";
import { PageOutlineView } from "@/components/scaffold/PageOutlineView";
import { newsPage } from "@/content/pages";

export const metadata: Metadata = {
  title: newsPage.title,
  description: newsPage.description,
};

export default function NewsPage() {
  return <PageOutlineView outline={newsPage} />;
}
