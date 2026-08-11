import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { db } from "@/lib/db";
import { GAMES_SEED } from "@/data/games.seed";
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

// Le catalogue embarqué (games.seed.ts) est la source de vérité pour nos
// propres jeux : le pull ne doit descendre que des jeux/règles VRAIMENT
// communautaires. Sans ce filtre, une ancienne copie poussée vers Supabase
// avant une correction locale (ex. Kingdomino découpé en catégories par
// terrain) revenait fusionner l'ancienne et la nouvelle version — deux
// catégories "territoires" affichées au lieu d'une mise à jour propre.
const LOCAL_GAME_IDS = new Set(GAMES_SEED.map((g) => g.id));
const LOCAL_RULE_IDS = new Set(GAMES_SEED.map((g) => g.ruleSet.id));

/** Descend le catalogue de jeux/règles communautaires depuis Supabase vers
 * le cache local (jamais nos propres jeux, voir LOCAL_GAME_IDS ci-dessus). */
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

    const communityGames = (games ?? []).filter((g) => !LOCAL_GAME_IDS.has(g.id as string));
    const communityRules = (rules ?? []).filter((r) => !LOCAL_RULE_IDS.has(r.id as string));
    const communityCategories = (categories ?? []).filter(
      (c) => !LOCAL_RULE_IDS.has(c.rule_id as string)
    );

    await db.transaction("rw", db.games, db.ruleSets, db.categories, async () => {
      if (communityGames.length) await db.games.bulkPut(communityGames.map((g) => toCamelCase<Game>(g)));
      if (communityRules.length) {
        await db.ruleSets.bulkPut(
          communityRules.map((r) => toCamelCase<Omit<GameRuleSet, "categories">>(r))
        );
      }
      if (communityCategories.length) {
        await db.categories.bulkPut(communityCategories.map((c) => toCamelCase<ScoreCategory>(c)));
      }
    });

    return { pulled: communityGames.length + communityRules.length + communityCategories.length };
  } catch (err) {
    console.warn("[BoardScore AI] Échec de synchronisation du catalogue :", err);
    return null;
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

