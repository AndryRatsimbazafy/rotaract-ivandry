"use client";

import Link from "next/link";
import ArrowBack from "@mui/icons-material/ArrowBack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  // Retour vers la liste, avec son état.
  back?: { href: string; label: string };
  title: React.ReactNode;
  // Marques d'état de l'élément.
  marks?: React.ReactNode;
  // Ligne de contexte sous le titre.
  meta?: React.ReactNode;
  // Actions alignées à droite ; children est accepté au même titre.
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

// En-tête de page : retour, titre (un seul h1), marques, contexte, actions.
// Un filet le sépare du contenu ; aucune carte.
export default function PageHeader({
  back,
  title,
  marks,
  meta,
  actions,
  children,
}: Props) {
  const tools = actions ?? children;
  return (
    <Box sx={{ pb: 2, mb: 3, borderBottom: 1, borderColor: "divider" }}>
      {back && (
        <Button
          component={Link}
          href={back.href}
          size="small"
          variant="text"
          startIcon={<ArrowBack sx={{ fontSize: 16 }} />}
          sx={{ ml: -1, mb: 0.5, color: "text.secondary", minHeight: 28 }}
        >
          {back.label}
        </Button>
      )}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ justifyContent: "space-between", alignItems: { sm: "flex-end" } }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Stack
            direction="row"
            spacing={1.5}
            useFlexGap
            sx={{ alignItems: "center", flexWrap: "wrap" }}
          >
            <Typography variant="h1" sx={{ textWrap: "balance" }}>
              {title}
            </Typography>
            {marks}
          </Stack>
          {meta && (
            <Typography
              component="div"
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {meta}
            </Typography>
          )}
        </Box>
        {tools && (
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            sx={{ flexShrink: 0, alignItems: "center", flexWrap: "wrap" }}
          >
            {tools}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}

// Titre de section (h2) souligné d'un filet fort, avec actions éventuelles.
export function SectionHeading({
  title,
  id,
  actions,
}: {
  title: React.ReactNode;
  id?: string;
  actions?: React.ReactNode;
}) {
  return (
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        minHeight: 36,
        pb: 0.75,
        mb: 1.5,
        borderBottom: 1,
        borderColor: "var(--grid-rule-strong)",
      }}
    >
      <Typography variant="h2" id={id}>
        {title}
      </Typography>
      {actions}
    </Stack>
  );
}
