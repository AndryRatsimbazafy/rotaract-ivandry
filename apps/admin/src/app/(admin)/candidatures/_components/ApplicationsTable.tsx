"use client";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import EmptyState from "@/components/EmptyState";
import InspectorLayout, { secondaryCell } from "@/components/InspectorLayout";
import ListPagination from "@/components/ListPagination";
import ListToolbar from "@/components/ListToolbar";
import RowMenu from "@/components/RowMenu";
import { useRowSelection } from "@/components/SelectableGrid";
import SortableHeader from "@/components/SortableHeader";
import { tabularNums } from "@/theme/theme";

export type ApplicationRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
};

type Props = {
  rows: ApplicationRow[];
  errors: string[];
  filtered: boolean;
  page: number;
  limit: number;
  total: number;
  returnTo: string;
  selected: string | null;
  inspector: React.ReactNode;
};

// Consultation seulement : ni création, ni filtre par situation. La
// suppression se fait depuis la fiche.
export default function ApplicationsTable({
  rows,
  errors,
  filtered,
  page,
  limit,
  total,
  returnTo,
  selected,
  inspector,
}: Props) {
  const back = `?retour=${encodeURIComponent(returnTo)}`;
  const hrefOf = (id: string) => `/candidatures/${id}${back}`;
  const { rowProps } = useRowSelection({
    ids: rows.map((row) => row.id),
    selected,
    hrefOf,
  });

  const grid =
    rows.length === 0 ? (
      <EmptyState
        filtered={filtered}
        resetHref="/candidatures"
        emptyText="Aucune candidature."
      />
    ) : (
      <>
        <TableContainer sx={{ borderTop: 1, borderColor: "divider" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <SortableHeader field="lastName" label="Nom" defaultSort="-createdAt" />
                <TableCell>Prénom</TableCell>
                <TableCell sx={secondaryCell}>Email</TableCell>
                <TableCell sx={secondaryCell}>Situation</TableCell>
                <SortableHeader
                  field="createdAt"
                  label="Date de candidature"
                  defaultSort="-createdAt"
                />
                <TableCell align="right">
                  <span className="visually-hidden">Actions</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} {...rowProps(row.id)}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                    {row.lastName}
                  </TableCell>
                  <TableCell>{row.firstName}</TableCell>
                  <TableCell sx={secondaryCell}>{row.email}</TableCell>
                  <TableCell sx={secondaryCell}>{row.status}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap", ...tabularNums }}>
                    {row.createdAt}
                  </TableCell>
                  <TableCell align="right" sx={{ width: 48, py: 0 }}>
                    <RowMenu
                      name={`la candidature de ${row.firstName} ${row.lastName}`}
                      openHref={hrefOf(row.id)}
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
        searchLabel="Chercher un prénom, un nom ou un email"
        dates={[
          { name: "du", label: "Du" },
          { name: "au", label: "Au" },
        ]}
        errors={errors}
      />
      <InspectorLayout grid={grid} inspector={inspector} />
    </>
  );
}
