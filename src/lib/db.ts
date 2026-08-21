import Dexie, { type EntityTable } from "dexie";
import { GAMES_SEED, SEED_VERSION } from "@/data/games.seed";
import { computeRanking, effectiveRuleSet } from "@/lib/scoreEngine";
import type {
  Game,
  GameRuleSet,
  Match,
  Player,
  Profile,
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
  profiles!: EntityTable<Profile, "id">;

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
    // v6 : profils de joueurs réutilisés d'une partie à l'autre (stats
    // croisées) — chaque Player existant est rattaché à un profil retrouvé
    // ou créé d'après son prénom, pour que l'historique déjà joué compte
    // dans les stats dès l'activation plutôt que de repartir de zéro.
    this.version(6)
      .stores({
        profiles: "id, name",
        players: "id, matchId, profileId",
      })
      .upgrade(async (tx) => {
        const players = await tx.table("players").toArray();
        const profileIdByName = new Map<string, string>();
        for (const p of players) {
          const key = p.name.trim().toLowerCase();
          let profileId = profileIdByName.get(key);
          if (!profileId) {
            profileId = crypto.randomUUID();
            await tx.table("profiles").put({
              id: profileId,
              name: p.name.trim(),
              createdAt: new Date().toISOString(),
            });
            profileIdByName.set(key, profileId);
          }
          await tx.table("players").update(p.id, { profileId });
        }
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

/** Retrouve le profil existant pour ce prénom (normalisé) ou en crée un
 * nouveau — sans ça, deux parties avec "Alice" créeraient deux identités
 * distinctes et les stats croisées ne pourraient jamais la reconnaître. */
async function findOrCreateProfile(name: string): Promise<Profile> {
  const trimmed = name.trim();
  const key = trimmed.toLowerCase();
  const existing = await db.profiles.filter((p) => p.name.trim().toLowerCase() === key).first();
  if (existing) return existing;
  const profile: Profile = { id: crypto.randomUUID(), name: trimmed, createdAt: new Date().toISOString() };
  await db.profiles.put(profile);
  return profile;
}

export async function addPlayer(matchId: string, name: string): Promise<Player> {
  const existing = await db.players.where("matchId").equals(matchId).count();
  const profile = await findOrCreateProfile(name);
  const player: Player = {
    id: crypto.randomUUID(),
    matchId,
    name: profile.name,
    profileId: profile.id,
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

/** Reprend une partie déjà marquée terminée : depuis le classement, on peut
 * vouloir corriger un score plutôt que rejouer de zéro. Sans ça, retourner
 * à l'écran de saisie laissait le match "completed" — invisible pour la
 * carte "Partie en cours" de l'accueil, qui ne cherche que les parties
 * "in_progress" (l'utilisateur croyait alors devoir tout recommencer). */
export async function reopenMatch(matchId: string): Promise<void> {
  await db.matches.update(matchId, { status: "in_progress" });
}

/** Nouvelle partie du même jeu avec le même roster (mêmes prénoms, dans le
 * même ordre) : évite de retaper les joueurs à chaque soirée jeux récurrente.
 * Objectif et sens du classement repris aussi (règles habituelles du
 * groupe) ; le nom de partie ne l'est pas, propre à une date précise. */
export async function rematch(matchId: string): Promise<Match> {
  const full = await getFullMatch(matchId);
  if (!full) throw new Error(`Partie introuvable : ${matchId}`);

  const newMatch = await createMatch(full.game.id, {
    targetRounds: full.match.targetRounds,
    targetScore: full.match.targetScore,
  });
  if (full.match.sortDirection) {
    await updateMatchSettings(newMatch.id, { sortDirection: full.match.sortDirection });
  }
  for (const player of full.players) {
    await addPlayer(newMatch.id, player.name);
  }
  return newMatch;
}

export async function listMatches(): Promise<Match[]> {
  return db.matches.orderBy("createdAt").reverse().toArray();
}

export interface ProfileStats {
  profile: Profile;
  matchesPlayed: number;
  wins: number;
}

/**
 * Stats croisées entre parties, par profil : nombre de parties terminées et
 * de victoires. Ne compte que les parties à au moins deux joueurs — un
 * "classement" à un seul joueur gagne trivialement et fausserait le taux de
 * victoire. Triées par nombre de parties jouées (les plus actifs en premier).
 */
export async function getProfileStats(): Promise<ProfileStats[]> {
  const profiles = await db.profiles.toArray();
  const statsByProfile = new Map<string, ProfileStats>(
    profiles.map((profile) => [profile.id, { profile, matchesPlayed: 0, wins: 0 }])
  );

  const completedMatches = await db.matches.where("status").equals("completed").toArray();
  if (completedMatches.length === 0) return [...statsByProfile.values()];
  const matchIds = completedMatches.map((m) => m.id);

  const players = await db.players.where("matchId").anyOf(matchIds).toArray();
  const playersByMatch = new Map<string, Player[]>();
  for (const p of players) {
    const arr = playersByMatch.get(p.matchId) ?? [];
    arr.push(p);
    playersByMatch.set(p.matchId, arr);
  }
  const eligibleMatchIds = matchIds.filter((id) => (playersByMatch.get(id)?.length ?? 0) >= 2);

  const rankings = eligibleMatchIds.length
    ? await db.rankings.where("matchId").anyOf(eligibleMatchIds).toArray()
    : [];
  const rankingByPlayerId = new Map(rankings.map((r) => [r.playerId, r]));

  for (const matchId of eligibleMatchIds) {
    for (const p of playersByMatch.get(matchId) ?? []) {
      if (!p.profileId) continue;
      const stats = statsByProfile.get(p.profileId);
      if (!stats) continue;
      stats.matchesPlayed++;
      if (rankingByPlayerId.get(p.id)?.position === 1) stats.wins++;
    }
  }

  return [...statsByProfile.values()].sort((a, b) => b.matchesPlayed - a.matchesPlayed);
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
