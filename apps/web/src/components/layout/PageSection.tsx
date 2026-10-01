import type { ReactNode } from "react";

interface PageSectionProps {
  /** Ancre de la section, unique dans la page. */
  id: string;
  title: string;
  children?: ReactNode;
}

export function PageSection({ id, title, children }: PageSectionProps) {
  const titleId = `${id}-titre`;

  return (
    <section id={id} aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      {children}
    </section>
  );
}
