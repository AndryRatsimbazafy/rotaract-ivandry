"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { routes, type RoutePath } from "@/config/routes";

interface NavLinkProps {
  href: RoutePath;
  children: ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isCurrent =
    href === routes.home
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} aria-current={isCurrent ? "page" : undefined}>
      {children}
    </Link>
  );
}
