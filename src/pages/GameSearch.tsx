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
    // Champ de recherche (haut) et CTA (bas) toujours visibles ; seule la
    // liste de résultats défile — même principe que la saisie de score.
    <div className="flex h-dvh flex-col">
      <TopBar title="Rechercher un jeu" />

      <div className="shrink-0 px-5 pb-4 pt-5">
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nom du jeu…"
          className="h-11 w-full rounded-xl border border-line-strong bg-paper-raised px-4 text-base outline-none focus:border-felt"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
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
      </div>

      <div className="safe-bottom shrink-0 border-t border-line px-5 py-3">
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => navigate("/community/new", { state: { gameNameGuess: query } })}
        >
          Ce jeu n'existe pas — créer un modèle
        </Button>
      </div>
    </div>
  );
}
