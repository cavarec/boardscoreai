import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { getFullMatch, type FullMatch } from "@/lib/db";
import { computeRanking } from "@/lib/scoreEngine";
import { pushCompletedMatch } from "@/lib/sync";
import type { PlayerResult } from "@/types";

const PODIUM_HEIGHT: Record<number, string> = { 1: "h-28", 2: "h-20", 3: "h-14" };
const PODIUM_COLOR: Record<number, string> = {
  1: "bg-amber text-paper-raised",
  2: "bg-ink-faint text-paper-raised",
  3: "bg-felt text-paper-raised",
};

export default function MatchRanking() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  // undefined = en cours de chargement, null = partie introuvable (lien mort).
  const [full, setFull] = useState<FullMatch | null | undefined>(undefined);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    getFullMatch(matchId).then((data) => {
      setFull(data ?? null);
      if (data?.match.status === "completed") void pushCompletedMatch(matchId);
    });
  }, [matchId]);

  useEffect(() => {
    if (full === null) navigate("/", { replace: true });
  }, [full, navigate]);

  if (!full) return null;

  const ranking = computeRanking(full.ruleSet, full.scores, full.players);
  // Les 3 premières lignes du classement (déjà triées) plutôt que les positions
  // 1/2/3 littérales : en cas d'égalité, deux joueurs peuvent partager le rang 1
  // et doivent tous les deux apparaître sur le podium.
  const top3 = ranking.slice(0, 3);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean) as PlayerResult[];

  return (
    // min-h-dvh (pas min-h-screen) : sur Safari iOS, 100vh déborde de la zone
    // réellement visible, ce qui poussait le bouton "Terminer" (mt-auto)
    // plus bas que l'écran visible.
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Classement" />
      <div className="flex flex-1 flex-col gap-5 px-5 py-6">
        {podiumOrder.length > 0 && (
          <div className="flex items-end justify-center gap-3">
            {podiumOrder.map((r) => (
              <div key={r.player.id} className="flex flex-1 flex-col items-center gap-1">
                <p className="max-w-[5.5rem] truncate text-sm font-semibold">{r.player.name}</p>
                <div
                  className={`flex w-full items-start justify-center rounded-t-xl pt-2 font-mono font-bold ${PODIUM_HEIGHT[r.position]} ${PODIUM_COLOR[r.position]}`}
                >
                  {r.position}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {ranking.map((r) => (
            <div key={r.player.id} className="rounded-xl border border-line bg-paper-raised">
              <button
                onClick={() => setExpandedId(expandedId === r.player.id ? null : r.player.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left"
              >
                <span className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-ink-faint">#{r.position}</span>
                  <span className="font-medium">{r.player.name}</span>
                </span>
                <span className="font-mono text-lg font-bold tabular-nums text-felt-strong">
                  {r.total} pts
                </span>
              </button>
              {expandedId === r.player.id && (
                <div className="border-t border-line px-4 py-3">
                  {r.breakdown.map((b) => (
                    <div key={b.category.id} className="flex justify-between py-1 text-sm">
                      <span className="text-ink-soft">{b.category.label}</span>
                      <span className="font-mono tabular-nums">{b.points}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-4">
          <Button variant="secondary" onClick={() => navigate("/history")}>
            Voir l'historique
          </Button>
          <Button onClick={() => navigate("/")}>Terminer</Button>
        </div>
      </div>
    </div>
  );
}
