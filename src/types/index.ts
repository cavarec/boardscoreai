/**
 * Types miroir du schéma Supabase (voir supabase/schema.sql).
 * Utilisés à la fois par le cache local (Dexie) et par le client Supabase,
 * pour que le moteur de score et les écrans n'aient jamais à distinguer
 * une donnée locale d'une donnée synchronisée.
 */

export type FormulaType =
  | "sum"
  | "bonus"
  | "malus"
  | "multiplier"
  | "conditional"
  | "hidden_objective";

/** Paramètres propres à chaque type de formule. Tous les champs sont optionnels
 * pour rester tolérant : un modèle communautaire mal rempli retombe sur des
 * valeurs par défaut plutôt que de faire planter le calcul. */
export interface FormulaConfig {
  /** sum / bonus / malus : multiplicateur appliqué à la valeur saisie. */
  perUnit?: number;
  /** multiplier : facteur fixe appliqué à la valeur saisie (ex. x2 par ville). */
  factor?: number;
  /** conditional / hidden_objective : mode d'évaluation. */
  mode?: "boolean" | "threshold";
  /** conditional en mode threshold : seuil à atteindre. */
  threshold?: number;
  /** conditional / hidden_objective : points si la condition est remplie. */
  pointsIfMet?: number;
  /** conditional / hidden_objective : points si la condition n'est pas remplie. */
  pointsIfNot?: number;
  /** Aide courte affichée sous le champ de saisie. */
  helper?: string;
  /** Pas d'incrémentation pour les boutons +/-. */
  step?: number;
  /** Borne basse/haute optionnelles pour la saisie. */
  min?: number;
  max?: number;
  /** Remplace le stepper +/-1 par une saisie "score de cette manche" qui
   * s'ajoute au total cumulé — pour les jeux joués en plusieurs manches
   * (Skyjo, 6 qui prend…) où le score de fin de partie n'existe pas en une
   * seule fois. Voir ScoreRound dans lib/db.ts. */
  roundBased?: boolean;
}

/** Une entrée de manche pour une catégorie "roundBased" : le détail derrière
 * le total cumulé d'un Score, conservé pour l'afficher et permettre l'annulation. */
export interface ScoreRound {
  id: string;
  playerId: string;
  categoryId: string;
  value: number;
  order: number;
  createdAt: string;
}

export interface ScoreCategory {
  id: string;
  ruleId: string;
  label: string;
  formulaType: FormulaType;
  config: FormulaConfig;
  order: number;
}

export interface GameRuleSet {
  id: string;
  gameId: string;
  versionLabel: string;
  isOfficial: boolean;
  tieBreakCategoryId?: string;
  /** La plupart des jeux se gagnent au score le plus haut ("desc", par
   * défaut). Quelques-uns (Skyjo, 6 qui prend…) se gagnent au score le plus
   * bas : "asc" inverse le sens du classement sans toucher au calcul des points. */
  sortDirection?: "asc" | "desc";
  categories: ScoreCategory[];
}

export interface Game {
  id: string;
  name: string;
  publisher: string;
  year: number;
  coverUrl?: string;
  minPlayers?: number;
  maxPlayers?: number;
  /** Variantes de texte utiles au matching OCR / recherche floue. */
  aliases: string[];
  description?: string;
}

/** Un jeu et sa méthode de calcul par défaut, regroupés pour la commodité
 * de l'app (catalogue local, résultats de matching, etc.). */
export interface GameWithRules extends Game {
  ruleSet: GameRuleSet;
}

export type MatchStatus = "in_progress" | "completed";

export interface Match {
  id: string;
  gameId: string;
  ruleId: string;
  createdBy?: string;
  createdAt: string;
  playedAt?: string;
  status: MatchStatus;
  /** Utilisés par "Jeu rapide" (voir games.seed.ts) : objectif optionnel
   * affiché pendant la saisie, purement indicatif (ne termine pas la partie
   * automatiquement). */
  targetRounds?: number;
  targetScore?: number;
  /** "Jeu rapide" uniquement : le jeu réel scanné/recherché a une règle de
   * classement fixe (ruleSet.sortDirection), mais un jeu suivi librement n'en
   * a pas — l'utilisateur choisit ici si le plus haut ou le plus bas score
   * gagne. Remplace ruleSet.sortDirection pour ce match précis quand défini. */
  sortDirection?: "asc" | "desc";
  /** "Jeu rapide" uniquement : nom libre pour retrouver la partie dans
   * l'historique (ex. "Soirée jeux du 15 août") plutôt que juste "Jeu rapide". */
  name?: string;
}

export interface Player {
  id: string;
  matchId: string;
  name: string;
  isGuest: boolean;
  order: number;
}

export interface Score {
  id: string;
  playerId: string;
  categoryId: string;
  value: number;
}

export interface RankingRow {
  id: string;
  matchId: string;
  playerId: string;
  position: number;
  total: number;
}

export type CommunityTemplateStatus = "pending" | "approved" | "rejected";

export interface CommunityTemplate {
  id: string;
  gameId?: string;
  gameNameGuess: string;
  authorId?: string;
  status: CommunityTemplateStatus;
  proposedCategories: Omit<ScoreCategory, "id" | "ruleId">[];
  sourceNote?: string;
  createdAt: string;
  votes: number;
}

export interface AppUser {
  id: string;
  email?: string;
  displayName: string;
  isPremium: boolean;
}

/** Résultat consolidé du calcul de score, prêt pour l'affichage du classement. */
export interface PlayerResult {
  player: Player;
  total: number;
  position: number;
  breakdown: { category: ScoreCategory; rawValue: number; points: number }[];
}
