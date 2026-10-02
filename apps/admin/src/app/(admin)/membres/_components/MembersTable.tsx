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
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import ListPagination from "@/components/ListPagination";
import ListToolbar, { type ListFilter } from "@/components/ListToolbar";
import SortableHeader from "@/components/SortableHeader";
import { deleteMember } from "../actions";

export type MemberRow = {
  id: string;
  firstName: string;
  lastName: string;
  occupation: string;
  email: string;
  phone: string;
  createdAt: string;
};

type Props = {
  rows: MemberRow[];
  filters: ListFilter[];
  errors: string[];
  filtered: boolean;
  page: number;
  limit: number;
  total: number;
  // Adresse de cette liste, avec son état : retour depuis une fiche.
  returnTo: string;
};

const hiddenBelowSm = { display: { xs: "none", sm: "table-cell" } };

export default function MembersTable({
  rows,
  filters,
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
        searchLabel="Chercher un nom ou un prénom"
        filters={filters}
        errors={errors}
      />
      <Paper>
        {rows.length === 0 ? (
          <EmptyState
            filtered={filtered}
            resetHref="/membres"
            emptyText="Aucun membre."
          >
            <Button component={Link} href="/membres/nouveau" variant="contained">
              Nouveau membre
            </Button>
          </EmptyState>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <SortableHeader field="lastName" label="Nom" defaultSort="lastName" />
                    <TableCell>Prénom</TableCell>
                    <TableCell>Profession ou études</TableCell>
                    <TableCell sx={hiddenBelowSm}>Email</TableCell>
                    <TableCell sx={hiddenBelowSm}>Téléphone</TableCell>
                    <SortableHeader
                      field="createdAt"
                      label="Création"
                      defaultSort="lastName"
                      hideBelowSm
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
                      <TableCell>{row.occupation}</TableCell>
                      <TableCell sx={hiddenBelowSm}>{row.email}</TableCell>
                      <TableCell sx={hiddenBelowSm}>{row.phone}</TableCell>
                      <TableCell sx={hiddenBelowSm}>{row.createdAt}</TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        <Button
                          component={Link}
                          href={`/membres/${row.id}${back}`}
                          size="small"
                          aria-label={`Ouvrir ${row.firstName} ${row.lastName}`}
                        >
                          Ouvrir
                        </Button>
                        <ConfirmDialog
                          triggerLabel="Supprimer"
                          ariaLabel={`Supprimer ${row.firstName} ${row.lastName}`}
                          title="Supprimer ce membre ?"
                          text={`${row.firstName} ${row.lastName} sera supprimé. Ses mandats seront supprimés avec lui.`}
                          action={deleteMember.bind(null, row.id, returnTo)}
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
