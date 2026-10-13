"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import FieldList from "@/components/FieldList";
import { InspectorPanel } from "@/components/Inspector";
import InspectorLayout, { secondaryCell } from "@/components/InspectorLayout";
import PageHeader from "@/components/PageHeader";
import RowMenu from "@/components/RowMenu";
import { useRowSelection } from "@/components/SelectableGrid";
import SideSheet from "@/components/SideSheet";
import { CurrentYearMark } from "@/components/StatusMark";
import { EMPTY_FORM_STATE } from "@/lib/form-state";
import { tabularNums } from "@/theme/theme";
import { createYear, deleteYear } from "../actions";

export type YearRow = {
  id: string;
  label: string;
  start: string;
  end: string;
  isCurrent: boolean;
};

const deleteText = (label: string) =>
  `L'année ${label} sera supprimée. Une année à laquelle se rattachent des mandats, des actions ou des actualités ne peut pas l'être.`;

// Création d'une année dans un panneau latéral : la liste reste en place.
function CreateYearSheet({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createYear, EMPTY_FORM_STATE);
  const error = state.fieldErrors?.startYear;

  useEffect(() => {
    if (state.ok) {
      onClose();
      router.replace("/annees?avis=cree");
    }
  }, [state, onClose, router]);

  return (
    <SideSheet open onClose={onClose} title="Nouvelle année Rotary">
      <form action={formAction} noValidate>
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
          helperText={error ?? "L'année commence le 1er juillet de cette année-là."}
          slotProps={{ htmlInput: { min: 2000, max: 2100, step: 1 } }}
          sx={{ mt: 1 }}
        />
        <Stack direction="row" spacing={1} sx={{ mt: 3, justifyContent: "flex-end" }}>
          <Button onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button type="submit" variant="contained" disabled={pending}>
            Créer
          </Button>
        </Stack>
      </form>
    </SideSheet>
  );
}

// Aperçu d'une année : ce que la liste fournit déjà, sans autre lecture.
function YearInspector({ year }: { year: YearRow }) {
  return (
    <InspectorPanel
      title={year.label}
      marks={year.isCurrent ? <CurrentYearMark /> : undefined}
      actions={
        <ConfirmDialog
          triggerLabel="Supprimer"
          variant="outlined"
          ariaLabel={`Supprimer l'année ${year.label}`}
          title="Supprimer cette année ?"
          text={deleteText(year.label)}
          action={deleteYear.bind(null, year.id)}
        />
      }
    >
      <FieldList
        labelWidth={110}
        fields={[
          { label: "Début", value: year.start, numeric: true },
          { label: "Fin", value: year.end, numeric: true },
        ]}
      />
    </InspectorPanel>
  );
}

export default function YearsView({
  years,
  selected,
}: {
  years: YearRow[];
  selected: string | null;
}) {
  const [creating, setCreating] = useState(false);
  // Aucune fiche à ouvrir : Entrée ne fait rien.
  const { chosen, rowProps } = useRowSelection({
    ids: years.map((year) => year.id),
    selected,
  });
  const inspected = years.find((year) => year.id === chosen);
  const createButton = (
    <Button variant="contained" onClick={() => setCreating(true)}>
      Nouvelle année
    </Button>
  );

  const grid =
    years.length === 0 ? (
      <EmptyState
        filtered={false}
        resetHref="/annees"
        emptyText="Aucune année Rotary. Créez la première : mandats, actions et actualités s'y rattachent."
      >
        {createButton}
      </EmptyState>
    ) : (
      <TableContainer sx={{ borderTop: 1, borderColor: "divider" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>Année</TableCell>
              <TableCell>État</TableCell>
              <TableCell sx={secondaryCell}>Début</TableCell>
              <TableCell sx={secondaryCell}>Fin</TableCell>
              <TableCell align="right">
                <span className="visually-hidden">Actions</span>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {years.map((year) => (
              <TableRow key={year.id} {...rowProps(year.id)}>
                <TableCell
                  component="th"
                  scope="row"
                  sx={{ ...tabularNums, fontWeight: 600 }}
                >
                  {year.label}
                </TableCell>
                <TableCell>{year.isCurrent && <CurrentYearMark />}</TableCell>
                <TableCell sx={{ ...secondaryCell, ...tabularNums }}>{year.start}</TableCell>
                <TableCell sx={{ ...secondaryCell, ...tabularNums }}>{year.end}</TableCell>
                <TableCell align="right" sx={{ width: 48, py: 0 }}>
                  <RowMenu
                    name={`l'année ${year.label}`}
                    remove={{
                      title: "Supprimer cette année ?",
                      text: deleteText(year.label),
                      action: deleteYear.bind(null, year.id),
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );

  return (
    <>
      <PageHeader title="Années Rotary" actions={createButton} />
      <InspectorLayout
        grid={grid}
        inspector={inspected ? <YearInspector year={inspected} /> : null}
      />
      {creating && <CreateYearSheet onClose={() => setCreating(false)} />}
    </>
  );
}
