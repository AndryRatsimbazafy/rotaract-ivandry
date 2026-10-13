"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { withSelection } from "@/lib/navigation";
import { TOPBAR_HEIGHT } from "@/theme/theme";

// Colonnes secondaires d'une grille : à côté de l'aperçu en colonne (dès lg),
// elles n'apparaissent qu'à partir de xl ; sans lui, à partir de sm.
export const secondaryCell = {
  display: { xs: "none", sm: "table-cell", lg: "none", xl: "table-cell" },
} as const;

type Props = {
  grid: React.ReactNode;
  // Fiche de la ligne choisie, ou null : aperçu en invitation.
  inspector: React.ReactNode;
};

// Liste en « grille | aperçu » : aperçu de 360 px en colonne dès lg, en
// tiroir de 400 px en dessous (apps/admin/DESIGN.md, « Aperçu »).
export default function InspectorLayout({ grid, inspector }: Props) {
  const theme = useTheme();
  // Rendu serveur supposé large : le tiroir n'apparaît qu'après hydratation.
  const wide = useMediaQuery(theme.breakpoints.up("lg"), { defaultMatches: true });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const close = () => {
    const query = searchParams.toString();
    router.replace(withSelection(query ? `${pathname}?${query}` : pathname, null), {
      scroll: false,
    });
  };

  const panel = (
    <Box aria-live="polite" sx={{ minWidth: 0 }}>
      {inspector ?? <InspectorPlaceholder />}
    </Box>
  );

  if (!wide) {
    return (
      <>
        {grid}
        <Drawer
          anchor="right"
          open={Boolean(inspector)}
          onClose={close}
          slotProps={{
            paper: { sx: { width: { xs: "100%", sm: 400 }, maxWidth: "100%" } },
          }}
        >
          <Stack
            direction="row"
            sx={{
              justifyContent: "flex-end",
              px: 1,
              pt: "calc(4px + env(safe-area-inset-top))",
              borderBottom: 1,
              borderColor: "divider",
              bgcolor: "var(--grid-chrome)",
            }}
          >
            <IconButton aria-label="Fermer l'aperçu" onClick={close} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
          <Box sx={{ overflowY: "auto", pb: "env(safe-area-inset-bottom)" }}>{panel}</Box>
        </Drawer>
      </>
    );
  }

  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 360px", alignItems: "start" }}>
      <Box sx={{ minWidth: 0 }}>{grid}</Box>
      <Box
        component="aside"
        aria-label="Aperçu"
        sx={{
          position: "sticky",
          top: TOPBAR_HEIGHT,
          maxHeight: `calc(100dvh - ${TOPBAR_HEIGHT}px)`,
          overflowY: "auto",
          borderLeft: 1,
          borderColor: "divider",
          ml: 0,
        }}
      >
        {inspector && (
          <Stack direction="row" sx={{ justifyContent: "flex-end", px: 1, pt: 0.5 }}>
            <IconButton aria-label="Fermer l'aperçu" onClick={close} size="small">
              <CloseIcon fontSize="small" />
            </IconButton>
          </Stack>
        )}
        {panel}
      </Box>
    </Box>
  );
}

// Aperçu sans ligne choisie : ce qu'on peut y faire, au clavier aussi.
export function InspectorPlaceholder() {
  return (
    <Box sx={{ p: 2.5 }}>
      <Typography variant="body2" color="text.secondary">
        Choisissez une ligne pour voir sa fiche.
      </Typography>
      <Typography variant="caption" color="text.secondary" component="p" sx={{ mt: 1 }}>
        ↑ ↓ changer de ligne · Entrée ouvrir la fiche
      </Typography>
    </Box>
  );
}
