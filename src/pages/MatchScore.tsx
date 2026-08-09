import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { Pill } from "@/components/ui/Card";
import { Stepper } from "@/components/ui/Stepper";
import { completeMatch, getFullMatch, setScore, type FullMatch } from "@/lib/db";
import { computePlayerBreakdown, getRawValue } from "@/lib/scoreEngine";
import type { ScoreCategory } from "@/types";

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
    <div className="flex min-h-screen flex-col">
      <TopBar title={full.game.name} />

      <div className="flex gap-1 overflow-x-auto border-b border-line px-3 py-2">
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

      <div className="flex flex-1 flex-col gap-3 px-5 py-5">
        <div className="flex items-center justify-between">
          <p className="text-ink-soft">Total actuel</p>
          <p className="font-mono text-2xl font-bold tabular-nums text-felt-strong">{total} pts</p>
        </div>

        <div className="flex flex-col gap-2">
          {breakdown.map(({ category }) => (
            <CategoryRow
              key={category.id}
              category={category}
              value={getRawValue(full.scores, activePlayerId, category.id)}
              onChange={(v) => updateValue(category, v)}
            />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-6">
          <Button disabled={finishing} className="w-full" onClick={finish}>
            Voir le classement
          </Button>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({
  category,
  value,
  onChange,
}: {
  category: ScoreCategory;
  value: number;
  onChange: (v: number) => void;
}) {
  const isBooleanCondition =
    (category.formulaType === "conditional" || category.formulaType === "hidden_objective") &&
    category.config.mode !== "threshold";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-paper-raised px-4 py-3">
      <div className="min-w-0">
        <p className="truncate font-medium">{category.label}</p>
        <div className="flex items-center gap-2">
          {category.formulaType === "hidden_objective" && <Pill tone="pick">objectif caché</Pill>}
          {category.formulaType === "malus" && <Pill tone="warn">malus</Pill>}
          {category.config.helper && (
            <p className="truncate text-xs text-ink-faint">{category.config.helper}</p>
          )}
        </div>
      </div>

      {isBooleanCondition ? (
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
      )}
    </div>
  );
}
