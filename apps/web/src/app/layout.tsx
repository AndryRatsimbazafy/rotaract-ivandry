import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { site } from "@/config/site";
import "./tokens.css";
import "./globals.css";
import styles from "./layout.module.css";

// Police variable : l'axe de largeur (wdth) doit être demandé explicitement,
// sinon le fichier servi est figé à 100 % et les titres condensés ne s'appliquent pas.
const openSans = Open_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: {
    default: site.name,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  openGraph: {
    siteName: site.name,
    locale: site.locale,
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={site.lang} className={openSans.variable}>
      <body>
        <a href="#contenu" className={styles.skipLink}>
          Aller au contenu
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
