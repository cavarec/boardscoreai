import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db, deleteMatch, listMatches } from "@/lib/db";
import { Card } from "@/components/ui/Card";
import type { Game, Match } from "@/types";

export default function History() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [games, setGames] = useState<Record<string, Game>>({});

  async function refresh() {
    const list = await listMatches();
    setMatches(list);
    const gameIds = [...new Set(list.map((m) => m.gameId))];
    const gamesList = await db.games.bulkGet(gameIds);
    setGames(Object.fromEntries(gamesList.filter(Boolean).map((g) => [g!.id, g!])));
  }

  useEffect(() => {
    refresh();
  }, []);

  const completed = matches.filter((m) => m.status === "completed");
  const monthCount = completed.filter((m) => {
    const d = new Date(m.playedAt ?? m.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="flex flex-col gap-4 px-5 pt-8">
      <h1 className="font-display text-2xl font-bold">Historique</h1>

      {completed.length > 0 && (
        <Card className="bg-felt-tint">
          <p className="text-sm text-ink-soft">
            📈 <b className="text-ink">{monthCount}</b> partie(s) enregistrée(s) ce mois-ci
          </p>
        </Card>
      )}

      <div className="flex flex-col gap-2">
        {matches.map((m) => {
          const game = games[m.gameId];
          return (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-xl border border-line bg-paper-raised px-4 py-3"
            >
              <Link
                to={m.status === "completed" ? `/match/${m.id}/ranking` : `/match/${m.id}/score`}
                className="min-w-0 flex-1"
              >
                <p className="truncate font-medium">{m.name || game?.name || "Jeu supprimé"}</p>
                <p className="text-xs text-ink-faint">
                  {m.name && game?.name ? `${game.name} · ` : ""}
                  {new Date(m.playedAt ?? m.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                  })}{" "}
                  · {m.status === "completed" ? "terminée" : "en cours"}
                </p>
              </Link>
              <button
                onClick={async () => {
                  await deleteMatch(m.id);
                  refresh();
                }}
                aria-label="Supprimer la partie"
                className="ml-3 shrink-0 rounded-full p-2 text-ink-faint active:bg-paper-sunken"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5">
                  <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 12a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          );
        })}
        {matches.length === 0 && (
          <p className="text-ink-faint">Aucune partie enregistrée pour l'instant.</p>
        )}
      </div>
    </div>
  );
}
