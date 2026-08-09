import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { TopBar } from "@/components/layout/TopBar";
import { Button } from "@/components/ui/Button";
import { createMatch, linkBarcodeToGame, submitCommunityTemplate } from "@/lib/db";
import { pushBarcodeLink, pushCommunityTemplate } from "@/lib/sync";
import { FORMULA_LABELS } from "@/lib/scoreEngine";
import type { FormulaType, ScoreCategory } from "@/types";

type Draft = {
  label: string;
  formulaType: FormulaType;
  perUnit: number;
  factor: number;
  mode: "boolean" | "threshold";
  threshold: number;
  pointsIfMet: number;
  pointsIfNot: number;
};

function emptyDraft(label = ""): Draft {
  return {
    label,
    formulaType: "sum",
    perUnit: 1,
    factor: 1,
    mode: "boolean",
    threshold: 1,
    pointsIfMet: 5,
    pointsIfNot: 0,
  };
}

const FORMULA_TYPES = Object.keys(FORMULA_LABELS) as FormulaType[];

export default function CommunityNew() {
  const location = useLocation();
  const navigate = useNavigate();
  const navState = location.state as { gameNameGuess?: string; scannedBarcode?: string } | null;
  const prefill = navState?.gameNameGuess ?? "";
  const scannedBarcode = navState?.scannedBarcode;

  const [gameName, setGameName] = useState(prefill);
  const [categories, setCategories] = useState<Draft[]>([emptyDraft("Points bruts")]);
  const [sourceNote, setSourceNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function updateCategory(index: number, patch: Partial<Draft>) {
    setCategories((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }

  function toScoreCategory(d: Draft, order: number): Omit<ScoreCategory, "id" | "ruleId"> {
    const config: ScoreCategory["config"] = {};
    if (d.formulaType === "sum" || d.formulaType === "bonus" || d.formulaType === "malus") {
      config.perUnit = d.perUnit;
    }
    if (d.formulaType === "multiplier") {
      config.factor = d.factor;
    }
    if (d.formulaType === "conditional" || d.formulaType === "hidden_objective") {
      config.mode = d.mode;
      if (d.mode === "threshold") config.threshold = d.threshold;
      config.pointsIfMet = d.pointsIfMet;
      config.pointsIfNot = d.pointsIfNot;
    }
    return { label: d.label || `Catégorie ${order + 1}`, formulaType: d.formulaType, config, order };
  }

  async function handleSubmit() {
    if (!gameName.trim() || categories.length === 0) return;
    setSubmitting(true);
    const { template, game } = await submitCommunityTemplate({
      gameNameGuess: gameName.trim(),
      proposedCategories: categories.map(toScoreCategory),
      sourceNote: sourceNote.trim() || undefined,
    });
    void pushCommunityTemplate(template);
    if (scannedBarcode) {
      await linkBarcodeToGame(scannedBarcode, game.id);
      void pushBarcodeLink(scannedBarcode, game.id);
    }
    // Le modèle est déjà jouable localement (voir submitCommunityTemplate) :
    // on enchaîne directement sur une partie plutôt que de renvoyer vers la
    // liste communautaire, pour fermer la boucle "jeu inconnu -> jouable".
    const match = await createMatch(game.id);
    navigate(`/match/${match.id}/players`);
  }

  return (
    // min-h-dvh (pas min-h-screen) : voir MatchRanking.tsx, même correction
    // pour le bouton "Publier à la communauté" poussé par mt-auto.
    <div className="flex min-h-dvh flex-col">
      <TopBar title="Nouveau modèle" />
      <div className="flex flex-1 flex-col gap-5 px-5 py-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-soft">Nom du jeu</label>
          <input
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Ex. Res Arcana"
            className="w-full rounded-xl border border-line-strong bg-paper-raised px-4 py-3 outline-none focus:border-felt"
          />
        </div>

        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
            Catégories de score
          </p>
          {categories.map((cat, index) => (
            <div key={index} className="rounded-xl border border-line bg-paper-raised p-3">
              <div className="flex gap-2">
                <input
                  value={cat.label}
                  onChange={(e) => updateCategory(index, { label: e.target.value })}
                  placeholder="Nom de la catégorie"
                  className="flex-1 rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm outline-none focus:border-felt"
                />
                <button
                  onClick={() => setCategories((prev) => prev.filter((_, i) => i !== index))}
                  aria-label="Supprimer la catégorie"
                  className="rounded-lg px-2 text-ink-faint active:bg-paper-sunken"
                >
                  ✕
                </button>
              </div>

              <select
                value={cat.formulaType}
                onChange={(e) => updateCategory(index, { formulaType: e.target.value as FormulaType })}
                className="mt-2 w-full rounded-lg border border-line-strong bg-paper px-3 py-2 text-sm outline-none focus:border-felt"
              >
                {FORMULA_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {FORMULA_LABELS[type]}
                  </option>
                ))}
              </select>

              <FormulaFields draft={cat} onChange={(patch) => updateCategory(index, patch)} />
            </div>
          ))}

          <button
            onClick={() => setCategories((prev) => [...prev, emptyDraft()])}
            className="rounded-xl border border-dashed border-line-strong py-3 text-sm font-medium text-ink-soft active:bg-paper-raised"
          >
            + Ajouter une catégorie
          </button>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink-soft">
            Source (optionnel)
          </label>
          <input
            value={sourceNote}
            onChange={(e) => setSourceNote(e.target.value)}
            placeholder="Ex. règle officielle p.12"
            className="w-full rounded-xl border border-line-strong bg-paper-raised px-4 py-3 outline-none focus:border-felt"
          />
        </div>

        <div className="mt-auto pt-4">
          <Button
            disabled={submitting || !gameName.trim()}
            className="w-full"
            onClick={handleSubmit}
          >
            Publier à la communauté
          </Button>
        </div>
      </div>
    </div>
  );
}

function FormulaFields({
  draft,
  onChange,
}: {
  draft: Draft;
  onChange: (patch: Partial<Draft>) => void;
}) {
  const numberInput = (
    label: string,
    key: keyof Draft,
    value: number
  ) => (
    <label className="flex items-center justify-between gap-2 text-sm text-ink-soft">
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange({ [key]: Number(e.target.value) } as Partial<Draft>)}
        className="w-20 rounded-lg border border-line-strong bg-paper px-2 py-1 text-right outline-none focus:border-felt"
      />
    </label>
  );

  if (draft.formulaType === "sum" || draft.formulaType === "bonus" || draft.formulaType === "malus") {
    return <div className="mt-2">{numberInput("Points par unité", "perUnit", draft.perUnit)}</div>;
  }
  if (draft.formulaType === "multiplier") {
    return <div className="mt-2">{numberInput("Facteur multiplicateur", "factor", draft.factor)}</div>;
  }
  // conditional / hidden_objective
  return (
    <div className="mt-2 flex flex-col gap-2">
      <label className="flex items-center justify-between gap-2 text-sm text-ink-soft">
        Mode
        <select
          value={draft.mode}
          onChange={(e) => onChange({ mode: e.target.value as Draft["mode"] })}
          className="rounded-lg border border-line-strong bg-paper px-2 py-1 outline-none focus:border-felt"
        >
          <option value="boolean">Oui / non</option>
          <option value="threshold">Seuil atteint</option>
        </select>
      </label>
      {draft.mode === "threshold" && numberInput("Seuil requis", "threshold", draft.threshold)}
      {numberInput("Points si rempli", "pointsIfMet", draft.pointsIfMet)}
      {numberInput("Points sinon", "pointsIfNot", draft.pointsIfNot)}
    </div>
  );
}
