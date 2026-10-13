"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import FormHelperText from "@mui/material/FormHelperText";
import FormLabel from "@mui/material/FormLabel";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ConfirmDialog from "@/components/ConfirmDialog";
import { SectionHeading } from "@/components/PageHeader";
import SideSheet from "@/components/SideSheet";
import { EMPTY_FORM_STATE, type FormState } from "@/lib/form-state";
import { MEMBER_ROLE_LABELS, MEMBER_ROLE_OPTIONS } from "@/lib/labels";
import type { MemberMandate, MemberRole } from "@/types/member";
import { tabularNums } from "@/theme/theme";
import type { YearRef } from "@/types/rotary-year";
import { createMandate, deleteMandate, updateMandateRoles } from "../actions";

type Props = {
  memberId: string;
  memberName: string;
  mandates: MemberMandate[];
  years: YearRef[];
};

type DialogProps = {
  title: string;
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  notice: "cree" | "modifie";
  // Année imposée (modification) ou à choisir (création).
  fixedYear?: string;
  years?: YearRef[];
  roles: MemberRole[];
  onClose: () => void;
};

// Saisie d'un mandat dans un panneau latéral : la fiche reste en place.
function MandateSheet({
  title,
  action,
  notice,
  fixedYear,
  years = [],
  roles,
  onClose,
}: DialogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, formAction, pending] = useActionState(action, EMPTY_FORM_STATE);
  const errors = state.fieldErrors ?? {};
  const checked = Array.isArray(state.values.roles) ? state.values.roles : roles;

  useEffect(() => {
    if (state.ok) {
      onClose();
      const next = new URLSearchParams(searchParams.toString());
      next.set("avis", notice);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    }
  }, [state, notice, onClose, pathname, router, searchParams]);

  return (
    <SideSheet open onClose={onClose} title={title}>
      <form action={formAction} noValidate>
          {state.message && (
            <Alert severity="error" role="alert" sx={{ mb: 2 }}>
              {state.message}
            </Alert>
          )}
          {fixedYear ? (
            <Typography sx={{ mb: 2 }}>
              Année :{" "}
              <Box component="span" sx={{ ...tabularNums, fontWeight: 600 }}>
                {fixedYear}
              </Box>
            </Typography>
          ) : (
            <TextField
              select
              name="rotaryYear"
              label="Année Rotary"
              required
              defaultValue={(state.values.rotaryYear as string) ?? years[0]?.id ?? ""}
              error={Boolean(errors.rotaryYear)}
              helperText={errors.rotaryYear}
              slotProps={{ select: { native: true }, inputLabel: { shrink: true } }}
              sx={{ mt: 1, mb: 2 }}
            >
              {years.map((year) => (
                <option key={year.id} value={year.id}>
                  {year.label}
                </option>
              ))}
            </TextField>
          )}
          <FormControl component="fieldset" error={Boolean(errors.roles)}>
            <FormLabel component="legend">
              Fonctions (aucune, une ou plusieurs)
            </FormLabel>
            <FormGroup
              sx={{ display: "grid", gridTemplateColumns: "1fr" }}
            >
              {MEMBER_ROLE_OPTIONS.map(({ value, label }) => (
                <FormControlLabel
                  key={value}
                  label={label}
                  control={
                    <Checkbox
                      name="roles"
                      value={value}
                      defaultChecked={checked.includes(value)}
                      size="small"
                    />
                  }
                />
              ))}
            </FormGroup>
            {errors.roles && <FormHelperText>{errors.roles}</FormHelperText>}
          </FormControl>
        <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
          <Button onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={pending}>
            Enregistrer
          </Button>
        </Stack>
      </form>
    </SideSheet>
  );
}

// Mandats d'un membre : une année, zéro à plusieurs fonctions. L'ordre
// d'affichage se règle pour toute l'année, sur l'écran d'ordre.
export default function MandatesSection({
  memberId,
  memberName,
  mandates,
  years,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<MemberMandate | null>(null);

  const here = new URLSearchParams(searchParams.toString());
  here.delete("avis");
  const returnTo = here.toString() ? `${pathname}?${here.toString()}` : pathname;

  return (
    <Box component="section" aria-labelledby="mandats" sx={{ mt: 4, maxWidth: 720 }}>
      <SectionHeading
        id="mandats"
        title="Mandats"
        actions={
          <Button
            variant="outlined"
            size="small"
            onClick={() => setAdding(true)}
            disabled={years.length === 0}
          >
            Ajouter un mandat
          </Button>
        }
      />
      {years.length === 0 && (
        <Alert
          severity="info"
          sx={{ mb: 2 }}
          action={
            <Button component={Link} href="/annees" color="inherit" size="small">
              Années Rotary
            </Button>
          }
        >
          Créez d&apos;abord une année Rotary.
        </Alert>
      )}
      <Box sx={{ border: 1, borderColor: "divider" }}>
        {mandates.length === 0 ? (
          <Typography variant="body2" sx={{ p: 2 }} color="text.secondary">
            Aucun mandat.
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Année</TableCell>
                  <TableCell>Fonctions</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {mandates.map((mandate) => (
                  <TableRow key={mandate.id}>
                    <TableCell
                      component="th"
                      scope="row"
                      sx={{ whiteSpace: "nowrap", ...tabularNums, fontWeight: 600 }}
                    >
                      {mandate.rotaryYear.label}
                    </TableCell>
                    <TableCell>
                      {mandate.roles.length
                        ? mandate.roles
                            .map((role) => MEMBER_ROLE_LABELS[role])
                            .join(", ")
                        : "Sans fonction"}
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <Button
                        size="small"
                        onClick={() => setEditing(mandate)}
                        aria-label={`Modifier les fonctions du mandat ${mandate.rotaryYear.label}`}
                      >
                        Modifier les fonctions
                      </Button>
                      <Button
                        component={Link}
                        size="small"
                        href={`/membres/ordre?annee=${mandate.rotaryYear.label}`}
                        aria-label={`Ordre de l'année ${mandate.rotaryYear.label}`}
                      >
                        Ordre de l&apos;année
                      </Button>
                      <ConfirmDialog
                        triggerLabel="Supprimer"
                        ariaLabel={`Supprimer le mandat ${mandate.rotaryYear.label}`}
                        title="Supprimer ce mandat ?"
                        text={`Le mandat ${mandate.rotaryYear.label} de ${memberName} sera supprimé. Le membre et l'année sont conservés.`}
                        action={deleteMandate.bind(null, mandate.id, returnTo)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
      {adding && (
        <MandateSheet
          title="Ajouter un mandat"
          action={createMandate.bind(null, memberId)}
          notice="cree"
          years={years}
          roles={[]}
          onClose={() => setAdding(false)}
        />
      )}
      {editing && (
        <MandateSheet
          title="Modifier les fonctions"
          action={updateMandateRoles.bind(null, editing.id)}
          notice="modifie"
          fixedYear={editing.rotaryYear.label}
          roles={editing.roles}
          onClose={() => setEditing(null)}
        />
      )}
    </Box>
  );
}
