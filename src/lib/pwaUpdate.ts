import { registerSW } from "virtual:pwa-register";

let registration: ServiceWorkerRegistration | null = null;

/**
 * Enregistre le service worker au démarrage (appelé une fois depuis
 * main.tsx) et garde une référence à l'enregistrement pour permettre une
 * vérification manuelle des mises à jour (bouton "Vérifier les mises à
 * jour" dans Réglages). Utile car la vérification automatique du navigateur
 * ne se déclenche qu'à la navigation — ce qui peut ne jamais arriver sur un
 * PWA iOS ouvert depuis l'écran d'accueil et laissé en arrière-plan pendant
 * des jours, laissant l'utilisateur bloqué sur une vieille version.
 */
registerSW({
  immediate: true,
  onRegisteredSW(_url, reg) {
    registration = reg ?? null;
  },
});

/**
 * Force une vérification réseau du service worker. Avec registerType
 * "autoUpdate", une nouvelle version trouvée s'active automatiquement sans
 * confirmation à afficher — il suffit de recharger la page juste après pour
 * charger les nouveaux fichiers. Retourne false si aucun service worker
 * n'est enregistré (mode développement, navigateur non compatible).
 */
export async function checkForUpdate(): Promise<boolean> {
  if (!registration) return false;
  await registration.update();
  return true;
}

// Revérifie automatiquement à chaque retour au premier plan de l'app — pas
// seulement au rechargement manuel. Un PWA repris depuis l'écran d'accueil
// (ou l'app-switcher) ne déclenche jamais de vraie navigation, donc le
// navigateur ne relance jamais son propre check tout seul dans ce cas ;
// c'est précisément ce qui laissait certains appareils bloqués sur une
// vieille version malgré "autoUpdate". Avec un service worker trouvé,
// l'activation et le rechargement restent automatiques (voir registerSW
// ci-dessus) — l'utilisateur n'a rien à faire.
let lastCheck = 0;
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState !== "visible") return;
  const now = Date.now();
  if (now - lastCheck < 60_000) return;
  lastCheck = now;
  checkForUpdate();
});
