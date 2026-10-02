"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

type Props = {
  // Vrai quand une recherche ou un filtre est actif.
  filtered: boolean;
  // Adresse de la liste sans recherche ni filtre.
  resetHref: string;
  emptyText: string;
  children?: React.ReactNode;
};

// Distingue « aucun élément » de « aucun résultat ».
export default function EmptyState({
  filtered,
  resetHref,
  emptyText,
  children,
}: Props) {
  return (
    <Box sx={{ py: 6, px: 2, textAlign: "center" }}>
      <Typography sx={{ mb: 2 }}>
        {filtered
          ? "Aucun résultat pour cette recherche ou ces filtres."
          : emptyText}
      </Typography>
      {filtered ? (
        <Button component={Link} href={resetHref} variant="outlined">
          Effacer les filtres
        </Button>
      ) : (
        children
      )}
    </Box>
  );
}
