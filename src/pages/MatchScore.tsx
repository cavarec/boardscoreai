import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";
import {
  addRoundScore,
  completeMatch,
  getFullMatch,
  getRounds,
  removeRound,
  setScore,
  type FullMatch,
} from "@/lib/db";
import { computePlayerBreakdown, getRawValue } from "@/lib/scoreEngine";
import { QUICK_PLAY_GAME_ID } from "@/data/games.seed";
import type { ScoreCategory, ScoreRound } from "@/types";

export default function MatchScore() {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  // undefined = en cours de chargement, null = partie introuvable (lien mort).
  const [full, setFull] = useState<FullMatch | null | undefined>(undefined);
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [finishing, setFinishing] = useState(false);

  async function refresh() {
    if (!matchId) return;
    const data = (await getFullMatch(matchId)) ?? null;
    setFull(data);
    if (data && !activePlayerId) setActivePlayerId(data.players[0]?.id ?? null);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  useEffect(() => {
    if (full === null) navigate("/", { replace: true });
    else if (full && full.players.length === 0) navigate(`/match/${matchId}/players`, { replace: true });
  }, [full, matchId, navigate]);

  // "Jeu rapide" a une seule catégorie cumulative : son nombre de manches
  // saisies sert d'indicateur de progression face à l'objectif optionnel.
  const quickCategory =
    full && full.game.id === QUICK_PLAY_GAME_ID
      ? full.ruleSet.categories.find((c) => c.config.roundBased)
      : undefined;
  const [roundsPlayed, setRoundsPlayed] = useState(0);

  useEffect(() => {
    if (!quickCategory || !activePlayerId) {
      setRoundsPlayed(0);
      return;
    }
    let cancelled = false;
    getRounds(activePlayerId, quickCategory.id).then((rounds) => {
      if (!cancelled) setRoundsPlayed(rounds.length);
    });
    return () => {
      cancelled = true;
    };
  }, [activePlayerId, quickCategory, full]);

  // Vérifié pour TOUS les joueurs, pas seulement l'onglet actif : sinon on
  // ne verrait jamais qu'un autre joueur a déjà atteint l'objectif.
  const [roundsByPlayer, setRoundsByPlayer] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!quickCategory || !full) {
      setRoundsByPlayer({});
      return;
    }
    let cancelled = false;
    Promise.all(
      full.players.map(
        async (p) => [p.id, (await getRounds(p.id, quickCategory.id)).length] as const
      )
    ).then((entries) => {
      if (!cancelled) setRoundsByPlayer(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, [quickCategory, full]);

  const achievements =
    full && quickCategory
      ? full.players
          .map((p) => {
            const { total } = computePlayerBreakdown(full.ruleSet, full.scores, p);
            const rounds = roundsByPlayer[p.id] ?? 0;
            const scoreReached = Boolean(full.match.targetScore && total >= full.match.targetScore);
            const roundsReached = Boolean(
              full.match.targetRounds && rounds >= full.match.targetRounds
            );
            return { player: p, total, rounds, scoreReached, roundsReached };
          })
          .filter((a) => a.scoreReached || a.roundsReached)
      : [];

  if (!full || full.players.length === 0 || !activePlayerId) return null;

  const activePlayer = full.players.find((p) => p.id === activePlayerId);
  if (!activePlayer) return null;

  const { total, breakdown } = computePlayerBreakdown(full.ruleSet, full.scores, activePlayer);

  async function updateValue(category: ScoreCategory, value: number) {
    await setScore(activePlayerId!, category.id, value);
    refresh();
  }

  async function finish() {
    if (!matchId) return;
    setFinishing(true);
    await completeMatch(matchId);
    navigate(`/match/${matchId}/ranking`);
  }

  return (
    // h-dvh (pas h-screen) : sur Safari iOS, 100vh ignore la barre d'adresse
    // dynamique et déborde de la zone réellement visible, ce qui rendait
    // toute la page scrollable et faisait sortir les onglets joueurs de
    // l'écran à chaque saisie. 100dvh suit la hauteur visible réelle.
    <div className="flex h-dvh flex-col">
      <TopBar title={full.game.name} />

      <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-line px-3 py-2">
        {full.players.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePlayerId(p.id)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-semibold ${
              p.id === activePlayerId
                ? "bg-felt text-paper-raised"
                : "bg-paper-raised text-ink-faint"
            }`}
          >
            {p.name}
          </button>
        ))}
      </div>

      {achievements.length > 0 && (
        <div className="shrink-0 border-b border-line bg-amber-tint px-5 py-3">
          {achievements.map((a) => (
            <p key={a.player.id} className="text-sm font-medium text-amber-strong">
              {a.player.name} :{" "}
              {a.scoreReached && a.roundsReached
                ? `objectif de points et nombre de manches atteints (${a.total} pts)`
                : a.scoreReached
                  ? `objectif de ${full.match.targetScore} pts atteint (${a.total} pts)`
                  : `${full.match.targetRounds} manches jouées`}
            </p>
          ))}
          <p className="mt-1 text-xs text-ink-faint">
            La partie continue tant que vous ne regardez pas le classement.
          </p>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-ink-soft">Total actuel</p>
          <p
            className={`font-mono text-2xl font-bold tabular-nums ${
              full.match.targetScore && total >= full.match.targetScore
                ? "text-amber-strong"
                : "text-felt-strong"
            }`}
          >
            {total} pts
          </p>
        </div>

        {quickCategory && (full.match.targetRounds || full.match.targetScore) && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {full.match.targetRounds && (
              <Pill tone={roundsPlayed >= full.match.targetRounds ? "good" : "neutral"}>
                Manche {roundsPlayed} / {full.match.targetRounds}
              </Pill>
            )}
            {full.match.targetScore && (
              <Pill tone={total >= full.match.targetScore ? "good" : "neutral"}>
                {total >= full.match.targetScore ? "Objectif atteint" : `Objectif : ${full.match.targetScore} pts`}
              </Pill>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {breakdown.map(({ category }) => (
            <CategoryRow
              key={category.id}
              category={category}
              playerId={activePlayerId}
              value={getRawValue(full.scores, activePlayerId, category.id)}
              onChange={(v) => updateValue(category, v)}
              onRoundsChanged={refresh}
            />
          ))}
        </div>
      </div>

      <div className="safe-bottom shrink-0 border-t border-line px-5 py-3">
        <Button disabled={finishing} className="w-full" onClick={finish}>
          Voir le classement
        </Button>
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  playerId,
  value,
  onChange,
  onRoundsChanged,
}: {
  category: ScoreCategory;
  playerId: string;
  value: number;
  onChange: (v: number) => void;
  onRoundsChanged: () => void;
}) {
  const isBooleanCondition =
    (category.formulaType === "conditional" || category.formulaType === "hidden_objective") &&
    category.config.mode !== "threshold";

  return (
    <div className="rounded-xl border border-line bg-paper-raised px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{category.label}</p>
          <div className="flex items-center gap-2">
            {category.formulaType === "hidden_objective" && <Pill tone="pick">objectif caché</Pill>}
            {category.formulaType === "malus" && <Pill tone="warn">malus</Pill>}
            {category.config.helper && !category.config.roundBased && (
              <p className="truncate text-xs text-ink-faint">{category.config.helper}</p>
            )}
          </div>
        </div>

        {!category.config.roundBased &&
          (isBooleanCondition ? (
            <button
              role="switch"
              aria-checked={value > 0}
              onClick={() => onChange(value > 0 ? 0 : 1)}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                value > 0 ? "bg-felt" : "bg-paper-sunken"
              }`}
            >
              <span
                className={`absolute top-0.5 h-6 w-6 rounded-full bg-paper-raised shadow transition-transform ${
                  value > 0 ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          ) : (
            <Stepper
              value={value}
              onChange={onChange}
              step={category.config.step ?? 1}
              min={category.config.min}
              max={category.config.max}
            />
          ))}
      </div>

      {category.config.roundBased && (
        <RoundEntry
          playerId={playerId}
          category={category}
          total={value}
          onChanged={onRoundsChanged}
        />
      )}
    </div>
  );
}

/**
 * Saisie additive : on entre chaque valeur au fur et à mesure (le score
 * d'une manche, la valeur d'une carte, les points d'un mot…) plutôt que de
 * recalculer un total de tête. Utile aussi bien pour les jeux en manches
 * (Skyjo, 6 qui prend) que pour additionner plusieurs cartes en une fois
 * (Scrabble, les bâtiments de 7 Wonders…). Chaque entrée reste annulable.
 */
function RoundEntry({
  playerId,
  category,
  total,
  onChanged,
}: {
  playerId: string;
  category: ScoreCategory;
  total: number;
  onChanged: () => void;
}) {
  const [rounds, setRounds] = useState<ScoreRound[]>([]);
  const [draft, setDraft] = useState("");
  // Bouton de signe dédié : le clavier numérique mobile (inputMode="numeric")
  // n'a pas de touche "-", taper un score négatif serait sinon impossible.
  const [negative, setNegative] = useState(false);

  async function refreshRounds() {
    setRounds(await getRounds(playerId, category.id));
  }

  useEffect(() => {
    refreshRounds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerId, category.id]);

  async function addRound() {
    const magnitude = Math.abs(Number(draft));
    if (!draft.trim() || Number.isNaN(magnitude)) return;
    await addRoundScore(playerId, category.id, negative ? -magnitude : magnitude);
    setDraft("");
    await refreshRounds();
    onChanged();
  }

  async function undoRound(roundId: string) {
    await removeRound(roundId);
    await refreshRounds();
    onChanged();
  }

  return (
    <div className="mt-3 flex flex-col gap-2 border-t border-line pt-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">{category.config.helper ?? "Total cumulé"}</p>
        <p className="font-mono text-lg font-bold tabular-nums text-felt-strong">{total}</p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          addRound();
        }}
        className="flex gap-2"
      >
        <button
          type="button"
          onClick={() => setNegative((n) => !n)}
          aria-label={negative ? "Score négatif (appuyer pour positif)" : "Score positif (appuyer pour négatif)"}
          className={`inline-flex h-11 w-11 shrink-0 appearance-none items-center justify-center rounded-lg border text-lg font-bold leading-none ${
            negative
              ? "border-brick bg-brick-tint text-brick"
              : "border-line-strong text-ink-soft"
          }`}
        >
          {negative ? "−" : "+"}
        </button>
        <input
          type="number"
          inputMode="numeric"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Valeur à ajouter"
          className="h-11 min-w-0 flex-1 rounded-lg border border-line-strong bg-paper px-3 text-base outline-none focus:border-felt"
        />
        <Button type="submit" size="md" className="h-11">
          Ajouter
        </Button>
      </form>

      {rounds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {rounds.map((r, i) => (
            <button
              key={r.id}
              onClick={() => undoRound(r.id)}
              title="Retirer cette entrée"
              className="flex items-center gap-1 rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-ink-soft active:bg-paper-sunken"
            >
              #{i + 1} : {r.value} ✕
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
