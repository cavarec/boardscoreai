import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { getFullMatch, reopenMatch, type FullMatch } from "@/lib/db";
import { computeRanking, effectiveRuleSet } from "@/lib/scoreEngine";
import { Meeple } from "@/components/ui/Meeple";

const RANK_BADGE: Record<number, string> = {
  1: "bg-amber text-paper-raised",
  2: "bg-ink-faint text-paper-raised",
  3: "bg-felt text-paper-raised",
};
const RANK_BAR: Record<number, string> = { 1: "bg-amber", 2: "bg-ink-faint", 3: "bg-felt" };

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
    });
  }, [matchId]);

  useEffect(() => {
    if (full === null) navigate("/", { replace: true });
  }, [full, navigate]);

  if (!full) return null;

  async function backToMatch() {
    // Voir le classement marque déjà la partie "terminée" (completeMatch) :
    // sans repasser explicitement en "in_progress", la carte "Partie en
    // cours" de l'accueil ne la retrouverait plus, et l'utilisateur croirait
    // avoir perdu ses joueurs en en démarrant une nouvelle par erreur.
    await reopenMatch(full!.match.id);
    navigate(`/match/${full!.match.id}/score`);
  }

  const ranking = computeRanking(effectiveRuleSet(full.ruleSet, full.match), full.scores, full.players);
  // Longueur de barre = proximité avec le gagnant, pas le score brut : ça
  // reste juste que le classement gagne au plus haut ou au plus bas score
  // (Jeu rapide), et ça ne casse pas avec des scores négatifs. Le gagnant a
  // toujours la barre pleine ; les autres sont d'autant plus courtes qu'ils
  // sont loin de lui. Plancher à 12% pour rester visible même très distancé.
  const winnerTotal = ranking[0]?.total ?? 0;
  const totals = ranking.map((r) => r.total);
  const range = Math.max(...totals) - Math.min(...totals) || 1;
  const barWidth = (total: number) => {
    const fraction = 1 - Math.abs(winnerTotal - total) / range;
    return `${Math.max(12, Math.round(fraction * 100))}%`;
  };

  return (
    // min-h-dvh (pas min-h-screen) : sur Safari iOS, 100vh déborde de la zone
    // réellement visible, ce qui poussait le bouton "Terminer" (mt-auto)
    // plus bas que l'écran visible.
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Classement" />
      <div className="flex flex-1 flex-col gap-5 px-5 py-6">
        <div className="flex flex-col gap-2">
          {ranking.map((r) => (
            <div key={r.player.id} className="overflow-hidden rounded-xl border border-line bg-paper-raised">
              <button
                onClick={() => setExpandedId(expandedId === r.player.id ? null : r.player.id)}
                className="relative flex w-full flex-col gap-1.5 px-4 py-3 text-left"
              >
                <span className="flex items-center justify-between">
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                        RANK_BADGE[r.position] ?? "bg-paper-sunken text-ink-faint"
                      }`}
                    >
                      {r.position}
                    </span>
                    <Meeple playerId={r.player.id} size={16} />
                    <span className="font-medium">{r.player.name}</span>
                  </span>
                  <span className="font-mono text-lg font-bold tabular-nums text-felt-strong">
                    {r.total} pts
                  </span>
                </span>
                <span className="h-1.5 w-full overflow-hidden rounded-full bg-paper-sunken">
                  <span
                    className={`block h-full rounded-full transition-all ${RANK_BAR[r.position] ?? "bg-ink-faint"}`}
                    style={{ width: barWidth(r.total) }}
                  />
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
          <Button variant="secondary" onClick={backToMatch}>
            Retour à la partie
          </Button>
          <Button
            onClick={() => {
              if (confirm("Terminer la partie et revenir à l'accueil ?")) navigate("/");
            }}
          >
            Terminer
          </Button>
        </div>
      </div>
    </div>
  );
}
