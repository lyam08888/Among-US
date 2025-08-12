# Guide de Personnalisation des Personnages - Among Us V3

## Vue d'ensemble

Le système de personnalisation des personnages permet aux joueurs de créer des avatars uniques avec une grande variété d'options de customisation. Le système utilise un générateur de sprites avancé basé sur le fichier TypeScript `sdk_dintegration_runtime_crewmate_generator_type_script.ts`.

## Fonctionnalités

### 1. Personnalisation Visuelle
- **Couleurs du corps** : 12 couleurs prédéfinies
- **Couleurs de visière** : 6 couleurs disponibles
- **Anatomie ajustable** : Taille, largeur, ventre, épaules, inclinaison
- **Visière personnalisable** : Largeur, hauteur, inclinaison
- **Accessoires** : Casquette, fleur, couronne, auréole, cornes, etc.
- **Décals** : Rayures, chevrons, étoiles, numéros, badges

### 2. Presets Prédéfinis
- **Classique** : Apparence standard d'Among Us
- **Mince** : Version élancée du personnage
- **Costaud** : Version plus robuste
- **Héroïque** : Style héroïque avec proportions ajustées

### 3. Sauvegarde et Chargement
- Sauvegarde automatique des modifications
- Persistance des données dans localStorage
- Chargement automatique au démarrage
- Export/Import des configurations

## Utilisation

### Accès à l'Interface
1. Cliquez sur le bouton "Cosmétiques" dans le menu principal
2. L'interface de personnalisation s'ouvre avec un aperçu en temps réel
3. Utilisez les onglets pour naviguer entre les différentes options

### Onglets Disponibles

#### Couleurs
- Sélectionnez la couleur du corps parmi 12 options
- Choisissez la couleur de la visière parmi 6 options
- Les changements sont appliqués instantanément

#### Anatomie
- **Taille** : Ajuste la hauteur générale (0.8 - 1.2)
- **Largeur** : Modifie la largeur du corps (0.8 - 1.2)
- **Ventre** : Contrôle la rondeur du ventre (0 - 0.5)
- **Épaules** : Ajuste la largeur des épaules (0 - 0.3)
- **Inclinaison** : Penche le personnage (-0.2 - 0.2)
- **Visière** : Largeur, hauteur et inclinaison de la visière

#### Accessoires
- Sélectionnez parmi plusieurs accessoires
- Chaque accessoire a son propre style visuel
- Option "Aucun" pour retirer l'accessoire

#### Presets
- Chargez rapidement des configurations prédéfinies
- Parfait pour commencer avec un style de base
- Peut être modifié après chargement

## Intégration Technique

### Fichiers Principaux
- `js/crewmate-generator.js` : Générateur de sprites
- `js/character-customizer.js` : Interface de personnalisation
- `styles/character-customizer.css` : Styles de l'interface
- `js/v3-graphics.js` : Rendu dans le jeu
- `js/v3-app.js` : Intégration avec l'application

### API de Personnalisation

#### CharacterCustomizer
```javascript
// Initialisation
const customizer = new CharacterCustomizer(app);

// Export des options actuelles
const options = customizer.exportCharacterOptions();

// Génération de sprite sheet
const spriteSheet = customizer.generateSpriteSheet();
```

#### CrewmateGenerator
```javascript
// Rendu d'une frame
CrewmateGenerator.renderFrameToCanvas(canvas, options, state);

// Construction d'un sprite sheet
const sheet = CrewmateGenerator.buildSpriteSheet(options, config);

// Presets disponibles
const classic = CrewmateGenerator.CrewmatePresets.Classic();
```

### Structure des Options
```javascript
const characterOptions = {
    body: '#c51111',           // Couleur du corps
    visor: '#8fd3ff',          // Couleur de la visière
    accessory: 'cap',          // Accessoire (ou null)
    anatomy: {
        heightMul: 1.0,        // Multiplicateur de hauteur
        widthMul: 1.0,         // Multiplicateur de largeur
        belly: 0.15,           // Rondeur du ventre
        shoulder: 0.10,        // Largeur des épaules
        tilt: -0.04            // Inclinaison
    },
    visorW: 0.24,             // Largeur de la visière
    visorH: 0.17,             // Hauteur de la visière
    visorTilt: -0.15,         // Inclinaison de la visière
    decals: {
        kind: 'none'          // Type de décal
    }
};
```

## Rendu dans le Jeu

Le système de rendu utilise automatiquement les personnalisations sauvegardées :

1. **Joueur local** : Utilise les options du customizer
2. **Autres joueurs** : Utilise leurs options personnalisées ou des defaults
3. **Animation** : Support complet des animations (marche, idle, etc.)
4. **Directions** : Rendu correct dans toutes les directions

## Performance

- **Optimisations** : Canvas temporaires pour le rendu
- **Cache** : Réutilisation des sprites générés
- **Responsive** : Interface adaptée mobile/desktop
- **Animations fluides** : 60fps pour l'aperçu

## Compatibilité

- **Navigateurs** : Chrome, Firefox, Safari, Edge
- **Appareils** : Desktop, tablettes, mobiles
- **Résolutions** : Interface responsive
- **Stockage** : localStorage pour la persistance

## Développement

### Ajout de Nouveaux Accessoires
1. Ajouter l'accessoire dans `CrewmateGenerator`
2. Mettre à jour la liste dans `character-customizer.js`
3. Ajouter les assets nécessaires

### Nouveaux Presets
1. Créer la fonction preset dans `CrewmatePresets`
2. Ajouter à l'interface de sélection
3. Tester avec différentes configurations

### Personnalisation Avancée
Le système est extensible pour ajouter :
- Nouvelles options d'anatomie
- Couleurs personnalisées
- Animations spéciales
- Effets visuels
- Synchronisation multijoueur

## Dépannage

### Problèmes Courants
- **Canvas vide** : Vérifier que CrewmateGenerator est chargé
- **Sauvegarde échoue** : Vérifier localStorage disponible
- **Performance lente** : Réduire la fréquence d'animation
- **Interface cassée** : Vérifier les CSS et responsive

### Debug
```javascript
// Vérifier l'état du customizer
console.log(window.characterCustomizer);

// Vérifier les options actuelles
console.log(window.characterCustomizer.currentOptions);

// Tester le générateur
console.log(window.CrewmateGenerator);
```

## Conclusion

Le système de personnalisation offre une expérience riche et intuitive pour créer des personnages uniques. L'intégration complète avec le moteur de jeu assure une expérience fluide et cohérente pour tous les joueurs.