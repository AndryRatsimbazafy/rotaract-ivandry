"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import TableCell from "@mui/material/TableCell";
import TableSortLabel from "@mui/material/TableSortLabel";

type Props = {
  // Champ de tri du contrat de l'API.
  field: string;
  label: string;
  // Tri appliqué quand l'adresse n'en porte pas.
  defaultSort: string;
  hideBelowSm?: boolean;
};

// En-tête de colonne triable : bascule entre « champ » et « -champ ».
export default function SortableHeader({
  field,
  label,
  defaultSort,
  hideBelowSm,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("tri") || defaultSort;
  const active = current === field || current === `-${field}`;
  const descending = current === `-${field}`;

  const next = new URLSearchParams(searchParams.toString());
  next.set("tri", active && !descending ? `-${field}` : field);
  next.delete("page");
  next.delete("avis");

  return (
    <TableCell
      aria-sort={active ? (descending ? "descending" : "ascending") : undefined}
      sx={hideBelowSm ? { display: { xs: "none", sm: "table-cell" } } : undefined}
    >
      <TableSortLabel
        component={Link}
        href={`${pathname}?${next.toString()}`}
        active={active}
        direction={descending ? "desc" : "asc"}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
}
