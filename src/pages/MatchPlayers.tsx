import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { computePlayerInitials } from "@/lib/playerInitials";
import {
  addGroupToMatch,
  addPlayer,
  addRoundScore,
  createGroup,
  deleteGroup,
  enableDealerTracking,
  getFullMatch,
  listGroups,
  removePlayer,
  reorderPlayers,
  updateMatchSettings,
  type FullMatch,
} from "@/lib/db";
import { QUICK_PLAY_GAME_ID } from "@/data/games.seed";
import type { PlayerGroup } from "@/types";

export default function MatchPlayers() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  // undefined = en cours de chargement, null = partie introuvable (lien mort).
  const [full, setFull] = useState<FullMatch | null | undefined>(undefined);
  const [name, setName] = useState("");
  const [startingScore, setStartingScore] = useState("");
  const [matchName, setMatchName] = useState("");
  const [targetRounds, setTargetRounds] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [drawnPlayerName, setDrawnPlayerName] = useState<string | null>(null);
  const [groups, setGroups] = useState<PlayerGroup[]>([]);

  async function refresh() {
    if (!matchId) return;
    setFull((await getFullMatch(matchId)) ?? null);
  }

  async function refreshGroups() {
    setGroups(await listGroups());
  }

  useEffect(() => {
    refresh();
    refreshGroups();
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
      setMatchName(full.match.name ?? "");
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

  async function saveMatchName(value: string) {
    setMatchName(value);
    if (!matchId) return;
    await updateMatchSettings(matchId, { name: value.trim() || undefined });
  }

  if (!full) return null;

  // Un score de départ (handicap, avantage à un jeune joueur…) n'a de sens
  // que pour la catégorie unique et cumulative de Jeu rapide — les vrais
  // jeux ont plusieurs catégories, ce serait ambigu d'y appliquer un montant
  // de départ sur "le score" en général.
  const quickPlayCategory = full.ruleSet.categories.find((c) => c.config.roundBased);

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed || !matchId) return;
    const player = await addPlayer(matchId, trimmed);
    const handicap = Number(startingScore);
    if (quickPlayCategory && startingScore.trim() && !Number.isNaN(handicap) && handicap !== 0) {
      await addRoundScore(player.id, quickPlayCategory.id, handicap);
    }
    setName("");
    setStartingScore("");
    refresh();
  }

  const players = full.players;
  const initialsById = computePlayerInitials(players);
  const drawStartingPlayer = async () => {
    if (!matchId || players.length < 2) return;
    const shuffled = [...players];
    const [drawn] = shuffled.splice(Math.floor(Math.random() * shuffled.length), 1);
    await reorderPlayers(matchId, [drawn.id, ...shuffled.map((p) => p.id)]);
    setDrawnPlayerName(drawn.name);
    refresh();
  };

  async function handleAddGroup(groupId: string) {
    if (!matchId) return;
    await addGroupToMatch(matchId, groupId);
    refresh();
  }

  async function handleDeleteGroup(groupId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("Supprimer ce groupe ?")) return;
    await deleteGroup(groupId);
    refreshGroups();
  }

  async function handleSaveGroup() {
    const profileIds = players.map((p) => p.profileId).filter((id): id is string => Boolean(id));
    if (profileIds.length === 0) return;
    const name = prompt("Nom du groupe (ex. Soirée du jeudi) :");
    if (!name || !name.trim()) return;
    await createGroup(name, profileIds);
    refreshGroups();
  }

  async function handleEnableDealer() {
    if (!matchId) return;
    await enableDealerTracking(matchId);
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
        {full.game.id === QUICK_PLAY_GAME_ID && (
          <input
            type="number"
            inputMode="numeric"
            value={startingScore}
            onChange={(e) => setStartingScore(e.target.value)}
            placeholder="Score de départ pour ce joueur (optionnel)"
            className="mt-2 h-10 w-full rounded-lg border border-line-strong bg-paper px-3 text-sm outline-none focus:border-felt"
          />
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-4">
        {groups.length > 0 && (
          <div className="mb-4 flex flex-col gap-2">
            <p className="text-sm font-medium text-ink-soft">Ajouter un groupe</p>
            <div className="flex flex-wrap gap-2">
              {groups.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center overflow-hidden rounded-full border border-line-strong bg-paper-raised"
                >
                  <button
                    onClick={() => handleAddGroup(g.id)}
                    className="py-1.5 pl-3 pr-1 text-sm font-medium text-ink"
                  >
                    {g.name} ({g.profileIds.length})
                  </button>
                  <button
                    onClick={(e) => handleDeleteGroup(g.id, e)}
                    aria-label={`Supprimer le groupe ${g.name}`}
                    className="pr-2.5 pl-1 text-ink-faint"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {full.game.id === QUICK_PLAY_GAME_ID && (
          <details className="group mb-4 rounded-xl border border-line bg-paper-raised">
            <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-medium text-ink-soft [&::-webkit-details-marker]:hidden">
              Options de la partie
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>

            <div className="flex flex-col gap-3 border-t border-line px-4 pb-4 pt-3">
              <label className="text-sm font-medium text-ink-soft">
                Nom de la partie (optionnel)
                <input
                  value={matchName}
                  onChange={(e) => saveMatchName(e.target.value)}
                  placeholder="Ex. Soirée jeux du 15 août"
                  className="mt-1 h-11 w-full rounded-lg border border-line-strong bg-paper px-3 text-base font-normal text-ink outline-none focus:border-felt"
                />
              </label>

              <p className="text-sm font-medium text-ink-soft">Qui gagne ?</p>
              <div
                role="tablist"
                aria-label="Sens du classement"
                className="relative flex rounded-full border border-line-strong bg-paper p-1"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-felt transition-transform duration-200 ease-out"
                  style={{ transform: sortDirection === "asc" ? "translateX(100%)" : "translateX(0%)" }}
                />
                <button
                  type="button"
                  role="tab"
                  aria-selected={sortDirection === "desc"}
                  onClick={() => changeSortDirection("desc")}
                  className={`relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                    sortDirection === "desc" ? "text-paper-raised" : "text-ink-soft"
                  }`}
                >
                  Le plus de points
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={sortDirection === "asc"}
                  onClick={() => changeSortDirection("asc")}
                  className={`relative z-10 flex-1 rounded-full py-2 text-sm font-semibold transition-colors ${
                    sortDirection === "asc" ? "text-paper-raised" : "text-ink-soft"
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
          </details>
        )}
        {full.players.length >= 2 && (
          <div className="mb-3 flex flex-col gap-2">
            <Button variant="secondary" onClick={drawStartingPlayer}>
              Tirer au sort qui commence
            </Button>
            {drawnPlayerName && (
              <p className="text-center text-sm font-medium text-amber-strong">
                {drawnPlayerName} commence la partie.
              </p>
            )}
            <Button variant="secondary" onClick={handleSaveGroup}>
              Enregistrer ce groupe de joueurs
            </Button>
            {full.match.trackDealer ? (
              <p className="text-center text-sm text-ink-faint">
                Donneur suivi :{" "}
                {full.players.find((p) => p.id === full.match.dealerPlayerId)?.name ?? "—"}
              </p>
            ) : (
              <Button variant="secondary" onClick={handleEnableDealer}>
                Activer le suivi du donneur
              </Button>
            )}
          </div>
        )}
        <div className="flex flex-col gap-2">
          {full.players.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-line bg-paper-raised px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <PlayerAvatar playerId={p.profileId ?? p.id} initials={initialsById[p.id]} size={24} />
                {p.name}
              </span>
              <button
                onClick={async () => {
                  if (!confirm(`Retirer ${p.name} de la partie ? Son score sera perdu.`)) return;
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
