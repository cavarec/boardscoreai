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
export const SEED_VERSION = 5;

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
  quickPlay,
  genericTemplate,
];

export const GENERIC_GAME_ID = genericTemplate.id;
export const QUICK_PLAY_GAME_ID = quickPlay.id;
