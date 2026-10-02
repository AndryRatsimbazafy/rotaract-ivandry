"use client";

import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

// État d'attente d'un écran : titre et lignes d'un tableau.
export default function LoadingState() {
  return (
    <Box role="status" aria-label="Chargement">
      <Skeleton variant="text" width={240} height={40} sx={{ mb: 2 }} />
      {Array.from({ length: 6 }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={36} sx={{ mb: 1 }} />
      ))}
    </Box>
  );
}
