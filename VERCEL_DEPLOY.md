# Déploiement sur Vercel

BoardScore AI est une PWA statique (Vite build) : aucun serveur applicatif à
gérer, aucune variable d'environnement à configurer. Vercel se charge
uniquement de servir `dist/` et d'appliquer les bons en-têtes pour le service
worker.

## 1. Préparer le dépôt

```bash
git init
git add .
git commit -m "BoardScore AI"
git remote add origin <url-de-votre-dépôt>
git push -u origin main
```

## 2. Créer le projet Vercel

1. [vercel.com/new](https://vercel.com/new) → importez le dépôt Git.
2. Vercel détecte Vite automatiquement. Vérifiez :
   - **Build command** : `npm run build`
   - **Output directory** : `dist`
   - **Install command** : `npm install`
3. Cliquez sur **Deploy**.

## 3. En-têtes pour le service worker

`vite-plugin-pwa` génère `dist/sw.js` avec un hash de contenu à chaque build ;
Vercel sert les fichiers statiques sans cache agressif par défaut, ce qui
convient. Si vous ajoutez un `vercel.json` pour d'autres réglages (redirects,
headers de sécurité), veillez à ne pas mettre `sw.js` et
`manifest.webmanifest` en cache long (`Cache-Control: no-cache` recommandé
pour `sw.js` spécifiquement) :

```json
{
  "headers": [
    {
      "source": "/sw.js",
      "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
    }
  ]
}
```

## 4. Domaine personnalisé (optionnel)

**Project Settings → Domains** → ajoutez votre domaine, suivez les
instructions DNS de Vercel. Pensez à mettre à jour `start_url` / `scope`
dans `vite.config.ts` (plugin PWA) si l'app n'est pas servie à la racine du
domaine.

## 5. Après déploiement — vérifications

- Ouvrez l'URL sur mobile, vérifiez l'invite d'installation PWA.
- Coupez le réseau (mode avion) après un premier chargement complet, vérifiez
  que l'app reste utilisable (catalogue, saisie de score, historique) — elle
  est 100% locale, donc tout doit fonctionner hors-ligne dès le premier
  chargement.

## Mises à jour ultérieures

Chaque `git push` sur la branche connectée déclenche un nouveau déploiement
Vercel (build de production automatique). Les Preview Deployments (une URL
par pull request) sont activés par défaut.
