"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PublishedSlugDialog from "@/components/PublishedSlugDialog";
import RotaryYearField from "@/components/RotaryYearField";
import SlugField from "@/components/SlugField";
import { useFocusFirstError } from "@/components/useFocusFirstError";
import { usePublishedSlugGuard } from "@/components/usePublishedSlugGuard";
import type { ComparableYear } from "@/lib/dates";
import {
  EMPTY_FORM_STATE,
  fieldValue,
  type FormState,
} from "@/lib/form-state";
import { FOCUS_AREA_OPTIONS } from "@/lib/labels";

export type ActionFormInitial = {
  values: Record<string, string>;
  focusAreas: string[];
  isPublished: boolean;
  // « Première publication le … », si elle a eu lieu.
  publishedAt?: string;
};

type Props = {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  initial?: ActionFormInitial;
  // Années, bornes au format du champ de date (AAAA-MM-JJ).
  years: ComparableYear[];
  returnTo: string;
};

const IMPACT_FIELDS = [
  { name: "impact.objective", label: "Objectif" },
  { name: "impact.beneficiaries", label: "Bénéficiaires" },
  { name: "impact.location", label: "Lieu" },
  { name: "impact.period", label: "Période" },
  { name: "impact.results", label: "Résultats" },
];

const NO_INITIAL: ActionFormInitial = {
  values: {},
  focusAreas: [],
  isPublished: false,
};

export default function ActionForm({
  action,
  initial = NO_INITIAL,
  years,
  returnTo,
}: Props) {
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const ref = useFocusFirstError(state);
  const errors = state.fieldErrors ?? {};
  const value = (name: string) => fieldValue(state, initial.values, name);
  const [date, setDate] = useState(initial.values.date ?? "");
  const guard = usePublishedSlugGuard(
    initial.isPublished,
    initial.values.slug ?? "",
  );
  const focusAreas = Array.isArray(state.values.focusAreas)
    ? state.values.focusAreas
    : initial.focusAreas;
  const published =
    "title" in state.values
      ? state.values.isPublished === "true"
      : initial.isPublished;
  const noYear = years.length === 0;

  return (
    <Paper sx={{ p: { xs: 2, sm: 3 }, maxWidth: 720 }}>
      <form action={formAction} onSubmit={guard.onSubmit} ref={ref} noValidate>
        <input type="hidden" name="retour" value={returnTo} />
        <Stack spacing={2}>
          {state.message && (
            <Alert severity="error" role="alert">
              {state.message}
            </Alert>
          )}

          <Typography variant="h2">Contenu</Typography>
          <TextField
            name="title"
            label="Titre"
            required
            defaultValue={value("title")}
            error={Boolean(errors.title)}
            helperText={errors.title}
            slotProps={{ htmlInput: { maxLength: 120 } }}
          />
          <SlugField defaultValue={value("slug")} error={errors.slug} />
          <TextField
            name="summary"
            label="Résumé"
            multiline
            minRows={2}
            defaultValue={value("summary")}
            error={Boolean(errors.summary)}
            helperText={errors.summary}
            slotProps={{ htmlInput: { maxLength: 500 } }}
          />
          <TextField
            name="description"
            label="Description"
            multiline
            minRows={6}
            defaultValue={value("description")}
            error={Boolean(errors.description)}
            helperText={
              errors.description ?? "Séparez les paragraphes par une ligne vide."
            }
            slotProps={{ htmlInput: { maxLength: 20000 } }}
          />

          <Typography variant="h2">Calendrier</Typography>
          <TextField
            name="date"
            type="date"
            label="Date"
            required
            value={date}
            onChange={(event) => setDate(event.target.value)}
            error={Boolean(errors.date)}
            helperText={errors.date}
            slotProps={{ inputLabel: { shrink: true } }}
          />
          <RotaryYearField
            years={years}
            dateValue={date}
            initialYearId={value("rotaryYear") || undefined}
            error={errors.rotaryYear}
          />

          <FormControl component="fieldset" error={Boolean(errors.focusAreas)}>
            <FormLabel component="legend">
              <Typography variant="h2" component="span" color="text.primary">
                Domaines d&apos;action
              </Typography>
            </FormLabel>
            <FormGroup>
              {FOCUS_AREA_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  label={option.label}
                  control={
                    <Checkbox
                      name="focusAreas"
                      value={option.value}
                      defaultChecked={focusAreas.includes(option.value)}
                      size="small"
                    />
                  }
                />
              ))}
            </FormGroup>
            {errors.focusAreas && (
              <FormHelperText>{errors.focusAreas}</FormHelperText>
            )}
          </FormControl>

          <Typography variant="h2">Impact (facultatif)</Typography>
          <Typography color="text.secondary">
            Seules les rubriques renseignées sont enregistrées et affichées.
          </Typography>
          {errors.impact && (
            <Alert severity="error" role="alert">
              {errors.impact}
            </Alert>
          )}
          {IMPACT_FIELDS.map(({ name, label }) => (
            <TextField
              key={name}
              name={name}
              label={label}
              multiline
              defaultValue={value(name)}
              error={Boolean(errors[name])}
              helperText={errors[name]}
              slotProps={{ htmlInput: { maxLength: 500 } }}
            />
          ))}
          <TextField
            name="impact.partners"
            label="Partenaires"
            multiline
            minRows={2}
            defaultValue={value("impact.partners")}
            error={Boolean(errors["impact.partners"])}
            helperText={
              errors["impact.partners"] ??
              "Un partenaire par ligne, 20 au plus, 120 caractères chacun."
            }
          />

          <Typography variant="h2">Publication</Typography>
          <FormControlLabel
            label="Publié"
            control={
              <Switch
                name="isPublished"
                value="true"
                defaultChecked={published}
              />
            }
          />
          {errors.isPublished && (
            <FormHelperText error>{errors.isPublished}</FormHelperText>
          )}
          {initial.publishedAt && (
            <Typography color="text.secondary">
              Première publication le {initial.publishedAt}
            </Typography>
          )}
          <TextField
            name="order"
            type="number"
            label="Ordre manuel"
            defaultValue={value("order")}
            error={Boolean(errors.order)}
            helperText={
              errors.order ??
              "Facultatif. Les actions qui ont un ordre passent en premier."
            }
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            sx={{ maxWidth: 240 }}
          />

          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={pending || noYear}>
              Enregistrer
            </Button>
            <Button component={Link} href={returnTo} disabled={pending}>
              Annuler
            </Button>
          </Stack>
        </Stack>
      </form>
      <PublishedSlugDialog
        open={guard.open}
        onCancel={guard.cancel}
        onConfirm={guard.confirm}
      />
    </Paper>
  );
}
