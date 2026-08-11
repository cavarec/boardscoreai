# BoardScore AI

Trouvez votre jeu, jouez, on s'occupe des points.

PWA mobile-first 100% locale qui calcule automatiquement le classement de vos
parties de jeux de société, grâce à un moteur de score entièrement piloté par
des données — aucun jeu ne nécessite d'écrire du code.

## Stack

| Couche         | Choix                                                          |
| -------------- | --------------------------------------------------------------- |
| Frontend       | React 18 + TypeScript + Tailwind CSS, PWA (Vite)                |
| Stockage       | IndexedDB via Dexie — seule source de vérité, aucune donnée ne quitte l'appareil |
| Matching       | Fuse.js (recherche floue) pour la recherche de jeu              |

## Démarrage

```bash
npm install
npm run dev
```

L'app tourne en local à `http://localhost:5173`, entièrement fonctionnelle
**sans aucune configuration** : le catalogue de jeux embarqué (voir
`src/data/games.seed.ts`) se charge dans IndexedDB au premier lancement.

```bash
npm run build      # build de production dans dist/
npm run preview    # sert le build de production en local
npm run lint       # vérification TypeScript (tsc --noEmit)
npm run generate-icons  # régénère les icônes PWA (public/icons/)
```

## Structure du projet

```
src/
  types/            Types du modèle de données local
  lib/
    scoreEngine.ts  Moteur de score générique (sum/bonus/malus/multiplier/conditional/hidden_objective)
    db.ts           Stockage local IndexedDB (Dexie) — source de vérité
    matcher.ts      Correspondance floue (Fuse.js) pour la recherche de jeu
  data/
    games.seed.ts   Catalogue embarqué (jeux avec modèle de score réaliste)
  hooks/            useGames, useTheme (ThemeProvider)
  components/       UI (Button, Card, Stepper) + layout (AppShell, TopBar, BottomNav)
  pages/            Un composant par écran
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

Ajouter un jeu ne touche jamais `scoreEngine.ts` : tout passe par la
configuration en base (`src/data/games.seed.ts`).

## Jeu rapide

Pour tout jeu absent du catalogue, "Jeu rapide" permet de suivre un score
cumulatif librement : nom de partie optionnel, tirage au sort du joueur qui
commence, score de départ (handicap) par joueur, et choix du sens de
classement (le plus ou le moins de points gagne).

## Historique

Des fonctionnalités explorées puis abandonnées pendant le développement
(scan OCR/code-barres, authentification et synchronisation cloud, assistant
conversationnel, catalogue communautaire) ont été retirées : elles
n'apportaient pas une fiabilité suffisante pour l'usage réel (limites
structurelles d'iOS pour la synchro PWA, précision insuffisante de l'OCR
côté client). L'app est aujourd'hui volontairement 100% locale et simple.
