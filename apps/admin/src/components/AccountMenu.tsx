"use client";

import { useState } from "react";
import LogoutOutlined from "@mui/icons-material/LogoutOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { BRAND, tabularNums } from "@/theme/theme";

// Compte connecté : email, rôle et déconnexion. L'API n'offre pas de
// changement de mot de passe.
export default function AccountMenu({
  email,
  logoutAction,
}: {
  email: string;
  logoutAction: () => Promise<void>;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  return (
    <>
      <IconButton
        aria-label="Mon compte"
        aria-haspopup="menu"
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ p: 0.75 }}
      >
        <Avatar
          aria-hidden
          sx={{
            width: 28,
            height: 28,
            fontSize: 13,
            fontWeight: 700,
            ...tabularNums,
            bgcolor: BRAND.royalBlue,
            color: "#fff",
          }}
        >
          {(email.charAt(0) || "?").toUpperCase()}
        </Avatar>
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ list: { "aria-label": "Mon compte" } }}
      >
        <Box sx={{ px: 2, pt: 1, pb: 1.5, maxWidth: 280 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, wordBreak: "break-all" }}>
            {email}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Administrateur
          </Typography>
        </Box>
        <Divider />
        <Box component="form" action={logoutAction} sx={{ mt: 0.5 }}>
          <MenuItem component="button" type="submit" sx={{ width: "100%" }}>
            <ListItemIcon>
              <LogoutOutlined fontSize="small" />
            </ListItemIcon>
            Se déconnecter
          </MenuItem>
        </Box>
      </Menu>
    </>
  );
}
