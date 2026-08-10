import type { GameWithRules, ScoreCategory } from "@/types";

/**
 * Catalogue de démarrage embarqué dans l'app : des jeux populaires avec un
 * modèle de score réaliste, disponibles hors-ligne dès l'installation.
 * Le dernier jeu ("Autre jeu / modèle générique") sert de point de départ
 * pour la création communautaire d'un nouveau modèle.
 *
 * Les ids sont stables (pas d'UUID générés à la volée) pour que le cache
 * IndexedDB reste cohérent d'un lancement à l'autre de l'app.
 *
 * SEED_VERSION : incrémentez à chaque ajout/modification de jeu ci-dessous.
 * db.ensureSeeded() compare cette valeur à celle stockée localement pour
 * réappliquer le catalogue après une mise à jour de l'app — sans ça, les
 * utilisateurs déjà installés ne verraient jamais les nouveaux jeux.
 */
export const SEED_VERSION = 6;

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
      cat("rule-7-wonders-base", "cat-7w-civil", "Bâtiments civils (bleu)", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque carte bleue" }),
      cat("rule-7-wonders-base", "cat-7w-commerce", "Bâtiments commerciaux (jaune)", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque carte jaune" }),
      cat("rule-7-wonders-base", "cat-7w-guilds", "Guildes (violet)", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque carte guilde" }),
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
      cat("rule-wingspan-base", "cat-wb-birds", "Points des oiseaux", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque oiseau" }),
      cat("rule-wingspan-base", "cat-wb-bonus-cards", "Cartes bonus", "bonus", { roundBased: true, helper: "Additionnez la valeur de chaque carte bonus" }),
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
      cat("rule-tm-base", "cat-tm-cards", "Points sur les cartes jouées", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque carte" }),
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
const dominion = game({
  id: "game-dominion",
  name: "Dominion",
  publisher: "Filosofia",
  year: 2008,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["dominion"],
  description: "Bâtissez le deck le plus efficace pour accumuler les cartes Victoire.",
  ruleSet: {
    id: "rule-dominion-base",
    gameId: "game-dominion",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-dominion-base", "cat-dom-victory", "Points des cartes Victoire", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque carte Victoire" }),
      cat("rule-dominion-base", "cat-dom-curse", "Cartes Malédiction", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const puertoRico = game({
  id: "game-puerto-rico",
  name: "Puerto Rico",
  publisher: "Rio Grande Games",
  year: 2002,
  minPlayers: 3,
  maxPlayers: 5,
  aliases: ["puerto rico"],
  description: "Développez votre colonie en gérant plantations, production et commerce.",
  ruleSet: {
    id: "rule-pr-base",
    gameId: "game-puerto-rico",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-pr-base", "cat-pr-buildings", "Points de bâtiments", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque bâtiment" }),
      cat("rule-pr-base", "cat-pr-goods", "Marchandises exportées", "sum", { step: 1 }),
      cat("rule-pr-base", "cat-pr-great-building", "Bonus grand bâtiment", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const agricola = game({
  id: "game-agricola",
  name: "Agricola",
  publisher: "Lookout Games",
  year: 2007,
  minPlayers: 1,
  maxPlayers: 5,
  aliases: ["agricola"],
  description: "Développez votre ferme : champs, pâtures, animaux et pièces de la maison.",
  ruleSet: {
    id: "rule-agricola-base",
    gameId: "game-agricola",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-agricola-base", "cat-agr-fields", "Champs", "sum", { step: 1 }),
      cat("rule-agricola-base", "cat-agr-pastures", "Pâtures et animaux", "sum", { step: 1 }),
      cat("rule-agricola-base", "cat-agr-cards", "Cartes jouées", "sum", { step: 1 }),
      cat("rule-agricola-base", "cat-agr-money", "Pièces restantes (÷3)", "sum", { helper: "Arrondi à l'inférieur", step: 1 }),
      cat("rule-agricola-base", "cat-agr-empty", "Espaces de ferme vides", "malus", { step: 1 }),
      cat("rule-agricola-base", "cat-agr-beggars", "Mendiants (cartes négatives)", "malus", { perUnit: 3, step: 1 }),
    ],
  },
});

order = 0;
const concordia = game({
  id: "game-concordia",
  name: "Concordia",
  publisher: "PD-Verlag",
  year: 2013,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["concordia"],
  description: "Étendez votre réseau commercial à travers les provinces romaines.",
  ruleSet: {
    id: "rule-concordia-base",
    gameId: "game-concordia",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-concordia-base", "cat-cnc-colonists", "Points des colons (Vesta)", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque marchandise" }),
      cat("rule-concordia-base", "cat-cnc-final-card", "Carte finale (Jupiter/Mercure…)", "sum", { step: 1 }),
      cat("rule-concordia-base", "cat-cnc-money", "Pièces restantes (÷10)", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const patchwork = game({
  id: "game-patchwork",
  name: "Patchwork",
  publisher: "Lookout Games",
  year: 2014,
  minPlayers: 2,
  maxPlayers: 2,
  aliases: ["patchwork"],
  description: "Assemblez vos chutes de tissu sur une couverture 9x9, à deux joueurs.",
  ruleSet: {
    id: "rule-patchwork-base",
    gameId: "game-patchwork",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-patchwork-base", "cat-pw-buttons", "Boutons restants", "sum", { step: 1 }),
      cat("rule-patchwork-base", "cat-pw-empty", "Cases vides du plateau", "malus", { perUnit: 2, step: 1 }),
      cat("rule-patchwork-base", "cat-pw-bonus", "Bonus tuile 7x7 remplie", "conditional", { mode: "boolean", pointsIfMet: 7, pointsIfNot: 0 }),
    ],
  },
});

order = 0;
const kingdomino = game({
  id: "game-kingdomino",
  name: "Kingdomino",
  publisher: "Blue Orange",
  year: 2016,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["kingdomino"],
  description: "Construisez le royaume le plus harmonieux en assemblant des dominos de territoires.",
  ruleSet: {
    id: "rule-kd-base",
    gameId: "game-kingdomino",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-kd-base", "cat-kd-territories", "Territoires (taille × couronnes)", "sum", { step: 1 }),
      cat("rule-kd-base", "cat-kd-center", "Château au milieu du royaume", "conditional", { mode: "boolean", pointsIfMet: 10, pointsIfNot: 0 }),
      cat("rule-kd-base", "cat-kd-harmony", "Royaume complet (harmonie)", "conditional", { mode: "boolean", pointsIfMet: 5, pointsIfNot: 0 }),
    ],
  },
});

order = 0;
const sagrada = game({
  id: "game-sagrada",
  name: "Sagrada",
  publisher: "Floodgate Games",
  year: 2017,
  minPlayers: 1,
  maxPlayers: 4,
  aliases: ["sagrada"],
  description: "Composez un vitrail en assemblant des dés colorés selon des contraintes.",
  ruleSet: {
    id: "rule-sagrada-base",
    gameId: "game-sagrada",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-sagrada-base", "cat-sag-private", "Objectif privé (couleur)", "sum", { step: 1 }),
      cat("rule-sagrada-base", "cat-sag-public", "Objectifs publics", "sum", { step: 1 }),
      cat("rule-sagrada-base", "cat-sag-empty", "Cases vides de la vitre", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const photosynthesis = game({
  id: "game-photosynthesis",
  name: "Photosynthesis",
  publisher: "Blue Orange",
  year: 2017,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["photosynthesis", "photosynthese"],
  description: "Faites grandir votre forêt en captant la lumière du soleil qui tourne.",
  ruleSet: {
    id: "rule-photo-base",
    gameId: "game-photosynthesis",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-photo-base", "cat-photo-trees", "Arbres récoltés", "sum", { step: 1 }),
      cat("rule-photo-base", "cat-photo-bonus", "Bonus de fin de partie", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const fiveTribes = game({
  id: "game-five-tribes",
  name: "Five Tribes",
  publisher: "Days of Wonder",
  year: 2014,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["five tribes"],
  description: "Déplacez les Meeples des tribus du Sultanat de Naqala pour amasser richesse et pouvoir.",
  ruleSet: {
    id: "rule-ft-base",
    gameId: "game-five-tribes",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-ft-base", "cat-ft-resources", "Pièces et ressources", "sum", { step: 1 }),
      cat("rule-ft-base", "cat-ft-djinns", "Djinns", "bonus", { step: 1 }),
      cat("rule-ft-base", "cat-ft-servants", "Serviteurs sur le plateau", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const bloodRage = game({
  id: "game-blood-rage",
  name: "Blood Rage",
  publisher: "CMON",
  year: 2015,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["blood rage"],
  description: "Menez votre clan viking vers un Ragnarök glorieux.",
  ruleSet: {
    id: "rule-br-base",
    gameId: "game-blood-rage",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-br-base", "cat-br-quests", "Quêtes accomplies", "sum", { step: 1 }),
      cat("rule-br-base", "cat-br-monsters", "Monstres tués", "sum", { step: 1 }),
      cat("rule-br-base", "cat-br-cards", "Points des cartes", "sum", { step: 1 }),
      cat("rule-br-base", "cat-br-ragnarok", "Gloire à Ragnarök", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const centurySpiceRoad = game({
  id: "game-century-spice-road",
  name: "Century: Spice Road",
  publisher: "Plan B Games",
  year: 2017,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["century spice road", "century"],
  description: "Constituez des caravanes d'épices pour honorer des cartes objectif.",
  ruleSet: {
    id: "rule-csr-base",
    gameId: "game-century-spice-road",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-csr-base", "cat-csr-cards", "Cartes point", "sum", { step: 1 }),
      cat("rule-csr-base", "cat-csr-coins", "Pièces d'or et d'argent restantes", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const qwirkle = game({
  id: "game-qwirkle",
  name: "Qwirkle",
  publisher: "MindWare",
  year: 2006,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["qwirkle"],
  description: "Alignez des tuiles de formes et couleurs pour former des lignes.",
  ruleSet: {
    id: "rule-qw-base",
    gameId: "game-qwirkle",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-qw-base", "cat-qw-tiles", "Tuiles posées (lignes)", "sum", { step: 1 }),
      cat("rule-qw-base", "cat-qw-qwirkle", "Qwirkles (ligne de 6)", "bonus", { perUnit: 6, helper: "6 pts par Qwirkle", step: 1 }),
    ],
  },
});

order = 0;
const yahtzee = game({
  id: "game-yahtzee",
  name: "Yahtzee",
  publisher: "Hasbro",
  year: 1956,
  minPlayers: 1,
  maxPlayers: 8,
  aliases: ["yahtzee", "yams"],
  description: "Composez les meilleures combinaisons de dés en trois lancers.",
  ruleSet: {
    id: "rule-yz-base",
    gameId: "game-yahtzee",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-yz-base", "cat-yz-upper", "Section supérieure (as à six)", "sum", { step: 1 }),
      cat("rule-yz-base", "cat-yz-upper-bonus", "Bonus section supérieure", "conditional", { mode: "threshold", threshold: 63, pointsIfMet: 35, pointsIfNot: 0, helper: "Seuil de 63 pts" }),
      cat("rule-yz-base", "cat-yz-lower", "Section inférieure (brelans, full, suites…)", "sum", { step: 1 }),
      cat("rule-yz-base", "cat-yz-bonus-yahtzee", "Yahtzee supplémentaire", "bonus", { perUnit: 100, step: 1 }),
    ],
  },
});

order = 0;
const scrabble = game({
  id: "game-scrabble",
  name: "Scrabble",
  publisher: "Mattel",
  year: 1938,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["scrabble"],
  description: "Formez des mots sur la grille en exploitant les cases bonus.",
  ruleSet: {
    id: "rule-scr-base",
    gameId: "game-scrabble",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-scr-base", "cat-scr-words", "Points des mots posés", "sum", { roundBased: true, helper: "Additionnez le score de chaque mot" }),
      cat("rule-scr-base", "cat-scr-bingo", "Scrabble (toutes les lettres posées)", "conditional", { mode: "boolean", pointsIfMet: 50, pointsIfNot: 0 }),
    ],
  },
});

order = 0;
const trivialPursuit = game({
  id: "game-trivial-pursuit",
  name: "Trivial Pursuit",
  publisher: "Hasbro",
  year: 1981,
  minPlayers: 2,
  maxPlayers: 6,
  aliases: ["trivial pursuit"],
  description: "Répondez à des questions de culture générale pour remplir votre camembert.",
  ruleSet: {
    id: "rule-tp-base",
    gameId: "game-trivial-pursuit",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-tp-base", "cat-tp-wedges", "Camemberts obtenus", "sum", { step: 1 })],
  },
});

order = 0;
const dixit = game({
  id: "game-dixit",
  name: "Dixit",
  publisher: "Libellud",
  year: 2008,
  minPlayers: 3,
  maxPlayers: 6,
  aliases: ["dixit"],
  description: "Faites deviner une carte illustrée grâce à une phrase énigmatique.",
  ruleSet: {
    id: "rule-dixit-base",
    gameId: "game-dixit",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-dixit-base", "cat-dixit-total", "Score total", "sum", { step: 1 })],
  },
});

order = 0;
const sixQuiPrend = game({
  id: "game-6-qui-prend",
  name: "6 qui prend !",
  publisher: "Amigo",
  year: 1994,
  minPlayers: 2,
  maxPlayers: 10,
  aliases: ["6 qui prend", "six qui prend", "take 6"],
  description: "Évitez de récolter les têtes de bœuf en posant vos cartes numérotées.",
  ruleSet: {
    id: "rule-6qp-base",
    gameId: "game-6-qui-prend",
    versionLabel: "Édition de base",
    isOfficial: true,
    sortDirection: "asc",
    categories: [cat("rule-6qp-base", "cat-6qp-heads", "Têtes de bœuf récoltées", "sum", { roundBased: true, helper: "Le score le plus bas gagne — une entrée par manche" })],
  },
});

order = 0;
const skyjo = game({
  id: "game-skyjo",
  name: "Skyjo",
  publisher: "Magilano",
  year: 2019,
  minPlayers: 2,
  maxPlayers: 8,
  aliases: ["skyjo"],
  description: "Révélez et échangez vos cartes pour obtenir le total le plus bas possible.",
  ruleSet: {
    id: "rule-skyjo-base",
    gameId: "game-skyjo",
    versionLabel: "Édition de base",
    isOfficial: true,
    sortDirection: "asc",
    categories: [cat("rule-skyjo-base", "cat-skyjo-cards", "Valeur des cartes restantes", "sum", { roundBased: true, helper: "Le score le plus bas gagne — une entrée par manche" })],
  },
});

order = 0;
const uno = game({
  id: "game-uno",
  name: "Uno",
  publisher: "Mattel",
  year: 1971,
  minPlayers: 2,
  maxPlayers: 10,
  aliases: ["uno"],
  description: "Débarrassez-vous de vos cartes avant tout le monde, manche après manche.",
  ruleSet: {
    id: "rule-uno-base",
    gameId: "game-uno",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-uno-base", "cat-uno-points", "Points des cartes adverses (manche gagnée)", "sum", { roundBased: true, helper: "Une entrée par manche gagnée" })],
  },
});

order = 0;
const root = game({
  id: "game-root",
  name: "Root",
  publisher: "Leder Games",
  year: 2018,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["root"],
  description: "Contrôlez la forêt avec une faction asymétrique parmi plusieurs.",
  ruleSet: {
    id: "rule-root-base",
    gameId: "game-root",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-root-base", "cat-root-vp", "Points de victoire cumulés", "sum", { step: 1 })],
  },
});

order = 0;
const raceForTheGalaxy = game({
  id: "game-race-for-the-galaxy",
  name: "Race for the Galaxy",
  publisher: "Rio Grande Games",
  year: 2007,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["race for the galaxy"],
  description: "Développez un empire galactique en jouant mondes et développements.",
  ruleSet: {
    id: "rule-rftg-base",
    gameId: "game-race-for-the-galaxy",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-rftg-base", "cat-rftg-cards", "Points des cartes", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque carte" }),
      cat("rule-rftg-base", "cat-rftg-bonus", "Bonus d'objectifs", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const viticulture = game({
  id: "game-viticulture",
  name: "Viticulture",
  publisher: "Stonemaier Games",
  year: 2015,
  minPlayers: 1,
  maxPlayers: 6,
  aliases: ["viticulture"],
  description: "Gérez un domaine viticole en Toscane, des vignes à la cave.",
  ruleSet: {
    id: "rule-vit-base",
    gameId: "game-viticulture",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-vit-base", "cat-vit-cards", "Points des cartes", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque carte" }),
      cat("rule-vit-base", "cat-vit-structures", "Structures construites", "bonus", { step: 1 }),
      cat("rule-vit-base", "cat-vit-residual", "Résiduel (pièces, raisins, vin)", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const greatWesternTrail = game({
  id: "game-great-western-trail",
  name: "Great Western Trail",
  publisher: "eggertspiele",
  year: 2016,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["great western trail"],
  description: "Menez vos troupeaux de bétail du Texas à Kansas City.",
  ruleSet: {
    id: "rule-gwt-base",
    gameId: "game-great-western-trail",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-gwt-base", "cat-gwt-cattle", "Bétail livré", "sum", { step: 1 }),
      cat("rule-gwt-base", "cat-gwt-buildings", "Bâtiments et objectifs", "bonus", { step: 1 }),
      cat("rule-gwt-base", "cat-gwt-debts", "Dettes restantes", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const brassBirmingham = game({
  id: "game-brass-birmingham",
  name: "Brass: Birmingham",
  publisher: "Roxley",
  year: 2018,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["brass birmingham", "brass"],
  description: "Développez industries et réseaux de transport dans les Midlands anglais.",
  ruleSet: {
    id: "rule-brass-base",
    gameId: "game-brass-birmingham",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-brass-base", "cat-brass-industries", "Points d'industries", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque tuile industrie" }),
      cat("rule-brass-base", "cat-brass-links", "Points de liens", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque lien" }),
      cat("rule-brass-base", "cat-brass-income", "Bonus de revenu final", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const coloretto = game({
  id: "game-coloretto",
  name: "Coloretto",
  publisher: "Abacusspiele",
  year: 2003,
  minPlayers: 3,
  maxPlayers: 5,
  aliases: ["coloretto"],
  description: "Collectionnez des cartes de couleur sans en avoir trop de sortes différentes.",
  ruleSet: {
    id: "rule-col-base",
    gameId: "game-coloretto",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-col-base", "cat-col-good", "Cartes des 3 meilleures couleurs", "sum", { step: 1 }),
      cat("rule-col-base", "cat-col-excess", "Cartes de couleurs en trop", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const rummikub = game({
  id: "game-rummikub",
  name: "Rummikub",
  publisher: "Lemada Light Industries",
  year: 1990,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["rummikub"],
  description: "Combinez des tuiles numérotées en suites et groupes.",
  ruleSet: {
    id: "rule-rk-base",
    gameId: "game-rummikub",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-rk-base", "cat-rk-points", "Points de la manche", "sum", { step: 1 })],
  },
});

order = 0;
const bohnanza = game({
  id: "game-bohnanza",
  name: "Bohnanza",
  publisher: "Amigo",
  year: 1997,
  minPlayers: 2,
  maxPlayers: 7,
  aliases: ["bohnanza"],
  description: "Cultivez et vendez des haricots pour amasser des pièces d'or.",
  ruleSet: {
    id: "rule-boh-base",
    gameId: "game-bohnanza",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-boh-base", "cat-boh-coins", "Pièces d'or récoltées", "sum", { step: 1 })],
  },
});

order = 0;
const jaipur = game({
  id: "game-jaipur",
  name: "Jaipur",
  publisher: "Space Cowboys",
  year: 2009,
  minPlayers: 2,
  maxPlayers: 2,
  aliases: ["jaipur"],
  description: "Devenez le marchand favori du Maharadja en échangeant des marchandises, à deux.",
  ruleSet: {
    id: "rule-jai-base",
    gameId: "game-jaipur",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-jai-base", "cat-jai-goods", "Jetons marchandises", "sum", { step: 1 }),
      cat("rule-jai-base", "cat-jai-camels", "Bonus majorité de chameaux", "conditional", { mode: "boolean", pointsIfMet: 5, pointsIfNot: 0 }),
      cat("rule-jai-base", "cat-jai-bonus", "Jetons bonus (ventes groupées)", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const camelUp = game({
  id: "game-camel-up",
  name: "Camel Up",
  publisher: "Pegasus Spiele",
  year: 2014,
  minPlayers: 3,
  maxPlayers: 8,
  aliases: ["camel up"],
  description: "Pariez sur la course de chameaux la plus imprévisible qui soit.",
  ruleSet: {
    id: "rule-cu-base",
    gameId: "game-camel-up",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-cu-base", "cat-cu-leg", "Gains des paris d'étape", "sum", { step: 1 }),
      cat("rule-cu-base", "cat-cu-final", "Gains des paris finaux", "bonus", { step: 1 }),
      cat("rule-cu-base", "cat-cu-losses", "Pertes de paris", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const coltExpress = game({
  id: "game-colt-express",
  name: "Colt Express",
  publisher: "Ludonaute",
  year: 2014,
  minPlayers: 2,
  maxPlayers: 6,
  aliases: ["colt express"],
  description: "Braquez le train et amassez le meilleur butin en évitant le Marshal.",
  ruleSet: {
    id: "rule-ce-base",
    gameId: "game-colt-express",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-ce-base", "cat-ce-loot", "Butin collecté", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque butin" }),
      cat("rule-ce-base", "cat-ce-bullets", "Balles et blessures", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const welcomeTo = game({
  id: "game-welcome-to",
  name: "Welcome To...",
  publisher: "Deep Water Games",
  year: 2018,
  minPlayers: 1,
  maxPlayers: 100,
  aliases: ["welcome to"],
  description: "Construisez le lotissement le plus harmonieux, un flip-and-write pour tous.",
  ruleSet: {
    id: "rule-wt-base",
    gameId: "game-welcome-to",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-wt-base", "cat-wt-houses", "Maisons construites (par rue)", "sum", { step: 1 }),
      cat("rule-wt-base", "cat-wt-parks", "Parcs", "bonus", { step: 1 }),
      cat("rule-wt-base", "cat-wt-pools", "Piscines", "bonus", { step: 1 }),
      cat("rule-wt-base", "cat-wt-goals", "Objectifs de fin de partie", "bonus", { step: 1 }),
      cat("rule-wt-base", "cat-wt-fouls", "Fautes (permis, numéros non conformes)", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const smallWorld = game({
  id: "game-small-world",
  name: "Small World",
  publisher: "Days of Wonder",
  year: 2009,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["small world", "petit monde"],
  description: "Conquérez des territoires avec une succession de peuples fantastiques en déclin.",
  ruleSet: {
    id: "rule-sw-base",
    gameId: "game-small-world",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-sw-base", "cat-sw-territories", "Territoires contrôlés (par tour)", "sum", { roundBased: true, helper: "1 pt par territoire, à chaque tour" }),
      cat("rule-sw-base", "cat-sw-coins", "Pièces restantes en fin de partie", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const arkNova = game({
  id: "game-ark-nova",
  name: "Ark Nova",
  publisher: "Feuerland Spiele",
  year: 2021,
  minPlayers: 1,
  maxPlayers: 4,
  aliases: ["ark nova"],
  description: "Concevez un zoo moderne tourné vers la conservation des espèces.",
  ruleSet: {
    id: "rule-an-base",
    gameId: "game-ark-nova",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-an-base", "cat-an-appeal", "Niveau d'attractivité", "sum", { step: 1 }),
      cat("rule-an-base", "cat-an-conservation", "Points de conservation", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const terraMystica = game({
  id: "game-terra-mystica",
  name: "Terra Mystica",
  publisher: "Feuerland Spiele",
  year: 2012,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["terra mystica"],
  description: "Développez un peuple fantastique sur un plateau de terrains variés.",
  ruleSet: {
    id: "rule-tmy-base",
    gameId: "game-terra-mystica",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-tmy-base", "cat-tmy-buildings", "Constructions et zones", "sum", { roundBased: true, helper: "Additionnez les points de chaque tour" }),
      cat("rule-tmy-base", "cat-tmy-cults", "Pistes de cultes", "sum", { step: 1 }),
      cat("rule-tmy-base", "cat-tmy-resources", "Ressources restantes", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const caverna = game({
  id: "game-caverna",
  name: "Caverna",
  publisher: "Lookout Games",
  year: 2013,
  minPlayers: 1,
  maxPlayers: 7,
  aliases: ["caverna"],
  description: "Bâtissez votre caverne naine entre agriculture, élevage et expéditions.",
  ruleSet: {
    id: "rule-cav-base",
    gameId: "game-caverna",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-cav-base", "cat-cav-fields", "Champs et fourrages", "sum", { step: 1 }),
      cat("rule-cav-base", "cat-cav-animals", "Animaux et pâtures", "sum", { step: 1 }),
      cat("rule-cav-base", "cat-cav-cards", "Cartes équipement et aventure", "sum", { step: 1 }),
      cat("rule-cav-base", "cat-cav-empty", "Espaces vides de la caverne", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const leHavre = game({
  id: "game-le-havre",
  name: "Le Havre",
  publisher: "Lookout Games",
  year: 2008,
  minPlayers: 1,
  maxPlayers: 5,
  aliases: ["le havre"],
  description: "Développez le port du Havre entre bâtiments, bateaux et industrie.",
  ruleSet: {
    id: "rule-lh-base",
    gameId: "game-le-havre",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-lh-base", "cat-lh-buildings", "Bâtiments et bateaux", "sum", { step: 1 }),
      cat("rule-lh-base", "cat-lh-goods", "Marchandises restantes (÷valeur)", "sum", { step: 1 }),
      cat("rule-lh-base", "cat-lh-debts", "Emprunts restants", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const elGrande = game({
  id: "game-el-grande",
  name: "El Grande",
  publisher: "Hans im Glück",
  year: 1995,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["el grande"],
  description: "Placez vos caballeros pour dominer les régions d'Espagne, manche après manche.",
  ruleSet: {
    id: "rule-eg-base",
    gameId: "game-el-grande",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-eg-base", "cat-eg-regions", "Majorités régionales (par manche)", "sum", { roundBased: true, helper: "Additionnez les points de chaque manche" }),
      cat("rule-eg-base", "cat-eg-castillo", "Points du Château/tour de ronde", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const powerGrid = game({
  id: "game-power-grid",
  name: "Power Grid",
  publisher: "2F-Spiele",
  year: 2004,
  minPlayers: 2,
  maxPlayers: 6,
  aliases: ["power grid", "les aventuriers du rail electrique", "funkenschlag"],
  description: "Alimentez le plus de villes possible en gérant centrales et ressources.",
  ruleSet: {
    id: "rule-pg-base",
    gameId: "game-power-grid",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-pg-base", "cat-pg-cities", "Villes alimentées en fin de partie", "sum", { step: 1 })],
  },
});

order = 0;
const acquire = game({
  id: "game-acquire",
  name: "Acquire",
  publisher: "Hasbro",
  year: 1964,
  minPlayers: 2,
  maxPlayers: 6,
  aliases: ["acquire"],
  description: "Investissez dans des chaînes hôtelières et provoquez des fusions rentables.",
  ruleSet: {
    id: "rule-acq-base",
    gameId: "game-acquire",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-acq-base", "cat-acq-cash", "Argent total en fin de partie", "sum", { step: 1 })],
  },
});

order = 0;
const sushiGo = game({
  id: "game-sushi-go",
  name: "Sushi Go!",
  publisher: "Gamewright",
  year: 2013,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["sushi go", "sushi go party"],
  description: "Faites tourner les assiettes de sushi et composez le meilleur repas.",
  ruleSet: {
    id: "rule-sg-base",
    gameId: "game-sushi-go",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-sg-base", "cat-sg-cards", "Points des cartes (par manche)", "sum", { roundBased: true, helper: "Additionnez les points de chaque manche" }),
      cat("rule-sg-base", "cat-sg-pudding", "Puddings (fin de partie)", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const pointSalad = game({
  id: "game-point-salad",
  name: "Point Salad",
  publisher: "AEG",
  year: 2019,
  minPlayers: 2,
  maxPlayers: 6,
  aliases: ["point salad"],
  description: "Collectionnez des cartes légumes et combinez des critères de score qui s'affrontent.",
  ruleSet: {
    id: "rule-psd-base",
    gameId: "game-point-salad",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-psd-base", "cat-psd-total", "Points totaux (cartes critère + légumes)", "sum", { step: 1 })],
  },
});

order = 0;
const cascadia = game({
  id: "game-cascadia",
  name: "Cascadia",
  publisher: "Flatout Games",
  year: 2021,
  minPlayers: 1,
  maxPlayers: 4,
  aliases: ["cascadia"],
  description: "Façonnez un paysage naturel accueillant pour la faune sauvage.",
  ruleSet: {
    id: "rule-csc-base",
    gameId: "game-cascadia",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-csc-base", "cat-csc-wildlife", "Score de la faune (par espèce)", "sum", { step: 1 }),
      cat("rule-csc-base", "cat-csc-habitat", "Plus grande zone d'habitat", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const calico = game({
  id: "game-calico",
  name: "Calico",
  publisher: "Flatout Games",
  year: 2020,
  minPlayers: 1,
  maxPlayers: 4,
  aliases: ["calico"],
  description: "Cousez la plus belle couverture en associant motifs et boutons.",
  ruleSet: {
    id: "rule-cal-base",
    gameId: "game-calico",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-cal-base", "cat-cal-patterns", "Objectifs de motifs", "sum", { step: 1 }),
      cat("rule-cal-base", "cat-cal-cats", "Objectifs de chats", "sum", { step: 1 }),
      cat("rule-cal-base", "cat-cal-buttons", "Ensembles de boutons", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const parks = game({
  id: "game-parks",
  name: "Parks",
  publisher: "Keymaster Games",
  year: 2019,
  minPlayers: 1,
  maxPlayers: 5,
  aliases: ["parks"],
  description: "Randonnez à travers les parcs nationaux au fil des saisons.",
  ruleSet: {
    id: "rule-pk-base",
    gameId: "game-parks",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-pk-base", "cat-pk-cards", "Cartes parc visitées", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque carte" }),
      cat("rule-pk-base", "cat-pk-photos", "Points de photo", "bonus", { step: 1 }),
      cat("rule-pk-base", "cat-pk-gear", "Équipement et bonus", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const bunnyKingdom = game({
  id: "game-bunny-kingdom",
  name: "Bunny Kingdom",
  publisher: "Iello",
  year: 2017,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["bunny kingdom"],
  description: "Étendez votre royaume de lapins à travers provinces et ressources.",
  ruleSet: {
    id: "rule-bk-base",
    gameId: "game-bunny-kingdom",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-bk-base", "cat-bk-provinces", "Provinces et couronnes", "sum", { step: 1 }),
      cat("rule-bk-base", "cat-bk-carrots", "Bonus de carottes", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const isleOfCats = game({
  id: "game-isle-of-cats",
  name: "The Isle of Cats",
  publisher: "The City of Games",
  year: 2019,
  minPlayers: 1,
  maxPlayers: 4,
  aliases: ["isle of cats", "l'ile aux chats"],
  description: "Sauvez un maximum de chats et rangez-les au mieux dans votre bateau.",
  ruleSet: {
    id: "rule-ioc-base",
    gameId: "game-isle-of-cats",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-ioc-base", "cat-ioc-groups", "Groupes de chats", "sum", { step: 1 }),
      cat("rule-ioc-base", "cat-ioc-baskets", "Paniers et objectifs", "bonus", { step: 1 }),
      cat("rule-ioc-base", "cat-ioc-left", "Chats laissés derrière", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const underwaterCities = game({
  id: "game-underwater-cities",
  name: "Underwater Cities",
  publisher: "Delicious Games",
  year: 2018,
  minPlayers: 1,
  maxPlayers: 4,
  aliases: ["underwater cities"],
  description: "Bâtissez des cités sous-marines pour sauver l'humanité de la surface polluée.",
  ruleSet: {
    id: "rule-uc-base",
    gameId: "game-underwater-cities",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-uc-base", "cat-uc-cards", "Points des cartes", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque carte" }),
      cat("rule-uc-base", "cat-uc-cities", "Cités et tunnels", "sum", { step: 1 }),
      cat("rule-uc-base", "cat-uc-metro", "Bonus de métropoles", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const trajan = game({
  id: "game-trajan",
  name: "Trajan",
  publisher: "Ammonit Spiele",
  year: 2011,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["trajan"],
  description: "Gérez vos actions via un mancala personnel pour développer Rome.",
  ruleSet: {
    id: "rule-tr-base",
    gameId: "game-trajan",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-tr-base", "cat-tr-vp", "Points de victoire cumulés", "sum", { step: 1 })],
  },
});

order = 0;
const orleans = game({
  id: "game-orleans",
  name: "Orléans",
  publisher: "dlp games",
  year: 2014,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["orleans"],
  description: "Recrutez des personnages dans votre sac pour développer votre cité médiévale.",
  ruleSet: {
    id: "rule-orl-base",
    gameId: "game-orleans",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-orl-base", "cat-orl-track", "Piste de développement", "sum", { step: 1 }),
      cat("rule-orl-base", "cat-orl-tokens", "Jetons de points de victoire", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const lordsOfWaterdeep = game({
  id: "game-lords-of-waterdeep",
  name: "Lords of Waterdeep",
  publisher: "Wizards of the Coast",
  year: 2012,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["lords of waterdeep"],
  description: "Accomplissez des quêtes secrètes pour développer votre influence sur la ville.",
  ruleSet: {
    id: "rule-low-base",
    gameId: "game-lords-of-waterdeep",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-low-base", "cat-low-quests", "Quêtes accomplies", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque quête" }),
      cat("rule-low-base", "cat-low-buildings", "Bâtiments construits", "bonus", { step: 1 }),
      cat("rule-low-base", "cat-low-resources", "Ressources non utilisées", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const tapestry = game({
  id: "game-tapestry",
  name: "Tapestry",
  publisher: "Stonemaier Games",
  year: 2019,
  minPlayers: 1,
  maxPlayers: 5,
  aliases: ["tapestry"],
  description: "Faites progresser une civilisation à travers les âges sur quatre pistes.",
  ruleSet: {
    id: "rule-tap-base",
    gameId: "game-tapestry",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-tap-base", "cat-tap-track", "Piste de civilisation", "sum", { step: 1 }),
      cat("rule-tap-base", "cat-tap-landmarks", "Monuments construits", "bonus", { step: 1 }),
      cat("rule-tap-base", "cat-tap-tapestry", "Carreaux de tapisserie", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const architectsWestKingdom = game({
  id: "game-architects-west-kingdom",
  name: "Architects of the West Kingdom",
  publisher: "Renegade Game Studios",
  year: 2018,
  minPlayers: 1,
  maxPlayers: 5,
  aliases: ["architects of the west kingdom"],
  description: "Bâtissez la cathédrale tout en gérant votre réputation, honnête ou non.",
  ruleSet: {
    id: "rule-awk-base",
    gameId: "game-architects-west-kingdom",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-awk-base", "cat-awk-vp", "Points de victoire (cartes, cathédrale)", "sum", { step: 1 }),
      cat("rule-awk-base", "cat-awk-corruption", "Pénalité de corruption", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const marcoPolo = game({
  id: "game-marco-polo",
  name: "Les Voyages de Marco Polo",
  publisher: "Hurrican",
  year: 2015,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["marco polo", "les voyages de marco polo", "voyages of marco polo"],
  description: "Parcourez la route de la soie en accomplissant des contrats commerciaux.",
  ruleSet: {
    id: "rule-mp-base",
    gameId: "game-marco-polo",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-mp-base", "cat-mp-contracts", "Contrats accomplis", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque contrat" }),
      cat("rule-mp-base", "cat-mp-cards", "Cartes personnage et ville", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const istanbul = game({
  id: "game-istanbul",
  name: "Istanbul",
  publisher: "Pegasus Spiele",
  year: 2014,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["istanbul"],
  description: "Parcourez le bazar pour être le premier à réunir cinq rubis.",
  ruleSet: {
    id: "rule-ist-base",
    gameId: "game-istanbul",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-ist-base", "cat-ist-rubies", "Rubis collectés", "sum", { step: 1 })],
  },
});

order = 0;
const santaMaria = game({
  id: "game-santa-maria",
  name: "Santa Maria",
  publisher: "Eggertspiele",
  year: 2017,
  minPlayers: 1,
  maxPlayers: 4,
  aliases: ["santa maria"],
  description: "Développez votre colonie le long du fleuve grâce à un système de dés partagés.",
  ruleSet: {
    id: "rule-sm-base",
    gameId: "game-santa-maria",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-sm-base", "cat-sm-buildings", "Bâtiments construits", "sum", { step: 1 }),
      cat("rule-sm-base", "cat-sm-goals", "Objectifs personnels", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const barony = game({
  id: "game-barony",
  name: "Barony",
  publisher: "Ludonaute",
  year: 2019,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["barony"],
  description: "Étendez votre territoire entre villages, villes et châteaux.",
  ruleSet: {
    id: "rule-bar-base",
    gameId: "game-barony",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-bar-base", "cat-bar-territory", "Points de territoire (villages/villes/châteaux)", "sum", { step: 1 })],
  },
});

order = 0;
const blokus = game({
  id: "game-blokus",
  name: "Blokus",
  publisher: "Mattel",
  year: 2000,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["blokus"],
  description: "Placez toutes vos pièces sur le plateau, coin à coin, avant vos adversaires.",
  ruleSet: {
    id: "rule-blk-base",
    gameId: "game-blokus",
    versionLabel: "Édition de base",
    isOfficial: true,
    sortDirection: "asc",
    categories: [cat("rule-blk-base", "cat-blk-remaining", "Carrés restants en main", "sum", { helper: "Le score le plus bas gagne", step: 1 })],
  },
});

order = 0;
const kingdomBuilder = game({
  id: "game-kingdom-builder",
  name: "Kingdom Builder",
  publisher: "Queen Games",
  year: 2011,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["kingdom builder"],
  description: "Placez vos colonies selon des règles de terrain et remplissez des objectifs tirés au sort.",
  ruleSet: {
    id: "rule-kgb-base",
    gameId: "game-kingdom-builder",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-kgb-base", "cat-kgb-goals", "Objectifs de score (3 cartes)", "sum", { step: 1 })],
  },
});

order = 0;
const sevenWondersDuel = game({
  id: "game-7-wonders-duel",
  name: "7 Wonders Duel",
  publisher: "Repos Production",
  year: 2015,
  minPlayers: 2,
  maxPlayers: 2,
  aliases: ["7 wonders duel", "sept merveilles duel"],
  description: "Version à deux joueurs de 7 Wonders, avec conflit militaire et progrès scientifique.",
  ruleSet: {
    id: "rule-7wd-base",
    gameId: "game-7-wonders-duel",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-7wd-base", "cat-7wd-coins", "Pièces d'or (3 pièces = 1 pt)", "sum", { helper: "Total divisé par 3, arrondi", step: 1 }),
      cat("rule-7wd-base", "cat-7wd-military", "Position sur la piste militaire", "sum", { step: 1 }),
      cat("rule-7wd-base", "cat-7wd-wonders", "Merveilles construites", "sum", { step: 1 }),
      cat("rule-7wd-base", "cat-7wd-civil", "Bâtiments civils (bleu)", "sum", { roundBased: true }),
      cat("rule-7wd-base", "cat-7wd-commerce", "Bâtiments commerciaux et guildes", "sum", { roundBased: true }),
      cat("rule-7wd-base", "cat-7wd-science", "Symboles scientifiques", "sum", { step: 1 }),
    ],
  },
});

order = 0;
const clank = game({
  id: "game-clank",
  name: "Clank!",
  publisher: "Renegade Game Studios",
  year: 2016,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["clank"],
  description: "Infiltrez le donjon du dragon, volez des trésors et ressortez vivant.",
  ruleSet: {
    id: "rule-clk-base",
    gameId: "game-clank",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-clk-base", "cat-clk-treasure", "Trésors rapportés", "sum", { step: 1 }),
      cat("rule-clk-base", "cat-clk-depth", "Bonus de profondeur atteinte", "bonus", { step: 1 }),
      cat("rule-clk-base", "cat-clk-damage", "Blessures subies", "malus", { step: 1 }),
    ],
  },
});

order = 0;
const skullKing = game({
  id: "game-skull-king",
  name: "Skull King",
  publisher: "Grandpa Beck's Games",
  year: 2013,
  minPlayers: 2,
  maxPlayers: 8,
  aliases: ["skull king"],
  description: "Annoncez le nombre de plis que vous allez remporter et tenez votre pari.",
  ruleSet: {
    id: "rule-skk-base",
    gameId: "game-skull-king",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-skk-base", "cat-skk-round", "Score de la manche (pari tenu ou raté)", "sum", { roundBased: true, helper: "Positif si le pari est tenu, négatif sinon" }),
    ],
  },
});

order = 0;
const hanabi = game({
  id: "game-hanabi",
  name: "Hanabi",
  publisher: "Cocktail Games",
  year: 2010,
  minPlayers: 2,
  maxPlayers: 5,
  aliases: ["hanabi"],
  description: "Coopérez sans voir vos propres cartes pour assembler le feu d'artifice parfait.",
  ruleSet: {
    id: "rule-han-base",
    gameId: "game-hanabi",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-han-base", "cat-han-fireworks", "Cartes de feu d'artifice posées (sur 25)", "sum", { step: 1 })],
  },
});

order = 0;
const justOne = game({
  id: "game-just-one",
  name: "Just One",
  publisher: "Repos Production",
  year: 2018,
  minPlayers: 3,
  maxPlayers: 7,
  aliases: ["just one"],
  description: "Coopérez pour faire deviner un mot mystère à l'un d'entre vous.",
  ruleSet: {
    id: "rule-jo-base",
    gameId: "game-just-one",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-jo-base", "cat-jo-correct", "Mots devinés (sur 13)", "sum", { step: 1 })],
  },
});

order = 0;
const duneImperium = game({
  id: "game-dune-imperium",
  name: "Dune: Imperium",
  publisher: "Dire Wolf",
  year: 2020,
  minPlayers: 1,
  maxPlayers: 4,
  aliases: ["dune imperium", "dune"],
  description: "Placez vos agents entre récolte d'épice, combat et intrigue politique.",
  ruleSet: {
    id: "rule-di-base",
    gameId: "game-dune-imperium",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-di-base", "cat-di-vp", "Points de victoire (combat, intrigue, cartes)", "sum", { roundBased: true, helper: "Additionnez les points gagnés à chaque round" }),
    ],
  },
});

order = 0;
const wyrmspan = game({
  id: "game-wyrmspan",
  name: "Wyrmspan",
  publisher: "Stonemaier Games",
  year: 2024,
  minPlayers: 1,
  maxPlayers: 5,
  aliases: ["wyrmspan"],
  description: "Attirez des dragons dans votre repaire, dans la lignée de Wingspan.",
  ruleSet: {
    id: "rule-wys-base",
    gameId: "game-wyrmspan",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-wys-base", "cat-wys-dragons", "Points des dragons", "sum", { roundBased: true, helper: "Additionnez la valeur de chaque dragon" }),
      cat("rule-wys-base", "cat-wys-caves", "Cavernes et ressources", "sum", { step: 1 }),
      cat("rule-wys-base", "cat-wys-goals", "Objectifs de fin de manche", "bonus", { step: 1 }),
    ],
  },
});

order = 0;
const catInTheBox = game({
  id: "game-cat-in-the-box",
  name: "Cat in the Box",
  publisher: "Ninja Star Games",
  year: 2021,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["cat in the box"],
  description: "Jeu de plis où les cartes n'ont pas de couleur fixe : à vous de la déclarer.",
  ruleSet: {
    id: "rule-cib-base",
    gameId: "game-cat-in-the-box",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-cib-base", "cat-cib-round", "Score de la manche (pari de plis)", "sum", { roundBased: true }),
    ],
  },
});

order = 0;
const cribbage = game({
  id: "game-cribbage",
  name: "Cribbage",
  publisher: "Domaine public",
  year: 1630,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["cribbage"],
  description: "Comptez vos combinaisons de cartes sur une planche à jalons, premier à 121 gagne.",
  ruleSet: {
    id: "rule-crib-base",
    gameId: "game-cribbage",
    versionLabel: "Règles classiques",
    isOfficial: true,
    categories: [cat("rule-crib-base", "cat-crib-pegs", "Points marqués (jalons)", "sum", { roundBased: true, helper: "Additionnez les points de chaque main" })],
  },
});

order = 0;
const canasta = game({
  id: "game-canasta",
  name: "Canasta",
  publisher: "Domaine public",
  year: 1939,
  minPlayers: 2,
  maxPlayers: 6,
  aliases: ["canasta"],
  description: "Formez des combinaisons de cartes, les canastas rapportant le plus de points.",
  ruleSet: {
    id: "rule-can-base",
    gameId: "game-canasta",
    versionLabel: "Règles classiques",
    isOfficial: true,
    categories: [
      cat("rule-can-base", "cat-can-melds", "Combinaisons posées", "sum", { roundBased: true }),
      cat("rule-can-base", "cat-can-hand", "Cartes restantes en main", "malus", { roundBased: true }),
    ],
  },
});

order = 0;
const ginRummy = game({
  id: "game-gin-rummy",
  name: "Gin Rummy",
  publisher: "Domaine public",
  year: 1909,
  minPlayers: 2,
  maxPlayers: 2,
  aliases: ["gin rummy", "gin"],
  description: "Formez des suites et brelans, puis 'gin' pour marquer le maximum de points.",
  ruleSet: {
    id: "rule-gr-base",
    gameId: "game-gin-rummy",
    versionLabel: "Règles classiques",
    isOfficial: true,
    categories: [cat("rule-gr-base", "cat-gr-points", "Points de la manche", "sum", { roundBased: true })],
  },
});

order = 0;
const hearts = game({
  id: "game-hearts",
  name: "Hearts",
  publisher: "Domaine public",
  year: 1850,
  minPlayers: 3,
  maxPlayers: 6,
  aliases: ["hearts", "coeurs"],
  description: "Évitez de remporter les cœurs et la dame de pique dans ce jeu de plis.",
  ruleSet: {
    id: "rule-hrt-base",
    gameId: "game-hearts",
    versionLabel: "Règles classiques",
    isOfficial: true,
    sortDirection: "asc",
    categories: [cat("rule-hrt-base", "cat-hrt-points", "Cœurs et dame de pique récoltés", "sum", { roundBased: true, helper: "Le score le plus bas gagne — une entrée par manche" })],
  },
});

order = 0;
const spades = game({
  id: "game-spades",
  name: "Spades",
  publisher: "Domaine public",
  year: 1930,
  minPlayers: 4,
  maxPlayers: 4,
  aliases: ["spades", "piques"],
  description: "Annoncez le nombre de plis que vous allez remporter et jouez en équipe.",
  ruleSet: {
    id: "rule-spd-base",
    gameId: "game-spades",
    versionLabel: "Règles classiques",
    isOfficial: true,
    categories: [cat("rule-spd-base", "cat-spd-round", "Score de la manche (pari tenu ou raté)", "sum", { roundBased: true })],
  },
});

order = 0;
const euchre = game({
  id: "game-euchre",
  name: "Euchre",
  publisher: "Domaine public",
  year: 1850,
  minPlayers: 4,
  maxPlayers: 4,
  aliases: ["euchre"],
  description: "Jeu de plis en équipe autour de l'atout, premier à 10 points gagne.",
  ruleSet: {
    id: "rule-euc-base",
    gameId: "game-euchre",
    versionLabel: "Règles classiques",
    isOfficial: true,
    categories: [cat("rule-euc-base", "cat-euc-points", "Points marqués (par manche)", "sum", { roundBased: true })],
  },
});

order = 0;
const rummy500 = game({
  id: "game-rummy-500",
  name: "Rummy 500",
  publisher: "Domaine public",
  year: 1934,
  minPlayers: 2,
  maxPlayers: 8,
  aliases: ["rummy 500", "rummy"],
  description: "Combinez suites et brelans en piochant dans la défausse, jusqu'à 500 points.",
  ruleSet: {
    id: "rule-r500-base",
    gameId: "game-rummy-500",
    versionLabel: "Règles classiques",
    isOfficial: true,
    categories: [
      cat("rule-r500-base", "cat-r500-melds", "Combinaisons posées", "sum", { roundBased: true }),
      cat("rule-r500-base", "cat-r500-hand", "Cartes restantes en main", "malus", { roundBased: true }),
    ],
  },
});

order = 0;
const phase10 = game({
  id: "game-phase-10",
  name: "Phase 10",
  publisher: "Mattel",
  year: 1982,
  minPlayers: 2,
  maxPlayers: 6,
  aliases: ["phase 10"],
  description: "Complétez dix phases de combinaisons avant vos adversaires.",
  ruleSet: {
    id: "rule-p10-base",
    gameId: "game-phase-10",
    versionLabel: "Édition de base",
    isOfficial: true,
    sortDirection: "asc",
    categories: [cat("rule-p10-base", "cat-p10-hand", "Points des cartes restantes en main", "sum", { roundBased: true, helper: "Le score le plus bas gagne — une entrée par manche" })],
  },
});

order = 0;
const farkle = game({
  id: "game-farkle",
  name: "Farkle",
  publisher: "Domaine public",
  year: 1900,
  minPlayers: 2,
  maxPlayers: 8,
  aliases: ["farkle"],
  description: "Lancez les dés et cumulez les points sans jamais faire de Farkle.",
  ruleSet: {
    id: "rule-frk-base",
    gameId: "game-farkle",
    versionLabel: "Règles classiques",
    isOfficial: true,
    categories: [cat("rule-frk-base", "cat-frk-points", "Points marqués (par tour)", "sum", { roundBased: true, helper: "Additionnez le score de chaque tour" })],
  },
});

order = 0;
const bunco = game({
  id: "game-bunco",
  name: "Bunco",
  publisher: "Domaine public",
  year: 1855,
  minPlayers: 4,
  maxPlayers: 12,
  aliases: ["bunco", "bunko"],
  description: "Lancez trois dés pour marquer des points au numéro de la manche en cours.",
  ruleSet: {
    id: "rule-bnc-base",
    gameId: "game-bunco",
    versionLabel: "Règles classiques",
    isOfficial: true,
    categories: [cat("rule-bnc-base", "cat-bnc-points", "Points marqués (par manche)", "sum", { roundBased: true })],
  },
});

order = 0;
const dominoesClassic = game({
  id: "game-dominoes",
  name: "Dominos (classique)",
  publisher: "Domaine public",
  year: 1120,
  minPlayers: 2,
  maxPlayers: 4,
  aliases: ["dominos", "dominoes"],
  description: "Posez vos dominos en faisant correspondre les valeurs, premier sans domino gagne la manche.",
  ruleSet: {
    id: "rule-dom-base",
    gameId: "game-dominoes",
    versionLabel: "Règles classiques",
    isOfficial: true,
    sortDirection: "asc",
    categories: [cat("rule-dom-base", "cat-dom-pips", "Points des dominos restants (adversaires)", "sum", { roundBased: true, helper: "Le score le plus bas gagne — une entrée par manche" })],
  },
});

order = 0;
const mahjong = game({
  id: "game-mahjong",
  name: "Mahjong",
  publisher: "Domaine public",
  year: 1850,
  minPlayers: 4,
  maxPlayers: 4,
  aliases: ["mahjong", "majong"],
  description: "Composez la meilleure main de tuiles en piochant et défaussant à tour de rôle.",
  ruleSet: {
    id: "rule-mj-base",
    gameId: "game-mahjong",
    versionLabel: "Règles classiques",
    isOfficial: true,
    categories: [cat("rule-mj-base", "cat-mj-hand", "Points de la main (par manche)", "sum", { roundBased: true })],
  },
});

order = 0;
const boggle = game({
  id: "game-boggle",
  name: "Boggle",
  publisher: "Hasbro",
  year: 1972,
  minPlayers: 2,
  maxPlayers: 8,
  aliases: ["boggle"],
  description: "Trouvez un maximum de mots dans la grille de dés avant la fin du sablier.",
  ruleSet: {
    id: "rule-bog-base",
    gameId: "game-boggle",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-bog-base", "cat-bog-words", "Points des mots trouvés (par manche)", "sum", { roundBased: true, helper: "Additionnez le score de chaque manche" })],
  },
});

order = 0;
const balderdash = game({
  id: "game-balderdash",
  name: "Balderdash",
  publisher: "Hasbro",
  year: 1984,
  minPlayers: 2,
  maxPlayers: 8,
  aliases: ["balderdash"],
  description: "Inventez des définitions bluffantes et devinez la vraie parmi les fausses.",
  ruleSet: {
    id: "rule-bal-base",
    gameId: "game-balderdash",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-bal-base", "cat-bal-points", "Points marqués (par manche)", "sum", { roundBased: true, helper: "Additionnez le score de chaque manche" })],
  },
});

order = 0;
const cardsAgainstHumanity = game({
  id: "game-cards-against-humanity",
  name: "Cards Against Humanity",
  publisher: "Cards Against Humanity LLC",
  year: 2011,
  minPlayers: 3,
  maxPlayers: 20,
  aliases: ["cards against humanity", "cah"],
  description: "Complétez des phrases avec la carte la plus (in)appropriée pour remporter la manche.",
  ruleSet: {
    id: "rule-cah-base",
    gameId: "game-cards-against-humanity",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-cah-base", "cat-cah-wins", "Cartes noires remportées", "sum", { roundBased: true, helper: "Une entrée par manche remportée" })],
  },
});

order = 0;
const scattergories = game({
  id: "game-scattergories",
  name: "Scattergories",
  publisher: "Hasbro",
  year: 1988,
  minPlayers: 2,
  maxPlayers: 6,
  aliases: ["scattergories"],
  description: "Trouvez des mots uniques par catégorie commençant par la lettre tirée.",
  ruleSet: {
    id: "rule-scg-base",
    gameId: "game-scattergories",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-scg-base", "cat-scg-points", "Réponses uniques validées (par manche)", "sum", { roundBased: true, helper: "Additionnez le score de chaque manche" })],
  },
});

order = 0;
const witsAndWagers = game({
  id: "game-wits-and-wagers",
  name: "Wits & Wagers",
  publisher: "North Star Games",
  year: 2005,
  minPlayers: 3,
  maxPlayers: 7,
  aliases: ["wits and wagers", "wits & wagers"],
  description: "Pariez sur la réponse la plus proche à des questions loufoques.",
  ruleSet: {
    id: "rule-ww-base",
    gameId: "game-wits-and-wagers",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-ww-base", "cat-ww-chips", "Jetons gagnés (par manche)", "sum", { roundBased: true })],
  },
});

order = 0;
const backgammon = game({
  id: "game-backgammon",
  name: "Backgammon",
  publisher: "Domaine public",
  year: -3000,
  minPlayers: 2,
  maxPlayers: 2,
  aliases: ["backgammon", "jacquet"],
  description: "Faites sortir tous vos pions du plateau avant votre adversaire.",
  ruleSet: {
    id: "rule-bg-base",
    gameId: "game-backgammon",
    versionLabel: "Règles classiques",
    isOfficial: true,
    categories: [cat("rule-bg-base", "cat-bg-points", "Points marqués (par partie, cube inclus)", "sum", { roundBased: true })],
  },
});

order = 0;
const pictionary = game({
  id: "game-pictionary",
  name: "Pictionary",
  publisher: "Hasbro",
  year: 1985,
  minPlayers: 4,
  maxPlayers: 12,
  aliases: ["pictionary"],
  description: "Faites deviner des mots à votre équipe en les dessinant.",
  ruleSet: {
    id: "rule-pic-base",
    gameId: "game-pictionary",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [cat("rule-pic-base", "cat-pic-squares", "Cases parcourues sur le plateau", "sum", { step: 1 })],
  },
});

order = 0;
const taboo = game({
  id: "game-taboo",
  name: "Taboo",
  publisher: "Hasbro",
  year: 1989,
  minPlayers: 4,
  maxPlayers: 10,
  aliases: ["taboo"],
  description: "Faites deviner un mot à votre équipe sans utiliser les mots interdits.",
  ruleSet: {
    id: "rule-tb-base",
    gameId: "game-taboo",
    versionLabel: "Édition de base",
    isOfficial: true,
    categories: [
      cat("rule-tb-base", "cat-tb-correct", "Mots devinés", "sum", { roundBased: true, helper: "+1 par mot deviné" }),
      cat("rule-tb-base", "cat-tb-taboo", "Mots tabous prononcés", "malus", { roundBased: true }),
    ],
  },
});

order = 0;
const quickPlay = game({
  id: "game-quick-play",
  name: "Jeu rapide",
  publisher: "BoardScore AI",
  year: new Date().getFullYear(),
  aliases: ["jeu rapide", "partie libre", "quick play", "libre"],
  description:
    "Suivez le score de n'importe quel jeu sans le reconnaître : ajoutez les joueurs, cumulez les points manche après manche, avec un objectif optionnel (nombre de manches ou score à atteindre).",
  ruleSet: {
    id: "rule-quick-play-base",
    gameId: "game-quick-play",
    versionLabel: "Suivi libre",
    isOfficial: false,
    categories: [
      cat("rule-quick-play-base", "cat-qp-score", "Score", "sum", {
        roundBased: true,
        helper: "Additionnez le score de chaque manche",
      }),
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
  dominion,
  puertoRico,
  agricola,
  concordia,
  patchwork,
  kingdomino,
  sagrada,
  photosynthesis,
  fiveTribes,
  bloodRage,
  centurySpiceRoad,
  qwirkle,
  yahtzee,
  scrabble,
  trivialPursuit,
  dixit,
  sixQuiPrend,
  skyjo,
  uno,
  root,
  raceForTheGalaxy,
  viticulture,
  greatWesternTrail,
  brassBirmingham,
  coloretto,
  rummikub,
  bohnanza,
  jaipur,
  camelUp,
  coltExpress,
  welcomeTo,
  smallWorld,
  arkNova,
  terraMystica,
  caverna,
  leHavre,
  elGrande,
  powerGrid,
  acquire,
  sushiGo,
  pointSalad,
  cascadia,
  calico,
  parks,
  bunnyKingdom,
  isleOfCats,
  underwaterCities,
  trajan,
  orleans,
  lordsOfWaterdeep,
  tapestry,
  architectsWestKingdom,
  marcoPolo,
  istanbul,
  santaMaria,
  barony,
  blokus,
  kingdomBuilder,
  sevenWondersDuel,
  clank,
  skullKing,
  hanabi,
  justOne,
  duneImperium,
  wyrmspan,
  catInTheBox,
  cribbage,
  canasta,
  ginRummy,
  hearts,
  spades,
  euchre,
  rummy500,
  phase10,
  farkle,
  bunco,
  dominoesClassic,
  mahjong,
  boggle,
  balderdash,
  cardsAgainstHumanity,
  scattergories,
  witsAndWagers,
  backgammon,
  pictionary,
  taboo,
  quickPlay,
  genericTemplate,
];

export const GENERIC_GAME_ID = genericTemplate.id;
export const QUICK_PLAY_GAME_ID = quickPlay.id;
