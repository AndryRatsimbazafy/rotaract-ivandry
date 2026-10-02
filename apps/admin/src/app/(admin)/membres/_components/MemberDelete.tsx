"use client";

import Box from "@mui/material/Box";
import ConfirmDialog from "@/components/ConfirmDialog";
import { deleteMember } from "../actions";

export default function MemberDelete({
  id,
  name,
  returnTo,
}: {
  id: string;
  name: string;
  returnTo: string;
}) {
  return (
    <Box sx={{ mt: 4 }}>
      <ConfirmDialog
        triggerLabel="Supprimer ce membre"
        variant="outlined"
        title="Supprimer ce membre ?"
        text={`${name} sera supprimé. Ses mandats seront supprimés avec lui.`}
        action={deleteMember.bind(null, id, returnTo)}
      />
    </Box>
  );
}
