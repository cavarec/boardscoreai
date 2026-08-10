// Génère le SQL d'amorçage du catalogue Supabase à partir du catalogue
// embarqué (src/data/games.seed.ts), pour que les deux restent la même
// source de vérité — jamais de saisie manuelle en double dans le SQL.
// Usage : node scripts/export-catalog-sql.mjs > supabase/seed-catalog.sql
import { writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { GAMES_SEED } = await import(
  pathToFileURL(path.join(__dirname, "../src/data/games.seed.ts")).href
);

function sqlString(value) {
  if (value === undefined || value === null) return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlArray(values) {
  if (!values?.length) return "'{}'";
  return `array[${values.map((v) => sqlString(v)).join(", ")}]`;
}

function sqlJson(value) {
  return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
}

const lines = [
  "-- Généré automatiquement par scripts/export-catalog-sql.mjs à partir de",
  "-- src/data/games.seed.ts — ne pas éditer à la main, régénérer à la place.",
  "-- À exécuter APRÈS supabase/schema.sql dans l'éditeur SQL Supabase.",
  "",
];

for (const g of GAMES_SEED) {
  lines.push(
    `insert into games (id, name, publisher, year, min_players, max_players, aliases, description) values (` +
      [
        sqlString(g.id),
        sqlString(g.name),
        sqlString(g.publisher),
        g.year ?? "null",
        g.minPlayers ?? "null",
        g.maxPlayers ?? "null",
        sqlArray(g.aliases),
        sqlString(g.description),
      ].join(", ") +
      `) on conflict (id) do nothing;`
  );

  const rs = g.ruleSet;
  lines.push(
    `insert into game_rules (id, game_id, version_label, is_official, sort_direction) values (` +
      [
        sqlString(rs.id),
        sqlString(rs.gameId),
        sqlString(rs.versionLabel),
        rs.isOfficial ? "true" : "false",
        sqlString(rs.sortDirection ?? "desc"),
      ].join(", ") +
      `) on conflict (id) do nothing;`
  );

  for (const c of rs.categories) {
    lines.push(
      `insert into score_categories (id, rule_id, label, formula_type, config, "order") values (` +
        [
          sqlString(c.id),
          sqlString(c.ruleId),
          sqlString(c.label),
          sqlString(c.formulaType),
          sqlJson(c.config ?? {}),
          c.order,
        ].join(", ") +
        `) on conflict (id) do nothing;`
    );
  }
  lines.push("");
}

const output = lines.join("\n") + "\n";
const outPath = path.join(__dirname, "../supabase/seed-catalog.sql");
writeFileSync(outPath, output);
console.log(`✓ ${outPath} (${GAMES_SEED.length} jeux)`);
