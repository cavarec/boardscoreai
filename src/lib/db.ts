import Dexie, { type EntityTable } from "dexie";
import { GAMES_SEED } from "@/data/games.seed";
import { computeRanking } from "@/lib/scoreEngine";
import type {
  CommunityTemplate,
  Game,
  GameRuleSet,
  Match,
  Player,
  RankingRow,
  Score,
  ScoreCategory,
} from "@/types";

/**
 * Stockage local de référence de l'app (IndexedDB via Dexie).
 * Toute écriture (partie, score, joueur) passe par ici en premier —
 * la synchronisation Supabase (voir lib/sync.ts) est un second temps,
 * jamais un prérequis pour jouer.
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
  communityTemplates!: EntityTable<CommunityTemplate, "id">;
  meta!: EntityTable<{ key: string; value: unknown }, "key">;

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
  }
}

export const db = new BoardScoreDB();

let seeded = false;

/** Recharge le catalogue embarqué en base locale (idempotent). */
export async function ensureSeeded(): Promise<void> {
  if (seeded) return;
  const count = await db.games.count();
  if (count > 0) {
    seeded = true;
    return;
  }
  await db.transaction("rw", db.games, db.ruleSets, db.categories, async () => {
    for (const g of GAMES_SEED) {
      const { ruleSet, ...game } = g;
      const { categories, ...ruleMeta } = ruleSet;
      await db.games.put(game);
      await db.ruleSets.put(ruleMeta);
      await db.categories.bulkPut(categories);
    }
  });
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

export async function createMatch(gameId: string): Promise<Match> {
  const ruleSet = await getRuleSetForGame(gameId);
  if (!ruleSet) throw new Error(`Aucun modèle de score pour le jeu ${gameId}`);
  const match: Match = {
    id: crypto.randomUUID(),
    gameId,
    ruleId: ruleSet.id,
    createdAt: new Date().toISOString(),
    status: "in_progress",
  };
  await db.matches.put(match);
  return match;
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

export async function removePlayer(playerId: string): Promise<void> {
  await db.transaction("rw", db.players, db.scores, async () => {
    await db.scores.where("playerId").equals(playerId).delete();
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
  const ranking = computeRanking(full.ruleSet, full.scores, full.players);
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
  await db.transaction("rw", db.matches, db.players, db.scores, db.rankings, async () => {
    const players = await db.players.where("matchId").equals(matchId).toArray();
    for (const p of players) {
      await db.scores.where("playerId").equals(p.id).delete();
    }
    await db.players.where("matchId").equals(matchId).delete();
    await db.rankings.where("matchId").equals(matchId).delete();
    await db.matches.delete(matchId);
  });
}

export async function listCommunityTemplates(): Promise<CommunityTemplate[]> {
  return db.communityTemplates.orderBy("createdAt").reverse().toArray();
}

export async function submitCommunityTemplate(
  input: Omit<CommunityTemplate, "id" | "createdAt" | "status" | "votes">
): Promise<CommunityTemplate> {
  const template: CommunityTemplate = {
    ...input,
    id: crypto.randomUUID(),
    status: "pending",
    votes: 0,
    createdAt: new Date().toISOString(),
  };
  await db.communityTemplates.put(template);
  return template;
}

export async function voteTemplate(id: string, delta: 1 | -1): Promise<void> {
  const t = await db.communityTemplates.get(id);
  if (!t) return;
  await db.communityTemplates.update(id, { votes: t.votes + delta });
}

export async function getMeta<T>(key: string, fallback: T): Promise<T> {
  const row = await db.meta.get(key);
  return (row?.value as T) ?? fallback;
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await db.meta.put({ key, value });
}
