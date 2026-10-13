import Box from "@mui/material/Box";

// Marques d'état de la grille (apps/admin/DESIGN.md) : un carré de 8 px suivi
// du libellé, sans fond ni pilule. La couleur est toujours doublée du texte.

const markSx = {
  display: "inline-flex",
  alignItems: "center",
  gap: 0.75,
  fontSize: "0.8125rem",
  fontWeight: 600,
  lineHeight: 1.4,
  whiteSpace: "nowrap",
  verticalAlign: "middle",
} as const;

// État : carré plein de la couleur d'état (clé de palette du thème).
export function StatusMark({
  label,
  color,
}: {
  label: string;
  color: "success" | "info" | "error" | "warning";
}) {
  return (
    <Box component="span" sx={{ ...markSx, color: "text.primary" }}>
      <Box
        component="span"
        aria-hidden
        sx={{ width: 8, height: 8, flexShrink: 0, bgcolor: `${color}.main` }}
      />
      {label}
    </Box>
  );
}

// État neutre : carré vide cerclé et libellé secondaire.
export function NeutralMark({ label }: { label: string }) {
  return (
    <Box component="span" sx={{ ...markSx, color: "text.secondary" }}>
      <Box
        component="span"
        aria-hidden
        sx={{
          width: 8,
          height: 8,
          flexShrink: 0,
          border: 1,
          borderColor: "text.secondary",
        }}
      />
      {label}
    </Box>
  );
}

export function PublishedMark({ isPublished }: { isPublished: boolean }) {
  return isPublished ? (
    <StatusMark label="Publié" color="success" />
  ) : (
    <NeutralMark label="Brouillon" />
  );
}

export function CurrentYearMark() {
  return <StatusMark label="En cours" color="info" />;
}
