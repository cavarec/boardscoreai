-- ============================================================================
-- BoardScore AI — schéma Supabase (Postgres)
-- ============================================================================
-- À exécuter dans l'éditeur SQL de votre projet Supabase (ou via `supabase db push`).
-- Reflète exactement les types TypeScript de src/types/index.ts : le moteur
-- de score (src/lib/scoreEngine.ts) et le cache local (src/lib/db.ts) lisent
-- et écrivent la même forme de données, que ce soit en local ou dans Supabase.
--
-- Principe : ajouter un jeu ne nécessite jamais de migration — seulement des
-- lignes dans games / game_rules / score_categories.
--
-- Script idempotent : les `drop table if exists ... cascade` en tête
-- permettent de le rejouer entièrement à tout moment en développement.
-- ============================================================================

create extension if not exists "pgcrypto";

drop table if exists game_barcodes cascade;
drop table if exists community_templates cascade;
drop table if exists rankings cascade;
drop table if exists scores cascade;
drop table if exists players cascade;
drop table if exists matches cascade;
drop table if exists score_categories cascade;
drop table if exists game_rules cascade;
drop table if exists games cascade;

-- ----------------------------------------------------------------------------
-- Profiles — miroir léger de auth.users (Users dans le dossier de conception)
-- ----------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text not null default 'Joueur',
  is_premium boolean not null default false,
  created_at timestamptz not null default now()
);

-- Crée automatiquement un profil à l'inscription.
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'display_name', 'Joueur'));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ----------------------------------------------------------------------------
-- Games — fiche jeu (nom, éditeur, année, image, alias pour le matching flou)
--
-- id en `text` (pas `uuid`) : le catalogue embarqué de l'app (voir
-- src/data/games.seed.ts) utilise des identifiants stables et lisibles
-- ("game-7-wonders") plutôt que des UUID générés, pour que le cache local
-- (IndexedDB) reste cohérent d'un lancement à l'autre. Cette table doit
-- utiliser exactement les mêmes id pour que la synchronisation ne crée pas
-- de doublons entre le catalogue local et celui partagé.
-- ----------------------------------------------------------------------------
create table games (
  id text primary key,
  name text not null,
  publisher text,
  year int,
  cover_url text,
  min_players int,
  max_players int,
  aliases text[] not null default '{}',
  description text,
  created_at timestamptz not null default now()
);
create index games_name_idx on games using gin (to_tsvector('french', name));

-- ----------------------------------------------------------------------------
-- GameRules — une ou plusieurs méthodes de calcul par jeu (variantes officielles)
-- ----------------------------------------------------------------------------
create table game_rules (
  id text primary key,
  game_id text not null references games (id) on delete cascade,
  version_label text not null default 'Édition de base',
  is_official boolean not null default false,
  tie_break_category_id text,
  -- La plupart des jeux se gagnent au score le plus haut. Quelques-uns
  -- (Skyjo, 6 qui prend…) se gagnent au score le plus bas : 'asc' inverse
  -- le sens du classement côté moteur sans changer le calcul des points.
  sort_direction text not null default 'desc' check (sort_direction in ('asc', 'desc')),
  created_at timestamptz not null default now()
);
create index game_rules_game_id_idx on game_rules (game_id);

-- ----------------------------------------------------------------------------
-- ScoreCategories — chaque ligne = une catégorie de score et sa formule
-- ----------------------------------------------------------------------------
create table score_categories (
  id text primary key,
  rule_id text not null references game_rules (id) on delete cascade,
  label text not null,
  formula_type text not null check (
    formula_type in ('sum', 'bonus', 'malus', 'multiplier', 'conditional', 'hidden_objective')
  ),
  config jsonb not null default '{}'::jsonb,
  "order" int not null default 0
);
create index score_categories_rule_id_idx on score_categories (rule_id);

alter table game_rules
  add constraint game_rules_tie_break_fk
  foreign key (tie_break_category_id) references score_categories (id) on delete set null;

-- ----------------------------------------------------------------------------
-- Matches / Players / Scores / Rankings — une partie jouée
-- (id en uuid ici : ce sont des parties générées par l'app via
-- crypto.randomUUID(), pas des entrées stables du catalogue.)
-- ----------------------------------------------------------------------------
create table matches (
  id uuid primary key default gen_random_uuid(),
  game_id text not null references games (id),
  rule_id text not null references game_rules (id),
  created_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  played_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed'))
);
create index matches_created_by_idx on matches (created_by);
create index matches_game_id_idx on matches (game_id);

create table players (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches (id) on delete cascade,
  name text not null,
  is_guest boolean not null default true,
  "order" int not null default 0
);
create index players_match_id_idx on players (match_id);

create table scores (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players (id) on delete cascade,
  category_id text not null references score_categories (id) on delete cascade,
  value numeric not null default 0,
  unique (player_id, category_id)
);
create index scores_player_id_idx on scores (player_id);

create table rankings (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches (id) on delete cascade,
  player_id uuid not null references players (id) on delete cascade,
  position int not null,
  total numeric not null,
  unique (match_id, player_id)
);
create index rankings_match_id_idx on rankings (match_id);

-- ----------------------------------------------------------------------------
-- GameBarcodes — correspondance code-barres -> jeu, construite par la
-- communauté au fil des scans (voir src/lib/barcode.ts). Un code-barres
-- inconnu ne bloque rien : l'app retombe sur l'OCR ou la recherche, puis
-- mémorise l'association dès que l'utilisateur confirme le jeu.
-- ----------------------------------------------------------------------------
create table game_barcodes (
  barcode text primary key,
  game_id text not null references games (id) on delete cascade,
  contributed_by uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- CommunityTemplates — propositions de nouveaux modèles de score
-- game_id reste nullable et n'est renseigné que si la proposition concerne
-- un jeu déjà présent dans `games` : les jeux créés localement pour rendre
-- un modèle immédiatement jouable (voir submitCommunityTemplate côté app)
-- n'existent pas ici tant qu'ils n'ont pas été validés.
-- ----------------------------------------------------------------------------
create table community_templates (
  id uuid primary key default gen_random_uuid(),
  game_id text references games (id) on delete set null,
  game_name_guess text not null,
  author_id uuid references profiles (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  proposed_categories jsonb not null default '[]'::jsonb,
  source_note text,
  votes int not null default 0,
  created_at timestamptz not null default now()
);
create index community_templates_status_idx on community_templates (status);

-- ============================================================================
-- Row Level Security
-- ============================================================================
-- Le catalogue (games / game_rules / score_categories) est un bien commun :
-- lecture publique pour tout le monde (y compris les visiteurs anonymes qui
-- utilisent l'app sans compte), écriture réservée au backend / à la
-- modération pour l'instant. La validation communautaire (approve d'un
-- community_template vers de vraies lignes games/game_rules) est un flux
-- côté serveur à ajouter avant l'ouverture publique des contributions.

alter table profiles enable row level security;
alter table games enable row level security;
alter table game_rules enable row level security;
alter table score_categories enable row level security;
alter table matches enable row level security;
alter table players enable row level security;
alter table scores enable row level security;
alter table rankings enable row level security;
alter table community_templates enable row level security;
alter table game_barcodes enable row level security;

-- `profiles` n'est pas droppée plus haut (liée à auth.users) : ses policies
-- doivent donc être supprimées explicitement pour que ce script reste
-- rejouable, contrairement aux autres tables où le `drop table cascade`
-- s'en charge déjà.
drop policy if exists "profiles: lecture de son propre profil" on profiles;
drop policy if exists "profiles: mise à jour de son propre profil" on profiles;
create policy "profiles: lecture de son propre profil" on profiles
  for select using (auth.uid() = id);
create policy "profiles: mise à jour de son propre profil" on profiles
  for update using (auth.uid() = id);

create policy "catalogue: lecture publique" on games for select using (true);
create policy "catalogue: lecture publique" on game_rules for select using (true);
create policy "catalogue: lecture publique" on score_categories for select using (true);

create policy "parties: gérées par leur créateur" on matches
  for all using (auth.uid() = created_by) with check (auth.uid() = created_by);

create policy "joueurs: gérés via la partie parente" on players
  for all using (
    exists (select 1 from matches m where m.id = match_id and m.created_by = auth.uid())
  ) with check (
    exists (select 1 from matches m where m.id = match_id and m.created_by = auth.uid())
  );

create policy "scores: gérés via la partie parente" on scores
  for all using (
    exists (
      select 1 from players p join matches m on m.id = p.match_id
      where p.id = player_id and m.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from players p join matches m on m.id = p.match_id
      where p.id = player_id and m.created_by = auth.uid()
    )
  );

create policy "classements: gérés via la partie parente" on rankings
  for all using (
    exists (select 1 from matches m where m.id = match_id and m.created_by = auth.uid())
  ) with check (
    exists (select 1 from matches m where m.id = match_id and m.created_by = auth.uid())
  );

-- L'app n'a pas (encore) d'écran de connexion : la contribution
-- communautaire (proposer un modèle, voter, associer un code-barres) reste
-- donc ouverte aux visiteurs anonymes, comme elle l'est déjà en local.
-- `auth.uid() = author_id` aurait bloqué même les utilisateurs connectés
-- tant que author_id n'est jamais renseigné côté app (NULL = NULL n'est
-- jamais vrai en SQL). À resserrer le jour où une authentification existe.
create policy "modèles communautaires: lecture publique" on community_templates
  for select using (true);
create policy "modèles communautaires: proposition ouverte" on community_templates
  for insert with check (true);
create policy "modèles communautaires: vote ouvert" on community_templates
  for update using (true) with check (status = 'pending');

create policy "codes-barres: lecture publique" on game_barcodes
  for select using (true);
create policy "codes-barres: contribution ouverte" on game_barcodes
  for insert with check (true);
