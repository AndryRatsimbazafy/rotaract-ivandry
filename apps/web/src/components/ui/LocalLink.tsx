"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { langOf, localize } from "@/lib/locale";

type LocalLinkProps = Omit<ComponentProps<typeof Link>, "href"> & { href: string };

/**
 * Lien interne qui suit la langue de la page (fonctionnalité 014) : une adresse
 * française reçoit /en sur une page anglaise. Une adresse déjà anglaise ou
 * externe reste telle quelle.
 */
export default function LocalLink({ href, ...props }: LocalLinkProps) {
  const pathname = usePathname();
  return <Link href={localize(href, langOf(pathname))} {...props} />;
}
