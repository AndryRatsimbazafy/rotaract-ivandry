"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import ArrowDownward from "@mui/icons-material/ArrowDownward";
import ArrowUpward from "@mui/icons-material/ArrowUpward";
import { reorderMandates } from "../actions";

export type OrderRow = { id: string; name: string; roles: string };

type Props = {
  rotaryYearId: string;
  rows: OrderRow[];
  returnTo: string;
};

// Ordre d'affichage des membres d'une année, réglé par déplacement puis
// enregistré d'un bloc.
export default function MandateOrderList({ rotaryYearId, rows, returnTo }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState(rows);
  const [error, setError] = useState<string>();
  const [pending, startTransition] = useTransition();
  const moved = useRef<{ id: string; up: boolean } | null>(null);
  const dirty = order.some((row, index) => row.id !== rows[index]?.id);

  // Le focus suit la ligne déplacée.
  useEffect(() => {
    if (moved.current) {
      const { id, up } = moved.current;
      moved.current = null;
      const row = document.getElementById(`mandat-${id}`);
      const buttons = row?.querySelectorAll<HTMLButtonElement>("button");
      const wanted = buttons?.[up ? 0 : 1];
      (wanted && !wanted.disabled ? wanted : buttons?.[up ? 1 : 0])?.focus();
    }
  }, [order]);

  // Avertissement en quittant la page avec un ordre non enregistré.
  useEffect(() => {
    if (!dirty) {
      return;
    }
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const move = (index: number, up: boolean) => {
    const target = up ? index - 1 : index + 1;
    const next = [...order];
    [next[index], next[target]] = [next[target], next[index]];
    moved.current = { id: order[index].id, up };
    setOrder(next);
  };

  const save = () =>
    startTransition(async () => {
      setError(undefined);
      const result = await reorderMandates(
        rotaryYearId,
        order.map(({ id }) => id),
        returnTo,
      );
      if (result?.message) {
        setError(result.message);
      }
    });

  return (
    <Box sx={{ maxWidth: 720 }}>
      {error && (
        <Alert
          severity="error"
          role="alert"
          sx={{ mb: 2 }}
          action={
            <Button color="inherit" size="small" onClick={() => router.refresh()}>
              Recharger
            </Button>
          }
        >
          {error}
        </Alert>
      )}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Rang</TableCell>
                <TableCell>Membre</TableCell>
                <TableCell>Fonctions</TableCell>
                <TableCell align="right">Déplacer</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {order.map((row, index) => (
                <TableRow key={row.id} id={`mandat-${row.id}`}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell component="th" scope="row">
                    {row.name}
                  </TableCell>
                  <TableCell>{row.roles}</TableCell>
                  <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                    <IconButton
                      size="small"
                      aria-label={`Monter ${row.name}`}
                      disabled={index === 0 || pending}
                      onClick={() => move(index, true)}
                    >
                      <ArrowUpward fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      aria-label={`Descendre ${row.name}`}
                      disabled={index === order.length - 1 || pending}
                      onClick={() => move(index, false)}
                    >
                      <ArrowDownward fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" onClick={save} disabled={!dirty || pending}>
          Enregistrer l&apos;ordre
        </Button>
        <Button onClick={() => setOrder(rows)} disabled={!dirty || pending}>
          Annuler les changements
        </Button>
      </Stack>
    </Box>
  );
}
