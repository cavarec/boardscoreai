import type { GameWithRules, ScoreCategory } from "@/types";

/**
 * Catalogue de démarrage embarqué dans l'app : une douzaine de jeux populaires
 * avec un modèle de score réaliste, disponibles hors-ligne dès l'installation.
 * Le dernier jeu ("Autre jeu / modèle générique") sert de point de départ
 * pour la création communautaire d'un nouveau modèle.
 *
 * Les ids sont stables (pas d'UUID générés à la volée) pour que le cache
 * IndexedDB reste cohérent d'un lancement à l'autre de l'app.
 */

let order = 0;
function cat(
  ruleId: string,
  id: string,
  label: string,
  formulaType: ScoreCategory["formulaType"],
  config: ScoreCategory["config"] = {}
): ScoreCategory {
  return { id, ruleId, label, formulaType, config, order: order++ };
}

function game(base: Omit<GameWithRules, "ruleSet"> & { ruleSet: Omit<GameWithRules["ruleSet"], "categories"> & { categories: ScoreCategory[] } }): GameWithRules {
  return base as GameWithRules;
}

order = 0;
const sevenWonders = game({
  id: "game-7-wonders",
  name: "7 Wonders",
  publisher: "Repos Production",
  year: 2010,
  minPlayers: 3,
  maxPlayers: 7,
  aliases: ["7 wonders", "sept merveilles", "7wonders", "seven wonders"],
  description: "Développez une civilisation antique en tirant parti de sept merveilles du monde.",
  ruleSet: {
    id: "rule-7-wonders-base",
    gameId: "game-7-wonders",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-7-wonders-base", "cat-7w-coins", "Pièces d'or (3 pièces = 1 pt)", "sum", { helper: "Total de vos pièces divisé par 3, arrondi", step: 1 }),
      cat("rule-7-wonders-base", "cat-7w-military", "Points militaires", "sum", { helper: "Peut être négatif", step: 1 }),
      cat("rule-7-wonders-base", "cat-7w-wonders", "Merveille construite", "sum", { step: 1 }),
      cat("rule-7-wonders-base", "cat-7w-civil", "Bâtiments civils (bleu)", "sum", { step: 1 }),
      cat("rule-7-wonders-base", "cat-7w-commerce", "Bâtiments commerciaux (jaune)", "sum", { step: 1 }),
      cat("rule-7-wonders-base", "cat-7w-guilds", "Guildes (violet)", "sum", { step: 1 }),
      cat("rule-7-wonders-base", "cat-7w-science", "Sciences (vert)", "sum", { helper: "Total déjà calculé des symboles", step: 1 }),
    ],
  },
});

order = 0;
const wingspan = game({
  id: "game-wingspan",
  name: "Wingspan",
  publisher: "Stonemaier Games",
  year: 2019,
  minPlayers: 1,
  maxPlayers: 5,
  aliases: ["wingspan", "wing span"],
  description: "Attirez une collection d'oiseaux dans vos réserves naturelles.",
  ruleSet: {
    id: "rule-wingspan-base",
    gameId: "game-wingspan",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-wingspan-base", "cat-wb-birds", "Points des oiseaux", "sum", { step: 1 }),
      cat("rule-wingspan-base", "cat-wb-bonus-cards", "Cartes bonus", "bonus", { step: 1 }),
      cat("rule-wingspan-base", "cat-wb-goals", "Objectifs de fin de manche", "bonus", { step: 1 }),
      cat("rule-wingspan-base", "cat-wb-eggs", "Œufs sur le plateau", "sum", { perUnit: 1, helper: "1 pt par œuf", step: 1 }),
      cat("rule-wingspan-base", "cat-wb-food", "Nourriture stockée sur cartes", "sum", { perUnit: 1, step: 1 }),
      cat("rule-wingspan-base", "cat-wb-cached", "Cartes tuck sous vos oiseaux", "sum", { perUnit: 1, step: 1 }),
    ],
  },
});

order = 0;
const terraformingMars = game({
  id: "game-terraforming-mars",
  name: "Terraforming Mars",
  publisher: "FryxGames",
  year: 2016,
  minPlayers: 1,
  maxPlayers: 5,
  aliases: ["terraforming mars", "tm", "terraforming"],
  description: "Terraformez la planète rouge en développant infrastructures et écosystèmes.",
  ruleSet: {
    id: "rule-tm-base",
    gameId: "game-terraforming-mars",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-tm-base", "cat-tm-tr", "Niveau de terraformation (TR)", "sum", { step: 1 }),
      cat("rule-tm-base", "cat-tm-cards", "Points sur les cartes jouées", "sum", { step: 1 }),
      cat("rule-tm-base", "cat-tm-milestones", "Étapes réclamées", "bonus", { perUnit: 5, helper: "5 pts par étape", step: 1 }),
      cat("rule-tm-base", "cat-tm-awards", "Récompenses remportées", "bonus", { perUnit: 5, helper: "5 pts par récompense", step: 1 }),
      cat("rule-tm-base", "cat-tm-forests", "Forêts posées", "multiplier", { factor: 1, helper: "1 pt par forêt", step: 1 }),
      cat("rule-tm-base", "cat-tm-cities", "Villes (selon tuiles vertes adjacentes)", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const azul = game({
  id: "game-azul",
  name: "Azul",
  publisher: "Plan B Games",
  year: 2017,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["azul"],
  description: "Décorez les murs du palais royal d'Évora avec de superbes azulejos.",
  ruleSet: {
    id: "rule-azul-base",
    gameId: "game-azul",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-azul-base", "cat-az-tiles", "Points de motifs posés", "sum", { step: 1 }),
      cat("rule-azul-base", "cat-az-rows", "Lignes horizontales complètes", "bonus", { perUnit: 2, helper: "2 pts par ligne", step: 1 }),
      cat("rule-azul-base", "cat-az-cols", "Colonnes verticales complètes", "bonus", { perUnit: 7, helper: "7 pts par colonne", step: 1 }),
      cat("rule-azul-base", "cat-az-colors", "Couleurs complètes (5 exemplaires)", "bonus", { perUnit: 10, helper: "10 pts par couleur", step: 1 }),
      cat("rule-azul-base", "cat-az-penalty", "Case pénalité (ligne du bas)", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const splendor = game({
  id: "game-splendor",
  name: "Splendor",
  publisher: "Space Cowboys",
  year: 2014,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["splendor"],
  description: "Devenez un riche marchand de la Renaissance en collectionnant mines et joyaux.",
  ruleSet: {
    id: "rule-splendor-base",
    gameId: "game-splendor",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-splendor-base", "cat-sp-cards", "Points sur les cartes développement", "sum", { step: 1 }),
      cat("rule-splendor-base", "cat-sp-nobles", "Nobles visités", "bonus", { perUnit: 3, helper: "3 pts par noble", step: 1 }),
    ],
  },
});

order = 0;
const catan = game({
  id: "game-catan",
  name: "Catane",
  publisher: "Kosmos",
  year: 1995,
  minPlayers: 3,
  maxPlayers: 4,
  aliases: ["catane", "catan", "les colons de catane", "settlers of catan"],
  description: "Colonisez l'île de Catane en gérant ressources, routes et villages.",
  ruleSet: {
    id: "rule-catan-base",
    gameId: "game-catan",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-catan-base", "cat-ct-settlements", "Colonies", "sum", { perUnit: 1, step: 1 }),
      cat("rule-catan-base", "cat-ct-cities", "Villes", "multiplier", { factor: 2, helper: "2 pts par ville", step: 1 }),
      cat("rule-catan-base", "cat-ct-dev-cards", "Points sur cartes développement", "sum", { step: 1 }),
      cat("rule-catan-base", "cat-ct-longest-road", "Route la plus longue", "conditional", { mode: "boolean", pointsIfMet: 2, pointsIfNot: 0 }),
      cat("rule-catan-base", "cat-ct-largest-army", "Plus grande armée", "conditional", { mode: "boolean", pointsIfMet: 2, pointsIfNot: 0 }),
    ],
  },
});

order = 0;
const carcassonne = game({
  id: "game-carcassonne",
  name: "Carcassonne",
  publisher: "Hans im Glück",
  year: 2000,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["carcassonne"],
  description: "Construisez routes, villes et abbayes tuile après tuile.",
  ruleSet: {
    id: "rule-carc-base",
    gameId: "game-carcassonne",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-carc-base", "cat-cc-roads", "Routes terminées", "sum", { step: 1 }),
      cat("rule-carc-base", "cat-cc-cities", "Villes terminées", "sum", { step: 1 }),
      cat("rule-carc-base", "cat-cc-monasteries", "Monastères terminés", "sum", { step: 1 }),
      cat("rule-carc-base", "cat-cc-farms", "Prés (fin de partie)", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const ticketToRide = game({
  id: "game-ticket-to-ride",
  name: "Les Aventuriers du Rail",
  publisher: "Days of Wonder",
  year: 2004,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["les aventuriers du rail", "ticket to ride", "aventuriers du rail"],
  description: "Reliez les villes en posant des wagons et en complétant vos destinations.",
  ruleSet: {
    id: "rule-ttr-base",
    gameId: "game-ticket-to-ride",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-ttr-base", "cat-ttr-routes", "Points des voies posées", "sum", { step: 1 }),
      cat("rule-ttr-base", "cat-ttr-tickets-done", "Destinations complétées", "sum", { step: 1 }),
      cat("rule-ttr-base", "cat-ttr-tickets-failed", "Destinations ratées", "malus", { step: 1 }),
      cat("rule-ttr-base", "cat-ttr-longest", "Plus long chemin continu", "conditional", { mode: "boolean", pointsIfMet: 10, pointsIfNot: 0 }),
    ],
  },
});

order = 0;
const kingOfTokyo = game({
  id: "game-king-of-tokyo",
  name: "King of Tokyo",
  publisher: "IELLO",
  year: 2011,
  minPlayers: 2,
  maxPlayers: 6,
  aliases: ["king of tokyo", "roi de tokyo"],
  description: "Incarnez un monstre géant et devenez le roi de Tokyo.",
  ruleSet: {
    id: "rule-kot-base",
    gameId: "game-king-of-tokyo",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-kot-base", "cat-kot-vp", "Points de victoire cumulés", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const everdell = game({
  id: "game-everdell",
  name: "Everdell",
  publisher: "Starling Games",
  year: 2018,
  minPlayers: 1,
  maxPlayers: 4,
  aliases: ["everdell"],
  description: "Bâtissez une cité prospère au pied de l'arbre d'Everdell.",
  ruleSet: {
    id: "rule-everdell-base",
    gameId: "game-everdell",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-everdell-base", "cat-ed-cards", "Points sur les cartes", "sum", { step: 1 }),
      cat("rule-everdell-base", "cat-ed-events", "Événements accomplis", "bonus", { step: 1 }),
      cat("rule-everdell-base", "cat-ed-city-full", "Cité complète (15 cartes)", "conditional", { mode: "boolean", pointsIfMet: 2, pointsIfNot: 0 }),
      cat("rule-everdell-base", "cat-ed-resources", "Ressources restantes (par groupe de 3)", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const scythe = game({
  id: "game-scythe",
  name: "Scythe",
  publisher: "Stonemaier Games",
  year: 2016,
  minPlayers: 1,
  maxPlayers: 5,
  aliases: ["scythe"],
  description: "Menez une faction d'Europe de l'Est dans une course au développement uchronique.",
  ruleSet: {
    id: "rule-scythe-base",
    gameId: "game-scythe",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-scythe-base", "cat-sc-coins", "Pièces (÷3, arrondi)", "sum", { step: 1 }),
      cat("rule-scythe-base", "cat-sc-territories", "Territoires contrôlés", "bonus", { perUnit: 2, helper: "2 pts par territoire", step: 1 }),
      cat("rule-scythe-base", "cat-sc-structures", "Structures construites", "bonus", { perUnit: 2, step: 1 }),
      cat("rule-scythe-base", "cat-sc-popularity", "Popularité", "sum", { step: 1 }),
      cat("rule-scythe-base", "cat-sc-secret", "Objectif secret de faction", "hidden_objective", { mode: "boolean", pointsIfMet: 8, pointsIfNot: 0, helper: "Révélé en fin de partie" }),
    ],
  },
});

order = 0;
const genericTemplate = game({
  id: "game-generic",
  name: "Autre jeu (modèle générique)",
  publisher: "Communauté BoardScore AI",
  year: new Date().getFullYear(),
  aliases: ["autre", "generique", "modèle générique", "custom"],
  description: "Point de départ pour un jeu non reconnu : trois catégories modifiables.",
  ruleSet: {
    id: "rule-generic-base",
    gameId: "game-generic",
    versionLabel: "Modèle générique",
    isOfficial: false,
    categories: [
      cat("rule-generic-base", "cat-gen-points", "Points bruts", "sum", { step: 1 }),
      cat("rule-generic-base", "cat-gen-bonus", "Bonus", "bonus", { step: 1 }),
      cat("rule-generic-base", "cat-gen-malus", "Malus", "malus", { step: 1 }),
    ],
  },
});

export const GAMES_SEED: GameWithRules[] = [
  sevenWonders,
  wingspan,
  terraformingMars,
  azul,
  splendor,
  catan,
  carcassonne,
  ticketToRide,
  kingOfTokyo,
  everdell,
  scythe,
  genericTemplate,
];

export const GENERIC_GAME_ID = genericTemplate.id;
