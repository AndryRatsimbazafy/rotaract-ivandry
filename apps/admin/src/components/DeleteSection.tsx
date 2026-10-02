"use client";

import Box from "@mui/material/Box";
import type { ActionResult } from "@/lib/form-state";
import ConfirmDialog from "./ConfirmDialog";

// Suppression depuis une fiche.
export default function DeleteSection({
  label,
  title,
  text,
  action,
}: {
  label: string;
  title: string;
  text: string;
  action: () => Promise<ActionResult>;
}) {
  return (
    <Box sx={{ mt: 4 }}>
      <ConfirmDialog
        triggerLabel={label}
        variant="outlined"
        title={title}
        text={text}
        action={action}
      />
    </Box>
  );
}
