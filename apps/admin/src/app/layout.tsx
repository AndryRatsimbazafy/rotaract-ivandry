import type { Metadata, Viewport } from "next";
import { Open_Sans, Red_Hat_Mono } from "next/font/google";
import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import ThemeRegistry from "@/theme/ThemeRegistry";
import "./globals.css";

// Open Sans pour l'interface ; Red Hat Mono pour les nombres seuls.
const openSans = Open_Sans({ variable: "--font-sans", subsets: ["latin"] });
const redHatMono = Red_Hat_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Administration — Rotaract Club Ivandry",
  description: "Back Office du Rotaract Club Ivandry",
};

export const viewport: Viewport = {
  // Contenu jusqu'aux bords sur téléphone ; le cadre gère les zones sûres.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1623" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // La classe light/dark est posée avant l'hydratation.
    <html
      lang="fr"
      className={`${openSans.variable} ${redHatMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <InitColorSchemeScript attribute="class" />
        <AppRouterCacheProvider>
          <ThemeRegistry>{children}</ThemeRegistry>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}
