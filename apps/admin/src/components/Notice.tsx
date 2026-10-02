"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

// Liste fermée : aucun texte libre ne passe par l'adresse.
const NOTICES: Record<string, { text: string; severity: "success" | "warning" }> =
  {
    cree: { text: "Enregistrement créé.", severity: "success" },
    modifie: { text: "Modifications enregistrées.", severity: "success" },
    supprime: { text: "Suppression effectuée.", severity: "success" },
    publie: { text: "Contenu publié.", severity: "success" },
    depublie: { text: "Contenu dépublié.", severity: "success" },
    ordre: { text: "Ordre enregistré.", severity: "success" },
    introuvable: { text: "Ressource introuvable.", severity: "warning" },
  };

// Affiche l'avis porté par ?avis=, puis retire le paramètre de l'adresse.
export default function Notice() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const code = searchParams.get("avis");
  const [shown, setShown] = useState<string | null>(null);
  const [seen, setSeen] = useState<string | null>(null);

  // Un nouvel avis dans l'adresse est retenu pendant le rendu, puis l'adresse
  // en est débarrassée.
  if (code !== seen) {
    setSeen(code);
    if (code && NOTICES[code]) {
      setShown(code);
    }
  }

  useEffect(() => {
    if (!code) {
      return;
    }
    const rest = new URLSearchParams(searchParams.toString());
    rest.delete("avis");
    const query = rest.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [code, pathname, router, searchParams]);

  const notice = shown ? NOTICES[shown] : undefined;

  return (
    <Snackbar
      open={Boolean(notice)}
      autoHideDuration={5000}
      onClose={() => setShown(null)}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity={notice?.severity ?? "success"}
        variant="filled"
        role="status"
        onClose={() => setShown(null)}
      >
        {notice?.text}
      </Alert>
    </Snackbar>
  );
}
