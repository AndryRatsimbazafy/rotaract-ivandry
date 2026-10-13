"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import EmptyState from "@/components/EmptyState";
import InspectorLayout, { secondaryCell } from "@/components/InspectorLayout";
import ListPagination from "@/components/ListPagination";
import ListToolbar, { type ListFilter } from "@/components/ListToolbar";
import RowMenu from "@/components/RowMenu";
import { useRowSelection } from "@/components/SelectableGrid";
import SortableHeader from "@/components/SortableHeader";
import { withSelection } from "@/lib/navigation";
import { tabularNums } from "@/theme/theme";
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
  selected: string | null;
  inspector: React.ReactNode;
};

export default function MembersTable({
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
}: Props) {
  const back = `?retour=${encodeURIComponent(returnTo)}`;
  const hrefOf = (id: string) => `/membres/${id}${back}`;
  const { rowProps } = useRowSelection({
    ids: rows.map((row) => row.id),
    selected,
    hrefOf,
  });

  const grid =
    rows.length === 0 ? (
      <EmptyState filtered={filtered} resetHref="/membres" emptyText="Aucun membre.">
        <Button component={Link} href="/membres/nouveau" variant="contained">
          Nouveau membre
        </Button>
      </EmptyState>
    ) : (
      <>
        <TableContainer sx={{ borderTop: 1, borderColor: "divider" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <SortableHeader field="lastName" label="Nom" defaultSort="lastName" />
                <TableCell>Prénom</TableCell>
                <TableCell sx={secondaryCell}>Profession ou études</TableCell>
                <TableCell sx={secondaryCell}>Email</TableCell>
                <TableCell sx={secondaryCell}>Téléphone</TableCell>
                <SortableHeader
                  field="createdAt"
                  label="Création"
                  defaultSort="lastName"
                  sx={secondaryCell}
                />
                <TableCell align="right">
                  <span className="visually-hidden">Actions</span>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row) => {
                const name = `${row.firstName} ${row.lastName}`;
                return (
                  <TableRow key={row.id} {...rowProps(row.id)}>
                    <TableCell component="th" scope="row" sx={{ fontWeight: 600 }}>
                      {row.lastName}
                    </TableCell>
                    <TableCell>{row.firstName}</TableCell>
                    <TableCell sx={secondaryCell}>{row.occupation}</TableCell>
                    <TableCell sx={secondaryCell}>{row.email}</TableCell>
                    <TableCell sx={{ ...secondaryCell, ...tabularNums, whiteSpace: "nowrap" }}>
                      {row.phone}
                    </TableCell>
                    <TableCell sx={{ ...secondaryCell, ...tabularNums }}>
                      {row.createdAt}
                    </TableCell>
                    <TableCell align="right" sx={{ width: 48, py: 0 }}>
                      <RowMenu
                        name={name}
                        openHref={hrefOf(row.id)}
                        remove={{
                          title: "Supprimer ce membre ?",
                          text: `${name} sera supprimé. Ses mandats seront supprimés avec lui.`,
                          action: deleteMember.bind(null, row.id, withSelection(returnTo, null)),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <ListPagination page={page} limit={limit} total={total} />
      </>
    );

  return (
    <>
      <ListToolbar
        searchLabel="Chercher un nom ou un prénom"
        filters={filters}
        errors={errors}
      />
      <InspectorLayout grid={grid} inspector={inspector} />
    </>
  );
}
