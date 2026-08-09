import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { addPlayer, getFullMatch, removePlayer, type FullMatch } from "@/lib/db";

export default function MatchPlayers() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  // undefined = en cours de chargement, null = partie introuvable (lien mort).
  const [full, setFull] = useState<FullMatch | null | undefined>(undefined);
  const [name, setName] = useState("");

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

  if (!full) return null;

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed || !matchId) return;
    await addPlayer(matchId, trimmed);
    setName("");
    refresh();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar title={full.game.name} />
      <div className="flex flex-1 flex-col gap-4 px-5 py-6">
        <p className="text-ink-soft">Ajoutez les joueurs présents autour de la table.</p>

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
            className="flex-1 rounded-xl border border-line-strong bg-paper-raised px-4 py-3 text-base outline-none focus:border-felt"
          />
          <Button type="submit" size="md">
            Ajouter
          </Button>
        </form>

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

        <div className="mt-auto pt-4">
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
    </div>
  );
}
