import { matchGames, HIGH_CONFIDENCE_THRESHOLD, type GameMatch } from "@/lib/matcher";
import type { Game } from "@/types";

/**
 * Assistant conversationnel simulé : pas d'appel à un modèle de langage
 * externe pour cette première version (choix de scaffolding retenu). La
 * "compréhension" vient d'une extraction d'intention par motifs + du même
 * moteur de correspondance floue que le scan et la recherche manuelle.
 * L'architecture (une fonction pure message -> réponse typée) est conçue
 * pour être remplacée par un vrai appel LLM sans changer l'UI du chat.
 */

export type AssistantReplyKind =
  | "greeting"
  | "help"
  | "match_found"
  | "suggestions"
  | "not_found";

export interface AssistantReply {
  kind: AssistantReplyKind;
  text: string;
  game?: Game;
  suggestions?: GameMatch[];
  gameNameGuess?: string;
}

const INTENT_PREFIXES = [
  /^je\s+joue\s+(à|a)\s+/i,
  /^on\s+joue\s+(à|a)\s+/i,
  /^j['’]aimerais\s+jouer\s+(à|a)\s+/i,
  /^je\s+voudrais\s+jouer\s+(à|a)\s+/i,
  /^comment\s+calculer\s+(les\s+points\s+de|le\s+score\s+de)\s+/i,
  /^quel\s+est\s+le\s+score\s+de\s+/i,
  /^je\s+cherche\s+/i,
  /^recherche\s+/i,
];

const GREETING_PATTERNS = /^(bonjour|salut|coucou|hello|hey)\s*!?$/i;
const HELP_PATTERNS = /(aide|help|comment\s+ça\s+marche|que\s+peux[- ]tu\s+faire)/i;

function stripIntentPrefix(message: string): string {
  let cleaned = message.trim();
  for (const pattern of INTENT_PREFIXES) {
    if (pattern.test(cleaned)) {
      cleaned = cleaned.replace(pattern, "").trim();
      break;
    }
  }
  return cleaned.replace(/[.!?]+$/, "").trim();
}

export function respondToMessage(message: string, games: Game[]): AssistantReply {
  const trimmed = message.trim();

  if (!trimmed) {
    return { kind: "help", text: "Dites-moi simplement le nom du jeu, par exemple « je joue à Wingspan »." };
  }
  if (GREETING_PATTERNS.test(trimmed)) {
    return {
      kind: "greeting",
      text: "Bonjour ! Dites-moi à quoi vous jouez ce soir, ou décrivez le jeu si vous ne connaissez pas son nom exact.",
    };
  }
  if (HELP_PATTERNS.test(trimmed)) {
    return {
      kind: "help",
      text:
        "Vous pouvez écrire « je joue à Azul », ou décrire le jeu (« un jeu qui compte les points par objectifs et ressources »). " +
        "Je retrouve la méthode de calcul, ou je vous propose d'en créer une nouvelle si le jeu n'existe pas encore.",
    };
  }

  const query = stripIntentPrefix(trimmed);
  const matches = matchGames(games, query, 5);

  if (matches.length === 0) {
    return {
      kind: "not_found",
      gameNameGuess: query,
      text: `Je ne reconnais pas encore « ${query} ». Voulez-vous créer un nouveau modèle de score pour ce jeu ?`,
    };
  }

  const [best, ...rest] = matches;
  if (best.score <= HIGH_CONFIDENCE_THRESHOLD) {
    return {
      kind: "match_found",
      game: best.game,
      text: `${best.game.name} — j'ai chargé le modèle de score (${best.game.publisher}, ${best.game.year}).`,
    };
  }

  const plausible = matches.filter((m) => m.score <= 0.45);
  if (plausible.length > 0) {
    return {
      kind: "suggestions",
      suggestions: plausible,
      gameNameGuess: query,
      text: `Je ne suis pas certain, est-ce l'un de ceux-ci ?`,
    };
  }

  return {
    kind: "not_found",
    gameNameGuess: query,
    text: `Je ne reconnais pas encore « ${query} ». Voulez-vous créer un nouveau modèle de score pour ce jeu ?`,
  };
}
