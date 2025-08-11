# Among Us Interface Prototype

A comprehensive HTML/CSS/JavaScript implementation of the Among Us game interface, built as a prototype that can later be ported to Unity or other game engines.

## Features

### 🎮 Complete Interface Implementation
- **Main Menu** - Navigation hub with all game options
- **Quick Matchmaking** - Automated game finding with filters
- **Custom Lobby** - Host and configure private games
- **Cosmetics Shop** - Character customization system
- **Settings** - Comprehensive game configuration
- **In-Game HUD** - Full gameplay interface
- **Missions System** - Daily and weekly challenges

### 🎨 Visual Design
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Theme** - Modern Among Us-inspired color scheme
- **Smooth Animations** - Polished transitions and effects
- **Accessibility** - Screen reader support and keyboard navigation
- **Touch Controls** - Virtual joystick and touch-optimized buttons

### ⚙️ Technical Features
- **Modular Architecture** - Separate modules for each major component
- **Local Storage** - Persistent settings and progress
- **Progressive Web App** - Can be installed as an app
- **Offline Support** - Works without internet connection
- **Multi-language** - Support for multiple languages

## File Structure

```
Among-US/
├── index.html              # Main HTML file
├── styles/
│   ├── main.css           # Core styles and variables
│   ├── components.css     # UI component styles
│   ├── menus.css         # Menu-specific styles
│   └── responsive.css    # Mobile and responsive styles
├── js/
│   ├── app.js            # Main application logic
│   ├── navigation.js     # Screen navigation and routing
│   ├── lobby.js          # Lobby and game settings
│   ├── matchmaking.js    # Quick matchmaking system
│   ├── cosmetics.js      # Character customization
│   ├── settings.js       # Game settings and preferences
│   └── hud.js           # In-game HUD and controls
└── README.md            # This file
```

## Getting Started

1. **Open the Interface**
   ```bash
   # Simply open index.html in a web browser
   # Or serve it with a local server for best experience
   python -m http.server 8000
   # Then visit http://localhost:8000
   ```

2. **Navigate the Interface**
   - Use the main menu to explore different sections
   - Try creating a custom lobby to see game settings
   - Check out the cosmetics shop and missions
   - Test the in-game HUD interface

3. **Mobile Testing**
   - Open on mobile device or use browser dev tools
   - Test touch controls and responsive layout
   - Virtual joystick works with touch or mouse

## Key Components

### Main Menu (`index.html`)
- Central navigation hub
- Server status and region selection
- Language and PWA installation options

### Matchmaking (`js/matchmaking.js`)
- Filter-based game finding
- Real-time search simulation
- Auto-join countdown system

### Lobby System (`js/lobby.js`)
- Host controls and player management
- Comprehensive game settings
- Real-time settings synchronization

### Cosmetics (`js/cosmetics.js`)
- Character customization options
- Virtual currency system
- Rarity-based item organization

### Settings (`js/settings.js`)
- Audio, video, and control options
- Accessibility features
- Import/export functionality

### In-Game HUD (`js/hud.js`)
- Role-specific interfaces
- Virtual controls for mobile
- Meeting and voting system

## Customization

### Adding New Cosmetics
```javascript
// In js/cosmetics.js, add to generateCosmeticData()
hats: [
    {
        id: 'new_hat',
        name: 'New Hat',
        emoji: '🎩',
        price: 100,
        rarity: 'rare'
    }
]
```

### Adding New Settings
```javascript
// In js/settings.js, add to renderTabContent()
<div class="setting-row">
    <div class="setting-info">
        <div class="setting-label">New Setting</div>
        <div class="setting-description">Description here</div>
    </div>
    <div class="setting-control">
        <input type="checkbox" data-setting="newSetting">
    </div>
</div>
```

### Modifying Colors
```css
/* In styles/main.css, update CSS variables */
:root {
    --primary-color: #your-color;
    --secondary-color: #your-color;
    /* etc... */
}
```

## Browser Support

- **Chrome/Edge** - Full support
- **Firefox** - Full support
- **Safari** - Full support (iOS 12+)
- **Mobile Browsers** - Optimized for touch

## Performance

- **Lightweight** - No external dependencies
- **Fast Loading** - Optimized assets and code
- **Smooth Animations** - Hardware-accelerated CSS
- **Memory Efficient** - Proper cleanup and management

## Future Enhancements

### Planned Features
- [ ] Real multiplayer integration
- [ ] Voice chat interface
- [ ] Advanced role systems
- [ ] Map editor interface
- [ ] Statistics and analytics
- [ ] Social features (friends, parties)

### Unity Port Considerations
- Modular design makes porting straightforward
- UI layouts can be recreated in Unity UI
- Game logic is separated from presentation
- Settings system can be adapted to Unity PlayerPrefs

## Contributing

This is a prototype interface. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple devices/browsers
5. Submit a pull request

## License

This project is for educational and demonstration purposes. Among Us is a trademark of InnerSloth LLC.

## Acknowledgments

- **InnerSloth** - Original Among Us game design
- **Web Technologies** - HTML5, CSS3, JavaScript ES6+
- **Design Inspiration** - Modern game UI/UX patterns

---

**Note**: This is a prototype interface only. It does not include actual game logic or multiplayer functionality. It's designed to demonstrate UI/UX concepts and serve as a foundation for a real implementation.