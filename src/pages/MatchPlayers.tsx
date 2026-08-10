import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { addPlayer, getFullMatch, removePlayer, updateMatchSettings, type FullMatch } from "@/lib/db";
import { QUICK_PLAY_GAME_ID } from "@/data/games.seed";

export default function MatchPlayers() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  // undefined = en cours de chargement, null = partie introuvable (lien mort).
  const [full, setFull] = useState<FullMatch | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [targetRounds, setTargetRounds] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  async function refresh() {
    if (!matchId) return;
    setFull((await getFullMatch(matchId)) ?? null);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    if (full === null) navigate("/", { replace: true });
  }, [full, navigate]);

  useEffect(() => {
    if (full) {
      setTargetRounds(full.match.targetRounds ? String(full.match.targetRounds) : "");
      setTargetScore(full.match.targetScore ? String(full.match.targetScore) : "");
      setSortDirection(full.match.sortDirection ?? "desc");
    }
    // Ne resynchroniser qu'au chargement initial du match, pas à chaque
    // refresh() (sinon on écraserait la saisie en cours de l'utilisateur).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [full?.match.id]);

  // Sauvegarde à chaque frappe avec les valeurs passées explicitement
  // (plutôt qu'un commit au blur qui lirait l'état React) : un blur peut se
  // déclencher avant que le state n'ait fini de se mettre à jour, ce qui
  // aurait perdu la dernière frappe.
  async function saveTargets(roundsStr: string, scoreStr: string) {
    if (!matchId) return;
    const rounds = Number(roundsStr);
    const score = Number(scoreStr);
    await updateMatchSettings(matchId, {
      targetRounds: roundsStr.trim() && !Number.isNaN(rounds) ? rounds : undefined,
      targetScore: scoreStr.trim() && !Number.isNaN(score) ? score : undefined,
    });
  }

  async function changeSortDirection(direction: "asc" | "desc") {
    setSortDirection(direction);
    if (!matchId) return;
    await updateMatchSettings(matchId, { sortDirection: direction });
  }

  if (!full) return null;

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed || !matchId) return;
    await addPlayer(matchId, trimmed);
    setName("");
    refresh();
  }

  return (
    // Même principe que l'écran de saisie des scores : seule la liste des
    // joueurs défile, le formulaire d'ajout (en haut) et le bouton
    // "Continuer" (en bas) restent toujours visibles, y compris sur un
    // petit écran où la barre Safari réduit la hauteur utile.
    <div className="flex h-dvh flex-col">
      <TopBar title={full.game.name} />

      <div className="shrink-0 px-5 pb-4 pt-5">
        <p className="mb-3 text-ink-soft">Ajoutez les joueurs présents autour de la table.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAdd();
          }}
          className="flex gap-2"
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom du joueur"
            className="h-11 min-w-0 flex-1 rounded-xl border border-line-strong bg-paper-raised px-4 text-base outline-none focus:border-felt"
          />
          <Button type="submit" size="md" className="h-11">
            Ajouter
          </Button>
        </form>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {full.game.id === QUICK_PLAY_GAME_ID && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-line bg-paper-raised p-4">
            <p className="text-sm font-medium text-ink-soft">Qui gagne ?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => changeSortDirection("desc")}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                  sortDirection === "desc"
                    ? "border-felt bg-felt-tint text-felt-strong"
                    : "border-line-strong text-ink-soft"
                }`}
              >
                Le plus de points
              </button>
              <button
                type="button"
                onClick={() => changeSortDirection("asc")}
                className={`flex-1 rounded-lg border py-2 text-sm font-medium ${
                  sortDirection === "asc"
                    ? "border-felt bg-felt-tint text-felt-strong"
                    : "border-line-strong text-ink-soft"
                }`}
              >
                Le moins de points
              </button>
            </div>

            <p className="text-sm font-medium text-ink-soft">Objectif (optionnel)</p>
            <div className="flex gap-3">
              <label className="flex-1 text-xs text-ink-faint">
                Nombre de manches
                <input
                  type="number"
                  inputMode="numeric"
                  value={targetRounds}
                  onChange={(e) => {
                    setTargetRounds(e.target.value);
                    saveTargets(e.target.value, targetScore);
                  }}
                  placeholder="Ex. 10"
                  className="mt-1 h-11 w-full rounded-lg border border-line-strong bg-paper px-3 text-base text-ink outline-none focus:border-felt"
                />
              </label>
              <label className="flex-1 text-xs text-ink-faint">
                Score à atteindre
                <input
                  type="number"
                  inputMode="numeric"
                  value={targetScore}
                  onChange={(e) => {
                    setTargetScore(e.target.value);
                    saveTargets(targetRounds, e.target.value);
                  }}
                  placeholder="Ex. 100"
                  className="mt-1 h-11 w-full rounded-lg border border-line-strong bg-paper px-3 text-base text-ink outline-none focus:border-felt"
                />
              </label>
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2">
          {full.players.map((p, i) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-line bg-paper-raised px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-felt-tint font-mono text-xs font-bold text-felt-strong">
                  {i + 1}
                </span>
                {p.name}
              </span>
              <button
                onClick={async () => {
                  await removePlayer(p.id);
                  refresh();
                }}
                className="text-sm text-ink-faint underline underline-offset-2"
              >
                Retirer
              </button>
            </div>
          ))}
          {full.players.length === 0 && (
            <p className="text-ink-faint">Aucun joueur pour l'instant.</p>
          )}
        </div>
      </div>

      <div className="safe-bottom shrink-0 border-t border-line px-5 py-3">
        <Button
          disabled={full.players.length < 1}
          className="w-full"
          onClick={() => navigate(`/match/${matchId}/score`)}
        >
          {full.players.length < 2
            ? "Continuer (ajoutez un 2ᵉ joueur pour un vrai classement)"
            : "Commencer la saisie des scores"}
        </Button>
      </div>
    </div>
  );
}
