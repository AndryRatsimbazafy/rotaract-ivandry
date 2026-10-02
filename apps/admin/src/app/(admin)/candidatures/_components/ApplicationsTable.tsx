"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import EmptyState from "@/components/EmptyState";
import ListPagination from "@/components/ListPagination";
import ListToolbar from "@/components/ListToolbar";
import SortableHeader from "@/components/SortableHeader";

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
};

const hiddenBelowSm = { display: { xs: "none", sm: "table-cell" } };

// Consultation seulement : ni création, ni filtre par situation.
export default function ApplicationsTable({
  rows,
  errors,
  filtered,
  page,
  limit,
  total,
  returnTo,
}: Props) {
  const back = `?retour=${encodeURIComponent(returnTo)}`;

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
      <Paper>
        {rows.length === 0 ? (
          <EmptyState
            filtered={filtered}
            resetHref="/candidatures"
            emptyText="Aucune candidature."
          />
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <SortableHeader field="lastName" label="Nom" defaultSort="-createdAt" />
                    <TableCell>Prénom</TableCell>
                    <TableCell sx={hiddenBelowSm}>Email</TableCell>
                    <TableCell>Situation</TableCell>
                    <SortableHeader
                      field="createdAt"
                      label="Date de candidature"
                      defaultSort="-createdAt"
                    />
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell component="th" scope="row">
                        {row.lastName}
                      </TableCell>
                      <TableCell>{row.firstName}</TableCell>
                      <TableCell sx={hiddenBelowSm}>{row.email}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {row.createdAt}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          component={Link}
                          href={`/candidatures/${row.id}${back}`}
                          size="small"
                          aria-label={`Ouvrir la candidature de ${row.firstName} ${row.lastName}`}
                        >
                          Ouvrir
                        </Button>
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
