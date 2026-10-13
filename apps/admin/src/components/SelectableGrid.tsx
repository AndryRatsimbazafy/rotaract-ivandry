"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { withSelection } from "@/lib/navigation";

// Délai avant d'inscrire dans l'adresse une ligne choisie au clavier : un
// parcours rapide ne lit que la dernière fiche.
const KEYBOARD_DELAY_MS = 150;

type Options = {
  ids: string[];
  // Ligne choisie lue dans l'adresse par la page.
  selected: string | null;
  // Fiche complète d'une ligne ; absente quand il n'y en a pas (années).
  hrefOf?: (id: string) => string;
};

// Un clic venu d'un bouton ou d'un lien de la ligne, ou d'un dialogue ouvert
// depuis elle (portail React), garde son propre effet.
function fromRow(event: React.MouseEvent): boolean {
  const target = event.target as HTMLElement;
  return (
    event.currentTarget.contains(target) && !target.closest("a, button, input")
  );
}

// Sélection d'une ligne de grille (apps/admin/DESIGN.md, « Grilles ») : clic
// ou Espace choisit, ↑ ↓ passent à la voisine, Entrée ou double-clic ouvrent
// la fiche. La ligne est marquée tout de suite ; l'adresse suit
// (paramètre selection), sans nouvelle entrée d'historique.
export function useRowSelection({ ids, selected, hrefOf }: Options) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [chosen, setChosen] = useState(selected);
  const [seen, setSeen] = useState(selected);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rows = useRef(new Map<string, HTMLTableRowElement>());

  // L'adresse a changé (retour, fermeture de l'aperçu) : elle fait foi.
  if (selected !== seen) {
    setSeen(selected);
    setChosen(selected);
  }

  useEffect(
    () => () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
    },
    [],
  );

  const current = () => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  const choose = (id: string, delay = 0) => {
    setChosen(id);
    if (timer.current) {
      clearTimeout(timer.current);
    }
    const go = () => router.replace(withSelection(current(), id), { scroll: false });
    if (delay) {
      timer.current = setTimeout(go, delay);
    } else {
      go();
    }
  };

  const open = (id: string) => {
    if (hrefOf) {
      router.push(hrefOf(id));
    }
  };

  const move = (from: string, step: number) => {
    const index = ids.indexOf(from) + step;
    const next = ids[index];
    if (next) {
      choose(next, KEYBOARD_DELAY_MS);
      const row = rows.current.get(next);
      row?.focus();
      row?.scrollIntoView({ block: "nearest" });
    }
  };

  // Ligne qui reçoit le focus quand on entre dans la grille au clavier.
  const focusable = chosen && ids.includes(chosen) ? chosen : ids[0];

  const rowProps = (id: string) => ({
    ref: (element: HTMLTableRowElement | null) => {
      if (element) {
        rows.current.set(id, element);
      } else {
        rows.current.delete(id);
      }
    },
    hover: true,
    selected: chosen === id,
    "aria-selected": chosen === id,
    tabIndex: id === focusable ? 0 : -1,
    sx: {
      cursor: "pointer",
      "&:focus-visible": { outline: 2, outlineColor: "primary.main", outlineOffset: -2 },
    },
    onClick: (event: React.MouseEvent) => {
      if (!fromRow(event)) {
        return;
      }
      choose(id);
    },
    onDoubleClick: (event: React.MouseEvent) => {
      if (!fromRow(event)) {
        return;
      }
      open(id);
    },
    onKeyDown: (event: React.KeyboardEvent) => {
      // Raccourcis de la grille seulement quand la ligne elle-même a le focus.
      if (event.target !== event.currentTarget) {
        return;
      }
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        move(id, event.key === "ArrowDown" ? 1 : -1);
      } else if (event.key === " ") {
        event.preventDefault();
        choose(id);
      } else if (event.key === "Enter") {
        event.preventDefault();
        open(id);
      }
    },
  });

  return { chosen, rowProps };
}
