import { useRef, useState } from "react";
import { useTheme, type ThemeChoice } from "@/hooks/useTheme";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { checkForUpdate } from "@/lib/pwaUpdate";
import { SITE_HOST, SITE_URL } from "@/lib/site";
import { backupFileName, buildBackup, importBackup, readBackupFile } from "@/lib/backup";

// Ancienne adresse de l'app (Vercel) : on y rappelle de sauvegarder avant de changer d'adresse.
const OLD_HOSTS = ["boardscoreai.vercel.app"];

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
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const onOldAddress = OLD_HOSTS.includes(location.host);

  async function exportData() {
    setBackupMessage(null);
    try {
      const backup = await buildBackup();
      const count = backup.data.matches.length;
      const blob = new Blob([JSON.stringify(backup)], { type: "application/json" });
      const file = new File([blob], backupFileName(), { type: "application/json" });
      // Sur téléphone, le partage natif permet d'enregistrer le fichier ou de se
      // l'envoyer (Fichiers, e-mail, AirDrop...) ; sinon, téléchargement classique.
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "Sauvegarde BoardScore" });
          setBackupMessage(`${count} partie(s) exportée(s).`);
        } catch {
          // Partage annulé : rien à faire.
        }
        return;
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = backupFileName();
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setBackupMessage(`${count} partie(s) exportée(s).`);
    } catch {
      setBackupMessage("L'export a échoué.");
    }
  }

  async function importData(file: File | undefined) {
    if (!file) return;
    setBackupMessage(null);
    try {
      const summary = await importBackup(await readBackupFile(file));
      setBackupMessage(
        `${summary.matches} partie(s) importée(s)` +
          (summary.skippedMatches ? `, ${summary.skippedMatches} ignorée(s) (jeu inconnu).` : "."),
      );
    } catch (e) {
      setBackupMessage(e instanceof Error ? e.message : "L'import a échoué.");
    } finally {
      if (fileInput.current) fileInput.current.value = "";
    }
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

      {onOldAddress && (
        <Card className="border-brick bg-brick-tint">
          <p className="font-semibold text-brick">BoardScore change d'adresse</p>
          <p className="mt-1 text-sm text-ink-soft">
            Nouvelle adresse : <span className="font-mono">{SITE_HOST}</span>. Vos parties restent sur cet appareil et
            cette adresse : exportez-les ci-dessous, ouvrez la nouvelle adresse, puis importez le fichier.
          </p>
        </Card>
      )}

      <Card>
        <p className="font-medium">Sauvegarde des parties</p>
        <p className="mt-1 text-sm text-ink-soft">
          Exportez vos parties dans un fichier pour les garder en sécurité ou les retrouver sur un autre appareil ou une
          autre adresse. L'import ajoute les parties sans rien supprimer.
        </p>
        {backupMessage && <p className="mt-2 text-sm text-ink-faint">{backupMessage}</p>}
        <div className="mt-3 flex gap-2">
          <Button size="md" variant="secondary" className="flex-1" onClick={exportData}>
            Exporter
          </Button>
          <Button size="md" variant="secondary" className="flex-1" onClick={() => fileInput.current?.click()}>
            Importer
          </Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => importData(e.target.files?.[0])}
        />
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
