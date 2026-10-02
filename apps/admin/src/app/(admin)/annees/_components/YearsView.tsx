"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import PageHeader from "@/components/PageHeader";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { createYear, deleteYear } from "../actions";

export type YearRow = {
  id: string;
  label: string;
  start: string;
  end: string;
  isCurrent: boolean;
};

function CreateYearDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createYear,
    EMPTY_FORM_STATE,
  );
  const error = state.fieldErrors?.startYear;

  useEffect(() => {
    if (state.ok) {
      onClose();
      router.replace("/annees?avis=cree");
    }
  }, [state, onClose, router]);

  return (
    <Dialog open onClose={onClose} aria-labelledby="nouvelle-annee" fullWidth maxWidth="xs">
      <form action={formAction} noValidate>
        <DialogTitle id="nouvelle-annee">Nouvelle année Rotary</DialogTitle>
        <DialogContent>
          {state.message && (
            <Alert severity="error" role="alert" sx={{ mb: 2 }}>
              {state.message}
            </Alert>
          )}
          <TextField
            name="startYear"
            type="number"
            label="Année de début"
            required
            autoFocus
            defaultValue={(state.values.startYear as string) ?? ""}
            error={Boolean(error)}
            helperText={
              error ?? "L'année commence le 1er juillet de cette année-là."
            }
            slotProps={{ htmlInput: { min: 2000, max: 2100, step: 1 } }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={pending}>
            Créer
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default function YearsView({ years }: { years: YearRow[] }) {
  const [creating, setCreating] = useState(false);
  const createButton = (
    <Button variant="contained" onClick={() => setCreating(true)}>
      Nouvelle année
    </Button>
  );

  return (
    <>
      <PageHeader title="Années Rotary">{createButton}</PageHeader>
      <Paper>
        {years.length === 0 ? (
          <EmptyState
            filtered={false}
            resetHref="/annees"
            emptyText="Aucune année Rotary. Créez la première : mandats, actions et actualités s'y rattachent."
          >
            {createButton}
          </EmptyState>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Année</TableCell>
                  <TableCell>Début</TableCell>
                  <TableCell>Fin</TableCell>
                  <TableCell>État</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {years.map((year) => (
                  <TableRow key={year.id} hover>
                    <TableCell component="th" scope="row">
                      {year.label}
                    </TableCell>
                    <TableCell>{year.start}</TableCell>
                    <TableCell>{year.end}</TableCell>
                    <TableCell>
                      {year.isCurrent && (
                        <Chip label="En cours" color="primary" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <ConfirmDialog
                        triggerLabel="Supprimer"
                        ariaLabel={`Supprimer l'année ${year.label}`}
                        title="Supprimer cette année ?"
                        text={`L'année ${year.label} sera supprimée. Une année à laquelle se rattachent des mandats, des actions ou des actualités ne peut pas l'être.`}
                        action={deleteYear.bind(null, year.id)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      {creating && <CreateYearDialog onClose={() => setCreating(false)} />}
    </>
  );
}
