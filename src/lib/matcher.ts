import Fuse from "fuse.js";
import type { Game } from "@/types";

/**
 * Reconnaissance du jeu à partir d'un texte libre : nom saisi manuellement,
 * texte extrait par l'OCR d'une boîte / fiche de score, ou requête envoyée
 * à l'assistant conversationnel. Un seul moteur de correspondance floue pour
 * les trois entrées du concept ("scanner la boîte", "scanner la fiche",
 * "rechercher un jeu").
 */

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

/**
 * Un bloc de texte OCR contient souvent du bruit (éditeur, âge conseillé,
 * accroches marketing). On essaie plusieurs lignes/segments et on garde la
 * meilleure correspondance trouvée plutôt que de matcher le texte entier.
 */
export function matchGamesFromOcrText(games: Game[], rawText: string, limit = 3): GameMatch[] {
  const candidates = rawText
    .split(/\r?\n|[|•·]/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 3 && line.length <= 60);

  const fuse = buildFuse(games);
  const best = new Map<string, GameMatch>();

  for (const line of candidates.length ? candidates : [rawText]) {
    for (const r of fuse.search(line, { limit: 3 })) {
      const score = r.score ?? 1;
      const prev = best.get(r.item.id);
      if (!prev || score < prev.score) {
        best.set(r.item.id, { game: r.item, score });
      }
    }
  }

  return [...best.values()].sort((a, b) => a.score - b.score).slice(0, limit);
}

/** Un score Fuse.js proche de 0 = confiance haute. Seuil retenu pour
 * l'auto-confirmation silencieuse vs. la demande de confirmation à l'utilisateur. */
export const HIGH_CONFIDENCE_THRESHOLD = 0.2;
