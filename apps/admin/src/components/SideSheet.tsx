"use client";

import { useId } from "react";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

// Panneau latéral droit pour une saisie courte (nouvelle année, mandat) : la
// page reste en place derrière. Plein écran sur téléphone.
export default function SideSheet({
  open,
  onClose,
  title,
  subtitle,
  width = 480,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: React.ReactNode;
  width?: number;
  children: React.ReactNode;
}) {
  const titleId = useId();
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: { width: { xs: "100%", sm: width }, maxWidth: "100%" },
          "aria-labelledby": titleId,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "flex-start",
          justifyContent: "space-between",
          px: 2.5,
          pt: "calc(12px + env(safe-area-inset-top))",
          pb: 1.5,
          borderBottom: 1,
          borderColor: "divider",
          bgcolor: "var(--grid-chrome)",
        }}
      >
        <Box sx={{ minWidth: 0, pt: 0.5 }}>
          <Typography id={titleId} variant="h2">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        <IconButton aria-label="Fermer" onClick={onClose} size="small" sx={{ mr: -1 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          px: 2.5,
          pt: 2.5,
          pb: "calc(20px + env(safe-area-inset-bottom))",
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
}
