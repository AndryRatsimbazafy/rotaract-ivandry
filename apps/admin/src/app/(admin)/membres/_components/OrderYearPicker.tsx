"use client";

import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";

export default function OrderYearPicker({
  labels,
  current,
}: {
  labels: string[];
  current: string;
}) {
  const router = useRouter();
  return (
    <TextField
      select
      label="Année Rotary"
      value={current}
      onChange={(event) =>
        router.push(
          event.target.value
            ? `/membres/ordre?annee=${event.target.value}`
            : "/membres/ordre",
        )
      }
      slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      sx={{ maxWidth: 240, mb: 2 }}
    >
      <option value="">Choisir une année</option>
      {labels.map((label) => (
        <option key={label} value={label}>
          {label}
        </option>
      ))}
    </TextField>
  );
}
