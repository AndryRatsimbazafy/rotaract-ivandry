"use client";

import { useState } from "react";
import CheckIcon from "@mui/icons-material/Check";
import DarkModeOutlined from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlined from "@mui/icons-material/LightModeOutlined";
import SettingsBrightnessOutlined from "@mui/icons-material/SettingsBrightnessOutlined";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { useColorScheme } from "@mui/material/styles";

const MODES = [
  { value: "light", label: "Clair", Icon: LightModeOutlined },
  { value: "dark", label: "Sombre", Icon: DarkModeOutlined },
  { value: "system", label: "Comme le système", Icon: SettingsBrightnessOutlined },
] as const;

// Choix du thème (clair, sombre ou celui du système), gardé par MUI dans le
// navigateur. mode est indéfini avant l'hydratation : icône « système ».
export default function ColorModeButton() {
  const { mode, setMode } = useColorScheme();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = MODES.find((m) => m.value === mode) ?? MODES[2];

  return (
    <>
      <Tooltip title="Thème">
        <IconButton
          aria-label={`Thème : ${current.label}`}
          aria-haspopup="menu"
          onClick={(event) => setAnchor(event.currentTarget)}
          size="small"
        >
          <current.Icon fontSize="small" />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {MODES.map(({ value, label, Icon }) => (
          <MenuItem
            key={value}
            selected={value === mode}
            onClick={() => {
              setMode(value);
              setAnchor(null);
            }}
          >
            <ListItemIcon>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText>{label}</ListItemText>
            {value === mode && <CheckIcon fontSize="small" sx={{ ml: 2 }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
