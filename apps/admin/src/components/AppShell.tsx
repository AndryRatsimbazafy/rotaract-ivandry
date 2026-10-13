"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import LanguageOutlined from "@mui/icons-material/LanguageOutlined";
import VolunteerActivismOutlined from "@mui/icons-material/VolunteerActivismOutlined";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { TOPBAR_HEIGHT, tabularNums } from "@/theme/theme";
import AccountMenu from "./AccountMenu";
import { ClubLogo } from "./ClubLogo";
import ColorModeButton from "./ColorModeButton";
import CommandSearch from "./CommandSearch";
import Notice from "./Notice";

const SIDEBAR_WIDTH = 216;
const BOTTOM_NAV_HEIGHT = 64;

type Entry = { href: string; label: string; short: string; Icon: typeof HomeOutlined };

const ENTRIES: Entry[] = [
  { href: "/", label: "Accueil", short: "Accueil", Icon: HomeOutlined },
  { href: "/annees", label: "Années Rotary", short: "Années", Icon: CalendarMonthOutlined },
  { href: "/membres", label: "Membres", short: "Membres", Icon: GroupsOutlined },
  { href: "/actions", label: "Actions", short: "Actions", Icon: VolunteerActivismOutlined },
  { href: "/actualites", label: "Actualités", short: "Actualités", Icon: ArticleOutlined },
  { href: "/candidatures", label: "Candidatures", short: "Candidatures", Icon: InboxOutlined },
  { href: "/site", label: "Site", short: "Site", Icon: LanguageOutlined },
];

// Sur téléphone, six onglets : l'accueil s'atteint par le logo.
const TABS = ENTRIES.slice(1);

// « / » préfixe toutes les adresses : l'accueil n'est actif que seul.
function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

type Props = {
  email: string;
  // Label de l'année Rotary en cours, ou null s'il n'y en a pas.
  currentYearLabel: string | null;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
};

// Cadre de l'espace protégé (contracts/shell.md) : barre latérale et barre
// supérieure dès 900 px ; barre supérieure et onglets en bas en dessous.
export default function AppShell({
  email,
  currentYearLabel,
  logoutAction,
  children,
}: Props) {
  const pathname = usePathname();
  const current = ENTRIES.find(({ href }) => isActive(href, pathname));

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh" }}>
      <Box
        component="a"
        href="#contenu"
        sx={{
          position: "absolute",
          left: 8,
          top: -48,
          zIndex: 2000,
          px: 2,
          py: 1,
          bgcolor: "background.paper",
          color: "text.primary",
          border: 1,
          borderColor: "divider",
          "&:focus": { top: 8 },
        }}
      >
        Aller au contenu
      </Box>

      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100dvh",
          borderRight: 1,
          borderColor: "divider",
          bgcolor: "var(--grid-chrome)",
        }}
      >
        <Sidebar pathname={pathname} currentYearLabel={currentYearLabel} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack
          component="header"
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            minHeight: TOPBAR_HEIGHT,
            pt: "env(safe-area-inset-top)",
            pl: { xs: "max(16px, env(safe-area-inset-left))", md: 3, lg: 4 },
            pr: { xs: "max(8px, env(safe-area-inset-right))", md: 2 },
            borderBottom: 1,
            borderColor: "divider",
            bgcolor: "background.paper",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <Box sx={{ display: { md: "none" } }}>
            <Link href="/" aria-label="Accueil">
              <ClubLogo width={120} eager />
            </Link>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "baseline", minWidth: 0 }}
          >
            <Typography variant="body2" color="text.secondary" noWrap>
              Rotaract Club Ivandry
            </Typography>
            {current && (
              <>
                <Typography variant="body2" color="text.secondary" aria-hidden>
                  /
                </Typography>
                <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                  {current.label}
                </Typography>
              </>
            )}
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
            <CommandSearch
              destinations={ENTRIES.map(({ href, label }) => ({ href, label }))}
            />
            <ColorModeButton />
            <AccountMenu email={email} logoutAction={logoutAction} />
          </Stack>
        </Stack>

        <Box
          component="main"
          id="contenu"
          tabIndex={-1}
          sx={{
            maxWidth: 1440,
            px: { xs: 2, md: 3, lg: 4 },
            pt: { xs: 2.5, md: 3 },
            // Place pour la barre d'onglets du bas (et la zone sûre).
            pb: {
              xs: `calc(${BOTTOM_NAV_HEIGHT + 32}px + env(safe-area-inset-bottom))`,
              md: 5,
            },
            outline: "none",
          }}
        >
          {children}
        </Box>
      </Box>

      <BottomNav pathname={pathname} />
      <Suspense>
        <Notice />
      </Suspense>
    </Box>
  );
}

function Sidebar({
  pathname,
  currentYearLabel,
}: {
  pathname: string;
  currentYearLabel: string | null;
}) {
  return (
    <Stack sx={{ width: "100%", height: "100%" }}>
      <Stack
        sx={{
          minHeight: TOPBAR_HEIGHT,
          px: 2,
          justifyContent: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Link href="/" aria-label="Accueil">
          <ClubLogo width={132} eager />
        </Link>
      </Stack>

      <List
        component="nav"
        aria-label="Navigation principale"
        sx={{ px: 1, py: 1.5, display: "grid", gap: 0.25 }}
      >
        {ENTRIES.map(({ href, label, Icon }) => {
          const active = isActive(href, pathname);
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={active}
              aria-current={active ? "page" : undefined}
              sx={{
                minHeight: 34,
                px: 1.25,
                py: 0,
                color: "text.secondary",
                "&:hover": { color: "text.primary", bgcolor: "action.hover" },
                "&.Mui-selected:hover": { bgcolor: "background.paper" },
                "&.Mui-selected .MuiListItemIcon-root": { color: "primary.main" },
                "&.Mui-selected": {
                  bgcolor: "background.paper",
                  color: "text.primary",
                  outline: 1,
                  outlineColor: "divider",
                  outlineOffset: -1,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 30, color: "inherit" }}>
                <Icon sx={{ fontSize: 18 }} />
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{ primary: { sx: { fontSize: "0.8125rem", fontWeight: 600 } } }}
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ mt: "auto", px: 2, py: 1.5, borderTop: 1, borderColor: "divider" }}>
        <Typography variant="overline" color="text.secondary" component="p">
          Année Rotary
        </Typography>
        <Typography variant="body2" sx={{ ...tabularNums, fontWeight: 600 }}>
          {currentYearLabel ?? "—"}
        </Typography>
      </Box>
    </Stack>
  );
}

// Barre d'onglets du bas (téléphone et tablette étroite).
function BottomNav({ pathname }: { pathname: string }) {
  const active = TABS.find(({ href }) => isActive(href, pathname))?.href ?? false;

  return (
    <Box
      component="nav"
      aria-label="Navigation principale"
      sx={{
        display: { md: "none" },
        position: "fixed",
        insetInline: 0,
        bottom: 0,
        zIndex: 20,
        pb: "env(safe-area-inset-bottom)",
        bgcolor: "background.paper",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <BottomNavigation
        showLabels
        value={active}
        sx={{ height: BOTTOM_NAV_HEIGHT, bgcolor: "transparent" }}
      >
        {TABS.map(({ href, short, label, Icon }) => (
          <BottomNavigationAction
            key={href}
            component={Link}
            href={href}
            value={href}
            label={short}
            aria-label={short === label ? undefined : label}
            icon={<Icon />}
            aria-current={active === href ? "page" : undefined}
            sx={{
              minWidth: 0,
              px: 0.5,
              color: "text.secondary",
              position: "relative",
              "& .MuiBottomNavigationAction-label": {
                // Cinq onglets sur 375 px : « Candidatures » doit tenir.
                fontSize: "0.6875rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                "&.Mui-selected": { fontSize: "0.6875rem" },
              },
              "&.Mui-selected": { color: "primary.main" },
              "&.Mui-selected::before": {
                content: '""',
                position: "absolute",
                top: -1,
                insetInline: "25%",
                height: 2,
                bgcolor: "primary.main",
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Box>
  );
}
