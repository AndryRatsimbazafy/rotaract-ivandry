"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import type { ActionResult } from "@/lib/form-state";
import { withSelection } from "@/lib/navigation";
import { tabularNums } from "@/theme/theme";
import EmptyState from "./EmptyState";
import InspectorLayout, { secondaryCell } from "./InspectorLayout";
import ListPagination from "./ListPagination";
import ListToolbar, { type ListFilter } from "./ListToolbar";
import RowMenu from "./RowMenu";
import { useRowSelection } from "./SelectableGrid";
import SortableHeader from "./SortableHeader";
import { PublishedMark } from "./StatusMark";

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
  // Vrai quand la colonne propre est un nombre (ordre d'une action).
  extraNumeric?: boolean;
  dateLabel: string;
  rows: ContentRow[];
  filters: ListFilter[];
  errors: string[];
  filtered: boolean;
  page: number;
  limit: number;
  total: number;
  returnTo: string;
  // Ligne choisie (adresse) et sa fiche, lue sur le serveur.
  selected: string | null;
  inspector: React.ReactNode;
  publishAction: (
    id: string,
    isPublished: boolean,
    returnTo: string,
  ) => Promise<ActionResult>;
  deleteAction: (id: string, returnTo: string) => Promise<ActionResult>;
};

// Liste des actions ou des actualités : mêmes colonnes d'état, de titre, de
// date et d'année, mêmes tris, mêmes opérations, avec l'aperçu de la ligne
// choisie.
export default function ContentTable({
  base,
  newHref,
  newLabel,
  emptyText,
  itemName,
  extraLabel,
  extraNumeric = false,
  dateLabel,
  rows,
  filters,
  errors,
  filtered,
  page,
  limit,
  total,
  returnTo,
  selected,
  inspector,
  publishAction,
  deleteAction,
}: Props) {
  const back = `?retour=${encodeURIComponent(returnTo)}`;
  const hrefOf = (id: string) => `${base}/${id}${back}`;
  const { rowProps } = useRowSelection({
    ids: rows.map((row) => row.id),
    selected,
    hrefOf,
  });

  const grid =
    rows.length === 0 ? (
      <EmptyState filtered={filtered} resetHref={base} emptyText={emptyText}>
        <Button component={Link} href={newHref} variant="contained">
          {newLabel}
        </Button>
      </EmptyState>
    ) : (
      <>
        <TableContainer sx={{ borderTop: 1, borderColor: "divider" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>État</TableCell>
                <SortableHeader field="title" label="Titre" defaultSort="-date" />
                <SortableHeader field="date" label={dateLabel} defaultSort="-date" />
                <TableCell sx={secondaryCell}>Année</TableCell>
                <TableCell sx={secondaryCell}>{extraLabel}</TableCell>
                <SortableHeader
                  field="createdAt"
                  label="Création"
                  defaultSort="-date"
                  sx={secondaryCell}
                />
                <TableCell align="right">
                  <span className="visually-hidden">Actions</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} {...rowProps(row.id)}>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>
                    <PublishedMark isPublished={row.isPublished} />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {row.title}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", ...tabularNums }}>
                    {row.date}
                  </TableCell>
                  <TableCell sx={{ ...secondaryCell, ...tabularNums }}>{row.year}</TableCell>
                  <TableCell sx={{ ...secondaryCell, ...(extraNumeric && tabularNums) }}>
                    {row.extra}
                  </TableCell>
                  <TableCell sx={{ ...secondaryCell, ...tabularNums }}>
                    {row.createdAt}
                  </TableCell>
                  <TableCell align="right" sx={{ width: 48, py: 0 }}>
                    <RowMenu
                      name={row.title}
                      openHref={hrefOf(row.id)}
                      publish={{
                        isPublished: row.isPublished,
                        action: publishAction.bind(null, row.id, !row.isPublished, returnTo),
                      }}
                      remove={{
                        title: "Confirmer la suppression",
                        text: `${itemName} « ${row.title} » sera supprimée définitivement.`,
                        action: deleteAction.bind(
                          null,
                          row.id,
                          withSelection(returnTo, null),
                        ),
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <ListPagination page={page} limit={limit} total={total} />
      </>
    );

  return (
    <>
      <ListToolbar
        searchLabel="Chercher dans le titre et le résumé"
        filters={filters}
        errors={errors}
      />
      <InspectorLayout grid={grid} inspector={inspector} />
    </>
  );
}
