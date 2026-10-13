"use client";

import { Fragment, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { quickSearch, type QuickSearchResult } from "@/app/(admin)/actions";

const DEBOUNCE_MS = 250;

export type Destination = { href: string; label: string };

type Result = { key: string; href: string; primary: string; secondary?: string };
type Group = { label: string; results: Result[] };

const noSubscribe = () => () => {};

// Libellé du raccourci selon la plateforme (⌘ sur Mac, Ctrl ailleurs).
function useShortcutLabel() {
  return useSyncExternalStore(
    noSubscribe,
    () => (/Mac|iPhone|iPad/.test(navigator.platform) ? "⌘ K" : "Ctrl K"),
    () => "Ctrl K",
  );
}

const CONTENT_GROUPS: { key: keyof QuickSearchResult; label: string }[] = [
  { key: "members", label: "Membres" },
  { key: "actions", label: "Actions" },
  { key: "news", label: "Actualités" },
  { key: "applications", label: "Candidatures" },
];

// Recherche rapide (Ctrl+K) : les écrans, filtrés dans le navigateur, et les
// contenus, cherchés par une action serveur. Entrée ouvre le résultat
// surligné.
export default function CommandSearch({
  destinations,
}: {
  destinations: Destination[];
}) {
  const router = useRouter();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const shortcut = useShortcutLabel();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [found, setFound] = useState<{ query: string; result: QuickSearchResult } | null>(
    null,
  );
  const [active, setActive] = useState(0);

  // Le raccourci vaut partout, y compris dans un champ.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const query = text.trim();
  useEffect(() => {
    if (!open || query.length < 2) {
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      quickSearch(query).then(
        (result) => {
          // Une réponse pour un texte dépassé est ignorée.
          if (!cancelled) {
            setFound({ query, result });
          }
        },
        () => {
          if (!cancelled) {
            setFound({
              query,
              result: { members: [], actions: [], news: [], applications: [] },
            });
          }
        },
      );
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [open, query]);

  const lower = query.toLowerCase();
  const screens: Result[] = destinations
    .filter((d) => !lower || d.label.toLowerCase().includes(lower))
    .map((d) => ({ key: `ecran-${d.href}`, href: d.href, primary: d.label }));
  const current = query.length >= 2 && found?.query === query ? found.result : null;
  const groups: Group[] = [
    { label: "Écrans", results: screens },
    ...CONTENT_GROUPS.map(({ key, label }) => ({
      label,
      results: (current?.[key] ?? []).map((hit) => ({
        key: `${key}-${hit.id}`,
        href: hit.href,
        primary: hit.primary,
        secondary: hit.secondary,
      })),
    })),
  ].filter((group) => group.results.length > 0);
  const results = groups.flatMap((group) => group.results);
  // Rang de chaque résultat dans la liste complète (navigation au clavier).
  const rank = new Map(results.map((result, i) => [result.key, i]));
  const loading = query.length >= 2 && found?.query !== query;
  const activeIndex = Math.min(active, Math.max(results.length - 1, 0));

  const close = () => {
    setOpen(false);
    setText("");
    setFound(null);
    setActive(0);
  };
  const go = (result: Result | undefined) => {
    if (!result) {
      return;
    }
    close();
    router.push(result.href);
  };
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(Math.min(activeIndex + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(activeIndex - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      go(results[activeIndex]);
    }
  };

  return (
    <>
      <ButtonBase
        onClick={() => setOpen(true)}
        aria-label={`Rechercher (${shortcut})`}
        aria-haspopup="dialog"
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          gap: 1,
          width: 280,
          height: 32,
          px: 1.25,
          border: 1,
          borderColor: "var(--grid-rule-strong)",
          borderRadius: "2px",
          color: "text.secondary",
          fontSize: "0.8125rem",
          justifyContent: "flex-start",
          "&:hover": { borderColor: "text.secondary" },
        }}
      >
        <SearchIcon sx={{ fontSize: 16 }} />
        <Box component="span" sx={{ flex: 1, textAlign: "left" }}>
          Rechercher…
        </Box>
        <Box
          component="kbd"
          sx={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6875rem",
            px: 0.5,
            border: 1,
            borderColor: "divider",
            bgcolor: "var(--grid-chrome)",
          }}
        >
          {shortcut}
        </Box>
      </ButtonBase>
      <IconButton
        aria-label="Rechercher"
        onClick={() => setOpen(true)}
        size="small"
        sx={{ display: { md: "none" } }}
      >
        <SearchIcon fontSize="small" />
      </IconButton>

      <Dialog
        open={open}
        onClose={close}
        fullWidth
        maxWidth="sm"
        fullScreen={fullScreen}
        // Ouverte au clavier très souvent : aucune transition.
        transitionDuration={0}
        sx={{ "& .MuiDialog-container": { alignItems: { sm: "flex-start" } } }}
        slotProps={{ paper: { sx: { mt: { sm: "12vh" } }, "aria-label": "Recherche" } }}
      >
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
          <TextField
            autoFocus
            placeholder="Écran, membre, action, actualité, candidature"
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            slotProps={{
              htmlInput: {
                role: "combobox",
                "aria-expanded": true,
                "aria-autocomplete": "list",
                "aria-label": "Rechercher",
                "aria-controls": "recherche-resultats",
                "aria-activedescendant": results[activeIndex]
                  ? `recherche-${results[activeIndex].key}`
                  : undefined,
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ fontSize: 18 }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>
        <Box sx={{ height: 2 }}>{loading && <LinearProgress />}</Box>
        <List
          id="recherche-resultats"
          role="listbox"
          aria-label="Résultats"
          dense
          sx={{ py: 0.5, maxHeight: { sm: 440 }, overflowY: "auto" }}
        >
          {groups.map((group) => (
            <Fragment key={group.label}>
              <Typography
                role="presentation"
                variant="overline"
                color="text.secondary"
                component="div"
                sx={{ px: 2, pt: 1 }}
              >
                {group.label}
              </Typography>
              {group.results.map((result) => {
                const i = rank.get(result.key) ?? 0;
                return (
                  <ListItemButton
                    key={result.key}
                    id={`recherche-${result.key}`}
                    role="option"
                    aria-selected={i === activeIndex}
                    selected={i === activeIndex}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(result)}
                    sx={{ mx: 0.5 }}
                  >
                    <ListItemText
                      primary={result.primary}
                      secondary={result.secondary}
                      slotProps={{
                        primary: { sx: { fontWeight: 600, fontSize: "0.8125rem" } },
                        secondary: { noWrap: true, sx: { fontSize: "0.75rem" } },
                      }}
                    />
                  </ListItemButton>
                );
              })}
            </Fragment>
          ))}
          {results.length === 0 && !loading && (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2 }}>
              Aucun résultat
            </Typography>
          )}
        </List>
      </Dialog>
    </>
  );
}
