"use client";

import Link from "next/link";
import Button, { type ButtonProps } from "@mui/material/Button";

// Bouton menant à une adresse du Back Office, utilisable depuis une page
// rendue sur le serveur.
export default function LinkButton({
  href,
  ...props
}: ButtonProps & { href: string }) {
  return <Button component={Link} href={href} {...props} />;
}
