import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createMatch, db, getFullMatch, type FullMatch } from "@/lib/db";
import { useGames } from "@/hooks/useGames";
import { GENERIC_GAME_ID, QUICK_PLAY_GAME_ID } from "@/data/games.seed";

function greeting(): string {
  const h = new Date().getHours();
  return h >= 5 && h < 18 ? "Bonjour !" : "Bonsoir !";
}

/** Même dé que l'icône de l'app (public/icons/icon.svg) : couleurs de marque
 * fixes plutôt que les tokens de thème, pour rester reconnaissable partout. */
function LogoMark() {
  return (
    <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0 rounded-lg" aria-hidden="true">
      <rect width="64" height="64" fill="#123832" />
      <rect x="18" y="18" width="28" height="28" rx="6" fill="#A8681F" />
      <circle cx="32" cy="32" r="2.6" fill="#F6F3E9" />
      <circle cx="24" cy="24" r="2.6" fill="#F6F3E9" />
      <circle cx="40" cy="24" r="2.6" fill="#F6F3E9" />
      <circle cx="24" cy="40" r="2.6" fill="#F6F3E9" />
      <circle cx="40" cy="40" r="2.6" fill="#F6F3E9" />
    </svg>
  );
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconBolt() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true">
      <polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2" />
    </svg>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [resumable, setResumable] = useState<FullMatch | null>(null);
  const [startingQuick, setStartingQuick] = useState(false);
  // Compté depuis le catalogue local réel (pas une constante codée en dur,
  // qui deviendrait vite fausse à chaque ajout de jeu) — exclut les deux
  // entrées utilitaires ("Jeu rapide", modèle générique) qui ne sont pas de
  // vrais jeux reconnus.
  const { games } = useGames();
  const gameCount = games.filter((g) => g.id !== QUICK_PLAY_GAME_ID && g.id !== GENERIC_GAME_ID).length;

  async function startQuickPlay() {
    setStartingQuick(true);
    const match = await createMatch(QUICK_PLAY_GAME_ID);
    navigate(`/match/${match.id}/players`);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // `.where("status").equals(...)` trie par la clé de l'index status, pas
      // par date : toutes les entrées "in_progress" ont la même clé, donc
      // `.last()` renvoyait un match arbitraire (le plus grand id, pas le plus
      // récent). On trie explicitement par createdAt une fois les lignes en main.
      const inProgress = await db.matches.where("status").equals("in_progress").toArray();
      inProgress.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

      for (const match of inProgress) {
        const full = await getFullMatch(match.id);
        // Un match "orphelin" (jeu/modèle supprimé depuis) est ignoré au
        // profit du suivant plutôt que de proposer un lien mort.
        if (full) {
          if (!cancelled) setResumable(full);
          return;
        }
      }
      if (!cancelled) setResumable(null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 px-5 pt-8">
      <div>
        <div className="flex items-center gap-2">
          <LogoMark />
          <p className="font-mono text-xs uppercase tracking-widest text-felt-strong">BoardScore AI</p>
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold">{greeting()}</h1>
        <p className="mt-1 text-ink-soft">À quoi tu joues ?</p>
        {gameCount > 0 && (
          <p className="mt-2 text-sm text-ink-faint">
            {gameCount} jeux reconnus automatiquement · fait par un joueur, pas une startup
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/games/search"
          className="flex flex-col items-center gap-2 rounded-2xl bg-felt px-4 py-6 text-center text-paper-raised transition-opacity active:opacity-80"
        >
          <IconSearch />
          <span className="text-sm font-semibold">Rechercher un jeu</span>
        </Link>
        <button
          disabled={startingQuick}
          onClick={startQuickPlay}
          className="flex flex-col items-center gap-2 rounded-2xl bg-amber px-4 py-6 text-center text-paper-raised transition-opacity active:opacity-80 disabled:opacity-40"
        >
          <IconBolt />
          <span className="text-sm font-semibold">Jeu rapide</span>
        </button>
      </div>

      {resumable && (
        <Card className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-[0.68rem] uppercase tracking-wide text-amber-strong">
              Partie en cours
            </p>
            <p className="truncate font-semibold">{resumable.game.name}</p>
            <p className="text-sm text-ink-faint">{resumable.players.length} joueur(s)</p>
          </div>
          <Link to={`/match/${resumable.match.id}/score`}>
            <Button size="md">Reprendre</Button>
          </Link>
        </Card>
      )}

      <Card className="bg-felt-tint">
        <p className="text-sm text-ink-soft">
          Une idée de jeu en tête ?{" "}
          <Link to="/assistant" className="font-semibold text-felt-strong underline underline-offset-2">
            Demandez à l'assistant
          </Link>{" "}
          — « je joue à Wingspan », ou décrivez le jeu si vous ne connaissez pas son nom.
        </p>
      </Card>
    </div>
  );
}
