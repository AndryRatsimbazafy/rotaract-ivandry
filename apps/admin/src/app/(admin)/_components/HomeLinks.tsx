"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

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

// Accueil : un accès par domaine, sans chiffre.
export default function HomeLinks() {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "1fr 1fr 1fr" },
      }}
    >
      {DOMAINS.map(({ href, title, text }) => (
        <Paper key={href}>
          <CardActionArea component={Link} href={href} sx={{ p: 2.5, height: "100%" }}>
            <Typography variant="h2" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography color="text.secondary">{text}</Typography>
          </CardActionArea>
        </Paper>
      ))}
    </Box>
  );
}
