# Déploiement sur Vercel

BoardScore AI est une PWA statique (Vite build) : aucun serveur applicatif à
gérer, Vercel se charge uniquement de servir `dist/` et d'appliquer les bons
en-têtes pour le service worker.

## 1. Préparer le dépôt

```bash
git init
git add .
git commit -m "BoardScore AI — première génération"
git remote add origin <url-de-votre-dépôt>
git push -u origin main
```

## 2. Créer le projet Vercel

1. [vercel.com/new](https://vercel.com/new) → importez le dépôt Git.
2. Vercel détecte Vite automatiquement. Vérifiez :
   - **Build command** : `npm run build`
   - **Output directory** : `dist`
   - **Install command** : `npm install`
3. Ne cliquez pas encore sur *Deploy* si vous voulez connecter Supabase
   (étape suivante) — sinon vous pourrez toujours ajouter les variables et
   redéployer ensuite.

## 3. Variables d'environnement (optionnel — Supabase)

Dans **Project Settings → Environment Variables**, ajoutez pour les
environnements *Production*, *Preview* et *Development* :

| Nom                       | Valeur                                  |
| ------------------------- | ---------------------------------------- |
| `VITE_SUPABASE_URL`       | URL de votre projet Supabase             |
| `VITE_SUPABASE_ANON_KEY`  | Clé anonyme (publique) de votre projet   |

Sans ces variables, l'app se déploie et fonctionne quand même intégralement
en mode local (voir README, section Supabase).

## 4. En-têtes pour le service worker

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

## 5. Déployer

Cliquez sur **Deploy**. Vercel construit et publie l'app sur une URL
`*.vercel.app`. Le manifeste PWA (`display: standalone`) permet
l'installation sur mobile ("Ajouter à l'écran d'accueil") dès ce déploiement.

## 6. Domaine personnalisé (optionnel)

**Project Settings → Domains** → ajoutez votre domaine, suivez les
instructions DNS de Vercel. Pensez à mettre à jour `start_url` / `scope`
dans `vite.config.ts` (plugin PWA) si l'app n'est pas servie à la racine du
domaine.

## 7. Après déploiement — vérifications

- Ouvrez l'URL sur mobile, vérifiez l'invite d'installation PWA.
- Testez un scan (nécessite une connexion la première fois, pour le
  téléchargement des données de langue Tesseract.js).
- Coupez le réseau (mode avion) après un premier chargement complet, vérifiez
  que l'app reste utilisable (catalogue, saisie de score, historique).
- Si Supabase est connecté : créez un compte de test, vérifiez qu'une partie
  terminée apparaît bien dans la table `matches` du projet Supabase.

## Mises à jour ultérieures

Chaque `git push` sur la branche connectée déclenche un nouveau déploiement
Vercel (build de production automatique). Les Preview Deployments (une URL
par pull request) sont activés par défaut — utile pour valider un nouveau
jeu ou modèle communautaire avant de le fusionner dans `main`.
