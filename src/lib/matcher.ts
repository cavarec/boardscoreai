import Fuse from "fuse.js";
import type { Game } from "@/types";

/** Reconnaissance floue d'un jeu à partir du nom saisi manuellement. */

export interface GameMatch {
  game: Game;
  score: number; // 0 = correspondance parfaite, 1 = aucune ressemblance
}

function buildFuse(games: Game[]) {
  return new Fuse(games, {
    keys: [
      { name: "name", weight: 0.5 },
      { name: "aliases", weight: 0.25 },
      { name: "description", weight: 0.15 },
      { name: "publisher", weight: 0.1 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true,
  });
}

/** Retourne les meilleures correspondances triées par pertinence. */
export function matchGames(games: Game[], query: string, limit = 5): GameMatch[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  const fuse = buildFuse(games);
  return fuse
    .search(trimmed, { limit })
    .map((r) => ({ game: r.item, score: r.score ?? 1 }));
}
