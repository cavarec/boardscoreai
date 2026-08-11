import { useEffect, useState } from "react";
import { getMeta, setMeta } from "@/lib/db";

const DISMISSED_KEY = "installBannerDismissed";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandaloneDisplay(): boolean {
  const nav = navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.("(display-mode: standalone)").matches || nav.standalone === true;
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/**
 * Propose l'installation à la première visite web (pas déjà lancé en app
 * installée). Android/Chrome/desktop ont un vrai événement `beforeinstallprompt`
 * qui déclenche l'invite native ; iOS Safari n'expose aucune API pour ça — la
 * seule voie est manuelle (Partager -> Sur l'écran d'accueil), donc on se
 * contente d'expliquer où cliquer plutôt que de prétendre pouvoir l'automatiser.
 */
export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(true);
  const [ios, setIos] = useState(false);

  useEffect(() => {
    if (isStandaloneDisplay()) return;
    setIos(isIos());
    getMeta(DISMISSED_KEY, false).then((wasDismissed) => setDismissed(Boolean(wasDismissed)));

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  function dismiss() {
    setDismissed(true);
    void setMeta(DISMISSED_KEY, true);
  }

  async function install() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    dismiss();
  }

  if (dismissed || (!deferredPrompt && !ios)) return null;

  return (
    <div className="mx-4 mt-3 flex items-start gap-3 rounded-xl border border-felt bg-felt-tint px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-felt-strong">Installez BoardScore AI</p>
        <p className="mt-0.5 text-xs text-ink-soft">
          {ios
            ? "Touchez le bouton Partager de Safari, puis « Sur l'écran d'accueil »."
            : "Ajoutez l'app à votre écran d'accueil pour l'ouvrir en un tap, même hors ligne."}
        </p>
        {!ios && (
          <button
            onClick={install}
            className="mt-2 rounded-lg bg-felt px-3 py-1.5 text-xs font-semibold text-paper-raised"
          >
            Installer
          </button>
        )}
      </div>
      <button
        onClick={dismiss}
        aria-label="Fermer"
        className="shrink-0 rounded-full p-1 text-ink-faint active:bg-paper-sunken"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
