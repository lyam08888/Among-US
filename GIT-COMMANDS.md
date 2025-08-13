# Commandes Git pour Déployer Among Us V4

## 🚀 Déploiement Rapide

```bash
# 1. Ajouter tous les fichiers
git add .

# 2. Commit avec message descriptif
git commit -m "🚀 Among Us V4 - Interface Mobile Moderne 2025

✨ Nouvelles fonctionnalités:
- Interface glassmorphism avec effets néon
- Système de mapping avancé avec assets complets
- Personnages animés avec spritesheets
- Audio spatial 3D immersif
- Optimisations mobile intelligentes
- Contrôles tactiles fluides

🗑️ Nettoyage:
- Suppression des anciens fichiers V1-V3
- Structure de projet optimisée
- .gitignore mis à jour"

# 3. Push vers GitHub
git push origin main
```

## 📁 Structure Finale du Projet

```
Among-US/
├── index.html (V4)              # 🎯 Page principale moderne
├── README.md (V4)               # 📖 Documentation complète
├── .gitignore                   # 🚫 Fichiers ignorés
├── styles/
│   ├── v4-mobile-interface.css  # 🎨 Interface 2025
│   └── v3-*.css                 # 🔧 Styles V3 conservés
├── js/
│   ├── v4-app.js               # 🚀 Application principale V4
│   ├── v4-advanced-*.js        # 🔧 Systèmes avancés V4
│   └── v3-*.js                 # 🔧 Moteur V3 réutilisé
├── assets/
│   ├── characters/             # 👥 Spritesheets personnages
│   ├── decor/                  # 🏗️ Textures décoration
│   └── sounds/                 # 🔊 Fichiers audio
└── backup-old-versions/        # 💾 Sauvegarde (ignoré par Git)
```

## 🌐 Après le Push

Une fois pushé sur GitHub, votre jeu sera accessible via :
- **GitHub Pages** : `https://votre-username.github.io/Among-US/`
- **Lien direct** : `https://votre-username.github.io/Among-US/index.html`

## 🔧 Commandes Utiles

```bash
# Vérifier le statut
git status

# Voir les différences
git diff

# Historique des commits
git log --oneline

# Annuler le dernier commit (si erreur)
git reset --soft HEAD~1

# Forcer le push (si nécessaire)
git push --force origin main
```

## 📱 Test Mobile

Pour tester sur mobile après déploiement :
1. Ouvrir l'URL GitHub Pages sur mobile
2. Autoriser l'audio quand demandé
3. Profiter de l'interface moderne !

---

**Ready to deploy! 🚀**