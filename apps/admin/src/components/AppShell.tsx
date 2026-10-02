"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import ArticleOutlined from "@mui/icons-material/ArticleOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import HomeOutlined from "@mui/icons-material/HomeOutlined";
import InboxOutlined from "@mui/icons-material/InboxOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import VolunteerActivismOutlined from "@mui/icons-material/VolunteerActivismOutlined";
import Notice from "./Notice";

const DRAWER_WIDTH = 240;

const ENTRIES = [
  { href: "/", label: "Accueil", icon: <HomeOutlined /> },
  { href: "/annees", label: "Années Rotary", icon: <CalendarMonthOutlined /> },
  { href: "/membres", label: "Membres", icon: <GroupsOutlined /> },
  { href: "/actions", label: "Actions", icon: <VolunteerActivismOutlined /> },
  { href: "/actualites", label: "Actualités", icon: <ArticleOutlined /> },
  { href: "/candidatures", label: "Candidatures", icon: <InboxOutlined /> },
];

type Props = {
  email: string;
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
};

// Cadre de l'espace protégé : navigation, compte, déconnexion.
export default function AppShell({ email, logoutAction, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navigation = (
    <Box component="nav" aria-label="Navigation principale">
      <Toolbar />
      <List>
        {ENTRIES.map(({ href, label, icon }) => {
          const current =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <ListItemButton
              key={href}
              component={Link}
              href={href}
              selected={current}
              aria-current={current ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        component="a"
        href="#contenu"
        sx={{
          position: "absolute",
          left: -9999,
          zIndex: (theme) => theme.zIndex.tooltip,
          bgcolor: "background.paper",
          color: "primary.main",
          p: 1.5,
          "&:focus": { left: 8, top: 8 },
        }}
      >
        Aller au contenu
      </Box>
      <AppBar
        position="fixed"
        color="primary"
        elevation={0}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Menu"
            onClick={() => setOpen(true)}
            sx={{ display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography sx={{ fontWeight: 700, flexGrow: 1 }} noWrap>
            Administration — Rotaract Club Ivandry
          </Typography>
          <Typography
            variant="body2"
            noWrap
            sx={{ display: { xs: "none", sm: "block" } }}
          >
            {email}
          </Typography>
          <form action={logoutAction}>
            <Button type="submit" color="inherit" variant="outlined" size="small">
              Se déconnecter
            </Button>
          </form>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {navigation}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": { width: DRAWER_WIDTH },
        }}
      >
        {navigation}
      </Drawer>
      <Box
        component="main"
        id="contenu"
        tabIndex={-1}
        sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 }, outline: "none" }}
      >
        <Toolbar />
        {children}
      </Box>
      <Suspense>
        <Notice />
      </Suspense>
    </Box>
  );
}
