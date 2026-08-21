import { useEffect, useState } from "react";
import { useTheme, type ThemeChoice } from "@/hooks/useTheme";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { db, getMeta, setMeta } from "@/lib/db";
import { checkForUpdate } from "@/lib/pwaUpdate";

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "Système" },
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [isPremium, setIsPremium] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  useEffect(() => {
    getMeta("isPremium", false).then(setIsPremium);
  }, []);

  async function togglePremium() {
    const next = !isPremium;
    setIsPremium(next);
    await setMeta("isPremium", next);
  }

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

      <Card className="border-amber bg-amber-tint">
        <p className="font-semibold text-amber-strong">Passer Premium</p>
        <p className="mt-1 text-sm text-ink-soft">
          Sans publicité · statistiques avancées · export PDF.
        </p>
        <Button size="md" variant={isPremium ? "secondary" : "primary"} className="mt-3" onClick={togglePremium}>
          {isPremium ? "Premium actif — désactiver (démo)" : "Activer Premium (démo)"}
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
