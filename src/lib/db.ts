import Dexie, { type EntityTable } from "dexie";
import { GAMES_SEED, SEED_VERSION } from "@/data/games.seed";
import { computeRanking, effectiveRuleSet } from "@/lib/scoreEngine";
import type {
  Game,
  GameRuleSet,
  Match,
  Player,
  RankingRow,
  Score,
  ScoreCategory,
  ScoreRound,
} from "@/types";

/**
 * Stockage local de référence de l'app (IndexedDB via Dexie) : l'app est
 * 100% locale, aucune donnée ne quitte l'appareil.
 */
type RuleSetRow = Omit<GameRuleSet, "categories">;

class BoardScoreDB extends Dexie {
  games!: EntityTable<Game, "id">;
  ruleSets!: EntityTable<RuleSetRow, "id">;
  categories!: EntityTable<ScoreCategory, "id">;
  matches!: EntityTable<Match, "id">;
  players!: EntityTable<Player, "id">;
  scores!: EntityTable<Score, "id">;
  rankings!: EntityTable<RankingRow, "id">;
  meta!: EntityTable<{ key: string; value: unknown }, "key">;
  scoreRounds!: EntityTable<ScoreRound, "id">;

  constructor() {
    super("boardscore-ai");
    this.version(1).stores({
      games: "id, name",
      ruleSets: "id, gameId",
      categories: "id, ruleId",
      matches: "id, gameId, status, createdAt",
      players: "id, matchId",
      scores: "id, playerId, categoryId, [playerId+categoryId]",
      rankings: "id, matchId, playerId",
      communityTemplates: "id, status, gameId, createdAt",
      meta: "key",
    });
    // v2 : table de correspondance code-barres -> jeu (voir lib/barcode.ts).
    // Nouvelle version Dexie requise pour que les installations existantes
    // (déjà en v1) reçoivent le nouveau store sans perdre leurs données.
    this.version(2).stores({
      barcodes: "code, gameId",
    });
    // v3 : détail des manches derrière un Score cumulé (voir addRoundScore) —
    // n'affecte pas le moteur de calcul, qui continue à ne lire que scores.value.
    this.version(3).stores({
      scoreRounds: "id, playerId, categoryId, [playerId+categoryId]",
    });
    // v4 : le scan de code-barres est abandonné (capteur caméra peu fiable
    // sur iOS) — supprime le store devenu inutile plutôt que de le laisser
    // trainer sur les appareils déjà en v2/v3.
    this.version(4).stores({
      barcodes: null,
    });
    // v5 : la communauté (proposer/voter des modèles) est abandonnée —
    // même raison que le code-barres, supprimer le store plutôt que de le
    // laisser trainer sur les appareils qui l'avaient déjà rempli.
    this.version(5).stores({
      communityTemplates: null,
    });
  }
}

export const db = new BoardScoreDB();

let seeded = false;
const SEED_VERSION_KEY = "catalogSeedVersion";

/**
 * Recharge le catalogue embarqué en base locale (idempotent), et le
 * réapplique après une mise à jour de l'app si SEED_VERSION a changé — sinon
 * un appareil ayant déjà joué garderait indéfiniment l'ancien catalogue
 * puisque ce cache local ne se resynchronise jamais tout seul.
 */
export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  const installedVersion = await getMeta(SEED_VERSION_KEY, 0);
  if (installedVersion >= SEED_VERSION) {
    seeded = true;
    return;
  }
  await db.transaction("rw", db.games, db.ruleSets, db.categories, async () => {
    for (const g of GAMES_SEED) {
      const { ruleSet, ...game } = g;
      const { categories, ...ruleMeta } = ruleSet;
      await db.games.put(game);
      await db.ruleSets.put(ruleMeta);
      // bulkPut seul ne fait qu'ajouter/mettre à jour : une catégorie retirée
      // du seed (ex. Kingdomino passant d'une catégorie combinée à une par
      // terrain) resterait orpheline en base sans ce nettoyage préalable.
      await db.categories.where("ruleId").equals(ruleMeta.id).delete();
      await db.categories.bulkPut(categories);
    }
  });
  await setMeta(SEED_VERSION_KEY, SEED_VERSION);
  seeded = true;
}

export async function getAllGames(): Promise<Game[]> {
  await ensureSeeded();
  return db.games.orderBy("name").toArray();
}

export async function getRuleSetForGame(gameId: string): Promise<GameRuleSet | undefined> {
  const ruleMeta = await db.ruleSets.where("gameId").equals(gameId).first();
  if (!ruleMeta) return undefined;
  const categories = await db.categories.where("ruleId").equals(ruleMeta.id).sortBy("order");
  return { ...ruleMeta, categories };
}

export async function getGameWithRules(gameId: string) {
  await ensureSeeded();
  const game = await db.games.get(gameId);
  if (!game) return undefined;
  const ruleSet = await getRuleSetForGame(gameId);
  if (!ruleSet) return undefined;
  return { ...game, ruleSet };
}

export async function createMatch(
  gameId: string,
  targets?: { targetRounds?: number; targetScore?: number }
): Promise<Match> {
  const ruleSet = await getRuleSetForGame(gameId);
  if (!ruleSet) throw new Error(`Aucun modèle de score pour le jeu ${gameId}`);
  const match: Match = {
    id: crypto.randomUUID(),
    gameId,
    ruleId: ruleSet.id,
    createdAt: new Date().toISOString(),
    status: "in_progress",
    ...targets,
  };
  await db.matches.put(match);
  return match;
}

/** Utilisé par "Jeu rapide" : ajuste l'objectif indicatif (nombre de manches
 * et/ou score à atteindre), le sens du classement (plus haut/bas gagne) et le
 * nom de la partie après coup, tous optionnels. */
export async function updateMatchSettings(
  matchId: string,
  settings: {
    targetRounds?: number;
    targetScore?: number;
    sortDirection?: "asc" | "desc";
    name?: string;
  }
): Promise<void> {
  await db.matches.update(matchId, settings);
}

export async function addPlayer(matchId: string, name: string): Promise<Player> {
  const existing = await db.players.where("matchId").equals(matchId).count();
  const player: Player = {
    id: crypto.randomUUID(),
    matchId,
    name,
    isGuest: true,
    order: existing,
  };
  await db.players.put(player);
  return player;
}

/** Ordre d'affichage/de tour des joueurs (voir "Tirer au sort qui commence"
 * dans MatchPlayers.tsx) : réattribue `order` selon l'ordre du tableau donné. */
export async function reorderPlayers(matchId: string, orderedPlayerIds: string[]): Promise<void> {
  await db.transaction("rw", db.players, async () => {
    await Promise.all(
      orderedPlayerIds.map((id, index) =>
        db.players.where("id").equals(id).and((p) => p.matchId === matchId).modify({ order: index })
      )
    );
  });
}

export async function removePlayer(playerId: string): Promise<void> {
  await db.transaction("rw", db.players, db.scores, db.scoreRounds, async () => {
    await db.scores.where("playerId").equals(playerId).delete();
    await db.scoreRounds.where("playerId").equals(playerId).delete();
    await db.players.delete(playerId);
  });
}

export async function setScore(playerId: string, categoryId: string, value: number): Promise<void> {
  const existing = await db.scores
    .where("[playerId+categoryId]")
    .equals([playerId, categoryId])
    .first();
  if (existing) {
    await db.scores.update(existing.id, { value });
  } else {
    await db.scores.put({ id: crypto.randomUUID(), playerId, categoryId, value });
  }
}

/**
 * Ajoute le score d'UNE manche pour les catégories "roundBased" (Skyjo, 6 qui
 * prend…) et l'ajoute au total cumulé — l'utilisateur saisit ce qu'il vient
 * de faire, pas le total qu'il devrait recalculer de tête à chaque manche.
 */
export async function addRoundScore(
  playerId: string,
  categoryId: string,
  value: number
): Promise<void> {
  await db.transaction("rw", db.scores, db.scoreRounds, async () => {
    const existingRounds = await db.scoreRounds
      .where("[playerId+categoryId]")
      .equals([playerId, categoryId])
      .count();
    await db.scoreRounds.put({
      id: crypto.randomUUID(),
      playerId,
      categoryId,
      value,
      order: existingRounds,
      createdAt: new Date().toISOString(),
    });
    const existingScore = await db.scores
      .where("[playerId+categoryId]")
      .equals([playerId, categoryId])
      .first();
    if (existingScore) {
      await db.scores.update(existingScore.id, { value: existingScore.value + value });
    } else {
      await db.scores.put({ id: crypto.randomUUID(), playerId, categoryId, value });
    }
  });
}

export async function getRounds(playerId: string, categoryId: string) {
  return db.scoreRounds
    .where("[playerId+categoryId]")
    .equals([playerId, categoryId])
    .sortBy("order");
}

/** Annule une manche : retire son entrée et son montant du total cumulé. */
export async function removeRound(roundId: string): Promise<void> {
  await db.transaction("rw", db.scores, db.scoreRounds, async () => {
    const round = await db.scoreRounds.get(roundId);
    if (!round) return;
    await db.scoreRounds.delete(roundId);
    const score = await db.scores
      .where("[playerId+categoryId]")
      .equals([round.playerId, round.categoryId])
      .first();
    if (score) {
      await db.scores.update(score.id, { value: score.value - round.value });
    }
  });
}

export interface FullMatch {
  match: Match;
  game: Game;
  ruleSet: GameRuleSet;
  players: Player[];
  scores: Score[];
}

export async function getFullMatch(matchId: string): Promise<FullMatch | undefined> {
  const match = await db.matches.get(matchId);
  if (!match) return undefined;
  const game = await db.games.get(match.gameId);
  const ruleSet = await getRuleSetForGame(match.gameId);
  if (!game || !ruleSet) return undefined;
  const players = await db.players.where("matchId").equals(matchId).sortBy("order");
  const playerIds = players.map((p) => p.id);
  const scores = playerIds.length
    ? await db.scores.where("playerId").anyOf(playerIds).toArray()
    : [];
  return { match, game, ruleSet, players, scores };
}

export async function completeMatch(matchId: string): Promise<void> {
  const full = await getFullMatch(matchId);
  if (!full) return;
  const ranking = computeRanking(effectiveRuleSet(full.ruleSet, full.match), full.scores, full.players);
  await db.transaction("rw", db.matches, db.rankings, async () => {
    await db.rankings.where("matchId").equals(matchId).delete();
    await db.rankings.bulkPut(
      ranking.map((r) => ({
        id: crypto.randomUUID(),
        matchId,
        playerId: r.player.id,
        position: r.position,
        total: r.total,
      }))
    );
    await db.matches.update(matchId, {
      status: "completed",
      playedAt: new Date().toISOString(),
    });
  });
}

export async function listMatches(): Promise<Match[]> {
  return db.matches.orderBy("createdAt").reverse().toArray();
}

export async function deleteMatch(matchId: string): Promise<void> {
  await db.transaction(
    "rw",
    db.matches,
    db.players,
    db.scores,
    db.scoreRounds,
    db.rankings,
    async () => {
      const players = await db.players.where("matchId").equals(matchId).toArray();
      for (const p of players) {
        await db.scores.where("playerId").equals(p.id).delete();
        await db.scoreRounds.where("playerId").equals(p.id).delete();
      }
      await db.players.where("matchId").equals(matchId).delete();
      await db.rankings.where("matchId").equals(matchId).delete();
      await db.matches.delete(matchId);
    }
  );
}

export async function getMeta<T>(key: string, fallback: T): Promise<T> {
  const row = await db.meta.get(key);
  return (row?.value as T) ?? fallback;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}
