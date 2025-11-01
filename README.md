# Ecology Survival Game - Pure HTML/JS/CSS Version

This is a complete pure HTML/JavaScript/CSS version of your ecology survival game, with no React dependencies!

## Files Included

### Main Menu Files
1. **index.html** - The main menu where players select their organism
2. **styles.css** - Styling for the main menu
3. **script.js** - JavaScript for the main menu (updated with "Play" button)

### Game Files
4. **game.html** - The actual gameplay page
5. **game-styles.css** - Styling for the game page
6. **game-script.js** - Game logic and mechanics

## How It Works

### Main Menu (index.html)
- Displays cards for all 10 organisms (4 producers, 5 consumers, 1 decomposer)
- Filter by role (Producer/Consumer/Decomposer) or search by name
- Each card has two buttons:
  - **Play** - Starts the game for that organism
  - **Details** - Shows detailed info about the organism

### Game Page (game.html)
The game is a rhythm-based survival game where you:

1. **Collect Resources**: Press SPACEBAR when the moving bar is in the green zone
2. **Manage Energy**: Your energy depletes over time
3. **Balance Resources**: 
   - Producers need Sunlight ☀️ and Water 💧
   - Consumers hunt for Food 🍖 and Water 💧
   - Decomposers need Organic Matter 🍄 and Moisture 💧
4. **Survive**: Keep your energy above 0% as long as possible!

### Difficulty Levels
- **EASY** (Producers): Slower speed, larger hit zone
- **MEDIUM** (Consumers): Normal speed, medium hit zone  
- **HARD** (Decomposers): Faster speed, smaller hit zone

### Game Mechanics
- **Hit Zone (Green)**: Press SPACE here to collect resources successfully
- **Success**: Gain resources, energy, and score points
- **Miss**: Lose energy
- **Energy Drain**: Energy depletes over time, faster if resources are low
- **Game Over**: When energy reaches 0%

## How to Use

### Option 1: Direct File Access
1. Open `index.html` in any modern web browser
2. Select an organism and click "Play"
3. Play the survival game!

### Option 2: Local Server (Recommended)
If you have image files in an `organisms/` folder:

```bash
# Using Python
python -m http.server 8000

# Or using Node.js
npx serve
```

Then visit: `http://localhost:8000`

## URL Parameters

You can link directly to a specific organism's game:
- `game.html?organism=strawberry`
- `game.html?organism=wolf`
- `game.html?organism=yeast`

Available organism IDs:
- `strawberry`, `potato`, `pumpkin-seeds`, `corn` (Producers)
- `goat`, `duck`, `chicken`, `wolf`, `bee` (Consumers)
- `yeast` (Decomposer)

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Features

✨ **No React** - Pure vanilla JavaScript
✨ **No Build Step** - Works directly in browser
✨ **Responsive** - Works on desktop and mobile
✨ **Dark Theme** - Beautiful dark mode design
✨ **Smooth Animations** - CSS transitions and animations
✨ **Keyboard Controls** - SPACEBAR to play
✨ **Dynamic Difficulty** - Based on organism role
✨ **Score System** - Track your performance
✨ **Survival Timer** - See how long you last

## Customization

### Change Game Speed
Edit `game-script.js`:
```javascript
gameState.sliderSpeed = 0.8; // Increase for faster
```

### Change Hit Zone Size
Edit `game-script.js`:
```javascript
gameState.hitZoneWidth = 10; // Percentage width
```

### Add New Organisms
Edit the `organisms` array in both `script.js` and `game-script.js`

### Change Colors
Edit CSS variables in `styles.css` or `game-styles.css`:
```css
:root {
  --accent: #22c55e; /* Change colors */
}
```

## Notes

- The game uses `requestAnimationFrame` for smooth animations
- Energy and resources are managed as percentages (0-100)
- Score increases based on difficulty and timing accuracy
- The game automatically adjusts difficulty based on the organism's role

## Have Fun!

Try to survive as long as possible and beat your high score! 🎮🌱

---

Created by: Jonathan & Tyler
