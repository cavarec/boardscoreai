-- Généré automatiquement par scripts/export-catalog-sql.mjs à partir de
-- src/data/games.seed.ts — ne pas éditer à la main, régénérer à la place.
-- À exécuter APRÈS supabase/schema.sql dans l'éditeur SQL Supabase.

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-7-wonders', '7 Wonders', 'Repos Production', 2010, 3, 7, array['7 wonders', 'sept merveilles', '7wonders', 'seven wonders'], 'Développez une civilisation antique en tirant parti de sept merveilles du monde.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-7-wonders-base', 'game-7-wonders', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-7w-coins', 'rule-7-wonders-base', 'Pièces d''or (3 pièces = 1 pt)', 'sum', '{"helper":"Total de vos pièces divisé par 3, arrondi","step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-7w-military', 'rule-7-wonders-base', 'Points militaires', 'sum', '{"helper":"Peut être négatif","step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-7w-wonders', 'rule-7-wonders-base', 'Merveille construite', 'sum', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-7w-civil', 'rule-7-wonders-base', 'Bâtiments civils (bleu)', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque carte bleue"}'::jsonb, 3) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-7w-commerce', 'rule-7-wonders-base', 'Bâtiments commerciaux (jaune)', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque carte jaune"}'::jsonb, 4) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-7w-guilds', 'rule-7-wonders-base', 'Guildes (violet)', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque carte guilde"}'::jsonb, 5) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-7w-science', 'rule-7-wonders-base', 'Sciences (vert)', 'sum', '{"helper":"Total déjà calculé des symboles","step":1}'::jsonb, 6) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-wingspan', 'Wingspan', 'Stonemaier Games', 2019, 1, 5, array['wingspan', 'wing span'], 'Attirez une collection d''oiseaux dans vos réserves naturelles.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-wingspan-base', 'game-wingspan', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wb-birds', 'rule-wingspan-base', 'Points des oiseaux', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque oiseau"}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wb-bonus-cards', 'rule-wingspan-base', 'Cartes bonus', 'bonus', '{"roundBased":true,"helper":"Additionnez la valeur de chaque carte bonus"}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wb-goals', 'rule-wingspan-base', 'Objectifs de fin de manche', 'bonus', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wb-eggs', 'rule-wingspan-base', 'Œufs sur le plateau', 'sum', '{"perUnit":1,"helper":"1 pt par œuf","step":1}'::jsonb, 3) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wb-food', 'rule-wingspan-base', 'Nourriture stockée sur cartes', 'sum', '{"perUnit":1,"step":1}'::jsonb, 4) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wb-cached', 'rule-wingspan-base', 'Cartes tuck sous vos oiseaux', 'sum', '{"perUnit":1,"step":1}'::jsonb, 5) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-terraforming-mars', 'Terraforming Mars', 'FryxGames', 2016, 1, 5, array['terraforming mars', 'tm', 'terraforming'], 'Terraformez la planète rouge en développant infrastructures et écosystèmes.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-tm-base', 'game-terraforming-mars', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-tm-tr', 'rule-tm-base', 'Niveau de terraformation (TR)', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-tm-cards', 'rule-tm-base', 'Points sur les cartes jouées', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque carte"}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-tm-milestones', 'rule-tm-base', 'Étapes réclamées', 'bonus', '{"perUnit":5,"helper":"5 pts par étape","step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-tm-awards', 'rule-tm-base', 'Récompenses remportées', 'bonus', '{"perUnit":5,"helper":"5 pts par récompense","step":1}'::jsonb, 3) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-tm-forests', 'rule-tm-base', 'Forêts posées', 'multiplier', '{"factor":1,"helper":"1 pt par forêt","step":1}'::jsonb, 4) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-tm-cities', 'rule-tm-base', 'Villes (selon tuiles vertes adjacentes)', 'sum', '{"step":1}'::jsonb, 5) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-azul', 'Azul', 'Plan B Games', 2017, 2, 4, array['azul'], 'Décorez les murs du palais royal d''Évora avec de superbes azulejos.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-azul-base', 'game-azul', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-az-tiles', 'rule-azul-base', 'Points de motifs posés', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-az-rows', 'rule-azul-base', 'Lignes horizontales complètes', 'bonus', '{"perUnit":2,"helper":"2 pts par ligne","step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-az-cols', 'rule-azul-base', 'Colonnes verticales complètes', 'bonus', '{"perUnit":7,"helper":"7 pts par colonne","step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-az-colors', 'rule-azul-base', 'Couleurs complètes (5 exemplaires)', 'bonus', '{"perUnit":10,"helper":"10 pts par couleur","step":1}'::jsonb, 3) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-az-penalty', 'rule-azul-base', 'Case pénalité (ligne du bas)', 'malus', '{"step":1}'::jsonb, 4) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-splendor', 'Splendor', 'Space Cowboys', 2014, 2, 4, array['splendor'], 'Devenez un riche marchand de la Renaissance en collectionnant mines et joyaux.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-splendor-base', 'game-splendor', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-sp-cards', 'rule-splendor-base', 'Points sur les cartes développement', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-sp-nobles', 'rule-splendor-base', 'Nobles visités', 'bonus', '{"perUnit":3,"helper":"3 pts par noble","step":1}'::jsonb, 1) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-catan', 'Catane', 'Kosmos', 1995, 3, 4, array['catane', 'catan', 'les colons de catane', 'settlers of catan'], 'Colonisez l''île de Catane en gérant ressources, routes et villages.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-catan-base', 'game-catan', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ct-settlements', 'rule-catan-base', 'Colonies', 'sum', '{"perUnit":1,"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ct-cities', 'rule-catan-base', 'Villes', 'multiplier', '{"factor":2,"helper":"2 pts par ville","step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ct-dev-cards', 'rule-catan-base', 'Points sur cartes développement', 'sum', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ct-longest-road', 'rule-catan-base', 'Route la plus longue', 'conditional', '{"mode":"boolean","pointsIfMet":2,"pointsIfNot":0}'::jsonb, 3) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ct-largest-army', 'rule-catan-base', 'Plus grande armée', 'conditional', '{"mode":"boolean","pointsIfMet":2,"pointsIfNot":0}'::jsonb, 4) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-carcassonne', 'Carcassonne', 'Hans im Glück', 2000, 2, 5, array['carcassonne'], 'Construisez routes, villes et abbayes tuile après tuile.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-carc-base', 'game-carcassonne', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-cc-roads', 'rule-carc-base', 'Routes terminées', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-cc-cities', 'rule-carc-base', 'Villes terminées', 'sum', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-cc-monasteries', 'rule-carc-base', 'Monastères terminés', 'sum', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-cc-farms', 'rule-carc-base', 'Prés (fin de partie)', 'sum', '{"step":1}'::jsonb, 3) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-ticket-to-ride', 'Les Aventuriers du Rail', 'Days of Wonder', 2004, 2, 5, array['les aventuriers du rail', 'ticket to ride', 'aventuriers du rail'], 'Reliez les villes en posant des wagons et en complétant vos destinations.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-ttr-base', 'game-ticket-to-ride', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ttr-routes', 'rule-ttr-base', 'Points des voies posées', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ttr-tickets-done', 'rule-ttr-base', 'Destinations complétées', 'sum', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ttr-tickets-failed', 'rule-ttr-base', 'Destinations ratées', 'malus', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ttr-longest', 'rule-ttr-base', 'Plus long chemin continu', 'conditional', '{"mode":"boolean","pointsIfMet":10,"pointsIfNot":0}'::jsonb, 3) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-king-of-tokyo', 'King of Tokyo', 'IELLO', 2011, 2, 6, array['king of tokyo', 'roi de tokyo'], 'Incarnez un monstre géant et devenez le roi de Tokyo.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-kot-base', 'game-king-of-tokyo', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-kot-vp', 'rule-kot-base', 'Points de victoire cumulés', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-everdell', 'Everdell', 'Starling Games', 2018, 1, 4, array['everdell'], 'Bâtissez une cité prospère au pied de l''arbre d''Everdell.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-everdell-base', 'game-everdell', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ed-cards', 'rule-everdell-base', 'Points sur les cartes', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ed-events', 'rule-everdell-base', 'Événements accomplis', 'bonus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ed-city-full', 'rule-everdell-base', 'Cité complète (15 cartes)', 'conditional', '{"mode":"boolean","pointsIfMet":2,"pointsIfNot":0}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ed-resources', 'rule-everdell-base', 'Ressources restantes (par groupe de 3)', 'sum', '{"step":1}'::jsonb, 3) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-scythe', 'Scythe', 'Stonemaier Games', 2016, 1, 5, array['scythe'], 'Menez une faction d''Europe de l''Est dans une course au développement uchronique.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-scythe-base', 'game-scythe', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-sc-coins', 'rule-scythe-base', 'Pièces (÷3, arrondi)', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-sc-territories', 'rule-scythe-base', 'Territoires contrôlés', 'bonus', '{"perUnit":2,"helper":"2 pts par territoire","step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-sc-structures', 'rule-scythe-base', 'Structures construites', 'bonus', '{"perUnit":2,"step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-sc-popularity', 'rule-scythe-base', 'Popularité', 'sum', '{"step":1}'::jsonb, 3) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-sc-secret', 'rule-scythe-base', 'Objectif secret de faction', 'hidden_objective', '{"mode":"boolean","pointsIfMet":8,"pointsIfNot":0,"helper":"Révélé en fin de partie"}'::jsonb, 4) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-dominion', 'Dominion', 'Filosofia', 2008, 2, 4, array['dominion'], 'Bâtissez le deck le plus efficace pour accumuler les cartes Victoire.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-dominion-base', 'game-dominion', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-dom-victory', 'rule-dominion-base', 'Points des cartes Victoire', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque carte Victoire"}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-dom-curse', 'rule-dominion-base', 'Cartes Malédiction', 'malus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-puerto-rico', 'Puerto Rico', 'Rio Grande Games', 2002, 3, 5, array['puerto rico'], 'Développez votre colonie en gérant plantations, production et commerce.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-pr-base', 'game-puerto-rico', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-pr-buildings', 'rule-pr-base', 'Points de bâtiments', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque bâtiment"}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-pr-goods', 'rule-pr-base', 'Marchandises exportées', 'sum', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-pr-great-building', 'rule-pr-base', 'Bonus grand bâtiment', 'bonus', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-agricola', 'Agricola', 'Lookout Games', 2007, 1, 5, array['agricola'], 'Développez votre ferme : champs, pâtures, animaux et pièces de la maison.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-agricola-base', 'game-agricola', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-agr-fields', 'rule-agricola-base', 'Champs', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-agr-pastures', 'rule-agricola-base', 'Pâtures et animaux', 'sum', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-agr-cards', 'rule-agricola-base', 'Cartes jouées', 'sum', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-agr-money', 'rule-agricola-base', 'Pièces restantes (÷3)', 'sum', '{"helper":"Arrondi à l''inférieur","step":1}'::jsonb, 3) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-agr-empty', 'rule-agricola-base', 'Espaces de ferme vides', 'malus', '{"step":1}'::jsonb, 4) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-agr-beggars', 'rule-agricola-base', 'Mendiants (cartes négatives)', 'malus', '{"perUnit":3,"step":1}'::jsonb, 5) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-concordia', 'Concordia', 'PD-Verlag', 2013, 2, 5, array['concordia'], 'Étendez votre réseau commercial à travers les provinces romaines.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-concordia-base', 'game-concordia', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-cnc-colonists', 'rule-concordia-base', 'Points des colons (Vesta)', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque marchandise"}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-cnc-final-card', 'rule-concordia-base', 'Carte finale (Jupiter/Mercure…)', 'sum', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-cnc-money', 'rule-concordia-base', 'Pièces restantes (÷10)', 'sum', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-patchwork', 'Patchwork', 'Lookout Games', 2014, 2, 2, array['patchwork'], 'Assemblez vos chutes de tissu sur une couverture 9x9, à deux joueurs.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-patchwork-base', 'game-patchwork', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-pw-buttons', 'rule-patchwork-base', 'Boutons restants', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-pw-empty', 'rule-patchwork-base', 'Cases vides du plateau', 'malus', '{"perUnit":2,"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-pw-bonus', 'rule-patchwork-base', 'Bonus tuile 7x7 remplie', 'conditional', '{"mode":"boolean","pointsIfMet":7,"pointsIfNot":0}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-kingdomino', 'Kingdomino', 'Blue Orange', 2016, 2, 4, array['kingdomino'], 'Construisez le royaume le plus harmonieux en assemblant des dominos de territoires.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-kd-base', 'game-kingdomino', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-kd-territories', 'rule-kd-base', 'Territoires (taille × couronnes)', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-kd-center', 'rule-kd-base', 'Château au milieu du royaume', 'conditional', '{"mode":"boolean","pointsIfMet":10,"pointsIfNot":0}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-kd-harmony', 'rule-kd-base', 'Royaume complet (harmonie)', 'conditional', '{"mode":"boolean","pointsIfMet":5,"pointsIfNot":0}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-sagrada', 'Sagrada', 'Floodgate Games', 2017, 1, 4, array['sagrada'], 'Composez un vitrail en assemblant des dés colorés selon des contraintes.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-sagrada-base', 'game-sagrada', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-sag-private', 'rule-sagrada-base', 'Objectif privé (couleur)', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-sag-public', 'rule-sagrada-base', 'Objectifs publics', 'sum', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-sag-empty', 'rule-sagrada-base', 'Cases vides de la vitre', 'malus', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-photosynthesis', 'Photosynthesis', 'Blue Orange', 2017, 2, 4, array['photosynthesis', 'photosynthese'], 'Faites grandir votre forêt en captant la lumière du soleil qui tourne.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-photo-base', 'game-photosynthesis', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-photo-trees', 'rule-photo-base', 'Arbres récoltés', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-photo-bonus', 'rule-photo-base', 'Bonus de fin de partie', 'bonus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-five-tribes', 'Five Tribes', 'Days of Wonder', 2014, 2, 4, array['five tribes'], 'Déplacez les Meeples des tribus du Sultanat de Naqala pour amasser richesse et pouvoir.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-ft-base', 'game-five-tribes', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ft-resources', 'rule-ft-base', 'Pièces et ressources', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ft-djinns', 'rule-ft-base', 'Djinns', 'bonus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ft-servants', 'rule-ft-base', 'Serviteurs sur le plateau', 'sum', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-blood-rage', 'Blood Rage', 'CMON', 2015, 2, 4, array['blood rage'], 'Menez votre clan viking vers un Ragnarök glorieux.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-br-base', 'game-blood-rage', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-br-quests', 'rule-br-base', 'Quêtes accomplies', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-br-monsters', 'rule-br-base', 'Monstres tués', 'sum', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-br-cards', 'rule-br-base', 'Points des cartes', 'sum', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-br-ragnarok', 'rule-br-base', 'Gloire à Ragnarök', 'bonus', '{"step":1}'::jsonb, 3) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-century-spice-road', 'Century: Spice Road', 'Plan B Games', 2017, 2, 5, array['century spice road', 'century'], 'Constituez des caravanes d''épices pour honorer des cartes objectif.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-csr-base', 'game-century-spice-road', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-csr-cards', 'rule-csr-base', 'Cartes point', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-csr-coins', 'rule-csr-base', 'Pièces d''or et d''argent restantes', 'bonus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-qwirkle', 'Qwirkle', 'MindWare', 2006, 2, 4, array['qwirkle'], 'Alignez des tuiles de formes et couleurs pour former des lignes.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-qw-base', 'game-qwirkle', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-qw-tiles', 'rule-qw-base', 'Tuiles posées (lignes)', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-qw-qwirkle', 'rule-qw-base', 'Qwirkles (ligne de 6)', 'bonus', '{"perUnit":6,"helper":"6 pts par Qwirkle","step":1}'::jsonb, 1) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-yahtzee', 'Yahtzee', 'Hasbro', 1956, 1, 8, array['yahtzee', 'yams'], 'Composez les meilleures combinaisons de dés en trois lancers.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-yz-base', 'game-yahtzee', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-yz-upper', 'rule-yz-base', 'Section supérieure (as à six)', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-yz-upper-bonus', 'rule-yz-base', 'Bonus section supérieure', 'conditional', '{"mode":"threshold","threshold":63,"pointsIfMet":35,"pointsIfNot":0,"helper":"Seuil de 63 pts"}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-yz-lower', 'rule-yz-base', 'Section inférieure (brelans, full, suites…)', 'sum', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-yz-bonus-yahtzee', 'rule-yz-base', 'Yahtzee supplémentaire', 'bonus', '{"perUnit":100,"step":1}'::jsonb, 3) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-scrabble', 'Scrabble', 'Mattel', 1938, 2, 4, array['scrabble'], 'Formez des mots sur la grille en exploitant les cases bonus.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-scr-base', 'game-scrabble', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-scr-words', 'rule-scr-base', 'Points des mots posés', 'sum', '{"roundBased":true,"helper":"Additionnez le score de chaque mot"}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-scr-bingo', 'rule-scr-base', 'Scrabble (toutes les lettres posées)', 'conditional', '{"mode":"boolean","pointsIfMet":50,"pointsIfNot":0}'::jsonb, 1) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-trivial-pursuit', 'Trivial Pursuit', 'Hasbro', 1981, 2, 6, array['trivial pursuit'], 'Répondez à des questions de culture générale pour remplir votre camembert.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-tp-base', 'game-trivial-pursuit', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-tp-wedges', 'rule-tp-base', 'Camemberts obtenus', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-dixit', 'Dixit', 'Libellud', 2008, 3, 6, array['dixit'], 'Faites deviner une carte illustrée grâce à une phrase énigmatique.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-dixit-base', 'game-dixit', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-dixit-total', 'rule-dixit-base', 'Score total', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-6-qui-prend', '6 qui prend !', 'Amigo', 1994, 2, 10, array['6 qui prend', 'six qui prend', 'take 6'], 'Évitez de récolter les têtes de bœuf en posant vos cartes numérotées.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-6qp-base', 'game-6-qui-prend', 'Édition de base', true, 'asc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-6qp-heads', 'rule-6qp-base', 'Têtes de bœuf récoltées', 'sum', '{"roundBased":true,"helper":"Le score le plus bas gagne — une entrée par manche"}'::jsonb, 0) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-skyjo', 'Skyjo', 'Magilano', 2019, 2, 8, array['skyjo'], 'Révélez et échangez vos cartes pour obtenir le total le plus bas possible.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-skyjo-base', 'game-skyjo', 'Édition de base', true, 'asc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-skyjo-cards', 'rule-skyjo-base', 'Valeur des cartes restantes', 'sum', '{"roundBased":true,"helper":"Le score le plus bas gagne — une entrée par manche"}'::jsonb, 0) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-uno', 'Uno', 'Mattel', 1971, 2, 10, array['uno'], 'Débarrassez-vous de vos cartes avant tout le monde, manche après manche.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-uno-base', 'game-uno', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-uno-points', 'rule-uno-base', 'Points des cartes adverses (manche gagnée)', 'sum', '{"roundBased":true,"helper":"Une entrée par manche gagnée"}'::jsonb, 0) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-root', 'Root', 'Leder Games', 2018, 2, 4, array['root'], 'Contrôlez la forêt avec une faction asymétrique parmi plusieurs.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-root-base', 'game-root', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-root-vp', 'rule-root-base', 'Points de victoire cumulés', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-race-for-the-galaxy', 'Race for the Galaxy', 'Rio Grande Games', 2007, 2, 4, array['race for the galaxy'], 'Développez un empire galactique en jouant mondes et développements.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-rftg-base', 'game-race-for-the-galaxy', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-rftg-cards', 'rule-rftg-base', 'Points des cartes', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque carte"}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-rftg-bonus', 'rule-rftg-base', 'Bonus d''objectifs', 'bonus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-viticulture', 'Viticulture', 'Stonemaier Games', 2015, 1, 6, array['viticulture'], 'Gérez un domaine viticole en Toscane, des vignes à la cave.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-vit-base', 'game-viticulture', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-vit-cards', 'rule-vit-base', 'Points des cartes', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque carte"}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-vit-structures', 'rule-vit-base', 'Structures construites', 'bonus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-vit-residual', 'rule-vit-base', 'Résiduel (pièces, raisins, vin)', 'sum', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-great-western-trail', 'Great Western Trail', 'eggertspiele', 2016, 2, 4, array['great western trail'], 'Menez vos troupeaux de bétail du Texas à Kansas City.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-gwt-base', 'game-great-western-trail', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-gwt-cattle', 'rule-gwt-base', 'Bétail livré', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-gwt-buildings', 'rule-gwt-base', 'Bâtiments et objectifs', 'bonus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-gwt-debts', 'rule-gwt-base', 'Dettes restantes', 'malus', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-brass-birmingham', 'Brass: Birmingham', 'Roxley', 2018, 2, 4, array['brass birmingham', 'brass'], 'Développez industries et réseaux de transport dans les Midlands anglais.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-brass-base', 'game-brass-birmingham', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-brass-industries', 'rule-brass-base', 'Points d''industries', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque tuile industrie"}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-brass-links', 'rule-brass-base', 'Points de liens', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque lien"}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-brass-income', 'rule-brass-base', 'Bonus de revenu final', 'bonus', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-coloretto', 'Coloretto', 'Abacusspiele', 2003, 3, 5, array['coloretto'], 'Collectionnez des cartes de couleur sans en avoir trop de sortes différentes.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-col-base', 'game-coloretto', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-col-good', 'rule-col-base', 'Cartes des 3 meilleures couleurs', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-col-excess', 'rule-col-base', 'Cartes de couleurs en trop', 'malus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-rummikub', 'Rummikub', 'Lemada Light Industries', 1990, 2, 4, array['rummikub'], 'Combinez des tuiles numérotées en suites et groupes.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-rk-base', 'game-rummikub', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-rk-points', 'rule-rk-base', 'Points de la manche', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-bohnanza', 'Bohnanza', 'Amigo', 1997, 2, 7, array['bohnanza'], 'Cultivez et vendez des haricots pour amasser des pièces d''or.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-boh-base', 'game-bohnanza', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-boh-coins', 'rule-boh-base', 'Pièces d''or récoltées', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-jaipur', 'Jaipur', 'Space Cowboys', 2009, 2, 2, array['jaipur'], 'Devenez le marchand favori du Maharadja en échangeant des marchandises, à deux.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-jai-base', 'game-jaipur', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-jai-goods', 'rule-jai-base', 'Jetons marchandises', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-jai-camels', 'rule-jai-base', 'Bonus majorité de chameaux', 'conditional', '{"mode":"boolean","pointsIfMet":5,"pointsIfNot":0}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-jai-bonus', 'rule-jai-base', 'Jetons bonus (ventes groupées)', 'bonus', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-camel-up', 'Camel Up', 'Pegasus Spiele', 2014, 3, 8, array['camel up'], 'Pariez sur la course de chameaux la plus imprévisible qui soit.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-cu-base', 'game-camel-up', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-cu-leg', 'rule-cu-base', 'Gains des paris d''étape', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-cu-final', 'rule-cu-base', 'Gains des paris finaux', 'bonus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-cu-losses', 'rule-cu-base', 'Pertes de paris', 'malus', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-colt-express', 'Colt Express', 'Ludonaute', 2014, 2, 6, array['colt express'], 'Braquez le train et amassez le meilleur butin en évitant le Marshal.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-ce-base', 'game-colt-express', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ce-loot', 'rule-ce-base', 'Butin collecté', 'sum', '{"roundBased":true,"helper":"Additionnez la valeur de chaque butin"}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-ce-bullets', 'rule-ce-base', 'Balles et blessures', 'malus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-welcome-to', 'Welcome To...', 'Deep Water Games', 2018, 1, 100, array['welcome to'], 'Construisez le lotissement le plus harmonieux, un flip-and-write pour tous.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-wt-base', 'game-welcome-to', 'Édition de base', true, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wt-houses', 'rule-wt-base', 'Maisons construites (par rue)', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wt-parks', 'rule-wt-base', 'Parcs', 'bonus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wt-pools', 'rule-wt-base', 'Piscines', 'bonus', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wt-goals', 'rule-wt-base', 'Objectifs de fin de partie', 'bonus', '{"step":1}'::jsonb, 3) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-wt-fouls', 'rule-wt-base', 'Fautes (permis, numéros non conformes)', 'malus', '{"step":1}'::jsonb, 4) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-quick-play', 'Jeu rapide', 'BoardScore AI', 2026, null, null, array['jeu rapide', 'partie libre', 'quick play', 'libre'], 'Suivez le score de n''importe quel jeu sans le reconnaître : ajoutez les joueurs, cumulez les points manche après manche, avec un objectif optionnel (nombre de manches ou score à atteindre).') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-quick-play-base', 'game-quick-play', 'Suivi libre', false, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-qp-score', 'rule-quick-play-base', 'Score', 'sum', '{"roundBased":true,"helper":"Additionnez le score de chaque manche"}'::jsonb, 0) on conflict (id) do nothing;

insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values ('game-generic', 'Autre jeu (modèle générique)', 'Communauté BoardScore AI', 2026, null, null, array['autre', 'generique', 'modèle générique', 'custom'], 'Point de départ pour un jeu non reconnu : trois catégories modifiables.') on conflict (id) do nothing;
insert into game_rules (id, game_id, version_label, is_official, sort_direction) values ('rule-generic-base', 'game-generic', 'Modèle générique', false, 'desc') on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-gen-points', 'rule-generic-base', 'Points bruts', 'sum', '{"step":1}'::jsonb, 0) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-gen-bonus', 'rule-generic-base', 'Bonus', 'bonus', '{"step":1}'::jsonb, 1) on conflict (id) do nothing;
insert into score_categories (id, rule_id, label, formula_type, config, "order") values ('cat-gen-malus', 'rule-generic-base', 'Malus', 'malus', '{"step":1}'::jsonb, 2) on conflict (id) do nothing;

