import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { site } from "@/config/site";
import { contentFor } from "@/content";
import { isLang } from "@/lib/locale";
import "../tokens.css";
import "../globals.css";
import styles from "./layout.module.css";

// Police variable : l'axe de largeur (wdth) doit être demandé explicitement,
// sinon le fichier servi est figé à 100 % et les titres condensés ne s'appliquent pas.
const openSans = Open_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-open-sans",
});

const OPEN_GRAPH_LOCALES = { fr: "fr_FR", en: "en_GB" } as const;

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return {
    title: {
      default: site.name,
      template: `%s | ${site.name}`,
    },
    description: contentFor(lang).common.chrome.siteDescription,
    openGraph: {
      siteName: site.name,
      locale: OPEN_GRAPH_LOCALES[lang],
      type: "website",
    },
  };
}

// Mise en page racine des deux langues (fonctionnalité 014) : la langue de la
// page vient de l'adresse.
export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const { chrome } = contentFor(lang).common;

  return (
    <html lang={lang} className={openSans.variable}>
      <body>
        <a href="#contenu" className={styles.skipLink}>
          {chrome.skipLink}
        </a>
        <SiteHeader />
        <main id="contenu" tabIndex={-1} className={styles.main}>
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
