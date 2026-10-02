"use client";

import { useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import type { ComparableYear } from "@/lib/dates";

type Props = {
  // Années, avec leurs bornes déjà préparées par le serveur dans la forme du
  // champ de date : la comparaison se fait sur de simples chaînes.
  years: ComparableYear[];
  // Valeur courante du champ de date du formulaire.
  dateValue: string;
  // Année déjà choisie (modification, ou saisie renvoyée après un refus).
  initialYearId?: string;
  error?: string;
};

// Année Rotary d'un contenu : proposée d'après la date, de façon visible,
// jamais imposée. Un choix de l'administrateur n'est plus écrasé.
export default function RotaryYearField({
  years,
  dateValue,
  initialYearId,
  error,
}: Props) {
  const [chosen, setChosen] = useState(initialYearId ?? "");
  const [manual, setManual] = useState(Boolean(initialYearId));

  if (years.length === 0) {
    return (
      <Alert
        severity="warning"
        action={
          <Button component={Link} href="/annees" color="inherit" size="small">
            Années Rotary
          </Button>
        }
      >
        Créez d&apos;abord une année Rotary.
      </Alert>
    );
  }

  const contains = (year: ComparableYear) =>
    Boolean(dateValue) && year.from <= dateValue && dateValue <= year.to;
  const proposed = years.find(contains);
  const value = manual ? chosen : (proposed?.id ?? "");
  const selected = years.find(({ id }) => id === value);
  const outside = Boolean(selected && dateValue && !contains(selected));

  return (
    <>
      <TextField
        select
        name="rotaryYear"
        label="Année Rotary"
        required
        value={value}
        onChange={(event) => {
          setChosen(event.target.value);
          setManual(true);
        }}
        error={Boolean(error)}
        helperText={
          error ??
          (!manual && proposed ? "Année proposée d'après la date." : undefined)
        }
        slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
      >
        <option value="">Choisir une année</option>
        {years.map((year) => (
          <option key={year.id} value={year.id}>
            {year.label}
          </option>
        ))}
      </TextField>
      {outside && (
        <Alert severity="warning" role="status">
          Cette date ne tombe pas dans l&apos;année Rotary choisie.
        </Alert>
      )}
    </>
  );
}
