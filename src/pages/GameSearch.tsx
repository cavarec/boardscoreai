import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { useGames } from "@/hooks/useGames";
import { matchGames } from "@/lib/matcher";
import { createMatch } from "@/lib/db";
import { Button } from "@/components/ui/Button";

export default function GameSearch() {
  const navigate = useNavigate();
  const { games, loading } = useGames();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    if (!query.trim()) return games;
    return matchGames(games, query, 20).map((m) => m.game);
  }, [games, query]);

  async function pick(gameId: string) {
    const match = await createMatch(gameId);
    navigate(`/match/${match.id}/players`);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title="Rechercher un jeu" />
      <div className="flex flex-1 flex-col gap-4 px-5 py-6">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom du jeu…"
          className="w-full rounded-xl border border-line-strong bg-paper-raised px-4 py-3 text-base outline-none focus:border-felt"
        />

        {loading && <p className="text-ink-faint">Chargement du catalogue…</p>}

        <div className="flex flex-col gap-2">
          {results.map((game) => (
            <button
              key={game.id}
              onClick={() => pick(game.id)}
              className="flex items-center justify-between rounded-xl border border-line bg-paper-raised px-4 py-3 text-left active:bg-paper-sunken"
            >
              <span>
                <span className="block font-medium">{game.name}</span>
                <span className="block text-xs text-ink-faint">
                  {game.publisher} · {game.year}
                </span>
              </span>
            </button>
          ))}
          {!loading && results.length === 0 && (
            <p className="text-ink-faint">Aucun résultat pour « {query} ».</p>
          )}
        </div>

        <Button
          variant="secondary"
          onClick={() => navigate("/community/new", { state: { gameNameGuess: query } })}
        >
          Ce jeu n'existe pas — créer un modèle
        </Button>
      </div>
    </div>
  );
}
