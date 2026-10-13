import { db } from "@/lib/db";
import type { Match, Player, PlayerGroup, Profile, RankingRow, Score, ScoreRound } from "@/types";

/**
 * Sauvegarde / restauration des parties (fichier JSON). Les données vivent
 * uniquement dans le navigateur de l'appareil : sans ce fichier, changer
 * d'adresse (ou d'appareil) fait repartir de zéro. Le catalogue de jeux n'est
 * pas exporté : il est embarqué dans l'app.
 */
const FORMAT = "boardscore-backup";
const FORMAT_VERSION = 1;
const MAX_FILE_BYTES = 20 * 1024 * 1024;

export interface BackupData {
  matches: Match[];
  players: Player[];
  scores: Score[];
  scoreRounds: ScoreRound[];
  rankings: RankingRow[];
  profiles: Profile[];
  playerGroups: PlayerGroup[];
}

export interface BackupFile {
  format: typeof FORMAT;
  version: number;
  exportedAt: string;
  data: BackupData;
}

export interface ImportSummary {
  matches: number;
  players: number;
  skippedMatches: number;
}

const KEYS: (keyof BackupData)[] = ["matches", "players", "scores", "scoreRounds", "rankings", "profiles", "playerGroups"];

export async function buildBackup(): Promise<BackupFile> {
  const [matches, players, scores, scoreRounds, rankings, profiles, playerGroups] = await Promise.all([
    db.matches.toArray(),
    db.players.toArray(),
    db.scores.toArray(),
    db.scoreRounds.toArray(),
    db.rankings.toArray(),
    db.profiles.toArray(),
    db.playerGroups.toArray(),
  ]);
  return {
    format: FORMAT,
    version: FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    data: { matches, players, scores, scoreRounds, rankings, profiles, playerGroups },
  };
}

export function backupFileName(date = new Date()): string {
  return `boardscore-parties-${date.toISOString().slice(0, 10)}.json`;
}

/** Valide la forme d'un fichier de sauvegarde ; lève une Error au message lisible. */
export function parseBackup(text: string): BackupFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error("Ce fichier n'est pas une sauvegarde BoardScore valide.");
  }
  const file = raw as Partial<BackupFile> | null;
  if (!file || file.format !== FORMAT || typeof file.version !== "number" || !file.data) {
    throw new Error("Ce fichier n'est pas une sauvegarde BoardScore valide.");
  }
  if (file.version > FORMAT_VERSION) {
    throw new Error("Cette sauvegarde vient d'une version plus récente de l'app : mettez l'app à jour.");
  }
  const data = file.data as Partial<BackupData>;
  for (const key of KEYS) {
    const rows = data[key];
    if (!Array.isArray(rows)) throw new Error("Sauvegarde incomplète ou abîmée.");
    for (const row of rows) {
      if (!row || typeof row !== "object" || typeof (row as { id?: unknown }).id !== "string") {
        throw new Error("Sauvegarde incomplète ou abîmée.");
      }
    }
  }
  return file as BackupFile;
}

/**
 * Fusionne une sauvegarde dans la base locale, sans rien supprimer : une
 * partie déjà présente (même identifiant) est simplement remplacée par la
 * version importée, les autres sont ajoutées. Un prénom déjà connu ici
 * (même nom, sans tenir compte de la casse) réutilise le profil local plutôt
 * que d'en créer un doublon. Les parties d'un jeu absent du catalogue sont
 * ignorées (elles ne pourraient pas s'afficher).
 */
export async function importBackup(text: string): Promise<ImportSummary> {
  const { data } = parseBackup(text);

  return db.transaction(
    "rw",
    [db.matches, db.players, db.scores, db.scoreRounds, db.rankings, db.profiles, db.playerGroups, db.games],
    async () => {
      const knownGames = new Set((await db.games.toArray()).map((g) => g.id));
      const matches = data.matches.filter((m) => knownGames.has(m.gameId));
      const matchIds = new Set(matches.map((m) => m.id));
      const players = data.players.filter((p) => matchIds.has(p.matchId));
      const playerIds = new Set(players.map((p) => p.id));

      // Profils : réutilise un profil local de même prénom, sinon importe le profil.
      const localByName = new Map<string, Profile>();
      for (const p of await db.profiles.toArray()) localByName.set(p.name.trim().toLowerCase(), p);
      const profileIdMap = new Map<string, string>();
      const newProfiles: Profile[] = [];
      for (const profile of data.profiles) {
        const existing = localByName.get(profile.name.trim().toLowerCase());
        if (existing) {
          profileIdMap.set(profile.id, existing.id);
        } else {
          profileIdMap.set(profile.id, profile.id);
          newProfiles.push(profile);
          localByName.set(profile.name.trim().toLowerCase(), profile);
        }
      }
      const mapProfile = (id: string | undefined) => (id ? (profileIdMap.get(id) ?? id) : id);

      await db.profiles.bulkPut(newProfiles);
      await db.matches.bulkPut(matches);
      await db.players.bulkPut(players.map((p) => ({ ...p, profileId: mapProfile(p.profileId) })));
      await db.scores.bulkPut(data.scores.filter((s) => playerIds.has(s.playerId)));
      await db.scoreRounds.bulkPut(data.scoreRounds.filter((s) => playerIds.has(s.playerId)));
      await db.rankings.bulkPut(data.rankings.filter((r) => matchIds.has(r.matchId)));
      await db.playerGroups.bulkPut(
        data.playerGroups.map((g) => ({ ...g, profileIds: g.profileIds.map((id) => mapProfile(id) ?? id) })),
      );

      return { matches: matches.length, players: players.length, skippedMatches: data.matches.length - matches.length };
    },
  );
}

/** Lit un fichier choisi par l'utilisateur (avec une limite de taille raisonnable). */
export async function readBackupFile(file: File): Promise<string> {
  if (file.size > MAX_FILE_BYTES) throw new Error("Ce fichier est trop volumineux pour être une sauvegarde BoardScore.");
  return file.text();
}

export { MAX_FILE_BYTES };
