/**
 * Types du modèle de données local (Dexie/IndexedDB) : l'app est 100% locale,
 * aucune donnée ne quitte l'appareil.
 */

export type FormulaType =
  | "sum"
  | "bonus"
  | "malus"
  | "multiplier"
  | "conditional"
  | "hidden_objective";

/** Paramètres propres à chaque type de formule. Tous les champs sont optionnels
 * pour rester tolérant : une configuration incomplète retombe sur des valeurs
 * par défaut plutôt que de faire planter le calcul. */
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
  /** Variantes de texte utiles à la recherche floue. */
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
  /** Active un indicateur de donneur tournant (jeux de cartes : Belote,
   * Tarot...) — off par défaut pour ne pas encombrer l'écran de saisie des
   * jeux qui n'en ont pas besoin. */
  trackDealer?: boolean;
  /** Joueur donneur actuel, avancé manuellement manche après manche. */
  dealerPlayerId?: string;
}

export interface Player {
  id: string;
  matchId: string;
  name: string;
  isGuest: boolean;
  order: number;
  /** Profil réutilisé d'une partie à l'autre pour ce prénom (voir
   * lib/db.ts findOrCreateProfile) — permet les stats croisées entre
   * parties sans compte ni étape supplémentaire. Absent sur les joueurs
   * créés avant l'introduction des profils et jamais migrés. */
  profileId?: string;
}

/** Identité réutilisée d'une partie à l'autre pour un même prénom, sur cet
 * appareil — pas un compte, juste de quoi reconnaître "Alice" d'une soirée
 * jeux à l'autre pour calculer ses stats. */
export interface Profile {
  id: string;
  name: string;
  createdAt: string;
}

/** Groupe nommé de profils réutilisable d'une partie à l'autre — pour
 * ajouter d'un coup "la bande du jeudi" à une toute nouvelle partie, même la
 * première fois qu'on joue à ce jeu ensemble (contrairement à "Rejouer avec
 * les mêmes joueurs", qui suppose une partie déjà jouée). */
export interface PlayerGroup {
  id: string;
  name: string;
  profileIds: string[];
  createdAt: string;
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

/** Résultat consolidé du calcul de score, prêt pour l'affichage du classement. */
export interface PlayerResult {
  player: Player;
  total: number;
  position: number;
  breakdown: { category: ScoreCategory; rawValue: number; points: number }[];
}
