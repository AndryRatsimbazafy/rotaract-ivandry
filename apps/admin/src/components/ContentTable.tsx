"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { ActionResult } from "@/lib/form-state";
import ConfirmDialog from "./ConfirmDialog";
import EmptyState from "./EmptyState";
import ListPagination from "./ListPagination";
import ListToolbar, { type ListFilter } from "./ListToolbar";
import RowAction from "./RowAction";
import SortableHeader from "./SortableHeader";

export type ContentRow = {
  id: string;
  title: string;
  date: string;
  year: string;
  isPublished: boolean;
  createdAt: string;
  // Colonne propre à la ressource : type d'une actualité, ordre d'une action.
  extra: string;
};

type Props = {
  // « /actions » ou « /actualites ».
  base: string;
  newHref: string;
  newLabel: string;
  emptyText: string;
  // Nom donné à l'élément dans les confirmations : « L'action », « L'actualité ».
  itemName: string;
  extraLabel: string;
  dateLabel: string;
  rows: ContentRow[];
  filters: ListFilter[];
  errors: string[];
  filtered: boolean;
  page: number;
  limit: number;
  total: number;
  returnTo: string;
  publishAction: (
    id: string,
    isPublished: boolean,
    returnTo: string,
  ) => Promise<ActionResult>;
  deleteAction: (id: string, returnTo: string) => Promise<ActionResult>;
};

const hiddenBelowSm = { display: { xs: "none", sm: "table-cell" } };

// Liste des actions ou des actualités : mêmes colonnes d'état, de titre, de
// date et d'année, mêmes tris, mêmes opérations.
export default function ContentTable({
  base,
  newHref,
  newLabel,
  emptyText,
  itemName,
  extraLabel,
  dateLabel,
  rows,
  filters,
  errors,
  filtered,
  page,
  limit,
  total,
  returnTo,
  publishAction,
  deleteAction,
}: Props) {
  const back = `?retour=${encodeURIComponent(returnTo)}`;

  return (
    <>
      <ListToolbar
        searchLabel="Chercher dans le titre et le résumé"
        filters={filters}
        errors={errors}
      />
      <Paper>
        {rows.length === 0 ? (
          <EmptyState filtered={filtered} resetHref={base} emptyText={emptyText}>
            <Button component={Link} href={newHref} variant="contained">
              {newLabel}
            </Button>
          </EmptyState>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>État</TableCell>
                    <SortableHeader field="title" label="Titre" defaultSort="-date" />
                    <SortableHeader field="date" label={dateLabel} defaultSort="-date" />
                    <TableCell sx={hiddenBelowSm}>Année</TableCell>
                    <TableCell sx={hiddenBelowSm}>{extraLabel}</TableCell>
                    <SortableHeader
                      field="createdAt"
                      label="Création"
                      defaultSort="-date"
                      hideBelowSm
                    />
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.isPublished ? "Publié" : "Brouillon"}
                          color={row.isPublished ? "success" : "default"}
                          variant={row.isPublished ? "filled" : "outlined"}
                        />
                      </TableCell>
                      <TableCell component="th" scope="row">
                        {row.title}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>{row.date}</TableCell>
                      <TableCell sx={hiddenBelowSm}>{row.year}</TableCell>
                      <TableCell sx={hiddenBelowSm}>{row.extra}</TableCell>
                      <TableCell sx={hiddenBelowSm}>{row.createdAt}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Button
                          component={Link}
                          href={`${base}/${row.id}${back}`}
                          size="small"
                          aria-label={`Ouvrir ${row.title}`}
                        >
                          Ouvrir
                        </Button>
                        <RowAction
                          label={row.isPublished ? "Dépublier" : "Publier"}
                          ariaLabel={`${row.isPublished ? "Dépublier" : "Publier"} ${row.title}`}
                          action={publishAction.bind(
                            null,
                            row.id,
                            !row.isPublished,
                            returnTo,
                          )}
                        />
                        <ConfirmDialog
                          triggerLabel="Supprimer"
                          ariaLabel={`Supprimer ${row.title}`}
                          title="Confirmer la suppression"
                          text={`${itemName} « ${row.title} » sera supprimée définitivement.`}
                          action={deleteAction.bind(null, row.id, returnTo)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <ListPagination page={page} limit={limit} total={total} />
          </>
        )}
      </Paper>
    </>
  );
}
