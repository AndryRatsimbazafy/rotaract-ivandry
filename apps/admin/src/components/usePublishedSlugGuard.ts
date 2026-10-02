"use client";

import { useRef, useState } from "react";

// Avant l'envoi : si le contenu est publié et que le slug saisi diffère du
// slug d'origine, la confirmation est demandée.
export function usePublishedSlugGuard(published: boolean, originalSlug: string) {
  const [open, setOpen] = useState(false);
  const confirmed = useRef(false);
  const form = useRef<HTMLFormElement | null>(null);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    form.current = event.currentTarget;
    if (confirmed.current) {
      confirmed.current = false;
      return;
    }
    const slug = new FormData(event.currentTarget).get("slug");
    if (published && typeof slug === "string" && slug.trim() !== originalSlug) {
      event.preventDefault();
      setOpen(true);
    }
  };

  return {
    open,
    onSubmit,
    cancel: () => setOpen(false),
    confirm: () => {
      setOpen(false);
      confirmed.current = true;
      form.current?.requestSubmit();
    },
  };
}
