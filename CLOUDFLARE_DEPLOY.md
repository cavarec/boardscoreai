# Déploiement sur Cloudflare

BoardScore AI est une PWA statique : Cloudflare sert le dossier `dist/`
(Workers avec fichiers statiques). Aucune variable d'environnement n'est
nécessaire.

## Première mise en place (une seule fois)

1. Cloudflare → **Workers & Pages → Create → Import a repository**, choisir
   `cavarec/boardscoreai`, branche `main`.
2. Nom du projet : **`boardscore`** (identique au `name` de `wrangler.jsonc`,
   sinon le build échoue sur la vérification du nom du Worker).
3. Commande de build : `npm run build` — commande de déploiement :
   `npx wrangler deploy` — répertoire racine : laisser vide.
4. Lancer le premier build. Le domaine `boardscore.atao.dev` est rattaché
   automatiquement grâce à la route déclarée dans `wrangler.jsonc`.

## Mises à jour

Chaque `git push` sur `main` redéploie le site.

## Sans passer par GitHub

```bash
npm run build
npx wrangler deploy
```

## Vérifications après déploiement

- Ouvrir `https://boardscore.atao.dev` sur mobile, vérifier l'invite
  d'installation.
- Après un premier chargement complet, couper le réseau : l'app doit rester
  utilisable (elle est 100 % locale).
- Réglages → la version affichée doit correspondre au dernier commit.

## Changer d'adresse

L'adresse publique est définie à deux endroits : `src/lib/site.ts` et les
balises `og:` de `index.html`, plus la route de `wrangler.jsonc`. Sur iPhone,
une app installée est liée à son adresse : changer d'adresse oblige à
réinstaller l'app, et les parties enregistrées (IndexedDB) ne suivent pas.
