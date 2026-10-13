"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { tabularNums } from "@/theme/theme";

export type SummaryCell = {
  label: string;
  // Total lu dans l'API ; null quand il n'a pas pu l'être.
  value: number | null;
  href: string;
};

// Barre de chiffres (accueil) : cases réglées côte à côte sur fond
// d'outillage, 2 × 2 sur téléphone. Chaque case mène à sa liste ; une valeur
// absente s'affiche « — », jamais 0.
export default function SummaryBar({ cells }: { cells: SummaryCell[] }) {
  const format = new Intl.NumberFormat("fr-FR");
  return (
    <Box
      component="ul"
      aria-label="Chiffres du Back Office"
      sx={{
        m: 0,
        p: 0,
        listStyle: "none",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr 1fr",
          md: `repeat(${cells.length}, minmax(0, 1fr))`,
        },
        bgcolor: "var(--grid-chrome)",
        border: 1,
        borderColor: "divider",
        "& > *": { borderColor: "divider" },
        "& > *:nth-of-type(n+2)": { borderLeft: { md: 1 } },
        "& > *:nth-of-type(even)": { borderLeft: 1 },
        "& > *:nth-of-type(n+3)": { borderTop: { xs: 1, md: 0 } },
      }}
    >
      {cells.map(({ label, value, href }) => (
        <Box component="li" key={label} sx={{ minWidth: 0 }}>
          <Box
            component={Link}
            href={href}
            sx={{
              display: "block",
              px: 1.5,
              py: 0.75,
              color: "inherit",
              textDecoration: "none",
              transition: "background-color 120ms",
              "&:hover": { bgcolor: "action.hover" },
              "&:focus-visible": {
                outline: 2,
                outlineColor: "primary.main",
                outlineOffset: -2,
              },
            }}
          >
            <Typography
              variant="overline"
              color="text.secondary"
              component="p"
              sx={{ lineHeight: 1.4 }}
            >
              {label}
            </Typography>
            <Typography
              component="p"
              sx={{
                ...tabularNums,
                fontSize: "0.9375rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                ...(value === null && { color: "text.secondary" }),
              }}
            >
              {value === null ? "—" : format.format(value)}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
