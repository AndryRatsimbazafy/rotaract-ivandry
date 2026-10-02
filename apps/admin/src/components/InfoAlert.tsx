"use client";

import Alert from "@mui/material/Alert";

// Information affichée depuis une page rendue sur le serveur.
export default function InfoAlert({
  children,
  severity = "info",
}: {
  children: React.ReactNode;
  severity?: "info" | "warning" | "error";
}) {
  return (
    <Alert severity={severity} role={severity === "error" ? "alert" : "status"}>
      {children}
    </Alert>
  );
}
