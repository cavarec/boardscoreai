import { useState } from "react";
import { useTheme, type ThemeChoice } from "@/hooks/useTheme";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { checkForUpdate } from "@/lib/pwaUpdate";
import { SITE_URL } from "@/lib/site";

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "Système" },
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
];

const APP_URL = SITE_URL;

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  async function resetData() {
    if (!confirm("Supprimer toutes les parties et joueurs locaux ?")) return;
    await db.transaction(
      "rw",
      [db.matches, db.players, db.scores, db.scoreRounds, db.rankings],
      async () => {
        await db.matches.clear();
        await db.players.clear();
        await db.scores.clear();
        await db.scoreRounds.clear();
        await db.rankings.clear();
      }
    );
    location.reload();
  }

  async function handleCheckUpdate() {
    setCheckingUpdate(true);
    const hasServiceWorker = await checkForUpdate();
    if (!hasServiceWorker) {
      alert("Aucun service worker actif ici (normal en développement).");
      setCheckingUpdate(false);
      return;
    }
    // Laisse le temps au service worker de s'activer (registerType
    // "autoUpdate" l'active automatiquement dès qu'il est trouvé) avant de
    // recharger pour charger les nouveaux fichiers.
    setTimeout(() => location.reload(), 800);
  }

  async function shareApp() {
    const text = `J'utilise BoardScore pour compter les points de nos jeux de société — gratuit, sans compte, sans pub. Je te le conseille : ${APP_URL}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: "BoardScore", text, url: APP_URL });
      } catch {
        // Partage annulé par l'utilisateur : rien à faire.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setShareFeedback("Lien copié dans le presse-papiers.");
    } catch {
      setShareFeedback("Impossible de copier automatiquement.");
    }
    setTimeout(() => setShareFeedback(null), 3000);
  }

  return (
    <div className="flex flex-col gap-5 px-5 pt-8 pb-8">
      <h1 className="font-display text-2xl font-bold">Réglages</h1>

      <Card>
        <p className="mb-2 font-medium">Apparence</p>
        <div className="flex gap-2">
          {THEME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTheme(opt.value)}
              className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                theme === opt.value
                  ? "border-felt bg-felt-tint text-felt-strong"
                  : "border-line-strong text-ink-soft"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="border-felt bg-felt-tint">
        <p className="font-semibold text-felt-strong">Faire découvrir l'app</p>
        <p className="mt-1 text-sm text-ink-soft">
          Vous appréciez BoardScore ? Partagez-le à vos amis joueurs.
        </p>
        {shareFeedback && (
          <p className="mt-2 text-sm text-ink-faint">{shareFeedback}</p>
        )}
        <Button size="md" className="mt-3" onClick={shareApp}>
          Partager l'app
        </Button>
      </Card>

      <Button variant="danger" size="md" onClick={resetData}>
        Réinitialiser les données locales
      </Button>

      <Button variant="secondary" size="md" disabled={checkingUpdate} onClick={handleCheckUpdate}>
        {checkingUpdate ? "Vérification..." : "Vérifier les mises à jour"}
      </Button>

      <p className="text-center font-mono text-xs text-ink-faint">
        Version {__APP_VERSION__}
      </p>
      <p className="text-center font-mono text-xs text-ink-faint">© RonCav2026</p>
    </div>
  );
}
