"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { routes, type RoutePath } from "@/config/routes";
import { langOf, localize, stripLang } from "@/lib/locale";

interface NavLinkProps {
  /** Adresse française ; le lien suit la langue de la page. */
  href: RoutePath;
  className?: string;
  children: ReactNode;
}

export function NavLink({ href, className, children }: NavLinkProps) {
  const pathname = usePathname();
  const page = stripLang(pathname);
  const isCurrent =
    href === routes.home ? page === href : page === href || page.startsWith(`${href}/`);

  return (
    <Link
      href={localize(href, langOf(pathname))}
      className={className}
      aria-current={isCurrent ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
