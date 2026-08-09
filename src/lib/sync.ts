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
      if (games?.length) await db.games.bulkPut(games as Game[]);
      if (rules?.length) await db.ruleSets.bulkPut(rules as GameRuleSet[]);
      if (categories?.length) await db.categories.bulkPut(categories as ScoreCategory[]);
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

    const { error: matchError } = await supabase.from("matches").upsert(match);
    if (matchError) throw matchError;
    if (players.length) {
      const { error } = await supabase.from("players").upsert(players);
      if (error) throw error;
    }
    if (scores.length) {
      const { error } = await supabase.from("scores").upsert(scores);
      if (error) throw error;
    }
    if (rankings.length) {
      const { error } = await supabase.from("rankings").upsert(rankings);
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
    const { error } = await supabase.from("community_templates").upsert(template);
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
