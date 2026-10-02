import AppShell from "@/components/AppShell";
import { ApiError, apiRead } from "@/lib/api";
import type { Admin } from "@/types/api";
import { logout } from "./actions";

// Espace protégé. Le proxy a vérifié la présence du cookie ; la vérification
// réelle est ici, auprès de l'API, et de nouveau à chaque lecture.
export default async function AdminLayout({ children }: LayoutProps<"/">) {
  let email = "";
  try {
    email = (await apiRead<Admin>("/auth/me")).email;
  } catch (error) {
    // Session refusée : apiRead a déjà redirigé. API injoignable : le cadre
    // reste affiché, et l'écran demandé montre l'erreur avec « Réessayer ».
    if (!(error instanceof ApiError)) {
      throw error;
    }
  }
  return (
    <AppShell email={email} logoutAction={logout}>
      {children}
    </AppShell>
  );
}
