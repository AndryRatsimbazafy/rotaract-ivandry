"use client";

import Link from "next/link";
import ArrowForward from "@mui/icons-material/ArrowForward";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SectionHeading } from "@/components/PageHeader";

const DOMAINS = [
  {
    href: "/annees",
    title: "Années Rotary",
    text: "Créer les années auxquelles se rattachent mandats, actions et actualités.",
  },
  {
    href: "/membres",
    title: "Membres",
    text: "Tenir la liste des membres, leurs mandats et l'ordre d'affichage de chaque année.",
  },
  {
    href: "/actions",
    title: "Actions",
    text: "Rédiger les actions du club, renseigner leur impact et décider de leur publication.",
  },
  {
    href: "/actualites",
    title: "Actualités",
    text: "Rédiger les actualités et décider de leur publication.",
  },
  {
    href: "/candidatures",
    title: "Candidatures",
    text: "Consulter les candidatures reçues, télécharger les CV, supprimer.",
  },
];

// Accueil : un accès par domaine, en liste à filets.
export default function HomeLinks() {
  return (
    <Box component="nav" aria-label="Domaines" sx={{ mt: 4 }}>
      <SectionHeading title="Domaines" />
      <Box component="ul" sx={{ m: 0, p: 0, listStyle: "none" }}>
        {DOMAINS.map(({ href, title, text }) => (
          <Box component="li" key={href} sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Box
              component={Link}
              href={href}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "200px minmax(0, 1fr) auto" },
                alignItems: "baseline",
                columnGap: 2,
                rowGap: 0.25,
                px: 1,
                py: 1.25,
                color: "inherit",
                textDecoration: "none",
                transition: "background-color 120ms",
                "&:hover": { bgcolor: "action.hover" },
                "&:hover .fleche": { color: "primary.main" },
                "&:focus-visible": {
                  outline: 2,
                  outlineColor: "primary.main",
                  outlineOffset: -2,
                },
              }}
            >
              <Typography variant="body2" component="span" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Typography variant="body2" component="span" color="text.secondary">
                {text}
              </Typography>
              <ArrowForward
                className="fleche"
                aria-hidden
                sx={{
                  display: { xs: "none", sm: "block" },
                  fontSize: 16,
                  color: "text.secondary",
                  alignSelf: "center",
                }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
