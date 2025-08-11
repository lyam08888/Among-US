# Among Us V3 - Premium Edition 🚀

## 🎮 Description
Among Us V3 est une version premium et complète du célèbre jeu Among Us, développée avec des technologies web modernes. Cette version inclut des graphismes avancés, un système de physique, des animations fluides, et une expérience de jeu complète.

## ✨ Fonctionnalités

### 🎯 Système de Jeu Complet
- **Logique de jeu authentique** avec rôles Équipiers/Imposteurs
- **Système de tâches interactives** avec mini-jeux
- **Système de vote et réunions d'urgence**
- **Sabotages et mécaniques avancées**

### 🗺️ Cartes Multiples
- **The Skeld** - La carte classique
- **Mira HQ** - Station spatiale avancée
- **Polus** - Planète glacée

### 🎨 Graphismes Premium
- **Animations fluides** avec système d'easing avancé
- **Effets de particules** pour les actions importantes
- **Interface utilisateur moderne** avec glassmorphism
- **Avatars colorés** avec 12 couleurs disponibles

### 🔧 Systèmes Avancés
- **Moteur de physique** pour les mouvements réalistes
- **Système de réseau simulé** pour le multijoueur
- **Audio spatial** avec effets sonores
- **Système de chat** en temps réel

## 🚀 Installation et Lancement

### Prérequis
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Serveur HTTP local (Python, Node.js, ou autre)

### Lancement Rapide
1. **Cloner ou télécharger** le projet
2. **Ouvrir un terminal** dans le dossier du projet
3. **Lancer un serveur HTTP** :
   ```bash
   # Avec Python 3
   python -m http.server 8000
   
   # Avec Node.js (si http-server est installé)
   npx http-server -p 8000
   
   # Avec PHP
   php -S localhost:8000
   ```
4. **Ouvrir le navigateur** et aller à `http://localhost:8000/index-v3.html`

## 🎮 Comment Jouer

### Menu Principal
- **Partie Rapide** : Rejoindre une partie immédiatement
- **Créer une Partie** : Configurer une nouvelle partie
- **Rejoindre** : Entrer un code de partie
- **Mode Entraînement** : Apprendre les mécaniques

### Contrôles de Jeu
- **Déplacement** : Cliquer pour se déplacer
- **Utiliser** : Bouton "Use" ou touche `E`
- **Signaler** : Bouton "Report" ou touche `R`
- **Tuer** : Bouton "Kill" ou touche `Q` (Imposteurs uniquement)
- **Chat** : Touche `Entrée` pour ouvrir le chat
- **Liste des joueurs** : Touche `Tab`

### Tâches Disponibles
1. **Admin: Swipe Card** - Glisser la carte d'identité
2. **Electrical: Fix Wiring** - Connecter les fils colorés
3. **Medbay: Submit Scan** - Scanner médical (tâche visuelle)
4. **Weapons: Clear Asteroids** - Détruire les astéroïdes
5. **Shields: Prime Shields** - Activer les boucliers
6. **O2: Clean Filter** - Nettoyer le filtre à oxygène
7. **Navigation: Chart Course** - Définir la route
8. **Reactor: Start Reactor** - Démarrer le réacteur
9. **Storage: Fuel Engines** - Faire le plein des moteurs
10. **Cafeteria: Empty Garbage** - Vider les poubelles

## 🛠️ Architecture Technique

### Structure des Fichiers
```
Among-US/
├── index-v3.html          # Page principale du jeu
├── js/                    # Scripts JavaScript
│   ├── v3-app.js         # Application principale
│   ├── v3-engine.js      # Moteur de jeu
│   ├── v3-physics.js     # Système de physique
│   ├── v3-graphics.js    # Système graphique
│   ├── v3-audio.js       # Système audio
│   ├── v3-networking.js  # Système réseau
│   ├── v3-game-logic.js  # Logique de jeu
│   ├── v3-ui.js          # Interface utilisateur
│   ├── v3-animations.js  # Système d'animations
│   ├── v3-particles.js   # Système de particules
│   ├── v3-tasks.js       # Système de tâches
│   └── v3-maps.js        # Système de cartes
├── styles/               # Feuilles de style CSS
│   ├── v3-main.css      # Styles principaux
│   ├── v3-game.css      # Styles de jeu
│   ├── v3-ui.css        # Styles d'interface
│   ├── v3-animations.css # Animations CSS
│   └── v3-particles.css  # Effets de particules
└── assets/              # Ressources
    └── sounds/          # Fichiers audio
        ├── ambient.mp3
        ├── button-click.mp3
        ├── task-complete.mp3
        ├── emergency.mp3
        └── kill.mp3
```

### Systèmes Principaux

#### 🎮 Moteur de Jeu (v3-engine.js)
- Boucle de jeu à 60 FPS
- Gestion des événements
- Coordination des systèmes
- Métriques de performance

#### 🎨 Système Graphique (v3-graphics.js)
- Rendu Canvas 2D optimisé
- Gestion des sprites et textures
- Système de caméra
- Effets visuels

#### ⚡ Système de Physique (v3-physics.js)
- Détection de collisions
- Mouvement des entités
- Simulation physique réaliste

#### 🌐 Système Réseau (v3-networking.js)
- Simulation multijoueur
- Gestion des salles
- Synchronisation des états
- Messages en temps réel

#### 🎯 Logique de Jeu (v3-game-logic.js)
- Règles du jeu Among Us
- Gestion des rôles
- Système de vote
- Conditions de victoire

#### 🎨 Interface Utilisateur (v3-ui.js)
- Menus et écrans
- Chat en temps réel
- Notifications
- Interactions utilisateur

#### 🎬 Système d'Animations (v3-animations.js)
- Animations fluides
- Fonctions d'easing
- Animations de sprites
- Effets de transition

#### ✨ Système de Particules (v3-particles.js)
- Effets visuels avancés
- Particules pour les actions
- Optimisation des performances
- Rendu en temps réel

#### 📋 Système de Tâches (v3-tasks.js)
- Tâches interactives
- Mini-jeux
- Progression des tâches
- Interface de tâches

#### 🗺️ Système de Cartes (v3-maps.js)
- Cartes multiples
- Système de salles
- Évents et passages
- Minimap

## 🎨 Personnalisation

### Couleurs des Joueurs
Le jeu supporte 12 couleurs de joueurs :
- Rouge, Bleu, Vert, Rose
- Orange, Jaune, Noir, Blanc
- Violet, Marron, Cyan, Lime

### Paramètres de Jeu
- Nombre d'imposteurs (1-3)
- Vitesse des joueurs
- Vision des équipiers/imposteurs
- Nombre de tâches
- Temps de discussion/vote

## 🔧 Développement

### Ajouter de Nouvelles Tâches
1. Définir la tâche dans `v3-tasks.js`
2. Créer le mini-jeu correspondant
3. Ajouter les styles CSS nécessaires
4. Tester l'intégration

### Ajouter de Nouvelles Cartes
1. Définir la carte dans `v3-maps.js`
2. Créer les salles et couloirs
3. Placer les évents et points d'intérêt
4. Tester la navigation

### Personnaliser l'Interface
1. Modifier les styles dans `styles/v3-*.css`
2. Ajuster les couleurs et animations
3. Tester la responsivité

## 🐛 Dépannage

### Problèmes Courants
- **Écran noir** : Vérifier que le serveur HTTP fonctionne
- **Erreurs 404** : S'assurer que tous les fichiers sont présents
- **Pas de son** : Vérifier que les fichiers audio sont accessibles
- **Performance lente** : Réduire les effets de particules

### Console de Développement
Ouvrir les outils de développement (F12) pour voir les logs détaillés du jeu.

## 📝 Licence
Ce projet est développé à des fins éducatives et de démonstration. Among Us est une marque déposée d'InnerSloth.

## 🤝 Contribution
Les contributions sont les bienvenues ! N'hésitez pas à :
- Signaler des bugs
- Proposer de nouvelles fonctionnalités
- Améliorer la documentation
- Optimiser les performances

---

**Amusez-vous bien dans Among Us V3 ! 🚀👨‍🚀**