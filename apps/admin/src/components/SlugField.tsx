"use client";

import TextField from "@mui/material/TextField";

// Slug : généré par l'API s'il est laissé vide ; jamais recalculé ici quand
// le titre change.
export default function SlugField({
  defaultValue,
  error,
}: {
  defaultValue: string;
  error?: string;
}) {
  return (
    <TextField
      name="slug"
      label="Slug"
      defaultValue={defaultValue}
      error={Boolean(error)}
      helperText={
        error ??
        "Laissé vide, il est généré à partir du titre. Minuscules, chiffres et tirets."
      }
      slotProps={{ htmlInput: { maxLength: 120 } }}
    />
  );
}
