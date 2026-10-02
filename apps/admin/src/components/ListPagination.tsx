"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import TablePagination from "@mui/material/TablePagination";

type Props = { page: number; limit: number; total: number };

// Pagination d'une liste : la page vit dans l'adresse.
export default function ListPagination({ page, limit, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <TablePagination
      component="div"
      count={total}
      page={Math.max(0, page - 1)}
      rowsPerPage={limit}
      rowsPerPageOptions={[limit]}
      onPageChange={(_, next) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(next + 1));
        params.delete("avis");
        router.push(`${pathname}?${params.toString()}`);
      }}
      labelDisplayedRows={({ from, to, count }) =>
        `${from}–${to} sur ${count}`
      }
      slotProps={{
        actions: {
          previousButton: { "aria-label": "Page précédente" },
          nextButton: { "aria-label": "Page suivante" },
        },
      }}
    />
  );
}
