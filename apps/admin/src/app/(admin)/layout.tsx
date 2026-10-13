import AppShell from "@/components/AppShell";
import { ApiError, apiRead } from "@/lib/api";
import type { Admin, Listed } from "@/types/api";
import type { RotaryYear } from "@/types/rotary-year";
import { logout } from "./actions";

// Espace protégé. Le proxy a vérifié la présence du cookie ; la vérification
// réelle est ici, auprès de l'API, et de nouveau à chaque lecture.
export default async function AdminLayout({ children }: LayoutProps<"/">) {
  let email = "";
  let currentYearLabel: string | null = null;
  const [me, years] = await Promise.allSettled([
    apiRead<Admin>("/auth/me"),
    apiRead<Listed<RotaryYear>>("/admin/rotary-years"),
  ]);
  if (me.status === "fulfilled") {
    email = me.value.email;
  } else if (!(me.reason instanceof ApiError)) {
    // Session refusée : apiRead a redirigé, la redirection est relancée. API
    // injoignable (ApiError) : le cadre reste affiché, et l'écran demandé
    // montre l'erreur avec « Réessayer ».
    throw me.reason;
  }
  if (years.status === "fulfilled") {
    // Pied de la barre latérale : « — » sans année en cours ou en cas d'échec.
    currentYearLabel = years.value.data.find((year) => year.isCurrent)?.label ?? null;
  }
  return (
    <AppShell email={email} currentYearLabel={currentYearLabel} logoutAction={logout}>
      {children}
    </AppShell>
  );
}
