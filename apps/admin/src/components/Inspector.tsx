"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// Contenu de l'aperçu : titre, marques, sections et actions. Aucun champ n'y
// est modifiable.
export function InspectorPanel({
  title,
  marks,
  actions,
  children,
}: {
  title: string;
  marks?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Box sx={{ px: 2.5, pt: 1, pb: 2.5 }}>
      <Typography variant="h2" component="h2" sx={{ overflowWrap: "anywhere" }}>
        {title}
      </Typography>
      {marks && <Box sx={{ mt: 0.75 }}>{marks}</Box>}
      {actions && (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ flexWrap: "wrap", alignItems: "center", mt: 1.5 }}
        >
          {actions}
        </Stack>
      )}
      <Box sx={{ mt: 2 }}>{children}</Box>
    </Box>
  );
}

// Section de l'aperçu, sous un libellé de zone.
export function InspectorSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Box component="section" sx={{ mt: 2 }}>
      <Typography variant="overline" color="text.secondary" component="h3">
        {label}
      </Typography>
      {children}
    </Box>
  );
}

export function InspectorPending() {
  return (
    <Box role="status" aria-label="Chargement de la fiche" sx={{ px: 2.5, pt: 1.5, pb: 2.5 }}>
      <Skeleton variant="text" width="70%" height={28} />
      <Skeleton variant="text" width={90} />
      {Array.from({ length: 5 }, (_, index) => (
        <Skeleton key={index} variant="rounded" height={28} sx={{ mt: 1 }} />
      ))}
    </Box>
  );
}

export function InspectorNotFound() {
  return (
    <Box sx={{ p: 2.5 }}>
      <Typography variant="body2" role="status">
        Ressource introuvable.
      </Typography>
    </Box>
  );
}

export function InspectorError() {
  const router = useRouter();
  return (
    <Box sx={{ p: 2.5 }}>
      <Typography variant="body2" role="alert" sx={{ mb: 1.5 }}>
        Une erreur est survenue. Réessayez.
      </Typography>
      <Button variant="outlined" size="small" onClick={() => router.refresh()}>
        Réessayer
      </Button>
    </Box>
  );
}
