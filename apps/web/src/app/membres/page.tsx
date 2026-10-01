import type { Metadata } from "next";
import { PageOutlineView } from "@/components/scaffold/PageOutlineView";
import { membersPage } from "@/content/pages";

export const metadata: Metadata = {
  title: membersPage.title,
  description: membersPage.description,
};

export default function MembersPage() {
  return <PageOutlineView outline={membersPage} />;
}
