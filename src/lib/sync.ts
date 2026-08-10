import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { db } from "@/lib/db";
import type { CommunityTemplate, Game, GameRuleSet, ScoreCategory } from "@/types";

/**
 * Synchronisation opportuniste entre le cache local (source de vérité pour
 * jouer) et Supabase (source de vérité pour partager). Rien ici n'est
 * bloquant : chaque fonction échoue silencieusement (log + retour) si
 * Supabase n'est pas configuré ou si le réseau est indisponible, pour ne
 * jamais interrompre une partie en cours.
 */

export function canSync(): boolean {
  return isSupabaseConfigured && navigator.onLine;
}

/**
 * L'app parle camelCase (JS), Postgres/PostgREST parle snake_case : sans
 * cette conversion, chaque upsert échoue avec une erreur du type
 * "Could not find the 'createdAt' column" (le nom réel est created_at).
 * Conversion volontairement peu profonde : le contenu de champs JSONB
 * opaques comme `config` ou `proposedCategories` doit rester tel quel,
 * seul le nom du champ top-level qui les contient change.
 */
function toSnakeCase<T extends object>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (value === undefined) continue;
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}

function toCamelCase<T>(row: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result as T;
}

/** Descend le catalogue de jeux/règles depuis Supabase vers le cache local. */
export async function pullGameCatalog(): Promise<{ pulled: number } | null> {
  if (!supabase || !canSync()) return null;
  try {
    const { data: games, error: gamesError } = await supabase.from("games").select("*");
    if (gamesError) throw gamesError;
    const { data: rules, error: rulesError } = await supabase.from("game_rules").select("*");
    if (rulesError) throw rulesError;
    const { data: categories, error: catError } = await supabase
      .from("score_categories")
      .select("*");
    if (catError) throw catError;

    await db.transaction("rw", db.games, db.ruleSets, db.categories, async () => {
      if (games?.length) await db.games.bulkPut(games.map((g) => toCamelCase<Game>(g)));
      if (rules?.length) {
        await db.ruleSets.bulkPut(rules.map((r) => toCamelCase<Omit<GameRuleSet, "categories">>(r)));
      }
      if (categories?.length) {
        await db.categories.bulkPut(categories.map((c) => toCamelCase<ScoreCategory>(c)));
      }
    });

    return { pulled: (games?.length ?? 0) + (rules?.length ?? 0) + (categories?.length ?? 0) };
  } catch (err) {
    console.warn("[BoardScore AI] Échec de synchronisation du catalogue :", err);
    return null;
  }
}

/** Pousse une partie terminée vers Supabase (historique multi-appareils). */
export async function pushCompletedMatch(matchId: string): Promise<boolean> {
  if (!supabase || !canSync()) return false;
  try {
    const match = await db.matches.get(matchId);
    if (!match) return false;
    const players = await db.players.where("matchId").equals(matchId).toArray();
    const rankings = await db.rankings.where("matchId").equals(matchId).toArray();
    const scores = players.length
      ? await db.scores.where("playerId").anyOf(players.map((p) => p.id)).toArray()
      : [];

    const { error: matchError } = await supabase.from("matches").upsert(toSnakeCase(match));
    if (matchError) throw matchError;
    if (players.length) {
      const { error } = await supabase.from("players").upsert(players.map(toSnakeCase));
      if (error) throw error;
    }
    if (scores.length) {
      const { error } = await supabase.from("scores").upsert(scores.map(toSnakeCase));
      if (error) throw error;
    }
    if (rankings.length) {
      const { error } = await supabase.from("rankings").upsert(rankings.map(toSnakeCase));
      if (error) throw error;
    }
    return true;
  } catch (err) {
    console.warn("[BoardScore AI] Échec de synchronisation de la partie :", err);
    return false;
  }
}

/** Publie une proposition de modèle communautaire pour validation. */
export async function pushCommunityTemplate(template: CommunityTemplate): Promise<boolean> {
  if (!supabase || !canSync()) return false;
  try {
    // gameId pointe vers le jeu créé localement pour rendre le modèle
    // jouable tout de suite (voir submitCommunityTemplate) : ce jeu n'existe
    // que sur cet appareil, pas dans la table `games` de Supabase. L'envoyer
    // violerait la contrainte de clé étrangère community_templates_game_id_fkey.
    // Ici on ne partage que la proposition elle-même (game_id reste NULL) ;
    // la relier à un vrai jeu partagé est un flux de modération à ajouter.
    const { gameId: _localGameId, ...shareable } = template;
    const { error } = await supabase.from("community_templates").upsert(toSnakeCase(shareable));
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("[BoardScore AI] Échec de publication du modèle communautaire :", err);
    return false;
  }
}

/** Partage une association code-barres -> jeu confirmée sur cet appareil,
 * pour que le prochain scanneur de la même boîte en profite instantanément. */
export async function pushBarcodeLink(code: string, gameId: string): Promise<boolean> {
  if (!supabase || !canSync()) return false;
  try {
    const { error } = await supabase.from("game_barcodes").upsert({ barcode: code, game_id: gameId });
    if (error) throw error;
    return true;
  } catch (err) {
    console.warn("[BoardScore AI] Échec de partage du code-barres :", err);
    return false;
  }
}

/** Descend la table de correspondance code-barres partagée par la communauté. */
export async function pullBarcodeMap(): Promise<number | null> {
  if (!supabase || !canSync()) return null;
  try {
    const { data, error } = await supabase.from("game_barcodes").select("barcode, game_id");
    if (error) throw error;
    if (data?.length) {
      await db.barcodes.bulkPut(data.map((row) => ({ code: row.barcode, gameId: row.game_id })));
    }
    return data?.length ?? 0;
  } catch (err) {
    console.warn("[BoardScore AI] Échec de synchronisation des codes-barres :", err);
    return null;
  }
}
