import { param } from "@/lib/navigation";
import LoginForm from "./_components/LoginForm";

export default async function ConnexionPage({
  searchParams,
}: PageProps<"/connexion">) {
  const expired = param(await searchParams, "motif") === "expiree";
  return <LoginForm expired={expired} />;
}
