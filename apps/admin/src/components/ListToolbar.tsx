"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import type { Option } from "@/lib/labels";

export type ListFilter = {
  // Nom du paramètre d'adresse.
  name: string;
  label: string;
  options: Option[];
};

type Props = {
  searchLabel?: string;
  filters?: ListFilter[];
  // Paramètres d'adresse portant un jour (AAAA-MM-JJ).
  dates?: { name: string; label: string }[];
  // Messages de l'API sur un paramètre refusé.
  errors?: string[];
};

// Recherche et filtres d'une liste. L'état vit dans l'adresse : tout
// changement y est reporté et ramène à la première page.
export default function ListToolbar({
  searchLabel,
  filters = [],
  dates = [],
  errors = [],
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = (name: string, value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }
    next.delete("page");
    next.delete("avis");
    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        useFlexGap
        sx={{ flexWrap: "wrap", alignItems: { sm: "flex-start" } }}
      >
        {searchLabel && (
          <Box
            component="form"
            role="search"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              update("q", String(data.get("q") ?? "").trim());
            }}
            sx={{ display: "flex", gap: 1, flex: "1 1 260px", maxWidth: 420 }}
          >
            <TextField
              key={searchParams.get("q") ?? ""}
              name="q"
              type="search"
              label={searchLabel}
              defaultValue={searchParams.get("q") ?? ""}
            />
            <Button type="submit" variant="outlined">
              Chercher
            </Button>
          </Box>
        )}
        {filters.map((filter) => (
          <TextField
            key={filter.name}
            select
            label={filter.label}
            value={searchParams.get(filter.name) ?? ""}
            onChange={(event) => update(filter.name, event.target.value)}
            slotProps={{
              select: { native: true },
              inputLabel: { shrink: true },
            }}
            sx={{ flex: "0 1 200px" }}
          >
            <option value="">Tous</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </TextField>
        ))}
        {dates.map((date) => (
          <TextField
            key={date.name}
            type="date"
            label={date.label}
            value={searchParams.get(date.name) ?? ""}
            onChange={(event) => update(date.name, event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: "0 1 170px" }}
          />
        ))}
      </Stack>
      {errors.length > 0 && (
        <Alert severity="error" role="alert" sx={{ mt: 1.5 }}>
          {errors.join(" ")}
        </Alert>
      )}
    </Box>
  );
}
