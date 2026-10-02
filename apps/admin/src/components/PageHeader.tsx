"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

// Titre de l'écran (un seul h1) et ses actions principales.
export default function PageHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        mb: 2.5,
      }}
    >
      <Typography variant="h1">{title}</Typography>
      {children && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{children}</Box>
      )}
    </Box>
  );
}
