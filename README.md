# BoardScore AI

Scannez la boîte, jouez, on s'occupe des points.

PWA mobile-first qui reconnaît un jeu de société (scan de boîte, de fiche de
score, ou recherche/assistant) et calcule automatiquement le classement grâce
à un moteur de score entièrement piloté par des données — aucun jeu ne
nécessite d'écrire du code.

Voir le [dossier de conception](.) pour l'analyse produit complète (marché,
concurrents, architecture, schéma de base de données, wireframes, roadmap).

## Stack

| Couche       | Choix                                                        |
| ------------ | ------------------------------------------------------------- |
| Frontend     | React 18 + TypeScript + Tailwind CSS, PWA (Vite)              |
| Stockage local | IndexedDB via Dexie — source de vérité pour jouer hors-ligne |
| Backend      | Supabase (Postgres, Auth, Storage, Realtime) — optionnel      |
| OCR          | Tesseract.js, 100% côté client (Web Worker)                   |
| Matching     | Fuse.js (recherche floue) pour scan, recherche et assistant   |
| Assistant    | Simulé (règles + Fuse.js) — voir `src/lib/assistant.ts`       |

## Démarrage

```bash
npm install
npm run dev
```

L'app tourne en local à `http://localhost:5173`, entièrement fonctionnelle
**sans aucune configuration** : le catalogue de 43 jeux embarqué (voir
`src/data/games.seed.ts`) se charge dans IndexedDB au premier lancement.

```bash
npm run build      # build de production dans dist/
npm run preview    # sert le build de production en local
npm run lint       # vérification TypeScript (tsc --noEmit)
npm run generate-icons  # régénère les icônes PWA (public/icons/)
```

## Connecter Supabase (optionnel)

Sans configuration, BoardScore AI fonctionne intégralement en local. Pour
activer la synchronisation cloud, l'authentification et la base
communautaire partagée :

1. Créez un projet sur [supabase.com](https://supabase.com).
2. Exécutez `supabase/schema.sql` dans l'éditeur SQL du projet.
3. Copiez `.env.example` vers `.env.local` et renseignez :
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxxxx
   ```
4. Redémarrez `npm run dev`.

Le code vérifie systématiquement `isSupabaseConfigured` (voir
`src/lib/supabase.ts`) avant tout appel réseau : rien ne casse si ces
variables sont absentes.

## Structure du projet

```
src/
  types/            Types miroir du schéma Supabase
  lib/
    scoreEngine.ts  Moteur de score générique (sum/bonus/malus/multiplier/conditional/hidden_objective)
    db.ts           Cache local IndexedDB (Dexie) — source de vérité pour jouer
    supabase.ts     Client Supabase optionnel
    sync.ts         Synchronisation opportuniste local ↔ Supabase
    matcher.ts       Correspondance floue (Fuse.js) : scan, recherche, assistant
    ocr.ts          Reconnaissance de texte (Tesseract.js)
    assistant.ts    Assistant conversationnel simulé
  data/
    games.seed.ts   Catalogue embarqué (43 jeux avec modèle de score réaliste)
  hooks/            useGames, useTheme (ThemeProvider)
  components/       UI (Button, Card, Stepper) + layout (AppShell, TopBar, BottomNav)
  pages/            Un composant par écran (voir le dossier de conception, §07)
supabase/
  schema.sql        DDL complet + RLS, prêt pour `supabase db push`
scripts/
  generate-icons.mjs  Génère les icônes PWA en PNG pur (sans dépendance native)
```

## Le moteur de score, en bref

Chaque jeu = une `Game` + un `GameRuleSet` + une liste de `ScoreCategory`.
Chaque catégorie porte un `formulaType` :

- `sum` — addition simple (avec `perUnit` optionnel)
- `bonus` / `malus` — comme `sum`, signalés différemment à l'écran
- `multiplier` — valeur saisie × `factor` (ex. 2 pts par ville)
- `conditional` — seuil ou oui/non → `pointsIfMet` / `pointsIfNot`
- `hidden_objective` — comme `conditional`, affiché comme objectif secret

Ajouter un jeu — ou une variante communautaire — ne touche jamais
`scoreEngine.ts` : tout passe par la configuration en base
(`src/data/games.seed.ts` en local, table `score_categories` sur Supabase).

## Limites connues de cette première génération

- **OCR** : Tesseract.js télécharge ses données de langue depuis un CDN au
  premier scan ; une connexion est donc nécessaire une fois, puis le service
  worker met le moteur en cache pour les scans suivants hors-ligne.
- **Reconnaissance visuelle de boîte** et **assistant conversationnel** sont
  simulés (choix de scaffolding validé) : la reconnaissance de texte est
  réelle, mais il n'y a pas d'appel à un modèle de vision/langage externe.
  L'architecture (`src/lib/assistant.ts`) isole cette logique dans une
  fonction pure pour permettre un remplacement par un vrai LLM sans changer
  l'UI du chat.
- **Icônes PWA** : générées par script pur (voir `scripts/generate-icons.mjs`),
  à remplacer par une identité visuelle définitive avant un lancement public.
- **Modération communautaire** : les propositions de modèles sont stockées
  avec un statut `pending` ; le flux d'approbation (`pending` → `approved`)
  vers de vraies lignes `games`/`game_rules` est un développement serveur à
  ajouter avant l'ouverture publique des contributions.

Voir la Roadmap MVP du dossier de conception (§09) pour la suite.
