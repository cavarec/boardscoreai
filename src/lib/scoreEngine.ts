import type {
  FormulaConfig,
  GameRuleSet,
  Player,
  PlayerResult,
  Score,
  ScoreCategory,
} from "@/types";

/**
 * Moteur de score générique : toute la logique de calcul dépend uniquement
 * de la configuration stockée en base (ScoreCategory.formulaType + config).
 * Ajouter un nouveau jeu — ou une variante — ne touche jamais ce fichier.
 */

function computeCategoryPoints(category: ScoreCategory, rawValue: number): number {
  const config: FormulaConfig = category.config ?? {};
  const value = Number.isFinite(rawValue) ? rawValue : 0;

  switch (category.formulaType) {
    case "sum":
    case "bonus":
      return value * (config.perUnit ?? 1);

    case "malus":
      return -Math.abs(value) * (config.perUnit ?? 1);

    case "multiplier":
      return value * (config.factor ?? 1);

    case "conditional":
    case "hidden_objective": {
      const met =
        config.mode === "threshold"
          ? value >= (config.threshold ?? 1)
          : value > 0;
      return met ? config.pointsIfMet ?? 0 : config.pointsIfNot ?? 0;
    }

    default:
      return value;
  }
}

export function getRawValue(scores: Score[], playerId: string, categoryId: string): number {
  const score = scores.find((s) => s.playerId === playerId && s.categoryId === categoryId);
  return score?.value ?? 0;
}

/** Calcule le total et le détail par catégorie pour un joueur, sans le classer. */
export function computePlayerBreakdown(
  ruleSet: GameRuleSet,
  scores: Score[],
  player: Player
): { total: number; breakdown: PlayerResult["breakdown"] } {
  const breakdown = [...ruleSet.categories]
    .sort((a, b) => a.order - b.order)
    .map((category) => {
      const rawValue = getRawValue(scores, player.id, category.id);
      const points = computeCategoryPoints(category, rawValue);
      return { category, rawValue, points };
    });

  const total = breakdown.reduce((sum, b) => sum + b.points, 0);
  return { total, breakdown };
}

/**
 * Calcule le classement complet d'une partie.
 * Classement "à la compétition" : deux totaux égaux partagent le même rang,
 * le rang suivant saute (1, 1, 3, 4…). Une catégorie de départage optionnelle
 * (tieBreakCategoryId) est utilisée avant d'accepter une égalité.
 */
export function computeRanking(
  ruleSet: GameRuleSet,
  scores: Score[],
  players: Player[]
): PlayerResult[] {
  const direction = ruleSet.sortDirection === "asc" ? -1 : 1;

  const withTotals = players.map((player) => {
    const { total, breakdown } = computePlayerBreakdown(ruleSet, scores, player);
    const tieBreakValue = ruleSet.tieBreakCategoryId
      ? getRawValue(scores, player.id, ruleSet.tieBreakCategoryId)
      : 0;
    return { player, total, breakdown, tieBreakValue };
  });

  withTotals.sort(
    (a, b) => direction * (b.total - a.total) || direction * (b.tieBreakValue - a.tieBreakValue)
  );

  const results: PlayerResult[] = [];
  let lastTotal: number | null = null;
  let lastTieBreak: number | null = null;
  let lastPosition = 0;

  withTotals.forEach((entry, index) => {
    const isTie = lastTotal === entry.total && lastTieBreak === entry.tieBreakValue;
    const position = isTie ? lastPosition : index + 1;
    results.push({
      player: entry.player,
      total: entry.total,
      position,
      breakdown: entry.breakdown,
    });
    lastTotal = entry.total;
    lastTieBreak = entry.tieBreakValue;
    lastPosition = position;
  });

  return results;
}

/** Libellé humain d'un type de formule, pour les écrans de création de modèle. */
export const FORMULA_LABELS: Record<ScoreCategory["formulaType"], string> = {
  sum: "Addition simple",
  bonus: "Bonus",
  malus: "Malus",
  multiplier: "Multiplicateur",
  conditional: "Condition / objectif",
  hidden_objective: "Objectif caché",
};
