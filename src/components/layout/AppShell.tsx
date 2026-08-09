import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/layout/BottomNav";

/** Layout des écrans principaux (accessibles via la navigation basse). */
export function AppShell() {
  return (
    <div className="mx-auto flex h-screen max-w-xl flex-col bg-paper">
      <div className="min-h-0 flex-1 overflow-y-auto pb-4">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

/** Layout des écrans de parcours (scan, saisie de score…) : pas de nav basse,
 * chaque page pose sa propre TopBar avec bouton retour. */
export function FlowShell() {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col bg-paper">
      <Outlet />
    </div>
  );
}
