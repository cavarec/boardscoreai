import { useEffect, useState } from "react";
import { useTheme, type ThemeChoice } from "@/hooks/useTheme";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { db, getMeta, setMeta } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";
import { sendLoginLink, signOut } from "@/lib/auth";

const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "Système" },
  { value: "light", label: "Clair" },
  { value: "dark", label: "Sombre" },
];

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    getMeta("isPremium", false).then(setIsPremium);
  }, []);

  async function togglePremium() {
    const next = !isPremium;
    setIsPremium(next);
    await setMeta("isPremium", next);
  }

  async function resetData() {
    if (!confirm("Supprimer toutes les parties, joueurs et modèles communautaires locaux ?")) return;
    await db.transaction(
      "rw",
      [db.matches, db.players, db.scores, db.scoreRounds, db.rankings, db.communityTemplates],
      async () => {
        await db.matches.clear();
        await db.players.clear();
        await db.scores.clear();
        await db.scoreRounds.clear();
        await db.rankings.clear();
        await db.communityTemplates.clear();
      }
    );
    location.reload();
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

      <AccountCard />

      <Card className="border-amber bg-amber-tint">
        <p className="font-semibold text-amber-strong">Passer Premium</p>
        <p className="mt-1 text-sm text-ink-soft">
          Sans publicité · statistiques avancées · export PDF · synchronisation multi-appareils.
        </p>
        <Button size="md" variant={isPremium ? "secondary" : "primary"} className="mt-3" onClick={togglePremium}>
          {isPremium ? "Premium actif — désactiver (démo)" : "Activer Premium (démo)"}
        </Button>
      </Card>

      <Button variant="danger" size="md" onClick={resetData}>
        Réinitialiser les données locales
      </Button>

      <p className="text-center font-mono text-xs text-ink-faint">
        Version {__APP_VERSION__}
      </p>
    </div>
  );
}

/**
 * Connexion par lien envoyé par email : sans ça, une partie créée ne se
 * synchronise jamais (RLS exige created_by = auth.uid()) — elle reste
 * locale à l'appareil, ce qui est le comportement par défaut voulu pour un
 * usage invité, mais pas ce qu'on veut pour du multi-appareils. Pas de
 * code à saisir : le modèle d'email par défaut de Supabase (sans SMTP
 * personnalisé) ne contient qu'un lien cliquable.
 */
function AccountCard() {
  const { session, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <Card>
        <p className="font-medium">Synchronisation cloud</p>
        <p className="text-sm text-ink-faint">Non configuré — mode local uniquement (voir .env.example).</p>
      </Card>
    );
  }

  if (loading) return <Card><p className="text-sm text-ink-faint">Chargement…</p></Card>;

  if (session) {
    return (
      <Card>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-medium">Connecté</p>
            <p className="truncate text-sm text-ink-faint">{session.user.email}</p>
          </div>
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-felt" />
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          Vos parties se sauvegardent en ligne et se retrouvent sur vos autres appareils.
        </p>
        <Button variant="secondary" size="md" className="mt-3" onClick={() => signOut()}>
          Se déconnecter
        </Button>
      </Card>
    );
  }

  async function sendLink() {
    if (!email.trim()) return;
    setBusy(true);
    setError(null);
    const { error } = await sendLoginLink(email.trim());
    setBusy(false);
    if (error) setError(error);
    else setSent(true);
  }

  return (
    <Card>
      <p className="font-medium">Synchronisation cloud</p>
      <p className="mb-3 text-sm text-ink-faint">
        Connectez-vous pour sauvegarder vos parties en ligne et les retrouver sur vos autres appareils.
      </p>

      {sent ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink-soft">
            Lien envoyé à {email} — ouvrez l'email et touchez "Log In" pour vous connecter.
          </p>
          <button
            type="button"
            onClick={() => setSent(false)}
            className="self-start text-sm text-ink-faint underline underline-offset-2"
          >
            Changer d'email / renvoyer
          </button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendLink();
          }}
          className="flex gap-2"
        >
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            className="h-11 min-w-0 flex-1 rounded-lg border border-line-strong bg-paper px-3 text-base outline-none focus:border-felt"
          />
          <Button type="submit" size="md" className="h-11" disabled={busy}>
            Envoyer le lien
          </Button>
        </form>
      )}

      {error && <p className="mt-2 text-sm text-brick">{error}</p>}
    </Card>
  );
}
